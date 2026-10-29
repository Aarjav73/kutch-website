import glob
import re
from urllib.parse import urljoin

base_url = "https://www.kcil.co.in"
product_urls = set()

for fpath in glob.glob("kcil_*.html"):
    if fpath in ["kcil_home.html", "kcil_sample_odcb.html"]:
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        html = f.read()
    # Search for href="/product-details/..." or href="product-details/..."
    links = re.findall(r'href=["\'](/product-details/[^"\']+|https://www.kcil.co.in/product-details/[^"\']+|product-details/[^"\']+)["\']', html)
    for l in links:
        full = urljoin(base_url, l)
        product_urls.add(full)

print(f"Total unique product detail URLs found: {len(product_urls)}")
for u in sorted(product_urls):
    print(" -", u)
