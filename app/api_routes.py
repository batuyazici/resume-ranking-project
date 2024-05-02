from fastapi import FastAPI, UploadFile, Form, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List, Optional
from pathlib import Path
from db import execute_query, fetch_query 
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
    query = "INSERT INTO processing_batches DEFAULT VALUES RETURNING batch_id;"
    batch_id = await fetch_query(query)
    return batch_id[0]['batch_id']

async def check_batch_exists(batch_id):
    if not batch_id:
        return False
    query = "SELECT batch_id FROM processing_batches WHERE batch_id = $1;"
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
        
        with open(file_path, "wb") as file_object:
            file_object.write(await file_upload.read())
        await execute_query("""
            INSERT INTO uploaded_files (original_name, storage_name, file_path, batch_id)
            VALUES ($1, $2, $3, $4);
            """, file_upload.filename, cleaned_name, str(file_path), batch_id)
        if cleaned_name.endswith('.docx'):
            pdf_path = file_path.with_suffix('.pdf')
            background_tasks.add_task(docx_conv, str(file_path), str(pdf_path), batch_id, SAVE_DIR, background_tasks)
        elif cleaned_name.endswith('.pdf'):
            background_tasks.add_task(pdf_conv, str(file_path), SAVE_DIR ,batch_id)

    return {"message": "Files are being processed", "batch_id": batch_id}