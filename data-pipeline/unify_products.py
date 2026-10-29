import json
import re

with open("kcil_scraped_products.json", "r", encoding="utf-8") as f:
    scraped = json.load(f)

# Load category mapping
from map_categories import product_to_category, category_map

cleaned_products = []

for p in scraped:
    slug = p["slug"]
    title = p["title"].strip()
    
    # Grab the primary product specification (Item 1)
    items = p.get("items", [])
    if not items or len(items) == 0:
        continue
    
    primary = items[0]
    
    # If primary is empty or doesn't have name/formula, check next
    # Normalize keys
    norm = {}
    for k, v in primary.items():
        k_clean = k.strip().lower()
        norm[k_clean] = v.strip()
    
    name = norm.get("name of product") or norm.get("name of products") or norm.get("name") or title
    cas = norm.get("cas no.") or norm.get("cas no") or norm.get("cas") or "Industrial Grade"
    formula = norm.get("formula") or norm.get("chemical formula") or "—"
    mol_wt = norm.get("molecular weight") or norm.get("molecular wt.") or norm.get("molecular wt") or "—"
    appearance = norm.get("physical appearance") or norm.get("physical appearanc") or norm.get("appearance") or "—"
    purity = norm.get("purity") or norm.get("assay") or "Commercial Grade"
    if purity and not purity.endswith("%") and re.match(r'^\d+(\.\d+)?(-\d+(\.\d+)?)?$', purity):
        purity = purity + "%"
    packing = norm.get("packing size") or norm.get("packing") or norm.get("paking size") or "Standard Industrial Packaging / Tankers"
    application = norm.get("application") or norm.get("applications") or norm.get("uses") or "Industrial chemical manufacturing and processing"
    
    categories = product_to_category.get(slug, ["Specialty Chemicals"])
    
    # Clean up title and name
    name = re.sub(r'\s+', ' ', name).strip()
    
    cleaned_products.append({
        "id": slug,
        "name": name,
        "title": title,
        "cas": cas,
        "formula": formula,
        "molecularWeight": mol_wt,
        "appearance": appearance,
        "purity": purity,
        "packing": packing,
        "application": application,
        "categories": categories,
        "primaryCategory": categories[0] if categories else "Specialty Chemicals",
        "kcilUrl": p["url"],
        "source": "KCIL Manufacturing Complex (Panoli / Gandhidham / Dahej)"
    })

# Add Bhagwati Chemicals core proprietary textile & specialty product line
bhagwati_core = [
    {
        "id": "sodium-hydrosulphite-bhagwati",
        "name": "Sodium Hydro Sulphite (Hydros)",
        "title": "Sodium Hydro Sulphite 88% / 90%",
        "cas": "7775-14-6",
        "formula": "Na2S2O4",
        "molecularWeight": "174.11 g/mol",
        "appearance": "White Free-Flowing Crystalline Powder",
        "purity": "88.0% - 90.0% Min",
        "packing": "50 Kg / 100 Kg Iron Drums with Polyethylene Liner",
        "application": "Vat dyeing of denim & cotton, reduction clearing of polyester, bleaching of pulp & paper, sugar processing",
        "categories": ["Sulphuric & Bulk Chemical Division", "Textile & Denim Processing"],
        "primaryCategory": "Textile & Denim Processing",
        "kcilUrl": "https://www.kcil.co.in/product-details/sodium-hydrosulphite",
        "source": "Bhagwati Chemicals Stock & KCIL Plant Supply"
    },
    {
        "id": "hydrogen-peroxide-bhagwati",
        "name": "Hydrogen Peroxide (50% / 35%)",
        "title": "Hydrogen Peroxide Technical Grade",
        "cas": "7722-84-1",
        "formula": "H2O2",
        "molecularWeight": "34.01 g/mol",
        "appearance": "Clear, Colorless Liquid",
        "purity": "50% w/w & 35% w/w",
        "packing": "30 Kg / 50 Kg HM-HDPE Carboys, IBC Tanks & Tanker Loads",
        "application": "Textile bleaching, paper pulp bleaching, effluent water treatment, chemical synthesis",
        "categories": ["Textile & Denim Processing", "Oxidation & Neutralization"],
        "primaryCategory": "Textile & Denim Processing",
        "kcilUrl": "https://www.kcil.co.in/our-products",
        "source": "Bhagwati Chemicals Distribution Network"
    },
    {
        "id": "sulphur-black-bhagwati",
        "name": "Sulphur Black (Liquid & Granular / Powder)",
        "title": "Sulphur Black BR 200% / Liquid Concentrate",
        "cas": "1326-82-5",
        "formula": "Complex Sulphur Polymer",
        "molecularWeight": "Polymeric",
        "appearance": "Black Liquid / Free-flowing Black Flakes & Grains",
        "purity": "100% / 200% Standard Strength",
        "packing": "25 Kg HDPE Lined Bags / 200 Kg Drums / Tankers",
        "application": "Continuous denim warp dyeing, cotton knitwear, corduroy, leather and cellulosic fiber coloration",
        "categories": ["Textile & Denim Processing", "Dyes & Intermediates"],
        "primaryCategory": "Textile & Denim Processing",
        "kcilUrl": "https://www.kcil.co.in/our-products",
        "source": "Bhagwati Chemicals Proprietary Line"
    },
    {
        "id": "antioxidant-a79",
        "name": "Antioxidants – A79 Industrial Grade",
        "title": "Antioxidant A79 Process Stabilizer",
        "cas": "Proprietary Blend",
        "formula": "Sterically Hindered Phenol / Phosphite Blend",
        "molecularWeight": "Specialty Polymer Additive",
        "appearance": "White to Off-White Powder / Granules",
        "purity": "99.0% Active Content",
        "packing": "25 Kg Paper / Poly Bags",
        "application": "Thermal oxidation prevention in textiles, processing baths, synthetic fibers, elastomer and resin compounding",
        "categories": ["Specialty Chemicals", "Textile & Denim Processing"],
        "primaryCategory": "Textile & Denim Processing",
        "kcilUrl": "https://www.kcil.co.in/our-products",
        "source": "Bhagwati Chemicals Specialty Additives"
    },
    {
        "id": "reactive-remazol-dyes",
        "name": "Reactive & Remazol Dyes Range",
        "title": "Reactive Dyes (Vinyl Sulphone & Bi-functional)",
        "cas": "Various",
        "formula": "Reactive Chromophore Complexes",
        "molecularWeight": "Custom Standardized",
        "appearance": "Homogeneous Micro-Granules & Fine Powders",
        "purity": "High Exhaustion / High Fixation Standard",
        "packing": "25 Kg Corrugated Cartons with Inner Liner",
        "application": "Cotton, viscose, and cellulosic fiber exhaust dyeing, cold pad-batch, and textile continuous rotary printing",
        "categories": ["Ethoxylation Process", "Textile & Denim Processing"],
        "primaryCategory": "Textile & Denim Processing",
        "kcilUrl": "https://www.kcil.co.in/our-products/ethoxilation-process",
        "source": "Bhagwati Chemicals Dyes Division"
    },
    {
        "id": "textile-auxiliaries-bhagwati",
        "name": "Specialty Textile Processing Chemicals",
        "title": "Full Wet-Processing Auxiliaries Portfolio",
        "cas": "Complex Formulations",
        "formula": "Surfactant & Polymer Formulations",
        "molecularWeight": "Engineered",
        "appearance": "Clear to Amber Flowable Liquids",
        "purity": "High Concentrate Formulations",
        "packing": "50 Kg / 200 Kg HDPE Drums",
        "application": "Pre-treatment, desizing, scouring, wetting agents, leveling agents, washing-off agents, and cationic fixing agents",
        "categories": ["Textile & Denim Processing", "Specialty Chemicals"],
        "primaryCategory": "Textile & Denim Processing",
        "kcilUrl": "https://www.kcil.co.in/our-products",
        "source": "Bhagwati Chemicals Processing Division"
    }
]

# Merge avoiding duplicates
final_products = bhagwati_core + cleaned_products

print(f"Total unified products: {len(final_products)}")
with open("unified_chemical_products.json", "w", encoding="utf-8") as f:
    json.dump(final_products, f, indent=2)

print("Saved unified_chemical_products.json successfully!")
