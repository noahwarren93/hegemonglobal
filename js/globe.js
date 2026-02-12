// globe.js - 3D globe rendering and interaction

let scene, camera, renderer, globe, countryMeshes = [], raycaster, mouse;
const tooltip = document.getElementById('tooltip');

function initGlobe() {
  const container = document.getElementById('globe');
  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 2.8;
  camera.position.x = window.innerWidth <= 768 ? 0 : -0.15; // Center on mobile, offset on desktop for sidebar

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.6);
  directional.position.set(5, 3, 5);
  scene.add(directional);

  // Earth sphere with texture
  const earthGeom = new THREE.SphereGeometry(1, 64, 64);

  // Load Earth texture
  const textureLoader = new THREE.TextureLoader();
  const hideLoader = () => { const el = document.getElementById('globeLoader'); if (el) { el.style.opacity = '0'; setTimeout(() => el.remove(), 800); } };
  const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', hideLoader);
  const earthBump = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');

  const earthMat = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: earthBump,
    bumpScale: 0.03,
    specular: new THREE.Color(0x333333),
    shininess: 5
  });

  globe = new THREE.Mesh(earthGeom, earthMat);
  scene.add(globe);

  // Atmosphere glow
  const glowGeom = new THREE.SphereGeometry(1.02, 64, 64);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.08, side: THREE.BackSide });
  scene.add(new THREE.Mesh(glowGeom, glowMat));

  raycaster = new THREE.Raycaster();
  // Increase touch detection area on mobile for easier tapping
  if (window.innerWidth <= 768) {
    raycaster.params.Line = { threshold: 0.1 };
    raycaster.params.Points = { threshold: 0.1 };
  }
  mouse = new THREE.Vector2();

  // Draw country borders
  drawBorders();

  // Add country markers
  addCountryMarkers();

  // Add conflict zone overlays
  addConflictZones(globe);

  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);

  animate();
}

function drawBorders() {
  // Simplified border coordinates for major countries (lat/lng outline points)
  const borderData = {
    // Adding comprehensive border outlines
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

  // Draw regional borders as thicker cyan lines
  Object.entries(borderData).forEach(([region, coords]) => {
    const points = coords.map(([lat, lng]) => latLngToVector3(lat, lng, 1.002));
    points.push(points[0]); // Close the loop

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.4,
      linewidth: 2
    });
    const line = new THREE.Line(geometry, material);
    globe.add(line);
  });

  // Draw latitude/longitude grid
  for (let lat = -60; lat <= 60; lat += 30) {
    const points = [];
    for (let lng = -180; lng <= 180; lng += 5) {
      points.push(latLngToVector3(lat, lng, 1.001));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x1f2937, transparent: true, opacity: 0.3 });
    globe.add(new THREE.Line(geometry, material));
  }

  for (let lng = -180; lng < 180; lng += 30) {
    const points = [];
    for (let lat = -90; lat <= 90; lat += 5) {
      points.push(latLngToVector3(lat, lng, 1.001));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x1f2937, transparent: true, opacity: 0.3 });
    globe.add(new THREE.Line(geometry, material));
  }
}

function addCountryMarkers() {
  Object.entries(COUNTRIES).forEach(([name, data]) => {
    // Create marker sphere
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

    // Add pulsing ring for critical countries
    if (data.risk === 'catastrophic' || data.risk === 'extreme') {
      const ringGeom = new THREE.RingGeometry(size + 0.01, size + 0.025, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: RISK_COLORS[data.risk].glow,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globe.add(ring);
    }
  });
}

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Convert a 3D world point on globe surface back to lat/lng
function vector3ToLatLng(worldPoint) {
  const lp = globe.worldToLocal(worldPoint.clone());
  const r = lp.length();
  const phi = Math.acos(Math.max(-1, Math.min(1, lp.y / r)));
  const theta = Math.atan2(lp.z, -lp.x);
  const lat = 90 - phi * (180 / Math.PI);
  const lng = ((theta * (180 / Math.PI) - 180 + 540) % 360) - 180;
  return { lat, lng };
}

// Find nearest tracked country to a lat/lng point
function findNearestCountry(lat, lng, maxDist) {
  maxDist = maxDist || 15;
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

function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(countryMeshes);

  if (intersects.length > 0) {
    const { name, data } = intersects[0].object.userData;
    tooltip.style.display = 'block';
    tooltip.style.left = event.clientX + 15 + 'px';
    tooltip.style.top = event.clientY + 15 + 'px';
    tooltip.innerHTML = `
      <div class="tooltip-name">${data.flag} ${name} <span class="tooltip-risk risk-${data.risk}">${data.risk.toUpperCase()}</span></div>
      <div class="tooltip-region">${data.region} • ${data.title || ''}</div>
      <div class="tooltip-hint">Click for details</div>
    `;
    renderer.domElement.style.cursor = 'pointer';
  } else {
    // Check globe surface for nearby country
    const globeHits = raycaster.intersectObject(globe);
    if (globeHits.length > 0) {
      const { lat, lng } = vector3ToLatLng(globeHits[0].point);
      const country = findNearestCountry(lat, lng, 10);
      if (country) {
        const data = COUNTRIES[country];
        tooltip.style.display = 'block';
        tooltip.style.left = event.clientX + 15 + 'px';
        tooltip.style.top = event.clientY + 15 + 'px';
        tooltip.innerHTML = `
          <div class="tooltip-name">${data.flag} ${country} <span class="tooltip-risk risk-${data.risk}">${data.risk.toUpperCase()}</span></div>
          <div class="tooltip-region">${data.region} • ${data.title || ''}</div>
          <div class="tooltip-hint">Click for details</div>
        `;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        tooltip.style.display = 'none';
        renderer.domElement.style.cursor = 'grab';
      }
    } else {
      tooltip.style.display = 'none';
      renderer.domElement.style.cursor = 'grab';
    }
  }
}

function onClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Priority: try marker dots first
  const intersects = raycaster.intersectObjects(countryMeshes);
  if (intersects.length > 0) {
    const clickedName = intersects[0].object.userData.name;
    if (typeof compareModeActive !== 'undefined' && compareModeActive) { addCountryToCompare(clickedName); return; }
    openModal(clickedName);
    return;
  }

  // Check if this was a drag (skip globe surface click after drag)
  if (globeClickStart) {
    const dx = Math.abs(event.clientX - globeClickStart.x);
    const dy = Math.abs(event.clientY - globeClickStart.y);
    if (dx > 5 || dy > 5) return;
  }

  // Try globe surface - find nearest tracked country
  const globeHits = raycaster.intersectObject(globe);
  if (globeHits.length > 0) {
    const { lat, lng } = vector3ToLatLng(globeHits[0].point);
    const country = findNearestCountry(lat, lng);
    if (country) {
      if (typeof compareModeActive !== 'undefined' && compareModeActive) { addCountryToCompare(country); return; }
      openModal(country);
    }
  }
}

function onResize() {
  const container = document.getElementById('globe');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.position.x = window.innerWidth <= 768 ? 0 : -0.15;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// Font size adjustment tool (min level -1, max level +3)
let fontSizeLevel = 0;
function applyFontScale() {
  const scale = 1 + (fontSizeLevel * 0.1); // 0.9x to 1.3x
  const sc = document.querySelector('.sidebar-content');
  // Save scroll position before zoom change to prevent viewport jump
  const scrollTop = sc ? sc.scrollTop : 0;
  if (sc) sc.style.zoom = scale;
  // Restore scroll after a frame to prevent mobile viewport jump
  requestAnimationFrame(() => { if (sc) sc.scrollTop = scrollTop; });
  // Also apply to country modal and TOS modal
  const modalBody = document.querySelector('.modal-body');
  if (modalBody) modalBody.style.zoom = scale;
  const tosBody = document.getElementById('tosBody');
  if (tosBody) tosBody.style.zoom = scale;
  // Visual feedback on buttons
  const btns = document.querySelectorAll('#fontControls button');
  if (btns[0]) btns[0].style.opacity = fontSizeLevel <= -1 ? '0.3' : '1';
  if (btns[2]) btns[2].style.opacity = fontSizeLevel >= 3 ? '0.3' : '1';
}
function adjustFontSize(delta) {
  fontSizeLevel = Math.max(-1, Math.min(3, fontSizeLevel + delta));
  applyFontScale();
}
function resetFontSize() {
  fontSizeLevel = 0;
  applyFontScale();
}

// Globe controls
let isDragging = false, prevMouse = { x: 0, y: 0 };
let globeClickStart = { x: 0, y: 0 };
let autoRotate = true;

function toggleRotation() {
  autoRotate = !autoRotate;
  const btn = document.getElementById('rotateToggle');
  if (btn) btn.classList.toggle('active', autoRotate);
}

// Drag rotation - Mouse events
document.getElementById('globe').addEventListener('mousedown', (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; globeClickStart = { x: e.clientX, y: e.clientY }; });
document.addEventListener('mouseup', () => { isDragging = false; });
document.addEventListener('mousemove', (e) => {
  if (!isDragging || !globe) return;
  globe.rotation.y += (e.clientX - prevMouse.x) * 0.005;
  globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x + (e.clientY - prevMouse.y) * 0.005));
  prevMouse = { x: e.clientX, y: e.clientY };
});

// Touch events for mobile globe rotation + pinch zoom
let touchStart = { x: 0, y: 0 };
let isPinching = false, lastPinchDist = 0;
document.getElementById('globe').addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
}, { passive: true });

document.addEventListener('touchend', () => { isDragging = false; isPinching = false; });

document.addEventListener('touchmove', (e) => {
  if (!globe) return;
  // Pinch-to-zoom (two fingers)
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (isPinching && lastPinchDist > 0) {
      const delta = (lastPinchDist - dist) * 0.01;
      camera.position.z = Math.max(1.5, Math.min(5.0, camera.position.z + delta));
    }
    isPinching = true;
    lastPinchDist = dist;
    isDragging = false;
    return;
  }
  // Single finger drag rotation
  if (!isDragging || e.touches.length !== 1) return;
  const touch = e.touches[0];
  globe.rotation.y += (touch.clientX - prevMouse.x) * 0.005;
  globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x + (touch.clientY - prevMouse.y) * 0.005));
  prevMouse = { x: touch.clientX, y: touch.clientY };
}, { passive: true });

// Scroll-wheel zoom for desktop
document.getElementById('globe').addEventListener('wheel', (e) => {
  e.preventDefault();
  if (!camera) return;
  const delta = e.deltaY * 0.002;
  camera.position.z = Math.max(1.5, Math.min(5.0, camera.position.z + delta));
}, { passive: false });

// Touch tap on markers and globe surface for mobile
document.getElementById('globe').addEventListener('touchend', (e) => {
  // Only handle single tap (not after drag)
  if (e.changedTouches.length === 1) {
    const touch = e.changedTouches[0];
    const dx = Math.abs(touch.clientX - touchStart.x);
    const dy = Math.abs(touch.clientY - touchStart.y);
    // If minimal movement, treat as tap/click
    if (dx < 10 && dy < 10) {
      const container = document.getElementById('globe');
      const rect = container.getBoundingClientRect();
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      // Priority: try marker dots first
      const intersects = raycaster.intersectObjects(countryMeshes);
      if (intersects.length > 0) {
        openModal(intersects[0].object.userData.name);
        return;
      }
      // Try globe surface - find nearest tracked country
      const globeHits = raycaster.intersectObject(globe);
      if (globeHits.length > 0) {
        const { lat, lng } = vector3ToLatLng(globeHits[0].point);
        const country = findNearestCountry(lat, lng);
        if (country) openModal(country);
      }
    }
  }
}, { passive: true });

function animate() {
  requestAnimationFrame(animate);
  if (!isDragging && autoRotate && globe) globe.rotation.y += 0.0008;
  animateConflictZones(); // Pulse conflict zones
  renderer.render(scene, camera);
}

// Sidebar tabs