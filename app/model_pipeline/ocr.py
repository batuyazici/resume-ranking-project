from model_pipeline.models.ocr_model import ocr_run, load_ocr_model

async def ocr_impl(parameters, file_handler):
    ocr_model = load_ocr_model(parameters.lang)
    ocr_run(reader=ocr_model, **file_handler.ocr_params())
