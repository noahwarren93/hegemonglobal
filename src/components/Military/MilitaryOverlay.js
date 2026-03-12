// MilitaryOverlay.js — Custom hook for managing military installation markers on the globe

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ALL_MILITARY_INSTALLATIONS } from '../../data/militaryBases';
import { latLngToVector3 } from '../Globe/GlobeView';

export function useMilitaryOverlay() {
  const militaryGroupRef = useRef(null);
  const hiddenChildrenRef = useRef([]);

  const hideMilitary = useCallback(() => {
    const gv = window._globeView;
    const group = militaryGroupRef.current;

    // Remove military markers
    if (group && gv && gv.globe) {
      gv.globe.remove(group);
      group.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    }

    // Restore all hidden globe children (country dots, rings, conflict zones)
    for (const child of hiddenChildrenRef.current) {
      child.visible = true;
    }
    hiddenChildrenRef.current = [];

    militaryGroupRef.current = null;
    window.militaryMeshes = [];
    window.militaryMode = false;
    window._hoveredMilMesh = null;
  }, []);

  const showMilitary = useCallback(() => {
    hideMilitary();

    const gv = window._globeView;
    if (!gv || !gv.globe) return;
    const globe = gv.globe;

    // Hide ALL existing globe children except the globe mesh itself and grid lines
    // This covers country dots, pulsing rings, conflict zones — everything
    const hidden = [];
    for (const child of globe.children) {
      // Skip the globe sphere mesh (it's a Line for gridlines or has no userData)
      // Country markers have userData.name, rings and conflict zones are Mesh types
      if (child.isMesh && !child.userData.militaryBase) {
        child.visible = false;
        hidden.push(child);
      }
    }
    hiddenChildrenRef.current = hidden;

    // Create military markers
    const group = new THREE.Group();
    const meshes = [];

    ALL_MILITARY_INSTALLATIONS.forEach(installation => {
      const isCarrier = installation.type === 'carrier';
      const isUK = installation.country === 'United Kingdom';
      const baseSize = isCarrier ? 0.04 : 0.025;
      const pos = latLngToVector3(installation.lat, installation.lng, 1.025);

      // UK markers: dark outline mesh behind the white marker
      if (isUK) {
        const outlineSize = baseSize * 1.6;
        const outlineGeom = isCarrier
          ? new THREE.OctahedronGeometry(outlineSize)
          : new THREE.BoxGeometry(outlineSize, outlineSize, outlineSize);
        const outlineMat = new THREE.MeshBasicMaterial({
          color: '#374151',
          transparent: true,
          opacity: 0.9,
        });
        const outlineMesh = new THREE.Mesh(outlineGeom, outlineMat);
        outlineMesh.position.copy(pos);
        group.add(outlineMesh);
      }

      // Main marker
      const geom = isCarrier
        ? new THREE.OctahedronGeometry(baseSize)
        : new THREE.BoxGeometry(baseSize, baseSize, baseSize);

      const mat = new THREE.MeshBasicMaterial({
        color: installation.color,
        transparent: true,
        opacity: 0.95,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mesh.userData = { militaryBase: installation };

      group.add(mesh);
      meshes.push(mesh);
    });

    globe.add(group);
    militaryGroupRef.current = group;
    window.militaryMeshes = meshes;
    window.militaryMode = true;
    window._hoveredMilMesh = null;
  }, [hideMilitary]);

  return { showMilitary, hideMilitary };
}
