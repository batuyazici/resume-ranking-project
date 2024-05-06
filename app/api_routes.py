from fastapi import FastAPI, UploadFile, Form, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from db import execute_query, fetch_query, fetch_single_query 
from utils import clean_filename
from file_processing import docx_conv, pdf_conv
from config import UPLOAD_DIR, SAVE_DIR

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def init_upload_batch():
	# Insert into batch_process table
    batch_query = "INSERT INTO batch_process DEFAULT VALUES RETURNING batch_id;"
    batch_id = await fetch_query(batch_query)
    batch_id = batch_id[0]['batch_id']
	
    # Insert into detection_results table
    detection_query = f"INSERT INTO detection_results (batch_id, status) VALUES ({batch_id}, 'pending') RETURNING detect_id;"
    detect_id = await fetch_query(detection_query)
    detect_id = detect_id[0]['detect_id']
    
    # Insert into ocr_results table
    ocr_query = f"INSERT INTO ocr_results (batch_id, ocr_path, status) VALUES ({batch_id}, NULL, 'pending') RETURNING ocr_id;"
    ocr_id = await fetch_query(ocr_query)
    ocr_id = ocr_id[0]['ocr_id']
    
    # Insert into classification_results table
    classification_query = f"INSERT INTO classification_results (batch_id, clasf_path, status) VALUES ({batch_id}, NULL, 'pending') RETURNING class_id;"
    class_id = await fetch_query(classification_query)
    class_id = class_id[0]['class_id']
    
    # Insert into ner_results table
    ner_query = f"INSERT INTO ner_results (batch_id, ner_path, status) VALUES ({batch_id}, NULL, 'pending') RETURNING ner_id;"
    ner_id = await fetch_query(ner_query)
    ner_id = ner_id[0]['ner_id']
    
    # Insert into batch_status table with retrieved IDs
    batch_status_query = f"INSERT INTO batch_status (batch_id, detect_id, ocr_id, class_id, ner_id) VALUES ({batch_id}, {detect_id}, {ocr_id}, {class_id}, {ner_id});"
    await execute_query(batch_status_query)

    return batch_id

async def check_batch_exists(batch_id):
    if not batch_id:
        return False
    query = "SELECT batch_id FROM batch_process WHERE batch_id = $1;"
    result = await fetch_query(query, batch_id)
    return bool(result)

@app.post("/uploadfiles/")
async def create_upload_files(
    background_tasks: BackgroundTasks,
    file_uploads: List[UploadFile] = File(...), 
    batch_id: Optional[int] = Form(None)
):
    if not await check_batch_exists(batch_id):
        batch_id = await init_upload_batch()

    for file_upload in file_uploads:
        cleaned_name = clean_filename(file_upload.filename)
        file_path = UPLOAD_DIR / cleaned_name
        
        c_name, file_ext = cleaned_name.rsplit('.', 1)

        with open(file_path, "wb") as file_object:
            file_object.write(await file_upload.read())
        file_id = await fetch_single_query("""
            INSERT INTO uploaded_files (original_name, storage_name, file_path, batch_id, file_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING file_id;
            """, file_upload.filename, c_name, str(file_path), batch_id, file_ext)
        if file_ext == "docx":
            pdf_path = file_path.with_suffix('.pdf')
            background_tasks.add_task(docx_conv, file_id, str(file_path), str(pdf_path), batch_id, str(SAVE_DIR), background_tasks)
        elif file_ext == "pdf":
            background_tasks.add_task(pdf_conv, file_id, str(file_path), str(SAVE_DIR) ,batch_id)

    return {"message": "Files are being processed", "batch_id": batch_id}

from fastapi import HTTPException, Query

@app.get("/status/")
async def get_conversion_status(batch_id: Optional[int] = Query(None)):
    """
    Endpoint to fetch the status of file conversions along with the batch start date. 
    If a batch_id is provided, it returns the status for that specific batch. Otherwise, 
    it returns the status for all batches.
    """
    try:
        if batch_id:
            query = """
            SELECT b.start_date, c.file_id, c.process_type, c.status, c.number_of_pages, c.original_name
            FROM conversion_status c
            JOIN batch_process b ON c.batch_id = b.batch_id
            WHERE c.batch_id = $1;
            """
            results = await fetch_query(query, batch_id)
        else:
            query = """
            SELECT b.batch_id, b.start_date, c.file_id, c.process_type, c.status, c.number_of_pages, c.original_name
            FROM conversion_status c
            JOIN batch_process b ON c.batch_id = b.batch_id
            ORDER BY b.batch_id;
            """
            results = await fetch_query(query)

        if not results:
            detail = f"No conversion status found{' for batch ID ' + str(batch_id) if batch_id else ''}."
            raise HTTPException(status_code=404, detail=detail)

        if batch_id:
            # Include the start_date in the response for the specific batch
            return {"batch_id": batch_id, "start_date": results[0]['start_date'], "files": results}
        else:
            # Reformat results to group them by batch_id if all batches are queried
            batch_dict = {}
            for result in results:
                batch_id = result['batch_id']
                if batch_id not in batch_dict:
                    batch_dict[batch_id] = {
                        "start_date": result['start_date'],
                        "files": []
                    }
                batch_dict[batch_id]['files'].append(result)
            return batch_dict

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

