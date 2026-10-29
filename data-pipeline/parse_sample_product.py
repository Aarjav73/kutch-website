import re

with open("kcil_sample_odcb.html", "r", encoding="utf-8") as f:
    html = f.read()

# Remove scripts/styles
clean = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL)
clean = re.sub(r'<style.*?</style>', '', clean, flags=re.DOTALL)

# Let's find table or product details container
details_match = re.search(r'(<div class="[^"]*product-detail[^"]*".*?)(<footer|<div class="footer")', clean, re.DOTALL | re.IGNORECASE)
if details_match:
    print("Found product detail section:")
    text = re.sub(r'<[^>]+>', '\n', details_match.group(1))
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    print('\n'.join(lines[:60]))
else:
    print("No direct match, let's search for table or content:")
    tables = re.findall(r'<table.*?</table>', clean, re.DOTALL | re.IGNORECASE)
    print(f"Tables found: {len(tables)}")
    if tables:
        print("First table:\n", re.sub(r'<[^>]+>', ' | ', tables[0])[:1000])
    # Search for headings
    h = re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>', clean)
    print("Headings:", h)
