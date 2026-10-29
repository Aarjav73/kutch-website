import urllib.request
import re
import json
from bs4 import BeautifulSoup
from urllib.parse import urljoin

base_url = "https://www.kcil.co.in/"
headers = {"User-Agent": "Mozilla/5.0"}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return ""

prod_html = fetch("https://www.kcil.co.in/our-products")
with open("kcil_products_page.html", "w", encoding="utf-8") as f:
    f.write(prod_html)

# Extract links from products page
links = re.findall(r'href=["\'](.*?)["\']', prod_html, re.IGNORECASE)
p_links = set()
for l in links:
    full = urljoin(base_url, l)
    if "kcil.co.in" in full and not any(full.endswith(ext) for ext in [".css", ".js", ".png", ".jpg", ".jpeg", ".pdf"]):
        p_links.add(full)

print("Product page internal links:")
for l in sorted(p_links):
    print(" -", l)
