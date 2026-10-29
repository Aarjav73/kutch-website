import urllib.request
import ssl
import json
import re
from concurrent.futures import ThreadPoolExecutor

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

urls = [
    "https://www.kcil.co.in/product-details/1-2-3-tri-chloro-benzene",
    "https://www.kcil.co.in/product-details/1-2-4-tri-chloro-benzene",
    "https://www.kcil.co.in/product-details/2--4-di-nitro-chloro-benzene",
    "https://www.kcil.co.in/product-details/2--5-di-chloro-nitro-benzene",
    "https://www.kcil.co.in/product-details/2-ethyl-hexyl-nitrate",
    "https://www.kcil.co.in/product-details/2-ethylhexanoyl-chloride",
    "https://www.kcil.co.in/product-details/23-di-chloro-aniline",
    "https://www.kcil.co.in/product-details/23-di-chloro-nitro-benzene-23-dcnb",
    "https://www.kcil.co.in/product-details/25-di-chloro-aniline",
    "https://www.kcil.co.in/product-details/34-di-chloro-aniline",
    "https://www.kcil.co.in/product-details/34-dichloro-nitro-benzene-34-dcnb",
    "https://www.kcil.co.in/product-details/4-chloro-butyryl-chloride",
    "https://www.kcil.co.in/product-details/acetanilide--flakes-oa",
    "https://www.kcil.co.in/product-details/acetanilide-flakes",
    "https://www.kcil.co.in/product-details/aniline-oil",
    "https://www.kcil.co.in/product-details/calcium-chloride-fused",
    "https://www.kcil.co.in/product-details/calcium-chloride-granules",
    "https://www.kcil.co.in/product-details/calcium-chloride-liquid",
    "https://www.kcil.co.in/product-details/calcium-chloride-powder",
    "https://www.kcil.co.in/product-details/caustic--soda-lye",
    "https://www.kcil.co.in/product-details/caustic-soda-flake",
    "https://www.kcil.co.in/product-details/chlorinated-paraffin",
    "https://www.kcil.co.in/product-details/chlorine-liquid",
    "https://www.kcil.co.in/product-details/chloro-sulphonic-acid-csa",
    "https://www.kcil.co.in/product-details/di-calcium-phosphate",
    "https://www.kcil.co.in/product-details/dimethyl-sulphate",
    "https://www.kcil.co.in/product-details/gypsum-granules",
    "https://www.kcil.co.in/product-details/h-acid-dry-powder--granules-",
    "https://www.kcil.co.in/product-details/hcl-32--34--35",
    "https://www.kcil.co.in/product-details/hcl-virgin-caustic",
    "https://www.kcil.co.in/product-details/hydrogen-gas",
    "https://www.kcil.co.in/product-details/isobutyryl-chloride",
    "https://www.kcil.co.in/product-details/isononanoyl-chloride",
    "https://www.kcil.co.in/product-details/isophthaloyl-chloride",
    "https://www.kcil.co.in/product-details/m-phenylenediamine",
    "https://www.kcil.co.in/product-details/meta-dichloro-benzene---70",
    "https://www.kcil.co.in/product-details/meta-nitro-chloro-benzene",
    "https://www.kcil.co.in/product-details/meta-nitro-toluene",
    "https://www.kcil.co.in/product-details/meta-toluidine",
    "https://www.kcil.co.in/product-details/mono-chloro-benzene",
    "https://www.kcil.co.in/product-details/neodecanoyl-chloride",
    "https://www.kcil.co.in/product-details/nitro-benzene",
    "https://www.kcil.co.in/product-details/oleum-23---30",
    "https://www.kcil.co.in/product-details/oleum-65",
    "https://www.kcil.co.in/product-details/ortdo-toludine-ot",
    "https://www.kcil.co.in/product-details/ortho-anisidine",
    "https://www.kcil.co.in/product-details/ortho-dichloro-benzene-odcb",
    "https://www.kcil.co.in/product-details/ortho-nitro-aniline",
    "https://www.kcil.co.in/product-details/ortho-nitro-anisole",
    "https://www.kcil.co.in/product-details/ortho-nitro-chloro-benzene-",
    "https://www.kcil.co.in/product-details/ortho-nitro-toluene-",
    "https://www.kcil.co.in/product-details/para-amino-phenol-",
    "https://www.kcil.co.in/product-details/para-anisidine",
    "https://www.kcil.co.in/product-details/para-di-chloro-benzene--pdcb-",
    "https://www.kcil.co.in/product-details/para-nitro-aniline",
    "https://www.kcil.co.in/product-details/para-nitro-anisole",
    "https://www.kcil.co.in/product-details/para-nitro-chloro-benzene-",
    "https://www.kcil.co.in/product-details/para-nitro-toluene",
    "https://www.kcil.co.in/product-details/para-toluidine",
    "https://www.kcil.co.in/product-details/paracetamol",
    "https://www.kcil.co.in/product-details/pivaloyl-chloride",
    "https://www.kcil.co.in/product-details/red-b-base",
    "https://www.kcil.co.in/product-details/sodium-hydrosulphite",
    "https://www.kcil.co.in/product-details/sodium-hypochlorite",
    "https://www.kcil.co.in/product-details/sodium-nitrate-coated--non-coated",
    "https://www.kcil.co.in/product-details/sodium-nitrite-coated--non-coated-",
    "https://www.kcil.co.in/product-details/sodium-sulphate-anhyduous",
    "https://www.kcil.co.in/product-details/sulpho-oavs",
    "https://www.kcil.co.in/product-details/sulpho-vs",
    "https://www.kcil.co.in/product-details/sulphur-dioxide",
    "https://www.kcil.co.in/product-details/sulphuric-acid-73-to-75",
    "https://www.kcil.co.in/product-details/sulphuric-acid-80",
    "https://www.kcil.co.in/product-details/sulphuric-acid-98",
    "https://www.kcil.co.in/product-details/sulphuric-acid-spent-73",
    "https://www.kcil.co.in/product-details/sulphuric-trioxide",
    "https://www.kcil.co.in/product-details/thionyl-chloride",
    "https://www.kcil.co.in/product-details/valeryl-chloride",
    "https://www.kcil.co.in/product-details/vinyl-sulphone-ester",
    "https://www.kcil.co.in/product-details/vs-ortho-anisidine"
]

def fetch_and_parse(url):
    slug = url.split("/")[-1]
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12, context=ctx) as r:
            html = r.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error {url}: {e}")
        return None

    # Title
    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.I) or re.search(r'<h2[^>]*>(.*?)</h2>', html, re.I)
    title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip() if title_match else slug.replace("-", " ").title()

    # Find table specifications
    specs = {}
    current_product = title
    sub_products = []
    
    tables = re.findall(r'<table.*?</table>', html, re.DOTALL | re.IGNORECASE)
    for tbl in tables:
        rows = re.findall(r'<tr.*?</tr>', tbl, re.DOTALL | re.IGNORECASE)
        prod_dict = {}
        for r in rows:
            cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh].*?</t[dh]>', r, re.DOTALL | re.IGNORECASE)]
            if len(cols) >= 2:
                k = cols[0].strip().rstrip(":").strip()
                v = " : ".join(cols[1:]).strip()
                if k and v:
                    if k.lower() == "name of product" and prod_dict:
                        sub_products.append(prod_dict)
                        prod_dict = {k: v}
                    else:
                        prod_dict[k] = v
        if prod_dict:
            sub_products.append(prod_dict)

    # Breadcrumbs / Category
    cat_match = re.search(r'class="[^"]*breadcrumb[^"]*".*?</div>', html, re.DOTALL | re.I)
    category = "Specialty Chemicals"
    if cat_match:
        crumbs = re.findall(r'<li[^>]*>(.*?)</li>', cat_match.group(0), re.DOTALL | re.I)
        cleaned_crumbs = [re.sub(r'<[^>]+>', '', c).strip() for c in crumbs if re.sub(r'<[^>]+>', '', c).strip()]
        if len(cleaned_crumbs) >= 2:
            category = cleaned_crumbs[1]

    return {
        "slug": slug,
        "url": url,
        "title": title,
        "category": category,
        "items": sub_products if sub_products else [{}]
    }

print(f"Starting fetch of {len(urls)} products...")
results = []
with ThreadPoolExecutor(max_workers=8) as ex:
    for res in ex.map(fetch_and_parse, urls):
        if res:
            results.append(res)

print(f"Fetched {len(results)} products successfully!")
with open("kcil_scraped_products.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
print("Saved to kcil_scraped_products.json")
