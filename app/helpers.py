import uuid
from config import SAVE_DIR, INPUT_DIR
from db import execute_query, fetch_query 
import pathlib
from datetime import datetime
import re
def clean_filename(filename):
    extension = filename.rsplit('.', 1)[1] if '.' in filename else ''
    sanitized_name = f"{uuid.uuid4()}.{extension}"
    return sanitized_name

def edit_filename(job_title):
    job_id = str(uuid.uuid4())
    # Create a slug and remove characters that are not alphanumeric, hyphens, or underscores
    job_title_slug = re.sub(r'[^a-zA-Z0-9-_]', '', job_title.lower().replace(" ", "-"))
    filename = f"{job_id}_{job_title_slug}.json"
    return filename

async def init_upload_batch(results_dir):
	# Insert into batch_process table
    batch_query ="""
    INSERT INTO batch_process (results_path, crops_path)
    VALUES ($1, NULL)
    RETURNING batch_id;
    """
    batch_id = await fetch_query(batch_query, results_dir)
    batch_id = batch_id[0]['batch_id']
	
    # Insert into detection_results table
    detection_query = f"INSERT INTO detection_results (batch_id, status) VALUES ({batch_id}, 'pending') RETURNING detect_id;"
    detect_id = await fetch_query(detection_query)
    detect_id = detect_id[0]['detect_id']
    
    # Insert into ocr_results table
    ocr_query = f"INSERT INTO ocr_results (batch_id, status) VALUES ({batch_id},'pending') RETURNING ocr_id;"
    ocr_id = await fetch_query(ocr_query)
    ocr_id = ocr_id[0]['ocr_id']
    
    # Insert into classification_results table
    classification_query = f"INSERT INTO classification_results (batch_id, status) VALUES ({batch_id},  'pending') RETURNING class_id;"
    class_id = await fetch_query(classification_query)
    class_id = class_id[0]['class_id']
    
    # Insert into ner_results table
    ner_query = f"INSERT INTO ner_results (batch_id, status) VALUES ({batch_id}, 'pending') RETURNING ner_id;"
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

async def conf_input_file():
    input_dir = INPUT_DIR.resolve()
    input_dir.mkdir(exist_ok=True)
    run_number =1
    while (INPUT_DIR / f"run{run_number}").exists():
        run_number += 1
    input_path = INPUT_DIR / f"run{run_number}"
    input_path.mkdir()
    return input_path

def format_record(record):
    return {key: (value.strftime('%Y-%m-%d %H:%M:%S') if isinstance(value, datetime) else value) for key, value in record.items()}

def create_match_name():
    match_id = str(uuid.uuid4())
    filename = f"{match_id}.json"
    return filename