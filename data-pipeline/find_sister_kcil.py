import glob
import re

files = glob.glob("*.html") + glob.glob("assets/js/*.js") + glob.glob("assets/css/*.css") + ["README.md"]

print("--- SEARCH FOR 'SISTER' ---")
for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    matches = re.findall(r'.{0,35}sister.{0,35}', content, re.IGNORECASE)
    if matches:
        print(f"File: {fpath} ({len(matches)} matches)")
        for m in matches[:4]:
            print("  ...", m.strip(), "...")

print("\n--- SEARCH FOR 'KCIL' ---")
for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    matches = re.findall(r'.{0,35}kcil.{0,35}', content, re.IGNORECASE)
    if matches:
        print(f"File: {fpath} ({len(matches)} matches)")
        for m in matches[:4]:
            print("  ...", m.strip(), "...")

