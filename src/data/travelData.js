// travelData.js - Travel advisory data for Travel tab

import { COUNTRIES, COUNTRY_DEMONYMS } from './countries';

// ============================================================
// SAFETY RATING MAP — Maps COUNTRIES risk levels to 1-5 travel safety
// ============================================================
export const SAFETY_RATING_MAP = {
  catastrophic: { level: 5, label: 'Do Not Travel', color: '#dc2626' },
  extreme:      { level: 4, label: 'Reconsider Travel', color: '#f97316' },
  severe:       { level: 3, label: 'Exercise Increased Caution', color: '#eab308' },
  stormy:       { level: 2, label: 'Exercise Normal Precautions', color: '#8b5cf6' },
  cloudy:       { level: 1, label: 'Safe', color: '#22c55e' },
  clear:        { level: 1, label: 'Safe', color: '#22c55e' },
};

// ============================================================
// REVERSE CITY INDEX — Pre-computed lookup: lowercase term → country name
// Built from COUNTRY_DEMONYMS at import time
// ============================================================
export const REVERSE_CITY_INDEX = {};

// Build reverse index from COUNTRY_DEMONYMS
for (const [country, terms] of Object.entries(COUNTRY_DEMONYMS)) {
  // Add the country name itself
  REVERSE_CITY_INDEX[country.toLowerCase()] = country;
  // Add all demonym terms
  for (const term of terms) {
    REVERSE_CITY_INDEX[term.toLowerCase()] = country;
  }
}

// Add leader names from COUNTRIES data
for (const [country, data] of Object.entries(COUNTRIES)) {
  if (data.leader) {
    const leaders = data.leader.split(/[/,]/).map(l => l.trim().replace(/\s*\(.*?\)\s*/g, ''));
    for (const leader of leaders) {
      if (leader.length > 3) {
        REVERSE_CITY_INDEX[leader.toLowerCase()] = country;
        // Also add last name
        const parts = leader.split(' ');
        if (parts.length > 1) {
          const lastName = parts[parts.length - 1];
          if (lastName.length > 3) {
            REVERSE_CITY_INDEX[lastName.toLowerCase()] = country;
          }
        }
      }
    }
  }
}

// ============================================================
// TRAVEL INFO — Hardcoded per-country travel data
// Covers top 40 tourist destinations + 10 high-risk countries
// ============================================================
export const TRAVEL_INFO = {
  'Afghanistan': {
    visa: { type: 'Visa Required', details: 'Visa must be obtained from Afghan embassy. Processing times unreliable due to conflict.' },
    health: [
      { alert: 'Active war zone — extreme risk of injury or death', severity: 'high' },
      { alert: 'Polio endemic — vaccination required', severity: 'high' },
      { alert: 'Limited to no medical facilities functioning', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '-1°C', condition: 'Cold/Dry', risk: 'Harsh winter' }, Feb: { temp: '2°C', condition: 'Cold/Dry', risk: 'Harsh winter' },
      Mar: { temp: '10°C', condition: 'Warming', risk: 'Low' }, Apr: { temp: '16°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '22°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '28°C', condition: 'Hot/Dry', risk: 'Heat' },
      Jul: { temp: '31°C', condition: 'Hot', risk: 'Extreme heat' }, Aug: { temp: '30°C', condition: 'Hot', risk: 'Extreme heat' },
      Sep: { temp: '25°C', condition: 'Warm', risk: 'Low' }, Oct: { temp: '17°C', condition: 'Cooling', risk: 'Low' },
      Nov: { temp: '9°C', condition: 'Cold', risk: 'Low' }, Dec: { temp: '3°C', condition: 'Cold/Dry', risk: 'Harsh winter' },
    }},
    tips: { currency: 'Afghani (AFN)', emergency: '119 (police), 112 (fire)', cultural: 'Conservative Islamic society. Full body covering expected for women.', transport: 'Roads extremely dangerous. No reliable public transport.' },
  },

  'Argentina': {
    visa: { type: 'Visa-Free', details: 'US/EU citizens: 90-day visa-free stay. Reciprocity fee abolished.' },
    health: [
      { alert: 'Zika virus present in northern regions', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '25°C', condition: 'Hot/Humid', risk: 'Heat in north' }, Feb: { temp: '24°C', condition: 'Hot', risk: 'Low' },
      Mar: { temp: '21°C', condition: 'Warm', risk: 'Low' }, Apr: { temp: '17°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '13°C', condition: 'Cool', risk: 'Low' }, Jun: { temp: '10°C', condition: 'Cool/Dry', risk: 'Low' },
      Jul: { temp: '9°C', condition: 'Cool/Dry', risk: 'Low' }, Aug: { temp: '11°C', condition: 'Cool', risk: 'Low' },
      Sep: { temp: '14°C', condition: 'Warming', risk: 'Low' }, Oct: { temp: '17°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '21°C', condition: 'Warm', risk: 'Low' }, Dec: { temp: '24°C', condition: 'Hot', risk: 'Low' },
    }},
    tips: { currency: 'Argentine Peso (ARS) — use Blue Dollar rate', emergency: '911', cultural: 'Dinner starts at 9-10pm. Mate tea is a social ritual.', transport: 'Buenos Aires has extensive metro. Domestic flights for Patagonia.' },
  },

  'Australia': {
    visa: { type: 'eTA Required', details: 'Electronic Travel Authority (subclass 601) required. Apply online, usually approved instantly.' },
    health: [
      { alert: 'Sun exposure risk — UV index very high', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '26°C', condition: 'Hot/Dry', risk: 'Bushfire season' }, Feb: { temp: '26°C', condition: 'Hot/Humid', risk: 'Cyclone season (north)' },
      Mar: { temp: '24°C', condition: 'Warm', risk: 'Low' }, Apr: { temp: '21°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '17°C', condition: 'Cool', risk: 'Low' }, Jun: { temp: '14°C', condition: 'Cool', risk: 'Low' },
      Jul: { temp: '13°C', condition: 'Cool/Dry', risk: 'Low' }, Aug: { temp: '14°C', condition: 'Cool', risk: 'Low' },
      Sep: { temp: '17°C', condition: 'Warming', risk: 'Low' }, Oct: { temp: '20°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '22°C', condition: 'Warm', risk: 'Low' }, Dec: { temp: '25°C', condition: 'Hot', risk: 'Bushfire risk' },
    }},
    tips: { currency: 'Australian Dollar (AUD)', emergency: '000', cultural: 'Casual and relaxed culture. Tipping not expected.', transport: 'Vast distances — domestic flights essential. Drive on the left.' },
  },

  'Brazil': {
    visa: { type: 'e-Visa', details: 'US citizens need e-Visa ($80). Apply online at least 72 hours before travel.' },
    health: [
      { alert: 'Yellow fever vaccination required for some regions', severity: 'high' },
      { alert: 'Zika and Dengue present — use mosquito repellent', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '27°C', condition: 'Hot/Rainy', risk: 'Flooding in Rio' }, Feb: { temp: '27°C', condition: 'Hot/Rainy', risk: 'Carnival crowds' },
      Mar: { temp: '26°C', condition: 'Warm/Rainy', risk: 'Low' }, Apr: { temp: '24°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '22°C', condition: 'Mild', risk: 'Low' }, Jun: { temp: '21°C', condition: 'Mild/Dry', risk: 'Low' },
      Jul: { temp: '20°C', condition: 'Cool/Dry', risk: 'Low' }, Aug: { temp: '21°C', condition: 'Cool/Dry', risk: 'Low' },
      Sep: { temp: '22°C', condition: 'Warming', risk: 'Low' }, Oct: { temp: '23°C', condition: 'Warm', risk: 'Low' },
      Nov: { temp: '25°C', condition: 'Warm/Rainy', risk: 'Low' }, Dec: { temp: '26°C', condition: 'Hot/Rainy', risk: 'Flooding risk' },
    }},
    tips: { currency: 'Brazilian Real (BRL)', emergency: '190 (police), 192 (ambulance)', cultural: 'Portuguese spoken. Warm and physical greetings. Beach culture strong.', transport: 'Uber widely used. Avoid walking with valuables in cities.' },
  },

  'Canada': {
    visa: { type: 'eTA Required', details: 'Electronic Travel Authorization for visa-exempt nationals. US citizens exempt.' },
    health: [
      { alert: 'No major health risks', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '-10°C', condition: 'Cold/Snow', risk: 'Extreme cold' }, Feb: { temp: '-8°C', condition: 'Cold/Snow', risk: 'Extreme cold' },
      Mar: { temp: '-2°C', condition: 'Cold', risk: 'Low' }, Apr: { temp: '6°C', condition: 'Cool', risk: 'Low' },
      May: { temp: '13°C', condition: 'Mild', risk: 'Low' }, Jun: { temp: '19°C', condition: 'Warm', risk: 'Low' },
      Jul: { temp: '22°C', condition: 'Warm', risk: 'Wildfire smoke (west)' }, Aug: { temp: '21°C', condition: 'Warm', risk: 'Wildfire smoke (west)' },
      Sep: { temp: '16°C', condition: 'Cool', risk: 'Low' }, Oct: { temp: '9°C', condition: 'Cool', risk: 'Low' },
      Nov: { temp: '2°C', condition: 'Cold', risk: 'Low' }, Dec: { temp: '-6°C', condition: 'Cold/Snow', risk: 'Extreme cold' },
    }},
    tips: { currency: 'Canadian Dollar (CAD)', emergency: '911', cultural: 'Bilingual (English/French). Very polite culture. Tip 15-20%.', transport: 'Excellent highways. VIA Rail for scenic routes. Domestic flights for long distances.' },
  },

  'China': {
    visa: { type: 'Visa Required', details: 'Tourist visa (L-type) required. 144-hour visa-free transit available in select cities.' },
    health: [
      { alert: 'Air pollution in major cities — bring masks', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '-2°C', condition: 'Cold/Dry', risk: 'Extreme cold (north)' }, Feb: { temp: '1°C', condition: 'Cold', risk: 'Low' },
      Mar: { temp: '8°C', condition: 'Cool', risk: 'Sandstorms (north)' }, Apr: { temp: '15°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '21°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '26°C', condition: 'Hot/Humid', risk: 'Monsoon begins (south)' },
      Jul: { temp: '28°C', condition: 'Hot/Humid', risk: 'Typhoon season' }, Aug: { temp: '27°C', condition: 'Hot/Humid', risk: 'Typhoon season' },
      Sep: { temp: '22°C', condition: 'Warm', risk: 'Typhoons' }, Oct: { temp: '15°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '7°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '0°C', condition: 'Cold', risk: 'Low' },
    }},
    tips: { currency: 'Chinese Yuan (CNY)', emergency: '110 (police), 120 (ambulance)', cultural: 'VPN needed for Western apps. WeChat/Alipay essential for payments.', transport: 'High-speed rail network is world-class. Metro in all major cities.' },
  },

  'Colombia': {
    visa: { type: 'Visa-Free', details: 'US/EU citizens: 90-day visa-free stay, extendable.' },
    health: [
      { alert: 'Yellow fever vaccination required for certain areas', severity: 'medium' },
      { alert: 'Altitude sickness in Bogota (2,640m)', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '14°C', condition: 'Dry', risk: 'Low' }, Feb: { temp: '14°C', condition: 'Dry', risk: 'Low' },
      Mar: { temp: '15°C', condition: 'Transition', risk: 'Low' }, Apr: { temp: '14°C', condition: 'Rainy', risk: 'Flooding' },
      May: { temp: '14°C', condition: 'Rainy', risk: 'Flooding' }, Jun: { temp: '14°C', condition: 'Dry', risk: 'Low' },
      Jul: { temp: '13°C', condition: 'Dry', risk: 'Low' }, Aug: { temp: '14°C', condition: 'Dry', risk: 'Low' },
      Sep: { temp: '14°C', condition: 'Transition', risk: 'Low' }, Oct: { temp: '14°C', condition: 'Rainy', risk: 'Flooding' },
      Nov: { temp: '14°C', condition: 'Rainy', risk: 'Flooding' }, Dec: { temp: '14°C', condition: 'Dry', risk: 'Low' },
    }},
    tips: { currency: 'Colombian Peso (COP)', emergency: '123', cultural: 'Spanish spoken. Coffee culture. Avoid discussing drug trade.', transport: 'Uber available. Domestic flights between major cities. Avoid road travel at night.' },
  },

  'Cuba': {
    visa: { type: 'Tourist Card Required', details: 'Tourist card ($50-100) required. US citizens face additional restrictions under OFAC categories.' },
    health: [
      { alert: 'Limited medical supplies — bring your own medications', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '22°C', condition: 'Dry/Warm', risk: 'Low' }, Feb: { temp: '22°C', condition: 'Dry/Warm', risk: 'Low' },
      Mar: { temp: '23°C', condition: 'Dry/Warm', risk: 'Low' }, Apr: { temp: '25°C', condition: 'Warming', risk: 'Low' },
      May: { temp: '26°C', condition: 'Rainy starts', risk: 'Low' }, Jun: { temp: '27°C', condition: 'Rainy/Hot', risk: 'Hurricane season' },
      Jul: { temp: '28°C', condition: 'Hot/Humid', risk: 'Hurricane season' }, Aug: { temp: '28°C', condition: 'Hot/Humid', risk: 'Hurricane season' },
      Sep: { temp: '27°C', condition: 'Hot/Humid', risk: 'Peak hurricane' }, Oct: { temp: '26°C', condition: 'Rainy', risk: 'Hurricane season' },
      Nov: { temp: '24°C', condition: 'Cooling', risk: 'Low' }, Dec: { temp: '23°C', condition: 'Dry/Warm', risk: 'Low' },
    }},
    tips: { currency: 'Cuban Peso (CUP) — bring EUR or CAD cash', emergency: '106 (police), 104 (ambulance)', cultural: 'US credit cards do not work. Bring cash. Music and dance central to culture.', transport: 'Classic car taxis. Limited ride-share. Viazul bus for intercity.' },
  },

  'Egypt': {
    visa: { type: 'e-Visa', details: 'e-Visa available online ($25 single entry, $60 multiple entry). Visa on arrival at airport.' },
    health: [
      { alert: 'Traveler\'s diarrhea common — drink bottled water only', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '14°C', condition: 'Mild/Dry', risk: 'Low' }, Feb: { temp: '15°C', condition: 'Mild/Dry', risk: 'Low' },
      Mar: { temp: '18°C', condition: 'Warm', risk: 'Sandstorms (Khamaseen)' }, Apr: { temp: '22°C', condition: 'Warm', risk: 'Sandstorms' },
      May: { temp: '27°C', condition: 'Hot', risk: 'Heat' }, Jun: { temp: '30°C', condition: 'Very Hot', risk: 'Extreme heat' },
      Jul: { temp: '32°C', condition: 'Very Hot', risk: 'Extreme heat' }, Aug: { temp: '32°C', condition: 'Very Hot', risk: 'Extreme heat' },
      Sep: { temp: '29°C', condition: 'Hot', risk: 'Heat' }, Oct: { temp: '25°C', condition: 'Warm', risk: 'Low' },
      Nov: { temp: '20°C', condition: 'Mild', risk: 'Low' }, Dec: { temp: '16°C', condition: 'Mild/Dry', risk: 'Low' },
    }},
    tips: { currency: 'Egyptian Pound (EGP)', emergency: '122 (police), 123 (ambulance)', cultural: 'Conservative dress at religious sites. Bargaining expected in markets.', transport: 'Uber available in Cairo. Nile cruises between Luxor-Aswan. Domestic flights.' },
  },

  'France': {
    visa: { type: 'Visa-Free (Schengen)', details: 'US/UK citizens: 90-day visa-free stay within 180-day period. ETIAS required from 2025.' },
    health: [
      { alert: 'No major health risks', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '5°C', condition: 'Cold/Rainy', risk: 'Low' }, Feb: { temp: '6°C', condition: 'Cold', risk: 'Low' },
      Mar: { temp: '10°C', condition: 'Cool', risk: 'Low' }, Apr: { temp: '13°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '17°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '21°C', condition: 'Warm', risk: 'Low' },
      Jul: { temp: '24°C', condition: 'Hot', risk: 'Heatwave risk' }, Aug: { temp: '24°C', condition: 'Hot', risk: 'Heatwave risk' },
      Sep: { temp: '20°C', condition: 'Warm', risk: 'Low' }, Oct: { temp: '15°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '9°C', condition: 'Cool/Rainy', risk: 'Low' }, Dec: { temp: '6°C', condition: 'Cold', risk: 'Low' },
    }},
    tips: { currency: 'Euro (EUR)', emergency: '112 (EU-wide), 15 (medical)', cultural: 'Greet shopkeepers upon entering. Service charge included — small tip appreciated.', transport: 'TGV high-speed rail. Paris Metro excellent. Toll motorways.' },
  },

  'Germany': {
    visa: { type: 'Visa-Free (Schengen)', details: 'US/UK citizens: 90-day visa-free stay within 180-day period.' },
    health: [
      { alert: 'Tick-borne encephalitis in southern regions', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '1°C', condition: 'Cold', risk: 'Low' }, Feb: { temp: '2°C', condition: 'Cold', risk: 'Low' },
      Mar: { temp: '6°C', condition: 'Cool', risk: 'Low' }, Apr: { temp: '10°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '15°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '18°C', condition: 'Warm', risk: 'Low' },
      Jul: { temp: '20°C', condition: 'Warm', risk: 'Low' }, Aug: { temp: '20°C', condition: 'Warm', risk: 'Low' },
      Sep: { temp: '16°C', condition: 'Mild', risk: 'Low' }, Oct: { temp: '10°C', condition: 'Cool', risk: 'Low' },
      Nov: { temp: '5°C', condition: 'Cool/Rainy', risk: 'Low' }, Dec: { temp: '2°C', condition: 'Cold', risk: 'Christmas markets!' },
    }},
    tips: { currency: 'Euro (EUR)', emergency: '112', cultural: 'Cash preferred in many shops. Punctuality important. Quiet hours (Ruhezeit) after 10pm.', transport: 'Deutsche Bahn rail network. Autobahn (some sections no speed limit). Excellent public transit.' },
  },

  'Greece': {
    visa: { type: 'Visa-Free (Schengen)', details: 'US/UK citizens: 90-day visa-free stay within 180-day period.' },
    health: [
      { alert: 'No major health risks', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '10°C', condition: 'Cool/Rainy', risk: 'Low' }, Feb: { temp: '10°C', condition: 'Cool', risk: 'Low' },
      Mar: { temp: '13°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '17°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '22°C', condition: 'Warm/Dry', risk: 'Low' }, Jun: { temp: '27°C', condition: 'Hot/Dry', risk: 'Wildfire risk' },
      Jul: { temp: '30°C', condition: 'Hot', risk: 'Wildfire risk / Heat' }, Aug: { temp: '30°C', condition: 'Hot', risk: 'Wildfire risk / Heat' },
      Sep: { temp: '26°C', condition: 'Warm', risk: 'Low' }, Oct: { temp: '21°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '16°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '12°C', condition: 'Cool/Rainy', risk: 'Low' },
    }},
    tips: { currency: 'Euro (EUR)', emergency: '112', cultural: 'Relaxed pace. Afternoon siesta common. Tipping 5-10%.', transport: 'Ferries between islands. Athens metro. Rental cars for island exploration.' },
  },

  'India': {
    visa: { type: 'e-Visa', details: 'e-Tourist visa available online ($10-80 depending on duration). Apply at least 4 days before travel.' },
    health: [
      { alert: 'Malaria and Dengue risk in rural areas', severity: 'medium' },
      { alert: 'Traveler\'s diarrhea very common — drink only bottled water', severity: 'medium' },
      { alert: 'Air pollution severe in Delhi (Oct-Feb)', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '14°C', condition: 'Cool/Dry', risk: 'Pollution (north)' }, Feb: { temp: '17°C', condition: 'Warming', risk: 'Low' },
      Mar: { temp: '23°C', condition: 'Warm', risk: 'Low' }, Apr: { temp: '30°C', condition: 'Hot', risk: 'Heat' },
      May: { temp: '33°C', condition: 'Very Hot', risk: 'Extreme heat' }, Jun: { temp: '34°C', condition: 'Hot/Monsoon', risk: 'Monsoon flooding' },
      Jul: { temp: '31°C', condition: 'Monsoon', risk: 'Heavy flooding' }, Aug: { temp: '30°C', condition: 'Monsoon', risk: 'Heavy flooding' },
      Sep: { temp: '29°C', condition: 'Monsoon ending', risk: 'Flooding' }, Oct: { temp: '26°C', condition: 'Warm', risk: 'Pollution starts' },
      Nov: { temp: '20°C', condition: 'Cool', risk: 'Severe pollution (north)' }, Dec: { temp: '15°C', condition: 'Cool/Dry', risk: 'Pollution' },
    }},
    tips: { currency: 'Indian Rupee (INR)', emergency: '112 (unified), 100 (police)', cultural: 'Remove shoes before entering homes/temples. Use right hand for eating. Dress modestly at religious sites.', transport: 'Extensive rail network. Ride-share apps (Ola, Uber). Auto-rickshaws in cities.' },
  },

  'Indonesia': {
    visa: { type: 'Visa on Arrival', details: 'Visa on arrival ($35) for 30 days, extendable once. e-VOA available online.' },
    health: [
      { alert: 'Dengue fever risk — use mosquito repellent', severity: 'medium' },
      { alert: 'Rabies present — avoid stray animals', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '27°C', condition: 'Rainy', risk: 'Flooding' }, Feb: { temp: '27°C', condition: 'Rainy', risk: 'Flooding' },
      Mar: { temp: '27°C', condition: 'Rainy', risk: 'Low' }, Apr: { temp: '28°C', condition: 'Transition', risk: 'Low' },
      May: { temp: '28°C', condition: 'Dry', risk: 'Low' }, Jun: { temp: '27°C', condition: 'Dry', risk: 'Low' },
      Jul: { temp: '27°C', condition: 'Dry', risk: 'Low' }, Aug: { temp: '27°C', condition: 'Dry', risk: 'Low' },
      Sep: { temp: '28°C', condition: 'Dry', risk: 'Low' }, Oct: { temp: '28°C', condition: 'Transition', risk: 'Low' },
      Nov: { temp: '28°C', condition: 'Rainy starts', risk: 'Low' }, Dec: { temp: '27°C', condition: 'Rainy', risk: 'Flooding' },
    }},
    tips: { currency: 'Indonesian Rupiah (IDR)', emergency: '112', cultural: 'Muslim majority — dress modestly outside Bali. Remove shoes indoors.', transport: 'Grab ride-share. Domestic flights (Lion Air, Garuda). Scooter rentals in Bali.' },
  },

  'Iran': {
    visa: { type: 'Visa Required', details: 'Tourist visa available but currently SUSPENDED due to active military conflict.' },
    health: [
      { alert: 'ACTIVE WAR ZONE — All travel suspended', severity: 'high' },
      { alert: 'Medical infrastructure severely damaged by airstrikes', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '3°C', condition: 'Cold/Dry', risk: 'Low' }, Feb: { temp: '6°C', condition: 'Cold', risk: 'Low' },
      Mar: { temp: '12°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '18°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '24°C', condition: 'Hot', risk: 'Low' }, Jun: { temp: '30°C', condition: 'Very Hot', risk: 'Extreme heat' },
      Jul: { temp: '33°C', condition: 'Very Hot', risk: 'Extreme heat' }, Aug: { temp: '32°C', condition: 'Very Hot', risk: 'Extreme heat' },
      Sep: { temp: '27°C', condition: 'Hot', risk: 'Low' }, Oct: { temp: '20°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '12°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '5°C', condition: 'Cold', risk: 'Low' },
    }},
    tips: { currency: 'Iranian Rial (IRR)', emergency: '110 (police), 115 (ambulance)', cultural: 'ALL TRAVEL SUSPENDED. Country under active US-Israeli military strikes.', transport: 'ALL TRAVEL SUSPENDED.' },
  },

  'Iraq': {
    visa: { type: 'Visa on Arrival', details: 'Visa on arrival available at some airports. Pre-arranged visa recommended.' },
    health: [
      { alert: 'Risk of conflict-related violence', severity: 'high' },
      { alert: 'Water-borne diseases — drink bottled water', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '10°C', condition: 'Cool/Rainy', risk: 'Low' }, Feb: { temp: '12°C', condition: 'Mild', risk: 'Low' },
      Mar: { temp: '17°C', condition: 'Warm', risk: 'Sandstorms' }, Apr: { temp: '23°C', condition: 'Hot', risk: 'Sandstorms' },
      May: { temp: '30°C', condition: 'Very Hot', risk: 'Extreme heat' }, Jun: { temp: '35°C', condition: 'Extreme', risk: 'Extreme heat' },
      Jul: { temp: '38°C', condition: 'Extreme', risk: 'Extreme heat' }, Aug: { temp: '37°C', condition: 'Extreme', risk: 'Extreme heat' },
      Sep: { temp: '33°C', condition: 'Hot', risk: 'Heat' }, Oct: { temp: '26°C', condition: 'Warm', risk: 'Low' },
      Nov: { temp: '18°C', condition: 'Mild', risk: 'Low' }, Dec: { temp: '12°C', condition: 'Cool', risk: 'Low' },
    }},
    tips: { currency: 'Iraqi Dinar (IQD)', emergency: '104 (police), 122 (fire)', cultural: 'Kurdish region (KRI) is significantly safer. Conservative Islamic culture.', transport: 'Limited public transit. Hire local drivers. Kurdistan has better infrastructure.' },
  },

  'Israel': {
    visa: { type: 'Visa-Free', details: 'US/EU citizens: 90-day visa-free stay. ETA-IL electronic authorization may be required.' },
    health: [
      { alert: 'Active military operations — check current security situation', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '12°C', condition: 'Cool/Rainy', risk: 'Low' }, Feb: { temp: '13°C', condition: 'Cool/Rainy', risk: 'Low' },
      Mar: { temp: '16°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '20°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '24°C', condition: 'Hot/Dry', risk: 'Low' }, Jun: { temp: '27°C', condition: 'Hot', risk: 'Heat' },
      Jul: { temp: '29°C', condition: 'Hot/Humid', risk: 'Heat' }, Aug: { temp: '29°C', condition: 'Hot/Humid', risk: 'Heat' },
      Sep: { temp: '27°C', condition: 'Hot', risk: 'Low' }, Oct: { temp: '24°C', condition: 'Warm', risk: 'Low' },
      Nov: { temp: '18°C', condition: 'Mild', risk: 'Low' }, Dec: { temp: '14°C', condition: 'Cool/Rainy', risk: 'Low' },
    }},
    tips: { currency: 'Israeli New Shekel (ILS)', emergency: '100 (police), 101 (ambulance)', cultural: 'Shabbat (Fri sunset-Sat night): many services closed. Security checks at malls.', transport: 'Excellent bus system. Light rail in Jerusalem. No public transit on Shabbat.' },
  },

  'Italy': {
    visa: { type: 'Visa-Free (Schengen)', details: 'US/UK citizens: 90-day visa-free stay within 180-day period.' },
    health: [
      { alert: 'No major health risks', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '7°C', condition: 'Cool/Rainy', risk: 'Low' }, Feb: { temp: '8°C', condition: 'Cool', risk: 'Low' },
      Mar: { temp: '12°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '15°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '20°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '24°C', condition: 'Hot', risk: 'Low' },
      Jul: { temp: '28°C', condition: 'Hot', risk: 'Heatwave risk' }, Aug: { temp: '28°C', condition: 'Hot', risk: 'Heatwave / Crowds' },
      Sep: { temp: '24°C', condition: 'Warm', risk: 'Low' }, Oct: { temp: '18°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '12°C', condition: 'Cool/Rainy', risk: 'Venice flooding (Acqua alta)' }, Dec: { temp: '8°C', condition: 'Cool', risk: 'Low' },
    }},
    tips: { currency: 'Euro (EUR)', emergency: '112', cultural: 'Dress code for churches. Lunch 12-2pm, dinner after 8pm. Coffee at the bar is cheaper.', transport: 'Trenitalia/Italo high-speed rail. Rome/Milan metro. ZTL restricted driving zones in cities.' },
  },

  'Japan': {
    visa: { type: 'Visa-Free', details: 'US/EU citizens: 90-day visa-free stay. Visit Japan Web registration recommended.' },
    health: [
      { alert: 'No major health risks — excellent healthcare system', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '5°C', condition: 'Cold/Dry', risk: 'Low' }, Feb: { temp: '6°C', condition: 'Cold', risk: 'Low' },
      Mar: { temp: '10°C', condition: 'Cool', risk: 'Cherry blossom season' }, Apr: { temp: '15°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '20°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '23°C', condition: 'Rainy (Tsuyu)', risk: 'Heavy rain' },
      Jul: { temp: '27°C', condition: 'Hot/Humid', risk: 'Extreme humidity' }, Aug: { temp: '28°C', condition: 'Hot/Humid', risk: 'Typhoon season' },
      Sep: { temp: '24°C', condition: 'Warm', risk: 'Typhoon season' }, Oct: { temp: '18°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '13°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '7°C', condition: 'Cold', risk: 'Heavy snow (north)' },
    }},
    tips: { currency: 'Japanese Yen (JPY)', emergency: '110 (police), 119 (fire/ambulance)', cultural: 'Bow when greeting. Remove shoes indoors. No tipping. Quiet on trains.', transport: 'JR Pass for bullet trains. IC cards (Suica/Pasmo) for metro. Extremely punctual.' },
  },

  'Kenya': {
    visa: { type: 'e-Visa / eTA', details: 'Electronic Travel Authorization required. Apply online before travel.' },
    health: [
      { alert: 'Malaria risk — prophylaxis recommended', severity: 'high' },
      { alert: 'Yellow fever vaccination required if traveling from endemic area', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '19°C', condition: 'Warm/Dry', risk: 'Low' }, Feb: { temp: '20°C', condition: 'Warm/Dry', risk: 'Low' },
      Mar: { temp: '20°C', condition: 'Warm', risk: 'Long rains start' }, Apr: { temp: '19°C', condition: 'Rainy', risk: 'Heavy rain' },
      May: { temp: '18°C', condition: 'Rainy', risk: 'Flooding' }, Jun: { temp: '17°C', condition: 'Cool/Dry', risk: 'Low' },
      Jul: { temp: '16°C', condition: 'Cool/Dry', risk: 'Great Migration' }, Aug: { temp: '16°C', condition: 'Cool/Dry', risk: 'Great Migration' },
      Sep: { temp: '18°C', condition: 'Warming', risk: 'Low' }, Oct: { temp: '19°C', condition: 'Short rains', risk: 'Low' },
      Nov: { temp: '18°C', condition: 'Rainy', risk: 'Low' }, Dec: { temp: '19°C', condition: 'Warm', risk: 'Low' },
    }},
    tips: { currency: 'Kenyan Shilling (KES)', emergency: '999 or 112', cultural: 'Swahili greetings appreciated (Jambo/Hakuna matata). Safari tipping: $10-20/day for guides.', transport: 'SGR train Nairobi-Mombasa. Safari vehicles for parks. Matatus (minibuses) in cities.' },
  },

  'Lebanon': {
    visa: { type: 'Visa on Arrival', details: 'Free visa on arrival for most nationalities (1-3 months). Israeli stamps in passport will result in denial.' },
    health: [
      { alert: 'Active military conflict — IDF operations in southern Lebanon', severity: 'high' },
      { alert: 'Medical supply shortages due to economic crisis', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '11°C', condition: 'Cool/Rainy', risk: 'Low' }, Feb: { temp: '11°C', condition: 'Cool/Rainy', risk: 'Low' },
      Mar: { temp: '14°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '18°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '22°C', condition: 'Warm/Dry', risk: 'Low' }, Jun: { temp: '26°C', condition: 'Hot', risk: 'Low' },
      Jul: { temp: '28°C', condition: 'Hot/Humid', risk: 'Low' }, Aug: { temp: '28°C', condition: 'Hot/Humid', risk: 'Low' },
      Sep: { temp: '26°C', condition: 'Warm', risk: 'Low' }, Oct: { temp: '22°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '17°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '13°C', condition: 'Cool/Rainy', risk: 'Low' },
    }},
    tips: { currency: 'Lebanese Pound (LBP) — USD widely accepted', emergency: '112', cultural: 'Multicultural society. French and Arabic spoken. Nightlife in Beirut.', transport: 'No public metro. Taxis and ride-share. Avoid southern border areas.' },
  },

  'Mexico': {
    visa: { type: 'Visa-Free', details: 'US/EU citizens: 180-day visa-free stay. FMM tourist card completed on arrival.' },
    health: [
      { alert: 'Dengue fever risk in coastal/tropical areas', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '15°C', condition: 'Cool/Dry', risk: 'Low' }, Feb: { temp: '16°C', condition: 'Cool/Dry', risk: 'Low' },
      Mar: { temp: '19°C', condition: 'Warm', risk: 'Low' }, Apr: { temp: '21°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '22°C', condition: 'Hot', risk: 'Low' }, Jun: { temp: '20°C', condition: 'Rainy', risk: 'Hurricane season (coast)' },
      Jul: { temp: '19°C', condition: 'Rainy', risk: 'Hurricane season' }, Aug: { temp: '19°C', condition: 'Rainy', risk: 'Hurricane season' },
      Sep: { temp: '19°C', condition: 'Rainy', risk: 'Peak hurricane' }, Oct: { temp: '18°C', condition: 'Cooling', risk: 'Hurricane season' },
      Nov: { temp: '16°C', condition: 'Cool/Dry', risk: 'Low' }, Dec: { temp: '14°C', condition: 'Cool/Dry', risk: 'Low' },
    }},
    tips: { currency: 'Mexican Peso (MXN)', emergency: '911', cultural: 'Spanish spoken. Tipping 10-15%. Many regions safe for tourists despite media portrayal.', transport: 'Uber available in major cities. ADO bus for intercity. Domestic flights affordable.' },
  },

  'Morocco': {
    visa: { type: 'Visa-Free', details: 'US/EU citizens: 90-day visa-free stay.' },
    health: [
      { alert: 'Traveler\'s diarrhea risk — bottled water recommended', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '12°C', condition: 'Cool/Rainy', risk: 'Low' }, Feb: { temp: '14°C', condition: 'Cool', risk: 'Low' },
      Mar: { temp: '16°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '18°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '21°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '25°C', condition: 'Hot', risk: 'Low' },
      Jul: { temp: '28°C', condition: 'Hot', risk: 'Extreme heat inland' }, Aug: { temp: '28°C', condition: 'Hot', risk: 'Extreme heat inland' },
      Sep: { temp: '25°C', condition: 'Warm', risk: 'Low' }, Oct: { temp: '21°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '17°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '13°C', condition: 'Cool/Rainy', risk: 'Low' },
    }},
    tips: { currency: 'Moroccan Dirham (MAD)', emergency: '19 (police), 15 (ambulance)', cultural: 'Bargaining expected in souks. Dress modestly. Friday is holy day. Ask before photographing people.', transport: 'Al Boraq high-speed rail (Tangier-Casablanca). Grands taxis for intercity. Riad stays recommended.' },
  },

  'Myanmar': {
    visa: { type: 'e-Visa', details: 'e-Visa available ($50) but country under military junta — travel strongly discouraged.' },
    health: [
      { alert: 'Active civil war — extreme danger in conflict zones', severity: 'high' },
      { alert: 'Malaria risk in rural areas', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '25°C', condition: 'Cool/Dry', risk: 'Low' }, Feb: { temp: '27°C', condition: 'Warming', risk: 'Low' },
      Mar: { temp: '30°C', condition: 'Hot', risk: 'Heat' }, Apr: { temp: '32°C', condition: 'Very Hot', risk: 'Extreme heat' },
      May: { temp: '30°C', condition: 'Monsoon starts', risk: 'Flooding' }, Jun: { temp: '28°C', condition: 'Monsoon', risk: 'Heavy flooding' },
      Jul: { temp: '27°C', condition: 'Monsoon', risk: 'Heavy flooding' }, Aug: { temp: '27°C', condition: 'Monsoon', risk: 'Heavy flooding' },
      Sep: { temp: '28°C', condition: 'Monsoon ending', risk: 'Flooding' }, Oct: { temp: '28°C', condition: 'Warm', risk: 'Low' },
      Nov: { temp: '27°C', condition: 'Cool/Dry', risk: 'Low' }, Dec: { temp: '25°C', condition: 'Cool/Dry', risk: 'Low' },
    }},
    tips: { currency: 'Myanmar Kyat (MMK)', emergency: '199', cultural: 'Military junta control. Internet restricted. Foreign journalists targeted.', transport: 'Domestic flights unreliable. Road travel dangerous due to conflict.' },
  },

  'New Zealand': {
    visa: { type: 'NZeTA Required', details: 'New Zealand Electronic Travel Authority required ($12-17). Apply at least 72 hours before travel.' },
    health: [
      { alert: 'No major health risks — excellent healthcare', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '20°C', condition: 'Warm', risk: 'UV very high' }, Feb: { temp: '20°C', condition: 'Warm', risk: 'UV high' },
      Mar: { temp: '18°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '15°C', condition: 'Cool', risk: 'Low' },
      May: { temp: '12°C', condition: 'Cool', risk: 'Low' }, Jun: { temp: '10°C', condition: 'Cold', risk: 'Low' },
      Jul: { temp: '9°C', condition: 'Cold', risk: 'Ski season' }, Aug: { temp: '10°C', condition: 'Cold', risk: 'Ski season' },
      Sep: { temp: '12°C', condition: 'Cool', risk: 'Low' }, Oct: { temp: '14°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '16°C', condition: 'Warm', risk: 'Low' }, Dec: { temp: '19°C', condition: 'Warm', risk: 'UV high' },
    }},
    tips: { currency: 'New Zealand Dollar (NZD)', emergency: '111', cultural: 'Maori culture respected. Tipping not expected. Outdoor adventure culture.', transport: 'Rental cars essential for touring. InterCity buses. Domestic flights between islands.' },
  },

  'Nigeria': {
    visa: { type: 'Visa Required', details: 'Visa required for most nationalities. Apply at Nigerian embassy/consulate.' },
    health: [
      { alert: 'Malaria risk — prophylaxis essential', severity: 'high' },
      { alert: 'Yellow fever vaccination certificate required', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '27°C', condition: 'Hot/Dry (Harmattan)', risk: 'Dust haze' }, Feb: { temp: '29°C', condition: 'Hot/Dry', risk: 'Heat' },
      Mar: { temp: '30°C', condition: 'Hot', risk: 'Heat' }, Apr: { temp: '29°C', condition: 'Rainy starts', risk: 'Low' },
      May: { temp: '27°C', condition: 'Rainy', risk: 'Flooding' }, Jun: { temp: '26°C', condition: 'Rainy', risk: 'Flooding' },
      Jul: { temp: '25°C', condition: 'Rainy', risk: 'Heavy rain' }, Aug: { temp: '25°C', condition: 'Rainy', risk: 'Heavy rain' },
      Sep: { temp: '26°C', condition: 'Rainy', risk: 'Flooding' }, Oct: { temp: '27°C', condition: 'Rainy ending', risk: 'Low' },
      Nov: { temp: '28°C', condition: 'Dry', risk: 'Low' }, Dec: { temp: '27°C', condition: 'Dry (Harmattan)', risk: 'Dust haze' },
    }},
    tips: { currency: 'Nigerian Naira (NGN)', emergency: '112 or 199', cultural: 'Diverse nation with 250+ ethnic groups. Northern regions more conservative.', transport: 'Domestic flights recommended. Avoid road travel at night. Ride-share in Lagos.' },
  },

  'North Korea': {
    visa: { type: 'Guided Tour Only', details: 'Independent travel impossible. Must book through approved tour operator. US citizens BANNED from entry.' },
    health: [
      { alert: 'No reliable medical facilities — evacuation to China if needed', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '-8°C', condition: 'Extreme Cold', risk: 'Extreme cold' }, Feb: { temp: '-4°C', condition: 'Cold', risk: 'Extreme cold' },
      Mar: { temp: '4°C', condition: 'Cool', risk: 'Low' }, Apr: { temp: '12°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '18°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '22°C', condition: 'Warm/Humid', risk: 'Low' },
      Jul: { temp: '25°C', condition: 'Hot/Monsoon', risk: 'Flooding' }, Aug: { temp: '25°C', condition: 'Hot/Monsoon', risk: 'Typhoons' },
      Sep: { temp: '20°C', condition: 'Warm', risk: 'Typhoons' }, Oct: { temp: '13°C', condition: 'Cool', risk: 'Low' },
      Nov: { temp: '4°C', condition: 'Cold', risk: 'Low' }, Dec: { temp: '-5°C', condition: 'Extreme Cold', risk: 'Extreme cold' },
    }},
    tips: { currency: 'N. Korean Won (KPW) — tourists use EUR/CNY', emergency: 'No reliable emergency services for foreigners', cultural: 'Strictly controlled itinerary. No independent movement. Photos restricted.', transport: 'Government-assigned vehicle and guide at all times.' },
  },

  'Pakistan': {
    visa: { type: 'e-Visa', details: 'e-Visa available for tourism. Currently under ACTIVE WAR CONDITIONS — travel strongly discouraged.' },
    health: [
      { alert: 'Active war with Afghanistan — border regions extremely dangerous', severity: 'high' },
      { alert: 'Polio endemic — vaccination required', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '10°C', condition: 'Cool/Dry', risk: 'Low' }, Feb: { temp: '13°C', condition: 'Cool', risk: 'Low' },
      Mar: { temp: '18°C', condition: 'Warm', risk: 'Low' }, Apr: { temp: '25°C', condition: 'Hot', risk: 'Heat' },
      May: { temp: '31°C', condition: 'Very Hot', risk: 'Extreme heat' }, Jun: { temp: '35°C', condition: 'Extreme Heat', risk: 'Extreme heat / Monsoon' },
      Jul: { temp: '33°C', condition: 'Monsoon', risk: 'Catastrophic flooding' }, Aug: { temp: '32°C', condition: 'Monsoon', risk: 'Catastrophic flooding' },
      Sep: { temp: '30°C', condition: 'Monsoon ending', risk: 'Flooding' }, Oct: { temp: '25°C', condition: 'Warm', risk: 'Low' },
      Nov: { temp: '18°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '12°C', condition: 'Cool/Dry', risk: 'Low' },
    }},
    tips: { currency: 'Pakistani Rupee (PKR)', emergency: '15 (police), 115 (fire), 1122 (rescue)', cultural: 'Islamic republic. Conservative dress. Hospitality is cultural cornerstone.', transport: 'Domestic flights. Karakoram Highway (when safe). Ride-share in major cities.' },
  },

  'Palestine': {
    visa: { type: 'Israeli Control', details: 'Access through Israeli-controlled borders. Gaza access extremely restricted. West Bank accessible via Israeli checkpoints.' },
    health: [
      { alert: 'Gaza: Humanitarian catastrophe — no functional health system', severity: 'high' },
      { alert: 'West Bank: Settler violence risk', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '10°C', condition: 'Cool/Rainy', risk: 'Low' }, Feb: { temp: '11°C', condition: 'Cool/Rainy', risk: 'Low' },
      Mar: { temp: '14°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '18°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '22°C', condition: 'Hot/Dry', risk: 'Low' }, Jun: { temp: '25°C', condition: 'Hot', risk: 'Heat' },
      Jul: { temp: '27°C', condition: 'Hot', risk: 'Heat' }, Aug: { temp: '27°C', condition: 'Hot', risk: 'Heat' },
      Sep: { temp: '25°C', condition: 'Warm', risk: 'Low' }, Oct: { temp: '21°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '16°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '11°C', condition: 'Cool/Rainy', risk: 'Low' },
    }},
    tips: { currency: 'Israeli New Shekel (ILS) / Jordanian Dinar (JOD)', emergency: 'Palestinian emergency: varies by area', cultural: 'Rich cultural heritage. Hospitality deeply valued. Checkpoint delays common.', transport: 'Shared taxis (service). No unified public transport. Movement restricted by checkpoints.' },
  },

  'Peru': {
    visa: { type: 'Visa-Free', details: 'US/EU citizens: 183-day visa-free stay.' },
    health: [
      { alert: 'Altitude sickness at high elevations (Cusco: 3,400m)', severity: 'medium' },
      { alert: 'Yellow fever vaccination for Amazon regions', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '13°C', condition: 'Rainy (highlands)', risk: 'Inca Trail closed (Feb)' }, Feb: { temp: '13°C', condition: 'Rainy', risk: 'Inca Trail closed' },
      Mar: { temp: '13°C', condition: 'Rainy ending', risk: 'Landslides' }, Apr: { temp: '12°C', condition: 'Dry starts', risk: 'Low' },
      May: { temp: '11°C', condition: 'Dry/Cool', risk: 'Low' }, Jun: { temp: '10°C', condition: 'Dry/Cold nights', risk: 'Cold at altitude' },
      Jul: { temp: '10°C', condition: 'Dry/Cold', risk: 'Peak season' }, Aug: { temp: '10°C', condition: 'Dry', risk: 'Peak season' },
      Sep: { temp: '12°C', condition: 'Warming', risk: 'Low' }, Oct: { temp: '13°C', condition: 'Transition', risk: 'Low' },
      Nov: { temp: '13°C', condition: 'Rainy starts', risk: 'Low' }, Dec: { temp: '13°C', condition: 'Rainy', risk: 'Flooding' },
    }},
    tips: { currency: 'Peruvian Sol (PEN)', emergency: '105 (police), 116 (fire)', cultural: 'Coca tea helps with altitude sickness. Tipping 10%. Rich Inca heritage.', transport: 'Domestic flights (Lima-Cusco). PeruRail to Machu Picchu. Long-distance buses.' },
  },

  'Philippines': {
    visa: { type: 'Visa-Free', details: 'Most nationalities: 30-day visa-free stay, extendable up to 3 years.' },
    health: [
      { alert: 'Dengue fever risk — use mosquito repellent', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '26°C', condition: 'Cool/Dry', risk: 'Low' }, Feb: { temp: '27°C', condition: 'Dry', risk: 'Low' },
      Mar: { temp: '28°C', condition: 'Hot/Dry', risk: 'Low' }, Apr: { temp: '30°C', condition: 'Very Hot', risk: 'Heat' },
      May: { temp: '30°C', condition: 'Hot', risk: 'Heat' }, Jun: { temp: '28°C', condition: 'Rainy', risk: 'Typhoon season' },
      Jul: { temp: '28°C', condition: 'Rainy', risk: 'Typhoon season' }, Aug: { temp: '28°C', condition: 'Rainy', risk: 'Typhoon season' },
      Sep: { temp: '27°C', condition: 'Rainy', risk: 'Peak typhoon' }, Oct: { temp: '27°C', condition: 'Rainy', risk: 'Typhoon season' },
      Nov: { temp: '27°C', condition: 'Rainy', risk: 'Typhoons' }, Dec: { temp: '26°C', condition: 'Cool/Dry', risk: 'Low' },
    }},
    tips: { currency: 'Philippine Peso (PHP)', emergency: '911', cultural: 'English widely spoken. Family-oriented culture. Karaoke is national pastime.', transport: 'Domestic flights (Cebu Pacific, PAL). Jeepneys in cities. Island ferries.' },
  },

  'Russia': {
    visa: { type: 'Visa Required', details: 'Tourist visa required. Processing significantly impacted by sanctions and diplomatic tensions.' },
    health: [
      { alert: 'Active war participant — risk of military escalation', severity: 'high' },
      { alert: 'Tick-borne encephalitis in Siberia/rural areas', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '-10°C', condition: 'Extreme Cold', risk: 'Extreme cold' }, Feb: { temp: '-8°C', condition: 'Cold', risk: 'Extreme cold' },
      Mar: { temp: '-2°C', condition: 'Cold', risk: 'Low' }, Apr: { temp: '6°C', condition: 'Cool', risk: 'Low' },
      May: { temp: '14°C', condition: 'Mild', risk: 'Low' }, Jun: { temp: '18°C', condition: 'Warm', risk: 'White Nights (SPB)' },
      Jul: { temp: '20°C', condition: 'Warm', risk: 'Low' }, Aug: { temp: '18°C', condition: 'Warm', risk: 'Low' },
      Sep: { temp: '12°C', condition: 'Cool', risk: 'Low' }, Oct: { temp: '5°C', condition: 'Cold', risk: 'Low' },
      Nov: { temp: '-2°C', condition: 'Cold', risk: 'Early snow' }, Dec: { temp: '-7°C', condition: 'Cold/Snow', risk: 'Extreme cold' },
    }},
    tips: { currency: 'Russian Ruble (RUB)', emergency: '112', cultural: 'Visa registration within 7 days. Western credit cards do not work due to sanctions.', transport: 'Trans-Siberian Railway. Moscow/SPB metros world-class. Domestic flights.' },
  },

  'Saudi Arabia': {
    visa: { type: 'e-Visa', details: 'Tourist e-Visa available ($120) for 49 nationalities. 1-year multiple entry, 90 days per visit.' },
    health: [
      { alert: 'MERS coronavirus risk — avoid contact with camels', severity: 'low' },
      { alert: 'Extreme heat May-Sep', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '15°C', condition: 'Cool', risk: 'Low' }, Feb: { temp: '17°C', condition: 'Mild', risk: 'Low' },
      Mar: { temp: '21°C', condition: 'Warm', risk: 'Sandstorms' }, Apr: { temp: '27°C', condition: 'Hot', risk: 'Heat' },
      May: { temp: '33°C', condition: 'Very Hot', risk: 'Extreme heat' }, Jun: { temp: '37°C', condition: 'Extreme', risk: 'Extreme heat' },
      Jul: { temp: '39°C', condition: 'Extreme', risk: 'Extreme heat' }, Aug: { temp: '39°C', condition: 'Extreme', risk: 'Extreme heat' },
      Sep: { temp: '35°C', condition: 'Very Hot', risk: 'Extreme heat' }, Oct: { temp: '29°C', condition: 'Hot', risk: 'Low' },
      Nov: { temp: '22°C', condition: 'Mild', risk: 'Low' }, Dec: { temp: '16°C', condition: 'Cool', risk: 'Low' },
    }},
    tips: { currency: 'Saudi Riyal (SAR)', emergency: '999 (police), 997 (ambulance)', cultural: 'Islamic law. No alcohol. Modest dress required. Gender-mixed areas expanding rapidly.', transport: 'Domestic flights. Haramain HSR (Jeddah-Medina-Mecca). Uber/Careem available.' },
  },

  'Singapore': {
    visa: { type: 'Visa-Free', details: 'Most nationalities: 30-90 day visa-free stay. SG Arrival Card required online.' },
    health: [
      { alert: 'Dengue fever risk — use repellent', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '27°C', condition: 'Rainy', risk: 'Low' }, Feb: { temp: '27°C', condition: 'Dry', risk: 'Low' },
      Mar: { temp: '28°C', condition: 'Warm', risk: 'Low' }, Apr: { temp: '28°C', condition: 'Warm/Humid', risk: 'Low' },
      May: { temp: '28°C', condition: 'Hot/Humid', risk: 'Low' }, Jun: { temp: '28°C', condition: 'Hot', risk: 'Haze (from Indonesia)' },
      Jul: { temp: '28°C', condition: 'Hot', risk: 'Low' }, Aug: { temp: '28°C', condition: 'Hot', risk: 'Low' },
      Sep: { temp: '28°C', condition: 'Hot', risk: 'Haze risk' }, Oct: { temp: '28°C', condition: 'Rainy starts', risk: 'Haze risk' },
      Nov: { temp: '27°C', condition: 'Rainy', risk: 'Low' }, Dec: { temp: '27°C', condition: 'Rainy', risk: 'Low' },
    }},
    tips: { currency: 'Singapore Dollar (SGD)', emergency: '999 (police), 995 (ambulance)', cultural: 'Strict laws — no chewing gum, heavy littering fines. Multicultural (Chinese/Malay/Indian/English).', transport: 'MRT metro is excellent. Grab ride-share. Taxis metered.' },
  },

  'South Africa': {
    visa: { type: 'Visa-Free', details: 'US/EU citizens: 90-day visa-free stay.' },
    health: [
      { alert: 'Malaria risk in Kruger/Limpopo region', severity: 'medium' },
      { alert: 'HIV prevalence high — standard precautions', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '21°C', condition: 'Hot/Rainy', risk: 'Low' }, Feb: { temp: '21°C', condition: 'Hot/Rainy', risk: 'Low' },
      Mar: { temp: '20°C', condition: 'Warm', risk: 'Low' }, Apr: { temp: '17°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '14°C', condition: 'Cool', risk: 'Low' }, Jun: { temp: '11°C', condition: 'Cool/Dry', risk: 'Best safari season' },
      Jul: { temp: '11°C', condition: 'Cool/Dry', risk: 'Best safari season' }, Aug: { temp: '13°C', condition: 'Cool/Dry', risk: 'Best safari season' },
      Sep: { temp: '16°C', condition: 'Warming', risk: 'Low' }, Oct: { temp: '18°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '19°C', condition: 'Warm', risk: 'Low' }, Dec: { temp: '21°C', condition: 'Hot', risk: 'Low' },
    }},
    tips: { currency: 'South African Rand (ZAR)', emergency: '10111 (police), 10177 (ambulance)', cultural: 'Rainbow Nation. 11 official languages. Crime higher in cities — be aware.', transport: 'Rental cars essential. Uber in cities. Gautrain (Johannesburg). Blue Train luxury rail.' },
  },

  'South Korea': {
    visa: { type: 'K-ETA', details: 'Korea Electronic Travel Authorization required ($10). Apply online before travel. Currently waived for some nationalities.' },
    health: [
      { alert: 'No major health risks', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '-2°C', condition: 'Cold/Dry', risk: 'Cold' }, Feb: { temp: '0°C', condition: 'Cold', risk: 'Low' },
      Mar: { temp: '6°C', condition: 'Cool', risk: 'Yellow dust from China' }, Apr: { temp: '13°C', condition: 'Mild', risk: 'Cherry blossom season' },
      May: { temp: '18°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '23°C', condition: 'Warm/Humid', risk: 'Monsoon begins' },
      Jul: { temp: '26°C', condition: 'Hot/Monsoon', risk: 'Heavy rain' }, Aug: { temp: '27°C', condition: 'Hot/Humid', risk: 'Typhoon risk' },
      Sep: { temp: '22°C', condition: 'Warm', risk: 'Typhoons' }, Oct: { temp: '15°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '7°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '0°C', condition: 'Cold', risk: 'Cold' },
    }},
    tips: { currency: 'South Korean Won (KRW)', emergency: '112 (police), 119 (fire/ambulance)', cultural: 'Bow when greeting. Remove shoes indoors. Soju culture. K-pop everywhere.', transport: 'KTX high-speed rail. Seoul metro is excellent. T-money card for transit.' },
  },

  'Spain': {
    visa: { type: 'Visa-Free (Schengen)', details: 'US/UK citizens: 90-day visa-free stay within 180-day period.' },
    health: [
      { alert: 'No major health risks', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '10°C', condition: 'Cool', risk: 'Low' }, Feb: { temp: '11°C', condition: 'Cool', risk: 'Low' },
      Mar: { temp: '14°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '16°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '20°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '26°C', condition: 'Hot', risk: 'Low' },
      Jul: { temp: '30°C', condition: 'Hot', risk: 'Extreme heat inland' }, Aug: { temp: '30°C', condition: 'Hot', risk: 'Extreme heat / Wildfires' },
      Sep: { temp: '25°C', condition: 'Warm', risk: 'Low' }, Oct: { temp: '19°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '14°C', condition: 'Cool', risk: 'Heavy rain (Valencia)' }, Dec: { temp: '10°C', condition: 'Cool', risk: 'Low' },
    }},
    tips: { currency: 'Euro (EUR)', emergency: '112', cultural: 'Siesta 2-5pm — some shops close. Dinner after 9pm. Tipping not expected but appreciated.', transport: 'AVE high-speed rail. Metro in Madrid/Barcelona. Rental cars for rural Spain.' },
  },

  'Sudan': {
    visa: { type: 'Visa Required', details: 'Visa required. Country in active civil war — DO NOT TRAVEL.' },
    health: [
      { alert: 'Active civil war — mass casualties ongoing', severity: 'high' },
      { alert: 'Famine conditions — no food security', severity: 'high' },
      { alert: 'No functioning health system in war zones', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '23°C', condition: 'Dry', risk: 'Low' }, Feb: { temp: '25°C', condition: 'Hot/Dry', risk: 'Low' },
      Mar: { temp: '28°C', condition: 'Hot', risk: 'Sandstorms' }, Apr: { temp: '32°C', condition: 'Very Hot', risk: 'Extreme heat' },
      May: { temp: '35°C', condition: 'Extreme', risk: 'Extreme heat' }, Jun: { temp: '35°C', condition: 'Hot/Rainy', risk: 'Flooding' },
      Jul: { temp: '33°C', condition: 'Rainy', risk: 'Heavy flooding' }, Aug: { temp: '32°C', condition: 'Rainy', risk: 'Heavy flooding' },
      Sep: { temp: '33°C', condition: 'Rainy ending', risk: 'Flooding' }, Oct: { temp: '32°C', condition: 'Hot', risk: 'Low' },
      Nov: { temp: '27°C', condition: 'Warm', risk: 'Low' }, Dec: { temp: '24°C', condition: 'Mild', risk: 'Low' },
    }},
    tips: { currency: 'Sudanese Pound (SDG)', emergency: 'No reliable emergency services', cultural: 'DO NOT TRAVEL. Country in active civil war since April 2023.', transport: 'ALL TRAVEL SUSPENDED. No safe transport options.' },
  },

  'Syria': {
    visa: { type: 'Visa Required', details: 'Visa extremely difficult to obtain. Country devastated by civil war — DO NOT TRAVEL.' },
    health: [
      { alert: 'Healthcare infrastructure destroyed by war', severity: 'high' },
      { alert: 'Cholera outbreaks in displacement camps', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '7°C', condition: 'Cool/Rainy', risk: 'Low' }, Feb: { temp: '9°C', condition: 'Cool', risk: 'Low' },
      Mar: { temp: '13°C', condition: 'Mild', risk: 'Low' }, Apr: { temp: '18°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '23°C', condition: 'Hot', risk: 'Low' }, Jun: { temp: '28°C', condition: 'Very Hot', risk: 'Heat' },
      Jul: { temp: '31°C', condition: 'Very Hot', risk: 'Extreme heat' }, Aug: { temp: '31°C', condition: 'Very Hot', risk: 'Extreme heat' },
      Sep: { temp: '27°C', condition: 'Hot', risk: 'Low' }, Oct: { temp: '21°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '14°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '9°C', condition: 'Cool/Rainy', risk: 'Low' },
    }},
    tips: { currency: 'Syrian Pound (SYP)', emergency: 'No reliable services', cultural: 'Post-Assad transition ongoing. Security situation fluid. DO NOT TRAVEL.', transport: 'No safe transport. Roads damaged/mined.' },
  },

  'Thailand': {
    visa: { type: 'Visa-Free / Visa on Arrival', details: 'Most nationalities: 30-60 day visa-free stay. Visa on arrival for some nationalities ($35).' },
    health: [
      { alert: 'Dengue fever risk — use mosquito repellent', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '27°C', condition: 'Cool/Dry', risk: 'Low' }, Feb: { temp: '29°C', condition: 'Hot/Dry', risk: 'Low' },
      Mar: { temp: '30°C', condition: 'Hot', risk: 'Air quality (burning season - north)' }, Apr: { temp: '31°C', condition: 'Very Hot', risk: 'Extreme heat / Songkran' },
      May: { temp: '30°C', condition: 'Hot/Rainy', risk: 'Monsoon starts' }, Jun: { temp: '29°C', condition: 'Rainy', risk: 'Low' },
      Jul: { temp: '29°C', condition: 'Rainy', risk: 'Low' }, Aug: { temp: '29°C', condition: 'Rainy', risk: 'Low' },
      Sep: { temp: '28°C', condition: 'Rainy', risk: 'Flooding' }, Oct: { temp: '28°C', condition: 'Rainy', risk: 'Flooding' },
      Nov: { temp: '28°C', condition: 'Cooling', risk: 'Low' }, Dec: { temp: '27°C', condition: 'Cool/Dry', risk: 'Low' },
    }},
    tips: { currency: 'Thai Baht (THB)', emergency: '191 (police), 1669 (ambulance)', cultural: 'Never touch anyone\'s head. Remove shoes at temples. Royal family is revered — lese majeste laws.', transport: 'BTS/MRT in Bangkok. Grab ride-share. Songthaews and tuk-tuks. Domestic flights.' },
  },

  'Turkey': {
    visa: { type: 'e-Visa', details: 'e-Visa required for US/UK citizens ($50). Apply online. 90-day stay within 180-day period.' },
    health: [
      { alert: 'No major health risks', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '6°C', condition: 'Cold/Rainy', risk: 'Low' }, Feb: { temp: '7°C', condition: 'Cold', risk: 'Low' },
      Mar: { temp: '10°C', condition: 'Cool', risk: 'Low' }, Apr: { temp: '15°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '20°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '25°C', condition: 'Hot', risk: 'Low' },
      Jul: { temp: '28°C', condition: 'Hot', risk: 'Heat' }, Aug: { temp: '28°C', condition: 'Hot', risk: 'Heat' },
      Sep: { temp: '24°C', condition: 'Warm', risk: 'Low' }, Oct: { temp: '18°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '13°C', condition: 'Cool', risk: 'Low' }, Dec: { temp: '8°C', condition: 'Cold/Rainy', risk: 'Low' },
    }},
    tips: { currency: 'Turkish Lira (TRY)', emergency: '112', cultural: 'Remove shoes when entering homes. Tea offered everywhere — accepting is polite. Bargaining in bazaars.', transport: 'Excellent domestic flights (Turkish Airlines). Istanbul metro. Intercity buses.' },
  },

  'Ukraine': {
    visa: { type: 'Visa-Free (normally)', details: 'US/EU citizens: visa-free. Country under active Russian invasion — DO NOT TRAVEL to eastern/southern regions.' },
    health: [
      { alert: 'Active war zone in east/south — unexploded ordnance', severity: 'high' },
      { alert: 'Medical facilities strained in conflict areas', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '-4°C', condition: 'Cold/Snow', risk: 'Cold + conflict' }, Feb: { temp: '-3°C', condition: 'Cold', risk: 'Cold + conflict' },
      Mar: { temp: '3°C', condition: 'Cool', risk: 'Low' }, Apr: { temp: '11°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '17°C', condition: 'Warm', risk: 'Low' }, Jun: { temp: '21°C', condition: 'Warm', risk: 'Low' },
      Jul: { temp: '23°C', condition: 'Warm', risk: 'Low' }, Aug: { temp: '22°C', condition: 'Warm', risk: 'Low' },
      Sep: { temp: '17°C', condition: 'Cool', risk: 'Low' }, Oct: { temp: '10°C', condition: 'Cool', risk: 'Low' },
      Nov: { temp: '3°C', condition: 'Cold', risk: 'Low' }, Dec: { temp: '-2°C', condition: 'Cold/Snow', risk: 'Cold' },
    }},
    tips: { currency: 'Ukrainian Hryvnia (UAH)', emergency: '112', cultural: 'Western Ukraine (Lviv) relatively safe. Eastern front is active combat zone.', transport: 'Trains still running in safe areas. Lviv and Kyiv accessible. No flights (airspace closed).' },
  },

  'United Arab Emirates': {
    visa: { type: 'Visa-Free / Visa on Arrival', details: 'US/EU citizens: 30-90 day visa-free stay.' },
    health: [
      { alert: 'Extreme heat in summer months', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '19°C', condition: 'Mild', risk: 'Low' }, Feb: { temp: '20°C', condition: 'Mild', risk: 'Low' },
      Mar: { temp: '23°C', condition: 'Warm', risk: 'Sandstorms' }, Apr: { temp: '28°C', condition: 'Hot', risk: 'Low' },
      May: { temp: '33°C', condition: 'Very Hot', risk: 'Heat' }, Jun: { temp: '36°C', condition: 'Extreme', risk: 'Extreme heat' },
      Jul: { temp: '38°C', condition: 'Extreme', risk: 'Extreme heat' }, Aug: { temp: '38°C', condition: 'Extreme', risk: 'Extreme heat/Humid' },
      Sep: { temp: '35°C', condition: 'Very Hot', risk: 'Heat' }, Oct: { temp: '30°C', condition: 'Hot', risk: 'Low' },
      Nov: { temp: '25°C', condition: 'Warm', risk: 'Low' }, Dec: { temp: '20°C', condition: 'Mild', risk: 'Low' },
    }},
    tips: { currency: 'UAE Dirham (AED)', emergency: '999 (police), 998 (ambulance)', cultural: 'Modest dress in public (not beachwear in malls). No public intoxication. Ramadan observance.', transport: 'Dubai Metro. Uber/Careem. Rental cars. Abu Dhabi buses.' },
  },

  'United Kingdom': {
    visa: { type: 'Visa-Free (ETA)', details: 'US/EU citizens: 6-month visa-free stay. Electronic Travel Authorization (ETA) being phased in.' },
    health: [
      { alert: 'No major health risks — NHS available for emergencies', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '5°C', condition: 'Cold/Rainy', risk: 'Low' }, Feb: { temp: '5°C', condition: 'Cold', risk: 'Low' },
      Mar: { temp: '7°C', condition: 'Cool', risk: 'Low' }, Apr: { temp: '10°C', condition: 'Mild', risk: 'Low' },
      May: { temp: '13°C', condition: 'Mild', risk: 'Low' }, Jun: { temp: '16°C', condition: 'Warm', risk: 'Low' },
      Jul: { temp: '18°C', condition: 'Warm', risk: 'Heatwave possible' }, Aug: { temp: '18°C', condition: 'Warm', risk: 'Low' },
      Sep: { temp: '15°C', condition: 'Mild', risk: 'Low' }, Oct: { temp: '11°C', condition: 'Cool', risk: 'Low' },
      Nov: { temp: '8°C', condition: 'Cool/Rainy', risk: 'Low' }, Dec: { temp: '5°C', condition: 'Cold', risk: 'Low' },
    }},
    tips: { currency: 'British Pound (GBP)', emergency: '999 or 112', cultural: 'Drive on the left. Queue etiquette important. Tipping 10-15% at restaurants.', transport: 'London Underground. National Rail. Rental cars (manual transmission common).' },
  },

  'United States': {
    visa: { type: 'ESTA / Visa', details: 'ESTA for Visa Waiver Program countries ($21). Others need B-1/B-2 tourist visa.' },
    health: [
      { alert: 'Healthcare is expensive — travel insurance essential', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '1°C', condition: 'Cold (varies by region)', risk: 'Blizzards (northeast)' }, Feb: { temp: '3°C', condition: 'Cold', risk: 'Low' },
      Mar: { temp: '8°C', condition: 'Cool', risk: 'Tornado season starts (midwest)' }, Apr: { temp: '14°C', condition: 'Mild', risk: 'Tornado season' },
      May: { temp: '19°C', condition: 'Warm', risk: 'Tornado season' }, Jun: { temp: '24°C', condition: 'Hot', risk: 'Hurricane season begins' },
      Jul: { temp: '27°C', condition: 'Hot', risk: 'Extreme heat (southwest)' }, Aug: { temp: '26°C', condition: 'Hot', risk: 'Peak hurricane' },
      Sep: { temp: '22°C', condition: 'Warm', risk: 'Hurricane season' }, Oct: { temp: '15°C', condition: 'Mild', risk: 'Low' },
      Nov: { temp: '8°C', condition: 'Cool', risk: 'Wildfire (CA)' }, Dec: { temp: '3°C', condition: 'Cold', risk: 'Blizzards' },
    }},
    tips: { currency: 'US Dollar (USD)', emergency: '911', cultural: 'Tipping 18-20% expected. Vast distances between cities. Gun culture in some states.', transport: 'Rental cars essential outside major cities. Amtrak trains. Domestic flights.' },
  },

  'Venezuela': {
    visa: { type: 'Visa Required', details: 'Tourist visa or tourist card. Political situation volatile — travel strongly discouraged.' },
    health: [
      { alert: 'Healthcare system collapsed — bring all medications', severity: 'high' },
      { alert: 'Malaria and Dengue risk', severity: 'medium' },
    ],
    weather: { seasons: {
      Jan: { temp: '21°C', condition: 'Dry/Warm', risk: 'Low' }, Feb: { temp: '21°C', condition: 'Dry', risk: 'Low' },
      Mar: { temp: '22°C', condition: 'Dry', risk: 'Low' }, Apr: { temp: '23°C', condition: 'Rainy starts', risk: 'Low' },
      May: { temp: '23°C', condition: 'Rainy', risk: 'Low' }, Jun: { temp: '22°C', condition: 'Rainy', risk: 'Flooding' },
      Jul: { temp: '22°C', condition: 'Rainy', risk: 'Flooding' }, Aug: { temp: '22°C', condition: 'Rainy', risk: 'Low' },
      Sep: { temp: '23°C', condition: 'Rainy', risk: 'Low' }, Oct: { temp: '22°C', condition: 'Rainy', risk: 'Low' },
      Nov: { temp: '22°C', condition: 'Transition', risk: 'Low' }, Dec: { temp: '21°C', condition: 'Dry', risk: 'Low' },
    }},
    tips: { currency: 'Bolivar (VES) — USD widely used', emergency: '171 (police), 171 (ambulance)', cultural: 'Political protests can erupt suddenly. Carry USD. Crime very high.', transport: 'Domestic flights. Avoid road travel at night. No reliable public transit.' },
  },

  'Vietnam': {
    visa: { type: 'e-Visa', details: 'e-Visa available ($25) for 90 days. Visa exemption for some nationalities (15-45 days).' },
    health: [
      { alert: 'Dengue fever risk in rainy season', severity: 'low' },
    ],
    weather: { seasons: {
      Jan: { temp: '17°C', condition: 'Cool/Dry (north)', risk: 'Low' }, Feb: { temp: '18°C', condition: 'Cool/Drizzly', risk: 'Low' },
      Mar: { temp: '21°C', condition: 'Warming', risk: 'Low' }, Apr: { temp: '25°C', condition: 'Warm', risk: 'Low' },
      May: { temp: '29°C', condition: 'Hot', risk: 'Low' }, Jun: { temp: '30°C', condition: 'Hot/Rainy', risk: 'Typhoon season' },
      Jul: { temp: '30°C', condition: 'Hot/Rainy', risk: 'Typhoons (central)' }, Aug: { temp: '29°C', condition: 'Rainy', risk: 'Flooding' },
      Sep: { temp: '28°C', condition: 'Rainy', risk: 'Typhoons' }, Oct: { temp: '25°C', condition: 'Rainy', risk: 'Flooding (central)' },
      Nov: { temp: '22°C', condition: 'Cool', risk: 'Typhoons (central)' }, Dec: { temp: '18°C', condition: 'Cool/Dry', risk: 'Low' },
    }},
    tips: { currency: 'Vietnamese Dong (VND)', emergency: '113 (police), 115 (ambulance)', cultural: 'Crossing streets — walk slowly and steadily, traffic flows around you. Bargain in markets.', transport: 'Motorbike taxis (Grab). Sleeper buses for long distances. Reunification Express train.' },
  },

  'Yemen': {
    visa: { type: 'Visa Required', details: 'Visa required. Country in active civil war — DO NOT TRAVEL.' },
    health: [
      { alert: 'Active civil war and famine conditions', severity: 'high' },
      { alert: 'Cholera epidemic — no safe water', severity: 'high' },
      { alert: 'No functioning health system', severity: 'high' },
    ],
    weather: { seasons: {
      Jan: { temp: '18°C', condition: 'Mild', risk: 'Low' }, Feb: { temp: '19°C', condition: 'Mild', risk: 'Low' },
      Mar: { temp: '22°C', condition: 'Warm', risk: 'Low' }, Apr: { temp: '24°C', condition: 'Hot', risk: 'Low' },
      May: { temp: '27°C', condition: 'Hot', risk: 'Heat' }, Jun: { temp: '30°C', condition: 'Very Hot', risk: 'Extreme heat' },
      Jul: { temp: '30°C', condition: 'Very Hot', risk: 'Extreme heat' }, Aug: { temp: '29°C', condition: 'Hot', risk: 'Heat' },
      Sep: { temp: '28°C', condition: 'Hot', risk: 'Low' }, Oct: { temp: '23°C', condition: 'Warm', risk: 'Low' },
      Nov: { temp: '20°C', condition: 'Mild', risk: 'Low' }, Dec: { temp: '18°C', condition: 'Mild', risk: 'Low' },
    }},
    tips: { currency: 'Yemeni Rial (YER)', emergency: 'No reliable emergency services', cultural: 'DO NOT TRAVEL. Country in active civil war and famine.', transport: 'ALL TRAVEL SUSPENDED.' },
  },
};
