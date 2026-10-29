import urllib.request
import re
from urllib.parse import urljoin
from html.parser import HTMLParser
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return ""

print("Fetching Bhagwati Chemicals...")
bhagwati_home = fetch("https://www.bhagwatichemicals.co.in/")
print(f"Bhagwati home length: {len(bhagwati_home)}")
with open("bhagwati_home.html", "w", encoding="utf-8") as f:
    f.write(bhagwati_home)

print("Fetching KCIL Products...")
kcil_prod = fetch("https://www.kcil.co.in/our-products")
print(f"KCIL products length: {len(kcil_prod)}")
with open("kcil_products.html", "w", encoding="utf-8") as f:
    f.write(kcil_prod)

# Find links in Bhagwati Chemicals
links_bhagwati = re.findall(r'href=["\'](.*?)["\']', bhagwati_home, re.IGNORECASE)
found_b = set()
for l in links_bhagwati:
    full = urljoin("https://www.bhagwatichemicals.co.in/", l)
    if "bhagwatichemicals.co.in" in full:
        found_b.add(full)
print("Bhagwati internal links:", len(found_b))
for b in sorted(found_b):
    print(" B:", b)

# Find links in KCIL products
links_kcil = re.findall(r'href=["\'](.*?)["\']', kcil_prod, re.IGNORECASE)
found_k = set()
for l in links_kcil:
    full = urljoin("https://www.kcil.co.in/", l)
    if "kcil.co.in" in full:
        found_k.add(full)
print("KCIL products links:", len(found_k))
for k in sorted(found_k):
    print(" K:", k)
