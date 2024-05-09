from model_pipeline.models.detect_model import load_yolov9_model, objdet_run

async def detect_impl(parameters):
    objdet_model, parameters.stride, parameters.pt, parameters.names, parameters.imgsz = load_yolov9_model(**parameters.load_yolov9_params())
    results_path = objdet_run(objdet_model, **parameters.objdet_params())
    return results_path