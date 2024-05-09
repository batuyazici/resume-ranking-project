from fastapi import FastAPI, UploadFile, Form, File, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Optional
import os
import shutil  
import glob
import json  
from db import execute_query, fetch_query, fetch_single_query 
from helpers import clean_filename, init_upload_batch, check_batch_exists, conf_input_file
from file_processing import docx_conv, pdf_conv
from config import UPLOAD_DIR, SAVE_DIR, SAVE_DIR_API
from model_pipeline.utils.files import FileHandler
from model_pipeline.utils.params import YOLOParameters


import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


file_handler = FileHandler()
parameters = YOLOParameters(file_handler.results_dir)

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



@app.get("/status/")
async def get_conversion_status(batch_id: Optional[int] = Query(None)):
    try:
        if batch_id:
            # Fetch basic data
            basic_query = """
            SELECT bp.start_date, uf.file_id, cs.process_type, cs.status, cs.number_of_pages, cs.save_path, uf.original_name
            FROM batch_process bp
            JOIN uploaded_files uf ON bp.batch_id = uf.batch_id
            JOIN conversion_status cs ON bp.batch_id = cs.batch_id
            WHERE bp.batch_id = $1;
            """
            basic_results = await fetch_query(basic_query, batch_id)

            # Fetch statuses from various results tables
            status_queries = {
                'detection_status': "SELECT status FROM detection_results WHERE batch_id = $1;",
                'ocr_status': "SELECT status FROM ocr_results WHERE batch_id = $1;",
                'classification_status': "SELECT status FROM classification_results WHERE batch_id = $1;",
                'ner_status': "SELECT status FROM ner_results WHERE batch_id = $1;"
            }
            statuses = {}
            for key, query in status_queries.items():
                result = await fetch_query(query, batch_id)
                statuses[key] = result[0]['status'] if result else 'No data'

            # Combine results
            if not basic_results:
                raise HTTPException(status_code=404, detail="No conversion status found for batch ID {}.".format(batch_id))
            
            full_results = basic_results[0]
            full_results.update(statuses)
            return full_results
        else:
            all_data_query = """
            SELECT DISTINCT ON (uf.file_id) bp.batch_id, bp.start_date, cs.file_id, 
            cs.process_type, cs.status AS conversion_status, cs.number_of_pages, 
            cs.save_path, uf.original_name
            FROM batch_process bp
            JOIN uploaded_files uf ON bp.batch_id = uf.batch_id
            JOIN conversion_status cs ON bp.batch_id = cs.batch_id
            ORDER BY uf.file_id, bp.batch_id;
            """
            results = await fetch_query(all_data_query)

            if not results:
                raise HTTPException(status_code=404, detail="No conversion statuses found.")

            # Fetch statuses for all batches for each process
            status_queries = {
                'detection_status': "SELECT batch_id, status FROM detection_results;",
                'ocr_status': "SELECT batch_id, status FROM ocr_results;",
                'classification_status': "SELECT batch_id, status FROM classification_results;",
                'ner_status': "SELECT batch_id, status FROM ner_results;"
            }
            all_statuses = {key: {} for key in status_queries}

            for key, query in status_queries.items():
                status_results = await fetch_query(query)
                for status in status_results:
                    all_statuses[key][status['batch_id']] = status['status']

            # Organize by batch_id
            batch_dict = {}
            for result in results:
                batch_id = result['batch_id']
                if batch_id not in batch_dict:
                    batch_dict[batch_id] = {
                        "start_date": result['start_date'],
                        "files": [],
                        "detection_status": all_statuses['detection_status'].get(batch_id, 'No data'),
                        "ocr_status": all_statuses['ocr_status'].get(batch_id, 'No data'),
                        "classification_status": all_statuses['classification_status'].get(batch_id, 'No data'),
                        "ner_status": all_statuses['ner_status'].get(batch_id, 'No data')
                    }
                batch_dict[batch_id]['files'].append(result)

            return batch_dict

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/detect/")
async def detect_run(batch_ids: dict):
    from model_pipeline.objdet import detect_impl
    try:
        
        batch_ids = batch_ids.get("batch_ids", [])
        batch_ids = [int(id_str) for id_str in batch_ids]

        input_path = await conf_input_file()
        query = """
            SELECT file_id, storage_name, batch_id FROM uploaded_files
            WHERE batch_id = ANY($1);
        """
        files = await fetch_query(query, batch_ids)
        if not files:
            raise HTTPException(status_code=404, detail="No files found for the provided batch IDs.")

        parameters.set_source_dir(input_path)
        

        for file in files:
            file_pattern = os.path.join(SAVE_DIR_API, f"{file['storage_name']}_page*.jpg")
            file_paths = glob.glob(file_pattern)

            if not file_paths:
                continue 

            for file_path in file_paths:
                new_path = os.path.join(input_path, os.path.basename(file_path))
                shutil.copy(file_path, new_path)
        
        crops_dir = await detect_impl(parameters)
        file_handler.set_crops_dir(crops_dir)
     
        results = {}
        for file in files:
            file_id = file['file_id']
            storage_name = file['storage_name']
            specific_result_folder = os.path.join(file_handler.results_dir, storage_name)
            file_pattern = os.path.join(specific_result_folder, f"{storage_name}_page*.jpg")
            file_paths = glob.glob(file_pattern)

            if not file_paths:
                continue

            results[file_id] = [os.path.abspath(fp) for fp in file_paths]
            
        update_query = """
        UPDATE detection_results SET status = 'completed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_query, batch_ids)
        
        return results
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))
            
@app.get("/files/{storage_name}/{file_name}")
async def serve_file(storage_name: str, file_name: str):
    file_path = os.path.join(file_handler.results_dir, storage_name, file_name)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        raise HTTPException(status_code=404, detail="File not found.")
 
@app.post("/ocr/")
async def ocr_run(batch_ids: dict):
    from model_pipeline.ocr import ocr_impl
    try:
        batch_ids = batch_ids.get("batch_ids", [])
        batch_ids = [int(id_str) for id_str in batch_ids]

        query = """
            SELECT file_id, storage_name, batch_id FROM uploaded_files
            WHERE batch_id = ANY($1);
        """
        files = await fetch_query(query, batch_ids)
        if not files:
            raise HTTPException(status_code=404, detail="No files found for the provided batch IDs.")

        await ocr_impl(file_handler)

        results = {}
        for file in files:
            file_id = file['file_id']
            storage_name = file['storage_name']
            specific_result_folder = os.path.join(file_handler.results_dir, storage_name)
            file_path = os.path.join(specific_result_folder, f"{storage_name}_ocr.json")
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    results[file_id] = json.load(f)

        update_query = """
        UPDATE ocr_results SET status = 'completed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_query, batch_ids)
        
        return JSONResponse(content={"results": results, "message": "OCR process completed."})

    except Exception as e:
        update_fail_query = """
        UPDATE ocr_results SET status = 'failed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_fail_query, batch_ids)
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
app.post("/classify/")
async def classify_run(batch_ids: dict):
    from model_pipeline.clsf import classify_impl
    try:
        classify_impl(parameters.lang, file_handler)
            
        update_query = """
        UPDATE classification_results SET status = 'completed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_query, batch_ids)
        await ner_run(batch_ids)
        return {"message": "Classification and NER process are completed."}
    
    except Exception as e:
        update_fail_query = """
        UPDATE classification_results SET status = 'failed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_fail_query, batch_ids)
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))    
    
@app.post("/ner/")
async def ner_run(batch_ids: dict):
    from model_pipeline.ner import ner_impl
    from model_pipeline.utils.re_extract import re_process
    try:
        re_process(**file_handler.re_params())  
        ner_impl(file_handler)
            
        update_query = """
        UPDATE ner_results SET status = 'completed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_query, batch_ids)
        
        return {"message": "NER process completed."}
    
    except Exception as e:
        update_fail_query = """
        UPDATE ner_results SET status = 'failed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_fail_query, batch_ids)
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))

    
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
        
            

