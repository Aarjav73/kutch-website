import json

with open("kcil_scraped_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

print(f"Loaded {len(products)} products.")

# Let's inspect 10 random products with their parsed fields
for p in products[10:20]:
    print(f"\nProduct: {p['title']} ({p['slug']})")
    print(f"  Category: {p['category']}")
    for i, it in enumerate(p.get("items", [])):
        print(f"  Item {i+1}:")
        for k, v in it.items():
            print(f"    {k}: {v[:80] if len(v) > 80 else v}")
