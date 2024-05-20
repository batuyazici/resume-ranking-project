import json
from pathlib import Path
from gliner import GLiNER

def load_gliner_model():
    model = GLiNER.from_pretrained("urchade/gliner_multi_pii-v1")
    return model

def process_ner(text, labels, model):
    if labels:
        entities = model.predict_entities(text, labels, threshold=0.3)
        return entities
    return []

def process_classified_texts(classified_data, extracted_ner_data, model):
    ner_results = {}
    label_map = {
        "contact/name/title": ["person", "job title", "location"],
        "summary": ["years of experience", "designation", "company name"],
        "languages": ["language", "language level"],
        "education": ["university", "degree", "date"],
        "professional_experiences": ["company name", "job title", "date"]
    }

    for category, data in classified_data.items():
        if category in ["skills", "soft_skills", "awards", "certificates", "interests", "para", "projects"]:
            continue

        labels = label_map.get(category, [])
        ner_results[category] = []

        for i, item in enumerate(data['extracted_data']):
            cleaned_text = item['cleaned_text']
            entities = process_ner(cleaned_text, labels, model)
            if i < len(extracted_ner_data[category]):
                ner_info = extracted_ner_data[category][i]
                if "emails" in ner_info:
                    for email in ner_info["emails"]:
                        entities.append({"start": email["start"], "end": email["end"], "text": email["text"], "label": "email", "score": 1.0})
                if "links" in ner_info:
                    for link in ner_info["links"]:
                        entities.append({"start": link["start"], "end": link["end"], "text": link["text"], "label": "link", "score": 1.0})
                if "phone_numbers" in ner_info:
                    for phone_number in ner_info["phone_numbers"]:
                        entities.append({"start": phone_number["start"], "end": phone_number["end"], "text": phone_number["text"], "label": "phone_number", "score": 1.0})
            ner_results[category].extend(entities)

        # Sort entities by the start position
        ner_results[category] = sorted(ner_results[category], key=lambda x: x['start'])

    return ner_results

def ner_run(results_dir, file_groups, model):
    for group in file_groups:
        group_dir = Path(results_dir) / group
        target_file = f"{group}_clsf.json"
        ner_file = f"{group}_ner.json"
        file_path = group_dir / target_file
        ner_file_path = group_dir / ner_file

        if file_path.exists() and ner_file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            with open(ner_file_path, 'r', encoding='utf-8') as file:
                extracted_ner_data = json.load(file)

            file_results = process_classified_texts(data, extracted_ner_data, model)
            
            with open(ner_file_path, 'w', encoding='utf-8') as f:
                json.dump(file_results, f, indent=4)

            print(f"Processed and saved NER results to {ner_file_path}")
