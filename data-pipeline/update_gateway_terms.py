import glob
import re

replacements = [
    ("Sister Enterprise & Commercial Gateway for KCIL", "Sister Enterprise of Kutch Chemical Industries Ltd (KCIL)"),
    ("authorized commercial gateway for Kutch Chemical Industries Limited", "sister enterprise of Kutch Chemical Industries Limited"),
    ("Commercial &amp; Distribution Gateway", "Industrial Chemical Enterprise"),
    ("Seamless Commercial Gateway &amp; Manufacturing Synergy", "Integrated Manufacturing &amp; Supply Synergy"),
    ("Serving as the dedicated commercial gateway and sister enterprise for", "Operating in unified alliance as the sister enterprise of"),
    ("functions as the sister commercial gateway and primary inquiry coordinator", "operates in direct sister alliance, coordinating plant dispatch"),
    (">Commercial Gateway</div>", ">Commercial Headquarters</div>"),
    ("<span>Pass-Through</span>", "<span>Plant Routing</span>"),
    ("Sister Company Forwarding Engine", "Direct Sister Enterprise Sourcing"),
    ("_Routing: Automated Sister-Company Commercial Gateway_`", "_Routing: Automated Sister-Company Plant Sourcing_`"),
    ("B2B Sister-Company Commercial Gateway & Master Chemical Ledger Portal", "B2B Sister Enterprise Master Chemical Ledger Portal"),
    ("acting as an enterprise commercial gateway and wrapper for its manufacturing sister enterprise", "acting in direct sister alliance with its manufacturing partner")
]

files = glob.glob("*.html") + glob.glob("assets/js/*.js") + glob.glob("assets/css/*.css") + ["README.md"]

total_changes = 0
for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    modified = content
    for old, new in replacements:
        if old in modified:
            modified = modified.replace(old, new)
            print(f"Replaced '{old}' in {fpath}")
            total_changes += 1
            
    if modified != content:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(modified)

print(f"Total replacements applied: {total_changes}")

# Check remaining 'gateway' occurrences
print("\nRemaining occurrences of 'gateway':")
for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    matches = re.findall(r'.{0,30}gateway.{0,30}', content, re.IGNORECASE)
    if matches:
        print(f"File {fpath}:")
        for m in matches:
            print("  ...", m.strip(), "...")

