# Bhagwati Chemicals
### B2B Industrial Chemical Master Ledger & Commercial Sourcing Portal

A static website built for **Bhagwati Chemicals** (Ahmedabad, Gujarat — Est. 1985), presenting a full enterprise catalog of 85+ industrial chemicals across 11 manufacturing processes with integrated quotation and inquiry forwarding.

---

## 🚀 Key Features

1. **Complete Chemical Product Catalog (85+ Products Across 11 Reaction Divisions)**:
   - Full technical specifications across all core production processes:
     - **Chlorination Process** (ODCB, PDCB, 1,2,4-TCB, Thionyl Chloride, Calcium Chloride, etc.)
     - **Nitration Process** (Nitro Benzene, PNCB, ONCB, MNCB, 2,4-DNCB, 2,5-DCNB, etc.)
     - **Hydrogenation Process** (Para Amino Phenol, Paracetamol Active, Anisidines, Toluidines, Aniline Oil)
     - **Acid Chlorides Division** (Neodecanoyl, 2-Ethylhexanoyl, Isononanoyl, Pivaloyl, Isobutyryl)
     - **Chlor-Alkali & Electrolysis** (Caustic Soda Lye 48-50%, Caustic Flakes, Liquid Chlorine, Hydrogen)
     - **Sulphonation Process** (H Acid, Dimethyl Sulphate, CSA)
     - **Ethoxylation Process** (Vinyl Sulphone Ester, VS Ortho Anisidine, Sulpho VS)
     - **Ammonolysis Process** (Para Nitro Aniline, Ortho Nitro Aniline)
     - **Methoxylation Process** (Ortho Nitro Anisole, Para Nitro Anisole)
     - **Oxidation & Neutralization** (Sodium Nitrite / Nitrate)
     - **Sulphuric & Bulk Chemical Division** (Sulphuric Acid 98%, Oleum 23%/65%, Sodium Hydrosulphite)
     - **Proprietary Textile & Processing Chemicals** (Antioxidant A79, Remazol Dyes, Hydrogen Peroxide, Sulphur Black, Wet Processing Auxiliaries)

2. **Bespoke B2B Architecture (No Generic Card Spam / Zero AI Icons)**:
   - Engineered specifically for industrial chemical procurement managers, plant heads, and export merchants.
   - **Spec Matrix (Industrial Ledger Table)**: Highly scannable, sticky-header comparison table with 1-click CAS copy, guaranteed GLC purities, empirical formulas, molecular weights, and packaging specs.
   - **Technical Dossier View**: Clean, split-view technical specification sheets.
   - **Hero Quick Chemical & CAS Finder**: Instant live search with pre-built chemical tags.
   - **Professional Typography**: `Plus Jakarta Sans` for authoritative corporate headings, `Inter` for clean body text, and `JetBrains Mono` for scientific CAS numbers and chemical formulas.

3. **Inquiry Processing & Forwarding Engine**:
   - **Multi-Product RFQ Tray**: Add single or multiple chemicals to a procurement basket.
   - **Automated Reference Tracking**: Generates unique reference codes (e.g. `BC-XXXXXX`).
   - **Direct WhatsApp Business Dispatch**: Formats a formal B2B RFQ message directly to Bhagwati Chemicals sales directors (+91 9428001153 / +91 9825030103).
   - **Commercial Email Dispatch**: Formats and addresses RFQ emails to `info@bhagwatichemicals.in` with CC to `info@kcil.co.in`.
   - **Local Lead Registry & CSV Export**: Sales managers can view all submitted RFQs on-site and export them to Excel/CSV for plant production coordination.

---

## 📁 File Structure

```text
├── index.html              # Homepage with Hero Finder, Manufacturing schematic, metrics, and divisions
├── products.html           # Full 85+ Chemical Master Ledger (Spec Matrix table, live filters, dossier modal)
├── about.html              # History of Bhagwati Chemicals (Est. 1985), Harish Agrawal leadership, and manufacturing base
├── infrastructure.html     # Mega manufacturing complexes (Gandhidham, Jhagadia, Dahej, Panoli)
├── inquiry.html            # Dedicated RFQ sourcing builder & commercial forwarding center
├── contact.html            # Corporate office coordinates in Ahmedabad & plant network contacts
├── assets/
│   ├── css/
│   │   └── style.css       # Clean industrial styling, hair-line borders, zero neon/AI glows
│   ├── js/
│   │   ├── products-data.js# Database of all 85 chemicals with complete specs
│   │   └── main.js         # Search, filters, view toggle, modal, RFQ drawer, and forwarding engine
│   └── images/
│       ├── bhagwati_logo.webp
│       └── kcil_logo.png
└── data-pipeline/          # Scraper scripts and raw source archives for future catalog updates
```

---

## 🌐 How to Run Locally

Open `index.html` directly in any web browser, or serve it using any lightweight static server:

```bash
# Python 3
python -m http.server 8000

# Or Node.js npx
npx serve .
```

Open [http://localhost:8000](http://localhost:8000) in your browser.
