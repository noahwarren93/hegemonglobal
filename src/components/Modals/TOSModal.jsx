// TOSModal.jsx - Mission / Privacy Policy / Terms of Service modal

import { useState, useEffect } from 'react';
import { TOS_CONTENT } from '../../data/countries';

const MISSION_CONTENT = `<h2>OUR MISSION</h2>
<p>Geopolitical intelligence shouldn't be as complicated as it is. Hegemon Global delivers real-time global risk monitoring to anyone who wants to understand what's happening in the world and why it matters. This tool is useful for analysts and policymakers, journalists, and the everyday person.</p>

<h2>WHAT WE DO</h2>
<p>We built an intelligence platform that does what no single news source can. Hegemon tracks breaking geopolitical events across 100+ sources worldwide, including Western and non-Western. It clusters them into unified event reports. Every source is labeled for political bias, and state media is flagged. AI generates intelligence briefings on each event so you get the full picture in seconds, not hours.</p>
<p>Beyond news, Hegemon monitors global markets, maps active trade routes and sanctions impacts, classifies every country's risk level from Clear to Catastrophic in real time, and lets you compare nations side by side across economic, military, and stability metrics. A daily intelligence brief breaks down the most significant developments from the day before.</p>
<p><strong>One platform. Every angle. No blind spots.</strong></p>

<h2>WHY IT EXISTS</h2>
<p>The world doesn't slow down for anyone. Conflicts escalate overnight. Markets react to every small development. Sanctions reshape trade routes in hours. Every outlet covers it through its own lens, pushing its own agendas, leaving you to piece together the truth from dozens of tabs.</p>
<p>We built Hegemon because the people who want and need to understand the world shouldn't have to spend hours doing it. One platform. Every source. The full picture.</p>

<h2>CONTACT</h2>
<p>hegemonglobal0@gmail.com</p>`;

export default function TOSModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('mission');

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

  const content = activeTab === 'mission' ? MISSION_CONTENT
    : activeTab === 'privacy' ? TOS_CONTENT.privacy
    : TOS_CONTENT.terms;

  return (
    <div className="tos-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tos-modal">
        <div className="tos-header">
          <div className="tos-tabs">
            <button
              className={`tos-tab ${activeTab === 'mission' ? 'active' : ''}`}
              onClick={() => setActiveTab('mission')}
            >
              Mission
            </button>
            <button
              className={`tos-tab ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy Policy
            </button>
            <button
              className={`tos-tab ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              Terms of Service
            </button>
          </div>
          <button className="tos-close" onClick={onClose}>&times;</button>
        </div>
        <div className="tos-body" dangerouslySetInnerHTML={{ __html: content || '' }} />
      </div>
    </div>
  );
}
