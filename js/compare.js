// compare.js - Compare mode, radar chart

var compareModeActive = false;
var compareCountries = [];
var COMPARE_COLORS = ['#3b82f6', '#ef4444', '#22c55e'];
const COMPARE_DATA = {
  'United States': { gdp:'25.46T', gdpGrowth:'2.5%', gdpPerCapita:'$76,330', inflation:'3.1%', unemployment:'3.7%', debt:'123%', milSpend:'$886B', milPercent:'3.5%', milPersonnel:'1.39M', nuclear:'Yes', alliances:'NATO, AUKUS, Quad', pop:'334M', medianAge:'38.9', democracy:'7.85', pressFreedom:'45th', hdi:'0.921', stockYTD:'+8.2%', fdi:'$285B' },
  'China': { gdp:'17.96T', gdpGrowth:'5.2%', gdpPerCapita:'$12,720', inflation:'0.2%', unemployment:'5.2%', debt:'83%', milSpend:'$296B', milPercent:'1.7%', milPersonnel:'2.03M', nuclear:'Yes', alliances:'SCO, BRICS', pop:'1.41B', medianAge:'39.0', democracy:'1.94', pressFreedom:'179th', hdi:'0.768', stockYTD:'-2.1%', fdi:'$163B' },
  'Russia': { gdp:'1.78T', gdpGrowth:'3.6%', gdpPerCapita:'$12,200', inflation:'7.4%', unemployment:'2.9%', debt:'22%', milSpend:'$109B', milPercent:'6.1%', milPersonnel:'1.15M', nuclear:'Yes', alliances:'CSTO, SCO, BRICS', pop:'144M', medianAge:'40.3', democracy:'2.22', pressFreedom:'164th', hdi:'0.822', stockYTD:'-5.4%', fdi:'$18B' },
  'India': { gdp:'3.73T', gdpGrowth:'7.8%', gdpPerCapita:'$2,612', inflation:'5.1%', unemployment:'8.0%', debt:'82%', milSpend:'$83B', milPercent:'2.4%', milPersonnel:'1.46M', nuclear:'Yes', alliances:'Quad, BRICS', pop:'1.43B', medianAge:'28.7', democracy:'7.04', pressFreedom:'161st', hdi:'0.644', stockYTD:'+4.5%', fdi:'$49B' },
  'Japan': { gdp:'4.23T', gdpGrowth:'1.9%', gdpPerCapita:'$33,815', inflation:'3.3%', unemployment:'2.6%', debt:'264%', milSpend:'$55B', milPercent:'1.3%', milPersonnel:'247K', nuclear:'No', alliances:'US-Japan, Quad', pop:'124M', medianAge:'48.6', democracy:'8.33', pressFreedom:'68th', hdi:'0.920', stockYTD:'+12.3%', fdi:'$33B' },
  'United Kingdom': { gdp:'3.07T', gdpGrowth:'0.1%', gdpPerCapita:'$45,850', inflation:'4.0%', unemployment:'4.3%', debt:'101%', milSpend:'$68B', milPercent:'2.3%', milPersonnel:'150K', nuclear:'Yes', alliances:'NATO, AUKUS', pop:'67M', medianAge:'40.6', democracy:'8.54', pressFreedom:'26th', hdi:'0.929', stockYTD:'+3.1%', fdi:'$78B' },
  'Brazil': { gdp:'2.13T', gdpGrowth:'2.9%', gdpPerCapita:'$9,920', inflation:'4.6%', unemployment:'7.8%', debt:'74%', milSpend:'$22B', milPercent:'1.1%', milPersonnel:'367K', nuclear:'No', alliances:'BRICS', pop:'214M', medianAge:'34.3', democracy:'6.78', pressFreedom:'92nd', hdi:'0.754', stockYTD:'-4.2%', fdi:'$62B' },
  'South Korea': { gdp:'1.67T', gdpGrowth:'1.4%', gdpPerCapita:'$32,423', inflation:'3.6%', unemployment:'2.7%', debt:'54%', milSpend:'$54B', milPercent:'2.8%', milPersonnel:'555K', nuclear:'No', alliances:'US-ROK', pop:'52M', medianAge:'44.6', democracy:'8.03', pressFreedom:'47th', hdi:'0.925', stockYTD:'+6.1%', fdi:'$18B' },
  'Saudi Arabia': { gdp:'1.07T', gdpGrowth:'-0.8%', gdpPerCapita:'$30,436', inflation:'1.6%', unemployment:'4.9%', debt:'26%', milSpend:'$75B', milPercent:'6.0%', milPersonnel:'257K', nuclear:'No', alliances:'GCC, OPEC+', pop:'36M', medianAge:'31.8', democracy:'2.08', pressFreedom:'166th', hdi:'0.875', stockYTD:'+1.2%', fdi:'$12B' },
  'Turkey': { gdp:'1.11T', gdpGrowth:'4.5%', gdpPerCapita:'$12,850', inflation:'65%', unemployment:'9.4%', debt:'34%', milSpend:'$16B', milPercent:'1.4%', milPersonnel:'425K', nuclear:'No', alliances:'NATO', pop:'85M', medianAge:'32.2', democracy:'4.35', pressFreedom:'165th', hdi:'0.838', stockYTD:'+15.2%', fdi:'$10B' }
};

function toggleCompareMode() {
  compareModeActive = !compareModeActive;
  document.getElementById('compareModeBtn').classList.toggle('active', compareModeActive);
  var instruction = document.getElementById('compareInstruction');
  var panel = document.getElementById('comparePanel');
  if (compareModeActive) {
    instruction.style.display = 'block'; compareCountries = []; renderComparePanel();
  } else {
    instruction.style.display = 'none'; panel.classList.remove('active'); compareCountries = [];
    countryMeshes.forEach(function(m) { if (m.material) m.material.opacity = 0.95; });
  }
}

function addCountryToCompare(name) {
  if (!compareModeActive) return false;
  if (compareCountries.includes(name)) { removeCountryFromCompare(name); return true; }
  if (compareCountries.length >= 3) compareCountries.shift();
  compareCountries.push(name);
  document.getElementById('compareInstruction').style.display = 'none';
  countryMeshes.forEach(function(m) {
    if (compareCountries.includes(m.userData.name)) {
      var idx = compareCountries.indexOf(m.userData.name);
      m.material.color.set(COMPARE_COLORS[idx]); m.material.opacity = 1.0;
    } else { m.material.opacity = 0.3; }
  });
  renderComparePanel(); return true;
}

function removeCountryFromCompare(name) {
  compareCountries = compareCountries.filter(function(n) { return n !== name; });
  if (compareCountries.length === 0 && compareModeActive) document.getElementById('compareInstruction').style.display = 'block';
  countryMeshes.forEach(function(m) {
    if (compareCountries.includes(m.userData.name)) {
      var idx = compareCountries.indexOf(m.userData.name);
      m.material.color.set(COMPARE_COLORS[idx]); m.material.opacity = 1.0;
    } else {
      m.material.opacity = compareModeActive ? 0.3 : 0.95;
      if (m.userData.data && RISK_COLORS[m.userData.data.risk]) m.material.color.set(RISK_COLORS[m.userData.data.risk].glow);
    }
  });
  renderComparePanel();
}

function renderComparePanel() {
  var panel = document.getElementById('comparePanel');
  var chipsEl = document.getElementById('compareCountries');
  var contentEl = document.getElementById('compareContent');
  var dataArea = document.getElementById('compareDataArea');
  if (compareCountries.length === 0) { panel.classList.remove('active'); panel.classList.remove('expanded'); return; }
  panel.classList.add('active');

  // Expand panel when 2+ countries are selected (show radar + tables)
  if (compareCountries.length >= 2) {
    panel.classList.add('expanded');
  } else {
    panel.classList.remove('expanded');
  }

  chipsEl.innerHTML = compareCountries.map(function(name, i) {
    var c = COUNTRIES[name];
    return '<div class="compare-country-chip" style="background:' + COMPARE_COLORS[i] + '33;border:1px solid ' + COMPARE_COLORS[i] + ';">' + (c ? c.flag : '') + ' ' + name + ' <button onclick="removeCountryFromCompare(\'' + name + '\')">&times;</button></div>';
  }).join('');

  // Only render full data when 2+ countries
  if (compareCountries.length >= 2) {
    if (dataArea) dataArea.style.display = 'block';
    drawRadarChart();
    var sections = [
      { title: 'Economic', rows: [['GDP','gdp'],['GDP Growth','gdpGrowth'],['GDP/Capita','gdpPerCapita'],['Inflation','inflation'],['Unemployment','unemployment'],['Debt %GDP','debt']] },
      { title: 'Military', rows: [['Spending','milSpend'],['% GDP','milPercent'],['Personnel','milPersonnel'],['Nuclear','nuclear'],['Alliances','alliances']] },
      { title: 'Demographics', rows: [['Population','pop'],['Median Age','medianAge']] },
      { title: 'Governance', rows: [['Democracy','democracy'],['Press Freedom','pressFreedom'],['HDI','hdi']] },
      { title: 'Markets', rows: [['Stock YTD','stockYTD'],['FDI','fdi']] }
    ];
    var h = '';
    sections.forEach(function(s) {
      h += '<div class="compare-section"><div class="compare-section-title">' + s.title + '</div><table class="compare-table"><thead><tr><th>Metric</th>';
      compareCountries.forEach(function(n, i) { h += '<th style="color:' + COMPARE_COLORS[i] + '">' + n + '</th>'; });
      h += '</tr></thead><tbody>';
      s.rows.forEach(function(r) {
        h += '<tr><td style="color:#6b7280;font-size:9px;">' + r[0] + '</td>';
        compareCountries.forEach(function(n) { var d = COMPARE_DATA[n]; h += '<td>' + (d ? (d[r[1]] || 'N/A') : 'N/A') + '</td>'; });
        h += '</tr>';
      });
      h += '</tbody></table></div>';
    });
    contentEl.innerHTML = h;
  } else {
    if (dataArea) dataArea.style.display = 'none';
    contentEl.innerHTML = '<div style="color:#6b7280;font-size:10px;text-align:center;padding:8px;">Tap another country or search above to compare</div>';
  }
}

// Search inside compare panel
function searchCompareCountry(query) {
  var results = document.getElementById('compareSearchResults');
  if (!results) return;
  if (!query || query.length < 1) { results.innerHTML = ''; results.style.display = 'none'; return; }
  var matches = Object.entries(COUNTRIES).filter(function(e) {
    return e[0].toLowerCase().includes(query.toLowerCase()) || e[1].region.toLowerCase().includes(query.toLowerCase());
  }).filter(function(e) {
    return !compareCountries.includes(e[0]);
  }).slice(0, 6);
  if (matches.length) {
    results.style.display = 'block';
    results.innerHTML = matches.map(function(e) {
      var name = e[0], c = e[1];
      return '<div class="compare-search-item" onclick="addCountryToCompare(\'' + name.replace(/'/g, "\\'") + '\');document.getElementById(\'compareSearchInput\').value=\'\';document.getElementById(\'compareSearchResults\').style.display=\'none\';">' + c.flag + ' ' + name + '</div>';
    }).join('');
  } else {
    results.innerHTML = '<div style="color:#6b7280;font-size:10px;padding:8px;text-align:center;">No matches</div>';
    results.style.display = 'block';
  }
}

function drawRadarChart() {
  var canvas = document.getElementById('radarChart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height, cx = w/2, cy = h/2, r = Math.min(w,h)/2 - 40;
  ctx.clearRect(0, 0, w, h);
  var cats = ['Economy','Military','Democracy','Development','Stability','Trade'];
  var nc = cats.length;
  function getVals(name) {
    var d = COMPARE_DATA[name]; if (!d) return cats.map(function(){return 0.3;});
    var gv = parseFloat(d.gdp.replace(/[^0-9.]/g,''));
    return [Math.min(1,gv/25), Math.min(1,parseFloat(d.milSpend.replace(/[^0-9.]/g,''))/900), Math.min(1,parseFloat(d.democracy)/10), Math.min(1,parseFloat(d.hdi)), Math.min(1,(100-parseFloat(d.unemployment))/100), Math.min(1,parseFloat(d.fdi.replace(/[^0-9.]/g,''))/300)];
  }
  for (var lev = 1; lev <= 5; lev++) {
    ctx.beginPath(); var lr = r*(lev/5);
    for (var i = 0; i <= nc; i++) { var a = (Math.PI*2*i)/nc - Math.PI/2; var x = cx+lr*Math.cos(a); var y = cy+lr*Math.sin(a); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 1; ctx.stroke();
  }
  for (var i = 0; i < nc; i++) {
    var a = (Math.PI*2*i)/nc - Math.PI/2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a)); ctx.strokeStyle='#1f293777'; ctx.stroke();
    ctx.fillStyle='#6b7280'; ctx.font='9px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(cats[i], cx+(r+20)*Math.cos(a), cy+(r+20)*Math.sin(a));
  }
  compareCountries.forEach(function(name, ci) {
    var vals = getVals(name); ctx.beginPath();
    vals.forEach(function(val, i) { var a = (Math.PI*2*i)/nc - Math.PI/2; var x = cx+r*val*Math.cos(a); var y = cy+r*val*Math.sin(a); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.closePath(); ctx.fillStyle = COMPARE_COLORS[ci]+'33'; ctx.fill(); ctx.strokeStyle = COMPARE_COLORS[ci]; ctx.lineWidth = 2; ctx.stroke();
  });
}

function positionFeatureButtons() {
  var wl = document.getElementById('watchlist');
  var btns = document.getElementById('featureBtnsDesktop');
  if (wl && btns && window.innerWidth > 768) { var r = wl.getBoundingClientRect(); btns.style.top = (r.bottom + 8) + 'px'; }
}
setTimeout(positionFeatureButtons, 500);
window.addEventListener('resize', positionFeatureButtons);
setInterval(positionFeatureButtons, 2000);

