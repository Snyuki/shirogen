import requests
from bs4 import BeautifulSoup
import json
import time

base_url = "https://www.verbformen.de"

genders = ["maskulin", "feminin", "neutral", "plural"]
cases = ["Nominativ", "Akkusativ", "Dativ", "Genitiv"]
types = ["no_article", "bestimmt", "unbestimmt"]
forms = ["base_form", "comparative", "superlative"]

case_map = {
    "Nom.": "Nominativ",
    "Akk.": "Akkusativ",
    "Dat.": "Dativ",
    "Gen.": "Genitiv"
}

class Adjective:
    def __init__(self, base_form):
        self.word = base_form
        # Fetch the page content
        self.adjective_url = f"/deklination/adjektive/{self.word}.htm" 
        response = requests.get(base_url + self.adjective_url)
        self.base_soup = BeautifulSoup(response.text, 'html.parser')

        # Find the base adjective, its comparative and superlative forms
        adjective_section = self.base_soup.find('h1', class_="rClear").text.strip()
        self.adjective_base = adjective_section.split(' ')[-1]

        # Find links to the comparative and superlative forms
        redirects = [a['href'] for a in self.base_soup.find_all('a', href=True, class_='rKnpf rNoSelect rLinks') if a.has_attr('href')]
        self.comparative_link = redirects[1]
        self.superlative_link = redirects[2]

        # Create output object
        self.declensions = {"base_form": {}, "comparative": {}, "superlative": {}}


    def fetch_form(self, soup, form):
        """
        Call this function for each form
        """
        declension_section = soup.find_all('div', class_='vTbl')
        current_type = 0
        for section in declension_section:
            # print(section)
            # Extract table headers and data
            header = section.find('h2')
            if not header:
                header = section.find('h3')      # From the weak declension on the header is in h3

            gender = header.text.strip()
            if gender.lower() == "singular":
                break               # From here on we dont need the forms
            if gender.lower() not in genders:
                continue
            table_rows = section.find_all('tr')

            # print(types[current_type])
            # print(f"Gender: {gender}")
            for row in table_rows:
                case = row.find('th').text.strip()
                declension = ' '.join([elem.text.strip() for elem in row.find_all('td')])
                # print(f"{case}: {declension}")
                case_mapped = case_map.get(case)
                if case_mapped not in self.declensions[form]:
                    self.declensions[form][case_mapped] = {}
                if gender not in self.declensions[form][case_mapped]:
                    self.declensions[form][case_mapped][gender] = {}
                self.declensions[form][case_mapped][gender][types[current_type]] = declension
            # print("-" * 20)

            if gender.lower() == genders[3]:
                current_type += 1


    def fetch_one_adjective_full(self):
        # Load soups
        response = requests.get(base_url + self.comparative_link)
        comparative_soup = BeautifulSoup(response.text, 'html.parser')
        response = requests.get(base_url + self.superlative_link)
        superlative_soup = BeautifulSoup(response.text, 'html.parser')
        
        self.fetch_form(self.base_soup, forms[0])
        if comparative_soup : self.fetch_form(comparative_soup, forms[1])
        if superlative_soup : self.fetch_form(superlative_soup, forms[2])

        return self.declensions




def update_adjective_data(filepath_in, filepath_out):
    with open(filepath_in, 'r') as file:
        existing_data = json.load(file)

    updated_data = existing_data.copy()
    for key, entry in existing_data.items():
        word = entry["word"]
        print(word)
        adjective = Adjective(word)
        declensions = adjective.fetch_one_adjective_full()
        # print(declensions)
        updated_data[key]["declensions"] = declensions

        # Sleep a little to avoid overloading the server
        time.sleep(1)

    # Save the enriched data back to the output file
    with open(filepath_out, "w", encoding="utf-8") as f:
        json.dump(updated_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Declensions added. Output saved to {filepath_out}")



if __name__ == "__main__":
    update_adjective_data("shirogen/src/res/b1-adjectives.json", "shirogen/src/res/adjectives_with_declensions.json")