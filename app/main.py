from fastapi import FastAPI, UploadFile
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
UPLOAD_DIR = Path() / "src" / "uploads"

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/uploadfile/")
async def create_upload_file(file_upload: UploadFile):
    data = await file_upload.read()
    file_path = UPLOAD_DIR / file_upload.filename
    with open(file_path, "wb") as file_object:
        file_object.write(data)
    return {"filename": file_upload.filename}

@app.post("/uploadfiles/")
async def create_upload_files(file_uploads: list[UploadFile]):
    for file_upload in file_uploads:
        data = await file_upload.read()
        file_path = UPLOAD_DIR / file_upload.filename
        with open(file_path, "wb") as file_object:
            file_object.write(data)
    
    return {"filenames": [file.filename for file in file_uploads]}
