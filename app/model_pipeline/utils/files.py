from pathlib import Path
from collections import defaultdict
import os
from pathlib import Path

class FileHandler:
    def __init__(self):
        FILE = Path(__file__).resolve()
        ROOT = FILE.parents[1]
        self.source_dir = ROOT / 'data' 
        results_base = ROOT / "results"
        results_base.mkdir(exist_ok=True)  # Ensure the base directory exists
        run_number = 1
        while (results_base / f"run{run_number}").exists():
            run_number += 1
        self.results_dir = results_base / f"run{run_number}"
        self.results_dir.mkdir()  # Create the new run directory
        self.file_groups = None
        self.crops_dir = None

    def filter_group_filenames(self, jpg_files):
        """Group filenames by their base identifier."""
        file_groups = defaultdict(list)
        for file in jpg_files:
            base_identifier = file.split('.')[0].rsplit('_', 1)[0]
            file_groups[base_identifier].append(file)
        return file_groups
    
    def create_group_directories(self):
        """Create directories for each group in the results directory."""
        for group in self.file_groups:
            group_dir = self.results_dir / group
            group_dir.mkdir(parents=True, exist_ok=True)

    def find_images(self):
        jpg_files = [f for f in os.listdir(self.crops_dir) if f.endswith('.jpg')]
        return jpg_files

    def set_crops_dir(self, crops_dir):
        self.crops_dir = crops_dir / 'crops' / 'segment'
        self.file_groups = self.filter_group_filenames(self.find_images())
    def ocr_params(self):
        return {'crops_dir': self.crops_dir, 'results_dir': self.results_dir, 'file_groups': self.file_groups}
    
    def clsf_params(self):
        return {'results_dir': self.results_dir,'file_groups':self.file_groups}
    
    def re_params(self):
        return {'results_dir': self.results_dir,'file_groups':self.file_groups}
    
    def ner_params(self):
        return {'results_dir': self.results_dir,'file_groups':self.file_groups}
