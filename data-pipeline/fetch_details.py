import urllib.request
import re
import json
import ssl
from html.parser import HTMLParser

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error {url}: {e}")
        return ""

# Inspect Bhagwati Pages
b_pages = [
    "https://www.bhagwatichemicals.co.in/",
    "https://www.bhagwatichemicals.co.in/about-us",
    "https://www.bhagwatichemicals.co.in/contact-us",
    "https://www.bhagwatichemicals.co.in/products",
]
for bp in b_pages:
    html = fetch(bp)
    fname = "bhagwati_" + bp.split("/")[-1] + ".html"
    if fname == "bhagwati_.html": fname = "bhagwati_index.html"
    with open(fname, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Saved {fname}, length: {len(html)}")

# Now fetch KCIL category pages and extract all products
kcil_categories = [
    "https://www.kcil.co.in/our-products/chlorination-process",
    "https://www.kcil.co.in/our-products/nitration-process",
    "https://www.kcil.co.in/our-products/hydrogenationprocess",
    "https://www.kcil.co.in/our-products/sulphonation-process",
    "https://www.kcil.co.in/our-products/ethoxilation-process",
    "https://www.kcil.co.in/our-products/ammonolysis-process",
    "https://www.kcil.co.in/our-products/methoxylation-process",
    "https://www.kcil.co.in/our-products/acidchlorides",
    "https://www.kcil.co.in/our-products/electrolysisprocess",
    "https://www.kcil.co.in/our-products/oxidationneutralizationprocess",
    "https://www.kcil.co.in/our-products/sulphuric-bulk-divison",
]

kcil_data = {}
for cat_url in kcil_categories:
    cat_name = cat_url.split("/")[-1]
    html = fetch(cat_url)
    with open(f"kcil_{cat_name}.html", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Saved kcil_{cat_name}.html, length: {len(html)}")

print("Done fetching category pages.")
