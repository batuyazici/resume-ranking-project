import os
import json
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from pathlib import Path

def load_distilBERT_model():
    # Initialize tokenizer
    tokenizer = AutoTokenizer.from_pretrained("has-abi/distilBERT-finetuned-resumes-sections")
    
    # Load the model
    model = AutoModelForSequenceClassification.from_pretrained("has-abi/distilBERT-finetuned-resumes-sections")
    
    # Check if CUDA is available and move the model to GPU
    if torch.cuda.is_available():
        model = model.cuda()
    else:
        print("CUDA is not available. Using CPU instead.")
    model.eval()
    return tokenizer, model

def classify_text(text, tokenizer, model):

    # Encode text inputs and truncate to the maximum sequence length of the model, typically 512 tokens
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)

    # Move tensors to the GPU if available
    if torch.cuda.is_available():
        inputs = {key: val.cuda() for key, val in inputs.items()}

    with torch.no_grad():
        # Perform inference
        logits = model(**inputs).logits

    # Get the predicted class ID and the softmax scores
    softmax_scores = torch.nn.functional.softmax(logits, dim=-1)
    predicted_class_id = logits.argmax().item()
    class_score = softmax_scores[0][predicted_class_id].item()  # Score of the predicted class
    return predicted_class_id, class_score

def clsf_run(results_dir, file_groups, tokenizer, model):
    classification_labels = {
        "0": "awards",
        "1": "certificates",
        "2": "contact/name/title",
        "3": "education",
        "4": "interests",
        "5": "languages",
        "6": "para",
        "7": "professional_experiences",
        "8": "projects",
        "9": "skills",
        "10": "soft_skills",
        "11": "summary"
    }

    for group in file_groups:
        group_dir = Path(results_dir) / group
        
        # Process each JSON file in the directory of the current group
        for filename in os.listdir(group_dir):
            if filename.endswith(".json"):
                file_path = group_dir / filename
                with open(file_path, 'r', encoding='utf-8') as file:
                    data = json.load(file)

                # Initialize classified data dictionary with each category as a list
                classified_data = {category: [] for category in classification_labels.values()}

                # Classify each line in the JSON file and organize by category
                for line in data:
                    class_id, class_score = classify_text(line, tokenizer, model)
                    classified_category = classification_labels[str(class_id)]
                    classified_data[classified_category].append({
                        "text": line,
                        "score": class_score
                    })

                new_file_name = f"{group}_clsf.json"  # Removes '.json' and adds '_clsf.json'
                new_file_path = group_dir / new_file_name
                with open(new_file_path, 'w', encoding='utf-8') as file:
                    json.dump(classified_data, file, ensure_ascii=False, indent=4)
                print(f"Processed and saved Classification results to {new_file_path}")

