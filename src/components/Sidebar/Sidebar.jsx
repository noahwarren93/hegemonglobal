// Sidebar.jsx - Main sidebar with 7 tabs

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { COUNTRIES, RECENT_ELECTIONS, ELECTIONS, FORECASTS, HORIZON_EVENTS, DAILY_BRIEFING, DAILY_EVENTS, lastNewsUpdate, COUNTRY_DEMONYMS } from '../../data/countries';
import { REVERSE_CITY_INDEX, TRAVEL_INFO, getTravelSafety, REGIONAL_THREATS, CITY_RISKS, LEVEL_META, POPULAR_DESTINATIONS } from '../../data/travelData';
import { RISK_COLORS, timeAgo } from '../../utils/riskColors';
import { renderNewsletter } from '../../services/newsService';
import { onEventsUpdated, AI_TIMELINE_DATA, AI_DEATH_TOLL_FLOORS } from '../../services/apiService';
import { adjustFontSize, resetFontSize } from '../Globe/GlobeView';
import StocksTab from '../Stocks/StocksTab';
import EventModal from '../Modals/EventModal';
import ElectionModal from '../Modals/ElectionModal';
import CountryFlag from '../CountryFlag';


// ============================================================
// WAR BANNER DATA — module scope (never recreated on re-render)
// ============================================================

// Dynamic conflict day counter — start date = Day 1
const CONFLICT_STARTS = {
  iran: new Date('2026-02-28T00:00:00Z'),     // Operation Epic Fury launched
  pakafg: new Date('2026-02-27T00:00:00Z'),   // Pakistan declares open war
  ukraine: new Date('2022-02-24T00:00:00Z'),  // Russia invades Ukraine
  sudan: new Date('2023-04-15T00:00:00Z'),    // SAF vs RSF fighting erupts
};
const conflictDay = (key) => Math.floor((Date.now() - CONFLICT_STARTS[key].getTime()) / 86400000) + 1;
// Derive "X ago" label from the SAME day count so they never disagree
const conflictTimeAgo = (key) => {
  const d = conflictDay(key) - 1; // elapsed days since Day 1
  if (d === 0) return 'Today';
  if (d === 1) return '1 day ago';
  if (d < 30) return d + ' days ago';
  if (d < 365) { const m = Math.floor(d / 30); return m === 1 ? '1 month ago' : m + ' months ago'; }
  const y = Math.floor(d / 365);
  return y === 1 ? '1 year ago' : y + ' years ago';
};

// Pakistan-Afghanistan War Timeline
const PAK_AFG_TIMELINE_BASE = [
  // March 19 — Day 22
  { time: '2026-03-19T12:00:00Z', text: 'Pakistan and Afghanistan agree to 5-day Eid al-Fitr ceasefire pause — brokered by Saudi Arabia, Qatar and Turkey' },
  // March 16 — Day 19
  { time: '2026-03-16T10:00:00Z', text: 'Pakistani airstrike allegedly hits Kabul\'s Omar Addiction Treatment Hospital — UN says 143 killed, Taliban claims 400. Pakistan denies targeting hospital.' },
  // March 14 — Day 17
  { time: '2026-03-14T16:00:00Z', text: 'Pakistan strikes Afghan military facilities in Kandahar after Taliban drone attacks on Quetta, Kohat and Rawalpindi' },
  { time: '2026-03-14T14:00:00Z', text: 'Pakistan claims 850+ Taliban killed total — ground forces advance 8 km into Khost province' },
  { time: '2026-03-14T08:00:00Z', text: 'UNHCR reports 180,000 Afghans displaced — 42 border crossing points closed, humanitarian crisis deepening' },
  // March 13 — Day 16
  { time: '2026-03-13T14:00:00Z', text: 'Taliban launches coordinated counterattack — recaptures 3 border posts in Nangarhar, heavy casualties on both sides' },
  { time: '2026-03-13T08:00:00Z', text: 'China calls emergency meeting with Pakistan and Afghan Taliban — offers to mediate in Beijing' },
  // March 12 — Day 15
  { time: '2026-03-12T14:00:00Z', text: 'PAF strikes hit Taliban command center near Kabul — Afghanistan claims 23 civilians killed in residential area' },
  { time: '2026-03-12T08:00:00Z', text: 'WFP resumes limited food distribution in 12 districts — estimates 280,000 people at risk of acute hunger' },
  // March 11 — Day 14
  { time: '2026-03-11T14:00:00Z', text: 'Pakistan deploys additional armored brigade to Balochistan sector — largest ground force deployment since operation began' },
  { time: '2026-03-11T08:00:00Z', text: 'Afghanistan claims 145 civilians killed total — UNICEF reports 31 children among dead' },
  // March 10 — Day 13
  { time: '2026-03-10T14:00:00Z', text: 'UN Security Council holds emergency session — resolution calling for ceasefire vetoed by China' },
  { time: '2026-03-10T08:00:00Z', text: 'Taliban fires rockets at Peshawar airport — civilian flights suspended, 3 aircraft damaged on tarmac' },
  // March 9 — Day 12
  { time: '2026-03-09T14:00:00Z', text: 'Pakistan ground forces enter Tora Bora region — symbolic advance into Taliban stronghold near Jalalabad' },
  { time: '2026-03-09T08:00:00Z', text: 'ICRC demands humanitarian corridors — both sides agree to 4-hour daily pause for civilian evacuation' },
  // March 8 — Day 11
  { time: '2026-03-08T14:00:00Z', text: 'PAF conducts 45 aerial strikes across Paktia and Khost — heaviest day of strikes since March 6' },
  { time: '2026-03-08T08:00:00Z', text: 'Pakistan claims 680+ Taliban killed total — updates destroyed infrastructure count to 312 checkposts' },
  // March 7 — Day 10
  { time: '2026-03-07T18:00:00Z', text: 'Pakistan airstrikes destroy Taliban border positions. Taliban attacks 28 locations along the Durand Line.' },
  { time: '2026-03-07T16:00:00Z', text: 'Coalition of 11 nations urges ceasefire — China, Russia, Saudi Arabia, Turkey, Bangladesh call for immediate de-escalation' },
  { time: '2026-03-07T12:00:00Z', text: 'Pakistan demands "verifiable assurance" from Taliban before any ceasefire — operations will not stop on basis of promises alone' },
  { time: '2026-03-07T08:00:00Z', text: 'UNHCR reports 115,000 Afghans displaced — massive surge from 66,000 three days prior, 3,000 displaced in Pakistan' },
  // March 6 — Day 9
  { time: '2026-03-06T16:00:00Z', text: 'Afghanistan claims 55 Pakistani soldiers killed in single day — Taliban destroys posts in Nangarhar, Kandahar, Kunar, Paktia, Khost' },
  { time: '2026-03-06T12:00:00Z', text: 'Deadliest day of fighting — PAF conducts 62 aerial strikes across Afghanistan, concentrated on Kurram, Zhob, Qila Saifullah' },
  { time: '2026-03-06T08:00:00Z', text: 'Pakistan updates claims: 527 Taliban killed, 755+ injured, 237 checkposts destroyed, 205 vehicles and artillery pieces eliminated' },
  // March 5 — Day 8
  { time: '2026-03-05T14:00:00Z', text: 'UNOCHA publishes first situation report \u2014 10 Afghan provinces affected, WFP suspends food distribution across 46 districts' },
  { time: '2026-03-05T10:00:00Z', text: 'Afghan government claims 110 civilians killed (incl. 65 women and children), 123 wounded since Feb 27' },
  // March 4 — Day 7
  { time: '2026-03-04T16:00:00Z', text: 'UN reports nearly 66,000 Afghans displaced \u2014 16,370 families across Paktia, Kunar, Nangarhar, Khost, Paktika, Nuristan' },
  { time: '2026-03-04T12:00:00Z', text: 'Afghanistan claims to shoot down Pakistani drone, captures 7 border posts' },
  { time: '2026-03-04T08:00:00Z', text: 'Seventh consecutive day of heavy shelling and border clashes along Durand Line' },
  // March 3 — Day 6
  { time: '2026-03-03T18:00:00Z', text: 'NYT satellite imagery confirms Pakistani strikes destroyed hangar and 2 warehouses at Bagram Airfield' },
  { time: '2026-03-03T14:00:00Z', text: 'Turkey offers to mediate \u2014 Erdo\u011fan calls for ceasefire and diplomatic engagement' },
  { time: '2026-03-03T10:00:00Z', text: 'Pakistan updates claims: 481 Taliban fighters killed, 696+ injured, 2 corps HQs and 3 brigade HQs destroyed' },
  // March 2 — Day 5
  { time: '2026-03-02T16:00:00Z', text: 'Afghan Taliban strikes deep into Pakistan \u2014 hits Nur Khan Airbase (Rawalpindi), 12th Division HQ (Quetta), Khwazai Camp' },
  { time: '2026-03-02T10:00:00Z', text: 'Afghan deputy spokesman: Pakistani strikes have killed 55 civilians across multiple provinces since Feb 27' },
  // March 1 — Day 4
  { time: '2026-03-01T14:00:00Z', text: 'PAF strikes hit 46 locations since operation began \u2014 including Bagram Airfield; 130 Taliban posts destroyed' },
  { time: '2026-03-01T10:00:00Z', text: 'Taliban deploys anti-aircraft and missile defense systems against PAF jets entering Afghan airspace' },
  { time: '2026-03-01T06:00:00Z', text: 'Clashes resume along border in Nangarhar, Khost, and Paktia provinces' },
  // February 28 — Day 3
  { time: '2026-02-28T16:00:00Z', text: 'Pakistan claims 32 sq km of Afghan territory south of Zhob sector \u2014 establishes "Ghudwana Enclave"' },
  { time: '2026-02-28T12:00:00Z', text: 'Afghanistan claims Pakistani F-16 shot down over Jalalabad \u2014 Pakistan denies, calls it "wartime propaganda"' },
  { time: '2026-02-28T08:00:00Z', text: 'Pakistan rejects all dialogue: "There won\'t be any talks. There\'s no dialogue. There\'s no negotiation."' },
  // February 27 — Day 2: Open War Declared
  { time: '2026-02-27T14:00:00Z', text: 'Pakistan launches Operation Ghazab Lil Haq \u2014 massive airstrikes on Kabul, Kandahar, and Paktia' },
  { time: '2026-02-27T12:00:00Z', text: 'Defence Minister Khawaja Asif declares Pakistan in "open war" with Afghanistan \u2014 "Islamabad\'s patience is exhausted"' },
  { time: '2026-02-27T10:00:00Z', text: 'Explosions rock Kabul \u2014 secondary blasts at weapons depot on western outskirts' },
  { time: '2026-02-27T08:00:00Z', text: 'Pakistan military: 274 Taliban killed, 83 posts destroyed, 17 captured in first day of operation' },
  // February 26 — Day 1
  { time: '2026-02-26T14:00:00Z', text: 'Afghanistan launches coordinated attack on 53 locations along 2,600 km Durand Line border' },
  { time: '2026-02-26T10:00:00Z', text: 'Afghan forces capture multiple Pakistani military outposts in Khyber Pakhtunkhwa' },
  { time: '2026-02-26T06:00:00Z', text: 'Afghan Defence Ministry claims 55 Pakistani soldiers killed, 19 army posts destroyed, 2 bases overrun' },
  // February 21 — Initial Strikes
  { time: '2026-02-21T02:00:00Z', text: 'PAF strikes 7 alleged TTP/ISIS-K camps in Nangarhar, Paktika, and Khost \u2014 18 civilians killed in Nangarhar' },
];

const PAK_AFG_WAR_KW = ['pakistan', 'pakistani', 'afghanistan', 'afghan', 'taliban', 'kabul', 'kandahar', 'durand', 'ghazab', 'paktia', 'paktika', 'nangarhar', 'bagram', 'nur khan', 'islamabad'];

const PAK_AFG_INTEL = {
  what: 'Pakistan declared "open war" on Afghanistan on February 27, 2026, launching Operation Ghazab Lil Haq ("Righteous Fury") with massive airstrikes on Kabul, Kandahar, and Paktia. The operation followed months of escalating TTP terrorism inside Pakistan and cross-border clashes along the Durand Line. On February 26, Afghan Taliban forces attacked 53 locations along the 2,600 km border, capturing multiple Pakistani outposts. Pakistan responded with full-scale air and ground operations, striking 46+ locations including Bagram Airfield (confirmed by NYT satellite imagery). Pakistan claims 527+ Taliban fighters killed and 755+ injured, with 237 checkposts destroyed and 205 vehicles eliminated. Afghanistan claims 110 civilians killed including 65 women and children. Afghan Taliban retaliated by striking deep into Pakistan \u2014 hitting Nur Khan Airbase in Rawalpindi, the 12th Division HQ in Quetta, and camps in Mohmand Agency. Pakistan claims to have seized 32 sq km of Afghan territory (the "Ghudwana Enclave"). Over 115,000 Afghans have been displaced, with 3,000 displaced in Pakistan.',
  why: 'This is the first conventional inter-state war between Pakistan and Afghanistan\'s Taliban government \u2014 a regime Pakistan itself helped bring to power. Pakistan is a nuclear-armed state of 231 million people; Afghanistan is already in humanitarian crisis. The war threatens to destabilize the entire South Asian region. Pakistan has rejected all dialogue ("There won\'t be any talks"). WFP has suspended food distribution across 46 districts affecting 160,000 people. Health facilities including an IOM transit centre have been damaged. The conflict creates a refugee crisis on top of Afghanistan\'s existing displacement of millions. Both sides\' casualty claims are unverifiable \u2014 the fog of war is thick.',
  outlook: 'A 5-day Eid al-Fitr ceasefire pause was agreed on March 19, brokered by Saudi Arabia, Qatar and Turkey \u2014 the first halt in fighting since the war began. However, both sides retain full military posture and the underlying dispute is unresolved. The March 16 hospital strike in Kabul (143+ killed per UN) has intensified international pressure. Key risks: ceasefire collapse after Eid, further Afghan strikes on Pakistani military infrastructure, humanitarian catastrophe in border provinces, and the nuclear dimension \u2014 Pakistan possesses ~170 nuclear warheads. China has called for restraint given its CPEC investments in Pakistan.',
};

// Russia-Ukraine War Timeline
const UKR_RUS_TIMELINE_BASE = [
  { time: '2026-03-14T12:00:00Z', text: 'Ukraine strikes Russian ammunition depot in Belgorod Oblast \u2014 massive secondary explosions reported' },
  { time: '2026-03-14T06:00:00Z', text: 'Russia launches 52 Shahed drones overnight \u2014 Ukrainian air defense destroys 47, Odesa port infrastructure damaged' },
  { time: '2026-03-13T12:00:00Z', text: 'Zelensky calls for renewed peace talks \u2014 "We must find path to end this war in 2026"' },
  { time: '2026-03-13T06:00:00Z', text: 'Russian forces advance 1.2 km near Pokrovsk \u2014 Ukrainian 93rd Brigade counterattacks, front line stabilized' },
  { time: '2026-03-12T12:00:00Z', text: 'US announces $2.4 billion military aid package \u2014 includes ATACMS, Patriot interceptors, Bradley IFVs' },
  { time: '2026-03-12T06:00:00Z', text: 'Ukrainian naval drones destroy Russian patrol boat in Black Sea \u2014 5th vessel sunk this month' },
  { time: '2026-03-11T12:00:00Z', text: 'Russia deploys 15,000 North Korean troops to Kursk front \u2014 Pentagon confirms satellite imagery' },
  { time: '2026-03-11T06:00:00Z', text: 'Ukrainian drone strikes oil refinery in Krasnodar \u2014 Russia\'s southern fuel logistics disrupted' },
  { time: '2026-03-10T12:00:00Z', text: 'Peace talks venue dispute continues \u2014 Russia rejects Geneva, proposes Minsk or Astana instead' },
  { time: '2026-03-10T06:00:00Z', text: 'Russian Iskander missile strikes Zaporizhzhia market \u2014 14 killed, 38 wounded in morning attack' },
  { time: '2026-03-09T12:00:00Z', text: 'Ukraine claims 1,200 Russian soldiers killed in single day \u2014 highest daily figure in 3 months' },
  { time: '2026-03-09T06:00:00Z', text: 'Massive Russian drone wave \u2014 120 Shaheds launched overnight, 15 reach targets in western Ukraine' },
  { time: '2026-03-08T12:00:00Z', text: 'Abu Dhabi talks officially postponed indefinitely due to Iran war \u2014 "regional situation too volatile"' },
  { time: '2026-03-08T06:00:00Z', text: 'Ukraine recaptures 2 villages near Orikhiv \u2014 Syrskyi calls it "proof counteroffensive capacity remains"' },
  { time: '2026-03-07T10:00:00Z', text: 'Russian missile strikes apartment building in Kharkiv \u2014 10 killed including 2 children, new "Izdeliye-30" cruise missile identified' },
  { time: '2026-03-07T04:00:00Z', text: 'Russia launches massive combined attack \u2014 29 missiles (including 2 hypersonic Tsyrkon) and 480 drones hit energy and port infrastructure' },
  { time: '2026-03-06T18:00:00Z', text: 'Abu Dhabi round 3 postponed due to Iran war \u2014 Geneva or Istanbul discussed as alternatives, talks expected "next week"' },
  { time: '2026-03-06T14:00:00Z', text: 'Zelensky visits Donetsk frontline \u2014 tours Sloviansk, Kramatorsk, Druzhkivka command posts of 28th Mechanized Brigade' },
  { time: '2026-03-06T08:00:00Z', text: 'POW exchange completed \u2014 500 prisoners released by each side over two days, largest swap since May 2025' },
  { time: '2026-02-18T12:00:00Z', text: 'Geneva talks end abruptly after 2 hours on day two \u2014 territory remains core sticking point' },
  { time: '2026-01-23T12:00:00Z', text: 'First trilateral US-Russia-Ukraine talks in Abu Dhabi \u2014 first time all three sit at same table since invasion' },
  { time: '2025-04-30T12:00:00Z', text: 'US-Ukraine minerals deal signed \u2014 Trump secures critical minerals agreement, resumes military aid' },
  { time: '2024-08-06T12:00:00Z', text: 'Ukraine launches Kursk incursion \u2014 captures ~1,300 sq km of Russian territory, first foreign occupation since WWII' },
  { time: '2024-02-17T12:00:00Z', text: 'Avdiivka falls to Russia \u2014 largest Russian advance since Bakhmut, marks shift in battlefield momentum' },
  { time: '2023-06-24T12:00:00Z', text: 'Wagner mutiny \u2014 Prigozhin marches to within 200 km of Moscow before standing down' },
  { time: '2023-06-06T12:00:00Z', text: 'Kakhovka Dam destroyed \u2014 catastrophic flooding in southern Ukraine' },
  { time: '2023-05-20T12:00:00Z', text: 'Bakhmut falls after 9 months of brutal urban combat \u2014 costliest battle of the war' },
  { time: '2022-11-11T12:00:00Z', text: 'Kherson liberated \u2014 Ukraine\u2019s most significant counteroffensive victory' },
  { time: '2022-09-30T12:00:00Z', text: 'Russia annexes Donetsk, Luhansk, Zaporizhzhia, Kherson \u2014 none fully controlled' },
  { time: '2022-04-02T12:00:00Z', text: 'Bucha massacre revealed \u2014 mass civilian killings spark international war crimes investigations' },
  { time: '2022-02-24T06:00:00Z', text: 'Russia launches full-scale invasion of Ukraine \u2014 largest European land war since WWII' },
];

const UKR_RUS_WAR_KW = ['ukraine', 'ukrainian', 'kyiv', 'zelensky', 'zelenskyy', 'donbas', 'donetsk', 'luhansk', 'zaporizhzhia', 'kherson', 'crimea', 'russia', 'russian', 'moscow', 'kremlin', 'putin', 'kursk', 'syrskyi', 'bakhmut', 'kharkiv', 'odesa', 'odessa'];

const UKR_RUS_INTEL = {
  what: 'Russia\'s full-scale invasion of Ukraine, launched on February 24, 2022, is now in its fourth year \u2014 the largest military conflict in Europe since WWII. Russia occupies approximately 20% of Ukraine\'s territory (~120,000 sq km). Combined casualties are approaching 2 million: Russia has lost an estimated 325,000 killed and ~1.2 million total casualties; Ukraine has suffered 500,000-600,000 total casualties. Russia gained only 49 sq mi in February 2026 \u2014 the smallest monthly gain since July 2024. Ukrainian Commander-in-Chief Syrskyi claimed Ukraine captured more territory than it lost in February 2026, with offensive operations along the southern front.',
  why: 'This conflict has fundamentally reshaped European security. Three rounds of US-brokered trilateral talks (Abu Dhabi, Geneva) have produced no breakthrough \u2014 territory remains the core sticking point. Russia demands Ukraine cede all of Donetsk, Luhansk, Zaporizhzhia, and Kherson oblasts; Ukraine refuses. Russia is now losing ~40,000 troops per month, exceeding its recruitment rate for the first time. The US-Ukraine minerals deal in April 2025 restored military aid after a freeze. France and the UK have pledged military hubs in Ukraine.',
  outlook: 'Peace talks are stalled with the next round (Abu Dhabi, early March) uncertain. A POW exchange of 500 per side was agreed at Geneva. The battlefield has reached an attritional equilibrium \u2014 neither side can achieve decisive breakthrough. Key variables: Trump\'s diplomatic leverage, Putin\'s territorial maximalism, Zelenskyy\'s red lines, European security commitments, and Russian economic sustainability under 16,000+ Western sanctions.',
};

// Sudan Civil War Timeline
const SUDAN_TIMELINE_BASE = [
  // March 2026
  { time: '2026-03-19T12:00:00Z', text: 'Chad orders total border closure and retaliation after RSF drone strike kills 17 funeral-goers in Chadian border town' },
  { time: '2026-03-18T12:00:00Z', text: 'RSF militants attack SAF stronghold near Chadian border, killing dozens' },
  { time: '2026-03-17T14:00:00Z', text: 'Half a billion dollars in medical supplies stranded in Dubai as Middle East war disrupts shipping to Sudan' },
  { time: '2026-03-17T08:00:00Z', text: 'UN Security Council sanctions four RSF commanders including Hemedti\'s brother Abdul Rahim Dagalo' },
  { time: '2026-03-14T12:00:00Z', text: 'SAF airstrikes hit RSF positions in El-Fasher \u2014 34 RSF fighters killed, civilians caught in crossfire' },
  { time: '2026-03-14T06:00:00Z', text: 'UNICEF reports 4.6 million children acutely malnourished in Sudan \u2014 worst child hunger crisis on record' },
  { time: '2026-03-13T12:00:00Z', text: 'RSF loses control of Madani in Gezira state \u2014 SAF ground forces retake provincial capital after 3-month siege' },
  { time: '2026-03-13T06:00:00Z', text: 'AU envoy calls for immediate ceasefire \u2014 both sides reject conditions, fighting intensifies in Darfur' },
  { time: '2026-03-12T12:00:00Z', text: 'Mass graves discovered in West Darfur \u2014 UN investigators document 340+ bodies, evidence of RSF execution campaign' },
  { time: '2026-03-12T06:00:00Z', text: 'SAF drone strikes RSF convoy near Nyala \u2014 18 vehicles destroyed, RSF supply lines to South Darfur severed' },
  { time: '2026-03-11T12:00:00Z', text: 'Cholera outbreak spreads to 8 states \u2014 WHO reports 12,000 cases, hospitals lack clean water and antibiotics' },
  { time: '2026-03-11T06:00:00Z', text: 'RSF forces burn village in Blue Nile state \u2014 2,000 residents flee, crops and livestock destroyed' },
  { time: '2026-03-10T12:00:00Z', text: 'SAF recaptures key bridge over White Nile \u2014 secures supply corridor between Kosti and Rabak' },
  { time: '2026-03-10T06:00:00Z', text: 'US Treasury sanctions 3 RSF-linked gold trading companies \u2014 targets funding pipeline through UAE' },
  { time: '2026-03-09T12:00:00Z', text: 'UN reports 14.2 million displaced \u2014 Sudan surpasses Syria as world\'s worst displacement crisis' },
  { time: '2026-03-09T06:00:00Z', text: 'RSF drone attacks intensify in North Kordofan \u2014 8 civilian casualties in Kadugli market strike' },
  { time: '2026-03-08T12:00:00Z', text: 'SAF launches offensive to retake Wad Madani \u2014 fierce fighting as army attempts to push RSF from Gezira state' },
  { time: '2026-03-08T06:00:00Z', text: 'WFP evacuates staff from Darfur after convoy ambushed \u2014 food distribution suspended in 3 camps serving 400,000 people' },
  { time: '2026-03-07T14:00:00Z', text: 'UNHCR reports 13.6 million displaced \u2014 launches $1.6 billion appeal for 5.9 million across 7 neighboring countries' },
  { time: '2026-03-07T08:00:00Z', text: 'WFP warns food aid stocks will be depleted by end of March \u2014 urgently requires $700 million for Jan-June operations' },
  { time: '2026-03-06T14:00:00Z', text: 'SAF retakes Bara in North Kordofan \u2014 destroys 32 RSF combat vehicles in combined air-and-ground offensive' },
  { time: '2026-03-06T08:00:00Z', text: 'Sudan civil war reaches ~1,000 days \u2014 drone strikes intensify on both sides across multiple fronts' },
  { time: '2026-03-05T14:00:00Z', text: '51 civilians killed in 24 hours of fighting across Kordofan \u2014 Dilling Hospital overwhelmed with 28 dead and 60 injured' },
  { time: '2026-03-05T08:00:00Z', text: 'RSF drone strikes British Hospital in El-Obeid \u2014 12 injured including 5 medical workers on duty' },
  { time: '2026-03-04T12:00:00Z', text: 'SAF retakes Habila in West Kordofan \u2014 RSF retreats after sustained ground offensive' },
  { time: '2026-03-03T10:00:00Z', text: 'RSF drone strikes El-Obeid electricity substation \u2014 entire city blacked out, fifth day of sustained drone bombardment' },
  { time: '2026-03-02T06:00:00Z', text: 'RSF-armed militias kill 169 in South Sudan\'s Abiemnom county \u2014 cross-border attack on civilians in their homes' },
  // February 2026
  { time: '2026-02-25T12:00:00Z', text: 'UN warns of "escalating atrocity risks" \u2014 reports systematic sexual violence by RSF in Darfur and Gezira' },
  { time: '2026-02-20T12:00:00Z', text: 'UK imposes sanctions on RSF commanders and affiliated companies funding the war' },
  { time: '2026-02-10T12:00:00Z', text: 'RSF drone strikes hit civilian market in El-Fasher \u2014 dozens killed, hospitals overwhelmed' },
  // Late 2025
  { time: '2025-12-15T12:00:00Z', text: 'SAF retakes key districts in central Khartoum \u2014 government begins phased return from Port Sudan' },
  { time: '2025-11-01T12:00:00Z', text: 'EU imposes expanded sanctions on RSF leaders and gold smuggling networks funding the conflict' },
  { time: '2025-10-01T12:00:00Z', text: 'Mass displacement tops 11 million \u2014 world\'s largest displacement crisis, 4M+ cross-border refugees' },
  // 2024
  { time: '2024-10-15T12:00:00Z', text: 'SAF launches major counteroffensive in Khartoum \u2014 retakes key bridges and government buildings' },
  { time: '2024-07-01T12:00:00Z', text: 'RSF advances into Sennar and Gezira states \u2014 mass atrocities reported against civilians' },
  { time: '2024-02-01T12:00:00Z', text: 'UN reports famine conditions emerging in Darfur \u2014 aid access blocked by both sides' },
  // 2023
  { time: '2023-11-15T12:00:00Z', text: 'RSF captures most of Darfur \u2014 ethnic cleansing of Masalit people reported in West Darfur' },
  { time: '2023-06-15T12:00:00Z', text: 'RSF seizes most of Khartoum \u2014 government relocates to Port Sudan as capital becomes frontline' },
  { time: '2023-04-15T06:00:00Z', text: 'War erupts between SAF (Gen. Burhan) and RSF (Gen. Hemedti) \u2014 fighting breaks out across Khartoum' },
];

const SUDAN_WAR_KW = ['sudan', 'sudanese', 'darfur', 'khartoum', 'el-fasher', 'rsf', 'rapid support', 'burhan', 'hemedti', 'port sudan'];

const SUDAN_INTEL = {
  what: 'Sudan\'s civil war between the Sudanese Armed Forces (SAF, Gen. al-Burhan) and the Rapid Support Forces (RSF, Gen. Hemedti) erupted on April 15, 2023 and is approaching 1,000 days. An estimated 400,000+ people have been killed and 13.6 million displaced, with 4.3 million refugees in neighboring countries \u2014 the world\'s largest displacement crisis. The RSF seized most of Khartoum in mid-2023 and captured nearly all of Darfur by late 2023, with systematic ethnic cleansing of the Masalit people in West Darfur. The RSF expanded into Sennar and Gezira states in 2024 with mass atrocities against civilians. The SAF launched a counteroffensive in late 2024, retaking key districts in Khartoum, and the government has begun a phased return from Port Sudan. Drone strikes from both sides have intensified, hitting civilian markets and hospitals. Famine conditions are spreading with aid access blocked across frontlines.',
  why: 'This is one of the world\'s deadliest conflicts with catastrophic humanitarian consequences that receive far less attention than other wars. The RSF has documented links to Wagner Group/Russia and receives UAE support, while the SAF has Egyptian and Iranian backing \u2014 making Sudan a proxy battlefield. The EU and UK have imposed sanctions on RSF commanders and gold smuggling networks. Man-made famine threatens millions. The UN has reported systematic sexual violence by the RSF. Sudan controls strategic Red Sea coastline and Nile water resources critical to Egypt. The conflict threatens to destabilize the entire Horn of Africa and Sahel region.',
  outlook: 'Neither side can achieve decisive military victory. The SAF has momentum in Khartoum but the RSF controls vast rural territory. Drone warfare is escalating on both sides. Watch for: humanitarian access, famine spread, SAF counteroffensive progress, RSF atrocities in occupied areas, international sanctions impact, and any ceasefire negotiations. Without sustained pressure and humanitarian access, mass starvation will worsen. Long-term scenarios include partition, failed state status, or exhaustion-driven talks.',
};

// Iran War Timeline
const WAR_TIMELINE_BASE = [
  // March 14 — Day 15
  { time: '2026-03-14T14:00:00Z', text: 'US B-2 strikes hit Kharg Island oil terminal \u2014 Iran\'s largest crude export facility ablaze, 90% of Iran\'s oil exports disrupted' },
  { time: '2026-03-14T10:00:00Z', text: 'Iran fires anti-ship missiles at USS Eisenhower carrier group \u2014 all intercepted, CENTCOM retaliates with strikes on IRGC naval bases' },
  { time: '2026-03-14T06:00:00Z', text: 'Mojtaba Khamenei calls for "total mobilization" \u2014 orders 500,000 Basij militia to arms across all provinces' },
  // March 13 — Day 14
  { time: '2026-03-13T16:00:00Z', text: '2 US soldiers killed in rocket attack on Al-Asad Airbase in Iraq \u2014 Iran-backed PMF claims responsibility' },
  { time: '2026-03-13T12:00:00Z', text: 'Iranian death toll surpasses 1,500 \u2014 Red Crescent overwhelmed, 47 hospitals partially or fully destroyed' },
  { time: '2026-03-13T08:00:00Z', text: 'Israel announces "Phase 3" of Roaring Lion \u2014 expanded strikes on Iranian command infrastructure across 5 provinces' },
  // March 12 — Day 13
  { time: '2026-03-12T18:00:00Z', text: 'IRGC launches 28th wave of True Promise IV \u2014 ballistic missiles target US facilities in Bahrain and Qatar simultaneously' },
  { time: '2026-03-12T12:00:00Z', text: 'Strait of Hormuz remains fully closed \u2014 230+ tankers anchored, global oil supplies strained, Brent hits $97/barrel' },
  { time: '2026-03-12T06:00:00Z', text: 'US airstrikes destroy 3 Hezbollah weapons depots in Bekaa Valley \u2014 secondary explosions last hours' },
  // March 11 — Day 12
  { time: '2026-03-11T16:00:00Z', text: 'China and Russia issue joint statement condemning US-Israeli strikes \u2014 call for immediate ceasefire and UN Security Council action' },
  { time: '2026-03-11T10:00:00Z', text: 'Houthi anti-ship missile hits Greek-flagged tanker in Bab el-Mandeb \u2014 dual Hormuz-Red Sea disruption now active' },
  { time: '2026-03-11T06:00:00Z', text: '3 US Marines killed when Iranian drone strikes forward operating base near Erbil, Iraq \u2014 total 9 US service members killed' },
  // March 10 — Day 11
  { time: '2026-03-10T18:00:00Z', text: 'Iran launches first successful attack on Israeli airfield \u2014 Fattah-2 hypersonic missile damages runway at Nevatim Air Base' },
  { time: '2026-03-10T12:00:00Z', text: 'Mojtaba Khamenei\'s first televised address as Supreme Leader \u2014 "The Islamic Republic will never surrender to Zionist-American tyranny"' },
  { time: '2026-03-10T06:00:00Z', text: 'CENTCOM confirms 3,500+ targets struck across Iran \u2014 Pentagon says 95% of IRGC missile production destroyed' },
  // March 9 — Day 10
  { time: '2026-03-09T18:00:00Z', text: 'G7 emergency summit calls for de-escalation \u2014 France and Germany break with US, demand ceasefire within 72 hours' },
  { time: '2026-03-09T12:00:00Z', text: 'Iran retaliatory strikes intensify \u2014 24th wave hits US Camp Arifjan in Kuwait, 14 wounded' },
  { time: '2026-03-09T06:00:00Z', text: 'US and Israeli strikes hit Bandar Abbas naval base \u2014 4 IRGC fast attack boats destroyed in port' },
  // March 8 — Day 9
  { time: '2026-03-08T10:00:00Z', text: 'Iran declares capability to "keep fighting for six months" — rejects Trump\'s demand for unconditional surrender' },
  { time: '2026-03-08T08:00:00Z', text: 'Iranian death toll surpasses 1,332 — UNICEF confirms 181+ children among the dead, 6,668+ civilian structures hit' },
  { time: '2026-03-08T06:00:00Z', text: 'Israeli strike hits Ramada hotel in central Beirut — 4 killed, IDF says targeted IRGC Quds Force commanders sheltering inside' },
  { time: '2026-03-08T04:00:00Z', text: 'New wave of Iranian strikes across Gulf — Kuwait has intercepted 97 missiles and 283 drones total since war began' },
  // March 7 — Day 8
  { time: '2026-03-07T22:00:00Z', text: 'China\'s top diplomat: "a war that should never have happened, and a war that benefited no one"' },
  { time: '2026-03-07T20:00:00Z', text: 'Brent crude surges past $92/barrel — ~9 million barrels/day offline, global anti-war protests erupt worldwide' },
  { time: '2026-03-07T18:00:00Z', text: 'Israel launches commando operation in Bekaa Valley — 41 killed in Nabi Chit, IDF searching for remains of airman Ron Arad' },
  { time: '2026-03-07T16:00:00Z', text: 'Pezeshkian apologizes to Gulf neighbors for Iranian strikes — says they won\'t be targeted unless attacks originate from their territory' },
  { time: '2026-03-07T14:00:00Z', text: 'Iran retaliates against Israel\'s Bazan oil refinery in Haifa Bay — largest Israeli refinery hit with Kheibar Shekan missiles' },
  { time: '2026-03-07T12:00:00Z', text: 'Israel strikes Tehran oil depots — Shahran facility engulfed in massive fires visible across entire city skyline' },
  { time: '2026-03-07T10:00:00Z', text: 'Mojtaba Khamenei delivers first address as Supreme Leader — vows "divine vengeance" against US and Israel' },
  { time: '2026-03-07T08:00:00Z', text: 'Trump warns Iran will be "hit very hard" — signals widening of target list, threatens "complete destruction"' },
  { time: '2026-03-07T06:00:00Z', text: 'UK and Germany begin evacuation of nationals from Gulf states — commercial flights suspended at multiple airports' },
  { time: '2026-03-07T04:00:00Z', text: 'Iraqi parliament votes to expel US forces — Shia militias threaten attacks on US embassy in Baghdad' },
  // March 6 — Day 7
  { time: '2026-03-06T18:00:00Z', text: 'Israel has struck 500+ Hezbollah targets in Lebanon — 26 waves of airstrikes on Dahiyeh, 800,000 under evacuation orders' },
  { time: '2026-03-06T14:00:00Z', text: 'IRGC launches 22nd wave of Operation True Promise IV — codename "Ya Hossein ibn Ali" with advanced Fattah missiles' },
  { time: '2026-03-06T10:00:00Z', text: 'US says Iranian missile capability down 90% after B-2 strikes on hardened ballistic missile sites across Iran' },
  { time: '2026-03-06T06:00:00Z', text: 'Washington Post reveals Russia providing Iran satellite imagery and intelligence on US troop positions' },
  { time: '2026-03-06T02:00:00Z', text: 'Assembly of Experts reportedly selects Mojtaba Khamenei as new Supreme Leader — succession amid active war' },
  // March 5 — Day 6
  { time: '2026-03-05T22:00:00Z', text: 'Trump declares "no time limits" on war — demands role in choosing Iran\'s next leader, rejects Mojtaba Khamenei' },
  { time: '2026-03-05T20:00:00Z', text: 'WHO reports 13 Iranian health facilities hit by US-Israeli strikes — calls for protection of medical infrastructure' },
  { time: '2026-03-05T18:00:00Z', text: 'Iranian drones strike Azerbaijan\'s Nakhchivan airport — President Aliyev vows retaliation, calls attack "terrorism"' },
  { time: '2026-03-05T16:00:00Z', text: 'Houthis announce resumption of Red Sea shipping attacks — first since Nov 2024 pause, internal debate ongoing' },
  { time: '2026-03-05T14:00:00Z', text: 'IDF begins "broad wave of strikes" on Tehran — military chief declares "next phase" of war with 2,500+ strikes and 6,000+ weapons' },
  { time: '2026-03-05T12:00:00Z', text: 'Iranian death toll surpasses 1,230 — Tasnim reports mounting civilian casualties across 24 provinces' },
  { time: '2026-03-05T10:00:00Z', text: 'Insurance withdrawn for Hormuz transit — commercial shipping at standstill, VLCC rates hit record $423,736/day' },
  { time: '2026-03-05T08:00:00Z', text: 'QatarEnergy halts Ras Laffan LNG production after Iranian drone strike — force majeure on 20% of global LNG' },
  { time: '2026-03-05T06:00:00Z', text: 'Iran strikes hotel and residential buildings in Bahrain\'s Manama — Kuwait intercepts hostile missiles and drones' },
  { time: '2026-03-05T04:00:00Z', text: 'Brent crude rises to $85/barrel — European gas prices surge 45% after Qatar LNG halt' },
  // March 4 — Day 5
  { time: '2026-03-04T18:00:00Z', text: 'Three-day state funeral for Khamenei begins — burial planned in Mashhad' },
  { time: '2026-03-04T16:00:00Z', text: 'CIA reportedly arming Kurdish forces along Iraq-Iran border to spark internal uprising' },
  { time: '2026-03-04T14:00:00Z', text: 'US submarine torpedoes IRIS Dena off Sri Lanka — 87+ killed, first sub-sinking of warship since Falklands War' },
  { time: '2026-03-04T12:00:00Z', text: 'Hegseth says US "just getting started" — CENTCOM confirms 2,000+ targets struck across Iran' },
  { time: '2026-03-04T10:00:00Z', text: 'Iranian death toll surpasses 1,000 — hospitals overwhelmed, mass burials in multiple provinces' },
  { time: '2026-03-04T08:00:00Z', text: 'US Senate votes down War Powers Resolution — fails along party lines, Trump veto expected regardless' },
  { time: '2026-03-04T06:00:00Z', text: 'Lebanese death toll reaches 77 — Israel issues evacuation warnings south of Litani River' },
  { time: '2026-03-04T04:00:00Z', text: 'France deploys aircraft carrier Charles de Gaulle to eastern Mediterranean' },
  { time: '2026-03-04T02:00:00Z', text: 'IRGC announces ground forces entering battlefield operations — 230 drones engaged' },
  { time: '2026-03-04T00:00:00Z', text: 'French Rafale fighters shoot down Iranian drones over UAE — two French bases sustain damage' },
  // March 3 — Day 4 (late)
  { time: '2026-03-03T22:00:00Z', text: 'IRGC launches 17th wave of Operation True Promise IV — 40+ missiles at US base in Bahrain' },
  { time: '2026-03-03T20:00:00Z', text: 'IDF ground incursion into southern Lebanon — described as "forward defence" against Hezbollah' },
  // March 3 — Day 4 of war
  { time: '2026-03-03T18:00:00Z', text: 'Rubio warns "hardest hits yet to come" — US escalation in scope and intensity' },
  { time: '2026-03-03T16:00:00Z', text: 'Trump says war could last 4-5 weeks — offers US insurance for Gulf shipping and tanker escorts' },
  { time: '2026-03-03T15:00:00Z', text: 'Iranian drone strikes US Consulate parking lot in Dubai — fire erupts, all personnel accounted for' },
  { time: '2026-03-03T14:00:00Z', text: 'Satellite imagery confirms Natanz Nuclear Facility damage — IAEA says no radiological release' },
  { time: '2026-03-03T13:00:00Z', text: 'Iranian attack on UAE Fujairah Oil Industry Zone — drone intercepted, shrapnel starts fire' },
  { time: '2026-03-03T12:00:00Z', text: 'IDF claims destruction of covert nuclear weapons site "Minzadehei" near Tehran' },
  { time: '2026-03-03T11:00:00Z', text: 'US-Israel achieve air superiority over Tehran — 2,000+ targets struck since Feb 28' },
  { time: '2026-03-03T10:00:00Z', text: 'Israel strikes Beirut and Tehran simultaneously — hits IRIB broadcasting complex and Golestan Palace' },
  { time: '2026-03-03T09:00:00Z', text: 'Israel strikes Assembly of Experts building in Qom — disrupting Supreme Leader succession vote' },
  { time: '2026-03-03T08:00:00Z', text: 'Iran\'s interim leadership council formed: Pezeshkian, Mohseni-Ejei, Ayatollah Arafi' },
  { time: '2026-03-03T06:00:00Z', text: '4 US soldiers killed in drone attack in Kuwait — total 6 US service members killed' },
  { time: '2026-03-03T04:00:00Z', text: 'Iranian death toll rises to 787+ — strike on girls\' school in Minab kills 175+' },
  { time: '2026-03-03T02:00:00Z', text: 'IRGC launches 16th wave of Operation True Promise IV — missiles and drones at US/Israeli targets' },
  // March 2 — Day 3 of war
  { time: '2026-03-02T16:00:00Z', text: 'Lebanese PM Salam demands Hezbollah surrender weapons — bans all militia military activity' },
  { time: '2026-03-02T14:00:00Z', text: 'Hezbollah Secretary-General Qassem declares "duty of confronting the aggression"' },
  { time: '2026-03-02T12:00:00Z', text: 'France unveils updated nuclear doctrine — offers Gulf states defense umbrella against Iranian ballistic missiles' },
  { time: '2026-03-02T11:00:00Z', text: 'IRGC officially declares Strait of Hormuz closed — threatens to "set ships ablaze"' },
  { time: '2026-03-02T10:00:00Z', text: 'Oil prices surge past $84/barrel — analysts warn of $120-200 if Hormuz closure sustained' },
  { time: '2026-03-02T09:00:00Z', text: 'US deploys additional carrier strike group and B-2 bombers to Persian Gulf' },
  { time: '2026-03-02T08:00:00Z', text: 'Iran attacks targets across 8+ Arab states including US embassy in Riyadh' },
  { time: '2026-03-02T07:30:00Z', text: 'Dubai International Airport diverts all inbound flights amid regional escalation' },
  { time: '2026-03-02T07:00:00Z', text: 'Israeli strikes on Beirut and southern Lebanon — 31 killed, 149 wounded' },
  { time: '2026-03-02T06:00:00Z', text: 'Hezbollah launches rocket barrage into northern Israel — first attack since Nov 2024 ceasefire' },
  { time: '2026-03-02T05:15:00Z', text: 'Saudi defense ministry says air defenses repelled Iranian drones targeting Ras Tanura' },
  { time: '2026-03-02T04:30:00Z', text: 'Iran strikes Ras Tanura oil refinery in Saudi Arabia — first direct hit on Saudi oil infrastructure' },
  // March 1 — Day 2 of war
  { time: '2026-03-01T12:00:00Z', text: 'Iranian ballistic missile hits synagogue shelter in Beit Shemesh — 9 killed including 3 children' },
  { time: '2026-03-01T10:00:00Z', text: 'Iranian death toll surpasses 555 — hospitals in Tehran and Isfahan overwhelmed, morgues at capacity' },
  { time: '2026-03-01T08:00:00Z', text: 'IRGC begins electronic warfare in Strait of Hormuz — tanker traffic drops 70%' },
  { time: '2026-03-01T06:00:00Z', text: 'Heavy explosions rock Riyadh — second Iranian missile wave targets Saudi capital' },
  { time: '2026-03-01T04:00:00Z', text: '150+ ships anchored outside Strait of Hormuz to avoid combat zone' },
  { time: '2026-03-01T02:00:00Z', text: 'IRGC launches fresh missile salvos — ongoing operations across multiple fronts' },
  { time: '2026-02-28T20:00:00Z', text: 'Pezeshkian surfaces in broadcast: calls US-Israeli strikes "war against Muslims," urges Islamic world to act' },
  { time: '2026-02-28T18:00:00Z', text: 'Iranian missiles reach Mediterranean — strikes reported near Cyprus, EU calls emergency session' },
  { time: '2026-02-28T16:00:00Z', text: 'New Iranian missile salvos hit Riyadh — Saudi air defenses intercept majority but fires reported' },
  { time: '2026-02-28T14:00:00Z', text: 'IDF confirms Israeli casualties from Iranian retaliatory strikes — Iron Dome overwhelmed in south' },
  { time: '2026-02-28T12:15:00Z', text: 'IRGC threatens "most intense offensive operation" targeting Israel and US bases' },
  { time: '2026-02-28T11:15:00Z', text: 'Iran launches retaliatory strikes on Saudi Arabia, UAE, Qatar, Bahrain, Kuwait' },
  { time: '2026-02-28T10:15:00Z', text: 'Khamenei confirmed killed in Israeli strike on Tehran compound — 40+ senior officials also killed' },
  { time: '2026-02-28T10:00:00Z', text: 'Jordan intercepts 49 Iranian drones and ballistic missiles' },
  { time: '2026-02-28T09:15:00Z', text: 'Iran retaliates with hundreds of missiles and drones' },
  { time: '2026-02-28T08:15:00Z', text: 'Strikes hit 24 of 31 Iranian provinces — 200+ killed' },
  { time: '2026-02-28T08:00:00Z', text: 'Israel declares state of emergency, sirens across the country' },
  { time: '2026-02-28T06:15:00Z', text: 'Operation "Epic Fury" (US) and "Roaring Lion" (Israel) launched at 9:45 AM Iran time' },
  { time: '2026-02-28T00:00:00Z', text: 'Trump announces strikes aimed at regime change in 8-minute video' },
];

const IRAN_WAR_KW = ['iran', 'iranian', 'tehran', 'khamenei', 'mojtaba', 'irgc', 'hormuz', 'epic fury', 'roaring lion', 'pezeshkian', 'hezbollah', 'ras tanura', 'ras laffan', 'beirut', 'houthi', 'iris dena', 'nakhchivan'];
const TIMELINE_EXCLUDE = ['gaza ceasefire', 'ceasefire gains', 'aid workers', 'humanitarian corridor'];

const WAR_INTEL = {
  what: 'The United States and Israel launched coordinated military strikes on Iran on February 28, 2026, in operations codenamed "Epic Fury" (US) and "Roaring Lion" (Israel). Over 3,000+ targets have been struck across 24 of 31 Iranian provinces with 6,000+ weapons. Supreme Leader Khamenei was killed along with 40+ senior officials including Chief of Staff Mousavi and former President Ahmadinejad. The Iranian death toll has surpassed 1,500 (Tasnim), with some estimates exceeding 7,000 (HRANA). A strike on a girls\' school in Minab killed 175+ students and staff. The Assembly of Experts selected Mojtaba Khamenei as the new Supreme Leader \u2014 he has called for "total mobilization" and ordered 500,000 Basij militia to arms. Iran retaliated across 9+ countries with 28+ waves of Operation True Promise IV \u2014 a ballistic missile hit a synagogue shelter in Beit Shemesh killing 9 including 3 children, bringing Israeli deaths to 14+. Thirteen US service members have been killed across multiple engagements including drone strikes near Erbil, Iraq and IRGC missile attacks on Al-Asad Air Base. US B-2 strikes hit Kharg Island oil terminal, Iran\'s largest crude export facility. A US submarine torpedoed the Iranian frigate IRIS Dena off Sri Lanka, killing 148+ \u2014 the first submarine sinking of a warship since the Falklands War. The IRGC declared the Strait of Hormuz closed and insurance has been withdrawn for all transit. QatarEnergy declared force majeure after Iranian drones hit the Ras Laffan LNG complex \u2014 20% of global LNG supply offline. Iranian drones struck Azerbaijan\'s Nakhchivan airport, expanding the conflict to 10+ countries. WHO reports 13 Iranian health facilities hit. The IDF launched a ground incursion into southern Lebanon.',
  why: 'This is the most significant military confrontation in the Middle East since the 2003 Iraq invasion. Khamenei\'s assassination removes Iran\'s supreme authority after 35 years \u2014 the Assembly of Experts has reportedly selected his son Mojtaba as successor, though Trump demands a role in choosing Iran\'s next leader. The IRGC is the de facto power center. The Strait of Hormuz is commercially closed \u2014 insurance withdrawal has achieved what a physical blockade could not, with 20% of global oil transit blocked. Brent crude has spiked to $92/barrel with VLCC rates hitting an all-time record of $423,736/day. QatarEnergy\'s force majeure on Ras Laffan has taken 20% of global LNG offline, sending European gas prices up 45%. The conflict has expanded to 10+ countries with France actively shooting down Iranian drones and the US sinking an Iranian warship in the Indian Ocean. Iranian proxies are activated: Hezbollah resumed hostilities from Lebanon (77+ killed in Israeli retaliatory strikes), the IDF launched a ground incursion with evacuation warnings south of the Litani, Iraqi Shia militias declared war on US positions, Houthis threatening renewed Red Sea attacks, and the CIA arming Kurdish insurgents along the Iraq-Iran border.',
  outlook: 'Full regional war is the baseline scenario. Trump declares "no time limits" on the conflict. Active fronts: IRGC has launched 28+ waves of retaliatory strikes against Gulf infrastructure, US B-2s struck Kharg Island oil terminal (90% of Iran\'s crude exports), Houthi anti-ship missile hit a tanker in Bab el-Mandeb creating dual Hormuz-Red Sea disruption, IDF ground forces operating in southern Lebanon, Iran-backed PMF killing US troops in Iraq, and Mojtaba Khamenei ordering total mobilization of 500,000 Basij. France and Germany have broken with the US, demanding ceasefire within 72 hours. China and Russia issued a joint statement condemning the strikes. Brent crude at $97/barrel. Iran\'s nuclear program is severely damaged but the political incentive to rebuild is absolute. The risk of wider global conflict is at its highest point since the Cuban Missile Crisis.',
};

// Shared war-action keywords — article must match one of these AND a conflict keyword
const WAR_ACTION_KW = ['strike', 'struck', 'attack', 'missile', 'bomb', 'troops', 'casualt', 'offensive', 'airstrike', 'military', 'defense', 'defence', 'killed', 'destroy', 'combat', 'invasion', 'ceasefire', 'frontline', 'front line', 'artillery', 'drone strike', 'naval', 'weapon', 'nuclear', 'shoot', 'shot down', 'shell', 'rocket', 'intercept', 'siege', 'blockade', 'retreat', 'captur', 'deploy', 'incursion', 'escalat', 'retaliat', 'surrender', 'wounded', 'death toll', 'airspace', 'warship', 'fighter jet', 'battalion', 'brigade', 'regiment', 'division', 'torpedo', 'sniper', 'mortar', 'infantry', 'armored', 'tank', 'convoy', 'ambush', 'displaced', 'evacuat', 'famine', 'atrocit', 'genocide', 'war crime', 'sanction', 'threat', 'warn', 'clash', 'raid', 'operat', 'launch', 'target', 'hit ', 'hits ', 'fire', 'blast', 'explosi', 'shell', 'ground forces'];

// Headline prefixes/content that indicate non-event articles (commentary, galleries, etc.)
const TIMELINE_JUNK_STARTS = ['photos show', 'opinion:', 'analysis:', 'watch:', 'video:', 'live updates:', 'in photos:', 'why ', 'which ', 'how ', 'what is ', 'what are ', 'who is ', 'who are ', 'can ', 'could ', 'should ', 'is the ', 'moment ', 'inside ', 'meet the ', 'the case for ', 'the case against '];
const TIMELINE_JUNK_CONTAINS = ['photos', 'gallery', 'opinion', 'podcast', 'review', 'newsletter', 'subscribe', 'exclusive interview', 'analysis:', 'video shows', 'photos show', 'no point talking', 'could bring down', 'profiting', 'what it means', 'what you need to know', 'here\'s what', 'everything you need', 'explained', 'a closer look', 'lashes out', 'confiscate homes'];

// Patterns that indicate feature/commentary, not concrete events
const TIMELINE_JUNK_PATTERNS = [
  /\bopinion\b/i, /\banalysis\b/i, /\bpodcast\b/i, /\bcolumn\b/i,
  /\byacht/i, /\bprofit/i,                            // feature stories
  /\bcould\s+(bring|cause|send|lead|push|trigger|spark|mean|reach)\b/i, // speculation
  /\bguarantees?\b/i,                                  // political bluster
  /\bdefiant\b/i, /\brejoice\b/i,                      // editorializing
  /\bmoment\b.*\b(rejoice|defiant|cheer|celebrate)\b/i,
  /\bwaited to\b/i,                                    // feature narrative
  /\bwhat .*means\b/i, /\bwhat .*looks like\b/i,
  /\bhardly anyone\b/i, /\bno one came\b/i,
  /^\s*['"\u2018\u201C].*['"\u2019\u201D]\s*$/,         // entire headline is a quote
  /\bblind vengeance\b/i, /\breprehensible\b/i,        // opinion language
  /\bwarns\b/i, /\bvows\b/i, /\blashes out\b/i,        // reaction/threat language
  /\bconsiders\s+(sending|deploying|using|launching)\b/i, // speculation about future
  /\basks\b.*\bnot to\b/i,                             // diplomatic request, not event
  /\bplans to\b/i, /\bweighs\b/i, /\bmulls\b/i,        // speculation
  /\bhit historic high\b/i, /\bprices? (hit|surge|soar|jump|spike)\b/i, // market reaction
  /\bconfiscate\b/i,                                    // internal policy
  /\bthis is only the beginning\b/i,                    // rhetoric
];

// Words to ignore during fuzzy dedup comparison
const DEDUP_STOPWORDS = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'for', 'and', 'or', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'be', 'been', 'with', 'from', 'by', 'as', 'its', 'it', 'that', 'this', 'says', 'said', 'after', 'since', 'into', 'over', 'more', 'than', 'but', 'not', 'no', 'will', 'would', 'could', 'may', 'report', 'reports', 'new', 'first', 'during']);

// Strip source suffix from headline text (e.g. " - Haaretz", " - Reuters", " | CNN")
// Uses " - " or " | " separator followed by a short capitalized source name (1-6 words)
function cleanHeadlineText(text) {
  return text
    .replace(/\s+[-|]\s+(?:[A-Z][\w.&']+\s*){1,6}(?:\s+by\s+(?:[A-Z\s]+))?$/m, '')
    .trim();
}

function getSignificantWords(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 1 && !DEDUP_STOPWORDS.has(w));
}

function wordOverlap(wordsA, wordsB) {
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const setB = new Set(wordsB);
  let overlap = 0;
  for (const w of wordsA) {
    if (setB.has(w)) overlap++;
  }
  const shorter = Math.min(wordsA.length, wordsB.length);
  return overlap / shorter;
}

function isTimelineJunk(text) {
  const lower = text.toLowerCase();
  if (TIMELINE_JUNK_STARTS.some(prefix => lower.startsWith(prefix))) return true;
  if (TIMELINE_JUNK_CONTAINS.some(junk => lower.includes(junk))) return true;
  if (TIMELINE_JUNK_PATTERNS.some(pat => pat.test(text))) return true;
  // Ends with question mark
  if (text.trim().endsWith('?')) return true;
  // Headlines that are mostly a quote (contains both opening and closing quote marks with >60% quoted)
  const quoteMatch = text.match(/['"\u2018\u2019\u201C\u201D]/g);
  if (quoteMatch && quoteMatch.length >= 4) return true;
  // Headline is a reaction piece: starts with a quoted word/phrase
  if (/^['"\u2018\u201C]/.test(text.trim()) && /['"\u2019\u201D]:?\s/.test(text)) return true;
  return false;
}

// Fuzzy-dedup a merged timeline: 40%+ word overlap = duplicate, keep shorter/cleaner entry
// Also dedup entries within 2 hours that share 3+ key subject words
// Entries with _base=true skip the junk filter (they are hand-curated)
function dedupeTimeline(entries) {
  const result = [];
  const wordCache = [];
  const timeCache = [];
  for (const entry of entries) {
    const cleaned = cleanHeadlineText(entry.text);
    // Only filter non-base entries through the junk detector
    if (!entry._base && isTimelineJunk(cleaned)) continue;
    const cleanedEntry = { time: entry.time, text: entry._base ? entry.text : cleaned };
    const words = getSignificantWords(cleanedEntry.text);
    let isDup = false;
    for (let i = 0; i < result.length; i++) {
      const overlap = wordOverlap(words, wordCache[i]);
      if (overlap >= 0.4) {
        // Always prefer the base entry; otherwise keep shorter
        if (result[i]._base) { isDup = true; break; }
        if (entry._base || cleanedEntry.text.length < result[i].text.length) {
          result[i] = cleanedEntry;
          wordCache[i] = words;
          timeCache[i] = new Date(cleanedEntry.time).getTime();
        }
        isDup = true;
        break;
      }
      // Time-proximity dedup: within 2 hours with 3+ shared significant words
      const timeDiff = Math.abs(new Date(cleanedEntry.time).getTime() - timeCache[i]);
      if (timeDiff < 7200000) { // 2 hours
        const setB = new Set(wordCache[i]);
        let shared = 0;
        for (const w of words) { if (setB.has(w)) shared++; }
        if (shared >= 3) {
          if (result[i]._base) { isDup = true; break; }
          if (entry._base || cleanedEntry.text.length < result[i].text.length) {
            result[i] = cleanedEntry;
            wordCache[i] = words;
            timeCache[i] = new Date(cleanedEntry.time).getTime();
          }
          isDup = true;
          break;
        }
      }
    }
    if (!isDup) {
      result.push(cleanedEntry);
      wordCache.push(words);
      timeCache.push(new Date(cleanedEntry.time).getTime());
    }
  }
  return result;
}

// Extract a numeric value from a stat string like "1,332+", "~150,000", "7", etc.
function parseStatNum(val) {
  if (val == null) return NaN;
  const s = String(val).replace(/[^0-9.]/g, '');
  return parseFloat(s) || NaN;
}

// Search AI stats object for a value matching keyword patterns
// Claude returns unpredictable key names — search all keys for best match
function findStat(stats, entityKeywords, metricKeywords) {
  if (!stats || typeof stats !== 'object') return null;
  for (const [key, val] of Object.entries(stats)) {
    const k = key.toLowerCase().replace(/[_-]/g, ' ');
    const hasEntity = entityKeywords.some(ek => k.includes(ek.toLowerCase()));
    const hasMetric = metricKeywords.some(mk => k.includes(mk.toLowerCase()));
    if (hasEntity && hasMetric && val != null && val !== '') {
      return String(val);
    }
  }
  return null;
}

// findStat variant: match entity as a whole word in key (for short terms like "us")
function findStatWholeWord(stats, entity, metricKeywords) {
  if (!stats || typeof stats !== 'object') return null;
  const re = new RegExp('(^|[_ -])' + entity + '([_ -]|$)', 'i');
  for (const [key, val] of Object.entries(stats)) {
    if (!re.test(key)) continue;
    const k = key.toLowerCase().replace(/[_-]/g, ' ');
    const hasMetric = metricKeywords.some(mk => k.includes(mk.toLowerCase()));
    if (hasMetric && val != null && val !== '') return String(val);
  }
  return null;
}

// Return the higher of AI stat vs hardcoded floor — AI can never decrease stats
// Also checks server-side persistent floors (from KV) as an intermediate layer
function floorStat(aiVal, hardcodedFloor, serverFloorVal) {
  const aiNum = parseStatNum(aiVal);
  const floorNum = parseStatNum(hardcodedFloor);
  const serverNum = parseStatNum(serverFloorVal);
  // Effective floor = max of hardcoded and server-persisted floor
  let effectiveFloor = floorNum;
  let effectiveVal = hardcodedFloor;
  if (!isNaN(serverNum) && serverNum > effectiveFloor) {
    effectiveFloor = serverNum;
    effectiveVal = serverFloorVal;
  }
  if (isNaN(aiNum)) return effectiveVal;
  if (isNaN(effectiveFloor)) return aiVal || hardcodedFloor;
  if (aiNum >= effectiveFloor) return aiVal;
  return effectiveVal;
}

// Filter DAILY_BRIEFING articles into timeline entries for a given conflict
function filterBriefingForTimeline(countryKW, actionKW, excludeKW) {
  const entries = [];
  const seenTitles = new Set();

  for (const article of DAILY_BRIEFING) {
    const hl = (article.headline || article.title || '').toLowerCase();
    if (!hl) continue;

    // Must match both a country keyword and a war-action keyword
    if (!countryKW.some(kw => hl.includes(kw))) continue;
    if (!actionKW.some(kw => hl.includes(kw))) continue;

    // Exclude non-event content
    if (isTimelineJunk(hl)) continue;
    if (excludeKW.some(ex => hl.includes(ex))) continue;

    // Exact-title dedup only
    if (seenTitles.has(hl)) continue;
    seenTitles.add(hl);

    // Get timestamp — use pubDate, fall back to current time
    const pubDate = article.pubDate && !isNaN(new Date(article.pubDate).getTime())
      ? article.pubDate : null;
    if (!pubDate) continue;

    const displayHL = article.headline || article.title || '';
    entries.push({ time: pubDate, text: displayHL });
  }

  return entries;
}

// Banner war keyword filter — used by getStableTopStories to prevent duplicates
const BANNER_IRAN_KW = ['iran', 'iranian', 'tehran', 'khamenei', 'irgc', 'strait of hormuz', 'epic fury', 'roaring lion', 'hezbollah', 'houthi', 'ras tanura', 'pezeshkian', 'beirut'];
const BANNER_PAK_AFG_KW = ['pakistan', 'pakistani', 'afghanistan', 'afghan', 'taliban', 'kabul', 'kandahar', 'durand', 'ghazab', 'bagram', 'islamabad'];
const BANNER_UKR_RUS_KW = ['ukraine', 'ukrainian', 'kyiv', 'zelensky', 'donbas', 'crimea', 'russia', 'russian', 'moscow', 'kremlin'];
const BANNER_SUDAN_KW = ['sudan', 'sudanese', 'darfur', 'khartoum', 'el-fasher', 'rsf', 'rapid support', 'burhan', 'hemedti'];

function isBannerWar(e) {
  const text = ((e.headline || '') + ' ' + (e.articles || []).map(a => (a.headline || '')).join(' ')).toLowerCase();
  return BANNER_IRAN_KW.some(kw => text.includes(kw)) ||
    BANNER_PAK_AFG_KW.some(kw => text.includes(kw)) ||
    BANNER_UKR_RUS_KW.some(kw => text.includes(kw)) ||
    BANNER_SUDAN_KW.some(kw => text.includes(kw));
}

const TABS = [
  { id: 'events', label: 'Events' },
  { id: 'newsletter', label: 'Brief' },
  { id: 'elections', label: 'Elections' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'horizon', label: 'Horizon' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'travel', label: 'Travel' }
];

const ITEMS_PER_PAGE = 15;

const CAT_COLORS = { summit: '#06b6d4', election: '#a78bfa', treaty: '#f59e0b', military: '#ef4444', economic: '#22c55e', sanctions: '#f97316' };

const MONTH_MAP = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
                    Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
function parseSortDate(dateStr) {
  const match = dateStr.match(/([A-Z][a-z]{2})[\s\-–].*?(\d{4})/);
  if (match) return `${match[2]}-${MONTH_MAP[match[1]] || '01'}-01`;
  return '9999-12-31';
}

const NUCLEAR_ARSENALS = [
  { country: 'Russia', flag: '\u{1F1F7}\u{1F1FA}', warheads: '~5,580' },
  { country: 'United States', flag: '\u{1F1FA}\u{1F1F8}', warheads: '~5,044' },
  { country: 'China', flag: '\u{1F1E8}\u{1F1F3}', warheads: '~500' },
  { country: 'France', flag: '\u{1F1EB}\u{1F1F7}', warheads: '~290' },
  { country: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', warheads: '~225' },
  { country: 'India', flag: '\u{1F1EE}\u{1F1F3}', warheads: '~172' },
  { country: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}', warheads: '~170' },
  { country: 'Israel', flag: '\u{1F1EE}\u{1F1F1}', warheads: '~90*' },
  { country: 'North Korea', flag: '\u{1F1F0}\u{1F1F5}', warheads: '~50' },
];

export default function Sidebar({ onCountryClick, onOpenStocksModal, stocksData, stocksLastUpdated, stocksUpdating, militaryMode }) {
  const [activeTab, setActiveTab] = useState('events');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [newsTimestamp, setNewsTimestamp] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventsVersion, setEventsVersion] = useState(0); // force re-render when summaries arrive
  const contentRef = useRef(null);

  // Elections + Horizon tab state
  const [selectedElection, setSelectedElection] = useState(null);
  const electionScrollRef = useRef(null);
  const horizonNowRef = useRef(null);

  // Travel tab state
  const [travelSearch, setTravelSearch] = useState('');
  const [travelCountry, setTravelCountry] = useState(null);
  const [travelCity, setTravelCity] = useState(null);
  const [travelStartDate, setTravelStartDate] = useState('');
  const [travelEndDate, setTravelEndDate] = useState('');
  const [travelSuggestions, setTravelSuggestions] = useState([]);

  // Expose toggleBriefDropdown globally — copied verbatim from original news.js.
  // Inline onclick handlers in dangerouslySetInnerHTML need this on window.
  useEffect(() => {
    window.toggleBriefDropdown = function(id) {
      const el = document.getElementById(id);
      const arrow = document.getElementById(id + '-arrow');
      if (el) {
        const isOpen = el.style.maxHeight && el.style.maxHeight !== '0px';
        el.style.maxHeight = isOpen ? '0px' : el.scrollHeight + 'px';
        el.style.opacity = isOpen ? '0' : '1';
        if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    };
    return () => { delete window.toggleBriefDropdown; };
  }, []);

  // Subscribe to events updates (when AI summaries arrive)
  useEffect(() => {
    const unsub = onEventsUpdated(() => {
      setEventsVersion(v => v + 1);
    });
    return unsub;
  }, []);

  // Update news timestamp
  useEffect(() => {
    const update = () => {
      if (lastNewsUpdate) {
        setNewsTimestamp(`Live \u00b7 Updated ${lastNewsUpdate.toLocaleTimeString()} \u00b7 ${DAILY_BRIEFING.length} articles`);
      }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  // timeAgo() computes fresh each render — no setInterval needed

  // Reset visible count + scroll position on tab change; clear detail views
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE); // eslint-disable-line react-hooks/set-state-in-effect
    setSelectedElection(null);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeTab]);

  // Auto-scroll to scroll targets when elections/horizon tab activates
  useEffect(() => {
    if (activeTab === 'elections' && !selectedElection) {
      setTimeout(() => electionScrollRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' }), 50);
    }
    if (activeTab === 'horizon') {
      setTimeout(() => horizonNowRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' }), 50);
    }
  }, [activeTab, selectedElection]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

  const handleCountryClick = useCallback((countryName) => {
    if (onCountryClick) onCountryClick(countryName);
  }, [onCountryClick]);

  // ============================================================
  // Tab Content Renderers
  // ============================================================

  const catBorderColor = (cat) => {
    if (cat === 'CONFLICT') return '#ef4444';
    if (cat === 'CRISIS') return '#f97316';
    if (cat === 'SECURITY') return '#eab308';
    if (cat === 'ECONOMY') return '#22c55e';
    if (cat === 'DIPLOMACY') return '#8b5cf6';
    if (cat === 'POLITICS') return '#3b82f6';
    return '#374151';
  };

  const getCardPreview = (event) => {
    if (event.summaryLoading) return null;
    if (!event.summary) return null;

    const text = event.summary;
    // Extract just the "What happened" section for a brief teaser
    const whatMatch = text.match(/\*\*What happened:\*\*\s*(.*?)(?:\s*\*\*Why it matters:|$)/s);
    let preview;
    if (whatMatch) {
      preview = whatMatch[1].trim();
    } else {
      // Fallback: first sentence
      const sentenceMatch = text.match(/^[^.!?]*[.!?]/);
      preview = sentenceMatch ? sentenceMatch[0].trim() : text;
    }

    // Keep preview short — this is a teaser, not the full summary
    if (preview.length > 120) {
      preview = preview.substring(0, 117).replace(/\s+\S*$/, '') + '...';
    }
    return preview;
  };

  const renderEventCard = (event, isTopStory) => {
    // Clean up headline for display — keep it SHORT
    let displayHeadline = event.headline || event.title || '';
    const dashIdx = displayHeadline.lastIndexOf(' - ');
    if (dashIdx > 0 && dashIdx > displayHeadline.length - 40) {
      displayHeadline = displayHeadline.substring(0, dashIdx).trim();
    }

    const preview = getCardPreview(event);

    return (
      <div
        key={event.id}
        className="card"
        onClick={() => setSelectedEvent(event)}
        style={{
          cursor: 'pointer',
          ...(isTopStory ? { borderLeft: `2px solid ${catBorderColor(event.category)}` } : {})
        }}
      >
        {/* Header row: category + sources badge + time */}
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`card-cat ${event.category}`}>{event.category}</span>
            {event.sourceCount > 1 && (
              <span style={{
                fontSize: '7px', fontWeight: 700, color: '#06b6d4',
                background: 'rgba(6,182,212,0.15)', padding: '2px 5px',
                borderRadius: '3px', letterSpacing: '0.3px'
              }}>
                {event.sourceCount} sources
              </span>
            )}
          </div>
          <span className="card-time">{event.time}</span>
        </div>

        {/* HEADLINE — always the short punchy headline, never the summary */}
        <div className="card-headline" style={isTopStory ? { fontWeight: 600 } : undefined}>
          {displayHeadline}
        </div>

        {/* Brief preview from summary below headline */}
        {preview && (
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.5 }}>
            {preview}
          </div>
        )}

        {/* Loading indicator */}
        {event.summaryLoading && (
          <div style={{ fontSize: '8px', color: '#06b6d4', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', border: '1.5px solid #374151', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Updating...
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // War Timeline Merging (useMemo — only recompute on events update)
  // ============================================================
  const PAK_AFG_TIMELINE = useMemo(() => {
    const base = PAK_AFG_TIMELINE_BASE.map(e => ({ ...e, _base: true }));
    const live = filterBriefingForTimeline(PAK_AFG_WAR_KW, WAR_ACTION_KW, TIMELINE_EXCLUDE);
    const aiEntries = (AI_TIMELINE_DATA.pakafg?.timeline_entries || [])
      .filter(e => e.text && e.timestamp && !isTimelineJunk(e.text))
      .map(e => ({ time: e.timestamp, text: e.text }));
    return dedupeTimeline([...base, ...live, ...aiEntries]).sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [eventsVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const openPakAfgModal = () => {
    const syntheticEvent = {
      id: 'breaking-pak-afg-war',
      headline: 'Pakistan Declares Open War on Afghanistan',
      category: 'CONFLICT',
      breaking: true,
      time: conflictTimeAgo('pakafg'),
      warIntel: PAK_AFG_INTEL,
      warTimeline: PAK_AFG_TIMELINE,
      articles: [],
    };
    setSelectedEvent(syntheticEvent);
  };

  const renderPakAfgCard = () => {
    const pakStats = AI_TIMELINE_DATA.pakafg?.stats || {};
    const pakFloors = AI_DEATH_TOLL_FLOORS.pakafg || {};
    if (AI_TIMELINE_DATA.pakafg?.stats) console.log('[Hegemon] AI PakAfg stats:', JSON.stringify(pakStats));
    const afgCivKilled = floorStat(findStat(pakStats, ['afghan', 'civilian'], ['killed', 'deaths', 'dead', 'casualties', 'toll']), '110+', pakFloors.afghan_civilian_killed);
    const displaced = floorStat(findStat(pakStats, ['displac', 'refugee'], ['displac', 'total', 'number', 'people']) || findStat(pakStats, [''], ['displac']), '115,000', pakFloors.displaced);
    const talibanKilled = floorStat(findStat(pakStats, ['taliban'], ['killed', 'deaths', 'dead', 'casualties']), '527+', pakFloors.taliban_killed);
    const pakDays = conflictDay('pakafg');
    const preview = `Day ${pakDays} \u2014 ${PAK_AFG_TIMELINE[0]?.text || 'Operation Ghazab Lil Haq ongoing.'}`;

    return (
      <div
        key="breaking-pak-afg-card"
        className="card"
        onClick={openPakAfgModal}
        style={{ cursor: 'pointer', borderLeft: '3px solid #dc2626' }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '8px', fontWeight: 800, color: '#fff', background: '#dc2626',
              padding: '2px 6px', borderRadius: '3px', letterSpacing: '1px'
            }}>BREAKING</span>
            <span className="card-cat CONFLICT">CONFLICT</span>
          </div>
          <span className="card-time">{conflictTimeAgo('pakafg')}</span>
        </div>
        <div className="card-headline" style={{ fontWeight: 700, color: '#fca5a5' }}>
          Pakistan Declares Open War on Afghanistan
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            AFG: {afgCivKilled} civilians killed
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            {displaced} displaced
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#93c5fd', background: 'rgba(59,130,246,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            {talibanKilled} Taliban killed
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.5 }}>
          {preview}
        </div>
      </div>
    );
  };

  const UKR_RUS_TIMELINE = useMemo(() => {
    const base = UKR_RUS_TIMELINE_BASE.map(e => ({ ...e, _base: true }));
    const live = filterBriefingForTimeline(UKR_RUS_WAR_KW, WAR_ACTION_KW, TIMELINE_EXCLUDE);
    const aiEntries = (AI_TIMELINE_DATA.ukraine?.timeline_entries || [])
      .filter(e => e.text && e.timestamp && !isTimelineJunk(e.text))
      .map(e => ({ time: e.timestamp, text: e.text }));
    return dedupeTimeline([...base, ...live, ...aiEntries]).sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [eventsVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const openUkrRusModal = () => {
    const syntheticEvent = {
      id: 'top-ukr-rus-war',
      headline: `Russia-Ukraine War \u2014 Year ${Math.floor((conflictDay('ukraine') - 1) / 365) + 1}`,
      category: 'CONFLICT',
      breaking: true,
      time: conflictTimeAgo('ukraine'),
      warIntel: UKR_RUS_INTEL,
      warTimeline: UKR_RUS_TIMELINE,
      articles: [],
    };
    setSelectedEvent(syntheticEvent);
  };

  const renderUkrRusCard = () => {
    const ukrStats = AI_TIMELINE_DATA.ukraine?.stats || {};
    const ukrFloors = AI_DEATH_TOLL_FLOORS.ukraine || {};
    if (AI_TIMELINE_DATA.ukraine?.stats) console.log('[Hegemon] AI Ukraine stats:', JSON.stringify(ukrStats));
    const totalCasualties = floorStat(findStat(ukrStats, ['total', 'combined', 'overall'], ['casualties', 'killed', 'losses']), '~2M', ukrFloors.total_casualties);
    const ukrDays = conflictDay('ukraine');
    const ukrYears = Math.floor((ukrDays - 1) / 365) + 1;
    const preview = `Day ${ukrDays.toLocaleString()} \u2014 ${UKR_RUS_TIMELINE[0]?.text || 'War continues across multiple fronts.'}`;

    return (
      <div
        key="top-ukr-rus-card"
        className="card"
        onClick={openUkrRusModal}
        style={{ cursor: 'pointer', borderLeft: '2px solid #ef4444' }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="card-cat CONFLICT">CONFLICT</span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#9ca3af', background: 'rgba(156,163,175,0.15)', padding: '2px 5px', borderRadius: '3px', letterSpacing: '0.3px' }}>
              Day {ukrDays.toLocaleString()}
            </span>
          </div>
          <span className="card-time">{conflictTimeAgo('ukraine')}</span>
        </div>
        <div className="card-headline" style={{ fontWeight: 600 }}>
          {`Russia-Ukraine War \u2014 Year ${ukrYears}`}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            {totalCasualties} total casualties
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fcd34d', background: 'rgba(234,179,8,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            Peace talks stalled
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.5 }}>
          {preview}
        </div>
      </div>
    );
  };

  const SUDAN_TIMELINE = useMemo(() => {
    const base = SUDAN_TIMELINE_BASE.map(e => ({ ...e, _base: true }));
    const live = filterBriefingForTimeline(SUDAN_WAR_KW, WAR_ACTION_KW, TIMELINE_EXCLUDE);
    const aiEntries = (AI_TIMELINE_DATA.sudan?.timeline_entries || [])
      .filter(e => e.text && e.timestamp && !isTimelineJunk(e.text))
      .map(e => ({ time: e.timestamp, text: e.text }));
    return dedupeTimeline([...base, ...live, ...aiEntries]).sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [eventsVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const openSudanModal = () => {
    const syntheticEvent = {
      id: 'top-sudan-war',
      headline: `Sudan Civil War \u2014 Day ${conflictDay('sudan').toLocaleString()}`,
      category: 'CONFLICT',
      breaking: true,
      time: conflictTimeAgo('sudan'),
      warIntel: SUDAN_INTEL,
      warTimeline: SUDAN_TIMELINE,
      articles: [],
    };
    setSelectedEvent(syntheticEvent);
  };

  const renderSudanCard = () => {
    const sudanStats = AI_TIMELINE_DATA.sudan?.stats || {};
    const sudanFloors = AI_DEATH_TOLL_FLOORS.sudan || {};
    if (AI_TIMELINE_DATA.sudan?.stats) console.log('[Hegemon] AI Sudan stats:', JSON.stringify(sudanStats));
    const killed = floorStat(findStat(sudanStats, ['total', 'estimated', 'civilian'], ['killed', 'deaths', 'dead', 'toll']), '400,000+', sudanFloors.total_killed);
    const displaced = floorStat(findStat(sudanStats, ['displac', 'total', 'internal'], ['displac', 'people', 'million']), '13.6M', sudanFloors.displaced);
    const sudanDays = conflictDay('sudan');
    const preview = `Day ${sudanDays.toLocaleString()} \u2014 ${SUDAN_TIMELINE[0]?.text || 'SAF vs RSF fighting continues across multiple fronts.'}`;

    return (
      <div
        key="top-sudan-card"
        className="card"
        onClick={openSudanModal}
        style={{ cursor: 'pointer', borderLeft: '2px solid #ef4444' }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="card-cat CONFLICT">CONFLICT</span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#9ca3af', background: 'rgba(156,163,175,0.15)', padding: '2px 5px', borderRadius: '3px', letterSpacing: '0.3px' }}>
              Day {sudanDays.toLocaleString()}
            </span>
          </div>
          <span className="card-time">{conflictTimeAgo('sudan')}</span>
        </div>
        <div className="card-headline" style={{ fontWeight: 600 }}>
          {`Sudan Civil War \u2014 Day ${sudanDays.toLocaleString()}`}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            Est. {killed} killed
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            {displaced} displaced
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.5 }}>
          {preview}
        </div>
      </div>
    );
  };

  // Top Stories: filter out war-banner events, return empty (all wars have dedicated banners)
  const getStableTopStories = useCallback((events) => {
    return events.filter(e => !isBannerWar(e)).slice(0, 0);
  }, []);

  // Auto-merge live Iran war articles from RSS feeds into the timeline
  const WAR_TIMELINE = useMemo(() => {
    const base = WAR_TIMELINE_BASE.map(e => ({ ...e, _base: true }));
    const live = filterBriefingForTimeline(IRAN_WAR_KW, WAR_ACTION_KW, TIMELINE_EXCLUDE);
    const aiEntries = (AI_TIMELINE_DATA.iran?.timeline_entries || [])
      .filter(e => e.text && e.timestamp && !isTimelineJunk(e.text))
      .map(e => ({ time: e.timestamp, text: e.text }));
    return dedupeTimeline([...base, ...live, ...aiEntries]).sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [eventsVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const openBreakingModal = () => {
    const syntheticEvent = {
      id: 'breaking-iran-war',
      headline: 'US and Israel at War with Iran',
      category: 'CONFLICT',
      breaking: true,
      time: conflictTimeAgo('iran'),
      warIntel: WAR_INTEL,
      warTimeline: WAR_TIMELINE,
      articles: [],
    };
    setSelectedEvent(syntheticEvent);
  };

  const renderBreakingCard = () => {
    const iranStats = AI_TIMELINE_DATA.iran?.stats || {};
    const iranFloors = AI_DEATH_TOLL_FLOORS.iran || {};
    if (AI_TIMELINE_DATA.iran?.stats) console.log('[Hegemon] AI Iran stats:', JSON.stringify(iranStats));
    const iranKilled = floorStat(findStat(iranStats, ['iran', 'iranian'], ['killed', 'deaths', 'dead', 'casualties', 'toll']), '1,500+', iranFloors.iranian_killed);
    const israelKilled = floorStat(findStat(iranStats, ['israel'], ['killed', 'deaths', 'dead', 'casualties']), '14', iranFloors.israeli_killed);
    // "us" is too short — match "u.s", "us_", "american", "united states", or key containing "us" as whole word
    const usKilled = floorStat(
      findStat(iranStats, ['u.s', 'american', 'united states'], ['killed', 'deaths', 'dead', 'service']) ||
      findStat(iranStats, ['us '], ['killed', 'deaths', 'dead']) ||
      findStatWholeWord(iranStats, 'us', ['killed', 'deaths', 'dead', 'service']),
      '13',
      iranFloors.us_killed
    );
    const iranDays = conflictDay('iran');
    const preview = `Day ${iranDays} \u2014 ${WAR_TIMELINE[0]?.text || 'US-Israeli operations continue across Iran.'}`;

    return (
      <div
        key="breaking-war-card"
        className="card"
        onClick={openBreakingModal}
        style={{ cursor: 'pointer', borderLeft: '3px solid #dc2626' }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '8px', fontWeight: 800, color: '#fff', background: '#dc2626',
              padding: '2px 6px', borderRadius: '3px', letterSpacing: '1px'
            }}>BREAKING</span>
            <span className="card-cat CONFLICT">CONFLICT</span>
          </div>
          <span className="card-time">{conflictTimeAgo('iran')}</span>
        </div>
        <div className="card-headline" style={{ fontWeight: 700, color: '#fca5a5' }}>
          US and Israel at War with Iran
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#fca5a5', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            IRAN: {iranKilled} killed
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#93c5fd', background: 'rgba(59,130,246,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            ISRAEL: {israelKilled} killed
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#93c5fd', background: 'rgba(59,130,246,0.2)', padding: '2px 6px', borderRadius: '3px' }}>
            US: {usKilled} killed
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', lineHeight: 1.5 }}>
          {preview}
        </div>
      </div>
    );
  };

  const renderEventsTab = () => {
    const nonBreaking = DAILY_EVENTS.filter(e => !e.breaking);
    const topEvents = DAILY_EVENTS.length > 0 ? getStableTopStories(nonBreaking) : [];
    const topIds = new Set(topEvents.map(e => e.id));
    const remaining = nonBreaking.filter(e => !topIds.has(e.id));
    const restEvents = remaining.slice(0, visibleCount);

    return (
      <>
        {/* Loading state */}
        {DAILY_EVENTS.length === 0 && (
          <div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', padding: '20px' }}>
            {DAILY_BRIEFING.length === 0 ? 'Loading events...' : 'Clustering articles into events...'}
          </div>
        )}

        {/* Top Stories — persistent war banners + dynamic RSS stories */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, transparent 100%)', borderLeft: '3px solid #ef4444', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', letterSpacing: '1px' }}>TOP STORIES</span>
          {DAILY_EVENTS.some(e => e.summaryLoading) && (
            <span style={{ fontSize: '8px', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', border: '1.5px solid #1f2937', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              AI summaries loading
            </span>
          )}
        </div>
        {renderBreakingCard()}
        {renderPakAfgCard()}
        {renderUkrRusCard()}
        {renderSudanCard()}
        {topEvents.map(event => renderEventCard(event, true))}

        {/* Latest Updates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(59,130,246,0.1)', borderLeft: '3px solid #3b82f6', margin: '14px 0 10px 0' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', letterSpacing: '1px' }}>LATEST UPDATES</span>
          <span style={{ fontSize: '9px', color: '#6b7280' }}>({DAILY_EVENTS.length} events from {DAILY_BRIEFING.length} articles)</span>
        </div>
        {restEvents.map(event => renderEventCard(event, false))}

        {visibleCount < remaining.length && (
          <button onClick={loadMore} style={{
            width: '100%', padding: '12px', marginTop: '10px', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', border: '1px solid #374151',
            borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', fontSize: '11px', fontWeight: 600
          }}>
            LOAD MORE ({remaining.length - visibleCount} remaining)
          </button>
        )}
      </>
    );
  };

  const renderBriefTab = () => {
    const html = renderNewsletter();
    // Past briefings use inline onclick="toggleBriefDropdown('id')" matching original.
    // Expose the toggle function globally so innerHTML onclick handlers can call it.
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const renderElectionsTab = () => {
    // All past elections sorted ascending (oldest first, newest last — closest to divider)
    const past = [...RECENT_ELECTIONS]
      .sort((a, b) => parseSortDate(a.date).localeCompare(parseSortDate(b.date)));
    // All upcoming (soonest first)
    const upcoming = [...ELECTIONS]
      .sort((a, b) => parseSortDate(a.date).localeCompare(parseSortDate(b.date)));

    // Place scroll ref before the last 2 past elections so they're visible by default
    const scrollIdx = Math.max(0, past.length - 2);

    return (
      <>
        {/* All past elections — user scrolls up to see older ones */}
        <div className="election-section-label" style={{ color: '#22c55e' }}>RECENT RESULTS</div>
        {past.map((e, i) => (
          <div key={'past-' + i}>
            {i === scrollIdx && <div ref={electionScrollRef} />}
            <div className="election-card" style={{ borderLeft: '3px solid #22c55e' }} onClick={() => setSelectedElection(e)}>
              <div className="election-header">
                <span className="election-flag"><CountryFlag flag={e.flag} /></span>
                <span className="election-country">{e.country}</span>
                <span className="election-date" style={{ color: '#22c55e' }}>{e.date}</span>
              </div>
              <div className="election-type">{e.type}</div>
              {e.winner && <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600, margin: '4px 0' }}>{e.winner}</div>}
              {e.result && <div className="election-stakes">{e.result}</div>}
            </div>
          </div>
        ))}

        {/* Divider */}
        <div className="election-now-divider"><span>UPCOMING</span></div>

        {/* All upcoming elections */}
        {upcoming.map((e, i) => (
          <div key={'upcoming-' + i} className="election-card" style={{ borderLeft: '3px solid #f97316' }} onClick={() => setSelectedElection(e)}>
            <div className="election-header">
              <span className="election-flag"><CountryFlag flag={e.flag} /></span>
              <span className="election-country">{e.country}</span>
              <span className="election-date">{e.date}</span>
            </div>
            <div className="election-type">{e.type}</div>
            {e.stakes && <div className="election-stakes">{e.stakes}</div>}
          </div>
        ))}
      </>
    );
  };

  const renderForecastTab = () => {
    const riskFg = { catastrophic: '#fca5a5', extreme: '#fcd34d', severe: '#fde047', stormy: '#c4b5fd', cloudy: '#93c5fd', clear: '#86efac' };
    const riskBg = { catastrophic: '#7f1d1d', extreme: '#78350f', severe: '#713f12', stormy: '#5b21b6', cloudy: '#1e3a5f', clear: '#14532d' };
    return (
      <>
        <div className="section-title">GEOPOLITICAL FORECASTS</div>
        {FORECASTS.map((f, i) => (
          <div key={i} className="forecast-card">
            <div className="forecast-header">
              <span className="forecast-region">{f.region}</span>
              <span className="forecast-risk" style={{
                background: riskBg[f.risk] || '#374151',
                color: riskFg[f.risk] || '#9ca3af'
              }}>
                {f.risk.toUpperCase()}
              </span>
            </div>
            <div className="forecast-current">{f.current}</div>
            <div className="forecast-prediction">
              <div className="forecast-prediction-title">FORECAST</div>
              <div className="forecast-prediction-text">{f.forecast}</div>
            </div>
            {f.indicators && (
              <div className="forecast-indicators">
                {f.indicators.map((ind, j) => (
                  <span key={j} className={`forecast-indicator ${ind.dir === 'up' ? 'up' : ind.dir === 'down' ? 'down' : 'stable'}`}>
                    {ind.dir === 'up' ? '\u2191' : ind.dir === 'down' ? '\u2193' : '\u2192'} {ind.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  const renderHorizonTab = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    // Past: ascending (oldest at top, newest closest to NOW divider)
    const past = HORIZON_EVENTS.filter(e => e.date < todayStr).sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = HORIZON_EVENTS.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));

    const renderEventCard = (e, isPastEvent) => {
      const d = new Date(e.date + 'T12:00:00');
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      const color = CAT_COLORS[e.category] || '#6b7280';

      let countdown = null;
      if (!isPastEvent) {
        const diffMs = new Date(e.date + 'T00:00:00') - new Date(todayStr + 'T00:00:00');
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) countdown = <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '8px' }}>TODAY</span>;
        else if (diffDays === 1) countdown = <span style={{ color: '#f59e0b', fontSize: '8px' }}>TOMORROW</span>;
        else if (diffDays <= 7) countdown = <span style={{ color: '#f59e0b', fontSize: '8px' }}>{diffDays} Days</span>;
        else if (diffDays <= 30) { const w = Math.ceil(diffDays / 7); countdown = <span style={{ color: '#6b7280', fontSize: '8px' }}>{w} Week{w === 1 ? '' : 's'}</span>; }
        else { const mo = Math.ceil(diffDays / 30); countdown = <span style={{ color: '#4b5563', fontSize: '8px' }}>{mo} Month{mo === 1 ? '' : 's'}</span>; }
      }

      return (
        <div key={e.date + e.name} className={`horizon-event-card${isPastEvent ? ' past' : ''}`}>
          <div className="horizon-date-badge">
            <div className="horizon-date-month" style={{ color }}>{month}</div>
            <div className="horizon-date-day">{day}</div>
            {countdown && <div style={{ marginTop: '2px' }}>{countdown}</div>}
          </div>
          <div className="horizon-event-content">
            <div className="horizon-event-name">{e.name}</div>
            <div className="horizon-event-location">{e.location}</div>
            {e.outcome && <div className="horizon-event-outcome">{e.outcome}</div>}
            {!e.outcome && e.description && <div className="horizon-event-desc">{e.description}</div>}
          </div>
        </div>
      );
    };

    // Group upcoming by month
    const groupedUpcoming = [];
    let currentMonth = '';
    upcoming.forEach(e => {
      const d = new Date(e.date + 'T12:00:00');
      const monthYear = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (monthYear !== currentMonth) {
        currentMonth = monthYear;
        groupedUpcoming.push({ type: 'header', label: monthYear.toUpperCase() });
      }
      groupedUpcoming.push({ type: 'event', event: e });
    });

    return (
      <>
        {/* Header */}
        <div style={{ padding: '8px 12px', background: 'linear-gradient(90deg,rgba(6,182,212,0.12) 0%,transparent 100%)', borderLeft: '3px solid #06b6d4', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#06b6d4', letterSpacing: '1px' }}>LOOKING AHEAD</div>
          <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>{HORIZON_EVENTS.length} events tracked ({past.length} past, {upcoming.length} upcoming)</div>
        </div>

        {/* Category legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 8px 10px', borderBottom: '1px solid #1f2937', marginBottom: '4px' }}>
          {Object.entries(CAT_COLORS).map(([cat, color]) => (
            <span key={cat} style={{ fontSize: '8px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          ))}
        </div>

        {/* Past events */}
        {past.length > 0 && (
          <>
            <div className="horizon-section-label" style={{ color: '#22c55e', padding: '6px 8px' }}>PAST EVENTS</div>
            {past.map(e => renderEventCard(e, true))}
          </>
        )}

        {/* NOW divider */}
        <div className="horizon-now-divider" ref={horizonNowRef}><span>NOW</span></div>

        {/* Upcoming events grouped by month */}
        {groupedUpcoming.map((item, i) => {
          if (item.type === 'header') {
            return (
              <div key={item.label} style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', letterSpacing: '1px', padding: '10px 8px 4px', borderTop: i > 0 ? '1px solid #1f2937' : 'none', marginTop: i > 0 ? '4px' : 0 }}>
                {item.label}
              </div>
            );
          }
          return renderEventCard(item.event, false);
        })}
      </>
    );
  };

  const renderStocksTab = () => {
    return <StocksTab onOpenStocksModal={onOpenStocksModal} stocksData={stocksData} stocksLastUpdated={stocksLastUpdated} stocksUpdating={stocksUpdating} />;
  };

  // ============================================================
  // Travel Tab
  // ============================================================

  const resolveTravelSearch = useCallback((query) => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    const matches = new Map();

    // Search CITY_RISKS for city matches (higher priority)
    for (const entry of CITY_RISKS) {
      const cityLower = entry.city.toLowerCase();
      if (cityLower.includes(q) && COUNTRIES[entry.country]) {
        const score = cityLower === q ? 12 : (cityLower.startsWith(q) ? 8 : 2);
        const existing = matches.get(entry.country);
        if (!existing || score > existing.score) {
          matches.set(entry.country, { score, matchedCity: entry.city, cityRisk: entry.risk });
        }
      }
    }

    // Search reverse index for country/demonym matches
    for (const [term, country] of Object.entries(REVERSE_CITY_INDEX)) {
      if (term.includes(q) && COUNTRIES[country]) {
        const score = term === q ? 10 : (term.startsWith(q) ? 5 : 1);
        const existing = matches.get(country);
        if (!existing || score > existing.score) {
          matches.set(country, { score, matchedCity: null, cityRisk: null, matchedTerm: term !== country.toLowerCase() ? term : null });
        }
      }
    }

    // Search by region (e.g., "Middle East", "Africa", "South Asia")
    for (const [name, cd] of Object.entries(COUNTRIES)) {
      if (cd.region && cd.region.toLowerCase().includes(q)) {
        const regionLower = cd.region.toLowerCase();
        const score = regionLower === q ? 6 : (regionLower.startsWith(q) ? 3 : 1);
        const existing = matches.get(name);
        if (!existing || score > existing.score) {
          matches.set(name, { score, matchedCity: null, cityRisk: null, matchedTerm: cd.region });
        }
      }
    }

    return [...matches.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 8)
      .map(([country, data]) => ({
        country,
        matchedCity: data.matchedCity || null,
        cityRisk: data.cityRisk || null,
        matchedTerm: data.matchedCity || (data.matchedTerm ? data.matchedTerm.charAt(0).toUpperCase() + data.matchedTerm.slice(1) : null),
      }));
  }, []);

  const getCountryAlerts = useCallback((countryName) => {
    if (!countryName) return [];
    const terms = COUNTRY_DEMONYMS[countryName] || [];
    const allTerms = [countryName.toLowerCase(), ...terms.map(t => t.toLowerCase())];
    const alerts = [];

    for (const article of DAILY_BRIEFING) {
      if (alerts.length >= 8) break;
      const hl = (article.headline || article.title || '').toLowerCase();
      if (allTerms.some(t => hl.includes(t))) {
        alerts.push({
          headline: article.headline || article.title,
          source: article.source,
          time: article.pubDate,
        });
      }
    }
    return alerts;
  }, []);

  // Count threat-related articles for a city/country to detect risk spikes
  const getArticleCount = useCallback((searchTerm) => {
    if (!searchTerm) return 0;
    const term = searchTerm.toLowerCase();
    let count = 0;
    for (const article of DAILY_BRIEFING) {
      const hl = (article.headline || article.title || '').toLowerCase();
      if (hl.includes(term)) count++;
    }
    return count;
  }, []);

  const getTravelElections = useCallback((countryName, startDate, endDate) => {
    if (!countryName || !startDate || !endDate) return [];
    return ELECTIONS.filter(e => {
      if (e.country !== countryName) return false;
      const elDate = e.date;
      const monthMap = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
      const parts = elDate.split(' ');
      if (parts.length >= 2) {
        const monthKey = parts[0].replace(/[^A-Za-z]/g, '').substring(0, 3);
        const year = parts[parts.length - 1];
        const approxDate = `${year}-${monthMap[monthKey] || '01'}-15`;
        return approxDate >= startDate && approxDate <= endDate;
      }
      return false;
    });
  }, []);

  // Seasonal risk zones — returns array of risk alerts based on country+dates
  const getSeasonalRisks = useCallback((countryName, startDate, endDate) => {
    if (!countryName || !startDate) return [];
    const start = new Date(startDate + 'T12:00:00');
    const end = endDate ? new Date(endDate + 'T12:00:00') : start;
    const startMonth = start.getMonth(); // 0-11
    const endMonth = end.getMonth();
    const months = [];
    for (let m = startMonth; m <= endMonth + (end.getFullYear() > start.getFullYear() ? 12 : 0); m++) {
      months.push(m % 12);
    }
    const countryRegion = COUNTRIES[countryName]?.region;
    const risks = [];

    // Hurricane season (Jun-Nov) — Caribbean, Central America, Gulf
    const hurricaneCountries = ['Haiti', 'Cuba', 'Jamaica', 'Dominican Republic', 'Puerto Rico', 'Bahamas', 'Trinidad and Tobago', 'Honduras', 'Guatemala', 'Nicaragua', 'Belize', 'Mexico', 'United States'];
    if (hurricaneCountries.includes(countryName) || countryRegion === 'Caribbean') {
      if (months.some(m => m >= 5 && m <= 10)) {
        risks.push({ type: 'hurricane', icon: '\u{1F300}', label: 'Hurricane Season', detail: 'Your travel dates fall within Atlantic hurricane season (Jun\u2013Nov). Monitor weather forecasts, have evacuation plans ready, and consider travel insurance that covers weather disruptions.' });
      }
    }

    // Monsoon season (Jun-Sep) — South Asia
    const monsoonCountries = ['India', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Myanmar', 'Pakistan'];
    if (monsoonCountries.includes(countryName)) {
      if (months.some(m => m >= 5 && m <= 8)) {
        risks.push({ type: 'monsoon', icon: '\u{1F327}', label: 'Monsoon Season', detail: 'Heavy monsoon rains expected. Flooding, landslides, and transport disruptions are common. Roads may be impassable, flights delayed. Pack waterproof gear and build flexibility into your itinerary.' });
      }
    }

    // Wildfire season (Jun-Oct) — Western US, Mediterranean, Australia
    const wildfireCountries = ['Greece', 'Turkey', 'Spain', 'Portugal', 'Italy', 'Croatia', 'United States', 'Canada', 'Australia'];
    if (wildfireCountries.includes(countryName)) {
      const wildfireMonths = countryName === 'Australia' ? [10, 11, 0, 1, 2] : [5, 6, 7, 8, 9];
      if (months.some(m => wildfireMonths.includes(m))) {
        risks.push({ type: 'wildfire', icon: '\u{1F525}', label: 'Wildfire Season', detail: 'Elevated wildfire risk during your travel dates. Air quality may deteriorate significantly. Check local fire advisories and have alternative routes planned. Avoid hiking in restricted areas.' });
      }
    }

    // Extreme heat (Jun-Aug) — Middle East, South Asia
    const heatCountries = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Iraq', 'Iran', 'Jordan', 'Egypt', 'India', 'Pakistan'];
    if (heatCountries.includes(countryName)) {
      if (months.some(m => m >= 5 && m <= 7)) {
        risks.push({ type: 'heat', icon: '\u{1F321}', label: 'Extreme Heat Warning', detail: 'Temperatures regularly exceed 45\u00B0C (113\u00B0F) during this period. Limit outdoor exposure, stay hydrated, and avoid midday activities. Heat stroke is a serious risk for travelers.' });
      }
    }

    // Cyclone season (Nov-Apr) — South Pacific, Indian Ocean
    const cycloneCountries = ['Fiji', 'Vanuatu', 'Tonga', 'Samoa', 'Madagascar', 'Mozambique', 'Mauritius', 'Philippines', 'Vietnam'];
    if (cycloneCountries.includes(countryName)) {
      if (months.some(m => m >= 10 || m <= 3)) {
        risks.push({ type: 'cyclone', icon: '\u{1F32A}', label: 'Cyclone Season', detail: 'Your dates overlap with cyclone season. Tropical storms can develop rapidly with limited warning. Ensure your accommodation is storm-rated and flights may be cancelled on short notice.' });
      }
    }

    // Ramadan — 2026: Feb 18 - Mar 19 (approximate)
    const muslimCountries = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Iran', 'Iraq', 'Jordan', 'Egypt', 'Turkey', 'Morocco', 'Tunisia', 'Algeria', 'Libya', 'Indonesia', 'Malaysia', 'Pakistan', 'Bangladesh', 'Afghanistan', 'Yemen', 'Syria', 'Lebanon', 'Palestine', 'Sudan', 'Somalia', 'Senegal', 'Mali', 'Niger'];
    if (muslimCountries.includes(countryName)) {
      const ramadanStart = new Date('2026-02-18');
      const ramadanEnd = new Date('2026-03-19');
      if (start <= ramadanEnd && end >= ramadanStart) {
        risks.push({ type: 'ramadan', icon: '\u{1F319}', label: 'Ramadan in Effect', detail: 'Ramadan falls during your travel dates. Many restaurants closed during daylight hours, shorter business hours, and limited alcohol availability. Dress modestly and avoid eating/drinking in public during fasting hours as a sign of respect.' });
      }
    }

    return risks;
  }, []);

  const renderTravelTab = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const countryData = travelCountry ? COUNTRIES[travelCountry] : null;
    const safetyInfo = travelCountry ? getTravelSafety(travelCountry) : null;
    const travelInfo = travelCountry ? TRAVEL_INFO[travelCountry] : null;
    const regionalThreats = travelCountry ? REGIONAL_THREATS[travelCountry] : null;

    // Get alerts for selected country
    const alerts = travelCountry ? getCountryAlerts(travelCountry) : [];

    // Get elections during trip
    const tripElections = getTravelElections(travelCountry, travelStartDate, travelEndDate);

    // Get seasonal risks based on dates
    const seasonalRisks = getSeasonalRisks(travelCountry, travelStartDate, travelEndDate);

    // Format date range for display
    const formatDateRange = () => {
      if (!travelStartDate) return null;
      const s = new Date(travelStartDate + 'T12:00:00');
      const sStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!travelEndDate) return sStr;
      const e = new Date(travelEndDate + 'T12:00:00');
      const eStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${sStr}\u2013${eStr}`;
    };
    const dateRange = formatDateRange();

    // Region map for forecast matching
    const regionMap = {
      'Middle East': 'Middle East', 'Eastern Europe': 'Eastern Europe',
      'Southeast Asia': 'East Asia', 'East Asia': 'East Asia',
      'Central Asia': 'East Asia', 'Africa': 'Sahel Africa',
      'Caribbean': 'Global Economy', 'South America': 'Global Economy',
      'South Asia': 'East Asia', 'Western Europe': 'Global Economy',
      'North America': 'Global Economy', 'Oceania': 'Global Economy',
    };

    // Build forecast text — truncates at sentence boundary, references dates
    const buildForecastText = (forecastRaw) => {
      if (!forecastRaw) return null;
      // Take first 2 sentences
      const sentences = forecastRaw.match(/[^.!?]+[.!?]+/g) || [forecastRaw];
      const text = sentences.slice(0, 2).join(' ').trim();
      return text;
    };

    // Default view: dynamic hotspots — reorder based on DAILY_BRIEFING activity
    const getHotspotSections = () => {
      const danger = [];
      const seen = new Set();
      for (const [name, threats] of Object.entries(REGIONAL_THREATS)) {
        const data = COUNTRIES[name];
        if (!data) continue;
        for (const t of threats) {
          if (t.level < 4) continue;
          const key = `${name}:${t.region}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const meta = LEVEL_META[t.level] || LEVEL_META[4];
          // Dynamic: count recent articles mentioning this region
          const articleCount = getArticleCount(t.region.split(' ')[0]);
          danger.push({ country: name, region: t.region, threat: t.threat, level: t.level, color: meta.color, flag: data.flag, articleCount });
        }
      }
      // Sort by level (5 first, then 4), then by article count within same level
      danger.sort((a, b) => b.level - a.level || b.articleCount - a.articleCount);

      // Popular Destinations — with dynamic risk bumps from DAILY_BRIEFING
      const popular = POPULAR_DESTINATIONS.map((d) => {
        const data = COUNTRIES[d.country];
        const articleCount = getArticleCount(d.city);
        // Bump risk if 3+ articles mention this city (temporary elevated risk)
        const dynamicLevel = articleCount >= 5 ? Math.min(d.level + 2, 5) : articleCount >= 3 ? Math.min(d.level + 1, 5) : d.level;
        const meta = LEVEL_META[dynamicLevel] || LEVEL_META[1];
        return {
          country: d.country, region: d.city, threat: d.risk,
          level: dynamicLevel, baseLevel: d.level, color: meta.color,
          flag: data ? data.flag : '', articleCount,
          elevated: dynamicLevel > d.level,
        };
      });
      // Elevated destinations first, then by level desc, then alpha
      popular.sort((a, b) => {
        if (a.elevated !== b.elevated) return a.elevated ? -1 : 1;
        return b.level - a.level || a.region.localeCompare(b.region);
      });

      return { danger, popular };
    };

    const levelColor = (lvl) => {
      if (lvl >= 5) return { bg: '#450a0a', text: '#fca5a5' };
      if (lvl === 4) return { bg: '#451a03', text: '#fbbf24' };
      if (lvl === 3) return { bg: '#78350f', text: '#fdba74' };
      if (lvl === 2) return { bg: '#713f12', text: '#fcd34d' };
      return { bg: '#14532d', text: '#86efac' };
    };

    // Shared detail renderer for both city and country views
    const renderDetailView = (displayName, displayLevel, displayMeta, isCity) => {
      const lc = levelColor(displayLevel);
      const cr = isCity ? CITY_RISKS.find(c => c.city === travelCity && c.country === travelCountry) : null;
      const rt = isCity ? regionalThreats?.find(r => r.region === travelCity || travelCity.includes(r.region) || r.region.includes(travelCity)) : null;
      const forecastRegion = regionMap[countryData.region] || 'Global Economy';
      const regionForecast = FORECASTS.find(f => f.region === forecastRegion);
      const forecastText = buildForecastText(regionForecast?.forecast);

      // Dynamic risk bump from article activity
      const articleCount = getArticleCount(displayName);
      const isElevated = articleCount >= 3 && displayLevel < 5;

      // Deduplicate threat text
      const threatTexts = [];
      if (cr?.risk) threatTexts.push(cr.risk);
      if (rt?.threat && rt.threat !== cr?.risk) threatTexts.push(rt.threat);

      return (
        <>
          {/* Header card */}
          <div style={{
            margin: '0 8px 10px', padding: '10px 12px', borderRadius: '8px',
            background: `linear-gradient(135deg, ${displayMeta.color}15 0%, #111827 100%)`,
            border: `1px solid ${displayMeta.color}40`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CountryFlag flag={countryData.flag} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb' }}>{displayName}</div>
                <div style={{ fontSize: '8px', color: '#6b7280' }}>{isCity ? `${travelCountry} \u00B7 ${countryData.region}` : countryData.region}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: displayMeta.color }}>{displayLevel}</div>
                <div style={{ fontSize: '7px', color: displayMeta.color, fontWeight: 600 }}>/ 5</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                fontSize: '9px', fontWeight: 700, color: displayMeta.color, flex: 1,
                padding: '4px 8px', background: `${displayMeta.color}20`,
                borderRadius: '4px', textAlign: 'center', letterSpacing: '0.5px',
              }}>
                {displayMeta.label.toUpperCase()}
              </div>
              {isElevated && (
                <div style={{
                  fontSize: '7px', fontWeight: 700, color: '#fbbf24',
                  padding: '4px 6px', background: 'rgba(251,191,36,0.15)',
                  borderRadius: '4px', whiteSpace: 'nowrap', animation: 'pulse 2s infinite',
                }}>
                  ELEVATED
                </div>
              )}
            </div>
            <div style={{ height: '3px', borderRadius: '2px', marginTop: '6px', background: '#1f2937', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${displayLevel * 20}%`, background: displayMeta.color, borderRadius: '2px' }} />
            </div>
          </div>

          {/* Election warning — prominent banner if dates overlap */}
          {tripElections.length > 0 && (
            <div style={{
              margin: '0 8px 10px', padding: '10px 12px', borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.05) 100%)',
              border: '1px solid rgba(251,191,36,0.3)', borderLeft: '3px solid #fbbf24',
            }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.5px', marginBottom: '4px' }}>ELECTION DURING YOUR TRIP</div>
              {tripElections.map((el, i) => (
                <div key={i}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#e5e7eb' }}>{el.type} — {el.date}</div>
                  <div style={{ fontSize: '8px', color: '#fcd34d', marginTop: '4px', lineHeight: 1.5 }}>
                    Expect increased security presence, potential protests and demonstrations, possible road closures, and intermittent internet disruptions. Avoid political gatherings and have backup plans for transport.
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Seasonal risk alerts — date-dependent */}
          {seasonalRisks.length > 0 && (
            <div style={{ margin: '0 8px 10px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.5px', marginBottom: '6px' }}>SEASONAL ALERTS</div>
              {seasonalRisks.map((sr, i) => (
                <div key={i} style={{
                  padding: '8px 10px', marginBottom: '4px', borderRadius: '6px',
                  background: sr.type === 'ramadan' ? 'rgba(139,92,246,0.08)' : 'rgba(245,158,11,0.08)',
                  borderLeft: `3px solid ${sr.type === 'ramadan' ? '#8b5cf6' : '#f59e0b'}`,
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: sr.type === 'ramadan' ? '#c4b5fd' : '#fcd34d', marginBottom: '3px' }}>
                    {sr.icon} {sr.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '9px', color: '#d1d5db', lineHeight: 1.5 }}>{sr.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* Threat assessment — city view only, with deduplication */}
          {isCity && threatTexts.length > 0 && (
            <div style={{ margin: '0 8px 10px', padding: '10px 12px', borderRadius: '6px', background: lc.bg, borderLeft: `3px solid ${lc.text}` }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: lc.text, letterSpacing: '0.5px', marginBottom: '6px' }}>
                {displayLevel <= 2 ? 'TRAVEL NOTES' : 'THREAT ASSESSMENT'}
              </div>
              {threatTexts.map((text, i) => (
                <div key={i} style={{ fontSize: '9px', color: '#d1d5db', lineHeight: 1.6, marginBottom: i < threatTexts.length - 1 ? '6px' : 0 }}>{text}</div>
              ))}
              {displayLevel >= 4 && (
                <div style={{ fontSize: '8px', color: '#fca5a5', marginTop: '6px', padding: '4px 6px', background: 'rgba(127,29,29,0.3)', borderRadius: '3px', lineHeight: 1.5 }}>
                  Consular assistance may be severely limited. Consider postponing non-essential travel. Emergency evacuation capacity is constrained.
                </div>
              )}
              {displayLevel === 3 && (
                <div style={{ fontSize: '8px', color: '#fdba74', marginTop: '6px', padding: '4px 6px', background: 'rgba(120,53,15,0.3)', borderRadius: '3px', lineHeight: 1.5 }}>
                  Exercise heightened situational awareness. Avoid demonstrations and unofficial transport. Register with your embassy before arrival.
                </div>
              )}
              {displayLevel <= 2 && (
                <div style={{ fontSize: '8px', color: '#86efac', marginTop: '6px', padding: '4px 6px', background: 'rgba(20,83,45,0.3)', borderRadius: '3px', lineHeight: 1.5 }}>
                  {displayLevel === 1
                    ? 'Generally very safe for tourists. Standard travel precautions apply \u2014 keep valuables secure and stay aware of your surroundings.'
                    : 'Safe with normal precautions. Be aware of petty crime in crowded tourist areas. Use registered taxis and keep copies of your documents.'}
                </div>
              )}
            </div>
          )}

          {/* WHAT'S EXPECTED — date-aware intelligence forecast */}
          {regionForecast && (
            <div style={{ margin: '0 8px 10px', padding: '10px 12px', borderRadius: '6px', background: '#0a0a0f', borderLeft: '3px solid #f97316' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#f97316', letterSpacing: '0.5px', marginBottom: '6px' }}>
                WHAT&apos;S EXPECTED {dateRange ? `\u2014 ${dateRange}` : ''}
              </div>
              {dateRange && (
                <div style={{ fontSize: '8px', color: '#9ca3af', marginBottom: '4px', fontStyle: 'italic' }}>
                  {displayLevel <= 2
                    ? `During your ${dateRange} visit, conditions are expected to remain stable. ${seasonalRisks.length > 0 ? 'See seasonal alerts above for date-specific considerations.' : 'No major disruptions anticipated.'}`
                    : displayLevel === 3
                      ? `During your ${dateRange} travel, exercise increased caution. Conditions may shift quickly. ${tripElections.length > 0 ? 'Political activity around elections could cause disruptions.' : 'Monitor local news daily.'}`
                      : `Your ${dateRange} travel dates fall within an active risk period. Reassess plans regularly. ${tripElections.length > 0 ? 'Election-related unrest may compound existing risks.' : 'Conditions are volatile and may deteriorate.'}`
                  }
                </div>
              )}
              <div style={{ fontSize: '9px', color: '#d1d5db', lineHeight: 1.6 }}>
                {forecastText}
              </div>
              {regionForecast.indicators && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {regionForecast.indicators.map((ind, i) => (
                    <span key={i} style={{
                      fontSize: '7px', padding: '2px 5px', borderRadius: '3px', fontWeight: 600,
                      background: ind.dir === 'up' ? '#7f1d1d33' : ind.dir === 'down' ? '#14532d33' : '#1e3a5f33',
                      color: ind.dir === 'up' ? '#fca5a5' : ind.dir === 'down' ? '#86efac' : '#93c5fd',
                    }}>
                      {ind.dir === 'up' ? '\u2191' : ind.dir === 'down' ? '\u2193' : '\u2194'} {ind.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Live alerts — filtered for city if applicable */}
          {(() => {
            const displayAlerts = isCity
              ? alerts.filter(a => a.headline && a.headline.toLowerCase().includes(travelCity.toLowerCase()))
              : alerts;
            return displayAlerts.length > 0 ? (
              <div style={{ margin: '0 8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444', letterSpacing: '0.5px' }}>
                    LIVE ALERTS{isCity ? ` \u2014 ${travelCity.toUpperCase()}` : ''}
                  </div>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                </div>
                {displayAlerts.slice(0, 5).map((a, i) => (
                  <div key={i} style={{
                    padding: '6px 8px', marginBottom: '4px', borderRadius: '4px',
                    background: '#111827', borderLeft: '2px solid #ef4444', fontSize: '9px',
                  }}>
                    <div style={{ color: '#d1d5db', lineHeight: 1.4 }}>{a.headline}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                      <span style={{ fontSize: '7px', color: '#6b7280' }}>{a.source}</span>
                      {a.time && <span style={{ fontSize: '7px', color: '#6b7280' }}>{timeAgo(a.time)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : null;
          })()}
        </>
      );
    };

    return (
      <>
        {/* Header banner */}
        <div style={{ padding: '8px 12px', background: 'linear-gradient(90deg,rgba(234,179,8,0.12) 0%,transparent 100%)', borderLeft: '3px solid #eab308', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#eab308', letterSpacing: '1px' }}>TRAVEL ADVISORY</div>
          <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>Powered by live intelligence feeds</div>
        </div>

        {/* Search bar */}
        <div style={{ padding: '0 8px 8px', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search country, region, or city..."
              value={travelSearch}
              onChange={(e) => {
                const val = e.target.value;
                setTravelSearch(val);
                if (!val) {
                  setTravelCountry(null);
                  setTravelCity(null);
                  setTravelSuggestions([]);
                } else {
                  setTravelSuggestions(resolveTravelSearch(val));
                }
              }}
              style={{
                width: '100%', padding: '7px 28px 7px 10px', fontSize: '10px',
                background: '#111827', border: '1px solid #374151', borderRadius: '6px',
                color: '#e5e7eb', outline: 'none',
              }}
            />
            {travelCountry && (
              <button
                onClick={() => {
                  setTravelCountry(null);
                  setTravelCity(null);
                  setTravelSearch('');
                  setTravelSuggestions([]);
                }}
                style={{
                  position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                  background: '#4b5563', border: 'none', borderRadius: '50%',
                  width: '20px', height: '20px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#e5e7eb', fontSize: '12px', fontWeight: 700, lineHeight: 1,
                  padding: 0,
                }}
                title="Clear selection"
              >
                &times;
              </button>
            )}
          </div>
          {/* Autocomplete dropdown */}
          {travelSuggestions.length > 0 && travelSearch.length >= 2 && !travelCountry && (
            <div style={{
              position: 'absolute', top: '100%', left: '8px', right: '8px',
              background: '#1f2937', border: '1px solid #374151', borderRadius: '6px',
              zIndex: 20, maxHeight: '200px', overflowY: 'auto',
            }}>
              {travelSuggestions.map(({ country, matchedCity, cityRisk, matchedTerm }) => {
                const cd = COUNTRIES[country];
                const sr = getTravelSafety(country);
                return (
                  <div
                    key={matchedCity ? `${country}-${matchedCity}` : country}
                    onClick={() => {
                      setTravelCountry(country);
                      setTravelCity(matchedCity || null);
                      setTravelSearch(matchedCity ? `${matchedCity}, ${country}` : country);
                      setTravelSuggestions([]);
                    }}
                    style={{
                      padding: '6px 10px', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', gap: '8px', fontSize: '10px',
                      borderBottom: '1px solid #111827',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#374151'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <CountryFlag flag={cd?.flag} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#e5e7eb' }}>
                        {matchedTerm ? <><span style={{ color: '#06b6d4' }}>{matchedTerm}</span>, {country}</> : country}
                      </div>
                      {cityRisk && <div style={{ fontSize: '8px', color: '#9ca3af', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cityRisk}</div>}
                    </div>
                    {sr && (
                      <span style={{
                        fontSize: '7px', fontWeight: 700, color: sr.color,
                        background: 'rgba(0,0,0,0.3)', padding: '2px 5px',
                        borderRadius: '3px', whiteSpace: 'nowrap',
                      }}>
                        LVL {sr.level}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Date pickers */}
        <div style={{ display: 'flex', gap: '6px', padding: '0 8px 10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '7px', color: '#6b7280', marginBottom: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Departure</div>
            <input
              type="date"
              value={travelStartDate}
              min={todayStr}
              max={maxDateStr}
              onChange={(e) => setTravelStartDate(e.target.value)}
              style={{
                width: '100%', padding: '5px 6px', fontSize: '9px',
                background: '#111827', border: '1px solid #374151', borderRadius: '4px',
                color: '#e5e7eb', colorScheme: 'dark',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '7px', color: '#6b7280', marginBottom: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Return</div>
            <input
              type="date"
              value={travelEndDate}
              min={travelStartDate || todayStr}
              max={maxDateStr}
              onChange={(e) => setTravelEndDate(e.target.value)}
              style={{
                width: '100%', padding: '5px 6px', fontSize: '9px',
                background: '#111827', border: '1px solid #374151', borderRadius: '4px',
                color: '#e5e7eb', colorScheme: 'dark',
              }}
            />
          </div>
        </div>

        {/* Results or default view */}
        {travelCountry && countryData ? (
          <>
            {/* Back button */}
            <div
              onClick={() => { setTravelCountry(null); setTravelCity(null); setTravelSearch(''); }}
              style={{
                margin: '0 8px 6px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                background: '#1f2937', display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '8px', color: '#9ca3af', fontWeight: 600,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#e5e7eb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}
            >
              \u2190 Back to alerts
            </div>

            {/* === CITY/REGION VIEW === */}
            {travelCity && (() => {
              const rt = regionalThreats?.find(r => r.region === travelCity || travelCity.includes(r.region) || r.region.includes(travelCity));
              const cityLevel = rt ? rt.level : safetyInfo.level;
              const cityMeta = LEVEL_META[cityLevel] || LEVEL_META[1];

              return (
                <>
                  {renderDetailView(travelCity, cityLevel, cityMeta, true)}

                  {/* === COUNTRY SECTION — always visible === */}
                  <div style={{ margin: '10px 8px 8px', borderTop: '1px solid #1f2937', paddingTop: '10px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: '#4b5563', letterSpacing: '1px', marginBottom: '8px' }}>COUNTRY OVERVIEW \u2014 {travelCountry.toUpperCase()}</div>
                  </div>

                  {/* Country safety card */}
                  <div
                    onClick={() => handleCountryClick(travelCountry)}
                    style={{
                      margin: '0 8px 10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                      background: `linear-gradient(135deg, ${safetyInfo.color}10 0%, #0d0d12 100%)`,
                      border: `1px solid ${safetyInfo.color}30`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#e5e7eb' }}>{travelCountry}</div>
                        <div style={{ fontSize: '8px', color: '#6b7280' }}>{countryData.region}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: safetyInfo.color }}>{safetyInfo.level}</span>
                        <span style={{ fontSize: '7px', color: safetyInfo.color, fontWeight: 600 }}>/5</span>
                      </div>
                      <span style={{
                        fontSize: '7px', fontWeight: 700, color: safetyInfo.color,
                        padding: '2px 6px', background: `${safetyInfo.color}20`,
                        borderRadius: '3px', whiteSpace: 'nowrap',
                      }}>
                        {safetyInfo.label.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Entry requirements / visa */}
                  {travelInfo?.visa && (
                    <div style={{ margin: '0 8px 10px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.5px', marginBottom: '6px' }}>ENTRY REQUIREMENTS</div>
                      <div style={{ padding: '8px', background: '#111827', borderRadius: '6px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#c4b5fd', marginBottom: '3px' }}>{travelInfo.visa.type}</div>
                        <div style={{ fontSize: '9px', color: '#9ca3af', lineHeight: 1.5 }}>{travelInfo.visa.details}</div>
                      </div>
                    </div>
                  )}

                  {/* Health advisories */}
                  {travelInfo?.health && travelInfo.health.length > 0 && (
                    <div style={{ margin: '0 8px 10px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.5px', marginBottom: '6px' }}>HEALTH ADVISORIES</div>
                      {travelInfo.health.map((h, i) => {
                        const sc = levelColor(h.severity === 'high' ? 4 : h.severity === 'medium' ? 3 : 1);
                        return (
                          <div key={i} style={{
                            padding: '5px 8px', marginBottom: '3px', borderRadius: '4px',
                            background: sc.bg, fontSize: '9px', color: sc.text, lineHeight: 1.4,
                          }}>
                            {h.alert}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Other regions in this country */}
                  {regionalThreats && regionalThreats.length > 0 && (() => {
                    const otherRegions = regionalThreats.filter(r => r.region !== travelCity && !travelCity.includes(r.region));
                    return otherRegions.length > 0 ? (
                      <div style={{ margin: '0 8px 10px' }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#f97316', letterSpacing: '0.5px', marginBottom: '6px' }}>OTHER REGIONS</div>
                        {otherRegions.map((rItem, i) => {
                          const sc = levelColor(rItem.level);
                          return (
                            <div key={i} style={{
                              padding: '6px 8px', marginBottom: '3px', borderRadius: '4px',
                              background: sc.bg, borderLeft: `2px solid ${sc.text}`, fontSize: '9px',
                              display: 'flex', alignItems: 'flex-start', gap: '8px',
                            }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: '#e5e7eb', marginBottom: '2px' }}>{rItem.region}</div>
                                <div style={{ color: '#d1d5db', lineHeight: 1.4 }}>{rItem.threat}</div>
                              </div>
                              <span style={{
                                fontSize: '7px', fontWeight: 700, color: sc.text,
                                background: 'rgba(0,0,0,0.3)', padding: '2px 5px',
                                borderRadius: '3px', whiteSpace: 'nowrap', flexShrink: 0,
                              }}>
                                LVL {rItem.level}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : null;
                  })()}

                  {/* Local tips */}
                  {travelInfo?.tips && (
                    <div style={{ margin: '0 8px 10px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#22c55e', letterSpacing: '0.5px', marginBottom: '6px' }}>LOCAL TIPS</div>
                      <div style={{ padding: '8px', background: '#111827', borderRadius: '6px' }}>
                        {[
                          { label: 'Currency', value: travelInfo.tips.currency },
                          { label: 'Emergency', value: travelInfo.tips.emergency },
                          { label: 'Cultural', value: travelInfo.tips.cultural },
                          { label: 'Transport', value: travelInfo.tips.transport },
                        ].map((tip, i) => (
                          <div key={i} style={{ marginBottom: i < 3 ? '6px' : 0 }}>
                            <div style={{ fontSize: '7px', color: '#22c55e', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '1px' }}>{tip.label}</div>
                            <div style={{ fontSize: '9px', color: '#d1d5db', lineHeight: 1.4 }}>{tip.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* === NO CITY — country view directly === */}
            {!travelCity && renderDetailView(travelCountry, safetyInfo.level, { color: safetyInfo.color, label: safetyInfo.label }, false)}

            {/* Country-only sections when no city selected */}
            {!travelCity && (
              <>
                {/* Regional breakdown */}
                {regionalThreats && regionalThreats.length > 0 && (
                  <div style={{ margin: '0 8px 10px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#f97316', letterSpacing: '0.5px', marginBottom: '6px' }}>REGIONAL BREAKDOWN</div>
                    {regionalThreats.map((rtItem, i) => {
                      const sc = levelColor(rtItem.level);
                      return (
                        <div key={i} style={{
                          padding: '6px 8px', marginBottom: '3px', borderRadius: '4px',
                          background: sc.bg, borderLeft: `2px solid ${sc.text}`, fontSize: '9px',
                          display: 'flex', alignItems: 'flex-start', gap: '8px',
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: '#e5e7eb', marginBottom: '2px' }}>{rtItem.region}</div>
                            <div style={{ color: '#d1d5db', lineHeight: 1.4 }}>{rtItem.threat}</div>
                          </div>
                          <span style={{
                            fontSize: '7px', fontWeight: 700, color: sc.text,
                            background: 'rgba(0,0,0,0.3)', padding: '2px 5px',
                            borderRadius: '3px', whiteSpace: 'nowrap', flexShrink: 0,
                          }}>
                            LVL {rtItem.level}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Health */}
                {travelInfo?.health && travelInfo.health.length > 0 && (
                  <div style={{ margin: '0 8px 10px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.5px', marginBottom: '6px' }}>HEALTH ADVISORIES</div>
                    {travelInfo.health.map((h, i) => {
                      const sc = levelColor(h.severity === 'high' ? 4 : h.severity === 'medium' ? 3 : 1);
                      return (
                        <div key={i} style={{
                          padding: '5px 8px', marginBottom: '3px', borderRadius: '4px',
                          background: sc.bg, fontSize: '9px', color: sc.text, lineHeight: 1.4,
                        }}>
                          {h.alert}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Visa */}
                {travelInfo?.visa && (
                  <div style={{ margin: '0 8px 10px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.5px', marginBottom: '6px' }}>ENTRY REQUIREMENTS</div>
                    <div style={{ padding: '8px', background: '#111827', borderRadius: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#c4b5fd', marginBottom: '3px' }}>{travelInfo.visa.type}</div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', lineHeight: 1.5 }}>{travelInfo.visa.details}</div>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {travelInfo?.tips && (
                  <div style={{ margin: '0 8px 10px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#22c55e', letterSpacing: '0.5px', marginBottom: '6px' }}>LOCAL TIPS</div>
                    <div style={{ padding: '8px', background: '#111827', borderRadius: '6px' }}>
                      {[
                        { label: 'Currency', value: travelInfo.tips.currency },
                        { label: 'Emergency', value: travelInfo.tips.emergency },
                        { label: 'Cultural', value: travelInfo.tips.cultural },
                        { label: 'Transport', value: travelInfo.tips.transport },
                      ].map((tip, i) => (
                        <div key={i} style={{ marginBottom: i < 3 ? '6px' : 0 }}>
                          <div style={{ fontSize: '7px', color: '#22c55e', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '1px' }}>{tip.label}</div>
                          <div style={{ fontSize: '9px', color: '#d1d5db', lineHeight: 1.4 }}>{tip.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Timestamp */}
            <div style={{ margin: '4px 8px 10px', fontSize: '7px', color: '#4b5563', textAlign: 'center' }}>
              Last updated: {newsTimestamp || 'Loading...'}
            </div>
          </>
        ) : (
          /* Default view — Danger Zones + Popular Destinations (dynamic) */
          <div style={{ padding: '0 8px' }}>
            {(() => {
              const { danger, popular } = getHotspotSections();
              const renderCard = (h, i) => {
                const lc = levelColor(h.level);
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setTravelCountry(h.country);
                      setTravelCity(h.region);
                      setTravelSearch(`${h.region}, ${h.country}`);
                      setTravelSuggestions([]);
                    }}
                    style={{
                      padding: '7px 10px', marginBottom: '3px', borderRadius: '6px', cursor: 'pointer',
                      background: lc.bg, borderLeft: `3px solid ${lc.text}`,
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <span style={{ fontSize: '13px' }}>{h.flag}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#e5e7eb' }}>{h.region}</span>
                        {h.elevated && (
                          <span style={{ fontSize: '6px', fontWeight: 700, color: '#fbbf24', padding: '1px 3px', background: 'rgba(251,191,36,0.2)', borderRadius: '2px' }}>ELEVATED</span>
                        )}
                      </div>
                      <div style={{ fontSize: '8px', color: '#d1d5db', lineHeight: 1.3, marginTop: '1px' }}>{h.threat}</div>
                      <div style={{ fontSize: '7px', color: '#6b7280', marginTop: '1px' }}>{h.country}{h.articleCount > 0 ? ` \u00B7 ${h.articleCount} recent articles` : ''}</div>
                    </div>
                    <div style={{
                      fontSize: '7px', fontWeight: 700, color: lc.text, padding: '2px 5px',
                      background: 'rgba(0,0,0,0.3)', borderRadius: '3px', whiteSpace: 'nowrap',
                    }}>
                      LVL {h.level}
                    </div>
                  </div>
                );
              };
              return (
                <>
                  {/* Danger Zones */}
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                    DANGER ZONES
                  </div>
                  {danger.map(renderCard)}

                  {/* Popular Destinations */}
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.5px', marginTop: '12px', marginBottom: '6px' }}>POPULAR DESTINATIONS</div>
                  {popular.map(renderCard)}

                  {danger.length === 0 && popular.length === 0 && (
                    <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>
                      Loading travel alerts...
                    </div>
                  )}

                  {/* Timestamp */}
                  <div style={{ marginTop: '10px', fontSize: '7px', color: '#4b5563', textAlign: 'center', paddingBottom: '8px' }}>
                    Last updated: {newsTimestamp || 'Loading...'}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events': return renderEventsTab();
      case 'newsletter': return renderBriefTab();
      case 'elections': return renderElectionsTab();
      case 'forecast': return renderForecastTab();
      case 'horizon': return renderHorizonTab();
      case 'stocks': return renderStocksTab();
      case 'travel': return renderTravelTab();
      default: return null;
    }
  };

  return (
    <>
      <div className="sidebar">
        {/* Nuclear Arsenals (military mode only, above tabs) */}
        {militaryMode && (
          <div className="nuclear-arsenals-box">
            <div className="nuclear-arsenals-title">{'\u2622'} NUCLEAR ARSENALS</div>
            <div className="nuclear-arsenals-grid">
              {NUCLEAR_ARSENALS.map(n => (
                <div key={n.country} className="nuclear-arsenals-row">
                  <span>{n.flag}</span>
                  <span>{n.country}</span>
                  <span className="nuclear-arsenals-count">{n.warheads}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '7px', color: '#4b5563', textAlign: 'center', marginTop: '4px' }}>Data as of March 2026</div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status + Font Controls Row */}
        <div className="sidebar-status-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px', background: '#0a0a0f', borderBottom: '1px solid #1f2937' }}>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>
            {newsTimestamp ? (
              <>{newsTimestamp}</>
            ) : (
              'Loading live news...'
            )}
          </div>
          <div id="fontControls" style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <button
              onClick={() => adjustFontSize(-1)}
              style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #374151', background: '#111827', color: '#9ca3af', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              title="Decrease text size"
            >A-</button>
            <button
              onClick={resetFontSize}
              style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #374151', background: '#111827', color: '#6b7280', fontSize: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              title="Reset text size"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 1 3 6.7"/><polyline points="3 22 3 16 9 16"/></svg>
            </button>
            <button
              onClick={() => adjustFontSize(1)}
              style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #374151', background: '#111827', color: '#9ca3af', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              title="Increase text size"
            >A+</button>
          </div>
        </div>

        {/* Content */}
        <div className="sidebar-content" ref={contentRef}>
          {renderTabContent()}
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Election Detail Modal */}
      <ElectionModal
        election={selectedElection}
        isOpen={!!selectedElection}
        onClose={() => setSelectedElection(null)}
        onCountryClick={handleCountryClick}
      />
    </>
  );
}
