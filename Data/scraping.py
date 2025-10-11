import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import json

BASE_URL = "https://catalog.northeastern.edu/course-descriptions"
HEADERS = {"User-Agent": "OneTimeScraper/1.0"}
DELAY = 1.0  # polite delay between requests
OUTPUT_FILE = "all_courses.json"

session = requests.Session()
session.headers.update(HEADERS)

def fetch(url):
    r = session.get(url)
    r.raise_for_status()
    return r.text

def get_internal_links(base_html, base_url):
    soup = BeautifulSoup(base_html, "lxml")
    links = set()
    for a in soup.find_all("a", href=True):
        href = urljoin(base_url, a["href"])
        # only internal links
        if urlparse(href).netloc == urlparse(base_url).netloc:
            links.add(href)
    return list(links)

def extract_courses(soup):
    courses = []
    # Try to detect course blocks
    for div in soup.find_all(lambda t: t.name in ["div","section"] and t.get("class") and any("course" in c.lower() for c in t.get("class"))):
        text = div.get_text(" ", strip=True)
        # basic pattern: code + title
        m = text.split(". ", 1)
        courses.append(text)
    return courses

def scrape_page(url):
    try:
        html = fetch(url)
        soup = BeautifulSoup(html, "lxml")
        courses = extract_courses(soup)
        return {"url": url, "courses": courses if courses else None}
    except Exception as e:
        return {"url": url, "error": str(e)}

def main():
    base_html = fetch(BASE_URL)
    links = get_internal_links(base_html, BASE_URL)
    print(f"Found {len(links)} internal links, scraping each...")

    results = []
    for link in links:
        time.sleep(DELAY)
        results.append(scrape_page(link))

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Scraping done! Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
