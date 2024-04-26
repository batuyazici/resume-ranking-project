import uuid

def clean_filename(filename):
    extension = filename.rsplit('.', 1)[1] if '.' in filename else ''
    sanitized_name = f"{uuid.uuid4()}.{extension}"
    return sanitized_name