// MilitaryBasesPanel.jsx — Independent left-side panel listing all military installations

import { useState, useEffect } from 'react';
import { MILITARY_BASES, CARRIER_GROUPS, COUNTRY_COLORS } from '../../data/militaryBases';

const NUCLEAR_WARHEADS = {
  'Russia': '5,580', 'United States': '5,044', 'China': '500',
  'France': '290', 'United Kingdom': '225', 'India': '172',
  'Pakistan': '170', 'Israel': '90', 'North Korea': '50',
};

export default function MilitaryBasesPanel({ isOpen, onClose, onBaseSelect }) {
  const [expandedSections, setExpandedSections] = useState({});

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group bases by operating country
  const countryGroups = {};
  for (const base of MILITARY_BASES) {
    const country = base.country;
    if (!countryGroups[country]) countryGroups[country] = [];
    countryGroups[country].push(base);
  }

  // Ordered section list — priority countries first
  const SECTION_ORDER = [
    'United States', 'Russia', 'China', 'United Kingdom', 'France', 'Turkey',
    'Israel', 'Iran', 'India', 'Pakistan', 'North Korea', 'Germany', 'Japan', 'South Korea', 'Australia', 'NATO',
  ];
  const orderedSections = [];
  const seen = new Set();
  for (const s of SECTION_ORDER) {
    if (countryGroups[s]) { orderedSections.push(s); seen.add(s); }
  }
  Object.keys(countryGroups).sort().forEach(s => {
    if (!seen.has(s)) orderedSections.push(s);
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="mil-bases-panel active">
      <div className="mil-bases-header">
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6' }}>Military Installations</div>
          <div style={{ fontSize: '8px', color: '#6b7280', marginTop: '2px' }}>{MILITARY_BASES.length} bases + {CARRIER_GROUPS.length} carrier groups</div>
        </div>
        <button className="mil-bases-close" onClick={onClose}>&times;</button>
      </div>

      <div className="mil-bases-body">
        {orderedSections.map(section => {
          const bases = countryGroups[section];
          const isExpanded = !!expandedSections[section];
          const sectionFlag = bases[0]?.flag || '';
          const sectionColor = COUNTRY_COLORS[section] || '#6b7280';

          return (
            <div key={section}>
              <div
                onClick={() => toggleSection(section)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
                  borderBottom: '1px solid #1f2937', background: isExpanded ? 'rgba(59,130,246,0.06)' : 'rgba(17,24,39,0.3)',
                  cursor: 'pointer', transition: 'background 0.15s', userSelect: 'none',
                }}
              >
                <span style={{ fontSize: '11px' }}>{sectionFlag}</span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: sectionColor, letterSpacing: '0.3px', flex: 1 }}>{section}</span>
                <span style={{ fontSize: '7px', color: '#6b7280' }}>{bases.length}</span>
                {NUCLEAR_WARHEADS[section] && (
                  <span style={{ fontSize: '7px', color: '#fbbf24', marginLeft: '1px' }}>
                    {'\u2622'} {NUCLEAR_WARHEADS[section]}
                  </span>
                )}
                <span style={{ fontSize: '8px', color: '#6b7280', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  &#9660;
                </span>
              </div>

              {isExpanded && bases.map(base => (
                <div
                  key={base.id}
                  onClick={() => onBaseSelect(base)}
                  style={{
                    padding: '5px 10px 5px 18px', borderBottom: '1px solid #111827',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#e5e7eb', lineHeight: 1.3 }}>{base.name}</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '7px', color: '#9ca3af' }}>{base.location}</span>
                    <span style={{ fontSize: '6.5px', color: sectionColor, background: `${sectionColor}20`, padding: '1px 3px', borderRadius: '3px' }}>{base.branch}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Carrier Strike Groups */}
        <div
          onClick={() => toggleSection('__carriers__')}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 10px',
            borderBottom: '1px solid #1f2937', borderTop: '2px solid #1f2937',
            background: expandedSections['__carriers__'] ? 'rgba(6,182,212,0.06)' : 'rgba(17,24,39,0.3)',
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '10px' }}>&#9875;</span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.3px', flex: 1 }}>CARRIER STRIKE GROUPS</span>
          <span style={{ fontSize: '7px', color: '#6b7280' }}>{CARRIER_GROUPS.length}</span>
          <span style={{ fontSize: '9px', color: '#6b7280', transition: 'transform 0.2s', transform: expandedSections['__carriers__'] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            &#9660;
          </span>
        </div>
        {expandedSections['__carriers__'] && CARRIER_GROUPS.map(carrier => {
          const color = COUNTRY_COLORS[carrier.country] || '#6b7280';
          return (
            <div
              key={carrier.id}
              onClick={() => onBaseSelect(carrier)}
              style={{
                padding: '5px 10px 5px 18px', borderBottom: '1px solid #111827',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '9px' }}>{carrier.flag}</span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#e5e7eb', lineHeight: 1.3 }}>{carrier.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px', paddingLeft: '13px' }}>
                <span style={{ fontSize: '7px', color: '#9ca3af' }}>{carrier.location}</span>
                <span style={{ fontSize: '6.5px', color, background: `${color}20`, padding: '1px 3px', borderRadius: '3px' }}>{carrier.branch}</span>
              </div>
            </div>
          );
        })}

        <div style={{ padding: '6px 10px', fontSize: '7px', color: '#4b5563', textAlign: 'center', borderTop: '1px solid #1f2937' }}>
          Data as of March 2026
        </div>
      </div>
    </div>
  );
}
