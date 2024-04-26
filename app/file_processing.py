from pathlib import Path
from db import execute_query
import asyncio
from pdf2image import convert_from_path
from comtypes.client import CreateObject
import os
import logging
from pathlib import Path 


def run_async(func):
    def wrapper(*args, **kwargs):
        return asyncio.run(func(*args, **kwargs))
    return wrapper

def convert_docx_to_pdf(docx_path, pdf_path):
    word = None  
    doc = None   
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

def convert_pdf_to_jpg(pdf_path, output_dir):
    try:
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        images = convert_from_path(pdf_path)
        base_filename = Path(pdf_path).stem
        for i, image in enumerate(images):    
            image_path = Path(output_dir) / f"{base_filename}-page-{i + 1}.jpg"
            image.save(image_path, 'JPEG')  
    except Exception as e:
        logging.error(f"Failed to convert PDF to JPG {pdf_path}: {str(e)}")

async def docx_conv(docx_path, pdf_path, batch_id, background_tasks):
    rel_docx_path = Path(docx_path)
    abs_docx_path = rel_docx_path.resolve()
    abs_docx_path = str(abs_docx_path)
    rel_pdf_path = Path(pdf_path)
    abs_pdf_path = rel_pdf_path.resolve()
    pdf_path = str(abs_pdf_path)
    try:
        convert_docx_to_pdf(abs_docx_path, pdf_path)
        await execute_query("INSERT INTO conversion_status (batch_id, process_type, file_type, status) VALUES ($1, 'Convert DOCX to PDF', '.pdf', 'completed')", batch_id)
        background_tasks.add_task(run_async(pdf_conv), pdf_path, abs_pdf_path.parent, batch_id)
    except Exception as e:
        logging.error(f"Failed to convert PDF to JPG {pdf_path}: {str(e)}")
        await execute_query("INSERT INTO conversion_status (batch_id, process_type, file_type, status) VALUES ($1, 'Convert DOCX to PDF', '.pdf', 'failed')", batch_id)

async def pdf_conv(pdf_path, output_dir, batch_id):
    try:
        convert_pdf_to_jpg(pdf_path, output_dir)
        await execute_query("INSERT INTO conversion_status (batch_id, process_type, file_type, status) VALUES ($1, 'Convert PDF to JPG', '.jpg', 'completed')", batch_id)
    except Exception as e:
        await execute_query("INSERT INTO conversion_status (batch_id, process_type, file_type, status) VALUES ($1, 'Convert PDF to JPG', '.jpg', 'failed')", batch_id)