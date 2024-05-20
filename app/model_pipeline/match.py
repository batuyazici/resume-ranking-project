from rank_bm25 import BM25Okapi
from sentence_transformers.util import cos_sim
import nltk
import os 
import json
import db
import string
import numpy as np
from helpers import create_match_name

def tokenize_doc(text):
    tokens = nltk.word_tokenize(text.lower())
    tokens = [token for token in tokens if token not in string.punctuation]
    return tokens

def remove_punctuation(text):
    return text.translate(str.maketrans('', '', string.punctuation))

def extract_ner_info(ner_data):
    locations = []
    languages = []
    years_of_experience = []
    degrees = []

    for key, entities in ner_data.items():
        for entity in entities:
            if entity["label"] == "location":
                locations.append(entity["text"])
            elif entity["label"] == "language":
                languages.append(entity["text"])
            elif entity["label"] == "degree":
                degrees.append(entity["text"])
            elif entity["label"] == "years of experience":
                years_of_experience.append(entity["text"])

    return {
        "locations": locations,
        "languages": languages,
        "years_of_experience": years_of_experience,
        "degrees": degrees
    }

async def fetch_cv_embeddings(file_id):
    query = """
        SELECT file_id, category, embedding
        FROM resume_embeddings
        WHERE file_id = $1
    """
    embeddings = await db.fetch_query(query, int(file_id))
    category_embeddings = {}
    for embedding in embeddings:
        category = embedding['category']
        if category not in category_embeddings:
            category_embeddings[category] = []
        category_embeddings[category].append(embedding['embedding'])
    return category_embeddings

async def fetch_job_embeddings(job_id):
    query = """
        SELECT embedding_id, job_id, embedding
        FROM job_embeddings
        WHERE job_id = $1
    """
    embeddings = await db.fetch_query(query, int(job_id))
    job_embeddings = [np.array(embedding['embedding']) for embedding in embeddings]  # Convert to numpy array
    return job_embeddings[0]  # Assume only one job embedding

async def match_impl(file_handler, files_data, job_data):
    files_list = []
    # Loop through each file and load the NER data
    for file in files_data:
        storage_name = file["storage_name"]
        results_path = file["results_path"]
        file_path = os.path.join(results_path, storage_name, f"{storage_name}_ner.json")

        try:
            with open(file_path, 'r') as ner_file:
                ner_data = json.load(ner_file)
                extracted_info = extract_ner_info(ner_data)
                embeddings = await fetch_cv_embeddings(file["file_id"])
                files_list.append({
                    "file_id": file["file_id"],
                     "original_name": file["original_name"],
                    "extracted_info": extracted_info,
                    "embeddings": embeddings
                })
        except FileNotFoundError:
            return {"status": "error", "message": f"Job description file not found at {job_path}"}
        except json.JSONDecodeError:
            return {"status": "error", "message": f"Error decoding job description JSON at {job_path}"}
            
    job_path = os.path.join(file_handler.jobs_dir, job_data["job_path"])
        
    try:
        with open(job_path, 'r') as job_file:
                    job_submission = json.load(job_file)
                    job_scores = {k: int(v) for k, v in job_submission['scores'].items()}
                    job_details_text = f"Job Title: {job_submission['jobDetails']['jobTitle']}\n" \
                                    f"Company: {job_submission['jobDetails']['company']}\n" \
                                    f"Location: {job_submission['jobDetails']['location']}\n" \
                                    f"Employee Type: {job_submission['jobDetails']['employeeType']}"
                    skills_text = f"Skills: {', '.join(job_submission['Skills'])}"
                    job_desc_text = f"Job Description: {job_submission['JobDesc']}"
    except FileNotFoundError:
        return {"status": "error", "message": f"Job description file not found at {job_path}"}
    except json.JSONDecodeError:
        return {"status": "error", "message": f"Error decoding job description JSON at {job_path}"}                          

    job_embeddings = await fetch_job_embeddings(job_data["job_id"])
    
    bm25_weight = job_scores['necessities'] / 2 / 100   
    skills_weight = job_scores['skills'] / 100
    experience_weight = job_scores['experience'] / 100
    education_weight = job_scores['education'] / 100
    miscellaneous_weight = job_scores['miscellaneous'] / 100
    
    corpus = [job_details_text, skills_text, job_desc_text]
    tokenized_corpus = [tokenize_doc(document) for document in corpus]

    # Initialize BM25 model
    bm25 = BM25Okapi(tokenized_corpus)
    
    match_results = {
        "job_id": job_data["job_id"],
        "job_title": job_data["job_title"],
        "company": job_data["company_name"],
        "matches": []
    }

    # Iterate over each file and compute BM25 scores for queries based on extracted_info
    for file_info in files_list:
        extracted_info = file_info["extracted_info"]
        queries = extracted_info["locations"] + extracted_info["languages"] 
        file_scores = {}
        similarity_scores = {}
        for query in queries:
            tokenized_query = tokenize_doc(query)
            scores = bm25.get_scores(tokenized_query)
            for score in scores:
                if score > 0:
                    file_scores[query] = bm25_weight
                    break
            else:
                file_scores[query] = 0
        
        for category, category_embeddings in file_info["embeddings"].items():
            category_embeddings_array = np.array(category_embeddings)  # Convert to numpy array
            max_cos_sim_score = max([cos_sim(job_embeddings, file_embedding).item() for file_embedding in category_embeddings_array], default=0)
            if category == 'skills':
                weight = skills_weight
            elif category == 'experience':
                weight = experience_weight
            elif category == 'education':
                weight = education_weight
            elif category == 'miscellaneous':
                weight = miscellaneous_weight
            else:
                weight = 0
            similarity_scores[category] = round(weight * max_cos_sim_score, 3)
            
        final_score = round(sum(file_scores.values()) + sum(similarity_scores.values()), 2)

        match_results["matches"].append({
            "file_id": file_info["file_id"],
            "original_name": file_info["original_name"],  
            "extracted_info": extracted_info,
            "bm25_scores": file_scores,
            "similarity_scores": similarity_scores,
            "final_score": final_score
        })

    match_name = create_match_name()
    match_results["match_name"] = match_name
    match_path = os.path.join(file_handler.match_dir, match_name)
    

    try:
         with open(match_path, 'w') as json_file:
            json.dump(match_results, json_file, indent=4)
    except IOError as e:
         return {"status": "error", "message": f"Failed to write match results to {match_path}: {str(e)}"}
        
    return match_results
    

        

