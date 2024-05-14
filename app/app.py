from fastapi import FastAPI, UploadFile, Form, File, BackgroundTasks, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Optional
import os
import shutil  
import glob
import json
from db import init_connection_pool, close_connection_pool, execute_query, fetch_query, fetch_single_query, executemany_query
from helpers import clean_filename, init_upload_batch, check_batch_exists, conf_input_file
from file_processing import docx_conv, pdf_conv
from config import UPLOAD_DIR, SAVE_DIR, SAVE_DIR_API
from model_pipeline.utils.files import FileHandler
from model_pipeline.utils.params import YOLOParameters
import uvicorn


async def lifespan(app: FastAPI):
    await init_connection_pool()
    yield
    await close_connection_pool()
    
    
app = FastAPI(lifespan=lifespan)

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
            query = """
            WITH status_data AS (
                SELECT 
                    batch_id,
                    MAX(CASE WHEN type = 'detection' THEN status ELSE NULL END) AS detection_status,
                    MAX(CASE WHEN type = 'ocr' THEN status ELSE NULL END) AS ocr_status,
                    MAX(CASE WHEN type = 'classification' THEN status ELSE NULL END) AS classification_status,
                    MAX(CASE WHEN type = 'ner' THEN status ELSE NULL END) AS ner_status
                FROM (
                    SELECT batch_id, status, 'detection' AS type FROM detection_results
                    UNION ALL
                    SELECT batch_id, status, 'ocr' AS type FROM ocr_results
                    UNION ALL
                    SELECT batch_id, status, 'classification' AS type FROM classification_results
                    UNION ALL
                    SELECT batch_id, status, 'ner' AS type FROM ner_results
                ) AS results
                GROUP BY batch_id
            )
            SELECT
                bp.batch_id, bp.start_date, uf.file_id, cs.process_type, 
                cs.status AS conversion_status, cs.number_of_pages, 
                cs.save_path, uf.original_name,
                sd.detection_status, sd.ocr_status, sd.classification_status, sd.ner_status
            FROM batch_process bp
            JOIN uploaded_files uf ON bp.batch_id = uf.batch_id
            JOIN conversion_status cs ON uf.file_id = cs.file_id
            LEFT JOIN status_data sd ON bp.batch_id = sd.batch_id
            ORDER BY uf.file_id;
            """
            results = await fetch_query(query)

            if not results:
                raise HTTPException(status_code=404, detail="No conversion statuses found.")

            # Organize by batch_id
            batch_dict = {}
            for result in results:
                batch_id = result['batch_id']
                if batch_id not in batch_dict:
                    batch_dict[batch_id] = {
                        "batchId": batch_id,
                        "start_date": result['start_date'],
                        "files": [],
                        "detection_status": result.get('detection_status', 'No data'),
                        "ocr_status": result.get('ocr_status', 'No data'),
                        "classification_status": result.get('classification_status', 'No data'),
                        "ner_status": result.get('ner_status', 'No data')
                    }
                batch_dict[batch_id]['files'].append({
                    "batch_id": batch_id,
                    "start_date": result['start_date'],
                    "file_id": result['file_id'],
                    "process_type": result['process_type'],
                    "conversion_status": result['conversion_status'],
                    "number_of_pages": result['number_of_pages'],
                    "save_path": result['save_path'],
                    "original_name": result['original_name'],
                    "detection_status": result['detection_status'],
                    "ocr_status": result['ocr_status'],
                    "classification_status": result['classification_status'],
                    "ner_status": result['ner_status']
                })

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
        
        return JSONResponse(content={"results": results})

    except Exception as e:
        update_fail_query = """
        UPDATE ocr_results SET status = 'failed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_fail_query, batch_ids)
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/classify/")
async def classify_run(batch_ids: dict):
    from model_pipeline.clsf import clsf_impl
    try:
        batch_ids = batch_ids.get("batch_ids", [])
        batch_ids = [int(id_str) for id_str in batch_ids]
        query = """
            SELECT file_id, storage_name, batch_id FROM uploaded_files
            WHERE batch_id = ANY($1);
        """
        files = await fetch_query(query, batch_ids)
        await clsf_impl(file_handler)
        
        results = {}
        for file in files:
            file_id = file['file_id']
            storage_name = file['storage_name']
            specific_result_folder = os.path.join(file_handler.results_dir, storage_name)
            file_path = os.path.join(specific_result_folder, f"{storage_name}_clsf.json")
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    results[file_id] = json.load(f)    

        update_query = """
        UPDATE classification_results SET status = 'completed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_query, batch_ids)
        return JSONResponse(content={"results": results})
    
    except Exception as e:
        update_fail_query = """
        UPDATE classification_results SET status = 'failed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_fail_query, batch_ids)
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))    
    
@app.post("/ner/")
async def ner_process(batch_ids: dict):
    from model_pipeline.ner import ner_impl
    from model_pipeline.utils.re_extract import re_process
    try:
        batch_ids = batch_ids.get("batch_ids", [])
        batch_ids = [int(id_str) for id_str in batch_ids]
        query = """
            SELECT file_id, storage_name, batch_id FROM uploaded_files
            WHERE batch_id = ANY($1);
        """
        files = await fetch_query(query, batch_ids)
        re_process(**file_handler.re_params())  
        await ner_impl(file_handler)
        
        results = {}
        for file in files:
            file_id = file['file_id']
            storage_name = file['storage_name']
            specific_result_folder = os.path.join(file_handler.results_dir, storage_name)
            file_path = os.path.join(specific_result_folder, f"{storage_name}_ner.json")
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    results[file_id] = json.load(f)  
                                
        update_query = """
        UPDATE ner_results SET status = 'completed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_query, batch_ids)
        
        return JSONResponse(content={"results": results})
    
    except Exception as e:
        update_fail_query = """
        UPDATE ner_results SET status = 'failed' WHERE batch_id = ANY($1);
        """
        await execute_query(update_fail_query, batch_ids)
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/ocrfiles/{storage_name}/{file_id}")
async def delete_ocr_lines(storage_name: str, file_id: str, deleted_lines: List[str] = Body(..., embed=True)):
    file_path = os.path.join(file_handler.results_dir,storage_name,f"{storage_name}_ocr.json")
    print("File Path:", file_path)  # Debugging output
    try:
        if not os.path.exists(file_path):
            print("File not found")
            raise HTTPException(status_code=404, detail="File not found.")
        
        with open(file_path, 'r') as file:
            ocr_data = json.load(file)
        ocr_data = [
            line for line in ocr_data if line not in deleted_lines
        ]        
        with open(file_path, 'w') as file:
            json.dump(ocr_data, file, indent=4)
        
        return JSONResponse(content= {f"{file_id}":ocr_data})
    except Exception as e:
        print("Error:", str(e))  # Print error to console
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clsfiles/{storage_name}/{file_id}")
async def update_clsf_classes(storage_name: str, file_id: str, actions: List[dict] = Body(..., embed=True)):
    file_path = os.path.join(file_handler.results_dir, storage_name, f"{storage_name}_clsf.json")
    print("File Path:", file_path)  # Debugging output

    try:
        if not os.path.exists(file_path):
            print("File not found")
            raise HTTPException(status_code=404, detail="File not found.")
        
        with open(file_path, 'r') as file:
            clsf_data = json.load(file)

        # Process each action
        for action in actions:
            if action['action'] == 'delete':
                category = action['category']
                index = action['index']
                # Check if category exists and index is valid
                if category in clsf_data and len(clsf_data[category]) > index:
                    del clsf_data[category][index]
                else:
                    print(f"Invalid category or index for delete: {category}, {index}")
                    continue  # Skip this action if invalid

            elif action['action'] == 'change_class':
                old_class = action['oldClass']
                new_class = action['newClass']
                item = action['item']
                # Remove item from old class if it exists
                if old_class in clsf_data:
                    clsf_data[old_class] = [i for i in clsf_data[old_class] if i != item]
                else:
                    print(f"Old class not found: {old_class}")
                    continue  # Skip if old class doesn't exist

                # Add item to new class
                if new_class not in clsf_data:
                    clsf_data[new_class] = []
                clsf_data[new_class].append(item)

        # Write the updated data back to the file
        with open(file_path, 'w') as file:
            json.dump(clsf_data, file, indent=4)

        return JSONResponse(content={f"{file_id}":clsf_data})
    except Exception as e:
        print("Error:", str(e))  # Print error to console
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/nerfiles/{storage_name}/{file_id}")
async def update_clsf_classes(storage_name: str, file_id: str, actions: List[dict] = Body(..., embed=True)):
    file_path = os.path.join(file_handler.results_dir, storage_name, f"{storage_name}_ner.json")
    print("File Path:", file_path)  # Debugging output

    try:
        if not os.path.exists(file_path):
            print("File not found")
            raise HTTPException(status_code=404, detail="File not found.")
        
        with open(file_path, 'r') as file:
            ner_data = json.load(file)

        # Process actions
        for action in actions:
            category = action["category"]
            if action["action"] == "change":
                # Change existing item
                index = action["index"]
                if index < len(ner_data[category]):
                    ner_data[category][index] = action["newItem"]
                else:
                    print(f"Index {index} out of range for category '{category}'")
            elif action["action"] == "delete":
                # Delete item
                item_to_delete = action["item"]
                ner_data[category] = [item for item in ner_data[category] if not (
                    item['start'] == item_to_delete['start'] and
                    item['end'] == item_to_delete['end'] and
                    item['text'] == item_to_delete['text']
                )]

        # Write the updated data back to the file
        with open(file_path, 'w') as file:
            json.dump(ner_data, file, indent=4)

        return JSONResponse(content={f"{file_id}": ner_data})
    except Exception as e:
        print("Error:", str(e))  # Print error to console
        raise HTTPException(status_code=500, detail=str(e))

   

@app.post("/cv/embed")
async def get_resume_embed(batch_ids: dict):
    from model_pipeline.embed import resume_embed_impl
    try:
        batch_ids = batch_ids.get("batch_ids", [])
        batch_ids = [int(id_str) for id_str in batch_ids]
        query = """
            SELECT file_id, storage_name, batch_id FROM uploaded_files
            WHERE batch_id = ANY($1);
        """
        files = await fetch_query(query, batch_ids)
        insert_all_query = """INSERT INTO resume_embeddings (file_id, sentence_index, category, embedding)
                                VALUES ($1, $2, $3, $4)
                                ON CONFLICT DO NOTHING;
                            """
        for file in files:
            embed_values =  await resume_embed_impl(file_handler, file)
            if embed_values:
                 await executemany_query(insert_all_query, embed_values)

        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
                    
                    
# @app.post("/job/embed")
# async def get_job_embed():

   
        
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

      
            

