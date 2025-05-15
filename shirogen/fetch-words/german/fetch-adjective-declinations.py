import json
import time
import requests
from bs4 import BeautifulSoup


def parse_declension_table(soup):
    declensions = {"base_form": {}, "comparative": {}, "superlative": {}}
    tables = soup.find_all("table", class_="inflection-table")

    form_labels = ["base_form", "comparative", "superlative"]
    case_labels = ["Nominativ", "Akkusativ", "Dativ", "Genitiv"]
    gender_labels = ["maskuline", "feminine", "neutrum", "plural"]
    article_labels = ["bestimmt", "unbestimmt"]

    for idx, table in enumerate(tables[:3]):  # One table per degree
        rows = table.find_all("tr")[1:]  # Skip header
        degree = form_labels[idx]
        declensions[degree] = {}
        print(degree)
        for case_idx, case_row in enumerate(rows[:4]):  # First 4 rows = cases
            case = case_labels[case_idx]
            print(case)
            declensions[degree][case] = {}
            cols = case_row.find_all("td")
            print(case_row)
            for g_idx, gender in enumerate(gender_labels):
                print(cols)
                declensions[degree][case][gender] = {
                    "bestimmt": cols[g_idx * 2].text.strip(),
                    "unbestimmt": cols[g_idx * 2 + 1].text.strip()
                }
    return declensions

def fallback_verbformen_scraper():
    base_url = "https://www.verbformen.de/deklination/adjektive/singular/allerscho3nsten"

    response = requests.get(base_url)

    if response.status_code == 200:
        # Parse the page content with BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        declination_tables = soup.find_all('div', class_='vTbl')

        for table in declination_tables:
            # Extract gender header (e.g., Maskulin, Feminin, etc.)
            gender_header = table.find_previous('h2').text.strip()

            # Extract the declension cases and their forms
            rows = table.find_all('tr')
            for row in rows:
                case = row.find('th').text.strip()  # Case name
                declination_form = row.find_all('td')[1].text.strip()  # Adjective declension form

                # Print the extracted information
                print(f"Gender: {gender_header}, Case: {case}, Form: {declination_form}")

    else:
        print(f"Failed to retrieve page. Status code: {response.status_code}")

def update_adjective_data(filepath_in, filepath_out):
    with open(filepath_in, 'r') as file:
        existing_data = json.load(file)

    updated_data = existing_data.copy()
    for key, entry in existing_data.items():
        word = entry["word"]
       
        url = f"https://en.wiktionary.org/wiki/{word}#German"
        response = requests.get(url)
        
        if response.status_code != 200:
            print(f"Failed to fetch {word}: {response.status_code}")
            continue

        soup = BeautifulSoup(response.content, 'html.parser')
        declensions = parse_declension_table(soup)
        print(declensions)
        updated_data[key]["declensions"] = declensions

        # Sleep a little to avoid overloading the server
        time.sleep(1)

    # Save the enriched data back to the output file
    with open(filepath_out, "w", encoding="utf-8") as f:
        json.dump(updated_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Declensions added. Output saved to {filepath_out}")
    return updated_data


    

if __name__ == "__main__":
    update_adjective_data("shirogen/src/res/b1-adjectives.json", "shirogen/src/res/adjectives_with_declensions.json")
