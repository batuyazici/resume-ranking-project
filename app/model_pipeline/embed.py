from model_pipeline.models.embed_model import load_sentence_model, extract_sentences
import os
import json
import numpy as np

model= load_sentence_model()

async def resume_embed_impl(file_handler, file):
    file_id = file['file_id']
    storage_name = file['storage_name']
    specific_result_folder = os.path.join(file_handler.results_dir, storage_name)
    file_path = os.path.join(specific_result_folder, f"{storage_name}_clsf.json")

    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            data = json.load(f)
            structured_data = extract_sentences(data)
            batch_values = []
            embedding_dim = model.get_sentence_embedding_dimension()  
            for category, sentences in structured_data.items():
                concatenated_sentences = ' '.join(sentences)  
                if concatenated_sentences.strip():  
                    embedding = model.encode(concatenated_sentences)  
                else:
                    embedding = np.zeros(embedding_dim)  
                batch_values.append((file_id, 0, category, embedding))
            return batch_values
    return None

# Function to embed job description chunks and calculate BM25 IDF scores
async def job_embed_impl(job_id, combined_text):
    batch_values = []
    embedding = model.encode(combined_text)
    batch_values.append((job_id, 0, embedding))
    
    return batch_values