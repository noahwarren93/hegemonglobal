// ThreatGroupOverlay.js — Custom hook for rendering threat group zones on the globe

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { THREAT_GROUPS, THREAT_TYPE_COLORS } from '../../data/threatGroupData';
import { latLngToVector3 } from '../Globe/GlobeView';

// Scan DAILY_BRIEFING headlines for search term matches per group
function computeArticleCounts() {
  const counts = {};
  const articles = window.DAILY_BRIEFING || [];
  const headlines = articles.map(a => (a.headline || a.title || '').toLowerCase());

  for (const group of THREAT_GROUPS) {
    let count = 0;
    for (const hl of headlines) {
      for (const term of group.searchTerms) {
        if (hl.includes(term)) { count++; break; }
      }
    }
    counts[group.id] = count;
  }
  return counts;
}

export function useThreatGroupOverlay() {
  const groupRef = useRef(null);

  const hideThreatGroups = useCallback(() => {
    const gv = window._globeView;
    const group = groupRef.current;

    if (group && gv && gv.globe) {
      gv.globe.remove(group);
      group.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    }

    groupRef.current = null;
    window.threatGroupMeshes = [];
    window.threatGroupsActive = false;
  }, []);

  const showThreatGroups = useCallback(() => {
    hideThreatGroups();

    const gv = window._globeView;
    if (!gv || !gv.globe) return;
    const globe = gv.globe;

    const articleCounts = computeArticleCounts();
    const group = new THREE.Group();
    const meshes = [];

    for (const tg of THREAT_GROUPS) {
      const color = THREAT_TYPE_COLORS[tg.type] || '#ef4444';
      const count = articleCounts[tg.id] || 0;
      // Opacity scales with article frequency: 0.25 base, up to 0.40
      const baseOpacity = 0.25 * (1 + Math.min(count / 5, 1) * 0.6);

      for (let z = 0; z < tg.zones.length; z++) {
        const zone = tg.zones[z];
        const radiusGlobe = zone.radiusKm / 6371;
        const geom = new THREE.CircleGeometry(radiusGlobe, 32);
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: baseOpacity,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        const mesh = new THREE.Mesh(geom, mat);
        const pos = latLngToVector3(zone.lat, zone.lng, 1.012);
        mesh.position.copy(pos);
        mesh.lookAt(new THREE.Vector3(0, 0, 0));

        mesh.userData = {
          threatGroup: tg,
          zoneIndex: z,
          baseOpacity,
          articleCount: count,
        };

        group.add(mesh);
        meshes.push(mesh);
      }
    }

    globe.add(group);
    groupRef.current = group;
    window.threatGroupMeshes = meshes;
    window.threatGroupsActive = true;
  }, [hideThreatGroups]);

  return { showThreatGroups, hideThreatGroups };
}
