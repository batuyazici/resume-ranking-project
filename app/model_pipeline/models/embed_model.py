from sentence_transformers import SentenceTransformer
# def split_into_tokens(text, tokenizer, max_length=512):
#     tokens = tokenizer.tokenize(text)
#     return [' '.join(tokens[i:i + max_length]) for i in range(0, len(tokens), max_length)]


def load_sentence_model():
    model = SentenceTransformer('Alibaba-NLP/gte-large-en-v1.5', trust_remote_code=True)
    return model


def extract_sentences(data):
    skills = []
    experience = []
    education = []
    miscellaneous = []

    # Skills extraction
    skills_data = data.get('skills', {}).get('extracted_data', [])
    for skill in skills_data:
        skills.append(skill.get('cleaned_text', ''))

    # Soft Skills extraction
    soft_skills_data = data.get('soft_skills', {}).get('extracted_data', [])
    for soft_skill in soft_skills_data:
        skills.append(soft_skill.get('cleaned_text', ''))

    # Education extraction
    education_data = data.get('education', {}).get('extracted_data', [])
    for edu in education_data:
        education.append(edu.get('cleaned_text', ''))

    # Experience extraction
    professional_experiences_data = data.get('professional_experiences', {}).get('extracted_data', [])
    for exp in professional_experiences_data:
        experience.append(exp.get('cleaned_text', ''))

    # Miscellaneous extraction
    awards_data = data.get('awards', {}).get('extracted_data', [])
    for award in awards_data:
        miscellaneous.append(award.get('cleaned_text', ''))

    interests_data = data.get('interests', {}).get('extracted_data', [])
    for interest in interests_data:
        miscellaneous.append(interest.get('cleaned_text', ''))

    certificates_data = data.get('certificates', {}).get('extracted_data', [])
    for certificate in certificates_data:
        miscellaneous.append(certificate.get('cleaned_text', ''))

    summary_data = data.get('summary', {}).get('extracted_data', [])
    for summary in summary_data:
        miscellaneous.append(summary.get('cleaned_text', ''))

    para_data = data.get('para', {}).get('extracted_data', [])
    for para in para_data:
        miscellaneous.append(para.get('cleaned_text', ''))

    projects_data = data.get('projects', {}).get('extracted_data', [])
    for project in projects_data:
        miscellaneous.append(project.get('cleaned_text', ''))

    return {
        "skills": skills,
        "experience": experience,
        "education": education,
        "miscellaneous": miscellaneous
    }

