import pdfplumber
import csv
import re

PDF_PATH = "shirogen/fetch-words/src/Goethe-Zertifikat_B1_Wortliste.pdf"
OUTPUT_PATH = "shirogen/src/res/german_b1_words.csv"

def extract_b1_words(pdf_path):
    words = set()
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            if page.page_number < 8:
                continue
            text = page.extract_text()
            if text:
                lines = text.split('\n')
                for line in lines:
                    # Skip headers or irrelevant lines
                    if line.strip() and not line.startswith(('Seite', 'Goethe-Institut')):
                        # Split line into words based on common delimiters
                        for word in line.split():
                            # Basic cleaning: remove punctuation and digits
                            clean_word = ''.join(filter(str.isalpha, word))
                            if clean_word:
                                words.add(clean_word)
    return words

b1_words = extract_b1_words(PDF_PATH)
with open(OUTPUT_PATH, "w", newline='', encoding="utf-8") as f:
    writer = csv.writer(f)
    for entry in b1_words:
        writer.writerow([entry.strip()])

print(f"Extracted {len(b1_words)} entries.")