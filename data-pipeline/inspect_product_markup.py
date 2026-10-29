import re

with open("kcil_acidchlorides.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's inspect a chunk containing one of the product names: Neodecanoyl Chloride
idx = html.find("Neodecanoyl Chloride")
if idx != -1:
    print("Chunk around Neodecanoyl Chloride:")
    print(html[idx-200:idx+1500])

with open("kcil_chlorination-process.html", "r", encoding="utf-8") as f:
    c_html = f.read()

c_idx = c_html.find("Chlorinated Paraffin")
if c_idx != -1:
    print("\nChunk around Chlorinated Paraffin:")
    print(c_html[c_idx-200:c_idx+1500])
