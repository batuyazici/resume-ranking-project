import easyocr
import os
import json
from pathlib import Path


def load_ocr_model(lang='en'):
    reader = easyocr.Reader([lang], gpu=True)  # Set gpu=False if not using GPU
    return reader

def detect_files(file_groups, crops_dir, results_dir, reader):
    """Process each group of files, perform OCR, and save the results to a JSON file in the results directory."""
    for base_identifier, files in file_groups.items():
        all_texts = []
        for file in files:
            image_path = os.path.join(crops_dir, file)
            result = reader.readtext(image_path)
            text = ' '.join([detection[1] for detection in result])
            all_texts.append(text)
        
        # Ensure the results directory exists
        os.makedirs(results_dir, exist_ok=True)
        
        # Save the OCR results for this group to a JSON file in the results directory
        save_path = Path(results_dir) / base_identifier
        save_path.mkdir(parents=True, exist_ok=True)
        json_path = Path(save_path) / f"{base_identifier}_ocr.json"
        with open(json_path, 'w', encoding='utf-8') as json_file:
            json.dump(all_texts, json_file, ensure_ascii=False, indent=4)
        print(f"Processed and saved OCR results to {json_path}")
        
def ocr_run(reader, crops_dir, results_dir, file_groups):
    detect_files(file_groups, crops_dir, results_dir, reader)

