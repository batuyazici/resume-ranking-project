from models.detect_model import objdet_run, load_yolov9_model  
from models.ocr_model import ocr_run, load_ocr_model
from models.clsf_model import clsf_run, load_distilBERT_model
from models.ner_model import ner_run, load_gliner_model
from models.params import Parameters
from utils.files import FileHandler

#Parameters
parameters= Parameters()


#Load Models
objdet_model, parameters.stride, parameters.pt, parameters.names, parameters.imgsz = load_yolov9_model(**parameters.load_yolov9_params())
ocr_model = load_ocr_model(parameters.lang)


#Inference
crops_dir = objdet_run(objdet_model, **parameters.objdet_params())
file_handler = FileHandler(parameters.source, crops_dir, parameters.results)
ocr_run(reader=ocr_model,**file_handler.ocr_params())

#Load Models
clsf_tokenizer, clsf_model = load_distilBERT_model()
ner_model = load_gliner_model()

#Inference
clsf_run(**file_handler.clsf_params(), tokenizer=clsf_tokenizer, model=clsf_model)
ner_run(**file_handler.ner_params(), model=ner_model)