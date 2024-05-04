from pathlib import Path
from db import execute_query, fetch_single_query
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
        pages_num = len(images)
        
        base_filename = Path(pdf_path).stem
        
        # Save each page as a JPEG image
        for i, image in enumerate(images):    
            image_path = Path(output_dir) / f"{base_filename}_page-{i + 1}.jpg"
            image.save(image_path, 'JPEG')
        return pages_num  
    except Exception as e:
        logging.error(f"Failed to convert PDF to JPG {pdf_path}: {str(e)}")
        return 0

async def docx_conv(file_id, docx_path, pdf_path, batch_id, save_dir, background_tasks):
    rel_docx_path = Path(docx_path)
    abs_docx_path = str(rel_docx_path.resolve())
    rel_pdf_path = Path(pdf_path)
    pdf_path = str(rel_pdf_path.resolve())
    try:
        convert_docx_to_pdf(abs_docx_path, pdf_path)
        conv_id = await fetch_single_query("INSERT INTO conversion_status (batch_id, process_type, status, file_id) VALUES ($1, 'docx-jpg', 'pending', $2) RETURNING conv_id", batch_id, file_id)
        background_tasks.add_task(run_async(pdf_conv), file_id, pdf_path, save_dir, batch_id, conv_id)
    except Exception as e:
        logging.error(f"Failed to convert PDF to JPG {pdf_path}: {str(e)}")
        await execute_query("INSERT INTO conversion_status (batch_id, process_type, status, file_id) VALUES ($1, 'Convert DOCX to PDF', 'failed', $2)", batch_id, file_id)

async def pdf_conv(file_id, pdf_path, save_dir, batch_id, conv_id=None):
    try:
        pages_num = convert_pdf_to_jpg(pdf_path, save_dir)  
        if conv_id:
            await execute_query(
                "UPDATE conversion_status SET status = 'completed', number_of_pages = $2, save_path = $3 WHERE conv_id = $1", 
                conv_id, pages_num, save_dir
            )
        else:
            await execute_query(
                "INSERT INTO conversion_status (batch_id, file_id, process_type, status, number_of_pages, save_path) VALUES ($1, $2, 'pdf-jpg', 'completed', $3, $4)", 
                batch_id, file_id, pages_num, save_dir
            )
    except Exception as e:
        logging.error(f"Failed to convert PDF or update database for file_id {file_id}: {str(e)}")
        if conv_id:
            await execute_query(
                "UPDATE conversion_status SET status = 'failed', number_of_pages = 0 WHERE conv_id = $1", 
                conv_id
            )
        else:
            await execute_query(
                "INSERT INTO conversion_status (batch_id, file_id, process_type, status, number_of_pages, save_path) VALUES ($1, $2, 'Convert PDF to JPG', 'failed', 0, '')", 
                batch_id, file_id
            ) 
