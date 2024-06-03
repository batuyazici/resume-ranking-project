import os
import sys
from pathlib import Path


class YOLOParameters:
    def __init__(self, results_dir):
        FILE = Path(__file__).resolve()
        self.ROOT = FILE.parents[0]  # YOLO root directory
        self.weights = FILE.parents[1] / 'weights' / 'resumes-detection.pt' # Example model path
        self.stride = None  # Example stride value
        self.pt = None  # Example pt value
        self.names = None
        self.device = ''
        self.source = None
        self.imgsz = (640, 640)
        self.conf_thres = 0.3
        self.iou_thres = 0.3
        self.max_det = 1000
        self.save_crop = True
        self.classes = None
        self.agnostic_nms = False
        self.augment = False
        self.visualize = False
        self.update = False
        self.exist_ok = False
        self.project = FILE.parents[1] / 'models' /'runs/detect'
        self.name = 'exp'
        self.line_thickness = 3
        self.hide_labels = False
        self.hide_conf = False
        self.vid_stride = 1
        self.lang = 'en'
        self.results = results_dir

    def objdet_params(self):
        return {
            'stride': self.stride,
            'pt': self.pt,
            'names': self.names,
            'source': self.source,
            'imgsz': self.imgsz,
            'conf_thres': self.conf_thres,
            'iou_thres': self.iou_thres,
            'max_det': self.max_det,
            'save_crop': self.save_crop,
            'classes': self.classes,
            'agnostic_nms': self.agnostic_nms,
            'augment': self.augment,
            'visualize': self.visualize,
            'exist_ok': self.exist_ok,
            'project': self.project,
            'name': self.name,
            'line_thickness': self.line_thickness,
            'hide_labels': self.hide_labels,
            'hide_conf': self.hide_conf,
            'vid_stride': self.vid_stride,
            'results': self.results,
        }
    
    def load_yolov9_params(self):
        return {
            'weights': self.weights,
            'ROOT': self.ROOT,
            'device': self.device,
            'imgsz': self.imgsz,
            'dnn': False,
            'half':False,
            'data': None,
        }

    def set_source_dir(self, source_dir):
        self.source = source_dir