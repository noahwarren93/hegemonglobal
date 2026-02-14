// GlobeView.jsx - Three.js interactive globe

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { COUNTRIES } from '../../data/countries';
import { RISK_COLORS, CONFLICT_ZONES, addConflictZones, animateConflictZones } from '../../utils/riskColors';
import Tooltip from './Tooltip';

// ============================================================
// Exported helpers (pure functions, no component state needed)
// ============================================================

export function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function vector3ToLatLng(worldPoint, globe) {
  globe.updateMatrixWorld(true);
  const lp = globe.worldToLocal(worldPoint.clone());
  const r = lp.length();
  const phi = Math.acos(Math.max(-1, Math.min(1, lp.y / r)));
  const theta = Math.atan2(lp.z, -lp.x);
  const lat = 90 - phi * (180 / Math.PI);
  const lng = ((theta * (180 / Math.PI) - 180 + 540) % 360) - 180;
  return { lat, lng };
}

export function findNearestCountry(lat, lng, maxDist) {
  maxDist = maxDist || 8;
  let nearest = null, minDist = Infinity;
  Object.entries(COUNTRIES).forEach(([name, data]) => {
    const dLat = data.lat - lat;
    let dLng = data.lng - lng;
    if (dLng > 180) dLng -= 360;
    if (dLng < -180) dLng += 360;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDist) { minDist = dist; nearest = name; }
  });
  return minDist <= maxDist ? nearest : null;
}

// ============================================================
// Font size adjustment (sidebar / modal zoom)
// ============================================================

let fontSizeLevel = 0;

export function applyFontScale() {
  const scale = 1 + (fontSizeLevel * 0.1);
  const sc = document.querySelector('.sidebar-content');
  const scrollTop = sc ? sc.scrollTop : 0;
  if (sc) sc.style.zoom = scale;
  requestAnimationFrame(() => { if (sc) sc.scrollTop = scrollTop; });
  const modalBody = document.querySelector('.modal-body');
  if (modalBody) modalBody.style.zoom = scale;
  const tosBody = document.getElementById('tosBody');
  if (tosBody) tosBody.style.zoom = scale;
  const btns = document.querySelectorAll('#fontControls button');
  if (btns[0]) btns[0].style.opacity = fontSizeLevel <= -1 ? '0.3' : '1';
  if (btns[2]) btns[2].style.opacity = fontSizeLevel >= 3 ? '0.3' : '1';
}

export function adjustFontSize(delta) {
  fontSizeLevel = Math.max(-1, Math.min(3, fontSizeLevel + delta));
  applyFontScale();
}

export function resetFontSize() {
  fontSizeLevel = 0;
  applyFontScale();
}

// ============================================================
// dismissAllPopups - closes all floating popups/tooltips
// ============================================================

export function dismissAllPopups() {
  const tt = document.getElementById('tooltip');
  if (tt) tt.style.display = 'none';
  if (typeof window.hideTradeRouteTooltip === 'function') window.hideTradeRouteTooltip();
  if (typeof window.closeTradeInfoPanel === 'function') window.closeTradeInfoPanel();
  if (typeof window.closeStatPopup === 'function') window.closeStatPopup();
  if (typeof window.closeSearchOverlay === 'function') window.closeSearchOverlay();
  if (typeof window.closeStocksModal === 'function') window.closeStocksModal();
}

// ============================================================
// Border data (simplified outlines for major regions)
// ============================================================

const BORDER_DATA = {
  'USA': [[49,-125],[49,-67],[25,-80],[25,-97],[32,-117],[49,-125]],
  'Canada': [[49,-125],[49,-55],[60,-55],[70,-90],[60,-140],[49,-125]],
  'Mexico': [[32,-117],[32,-86],[15,-87],[15,-105],[32,-117]],
  'Brazil': [[-5,-74],[-5,-35],[-33,-53],[-33,-58],[-15,-74],[-5,-74]],
  'Argentina': [[-22,-66],[-22,-58],[-55,-68],[-55,-72],[-22,-66]],
  'Russia': [[70,30],[70,180],[45,135],[45,30],[70,30]],
  'China': [[53,73],[53,135],[18,110],[22,100],[35,73],[53,73]],
  'India': [[35,68],[35,97],[8,77],[8,68],[35,68]],
  'Australia': [[-10,113],[-10,154],[-44,147],[-35,115],[-10,113]],
  'EU': [[70,-10],[70,40],[35,40],[35,-10],[70,-10]],
  'Africa': [[37,-17],[37,51],[-35,20],[-35,-17],[37,-17]],
  'MiddleEast': [[42,25],[42,63],[12,43],[12,25],[42,25]]
};

// ============================================================
// GlobeView Component
// ============================================================

export default function GlobeView({ onCountryClick, onCountryHover, compareMode }) {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Three.js object refs (persist across renders, never trigger re-render)
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const countryMeshesRef = useRef([]);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const animFrameRef = useRef(null);

  // Interaction state refs
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const clickStartRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isPinchingRef = useRef(false);
  const lastPinchDistRef = useRef(0);

  // Callback refs (so event handlers always see latest props)
  const onCountryClickRef = useRef(onCountryClick);
  const onCountryHoverRef = useRef(onCountryHover);
  const compareModeRef = useRef(compareMode);
  useEffect(() => { onCountryClickRef.current = onCountryClick; }, [onCountryClick]);
  useEffect(() => { onCountryHoverRef.current = onCountryHover; }, [onCountryHover]);
  useEffect(() => { compareModeRef.current = compareMode; }, [compareMode]);

  // Tooltip state
  const [tooltipData, setTooltipData] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const tradeTooltipRef = useRef(null);

  // --------------------------------------------------------
  // Three.js init + cleanup
  // --------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.8;
    camera.position.x = window.innerWidth <= 768 ? 0 : -0.15;
    cameraRef.current = camera;

    // Original globe.js uses Three.js r128 which has no color management.
    // Disable it in 0.182 so textures/colors pass through raw (matching r128).
    THREE.ColorManagement.enabled = false;

    // Renderer — matches original globe.js initGlobe() options.
    // r128 defaulted outputEncoding to LinearEncoding; 0.182 defaults to
    // SRGBColorSpace which double-gamma-corrects and washes out the globe.
    // Explicitly set LinearSRGBColorSpace to match the old default.
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    console.log('[GLOBE v3] Renderer initialized — outputColorSpace:', renderer.outputColorSpace, 'ColorManagement:', THREE.ColorManagement.enabled);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(5, 3, 5);
    scene.add(directional);

    // Earth sphere
    const earthGeom = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    const hideLoader = () => {
      const el = document.getElementById('globeLoader');
      if (el) { el.style.opacity = '0'; setTimeout(() => el.remove(), 800); }
    };
    const earthTexture = textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      hideLoader
    );
    const earthBump = textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-topology.png'
    );
    // In r128, textures defaulted to LinearEncoding. In 0.182 they default to
    // SRGBColorSpace. Force them to match the old behaviour.
    earthTexture.colorSpace = THREE.NoColorSpace;
    earthBump.colorSpace = THREE.NoColorSpace;

    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: earthBump,
      bumpScale: 0.03,
      specular: new THREE.Color(0x333333),
      shininess: 5,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnit: 1
    });

    const globe = new THREE.Mesh(earthGeom, earthMat);
    scene.add(globe);
    globeRef.current = globe;

    // Atmosphere glow
    const glowGeom = new THREE.SphereGeometry(1.02, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, transparent: true, opacity: 0.08, side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(glowGeom, glowMat));

    // Raycaster
    const raycaster = new THREE.Raycaster();
    if (window.innerWidth <= 768) {
      raycaster.params.Line = { threshold: 0.1 };
      raycaster.params.Points = { threshold: 0.1 };
    }
    raycasterRef.current = raycaster;

    // ---- Draw borders ----
    // Regional borders (cyan lines)
    Object.entries(BORDER_DATA).forEach(([, coords]) => {
      const points = coords.map(([lat, lng]) => latLngToVector3(lat, lng, 1.002));
      points.push(points[0]);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x06b6d4, transparent: true, opacity: 0.4, linewidth: 2
      });
      globe.add(new THREE.Line(geometry, material));
    });

    // Latitude grid
    for (let lat = -60; lat <= 60; lat += 30) {
      const points = [];
      for (let lng = -180; lng <= 180; lng += 5) {
        points.push(latLngToVector3(lat, lng, 1.001));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x1f2937, transparent: true, opacity: 0.3 });
      globe.add(new THREE.Line(geometry, material));
    }

    // Longitude grid
    for (let lng = -180; lng < 180; lng += 30) {
      const points = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLngToVector3(lat, lng, 1.001));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x1f2937, transparent: true, opacity: 0.3 });
      globe.add(new THREE.Line(geometry, material));
    }

    // ---- Country markers ----
    const countryMeshes = [];
    Object.entries(COUNTRIES).forEach(([name, data]) => {
      const size = data.risk === 'catastrophic' ? 0.025 : data.risk === 'extreme' ? 0.02 : 0.015;
      const markerGeom = new THREE.SphereGeometry(size, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: RISK_COLORS[data.risk]?.glow || 0x888888,
        transparent: true,
        opacity: 0.95
      });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      const pos = latLngToVector3(data.lat, data.lng, 1.02);
      marker.position.copy(pos);
      marker.userData = { name, data };
      globe.add(marker);
      countryMeshes.push(marker);
      // Pulsing ring for critical countries
      if (data.risk === 'catastrophic' || data.risk === 'extreme') {
        const ringGeom = new THREE.RingGeometry(size + 0.01, size + 0.025, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: RISK_COLORS[data.risk].glow,
          transparent: true, opacity: 0.6, side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        globe.add(ring);
      }
    });
    countryMeshesRef.current = countryMeshes;

    // Conflict zone overlays
    addConflictZones(globe, latLngToVector3);

    // ---- Mouse move (hover + tooltip) ----
    // Matches original globe.js onMouseMove exactly
    function handleMouseMove(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseRef.current, camera);
      const intersects = raycaster.intersectObjects(countryMeshesRef.current);

      // Check trade route line hover when trade routes are active
      if (window.tradeRoutesActive && window.tradeRouteMeshes && window.tradeRouteMeshes.length > 0) {
        raycaster.params.Line = raycaster.params.Line || {};
        const origThreshold = raycaster.params.Line.threshold;
        raycaster.params.Line.threshold = 0.02;
        const tradeHits = raycaster.intersectObjects(window.tradeRouteMeshes);
        raycaster.params.Line.threshold = origThreshold || 0;
        if (tradeHits.length > 0 && tradeHits[0].object.userData.route) {
          if (typeof window.showTradeRouteTooltip === 'function') {
            window.showTradeRouteTooltip(tradeHits[0].object.userData.route, event.clientX, event.clientY);
          }
          setTooltipData(null);
          renderer.domElement.style.cursor = 'pointer';
          return;
        } else {
          if (typeof window.hideTradeRouteTooltip === 'function') window.hideTradeRouteTooltip();
        }
      }

      if (intersects.length > 0) {
        const ud = intersects[0].object.userData;
        if (ud && ud.data && ud.name) {
          setTooltipData({ name: ud.name, flag: ud.data.flag, risk: ud.data.risk, region: ud.data.region, title: ud.data.title });
          setMousePos({ x: event.clientX, y: event.clientY });
          if (onCountryHoverRef.current) onCountryHoverRef.current(ud.name, event);
        }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        // Check globe surface for nearby country
        const globeHits = raycaster.intersectObject(globe);
        if (globeHits.length > 0) {
          const ll = vector3ToLatLng(globeHits[0].point, globe);
          const country = findNearestCountry(ll.lat, ll.lng, 10);
          if (country) {
            const cdata = COUNTRIES[country];
            if (cdata) {
              setTooltipData({ name: country, flag: cdata.flag, risk: cdata.risk, region: cdata.region, title: cdata.title });
              setMousePos({ x: event.clientX, y: event.clientY });
              if (onCountryHoverRef.current) onCountryHoverRef.current(country, event);
            }
            renderer.domElement.style.cursor = 'pointer';
          } else {
            setTooltipData(null);
            renderer.domElement.style.cursor = 'grab';
          }
        } else {
          setTooltipData(null);
          renderer.domElement.style.cursor = 'grab';
        }
      }
    }

    // ---- Click ----
    // Matches original globe.js onClick exactly:
    // 1. Marker hit first (no drag check) - takes intersects[0] directly
    // 2. Drag check only before globe surface fallback
    // 3. Globe surface → findNearestCountry
    function handleClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseRef.current, camera);

      // Copied verbatim from original globe.js onClick:
      // Priority: try marker dots first
      const intersects = raycaster.intersectObjects(countryMeshesRef.current);
      if (intersects.length > 0) {
        const clickedName = intersects[0].object.userData.name;
        console.log('[GLOBE v3 CLICK] Marker hit:', clickedName, '| distance:', intersects[0].distance, '| total hits:', intersects.length);
        if (clickedName && onCountryClickRef.current) {
          onCountryClickRef.current(clickedName);
        }
        return;
      }

      // Check if this was a drag (skip globe surface click after drag)
      if (clickStartRef.current) {
        const dx = Math.abs(event.clientX - clickStartRef.current.x);
        const dy = Math.abs(event.clientY - clickStartRef.current.y);
        if (dx > 5 || dy > 5) { console.log('[GLOBE v3 CLICK] Drag detected, skipping'); return; }
      }

      // Try globe surface - find nearest tracked country
      const globeHits = raycaster.intersectObject(globe);
      if (globeHits.length > 0) {
        const { lat, lng } = vector3ToLatLng(globeHits[0].point, globe);
        const country = findNearestCountry(lat, lng);
        if (country && onCountryClickRef.current) {
          onCountryClickRef.current(country);
        }
      } else {
        console.log('[GLOBE v3 CLICK] No intersection at all');
      }
    }

    // ---- Resize ----
    function handleResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.position.x = window.innerWidth <= 768 ? 0 : -0.15;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    // ---- Mouse leave ----
    function handleMouseLeave() {
      setTooltipData(null);
      if (typeof window.hideTradeRouteTooltip === 'function') window.hideTradeRouteTooltip();
    }

    // ---- Mouse drag rotation ----
    function handleMouseDown(e) {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      clickStartRef.current = { x: e.clientX, y: e.clientY };
    }
    function handleDocMouseUp() {
      isDraggingRef.current = false;
    }
    function handleDocMouseMove(e) {
      if (!isDraggingRef.current || !globe) return;
      globe.rotation.y += (e.clientX - prevMouseRef.current.x) * 0.005;
      globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2,
        globe.rotation.x + (e.clientY - prevMouseRef.current.y) * 0.005));
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    }

    // ---- Touch events ----
    function handleTouchStart(e) {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }
    function handleDocTouchEnd() {
      isDraggingRef.current = false;
      isPinchingRef.current = false;
    }
    function handleDocTouchMove(e) {
      if (!globe) return;
      // Pinch zoom
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (isPinchingRef.current && lastPinchDistRef.current > 0) {
          const delta = (lastPinchDistRef.current - dist) * 0.01;
          camera.position.z = Math.max(1.5, Math.min(5.0, camera.position.z + delta));
        }
        isPinchingRef.current = true;
        lastPinchDistRef.current = dist;
        isDraggingRef.current = false;
        return;
      }
      // Single finger drag
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      globe.rotation.y += (touch.clientX - prevMouseRef.current.x) * 0.005;
      globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2,
        globe.rotation.x + (touch.clientY - prevMouseRef.current.y) * 0.005));
      prevMouseRef.current = { x: touch.clientX, y: touch.clientY };
    }

    // Touch tap (mobile click) — same logic as handleClick
    function handleTouchEnd(e) {
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dx = Math.abs(touch.clientX - touchStartRef.current.x);
        const dy = Math.abs(touch.clientY - touchStartRef.current.y);
        if (dx < 10 && dy < 10) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouseRef.current.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          mouseRef.current.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouseRef.current, camera);
          // Copied verbatim from original globe.js touchend handler:
          // Priority: try marker dots first
          const touchIntersects = raycaster.intersectObjects(countryMeshesRef.current);
          if (touchIntersects.length > 0) {
            const tName = touchIntersects[0].object.userData.name;
            if (tName && onCountryClickRef.current) onCountryClickRef.current(tName);
            return;
          }
          // Try globe surface - find nearest tracked country
          const touchGlobe = raycaster.intersectObject(globe);
          if (touchGlobe.length > 0) {
            const tll = vector3ToLatLng(touchGlobe[0].point, globe);
            const tCountry = findNearestCountry(tll.lat, tll.lng);
            if (tCountry && onCountryClickRef.current) onCountryClickRef.current(tCountry);
          }
        }
      }
    }

    // Scroll-wheel zoom
    function handleWheel(e) {
      e.preventDefault();
      if (!camera) return;
      const delta = e.deltaY * 0.002;
      camera.position.z = Math.max(1.5, Math.min(5.0, camera.position.z + delta));
    }

    // ---- Attach event listeners ----
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mouseup', handleDocMouseUp);
    document.addEventListener('mousemove', handleDocMouseMove);
    document.addEventListener('touchend', handleDocTouchEnd);
    document.addEventListener('touchmove', handleDocTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // ---- Animation loop ----
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      if (!isDraggingRef.current && autoRotateRef.current && globe) {
        globe.rotation.y += 0.0008;
      }
      animateConflictZones(globe);
      renderer.render(scene, camera);
    }
    animate();

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(animFrameRef.current);

      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mouseup', handleDocMouseUp);
      document.removeEventListener('mousemove', handleDocMouseMove);
      document.removeEventListener('touchend', handleDocTouchEnd);
      document.removeEventListener('touchmove', handleDocTouchMove);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js objects
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Toggle auto-rotation (exposed via ref or called externally) ----
  const toggleRotation = useCallback(() => {
    autoRotateRef.current = !autoRotateRef.current;
    return autoRotateRef.current;
  }, []);

  // Expose globe internals for external features (trade routes, etc.)
  useEffect(() => {
    window._globeView = {
      globe: globeRef.current,
      scene: sceneRef.current,
      camera: cameraRef.current,
      renderer: rendererRef.current,
      countryMeshes: countryMeshesRef.current,
      raycaster: raycasterRef.current,
      toggleRotation,
      autoRotateRef,
    };
    return () => { delete window._globeView; };
  }, [toggleRotation]);

  // Trade route tooltip functions (matches original trade-routes.js showTradeRouteTooltip/hideTradeRouteTooltip)
  useEffect(() => {
    window.showTradeRouteTooltip = (route, x, y) => {
      const tt = tradeTooltipRef.current;
      if (!tt) return;
      const fromFlag = COUNTRIES[route.from] ? COUNTRIES[route.from].flag : '';
      const toFlag = COUNTRIES[route.to] ? COUNTRIES[route.to].flag : '';
      const statusColor = route.status === 'healthy' ? '#22c55e' : route.status === 'sanctioned' ? '#ef4444' : '#f59e0b';
      tt.innerHTML =
        '<div style="font-size:12px;font-weight:700;margin-bottom:6px;">' + fromFlag + ' ' + route.from + ' ↔ ' + toFlag + ' ' + route.to + '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#6b7280;">Volume:</span><span style="color:#e5e7eb;font-weight:600;">$' + route.volume + 'B/yr</span></div>' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#6b7280;">Status:</span><span style="color:' + statusColor + ';font-weight:600;">' + route.status.toUpperCase() + '</span></div>' +
        '<div style="color:#9ca3af;margin-bottom:4px;"><span style="color:#6b7280;">Goods:</span> ' + route.goods + '</div>' +
        '<div style="color:#9ca3af;font-size:9px;margin-top:6px;border-top:1px solid #1f2937;padding-top:6px;">' + route.desc + '</div>' +
        (route.sanctions ? '<div style="color:#fca5a5;font-size:9px;margin-top:4px;">\u26a0 ' + route.sanctions + '</div>' : '') +
        (route.recent ? '<div style="color:#06b6d4;font-size:9px;margin-top:4px;">\ud83d\udccc ' + route.recent + '</div>' : '');
      tt.style.display = 'block';
      const offset = 15;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tw = tt.offsetWidth || 320;
      const th = tt.offsetHeight || 200;
      let posLeft = x + offset;
      let posTop = y + offset;
      if (posLeft + tw > vw - 10) posLeft = x - tw - offset;
      if (posLeft < 10) posLeft = 10;
      if (posTop + th > vh - 10) posTop = y - th - offset;
      if (posTop < 10) posTop = 10;
      tt.style.left = posLeft + 'px';
      tt.style.top = posTop + 'px';
    };
    window.hideTradeRouteTooltip = () => {
      const tt = tradeTooltipRef.current;
      if (tt) tt.style.display = 'none';
    };
    return () => {
      delete window.showTradeRouteTooltip;
      delete window.hideTradeRouteTooltip;
    };
  }, []);

  return (
    <div ref={containerRef} id="globe">
      <div id="globeLoader" className="globe-loader">
        <div className="globe-spinner" />
      </div>
      <Tooltip data={tooltipData} mousePos={mousePos} />
      <div
        ref={tradeTooltipRef}
        id="tradeTooltip"
        style={{ display: 'none', position: 'fixed', zIndex: 10000, background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', padding: '10px 14px', maxWidth: '320px', fontSize: '10px', color: '#e5e7eb', pointerEvents: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
      />
    </div>
  );
}
