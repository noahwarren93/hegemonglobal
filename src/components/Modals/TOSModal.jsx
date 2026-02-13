// TOSModal.jsx - Terms of Service / Privacy Policy modal

import { useState, useEffect } from 'react';
import { TOS_CONTENT } from '../../data/countries';

export default function TOSModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('terms');

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

  const content = activeTab === 'terms' ? TOS_CONTENT.terms : TOS_CONTENT.privacy;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content tos-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="tos-tabs">
          <button
            className={`tos-tab ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            Terms of Service
          </button>
          <button
            className={`tos-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
          </button>
        </div>

        <div className="tos-content">
          {content && content.map((section, i) => (
            <div key={i} className="tos-section">
              {section.title && <h3 className="tos-section-title">{section.title}</h3>}
              {section.text && <p className="tos-section-text">{section.text}</p>}
              {section.items && (
                <ul className="tos-list">
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
