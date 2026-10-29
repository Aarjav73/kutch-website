/* Shared header, footer and RFQ drawer — injected on every page. */
(function () {
  var page = document.body.getAttribute('data-page') || '';
  var links = [
    ['home', 'index.html', 'Home'],
    ['products', 'products.html', 'Products'],
    ['about', 'about.html', 'About'],
    ['plants', 'infrastructure.html', 'Plants'],
    ['contact', 'contact.html', 'Contact']
  ];
  var nav = links.map(function (l) {
    return '<a href="' + l[1] + '"' + (l[0] === page ? ' class="active"' : '') + '>' + l[2] + '</a>';
  }).join('') +
  '<div class="links-actions">' +
    '<button class="rfq-btn open-rfq" type="button" aria-label="Open quote list">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
      '<span class="t">Quote list</span><span class="rfq-count rfq-count-badge">0</span>' +
    '</button>' +
    '<a class="btn btn-primary btn-sm" href="inquiry.html" style="justify-content:center">Request quote <span class="arr">→</span></a>' +
  '</div>';

  var header = '' +
    '<header class="nav" id="nav"><div class="wrap nav-in">' +
      '<a class="brand" href="index.html" aria-label="Bhagwati Chemicals home">' +
        '<img src="assets/images/bhagwati_logo.webp" alt="">' +
        '<span class="brand-t"><b>BHAGWATI CHEMICALS</b><span>Est. 1985 · Ahmedabad</span></span>' +
      '</a>' +
      '<nav class="links" id="links">' + nav + '</nav>' +
      '<div class="nav-actions">' +
        '<button class="rfq-btn open-rfq" type="button" aria-label="Open quote list">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
          '<span class="t">Quote list</span><span class="rfq-count rfq-count-badge">0</span>' +
        '</button>' +
        '<a class="btn btn-dark btn-sm quote" href="inquiry.html">Request quote</a>' +
        '<button class="burger" id="burger" type="button" aria-label="Menu"><span></span></button>' +
      '</div>' +
    '</div></header>';

  var footer = '' +
    '<footer class="foot"><div class="wrap">' +
      '<div class="foot-g">' +
        '<div><a class="brand" href="index.html"><img src="assets/images/bhagwati_logo.webp" alt="" style="height:40px;background:#fff;border-radius:8px;padding:4px"><span class="brand-t"><b>BHAGWATI CHEMICALS</b><span>Est. 1985 · Ahmedabad</span></span></a>' +
        '<p>Industrial chemicals for pharma, agro, dyes and process industries. Reliable quality, honest pricing, on-time dispatch.</p></div>' +
        '<div><h4>Explore</h4><ul>' +
          '<li><a href="products.html">All products</a></li><li><a href="about.html">About us</a></li><li><a href="infrastructure.html">Plants</a></li><li><a href="inquiry.html">Request a quote</a></li><li><a href="contact.html">Contact</a></li></ul></div>' +
        '<div><h4>Divisions</h4><ul>' +
          '<li><a href="products.html?category=Chlorination+Process">Chlorination</a></li><li><a href="products.html?category=Nitration+Process">Nitration</a></li><li><a href="products.html?category=Hydrogenation+Process">Hydrogenation</a></li><li><a href="products.html?category=Acid+Chlorides">Acid chlorides</a></li><li><a href="products.html?category=Sulphuric+%26+Bulk+Chemical+Division">Sulphuric &amp; bulk</a></li></ul></div>' +
        '<div><h4>Reach us</h4><ul>' +
          '<li>207, New Cloth Market, Outside Raipur Gate, Ahmedabad 380002</li>' +
          '<li><a href="tel:+919428001153">+91 94280 01153</a></li><li><a href="tel:+919825030103">+91 98250 30103</a></li>' +
          '<li><a href="mailto:info@bhagwatichemicals.in">info@bhagwatichemicals.in</a></li></ul></div>' +
      '</div>' +
      '<div class="foot-b"><span>© 2026 Bhagwati Chemicals. All rights reserved.</span><span>ISO 9001:2015 Certified</span></div>' +
    '</div></footer>';

  var drawer = '' +
    '<div class="veil" id="veil"></div>' +
    '<aside class="drawer" id="rfqDrawer" aria-label="Quote list">' +
      '<div class="drawer-h"><div><h3>Your quote list</h3><small>Send everything in one request</small></div>' +
      '<button class="btn btn-ghost btn-sm" id="closeRfq" type="button">Close</button></div>' +
      '<div class="drawer-b">' +
        '<div id="rfqSelectedItemsContainer" style="margin-bottom:22px"></div>' +
        '<form id="rfqDrawerForm">' +
          '<div class="two"><div class="field"><label for="rfqName">Name *</label><input class="input" id="rfqName" required></div>' +
          '<div class="field"><label for="rfqCompany">Company *</label><input class="input" id="rfqCompany" required></div></div>' +
          '<div class="two"><div class="field"><label for="rfqPhone">Phone / WhatsApp *</label><input class="input" id="rfqPhone" type="tel" required></div>' +
          '<div class="field"><label for="rfqEmail">Email *</label><input class="input" id="rfqEmail" type="email" required></div></div>' +
          '<div class="two"><div class="field"><label for="rfqQuantity">Quantity *</label><input class="input" id="rfqQuantity" placeholder="e.g. 15 MT" required></div>' +
          '<div class="field"><label for="rfqPackaging">Packaging</label><select class="input" id="rfqPackaging"><option>Road Tanker</option><option>ISO Tank</option><option>250 Kg Drums</option><option>HDPE Carboys</option><option>Jumbo Bags</option><option>25-50 Kg Bags</option></select></div></div>' +
          '<div class="field"><label for="rfqLocation">Delivery location *</label><input class="input" id="rfqLocation" placeholder="City / port" required></div>' +
          '<div class="field"><label for="rfqNotes">Notes</label><textarea class="input" id="rfqNotes" rows="2" placeholder="Purity, timeline, documents needed"></textarea></div>' +
          '<div class="radio-row">' +
            '<label><input type="radio" name="rfqChannel" value="whatsapp" checked><span>Send via WhatsApp</span></label>' +
            '<label><input type="radio" name="rfqChannel" value="email"><span>Send via email</span></label>' +
          '</div>' +
          '<button class="btn btn-primary" style="width:100%" type="submit">Send request <span class="arr">→</span></button>' +
        '</form>' +
      '</div>' +
    '</aside>';

  var h = document.getElementById('site-header');
  var f = document.getElementById('site-footer');
  if (h) h.outerHTML = header;
  if (f) f.outerHTML = footer;
  document.body.insertAdjacentHTML('beforeend', drawer);
})();

