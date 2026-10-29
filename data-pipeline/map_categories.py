import glob
import re
import json

category_map = {
    "acidchlorides": "Acid Chlorides",
    "ammonolysis-process": "Ammonolysis Process",
    "chlorination-process": "Chlorination Process",
    "electrolysisprocess": "Chlor-Alkali & Electrolysis",
    "ethoxilation-process": "Ethoxylation Process",
    "hydrogenationprocess": "Hydrogenation Process",
    "methoxylation-process": "Methoxylation Process",
    "nitration-process": "Nitration Process",
    "oxidationneutralizationprocess": "Oxidation & Neutralization",
    "sulphonation-process": "Sulphonation Process",
    "sulphuric-bulk-divison": "Sulphuric & Bulk Chemical Division"
}

product_to_category = {}

for slug, cat_name in category_map.items():
    fpath = f"kcil_{slug}.html"
    try:
        with open(fpath, "r", encoding="utf-8") as f:
            html = f.read()
        links = re.findall(r'href=["\'](?:/product-details/|https://www.kcil.co.in/product-details/|product-details/)([^"\']+)["\']', html)
        for l in links:
            clean_slug = l.strip().rstrip("/")
            if clean_slug not in product_to_category:
                product_to_category[clean_slug] = []
            if cat_name not in product_to_category[clean_slug]:
                product_to_category[clean_slug].append(cat_name)
    except Exception as e:
        print(f"Error {fpath}: {e}")

print(f"Mapped {len(product_to_category)} product slugs to categories.")
for k, v in list(product_to_category.items())[:10]:
    print(f" {k} -> {v}")
