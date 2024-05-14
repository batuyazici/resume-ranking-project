from model_pipeline.models.embed_model import load_sentence_model, extract_sentences
import os
import json
import db

model, tokenizer = load_sentence_model()

async def resume_embed_impl(file_handler, file):
    file_id = file['file_id']
    storage_name = file['storage_name']
    specific_result_folder = os.path.join(file_handler.results_dir, storage_name)
    file_path = os.path.join(specific_result_folder, f"{storage_name}_clsf.json")

    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            data = json.load(f)
            structured_data = extract_sentences(data, tokenizer)
            batch_values = []
            for category, sentences in structured_data.items():
                embeddings = model.encode(sentences)
                for i, embedding in enumerate(embeddings):
                    batch_values.append((file_id, i, category, embedding.tolist()))

            return batch_values
    return None
