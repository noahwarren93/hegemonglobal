// trade-routes.js - Trade route visualization with animated arcs

var tradeRoutesActive = false;
var tradeRouteGroup = null;
var tradeRouteMeshes = [];
var tradeAnimFrame = null;
var tradeHighlightedCountry = null;
var tradeDotGroups = [];

// ===================== TRADE ROUTE DATA =====================
var TRADE_ROUTES = [
  // Largest Global (Green/Healthy)
  { from:'United States', to:'Canada', volume:783, goods:'Vehicles, Oil, Machinery, Electronics', status:'healthy',
    desc:'Largest bilateral trade relationship globally. USMCA governs this deeply integrated supply chain.',
    sanctions:'', recent:'USMCA review scheduled for 2026. Cross-border EV supply chain expanding.' },
  { from:'United States', to:'Mexico', volume:687, goods:'Vehicles, Electronics, Agricultural Products, Oil', status:'healthy',
    desc:'Second largest US trade partner. Nearshoring trend boosting Mexican manufacturing.',
    sanctions:'', recent:'Nearshoring boom driving record FDI into Mexican manufacturing.' },
  { from:'United States', to:'China', volume:582, goods:'Semiconductors, Agriculture, Consumer Electronics, Machinery', status:'tension',
    desc:'Largest bilateral trade relationship by volume. Subject to ongoing tariff disputes and tech export restrictions since 2018.',
    sanctions:'Technology export controls on advanced chips. Entity list restrictions on Huawei, SMIC.', recent:'Additional tariffs on Chinese EVs, solar panels, steel. China retaliating on US agricultural imports.' },
  { from:'United States', to:'United Kingdom', volume:295, goods:'Financial Services, Pharmaceuticals, Machinery, Oil', status:'healthy',
    desc:'Special relationship extends to deep economic ties. Post-Brexit bilateral trade agreement in negotiation.',
    sanctions:'', recent:'US-UK free trade talks resumed in 2025.' },
  { from:'United States', to:'Japan', volume:248, goods:'Vehicles, Machinery, Pharmaceuticals, Agriculture', status:'healthy',
    desc:'Cornerstone Pacific trade alliance. Japan is 4th largest US trading partner.',
    sanctions:'', recent:'Strengthened supply chain cooperation on semiconductors.' },
  { from:'United States', to:'Germany', volume:235, goods:'Vehicles, Machinery, Pharmaceuticals, Chemicals', status:'healthy',
    desc:'Largest US-EU bilateral trade corridor. German auto industry deeply tied to US market.',
    sanctions:'', recent:'EU-US Trade and Technology Council driving regulatory alignment.' },
  { from:'United States', to:'South Korea', volume:185, goods:'Semiconductors, Vehicles, Electronics, Machinery', status:'healthy',
    desc:'Key tech alliance partner. Samsung and Hyundai heavily invested in US manufacturing.',
    sanctions:'', recent:'CHIPS Act incentives drawing Korean semiconductor investment to US.' },
  { from:'India', to:'United States', volume:128, goods:'IT Services, Pharmaceuticals, Textiles, Jewelry', status:'healthy',
    desc:'Fast-growing trade partnership. India is a key US partner in the Indo-Pacific strategy.',
    sanctions:'', recent:'US-India Initiative on Critical and Emerging Technologies (iCET) expanding.' },
  { from:'China', to:'Japan', volume:318, goods:'Electronics, Chemicals, Machinery, Rare Earths', status:'tension',
    desc:'Massive trade volume despite political tensions over Taiwan and territorial disputes.',
    sanctions:'Japan restricting semiconductor equipment exports to China.', recent:'Japan tightening chip equipment export controls aligned with US policy.' },
  { from:'China', to:'South Korea', volume:268, goods:'Semiconductors, Displays, Chemicals, Electronics', status:'healthy',
    desc:'Korea exports components, China assembles. Deeply intertwined electronics supply chains.',
    sanctions:'', recent:'China restricting gallium/germanium exports affecting Korean chipmakers.' },
  { from:'China', to:'Australia', volume:221, goods:'Iron Ore, Coal, LNG, Agriculture', status:'tension',
    desc:'Australia provides raw materials for Chinese industry. Relationship strained since 2020.',
    sanctions:'China imposed tariffs on Australian wine, barley, coal.', recent:'Gradual trade normalization ongoing after diplomatic reset in 2023.' },
  { from:'China', to:'Vietnam', volume:175, goods:'Electronics Components, Textiles, Machinery', status:'healthy',
    desc:'Vietnam emerging as China-plus-one manufacturing destination. Massive border trade.',
    sanctions:'', recent:'Vietnamese electronics exports surging as supply chains diversify from China.' },
  { from:'China', to:'Thailand', volume:105, goods:'Electronics, Rubber, Fruits, Machinery', status:'healthy',
    desc:'Key ASEAN trade partner. Chinese investment in Thai EV industry accelerating.',
    sanctions:'', recent:'Chinese EV manufacturers flooding Thai market.' },
  { from:'Germany', to:'France', volume:185, goods:'Vehicles, Machinery, Chemicals, Aircraft Parts', status:'healthy',
    desc:'Backbone of EU single market. Franco-German industrial cooperation drives EU economy.',
    sanctions:'', recent:'Joint defense procurement initiatives expanding.' },
  { from:'Germany', to:'Netherlands', volume:210, goods:'Machinery, Chemicals, Vehicles, Electronics', status:'healthy',
    desc:'Netherlands is Germany\'s 2nd largest trade partner. Rotterdam is gateway for German exports.',
    sanctions:'', recent:'Joint hydrogen energy infrastructure projects.' },
  { from:'Japan', to:'South Korea', volume:82, goods:'Semiconductors, Chemicals, Machinery, Auto Parts', status:'healthy',
    desc:'Critical technology supply chain despite historical tensions. Both US allies.',
    sanctions:'', recent:'Diplomatic thaw enabling closer tech cooperation on chip supply chains.' },
  { from:'Japan', to:'Australia', volume:72, goods:'LNG, Coal, Iron Ore, Beef', status:'healthy',
    desc:'Strategic resource partnership. Australia supplies energy and minerals for Japanese industry.',
    sanctions:'', recent:'Expanded defense and critical minerals cooperation.' },
  { from:'India', to:'China', volume:136, goods:'Raw Materials, Pharmaceuticals, IT Components', status:'tension',
    desc:'Large trade volume but strategic rivals. Significant trade deficit concerns for India.',
    sanctions:'India banned 300+ Chinese apps. Restrictions on Chinese telecom equipment.', recent:'Border tensions continue to constrain economic engagement.' },
  { from:'India', to:'UAE', volume:85, goods:'Oil, Gold, Textiles, Machinery', status:'healthy',
    desc:'UAE is India\'s 3rd largest trading partner. Large Indian diaspora drives economic ties.',
    sanctions:'', recent:'CEPA free trade agreement boosting bilateral trade since 2022.' },
  { from:'Saudi Arabia', to:'China', volume:98, goods:'Crude Oil, Petrochemicals', status:'healthy',
    desc:'China is Saudi Arabia\'s largest oil customer. Petrodollar relationship evolving.',
    sanctions:'', recent:'Saudi Arabia accepting yuan for some oil sales. Aramco expanding refinery investments in China.' },
  { from:'Saudi Arabia', to:'India', volume:52, goods:'Crude Oil, LPG, Petrochemicals', status:'healthy',
    desc:'India is a major Saudi oil customer. Energy security drives close partnership.',
    sanctions:'', recent:'Strategic partnership expanding beyond oil into renewables and tech.' },
  { from:'Russia', to:'China', volume:240, goods:'Oil, Natural Gas, Timber, Minerals', status:'healthy',
    desc:'Deepening economic partnership since 2022 Western sanctions. Power of Siberia pipeline.',
    sanctions:'', recent:'Russia became China\'s top oil supplier. Yuan-denominated trade expanding rapidly.' },
  { from:'Brazil', to:'China', volume:157, goods:'Soybeans, Iron Ore, Crude Oil, Meat', status:'healthy',
    desc:'China is Brazil\'s largest trade partner. Brazil supplies agricultural and mineral commodities.',
    sanctions:'', recent:'Bilateral trade hit record levels. De-dollarization experiments with yuan settlements.' },
  // Additional Global Routes
  { from:'China', to:'Indonesia', volume:132, goods:'Electronics, Metals, Machinery, Chemicals', status:'healthy',
    desc:'Indonesia is ASEAN\'s largest economy. Major Belt and Road recipient.',
    sanctions:'', recent:'Chinese investment in Indonesian nickel processing for EV batteries surging.' },
  { from:'Japan', to:'Thailand', volume:65, goods:'Vehicles, Machinery, Electronics, Auto Parts', status:'healthy',
    desc:'Japan is Thailand\'s largest investor. Thai auto industry dominated by Japanese brands.',
    sanctions:'', recent:'Japanese firms expanding EV manufacturing in Thailand.' },
  { from:'Germany', to:'Poland', volume:158, goods:'Vehicles, Machinery, Electronics, Chemicals', status:'healthy',
    desc:'Poland is Germany\'s key eastern supply chain partner. Rapidly growing trade corridor.',
    sanctions:'', recent:'Polish manufacturing integration with German auto industry deepening.' },
  { from:'Germany', to:'Italy', volume:145, goods:'Vehicles, Machinery, Chemicals, Pharmaceuticals', status:'healthy',
    desc:'Core EU single market corridor. Italy is Germany\'s 5th largest trade partner.',
    sanctions:'', recent:'Joint EU industrial policy initiatives strengthening bilateral ties.' },
  { from:'France', to:'China', volume:82, goods:'Aerospace, Luxury Goods, Wine, Agriculture', status:'healthy',
    desc:'France is a key EU-China trade partner. Airbus and luxury exports dominate.',
    sanctions:'', recent:'Macron pursuing balanced approach between US and China on trade policy.' },
  { from:'Turkey', to:'Russia', volume:68, goods:'Agriculture, Textiles, Construction, Energy', status:'tension',
    desc:'Turkey maintaining trade ties despite Western sanctions. Key energy transit route.',
    sanctions:'Western pressure on Turkey over sanctions evasion.', recent:'Turkish banks facing secondary sanctions risk for Russian trade facilitation.' },
  { from:'Turkey', to:'Germany', volume:48, goods:'Vehicles, Textiles, Machinery, Agriculture', status:'healthy',
    desc:'Germany hosts 3M+ Turkish diaspora. Deep economic and cultural ties.',
    sanctions:'', recent:'EU customs union modernization talks with Turkey ongoing.' },
  { from:'India', to:'Russia', volume:65, goods:'Crude Oil, Fertilizers, Diamonds, Arms', status:'healthy',
    desc:'India dramatically increased Russian oil imports since 2022 sanctions.',
    sanctions:'', recent:'India now Russia\'s second largest oil customer. Rupee-ruble trade expanding.' },
  { from:'South Korea', to:'Vietnam', volume:78, goods:'Electronics Components, Machinery, Chemicals', status:'healthy',
    desc:'Vietnam is Samsung\'s largest manufacturing base outside Korea.',
    sanctions:'', recent:'Korean tech firms expanding Vietnam operations as China alternative.' },
  { from:'United States', to:'Taiwan', volume:115, goods:'Semiconductors, Electronics, Machinery', status:'tension',
    desc:'Critical semiconductor supply chain. TSMC supplies most advanced chips globally.',
    sanctions:'', recent:'US CHIPS Act driving TSMC investment in Arizona fabs. China tensions rising.' },
  { from:'China', to:'Brazil', volume:157, goods:'Electronics, Machinery, Textiles, Chemicals', status:'healthy',
    desc:'China is Brazil\'s top import source. Growing dependency on Chinese manufactured goods.',
    sanctions:'', recent:'BRICS expansion strengthening China-Brazil economic coordination.' },
  { from:'Saudi Arabia', to:'Japan', volume:42, goods:'Crude Oil, LNG, Petrochemicals', status:'healthy',
    desc:'Japan remains a major Saudi oil customer despite diversification efforts.',
    sanctions:'', recent:'Saudi-Japan clean energy partnership expanding beyond fossil fuels.' },
  { from:'United Kingdom', to:'Netherlands', volume:78, goods:'Oil, Financial Services, Machinery, Chemicals', status:'healthy',
    desc:'Major North Sea trade corridor. Post-Brexit trade adjustments ongoing.',
    sanctions:'', recent:'UK-EU trade friction continuing to affect cross-Channel commerce.' },
  { from:'Mexico', to:'China', volume:92, goods:'Electronics, Machinery, Auto Parts, Chemicals', status:'tension',
    desc:'Mexico importing heavily from China while US pushes nearshoring agenda.',
    sanctions:'', recent:'Concerns over Chinese goods transshipped through Mexico to circumvent US tariffs.' },
  { from:'India', to:'Saudi Arabia', volume:52, goods:'Textiles, Rice, Machinery, Refined Petroleum', status:'healthy',
    desc:'India exports diverse goods to Saudi Arabia while importing energy.',
    sanctions:'', recent:'Indian workers form largest expatriate community in Saudi Arabia.' },
  { from:'Argentina', to:'Brazil', volume:26, goods:'Vehicles, Agricultural Products, Chemicals', status:'healthy',
    desc:'Mercosur backbone. Deeply integrated automotive supply chain.',
    sanctions:'', recent:'Mercosur-EU trade agreement negotiations in final stages.' },

  // Sanctioned/Restricted (Red)
  { from:'United States', to:'Russia', volume:12, goods:'Limited — Agricultural Products', status:'sanctioned',
    desc:'Comprehensive sanctions regime since 2022 invasion of Ukraine. Trade collapsed from $35B pre-war.',
    sanctions:'Full energy sanctions, SWIFT disconnection for major banks, technology export bans, oligarch asset freezes.', recent:'12th round of sanctions expanding secondary sanctions on third-country entities.' },
  { from:'United States', to:'Iran', volume:0.1, goods:'Humanitarian Goods Only', status:'sanctioned',
    desc:'Comprehensive US sanctions since 1979 revolution. Near-total trade embargo.',
    sanctions:'Full trade embargo, oil export sanctions, banking sanctions, IRGC designation.', recent:'Sanctions enforcement tightened. Iran oil exports still reaching China via gray market.' },
  { from:'United States', to:'North Korea', volume:0, goods:'None — Full Embargo', status:'sanctioned',
    desc:'Complete trade embargo. No legal trade between US and DPRK.',
    sanctions:'Full UN Security Council sanctions. Complete trade and financial embargo.', recent:'No diplomatic progress. North Korea continues nuclear/missile programs.' },
  { from:'European Union', to:'Russia', volume:45, goods:'Limited — Food, Pharmaceuticals', status:'sanctioned',
    desc:'EU imposed comprehensive sanctions after 2022 invasion. Trade down 65% from pre-war levels.',
    sanctions:'Oil import ban, coal ban, technology export restrictions, diamond ban, luxury goods ban.', recent:'14th sanctions package targeting circumvention routes through Central Asia.' },
  { from:'United States', to:'Cuba', volume:0.3, goods:'Agricultural Products, Medicine', status:'sanctioned',
    desc:'US trade embargo since 1962. Longest-running embargo in modern history.',
    sanctions:'Full trade embargo under Helms-Burton Act. Travel restrictions.', recent:'No significant policy changes. Embargo remains in full effect.' },
  { from:'Iran', to:'China', volume:30, goods:'Crude Oil (gray market), Petrochemicals', status:'sanctioned',
    desc:'Iran exports oil to China despite US sanctions via ship-to-ship transfers.',
    sanctions:'US secondary sanctions on entities facilitating Iran oil trade.', recent:'Iran oil reaching China at ~1.5M barrels/day through gray market channels.' }
];

// Country trade profiles for click-to-highlight feature
var COUNTRY_TRADE_PROFILES = {
  'United States': { exports:'Refined Petroleum, Aircraft, Soybeans, Integrated Circuits, Vehicles', imports:'Crude Oil, Vehicles, Electronics, Pharmaceuticals, Machinery', agreements:'USMCA, US-Korea FTA, US-Japan Trade Agreement, US-Australia FTA', topPartners:['Canada','Mexico','China','Japan','Germany','United Kingdom','South Korea','India','Brazil','France'] },
  'China': { exports:'Electronics, Machinery, Textiles, Furniture, Plastics', imports:'Crude Oil, Iron Ore, Integrated Circuits, Soybeans, Copper', agreements:'RCEP, ASEAN-China FTA, China-Australia FTA (strained)', topPartners:['United States','Japan','South Korea','Vietnam','Germany','Australia','Russia','Brazil','Thailand','India'] },
  'Russia': { exports:'Crude Oil, Natural Gas, Metals, Wheat, Arms', imports:'Machinery, Vehicles, Electronics, Pharmaceuticals', agreements:'EAEU, CIS FTA, Russia-India trade agreements', topPartners:['China','India','Turkey','Germany','South Korea','Japan','United States','Brazil'] },
  'India': { exports:'IT Services, Refined Petroleum, Pharmaceuticals, Gems, Textiles', imports:'Crude Oil, Gold, Electronics, Machinery, Coal', agreements:'CEPA (UAE), India-ASEAN FTA, SAFTA, India-Japan CEPA', topPartners:['United States','China','UAE','Saudi Arabia','Germany','South Korea','Japan','United Kingdom'] },
  'Japan': { exports:'Vehicles, Machinery, Electronics, Chemicals, Steel', imports:'Crude Oil, LNG, Electronics, Clothing, Pharmaceuticals', agreements:'CPTPP, RCEP, Japan-EU EPA, Japan-US Trade Agreement', topPartners:['China','United States','South Korea','Australia','Thailand','Germany','Vietnam'] },
  'Germany': { exports:'Vehicles, Machinery, Chemicals, Electronics, Pharmaceuticals', imports:'Machinery, Vehicles, Oil, Electronics, Chemicals', agreements:'EU Single Market, EU-Japan EPA, EU-Canada CETA', topPartners:['United States','China','France','Netherlands','Poland','United Kingdom','Italy'] },
  'United Kingdom': { exports:'Vehicles, Machinery, Pharmaceuticals, Oil, Financial Services', imports:'Vehicles, Machinery, Electronics, Oil, Pharmaceuticals', agreements:'UK-Australia FTA, UK-Japan CEPA, CPTPP (acceded 2023)', topPartners:['United States','Germany','Netherlands','France','China','Ireland','Japan'] },
  'Brazil': { exports:'Soybeans, Iron Ore, Crude Oil, Beef, Sugar', imports:'Refined Petroleum, Electronics, Vehicles, Pharmaceuticals', agreements:'Mercosur, Mercosur-EU (pending), BRICS trade initiatives', topPartners:['China','United States','Argentina','Germany','Japan','South Korea','India'] },
  'South Korea': { exports:'Semiconductors, Vehicles, Ships, Electronics, Steel', imports:'Crude Oil, Semiconductors, Natural Gas, Coal, Machinery', agreements:'RCEP, CPTPP (pending), Korea-US FTA, Korea-EU FTA', topPartners:['China','United States','Japan','Vietnam','Germany','Australia','India'] },
  'Saudi Arabia': { exports:'Crude Oil, Refined Petroleum, Petrochemicals, Plastics', imports:'Vehicles, Machinery, Electronics, Food, Weapons', agreements:'GCC, OPEC+, Saudi-India agreements', topPartners:['China','India','Japan','South Korea','United States','Germany','UAE'] }
};

function getCountryCoords(name) {
  if (COUNTRIES[name]) return { lat: COUNTRIES[name].lat, lng: COUNTRIES[name].lng };
  var fb = {
    'European Union':{lat:50.85,lng:4.35},'South Korea':{lat:35.91,lng:127.77},
    'Australia':{lat:-25.27,lng:133.78},'Canada':{lat:56.13,lng:-106.35},
    'Mexico':{lat:23.63,lng:-102.55},'Cuba':{lat:21.52,lng:-77.78},
    'North Korea':{lat:40.34,lng:127.51},'Indonesia':{lat:-6.21,lng:106.85},
    'Thailand':{lat:13.76,lng:100.50},'Vietnam':{lat:21.03,lng:105.85},
    'Poland':{lat:52.23,lng:21.01},'Italy':{lat:41.90,lng:12.50},
    'France':{lat:48.86,lng:2.35},'Netherlands':{lat:52.37,lng:4.90},
    'Taiwan':{lat:25.03,lng:121.57},'Argentina':{lat:-34.60,lng:-58.38}
  };
  return fb[name] || { lat: 0, lng: 0 };
}

function createArcPoints(start, end, segs, h) {
  segs = segs || 50; h = h || 0.15;
  var pts = [];
  // Handle longitude wrapping for routes that cross the date line
  var dLng = end.lng - start.lng;
  if (dLng > 180) dLng -= 360;
  if (dLng < -180) dLng += 360;
  for (var i = 0; i <= segs; i++) {
    var t = i / segs;
    var lat = start.lat + (end.lat - start.lat) * t;
    var lng = start.lng + dLng * t;
    var arcH = Math.sin(t * Math.PI) * h;
    pts.push(latLngToVector3(lat, lng, 1.02 + arcH));
  }
  return pts;
}

function toggleTradeRoutes() {
  tradeRoutesActive = !tradeRoutesActive;
  var btn = document.getElementById('tradeRoutesBtn');
  if (btn) btn.classList.toggle('active', tradeRoutesActive);
  if (tradeRoutesActive) {
    showTradeRoutes();
  } else {
    hideTradeRoutes();
    closeTradeInfoPanel();
    tradeHighlightedCountry = null;
  }
}

function showTradeRoutes(highlightCountry) {
  if (!globe || !scene) return;
  hideTradeRoutes();
  tradeRouteGroup = new THREE.Group();
  tradeRouteMeshes = [];
  tradeDotGroups = [];

  TRADE_ROUTES.forEach(function(route, idx) {
    var fc = getCountryCoords(route.from);
    var tc = getCountryCoords(route.to);
    var vol = route.volume;
    var arcHeight = 0.08 + Math.min(0.18, vol / 3000);
    var pts = createArcPoints(fc, tc, 64, arcHeight);

    // Color by status
    var color = route.status === 'healthy' ? 0x22c55e : route.status === 'sanctioned' ? 0xef4444 : 0xf59e0b;

    // Line width simulation: use thicker tube-like effect for higher volumes
    var lineOpacity = 0.7;
    // Dim routes not involving highlighted country
    if (highlightCountry && route.from !== highlightCountry && route.to !== highlightCountry) {
      lineOpacity = 0.08;
    }

    // Draw main line + parallel offset lines for visual thickness (WebGL ignores linewidth > 1)
    var offsets = [0, 0.0012, -0.0012];
    for (var oi = 0; oi < offsets.length; oi++) {
      var drawPts = pts;
      if (offsets[oi] !== 0) {
        drawPts = pts.map(function(p) { return new THREE.Vector3(p.x + offsets[oi], p.y + offsets[oi] * 0.5, p.z); });
      }
      var geom = new THREE.BufferGeometry().setFromPoints(drawPts);
      var mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: oi === 0 ? lineOpacity : lineOpacity * 0.6, linewidth: 2 });
      var line = new THREE.Line(geom, mat);
      if (oi === 0) {
        line.userData = { routeIndex: idx, route: route };
        tradeRouteMeshes.push(line);
      }
      tradeRouteGroup.add(line);
    }

    // Add animated flowing dots along the route
    if (lineOpacity > 0.1) {
      var dotCount = Math.max(1, Math.min(4, Math.floor(vol / 200)));
      for (var d = 0; d < dotCount; d++) {
        var dotGeom = new THREE.SphereGeometry(0.008, 6, 6);
        var dotMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9 });
        var dot = new THREE.Mesh(dotGeom, dotMat);
        dot.userData = { arcPoints: pts, offset: d / dotCount, speed: 0.003 + Math.random() * 0.002 };
        tradeRouteGroup.add(dot);
        tradeDotGroups.push(dot);
      }
    }
  });

  globe.add(tradeRouteGroup);
  startTradeAnimation();
}

function hideTradeRoutes() {
  stopTradeAnimation();
  if (tradeRouteGroup && globe) {
    globe.remove(tradeRouteGroup);
    // Dispose geometries and materials
    tradeRouteGroup.traverse(function(child) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    tradeRouteGroup = null;
  }
  tradeRouteMeshes = [];
  tradeDotGroups = [];
}

// Animation loop for flowing dots
function startTradeAnimation() {
  function animateDots() {
    tradeAnimFrame = requestAnimationFrame(animateDots);
    tradeDotGroups.forEach(function(dot) {
      var d = dot.userData;
      d.offset = (d.offset + d.speed) % 1;
      var idx = Math.floor(d.offset * (d.arcPoints.length - 1));
      var nextIdx = Math.min(idx + 1, d.arcPoints.length - 1);
      var frac = (d.offset * (d.arcPoints.length - 1)) - idx;
      var p = d.arcPoints[idx];
      var np = d.arcPoints[nextIdx];
      dot.position.set(
        p.x + (np.x - p.x) * frac,
        p.y + (np.y - p.y) * frac,
        p.z + (np.z - p.z) * frac
      );
    });
  }
  animateDots();
}

function stopTradeAnimation() {
  if (tradeAnimFrame) {
    cancelAnimationFrame(tradeAnimFrame);
    tradeAnimFrame = null;
  }
}

// Handle clicking on trade routes or countries while trade mode is active
function handleTradeClick(countryName) {
  if (!tradeRoutesActive) return false;

  // Toggle highlight for this country
  if (tradeHighlightedCountry === countryName) {
    tradeHighlightedCountry = null;
    showTradeRoutes(); // Reset all routes to full opacity
    closeTradeInfoPanel();
  } else {
    tradeHighlightedCountry = countryName;
    showTradeRoutes(countryName);
    showCountryTradePanel(countryName);
  }
  return true;
}

function showCountryTradePanel(name) {
  var panel = document.getElementById('tradeInfoPanel');
  var title = document.getElementById('tradeInfoTitle');
  var body = document.getElementById('tradeInfoBody');
  if (!panel || !body) return;

  var c = COUNTRIES[name];
  var profile = COUNTRY_TRADE_PROFILES[name];
  var flag = c ? c.flag : '';

  // Find all routes involving this country
  var countryRoutes = TRADE_ROUTES.filter(function(r) { return r.from === name || r.to === name; })
    .sort(function(a, b) { return b.volume - a.volume; });

  if (title) title.innerHTML = flag + ' ' + name + ' Trade';

  var html = '';

  // Trading partners
  html += '<div class="trade-section"><div class="trade-section-title">TOP TRADING PARTNERS</div>';
  countryRoutes.slice(0, 8).forEach(function(r) {
    var partner = r.from === name ? r.to : r.from;
    var pFlag = COUNTRIES[partner] ? COUNTRIES[partner].flag : '';
    var statusColor = r.status === 'healthy' ? '#22c55e' : r.status === 'sanctioned' ? '#ef4444' : '#f59e0b';
    html += '<div class="trade-partner-row">' +
      '<span class="trade-partner-name">' + pFlag + ' ' + partner + '</span>' +
      '<span class="trade-partner-vol">$' + r.volume + 'B</span>' +
      '<span class="trade-partner-status" style="color:' + statusColor + '">' + r.status.toUpperCase() + '</span>' +
    '</div>';
  });
  html += '</div>';

  if (profile) {
    html += '<div class="trade-section"><div class="trade-section-title">EXPORTS</div><div class="trade-section-text">' + profile.exports + '</div></div>';
    html += '<div class="trade-section"><div class="trade-section-title">IMPORTS</div><div class="trade-section-text">' + profile.imports + '</div></div>';
    html += '<div class="trade-section"><div class="trade-section-title">TRADE AGREEMENTS</div><div class="trade-section-text">' + profile.agreements + '</div></div>';
  }

  // Sanctions
  var sanctionRoutes = countryRoutes.filter(function(r) { return r.status === 'sanctioned' && r.sanctions; });
  if (sanctionRoutes.length > 0) {
    html += '<div class="trade-section"><div class="trade-section-title" style="color:#ef4444;">ACTIVE SANCTIONS</div>';
    sanctionRoutes.forEach(function(r) {
      var partner = r.from === name ? r.to : r.from;
      html += '<div class="trade-section-text" style="color:#fca5a5;">vs ' + partner + ': ' + r.sanctions + '</div>';
    });
    html += '</div>';
  }

  body.innerHTML = html;
  panel.classList.add('active');
}

function showTradeRouteTooltip(route, x, y) {
  var tt = document.getElementById('tradeTooltip');
  if (!tt) return;
  var fromFlag = COUNTRIES[route.from] ? COUNTRIES[route.from].flag : '';
  var toFlag = COUNTRIES[route.to] ? COUNTRIES[route.to].flag : '';
  var statusColor = route.status === 'healthy' ? '#22c55e' : route.status === 'sanctioned' ? '#ef4444' : '#f59e0b';

  tt.innerHTML =
    '<div style="font-size:12px;font-weight:700;margin-bottom:6px;">' + fromFlag + ' ' + route.from + ' ↔ ' + toFlag + ' ' + route.to + '</div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#6b7280;">Volume:</span><span style="color:#e5e7eb;font-weight:600;">$' + route.volume + 'B/yr</span></div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#6b7280;">Status:</span><span style="color:' + statusColor + ';font-weight:600;">' + route.status.toUpperCase() + '</span></div>' +
    '<div style="color:#9ca3af;margin-bottom:4px;"><span style="color:#6b7280;">Goods:</span> ' + route.goods + '</div>' +
    '<div style="color:#9ca3af;font-size:9px;margin-top:6px;border-top:1px solid #1f2937;padding-top:6px;">' + route.desc + '</div>' +
    (route.sanctions ? '<div style="color:#fca5a5;font-size:9px;margin-top:4px;">⚠ ' + route.sanctions + '</div>' : '') +
    (route.recent ? '<div style="color:#06b6d4;font-size:9px;margin-top:4px;">📌 ' + route.recent + '</div>' : '');

  tt.style.display = 'block';
  tt.style.left = Math.min(x + 15, window.innerWidth - 340) + 'px';
  tt.style.top = Math.min(y + 15, window.innerHeight - 250) + 'px';
}

function hideTradeRouteTooltip() {
  var tt = document.getElementById('tradeTooltip');
  if (tt) tt.style.display = 'none';
}

function closeTradeInfoPanel() {
  var panel = document.getElementById('tradeInfoPanel');
  if (panel) panel.classList.remove('active');
}

// ===================== SEARCH OVERLAY =====================

function openSearchOverlay() {
  var overlay = document.getElementById('searchOverlay');
  if (overlay) {
    overlay.classList.add('active');
    var input = document.getElementById('globeSearchInput');
    if (input) { input.value = ''; input.focus(); }
    var results = document.getElementById('globeSearchResults');
    if (results) results.innerHTML = '<div style="color:#6b7280;font-size:11px;text-align:center;padding:20px;">Type to search ' + Object.keys(COUNTRIES).length + ' countries...</div>';
  }
}

function closeSearchOverlay() {
  var overlay = document.getElementById('searchOverlay');
  if (overlay) overlay.classList.remove('active');
}

function searchCountriesGlobe(query) {
  var results = document.getElementById('globeSearchResults');
  if (!results) return;
  if (!query) { results.innerHTML = '<div style="color:#6b7280;font-size:11px;text-align:center;padding:20px;">Type to search...</div>'; return; }
  var matches = Object.entries(COUNTRIES).filter(function(e) {
    var name = e[0], c = e[1];
    return name.toLowerCase().includes(query.toLowerCase()) || c.region.toLowerCase().includes(query.toLowerCase()) || (c.title && c.title.toLowerCase().includes(query.toLowerCase()));
  });
  if (matches.length) {
    results.innerHTML = matches.map(function(e) {
      var name = e[0], c = e[1];
      return '<div class="search-overlay-item" onclick="closeSearchOverlay();openModal(\'' + name + '\')">' +
        '<span>' + c.flag + ' ' + name + '</span>' +
        '<span class="wl-risk risk-' + c.risk + '" style="font-size:8px;padding:2px 5px;">' + c.risk.toUpperCase() + '</span>' +
      '</div>';
    }).join('');
  } else {
    results.innerHTML = '<div style="color:#6b7280;font-size:11px;text-align:center;padding:20px;">No countries found</div>';
  }
}
