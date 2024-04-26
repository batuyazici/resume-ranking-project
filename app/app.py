from fastapi import FastAPI, UploadFile, Form, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uuid
from db import execute_query, fetch_query
from typing import List, Optional
import uvicorn 
import asyncio
from pdf2image import convert_from_path
from comtypes.client import CreateObject
import os
import logging
from pathlib import Path 

UPLOAD_DIR = Path() / "uploads"
if not UPLOAD_DIR.exists():
    UPLOAD_DIR.mkdir(parents=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_async(func):
    def wrapper(*args, **kwargs):
        return asyncio.run(func(*args, **kwargs))
    return wrapper

def convert_docx_to_pdf_impl(docx_path, pdf_path):
    word = None  # Initialize word as None
    doc = None   # Initialize doc as None
    try:
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
        word = CreateObject("Word.Application")
        word.Visible = False
        doc = word.Documents.Open(docx_path)
        doc.SaveAs2(pdf_path, FileFormat=17)
    except Exception as e:
        logging.error(f"Failed to convert DOCX to PDF {docx_path}: {str(e)}")
    finally:
        if doc is not None:
            doc.Close()
        if word is not None:
            word.Quit()

def convert_pdf_to_jpg_impl(pdf_path, output_dir):
    try:
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        images = convert_from_path(pdf_path)
        base_filename = Path(pdf_path).stem
        for i, image in enumerate(images):    
            image_path = Path(output_dir) / f"{base_filename}-page-{i + 1}.jpg"
            image.save(image_path, 'JPEG')  
    except Exception as e:
        logging.error(f"Failed to convert PDF to JPG {pdf_path}: {str(e)}")

async def convert_docx_to_pdf(docx_path, pdf_path, batch_id, background_tasks):
    rel_docx_path = Path(docx_path)
    abs_docx_path = rel_docx_path.resolve()
    abs_docx_path = str(abs_docx_path)
    rel_pdf_path = Path(pdf_path)
    abs_pdf_path = rel_pdf_path.resolve()
    pdf_path = str(abs_pdf_path)
    try:
        convert_docx_to_pdf_impl(abs_docx_path, pdf_path)
        await execute_query("INSERT INTO conversion_status (batch_id, process_type, file_type, status) VALUES ($1, 'Convert DOCX to PDF', '.pdf', 'completed')", batch_id)
        background_tasks.add_task(run_async(convert_pdf_to_jpg), pdf_path, abs_pdf_path.parent, batch_id)
    except Exception as e:
        logging.error(f"Failed to convert PDF to JPG {pdf_path}: {str(e)}")
        await execute_query("INSERT INTO conversion_status (batch_id, process_type, file_type, status) VALUES ($1, 'Convert DOCX to PDF', '.pdf', 'failed')", batch_id)

async def convert_pdf_to_jpg(pdf_path, output_dir, batch_id):
    try:
        convert_pdf_to_jpg_impl(pdf_path, output_dir)
        await execute_query("INSERT INTO conversion_status (batch_id, process_type, file_type, status) VALUES ($1, 'Convert PDF to JPG', '.jpg', 'completed')", batch_id)
    except Exception as e:
        await execute_query("INSERT INTO conversion_status (batch_id, process_type, file_type, status) VALUES ($1, 'Convert PDF to JPG', '.jpg', 'failed')", batch_id)

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

def clean_filename(filename):
    extension = filename.rsplit('.', 1)[1] if '.' in filename else ''
    sanitized_name = f"{uuid.uuid4()}.{extension}"
    return sanitized_name

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
            background_tasks.add_task(convert_docx_to_pdf, str(file_path), str(pdf_path), batch_id, background_tasks)
        elif cleaned_name.endswith('.pdf'):
            background_tasks.add_task(convert_pdf_to_jpg, str(file_path), str(file_path.parent), batch_id)

    return {"message": "Files are being processed", "batch_id": batch_id}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
