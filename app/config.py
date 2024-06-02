from pathlib import Path
import os

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@127.0.0.1:5433/appdb')

UPLOAD_DIR = Path() / "uploads" 
if not UPLOAD_DIR.exists():
    UPLOAD_DIR.mkdir(parents=True)
    
SAVE_DIR = Path()  / "data"
if not SAVE_DIR.exists():
    SAVE_DIR.mkdir(parents=True)
    
INPUT_DIR = Path()  / "model_pipeline" / "inputs"
if not INPUT_DIR.exists():
    INPUT_DIR.mkdir(parents=True)
