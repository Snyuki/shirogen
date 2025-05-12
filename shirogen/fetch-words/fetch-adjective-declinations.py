import json
import time
import requests
from bs4 import BeautifulSoup

# Fetch the declension table from the Wiktionary page
def get_declension_table(adjective):
    url = f"https://de.wiktionary.org/wiki/{adjective}"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Failed to fetch {adjective}: {response.status_code}")
        return {}

    soup = BeautifulSoup(response.content, 'html.parser')
    with open("adj-test-page.html", 'w') as wr:
        wr.write(str(soup.prettify()))
    
    # Find the declension table by looking for the section "Deklination"
    declination_section = soup.find('span', {'id': 'Deklination'})

    if not declination_section:
        print(f"No declension section found for {adjective}")
        return {}

    # The declension table is next to this section
    table = declination_section.find_next('table')

    if not table:
        print(f"No declension table found for {adjective}")
        return {}

    declensions = {}
    
    # Iterate through rows in the table
    rows = table.find_all('tr')
    
    # To track current case (Nominative, Accusative, etc.)
    current_case = None
    
    for row in rows:
        cols = row.find_all('td')
        
        # If this row contains the case label (e.g., Nominative, Accusative)
        if len(cols) == 1:
            current_case = cols[0].get_text(strip=True)
            declensions[current_case] = {}
        elif len(cols) >= 8:  # We're expecting 8 columns for declension forms
            forms = [col.get_text(strip=True) for col in cols]
            
            if current_case:
                declensions[current_case] = {
                    "maskuline": {
                        "bestimmt": forms[0],
                        "unbestimmt": forms[1]
                    },
                    "feminine": {
                        "bestimmt": forms[2],
                        "unbestimmt": forms[3]
                    },
                    "neutrum": {
                        "bestimmt": forms[4],
                        "unbestimmt": forms[5]
                    },
                    "plural": {
                        "bestimmt": forms[6],
                        "unbestimmt": forms[7]
                    }
                }
    return declensions

# Main function to enrich adjectives with declensions
def enrich_adjectives(filepath_in, filepath_out):
    with open(filepath_in, "r", encoding="utf-8") as f:
        data = json.load(f)

    for key, entry in data.items():
        adjective = entry["word"]
        print(f"Processing '{adjective}'...")

        # Fetch declensions from Wiktionary
        declensions = get_declension_table(adjective)

        # Add declensions to the entry
        entry["declinations"] = declensions

        # Sleep a little to avoid overloading the server
        time.sleep(1)

    # Save the enriched data back to the output file
    with open(filepath_out, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Declensions added. Output saved to {filepath_out}")

if __name__ == "__main__":
    enrich_adjectives("shirogen/src/res/b1-adjectives.json", "shirogen/src/res/adjectives_with_declensions.json")
