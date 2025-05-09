import csv
import json
import requests
from bs4 import BeautifulSoup
import time

CSV_PATH = "shirogen/fetch-words/src/B1.csv"
OUTPUT_BASE_PATH = "shirogen/src/res/"


def read_csv(file_path):
    with open(file_path, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return list(reader)

def create_json(word_list):
    nouns = {}
    verbs = {}
    adjectives = {}
    others = {}

    for index, row in enumerate(word_list):
        word_data = {
            "word": row["Lemma"],
            "url": row["URL"],
            "word_type": row["Wortart"],
            "genus": row["Genus"],
            "article": row["Artikel"],
            "only_plural": row["nur_im_Plural"]
        }

        # Sort by word type
        if row["Wortart"] == "Substantiv":
            nouns[str(index)] = word_data
        elif row["Wortart"] == "Verb":
            verbs[str(index)] = word_data
        elif row["Wortart"] == "Adjektiv":
            adjectives[str(index)] = word_data
        else:
            others[str(index)] = word_data

    return nouns, verbs, adjectives, others

def save_json(file_name, data):
    with open(file_name, "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

def scrape_verb_conjugations(verb):
    url = f"https://www.verbformen.de/konjugation/{verb}.htm"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, "html.parser")
    tenses_map = {
        "Indikativ Präsens": "praesens",
        "Indikativ Präteritum": "praeteritum",
        "Indikativ Perfekt": "perfekt"
    }

    # Subjects in order
    subjects = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"]

    # Locate <h3> for "Indikativ Aktiv"
    indikativ_block = next((h3 for h3 in soup.find_all("h3") if "Indikativ Aktiv" in h3.text), None)
    tense_section = indikativ_block.find_next("ul")

    # Extract tenses
    tenses = {}

    for li in tense_section.find_all("li"):
        bold = li.find("b")
        if not bold:
            continue
        tense_name = bold.text.strip()
        tense_key = tenses_map.get(f"Indikativ {tense_name}")
        if tense_key:
            full_text = li.get_text().replace(bold.text, "").strip()
            values = [x.strip() for x in full_text.split(",")]
            if len(values) == 6:
                tenses[tense_key] = dict(zip(subjects, values))

    print(tenses)
    return tenses



word_list = read_csv(CSV_PATH)
nouns, verbs, adjectives, others = create_json(word_list)

# Update verbs with tenses
for key, entry in verbs.items():
    if entry["word_type"] == "Verb":
        verb = entry["word"]
        print(f"Scraping: {verb}")
        tenses = scrape_verb_conjugations(verb)
        entry["tenses"] = tenses
        time.sleep(1)  # Respectful delay


save_json(f"{OUTPUT_BASE_PATH}b1-nouns.json", nouns)
save_json(f"{OUTPUT_BASE_PATH}b1-verbs.json", verbs)
save_json(f"{OUTPUT_BASE_PATH}b1-adjectives.json", adjectives)
save_json(f"{OUTPUT_BASE_PATH}b1-others.json", others)
