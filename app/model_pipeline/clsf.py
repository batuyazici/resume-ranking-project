from model_pipeline.models.clsf_model import clsf_run, load_distilBERT_model

async def clsf_impl(file_handler):
    clsf_tokenizer, clsf_model = load_distilBERT_model()
    clsf_run(**file_handler.clsf_params(), tokenizer=clsf_tokenizer, model=clsf_model)