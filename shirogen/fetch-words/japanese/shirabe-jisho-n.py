import requests
import time

BASE_URL = "https://jisho.org/api/v1/search/words"
N5_QUERY = "#jlpt-n5"
N4_QUERY = "#jlpt-n4"
N3_QUERY = "#jlpt-n3"

all_results = []
page = 1
done = 0

while True:
    params = {
        "keyword": N4_QUERY,
        "page": page
    }
    response = requests.get(BASE_URL, params=params)
    if response.status_code != 200:
        print(f"Error: HTTP {response.status_code} on page {page}")
        break

    data = response.json()
    results = data.get("data", [])

    if not results:
        break

    all_results.extend(results)
    done += len(results)
    print(f"Fetched page {page} with {len(results)} results. ({done})")
    page += 1

    # Be kind to the API
    time.sleep(5)

print(f"Total entries fetched: {len(all_results)}")

import json
with open("jlpt_n4_words.json", "w", encoding="utf-8") as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)
