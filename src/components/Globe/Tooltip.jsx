// Tooltip.jsx - Globe hover tooltip (matches original #tooltip element)
/* eslint-disable react-refresh/only-export-components */

import { useRef, useEffect } from 'react';
import CountryFlag from '../CountryFlag';

export function positionTooltip(el, cx, cy) {
  const offset = 15;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = el.offsetWidth || 250;
  const th = el.offsetHeight || 80;

  let left = cx + offset;
  let top = cy + offset;

  if (left + tw > vw - 10) left = cx - tw - offset;
  if (left < 10) left = 10;
  if (top + th > vh - 10) top = cy - th - offset;
  if (top < 10) top = 10;

  el.style.left = left + 'px';
  el.style.top = top + 'px';
}

export default function Tooltip({ data, mousePos }) {
  const tooltipRef = useRef(null);

  // Position imperatively in an effect (matching original globe.js positionTooltip)
  useEffect(() => {
    if (tooltipRef.current && data && mousePos) {
      positionTooltip(tooltipRef.current, mousePos.x, mousePos.y);
    }
  }, [data, mousePos]);

  return (
    <div
      ref={tooltipRef}
      className="country-tooltip"
      id="tooltip"
      style={{ display: data ? 'block' : 'none' }}
    >
      {data && data.threatGroup ? (
        <>
          <div className="tooltip-name" style={{ color: '#ef4444' }}>
            {data.name}
          </div>
          <div className="tooltip-region">{data.title} • {data.region}</div>
          {data.strength && <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: 2 }}>Strength: {data.strength}</div>}
          {data.activities && <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: 1 }}>Activities: {data.activities}</div>}
          {data.articleCount > 0 && <div style={{ fontSize: '9px', color: '#06b6d4', marginTop: 2 }}>{data.articleCount} recent article{data.articleCount > 1 ? 's' : ''}</div>}
          <div className="tooltip-hint">Click for intel</div>
        </>
      ) : data ? (
        <>
          <div className="tooltip-name">
            <CountryFlag flag={data.flag} /> {data.name}{' '}
            {data.risk && (
              <span className={`tooltip-risk risk-${data.risk}`}>
                {data.risk.toUpperCase()}
              </span>
            )}
          </div>
          <div className="tooltip-region">
            {data.region} {data.title ? `• ${data.title}` : ''}
          </div>
          <div className="tooltip-hint">{data.military ? 'Click for intel' : 'Click for details'}</div>
        </>
      ) : null}
    </div>
  );
}
