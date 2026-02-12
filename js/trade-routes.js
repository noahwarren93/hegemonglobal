// trade-routes.js - Trade route visualization

var tradeRoutesActive = false;
var tradeRouteLines = [];
var tradeRouteGroup = null;
const TRADE_ROUTES = [
  { from: 'United States', to: 'China', volume: '$582B', goods: 'Electronics, Agriculture', status: 'tension' },
  { from: 'United States', to: 'Canada', volume: '$783B', goods: 'Vehicles, Oil', status: 'healthy' },
  { from: 'United States', to: 'Mexico', volume: '$687B', goods: 'Vehicles, Electronics', status: 'healthy' },
  { from: 'China', to: 'Japan', volume: '$318B', goods: 'Electronics, Chemicals', status: 'tension' },
  { from: 'United States', to: 'Japan', volume: '$248B', goods: 'Vehicles, Machinery', status: 'healthy' },
  { from: 'United States', to: 'United Kingdom', volume: '$295B', goods: 'Finance, Pharma', status: 'healthy' },
  { from: 'Russia', to: 'China', volume: '$240B', goods: 'Oil, Gas', status: 'healthy' },
  { from: 'United States', to: 'Russia', volume: '$12B', goods: 'Limited', status: 'sanctioned' },
  { from: 'Saudi Arabia', to: 'China', volume: '$98B', goods: 'Crude Oil', status: 'healthy' },
  { from: 'India', to: 'United States', volume: '$128B', goods: 'IT, Pharma', status: 'healthy' },
  { from: 'Brazil', to: 'China', volume: '$157B', goods: 'Soybeans, Iron Ore', status: 'healthy' }
];

function getCountryCoords(name) {
  if (COUNTRIES[name]) return { lat: COUNTRIES[name].lat, lng: COUNTRIES[name].lng };
  var fb = { 'European Union':{lat:50.85,lng:4.35},'South Korea':{lat:35.91,lng:127.77},'Australia':{lat:-25.27,lng:133.78},'Canada':{lat:56.13,lng:-106.35},'Mexico':{lat:23.63,lng:-102.55} };
  return fb[name] || { lat: 0, lng: 0 };
}

function createArcPoints(start, end, segs, h) {
  segs = segs || 50; h = h || 0.15;
  var pts = [];
  for (var i = 0; i <= segs; i++) {
    var t = i / segs;
    var lat = start.lat + (end.lat - start.lat) * t;
    var lng = start.lng + (end.lng - start.lng) * t;
    var arcH = Math.sin(t * Math.PI) * h;
    pts.push(latLngToVector3(lat, lng, 1.02 + arcH));
  }
  return pts;
}

function toggleTradeRoutes() {
  tradeRoutesActive = !tradeRoutesActive;
  document.getElementById('tradeRoutesBtn').classList.toggle('active', tradeRoutesActive);
  if (tradeRoutesActive) showTradeRoutes(); else hideTradeRoutes();
}

function showTradeRoutes() {
  if (!globe || !scene) return;
  if (tradeRouteGroup) globe.remove(tradeRouteGroup);
  tradeRouteGroup = new THREE.Group();
  TRADE_ROUTES.forEach(function(route) {
    var fc = getCountryCoords(route.from), tc = getCountryCoords(route.to);
    var pts = createArcPoints(fc, tc, 60, 0.12);
    var geom = new THREE.BufferGeometry().setFromPoints(pts);
    var color = route.status === 'healthy' ? 0x22c55e : route.status === 'sanctioned' ? 0xef4444 : 0xf59e0b;
    var vol = parseFloat(route.volume.replace(/[^0-9.]/g, ''));
    var mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: Math.min(0.9, Math.max(0.3, vol/800)) });
    tradeRouteGroup.add(new THREE.Line(geom, mat));
  });
  globe.add(tradeRouteGroup);
}

function hideTradeRoutes() {
  if (tradeRouteGroup && globe) { globe.remove(tradeRouteGroup); tradeRouteGroup = null; }
  tradeRouteLines = [];
}

// ============================================================
// COMPARE MODE
// ============================================================