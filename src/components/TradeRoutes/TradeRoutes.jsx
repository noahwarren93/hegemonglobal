// TradeRoutes.jsx - Three.js trade route arcs on the globe
/* eslint-disable react-refresh/only-export-components */

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { COUNTRIES } from '../../data/countries';
import { TRADE_ROUTES } from '../../data/tradeData';
import { CHOKEPOINTS } from '../../data/chokepointData';
import { latLngToVector3 } from '../Globe/GlobeView';

// ============================================================
// Coordinate Helpers
// ============================================================

const COORD_FALLBACKS = {
  'European Union': { lat: 50.85, lng: 4.35 },
  'South Korea': { lat: 35.91, lng: 127.77 },
  'Australia': { lat: -25.27, lng: 133.78 },
  'Canada': { lat: 56.13, lng: -106.35 },
  'Mexico': { lat: 23.63, lng: -102.55 },
  'Cuba': { lat: 21.52, lng: -77.78 },
  'North Korea': { lat: 40.34, lng: 127.51 },
  'Indonesia': { lat: -6.21, lng: 106.85 },
  'Thailand': { lat: 13.76, lng: 100.50 },
  'Vietnam': { lat: 21.03, lng: 105.85 },
  'Poland': { lat: 52.23, lng: 21.01 },
  'Italy': { lat: 41.90, lng: 12.50 },
  'France': { lat: 48.86, lng: 2.35 },
  'Netherlands': { lat: 52.37, lng: 4.90 },
  'Taiwan': { lat: 25.03, lng: 121.57 },
  'Argentina': { lat: -34.60, lng: -58.38 },
  'Singapore': { lat: 1.35, lng: 103.82 },
  'Qatar': { lat: 25.29, lng: 51.53 },
  'Nigeria': { lat: 9.08, lng: 7.49 },
  'South Africa': { lat: -25.75, lng: 28.23 },
  'Chile': { lat: -33.45, lng: -70.67 },
  'Peru': { lat: -12.05, lng: -77.04 },
  'Norway': { lat: 59.91, lng: 10.75 },
  'Azerbaijan': { lat: 40.41, lng: 49.87 },
};

function getCountryCoords(name) {
  if (COUNTRIES[name]) return { lat: COUNTRIES[name].lat, lng: COUNTRIES[name].lng };
  return COORD_FALLBACKS[name] || { lat: 0, lng: 0 };
}

function createArcPoints(start, end, segs = 50, h = 0.15) {
  const pts = [];
  let dLng = end.lng - start.lng;
  if (dLng > 180) dLng -= 360;
  if (dLng < -180) dLng += 360;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lng = start.lng + dLng * t;
    const arcH = Math.sin(t * Math.PI) * h;
    pts.push(latLngToVector3(lat, lng, 1.02 + arcH));
  }
  return pts;
}

// Chokepoint type colors
const CHOKEPOINT_COLORS = {
  maritime: 0x3b82f6,  // blue
  energy: 0xf97316,    // orange
  land: 0x22c55e,      // green
};

// ============================================================
// Trade Routes Manager (imperative Three.js)
// ============================================================

export function useTradeRoutes() {
  const tradeRouteGroup = useRef(null);
  const tradeRouteMeshes = useRef([]);
  const tradeDotGroups = useRef([]);
  const tradeAnimFrame = useRef(null);
  const highlightedCountryRef = useRef(null);
  const chokepointMeshesRef = useRef([]);
  const hiddenDotsRef = useRef([]);

  const startTradeAnimation = useCallback(() => {
    if (tradeAnimFrame.current) cancelAnimationFrame(tradeAnimFrame.current);
    function animateDots() {
      tradeAnimFrame.current = requestAnimationFrame(animateDots);
      tradeDotGroups.current.forEach(dot => {
        if (!dot.userData) return;
        const d = dot.userData;
        d.offset = (d.offset + d.speed) % 1;
        const idx = Math.floor(d.offset * (d.arcPoints.length - 1));
        const nextIdx = Math.min(idx + 1, d.arcPoints.length - 1);
        const frac = (d.offset * (d.arcPoints.length - 1)) - idx;
        const p = d.arcPoints[idx];
        const np = d.arcPoints[nextIdx];
        dot.position.set(
          p.x + (np.x - p.x) * frac,
          p.y + (np.y - p.y) * frac,
          p.z + (np.z - p.z) * frac
        );
      });
    }
    animateDots();
  }, []);

  const stopTradeAnimation = useCallback(() => {
    if (tradeAnimFrame.current) {
      cancelAnimationFrame(tradeAnimFrame.current);
      tradeAnimFrame.current = null;
    }
  }, []);

  const hideTradeRoutes = useCallback(() => {
    stopTradeAnimation();
    const globeView = window._globeView;
    if (tradeRouteGroup.current && globeView?.globe) {
      globeView.globe.remove(tradeRouteGroup.current);
      tradeRouteGroup.current.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      tradeRouteGroup.current = null;
    }
    // Restore hidden country dots
    for (const child of hiddenDotsRef.current) {
      child.visible = true;
    }
    hiddenDotsRef.current = [];
    tradeRouteMeshes.current = [];
    tradeDotGroups.current = [];
    chokepointMeshesRef.current = [];
    window.tradeRouteMeshes = [];
    window.chokepointMeshes = [];
  }, [stopTradeAnimation]);

  const showTradeRoutes = useCallback((highlightCountry) => {
    const globeView = window._globeView;
    if (!globeView?.globe || !globeView?.scene) return;

    hideTradeRoutes();

    // Hide country dots, rings, and conflict zones (same as Military overlay)
    const hidden = [];
    for (const child of globeView.globe.children) {
      if (child.isMesh && !child.userData.militaryBase) {
        child.visible = false;
        hidden.push(child);
      }
    }
    hiddenDotsRef.current = hidden;

    tradeRouteGroup.current = new THREE.Group();
    tradeRouteMeshes.current = [];
    tradeDotGroups.current = [];

    TRADE_ROUTES.forEach((route, idx) => {
      const fc = getCountryCoords(route.from);
      const tc = getCountryCoords(route.to);
      const vol = route.volume;
      const arcHeight = 0.08 + Math.min(0.18, vol / 3000);
      const pts = createArcPoints(fc, tc, 64, arcHeight);

      const color = route.status === 'healthy' ? 0x22c55e : route.status === 'sanctioned' ? 0xef4444 : 0xf59e0b;

      let lineOpacity = 0.7;
      if (highlightCountry && route.from !== highlightCountry && route.to !== highlightCountry) {
        lineOpacity = 0.2;
      }

      const offsets = [0, 0.0012, -0.0012];
      for (let oi = 0; oi < offsets.length; oi++) {
        let drawPts = pts;
        if (offsets[oi] !== 0) {
          drawPts = pts.map(p => new THREE.Vector3(p.x + offsets[oi], p.y + offsets[oi] * 0.5, p.z));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(drawPts);
        const mat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: oi === 0 ? lineOpacity : lineOpacity * 0.6,
          linewidth: 2
        });
        const line = new THREE.Line(geom, mat);
        if (oi === 0) {
          line.userData = { routeIndex: idx, route };
          tradeRouteMeshes.current.push(line);
        }
        tradeRouteGroup.current.add(line);
      }

      // Animated flowing dots
      if (lineOpacity > 0.1) {
        const dotCount = Math.max(1, Math.min(4, Math.floor(vol / 200)));
        for (let d = 0; d < dotCount; d++) {
          const dotGeom = new THREE.SphereGeometry(0.008, 6, 6);
          const dotMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
          const dot = new THREE.Mesh(dotGeom, dotMat);
          dot.userData = { arcPoints: pts, offset: d / dotCount, speed: 0.003 + Math.random() * 0.002 };
          tradeRouteGroup.current.add(dot);
          tradeDotGroups.current.push(dot);
        }
      }
    });

    // Chokepoint diamond markers — color-coded by type
    chokepointMeshesRef.current = [];
    CHOKEPOINTS.forEach(cp => {
      const color = CHOKEPOINT_COLORS[cp.type] || 0xf59e0b;
      const geom = new THREE.OctahedronGeometry(0.03);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geom, mat);
      const pos = latLngToVector3(cp.lat, cp.lng, 1.035);
      mesh.position.copy(pos);
      mesh.userData = { chokepoint: cp, isChokepoint: true };
      tradeRouteGroup.current.add(mesh);
      chokepointMeshesRef.current.push(mesh);
    });
    window.chokepointMeshes = chokepointMeshesRef.current;

    globeView.globe.add(tradeRouteGroup.current);
    // Sync to window globals so GlobeView hover handler can detect trade route lines
    window.tradeRouteMeshes = tradeRouteMeshes.current;
    startTradeAnimation();
  }, [hideTradeRoutes, startTradeAnimation]);

  const toggleTradeRoutes = useCallback((isActive, setActive) => {
    const newState = !isActive;
    setActive(newState);
    if (newState) {
      showTradeRoutes();
    } else {
      hideTradeRoutes();
      highlightedCountryRef.current = null;
    }
  }, [showTradeRoutes, hideTradeRoutes]);

  const handleTradeClick = useCallback((countryName, isActive) => {
    if (!isActive) return false;

    if (highlightedCountryRef.current === countryName) {
      highlightedCountryRef.current = null;
      showTradeRoutes(); // Reset all
      return { highlighted: null };
    } else {
      highlightedCountryRef.current = countryName;
      showTradeRoutes(countryName);
      return { highlighted: countryName };
    }
  }, [showTradeRoutes]);

  return {
    showTradeRoutes,
    hideTradeRoutes,
    toggleTradeRoutes,
    handleTradeClick,
    highlightedCountryRef
  };
}

export { TRADE_ROUTES };
