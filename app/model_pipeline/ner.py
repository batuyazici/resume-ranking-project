from model_pipeline.models.ner_model import ner_run, load_gliner_model

async def ner_impl(file_handler):
    ner_model = load_gliner_model()
    ner_run(**file_handler.ner_params(), model=ner_model)