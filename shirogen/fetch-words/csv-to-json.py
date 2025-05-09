import csv
import requests
import json

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

word_list = read_csv(CSV_PATH)
nouns, verbs, adjectives, others = create_json(word_list)

save_json(f"{OUTPUT_BASE_PATH}b1-nouns.json", nouns)
save_json(f"{OUTPUT_BASE_PATH}b1-verbs.json", verbs)
save_json(f"{OUTPUT_BASE_PATH}b1-adjectives.json", adjectives)
save_json(f"{OUTPUT_BASE_PATH}b1-others.json", others)
