from pathlib import Path
import os

# Database URL
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@127.0.0.1:5433/appdb')
APP_DIR = Path(__file__).cwd().parent

# Upload directory
UPLOAD_DIR = Path() / "uploads"

if not UPLOAD_DIR.exists():
    UPLOAD_DIR.mkdir(parents=True)

SAVE_DIR = APP_DIR / "model-pipeline" / "data"
