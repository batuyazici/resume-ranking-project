from sentence_transformers import SentenceTransformer

def load_sentence_model():
    model = SentenceTransformer('mixedbread-ai/mxbai-embed-large-v1')
    tokenizer = model.tokenizer
    return model, tokenizer

def split_into_tokens(text, tokenizer, max_length=512):
    tokens = tokenizer.tokenize(text)
    return [' '.join(tokens[i:i + max_length]) for i in range(0, len(tokens), max_length)]

def extract_sentences(data, tokenizer):
    skills = []
    experience = []
    miscellaneous = []

    # Skills extraction
    skills_data = data.get('skills', {}).get('extracted_data', [])
    if skills_data:
        for item in skills_data:
            skills.extend(split_into_tokens(item.get('cleaned_text', ''), tokenizer))

    # Soft Skills extraction
    soft_skills_data = data.get('soft_skills', {}).get('extracted_data', [])
    if soft_skills_data:
        for item in soft_skills_data:
            skills.extend(split_into_tokens(item.get('cleaned_text', ''), tokenizer))

    # Experience extraction
    professional_experiences_data = data.get('professional_experiences', {}).get('extracted_data', [])
    if professional_experiences_data:
        for item in professional_experiences_data:
            experience.extend(split_into_tokens(item.get('cleaned_text', ''), tokenizer))

    # Miscellaneous extraction
    certificates_data = data.get('certificates', {}).get('extracted_data', [])
    if certificates_data:
        for item in certificates_data:
            miscellaneous.extend(split_into_tokens(item.get('cleaned_text', ''), tokenizer))

    summary_data = data.get('summary', {}).get('extracted_data', [])
    if summary_data:
        for item in summary_data:
            miscellaneous.extend(split_into_tokens(item.get('cleaned_text', ''), tokenizer))

    return {
        "skills": skills,
        "experience": experience,
        "miscellaneous": miscellaneous
    }
