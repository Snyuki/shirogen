import json

with open("shirogen/fetch-words/res/german_verbs.json", "r", encoding="utf-8") as f:
    data = json.load(f)


new_data = {}
index = 0

for item in data.values():
    if item["tenses"] is not None:
        new_data[str(index)] = {
            "word": item["word"],
            "tenses": {"past": item["tenses"]}
        }
        index += 1


with open("shirogen/fetch-words/res/german_verbs.json", "w", encoding="utf-8") as f:
    json.dump(new_data, f, indent=2, ensure_ascii=False)