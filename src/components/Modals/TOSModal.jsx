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
    <div className="tos-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tos-modal">
        <div className="tos-header">
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
          <button className="tos-close" onClick={onClose}>&times;</button>
        </div>
        <div className="tos-body" dangerouslySetInnerHTML={{ __html: content || '' }} />
      </div>
    </div>
  );
}
