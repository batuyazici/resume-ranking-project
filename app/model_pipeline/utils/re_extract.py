import json
import os
import re
from pathlib import Path

class TextExtractor:
    def __init__(self, text):
        self.original_text = text
        self.text = text
    
    def extract_links(self):
        link_pattern = r'\b(?<!@)(?:https?://|ftp://|www\.)\s*[A-Za-z0-9.-]+\s*\.\s*[A-Za-z]{2,}(?:\s*\b|/)'
        potential_links = re.finditer(link_pattern, self.text, re.IGNORECASE)

        links = []
        for match in potential_links:
            link = match.group(0)
            cleaned_link = re.sub(r'\s+', '', link)
            start = match.start()
            end = match.end()
            links.append({"text": cleaned_link, "start": start, "end": end})
            self.text = self.text.replace(link, "") 

        return links, self.text

    def extract_emails(self):
        email_pattern = r'\b[A-Za-z0-9._%+-]+[\s]*@[\s]*[A-Za-z0-9.-]+[\s]*\.[A-Za-z]{2,}\b'
        potential_emails = re.finditer(email_pattern, self.text, re.IGNORECASE)

        emails = []
        for match in potential_emails:
            email = match.group(0)
            cleaned_email = re.sub(r'\s+', '', email)
            start = match.start()
            end = match.end()
            emails.append({"text": cleaned_email, "start": start, "end": end})
            self.text = self.text.replace(email, "") 

        return emails, self.text

    def extract_phone_numbers(self):
        phone_number_pattern = r'\+?\d[\d\s.-]{8,12}\d'
        phone_numbers = re.finditer(phone_number_pattern, self.text, re.IGNORECASE)
        
        phones = []
        for match in phone_numbers:
            phone = match.group(0)
            start = match.start()
            end = match.end()
            phones.append({"text": phone, "start": start, "end": end})
            self.text = self.text.replace(phone, "")
        return phones, self.text

def re_process(results_dir, file_groups):
    for group in file_groups:
        group_dir = Path(results_dir) / group
        target_file = f"{group}_clsf.json"
        file_path = group_dir / target_file
        
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            processed_data = {}
            ner_data = {}
            for category, entries in data.items():
                processed_data[category] = {
                    "extracted_data": []
                }
                ner_data[category] = []
                for entry in entries:
                    text = entry['text']
                    score = entry.get('score', None)
                    extractor = TextExtractor(text)
                    links, updated_text = extractor.extract_links()
                    emails, updated_text = extractor.extract_emails()
                    phone_numbers, updated_text = extractor.extract_phone_numbers()
                    extracted_info = {
                        "original_text": extractor.original_text,
                        "cleaned_text": updated_text.strip(),
                        "score": score
                    }
                    ner_info = {
                        "links": links,
                        "emails": emails,
                        "phone_numbers": phone_numbers
                    }
                    processed_data[category]["extracted_data"].append(extracted_info)
                    ner_data[category].append(ner_info)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(processed_data, f, indent=4)

            ner_file_path = group_dir / f"{group}_ner.json"
            with open(ner_file_path, 'w', encoding='utf-8') as f:
                json.dump(ner_data, f, indent=4)

            print(f"Updated and saved extracted data to {file_path} and NER data to {ner_file_path}")
