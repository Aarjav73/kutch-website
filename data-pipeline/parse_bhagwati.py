import re
import json

# Let's inspect Bhagwati Chemicals text
with open("bhagwati_about-us.html", "r", encoding="utf-8") as f:
    text = f.read()

# Strip tags to get readable text
text_clean = re.sub(r'<script.*?</script>', '', text, flags=re.DOTALL)
text_clean = re.sub(r'<style.*?</style>', '', text_clean, flags=re.DOTALL)
text_clean = re.sub(r'<[^>]+>', ' ', text_clean)
text_clean = ' '.join(text_clean.split())
print("Bhagwati About Us snippet:")
print(text_clean[:2000])

with open("bhagwati_contact-us.html", "r", encoding="utf-8") as f:
    c_text = f.read()
c_text_clean = re.sub(r'<script.*?</script>', '', c_text, flags=re.DOTALL)
c_text_clean = re.sub(r'<style.*?</style>', '', c_text_clean, flags=re.DOTALL)
c_text_clean = re.sub(r'<[^>]+>', ' ', c_text_clean)
c_text_clean = ' '.join(c_text_clean.split())
print("\nBhagwati Contact Us snippet:")
print(c_text_clean[:1500])
