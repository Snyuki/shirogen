import requests
from bs4 import BeautifulSoup
import json
import os

BASE_URL = "https://en.wiktionary.org"
FEMALE_URL = f"{BASE_URL}/wiki/Category:German_feminine_nouns"
MALE_URL = f"{BASE_URL}/wiki/Category:German_masculine_nouns"
NEUTRAL_URL = f"{BASE_URL}/wiki/Category:German_neuter_nouns"


def get_nouns(start_url, article):
    nouns = {}
    counter = 0
    url = start_url

    while url:
        res = requests.get(url)
        soup = BeautifulSoup(res.content, "html.parser")

        for ul in soup.select("ul"):
            for li in ul.find_all("li"):
                a = li.find('a')
                if a:
                    title = a.get("title", "").strip()
                    if not title:
                        continue
                    text = a.text.strip()
                    if title == text:
                        nouns[str(counter)] = {"word": text, "article": article}
                        counter += 1

        # Go to next page
        next_page = soup.find("a", string="next page")
        print(next_page)
        if next_page:
            url = BASE_URL + next_page['href']
        else:
            url = None

    return nouns


# female_nouns_json = get_nouns(FEMALE_URL, "die")
male_nouns_json = get_nouns(MALE_URL, "der")
neutral_nouns_json = get_nouns(NEUTRAL_URL, "das")

output_dir_path = "fetch-words/res"
os.makedirs(output_dir_path, exist_ok=True)
# with open(f"{output_dir_path}/german_female_nouns.json", 'w', encoding="utf-8") as f:
#     json.dump(female_nouns_json, f, ensure_ascii=False, indent=2)
with open(f"{output_dir_path}/german_male_nouns.json", 'w', encoding="utf-8") as f:
    json.dump(male_nouns_json, f, ensure_ascii=False, indent=2)
with open(f"{output_dir_path}/german_neutral_nouns.json", 'w', encoding="utf-8") as f:
    json.dump(neutral_nouns_json, f, ensure_ascii=False, indent=2)