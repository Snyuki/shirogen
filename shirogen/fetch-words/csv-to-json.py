import csv
import json
import requests
from bs4 import BeautifulSoup
import time
import datetime
import threading

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


def parse_personal_forms(text):
    if text.lower().startswith("präteritum:"):
        text = text[len("präteritum:"):].strip()

    persons = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"]
    values = [part.strip() for part in text.split(",")]
    return dict(zip(persons, values)) if len(values) == 6 else {}


def scrape_verb_conjugation(verb):
    url = f"https://www.verbformen.de/konjugation/{verb}.htm"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.content, "html.parser")

    tenses = {}

    # Extract all <ul> lists after each h3
    for h3 in soup.find_all("h3"):
        section = h3.get_text(strip=True).lower()

        ul = h3.find_next_sibling("ul")
        if not ul:
            continue

        for li in ul.find_all("li"):
            label_tag = li.find("b")
            if not label_tag:
                continue
            label = label_tag.get_text(strip=True).lower()
            raw_text = li.get_text(strip=True).replace(label_tag.get_text(), "").strip(": ").strip()

            key = section + " - " + label
            if section.startswith("imperativ") or "infinitiv" in section or "partizip" in section:
                values = [v.strip() for v in raw_text.split(",")]
                tenses[key] = values
            else:
                tenses[key] = parse_personal_forms(raw_text)

    cleaned_tenses = {}
    for key, value in tenses.items():
        cleaned_key = clean_tense_key(key, verb)
        cleaned_tenses[cleaned_key] = value
    
    return cleaned_tenses


def clean_tense_key(original_key: str, verb: str) -> str:
    original_key_lower = original_key.lower()
    verb_lower = verb.lower()

    if original_key_lower.startswith(verb_lower) and 'konjugation' in original_key_lower:
        return original_key.split(' - ')[-1].strip()

    if original_key_lower.startswith('konjugation -'):
        return original_key.split(' - ')[-1].strip()

    return original_key.strip()


def start_progress_monitor(total_tasks, completed_counter):
    start_time = time.time()

    def monitor():
        while completed_counter[0] < total_tasks:
            elapsed = time.time() - start_time
            avg_time = elapsed / max(1, completed_counter[0])
            remaining = (total_tasks - completed_counter[0]) * avg_time
            eta = datetime.timedelta(seconds=int(remaining))

            print(f"[Progress] {completed_counter[0]}/{total_tasks} verbs processed. ETA: {eta}")
            time.sleep(5)

    thread = threading.Thread(target=monitor, daemon=True)
    thread.start()


def resume_scraping_tenses():
    word_list = read_csv(CSV_PATH)
    _, verbs, _, _ = create_json(word_list)

    still_needed_verbs = []
    with open(f"{OUTPUT_BASE_PATH}b1-verbs.json", "r", encoding="utf-8") as f:
        existing_verbs = json.load(f)
        for k, v in existing_verbs.items():
            print(v)
            if len(v["tenses"]) == 0:
                still_needed_verbs.append(v["word"])

    # Update verbs with tenses
    completed = [0]
    start_progress_monitor(len(still_needed_verbs), completed)

    for key, entry in verbs.items():
        if entry["word"] in still_needed_verbs:
            verb = entry["word"]
            print("scraping " + verb)
            tenses = scrape_verb_conjugation(verb)
            entry["tenses"] = tenses
            completed[0] += 1
            time.sleep(2)  # Respectful delay

    save_json(f"{OUTPUT_BASE_PATH}b1-verbs2.json", verbs)


def start_full_scraping_process():
    word_list = read_csv(CSV_PATH)
    nouns, verbs, adjectives, others = create_json(word_list)

    # Update verbs with tenses
    completed = [0]
    start_progress_monitor(len(verbs), completed)

    for key, entry in verbs.items():
        if entry["word_type"] == "Verb":
            verb = entry["word"]
            tenses = scrape_verb_conjugation(verb)
            entry["tenses"] = tenses
            completed[0] += 1
            time.sleep(1)  # Respectful delay


    save_json(f"{OUTPUT_BASE_PATH}b1-nouns.json", nouns)
    save_json(f"{OUTPUT_BASE_PATH}b1-verbs.json", verbs)
    save_json(f"{OUTPUT_BASE_PATH}b1-adjectives.json", adjectives)
    save_json(f"{OUTPUT_BASE_PATH}b1-others.json", others)


resume_scraping_tenses()