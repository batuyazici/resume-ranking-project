import json
import re
from pathlib import Path

class TextExtractor:
    def __init__(self, text):
        self.text = text
    
    def extract_links(self):
        link_pattern = r"\b(?:https?://|www\.)\S+\b"
        links = re.findall(link_pattern, self.text)
        for link in links:
            self.text = self.text.replace(link, "")  # Remove the link from the text
        return links, self.text

    def extract_emails(self):
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
        emails = re.findall(email_pattern, self.text)
        for email in emails:
            self.text = self.text.replace(email, "")  # Remove the email from the text
        return emails, self.text

    def extract_phone_numbers(self):
        phone_number_pattern = r"\+?\d[\d -]{8,12}\d"
        phone_numbers = re.findall(phone_number_pattern, self.text)
        for phone in phone_numbers:
            self.text = self.text.replace(phone, "")  # Remove the phone number from the text
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
            for category, texts in data.items():
                processed_data[category] = {
                    "extracted_data": []
                }
                for text in texts:
                    extractor = TextExtractor(text)
                    links, updated_text = extractor.extract_links()
                    emails, updated_text = extractor.extract_emails()
                    phone_numbers, updated_text = extractor.extract_phone_numbers()
                    extracted_info = {
                        "cleaned_text": updated_text.strip(),  # Clean and strip the updated text
                        "links": links,
                        "emails": emails,
                        "phone_numbers": phone_numbers
                    }
                    processed_data[category]["extracted_data"].append(extracted_info)
            
            # Overwrite the original file with updated data
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(processed_data, f, indent=4)

            print(f"Updated and saved extracted data to {file_path}")

# Example usage

