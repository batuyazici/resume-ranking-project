from model_pipeline.models.embed_model import load_sentence_model, extract_sentences
import os
import json

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
            for category, sentences in structured_data.items():
                concatenated_sentences = ' '.join(sentences)  # Concatenate sentences into a single string
                embedding = model.encode([concatenated_sentences])[0]  # Encode the concatenated string
                batch_values.append((file_id, 0,category, embedding))
            return batch_values
    return None

# def split_into_chunks(text, tokenizer, max_tokens=512, sentence_overlap=2):
#     sentences = nltk.sent_tokenize(text)
    
#     chunks = []
#     current_chunk = []
#     current_length = 0

#     for sentence in sentences:
#         sentence_tokens = tokenizer.encode(sentence, add_special_tokens=False)
#         sentence_length = len(sentence_tokens)

#         # Check if adding the sentence would exceed the token limit
#         if current_length + sentence_length > max_tokens:
#             # Add the current chunk to chunks
#             chunks.append(current_chunk)
#             # Prepare for the next chunk with overlap
#             overlap_sentences = current_chunk[-sentence_overlap:]
#             current_chunk = overlap_sentences
#             current_length = sum(len(tokenizer.encode(s, add_special_tokens=False)) for s in overlap_sentences)

#         current_chunk.append(sentence)
#         current_length += sentence_length

#     # Add the last chunk if it contains any sentences
#     if current_chunk:
#         chunks.append(current_chunk)

#     return [' '.join(chunk) for chunk in chunks]

# Function to embed job description chunks and calculate BM25 IDF scores
async def job_embed_impl(job_id, combined_text):
    batch_values = []
    embedding = model.encode(combined_text)
    batch_values.append((job_id, 0, embedding))
    
    return batch_values