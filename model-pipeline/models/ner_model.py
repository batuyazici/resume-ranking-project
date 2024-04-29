import json
from pathlib import Path
from gliner import GLiNER

def load_gliner_model():
    model = GLiNER.from_pretrained("urchade/gliner_large-v2.1")
    return model

def process_ner(text, labels, model):
    if labels:
        entities = model.predict_entities(text, labels, threshold=0.3)
        return entities
    return []

def process_classified_texts(classified_data, model):
    ner_results = {}
    label_map = {
        "contact/name/title": ["person", "job title", "location"],
        "summary": ["years of experience", "designation", "company name"],
        "languages": ["language", "language level"],
        "education": ["university", "degree", "date"],
        "professional_experiences": ["company name", "job title", "date"]
    }

    # Process each category individually
    for category, data in classified_data.items():
        if category in ["skills", "soft_skills", "awards", "certificates", "interests", "para", "projects"]:
            continue  # Skip categories that do not require NER

        labels = label_map.get(category, [])
        ner_results[category] = []  # Initialize the results list for the category
        for item in data['extracted_data']:  # Assuming data has 'extracted_data' containing entries with 'cleaned_text'
            cleaned_text = item['cleaned_text']  # Use the cleaned text for NER
            entities = process_ner(cleaned_text, labels, model)
            ner_results[category].extend(entities)  # Accumulate entities for each category

    return ner_results

def ner_run(results_dir, file_groups, model):
    # Iterate over each file group directory
    for group in file_groups:
        group_dir = Path(results_dir) / group
        # Process each 'group_clsf.json' file in the directory
        target_file = f"{group}_clsf.json"
        file_path = group_dir / target_file
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            file_results = process_classified_texts(data, model)

            # Construct the new file name for the NER results
            new_filename = group + "_ner.json"
            new_file_path = group_dir / new_filename
            
            # Write the results to the new file
            with open(new_file_path, 'w', encoding='utf-8') as f:
                json.dump(file_results, f, indent=4)

            print(f"Processed and saved NER results to {new_file_path}")

# Example usage:
model = load_gliner_model()
results_directory = "path_to_results_directory"
file_groups = ["group1", "group2", "group3"]
ner_run(results_directory, file_groups, model)
