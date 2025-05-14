import requests
from bs4 import BeautifulSoup
import json
import time
import threading
import datetime

base_url = "https://www.verbformen.de"

genders = ["maskulin", "feminin", "neutral", "plural"]
cases = ["Nominativ", "Akkusativ", "Dativ", "Genitiv"]
types = ["no_article", "bestimmt", "unbestimmt"]
forms = ["base_form", "comparative", "superlative"]
forms_german = ["Positiv", "Komparativ", "Superlativ"]

case_map = {
    "Nom.": "Nominativ",
    "Akk.": "Akkusativ",
    "Dat.": "Dativ",
    "Gen.": "Genitiv"
}

class FetchError(Exception):
    def __init__(self, message):
        super().__init__(message)


class Adjective:
    def __init__(self, base_form):
        self.word = base_form


    def init_fetching(self, adj_base_url="/deklination/adjektive/"):
        # Fetch the page content
        if "deklination" not in adj_base_url:
            self.adjective_url = f"{adj_base_url}{self.word}"
        else:
            self.adjective_url = f"{adj_base_url}{self.word}.htm" 

        response = None
        try:
            response = requests.get(base_url + self.adjective_url)
        except requests.exceptions.ConnectionError:
            raise FetchError("Remote Closed")
        self.base_soup = BeautifulSoup(response.text, 'html.parser')

        # Find the base adjective, its comparative and superlative forms
        try:
            adjective_section = self.base_soup.find('h1', class_="rClear").text.strip()
            self.adjective_base = adjective_section.split(' ')[-1]
        except AttributeError:
            raise FetchError("Site has changed")

        # Find links to the comparative and superlative forms
        redirects_html = self.base_soup.find_all('a', href=True, class_='rKnpf rNoSelect rLinks')
        self.comparative_link = ""
        self.superlative_link = ""
        has_positiv = False
        for a_tag in redirects_html:
            span = a_tag.find("span", title=True)
            if span:
                title = span.get("title")
                if title == forms_german[0]:
                    has_positiv = True
                elif title == forms_german[1]:
                    self.comparative_link = a_tag["href"]
                elif title == forms_german[2]:
                    self.superlative_link = a_tag["href"]

        if not has_positiv:
            self.base_soup = ''

        # Debug print
        print(f"Positiv: {self.base_soup != ""} | Comparative: {self.comparative_link} | Superlative: {self.superlative_link}")

        # Create output object
        self.declensions = {"base_form": {}, "comparative": {}, "superlative": {}}


    def fetch_form(self, soup, form):
        """
        Call this function for each form
        """
        if not soup:
            return
        
        declension_section = soup.find_all('div', class_='vTbl')
        current_type = 0
        for section in declension_section:
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

            for row in table_rows:
                case = row.find('th').text.strip()
                declension = ' '.join([elem.text.strip() for elem in row.find_all('td')])
                case_mapped = case_map.get(case)
                if case_mapped not in self.declensions[form]:
                    self.declensions[form][case_mapped] = {}
                if gender not in self.declensions[form][case_mapped]:
                    self.declensions[form][case_mapped][gender] = {}
                self.declensions[form][case_mapped][gender][types[current_type]] = declension

            if gender.lower() == genders[3]:
                current_type += 1


    def fetch_one_adjective_full(self, adj_base_url=''):
        # Load soups
        if adj_base_url:
            self.init_fetching(adj_base_url)
        else:
            self.init_fetching()
        print(self.comparative_link, end=" | ")
        print(self.superlative_link)
        comparative_soup = ""
        superlative_soup = ""
        if self.comparative_link:
            response = requests.get(base_url + self.comparative_link)
            comparative_soup = BeautifulSoup(response.text, 'html.parser')

        if self.superlative_link:
            response = requests.get(base_url + self.superlative_link)
            superlative_soup = BeautifulSoup(response.text, 'html.parser')
        
        self.fetch_form(self.base_soup, forms[0])
        if comparative_soup : self.fetch_form(comparative_soup, forms[1])
        if superlative_soup : self.fetch_form(superlative_soup, forms[2])

        return self.declensions


def start_progress_monitor(total_tasks, completed_counter, timer_break):
    start_time = time.time()

    def monitor(timer_break):
        while completed_counter[0] < total_tasks:
            elapsed = time.time() - start_time
            avg_time = elapsed / max(1, completed_counter[0])
            remaining = (total_tasks - completed_counter[0]) * avg_time
            eta = datetime.timedelta(seconds=int(remaining))

            if not timer_break[0]: print(f"[Progress] {completed_counter[0]}/{total_tasks} verbs processed. ETA: {eta}")
            time.sleep(5)

    thread = threading.Thread(target=monitor, args=(timer_break,), daemon=True)
    thread.start()


def update_adjective_data(filepath_in, filepath_out):
    with open(filepath_in, 'r') as file:
        existing_data = json.load(file)

    
    completed = [0]
    timer_break = [False]
    start_progress_monitor(len(existing_data.items()), completed, timer_break)

    updated_data = existing_data.copy()
    for key, entry in existing_data.items():
        word = entry["word"]
        print(word, end=": ")
        adjective = Adjective(word)
        try:
            declensions = adjective.fetch_one_adjective_full()
        except FetchError:
            timer_break[0] = True
            input("Waiting...")
            timer_break[0] = False
            declensions = adjective.fetch_one_adjective_full()
        updated_data[key]["declensions"] = declensions
        completed[0] += 1
 
        # Sleep a little to avoid overloading the server
        time.sleep(2)

    # Save the enriched data back to the output file
    with open(filepath_out, "w", encoding="utf-8") as f:
        json.dump(updated_data, f, indent=2, ensure_ascii=False)

    print(f"✅ Declensions added. Output saved to {filepath_out}")


def update_specific_adjective_data(filepath_in, filepath_out, adjective):
    with open(filepath_in, 'r') as file:
        existing_data = json.load(file)

    updated_data = existing_data.copy()
    for key, entry in existing_data.items():
        word = entry["word"]
        if word != adjective:
            continue
        print(word, end=' found:')
        adjective = Adjective(word)
        try:
            declensions = adjective.fetch_one_adjective_full("/?w=")
        except FetchError:
            input("Waiting...")
            declensions = adjective.fetch_one_adjective_full("/?w=")
        updated_data[key]["declensions"] = declensions
        break

    # Save the enriched data back to the output file
    with open(filepath_out, "w", encoding="utf-8") as f:
        json.dump(updated_data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    # update_adjective_data("shirogen/src/res/b1-adjectives-not-enriched.json", "shirogen/src/res/b1-adjectives.json")
    update_specific_adjective_data("shirogen/src/res/b1-adjectives.json", "shirogen/src/res/b1-adjectives.json", "mild")
    update_specific_adjective_data("shirogen/src/res/b1-adjectives.json", "shirogen/src/res/b1-adjectives.json", "mittlere")