// Tooltip.jsx - Globe hover tooltip (matches original #tooltip element)

import { useRef } from 'react';

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
  const ref = useRef(null);

  // Position imperatively (matching original globe.js positionTooltip)
  if (ref.current && data && mousePos) {
    positionTooltip(ref.current, mousePos.x, mousePos.y);
  }

  return (
    <div
      ref={ref}
      className="country-tooltip"
      id="tooltip"
      style={{ display: data ? 'block' : 'none' }}
    >
      {data && (
        <>
          <div className="tooltip-name">
            {data.flag} {data.name}{' '}
            <span className={`tooltip-risk risk-${data.risk}`}>
              {data.risk.toUpperCase()}
            </span>
          </div>
          <div className="tooltip-region">
            {data.region} • {data.title || ''}
          </div>
          <div className="tooltip-hint">Click for details</div>
        </>
      )}
    </div>
  );
}
