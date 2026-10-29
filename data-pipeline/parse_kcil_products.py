import glob
import re
import json

products_by_category = {}

for fpath in glob.glob("kcil_*.html"):
    if fpath in ["kcil_home.html", "kcil_products_page.html"]:
        continue
    cat_slug = fpath.replace("kcil_", "").replace(".html", "")
    with open(fpath, "r", encoding="utf-8") as f:
        html = f.read()

    # Look for product titles, links, or tables
    # Let's inspect headings, cards, or table rows
    print(f"\n--- Category: {cat_slug} (len {len(html)}) ---")
    
    # Try finding product links like /product-detail or product names
    # Let's search for typical KCIL product markups
    prod_titles = re.findall(r'<h[2-6][^>]*>(.*?)</h[2-6]>', html, re.IGNORECASE)
    # Filter out navigation headings
    filtered_titles = [re.sub(r'<[^>]+>', '', t).strip() for t in prod_titles if t.strip()]
    print("Found H tags:", filtered_titles[:15])

    # Also find any tables or product cards
    # Let's look for specific patterns in html
    items = re.findall(r'class="[^"]*product[^"]*"[^>]*>(.*?)</div>', html, re.DOTALL | re.IGNORECASE)
    print(f"Products class matches: {len(items)}")
