/* Bhagwati Chemicals — site behaviour */

const AppState = {
  rfqBasket: [],
  inquiryRegistry: [],
  compare: []
};

const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/* ---------- storage ---------- */
function loadInquiryRegistry() { try { AppState.inquiryRegistry = JSON.parse(localStorage.getItem('bhagwati_inquiries') || '[]'); } catch (e) {} }
function saveInquiryRegistry() { try { localStorage.setItem('bhagwati_inquiries', JSON.stringify(AppState.inquiryRegistry)); } catch (e) {} }
function loadRfqBasket() { try { AppState.rfqBasket = JSON.parse(localStorage.getItem('bhagwati_rfq_basket') || '[]'); } catch (e) {} updateRfqBadge(); }
function saveRfqBasket() { try { localStorage.setItem('bhagwati_rfq_basket', JSON.stringify(AppState.rfqBasket)); } catch (e) {} updateRfqBadge(true); }
function updateRfqBadge(animate) {
  $$('.rfq-count-badge').forEach(b => {
    b.textContent = AppState.rfqBasket.length;
    b.style.display = AppState.rfqBasket.length ? 'inline-flex' : 'none';
    if (animate) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  });
}

/* ---------- global scroll behaviour ---------- */
function initScroll() {
  const nav = $('#nav');
  const bar = $('.progress');
  const lattice = $$('.hero-lattice');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 12);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    lattice.forEach(l => { l.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0)'; });
    updateSteps();
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
}

function initReveal() {
  const items = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(i => io.observe(i));
}

function initCounters() {
  const els = $$('[data-count-to]');
  if (!els.length) return;
  const run = el => {
    const end = parseFloat(el.getAttribute('data-count-to'));
    const suffix = el.getAttribute('data-suffix') || '';
    const t0 = performance.now(), dur = 1400;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.5 });
  els.forEach(e => io.observe(e));
}

function updateSteps() {
  const wrap = $('.steps');
  if (!wrap) return;
  const r = wrap.getBoundingClientRect();
  const vh = window.innerHeight;
  const progress = Math.max(0, Math.min(1, (vh * 0.65 - r.top) / r.height));
  const fill = $('.steps-fill', wrap);
  if (fill) fill.style.height = (progress * 100) + '%';
  $$('.step', wrap).forEach(s => {
    const sr = s.getBoundingClientRect();
    s.classList.toggle('on', sr.top < vh * 0.65);
  });
}

function initNav() {
  const burger = $('#burger'), links = $('#links');
  if (burger && links) {
    burger.addEventListener('click', () => { burger.classList.toggle('open'); links.classList.toggle('open'); });
    $$('a, button', links).forEach(el => el.addEventListener('click', () => { burger.classList.remove('open'); links.classList.remove('open'); }));
  }
}

/* ---------- division counts (home) ---------- */
function initDivisionCounts() {
  $$('[data-div]').forEach(el => {
    const d = el.getAttribute('data-div');
    el.textContent = CHEMICAL_PRODUCTS.filter(p => p.categories && p.categories.includes(d)).length;
  });
  $$('[data-total]').forEach(el => { el.textContent = CHEMICAL_PRODUCTS.length; });
}

/* ---------- hero finder ---------- */
function initHeroFinder() {
  const input = $('#heroFinderInput'), out = $('#heroFinderResults');
  if (!input || !out) return;
  const render = list => {
    if (!list.length) { out.innerHTML = '<div class="finder-empty">No match. Ask our desk — we handle custom requirements.</div>'; return; }
    out.innerHTML = list.map(p => `
      <a class="finder-row" href="products.html?q=${encodeURIComponent(p.name)}">
        <span><b>${escapeHtml(p.name)}</b><small>CAS ${escapeHtml(p.cas || 'N/A')} · ${escapeHtml(p.formula || '—')}</small></span>
        <span class="go">→</span>
      </a>`).join('');
  };
  const search = q => {
    q = (q || '').toLowerCase().trim();
    if (!q) return render(CHEMICAL_PRODUCTS.slice(0, 5));
    render(CHEMICAL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) || (p.cas || '').toLowerCase().includes(q) ||
      (p.formula || '').toLowerCase().includes(q) || (p.application || '').toLowerCase().includes(q)).slice(0, 6));
  };
  input.addEventListener('input', e => search(e.target.value));
  $$('.finder-tags button').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.tag; search(b.dataset.tag); }));
  search('');
}

/* ---------- products page ---------- */
const View = { cat: 'All Divisions', q: '', state: 'all', sort: 'name', mode: 'list', open: null };

function stateOf(p) {
  const a = (p.appearance || '').toLowerCase();
  if (a.includes('gas')) return 'gas';
  if (a.includes('liquid') || a.includes('oil') || a.includes('solution')) return 'liquid';
  if (/(solid|flake|powder|lump|granule|crystal|bead)/.test(a)) return 'solid';
  return 'other';
}
function filtered() {
  const q = View.q.toLowerCase().trim();
  let list = CHEMICAL_PRODUCTS.filter(p => {
    if (View.cat !== 'All Divisions' && !(p.categories || []).includes(View.cat)) return false;
    if (View.state !== 'all' && stateOf(p) !== View.state) return false;
    if (q) {
      const hay = [p.name, p.cas, p.formula, p.application, p.purity, p.packing].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (View.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  if (View.sort === 'division') list.sort((a, b) => a.primaryCategory.localeCompare(b.primaryCategory) || a.name.localeCompare(b.name));
  return list;
}
function inRfq(id) { return AppState.rfqBasket.some(i => i.id === id); }

function rowHtml(p) {
  const open = View.open === p.id;
  const cmp = AppState.compare.includes(p.id);
  return `
  <div class="row ${open ? 'open' : ''}" data-id="${p.id}">
    <div class="row-main" data-toggle="${p.id}">
      <input type="checkbox" class="cmp" data-cmp="${p.id}" ${cmp ? 'checked' : ''} aria-label="Compare ${escapeHtml(p.name)}">
      <div class="nm">
        <b>${escapeHtml(p.name)}</b>
        <small>${escapeHtml(p.formula || '—')}</small>
        <span class="m-cas">CAS ${escapeHtml(p.cas || 'N/A')} · ${escapeHtml(p.purity || 'Commercial')}</span>
      </div>
      <div class="cell hide-m"><small>CAS</small><span class="cas" data-cas="${escapeHtml(p.cas)}">${escapeHtml(p.cas || 'N/A')}</span></div>
      <div class="cell hide-m"><small>Purity</small>${escapeHtml(p.purity || 'Commercial')}</div>
      <div class="cell hide-m"><small>Division</small>${escapeHtml(p.primaryCategory.replace(' Process', ''))}</div>
      <div class="row-act">
        <button class="btn btn-sm ${inRfq(p.id) ? 'btn-dark' : 'btn-ghost'}" data-rfq="${p.id}">${inRfq(p.id) ? 'Added ✓' : '+ Quote'}</button>
        <span class="chev"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>
      </div>
    </div>
    <div class="row-more"><div>
      <div class="detail">
        <div class="d"><small>Appearance</small><span>${escapeHtml(p.appearance || '—')}</span></div>
        <div class="d"><small>Molecular weight</small><span>${escapeHtml(p.molecularWeight || '—')}</span></div>
        <div class="d"><small>CAS number</small><span class="mono">${escapeHtml(p.cas || 'N/A')}</span></div>
        <div class="d"><small>Purity</small><span>${escapeHtml(p.purity || 'Commercial')}</span></div>
        <div class="d wide"><small>Packaging</small><span>${escapeHtml(p.packing || 'Bulk / drums')}</span></div>
        <div class="d wide"><small>Applications</small><span>${escapeHtml(p.application || 'Industrial processing')}</span></div>
        <div class="acts">
          <button class="btn btn-primary btn-sm" data-rfq="${p.id}">${inRfq(p.id) ? 'In quote list ✓' : 'Add to quote list'}</button>
          <button class="btn btn-wa btn-sm" data-wa="${p.id}">Ask on WhatsApp</button>
        </div>
      </div>
    </div></div>
  </div>`;
}
function tileHtml(p) {
  return `
  <article class="tile">
    <span class="tag">${escapeHtml(p.primaryCategory)}</span>
    <div><h3>${escapeHtml(p.name)}</h3><div class="fm">${escapeHtml(p.formula || '—')}</div></div>
    <div class="kv">
      <div><small>CAS</small><span class="cas" data-cas="${escapeHtml(p.cas)}">${escapeHtml(p.cas || 'N/A')}</span></div>
      <div><small>Purity</small>${escapeHtml(p.purity || 'Commercial')}</div>
    </div>
    <p class="app">${escapeHtml(p.application || '')}</p>
    <div class="tfoot">
      <label style="display:flex;gap:8px;align-items:center;font-size:.8rem;color:var(--muted)"><input type="checkbox" class="cmp" data-cmp="${p.id}" ${AppState.compare.includes(p.id) ? 'checked' : ''}> Compare</label>
      <button class="btn btn-sm ${inRfq(p.id) ? 'btn-dark' : 'btn-primary'}" data-rfq="${p.id}">${inRfq(p.id) ? 'Added ✓' : '+ Quote'}</button>
    </div>
  </article>`;
}

function renderProducts() {
  const out = $('#out');
  if (!out) return;
  const list = filtered();
  $('#count').textContent = `${list.length} of ${CHEMICAL_PRODUCTS.length} products`;
  if (!list.length) {
    out.innerHTML = `<div class="empty"><h3>No products match</h3><p>Try a different name, CAS number or division.</p><br><button class="btn btn-dark btn-sm" data-reset>Clear filters</button></div>`;
    return;
  }
  out.innerHTML = View.mode === 'list'
    ? `<div class="rows">${list.map(rowHtml).join('')}</div>`
    : `<div class="tiles">${list.map(tileHtml).join('')}</div>`;
}

function renderDivList() {
  const el = $('#divList');
  if (!el) return;
  el.innerHTML = CHEMICAL_CATEGORIES.map(c => {
    const n = c === 'All Divisions' ? CHEMICAL_PRODUCTS.length : CHEMICAL_PRODUCTS.filter(p => (p.categories || []).includes(c)).length;
    return `<li><button class="${c === View.cat ? 'on' : ''}" data-cat="${escapeHtml(c)}"><span>${escapeHtml(c)}</span><span class="k">${n}</span></button></li>`;
  }).join('');
}

function renderCmpTray() {
  const tray = $('#cmpTray');
  if (!tray) return;
  const n = AppState.compare.length;
  tray.classList.toggle('show', n > 0);
  $('#cmpN').textContent = n;
  $('#cmpGo').disabled = n < 2;
  $('#cmpGo').style.opacity = n < 2 ? .5 : 1;
}
function openCompare() {
  const items = AppState.compare.map(id => CHEMICAL_PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const rows = [['CAS', 'cas'], ['Formula', 'formula'], ['Molecular weight', 'molecularWeight'], ['Appearance', 'appearance'], ['Purity', 'purity'], ['Packaging', 'packing'], ['Applications', 'application'], ['Division', 'primaryCategory']];
  $('#cmpBody').innerHTML = `<table class="ctable"><thead><tr><th></th>${items.map(p => `<th>${escapeHtml(p.name)}</th>`).join('')}</tr></thead><tbody>` +
    rows.map(r => `<tr><th>${r[0]}</th>${items.map(p => `<td>${escapeHtml(p[r[1]] || '—')}</td>`).join('')}</tr>`).join('') + `</tbody></table>`;
  $('#cmpModal').classList.add('open'); $('#veil').classList.add('open');
}
function closeCompare() { const m = $('#cmpModal'); if (m) m.classList.remove('open'); if (!$('#rfqDrawer.open')) $('#veil').classList.remove('open'); }

function initProductsPage() {
  if (!$('#out')) return;
  const params = new URLSearchParams(location.search);
  if (params.get('category')) View.cat = params.get('category');
  if (params.get('q')) { View.q = params.get('q'); $('#q').value = View.q; }

  renderDivList(); renderProducts(); renderCmpTray();

  $('#divList').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    View.cat = b.dataset.cat; View.open = null; renderDivList(); renderProducts();
  });
  $('#q').addEventListener('input', e => { View.q = e.target.value; renderProducts(); });
  $('#sort').addEventListener('change', e => { View.sort = e.target.value; renderProducts(); });
  $('#stateChips').addEventListener('click', e => {
    const b = e.target.closest('[data-state]'); if (!b) return;
    View.state = b.dataset.state;
    $$('#stateChips .chip').forEach(c => c.classList.toggle('on', c === b));
    renderProducts();
  });
  $('#viewSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-mode]'); if (!b) return;
    View.mode = b.dataset.mode; View.open = null;
    $$('#viewSeg button').forEach(x => x.classList.toggle('on', x === b));
    renderProducts();
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); $('#q').focus(); }
  });

  $('#out').addEventListener('click', e => {
    const reset = e.target.closest('[data-reset]'); if (reset) return resetFilters();
    const cas = e.target.closest('[data-cas]');
    if (cas) { e.stopPropagation(); copyCas(cas.dataset.cas, cas); return; }
    const rfq = e.target.closest('[data-rfq]');
    if (rfq) { e.stopPropagation(); quickAddRfq(rfq.dataset.rfq, false); return; }
    const wa = e.target.closest('[data-wa]');
    if (wa) { e.stopPropagation(); sendDirectWhatsAppQuote(CHEMICAL_PRODUCTS.find(p => p.id === wa.dataset.wa)); return; }
    const cmp = e.target.closest('[data-cmp]');
    if (cmp) {
      e.stopPropagation();
      const id = cmp.dataset.cmp, i = AppState.compare.indexOf(id);
      if (i > -1) AppState.compare.splice(i, 1);
      else if (AppState.compare.length < 3) AppState.compare.push(id);
      else { cmp.checked = false; }
      renderCmpTray(); return;
    }
    const row = e.target.closest('[data-toggle]');
    if (row) {
      const id = row.dataset.toggle;
      const el = row.parentElement;
      $$('.row.open').forEach(r => { if (r !== el) r.classList.remove('open'); });
      el.classList.toggle('open');
      View.open = el.classList.contains('open') ? id : null;
    }
  });

  $('#cmpGo').addEventListener('click', openCompare);
  $('#cmpClear').addEventListener('click', () => { AppState.compare = []; renderCmpTray(); renderProducts(); });
  $('#cmpClose').addEventListener('click', closeCompare);
}

function resetFilters() {
  View.cat = 'All Divisions'; View.q = ''; View.state = 'all'; View.open = null;
  $('#q').value = '';
  $$('#stateChips .chip').forEach(c => c.classList.toggle('on', c.dataset.state === 'all'));
  renderDivList(); renderProducts();
}
function copyCas(cas, el) {
  if (!cas || cas === 'N/A') return;
  const done = () => { const t = el.textContent; el.textContent = 'Copied ✓'; setTimeout(() => { el.textContent = t; }, 1200); };
  if (navigator.clipboard) navigator.clipboard.writeText(cas).then(done); else done();
}

/* ---------- RFQ drawer ---------- */
function openRfqDrawer() {
  renderRfqItemsList();
  $('#rfqDrawer').classList.add('open'); $('#veil').classList.add('open');
}
function closeRfqDrawer() {
  $('#rfqDrawer').classList.remove('open');
  if (!$('#cmpModal.open')) $('#veil').classList.remove('open');
}
function quickAddRfq(id, openDrawer) {
  const p = CHEMICAL_PRODUCTS.find(x => x.id === id); if (!p) return;
  const idx = AppState.rfqBasket.findIndex(i => i.id === id);
  if (idx > -1) AppState.rfqBasket.splice(idx, 1);
  else AppState.rfqBasket.push({ id: p.id, name: p.name, cas: p.cas, purity: p.purity, packing: p.packing });
  saveRfqBasket();
  if ($('#out')) renderProducts();
  if (openDrawer) openRfqDrawer();
}
function removeRfqItem(id) {
  AppState.rfqBasket = AppState.rfqBasket.filter(i => i.id !== id);
  saveRfqBasket(); renderRfqItemsList(); if ($('#out')) renderProducts();
}
function renderRfqItemsList() {
  const c = $('#rfqSelectedItemsContainer'); if (!c) return;
  if (!AppState.rfqBasket.length) {
    c.innerHTML = '<div class="rfq-empty">Your list is empty. Add chemicals from the <a href="products.html" style="color:var(--accent);font-weight:600">products page</a>.</div>';
    return;
  }
  c.innerHTML = AppState.rfqBasket.map(i => `
    <div class="rfq-item"><div><b>${escapeHtml(i.name)}</b><small>CAS ${escapeHtml(i.cas || 'N/A')} · ${escapeHtml(i.purity || 'Commercial')}</small></div>
    <button type="button" onclick="removeRfqItem('${i.id}')" aria-label="Remove">&times;</button></div>`).join('');
}
function initRfqDrawer() {
  $$('.open-rfq').forEach(b => b.addEventListener('click', openRfqDrawer));
  const close = $('#closeRfq'); if (close) close.addEventListener('click', closeRfqDrawer);
  const veil = $('#veil'); if (veil) veil.addEventListener('click', () => { closeRfqDrawer(); closeCompare(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeRfqDrawer(); closeCompare(); } });
  const form = $('#rfqDrawerForm'); if (form) form.addEventListener('submit', handleRfqSubmission);
}

function handleRfqSubmission(e) {
  e.preventDefault();
  if (!AppState.rfqBasket.length) { alert('Please add at least one chemical to your quote list.'); return; }
  const v = id => $('#' + id).value.trim();
  const channel = ($('input[name="rfqChannel"]:checked') || {}).value || 'whatsapp';
  const rfq = {
    refCode: 'BC-' + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toISOString(),
    name: v('rfqName'), company: v('rfqCompany'), phone: v('rfqPhone'), email: v('rfqEmail'),
    quantity: v('rfqQuantity'), location: v('rfqLocation'), packaging: $('#rfqPackaging').value, notes: v('rfqNotes'),
    items: [...AppState.rfqBasket]
  };
  AppState.inquiryRegistry.unshift(rfq); saveInquiryRegistry();
  channel === 'email' ? dispatchEmailRFQ(rfq) : dispatchWhatsAppRFQ(rfq);
  alert('Request registered. Reference: ' + rfq.refCode + '\nOur team will get back to you shortly.');
  AppState.rfqBasket = []; saveRfqBasket(); closeRfqDrawer(); e.target.reset();
  if ($('#out')) renderProducts();
}

function dispatchWhatsAppRFQ(rfq) {
  const items = rfq.items.map(i => `• ${i.name} (CAS ${i.cas}, ${i.purity})`).join('\n');
  const text = `*QUOTATION REQUEST*\n*Ref:* ${rfq.refCode}\n\n*Buyer*\n• Company: ${rfq.company || '-'}\n• Contact: ${rfq.name}\n• Phone: ${rfq.phone}\n• Email: ${rfq.email}\n• Delivery: ${rfq.location}\n\n*Products*\n${items}\n\n• Quantity: ${rfq.quantity}\n• Packaging: ${rfq.packaging}\n• Notes: ${rfq.notes || 'None'}`;
  window.open('https://wa.me/919428001153?text=' + encodeURIComponent(text), '_blank');
}
function dispatchEmailRFQ(rfq) {
  const items = rfq.items.map(i => ` - ${i.name} [CAS ${i.cas}, ${i.purity}]`).join('\n');
  const subject = `[RFQ ${rfq.refCode}] ${rfq.company || rfq.name}`;
  const body = `Please share a quotation for:\n\nRef: ${rfq.refCode}\nDate: ${new Date().toLocaleDateString()}\n\nCompany: ${rfq.company || 'N/A'}\nContact: ${rfq.name}\nPhone: ${rfq.phone}\nEmail: ${rfq.email}\nDelivery: ${rfq.location}\n\nProducts:\n${items}\n\nQuantity: ${rfq.quantity}\nPackaging: ${rfq.packaging}\nNotes: ${rfq.notes || 'Please include TDS, COA and dispatch timeline.'}`;
  window.location.href = `mailto:info@bhagwatichemicals.in?cc=info@kcil.co.in&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function sendDirectWhatsAppQuote(p) {
  const text = `Hello Bhagwati Chemicals,\nI'd like a quote for *${p.name}* (CAS ${p.cas || 'N/A'}).\nPlease share price, MOQ and TDS.`;
  window.open('https://wa.me/919428001153?text=' + encodeURIComponent(text), '_blank');
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  loadInquiryRegistry(); loadRfqBasket();
  initNav(); initScroll(); initReveal(); initCounters();
  initRfqDrawer();
  if (typeof CHEMICAL_PRODUCTS !== 'undefined') { initDivisionCounts(); initHeroFinder(); initProductsPage(); }
});
