// ThreatGroupOverlay.js — Custom hook for rendering non-state actor zones on the globe
// Uses large overlapping translucent circles for smooth painted-region appearance

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { THREAT_GROUPS, THREAT_TYPE_COLORS } from '../../data/threatGroupData';
import { latLngToVector3 } from '../Globe/GlobeView';
import { DAILY_BRIEFING } from '../../data/countries';

// Scan DAILY_BRIEFING headlines + descriptions for search term matches per group
function computeArticleCounts() {
  const counts = {};
  const articles = DAILY_BRIEFING || [];
  const texts = articles.map(a => ((a.headline || a.title || '') + ' ' + (a.description || '')).toLowerCase());

  for (const group of THREAT_GROUPS) {
    let count = 0;
    for (const text of texts) {
      for (const term of group.searchTerms) {
        if (text.includes(term)) { count++; break; }
      }
    }
    counts[group.id] = count;
  }
  return counts;
}


export function useThreatGroupOverlay() {
  const groupRef = useRef(null);
  const hiddenChildrenRef = useRef([]);

  const hideThreatGroups = useCallback(() => {
    const gv = window._globeView;
    const group = groupRef.current;

    if (group && gv && gv.globe) {
      gv.globe.remove(group);
      group.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    }

    // Restore all hidden globe children
    for (const child of hiddenChildrenRef.current) {
      child.visible = true;
    }
    hiddenChildrenRef.current = [];

    groupRef.current = null;
    window.threatGroupZones = [];
    window.threatGroupsActive = false;
  }, []);

  const showThreatGroups = useCallback(() => {
    hideThreatGroups();

    const gv = window._globeView;
    if (!gv || !gv.globe) return;
    const globe = gv.globe;

    // Hide ALL existing globe children — be aggressive: hide every Object3D that isn't a Line
    // This covers country dots (Mesh/SphereGeometry), pulsing rings (Mesh/RingGeometry),
    // conflict zones (Mesh), and any other mesh objects
    const hidden = [];
    globe.traverse(child => {
      if (child === globe) return; // skip the group itself
      if (child.isMesh) {
        child.visible = false;
        hidden.push(child);
      }
    });
    hiddenChildrenRef.current = hidden;

    const articleCounts = computeArticleCounts();
    const threeGroup = new THREE.Group();
    threeGroup.userData = { threatOverlay: true };
    const origin = new THREE.Vector3(0, 0, 0);

    const zoneIndex = []; // For distance-based click detection

    for (const tg of THREAT_GROUPS) {
      const color = new THREE.Color(THREAT_TYPE_COLORS[tg.type] || '#ff2d2d');
      const count = articleCounts[tg.id] || 0;
      const baseOpacity = 0.45 + Math.min(count / 5, 1) * 0.15;

      for (let z = 0; z < tg.zones.length; z++) {
        const zone = tg.zones[z];
        const rGlobe = zone.radiusKm / 6371;

        const geom = new THREE.CircleGeometry(rGlobe, 24);
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: baseOpacity,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(latLngToVector3(zone.lat, zone.lng, 1.008));
        mesh.lookAt(origin);
        mesh.userData = { threatZone: true };
        threeGroup.add(mesh);

        // Store zone center for distance-based click detection
        zoneIndex.push({
          lat: zone.lat,
          lng: zone.lng,
          radiusKm: zone.radiusKm,
          threatGroup: tg,
          articleCount: count,
        });
      }
    }

    globe.add(threeGroup);
    groupRef.current = threeGroup;
    window.threatGroupZones = zoneIndex;
    window.threatGroupsActive = true;
  }, [hideThreatGroups]);

  return { showThreatGroups, hideThreatGroups };
}
