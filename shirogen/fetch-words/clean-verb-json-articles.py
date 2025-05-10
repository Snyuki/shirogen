# This cleans a json at all the verb tenses of the article in the value. 
# The keys stay the same. 
# Meaning "sie/Sie": "sie würden vermieden haben" gets "sie/Sie": "würden vermieden haben"

import json
import re

pronoun_prefix_re = re.compile(
    r"^(ich|du|er/sie/es|er|sie|es|wir|ihr|Sie|sie/Sie)\s+", re.UNICODE
)
optional_ending_re = re.compile(r"\((e|s)\)", re.UNICODE)

def clean_verb_tenses(data):
    if isinstance(data, dict):
        cleaned = {}
        for key, value in data.items():
            # Only clean values if keys are all pronouns
            if isinstance(value, dict) and all(isinstance(k, str) and re.match(r"^(ich|du|er/sie/es|er|sie|es|wir|ihr|Sie|sie/Sie)$", k) for k in value.keys()):
                cleaned[key] = {k: pronoun_prefix_re.sub('', v) for k, v in value.items()}
                cleaned[key] = {k: optional_ending_re.sub(lambda match: match.group(1), v) for k, v in cleaned[key].items()}
            else:
                cleaned[key] = clean_verb_tenses(value)
        return cleaned
    elif isinstance(data, list):
        return data  # Leave lists like imperatives and participles unchanged
    else:
        return data

with open('shirogen/src/res/b1-verbs-not-cleaned.json', 'r', encoding='utf-8') as f:
    json_data = json.load(f)

cleaned_data = clean_verb_tenses(json_data)

with open('shirogen/src/res/b1-verbs-cleaned.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, ensure_ascii=False, indent=2)