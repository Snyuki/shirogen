import requests
from bs4 import BeautifulSoup

def scrape_adjective_declensions(word):
    url = f"https://en.wiktionary.org/wiki/{word}#German"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    declensions = {}

    # Find all adjective inflection tables
    for section in soup.find_all("div", class_="NavFrame"):
        header = section.find("div", class_="NavHead")
        table = section.find("table", class_="inflection-table")
        
        if header and table:
            label = header.get_text(strip=True)
            declensions[label] = []

            # Parse each row of the table
            for row in table.find_all("tr"):
                row_data = []
                for cell in row.find_all(["th", "td"]):
                    text = cell.get_text(" ", strip=True)
                    row_data.append(text)
                if row_data:
                    declensions[label].append(row_data)
    
    return declensions

def get_declension_tables(word):
    url = f"https://en.wiktionary.org/wiki/{word}#German"
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    declensions = {
        "base_form": {},
        "comparative": {},
        "superlative": {}
    }

    table_labels = {
        'starke': 'unbestimmt',
        'schwache': 'bestimmt',
        'gemischte': 'mixed'
    }

    nav_heads = soup.find_all("div", class_="NavHead")

    for nav_head in nav_heads:
        title = nav_head.get_text(strip=True).lower()
        if "comparative" in title:
            form_key = "comparative"
        elif "superlative" in title:
            form_key = "superlative"
        else:
            form_key = "base_form"

        nav_content = nav_head.find_next_sibling("div", class_="NavContent")
        tables = nav_content.find_all("table", class_="inflection-table")

        for table in tables:
            caption = table.find_all("td", class_="latn")
            # print(table)
            print(caption)
            if not caption:
                continue
            caption_text = caption.get_text(strip=True).lower()
            decl_type = None

            for k, v in table_labels.items():
                if k in caption_text:
                    decl_type = v
                    break
            if not decl_type:
                continue

            rows = table.find_all("tr")
            case_names = ["Nominativ", "Akkusativ", "Dativ", "Genitiv"]

            for row in rows:
                headers = row.find_all("th")
                cells = row.find_all("td")

                if headers and headers[0].get_text(strip=True) in case_names:
                    case = headers[0].get_text(strip=True)
                    values = [c.get_text(strip=True).replace('\xa0', ' ') for c in cells]

                    if len(values) != 4:
                        continue  # skip malformed rows

                    genders = ["maskuline", "feminine", "neutrum", "plural"]
                    for i, gender in enumerate(genders):
                        declensions[form_key].setdefault(case, {}).setdefault(gender, {})
                        declensions[form_key][case][gender][decl_type] = values[i]

    return declensions, url

def build_entry(word, id_num):
    declensions, url = get_declension_tables(word)
    entry = {
        str(id_num): {
            "word": word,
            "url": url,
            "word_type": "Adjektiv",
            "genus": "",
            "article": "",
            "only_plural": "0",
            "declinations": declensions
        }
    }
    return entry

declension_data = scrape_adjective_declensions("wichtig")


entry = build_entry("wichtig", 1)
print(entry)

# # Display results
# for form_type, table in declension_data.items():
#     print(f"\n{form_type}")
#     for row in table:
#         print("\t".join(row))
