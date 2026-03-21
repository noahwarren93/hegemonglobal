// EconomicOverlay.js — Custom hook for recoloring globe dots by economic risk tier

import { useCallback, useRef } from 'react';
import { COUNTRY_CODES } from '../../data/countryCodes';
import { RISK_COLORS } from '../../utils/riskColors';

// Economic tier → hex color (matching conflict risk palette)
const ECON_TIER_COLORS = {
  catastrophic: 0xdc2626,
  extreme: 0xf97316,
  severe: 0xeab308,
  stormy: 0x8b5cf6,
  cloudy: 0x3b82f6,
  clear: 0x22c55e
};

const NO_DATA_COLOR = 0x444444;

export function useEconomicOverlay() {
  const savedColorsRef = useRef(new Map());

  const showEconomic = useCallback((econData) => {
    const gv = window._globeView;
    if (!gv || !gv.countryMeshes) return;

    const countries = econData?.countries || {};
    const saved = new Map();

    gv.countryMeshes.forEach(mesh => {
      const name = mesh.userData.name;
      if (!name) return;

      // Save original color and opacity for restore
      saved.set(mesh.uuid, {
        color: mesh.material.color.getHex(),
        opacity: mesh.material.opacity
      });

      // Look up economic tier
      const codes = COUNTRY_CODES[name];
      const econ = codes ? countries[codes.alpha3] : null;

      if (econ && econ.tier && ECON_TIER_COLORS[econ.tier] !== undefined) {
        mesh.material.color.setHex(ECON_TIER_COLORS[econ.tier]);
        mesh.material.opacity = 0.95;
      } else {
        mesh.material.color.setHex(NO_DATA_COLOR);
        mesh.material.opacity = 0.4;
      }
      mesh.material.needsUpdate = true;
    });

    // Hide ring meshes (RingGeometry children on the globe) — plain dots only
    if (gv.globe) {
      for (const child of gv.globe.children) {
        if (child.isMesh && child.geometry?.type === 'RingGeometry' && !saved.has(child.uuid)) {
          saved.set(child.uuid, {
            color: child.material.color.getHex(),
            opacity: child.material.opacity,
            visible: child.visible
          });
          child.visible = false;
        }
      }
    }

    savedColorsRef.current = saved;
    window.economicOverlayActive = true;
    window._economicData = econData;
  }, []);

  const hideEconomic = useCallback(() => {
    const gv = window._globeView;
    if (!gv) return;

    const saved = savedColorsRef.current;

    // Restore country meshes
    if (gv.countryMeshes) {
      gv.countryMeshes.forEach(mesh => {
        const s = saved.get(mesh.uuid);
        if (s) {
          mesh.material.color.setHex(s.color);
          mesh.material.opacity = s.opacity;
        } else if (mesh.userData.data && RISK_COLORS[mesh.userData.data.risk]) {
          mesh.material.color.set(RISK_COLORS[mesh.userData.data.risk].glow);
          mesh.material.opacity = 0.95;
        }
      });
    }

    // Restore ring meshes (visibility + color)
    if (gv.globe) {
      for (const child of gv.globe.children) {
        if (child.isMesh && child.geometry?.type === 'RingGeometry') {
          const s = saved.get(child.uuid);
          if (s) {
            child.material.color.setHex(s.color);
            child.material.opacity = s.opacity;
            child.visible = s.visible !== undefined ? s.visible : true;
          }
        }
      }
    }

    savedColorsRef.current = new Map();
    window.economicOverlayActive = false;
    window._economicData = null;
  }, []);

  return { showEconomic, hideEconomic };
}
