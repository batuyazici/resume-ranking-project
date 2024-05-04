import json
import os
import re
from pathlib import Path

class TextExtractor:
    def __init__(self, text):
        self.original_text = text  # Store original text
        self.text = text
    
    def extract_links(self):
        # Updated pattern to handle malformed URLs and avoid catching parts of email addresses as URLs
        link_pattern = r'\b(?<!@)(?:https?://|ftp://|www\.)\s*[A-Za-z0-9.-]+\s*\.\s*[A-Za-z]{2,}(?:\s*\b|/)'
        # Find potential matches considering spaces
        potential_links = re.findall(link_pattern, self.text, re.IGNORECASE)

        # Clean up the potential matches by removing all spaces
        links = []
        for link in potential_links:
            cleaned_link = re.sub(r'\s+', '', link)
            links.append(cleaned_link)
            self.text = self.text.replace(link, "")  # Remove the original malformed link from text

        return links, self.text

    def extract_emails(self):
        # Updated email pattern to handle spaces and common errors in email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+[\s]*@[\s]*[A-Za-z0-9.-]+[\s]*\.[A-Za-z]{2,}\b'
        # Find potential matches considering spaces
        potential_emails = re.findall(email_pattern, self.text, re.IGNORECASE)

        # Clean up the potential matches by removing spaces around '@' and '.'
        emails = []
        for email in potential_emails:
            cleaned_email = re.sub(r'\s+', '', email)
            emails.append(cleaned_email)
            self.text = self.text.replace(email, "")  # Remove the original malformed email from text

        return emails, self.text

    def extract_phone_numbers(self):
        # Updated phone number pattern to capture formats with dots, spaces, or dashes
        phone_number_pattern = r'\+?\d[\d\s.-]{8,12}\d'
        phone_numbers = re.findall(phone_number_pattern, self.text, re.IGNORECASE)
        for phone in phone_numbers:
            phone_with_label = re.search(r'Phone\s*:\s*' + re.escape(phone), self.text, re.IGNORECASE)
            if phone_with_label:
                self.text = self.text.replace(phone_with_label.group(0), "")
            else:
                self.text = self.text.replace(phone, "")
        return phone_numbers, self.text

def re_process(results_dir, file_groups):
    for group in file_groups:
        group_dir = Path(results_dir) / group
        target_file = f"{group}_clsf.json"
        file_path = group_dir / target_file
        
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            processed_data = {}
            for category, entries in data.items():
                processed_data[category] = {
                    "extracted_data": []
                }
                for entry in entries:  # entries are expected to be dictionaries with 'text' and 'score'
                    text = entry['text']
                    score = entry.get('score', None)  # Preserve the classification score
                    extractor = TextExtractor(text)
                    links, updated_text = extractor.extract_links()
                    emails, updated_text = extractor.extract_emails()
                    phone_numbers, updated_text = extractor.extract_phone_numbers()
                    extracted_info = {
                        "original_text": extractor.original_text,
                        "cleaned_text": updated_text.strip(),
                        "links": links,
                        "emails": emails,
                        "phone_numbers": phone_numbers,
                        "score": score
                    }
                    processed_data[category]["extracted_data"].append(extracted_info)
            
            # Overwrite the original file with updated data
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(processed_data, f, indent=4)

            print(f"Updated and saved extracted data to {file_path}")

# Example usage
results_directory = "path_to_results_directory"
file_groups = ["group1", "group2", "group3"]
re_process(results_directory, file_groups)
