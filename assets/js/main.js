/**
 * BHAGWATI CHEMICALS
 * Master Portal Engine: Search, Filtering, Spec Matrix Ledger,
 * Technical Dossier Drawer, and Commercial RFQ Forwarding
 */

// Application State
const AppState = {
  currentCategory: 'All Divisions',
  currentSearch: '',
  currentStateFilter: 'all',
  currentView: 'ledger', // 'ledger' or 'dossier'
  rfqBasket: [],
  selectedProductForModal: null,
  inquiryRegistry: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadInquiryRegistry();
  loadRfqBasket();
  initHeroFinder();
  initProcessPills();
  initToolbarControls();
  initRfqDrawer();
  initModalHandlers();
  initMobileNav();
  renderProducts();
});

// Load persistent data
function loadInquiryRegistry() {
  try {
    const saved = localStorage.getItem('bhagwati_inquiries');
    if (saved) {
      AppState.inquiryRegistry = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Could not load inquiries:', e);
  }
}

function saveInquiryRegistry() {
  try {
    localStorage.setItem('bhagwati_inquiries', JSON.stringify(AppState.inquiryRegistry));
  } catch (e) {
    console.error('Could not save inquiries:', e);
  }
}

function loadRfqBasket() {
  try {
    const saved = localStorage.getItem('bhagwati_rfq_basket');
    if (saved) {
      AppState.rfqBasket = JSON.parse(saved);
      updateRfqBadge();
    }
  } catch (e) {
    console.error('Could not load RFQ basket:', e);
  }
}

function saveRfqBasket() {
  try {
    localStorage.setItem('bhagwati_rfq_basket', JSON.stringify(AppState.rfqBasket));
    updateRfqBadge();
  } catch (e) {
    console.error('Could not save RFQ basket:', e);
  }
}

function updateRfqBadge() {
  const badges = document.querySelectorAll('.rfq-count-badge');
  badges.forEach(b => {
    b.textContent = AppState.rfqBasket.length;
    b.style.display = AppState.rfqBasket.length > 0 ? 'inline-flex' : 'none';
  });
}

// Hero Finder Autocomplete
function initHeroFinder() {
  const input = document.getElementById('heroFinderInput');
  const resultsContainer = document.getElementById('heroFinderResults');
  if (!input || !resultsContainer) return;

  const performSearch = (q) => {
    if (!q || q.trim().length === 0) {
      // Show top featured chemicals
      const featured = CHEMICAL_PRODUCTS.slice(0, 5);
      renderHeroResults(featured, resultsContainer);
      return;
    }
    const term = q.toLowerCase().trim();
    const matches = CHEMICAL_PRODUCTS.filter(p => {
      return (
        p.name.toLowerCase().includes(term) ||
        (p.cas && p.cas.toLowerCase().includes(term)) ||
        (p.formula && p.formula.toLowerCase().includes(term)) ||
        (p.application && p.application.toLowerCase().includes(term)) ||
        (p.categories && p.categories.some(c => c.toLowerCase().includes(term)))
      );
    }).slice(0, 7);
    renderHeroResults(matches, resultsContainer);
  };

  input.addEventListener('input', (e) => performSearch(e.target.value));
  performSearch('');

  // Quick tag buttons
  const tagBtns = document.querySelectorAll('.finder-tag-btn');
  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      input.value = tag;
      performSearch(tag);
    });
  });
}

function renderHeroResults(products, container) {
  if (!products || products.length === 0) {
    container.innerHTML = `<div style="padding: 0.75rem; color: #94a3b8; font-size: 0.82rem; text-align: center;">No matching chemical found in catalog. Contact our commercial desk directly.</div>`;
    return;
  }
  container.innerHTML = products.map(p => `
    <div class="finder-result-item" onclick="openProductModalById('${p.id}')">
      <div>
        <div class="finder-res-name">${escapeHtml(p.name)}</div>
        <div class="finder-res-meta">CAS: ${escapeHtml(p.cas || 'N/A')} &bull; Formula: ${escapeHtml(p.formula || '—')}</div>
      </div>
      <button class="btn-table-rfq" onclick="event.stopPropagation(); quickAddRfq('${p.id}');" title="Add to RFQ">RFQ +</button>
    </div>
  `).join('');
}

// Process Pills Filter Rail
function initProcessPills() {
  const rail = document.getElementById('processPillsRail');
  if (!rail) return;

  rail.innerHTML = CHEMICAL_CATEGORIES.map(cat => {
    const count = cat === 'All Divisions' 
      ? CHEMICAL_PRODUCTS.length 
      : CHEMICAL_PRODUCTS.filter(p => p.categories && p.categories.includes(cat)).length;
    return `
      <button class="process-pill ${cat === AppState.currentCategory ? 'active' : ''}" data-category="${cat}">
        ${cat} <span class="count">${count}</span>
      </button>
    `;
  }).join('');

  rail.addEventListener('click', (e) => {
    const btn = e.target.closest('.process-pill');
    if (!btn) return;
    const cat = btn.getAttribute('data-category');
    AppState.currentCategory = cat;
    
    // Update active class
    rail.querySelectorAll('.process-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    renderProducts();
  });
}

// Toolbar controls
function initToolbarControls() {
  const searchInput = document.getElementById('catalogSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.currentSearch = e.target.value;
      renderProducts();
    });
  }

  const stateSelect = document.getElementById('physicalStateFilter');
  if (stateSelect) {
    stateSelect.addEventListener('change', (e) => {
      AppState.currentStateFilter = e.target.value;
      renderProducts();
    });
  }

  // View switchers
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      AppState.currentView = view;
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
    });
  });
}

// Filtered products calculation
function getFilteredProducts() {
  return CHEMICAL_PRODUCTS.filter(p => {
    // Category check
    if (AppState.currentCategory !== 'All Divisions') {
      if (!p.categories || !p.categories.includes(AppState.currentCategory)) {
        return false;
      }
    }
    // Search check
    if (AppState.currentSearch && AppState.currentSearch.trim() !== '') {
      const q = AppState.currentSearch.toLowerCase().trim();
      const match = 
        p.name.toLowerCase().includes(q) ||
        (p.cas && p.cas.toLowerCase().includes(q)) ||
        (p.formula && p.formula.toLowerCase().includes(q)) ||
        (p.purity && p.purity.toLowerCase().includes(q)) ||
        (p.application && p.application.toLowerCase().includes(q)) ||
        (p.packing && p.packing.toLowerCase().includes(q));
      if (!match) return false;
    }
    // Physical state check
    if (AppState.currentStateFilter !== 'all') {
      const app = (p.appearance || '').toLowerCase();
      if (AppState.currentStateFilter === 'liquid' && !app.includes('liquid') && !app.includes('oil')) return false;
      if (AppState.currentStateFilter === 'solid' && !app.includes('solid') && !app.includes('flake') && !app.includes('powder') && !app.includes('lump') && !app.includes('granule')) return false;
      if (AppState.currentStateFilter === 'gas' && !app.includes('gas')) return false;
    }
    return true;
  });
}

// Render Products (Ledger or Dossier)
function renderProducts() {
  const container = document.getElementById('productsDisplayContainer');
  const countDisplay = document.getElementById('catalogFilteredCount');
  if (!container) return;

  const filtered = getFilteredProducts();
  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${CHEMICAL_PRODUCTS.length} chemicals`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="padding: 4rem 2rem; text-align: center; color: #64748b;">
        <h4 style="font-size: 1.15rem; color: #0f172a; margin-bottom: 0.5rem;">No chemical products matched your query</h4>
        <p style="font-size: 0.9rem; max-width: 500px; margin: 0 auto 1.5rem;">
          Our manufacturing plants produce custom synthesis and downstream derivatives not listed publicly. Contact our commercial desk for custom requirements.
        </p>
        <button class="btn-primary" onclick="resetFilters()">Reset Catalog Filters</button>
      </div>
    `;
    return;
  }

  if (AppState.currentView === 'ledger') {
    renderLedgerTable(filtered, container);
  } else {
    renderDossierGrid(filtered, container);
  }
}

// Render Spec Matrix Table (The Industrial Ledger)
function renderLedgerTable(products, container) {
  let html = `
    <div class="ledger-table-container">
      <table class="chemical-ledger-table">
        <thead>
          <tr>
            <th class="chem-name-col">Chemical Name & Formula</th>
            <th>CAS Registry No.</th>
            <th>Process Division</th>
            <th>Standard Assay / Purity</th>
            <th>Physical State</th>
            <th>Packaging Standards</th>
            <th style="text-align: right;">Commercial Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  products.forEach(p => {
    const isAdded = AppState.rfqBasket.some(item => item.id === p.id);
    html += `
      <tr>
        <td class="chem-name-col">
          <span class="chem-title" onclick="openProductModalById('${p.id}')">${escapeHtml(p.name)}</span>
          <div class="chem-sub">
            <span class="formula-text">${escapeHtml(p.formula || '—')}</span>
            ${p.molecularWeight && p.molecularWeight !== '—' ? `<span class="mol-wt">MW: ${escapeHtml(p.molecularWeight)}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="cas-badge" onclick="copyCas('${p.cas}', this)" title="Click to copy CAS No.">
            ${escapeHtml(p.cas || 'N/A')}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </span>
        </td>
        <td>
          <span class="process-tag">${escapeHtml(p.primaryCategory)}</span>
        </td>
        <td>
          <span class="purity-badge">${escapeHtml(p.purity || 'Commercial')}</span>
        </td>
        <td>
          <span style="font-size: 0.82rem; color: #334155;">${escapeHtml(p.appearance || '—')}</span>
        </td>
        <td>
          <div class="packaging-text">${escapeHtml(p.packing || 'Bulk Tanker / Drums')}</div>
        </td>
        <td>
          <div class="action-btn-group" style="justify-content: flex-end;">
            <button class="btn-table-dossier" onclick="openProductModalById('${p.id}')" title="Technical Dossier">
              Spec Sheet
            </button>
            <button class="btn-table-rfq" onclick="quickAddRfq('${p.id}')" style="${isAdded ? 'background-color: #047857;' : ''}">
              ${isAdded ? 'In RFQ ✓' : 'RFQ +'}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

// Render Technical Dossier Grid View
function renderDossierGrid(products, container) {
  let html = `<div class="dossier-grid">`;

  products.forEach(p => {
    const isAdded = AppState.rfqBasket.some(item => item.id === p.id);
    html += `
      <div class="dossier-tile">
        <div class="tile-top">
          <div class="tile-process-strip">
            <span class="process-tag">${escapeHtml(p.primaryCategory)}</span>
            <span class="cas-badge" onclick="copyCas('${p.cas}', this)">
              CAS: ${escapeHtml(p.cas || 'N/A')}
            </span>
          </div>
          <h3 class="tile-title" onclick="openProductModalById('${p.id}')" style="cursor: pointer;">
            ${escapeHtml(p.name)}
          </h3>
          <div style="font-family: var(--font-mono); font-size: 0.85rem; color: #0284c7; margin-bottom: 0.75rem;">
            ${escapeHtml(p.formula || 'Formula: —')} ${p.molecularWeight && p.molecularWeight !== '—' ? `&bull; MW ${escapeHtml(p.molecularWeight)}` : ''}
          </div>
        </div>

        <div class="tile-specs-list">
          <div class="spec-cell">
            <span class="spec-cell-label">Guaranteed Assay</span>
            <span class="spec-cell-value">${escapeHtml(p.purity || 'Commercial')}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-cell-label">Physical Form</span>
            <span class="spec-cell-value" style="font-size: 0.75rem;">${escapeHtml(p.appearance || 'Standard')}</span>
          </div>
        </div>

        <div class="tile-application">
          <strong style="color: #0f172a; font-size: 0.76rem; text-transform: uppercase;">Downstream Applications:</strong><br>
          ${escapeHtml(p.application || 'Industrial processing, synthesis intermediates, and specialized manufacturing.')}
        </div>

        <div class="tile-footer">
          <button class="btn-secondary" style="padding: 0.45rem 0.85rem; font-size: 0.8rem;" onclick="openProductModalById('${p.id}')">
            Technical Dossier
          </button>
          <button class="btn-primary" style="padding: 0.45rem 0.95rem; font-size: 0.8rem; ${isAdded ? 'background-color: #047857; border-color: #047857;' : ''}" onclick="quickAddRfq('${p.id}')">
            ${isAdded ? 'Added to RFQ ✓' : 'Add to RFQ +'}
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// Reset filters
function resetFilters() {
  AppState.currentCategory = 'All Divisions';
  AppState.currentSearch = '';
  AppState.currentStateFilter = 'all';
  
  const searchInput = document.getElementById('catalogSearchInput');
  if (searchInput) searchInput.value = '';
  const stateSelect = document.getElementById('physicalStateFilter');
  if (stateSelect) stateSelect.value = 'all';

  const pills = document.querySelectorAll('.process-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-category') === 'All Divisions') p.classList.add('active');
    else p.classList.remove('active');
  });

  renderProducts();
}

// 1-Click Copy CAS Number
function copyCas(cas, element) {
  if (!cas || cas === 'N/A') return;
  navigator.clipboard.writeText(cas).then(() => {
    const originalText = element.innerHTML;
    element.innerHTML = `Copied! ✓`;
    element.style.backgroundColor = '#d1fae5';
    element.style.color = '#065f46';
    setTimeout(() => {
      element.innerHTML = originalText;
      element.style.backgroundColor = '';
      element.style.color = '';
    }, 1500);
  });
}

// Technical Dossier Modal
function initModalHandlers() {
  const backdrop = document.getElementById('productDossierModal');
  const closeBtn = document.getElementById('closeModalBtn');
  if (!backdrop) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeModal();
    }
  });
}

function openProductModalById(id) {
  const product = CHEMICAL_PRODUCTS.find(p => p.id === id);
  if (!product) return;
  AppState.selectedProductForModal = product;

  const titleEl = document.getElementById('modalChemTitle');
  const metaEl = document.getElementById('modalChemMeta');
  const bodyEl = document.getElementById('modalChemBody');
  const modalRfqBtn = document.getElementById('modalRfqActionBtn');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');

  if (titleEl) titleEl.textContent = product.name;
  if (metaEl) {
    metaEl.innerHTML = `CAS: ${escapeHtml(product.cas || 'N/A')} &bull; Formula: ${escapeHtml(product.formula || '—')} &bull; Category: ${escapeHtml(product.primaryCategory)}`;
  }

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="dossier-section-block">
        <h4>1. Chemical Identification & Parameters</h4>
        <table class="dossier-meta-table">
          <tr>
            <th>Product Name / Synonyms</th>
            <td>${escapeHtml(product.name)} (${escapeHtml(product.title)})</td>
          </tr>
          <tr>
            <th>CAS Registry Number</th>
            <td><span class="font-mono" style="font-weight: 700;">${escapeHtml(product.cas || 'N/A')}</span></td>
          </tr>
          <tr>
            <th>Empirical Formula</th>
            <td><span class="font-mono">${escapeHtml(product.formula || '—')}</span></td>
          </tr>
          <tr>
            <th>Molecular Weight</th>
            <td>${escapeHtml(product.molecularWeight || '—')}</td>
          </tr>
          <tr>
            <th>Standard Commercial Assay</th>
            <td><strong style="color: #0284c7;">${escapeHtml(product.purity || 'Commercial Grade')}</strong></td>
          </tr>
          <tr>
            <th>Physical State & Appearance</th>
            <td>${escapeHtml(product.appearance || '—')}</td>
          </tr>
          <tr>
            <th>Process Division</th>
            <td>${escapeHtml(product.categories ? product.categories.join(', ') : product.primaryCategory)}</td>
          </tr>
        </table>
      </div>

      <div class="dossier-section-block">
        <h4>2. Packaging, Bulk Logistics & Container Types</h4>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem 1.25rem; border-radius: 6px; font-size: 0.88rem; color: #1e293b; line-height: 1.6;">
          <strong>Standard Packaging:</strong> ${escapeHtml(product.packing || 'Loose Tanker loads, ISO Containers, MS/HDPE Drums, or Palletized Bags.')}
          <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #64748b;">
            * Available for domestic supply across India and global export consignments via Mundra / Kandla ports.
          </div>
        </div>
      </div>

      <div class="dossier-section-block">
        <h4>3. Downstream Commercial Applications</h4>
        <p style="font-size: 0.9rem; color: #334155; line-height: 1.6; background: #ffffff; border-left: 3px solid #0284c7; padding-left: 1rem;">
          ${escapeHtml(product.application || 'Key intermediate in active pharmaceutical ingredient (API) synthesis, agrochemicals, dyestuffs, polymer stabilizers, rubber chemicals, and specialized textile finishing.')}
        </p>
      </div>

      <div class="dossier-section-block">
        <h4>4. Manufacturing & Quality Verification</h4>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.85rem 1.25rem; border-radius: 6px; font-size: 0.82rem; color: #166534; display: flex; align-items: flex-start; gap: 0.75rem;">
          <div>
            <strong>Production Backbone:</strong> Manufactured in state-of-the-art chemical production complexes in Gandhidham / Jhagadia / Dahej / Panoli, backed by Bhagwati Chemicals' 40-year quality and testing regime.
          </div>
        </div>
      </div>
    `;
  }

  // Update modal actions
  if (modalRfqBtn) {
    const isAdded = AppState.rfqBasket.some(i => i.id === product.id);
    modalRfqBtn.textContent = isAdded ? 'Added to RFQ Tray ✓' : 'Add to RFQ Tray +';
    modalRfqBtn.style.backgroundColor = isAdded ? '#047857' : '';
    modalRfqBtn.onclick = () => {
      quickAddRfq(product.id);
      modalRfqBtn.textContent = 'Added to RFQ Tray ✓';
      modalRfqBtn.style.backgroundColor = '#047857';
    };
  }

  if (modalWhatsAppBtn) {
    modalWhatsAppBtn.onclick = () => {
      sendDirectWhatsAppQuote(product);
    };
  }

  const backdrop = document.getElementById('productDossierModal');
  if (backdrop) backdrop.classList.add('open');
}

function closeModal() {
  const backdrop = document.getElementById('productDossierModal');
  if (backdrop) backdrop.classList.remove('open');
}

// RFQ Basket & Drawer
function initRfqDrawer() {
  const drawer = document.getElementById('rfqDrawer');
  const backdrop = document.getElementById('rfqDrawerBackdrop');
  const openBtns = document.querySelectorAll('.open-rfq-drawer-btn');
  const closeBtn = document.getElementById('closeRfqDrawerBtn');
  const form = document.getElementById('rfqDrawerForm');

  openBtns.forEach(b => b.addEventListener('click', openRfqDrawer));
  if (closeBtn) closeBtn.addEventListener('click', closeRfqDrawer);
  if (backdrop) backdrop.addEventListener('click', closeRfqDrawer);

  if (form) {
    form.addEventListener('submit', handleRfqSubmission);
  }
}

function openRfqDrawer() {
  renderRfqItemsList();
  const drawer = document.getElementById('rfqDrawer');
  const backdrop = document.getElementById('rfqDrawerBackdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.style.display = 'block';
}

function closeRfqDrawer() {
  const drawer = document.getElementById('rfqDrawer');
  const backdrop = document.getElementById('rfqDrawerBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.style.display = 'none';
}

function quickAddRfq(id) {
  const product = CHEMICAL_PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = AppState.rfqBasket.find(i => i.id === id);
  if (!existing) {
    AppState.rfqBasket.push({
      id: product.id,
      name: product.name,
      cas: product.cas,
      purity: product.purity,
      packing: product.packing
    });
    saveRfqBasket();
    renderProducts();
  }
  openRfqDrawer();
}

function removeRfqItem(id) {
  AppState.rfqBasket = AppState.rfqBasket.filter(i => i.id !== id);
  saveRfqBasket();
  renderRfqItemsList();
  renderProducts();
}

function renderRfqItemsList() {
  const container = document.getElementById('rfqSelectedItemsContainer');
  if (!container) return;

  if (AppState.rfqBasket.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: #94a3b8; font-size: 0.85rem; border: 1px dashed #cbd5e1; border-radius: 6px;">
        No chemicals currently in your RFQ Tray.<br>
        Browse the chemical catalog and click <strong>"RFQ +"</strong> on any product.
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.rfqBasket.map(item => `
    <div class="rfq-selected-item">
      <div>
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="item-cas">CAS: ${escapeHtml(item.cas || 'N/A')} &bull; Grade: ${escapeHtml(item.purity || 'Commercial')}</div>
      </div>
      <button type="button" class="btn-remove-item" onclick="removeRfqItem('${item.id}')" title="Remove from RFQ">&times;</button>
    </div>
  `).join('');
}

// COMMERCIAL INQUIRY FORWARDING ENGINE
function handleRfqSubmission(e) {
  e.preventDefault();
  
  if (AppState.rfqBasket.length === 0) {
    alert('Please add at least one chemical to your RFQ Tray before submitting.');
    return;
  }

  const name = document.getElementById('rfqName').value.trim();
  const company = document.getElementById('rfqCompany').value.trim();
  const phone = document.getElementById('rfqPhone').value.trim();
  const email = document.getElementById('rfqEmail').value.trim();
  const quantity = document.getElementById('rfqQuantity').value.trim();
  const location = document.getElementById('rfqLocation').value.trim();
  const packaging = document.getElementById('rfqPackaging').value;
  const dispatchChannel = document.querySelector('input[name="rfqChannel"]:checked')?.value || 'whatsapp';
  const notes = document.getElementById('rfqNotes').value.trim();

  // Generate Formal B2B RFQ Reference
  const refCode = 'BC-' + Math.floor(100000 + Math.random() * 900000);
  const timestamp = new Date().toISOString();

  const inquiryDossier = {
    refCode,
    timestamp,
    name,
    company,
    phone,
    email,
    quantity,
    location,
    packaging,
    notes,
    items: [...AppState.rfqBasket]
  };

  // Save to commercial ledger registry
  AppState.inquiryRegistry.unshift(inquiryDossier);
  saveInquiryRegistry();

  // Execute Dispatch based on user choice
  if (dispatchChannel === 'whatsapp') {
    dispatchWhatsAppRFQ(inquiryDossier);
  } else if (dispatchChannel === 'email') {
    dispatchEmailRFQ(inquiryDossier);
  } else {
    dispatchWhatsAppRFQ(inquiryDossier);
    setTimeout(() => dispatchEmailRFQ(inquiryDossier), 1000);
  }

  // Show confirmation modal
  showConfirmationSlip(inquiryDossier);

  // Clear basket
  AppState.rfqBasket = [];
  saveRfqBasket();
  closeRfqDrawer();
}

function dispatchWhatsAppRFQ(rfq) {
  const itemsText = rfq.items.map(i => `• ${i.name} (CAS: ${i.cas}, Grade: ${i.purity})`).join('\n');
  const text = `*FORMAL COMMERCIAL INQUIRY (RFQ)*
*Ref No:* ${rfq.refCode}
*Company:* Bhagwati Chemicals

*Requester Details:*
• Company: ${rfq.company || 'Not Specified'}
• Contact Person: ${rfq.name}
• Phone: ${rfq.phone}
• Email: ${rfq.email}
• Delivery Destination: ${rfq.location}

*Chemical Requirements:*
${itemsText}

• Target Quantity: ${rfq.quantity}
• Preferred Packaging: ${rfq.packaging}
• Additional Specifications: ${rfq.notes || 'None'}

_Routing: Direct Plant Commercial Sourcing_`;

  const phoneDest = '919428001153'; // Primary Bhagwati Chemicals sales line
  const url = `https://wa.me/${phoneDest}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function dispatchEmailRFQ(rfq) {
  const itemsText = rfq.items.map(i => ` - ${i.name} [CAS: ${i.cas}, Grade: ${i.purity}]`).join('\n');
  const subject = `[RFQ ${rfq.refCode}] Chemical Procurement Inquiry: ${rfq.company || rfq.name}`;
  const body = `Attention Commercial Sourcing Desk,
Bhagwati Chemicals

Please provide a formal commercial spot quotation for the following chemical requirement:

REFERENCE ID: ${rfq.refCode}
DATE: ${new Date().toLocaleDateString()}

BUYER PROFILE:
Company: ${rfq.company || 'N/A'}
Contact: ${rfq.name}
Phone: ${rfq.phone}
Email: ${rfq.email}
Delivery Destination: ${rfq.location}

PRODUCTS REQUIRED:
${itemsText}

TARGET VOLUME: ${rfq.quantity}
PACKAGING SPECIFICATION: ${rfq.packaging}
BUYER NOTES: ${rfq.notes || 'Please provide technical data sheet (TDS), certificate of analysis (COA), and dispatch timeline.'}

---
This inquiry originated from Bhagwati Chemicals official portal.`;

  const mailtoUrl = `mailto:info@bhagwatichemicals.in?cc=info@kcil.co.in&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

function sendDirectWhatsAppQuote(product) {
  const text = `Hello Bhagwati Chemicals Sales Desk,
I am interested in procuring *${product.name}* (CAS: ${product.cas || 'N/A'}, Division: ${product.primaryCategory}).

Please share current commercial spot price, Minimum Order Quantity (MOQ), and TDS.`;
  const url = `https://wa.me/919428001153?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function showConfirmationSlip(rfq) {
  alert(`RFQ Successfully Registered!\nReference ID: ${rfq.refCode}\nYour requirement has been formatted and forwarded to Bhagwati Chemicals Commercial Desk.\nOur sales engineers will contact you shortly.`);
}

// Mobile Nav toggle
function initMobileNav() {
  const toggle = document.getElementById('mobileNavToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
