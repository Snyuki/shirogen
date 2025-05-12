import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

def setup_driver():
    options = Options()
    options.headless = True
    options.add_argument("--disable-gpu")
    
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)



def get_declension_table(adjective, driver):
    url = f"https://www.canoonet.eu/services/Controller?MenuId=InflectionTables&Type=Adjective&Lang=de&Input={adjective}"
    driver.get(url)
    time.sleep(2)  # Wait for JS-rendered content

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    tables = soup.find_all("table", class_="flectionTable")
    decl_data = {}

    for table in tables:
        heading = table.find_previous("h2")
        if not heading or "declension" not in heading.text.lower():
            continue

        rows = table.find_all("tr")
        current_case = None

        for row in rows:
            headers = row.find_all("th")
            cells = row.find_all("td")

            if headers and not cells:
                current_case = headers[0].text.strip()
                decl_data[current_case] = {}
            elif cells and current_case:
                forms = [cell.text.strip() for cell in cells]
                if len(forms) >= 8:
                    decl_data[current_case] = {
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
    return {"base_form": decl_data} if decl_data else None

def enrich_adjectives(filepath_in, filepath_out):
    with open(filepath_in, "r", encoding="utf-8") as f:
        data = json.load(f)

    driver = setup_driver()

    for key, entry in data.items():
        adjective = entry["word"]
        print(f"Processing '{adjective}'")
        declensions = get_declension_table(adjective, driver)
        entry["declinations"] = declensions if declensions else {}

    driver.quit()

    with open(filepath_out, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Declensions added. Output saved to {filepath_out}")

def test_single_adjective(adjective):
    driver = setup_driver()
    url = f"https://www.canoonet.eu/services/Controller?MenuId=InflectionTables&Type=Adjective&Lang=de&Input={adjective}"
    driver.get(url)
    time.sleep(3)
    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()

    for table in soup.find_all("table"):
        print(table.prettify())



if __name__ == "__main__":
    # enrich_adjectives("shirogen/src/res/b1-adjectives.json", "shirogen/src/res/adjectives_with_declensions.json")
    test_single_adjective("berufstätig")
