import requests
from bs4 import BeautifulSoup
import json
import os

BASE_URL = "https://en.wiktionary.org"
FEMALE_URL = f"{BASE_URL}/wiki/Category:German_feminine_nouns"
MALE_URL = f"{BASE_URL}/wiki/Category:German_masculine_nouns"
NEUTRAL_URL = f"{BASE_URL}/wiki/Category:German_neuter_nouns"
VERBS_URL = f"{BASE_URL}/wiki/Category:German_verbs"

DICT_BASE_URL = "https://de.pons.com/verbtabellen/deutsch/"



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

def get_conjugations_for_verb(verb_url, tenses):
    res = requests.get(DICT_BASE_URL + verb_url.split('/')[-1].strip())
    soup = BeautifulSoup(res.content, "html.parser")

    # Find the "Präteritum" section (inside an h3 tag)
    praeteritum_section = soup.find("h3", string="Präteritum")
    if not praeteritum_section:
        return None

    # The table is a sibling of the h3 element
    table = praeteritum_section.find_next("table")
    if not table:
        return None

    # Find the row where the first cell (td) contains "ich"
    for row in table.find_all("tr"):
        cells = row.find_all("td")
        if cells and "ich" in cells[0].text.strip():
            # The conjugated verb is in the second cell
             # Get conjugated verb + possible separable prefix
            verb_form = cells[1].text.strip()
            prefix = cells[2].text.strip() if len(cells) > 2 else ""
            return f"{verb_form} {prefix}".strip()

    return None


def get_verbs(start_url, tenses):
    verbs = {}
    counter = 0
    url = start_url

    while url:
        res = requests.get(url)
        soup = BeautifulSoup(res.content, "html.parser")

        # with open("test-soup-verbs.html", "w") as s:
        #     for elem in soup.contents:
        #         s.write(str(elem))

        for ul in soup.select("div.mw-category-group ul"):
            for li in ul.find_all("li"):
                a = li.find("a")
                if a:
                    title = a.get("title", "").strip()
                    if not title:
                        continue
                    text = a.text.strip()
                    if title == text:
                        conjugations = get_conjugations_for_verb(a.get("href"), tenses)
                        verbs[str(counter)] = {
                            "word": text,
                            "tenses": conjugations
                        }
                        counter += 1

        # Go to next page
        next_page = soup.find("a", string="next page")
        print(next_page)
        if next_page:
            url = BASE_URL + next_page['href']
        else:
            url = None

    return verbs


# female_nouns_json = get_nouns(FEMALE_URL, "die")
# male_nouns_json = get_nouns(MALE_URL, "der")
# neutral_nouns_json = get_nouns(NEUTRAL_URL, "das")
verbs_json = get_verbs(VERBS_URL, ["past"])

output_dir_path = "fetch-words/res"
os.makedirs(output_dir_path, exist_ok=True)
# with open(f"{output_dir_path}/german_female_nouns.json", 'w', encoding="utf-8") as f:
#     json.dump(female_nouns_json, f, ensure_ascii=False, indent=2)
# with open(f"{output_dir_path}/german_male_nouns.json", 'w', encoding="utf-8") as f:
#     json.dump(male_nouns_json, f, ensure_ascii=False, indent=2)
# with open(f"{output_dir_path}/german_neutral_nouns.json", 'w', encoding="utf-8") as f:
#     json.dump(neutral_nouns_json, f, ensure_ascii=False, indent=2)
with open(f"{output_dir_path}/german_verbs.json", 'w', encoding="utf-8") as f:
    json.dump(verbs_json, f, ensure_ascii=False, indent=2)
