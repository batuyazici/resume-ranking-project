from pathlib import Path
import os

# Database URL
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@127.0.0.1:5433/appdb')


# Upload directory
UPLOAD_DIR = Path() / "uploads" 

if not UPLOAD_DIR.exists():
    UPLOAD_DIR.mkdir(parents=True)

SAVE_DIR = Path()   /"data"

SAVE_DIR_API = Path()  / "data"
INPUT_DIR = Path()  / "model_pipeline" / "inputs"
