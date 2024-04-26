from pathlib import Path
import os

# Database URL
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@127.0.0.1:5433/appdb')

# Upload directory
UPLOAD_DIR = Path() / "app" / "uploads"
if not UPLOAD_DIR.exists():
    UPLOAD_DIR.mkdir(parents=True)
