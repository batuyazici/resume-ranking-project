from fastapi import FastAPI, UploadFile, Form, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
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
    query = "INSERT INTO batch_process DEFAULT VALUES RETURNING batch_id;"
    batch_id = await fetch_query(query)
    return batch_id[0]['batch_id']

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