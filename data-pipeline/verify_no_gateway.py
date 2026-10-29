import glob
import re

files = glob.glob("*.html") + glob.glob("assets/js/*.js") + glob.glob("assets/css/*.css") + ["README.md"]

found = 0
for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    matches = re.findall(r'.{0,30}gateway.{0,30}', content, re.IGNORECASE)
    if matches:
        print(f"File {fpath}: {len(matches)} matches")
        for m in matches:
            print("  ...", m.strip(), "...")
            found += 1

if found == 0:
    print("SUCCESS: Zero occurrences of 'gateway' found across all website files!")

