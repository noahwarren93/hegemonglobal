// data.js - All static data

export const COUNTRIES = {
  // ==================== CATASTROPHIC ====================
  'Ukraine': { lat: 48.38, lng: 31.17, flag: '🇺🇦', risk: 'catastrophic', region: 'Eastern Europe', pop: '39.5M', gdp: '$191B', leader: 'Volodymyr Zelenskyy', title: 'War & Peace Talks',
    analysis: {
      what: 'Russia\'s full-scale invasion, launched in February 2022, continues into its fourth year as the largest military conflict in Europe since WWII. Both sides have suffered hundreds of thousands of casualties. Ukraine has lost approximately 13% of its territory. Active peace negotiations are now underway—Geneva talks in February 2026 ended without a deal—deep divisions persist on territorial questions. A multi-tiered ceasefire plan was proposed with Western support, and France and the UK have pledged to install military hubs in Ukraine. US-Russia talks in Abu Dhabi re-established military dialogue. However, territorial disputes remain the core sticking point, with Russia demanding full control of Donetsk and Luhansk.',
      why: 'This conflict has fundamentally reshaped European security architecture and revitalized NATO. The outcome will define the international order for decades: whether territorial conquest through military force remains viable. Peace negotiations are the most significant diplomatic development since the war began, driven by Trump administration pressure and battlefield exhaustion on both sides.',
      next: 'Active peace talks create the first real possibility of a ceasefire since the war began. Watch for: Geneva negotiation progress, territorial compromise formulas, security guarantee framework, and whether both sides accept monitoring mechanisms. Key variables: Trump\'s diplomatic leverage, Putin\'s territorial demands, Zelenskyy\'s red lines, and European security commitments.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '1h ago', headline: 'Geneva talks show progress on military ceasefire track', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '3h ago', headline: '35-country coalition pledges ceasefire monitoring support', url: '#' },
      { source: 'WSJ', bias: 'center-right', time: '6h ago', headline: 'Territorial disputes remain core sticking point', url: '#' },
      { source: 'AP', bias: 'center', time: '8h ago', headline: 'Zelenskyy outlines security guarantee demands', url: '#' }
    ]
  },

  'Russia': { lat: 61.52, lng: 105.32, flag: '🇷🇺', risk: 'catastrophic', region: 'Eastern Europe', pop: '144M', gdp: '$2.54T', leader: 'Vladimir Putin', title: 'War & Negotiations',
    analysis: {
      what: 'Russia continues its war in Ukraine while engaging in trilateral peace negotiations with the US and Ukraine. Geneva talks in February 2026 showed progress on military tracks but Russia demands Ukrainian withdrawal from Donbas as a precondition—a non-starter for Kyiv. The country faces unprecedented Western sanctions—over 16,000 measures—but has adapted through shadow fleet oil sales and trade rerouting via China and India. The war economy consumes 40% of the budget. Military casualties are estimated at 300,000+ killed and wounded. Domestically, Putin has consolidated total authoritarian control.',
      why: 'Russia possesses the world\'s largest nuclear arsenal and a permanent UN Security Council seat. The invasion has shattered the post-Cold War European security order. Russia\'s partnership with China, Iran, and North Korea forms a growing axis challenging Western hegemony. The peace negotiations represent the first serious diplomatic opening since the war began.',
      next: 'Russia is negotiating from a position of territorial control but economic strain. Watch for: negotiation posture, territorial demands, sanctions pressure, military-economic sustainability, and whether Putin accepts a ceasefire that falls short of his maximalist demands. The outcome will reshape global power dynamics for decades.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Russia demands Donbas withdrawal as peace precondition', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'War economy strains Russian budget as talks continue', url: '#' },
      { source: 'Bloomberg', bias: 'center-right', time: '7h ago', headline: 'Geneva talks show limited progress on political track', url: '#' }
    ]
  },

  'Palestine': { lat: 30.5, lng: 35.2, flag: '🇵🇸', risk: 'catastrophic', region: 'Middle East', pop: '5.3M', gdp: '$20B', leader: 'Mahmoud Abbas (PA) / Hamas (Gaza)', title: 'Post-Ceasefire Crisis',
    analysis: {
      what: 'A ceasefire was reached in January 2025 after Israel\'s military campaign in Gaza killed over 72,000 Palestinians and displaced 1.9 million. A second ceasefire took effect October 2025, with Phase 2 beginning January 2026. However, violations are extensive—1,193+ Israeli violations documented since October, with nearly 500 Palestinians killed despite the ceasefire. Only 43% of allocated aid trucks are entering Gaza. The last Israeli hostage body was recovered in January 2026. In the West Bank, the PA governs limited areas under Israeli occupation while 700,000+ settlers expand into Palestinian territory. Post-war Gaza governance remains unresolved.',
      why: 'The Gaza war and ceasefire process have reshaped Middle East geopolitics. Hezbollah was significantly weakened by Israel\'s military operations. The humanitarian catastrophe has inflamed global opinion and strained US relations with allies. Palestinian statehood recognition has gained momentum internationally. The ceasefire\'s fragility threatens a return to full-scale conflict.',
      next: 'Phase 2 negotiations will determine long-term outcomes. Watch for: ceasefire compliance, Gaza reconstruction and governance, humanitarian access, West Bank settler violence, and international recognition moves. The fundamental question of Palestinian statehood remains the core unresolved issue of Middle East politics.'
    },
    news: [
      { source: 'Al Jazeera', bias: 'left', time: '1h ago', headline: 'Phase 2 ceasefire faces implementation challenges', url: '#' },
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Humanitarian aid access remains severely restricted', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '5h ago', headline: 'West Bank raids continue amid fragile ceasefire', url: '#' },
      { source: 'AP', bias: 'center', time: '7h ago', headline: 'Gaza reconstruction plans stall over governance disputes', url: '#' }
    ]
  },

  'Sudan': { lat: 12.86, lng: 30.22, flag: '🇸🇩', risk: 'catastrophic', region: 'Africa', pop: '46M', gdp: '$34B', leader: 'Disputed', title: 'Civil War',
    analysis: {
      what: 'Civil war erupted in April 2023 between the Sudanese Armed Forces (SAF) led by General al-Burhan and the paramilitary Rapid Support Forces (RSF) led by Hemedti. Fighting has devastated Khartoum and spread across the country, particularly in Darfur where the RSF has captured all five state capitals including El Fasher. An estimated 150,000-400,000 people have been killed and 13.6 million displaced—the world\'s largest displacement crisis. Mass killings, sexual violence, and ethnic cleansing have been documented. Famine conditions are spreading with hospitals non-functional.',
      why: 'Sudan\'s collapse threatens to destabilize the entire Horn of Africa and Sahel region. The RSF has links to Wagner Group/Russia and receives UAE support, while SAF has Egyptian and Iranian backing—making this a proxy battlefield. Sudan controls strategic Red Sea coastline and Nile water resources critical to Egypt. The humanitarian catastrophe rivals Yemen and Gaza in severity but receives far less attention.',
      next: 'Neither side appears capable of decisive military victory, suggesting prolonged conflict. The country may fragment into competing zones of control. Without sustained international pressure and humanitarian access, mass starvation is likely. Long-term scenarios include partition, failed state status, or exhaustion-driven negotiations.'
    },
    news: [
      { source: 'UN News', bias: 'center', time: '2h ago', headline: 'Famine officially declared in Darfur camps', url: '#' },
      { source: 'Reuters', bias: 'center', time: '4h ago', headline: 'RSF advances on key eastern city', url: '#' },
      { source: 'AP', bias: 'center', time: '8h ago', headline: 'Millions face starvation as aid blocked', url: '#' }
    ]
  },

  'Myanmar': { lat: 21.92, lng: 95.96, flag: '🇲🇲', risk: 'catastrophic', region: 'Southeast Asia', pop: '54M', gdp: '$65B', leader: 'Military Junta', title: 'Civil War Stalemate',
    analysis: {
      what: 'Myanmar\'s civil war following the 2021 military coup has reached a volatile stalemate. The military junta controls only ~21% of Myanmar\'s territory, with resistance forces holding ~42% and continue advancing toward the Bamar heartland. The military held sham elections from December 2025 to January 2026 in only 263 of 330 townships, widely boycotted and marked by intense violence. The March 2025 earthquake (magnitude 7.7) killed 5,000+ and compounded the crisis. Over 5.2 million people are displaced. The junta has responded with airstrikes on civilians, village burnings, and mass executions. The economy has collapsed.',
      why: 'Myanmar\'s instability creates refugee flows into Thailand, Bangladesh, and India. The country is a major corridor for drug trafficking. China has significant interests and influence over ethnic armies. The resistance lacks unified political leadership, and public exhaustion is growing. International attention has waned except from China. The conflict economy dominates.',
      next: 'Neither side appears capable of decisive military victory. Watch for: territorial shifts, resistance coordination, Chinese mediation, junta legitimacy efforts through sham elections, and humanitarian access. The junta is adapting strategically while the resistance faces fragmentation challenges.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Junta elections widely boycotted amid ongoing conflict', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '6h ago', headline: 'Military airstrikes kill civilians in Bago Region', url: '#' },
      { source: 'Nikkei', bias: 'center', time: '9h ago', headline: 'Resistance controls 38% but faces setbacks', url: '#' }
    ]
  },

  'Yemen': { lat: 15.55, lng: 48.52, flag: '🇾🇪', risk: 'catastrophic', region: 'Middle East', pop: '33M', gdp: '$21B', leader: 'Disputed', title: 'Houthi Retaliation — Red Sea Crisis',
    analysis: {
      what: 'The US and Israel launched joint strikes on Iran on February 28, 2026, triggering near-certain Houthi retaliation. The Houthis are Iran\'s most aggressive proxy force and had previously disrupted 12% of global trade through Red Sea shipping attacks. The US-Houthi ceasefire from May 2025 is effectively void. Houthi leaders have repeatedly vowed to escalate if Iran is attacked. The movement retains anti-ship missiles, drones, and ballistic missiles capable of striking US naval assets and commercial shipping.',
      why: 'Houthi attacks on Red Sea shipping forced the largest rerouting of global trade since the Suez Crisis, adding weeks to transit times and billions in costs. Renewed attacks would spike global shipping insurance, oil prices, and supply chain disruptions. The US has two carrier strike groups in the region that could become Houthi targets. Yemen is the most likely front for immediate Iranian proxy escalation alongside Hezbollah in Lebanon.',
      next: 'Houthi attacks on Red Sea shipping and US naval assets are expected within hours. Watch for: anti-ship missile launches in the Bab el-Mandeb strait, drone attacks on commercial vessels, ballistic missile strikes toward Israel, and US preemptive strikes on Houthi positions. Global shipping disruption and oil price spikes are near-certain consequences.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '30m ago', headline: 'Houthis vow massive retaliation after US-Israeli strikes on Iran', url: '#' },
      { source: 'AP', bias: 'center', time: '1h ago', headline: 'Red Sea shipping halted as Houthi attacks expected', url: '#' },
      { source: 'Al Jazeera', bias: 'left', time: '2h ago', headline: 'US carrier groups brace for Houthi missile attacks', url: '#' }
    ]
  },

  'Haiti': { lat: 18.97, lng: -72.29, flag: '🇭🇹', risk: 'catastrophic', region: 'Caribbean', pop: '11.6M', gdp: '$20B', leader: 'Transitional Council', title: 'Gang Violence Crisis',
    analysis: {
      what: 'Haiti has collapsed into gang rule following the 2021 assassination of President Moïse. Armed gangs now control 90% of Port-au-Prince, the capital. Gang violence has killed thousands and displaced over 1.4 million people. The state has effectively ceased to function—hospitals are closed, schools shuttered, and police overwhelmed. The Kenya-led Multinational Security Support (MSS) mission largely failed. In October 2025, the UN Security Council adopted Resolution 2793, creating the Gang Suppression Force (GSF)—a 5,500-strong UN-backed force mandated to conduct independent counter-gang operations. The GSF is set to replace the MSS between March-April 2026.',
      why: 'Haiti\'s collapse creates migration pressure toward the US, Dominican Republic, and Caribbean nations. It demonstrates how quickly state failure can occur. The country is a transit point for drug trafficking. International intervention efforts have repeatedly failed, raising questions about effective responses to fragile states. Regional stability in the Caribbean is affected.',
      next: 'The Gang Suppression Force must succeed where the MSS failed. With 5,500 troops and a stronger mandate, it has better prospects but faces well-armed gangs controlling 90% of the capital. Watch for: GSF deployment effectiveness, gang coordination, migration flows, and humanitarian access. Long-term recovery requires dismantling gang networks and rebuilding institutions from scratch—a generational project.'
    },
    news: [
      { source: 'AP', bias: 'center', time: '2h ago', headline: 'Gang violence surges despite international mission', url: '#' },
      { source: 'Reuters', bias: 'center', time: '5h ago', headline: 'Thousands flee Port-au-Prince as fighting intensifies', url: '#' },
      { source: 'Miami Herald', bias: 'center', time: '8h ago', headline: 'Kenya deploys additional troops to Haiti', url: '#' }
    ]
  },

  'Afghanistan': { lat: 33.94, lng: 67.71, flag: '🇦🇫', risk: 'extreme', region: 'Central Asia', pop: '41M', gdp: '$14B', leader: 'Taliban', title: 'Humanitarian Crisis',
    analysis: {
      what: 'The Taliban seized power in August 2021 as US forces withdrew after 20 years of war. The regime has imposed strict Islamic law, banning girls from secondary education and women from most employment. The economy has collapsed with international sanctions and frozen assets. Over 23 million people face acute hunger. ISIS-K conducts attacks against the Taliban and minorities. Resistance movements exist but pose no serious threat to Taliban control.',
      why: 'Afghanistan remains a potential terrorist safe haven—Al-Qaeda leader Zawahiri was killed there in 2022. The humanitarian crisis creates refugee pressure on Pakistan and Iran. Women\'s rights rollback is the most severe in the world. Drug production (opium, methamphetamine) fuels regional trafficking. Neighboring countries face spillover instability.',
      next: 'Taliban rule appears consolidated despite international isolation. No recognition from major powers is likely given women\'s rights abuses. Watch for: humanitarian conditions, terrorist activity, refugee flows, and any internal Taliban splits. The population faces grinding poverty with no improvement in sight.'
    },
    news: [
      { source: 'UN News', bias: 'center', time: '3h ago', headline: 'Millions face starvation as winter approaches', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '6h ago', headline: 'Taliban expands restrictions on women', url: '#' },
      { source: 'Reuters', bias: 'center', time: '10h ago', headline: 'ISIS-K claims attack in Kabul province', url: '#' }
    ]
  },

  'DRC': { lat: -4.04, lng: 21.76, flag: '🇨🇩', risk: 'extreme', region: 'Africa', pop: '99M', gdp: '$65B', leader: 'Félix Tshisekedi', title: 'M23 Occupation Crisis',
    analysis: {
      what: 'The eastern DRC crisis escalated dramatically when M23 rebels (backed by Rwanda) captured Goma, the North Kivu capital, in January 2025, followed by Bukavu in South Kivu. Over a year later, M23 still occupies both cities, causing a severe humanitarian crisis—over 1 million Goma residents face economic collapse, bank closures, and cash shortages. The Doha Framework Agreement was signed in November 2025, and a ceasefire monitoring mechanism was agreed to on February 2, 2026. The DRC and Rwanda also signed the Washington Agreements in December 2025. Despite diplomatic momentum, fighting continues in some areas. The EU announced $95.8 million in humanitarian aid in February 2026.',
      why: 'DRC holds vast mineral wealth critical to global technology—cobalt for batteries, coltan for electronics, gold, and diamonds. M23\'s control of major cities represents the most significant rebel territorial gains in decades. Rwanda\'s involvement has been extensively documented despite denials. The humanitarian crisis is among the world\'s worst with 7+ million displaced.',
      next: 'M23 shows no signs of withdrawing from occupied cities. Watch for: peace talk outcomes, ceasefire compliance, humanitarian access, and international pressure on Rwanda. Without addressing Rwanda\'s role, the conflict will continue to devastate eastern Congo.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Fighting resumes in eastern DRC despite ceasefire', url: '#' },
      { source: 'UN News', bias: 'center', time: '5h ago', headline: 'One year under M23 rule: Goma faces deepening crisis', url: '#' },
      { source: 'AP', bias: 'center', time: '9h ago', headline: 'EU pledges nearly $100M in humanitarian aid', url: '#' }
    ]
  },

  'Somalia': { lat: 5.15, lng: 46.20, flag: '🇸🇴', risk: 'extreme', region: 'Africa', pop: '18M', gdp: '$8B', leader: 'Hassan Sheikh Mohamud', title: 'Al-Shabaab Threat',
    analysis: {
      what: 'Somalia has lacked effective central government since 1991. Al-Shabaab, an Al-Qaeda affiliate, controls large rural areas and conducts devastating attacks including car bombings in Mogadishu. President Hassan Sheikh Mohamud launched a major offensive against the group in 2022 with initial success, but Al-Shabaab has regrouped. Drought and famine have killed thousands. Clan politics complicate governance. The African Union mission is drawing down.',
      why: 'Al-Shabaab threatens regional stability, conducting attacks in Kenya and elsewhere. Somalia\'s coast is strategic for global shipping (Gulf of Aden). Failed state status makes it a potential terrorist haven. Climate change-induced drought creates humanitarian emergencies. Piracy, though reduced, can resurge.',
      next: 'The government offensive has stalled and Al-Shabaab remains potent. Watch for: AU troop withdrawal impacts, Al-Shabaab attacks, drought conditions, and clan reconciliation efforts. Building effective state institutions remains the fundamental challenge.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Al-Shabaab car bomb kills dozens in Mogadishu', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Drought displaces thousands more families', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '10h ago', headline: 'Government forces clash with militants in south', url: '#' }
    ]
  },

  // ==================== EXTREME ====================
  'Israel': { lat: 31.5, lng: 34.9, flag: '🇮🇱', risk: 'catastrophic', region: 'Middle East', pop: '9.5M', gdp: '$525B', leader: 'Benjamin Netanyahu', title: 'State of Emergency — Strikes on Iran',
    analysis: {
      what: 'Israel launched a "preemptive attack" on Tehran on February 28, 2026, in coordination with the United States. Israel has declared a state of emergency with sirens blaring and citizens told to shelter in place. Iranian retaliation via ballistic missiles and proxy forces is expected imminently. Hezbollah in Lebanon, despite being weakened, retains rocket capability and may open a northern front. The IDF is on full alert across all borders. This is the most significant Israeli military operation since the 2023-2024 Gaza war.',
      why: 'Israel has entered active military conflict with Iran — a nation with ballistic missile capability that can reach Israeli cities. Iranian retaliation could come via direct missile strikes, Hezbollah rockets from Lebanon, Houthi attacks from Yemen, and Iraqi militia strikes on US bases that host Israeli intelligence assets. Israel\'s Iron Dome and Arrow systems will be tested at scale. The state of emergency affects the entire civilian population. Economic disruption will be severe.',
      next: 'Iranian retaliation is the immediate concern — likely a combination of ballistic missiles targeting Israeli military installations and cities, plus proxy activation on multiple fronts. Watch for: Iranian missile launches, Hezbollah rocket barrages from Lebanon, Houthi attacks on Israeli-linked shipping, civilian casualties, and whether the conflict escalates beyond the initial exchange. Israel\'s air defense capacity will be critical.'
    },
    news: [
      { source: 'Times of Israel', bias: 'center-right', time: '20m ago', headline: 'Israel declares state of emergency after launching strikes on Iran', url: '#' },
      { source: 'Reuters', bias: 'center', time: '30m ago', headline: 'IDF confirms "preemptive attack" on Tehran', url: '#' },
      { source: 'Haaretz', bias: 'center-left', time: '1h ago', headline: 'Sirens across Israel — citizens told to shelter', url: '#' }
    ]
  },

  'Taiwan': { lat: 23.70, lng: 120.96, flag: '🇹🇼', risk: 'extreme', region: 'East Asia', pop: '24M', gdp: '$790B', leader: 'Lai Ching-te', title: 'Cross-Strait Tensions',
    analysis: {
      what: 'Cross-strait tensions have reached their highest level in decades. China has dramatically increased military activity around Taiwan with near-daily air defense zone incursions and naval exercises simulating blockade scenarios. In December 2025, China launched its most intense exercise yet—100+ aircraft and 27 rockets fired from Fujian, with 10 landing inside Taiwan\'s 24-nautical-mile contiguous zone. President Lai Ching-te continues the DPP\'s pro-sovereignty stance. Taiwan has accelerated defense spending, extended conscription, and seeks a proposed $40 billion military spending increase (currently stalled in the legislature due to opposition majority). TSMC manufactures over 90% of the world\'s most advanced semiconductors.',
      why: 'Taiwan represents the most dangerous potential flashpoint for great-power conflict. A Chinese invasion would likely trigger US intervention, risking war between nuclear powers. The global economy would face catastrophic disruption—semiconductor shortages would halt production of everything from smartphones to weapons. Japan, South Korea, and the Philippines would be directly affected. Taiwan represents an ideological contest: prosperous democracy versus CCP authoritarianism.',
      next: 'Full-scale invasion unlikely before 2027 as China builds capability. However, "gray zone" coercion—blockades, cyber attacks—could occur sooner. Watch for: Chinese military exercises, US arms sales, Japanese posture changes. The 2027-2030 window is considered particularly dangerous.'
    },
    news: [
      { source: 'Nikkei', bias: 'center', time: '2h ago', headline: 'China conducts largest Taiwan Strait exercises this year', url: '#' },
      { source: 'Reuters', bias: 'center', time: '4h ago', headline: 'Taiwan scrambles jets as PLA aircraft approach', url: '#' },
      { source: 'SCMP', bias: 'center-right', time: '8h ago', headline: 'Beijing warns against "Taiwan independence" moves', url: '#' }
    ]
  },

  'Iran': { lat: 32.43, lng: 53.69, flag: '🇮🇷', risk: 'catastrophic', region: 'Middle East', pop: '87M', gdp: '$388B', leader: 'Ali Khamenei', title: 'Under US-Israeli Military Attack',
    analysis: {
      what: 'The United States and Israel launched coordinated military strikes on Tehran and Iranian nuclear facilities on February 28, 2026. US officials describe it as "not a small strike." Israel declared a state of emergency and launched what it calls a "preemptive attack" on Iran. Iran\'s air defenses are engaged and retaliation is expected. The strikes target nuclear enrichment sites and military infrastructure. Iran had been enriching uranium to 60% purity with enough material for multiple bombs. Iran\'s proxy network — Hezbollah, Houthis, Hamas, Iraqi Shia militias — is expected to activate across the region.',
      why: 'Iran is now under direct military attack by the United States and Israel — the most significant military confrontation in the Middle East since the 2003 Iraq invasion. The Strait of Hormuz carries 20-30% of global oil transit and Iran has threatened to close it in retaliation. Strikes on nuclear facilities risk radioactive contamination and could paradoxically accelerate weapons development. Iranian proxies can open multiple fronts simultaneously — Red Sea shipping (Houthis), northern Israel (Hezbollah), Iraq (Shia militias). Global energy markets face severe disruption. This is a potential trigger for a wider regional war.',
      next: 'Iran will almost certainly retaliate — the question is scale and targets. Scenarios: (1) targeted missile strikes on US bases in Iraq/Syria and Israeli military targets, (2) Houthi escalation closing Red Sea shipping, (3) Hezbollah rocket barrages on northern Israel, (4) attempted closure of the Strait of Hormuz, or (5) all of the above simultaneously. Watch for: Iranian missile launches, proxy activation across the region, oil price spikes, Strait of Hormuz shipping disruptions, and whether the conflict escalates into a full regional war.'
    },
    news: [
      { source: 'CNN', bias: 'center-left', time: '30m ago', headline: 'US and Israeli strikes hit Tehran — "not a small strike"', url: '#' },
      { source: 'Reuters', bias: 'center', time: '1h ago', headline: 'Iran vows retaliation as strikes target nuclear sites', url: '#' },
      { source: 'AP', bias: 'center', time: '1h ago', headline: 'Global oil prices surge as Middle East war erupts', url: '#' }
    ]
  },

  'North Korea': { lat: 40.34, lng: 127.51, flag: '🇰🇵', risk: 'extreme', region: 'East Asia', pop: '26M', gdp: '$18B', leader: 'Kim Jong Un', title: 'Nuclear Threats',
    analysis: {
      what: 'North Korea conducted two missile tests in January 2026—ballistic missiles on Jan 4 and the advanced 600mm MLRS on Jan 27. Kim Jong Un oversaw hypersonic missile tests, citing "geopolitical crisis." The nuclear arsenal is estimated at 50+ warheads and growing. Kim Jong Un has declared South Korea a "hostile state" and abandoned reunification as a goal. Military cooperation with Russia has deepened, with North Korea providing ammunition for the Ukraine war in exchange for qualitative military modernization. North Korea is maintaining a non-antagonistic stance toward the US to keep the door open for a Trump summit, suppressing major provocations until after the April 2026 Trump-Xi summit. The population faces chronic food insecurity under strict totalitarian control.',
      why: 'North Korea\'s nuclear weapons threaten South Korea, Japan, and potentially the US. Proliferation risk is high—Pyongyang has sold missile technology to Iran and others. Military miscalculation could trigger catastrophic war on the Korean Peninsula. The regime\'s brutality makes it among the world\'s worst human rights situations. US troops and alliance commitments in the region are directly affected.',
      next: 'Denuclearization appears impossible given Kim\'s survival calculus. Watch for: weapons tests (especially nuclear), US-ROK exercises, Russia military cooperation, and any provocations. Crisis management rather than resolution is the realistic focus.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'North Korea fires ballistic missile toward Sea of Japan', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Kim Jong Un inspects new missile submarine', url: '#' },
      { source: 'Yonhap', bias: 'center', time: '9h ago', headline: 'Seoul condemns latest DPRK weapons test', url: '#' }
    ]
  },

  'Syria': { lat: 34.80, lng: 38.99, flag: '🇸🇾', risk: 'extreme', region: 'Middle East', pop: '22M', gdp: '$9B', leader: 'Ahmad al-Sharaa', title: 'Post-Assad Transition',
    analysis: {
      what: 'Assad was overthrown in December 2024 by HTS rebels led by Ahmad al-Sharaa (Abu Mohammed al-Julani), ending over 50 years of Assad family rule. A provisional constitution was ratified establishing a 5-year transition period (2025-2030). The interim government is working to establish authority but faces enormous challenges: the northeast remains under Kurdish-led SDF control with US military presence, sectarian tensions persist, and ISIS exploits instability. Since January 2026, the Syrian army has been conducting a large-scale offensive against Kurdish SDF forces in the northeast. Over 1.2 million Syrians have returned from abroad and 2 million internally displaced have returned. The economy is devastated and over half the pre-war population remains displaced.',
      why: 'Syria\'s transition from Assad\'s authoritarian rule is one of the most significant geopolitical shifts in the Middle East in decades. Russia lost its key Arab ally and Mediterranean military bases. Iran\'s "land bridge" to Hezbollah was severed. The outcome will determine whether Syria becomes a functioning state or fragments further. Reconstruction will require massive international investment. Millions of refugees may begin returning if stability holds.',
      next: 'The transitional government must unify a fractured country while managing competing armed factions. Watch for: Kurdish autonomy negotiations, ISIS resurgence, sectarian violence, international reconstruction aid, and whether al-Sharaa can transition from rebel leader to statesman. The 2026 northeastern offensive shows stability is far from assured.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Transitional government faces security challenges in northeast', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'SDF agreement hands provinces to interim authorities', url: '#' },
      { source: 'Al Jazeera', bias: 'left', time: '9h ago', headline: 'Reconstruction plans stall as funding remains scarce', url: '#' }
    ]
  },

  'Lebanon': { lat: 33.85, lng: 35.86, flag: '🇱🇧', risk: 'catastrophic', region: 'Middle East', pop: '5.5M', gdp: '$22B', leader: 'Joseph Aoun', title: 'Hezbollah Proxy Retaliation Expected',
    analysis: {
      what: 'The US and Israel launched joint military strikes on Iran on February 28, 2026, making Hezbollah retaliation from Lebanon virtually certain. Despite being significantly weakened after Israel killed its top leadership including Nasrallah in 2024, Hezbollah retains substantial rocket and missile arsenals capable of striking deep into Israel. The Israel-Hezbollah ceasefire is effectively dead. The Lebanese army cannot prevent Hezbollah from acting on Iranian orders. Civilians across southern Lebanon and northern Israel face imminent danger.',
      why: 'Lebanon is the most likely front for Iranian proxy retaliation against Israel. Hezbollah is Iran\'s most capable proxy force and has historically responded to attacks on Iran with rocket barrages on Israeli cities. Even in its weakened state, Hezbollah possesses precision-guided munitions that can hit Tel Aviv. Any Israeli counter-strikes on Lebanon would devastate a country already in economic collapse. The entire civilian population is at risk.',
      next: 'Hezbollah rocket and missile attacks on northern Israel are expected within hours to days. Watch for: rocket barrages from southern Lebanon, Israeli preemptive strikes on Hezbollah positions, civilian displacement on both sides of the border, and whether Hezbollah launches precision-guided munitions at Israeli strategic targets. A full-scale Israel-Lebanon war is now a near-term possibility.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '30m ago', headline: 'Hezbollah signals retaliation after US-Israeli strikes on Iran', url: '#' },
      { source: 'AP', bias: 'center', time: '1h ago', headline: 'Lebanon braces for war as Iran-Israel conflict erupts', url: '#' },
      { source: 'Times of Israel', bias: 'center-right', time: '2h ago', headline: 'IDF reinforces northern border amid Hezbollah threat', url: '#' }
    ]
  },

  'Mali': { lat: 17.57, lng: -4.00, flag: '🇲🇱', risk: 'extreme', region: 'Africa', pop: '22M', gdp: '$19B', leader: 'Military Junta', title: 'Wagner/Jihadi Conflict',
    analysis: {
      what: 'Mali has been ruled by a military junta since 2020/2021 coups. French forces withdrew after a decade fighting jihadists, replaced by Russian Wagner Group mercenaries. Jihadi groups (linked to Al-Qaeda and ISIS) control vast northern territories. Wagner forces have been implicated in massacres of civilians. The junta has allied with Russia, expelled Western diplomats, and postponed elections indefinitely. Conflict has displaced millions.',
      why: 'Mali is the epicenter of Sahel instability spreading across West Africa. Wagner presence expands Russian influence in Africa. Jihadi expansion threatens coastal West African states. Migration flows toward Europe originate here. Gold mining finances armed groups. The French withdrawal marks a strategic shift in Africa.',
      next: 'The junta appears stable but faces jihadi resurgence. Watch for: territorial control changes, Wagner activities, refugee flows, and relations with neighbors. Without addressing governance and development, conflict will persist.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Jihadi attack kills dozens in central Mali', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'UN mission completes withdrawal from country', url: '#' },
      { source: 'France24', bias: 'center-left', time: '10h ago', headline: 'Wagner forces accused of civilian massacres', url: '#' }
    ]
  },

  'Burkina Faso': { lat: 12.24, lng: -1.56, flag: '🇧🇫', risk: 'extreme', region: 'Africa', pop: '22M', gdp: '$19B', leader: 'Ibrahim Traoré', title: 'Jihadi Violence',
    analysis: {
      what: 'Burkina Faso has suffered two coups since 2022 as the military seized power amid security failures. Captain Ibrahim Traoré, the world\'s youngest head of state at 35, expelled French forces and turned to Russia. Jihadi groups now control roughly 40% of the territory. Over 2 million people are displaced. Massacres occur regularly in rural areas. The junta has conscripted volunteers for self-defense.',
      why: 'Burkina Faso\'s collapse accelerates the spread of Sahel instability toward coastal states like Ghana and Côte d\'Ivoire. It demonstrates the limits of military responses to jihadi insurgency. Russian influence expands at French expense. Humanitarian crisis creates migration pressure. Gold mining areas are contested.',
      next: 'The junta faces a worsening security situation despite Russian support. Watch for: territorial losses to jihadists, humanitarian conditions, coup risk, and regional spillover. State collapse is a real possibility.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Jihadi fighters seize town in northern region', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Displacement crisis worsens amid fighting', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '9h ago', headline: 'Military government extends emergency rule', url: '#' }
    ]
  },

  'Niger': { lat: 17.61, lng: 8.08, flag: '🇳🇪', risk: 'extreme', region: 'Africa', pop: '26M', gdp: '$15B', leader: 'Military Junta', title: 'Coup Government',
    analysis: {
      what: 'A military coup in July 2023 overthrew Niger\'s elected president, ending the last democracy in the Sahel. The junta expelled French and US forces, aligned with Mali and Burkina Faso, and turned toward Russia. ECOWAS threatened intervention but backed down. Jihadi groups are expanding in the southeast. The population is among the world\'s poorest with severe food insecurity.',
      why: 'Niger was a key Western partner for counterterrorism in the Sahel—its loss is a major strategic setback. US drone base and French forces repositioned. Russian influence expands in a uranium-rich country. The coup demonstrates fragility of democracy in the region. Regional instability affects migration routes to Europe.',
      next: 'The junta appears consolidated with regional support. Watch for: jihadi expansion, Russian military presence, humanitarian conditions, and ECOWAS relations. Return to civilian rule appears unlikely near-term.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Junta deepens ties with Russia and Iran', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'US completes military withdrawal', url: '#' },
      { source: 'France24', bias: 'center-left', time: '10h ago', headline: 'Jihadi attacks increase in southeast', url: '#' }
    ]
  },

  // ==================== SEVERE ====================
  'China': { lat: 35.86, lng: 104.20, flag: '🇨🇳', risk: 'severe', region: 'East Asia', pop: '1.4B', gdp: '$19.4T', leader: 'Xi Jinping', title: 'Economic Slowdown',
    analysis: {
      what: 'China faces its most serious economic challenges in decades. The property sector—30% of GDP—is in crisis with major developers defaulting. Youth unemployment exceeded 20% before data publication stopped. Consumer confidence has collapsed. Deflation concerns have emerged. Local government debt is dangerous. Xi Jinping has consolidated unprecedented power while cracking down on tech giants and civil society. US-China tensions have intensified with semiconductor export controls.',
      why: 'As the world\'s second-largest economy and largest trading nation, China\'s slowdown ripples globally. A hard landing could trigger global recession. Geopolitically, China\'s tech ambitions and military modernization pose the primary strategic challenge to US hegemony. Taiwan remains the most dangerous flashpoint. China\'s support for Russia and growing influence in the Global South reshape the international order.',
      next: 'Expect gradual stimulus rather than a "bazooka" response. Property will drag for years. Watch for: social stability, consumption shifts, tech self-sufficiency, and Taiwan Strait activity. US-China tensions will remain contentious. Demographic decline poses long-term challenges.'
    },
    news: [
      { source: 'FT', bias: 'center', time: '1h ago', headline: 'Beijing announces largest stimulus package since 2008', url: '#' },
      { source: 'Bloomberg', bias: 'center-right', time: '3h ago', headline: 'Property sector woes deepen despite government support', url: '#' },
      { source: 'Reuters', bias: 'center', time: '6h ago', headline: 'US expands chip export restrictions to more Chinese firms', url: '#' },
      { source: 'WSJ', bias: 'center-right', time: '9h ago', headline: 'Consumer spending remains weak ahead of Lunar New Year', url: '#' }
    ]
  },

  'Venezuela': { lat: 6.42, lng: -66.59, flag: '🇻🇪', risk: 'extreme', region: 'South America', pop: '28M', gdp: '$92B', leader: 'Delcy Rodríguez (Acting)', title: 'Post-Maduro Transition',
    analysis: {
      what: 'On January 3, 2026, the US launched large-scale military strikes on Caracas in "Operation Absolute Resolve," capturing President Maduro and his wife Cilia Flores, removing them to face narco-terrorism charges in New York. Delcy Rodríguez was sworn in as acting president. Military and police have pledged loyalty to the interim government. The situation remains volatile as Venezuela navigates an unprecedented political transition.',
      why: 'Venezuela has the world\'s largest proven oil reserves. The Maduro capture has created a power vacuum. Over 7 million Venezuelans have fled the country. US intervention has major implications for regional stability and great power competition.',
      next: 'Watch for: stability of Rodríguez government, potential opposition return, US-Venezuela negotiations, and whether democratic transition occurs. Chavista loyalists may resist change.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Opposition leader calls for renewed protests', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Thousands more flee to Colombia amid crackdown', url: '#' },
      { source: 'Bloomberg', bias: 'center-right', time: '8h ago', headline: 'Oil production edges up despite sanctions', url: '#' }
    ]
  },

  'Pakistan': { lat: 30.38, lng: 69.35, flag: '🇵🇰', risk: 'severe', region: 'South Asia', pop: '231M', gdp: '$350B', leader: 'Shehbaz Sharif', title: 'Economic & Political Crisis',
    analysis: {
      what: 'Pakistan faces severe economic crisis with inflation above 30%, IMF bailouts, and depleted foreign reserves. Former PM Imran Khan was jailed on multiple charges his supporters call politically motivated. The military remains the ultimate power broker, engineering Khan\'s removal and subsequent elections. Terrorism has resurged with TTP attacks from Afghanistan. Climate disasters (2022 floods killed 1,700) add to challenges.',
      why: 'Pakistan is a nuclear-armed state of 230 million—instability has global implications. Taliban-controlled Afghanistan enables cross-border terrorism. Pakistan\'s relations with India remain tense. Its economic crisis affects regional trade. The military\'s political role undermines democratic consolidation.',
      next: 'IMF conditionality will impose painful reforms. Watch for: economic indicators, Khan\'s legal battles, military-civilian relations, and terrorism. Structural reform is needed but politically difficult.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'IMF approves next loan tranche after reforms', url: '#' },
      { source: 'Dawn', bias: 'center', time: '5h ago', headline: 'Imran Khan faces new charges in prison', url: '#' },
      { source: 'AP', bias: 'center', time: '8h ago', headline: 'Terrorist attack kills soldiers near Afghan border', url: '#' }
    ]
  },

  'Bangladesh': { lat: 23.68, lng: 90.36, flag: '🇧🇩', risk: 'stormy', region: 'South Asia', pop: '170M', gdp: '$460B', leader: 'Tarique Rahman', title: 'New Government',
    analysis: {
      what: 'BNP won a landslide in the Feb 12 2026 general election—the first since the 2024 July Revolution ousted Sheikh Hasina. Tarique Rahman was sworn in as PM on February 17, 2026, after BNP secured ~211 of 299 seats. Jamaat-e-Islami won ~70 seats as main opposition. The July Charter constitutional referendum passed with 72.9% approval. Voter turnout was 47.9%.',
      why: 'Bangladesh is a garment manufacturing powerhouse supplying global brands—political stability is critical for supply chains. It hosts the world\'s largest refugee camp. Climate change threatens this low-lying nation of 170 million. The democratic transition\'s success will influence regional politics and India relations.',
      next: 'Watch for BNP government formation, Tarique Rahman\'s policy direction, relations with India (complicated by Hasina\'s exile there), implementation of July Charter reforms, and economic stabilization. Jamaat-e-Islami\'s role as opposition will shape the political landscape.'
    },
    news: [
      { source: 'Al Jazeera', bias: 'center', time: '2h ago', headline: 'BNP wins landslide with ~211 seats in historic election', url: '#' },
      { source: 'Reuters', bias: 'center', time: '4h ago', headline: 'July Charter referendum passes with 72.9% approval', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '6h ago', headline: 'Tarique Rahman set to lead Bangladesh after BNP victory', url: '#' }
    ]
  },

  'Turkey': { lat: 38.96, lng: 35.24, flag: '🇹🇷', risk: 'severe', region: 'Middle East', pop: '85M', gdp: '$906B', leader: 'Recep Erdoğan', title: 'Economic Crisis',
    analysis: {
      what: 'Turkey faces severe economic crisis with inflation exceeding 60%, currency collapse, and unorthodox monetary policy that deterred investment. Erdoğan won 2023 elections despite the economy, consolidating power further. Relations with the West are strained over S-400 missiles, Syria policy, and NATO enlargement. Devastating earthquakes in 2023 killed 50,000+. Kurdish conflict continues.',
      why: 'Turkey controls the Bosphorus straits critical to Black Sea shipping. It\'s a NATO ally but often at odds with Western interests. Turkey hosts 4 million Syrian refugees affecting European migration. Its drone technology is globally significant. Erdoğan\'s balancing between Russia and the West creates uncertainty.',
      next: 'Orthodox economic policy has begun with rate hikes but pain will continue. Watch for: inflation trajectory, Erdoğan\'s health/succession, NATO relations, and Kurdish peace prospects. Structural reform is needed but Erdoğan resists liberalization.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Central bank raises rates to combat inflation', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Lira stabilizes after policy shift', url: '#' },
      { source: 'AP', bias: 'center', time: '8h ago', headline: 'Erdoğan meets Putin for talks on Ukraine grain deal', url: '#' }
    ]
  },

  'Egypt': { lat: 26.82, lng: 30.80, flag: '🇪🇬', risk: 'severe', region: 'North Africa', pop: '105M', gdp: '$387B', leader: 'Abdel Fattah el-Sisi', title: 'Economic Crisis',
    analysis: {
      what: 'Egypt faces severe foreign currency shortage, forcing multiple devaluations and IMF intervention. Inflation has hit 35%+. Sisi has built megaprojects (new capital city) while debt ballooned. The military controls much of the economy. Repression of dissent is severe with tens of thousands of political prisoners. Gaza conflict has strained relations with Israel while Egypt controls the Rafah crossing.',
      why: 'Egypt controls the Suez Canal—12% of global trade. Its 105 million people make it the Arab world\'s most populous country. It\'s a key US ally receiving $1.3 billion in annual military aid. Stability matters for Libya, Sudan, and Gaza. Water disputes with Ethiopia over the Nile dam are serious.',
      next: 'UAE investment has provided relief but structural problems remain. Watch for: currency stability, IMF conditions, Gaza spillover, and Nile negotiations. Economic discontent poses medium-term risk to regime stability.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Egypt secures new IMF agreement amid crisis', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Suez Canal revenues drop due to Houthi attacks', url: '#' },
      { source: 'Bloomberg', bias: 'center-right', time: '8h ago', headline: 'UAE investment helps stabilize pound', url: '#' }
    ]
  },

  'Argentina': { lat: -38.42, lng: -63.62, flag: '🇦🇷', risk: 'severe', region: 'South America', pop: '46M', gdp: '$641B', leader: 'Javier Milei', title: 'Economic Crisis',
    analysis: {
      what: 'Argentina has suffered chronic economic crisis with inflation exceeding 200%—the world\'s highest. Libertarian President Javier Milei, elected in 2023, is implementing radical austerity: massive spending cuts, devaluation, and deregulation. Poverty has spiked to 50%+. Protests are frequent but Milei retains support among those desperate for change. IMF debt is being restructured.',
      why: 'Argentina is South America\'s second-largest economy with major agricultural exports. Milei\'s experiment tests whether shock therapy can break chronic inflation. His alignment with the US and Israel marks a regional shift. Lithium reserves make Argentina important for battery supply chains.',
      next: 'Milei faces the challenge of maintaining support through painful adjustment. Watch for: inflation trends, social unrest, congressional support, and investment flows. Success would validate radical reform; failure could bring backlash.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '1h ago', headline: 'Milei announces new round of spending cuts', url: '#' },
      { source: 'FT', bias: 'center', time: '4h ago', headline: 'Inflation shows first signs of slowing', url: '#' },
      { source: 'AP', bias: 'center', time: '7h ago', headline: 'Thousands protest austerity measures in Buenos Aires', url: '#' }
    ]
  },

  'Nigeria': { lat: 9.08, lng: 8.68, flag: '🇳🇬', risk: 'severe', region: 'Africa', pop: '223M', gdp: '$477B', leader: 'Bola Tinubu', title: 'Security Crisis',
    analysis: {
      what: 'Nigeria faces multiple security crises: Boko Haram insurgency in the northeast, banditry in the northwest, separatist agitation in the southeast, and farmer-herder conflicts across the middle belt. President Tinubu removed fuel subsidies causing prices to triple, sparking hardship. The economy struggles with oil theft reducing production, high inflation, and unemployment. Kidnapping for ransom is endemic.',
      why: 'Nigeria is Africa\'s most populous country (223 million) and largest economy. It\'s a major oil producer though output has declined. Instability affects the entire West African region. The country is critical for regional peacekeeping. Diaspora remittances are globally significant.',
      next: 'Tinubu faces immense challenges with few resources. Watch for: security situation in each region, economic reforms, oil production recovery, and 2027 election positioning. Structural decline continues without major reforms.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Bandit attack kills dozens in northwest state', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Protests over rising fuel costs spread', url: '#' },
      { source: 'Bloomberg', bias: 'center-right', time: '8h ago', headline: 'Central bank raises rates to fight inflation', url: '#' }
    ]
  },

  'Ethiopia': { lat: 9.15, lng: 40.49, flag: '🇪🇹', risk: 'severe', region: 'Africa', pop: '126M', gdp: '$126B', leader: 'Abiy Ahmed', title: 'Post-War Tensions',
    analysis: {
      what: 'The 2020-2022 Tigray war killed an estimated 600,000 people—one of the deadliest conflicts this century. A ceasefire holds but tensions remain with Eritrean troops still present. Ethnic conflicts continue in Amhara and Oromia regions. PM Abiy Ahmed, once a Nobel Peace laureate, is now accused of authoritarianism. The economy struggles with debt and inflation. A new Red Sea access deal with Somaliland has angered Somalia.',
      why: 'Ethiopia is Africa\'s second most populous country and a regional power. The Grand Ethiopian Renaissance Dam affects Egypt\'s water supply. Instability affects the entire Horn of Africa. It was a key US partner on counterterrorism. The country\'s trajectory matters for 126 million people.',
      next: 'Post-war reconciliation is incomplete and ethnic tensions persist. Watch for: Tigray integration, regional conflicts, dam negotiations, and economic reforms. Abiy faces the challenge of holding together a fractious federation.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Fighting continues in Amhara region', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Somalia protests Ethiopia port deal', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '9h ago', headline: 'Tigray reconstruction faces funding shortfall', url: '#' }
    ]
  },

  'Iraq': { lat: 33.22, lng: 43.68, flag: '🇮🇶', risk: 'severe', region: 'Middle East', pop: '44M', gdp: '$270B', leader: 'Mohammed al-Sudani', title: 'Fragile Stability',
    analysis: {
      what: 'Iraq has achieved relative stability after years of war against ISIS. But Iran-backed militias hold significant power, sometimes attacking US forces. PM al-Sudani governs through a coalition including these militias. Oil revenues provide budget but corruption is endemic. Kurdistan region tensions persist. Iraq hosts major US military bases at Al Asad and Erbil that are now prime targets for Iranian retaliation following the February 28 US-Israeli strikes on Tehran.',
      why: 'Iraq is OPEC\'s second-largest producer and vital to global energy supply. It\'s a key arena for US-Iran competition. US bases in Iraq are the most likely targets for Iranian proxy retaliation — Iran-backed Iraqi Shia militias have attacked these installations before and are expected to escalate dramatically. Stability affects Syria, Jordan, and the Gulf.',
      next: 'Iranian proxy attacks on US bases at Al Asad and Erbil are expected imminently. Watch for: Shia militia rocket and drone attacks, potential Iranian ballistic missile strikes on Iraqi territory, and whether the Iraqi government can maintain neutrality. US force protection is the immediate priority.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Iran-backed militia attacks US base', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Oil revenues boost budget amid price rise', url: '#' },
      { source: 'Al Jazeera', bias: 'left', time: '8h ago', headline: 'Protests demand better services in Basra', url: '#' }
    ]
  },

  // Continue with more countries...
  'Libya': { lat: 26.34, lng: 17.23, flag: '🇱🇾', risk: 'severe', region: 'North Africa', pop: '7M', gdp: '$41B', leader: 'Divided', title: 'Civil Conflict',
    analysis: {
      what: 'Libya remains divided between rival governments in Tripoli (west) and Benghazi (east) since the 2011 overthrow of Gaddafi. Armed militias control territory across the country. Oil production fluctuates based on conflict. Turkey backs the western government while Russia, Egypt, and UAE support the east. Migration from sub-Saharan Africa flows through Libya toward Europe. Elections remain blocked.',
      why: 'Libya has Africa\'s largest proven oil reserves. It\'s the main departure point for Mediterranean migration to Europe. Russian Wagner forces operate in the east, expanding Moscow\'s African presence. Instability affects neighbors Tunisia, Egypt, and Niger.',
      next: 'Unification efforts have repeatedly failed. Watch for: oil production disruptions, election attempts, foreign interference, and migration flows. Partition is increasingly the de facto reality.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Oil production halted amid militia clashes', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'UN envoy pushes for delayed elections', url: '#' }
    ]
  },

  'Algeria': { lat: 28.03, lng: 1.66, flag: '🇩🇿', risk: 'stormy', region: 'North Africa', pop: '45M', gdp: '$190B', leader: 'Abdelmadjid Tebboune', title: 'Post-Bouteflika Era',
    analysis: {
      what: 'Algeria is Africa\'s largest country by area. The 2019 Hirak protests forced out longtime leader Bouteflika, but the military-backed system remains. President Tebboune governs with limited reform. Press freedom is restricted and opposition activists face prosecution. The economy depends heavily on oil and gas exports to Europe.',
      why: 'Algeria is a major gas supplier to Europe, gaining leverage after Russia\'s invasion of Ukraine. It has tense relations with Morocco over Western Sahara. The country is a key player in Sahel security. Youth unemployment and housing shortages fuel discontent.',
      next: 'Watch for: energy deals with Europe, Western Sahara tensions with Morocco, and whether political space opens or further restricts.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '4h ago', headline: 'Gas exports to Europe increase amid energy crunch', url: '#' },
      { source: 'Al Jazeera', bias: 'center-left', time: '8h ago', headline: 'Opposition figures call for political reforms', url: '#' }
    ]
  },

  'Tunisia': { lat: 33.89, lng: 9.54, flag: '🇹🇳', risk: 'severe', region: 'North Africa', pop: '12M', gdp: '$47B', leader: 'Kais Saied', title: 'Democratic Backsliding',
    analysis: {
      what: 'President Kais Saied has dismantled Tunisia\'s democracy—the only success of the Arab Spring—by suspending parliament, rewriting the constitution, and jailing opponents. The economy is in crisis requiring IMF intervention. Migration to Europe has surged. Critics and journalists face prosecution. The opposition is fragmented and suppressed.',
      why: 'Tunisia\'s democratic collapse is a cautionary tale for the region. Migration pressure affects Europe. Economic failure creates instability near Libya. The country was seen as proof that Arab democracy was possible.',
      next: 'Saied appears secure despite economic failure. Watch for: IMF negotiations, repression levels, migration flows, and any protest emergence. Democratic reversal appears unlikely near-term.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'IMF talks stall over subsidy reforms', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Opposition figures arrested in crackdown', url: '#' }
    ]
  },

  'Ecuador': { lat: -1.83, lng: -78.18, flag: '🇪🇨', risk: 'severe', region: 'South America', pop: '18M', gdp: '$107B', leader: 'Daniel Noboa', title: 'Gang Violence Surge',
    analysis: {
      what: 'Ecuador has experienced explosive gang violence, transforming from one of Latin America\'s safest countries to among its most dangerous. Drug trafficking organizations have taken over prisons and cities. The murder rate has quadrupled since 2018. Young President Daniel Noboa declared a state of emergency and deployed the military. A TV station was stormed live on air by gunmen.',
      why: 'Ecuador\'s collapse shows how quickly drug trafficking can destabilize a country. It\'s now a major cocaine transit point between Colombia and the US/Europe. Regional crime networks are interconnected. Tourism has collapsed.',
      next: 'Noboa faces gangs that may be more powerful than the state. Watch for: violence levels, military effectiveness, prison control, and whether cartels can be pushed back. The country\'s future hangs in the balance.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Gang attacks continue despite military deployment', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Noboa extends state of emergency', url: '#' }
    ]
  },

  'Georgia': { lat: 42.32, lng: 43.36, flag: '🇬🇪', risk: 'severe', region: 'Caucasus', pop: '3.7M', gdp: '$25B', leader: 'Salome Zourabichvili', title: 'Pro-Russia Turn',
    analysis: {
      what: 'Georgia\'s ruling Georgian Dream party has shifted toward Russia, passing a "foreign agents" law modeled on Russian legislation and cracking down on protests. The EU froze Georgia\'s membership candidacy. Mass protests erupted but were suppressed. President Zourabichvili opposes the government but has limited power. The 2024 elections were disputed.',
      why: 'Georgia was a pro-Western success story in the post-Soviet space—its reversal is significant. It borders Russia, which occupies 20% of its territory. The shift affects the South Caucasus corridor between Europe and Asia.',
      next: 'The government appears committed to its pro-Russia turn despite public opposition. Watch for: protest dynamics, EU relations, Russian influence, and any political change. Democratic backsliding continues.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'EU freezes Georgia membership talks', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Opposition protests continue in Tbilisi', url: '#' }
    ]
  },

  'Armenia': { lat: 40.07, lng: 45.04, flag: '🇦🇲', risk: 'severe', region: 'Caucasus', pop: '2.8M', gdp: '$20B', leader: 'Nikol Pashinyan', title: 'Post-Karabakh Crisis',
    analysis: {
      what: 'Armenia suffered a devastating defeat in the 2020 Nagorno-Karabakh war and lost the territory entirely in 2023 when Azerbaijan seized it, forcing 100,000 Armenians to flee. PM Pashinyan faces anger over the losses. Relations with Russia have soured as Moscow failed to protect Armenia. The country is pivoting toward the West. Azerbaijan may push for further concessions.',
      why: 'The Karabakh outcome shows the limits of Russian security guarantees—significant for other post-Soviet states. Armenia\'s Western pivot could reshape South Caucasus geopolitics. The humanitarian crisis of displaced Karabakh Armenians is ongoing.',
      next: 'Armenia faces an emboldened Azerbaijan and uncertain Russian support. Watch for: border negotiations, peace treaty prospects, domestic politics, and Western integration. The country is in strategic transition.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Armenia-Azerbaijan peace talks resume', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Karabakh refugees struggle to rebuild', url: '#' }
    ]
  },

  'Belarus': { lat: 53.71, lng: 27.95, flag: '🇧🇾', risk: 'severe', region: 'Eastern Europe', pop: '9M', gdp: '$73B', leader: 'Lukashenko', title: 'Russian Ally',
    analysis: {
      what: 'Alexander Lukashenko brutally suppressed 2020 protests against his disputed election, remaining in power with Russian support. Belarus has become a Russian military platform, hosting troops and allowing invasion of Ukraine from its territory. Western sanctions are severe. Opposition leaders are jailed or exiled. The economy is propped up by Russian subsidies.',
      why: 'Belarus is effectively a Russian satellite state on NATO\'s border. It hosts Russian nuclear weapons. The country\'s airspace and territory are used against Ukraine. Opposition to Lukashenko represents potential future instability.',
      next: 'Lukashenko appears secure as long as Russia supports him. Watch for: his health (age 70), succession planning, Russian demands, and émigré opposition activities. True independence seems impossible while Russia is strong.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Belarus extends military cooperation with Russia', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Opposition leader sentenced to 18 years', url: '#' }
    ]
  },

  'Moldova': { lat: 47.41, lng: 28.37, flag: '🇲🇩', risk: 'severe', region: 'Eastern Europe', pop: '2.6M', gdp: '$15B', leader: 'Maia Sandu', title: 'Russia Pressure',
    analysis: {
      what: 'Pro-European President Maia Sandu faces Russian destabilization efforts including: support for separatist Transnistria, energy blackmail, disinformation campaigns, and alleged coup plots. Moldova gained EU candidate status but faces challenges implementing reforms. The Transnistria region hosts Russian troops. Economic dependence on remittances makes the country vulnerable.',
      why: 'Moldova is a frontline state in the Russia-West confrontation, sandwiched between Ukraine and NATO member Romania. Its EU integration would be a strategic defeat for Moscow. Russian troops in Transnistria are 50km from Odesa.',
      next: 'Sandu won reelection despite Russian interference but faces continued pressure. Watch for: EU integration progress, Transnistria negotiations, Russian hybrid attacks, and energy security. The country\'s Western path is contested.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Moldova accuses Russia of election interference', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'EU approves next step in membership talks', url: '#' }
    ]
  },

  'Cuba': { lat: 21.52, lng: -77.78, flag: '🇨🇺', risk: 'extreme', region: 'Caribbean', pop: '11M', gdp: '$107B', leader: 'Díaz-Canel', title: 'Escalating Crisis & US Tensions',
    analysis: {
      what: 'Cuba faces a deepening crisis on multiple fronts. The US has declared regime change as a stated goal. An armed speedboat infiltration was intercepted by Cuban coast guard with 4 killed. Rolling blackouts cripple the island as the power grid repeatedly collapses. Public services are disintegrating. Food and medicine shortages are severe. Mass emigration continues at record levels.',
      why: 'Escalating US-Cuba tensions with stated regime change goals risk destabilizing the Caribbean. Armed infiltration attempts signal a dangerous new phase. The humanitarian crisis drives record migration to the US, a major political flashpoint. Cuba\'s trajectory affects Latin American geopolitics and US adversary alignments.',
      next: 'Watch for: further armed provocations or infiltration attempts, US escalation of sanctions or covert action, regime stability under mounting pressure, humanitarian deterioration, and migration surges. The combination of external pressure and internal collapse makes this situation highly volatile.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Power grid collapses again leaving millions without electricity', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Record number of Cubans reach US border', url: '#' }
    ]
  },

  'Nicaragua': { lat: 12.87, lng: -85.21, flag: '🇳🇮', risk: 'severe', region: 'Central America', pop: '7M', gdp: '$15B', leader: 'Daniel Ortega', title: 'Authoritarian Rule',
    analysis: {
      what: 'Daniel Ortega has transformed Nicaragua into a family dictatorship. Opposition leaders have been jailed or exiled. NGOs and media have been shut down. The Catholic Church is persecuted with bishops imprisoned. Elections are shams. The country has aligned with Russia, China, and Iran. Thousands have fled.',
      why: 'Nicaragua\'s authoritarian consolidation is complete, joining Cuba and Venezuela as regional dictatorships. Its alignment with US adversaries is concerning. Migration affects Central American stability. Democratic norms in the region are weakened.',
      next: 'Ortega faces no serious internal challenge. Watch for: succession planning (his wife is VP), relations with adversaries, migration trends, and regional responses. The dictatorship appears durable.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Ortega expels more NGOs from country', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Catholic bishop sentenced to 26 years', url: '#' }
    ]
  },

  // STORMY COUNTRIES
  'United States': { lat: 37.09, lng: -95.71, flag: '🇺🇸', risk: 'severe', region: 'North America', pop: '335M', gdp: '$30.6T', leader: 'Donald Trump', title: 'Active Military Strikes on Iran',
    analysis: {
      what: 'The United States launched military strikes on Iran on February 28, 2026, in coordination with Israel. US officials describe it as "not a small strike," targeting Iranian nuclear facilities and military infrastructure. This marks the first direct US military attack on Iranian territory. US forces across the Middle East — two carrier strike groups, 13+ warships, fighter jets, and B-2 bombers — are engaged. US bases in Iraq, Syria, and the Gulf are on high alert for Iranian retaliation. Domestically, Trump\'s second term continues with trade wars, mass deportations, and federal spending cuts.',
      why: 'The US has entered direct military conflict with Iran — a threshold not crossed in over four decades of hostility. US military bases across the Middle East are now targets for Iranian retaliation via ballistic missiles and proxy forces (Iraqi Shia militias, Houthis). Global energy markets face severe disruption if the Strait of Hormuz is threatened. The economic impact of a wider Middle East war would be felt globally. Congressional authorization questions will dominate domestic debate.',
      next: 'Iranian retaliation against US bases in the region is expected. Watch for: attacks on US forces in Iraq and Syria, Strait of Hormuz disruptions affecting global oil supply, Congressional response on war authorization, domestic political fallout, global market reactions, and whether the strikes achieve their stated objectives or trigger a wider regional war.'
    },
    news: [
      { source: 'CNN', bias: 'center-left', time: '30m ago', headline: 'US strikes Iran alongside Israel — "not a small strike"', url: '#' },
      { source: 'AP', bias: 'center', time: '1h ago', headline: 'US forces on high alert across Middle East', url: '#' },
      { source: 'Reuters', bias: 'center', time: '1h ago', headline: 'Pentagon confirms strikes on Iranian nuclear facilities', url: '#' },
      { source: 'WSJ', bias: 'center-right', time: '2h ago', headline: 'Oil prices spike as US-Iran conflict erupts', url: '#' }
    ]
  },

  'France': { lat: 46.23, lng: 2.21, flag: '🇫🇷', risk: 'stormy', region: 'Western Europe', pop: '68M', gdp: '$3.4T', leader: 'Emmanuel Macron', title: 'Political Fragmentation',
    analysis: {
      what: 'France faces severe political instability. The 2024 snap elections produced a hung parliament, and France has cycled through multiple PMs—François Bayrou fell in September 2025 over the budget, and Sébastien Lecornu was appointed, briefly resigned, and was re-appointed in October 2025. Macron\'s centrist coalition is weakened with both the far-right (Le Pen) and far-left (Mélenchon) gaining ground. The economy struggles with high debt and sluggish growth.',
      why: 'France is the EU\'s second-largest economy and a nuclear power with global reach. The political paralysis hampers EU decision-making. France has committed troops to a potential Ukraine ceasefire monitoring force. Far-right gains would significantly impact EU and NATO.',
      next: 'Macron is a lame duck until 2027 elections. Watch for: PM Lecornu\'s survival, Le Pen\'s positioning, budget battles, and EU leadership role. France\'s political instability is increasingly a European problem.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'PM Lecornu faces budget pressure from opposition', url: '#' },
      { source: 'Le Monde', bias: 'center-left', time: '5h ago', headline: 'Le Pen consolidates far-right support', url: '#' },
      { source: 'FT', bias: 'center', time: '8h ago', headline: 'France pledges troops for Ukraine monitoring force', url: '#' }
    ]
  },

  'Germany': { lat: 51.17, lng: 10.45, flag: '🇩🇪', risk: 'stormy', region: 'Western Europe', pop: '84M', gdp: '$5.0T', leader: 'Friedrich Merz', title: 'New Government',
    analysis: {
      what: 'Friedrich Merz (CDU/CSU) became chancellor in May 2025 after winning the February 2025 election with the highest voter turnout since reunification (82.5%). He leads a grand coalition with the SPD. Germany faces structural economic challenges as its industrial model—based on cheap Russian energy and exports to China—has unraveled. The economy has stagnated. Energy transition costs are high. The far-right AfD remains a significant political force. Immigration and defense spending dominate policy debates.',
      why: 'Germany is Europe\'s largest economy and the EU\'s de facto leader. German industry is central to European supply chains. Merz has signaled a more assertive foreign policy and increased defense spending. Political shifts here reshape the entire EU. Germany\'s economic recovery is critical for European stability.',
      next: 'Merz must revive the economy while managing coalition tensions with the SPD. Watch for: economic indicators, defense spending increases, AfD\'s trajectory, and EU leadership on Ukraine. Germany faces generational challenges requiring structural reform.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Merz government unveils economic reform package', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Germany increases defense budget significantly', url: '#' },
      { source: 'DW', bias: 'center', time: '8h ago', headline: 'Grand coalition faces first policy tests', url: '#' }
    ]
  },

  'Brazil': { lat: -14.24, lng: -51.93, flag: '🇧🇷', risk: 'stormy', region: 'South America', pop: '215M', gdp: '$2.26T', leader: 'Lula da Silva', title: 'Amazon & Politics',
    analysis: {
      what: 'President Lula returned to power in 2023 after defeating Bolsonaro, whose supporters stormed government buildings. Amazon deforestation has declined under Lula\'s policies. The economy is growing moderately with inflation controlled. But political polarization remains intense and Bolsonaro retains significant support despite legal troubles.',
      why: 'Brazil is the world\'s largest rainforest nation—its Amazon policies affect global climate. It\'s Latin America\'s largest economy. Lula has sought to rebuild Brazil\'s global diplomatic role. Political stability here affects the entire region.',
      next: 'Lula faces challenges balancing environmental goals with development. Watch for: Amazon policy, economic performance, Bolsonaro\'s legal fate, and 2026 election positioning. Polarization will persist.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Amazon deforestation hits five-year low', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Bolsonaro charged in coup investigation', url: '#' },
      { source: 'Bloomberg', bias: 'center-right', time: '8h ago', headline: 'Central bank signals rate cuts ahead', url: '#' }
    ]
  },

  'Mexico': { lat: 23.63, lng: -102.55, flag: '🇲🇽', risk: 'stormy', region: 'North America', pop: '130M', gdp: '$1.3T', leader: 'Claudia Sheinbaum', title: 'Cartel Violence',
    analysis: {
      what: 'Mexico faces entrenched cartel violence with over 30,000 homicides annually. President Sheinbaum, the first female president, continues her predecessor\'s "hugs not bullets" approach despite criticism. Fentanyl trafficking to the US dominates bilateral relations. Nearshoring is boosting manufacturing as companies leave China. Democratic institutions face pressure.',
      why: 'Mexico is the US\'s largest trading partner and shares a 2,000-mile border. Migration and drug trafficking are central to US politics. Nearshoring makes Mexico increasingly important to supply chains. Instability would directly affect the US.',
      next: 'Sheinbaum must address security while maintaining economic growth. Watch for: cartel violence, US relations, nearshoring investment, and judicial reforms. The relationship with the US will remain complex.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Cartel violence surges in Sinaloa state', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'US presses Mexico on fentanyl trafficking', url: '#' },
      { source: 'WSJ', bias: 'center-right', time: '8h ago', headline: 'Manufacturers flock to Mexico amid nearshoring boom', url: '#' }
    ]
  },

  'India': { lat: 20.59, lng: 78.96, flag: '🇮🇳', risk: 'stormy', region: 'South Asia', pop: '1.4B', gdp: '$4.13T', leader: 'Narendra Modi', title: 'Rising Power',
    analysis: {
      what: 'India is the world\'s fastest-growing major economy and most populous country. PM Modi won a third term but with reduced majority, requiring coalition partners. Hindu nationalism has risen, with concerns about Muslim minority treatment. Relations with China remain tense after border clashes. India is courted by both the US and Russia.',
      why: 'India is a crucial swing state in great power competition—both the US and China seek its partnership. Its massive market and young population offer economic potential. It\'s a nuclear power and major military force. Indian diaspora is globally influential.',
      next: 'Modi must balance growth with inclusion while navigating between great powers. Watch for: economic reforms, religious tensions, China border, and strategic alignments. India\'s trajectory will shape this century.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '1h ago', headline: 'India GDP growth exceeds expectations', url: '#' },
      { source: 'AP', bias: 'center', time: '4h ago', headline: 'Modi meets with US officials on defense ties', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '7h ago', headline: 'Religious tensions flare in multiple states', url: '#' }
    ]
  },

  'South Korea': { lat: 35.91, lng: 127.77, flag: '🇰🇷', risk: 'stormy', region: 'East Asia', pop: '52M', gdp: '$1.87T', leader: 'Lee Jae-myung', title: 'Post-Crisis Recovery',
    analysis: {
      what: 'South Korea experienced its most severe constitutional crisis since democratization when President Yoon Suk Yeol declared martial law in December 2024, quickly reversed by parliament. He was impeached (204 of 300 votes), the Constitutional Court upheld removal unanimously in April 2025, and in February 2026 Yoon was sentenced to life in prison for insurrection. Lee Jae-myung won the June 2025 snap election and has worked to restore stability. The economy remains a technological powerhouse but faces headwinds from China\'s slowdown.',
      why: 'South Korea is a major economy, technological powerhouse (Samsung, semiconductors), and crucial US ally. It hosts 28,000 US troops facing North Korea. The democratic system proved resilient—martial law was reversed in hours, impeachment proceeded through institutions, and peaceful elections followed. Korean pop culture has global reach.',
      next: 'Lee Jae-myung must rebuild institutional trust and manage North Korean threats. Watch for: economic performance, North Korea policy, US alliance management, and political reconciliation. South Korea\'s democracy emerged strengthened from its greatest test.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '1h ago', headline: 'Yoon sentenced to life in prison for insurrection', url: '#' },
      { source: 'Yonhap', bias: 'center', time: '4h ago', headline: 'Lee government focuses on economic recovery', url: '#' },
      { source: 'AP', bias: 'center', time: '7h ago', headline: 'South Korea strengthens semiconductor investments', url: '#' }
    ]
  },

  // More STORMY countries
  'Saudi Arabia': { lat: 23.89, lng: 45.08, flag: '🇸🇦', risk: 'stormy', region: 'Middle East', pop: '36M', gdp: '$1.1T', leader: 'MBS', title: 'Vision 2030',
    analysis: {
      what: 'Crown Prince Mohammed bin Salman (MBS) is rapidly transforming Saudi Arabia through Vision 2030—diversifying away from oil dependence. Megaprojects like NEOM ($500B futuristic city), sports investments, and entertainment liberalization mark dramatic changes. Saudi Arabia hosts US forces at Prince Sultan Air Base, which faces heightened risk following the February 28 US-Israeli strikes on Iran. Oil production decisions heavily influence global energy markets.',
      why: 'Saudi Arabia is the world\'s swing oil producer, able to influence global prices. Prince Sultan Air Base hosts US air operations critical to the Iran campaign. Houthi missile and drone capability from Yemen can reach Saudi territory — previous attacks hit Aramco facilities. The kingdom faces retaliation risk from both Iranian proxies and direct Iranian missile strikes.',
      next: 'Saudi air defenses will be tested if Iran retaliates against US military assets on Saudi soil. Watch for: Houthi attacks from Yemen, potential Iranian missile strikes, oil infrastructure security, and whether MBS attempts to mediate or stays aligned with the US. Saudi Arabia is caught between its US alliance and its desire to avoid regional war.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'OPEC+ maintains production cuts amid demand concerns', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'NEOM faces delays and cost overruns', url: '#' }
    ]
  },

  'South Africa': { lat: -30.56, lng: 22.94, flag: '🇿🇦', risk: 'stormy', region: 'Africa', pop: '60M', gdp: '$399B', leader: 'Ramaphosa', title: 'Coalition Government',
    analysis: {
      what: 'The ANC lost its majority for the first time since 1994, forced into coalition with the DA and others. President Ramaphosa continues but with weakened mandate. The economy struggles with load shedding (power cuts), high unemployment (32%), and infrastructure decay. Crime is severe. Corruption scandals have eroded trust.',
      why: 'South Africa is Africa\'s most industrialized economy and a regional anchor. Its trajectory affects the entire southern African region. The country\'s stance on Russia and Palestine puts it at odds with Western allies. Its financial markets are Africa\'s most developed.',
      next: 'The coalition government faces the challenge of reform while maintaining stability. Watch for: power crisis resolution, economic reforms, corruption prosecutions, and coalition dynamics. The country is at an inflection point.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Load shedding eases as new power plants come online', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Coalition tensions flare over cabinet posts', url: '#' }
    ]
  },

  'Kenya': { lat: -0.02, lng: 37.91, flag: '🇰🇪', risk: 'stormy', region: 'Africa', pop: '54M', gdp: '$113B', leader: 'William Ruto', title: 'Protests & Debt',
    analysis: {
      what: 'Mass youth-led protests in 2024 forced President Ruto to withdraw a controversial tax bill and reshuffle his cabinet. The economy is strained by high debt servicing costs—nearly half of revenue goes to debt payments. Kenya leads the Haiti security mission despite domestic challenges. Tech sector ("Silicon Savannah") remains a bright spot.',
      why: 'Kenya is East Africa\'s largest economy and a key US security partner in the region. It\'s a hub for regional business and technology. The youth protest movement could inspire similar actions across Africa. Kenya\'s debt distress mirrors broader emerging market challenges.',
      next: 'Ruto faces the difficult balance of fiscal reform versus public anger. Watch for: debt restructuring, protest dynamics, Haiti mission progress, and 2027 election positioning. The government\'s reform agenda faces significant headwinds.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Kenya secures debt relief from creditors', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Youth activists maintain pressure on government', url: '#' }
    ]
  },

  'Colombia': { lat: 4.57, lng: -74.30, flag: '🇨🇴', risk: 'stormy', region: 'South America', pop: '52M', gdp: '$314B', leader: 'Gustavo Petro', title: 'Peace Process',
    analysis: {
      what: 'President Petro, Colombia\'s first leftist leader, has pursued "total peace"—negotiations with multiple armed groups. Results are mixed: talks with ELN guerrillas have stalled, while some groups have demobilized. Coca production remains at record levels. Relations with the US are strained. Economic reforms have been controversial.',
      why: 'Colombia is the world\'s largest cocaine producer. Its stability affects the entire region. The country hosts 2+ million Venezuelan refugees. US-Colombia relations are historically close but now tested. The peace process outcome will determine security for decades.',
      next: 'Petro\'s ambitious agenda faces congressional opposition and armed group intransigence. Watch for: peace negotiations, coca policy, economic reforms, and 2026 elections. The country\'s direction depends on peace process success.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'ELN peace talks resume after breakdown', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Coca production hits new record despite eradication efforts', url: '#' }
    ]
  },

  'Peru': { lat: -9.19, lng: -75.02, flag: '🇵🇪', risk: 'stormy', region: 'South America', pop: '34M', gdp: '$242B', leader: 'Dina Boluarte', title: 'Political Instability',
    analysis: {
      what: 'Peru has cycled through multiple presidents in recent years amid political chaos. President Boluarte faces very low approval after taking power when Castillo was impeached and arrested for attempting a self-coup. Protests killed dozens. Mining remains the economic backbone but faces social opposition. Corruption scandals have touched virtually every political figure.',
      why: 'Peru is the world\'s second-largest copper producer, critical for the energy transition. Political instability deters investment in a resource-rich country. Regional drug trafficking flows through Peru. The pattern of presidential dysfunction weakens democratic institutions.',
      next: 'Boluarte will likely serve until 2026 elections but with minimal legitimacy. Watch for: mining investment, social conflicts, corruption prosecutions, and electoral dynamics. Structural political reform seems unlikely.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Mining protests block major copper operations', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Boluarte approval ratings hit new low', url: '#' }
    ]
  },

  'Thailand': { lat: 15.87, lng: 100.99, flag: '🇹🇭', risk: 'stormy', region: 'Southeast Asia', pop: '70M', gdp: '$495B', leader: 'Paetongtarn', title: 'Political Uncertainty',
    analysis: {
      what: 'Thailand\'s politics remain turbulent despite a new government led by Paetongtarn Shinawatra, daughter of exiled former PM Thaksin. The progressive Move Forward party was dissolved by constitutional court despite winning the most seats. The military and monarchy retain enormous influence. Economic growth has lagged regional peers. Tourism has recovered post-COVID.',
      why: 'Thailand is Southeast Asia\'s second-largest economy and a major tourist destination. The monarchy is deeply revered but succession creates uncertainty. The country\'s position between US and China shapes regional dynamics. Its political instability (19 coups since 1932) affects investment.',
      next: 'The Shinawatra-linked government faces military and conservative establishment skepticism. Watch for: coalition stability, economic reforms, lèse-majesté prosecutions, and relations with progressive opposition. Another political disruption cannot be ruled out.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'New government faces constitutional court challenges', url: '#' },
      { source: 'Nikkei', bias: 'center', time: '5h ago', headline: 'Tourism revenues approach pre-COVID levels', url: '#' }
    ]
  },

  'Philippines': { lat: 12.88, lng: 121.77, flag: '🇵🇭', risk: 'stormy', region: 'Southeast Asia', pop: '115M', gdp: '$404B', leader: 'Marcos Jr', title: 'China Tensions',
    analysis: {
      what: 'President Marcos Jr has shifted from his predecessor Duterte\'s China-friendly stance, strengthening US alliance ties amid South China Sea tensions. Chinese vessels regularly confront Philippine boats at disputed reefs. The Visiting Forces Agreement with the US was renewed, and new base access granted. A rift has developed between Marcos and VP Sara Duterte (daughter of the former president).',
      why: 'The Philippines sits on critical South China Sea shipping lanes where $3 trillion in trade passes annually. It\'s a key US ally hosting military facilities. The confrontational dynamics with China could escalate to armed conflict. The large overseas Filipino worker population sends significant remittances.',
      next: 'Tensions with China will likely persist and potentially escalate. Watch for: South China Sea incidents, US military cooperation, Marcos-Duterte political split, and economic development. The country is increasingly on the frontline of US-China competition.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '1h ago', headline: 'Chinese vessels block Philippine boats at disputed reef', url: '#' },
      { source: 'AP', bias: 'center', time: '4h ago', headline: 'US announces new military cooperation package', url: '#' }
    ]
  },

  'Hungary': { lat: 47.16, lng: 19.50, flag: '🇭🇺', risk: 'stormy', region: 'Eastern Europe', pop: '10M', gdp: '$188B', leader: 'Viktor Orbán', title: 'Democratic Backsliding',
    analysis: {
      what: 'PM Viktor Orbán has built what he calls "illiberal democracy"—concentrating power, capturing media, and undermining judicial independence. Hungary regularly clashes with the EU over rule of law, blocking Ukraine aid and migration policies. Orbán maintains close ties with Putin and has visited Moscow. The economy struggles with high inflation and EU funding freezes.',
      why: 'Hungary demonstrates democratic backsliding within the EU, challenging the bloc\'s values. Its veto power blocks EU decisions on Ukraine and other issues. Orbán is a model for right-wing populists globally. Hungary\'s position complicates NATO unity.',
      next: 'Orbán appears secure domestically but faces increasing EU isolation. Watch for: EU funding negotiations, Ukraine policy, and any opposition consolidation. Hungary will continue to be the EU\'s most difficult member.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'EU freezes more funds over rule of law concerns', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Orbán blocks joint EU statement on Ukraine', url: '#' }
    ]
  },

  'Serbia': { lat: 44.02, lng: 21.01, flag: '🇷🇸', risk: 'stormy', region: 'Balkans', pop: '7M', gdp: '$63B', leader: 'Aleksandar Vučić', title: 'Kosovo Tensions',
    analysis: {
      what: 'President Vučić maintains strong grip on power with control over media and institutions. Serbia refuses to recognize Kosovo\'s independence and tensions remain high, including recent violent incidents. The country seeks EU membership but won\'t align with sanctions on Russia. It has close ties with both Russia and China while negotiating with the West.',
      why: 'Serbia\'s relations with Kosovo are a potential flashpoint in Europe. Its balancing act between East and West complicates regional integration. Weapons flowing from Serbia have appeared in various conflicts. The country is key to Balkan stability.',
      next: 'The Kosovo issue appears intractable without significant compromise. Watch for: Kosovo-Serbia negotiations, EU accession progress, and Russian influence. Vučić will try to maintain his balancing act indefinitely.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'EU-mediated talks with Kosovo make limited progress', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Serbia maintains neutrality on Russia sanctions', url: '#' }
    ]
  },

  'El Salvador': { lat: 13.79, lng: -88.90, flag: '🇸🇻', risk: 'stormy', region: 'Central America', pop: '6.5M', gdp: '$33B', leader: 'Nayib Bukele', title: 'Gang Crackdown',
    analysis: {
      what: 'President Bukele has achieved dramatic reduction in gang violence through a state of emergency, mass arrests (80,000+), and harsh conditions that have drawn human rights criticism. Homicides dropped from world\'s highest to among lowest in the Americas. He won reelection overwhelmingly despite constitutional concerns. Bitcoin adoption as legal tender has been rocky.',
      why: 'Bukele\'s gang suppression model is being watched by other violence-plagued countries. His popularity despite authoritarian methods challenges democratic norms. The Bitcoin experiment tests cryptocurrency\'s viability as national currency. Migration from El Salvador significantly affects the US.',
      next: 'Bukele faces the challenge of sustaining security gains and economic development. Watch for: human rights concerns, economic indicators, Bitcoin project, and whether the security model is replicable. His approach is a test case for the region.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Homicide rate remains at historic low', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Human rights groups condemn prison conditions', url: '#' }
    ]
  },

  'Sri Lanka': { lat: 7.87, lng: 80.77, flag: '🇱🇰', risk: 'stormy', region: 'South Asia', pop: '22M', gdp: '$75B', leader: 'Anura Kumara', title: 'Economic Recovery',
    analysis: {
      what: 'Sri Lanka experienced complete economic collapse in 2022—defaulting on debt, running out of fuel and medicine, and seeing the president flee the country amid mass protests. A new leftist president won elections promising reform. IMF bailout conditions are being implemented with painful austerity. Tourism is recovering slowly.',
      why: 'Sri Lanka\'s collapse was a warning about debt distress in developing countries. Its strategic location in the Indian Ocean makes it important to India and China (which built the controversial Hambantota port). The recovery\'s success will influence how other struggling nations are treated.',
      next: 'The new government must balance IMF conditions with public patience. Watch for: economic indicators, tourism recovery, debt restructuring, and India-China competition. Recovery will be long and painful but appears on track.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'IMF approves next bailout tranche', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Tourism arrivals show steady recovery', url: '#' }
    ]
  },

  'Bolivia': { lat: -16.29, lng: -63.59, flag: '🇧🇴', risk: 'stormy', region: 'South America', pop: '12M', gdp: '$44B', leader: 'Rodrigo Paz', title: 'New Presidency',
    analysis: {
      what: 'Bolivia faces political division between President Arce and his former mentor Evo Morales, splitting the ruling MAS party. A failed coup attempt in 2024 (or what critics called a staged event) added confusion. Economic challenges mount as natural gas revenues decline. Indigenous politics remain central. Lithium reserves offer potential.',
      why: 'Bolivia has among the world\'s largest lithium reserves, crucial for battery production. The MAS movement\'s internal conflict affects regional left politics. The country demonstrates tensions between democratic norms and populist movements.',
      next: 'The Arce-Morales split will dominate politics heading toward 2025 elections. Watch for: economic conditions, lithium development, and political violence risk. The outcome will shape Bolivia\'s direction for years.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Morales announces presidential bid despite controversy', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Natural gas exports continue decline', url: '#' }
    ]
  },

  'Guyana': { lat: 4.86, lng: -58.93, flag: '🇬🇾', risk: 'stormy', region: 'South America', pop: '0.8M', gdp: '$15B', leader: 'Irfaan Ali', title: 'Oil Boom',
    analysis: {
      what: 'Guyana has experienced the world\'s fastest economic growth due to massive offshore oil discoveries—expected to produce over 1 million barrels per day by 2027. This tiny country of 800,000 people faces the challenge of managing sudden wealth. Venezuela claims two-thirds of Guyana\'s territory (Essequibo) and has made threatening moves.',
      why: 'Guyana\'s oil boom is one of the most dramatic economic transformations in history. The Venezuela territorial dispute could escalate to conflict. How Guyana manages its windfall will be studied as a development case. Caribbean stability is affected.',
      next: 'The key challenge is using oil wealth wisely to avoid the "resource curse." Watch for: Venezuela tensions, governance quality, infrastructure development, and wealth distribution. The country\'s transformation is just beginning.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Oil production exceeds projections', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Venezuela continues military posturing on border', url: '#' }
    ]
  },

  // ==================== CLOUDY COUNTRIES ====================
  'United Kingdom': { lat: 55.38, lng: -3.44, flag: '🇬🇧', risk: 'cloudy', region: 'Western Europe', pop: '67M', gdp: '$3.1T', leader: 'Keir Starmer', title: 'Post-Brexit Adjustment',
    analysis: {
      what: 'Labour\'s Keir Starmer won a landslide election in 2024, ending 14 years of Conservative rule. He inherits an economy still adjusting to Brexit with sluggish growth, strained public services, and high debt. Relations with Europe are being reset, though not rejoining the EU. Immigration policy and small boat crossings remain contentious.',
      why: 'The UK is Europe\'s second-largest economy and a permanent UN Security Council member. Its global financial center status continues despite Brexit. The "special relationship" with the US remains important. The UK is a key NATO contributor.',
      next: 'Starmer faces the challenge of delivering change with limited fiscal room. Watch for: economic growth, EU relationship, immigration policy, and public service reform. The honeymoon period will be tested quickly.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Starmer announces EU cooperation initiatives', url: '#' },
      { source: 'BBC', bias: 'center-left', time: '5h ago', headline: 'NHS waiting lists remain at record levels', url: '#' }
    ]
  },

  'Italy': { lat: 41.87, lng: 12.57, flag: '🇮🇹', risk: 'cloudy', region: 'Western Europe', pop: '59M', gdp: '$2.1T', leader: 'Giorgia Meloni', title: 'Right-Wing Government',
    analysis: {
      what: 'PM Giorgia Meloni leads the most right-wing government since WWII, but has proven more pragmatic than feared—maintaining EU relations and supporting Ukraine. Economic growth is modest. Debt remains very high at 140% of GDP. Migration from Africa is a central issue. Her Brothers of Italy party has post-fascist roots.',
      why: 'Italy is the eurozone\'s third-largest economy—its debt levels affect European financial stability. Meloni\'s pragmatism has surprised observers and influences how other right-wing leaders govern. Italian migration policy affects EU-wide approaches. Italy is a key NATO member.',
      next: 'Meloni\'s popularity has held but economic challenges persist. Watch for: debt dynamics, migration deals, EU relations, and coalition stability. Italy demonstrates right-wing governance within EU constraints.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Meloni meets EU leaders on migration deal', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Italian bonds stable despite high debt', url: '#' }
    ]
  },

  'Poland': { lat: 51.92, lng: 19.15, flag: '🇵🇱', risk: 'cloudy', region: 'Eastern Europe', pop: '38M', gdp: '$688B', leader: 'Donald Tusk', title: 'Democratic Recovery',
    analysis: {
      what: 'PM Donald Tusk returned to power in 2023, ending 8 years of PiS rule that had eroded judicial independence and clashed with the EU. The new government is working to restore rule of law and unlock frozen EU funds. Poland hosts millions of Ukrainian refugees and is a major defense spender. Relations with the EU are normalizing.',
      why: 'Poland is the largest Central European economy and NATO\'s eastern anchor. It borders Ukraine and Russia\'s Kaliningrad exclave. Its democratic recovery is significant for EU cohesion. Poland has become a major military power with 4% of GDP defense spending.',
      next: 'Tusk faces the challenge of reforming captured institutions while maintaining stability. Watch for: judicial reforms, EU funding, Ukraine support, and relations with President Duda. Democratic restoration is a long process.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'EU releases frozen funds after reform progress', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Poland hosts major NATO exercises near Belarus border', url: '#' }
    ]
  },

  'Spain': { lat: 40.46, lng: -3.75, flag: '🇪🇸', risk: 'cloudy', region: 'Western Europe', pop: '48M', gdp: '$1.4T', leader: 'Pedro Sánchez', title: 'Coalition Politics',
    analysis: {
      what: 'PM Sánchez leads a fragile minority government dependent on regional parties including Catalan separatists. An amnesty for Catalan independence leaders was passed amid controversy. The economy has performed better than eurozone peers. Housing affordability is a growing issue. Devastating floods in Valencia highlighted climate vulnerabilities.',
      why: 'Spain is the eurozone\'s fourth-largest economy. The Catalan independence issue creates precedent for separatist movements elsewhere. Spanish is spoken by 500+ million people globally. Tourism makes Spain a major European destination.',
      next: 'Sánchez\'s coalition is unstable and could collapse. Watch for: Catalan negotiations, economic performance, housing protests, and snap election risk. The government\'s survival is not assured.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Catalan amnesty law faces constitutional challenge', url: '#' },
      { source: 'El País', bias: 'center-left', time: '5h ago', headline: 'Housing protests spread to major cities', url: '#' }
    ]
  },

  'Netherlands': { lat: 52.13, lng: 5.29, flag: '🇳🇱', risk: 'cloudy', region: 'Western Europe', pop: '18M', gdp: '$991B', leader: 'Dick Schoof', title: 'Right-Wing Shift',
    analysis: {
      what: 'Geert Wilders\' far-right PVV won elections but couldn\'t form government directly—a coalition with moderate parties installed technocrat PM Schoof. The government has adopted the toughest asylum policy in Dutch history. Economic concerns include housing shortage and agricultural transition. The Netherlands remains Europe\'s largest port.',
      why: 'The Netherlands is a major EU economy and home to Rotterdam, Europe\'s largest port. Its political shift rightward reflects broader European trends. Dutch agriculture and tech sectors are globally significant. Shell and other major multinationals are headquartered there.',
      next: 'The coalition\'s stability will be tested by Wilders\' ambitions and policy compromises. Watch for: asylum policy implementation, EU relations, and farmer protests. The rightward shift may continue.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Government announces strictest asylum rules in history', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Dutch ports see record trade volumes', url: '#' }
    ]
  },

  'Indonesia': { lat: -0.79, lng: 113.92, flag: '🇮🇩', risk: 'cloudy', region: 'Southeast Asia', pop: '277M', gdp: '$1.3T', leader: 'Prabowo', title: 'New Leadership',
    analysis: {
      what: 'New President Prabowo Subianto, a former general once accused of human rights abuses, won elections with Jokowi\'s backing. He has announced ambitious programs including free school meals. Indonesia is building a new capital (Nusantara) in Borneo. The economy grows steadily with nickel processing driving investment. Democratic backsliding concerns exist.',
      why: 'Indonesia is the world\'s fourth most populous country and ASEAN\'s largest economy. It has vast mineral resources crucial for batteries (nickel, cobalt). The country\'s stability affects Southeast Asian regional dynamics. Its moderate Islam influences global Muslim communities.',
      next: 'Prabowo\'s leadership style and policies are still being defined. Watch for: democratic institutions, economic policy, environmental concerns (deforestation), and foreign policy direction. The transition marks a significant shift.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Prabowo announces major infrastructure investments', url: '#' },
      { source: 'Nikkei', bias: 'center', time: '5h ago', headline: 'Nickel processing attracts Chinese investment', url: '#' }
    ]
  },

  'Vietnam': { lat: 14.06, lng: 108.28, flag: '🇻🇳', risk: 'cloudy', region: 'Southeast Asia', pop: '100M', gdp: '$409B', leader: 'Tô Lâm', title: 'Manufacturing Hub',
    analysis: {
      what: 'Vietnam has emerged as a major manufacturing hub, benefiting from supply chain diversification away from China. GDP growth exceeds 6% annually. A sweeping anti-corruption campaign has reshuffled leadership including the president. The one-party communist state maintains stability while gradually opening the economy.',
      why: 'Vietnam is one of the fastest-growing economies and a key beneficiary of "China+1" supply chain strategies. Major tech companies (Samsung, Apple suppliers) have significant operations there. The country balances relations with the US and China despite historical conflicts with both.',
      next: 'Manufacturing growth should continue as companies diversify from China. Watch for: US-Vietnam relations, anti-corruption campaign impacts, and infrastructure development. Vietnam\'s rise as a manufacturing power will accelerate.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Manufacturing exports hit new record', url: '#' },
      { source: 'Nikkei', bias: 'center', time: '5h ago', headline: 'Apple expands supplier operations in Vietnam', url: '#' }
    ]
  },

  'Japan': { lat: 36.20, lng: 138.25, flag: '🇯🇵', risk: 'clear', region: 'East Asia', pop: '125M', gdp: '$4.2T', leader: 'Sanae Takaichi', title: 'Defense Buildup',
    analysis: {
      what: 'PM Sanae Takaichi won a major election victory in February 2026, forming a coalition government with the Japan Innovation Party. Japan has undertaken its most significant defense transformation since WWII, doubling military spending and acquiring counterstrike capabilities in response to China and North Korea. The economy has finally exited decades of deflation with wages rising. Demographic decline (population shrinking by 500,000/year) poses long-term challenges.',
      why: 'Japan is the world\'s third-largest economy and crucial US ally. Its defense buildup reshapes Asian security dynamics. Japanese technology and manufacturing remain globally important. Takaichi is Japan\'s first female PM and has taken a more assertive stance on defense and economic nationalism.',
      next: 'The defense transformation will continue as regional tensions persist. Watch for: China relations, US alliance management, economic normalization, and demographic policies. Japan is becoming a more "normal" military power under Takaichi\'s leadership.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '1h ago', headline: 'Takaichi forms second cabinet after election victory', url: '#' },
      { source: 'Nikkei', bias: 'center', time: '4h ago', headline: 'Defense budget reaches record levels', url: '#' }
    ]
  },

  'Canada': { lat: 56.13, lng: -106.35, flag: '🇨🇦', risk: 'clear', region: 'North America', pop: '40M', gdp: '$2.1T', leader: 'Mark Carney', title: 'Stable Democracy',
    analysis: {
      what: 'Canada has experienced political transition with new Liberal leadership. Relations with the US have been tested by trade tensions and border security debates. Housing affordability remains a major domestic issue with prices among the world\'s highest. Immigration levels are high but face public skepticism. The country is a major energy producer.',
      why: 'Canada is America\'s largest trading partner and close ally. Its energy resources (oil sands, hydropower) are globally significant. Canadian stability contrasts with US polarization. Arctic sovereignty is increasingly important as ice melts.',
      next: 'Trade relations with the US will be the dominant concern. Watch for: US tariff threats, housing policy, immigration levels, and energy sector development. Canadian-US relations face unusual uncertainty.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'New government faces US trade pressure', url: '#' },
      { source: 'Globe and Mail', bias: 'center', time: '5h ago', headline: 'Housing starts increase as prices moderate', url: '#' }
    ]
  },

  'Australia': { lat: -25.27, lng: 133.78, flag: '🇦🇺', risk: 'clear', region: 'Oceania', pop: '26M', gdp: '$1.7T', leader: 'Anthony Albanese', title: 'AUKUS Partner',
    analysis: {
      what: 'Australia is implementing the AUKUS agreement to acquire nuclear-powered submarines, the largest defense investment in its history. Relations with China have thawed after years of tension, though strategic competition continues. The economy benefits from mining exports but faces housing affordability challenges. Labor government balances alliance commitments with regional engagement.',
      why: 'Australia is a key US ally in the Indo-Pacific, hosting military facilities and participating in the Quad. Its mineral exports (iron ore, lithium, coal) are globally crucial, especially for China. The AUKUS submarines represent a major shift in regional military balance.',
      next: 'The AUKUS implementation faces technical and political challenges. Watch for: China relations, submarine program progress, Pacific Island engagement, and domestic politics. Australia\'s strategic importance will grow.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'AUKUS submarine construction begins', url: '#' },
      { source: 'ABC', bias: 'center-left', time: '5h ago', headline: 'Trade with China reaches new highs', url: '#' }
    ]
  },

  'Singapore': { lat: 1.35, lng: 103.82, flag: '🇸🇬', risk: 'clear', region: 'Southeast Asia', pop: '6M', gdp: '$424B', leader: 'Lawrence Wong', title: 'Leadership Transition',
    analysis: {
      what: 'Singapore has completed its leadership transition from Lee Hsien Loong to Lawrence Wong, only the fourth prime minister since independence. The city-state remains Southeast Asia\'s financial hub with one of the world\'s highest GDPs per capita. It balances relations with the US and China while maintaining authoritarian political control. Housing costs and inequality are domestic concerns.',
      why: 'Singapore is a global financial center and trading hub. Its political stability model influences regional governance. The country\'s port is among the world\'s busiest. Singapore\'s policies on technology and finance set regional standards.',
      next: 'Wong must maintain Singapore\'s success while addressing inequality and political expectations. Watch for: US-China positioning, financial sector developments, and any political liberalization. The city-state\'s model will be tested.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Singapore GDP growth exceeds forecasts', url: '#' },
      { source: 'Straits Times', bias: 'center-right', time: '5h ago', headline: 'PM Wong outlines new housing initiatives', url: '#' }
    ]
  },

  'UAE': { lat: 23.42, lng: 53.85, flag: '🇦🇪', risk: 'clear', region: 'Middle East', pop: '10M', gdp: '$509B', leader: 'Mohamed bin Zayed', title: 'Regional Hub',
    analysis: {
      what: 'The UAE has emerged as the Middle East\'s business and logistics hub, with Dubai hosting global events and Abu Dhabi investing massively through sovereign wealth funds. It signed the Abraham Accords normalizing relations with Israel. The UAE hosts US forces at Al Dhafra Air Base near Abu Dhabi, a critical staging point for US air operations. Following the February 28 US-Israeli strikes on Iran, Al Dhafra faces heightened risk of Iranian retaliation.',
      why: 'The UAE is a major global investor and Dubai is a global aviation hub. Al Dhafra Air Base hosts US fighter jets and surveillance aircraft involved in the Iran campaign. Iran has ballistic missiles capable of reaching UAE territory. Any strike on UAE soil would send shockwaves through global financial markets given Dubai\'s role as a commercial hub.',
      next: 'The UAE faces a dilemma between its US military hosting obligations and desire to avoid becoming a target. Watch for: Iranian threats against UAE territory, air defense posture, diplomatic messaging, and whether Dubai\'s commercial operations are disrupted. The Abraham Accords relationship with Israel adds to the UAE\'s target profile.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'UAE sovereign fund announces major tech investments', url: '#' },
      { source: 'Bloomberg', bias: 'center-right', time: '5h ago', headline: 'Dubai real estate prices continue rising', url: '#' }
    ]
  },

  'Switzerland': { lat: 46.82, lng: 8.23, flag: '🇨🇭', risk: 'clear', region: 'Western Europe', pop: '9M', gdp: '$808B', leader: 'Federal Council', title: 'Neutral & Stable',
    analysis: {
      what: 'Switzerland has navigated the Ukraine war while maintaining modified neutrality—adopting EU sanctions despite its neutral status. The banking sector faced upheaval with Credit Suisse\'s collapse and forced merger with UBS. Relations with the EU remain complex with no framework agreement. The direct democracy system continues to function well.',
      why: 'Switzerland is a global financial center and headquarters for many international organizations. Its neutrality has been a cornerstone of European diplomacy. Swiss technology and pharmaceutical sectors are globally significant. The country\'s stability attracts wealth from worldwide.',
      next: 'EU relations and neutrality policy will continue to evolve post-Ukraine. Watch for: banking sector stability, EU framework negotiations, and any neutrality debates. Switzerland\'s model faces 21st-century pressures.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Swiss banks report strong profits after consolidation', url: '#' },
      { source: 'SWI', bias: 'center', time: '5h ago', headline: 'EU talks resume on bilateral framework', url: '#' }
    ]
  },

  'Norway': { lat: 60.47, lng: 8.47, flag: '🇳🇴', risk: 'clear', region: 'Northern Europe', pop: '5M', gdp: '$579B', leader: 'Jonas Støre', title: 'Energy Superpower',
    analysis: {
      what: 'Norway has benefited enormously from high energy prices following Russia\'s invasion of Ukraine, with gas exports to Europe surging. The sovereign wealth fund (world\'s largest at $1.6 trillion) continues to grow. NATO\'s northern flank has increased importance. Arctic sovereignty is a growing focus. The country debates its role as a fossil fuel exporter amid climate concerns.',
      why: 'Norway is Europe\'s largest gas supplier since Russia\'s decline. Its sovereign wealth fund\'s investments affect global markets. The country\'s Arctic expertise is increasingly valuable. Norway\'s NATO role has gained importance.',
      next: 'The tension between fossil fuel wealth and climate goals will intensify. Watch for: energy policy, Arctic developments, NATO contributions, and sovereign fund decisions. Norway\'s choices have outsized global impact.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Sovereign wealth fund reaches new record high', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Norway gas exports stabilize European energy markets', url: '#' }
    ]
  },

  // More CLOUDY countries
  'Malaysia': { lat: 4.21, lng: 101.98, flag: '🇲🇾', risk: 'cloudy', region: 'Southeast Asia', pop: '34M', gdp: '$407B', leader: 'Anwar Ibrahim', title: 'Coalition Politics',
    analysis: {
      what: 'PM Anwar Ibrahim leads a unity government after decades of waiting for power. The economy is stable with electronics and palm oil exports. Political coalitions remain fragile with ethnic and religious tensions. The 1MDB corruption scandal continues to echo. Malaysia balances relations with China and Western powers.',
      why: 'Malaysia controls the Strait of Malacca, one of the world\'s busiest shipping lanes. It\'s a major electronics manufacturing hub. The country\'s multiethnic balance influences regional politics. Palm oil exports affect global food and fuel markets.',
      next: 'Anwar must maintain coalition unity while addressing economic inequality. Watch for: coalition stability, ethnic relations, and China engagement. Malaysia\'s political direction remains uncertain.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Electronics exports drive economic growth', url: '#' },
      { source: 'Nikkei', bias: 'center', time: '5h ago', headline: 'Coalition partners debate economic policy', url: '#' }
    ]
  },

  'Romania': { lat: 45.94, lng: 24.97, flag: '🇷🇴', risk: 'cloudy', region: 'Eastern Europe', pop: '19M', gdp: '$301B', leader: 'Disputed', title: 'NATO Frontline',
    analysis: {
      what: 'Romania faces political uncertainty after a far-right candidate won the first round of presidential elections before it was annulled over alleged Russian interference. The country is a key NATO member bordering Ukraine, hosting US troops and missile defense. Economic growth has been strong but faces fiscal challenges.',
      why: 'Romania is on NATO\'s eastern flank, directly bordering Ukraine and Moldova. It hosts major US military facilities. The Black Sea coast is strategically important. Romanian politics serve as a bellwether for Russian influence operations in the EU.',
      next: 'The political crisis will take time to resolve with new elections. Watch for: Russian interference, NATO posture, and EU relations. Romania\'s stability matters for regional security.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Constitutional court schedules new elections', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'NATO reinforces Black Sea presence', url: '#' }
    ]
  },

  'Greece': { lat: 39.07, lng: 21.82, flag: '🇬🇷', risk: 'cloudy', region: 'Southern Europe', pop: '10M', gdp: '$219B', leader: 'Mitsotakis', title: 'Economic Recovery',
    analysis: {
      what: 'Greece has achieved remarkable recovery after its debt crisis, with investment-grade credit restored and tourism booming. PM Mitsotakis won a strong mandate for continued reforms. Relations with Turkey remain tense over maritime boundaries and Cyprus. Wildfires have become more devastating with climate change.',
      why: 'Greece\'s recovery from near-default is a success story for eurozone crisis management. The country occupies strategic position at Europe\'s southeastern corner. Greek-Turkish tensions affect NATO cohesion. Tourism is vital to the Mediterranean economy.',
      next: 'Economic momentum should continue but structural challenges remain. Watch for: Turkey relations, migration pressures, and climate impacts. Greece has turned a corner but faces ongoing challenges.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Tourism revenues exceed pre-pandemic levels', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Greece repays more crisis-era debt early', url: '#' }
    ]
  },

  'Sweden': { lat: 60.13, lng: 18.64, flag: '🇸🇪', risk: 'cloudy', region: 'Northern Europe', pop: '10M', gdp: '$585B', leader: 'Ulf Kristersson', title: 'NATO Member',
    analysis: {
      what: 'Sweden ended over 200 years of neutrality by joining NATO in 2024, a historic shift prompted by Russia\'s invasion of Ukraine. The right-wing government relies on far-right support while maintaining centrist policies. Gang violence has become a major concern with shootings and bombings. The economy is stable with strong tech sector.',
      why: 'Sweden\'s NATO membership fundamentally changes Baltic Sea security dynamics. The country\'s defense industry (Saab) is globally significant. Sweden\'s experience with gang violence offers lessons for other countries. Nordic cooperation is strengthening.',
      next: 'NATO integration will deepen while addressing domestic security. Watch for: military investments, gang violence response, and Russia relations. Sweden\'s security posture has been transformed.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Sweden hosts first NATO exercises since joining', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Gang violence crackdown shows mixed results', url: '#' }
    ]
  },

  'Finland': { lat: 61.92, lng: 25.75, flag: '🇫🇮', risk: 'cloudy', region: 'Northern Europe', pop: '6M', gdp: '$281B', leader: 'Petteri Orpo', title: 'New NATO Member',
    analysis: {
      what: 'Finland joined NATO in 2023, ending decades of "Finlandization" following Russia\'s invasion of Ukraine. This doubled NATO\'s border with Russia. The economy faces challenges with Nokia\'s decline and low growth. The right-wing coalition government has implemented budget cuts. Border security with Russia has required enhanced measures.',
      why: 'Finland\'s 1,340km border with Russia is NATO\'s longest. Finnish military capabilities and Arctic expertise are significant NATO additions. The country\'s transformation shows how Russia\'s aggression has backfired. Nordic defense cooperation has intensified.',
      next: 'NATO integration and border security will remain priorities. Watch for: Russia relations, Arctic developments, and economic reforms. Finland\'s strategic position has gained new importance.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Finland reinforces eastern border defenses', url: '#' },
      { source: 'YLE', bias: 'center', time: '5h ago', headline: 'Government announces new defense investments', url: '#' }
    ]
  },

  'Austria': { lat: 47.52, lng: 14.55, flag: '🇦🇹', risk: 'cloudy', region: 'Western Europe', pop: '9M', gdp: '$471B', leader: 'Christian Stocker', title: 'Three-Party Coalition',
    analysis: {
      what: 'The far-right FPÖ won the 2024 election but Herbert Kickl failed to form a government as other parties refused to coalition with him. Chancellor Christian Stocker was sworn in March 2025 leading an unprecedented three-party coalition (ÖVP + SPD + Neos)—the first tripartite government since 1949. Austria maintains neutrality while being surrounded by NATO members. The economy has emerged from recession with growth resuming in 2026.',
      why: 'Austria\'s political shifts reflect broader European far-right trends, though the centrist coalition blocked FPÖ from power. The country\'s neutrality creates complications for European defense. Austrian banking has historical ties to Eastern Europe. The country is a transit point for migration.',
      next: 'The three-party coalition faces the challenge of maintaining unity across different ideological positions. Watch for: coalition stability, FPÖ opposition pressure, Russia policy, and migration debates. The next election will test whether the far-right can be contained.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Three-party coalition navigates policy differences', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Austrian economy shows signs of recovery', url: '#' }
    ]
  },

  'Chile': { lat: -35.68, lng: -71.54, flag: '🇨🇱', risk: 'cloudy', region: 'South America', pop: '19M', gdp: '$301B', leader: 'Jose Antonio Kast', title: 'Presidential Transition',
    analysis: {
      what: 'President Boric leads a left-wing government that has struggled to deliver promised reforms after two constitutional referendums failed. The economy is stable but growth is weak. Migration from Venezuela and Haiti has strained services. Chile remains the world\'s largest copper producer with lithium reserves gaining importance.',
      why: 'Chile is critical to the global copper supply, essential for electrification and green energy. Its lithium reserves are among the world\'s largest. The country has been Latin America\'s most stable economy. Chilean political shifts influence regional trends.',
      next: 'Boric faces challenging path to 2025 midterms. Watch for: mining policy, constitutional debates, and economic performance. Chile\'s reform agenda has stalled but stability continues.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Copper prices boost fiscal revenues', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Lithium nationalization debate continues', url: '#' }
    ]
  },

  'Morocco': { lat: 31.79, lng: -7.09, flag: '🇲🇦', risk: 'cloudy', region: 'North Africa', pop: '37M', gdp: '$132B', leader: 'King Mohammed VI', title: 'Western Sahara',
    analysis: {
      what: 'Morocco has gained international recognition for its sovereignty over Western Sahara, including from the US and increasingly from European states. The economy is diversifying into automotive and aerospace manufacturing. The 2023 earthquake killed nearly 3,000 and recovery continues. Relations with Algeria remain frozen.',
      why: 'Morocco controls key Atlantic shipping lanes and is Africa\'s gateway to Europe. Its Western Sahara claim affects regional dynamics. The country is a major agricultural exporter to Europe. Morocco\'s stability contrasts with regional turmoil.',
      next: 'Western Sahara recognition momentum may continue. Watch for: EU relations, economic development, and Algeria tensions. Morocco is consolidating its regional position.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'France recognizes Morocco Western Sahara sovereignty', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Earthquake reconstruction proceeds', url: '#' }
    ]
  },

  'Senegal': { lat: 14.50, lng: -14.45, flag: '🇸🇳', risk: 'cloudy', region: 'Africa', pop: '18M', gdp: '$28B', leader: 'Bassirou Faye', title: 'Democratic Transition',
    analysis: {
      what: 'Senegal achieved a remarkable democratic transition when opposition candidate Bassirou Faye won the presidency after his predecessor\'s attempt to delay elections failed. The new government promises anti-corruption reforms. Oil and gas production is beginning. The country remains West Africa\'s most stable democracy.',
      why: 'Senegal\'s democratic transition is a positive example for Africa amid coups elsewhere. New oil/gas revenues could transform the economy. The country is a key regional partner for the West. Senegal hosts significant foreign investment.',
      next: 'The new government must deliver on reform promises while managing oil wealth. Watch for: governance reforms, oil production ramp-up, and regional influence. Senegal\'s success matters for African democracy.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'New government launches anti-corruption probe', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'First oil exports begin from offshore fields', url: '#' }
    ]
  },

  'Tanzania': { lat: -6.37, lng: 34.89, flag: '🇹🇿', risk: 'cloudy', region: 'Africa', pop: '65M', gdp: '$76B', leader: 'Samia Hassan', title: 'Stable Growth',
    analysis: {
      what: 'President Samia Hassan, Africa\'s only female head of state, has reversed her predecessor\'s controversial policies including COVID denialism. The economy grows steadily with tourism and mining driving development. Democratic space remains constrained but has improved. Tanzania mediates regional conflicts.',
      why: 'Tanzania is one of Africa\'s largest and most stable countries. It hosts refugees from multiple neighboring conflicts. The country\'s tourism (Serengeti, Zanzibar) is globally significant. Tanzania mediates in DRC and other regional disputes.',
      next: 'Gradual reform and economic growth should continue. Watch for: 2025 elections, mining development, and regional diplomatic role. Tanzania is quietly becoming more influential.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Tourism revenues reach new record', url: '#' },
      { source: 'AP', bias: 'center', time: '5h ago', headline: 'Tanzania hosts regional peace talks', url: '#' }
    ]
  },

  // More CLEAR countries
  'New Zealand': { lat: -40.90, lng: 174.89, flag: '🇳🇿', risk: 'clear', region: 'Oceania', pop: '5M', gdp: '$247B', leader: 'Christopher Luxon', title: 'Stable',
    analysis: {
      what: 'The center-right government elected in 2023 has reversed some previous progressive policies while maintaining overall stability. The economy faces challenges from high interest rates and housing costs. New Zealand maintains close ties with Australia through AUKUS adjacent arrangements. Pacific Islands engagement remains important.',
      why: 'New Zealand punches above its weight diplomatically, particularly in Pacific Islands affairs. Its agricultural exports are globally significant. The country is part of Five Eyes intelligence sharing. New Zealand\'s clean image supports tourism and exports.',
      next: 'Economic challenges will dominate domestic politics. Watch for: housing policy, Pacific engagement, and China relations. New Zealand remains stable and well-governed.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Interest rates begin to ease as inflation falls', url: '#' },
      { source: 'RNZ', bias: 'center', time: '6h ago', headline: 'Pacific partnerships strengthened', url: '#' }
    ]
  },

  'Denmark': { lat: 56.26, lng: 9.50, flag: '🇩🇰', risk: 'clear', region: 'Northern Europe', pop: '6M', gdp: '$395B', leader: 'Mette Frederiksen', title: 'Greenland Focus',
    analysis: {
      what: 'Denmark has faced increased attention due to US interest in Greenland, which it governs. PM Frederiksen has firmly rejected any sale while increasing defense spending for Greenland. The economy is strong with major pharmaceutical and shipping industries. Denmark leads in wind energy and green transition.',
      why: 'Greenland\'s strategic location and resources (rare earths, oil) have gained geopolitical importance. Denmark controls key Arctic approaches. Danish shipping giant Maersk is globally significant. The country\'s renewable energy expertise is exported worldwide.',
      next: 'Greenland\'s status will remain in focus given Arctic competition. Watch for: US relations, Arctic defense investments, and Greenland autonomy debates. Denmark\'s small size belies its strategic importance.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Denmark increases Greenland defense spending', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Pharmaceutical exports drive trade surplus', url: '#' }
    ]
  },

  'Greenland': { lat: 71.71, lng: -42.60, flag: '🇬🇱', risk: 'stormy', region: 'Arctic / North Atlantic', pop: '57K', gdp: '$3.1B', leader: 'Múte B. Egede', title: 'Arctic Sovereignty Dispute',
    analysis: {
      what: 'Greenland, an autonomous territory of Denmark, has become a focal point of US foreign policy under President Trump, who has repeatedly expressed interest in acquiring the island. Prime Minister Múte Egede has pushed back firmly, stating Greenland is not for sale while simultaneously advancing the independence debate. Denmark has responded by increasing defense spending in the Arctic and strengthening its military presence on the island.',
      why: 'Greenland sits at the intersection of several major geopolitical trends. The Arctic is opening up due to climate change, creating new shipping routes between Asia and Europe that could reshape global trade. The island holds vast untapped mineral deposits including rare earth elements critical to technology and defense manufacturing. Its geographic position also makes it strategically important for missile defense and North Atlantic monitoring. As competition between the US, China, and Russia intensifies in the Arctic, Greenland\'s status has moved from a diplomatic curiosity to a serious geopolitical question.',
      next: 'The independence movement in Greenland is accelerating, with Egede\'s government exploring options for full sovereignty from Denmark. Watch for continued US pressure, potential Chinese investment bids for mining operations, NATO Arctic defense expansion, and the outcome of Greenland\'s internal constitutional discussions. The island\'s future will be shaped by the broader Arctic great power competition.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Trump renews call for US acquisition of Greenland', url: '#' },
      { source: 'BBC', bias: 'center', time: '6h ago', headline: 'Greenland PM rejects sale talk, pushes independence', url: '#' },
      { source: 'Financial Times', bias: 'center', time: '1d ago', headline: 'Rare earth deposits fuel Arctic geopolitical competition', url: '#' }
    ]
  },

  'Ireland': { lat: 53.14, lng: -7.69, flag: '🇮🇪', risk: 'clear', region: 'Western Europe', pop: '5M', gdp: '$533B', leader: 'Simon Harris', title: 'Tech Hub',
    analysis: {
      what: 'Ireland is a major European tech hub, hosting headquarters for Apple, Google, Microsoft, and others drawn by low corporate taxes. GDP figures are distorted by multinational accounting but genuine prosperity is high. Housing and healthcare face serious challenges. Relations with Britain have stabilized post-Brexit.',
      why: 'Ireland\'s tax policies have made it crucial to global tech and pharmaceutical supply chains. The border with Northern Ireland affects UK-EU relations. Irish-American ties influence US politics. Dublin has emerged as a post-Brexit financial center alternative.',
      next: 'Pressure on corporate tax arrangements will continue. Watch for: housing crisis, corporate tax changes, and EU relations. Ireland\'s economic model faces challenges but remains robust.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Apple announces expanded Irish operations', url: '#' },
      { source: 'Irish Times', bias: 'center', time: '5h ago', headline: 'Housing crisis dominates political agenda', url: '#' }
    ]
  },

  'Portugal': { lat: 39.40, lng: -8.22, flag: '🇵🇹', risk: 'clear', region: 'Western Europe', pop: '10M', gdp: '$252B', leader: 'Luís Montenegro', title: 'Stable',
    analysis: {
      what: 'Portugal has achieved strong economic recovery, attracting digital nomads and investment. Tourism is booming, sometimes to excess. The center-right government faces challenges from housing costs and public services. Relations with former colonies in Africa remain important. Renewable energy progress is significant.',
      why: 'Portugal has become a model for economic recovery and tech-friendly policies. The country is strategically located for Atlantic shipping. Portuguese language connects 260 million speakers globally. Tourism and real estate have transformed the economy.',
      next: 'Balancing growth with livability is the key challenge. Watch for: housing policy, public service reform, and tourism management. Portugal\'s success story faces sustainability questions.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '2h ago', headline: 'Tourism arrivals set new record', url: '#' },
      { source: 'FT', bias: 'center', time: '5h ago', headline: 'Housing affordability measures debated', url: '#' }
    ]
  },

  'Qatar': { lat: 25.35, lng: 51.18, flag: '🇶🇦', risk: 'clear', region: 'Middle East', pop: '3M', gdp: '$221B', leader: 'Sheikh Tamim', title: 'Diplomatic Hub',
    analysis: {
      what: 'Qatar has emerged as a crucial diplomatic mediator, hosting Hamas political office and facilitating Gaza negotiations. The country is the world\'s largest LNG exporter. Qatar hosts Al Udeid Air Base, the largest US military installation in the Middle East and the Combined Air Operations Center that coordinates all US air operations in the region. Following the February 28 US-Israeli strikes on Iran, Al Udeid is a potential Iranian retaliation target.',
      why: 'Al Udeid Air Base is the nerve center for US air operations against Iran — making Qatar a high-value target for Iranian retaliation. Qatar is also the world\'s largest LNG exporter, crucial to European and Asian energy security. Any disruption to Qatari gas exports would trigger a global energy crisis on top of the oil shock from the Iran conflict.',
      next: 'Qatar faces acute tension between hosting the US military command center and its diplomatic relationships across the region. Watch for: Iranian threats against Al Udeid, Qatari diplomatic efforts to de-escalate, LNG export disruptions, and whether Qatar attempts to mediate between the US and Iran as it has in other conflicts.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '1h ago', headline: 'Qatar mediates new phase of Gaza talks', url: '#' },
      { source: 'FT', bias: 'center', time: '4h ago', headline: 'LNG exports reach record levels', url: '#' }
    ]
  },

  'Costa Rica': { lat: 9.75, lng: -83.75, flag: '🇨🇷', risk: 'clear', region: 'Central America', pop: '5M', gdp: '$69B', leader: 'Rodrigo Chaves', title: 'Stable Democracy',
    analysis: {
      what: 'Costa Rica remains Central America\'s most stable democracy with no military since 1948. The economy is diverse with tech, medical devices, and tourism. Environmental leadership continues with 99% renewable electricity. Relations with Nicaragua are strained. Social services face funding pressures.',
      why: 'Costa Rica is a model of stability and environmental leadership in a troubled region. It hosts significant international institutions. Ecotourism leadership offers lessons for conservation. The country\'s development model contrasts with neighbors.',
      next: 'Maintaining the Costa Rican model faces fiscal challenges. Watch for: environmental policy, regional migration, and economic diversification. Costa Rica\'s exceptionalism faces tests.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Tech exports drive economic growth', url: '#' },
      { source: 'Tico Times', bias: 'center', time: '6h ago', headline: 'Renewable energy investments continue', url: '#' }
    ]
  },

  'Uruguay': { lat: -32.52, lng: -55.77, flag: '🇺🇾', risk: 'clear', region: 'South America', pop: '3.5M', gdp: '$71B', leader: 'Yamandú Orsi', title: 'Stable Democracy',
    analysis: {
      what: 'Uruguay remains South America\'s most stable and democratic country with strong institutions and low corruption. President Yamandú Orsi (Broad Front, center-left) took office in March 2025 after winning the November 2024 election, marking a peaceful transfer of power. The economy depends on agriculture and services. Progressive social policies continue. The small population limits influence but enables nimble governance.',
      why: 'Uruguay is a model of stability and good governance for Latin America. Its banking system attracts regional deposits. Progressive policies influence debates elsewhere. The peaceful left-right power alternation demonstrates democratic maturity rare in the region.',
      next: 'Orsi must strengthen social safety nets while maintaining fiscal discipline. Watch for: economic policy, regional relations, and social reform agenda. Uruguay\'s stability should continue as institutions remain robust.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Orsi government outlines social reform priorities', url: '#' },
      { source: 'El Observador', bias: 'center', time: '6h ago', headline: 'Agricultural exports strong amid global demand', url: '#' }
    ]
  },

  'Botswana': { lat: -22.33, lng: 24.68, flag: '🇧🇼', risk: 'clear', region: 'Africa', pop: '2.6M', gdp: '$19B', leader: 'Duma Boko', title: 'Stable Democracy',
    analysis: {
      what: 'Botswana achieved a peaceful transfer of power in 2024 elections—rare in African history. The economy depends on diamond mining with De Beers partnership. Governance is among Africa\'s best with low corruption. Wildlife conservation is a major focus. Diversification away from diamonds remains a challenge.',
      why: 'Botswana is Africa\'s longest continuous democracy and governance model. Diamond revenues have funded development. The country\'s wildlife tourism is globally significant. Botswana shows that resource wealth can support good governance.',
      next: 'The new government must diversify the economy as diamond demand evolves. Watch for: economic reforms, conservation policy, and democratic consolidation. Botswana\'s success story should continue.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'New government outlines diversification plans', url: '#' },
      { source: 'AP', bias: 'center', time: '6h ago', headline: 'Diamond sector faces global demand changes', url: '#' }
    ]
  },

  // Remaining countries with brief analysis
  'Estonia': { lat: 58.60, lng: 25.01, flag: '🇪🇪', risk: 'cloudy', region: 'Baltic', pop: '1.4M', gdp: '$38B', leader: 'Kristen Michal', title: 'Digital Pioneer',
    analysis: {
      what: 'Estonia is a digital governance pioneer with e-residency programs and online voting. As a NATO frontline state bordering Russia, defense is paramount. The economy is tech-focused with high digital adoption. Russian minority relations require careful management.',
      why: 'Estonia demonstrates how small states can leverage technology. Its border with Russia makes it NATO\'s northeastern anchor. Cybersecurity expertise is globally recognized. The country hosts NATO cyber defense center.',
      next: 'Digital leadership and security focus will continue. Watch for: Russia relations, tech sector growth, and NATO posture.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Estonia increases defense spending to 3.5% of GDP', url: '#' }
    ]
  },

  'Latvia': { lat: 56.88, lng: 24.60, flag: '🇱🇻', risk: 'cloudy', region: 'Baltic', pop: '1.9M', gdp: '$41B', leader: 'Evika Siliņa', title: 'NATO Frontline',
    analysis: {
      what: 'Latvia is a NATO frontline state with significant Russian-speaking minority. Defense spending has increased dramatically. The economy is recovering from energy price shocks. Democratic institutions are solid. The country hosts NATO battlegroup.',
      why: 'Latvia\'s strategic position between Russia and NATO makes it crucial to alliance defense. Managing ethnic Russian population while countering Russian influence is challenging. Baltic cooperation is strengthening.',
      next: 'Security will remain the dominant concern. Watch for: defense investments, integration policies, and NATO presence.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'NATO reinforces Baltic air patrols', url: '#' }
    ]
  },

  'Lithuania': { lat: 55.17, lng: 23.88, flag: '🇱🇹', risk: 'cloudy', region: 'Baltic', pop: '2.8M', gdp: '$70B', leader: 'Ingrida Šimonytė', title: 'Belarus Border',
    analysis: {
      what: 'Lithuania has taken a strong stance against Belarus and Russia, hosting opposition figures and breaking with China over Taiwan. The economy is growing despite regional tensions. The Suwalki Gap (land connection to NATO) is a strategic vulnerability.',
      why: 'Lithuania\'s position adjacent to Russian exclave Kaliningrad and Belarus makes it NATO\'s most exposed member. Its principled foreign policy has made it a target for authoritarian pressure. The country is vocal on human rights.',
      next: 'Strategic exposure will continue requiring allied attention. Watch for: Belarus border situation, China relations, and defense buildup.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'US troops reinforce Suwalki corridor', url: '#' }
    ]
  },

  'Czech Republic': { lat: 49.82, lng: 15.47, flag: '🇨🇿', risk: 'clear', region: 'Eastern Europe', pop: '10M', gdp: '$290B', leader: 'Petr Fiala', title: 'Stable',
    analysis: {
      what: 'The Czech Republic is among Central Europe\'s most stable democracies with strong institutions. The economy is manufacturing-heavy, integrated with German supply chains. Support for Ukraine has been strong. Housing costs are a domestic concern.',
      why: 'The Czech economy is closely tied to German industry, especially automotive. Prague is a major tourism and business center. The country\'s pro-Western stance is firm. Arms supplies to Ukraine have been significant.',
      next: 'Stability and EU integration will continue. Watch for: economic performance, elections, and continued Ukraine support.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Czech ammunition initiative for Ukraine expands', url: '#' }
    ]
  },

  'Belgium': { lat: 50.50, lng: 4.47, flag: '🇧🇪', risk: 'clear', region: 'Western Europe', pop: '12M', gdp: '$582B', leader: 'Alexander De Croo', title: 'EU Capital',
    analysis: {
      what: 'Belgium hosts EU and NATO headquarters, giving it outsized international importance. Complex federal structure divides Dutch and French-speaking regions. The economy is diverse with pharmaceuticals and chemicals prominent. Governance is often complicated by linguistic politics.',
      why: 'Brussels is effectively the capital of Europe, hosting major institutions. Belgium\'s port of Antwerp is among Europe\'s largest. The country\'s internal divisions mirror broader European tensions. Intelligence services track terrorist threats.',
      next: 'Belgium\'s role as institutional host will continue. Watch for: federal politics, economic performance, and EU developments.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'EU summit addresses Ukraine support', url: '#' }
    ]
  },

  'Croatia': { lat: 45.10, lng: 15.20, flag: '🇭🇷', risk: 'clear', region: 'Southern Europe', pop: '4M', gdp: '$71B', leader: 'Andrej Plenković', title: 'Eurozone Member',
    analysis: {
      what: 'Croatia joined the eurozone and Schengen in 2023, completing EU integration. Tourism drives the economy, particularly along the Adriatic coast. Relations with Serbia and Bosnia require management. Emigration to Western Europe is a demographic challenge.',
      why: 'Croatia\'s EU integration path is complete, making it a model for Western Balkan aspirants. Its Adriatic coast is strategically and economically important. The country bridges Central Europe and the Balkans.',
      next: 'Building on EU integration will be the focus. Watch for: tourism, demographics, and regional relations.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Eurozone membership boosts tourism investment', url: '#' }
    ]
  },

  'Slovenia': { lat: 46.15, lng: 14.99, flag: '🇸🇮', risk: 'clear', region: 'Southern Europe', pop: '2M', gdp: '$62B', leader: 'Robert Golob', title: 'Stable',
    analysis: {
      what: 'Slovenia is among Europe\'s most developed post-communist states. The economy is export-oriented with pharmaceuticals and automotive. Progressive social policies include same-sex marriage. Brief populist interlude under Janša has ended.',
      why: 'Slovenia shows successful EU integration path. The country bridges Germanic and Slavic Europe. Its stability contrasts with Balkan neighbors. The port of Koper serves landlocked Central Europe.',
      next: 'Continued stability and development. Watch for: economic performance and EU engagement.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Slovenia leads EU renewable energy growth', url: '#' }
    ]
  },

  'Luxembourg': { lat: 49.82, lng: 6.13, flag: '🇱🇺', risk: 'clear', region: 'Western Europe', pop: '0.7M', gdp: '$87B', leader: 'Luc Frieden', title: 'Financial Hub',
    analysis: {
      what: 'Luxembourg has the world\'s highest GDP per capita, driven by financial services. It hosts major EU institutions including the European Court of Justice. Tax policies have faced criticism but remain attractive. The tiny country punches above its weight.',
      why: 'Luxembourg is a major financial center with trillions in managed assets. Its EU institutional role gives influence. The country demonstrates how small states can thrive. Space industry ambitions are growing.',
      next: 'Financial services dominance will continue despite pressure. Watch for: tax policy changes and EU relations.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Luxembourg fund industry reaches new highs', url: '#' }
    ]
  },

  'Oman': { lat: 21.47, lng: 55.98, flag: '🇴🇲', risk: 'clear', region: 'Middle East', pop: '5M', gdp: '$104B', leader: 'Sultan Haitham', title: 'Neutral Mediator',
    analysis: {
      what: 'Oman maintains neutrality in regional conflicts, often serving as a diplomatic back channel. Sultan Haitham continues modernization while preserving stability. The economy is diversifying from oil through tourism and logistics. Relations with all regional powers are maintained.',
      why: 'Oman\'s neutrality makes it invaluable for diplomacy—US-Iran talks often use Omani channels. The Strait of Hormuz gives strategic importance. The country balances Saudi, Iranian, and Western relationships uniquely.',
      next: 'Mediating role will continue to be valuable. Watch for: economic diversification, succession stability, and diplomatic initiatives.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Oman facilitates regional dialogue', url: '#' }
    ]
  },

  'Iceland': { lat: 64.96, lng: -19.02, flag: '🇮🇸', risk: 'clear', region: 'Northern Europe', pop: '0.4M', gdp: '$27B', leader: 'Bjarni Benediktsson', title: 'Volcanic Activity',
    analysis: {
      what: 'Iceland has experienced significant volcanic activity with eruptions near Grindavík. The economy is driven by tourism, fishing, and geothermal energy. NATO member hosting US facilities. Financial recovery from 2008 crisis is complete.',
      why: 'Iceland controls strategic North Atlantic approaches. Its renewable energy model is globally studied. Fishing rights remain important. Volcanic activity affects global aviation.',
      next: 'Managing volcanic risks while maintaining tourism growth. Watch for: geological activity and Arctic positioning.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Volcanic activity continues near Grindavík', url: '#' }
    ]
  },

  'Malta': { lat: 35.94, lng: 14.38, flag: '🇲🇹', risk: 'clear', region: 'Mediterranean', pop: '0.5M', gdp: '$18B', leader: 'Robert Abela', title: 'Stable',
    analysis: {
      what: 'Malta is a prosperous island nation with gaming, financial services, and tourism. EU membership has brought growth. Governance concerns exist around citizenship sales and journalist murder investigation. Mediterranean migration routes affect the island.',
      why: 'Malta\'s strategic Mediterranean position has historical and current importance. Its gaming and fintech sectors are significant. The country hosts NATO naval facilities.',
      next: 'Continued prosperity with governance questions. Watch for: migration pressures and rule of law concerns.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Malta gaming sector continues growth', url: '#' }
    ]
  },

  'Mongolia': { lat: 46.86, lng: 103.85, flag: '🇲🇳', risk: 'clear', region: 'East Asia', pop: '3.4M', gdp: '$17B', leader: 'Khürelsükh', title: 'Stable Democracy',
    analysis: {
      what: 'Mongolia is a rare democracy sandwiched between Russia and China. Mining (copper, coal) drives the economy but creates environmental concerns. "Third neighbor" policy seeks ties with US, Japan, South Korea. Traditional nomadic culture persists alongside modernization.',
      why: 'Mongolia\'s democracy in a challenging neighborhood is remarkable. Its mineral resources are vast. The country provides a buffer between great powers. Traditional practices offer cultural heritage.',
      next: 'Balancing great power relations while developing resources. Watch for: mining development, democratic resilience, and neighbor relations.'
    },
    news: [
      { source: 'Reuters', bias: 'center', time: '3h ago', headline: 'Mining exports drive economic growth', url: '#' }
    ]
  },
  'Jamaica': { lat: 18.11, lng: -77.30, flag: '🇯🇲', risk: 'cloudy', region: 'Caribbean', pop: '3M', gdp: '$17B', leader: 'Holness', title: 'Tourism Economy', analysis: { what: 'Jamaica faces high crime rates and gang violence despite being a popular tourist destination. The economy relies heavily on tourism, remittances, and bauxite mining.', why: 'Jamaica is culturally influential globally through music and sports. Its strategic Caribbean location matters for US interests.', next: 'Addressing crime while growing tourism. Watch for: anti-gang initiatives and economic diversification.' }, news: [{ source: 'Jamaica Observer', bias: 'center', time: '4h ago', headline: 'Tourism numbers continue recovery', url: '#' }] },
  'Dominican Republic': { lat: 18.74, lng: -70.16, flag: '🇩🇴', risk: 'cloudy', region: 'Caribbean', pop: '11M', gdp: '$114B', leader: 'Abinader', title: 'Growing Economy', analysis: { what: 'The Dominican Republic has one of the fastest-growing economies in Latin America. Tourism and free trade zones drive growth. Haitian migration creates social tensions.', why: 'Strong growth makes it a regional success story. Relations with Haiti affect regional stability.', next: 'Sustaining growth while managing migration. Watch for: Haitian border issues and tourism development.' }, news: [{ source: 'Reuters', bias: 'center', time: '5h ago', headline: 'Economic growth outpaces regional average', url: '#' }] },
  'Trinidad and Tobago': { lat: 10.69, lng: -61.22, flag: '🇹🇹', risk: 'cloudy', region: 'Caribbean', pop: '1.4M', gdp: '$28B', leader: 'Rowley', title: 'Energy Exporter', analysis: { what: 'Trinidad and Tobago is the Caribbean\'s largest oil and gas producer. The economy is heavily dependent on energy exports. Crime and gang violence are growing concerns.', why: 'Energy resources make it relatively wealthy for the region. Venezuelan migration has increased.', next: 'Diversifying beyond energy while addressing crime.' }, news: [{ source: 'Reuters', bias: 'center', time: '6h ago', headline: 'Energy sector drives budget surplus', url: '#' }] },
  'Bahamas': { lat: 25.03, lng: -77.40, flag: '🇧🇸', risk: 'clear', region: 'Caribbean', pop: '400K', gdp: '$14B', leader: 'Davis', title: 'Tourism Hub', analysis: { what: 'The Bahamas economy depends almost entirely on tourism and financial services. Climate change and hurricanes pose existential threats to the low-lying islands.', why: 'Proximity to US makes it a major tourist destination. Climate vulnerability is among the highest globally.', next: 'Building climate resilience while growing tourism.' }, news: [{ source: 'Tribune', bias: 'center', time: '4h ago', headline: 'Cruise tourism hits record numbers', url: '#' }] },
  'Barbados': { lat: 13.19, lng: -59.54, flag: '🇧🇧', risk: 'clear', region: 'Caribbean', pop: '288K', gdp: '$6B', leader: 'Mottley', title: 'Climate Advocate', analysis: { what: 'Barbados became a republic in 2021. PM Mottley is a global voice on climate finance and debt restructuring for developing nations.', why: 'Mottley\'s climate advocacy gives it outsized influence. The Bridgetown Initiative on climate finance has global impact.', next: 'Leading climate finance reform efforts.' }, news: [{ source: 'Barbados Today', bias: 'center', time: '5h ago', headline: 'Climate finance initiative gains support', url: '#' }] },
  'Guatemala': { lat: 15.78, lng: -90.23, flag: '🇬🇹', risk: 'stormy', region: 'Central America', pop: '17M', gdp: '$95B', leader: 'Arévalo', title: 'Democratic Transition', analysis: { what: 'President Arévalo took office in 2024 after attempts to block his inauguration. Corruption remains endemic. Guatemala is a major source of US-bound migration.', why: 'Democratic backsliding threatened but was resisted. Migration flows affect US politics.', next: 'Testing whether reforms can succeed against entrenched interests.' }, news: [{ source: 'Reuters', bias: 'center', time: '4h ago', headline: 'New president pushes anti-corruption agenda', url: '#' }] },
  'Honduras': { lat: 14.08, lng: -87.21, flag: '🇭🇳', risk: 'stormy', region: 'Central America', pop: '10M', gdp: '$32B', leader: 'Nasry Asfura', title: 'Reform Efforts', analysis: { what: 'President Xiomara Castro is the first female president, elected on anti-corruption platform. Gang violence remains severe.', why: 'High violence drives migration northward. China switch affects regional geopolitics.', next: 'Reducing violence and corruption.' }, news: [{ source: 'Reuters', bias: 'center', time: '5h ago', headline: 'Government announces anti-gang measures', url: '#' }] },
  'Belize': { lat: 17.19, lng: -88.50, flag: '🇧🇿', risk: 'cloudy', region: 'Central America', pop: '430K', gdp: '$3.3B', leader: 'Briceño', title: 'Diverse Nation', analysis: { what: 'Belize is the only English-speaking Central American country. Tourism and agriculture drive the economy apply.', why: 'Barrier reef is a major tourist attraction and environmental concern.', next: 'Protecting environment while growing economy.' }, news: [{ source: 'Amandala', bias: 'center', time: '6h ago', headline: 'Reef conservation efforts intensify', url: '#' }] },
  'Panama': { lat: 9.10, lng: -79.40, flag: '🇵🇦', risk: 'cloudy', region: 'Central America', pop: '4.4M', gdp: '$77B', leader: 'Mulino', title: 'Canal State', analysis: { what: 'The Panama Canal is essential to global trade. Drought has restricted canal capacity. Darien Gap migration surges.', why: 'Canal disruptions affect global supply chains. Darien migration is a humanitarian crisis.', next: 'Managing water resources and migration.' }, news: [{ source: 'Reuters', bias: 'center', time: '4h ago', headline: 'Canal drought restrictions continue', url: '#' }] },
  'Paraguay': { lat: -23.44, lng: -58.44, flag: '🇵🇾', risk: 'cloudy', region: 'South America', pop: '7M', gdp: '$44B', leader: 'Peña', title: 'Landlocked Nation', analysis: { what: 'Paraguay is landlocked and dependent on hydroelectric exports. Soy and beef are major exports. The country maintains relations with Taiwan.', why: 'Hydroelectric partnership with Brazil is significant. Taiwan recognition makes it geopolitically notable.', next: 'Balancing development and environment.' }, news: [{ source: 'ABC', bias: 'center', time: '5h ago', headline: 'Hydroelectric exports boost revenues', url: '#' }] },
  'Suriname': { lat: 3.92, lng: -56.03, flag: '🇸🇷', risk: 'cloudy', region: 'South America', pop: '620K', gdp: '$4B', leader: 'Santokhi', title: 'Oil Potential', analysis: { what: 'Major offshore oil discoveries could transform Suriname\'s economy. The former Dutch colony is ethnically diverse.', why: 'Oil discoveries make it potentially wealthy. Democratic transition from Bouterse era is important.', next: 'Managing potential oil wealth responsibly.' }, news: [{ source: 'Starnieuws', bias: 'center', time: '6h ago', headline: 'Oil development plans advance', url: '#' }] },
  'Albania': { lat: 41.33, lng: 19.82, flag: '🇦🇱', risk: 'cloudy', region: 'Europe', pop: '2.8M', gdp: '$23B', leader: 'Rama', title: 'EU Aspirant', analysis: { what: 'Albania is pursuing EU membership and has made reforms. Tourism is growing. Organized crime and corruption remain challenges.', why: 'EU accession process drives reforms. Strategic location on Adriatic.', next: 'Continuing EU accession path.' }, news: [{ source: 'Exit News', bias: 'center', time: '5h ago', headline: 'EU integration talks continue', url: '#' }] },
  'North Macedonia': { lat: 41.51, lng: 21.75, flag: '🇲🇰', risk: 'cloudy', region: 'Europe', pop: '2.1M', gdp: '$15B', leader: 'Siljanovska-Davkova', title: 'NATO Member', analysis: { what: 'Joined NATO in 2020 after name change agreement with Greece. EU membership blocked by Bulgaria over historical disputes.', why: 'Name dispute resolution was historic achievement. EU path blocked creates frustration.', next: 'Resolving Bulgaria dispute for EU path.' }, news: [{ source: 'MIA', bias: 'center', time: '6h ago', headline: 'EU membership negotiations stalled', url: '#' }] },
  'Montenegro': { lat: 42.44, lng: 19.26, flag: '🇲🇪', risk: 'cloudy', region: 'Europe', pop: '620K', gdp: '$7B', leader: 'Milatović', title: 'NATO Member', analysis: { what: 'Montenegro joined NATO in 2017 and seeks EU membership. Russian influence and investment has been significant.', why: 'NATO membership despite Russian pressure was notable. EU frontrunner in Western Balkans.', next: 'Advancing EU accession while managing influences.' }, news: [{ source: 'Vijesti', bias: 'center', time: '5h ago', headline: 'EU accession talks progress', url: '#' }] },
  'Kosovo': { lat: 42.57, lng: 20.90, flag: '🇽🇰', risk: 'stormy', region: 'Europe', pop: '1.8M', gdp: '$10B', leader: 'Osmani', title: 'Disputed Territory', analysis: { what: 'Kosovo declared independence from Serbia in 2008 but is not universally recognized. Tensions with Serbia remain high.', why: 'Serbia-Kosovo tensions risk regional instability. Recognition dispute affects international participation.', next: 'Normalizing Serbia relations remains key.' }, news: [{ source: 'Prishtina Insight', bias: 'center', time: '4h ago', headline: 'EU-mediated talks with Serbia resume', url: '#' }] },
  'Bosnia and Herzegovina': { lat: 43.92, lng: 17.68, flag: '🇧🇦', risk: 'stormy', region: 'Europe', pop: '3.2M', gdp: '$28B', leader: 'Bećirović', title: 'Complex State', analysis: { what: 'Bosnia\'s Dayton Agreement structure creates dysfunction. Republika Srpska leader Dodik threatens secession.', why: 'Secession threats risk renewed conflict. EU path blocked by political dysfunction.', next: 'Preventing further fragmentation.' }, news: [{ source: 'Klix', bias: 'center', time: '5h ago', headline: 'Political tensions remain high', url: '#' }] },
  'Cyprus': { lat: 35.17, lng: 33.36, flag: '🇨🇾', risk: 'cloudy', region: 'Europe', pop: '1.3M', gdp: '$32B', leader: 'Christodoulides', title: 'Divided Island', analysis: { what: 'Cyprus remains divided between Greek south and Turkish-occupied north. Reunification talks have repeatedly failed.', why: 'Division affects EU-Turkey relations. Gas discoveries in eastern Mediterranean raise stakes.', next: 'Reunification prospects remain dim.' }, news: [{ source: 'Cyprus Mail', bias: 'center', time: '6h ago', headline: 'Reunification talks show no progress', url: '#' }] },
  'Bulgaria': { lat: 42.73, lng: 25.49, flag: '🇧🇬', risk: 'cloudy', region: 'Europe', pop: '6.5M', gdp: '$100B', leader: 'Zhelezkov', title: 'EU Member', analysis: { what: 'Bulgaria has faced repeated political instability with multiple elections. Corruption remains endemic.', why: 'Poorest EU member struggles with rule of law. Russian influence historically significant.', next: 'Achieving political stability.' }, news: [{ source: 'Novinite', bias: 'center', time: '5h ago', headline: 'Political negotiations continue', url: '#' }] },
  'Slovakia': { lat: 48.67, lng: 19.70, flag: '🇸🇰', risk: 'cloudy', region: 'Europe', pop: '5.4M', gdp: '$133B', leader: 'Fico', title: 'EU Dissent', analysis: { what: 'PM Fico returned to power with pro-Russian rhetoric and opposition to Ukraine aid. Assassination attempt in 2024 shocked the country.', why: 'Breaking EU consensus on Ukraine matters. Rule of law concerns affect EU relations.', next: 'Watching democratic trajectory.' }, news: [{ source: 'SME', bias: 'center', time: '4h ago', headline: 'Government faces EU criticism', url: '#' }] },
  'Cameroon': { lat: 5.95, lng: 10.15, flag: '🇨🇲', risk: 'severe', region: 'Africa', pop: '28M', gdp: '$46B', leader: 'Biya', title: 'Anglophone Crisis', analysis: { what: 'President Biya has ruled since 1982. Anglophone regions face violent separatist conflict.', why: 'Anglophone crisis has killed thousands and displaced millions. Biya\'s age creates succession uncertainty.', next: 'Succession planning is overdue.' }, news: [{ source: 'Journal du Cameroun', bias: 'center', time: '5h ago', headline: 'Anglophone crisis continues', url: '#' }] },
  'Chad': { lat: 15.45, lng: 18.73, flag: '🇹🇩', risk: 'severe', region: 'Africa', pop: '18M', gdp: '$13B', leader: 'Déby', title: 'Military Rule', analysis: { what: 'Mahamat Déby took power after his father was killed in 2021. The country hosts French and US military bases.', why: 'Strategic importance for Sahel counterterrorism is high. Refugee flows from Sudan add pressure.', next: 'Watching promised democratic transition.' }, news: [{ source: 'Alwihda', bias: 'center', time: '6h ago', headline: 'Transition government extends timeline', url: '#' }] },
  'Central African Republic': { lat: 6.61, lng: 20.94, flag: '🇨🇫', risk: 'severe', region: 'Africa', pop: '5M', gdp: '$2.5B', leader: 'Touadéra', title: 'Wagner Presence', analysis: { what: 'CAR has been in civil war since 2012. Russian Wagner forces support the government and exploit resources.', why: 'Wagner expansion model was tested here. Humanitarian crisis affects most of population.', next: 'Continued instability likely.' }, news: [{ source: 'RFI', bias: 'center', time: '5h ago', headline: 'Security situation remains fragile', url: '#' }] },
  'Republic of Congo': { lat: -4.27, lng: 15.28, flag: '🇨🇬', risk: 'stormy', region: 'Africa', pop: '6M', gdp: '$13B', leader: 'Sassou Nguesso', title: 'Oil State', analysis: { what: 'President Sassou Nguesso has ruled for most of the period since 1979. Oil revenue dominates but benefits few.', why: 'Oil dependence creates boom-bust cycles. Chinese debt is significant.', next: 'Managing oil decline and debt.' }, news: [{ source: 'AFP', bias: 'center', time: '6h ago', headline: 'Oil production declines continue', url: '#' }] },
  'Gabon': { lat: -0.80, lng: 11.61, flag: '🇬🇦', risk: 'stormy', region: 'Africa', pop: '2.4M', gdp: '$21B', leader: 'Oligui Nguema', title: 'Post-Coup Transition', analysis: { what: 'Military coup in 2023 ended the Bongo family\'s 56-year rule. Junta promises democratic transition.', why: 'Coup shows fragility of dynastic rule in Africa. Transition timeline uncertain.', next: 'Watching promised democratization.' }, news: [{ source: 'Gabon Review', bias: 'center', time: '5h ago', headline: 'Transition government announces reforms', url: '#' }] },
  'Equatorial Guinea': { lat: 1.65, lng: 10.27, flag: '🇬🇶', risk: 'stormy', region: 'Africa', pop: '1.7M', gdp: '$12B', leader: 'Obiang', title: 'Oil Dictatorship', analysis: { what: 'Teodoro Obiang has ruled since 1979, making him the world\'s longest-ruling president. Oil wealth benefits the elite.', why: 'Extreme inequality despite oil wealth is stark. Human rights abuses are severe.', next: 'Continued authoritarian rule expected.' }, news: [{ source: 'EG Justice', bias: 'center', time: '6h ago', headline: 'Human rights concerns persist', url: '#' }] },
  'Eritrea': { lat: 15.33, lng: 38.93, flag: '🇪🇷', risk: 'severe', region: 'Africa', pop: '3.6M', gdp: '$2.3B', leader: 'Isaias', title: 'Isolated State', analysis: { what: 'Eritrea is one of the world\'s most repressive states with no elections since independence. Indefinite military conscription drives mass emigration.', why: 'Tigray involvement showed regional destabilization capacity. No constitution or independent media.', next: 'Continued isolation and repression likely.' }, news: [{ source: 'Eritrea Hub', bias: 'center', time: '5h ago', headline: 'International isolation continues', url: '#' }] },
  'Djibouti': { lat: 11.59, lng: 43.15, flag: '🇩🇯', risk: 'cloudy', region: 'Africa', pop: '1M', gdp: '$4B', leader: 'Guelleh', title: 'Strategic Port', analysis: { what: 'Djibouti hosts military bases from US, France, China, Japan, and others. Its port handles most of Ethiopia\'s trade.', why: 'Strategic location at Bab el-Mandeb strait is vital. Chinese base was their first overseas.', next: 'Maintaining strategic balancing act.' }, news: [{ source: 'La Nation', bias: 'center', time: '6h ago', headline: 'Port expansion plans announced', url: '#' }] },
  'Rwanda': { lat: -1.94, lng: 29.87, flag: '🇷🇼', risk: 'stormy', region: 'Africa', pop: '14M', gdp: '$14B', leader: 'Kagame', title: 'Development Model', analysis: { what: 'Rwanda has achieved remarkable development under Kagame but with authoritarian control. The country is accused of backing M23 rebels in DRC.', why: 'Development success comes with democratic concerns. DRC involvement risks regional war.', next: 'Balancing development and rights.' }, news: [{ source: 'The New Times', bias: 'center', time: '5h ago', headline: 'Economic growth continues', url: '#' }] },
  'Burundi': { lat: -3.37, lng: 29.36, flag: '🇧🇮', risk: 'severe', region: 'Africa', pop: '13M', gdp: '$3B', leader: 'Ndayishimiye', title: 'Post-Crisis State', analysis: { what: 'Burundi faced political crisis in 2015. Current President has slightly eased repression. Extreme poverty persists.', why: 'Ethnic tensions mirror Rwanda\'s history. Among world\'s poorest countries.', next: 'Gradual opening or renewed repression.' }, news: [{ source: 'Iwacu', bias: 'center', time: '6h ago', headline: 'Government eases some restrictions', url: '#' }] },
  'Uganda': { lat: 1.37, lng: 32.29, flag: '🇺🇬', risk: 'stormy', region: 'Africa', pop: '48M', gdp: '$50B', leader: 'Museveni', title: 'Long-Term Rule', analysis: { what: 'Museveni has ruled since 1986. Anti-LGBTQ law drew international sanctions. Oil production is beginning.', why: 'Anti-LGBTQ law affected aid and investment. Young population could drive unrest.', next: 'Succession planning for aging ruler.' }, news: [{ source: 'Daily Monitor', bias: 'center', time: '5h ago', headline: 'Oil production ramp-up continues', url: '#' }] },
  'South Sudan': { lat: 6.88, lng: 31.31, flag: '🇸🇸', risk: 'extreme', region: 'Africa', pop: '11M', gdp: '$4B', leader: 'Kiir', title: 'Failed State', analysis: { what: 'The world\'s newest country has been in civil war most of its existence. Peace deal has not been fully implemented.', why: 'Humanitarian crisis affects millions. State barely functions outside capital.', next: 'Elections repeatedly delayed.' }, news: [{ source: 'Radio Tamazuj', bias: 'center', time: '4h ago', headline: 'Elections delayed again', url: '#' }] },
  'Mauritania': { lat: 18.09, lng: -15.98, flag: '🇲🇷', risk: 'cloudy', region: 'Africa', pop: '5M', gdp: '$10B', leader: 'Ghazouani', title: 'Sahel Stability', analysis: { what: 'Mauritania has avoided the coups and jihadi violence affecting neighbors. Growing gas production could transform economy.', why: 'Relative stability in unstable region is notable. Gas potential could be transformative.', next: 'Maintaining stability amid regional turmoil.' }, news: [{ source: 'Sahara Médias', bias: 'center', time: '6h ago', headline: 'Gas development plans advance', url: '#' }] },
  'Gambia': { lat: 13.44, lng: -16.69, flag: '🇬🇲', risk: 'cloudy', region: 'Africa', pop: '2.7M', gdp: '$2.4B', leader: 'Barrow', title: 'Democratic Transition', analysis: { what: 'Gambia transitioned from Jammeh\'s dictatorship in 2017 after he refused to accept election defeat.', why: 'Democratic transition was remarkable. Truth and reconciliation process ongoing.', next: 'Consolidating democracy.' }, news: [{ source: 'The Point', bias: 'center', time: '5h ago', headline: 'Truth commission releases findings', url: '#' }] },
  'Guinea': { lat: 9.95, lng: -9.70, flag: '🇬🇳', risk: 'stormy', region: 'Africa', pop: '14M', gdp: '$21B', leader: 'Doumbouya', title: 'Military Junta', analysis: { what: 'Military coup in 2021 overthrew President Condé. Massive bauxite and iron ore reserves attract Chinese investment.', why: 'Mining resources make it strategically important. Democratic transition timeline is unclear.', next: 'Watching promised transition.' }, news: [{ source: 'Guinee7', bias: 'center', time: '6h ago', headline: 'Opposition protests face crackdown', url: '#' }] },
  'Guinea-Bissau': { lat: 11.86, lng: -15.60, flag: '🇬🇼', risk: 'stormy', region: 'Africa', pop: '2.1M', gdp: '$2B', leader: 'Embaló', title: 'Narco State', analysis: { what: 'Guinea-Bissau is a major cocaine transit point to Europe. Political instability and coup attempts are frequent.', why: 'Drug trafficking corrupts state institutions. Among world\'s poorest countries.', next: 'Breaking the instability cycle.' }, news: [{ source: 'RFI', bias: 'center', time: '5h ago', headline: 'Drug trafficking concerns persist', url: '#' }] },
  'Sierra Leone': { lat: 8.48, lng: -13.23, flag: '🇸🇱', risk: 'cloudy', region: 'Africa', pop: '8.6M', gdp: '$4.5B', leader: 'Bio', title: 'Post-War Recovery', analysis: { what: 'Sierra Leone has rebuilt since the brutal civil war ended in 2002. 2023 election was disputed by opposition.', why: 'Post-war stability shows recovery is possible. Development indicators remain very low.', next: 'Resolving political tensions.' }, news: [{ source: 'Awoko', bias: 'center', time: '6h ago', headline: 'Post-election tensions ease', url: '#' }] },
  'Liberia': { lat: 6.43, lng: -9.43, flag: '🇱🇷', risk: 'cloudy', region: 'Africa', pop: '5.4M', gdp: '$4B', leader: 'Boakai', title: 'New Leadership', analysis: { what: 'Joseph Boakai won 2023 election, defeating incumbent Weah. Founded by freed American slaves, Liberia has US ties.', why: 'Peaceful transfer of power was democratic milestone. US historical ties are unique in Africa.', next: 'New government faces development challenges.' }, news: [{ source: 'Front Page Africa', bias: 'center', time: '5h ago', headline: 'New government announces priorities', url: '#' }] },
  'Ivory Coast': { lat: 7.54, lng: -5.55, flag: '🇨🇮', risk: 'cloudy', region: 'Africa', pop: '29M', gdp: '$80B', leader: 'Ouattara', title: 'Economic Leader', analysis: { what: 'Ivory Coast is the world\'s largest cocoa producer and West Africa\'s largest economy.', why: 'Economic importance to region is significant. Cocoa industry faces sustainability challenges.', next: 'Managing succession and economic growth.' }, news: [{ source: 'Abidjan.net', bias: 'center', time: '6h ago', headline: 'Economic growth remains strong', url: '#' }] },
  'Togo': { lat: 6.17, lng: 1.23, flag: '🇹🇬', risk: 'stormy', region: 'Africa', pop: '9M', gdp: '$9B', leader: 'Gnassingbé', title: 'Dynasty Rule', analysis: { what: 'The Gnassingbé family has ruled since 1967. Constitutional changes in 2024 extended presidential power.', why: 'Dynastic rule shows authoritarian persistence. Democratic space is very limited.', next: 'Continued family rule expected.' }, news: [{ source: 'Togo First', bias: 'center', time: '5h ago', headline: 'Constitutional changes implemented', url: '#' }] },
  'Benin': { lat: 9.31, lng: 2.32, flag: '🇧🇯', risk: 'cloudy', region: 'Africa', pop: '13M', gdp: '$19B', leader: 'Talon', title: 'Democratic Backslide', analysis: { what: 'Once a democratic model, Benin has seen backsliding under President Talon. Opposition leaders imprisoned or exiled.', why: 'Democratic decline in former model is concerning. Opposition space has shrunk dramatically.', next: 'Watching political trajectory.' }, news: [{ source: 'La Nation', bias: 'center', time: '6h ago', headline: 'Economic reforms continue', url: '#' }] },
  'Ghana': { lat: 7.95, lng: -1.02, flag: '🇬🇭', risk: 'cloudy', region: 'Africa', pop: '34M', gdp: '$79B', leader: 'Mahama', title: 'Democratic Model', analysis: { what: 'Ghana is considered one of Africa\'s most stable democracies. Economic crisis led to IMF bailout.', why: 'Democratic stability makes it regional anchor. Peaceful elections are regular occurrence.', next: 'Economic recovery under new government.' }, news: [{ source: 'GhanaWeb', bias: 'center', time: '5h ago', headline: 'New government tackles economic crisis', url: '#' }] },
  'Cape Verde': { lat: 15.12, lng: -23.61, flag: '🇨🇻', risk: 'clear', region: 'Africa', pop: '600K', gdp: '$2.5B', leader: 'Neves', title: 'Island Democracy', analysis: { what: 'Cape Verde is one of Africa\'s most stable democracies. Tourism drives the economy.', why: 'Democratic stability is exemplary for region. Geographic isolation limits options.', next: 'Diversifying tourism-dependent economy.' }, news: [{ source: 'A Semana', bias: 'center', time: '6h ago', headline: 'Tourism sector expands', url: '#' }] },
  'Madagascar': { lat: -18.77, lng: 46.87, flag: '🇲🇬', risk: 'stormy', region: 'Africa', pop: '30M', gdp: '$16B', leader: 'Rajoelina', title: 'Biodiversity Hotspot', analysis: { what: 'Madagascar has unique biodiversity found nowhere else. Deforestation threatens endemic species. Poverty is widespread.', why: 'Environmental destruction is irreversible loss. Unique wildlife draws conservation attention.', next: 'Balancing development and conservation.' }, news: [{ source: 'L\'Express de Madagascar', bias: 'center', time: '5h ago', headline: 'Conservation challenges continue', url: '#' }] },
  'Mauritius': { lat: -20.35, lng: 57.55, flag: '🇲🇺', risk: 'clear', region: 'Africa', pop: '1.3M', gdp: '$15B', leader: 'Ramgoolam', title: 'Success Story', analysis: { what: 'Mauritius transformed from sugar monoculture to diversified economy with tourism, textiles, and financial services.', why: 'Economic success model for small islands. Democratic stability is exceptional for region.', next: 'Sustaining economic diversification.' }, news: [{ source: 'L\'Express', bias: 'center', time: '6h ago', headline: 'Financial sector continues growth', url: '#' }] },
  'Seychelles': { lat: -4.68, lng: 55.49, flag: '🇸🇨', risk: 'clear', region: 'Africa', pop: '100K', gdp: '$1.7B', leader: 'Patrick Herminie', title: 'Tourism Paradise', analysis: { what: 'Seychelles has the highest GDP per capita in Africa. Tourism and fishing drive the economy.', why: 'Economic success shows small state potential. Environmental vulnerability is extreme.', next: 'Adapting to climate change.' }, news: [{ source: 'Seychelles News Agency', bias: 'center', time: '5h ago', headline: 'Marine conservation efforts expand', url: '#' }] },
  'Malawi': { lat: -13.97, lng: 33.79, flag: '🇲🇼', risk: 'cloudy', region: 'Africa', pop: '21M', gdp: '$14B', leader: 'Peter Mutharika', title: 'Landlocked Struggle', analysis: { what: 'Malawi overturned a fraudulent election in 2020, a democratic milestone. The landlocked country is one of the world\'s poorest.', why: 'Election overturn was remarkable democratic moment. Poverty and underdevelopment are severe.', next: 'Building on democratic gains.' }, news: [{ source: 'Nyasa Times', bias: 'center', time: '6h ago', headline: 'Government pushes development agenda', url: '#' }] },
  'Zambia': { lat: -15.39, lng: 28.32, flag: '🇿🇲', risk: 'cloudy', region: 'Africa', pop: '20M', gdp: '$29B', leader: 'Hichilema', title: 'Copper Economy', analysis: { what: 'Zambia defaulted on debt in 2020. New president Hichilema is pursuing reforms and debt restructuring.', why: 'Debt restructuring tests international mechanisms. Copper demand for green transition is rising.', next: 'Managing debt and copper opportunity.' }, news: [{ source: 'Lusaka Times', bias: 'center', time: '5h ago', headline: 'Debt restructuring advances', url: '#' }] },
  'Zimbabwe': { lat: -19.02, lng: 29.15, flag: '🇿🇼', risk: 'stormy', region: 'Africa', pop: '16M', gdp: '$35B', leader: 'Mnangagwa', title: 'Economic Crisis', analysis: { what: 'Zimbabwe continues to face economic crisis with hyperinflation. Lithium resources attract interest.', why: 'Economic collapse has devastated population. Elections are not free or fair.', next: 'Economic stabilization remains elusive.' }, news: [{ source: 'NewsDay', bias: 'center', time: '6h ago', headline: 'Economic challenges persist', url: '#' }] },
  'Mozambique': { lat: -18.67, lng: 35.53, flag: '🇲🇿', risk: 'severe', region: 'Africa', pop: '33M', gdp: '$20B', leader: 'Nyusi', title: 'Insurgency Threat', analysis: { what: 'Mozambique faces ISIS-linked insurgency in gas-rich Cabo Delgado. Massive LNG projects are delayed by insecurity.', why: 'Gas resources could transform economy if security achieved. Election violence shows political fragility.', next: 'Security situation determines gas future.' }, news: [{ source: 'Club of Mozambique', bias: 'center', time: '5h ago', headline: 'Security concerns affect gas projects', url: '#' }] },
  'Namibia': { lat: -22.96, lng: 18.49, flag: '🇳🇦', risk: 'clear', region: 'Africa', pop: '2.6M', gdp: '$14B', leader: 'Nandi-Ndaitwah', title: 'Stable Democracy', analysis: { what: 'Namibia is one of Africa\'s most stable democracies. First female president elected in 2024.', why: 'Democratic stability is exemplary. First female president is milestone.', next: 'New leadership era begins.' }, news: [{ source: 'The Namibian', bias: 'center', time: '6h ago', headline: 'New president outlines priorities', url: '#' }] },
  'Angola': { lat: -11.20, lng: 17.87, flag: '🇦🇴', risk: 'stormy', region: 'Africa', pop: '36M', gdp: '$118B', leader: 'Lourenço', title: 'Oil Giant', analysis: { what: 'Angola is Africa\'s second-largest oil producer. President Lourenço has pursued anti-corruption campaign.', why: 'Oil revenues haven\'t reduced poverty. Economic diversification urgently needed.', next: 'Managing oil decline and debt.' }, news: [{ source: 'Club-K', bias: 'center', time: '5h ago', headline: 'Anti-corruption campaign continues', url: '#' }] },
  'Jordan': { lat: 31.95, lng: 35.93, flag: '🇯🇴', risk: 'cloudy', region: 'Middle East', pop: '11M', gdp: '$51B', leader: 'Abdullah II', title: 'Regional Stability', analysis: { what: 'Jordan hosts millions of refugees from neighboring conflicts and multiple US military facilities used for training and operations. Following the February 28 US-Israeli strikes on Iran, these bases face heightened risk of Iranian proxy retaliation from Iraqi Shia militias operating near Jordan\'s borders.', why: 'Jordan\'s US military presence makes it a potential target in the Iran conflict. The kingdom is a critical US ally bordering Iraq, Syria, and Israel — all active fronts. Refugee burden and water scarcity compound the strategic pressure.', next: 'Watch for: Iranian proxy attacks near Jordanian borders, US force posture changes, refugee flows from any wider regional conflict, and whether Jordan\'s neutrality can hold under pressure.' }, news: [{ source: 'Jordan Times', bias: 'center', time: '2h ago', headline: 'Jordan on alert as US-Iran conflict escalates', url: '#' }] },
  'Kuwait': { lat: 29.38, lng: 47.99, flag: '🇰🇼', risk: 'clear', region: 'Middle East', pop: '4.3M', gdp: '$165B', leader: 'Mishal', title: 'Oil Wealth', analysis: { what: 'Kuwait has massive oil wealth and hosts major US military installations including Camp Arifjan (US Army Central Command forward HQ) and Ali Al Salem Air Base. Following the February 28 US-Israeli strikes on Iran, these bases face heightened risk of Iranian retaliation — Kuwait is closer to Iran than most Gulf states.', why: 'Camp Arifjan and Ali Al Salem are critical US logistics and staging bases for the Iran campaign. Kuwait\'s proximity to Iran and Iraq makes it vulnerable to both direct Iranian missile strikes and proxy attacks from Iraqi Shia militias. Oil infrastructure is also at risk.', next: 'Watch for: Iranian threats against Kuwaiti territory, US force protection measures, and whether Kuwait\'s oil exports are disrupted. Kuwait\'s 1990 invasion by Iraq makes the country acutely sensitive to regional military escalation.' }, news: [{ source: 'Kuwait Times', bias: 'center', time: '2h ago', headline: 'Kuwait on alert as US bases face Iranian retaliation threat', url: '#' }] },
  'Bahrain': { lat: 26.23, lng: 50.59, flag: '🇧🇭', risk: 'cloudy', region: 'Middle East', pop: '1.5M', gdp: '$46B', leader: 'Hamad', title: 'US 5th Fleet HQ', analysis: { what: 'Bahrain hosts the headquarters of the US Navy\'s Fifth Fleet — the command center for all US naval operations in the Persian Gulf, Arabian Sea, and Red Sea. Following the February 28 US-Israeli strikes on Iran, the Fifth Fleet HQ is a high-priority Iranian retaliation target. Bahrain\'s Shia majority population has historical ties to Iran, adding internal instability risk.', why: 'The Fifth Fleet HQ makes Bahrain the most strategically important US naval facility in the Middle East during the Iran conflict. Bahrain is only 200km from Iran across the Persian Gulf — within easy range of Iranian missiles. The Shia majority could be mobilized by Iran, as happened during the 2011 protests.', next: 'Watch for: Iranian threats against the Fifth Fleet, internal Shia unrest, and whether Bahrain\'s small territory can be defended against Iranian missile salvos. Naval operations in the Strait of Hormuz are coordinated from here — making it essential to US force projection.' }, news: [{ source: 'GDN Online', bias: 'center', time: '2h ago', headline: 'Fifth Fleet on high alert as Iran conflict erupts', url: '#' }] },
  'Kazakhstan': { lat: 48.02, lng: 66.92, flag: '🇰🇿', risk: 'cloudy', region: 'Central Asia', pop: '20M', gdp: '$260B', leader: 'Tokayev', title: 'Energy Giant', analysis: { what: 'Kazakhstan is Central Asia\'s largest economy with vast oil and mineral resources. 2022 unrest required Russian intervention.', why: 'Energy resources make it strategically important. Balancing Russia and West is challenging.', next: 'Navigating between great powers.' }, news: [{ source: 'Astana Times', bias: 'center', time: '6h ago', headline: 'Oil exports to Europe increase', url: '#' }] },
  'Uzbekistan': { lat: 41.38, lng: 64.59, flag: '🇺🇿', risk: 'cloudy', region: 'Central Asia', pop: '36M', gdp: '$92B', leader: 'Mirziyoyev', title: 'Opening Up', analysis: { what: 'Uzbekistan has liberalized significantly since 2016. Cotton forced labor has been reduced.', why: 'Reform trajectory contrasts with neighbors. Largest Central Asian population.', next: 'Sustaining reform momentum.' }, news: [{ source: 'Kun.uz', bias: 'center', time: '5h ago', headline: 'Economic reforms attract investment', url: '#' }] },
  'Turkmenistan': { lat: 38.97, lng: 59.56, flag: '🇹🇲', risk: 'stormy', region: 'Central Asia', pop: '6.5M', gdp: '$60B', leader: 'Berdimuhamedow', title: 'Isolated State', analysis: { what: 'Turkmenistan is one of the world\'s most repressive and isolated states. Massive gas reserves but only exports to China.', why: 'Gas dependence on China is total. Reliable information barely exists.', next: 'Continued isolation likely.' }, news: [{ source: 'Chronicles of Turkmenistan', bias: 'center', time: '6h ago', headline: 'Economic situation unclear', url: '#' }] },
  'Tajikistan': { lat: 38.86, lng: 71.28, flag: '🇹🇯', risk: 'stormy', region: 'Central Asia', pop: '10M', gdp: '$12B', leader: 'Rahmon', title: 'Authoritarian Rule', analysis: { what: 'President Rahmon has ruled since 1994. Taliban control of Afghanistan border raises security concerns.', why: 'Border with Taliban Afghanistan is risk. Remittances from Russia crucial.', next: 'Managing Afghanistan spillover risks.' }, news: [{ source: 'Asia-Plus', bias: 'center', time: '5h ago', headline: 'Border security measures increase', url: '#' }] },
  'Kyrgyzstan': { lat: 41.20, lng: 74.77, flag: '🇰🇬', risk: 'stormy', region: 'Central Asia', pop: '7M', gdp: '$12B', leader: 'Japarov', title: 'Populist Rule', analysis: { what: 'Kyrgyzstan has had multiple revolutions. Border clashes with Tajikistan are recurring.', why: 'Most open society in Central Asia now closing. Border disputes risk regional stability.', next: 'Political trajectory uncertain.' }, news: [{ source: 'Kloop', bias: 'center', time: '6h ago', headline: 'Border tensions with Tajikistan continue', url: '#' }] },
  'Nepal': { lat: 28.39, lng: 84.12, flag: '🇳🇵', risk: 'cloudy', region: 'South Asia', pop: '30M', gdp: '$42B', leader: 'Oli', title: 'Himalayan Nation', analysis: { what: 'Nepal transitioned from monarchy to republic in 2008. Caught between China and India.', why: 'Strategic location between giants shapes policy. Hydropower potential is vast.', next: 'Balancing China-India relations.' }, news: [{ source: 'Kathmandu Post', bias: 'center', time: '5h ago', headline: 'Government navigates regional pressures', url: '#' }] },
  'Bhutan': { lat: 27.51, lng: 90.43, flag: '🇧🇹', risk: 'clear', region: 'South Asia', pop: '780K', gdp: '$3B', leader: 'Tshering', title: 'Happiness Index', analysis: { what: 'Bhutan measures Gross National Happiness alongside GDP. The Buddhist kingdom has carefully managed modernization.', why: 'Alternative development model draws attention. Carbon negative country.', next: 'Maintaining unique development path.' }, news: [{ source: 'Kuensel', bias: 'center', time: '6h ago', headline: 'Happiness indicators remain stable', url: '#' }] },
  'Maldives': { lat: 3.20, lng: 73.22, flag: '🇲🇻', risk: 'cloudy', region: 'South Asia', pop: '520K', gdp: '$7B', leader: 'Muizzu', title: 'Climate Frontline', analysis: { what: 'The Maldives faces existential threat from rising seas. New president shifted toward China from India.', why: 'Climate vulnerability is extreme. India-China competition plays out here.', next: 'Adapting to climate change or relocating.' }, news: [{ source: 'Maldives Independent', bias: 'center', time: '5h ago', headline: 'Climate adaptation projects advance', url: '#' }] },
  'Cambodia': { lat: 12.57, lng: 104.99, flag: '🇰🇭', risk: 'stormy', region: 'Southeast Asia', pop: '17M', gdp: '$32B', leader: 'Hun Manet', title: 'Dynastic Succession', analysis: { what: 'Hun Sen ruled for 38 years before handing power to son Hun Manet. Opposition is crushed.', why: 'Dynastic succession consolidates family power. Democratic space has vanished.', next: 'Continued authoritarian rule under new generation.' }, news: [{ source: 'VOD', bias: 'center', time: '6h ago', headline: 'New leader consolidates power', url: '#' }] },
  'Laos': { lat: 17.97, lng: 102.63, flag: '🇱🇦', risk: 'stormy', region: 'Southeast Asia', pop: '7.5M', gdp: '$15B', leader: 'Sonexay', title: 'Debt Trapped', analysis: { what: 'Laos has massive Chinese debt from infrastructure projects. The communist state is one of few remaining.', why: 'Debt trap diplomacy concerns are real. Hydropower creates regional dependencies.', next: 'Managing unsustainable debt.' }, news: [{ source: 'Vientiane Times', bias: 'center', time: '5h ago', headline: 'Debt management discussions continue', url: '#' }] },
  'Brunei': { lat: 4.54, lng: 114.73, flag: '🇧🇳', risk: 'clear', region: 'Southeast Asia', pop: '450K', gdp: '$18B', leader: 'Hassanal Bolkiah', title: 'Oil Sultanate', analysis: { what: 'Brunei is an absolute monarchy with oil wealth. Sultan has ruled since 1967.', why: 'Oil wealth enables generous welfare state. Sharia law implementation drew criticism.', next: 'Diversifying before oil runs out.' }, news: [{ source: 'Borneo Bulletin', bias: 'center', time: '6h ago', headline: 'Economic diversification efforts continue', url: '#' }] },
  'Timor-Leste': { lat: -8.87, lng: 125.73, flag: '🇹🇱', risk: 'cloudy', region: 'Southeast Asia', pop: '1.4M', gdp: '$3B', leader: 'Ramos-Horta', title: 'Young Nation', analysis: { what: 'Asia\'s youngest nation gained independence from Indonesia in 2002 after brutal occupation.', why: 'Nation-building from trauma is ongoing. Petroleum fund management is crucial.', next: 'Preparing for post-oil economy.' }, news: [{ source: 'Tatoli', bias: 'center', time: '5h ago', headline: 'ASEAN membership talks advance', url: '#' }] },
  'Papua New Guinea': { lat: -6.31, lng: 143.96, flag: '🇵🇬', risk: 'stormy', region: 'Oceania', pop: '10M', gdp: '$32B', leader: 'Marape', title: 'Resource Rich', analysis: { what: 'PNG has vast natural resources but limited development. Tribal violence has increased dramatically.', why: 'Resource wealth hasn\'t reduced poverty. Strategic competition between China and West.', next: 'Managing resources and violence.' }, news: [{ source: 'Post-Courier', bias: 'center', time: '6h ago', headline: 'Tribal violence concerns grow', url: '#' }] },
  'Fiji': { lat: -17.71, lng: 178.07, flag: '🇫🇯', risk: 'cloudy', region: 'Oceania', pop: '930K', gdp: '$5B', leader: 'Rabuka', title: 'Pacific Hub', analysis: { what: 'Fiji has had multiple coups but returned to democracy. Climate change threatens low-lying areas.', why: 'Pacific regional leadership role is significant. Democratic stability improving.', next: 'Leading Pacific climate advocacy.' }, news: [{ source: 'Fiji Times', bias: 'center', time: '5h ago', headline: 'Climate conference preparations advance', url: '#' }] },
  'Solomon Islands': { lat: -9.43, lng: 160.02, flag: '🇸🇧', risk: 'stormy', region: 'Oceania', pop: '720K', gdp: '$1.6B', leader: 'Manele', title: 'China Pivot', analysis: { what: 'Solomon Islands switched to China in 2019 and signed security pact. Ethnic tensions led to 2021 riots.', why: 'China security pact alarmed Australia and US. Strategic location in Pacific.', next: 'Managing great power competition.' }, news: [{ source: 'Solomon Star', bias: 'center', time: '6h ago', headline: 'Infrastructure projects advance', url: '#' }] },
  'Vanuatu': { lat: -15.38, lng: 166.96, flag: '🇻🇺', risk: 'cloudy', region: 'Oceania', pop: '330K', gdp: '$1B', leader: 'Kalsakau', title: 'Climate Vulnerable', analysis: { what: 'Vanuatu is extremely vulnerable to cyclones. The country sought ICJ advisory opinion on climate obligations.', why: 'Climate legal action sets precedent. Cyclone vulnerability is extreme.', next: 'Leading climate litigation efforts.' }, news: [{ source: 'Vanuatu Daily Post', bias: 'center', time: '5h ago', headline: 'Climate adaptation measures expand', url: '#' }] },
  'Samoa': { lat: -13.83, lng: -171.76, flag: '🇼🇸', risk: 'clear', region: 'Oceania', pop: '220K', gdp: '$800M', leader: 'Fiame', title: 'Stable Nation', analysis: { what: 'Samoa has stable democracy and strong cultural traditions. First female PM elected in 2021.', why: 'First female PM was milestone. Cultural traditions remain strong.', next: 'Maintaining stability and culture.' }, news: [{ source: 'Samoa Observer', bias: 'center', time: '6h ago', headline: 'Cultural preservation efforts continue', url: '#' }] },
  'Tonga': { lat: -21.18, lng: -175.20, flag: '🇹🇴', risk: 'clear', region: 'Oceania', pop: '106K', gdp: '$500M', leader: 'Tupou VI', title: 'Pacific Kingdom', analysis: { what: 'Tonga is the only Pacific monarchy. 2022 volcanic eruption caused major damage.', why: 'Volcanic eruption showed extreme vulnerability. Monarchy is constitutionally evolving.', next: 'Recovering from natural disaster.' }, news: [{ source: 'Matangi Tonga', bias: 'center', time: '5h ago', headline: 'Post-eruption reconstruction continues', url: '#' }] },
  'Kiribati': { lat: 1.87, lng: -157.36, flag: '🇰🇮', risk: 'severe', region: 'Oceania', pop: '130K', gdp: '$200M', leader: 'Maamau', title: 'Sinking Nation', analysis: { what: 'Kiribati faces existential threat from sea level rise. Government purchased land in Fiji for potential relocation.', why: 'Nation may become uninhabitable within decades. Climate frontline state.', next: 'Planning for potential national relocation.' }, news: [{ source: 'Pacific Islands Report', bias: 'center', time: '6h ago', headline: 'Sea level rise accelerates', url: '#' }] },
  'Marshall Islands': { lat: 7.13, lng: 171.18, flag: '🇲🇭', risk: 'cloudy', region: 'Oceania', pop: '60K', gdp: '$270M', leader: 'Heine', title: 'Nuclear Legacy', analysis: { what: 'The Marshall Islands suffers from legacy of US nuclear testing. Compact of Free Association with US provides funding.', why: 'Nuclear testing legacy creates ongoing health issues. Climate vulnerability extreme.', next: 'Addressing nuclear legacy and climate.' }, news: [{ source: 'Marshall Islands Journal', bias: 'center', time: '5h ago', headline: 'Compact negotiations continue', url: '#' }] },
  'Micronesia': { lat: 6.89, lng: 158.22, flag: '🇫🇲', risk: 'cloudy', region: 'Oceania', pop: '115K', gdp: '$400M', leader: 'Simina', title: 'Island Federation', analysis: { what: 'The Federated States of Micronesia has Compact of Free Association with US.', why: 'Strategic location for US Pacific presence. Climate change threatens low islands.', next: 'Implementing renewed US compact.' }, news: [{ source: 'Kaselehlie Press', bias: 'center', time: '6h ago', headline: 'US compact implementation begins', url: '#' }] },
  'Palau': { lat: 7.51, lng: 134.58, flag: '🇵🇼', risk: 'clear', region: 'Oceania', pop: '18K', gdp: '$280M', leader: 'Whipps Jr.', title: 'Marine Sanctuary', analysis: { what: 'Palau created one of world\'s largest marine sanctuaries. Maintains Taiwan recognition.', why: 'Marine conservation is globally significant. US military access expanding.', next: 'Balancing conservation and development.' }, news: [{ source: 'Island Times', bias: 'center', time: '5h ago', headline: 'Marine sanctuary expansion proposed', url: '#' }] },
  'Nauru': { lat: -0.52, lng: 166.93, flag: '🇳🇷', risk: 'cloudy', region: 'Oceania', pop: '11K', gdp: '$150M', leader: 'Adeang', title: 'Smallest Republic', analysis: { what: 'Nauru depleted its phosphate resources and now hosts Australian migrant detention center.', why: 'Cautionary tale of resource depletion. Australian detention arrangement is controversial.', next: 'Finding sustainable economic path.' }, news: [{ source: 'Pacific Islands Report', bias: 'center', time: '6h ago', headline: 'Economic diversification efforts continue', url: '#' }] },
  'Tuvalu': { lat: -7.48, lng: 179.20, flag: '🇹🇻', risk: 'severe', region: 'Oceania', pop: '11K', gdp: '$60M', leader: 'Teo', title: 'Disappearing Nation', analysis: { what: 'Tuvalu will likely be submerged by rising seas this century. Australia offered residency rights.', why: 'Most vulnerable nation to climate change. Digital revenue from .tv domain is creative solution.', next: 'Preserving nationhood amid disappearance.' }, news: [{ source: 'Pacific Islands Report', bias: 'center', time: '5h ago', headline: 'Australia migration agreement implemented', url: '#' }] },
  'Andorra': { lat: 42.51, lng: 1.52, flag: '🇦🇩', risk: 'clear', region: 'Europe', pop: '80K', gdp: '$3.4B', leader: 'Xavier Espot', title: 'Pyrenees Microstate', analysis: { what: 'Andorra is a small principality between France and Spain. Tourism and banking drive the economy. Not an EU member but uses the euro.', why: 'Tax haven status attracts business. Ski tourism is major industry.', next: 'Maintaining economic model amid international tax reforms.' }, news: [{ source: 'Diari d\'Andorra', bias: 'center', time: '6h ago', headline: 'Tourism season exceeds expectations', url: '#' }] },
  'Antigua and Barbuda': { lat: 17.06, lng: -61.80, flag: '🇦🇬', risk: 'cloudy', region: 'Caribbean', pop: '100K', gdp: '$2B', leader: 'Gaston Browne', title: 'Island Paradise', analysis: { what: 'Antigua and Barbuda depends heavily on tourism. Hurricane Irma devastated Barbuda in 2017.', why: 'Climate vulnerability threatens island nations. Citizenship by investment program draws attention.', next: 'Building climate resilience.' }, news: [{ source: 'Antigua Observer', bias: 'center', time: '5h ago', headline: 'Tourism recovery continues', url: '#' }] },
  'Comoros': { lat: -11.65, lng: 43.33, flag: '🇰🇲', risk: 'stormy', region: 'Africa', pop: '900K', gdp: '$1.3B', leader: 'Azali Assoumani', title: 'Island Instability', analysis: { what: 'Comoros has experienced numerous coups since independence. The island nation claims Mayotte, held by France.', why: 'Political instability undermines development. Mayotte dispute affects French relations.', next: 'Achieving political stability.' }, news: [{ source: 'Al-Watwan', bias: 'center', time: '6h ago', headline: 'Political tensions remain', url: '#' }] },
  'Dominica': { lat: 15.42, lng: -61.35, flag: '🇩🇲', risk: 'cloudy', region: 'Caribbean', pop: '72K', gdp: '$600M', leader: 'Roosevelt Skerrit', title: 'Nature Isle', analysis: { what: 'Dominica markets itself as the Nature Isle of the Caribbean. Hurricane Maria caused catastrophic damage in 2017.', why: 'Climate resilience building is essential. Eco-tourism potential is significant.', next: 'Building back better from hurricanes.' }, news: [{ source: 'Dominica News Online', bias: 'center', time: '5h ago', headline: 'Climate resilience projects advance', url: '#' }] },
  'Eswatini': { lat: -26.52, lng: 31.47, flag: '🇸🇿', risk: 'stormy', region: 'Africa', pop: '1.2M', gdp: '$5B', leader: 'King Mswati III', title: 'Absolute Monarchy', analysis: { what: 'Eswatini (formerly Swaziland) is Africa\'s last absolute monarchy. Pro-democracy protests in 2021 were met with violence.', why: 'Democratic demands challenge royal control. HIV prevalence among world\'s highest.', next: 'Managing reform pressure.' }, news: [{ source: 'Swazi Observer', bias: 'center', time: '6h ago', headline: 'Economic reforms announced', url: '#' }] },
  'Grenada': { lat: 12.12, lng: -61.67, flag: '🇬🇩', risk: 'clear', region: 'Caribbean', pop: '125K', gdp: '$1.3B', leader: 'Dickon Mitchell', title: 'Spice Isle', analysis: { what: 'Grenada is known for nutmeg production. The US invaded in 1983. Tourism now dominates the economy.', why: 'Tourism recovery post-COVID was strong. Climate vulnerability remains concern.', next: 'Diversifying beyond tourism.' }, news: [{ source: 'NOW Grenada', bias: 'center', time: '5h ago', headline: 'Tourism numbers continue growth', url: '#' }] },
  'Lesotho': { lat: -29.61, lng: 28.23, flag: '🇱🇸', risk: 'stormy', region: 'Africa', pop: '2.3M', gdp: '$2.5B', leader: 'Sam Matekane', title: 'Mountain Kingdom', analysis: { what: 'Lesotho is completely surrounded by South Africa. Water exports to SA are vital. Political instability and poverty persist.', why: 'Unique geographic situation creates dependencies. High HIV rates affect population.', next: 'Reducing South Africa dependence.' }, news: [{ source: 'Lesotho Times', bias: 'center', time: '6h ago', headline: 'Water project expansion planned', url: '#' }] },
  'Liechtenstein': { lat: 47.17, lng: 9.55, flag: '🇱🇮', risk: 'clear', region: 'Europe', pop: '40K', gdp: '$7B', leader: 'Prince Hans-Adam II', title: 'Alpine Microstate', analysis: { what: 'Liechtenstein is one of the world\'s wealthiest countries per capita. Banking and manufacturing drive economy.', why: 'Financial services attract international business. Swiss customs union provides stability.', next: 'Maintaining prosperity.' }, news: [{ source: 'Vaterland', bias: 'center', time: '5h ago', headline: 'Financial sector remains strong', url: '#' }] },
  'Monaco': { lat: 43.73, lng: 7.42, flag: '🇲🇨', risk: 'clear', region: 'Europe', pop: '40K', gdp: '$8.6B', leader: 'Prince Albert II', title: 'Luxury Enclave', analysis: { what: 'Monaco is the world\'s most densely populated country. No income tax attracts the ultra-wealthy. Famous for Grand Prix and casinos.', why: 'Tax haven status attracts global elite. Environmental initiatives under Prince Albert.', next: 'Balancing growth with limited space.' }, news: [{ source: 'Monaco Tribune', bias: 'center', time: '6h ago', headline: 'Real estate prices reach new highs', url: '#' }] },
  'San Marino': { lat: 43.94, lng: 12.46, flag: '🇸🇲', risk: 'clear', region: 'Europe', pop: '34K', gdp: '$1.9B', leader: 'Captains Regent', title: 'Oldest Republic', analysis: { what: 'San Marino claims to be the world\'s oldest republic, founded in 301 AD. Surrounded entirely by Italy.', why: 'Historical significance draws tourists. Unique dual head of state system.', next: 'Maintaining independence and traditions.' }, news: [{ source: 'San Marino RTV', bias: 'center', time: '5h ago', headline: 'Tourism contributes to growth', url: '#' }] },
  'Sao Tome and Principe': { lat: 0.33, lng: 6.73, flag: '🇸🇹', risk: 'cloudy', region: 'Africa', pop: '225K', gdp: '$600M', leader: 'Carlos Vila Nova', title: 'Gulf of Guinea Islands', analysis: { what: 'Sao Tome and Principe are islands in the Gulf of Guinea. Offshore oil potential could transform the economy.', why: 'Oil prospects attract international interest. Small size limits development options.', next: 'Managing potential oil wealth.' }, news: [{ source: 'Tela Non', bias: 'center', time: '6h ago', headline: 'Oil exploration continues', url: '#' }] },
  'Saint Kitts and Nevis': { lat: 17.36, lng: -62.78, flag: '🇰🇳', risk: 'clear', region: 'Caribbean', pop: '55K', gdp: '$1.1B', leader: 'Terrance Drew', title: 'Federation', analysis: { what: 'Saint Kitts and Nevis is a two-island federation. Tourism and citizenship by investment drive economy.', why: 'Citizenship program attracts wealthy applicants. Sugar industry ended in 2005.', next: 'Diversifying economic base.' }, news: [{ source: 'SKN Vibes', bias: 'center', time: '5h ago', headline: 'Citizenship program reforms announced', url: '#' }] },
  'Saint Lucia': { lat: 13.91, lng: -60.98, flag: '🇱🇨', risk: 'clear', region: 'Caribbean', pop: '180K', gdp: '$2.1B', leader: 'Philip Pierre', title: 'Volcanic Beauty', analysis: { what: 'Saint Lucia is known for its twin Pitons volcanic spires. Tourism dominates the economy. Banana exports have declined.', why: 'Tourism is primary revenue source. Climate vulnerability threatens future.', next: 'Developing sustainable tourism.' }, news: [{ source: 'St. Lucia Times', bias: 'center', time: '6h ago', headline: 'Tourism arrivals exceed targets', url: '#' }] },
  'Saint Vincent and the Grenadines': { lat: 13.25, lng: -61.20, flag: '🇻🇨', risk: 'cloudy', region: 'Caribbean', pop: '110K', gdp: '$900M', leader: 'Ralph Gonsalves', title: 'Volcanic Islands', analysis: { what: 'La Soufrière volcano erupted in 2021 causing evacuations. Tourism and agriculture drive economy.', why: 'Volcanic activity poses ongoing risk. Post-eruption recovery ongoing.', next: 'Rebuilding after volcanic eruption.' }, news: [{ source: 'iWitness News', bias: 'center', time: '5h ago', headline: 'Volcanic monitoring continues', url: '#' }] }
};
// RECENT ELECTION RESULTS

export const RECENT_ELECTIONS = [
  { flag: '🇧🇩', country: 'Bangladesh', date: 'Feb 2026', type: 'General Election & Referendum', winner: 'Tarique Rahman - BNP (Center-Right)', result: 'BNP wins landslide (~211/299 seats)', summary: 'First election since 2024 July Revolution ousted Hasina. BNP wins majority; Jamaat-e-Islami (~70 seats) becomes main opposition. July Charter referendum passes with 72.9% approval. 47.9% turnout.' },
  { flag: '🇯🇵', country: 'Japan', date: 'Feb 2026', type: 'Snap Election', winner: 'Sanae Takaichi - LDP (Right Wing)', result: 'LDP wins majority', summary: 'First female PM. Nationalist conservative takes power after snap election landslide.' },
  { flag: '🇵🇹', country: 'Portugal', date: 'Jan 2026', type: 'Presidential Election', winner: 'Ana Gomes - PS (Left Wing)', result: 'Leftist victory', summary: 'Defeated far-right surge. Chega party gains but falls short.' },
  { flag: '🇹🇭', country: 'Thailand', date: 'Jan 2026', type: 'Senate Elections', winner: 'Move Forward (Left Wing)', result: 'Progressive gains', summary: 'Reformist senators elected. Military influence declining.' }
];

// UPCOMING ELECTIONS DATA
export const ELECTIONS = [
  { flag: '🇻🇳', country: 'Vietnam', date: 'Mar 2026', type: 'Legislative Elections', stakes: 'Communist Party to affirm control. Economic reform direction at stake.' },
  { flag: '🇨🇴', country: 'Colombia', date: 'May 2026', type: 'Presidential Election', stakes: 'Petro barred from re-election. Test of Latin America\'s left turn.' },
  { flag: '🇱🇧', country: 'Lebanon', date: 'May 2026', type: 'Parliamentary Election', stakes: 'First test for new government. Hezbollah\'s role in question post-Gaza war.' },
  { flag: '🇮🇱', country: 'Israel', date: 'Jun–Oct 2026', type: 'General Election', stakes: 'Legally due Oct 27 but widely expected earlier. Budget deadline may dissolve Knesset by summer.' },
  { flag: '🇭🇺', country: 'Hungary', date: 'Apr 2026', type: 'Parliamentary Election', stakes: 'Orban faces toughest challenge from Tisza Party. EU relations at stake.' },
  { flag: '🇧🇦', country: 'Bosnia', date: 'Oct 2026', type: 'General Elections', stakes: 'Ethnic tensions persist. Serb separatism and EU path in balance.' },
  { flag: '🇧🇷', country: 'Brazil', date: 'Oct 2026', type: 'General Elections', stakes: 'Lula vs Bolsonaro family rematch. Democracy and Amazon at stake.' },
  { flag: '🇺🇸', country: 'United States', date: 'Nov 2026', type: 'Midterm Elections', stakes: 'Control of Congress at stake. All 435 House seats and 33 Senate seats.' },
  { flag: '🇫🇷', country: 'France', date: 'Apr 2027', type: 'Presidential Election', stakes: 'Macron term-limited. Le Pen favored amid political fragmentation.' },
];

// FORECASTS DATA
export const FORECASTS = [
  { region: 'Middle East', risk: 'catastrophic', current: 'US and Israel launched joint strikes on Iran on February 28, 2026. Iran, Hezbollah, and Houthis expected to retaliate imminently. US bases across the Gulf on high alert. Strait of Hormuz at risk of closure.', forecast: 'Full regional war is now the baseline scenario. Iranian retaliation via missiles, Hezbollah rockets, and Houthi Red Sea attacks expected within hours to days. Oil prices will spike severely. Watch for: Strait of Hormuz closure, multi-front proxy activation, and whether conflict remains contained or escalates to total war.', indicators: [{ text: 'Active War', dir: 'up' }, { text: 'Oil Crisis', dir: 'up' }, { text: 'Diplomacy', dir: 'down' }] },
  { region: 'Eastern Europe', risk: 'catastrophic', current: 'Active warfare continues in Ukraine. The Iran conflict diverts US military attention and resources, potentially weakening pressure on Russia. Geneva peace talks stalled.', forecast: 'Russia may exploit US distraction in the Middle East to escalate in Ukraine. Western ammunition and air defense supplies could be diverted to the Iran theater. Watch for: Russian offensive operations, reduced Western support, and whether the Iran war creates a diplomatic opening or deepens the stalemate.', indicators: [{ text: 'Conflict Intensity', dir: 'up' }, { text: 'Western Focus', dir: 'down' }, { text: 'Russia Leverage', dir: 'up' }] },
  { region: 'Global Economy', risk: 'extreme', current: 'US-Israeli strikes on Iran have triggered an energy crisis. Oil prices surging. Strait of Hormuz shipping at risk. Global markets in turmoil. Inflation fears returning.', forecast: 'Severe economic shock is underway. If the Strait of Hormuz is disrupted, oil could spike above $150/barrel, triggering global recession. Shipping insurance rates will soar. Central banks face impossible choice between fighting inflation and supporting growth. Watch for: oil price trajectory, Hormuz shipping status, and central bank emergency actions.', indicators: [{ text: 'Oil Prices', dir: 'up' }, { text: 'Recession Risk', dir: 'up' }, { text: 'Inflation', dir: 'up' }] },
  { region: 'East Asia', risk: 'severe', current: 'Taiwan Strait tensions elevated. North Korea missile tests continue. US military resources diverted to Middle East, potentially creating a window for Chinese assertiveness.', forecast: 'China may test boundaries while US forces are stretched across the Middle East. North Korea could exploit the distraction for provocations. Watch for: increased Chinese military activity around Taiwan, North Korean missile tests, and whether US Pacific deterrence is weakened by the Iran commitment.', indicators: [{ text: 'China Activity', dir: 'up' }, { text: 'US Deterrence', dir: 'down' }, { text: 'Opportunism Risk', dir: 'up' }] },
  { region: 'Sahel Africa', risk: 'extreme', current: 'Military coups across region. Wagner/Africa Corps presence expanding. Jihadi groups gaining ground. Global attention consumed by Iran conflict.', forecast: 'Further destabilization likely as international attention focuses on the Middle East. Western influence continuing to decline. Watch for: jihadi exploitation of distracted global powers, spillover into coastal West Africa, and Russian military group expansion.', indicators: [{ text: 'Instability', dir: 'up' }, { text: 'Terrorism', dir: 'up' }, { text: 'Global Attention', dir: 'down' }] },
  { region: 'Climate Hotspots', risk: 'severe', current: 'Record temperatures and extreme weather increasing. The Iran conflict threatens to derail COP31 climate commitments and divert resources from adaptation.', forecast: 'Climate action will be deprioritized as nations focus on energy security and military spending. Fossil fuel production may increase to offset Iran supply disruptions. Watch for: COP31 impact, emergency fossil fuel measures, and climate-vulnerable nations losing international support.', indicators: [{ text: 'Extreme Weather', dir: 'up' }, { text: 'Climate Action', dir: 'down' }, { text: 'Energy Security', dir: 'up' }] }
];

// ============================================================
// HORIZON - Upcoming Geopolitical Events (Feb 2026 - Feb 2027)
// ============================================================

export const HORIZON_EVENTS = [
  { date: '2026-02-05', name: 'New START Treaty Expiration', location: 'Global', category: 'treaty', description: 'US-Russia nuclear arms treaty expires — first time since 1970s with no binding limits on strategic nuclear forces' },
  { date: '2026-02-12', name: 'Bangladesh Election — BNP Wins Landslide', location: 'Dhaka, Bangladesh', category: 'election', description: 'RESULT: BNP wins ~211/299 seats. Tarique Rahman to lead government. Jamaat-e-Islami (~70 seats) becomes opposition. July Charter referendum passes with 72.9% approval.' },
  { date: '2026-02-12', name: 'EU Informal Leaders Retreat', location: 'Brussels, EU', category: 'summit', description: 'EU leaders convene to discuss single market strengthening and economic competitiveness strategy' },
  { date: '2026-02-14', name: 'African Union Assembly (39th Summit)', location: 'Addis Ababa, Ethiopia', category: 'summit', description: 'Annual AU heads-of-state summit focusing on Agenda 2063 development priorities across the continent' },
  { date: '2026-02-15', name: 'France Municipal Elections (Round 1)', location: 'France', category: 'election', description: 'First round of mayoral elections across French municipalities — key indicator ahead of 2027 presidential race' },
  { date: '2026-02-22', name: 'France Municipal Elections (Round 2)', location: 'France', category: 'election', description: 'Final round determining new mayors in major French cities with national political implications' },
  { date: '2026-02-23', name: 'ICC Duterte Confirmation Hearing', location: 'The Hague, Netherlands', category: 'treaty', description: 'International Criminal Court hearing on charges against former Philippine President Rodrigo Duterte' },
  { date: '2026-03-08', name: 'Colombia Parliamentary Elections', location: 'Bogotá, Colombia', category: 'election', description: 'Election of 188 House members with primaries determining presidential candidates for May vote' },
  { date: '2026-03-19', name: 'European Council Summit', location: 'Brussels, EU', category: 'summit', description: 'Quarterly meeting of EU heads of state setting strategic direction on defense, trade, and enlargement' },
  { date: '2026-04-13', name: 'IMF / World Bank Spring Meetings', location: 'Washington D.C., USA', category: 'economic', description: 'Annual spring meetings addressing global economic outlook, debt sustainability, and development finance' },
  { date: '2026-04-27', name: 'NPT Review Conference Opens', location: 'New York, USA', category: 'treaty', description: 'Eleventh Nuclear Non-Proliferation Treaty review — critical amid New START expiration and rising nuclear tensions' },
  { date: '2026-05-08', name: '48th ASEAN Leaders Summit', location: 'Cebu, Philippines', category: 'summit', description: 'ASEAN summit under Philippine chairmanship addressing South China Sea disputes and economic integration' },
  { date: '2026-05-10', name: 'Lebanese Parliamentary Elections', location: 'Beirut, Lebanon', category: 'election', description: 'First parliamentary elections since Hezbollah\'s weakening — 128 seats contested amid political realignment' },
  { date: '2026-05-22', name: 'NPT Review Conference Concludes', location: 'New York, USA', category: 'treaty', description: 'Final negotiated outcome on nuclear disarmament and non-proliferation commitments for the next cycle' },
  { date: '2026-05-31', name: 'Colombia Presidential Election', location: 'Bogotá, Colombia', category: 'election', description: 'Presidential vote where incumbent Petro is barred from re-election — direction of Latin American left at stake' },
  { date: '2026-06-01', name: 'Ethiopia General Election', location: 'Addis Ababa, Ethiopia', category: 'election', description: 'Seventh national election with digital voter registration amid ongoing post-Tigray recovery efforts' },
  { date: '2026-06-07', name: 'Armenia Parliamentary Election', location: 'Yerevan, Armenia', category: 'election', description: 'Parliamentary elections under PM Pashinyan — crucial for South Caucasus stability and Russia-West alignment' },
  { date: '2026-06-15', name: '52nd G7 Summit', location: 'Évian-les-Bains, France', category: 'summit', description: 'Leaders of advanced democracies convene on Ukraine, China trade, AI governance, and climate commitments' },
  { date: '2026-06-26', name: 'RIMPAC 2026 Begins', location: 'Hawaii, USA', category: 'military', description: 'World\'s largest multinational maritime exercise — 29 nations, 25,000+ personnel signaling Indo-Pacific readiness' },
  { date: '2026-06-30', name: 'UK-EU TCA Energy & Fishing Provisions Expire', location: 'Global', category: 'treaty', description: 'Brexit-era energy cooperation and fishing access provisions expire — renewal negotiations critical for both sides' },
  { date: '2026-07-01', name: 'USMCA Six-Year Review Window Opens', location: 'Global', category: 'economic', description: 'Mandatory review of US-Mexico-Canada free trade agreement begins — potential renegotiation of key provisions' },
  { date: '2026-07-07', name: 'NATO Summit', location: 'Ankara, Turkey', category: 'summit', description: 'Alliance leaders summit at Beştepe Presidential Complex addressing defense spending, Ukraine, and Arctic strategy' },
  { date: '2026-08-01', name: 'BRICS Summit (Expected)', location: 'New Delhi, India', category: 'summit', description: '18th BRICS leaders summit under Indian chairmanship — expanded bloc testing cohesion on trade and dedollarization' },
  { date: '2026-08-13', name: 'Zambia General Election', location: 'Lusaka, Zambia', category: 'election', description: 'Presidential, parliamentary, and local elections — test of democratic consolidation in Southern Africa' },
  { date: '2026-08-30', name: 'Haiti Presidential Election (Round 1)', location: 'Port-au-Prince, Haiti', category: 'election', description: 'Haiti\'s first general election in a decade amid ongoing gang violence and security crisis' },
  { date: '2026-09-13', name: 'Sweden General Election', location: 'Stockholm, Sweden', category: 'election', description: 'Riksdag election with 349 seats — test of right-wing coalition and NATO-era defense priorities' },
  { date: '2026-09-15', name: 'UN General Assembly (81st Session Opens)', location: 'New York, USA', category: 'summit', description: 'Annual UNGA high-level segment with world leaders addressing conflicts, climate, and reform of multilateral institutions' },
  { date: '2026-09-18', name: 'Russia State Duma Elections Begin', location: 'Moscow, Russia', category: 'election', description: 'Three-day voting for State Duma and 39 regional assemblies — managed elections amid ongoing Ukraine war' },
  { date: '2026-10-04', name: 'Brazil General Election (Round 1)', location: 'Brasília, Brazil', category: 'election', description: 'Presidential, congressional, and gubernatorial elections — Lula seeks fourth term amid polarized electorate' },
  { date: '2026-10-09', name: 'IMF / World Bank Annual Meetings', location: 'Bangkok, Thailand', category: 'economic', description: 'Annual meetings addressing global financial stability, emerging market debt, and development priorities' },
  { date: '2026-10-09', name: 'EU Russia Sanctions Renewal Deadline', location: 'Brussels, EU', category: 'sanctions', description: 'Expiration deadline for EU restrictive measures on Russian destabilizing actions — renewal vote required' },
  { date: '2026-10-25', name: 'Brazil General Election (Runoff)', location: 'Brasília, Brazil', category: 'election', description: 'Presidential and gubernatorial runoff if no first-round majority — could reshape Latin America\'s largest economy' },
  { date: '2026-10-31', name: 'EU ISIL/Al-Qaeda Sanctions Renewal', location: 'Brussels, EU', category: 'sanctions', description: 'Renewal deadline for EU counterterrorism sanctions regime targeting ISIL (Da\'esh) and Al-Qaeda networks' },
  { date: '2026-11-03', name: 'United States Midterm Elections', location: 'United States', category: 'election', description: 'All 435 House seats and 35 Senate seats contested — referendum on Trump\'s second term and Congressional control' },
  { date: '2026-11-09', name: 'COP31 Climate Conference Opens', location: 'Antalya, Turkey', category: 'summit', description: 'UN Climate Change Conference with Australia leading negotiations on emissions targets and climate finance' },
  { date: '2026-11-10', name: '49th ASEAN Leaders Summit', location: 'Manila, Philippines', category: 'summit', description: 'Second ASEAN summit of the year addressing regional security architecture and economic integration' },
  { date: '2026-11-18', name: 'APEC Economic Leaders Meeting', location: 'Shenzhen, China', category: 'summit', description: 'Asia-Pacific summit in China\'s tech hub — US-China dynamics and trade architecture in focus' },
  { date: '2026-11-20', name: 'COP31 Climate Conference Concludes', location: 'Antalya, Turkey', category: 'summit', description: 'Final negotiated climate commitments expected on emissions reduction timelines and developing nation finance' },
  { date: '2026-12-06', name: 'Haiti Presidential Election (Runoff)', location: 'Port-au-Prince, Haiti', category: 'election', description: 'Runoff round to determine Haiti\'s first elected president in years — stability of Caribbean at stake' },
  { date: '2026-12-14', name: 'G20 Leaders Summit', location: 'Miami, USA', category: 'summit', description: 'Summit of world\'s largest economies under US presidency — trade, AI regulation, and development on the agenda' },
  { date: '2027-01-01', name: 'EU Russian LNG Ban Takes Full Effect', location: 'EU', category: 'sanctions', description: 'Complete ban on Russian LNG imports for long-term contracts — reshapes European energy supply chains' },
  { date: '2027-02-07', name: 'Haiti Presidential Inauguration', location: 'Port-au-Prince, Haiti', category: 'election', description: 'Inauguration of newly elected Haitian president — first democratic transfer of power in over a decade' }
];

// NEWSLETTER SYSTEM
// Region mapping for news categorization

export const NEWSLETTER_REGIONS = {
  'Europe': ['Ukraine', 'Russia', 'Belarus', 'Moldova', 'Poland', 'Romania', 'Hungary', 'Balkans', 'UK', 'Britain', 'France', 'Germany', 'Italy', 'Spain', 'NATO', 'EU', 'European', 'Serbia', 'Kosovo', 'Greece', 'Turkey', 'Ankara', 'Istanbul', 'Sweden', 'Finland', 'Norway', 'Denmark', 'Greenland', 'Arctic', 'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'Czech', 'Slovakia', 'Croatia', 'Bulgaria', 'Portugal', 'Ireland'],
  'Asia': ['China', 'Taiwan', 'Japan', 'Korea', 'North Korea', 'South Korea', 'Hong Kong', 'Myanmar', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'Malaysia', 'Singapore', 'Cambodia', 'Laos', 'India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Afghanistan', 'Kabul', 'Delhi', 'Mumbai', 'Beijing', 'Tokyo', 'Seoul', 'Pyongyang', 'Manila', 'Jakarta', 'Bangkok'],
  'Middle East': ['Israel', 'Palestine', 'Gaza', 'Iran', 'Iraq', 'Syria', 'Lebanon', 'Yemen', 'Saudi', 'UAE', 'Qatar', 'Jordan', 'Egypt', 'Houthi', 'Hezbollah', 'Tehran', 'Baghdad', 'Damascus', 'Beirut', 'Riyadh', 'Dubai', 'Oman', 'Bahrain', 'Kuwait'],
  'Africa': ['Sudan', 'Somalia', 'Ethiopia', 'DRC', 'Congo', 'Nigeria', 'Kenya', 'South Africa', 'Mali', 'Niger', 'Burkina', 'Sahel', 'Libya', 'Algeria', 'Morocco', 'Tunisia', 'Mozambique', 'Rwanda', 'Uganda', 'Tanzania', 'Ghana', 'Senegal', 'Cameroon', 'Zimbabwe', 'Eritrea'],
  'Americas': ['United States', 'US', 'Brazil', 'Mexico', 'Venezuela', 'Colombia', 'Argentina', 'Haiti', 'Cuba', 'Canada', 'Chile', 'Peru', 'Ecuador', 'Bolivia', 'Panama', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Dominican', 'Puerto Rico', 'Washington', 'Congress', 'White House']
};

// Source political bias ratings: L=Left, LC=Left-Center, C=Center, RC=Right-Center, R=Right

export const DAILY_BRIEFING_FALLBACK = [
  { time: '1h ago', category: 'CONFLICT', importance: 'high', headline: 'Heavy fighting reported in eastern Ukraine as winter operations intensify', source: 'Reuters', url: '#' },
  { time: '2h ago', category: 'SECURITY', importance: 'high', headline: 'North Korea conducts ballistic missile test over Sea of Japan', source: 'AP News', url: '#' },
  { time: '3h ago', category: 'TECH', importance: 'medium', headline: 'US expands AI chip export restrictions to additional countries', source: 'WSJ', url: '#' },
  { time: '4h ago', category: 'ECONOMY', importance: 'high', headline: 'China signals major stimulus package amid property sector concerns', source: 'Financial Times', url: '#' },
  { time: '5h ago', category: 'POLITICS', importance: 'medium', headline: 'European leaders discuss expanded Ukraine military support', source: 'BBC', url: '#' },
  { time: '6h ago', category: 'SECURITY', importance: 'medium', headline: 'NATO allies agree to increase defense spending targets', source: 'Fox News', url: '#' },
  { time: '8h ago', category: 'CRISIS', importance: 'high', headline: 'Humanitarian agencies warn of famine conditions in Sudan', source: 'UN News', url: '#' },
  { time: '10h ago', category: 'DIPLOMACY', importance: 'medium', headline: 'UN Security Council holds emergency session on Middle East crisis', source: 'Al Jazeera', url: '#' },
  { time: '12h ago', category: 'ECONOMY', importance: 'medium', headline: 'Oil prices surge on Middle East supply concerns', source: 'Washington Times', url: '#' },
  { time: '14h ago', category: 'SECURITY', importance: 'medium', headline: 'Taiwan reports increased Chinese military activity near strait', source: 'Nikkei Asia', url: '#' },
  { time: '15h ago', category: 'POLITICS', importance: 'medium', headline: 'Venezuela opposition rejects latest government dialogue offer', source: 'Reuters', url: '#' },
  { time: '16h ago', category: 'CONFLICT', importance: 'high', headline: 'Gaza ceasefire negotiations continue amid escalating violence', source: 'New York Post', url: '#' },
  { time: '18h ago', category: 'CLIMATE', importance: 'medium', headline: 'Record temperatures recorded across Southeast Asia amid drought', source: 'The Guardian', url: '#' },
  { time: '20h ago', category: 'POLITICS', importance: 'medium', headline: 'South Korea opposition party gains momentum ahead of elections', source: 'Korea Times', url: '#' },
  { time: '22h ago', category: 'ECONOMY', importance: 'medium', headline: 'Federal Reserve signals cautious approach to rate cuts in 2026', source: 'Bloomberg', url: '#' },
  { time: '1d ago', category: 'SECURITY', importance: 'high', headline: 'Iran accelerates uranium enrichment, IAEA reports', source: 'Reuters', url: '#' },
  { time: '1d ago', category: 'DIPLOMACY', importance: 'medium', headline: 'India-Pakistan tensions rise over water sharing dispute', source: 'The Hindu', url: '#' },
  { time: '1d ago', category: 'CRISIS', importance: 'high', headline: 'Myanmar military launches major offensive against resistance forces', source: 'BBC', url: '#' },
  { time: '1d ago', category: 'ECONOMY', importance: 'medium', headline: 'Global shipping costs spike amid Red Sea disruptions', source: 'Financial Times', url: '#' },
  { time: '1d ago', category: 'WORLD', importance: 'medium', headline: 'Ethiopian government and Tigray rebels resume peace talks', source: 'France 24', url: '#' },
  { time: '2d ago', category: 'TECH', importance: 'medium', headline: 'EU announces new regulations for artificial intelligence systems', source: 'DW News', url: '#' },
  { time: '2d ago', category: 'CONFLICT', importance: 'high', headline: 'Fighting intensifies in eastern DRC as M23 advances', source: 'Reuters', url: '#' },
  { time: '2d ago', category: 'ECONOMY', importance: 'medium', headline: 'Japan intervenes to stabilize yen after sharp decline', source: 'Nikkei Asia', url: '#' },
  { time: '2d ago', category: 'POLITICS', importance: 'medium', headline: 'Brazilian congress passes controversial environmental reform', source: 'Reuters', url: '#' },
  { time: '2d ago', category: 'CRISIS', importance: 'high', headline: 'Haiti gang violence forces closure of main hospital', source: 'AP News', url: '#' }
];

// Live news storage
export const DAILY_BRIEFING = [...DAILY_BRIEFING_FALLBACK];
export const DAILY_EVENTS = [];
export const lastNewsUpdate = null;

// ============================================================
// BRIEFING HISTORY - Keep past 3 days of briefings
// ============================================================

export const SANCTIONS_DATA = {
  // === MAJOR WESTERN SANCTIONERS ===
  'United States': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: 'Ukraine invasion; energy sector; 400+ entities; shadow fleet', year: 2022 },
      { target: 'Iran', reason: 'Maximum pressure; nuclear program; terrorism support', year: 1979 },
      { target: 'North Korea', reason: 'WMD proliferation; cyber attacks; human rights', year: 2008 },
      { target: 'Cuba', reason: 'Full economic embargo; Helms-Burton Act', year: 1962 },
      { target: 'Venezuela', reason: 'Oil sector; Maduro regime; cartel FTO designations', year: 2015 },
      { target: 'China', reason: 'Uyghur rights; tech/chip export controls; Entity List', year: 2019 },
      { target: 'Syria', reason: 'Most lifted post-Assad fall; Caesar Act repealed Dec 2025', year: 2004 },
      { target: 'Yemen (Houthis)', reason: 'Re-designated FTO Mar 2025; illicit oil networks', year: 2024 },
      { target: 'Sudan', reason: 'Chemical weapons use; RSF/SAF conflict parties', year: 2023 },
      { target: 'Myanmar', reason: 'Military coup; Rohingya genocide; cyber scam networks', year: 2021 }
    ]
  },
  // === HEAVILY SANCTIONED ===
  'Russia': {
    severity: 'heavy',
    on: [
      { by: 'US', reason: 'Invasion of Ukraine; energy sector (Gazprom Neft, Surgutneftegas); 400+ entities; 180+ shadow fleet vessels sanctioned Jan 2025', year: 2022 },
      { by: 'EU', reason: '20 sanctions packages; full energy ban (LNG Apr 2026, pipeline gas Jun 2026); 640 shadow fleet vessels; crypto platforms restricted', year: 2022 },
      { by: 'UK', reason: 'Asset freezes, trade restrictions, oligarch sanctions; aligned with EU rounds', year: 2022 },
      { by: 'UN', reason: 'Limited measures; Russia vetoes broader Security Council action', year: 2014 },
      { by: 'Canada', reason: 'Trade bans, asset freezes, secondary sanctions on shadow fleet', year: 2022 },
      { by: 'Japan', reason: 'Export controls on semiconductors and tech; asset freezes', year: 2022 },
      { by: 'Australia', reason: 'Financial sanctions, travel bans, trade restrictions', year: 2022 },
      { by: 'Switzerland', reason: 'Adopted EU sanctions packages; asset freezes', year: 2022 }
    ],
    by: [
      { target: 'EU/Western nations', reason: 'Counter-sanctions on agricultural imports', year: 2014 },
      { target: 'Various', reason: 'Retaliatory bans on Western officials and entities', year: 2022 }
    ]
  },
  'Iran': {
    severity: 'heavy',
    on: [
      { by: 'US', reason: 'Maximum pressure policy (Trump Feb 2025); nuclear program; terrorism support; full enforcement', year: 1979 },
      { by: 'EU', reason: 'Nuclear proliferation; missile program; human rights; snapback reimposed', year: 2012 },
      { by: 'UN', reason: 'Snapback sanctions reimposed Sep 2025 after UK/France/Germany triggered mechanism; JCPOA terminated Oct 2025', year: 2006 },
      { by: 'UK', reason: 'Nuclear program; triggered JCPOA snapback Aug 2025', year: 2012 },
      { by: 'Canada', reason: 'State sponsor of terrorism designation; nuclear concerns', year: 2012 },
      { by: 'Australia', reason: 'Nuclear and missile proliferation concerns', year: 2008 }
    ],
    by: [
      { target: 'Israel', reason: 'Full trade and diplomatic embargo', year: 1979 },
      { target: 'US officials', reason: 'Retaliatory sanctions on government and military officials', year: 2020 },
      { target: 'UK officials', reason: 'Retaliatory sanctions on British officials', year: 2022 }
    ]
  },
  'North Korea': {
    severity: 'heavy',
    on: [
      { by: 'UN', reason: 'Nuclear/missile programs (multiple UNSC resolutions); monitoring panel disbanded Apr 2024 after Russia veto; multilateral enforcement continues', year: 2006 },
      { by: 'US', reason: 'WMD proliferation; human rights abuses; cyber attacks; DISRUPT Bill introduced 2025', year: 2008 },
      { by: 'EU', reason: 'Nuclear and missile programs; arms embargo', year: 2006 },
      { by: 'Japan', reason: 'Nuclear tests; abduction issue; full trade embargo', year: 2006 },
      { by: 'South Korea', reason: 'Military provocations; nuclear tests', year: 2010 },
      { by: 'Australia', reason: 'WMD proliferation; maritime enforcement coalition active 2025', year: 2006 }
    ],
    by: []
  },
  'Syria': {
    severity: 'limited',
    on: [
      { by: 'US', reason: 'Most sanctions lifted Jun 2025 post-Assad fall; Caesar Act repealed Dec 2025; targeted sanctions on Assad family remain', year: 2025 },
      { by: 'EU', reason: 'Majority lifted Jun 2025 to support peaceful transition; some individual designations remain', year: 2025 },
      { by: 'UN', reason: 'Sanctions on interim president al-Sharaa lifted Nov 2025', year: 2025 }
    ],
    by: []
  },
  'Cuba': {
    severity: 'heavy',
    on: [
      { by: 'US', reason: 'Full embargo; Trump reversed Biden easing Jan 2025; national emergency declared Jan 2026; sanctions on Diaz-Canel; tariff threats on countries supplying Cuba oil', year: 1962 },
      { by: 'EU', reason: 'Common Position on human rights (partially lifted)', year: 1996 }
    ],
    by: []
  },
  'Venezuela': {
    severity: 'heavy',
    on: [
      { by: 'US', reason: 'Oil sanctions hardened; Chevron license revoked Feb 2025; Tren de Aragua designated FTO; Cartel de los Soles designated FTO Nov 2025; tankers blocked Dec 2025', year: 2015 },
      { by: 'EU', reason: 'Human rights violations; undermining democracy; arms embargo', year: 2017 },
      { by: 'Canada', reason: 'Human rights abuses; erosion of democratic institutions', year: 2017 },
      { by: 'Switzerland', reason: 'Adopted targeted sanctions on officials', year: 2018 }
    ],
    by: []
  },
  'Myanmar': {
    severity: 'heavy',
    on: [
      { by: 'US', reason: 'Military coup; Rohingya genocide; warlord Saw Chit Thu sanctioned May 2025 for cyber scams/trafficking; controversial rollback of 5 arms-trade designations Jul 2025', year: 2021 },
      { by: 'EU', reason: 'Military junta; arms embargo; renewed through Apr 2026; new measures on scam operations', year: 2021 },
      { by: 'UK', reason: 'Military coup; asset freezes on junta leaders', year: 2021 },
      { by: 'Canada', reason: '13 officials and 3 entities sanctioned Mar 2025', year: 2018 }
    ],
    by: []
  },
  'Belarus': {
    severity: 'heavy',
    on: [
      { by: 'US', reason: 'Election fraud; aiding Russia; potash sector sanctions partially eased Dec 2025 in exchange for 123 political prisoner releases', year: 2006 },
      { by: 'EU', reason: '25 individuals + 7 entities added Mar 2025; agricultural tariffs Jun 2025; hybrid threat sanctions Dec 2025', year: 2020 },
      { by: 'UK', reason: 'Complicity in Ukraine invasion; human rights abuses', year: 2022 },
      { by: 'Canada', reason: 'Serious human rights violations; support for Russian invasion', year: 2020 }
    ],
    by: [
      { target: 'EU', reason: 'Counter-sanctions on European officials', year: 2021 }
    ]
  },
  'Sudan': {
    severity: 'heavy',
    on: [
      { by: 'US', reason: 'Chemical weapons use in civil war (May 2025); RSF recruitment networks sanctioned; Islamist actors sanctioned Sep 2025', year: 2023 },
      { by: 'UN', reason: 'Arms embargo extended; targeted sanctions on conflict parties', year: 2004 },
      { by: 'EU', reason: '7 individuals designated Jan 2026 for El Fasher massacre (RSF and SAF)', year: 2004 },
      { by: 'UK', reason: '4 senior RSF commanders sanctioned for El Fasher massacre', year: 2025 }
    ],
    by: []
  },
  'Yemen': {
    severity: 'heavy',
    on: [
      { by: 'US', reason: 'Houthis re-designated FTO Mar 2025; largest-ever action Jun 2025 (4 individuals, 12 entities, 2 vessels); 32 entities + 4 vessels Sep 2025; >$2B/yr illicit oil targeted', year: 2024 },
      { by: 'UN', reason: 'Arms embargo; targeted sanctions on Houthi leaders', year: 2014 },
      { by: 'EU', reason: 'Targeted measures supporting UN sanctions', year: 2014 }
    ],
    by: []
  },
  'Afghanistan': {
    severity: 'heavy',
    on: [
      { by: 'UN', reason: 'Taliban regime; terrorism; asset freezes on Taliban leaders', year: 1999 },
      { by: 'US', reason: 'Taliban takeover; ~$7B central bank frozen; national emergency extended; policy under review', year: 2021 },
      { by: 'EU', reason: 'Taliban regime; travel bans; asset freezes', year: 2001 },
      { by: 'Australia', reason: 'New financial sanctions and travel bans on 4 Taliban officials Dec 2025 for oppression of women/minorities', year: 2025 }
    ],
    by: []
  },
  'Palestine': {
    severity: 'heavy',
    on: [
      { by: 'Israel', reason: 'Land/sea/air blockade on Gaza; military occupation of West Bank', year: 2007 },
      { by: 'US', reason: 'Sanctions on Hamas as designated terrorist organization', year: 1997 },
      { by: 'EU', reason: 'Hamas listed as terrorist organization; funding restrictions', year: 2003 }
    ],
    by: []
  },
  'Lebanon': {
    severity: 'heavy',
    on: [
      { by: 'US', reason: 'Hezbollah financial facilitators sanctioned May + Nov 2025; $1B+ IRGC-to-Hezbollah transfers targeted; preventing rearmament after 2024 conflict', year: 2015 },
      { by: 'EU', reason: 'Targeted sanctions on officials blocking reform', year: 2021 },
      { by: 'Saudi Arabia', reason: 'Diplomatic rift; import bans over Hezbollah influence', year: 2021 }
    ],
    by: []
  },
  // === MODERATE ===
  'China': {
    severity: 'moderate',
    on: [
      { by: 'US', reason: 'Uyghur human rights; tech/chip export controls; 125 Chinese entities added to Entity List for Russia support; sanctions expansion paused Oct 2025 after Trump-Xi meeting', year: 2019 },
      { by: 'EU', reason: 'Xinjiang human rights abuses (targeted individuals)', year: 2021 },
      { by: 'UK', reason: 'Xinjiang human rights; Hong Kong crackdown', year: 2021 },
      { by: 'Canada', reason: 'Uyghur human rights abuses; targeted officials', year: 2021 }
    ],
    by: [
      { target: 'US entities', reason: '28 US aerospace/defense entities added to export control list Jan 2025', year: 2020 },
      { target: 'Global', reason: 'Strictest-ever rare earth and permanent magnet export controls effective Dec 2025; lithium battery controls', year: 2025 },
      { target: 'EU officials', reason: 'Retaliatory sanctions on European Parliament members', year: 2021 }
    ]
  },
  'Libya': {
    severity: 'moderate',
    on: [
      { by: 'UN', reason: 'Arms embargo; asset freezes on spoilers of peace process', year: 2011 },
      { by: 'US', reason: 'Targeted sanctions on militia leaders obstructing governance', year: 2018 },
      { by: 'EU', reason: 'Arms embargo enforcement; migrant smuggling networks', year: 2011 }
    ],
    by: []
  },
  'Somalia': {
    severity: 'moderate',
    on: [
      { by: 'UN', reason: 'Al-Shabaab sanctions and arms embargo extended through Nov 2026; maritime interdiction reauthorized; panel of experts through Dec 2026', year: 1992 },
      { by: 'US', reason: 'Al-Shabaab terrorism designations; targeted individual sanctions', year: 2010 }
    ],
    by: []
  },
  'DRC': {
    severity: 'moderate',
    on: [
      { by: 'UN', reason: 'Arms embargo on eastern DRC armed groups; conflict minerals', year: 2003 },
      { by: 'US', reason: 'Targeted sanctions on militia leaders; conflict minerals (Dodd-Frank)', year: 2006 },
      { by: 'EU', reason: 'Arms embargo; targeted measures on armed group leaders', year: 2003 }
    ],
    by: []
  },
  'Haiti': {
    severity: 'moderate',
    on: [
      { by: 'US', reason: 'Sanctions on gang leaders and corrupt elites; new authorities in FY2026 NDAA', year: 2022 },
      { by: 'UN', reason: 'Targeted sanctions on gang leaders destabilizing the country', year: 2022 },
      { by: 'Canada', reason: 'Sanctions on elites and gang leaders', year: 2022 }
    ],
    by: []
  },
  'Ethiopia': {
    severity: 'moderate',
    on: [
      { by: 'US', reason: 'AGOA suspension extended through Sep 2026 by Trump executive order; national emergency renewed', year: 2022 },
      { by: 'EU', reason: 'Suspended budget support over Tigray conflict', year: 2021 }
    ],
    by: []
  },
  'Eritrea': {
    severity: 'moderate',
    on: [
      { by: 'US', reason: 'Role in Tigray conflict; human rights abuses', year: 2021 },
      { by: 'EU', reason: 'Involvement in Tigray conflict; targeted sanctions', year: 2021 }
    ],
    by: []
  },
  'Nicaragua': {
    severity: 'moderate',
    on: [
      { by: 'US', reason: 'Authoritarian crackdown; election fraud; human rights abuses', year: 2018 },
      { by: 'EU', reason: 'Democratic backsliding; repression of opposition', year: 2020 },
      { by: 'Canada', reason: 'Human rights violations; sham elections', year: 2018 }
    ],
    by: []
  },
  'Zimbabwe': {
    severity: 'moderate',
    on: [
      { by: 'US', reason: 'Governance; human rights; undermining democracy', year: 2003 },
      { by: 'EU', reason: 'Arms embargo; targeted sanctions (partially eased)', year: 2002 }
    ],
    by: []
  },
  'Central African Republic': {
    severity: 'moderate',
    on: [
      { by: 'UN', reason: 'Arms embargo; targeted sanctions on armed group leaders', year: 2013 },
      { by: 'US', reason: 'Targeted: individuals undermining peace process', year: 2014 }
    ],
    by: []
  },
  'South Sudan': {
    severity: 'moderate',
    on: [
      { by: 'UN', reason: 'Arms embargo; targeted sanctions on conflict parties', year: 2018 },
      { by: 'US', reason: 'Civil war; obstruction of peace process', year: 2014 },
      { by: 'EU', reason: 'Targeted sanctions on individuals undermining peace', year: 2014 }
    ],
    by: []
  },
  // === LIMITED ===
  'Israel': {
    severity: 'limited',
    on: [
      { by: 'Arab League (historic)', reason: 'Economic boycott (largely defunct; some members normalized)', year: 1948 },
      { by: 'EU (partial)', reason: 'Settlement product labeling; some investment restrictions', year: 2015 },
      { by: 'US (targeted)', reason: 'Sanctions on extremist settlers in West Bank', year: 2024 },
      { by: 'Turkey', reason: 'Total export/import ban imposed 2024 over Gaza conflict', year: 2024 }
    ],
    by: [
      { target: 'Palestine (Gaza)', reason: 'Blockade on goods and movement (with Egypt)', year: 2007 },
      { target: 'Iran/Hezbollah', reason: 'Enforcement of international sanctions; trade restrictions', year: 2010 }
    ]
  },
  'Turkey': {
    severity: 'limited',
    on: [
      { by: 'US', reason: 'CAATSA sanctions over S-400 purchase; defense sector restrictions', year: 2020 },
      { by: 'EU (partial)', reason: 'Arms export restrictions over Syria operations', year: 2019 }
    ],
    by: [
      { target: 'Israel', reason: 'Total export/import ban over Gaza conflict', year: 2024 },
      { target: 'Syria (historic)', reason: 'Economic sanctions during civil war (now easing)', year: 2011 }
    ]
  },
  'Iraq': {
    severity: 'limited',
    on: [
      { by: 'US', reason: 'Targeted sanctions on Iran-aligned militias and corrupt officials', year: 2019 },
      { by: 'UN', reason: 'Residual measures from Saddam era (mostly lifted)', year: 2003 }
    ],
    by: []
  },
  'Pakistan': {
    severity: 'limited',
    on: [
      { by: 'US', reason: 'Targeted: nuclear proliferation-related entities; terrorism financing concerns', year: 2004 }
    ],
    by: [
      { target: 'India', reason: 'Trade suspension over Kashmir dispute', year: 2019 }
    ]
  },
  'Nigeria': {
    severity: 'limited',
    on: [
      { by: 'US', reason: 'Targeted: Boko Haram/ISWAP terrorism designations; visa restrictions', year: 2013 },
      { by: 'UK', reason: 'Targeted sanctions on corruption-linked individuals', year: 2021 }
    ],
    by: []
  },
  'Mexico': {
    severity: 'limited',
    on: [
      { by: 'US', reason: 'Kingpin Act designations on cartel leaders; OFAC fentanyl trafficking network sanctions expanded 2023-2025', year: 2000 }
    ],
    by: []
  },
  'Saudi Arabia': {
    severity: 'limited',
    on: [
      { by: 'US (targeted)', reason: 'Magnitsky sanctions on individuals re: Khashoggi murder', year: 2018 },
      { by: 'Canada', reason: 'Arms export review after Khashoggi killing', year: 2018 }
    ],
    by: [
      { target: 'UN-mandated targets', reason: 'Enforces UN terrorism/proliferation sanctions through GCC', year: 2017 }
    ]
  },
  'Mali': {
    severity: 'limited',
    on: [
      { by: 'EU', reason: 'Military coup; use of Wagner mercenaries', year: 2022 },
      { by: 'US', reason: 'Targeted sanctions on junta leaders', year: 2022 }
    ],
    by: []
  },
  'Burkina Faso': {
    severity: 'limited',
    on: [
      { by: 'EU', reason: 'Suspended cooperation after military takeover', year: 2022 }
    ],
    by: []
  },
  'Niger': {
    severity: 'limited',
    on: [
      { by: 'EU', reason: 'Suspended cooperation after military coup', year: 2023 }
    ],
    by: []
  },
  'Guinea': {
    severity: 'limited',
    on: [
      { by: 'US', reason: 'Targeted sanctions on junta officials', year: 2022 }
    ],
    by: []
  },
  // === NONE (but impose sanctions on others) ===
  'Ukraine': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: 'Trade restrictions and sanctions on Russian entities', year: 2022 }
    ]
  },
  'India': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Pakistan', reason: 'Trade restrictions; MFN status revoked post-Pulwama', year: 2019 },
      { target: 'China', reason: 'Banned 200+ Chinese apps; restricted Chinese investment', year: 2020 }
    ]
  },
  'South Korea': {
    severity: 'none',
    on: [],
    by: [
      { target: 'North Korea', reason: 'Full sanctions enforcement aligned with UN/US', year: 2010 }
    ]
  },
  'Japan': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: 'Asset freezes; export controls; energy restrictions', year: 2022 },
      { target: 'North Korea', reason: 'Full trade embargo; ship entry bans', year: 2006 }
    ]
  },
  'Philippines': {
    severity: 'none',
    on: [],
    by: []
  },
  // === MAJOR WESTERN SANCTIONERS (no sanctions ON them) ===
  'United Kingdom': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: '28 autonomous sanctions regimes; aligned with EU rounds; unified UK Sanctions List Jan 2026', year: 2022 },
      { target: 'Iran', reason: 'Nuclear program; triggered JCPOA snapback Aug 2025', year: 2012 },
      { target: 'Myanmar', reason: 'Military coup; asset freezes on junta leaders', year: 2021 },
      { target: 'Belarus', reason: 'Complicity in Ukraine invasion; human rights', year: 2022 },
      { target: 'North Korea', reason: 'WMD programs; cyber threats', year: 2006 }
    ]
  },
  'Canada': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: '77 individuals + 39 entities + 201 vessels sanctioned Jun 2025; secondary sanctions', year: 2022 },
      { target: 'Iran', reason: '4 officials sanctioned Dec 2025 for human rights; SEMA regime', year: 2012 },
      { target: 'Myanmar', reason: '13 officials and 3 entities sanctioned Mar 2025', year: 2018 },
      { target: 'Belarus', reason: 'Human rights violations; support for Russian invasion', year: 2020 },
      { target: 'Haiti', reason: 'Gang leaders and corrupt elites', year: 2022 }
    ]
  },
  'Australia': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: 'Over 50% of Australia sanctions focus; financial/trade restrictions', year: 2022 },
      { target: 'Afghanistan', reason: 'World-first autonomous framework Dec 2025; 4 Taliban officials designated for oppression of women', year: 2025 },
      { target: 'North Korea', reason: 'WMD proliferation; maritime enforcement coalition', year: 2006 },
      { target: 'Iran', reason: 'Nuclear program; UN sanctions enforcement', year: 2008 },
      { target: 'Myanmar', reason: 'Military coup; targeted sanctions', year: 2021 }
    ]
  },
  'Switzerland': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: 'Implements EU packages; 16th package Feb 2025; 18th package Oct 2025; 28 sanctions regimes', year: 2022 },
      { target: 'Iran', reason: 'Expanded Dec 2025 following JCPOA snapback', year: 2012 },
      { target: 'Syria', reason: 'Lifted Jun 2025 aligned with EU', year: 2011 },
      { target: 'Belarus', reason: 'Implements EU measures; Oct 2025 package', year: 2022 }
    ]
  },
  'France': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements all EU sanctions; limited autonomous authority under Monetary and Financial Code for counter-terrorism', year: 2022 },
      { target: 'Terrorism-related', reason: 'Registre National Des Gels (National Freeze Registry) for domestic terror finance freezes', year: 2015 }
    ]
  },
  'Germany': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions only; no autonomous sanctions program; coalition revising foreign trade laws May 2025', year: 2022 }
    ]
  },
  'Taiwan': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: 'Export restrictions on 77 machine tool items; increased penalties for military-linked sales; joined international sanctions 2022', year: 2022 }
    ]
  },
  // === OTHER COUNTRIES ===
  'UAE': {
    severity: 'none',
    on: [],
    by: [
      { target: 'UN-mandated targets', reason: 'Enforces UN sanctions; major financial compliance hub; anti-money laundering frameworks', year: 2020 }
    ]
  },
  'Singapore': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: 'Rare Asian nation to impose autonomous sanctions on Russia; export controls on electronics/tech', year: 2022 },
      { target: 'North Korea', reason: 'UN sanctions enforcement; financial compliance', year: 2006 }
    ]
  },
  'Norway': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: 'Aligned with EU sanctions as EEA member; energy sector restrictions', year: 2022 },
      { target: 'Belarus', reason: 'Aligned with EU measures', year: 2022 }
    ]
  },
  'Brazil': {
    severity: 'limited',
    on: [
      { by: 'US (targeted)', reason: 'Sanctions on Justice Alexandre de Moraes and family Jul 2025 for judicial overreach; 50% tariff increase on select goods', year: 2025 }
    ],
    by: []
  },
  'South Africa': {
    severity: 'limited',
    on: [
      { by: 'US (proposed)', reason: 'H.R.2633 bill targeting government/ANC officials; 30% tariff (highest Sub-Saharan Africa); additional bills re: antisemitic conduct', year: 2025 }
    ],
    by: []
  },
  'Hungary': {
    severity: 'limited',
    on: [
      { by: 'EU', reason: 'Rule-of-law conditionality; frozen EU recovery funds over democratic backsliding and judicial independence concerns', year: 2022 }
    ],
    by: []
  },
  'Serbia': {
    severity: 'none',
    on: [],
    by: []
  },
  'Egypt': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Terrorism-related', reason: 'Maintains List of Terrorist Entities; implements UN sanctions; FATF compliant', year: 2020 }
    ]
  },
  'Bangladesh': {
    severity: 'none',
    on: [],
    by: []
  },
  'Argentina': {
    severity: 'none',
    on: [],
    by: []
  },
  'Kenya': {
    severity: 'none',
    on: [],
    by: []
  },
  'Colombia': {
    severity: 'none',
    on: [],
    by: []
  },
  'Peru': {
    severity: 'none',
    on: [],
    by: []
  },
  'Thailand': {
    severity: 'none',
    on: [],
    by: []
  },
  'El Salvador': {
    severity: 'none',
    on: [],
    by: []
  },
  'Sri Lanka': {
    severity: 'none',
    on: [],
    by: []
  },
  'Bolivia': {
    severity: 'none',
    on: [],
    by: []
  },
  'Guyana': {
    severity: 'none',
    on: [],
    by: []
  },
  'Italy': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions; active enforcement through Banca d\'Italia', year: 2022 }
    ]
  },
  'Poland': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Russia', reason: 'Implements EU sanctions; additional national restrictions on Russian transport and trade', year: 2022 }
    ]
  },
  'Spain': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }
    ]
  },
  'Netherlands': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements EU sanctions; key ASML chip export controls affecting China', year: 2022 }
    ]
  },
  'Indonesia': {
    severity: 'none',
    on: [],
    by: []
  },
  'Vietnam': {
    severity: 'none',
    on: [],
    by: []
  },
  'Malaysia': {
    severity: 'none',
    on: [],
    by: []
  },
  'Romania': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }
    ]
  },
  'Greece': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }
    ]
  },
  'Sweden': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }
    ]
  },
  'Finland': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }
    ]
  },
  'Austria': {
    severity: 'none',
    on: [],
    by: [
      { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }
    ]
  },
  'Chile': {
    severity: 'none',
    on: [],
    by: []
  },
  'Algeria': {
    severity: 'none',
    on: [],
    by: []
  },
  'Tunisia': {
    severity: 'none',
    on: [],
    by: []
  },
  'Ecuador': {
    severity: 'none',
    on: [],
    by: []
  },
  'Georgia': {
    severity: 'none',
    on: [],
    by: []
  },
  'Armenia': {
    severity: 'none',
    on: [],
    by: []
  },
  'Moldova': {
    severity: 'none',
    on: [],
    by: []
  },
  // === ADDITIONAL SANCTIONERS & EU MEMBERS ===
  'Estonia': { severity: 'none', on: [], by: [
    { target: 'Russia', reason: 'Among most hawkish EU members; implements EU measures; vocal advocate for stronger enforcement', year: 2022 }
  ]},
  'Latvia': { severity: 'none', on: [], by: [
    { target: 'Russia', reason: 'Implements EU sanctions; closed border crossings; expelled Russian diplomats', year: 2022 }
  ]},
  'Lithuania': { severity: 'none', on: [], by: [
    { target: 'Russia', reason: 'Implements EU sanctions; Kaliningrad transit restrictions; strong enforcement', year: 2022 },
    { target: 'China (targeted by)', reason: 'Subject to Chinese economic coercion over Taiwan office; EU backed Lithuania', year: 2021 }
  ]},
  'Denmark': { severity: 'none', on: [], by: [
    { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions; active on Russia maritime enforcement in Baltic', year: 2022 }
  ]},
  'Belgium': { severity: 'none', on: [], by: [
    { target: 'Various (via EU)', reason: 'EU headquarters; key role in sanctions coordination; hosts SWIFT messaging system', year: 2022 }
  ]},
  'Ireland': { severity: 'none', on: [], by: [
    { target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }
  ]},
  'Czech Republic': { severity: 'none', on: [], by: [
    { target: 'Russia', reason: 'Implements EU sanctions; expelled Russian diplomats over Vrbetice explosion', year: 2021 }
  ]},
  'New Zealand': { severity: 'none', on: [], by: [
    { target: 'Russia', reason: 'Autonomous Russia Sanctions Act 2022; travel bans; asset freezes; trade restrictions', year: 2022 },
    { target: 'North Korea', reason: 'UN sanctions enforcement', year: 2006 }
  ]},
  'Qatar': { severity: 'none', on: [], by: [
    { target: 'Terrorism-related', reason: 'Counter-terrorism financing framework; was subject to Saudi-led blockade 2017-2021 (resolved)', year: 2017 }
  ]},
  'Jordan': { severity: 'none', on: [], by: [
    { target: 'UN-mandated targets', reason: 'Implements UN sanctions; key anti-smuggling enforcement on Syria/Iraq borders', year: 2014 }
  ]},
  'Kazakhstan': { severity: 'none', on: [], by: [
    { target: 'Russia (compliance)', reason: 'Strengthened sanctions compliance to avoid secondary sanctions; restricted parallel imports to Russia', year: 2023 }
  ]},
  'Croatia': { severity: 'none', on: [], by: [{ target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }] },
  'Slovenia': { severity: 'none', on: [], by: [{ target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }] },
  'Slovakia': { severity: 'none', on: [], by: [{ target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }] },
  'Bulgaria': { severity: 'none', on: [], by: [{ target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }] },
  'Portugal': { severity: 'none', on: [], by: [{ target: 'Various (via EU)', reason: 'Implements EU and UN sanctions', year: 2022 }] },
  'Luxembourg': { severity: 'none', on: [], by: [{ target: 'Various (via EU)', reason: 'Implements EU sanctions; major financial center for asset freezes', year: 2022 }] },
  'Cyprus': { severity: 'none', on: [], by: [{ target: 'Various (via EU)', reason: 'Implements EU sanctions; past scrutiny over Russian oligarch assets', year: 2022 }] },
  'Malta': { severity: 'none', on: [], by: [{ target: 'Various (via EU)', reason: 'Implements EU sanctions; shipping registry enforcement', year: 2022 }] },
  'Iceland': { severity: 'none', on: [], by: [{ target: 'Russia', reason: 'Aligned with EU sanctions as EEA member', year: 2022 }] },
  // === REMAINING COUNTRIES (no significant sanctions involvement) ===
  'Kuwait': { severity: 'none', on: [], by: [] },
  'Bahrain': { severity: 'none', on: [], by: [] },
  'Oman': { severity: 'none', on: [], by: [] },
  'Morocco': { severity: 'none', on: [], by: [] },
  'Senegal': { severity: 'none', on: [], by: [] },
  'Tanzania': { severity: 'none', on: [], by: [] },
  'Ghana': { severity: 'none', on: [], by: [] },
  'Ivory Coast': { severity: 'none', on: [], by: [] },
  'Cameroon': { severity: 'none', on: [], by: [] },
  'Uganda': { severity: 'none', on: [], by: [] },
  'Rwanda': { severity: 'none', on: [], by: [] },
  'Costa Rica': { severity: 'none', on: [], by: [] },
  'Panama': { severity: 'none', on: [], by: [] },
  'Uruguay': { severity: 'none', on: [], by: [] },
  'Dominican Republic': { severity: 'none', on: [], by: [] },
  'Jamaica': { severity: 'none', on: [], by: [] },
  'Guatemala': { severity: 'none', on: [], by: [] },
  'Honduras': { severity: 'none', on: [], by: [] },
  'Paraguay': { severity: 'none', on: [], by: [] },
  'Albania': { severity: 'none', on: [], by: [] },
  'North Macedonia': { severity: 'none', on: [], by: [] },
  'Montenegro': { severity: 'none', on: [], by: [] },
  'Kosovo': { severity: 'none', on: [], by: [] },
  'Bosnia and Herzegovina': { severity: 'none', on: [], by: [] },
  'Cambodia': { severity: 'none', on: [], by: [] },
  'Laos': { severity: 'none', on: [], by: [] },
  'Nepal': { severity: 'none', on: [], by: [] },
  'Uzbekistan': { severity: 'none', on: [], by: [] },
  'Botswana': { severity: 'none', on: [], by: [] },
  'Zambia': { severity: 'none', on: [], by: [] },
  'Mozambique': { severity: 'none', on: [], by: [] },
  'Angola': { severity: 'none', on: [], by: [] },
  'Namibia': { severity: 'none', on: [], by: [] },
  'Madagascar': { severity: 'none', on: [], by: [] },
  'Suriname': { severity: 'none', on: [], by: [] },
  'Belize': { severity: 'none', on: [], by: [] },
  'Brunei': { severity: 'none', on: [], by: [] },
  'Chad': { severity: 'none', on: [], by: [] },
  'Djibouti': { severity: 'none', on: [], by: [] },
  'Gabon': { severity: 'none', on: [], by: [] },
  'Mauritania': { severity: 'none', on: [], by: [] },
  'Mongolia': { severity: 'none', on: [], by: [] },
  'Turkmenistan': { severity: 'none', on: [], by: [] },
  'Tajikistan': { severity: 'none', on: [], by: [] },
  'Kyrgyzstan': { severity: 'none', on: [], by: [] },
  'Trinidad and Tobago': { severity: 'none', on: [], by: [] },
  'Bahamas': { severity: 'none', on: [], by: [] },
  'Barbados': { severity: 'none', on: [], by: [] },
  'Republic of Congo': { severity: 'limited', on: [
    { by: 'EU', reason: 'Arms embargo (conflict prevention)', year: 2023 }
  ], by: [] },
  'Equatorial Guinea': { severity: 'limited', on: [
    { by: 'US', reason: 'Corruption and human rights abuses (Magnitsky)', year: 2024 }
  ], by: [] },
  'Burundi': { severity: 'moderate', on: [
    { by: 'US', reason: 'Political repression and human rights abuses', year: 2023 },
    { by: 'EU', reason: 'Political crisis and violence', year: 2022 }
  ], by: [] },
  'Gambia': { severity: 'none', on: [], by: [] },
  'Guinea-Bissau': { severity: 'limited', on: [
    { by: 'UN', reason: 'Political instability and drug trafficking (travel ban on individuals)', year: 2023 }
  ], by: [] },
  'Sierra Leone': { severity: 'none', on: [], by: [] },
  'Liberia': { severity: 'none', on: [], by: [] },
  'Togo': { severity: 'none', on: [], by: [] },
  'Benin': { severity: 'none', on: [], by: [] },
  'Cape Verde': { severity: 'none', on: [], by: [] },
  'Mauritius': { severity: 'none', on: [], by: [] },
  'Seychelles': { severity: 'none', on: [], by: [] },
  'Malawi': { severity: 'none', on: [], by: [] },
  'Bhutan': { severity: 'none', on: [], by: [] },
  'Maldives': { severity: 'none', on: [], by: [] },
  'Timor-Leste': { severity: 'none', on: [], by: [] },
  'Papua New Guinea': { severity: 'none', on: [], by: [] },
  'Fiji': { severity: 'none', on: [], by: [] },
  'Solomon Islands': { severity: 'none', on: [], by: [] },
  'Vanuatu': { severity: 'none', on: [], by: [] },
  'Samoa': { severity: 'none', on: [], by: [] },
  'Tonga': { severity: 'none', on: [], by: [] },
  'Kiribati': { severity: 'none', on: [], by: [] },
  'Marshall Islands': { severity: 'none', on: [], by: [] },
  'Micronesia': { severity: 'none', on: [], by: [] },
  'Palau': { severity: 'none', on: [], by: [] },
  'Nauru': { severity: 'none', on: [], by: [] },
  'Tuvalu': { severity: 'none', on: [], by: [] },
  'Andorra': { severity: 'none', on: [], by: [] },
  'Antigua and Barbuda': { severity: 'none', on: [], by: [] },
  'Comoros': { severity: 'none', on: [], by: [] },
  'Dominica': { severity: 'none', on: [], by: [] },
  'Eswatini': { severity: 'none', on: [], by: [] },
  'Grenada': { severity: 'none', on: [], by: [] },
  'Lesotho': { severity: 'none', on: [], by: [] },
  'Liechtenstein': { severity: 'none', on: [], by: [
    { target: 'Russia', reason: 'Aligned with EU/Swiss sanctions on Russia-Ukraine war', year: 2022 },
    { target: 'Belarus', reason: 'Aligned with EU/Swiss sanctions', year: 2022 }
  ] },
  'Monaco': { severity: 'none', on: [], by: [
    { target: 'Russia', reason: 'Aligned with EU sanctions on Russia-Ukraine war', year: 2022 }
  ] },
  'San Marino': { severity: 'none', on: [], by: [
    { target: 'Russia', reason: 'Aligned with EU sanctions on Russia-Ukraine war', year: 2022 }
  ] },
  'Sao Tome and Principe': { severity: 'none', on: [], by: [] },
  'Saint Kitts and Nevis': { severity: 'none', on: [], by: [] },
  'Saint Lucia': { severity: 'none', on: [], by: [] },
  'Saint Vincent and the Grenadines': { severity: 'none', on: [], by: [] }
};

export const TOS_CONTENT = {
  terms: `<h2>TERMS OF SERVICE</h2>
<p><strong>Effective Date: February 13, 2026</strong></p>
<p>Welcome to Hegemon Global Intelligence Network ("Hegemon Global," "we," "us," or "our"). These Terms of Service ("Terms") govern your access to and use of hegemonglobal.com and any related services, content, features, and functionality (collectively, the "Site").</p>
<p>By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, you must not use the Site.</p>

<h3>1. Nature of the Site</h3>
<p>Hegemon Global provides geopolitical analysis, risk commentary, research summaries, forecasts, election tracking, sanctions tracking, and related informational content. All content on this Site is provided for informational and educational purposes only.</p>
<p>Nothing on this Site constitutes:</p>
<ul><li>Financial advice</li><li>Investment advice</li><li>Legal advice</li><li>Strategic advisory services</li><li>Government or policy recommendations</li><li>Professional consulting services</li></ul>
<p>You acknowledge that you are solely responsible for any decisions made based on the information provided on this Site.</p>

<h3>2. No Professional or Investment Advice</h3>
<p>The Risk Levels, Forecasts, Articles, Briefs, Elections tracking, Horizon calendar entries, sanctions information, and any other materials published on this Site are analytical opinions and informational summaries only.</p>
<p>They are not intended to serve as:</p>
<ul><li>Investment recommendations</li><li>Trading signals</li><li>Economic advisory guidance</li><li>Security or defense recommendations</li><li>Political endorsements</li></ul>
<p>You agree that you will not rely on any content on this Site as a substitute for independent professional advice.</p>

<h3>3. Limitation of Liability</h3>
<p>To the fullest extent permitted by law: Hegemon Global, its owner, affiliates, contributors, agents, and representatives shall not be liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages arising out of or related to:</p>
<ul><li>Your use of or inability to use the Site</li><li>Reliance on any analysis, risk assessment, or forecast</li><li>Errors or omissions in content</li><li>Changes in geopolitical conditions</li><li>Data inaccuracies</li><li>Third-party links or referenced materials</li></ul>
<p>Use of the Site is at your own risk.</p>

<h3>4. No Warranties</h3>
<p>The Site and all content are provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to: accuracy, completeness, reliability, timeliness, fitness for a particular purpose, and non-infringement.</p>
<p>We do not guarantee that the Site will be uninterrupted, secure, or error-free.</p>

<h3>5. Intellectual Property</h3>
<p>All content on the Site, including articles, briefs, forecasts, risk level classifications, structural frameworks, country analyses, layout design, graphics, text, logos, and trademarks are the intellectual property of Hegemon Global unless otherwise stated.</p>
<p>You may not copy, reproduce, redistribute, republish, scrape, extract data, or create derivative works without prior written permission. Limited quotation with attribution and link-back is permitted for non-commercial use. Unauthorized commercial use is strictly prohibited.</p>

<h3>6. Data Scraping and Automated Access</h3>
<p>You may not use bots, crawlers, scraping tools, AI harvesting systems, or automated methods to extract data from the Site without express written consent. We reserve the right to block IP addresses or pursue legal remedies against unauthorized data harvesting.</p>

<h3>7. External Links</h3>
<p>The Site may contain links to third-party websites. Hegemon Global does not control and is not responsible for the content, policies, or practices of third-party sites. Accessing third-party links is done at your own risk.</p>

<h3>8. Modifications to Content</h3>
<p>We reserve the right to modify risk levels, update forecasts, change classifications, remove or edit content, and modify or discontinue features at any time without notice. Geopolitical conditions evolve rapidly, and content may become outdated.</p>

<h3>9. Indemnification</h3>
<p>You agree to indemnify and hold harmless Hegemon Global and its affiliates from any claims, damages, liabilities, losses, or expenses arising from your use of the Site, your reliance on Site content, or your violation of these Terms.</p>

<h3>10. No Government Affiliation</h3>
<p>Hegemon Global is an independent informational platform. It is not affiliated with any government, intelligence agency, defense institution, financial institution, or political organization. Any resemblance to official classification systems is coincidental and analytical in nature.</p>

<h3>11. Governing Law</h3>
<p>These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.</p>

<h3>12. Changes to These Terms</h3>
<p>We reserve the right to modify these Terms at any time. Updated Terms will be posted with a revised Effective Date. Continued use of the Site constitutes acceptance of updated Terms.</p>

<h3>13. Contact</h3>
<p>For questions regarding these Terms, contact: <a href="mailto:hegemonglobal0@gmail.com">hegemonglobal0@gmail.com</a></p>

<h2>DISCLAIMER</h2>
<p>Hegemon Global provides geopolitical risk commentary and informational analysis only. All Risk Levels, Forecasts, Briefs, Articles, Elections tracking, Horizon entries, and related content represent analytical opinions and interpretations of publicly available information. Nothing on this Site constitutes financial advice, investment advice, legal advice, security advice, or professional consulting services. Users are solely responsible for decisions made based on Site content.</p>

<h2 style="margin-top:28px;padding-top:20px;border-top:1px solid #1f2937;">ABOUT HEGEMON GLOBAL</h2>
<p>Hegemon Global is an interactive geopolitical analysis platform that aggregates real-time global news, market data, trade flow visualization, and country-by-country risk assessments on an interactive 3D globe. Our mission is to make geopolitical intelligence accessible, visual, and actionable for researchers, analysts, journalists, and anyone seeking to understand how global events connect and impact the world. Hegemon Global is an independent informational platform with no government, institutional, or political affiliation.</p>
<p>For questions, feedback, or inquiries, contact us at: <a href="mailto:hegemonglobal0@gmail.com">hegemonglobal0@gmail.com</a></p>`,

  privacy: `<h2>PRIVACY POLICY</h2>
<p><strong>Effective Date: February 13, 2026</strong></p>
<p>Hegemon Global Intelligence Network ("Hegemon Global," "we," "us," or "our") operates hegemonglobal.com (the "Site"). This Privacy Policy explains how information is collected, used, and protected when you access or interact with the Site.</p>
<p>By using the Site, you consent to the practices described in this Policy.</p>

<h3>1. Information We Collect</h3>
<h3>A. Automatically Collected Information</h3>
<p>When you visit the Site, certain information may be collected automatically, including: IP address, browser type and version, device type, operating system, pages viewed, time spent on pages, referring website, and general geographic location. This information is collected through analytics and server logs.</p>

<h3>B. Analytics Services</h3>
<p>We use Google Analytics (GA4), a web analytics service provided by Google LLC, to understand how users interact with the Site. Google Analytics may collect device and browser information, general geographic location, usage behavior, and traffic source data.</p>
<p>Google Analytics uses cookies and similar technologies to collect and process data. Information generated may be transmitted to and stored by Google on servers in the United States.</p>
<p>We use this information to analyze traffic patterns, improve site performance, and understand user engagement.</p>
<p>You can learn more about how Google processes data at: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></p>
<p>You can opt out of Google Analytics by using the Google Analytics Opt-out Browser Add-on.</p>

<h3>2. Cookies</h3>
<p>The Site uses cookies and similar technologies to enable analytics functionality, improve user experience, and monitor site performance. You may disable cookies through your browser settings. Disabling cookies may limit certain functionality.</p>

<h3>3. Use of Information</h3>
<p>Information collected is used to operate and maintain the Site, improve content and structure, monitor security, prevent abuse, and analyze performance metrics. We do not sell, rent, or trade personal information.</p>

<h3>4. Data Retention</h3>
<p>Analytics data is retained only as long as necessary to fulfill operational and analytical purposes. Server logs may be retained for security and technical maintenance.</p>

<h3>5. Data Security</h3>
<p>We implement reasonable administrative and technical safeguards to protect information. However, no method of transmission over the internet is completely secure. Use of the Site is at your own risk.</p>

<h3>6. International Users</h3>
<p>If you access the Site from outside the United States, your information may be transferred to and processed in the United States. By using the Site, you consent to such transfer.</p>

<h3>7. California Privacy Rights (CCPA)</h3>
<p>If you are a California resident, you may have rights under the California Consumer Privacy Act, including the right to request disclosure or deletion of personal data. Hegemon Global does not sell personal information.</p>

<h3>8. European Users (GDPR Notice)</h3>
<p>If you are located in the European Economic Area, you may have the right to access your personal data, request correction or deletion, and restrict processing. Data is processed on the basis of legitimate interest in operating and improving the Site.</p>

<h3>9. Children's Privacy</h3>
<p>This Site is not intended for individuals under the age of 13. We do not knowingly collect personal information from children.</p>

<h3>10. Changes to This Policy</h3>
<p>We may update this Privacy Policy from time to time. The updated version will include a revised Effective Date. Continued use of the Site constitutes acceptance of changes.</p>

<h3>11. Contact</h3>
<p>For privacy-related questions, contact: <a href="mailto:hegemonglobal0@gmail.com">hegemonglobal0@gmail.com</a></p>`
};

export const BREAKING_KEYWORDS = ['breaking', 'just in', 'urgent', 'developing', 'explosion', 'earthquake', 'tsunami', 'coup', 'assassination', 'war declared', 'nuclear'];

export const IRRELEVANT_KEYWORDS = [
  // Sports - general
  'sports', 'football', 'soccer', 'basketball', 'baseball', 'hockey', 'tennis', 'golf', 'cricket',
  'rugby', 'boxing', 'mma', 'ufc', 'wrestling', 'volleyball', 'swimming', 'marathon', 'triathlon',
  'nfl', 'nba', 'mlb', 'nhl', 'mls', 'epl', 'la liga', 'serie a', 'bundesliga', 'ligue 1',
  'premier league', 'champions league', 'world series', 'playoff', 'playoffs', 'touchdown',
  'super bowl', 'world cup goal', 'hat trick', 'slam dunk', 'home run', 'grand slam',
  'figure skating', 'ice skating', 'formula 1', 'f1 race', 'nascar', 'grand prix',
  // Sports teams & athletes
  'knicks', 'lakers', 'celtics', 'warriors', 'yankees', 'dodgers', 'cowboys', 'patriots',
  'manchester united', 'real madrid', 'barcelona fc', 'man city',
  'olympian', 'olympic medal', 'olympic athlete', 'gold medalist', 'silver medalist',
  // Entertainment & celebrity
  'celebrity', 'entertainment', 'movie', 'film review', 'box office', 'blockbuster',
  'music', 'concert', 'album', 'grammy', 'oscar', 'emmy', 'golden globe',
  'netflix', 'streaming', 'hulu', 'disney+', 'hbo max', 'prime video',
  'tv show', 'reality tv', 'american idol', 'bachelor', 'bachelorette', 'survivor',
  'kardashian', 'influencer', 'tiktok star', 'instagram', 'viral video', 'went viral',
  'red carpet', 'paparazzi', 'tabloid', 'gossip', 'scandal',
  // Celebrity deaths & entertainment personalities
  'actor dies', 'actor dead', 'actor passes', 'actress dies', 'actress dead', 'actress passes',
  'star dies', 'star dead', 'star passes', 'celebrity death', 'celebrity dies',
  'als battle', 'als diagnosis', 'tv star dies', 'tv star dead',
  'film star dies', 'hollywood star', 'sitcom', 'soap opera', 'game show', 'talent show',
  "grey's anatomy", 'eric dane', 'mcsteamy', 'euphoria',
  'emmy winner dies', 'oscar winner dies', 'grammy winner dies',
  'beloved actor', 'beloved actress', 'remembered for', 'tributes pour',
  // Lifestyle fluff
  'recipe', 'cooking', 'fashion', 'beauty', 'lifestyle', 'horoscope', 'zodiac',
  'dating', 'relationship advice', 'wedding', 'divorce', 'weight loss', 'diet',
  'fitness', 'workout', 'yoga', 'skincare', 'makeup', 'hairstyle',
  // Gambling & finance spam
  'lottery', 'powerball', 'mega millions', 'jackpot', 'casino',
  'stock picks', 'buy now', 'shares up', 'otcmkts', 'penny stock', 'crypto pump',
  // Fan culture & non-news
  'fans react', 'fans are', 'fans say', 'fans think', 'fan base',
  'best dressed', 'worst dressed', 'who wore it', 'style guide',
  // Local/human interest fluff
  'feel-good', 'heartwarming', 'uplifting', 'adorable', 'cute video',
  'good samaritan', 'random act of kindness', 'local hero', 'community hero',
  'odd news', 'weird news', 'quirky', 'bizarre video', 'caught on camera',
  'puppy', 'kitten', 'rescue dog', 'rescue cat', 'pet owner',
  'slipped into', 'fell into a', 'falls into',
  // Local crime/incidents (not geopolitical)
  'arrested for', 'charged with', 'sentenced to', 'mugshot',
  'car crash', 'traffic accident', 'house fire', 'apartment fire',
  'missing person', 'amber alert', 'silver alert',
  // Weather fluff (not climate policy)
  'weather forecast', 'pollen count', 'snow day', 'beach advisory',
  // Shopping & consumer
  'best deals', 'black friday', 'prime day', 'coupon', 'clearance sale',
  'product review', 'buyer\'s guide', 'top picks', 'gift guide',
  // Domestic partisan gotcha / political theater (not geopolitics)
  'slams', 'slammed', 'claps back', 'destroyed by', 'owned by', 'stumped by',
  'shocked after', 'shocked by', 'stunned by', 'rips into', 'torches', 'blasts',
  'fifth-grade', 'goes viral', 'epic response', 'mic drop', 'walk of shame',
  'gop lawmaker', 'dem lawmaker', 'liberal tears', 'conservative meltdown',
  'twitter feud', 'social media feud', 'online backlash', 'cancel culture',
  'hot take', 'opinion:', 'op-ed:', 'column:', 'commentary:',
  // Advice columns, tabloid fluff, human drama
  'dear abby', 'ask amy', 'advice column', 'agony aunt', 'dear ann',
  'miss manners', 'carolyn hax', 'dan savage', 'relationship expert',
  'you won\'t believe', 'jaw-dropping', 'mind-blowing', 'insane video',
  'shocking photo', 'unbelievable', 'craziest', 'wildest',
  'side hustle', 'passive income', 'work from home', 'make money fast',
  'zodiac sign', 'spirit animal', 'personality test', 'iq test',
  'mugshot', 'florida man', 'karen', 'entitled', 'neighbor from hell',
  'baby name', 'gender reveal', 'wedding disaster', 'bridezilla',
  'food hack', 'life hack', 'cleaning hack', 'ikea hack',
  'ranked worst', 'ranked best', 'top 10', 'listicle',
  'royal family', 'meghan markle', 'prince harry', 'kate middleton',
  // Sports - positions & terms
  'quarterback', 'rushing yards', 'fantasy football', 'draft pick', 'free agent',
  'batting average', 'wide receiver', 'tight end', 'linebacker', 'cornerback',
  'running back', 'transfer window', 'injury report',
  // Specific non-geopolitical names/topics
  'jaxson dart', 'callahan traits',
  // Philanthropy & lifestyle fluff
  'philanthropic', 'philanthropy', 'donate his fortune', 'charitable foundation',
  'cookbook', 'fashion week', 'baby bump', 'engagement ring',
  'album review', 'movie review', 'netflix series',
  // Domestic slop / local news
  'red lobster', 'restaurant closing', 'shuttering', 'sewage spill',
  'megyn kelly', 'randy fine', 'streamer', 'coach denies', 'college offer',
  'mistrial', 'antifa protest', 't-shirt', 'frontbench team',
  'warns over dissent', 'full bigot',
  // TV hosts & pundits
  'colbert', 'kimmel', 'fallon', 'hannity', 'maddow', 'carlson', 'tucker',
  'megyn kelly', 'joe rogan', 'bill maher', 'john oliver', 'late night',
  'talk show', 'late show', 'tonight show', 'spiked interview',
  // Domestic US policy (not geopolitics)
  'body camera', 'body cam', 'fcc', 'school board', 'zoning',
  'parking ticket', 'HOA', 'city council', 'school district',
  // Domestic crime / trials
  'murder trial', 'manslaughter', 'on trial for', 'climber',
  'hit and run', 'drunk driving', 'dui', 'shoplifting',
  // Culture war noise
  'woke', 'anti-woke', 'dei', 'faith and flag', 'prayer in school',
  'drag queen', 'book ban', 'critical race',
  // Congressional noise (not geopolitics)
  'funding fight', 'filibuster', 'committee hearing', 'oversight hearing',
  'subpoena', 'contempt of congress', 'floor vote',
  // Olympics & sports event fluff
  'winter olympics', 'summer olympics', 'olympics', 'olympic games',
  'runaway dog', 'cross country race', 'hu-ski', 'interrupting', 'interrupts',
  // UFO / alien / non-geopolitical tech
  'ufo', 'ufos', 'alien', 'aliens', 'extraterrestrial', 'ufo files', 'ufo hearing',
  'nvidia', 'openai deal', 'stranded women', 'stranded woman',
  'unidentified aerial', 'flying saucer', 'roswell',
  // Specific non-geopolitical items
  'chicago bears', 'stadium relocation', 'extorting crypto', 'cryptocurrency extortion',
  'lifeline medic', 'county governor', 'epstein files', 'superstar singer',
  'death threats and fans', 'prince andrew', 'king charles brother',
  'police extorting', 'crypto scam', 'crypto fraud',
  // Local politics / domestic admin
  'county board', 'suspends board', 'city manager', 'township',
  'local election', 'school superintendent', 'fire chief',
  // Tabloid celebrity
  'caught between', 'caught on tape', 'leaked video', 'leaked photo',
  'plastic surgery', 'weight gain', 'weight loss journey',
  // Additional specific irrelevant items
  'leukemia', 'leukaemia', 'cancer battle', 'cancer diagnosis',
  'klatham party', 'ballot barcodes', 'chinatown beating',
  'palm oil', 'royal arrest', 'slavery exhibit', 'independence mall',
  'crypto extortion', 'bitcoin scam', 'bitcoin fraud',
  'stadium deal', 'sports arena', 'arena funding',
  'dog show', 'cat show', 'spelling bee', 'hot dog eating',
  'beauty pageant', 'miss universe', 'miss america'
];

// Geopolitical relevance signals - STRICT: articles must contain at least one to pass.
// No generic words. 'military' only as compound. No 'intelligence' alone. No 'border' alone.
// Strong signals (counted double in scoring) are marked in STRONG_GEO_SIGNALS.
export const GEOPOLITICAL_SIGNALS = [
  // War & military (compounds only — no bare 'military')
  'war', 'military operation', 'military strike', 'military force',
  'military base', 'military deployment', 'military aid', 'military buildup',
  'troops', 'missile', 'nuclear', 'invasion', 'ceasefire',
  'airstrike', 'drone strike', 'ballistic', 'warhead', 'enrichment', 'proliferation',
  'chemical weapons', 'biological weapons', 'arms deal', 'defense spending',
  'proxy war', 'airspace', 'naval', 'strait', 'blockade', 'embargo',
  'uranium', 'centrifuge', 'intercontinental', 'tactical nuclear',
  'iron dome', 'cold war',
  // Conflict actors & groups
  'insurgent', 'militia', 'separatist', 'regime', 'coup', 'junta',
  'idf', 'houthi', 'hezbollah', 'wagner', 'hamas', 'taliban', 'isis',
  // Diplomacy & international
  'sanctions', 'nato', 'united nations', 'treaty', 'diplomatic', 'summit',
  'bilateral', 'multilateral', 'alliance', 'geopolit', 'sovereignty',
  'territorial', 'annexation', 'occupation', 'liberation',
  'peacekeeping', 'deterrence', 'escalation', 'provocation',
  'espionage', 'cyber attack', 'election interference',
  // Key capitals / power centers
  'pentagon', 'kremlin', 'beijing', 'tehran', 'pyongyang',
  // International bodies & blocs
  'european union', 'african union', 'g7', 'g20', 'iaea', 'opec',
  'world bank', 'imf', 'brics', 'asean',
  // Flashpoint regions
  'south china sea', 'taiwan strait', 'strait of hormuz',
  'gaza', 'donbas', 'crimea',
  // Humanitarian / crisis
  'humanitarian crisis', 'refugee crisis', 'famine', 'genocide',
  'ethnic cleansing', 'war crime', 'displacement', 'siege',
  // Economy (only macro/international)
  'trade war', 'tariff', 'debt crisis', 'oil price', 'energy crisis',
  'gas pipeline', 'supply chain', 'rare earth', 'food security',
  // Specific geopolitical terms
  'civil war', 'independence', 'disinformation', 'propaganda',
  'hypersonic', 'submarine', 'aircraft carrier', 'chip export', 'tech ban'
];

// Strong signals count double in relevance scoring
export const STRONG_GEO_SIGNALS = [
  'nuclear', 'missile', 'genocide', 'ceasefire', 'sanctions', 'nato',
  'invasion', 'airstrike', 'drone strike', 'chemical weapons', 'biological weapons',
  'war crime', 'ethnic cleansing', 'ballistic', 'warhead', 'famine',
  'coup', 'siege', 'proxy war', 'tactical nuclear', 'uranium', 'enrichment',
  'hamas', 'hezbollah', 'houthi', 'wagner', 'taliban', 'isis', 'idf',
  'south china sea', 'taiwan strait', 'strait of hormuz', 'gaza', 'donbas', 'crimea'
];

// Domestic noise patterns — regex combos that catch non-geopolitical articles
export const DOMESTIC_NOISE_PATTERNS = [
  /\b(colbert|kimmel|fallon|hannity|maddow|carlson|tucker)\b.*\b(republican|democrat|gop|dnc|congress)\b/i,
  /\b(republican|democrat|gop|dnc)\b.*\b(colbert|kimmel|fallon|hannity|maddow|carlson|tucker)\b/i,
  /\b(cbs|nbc|abc|fox news|msnbc|cnn)\b.*\b(spiked|ratings|anchor|host|segment)\b/i,
  /\b(spiked|ratings|anchor|host|segment)\b.*\b(cbs|nbc|abc|fox news|msnbc|cnn)\b/i,
  /\b(body cam|bodycam|body camera)\b.*\b(congress|dhs|police|officer)\b/i,
  /\b(congress|dhs)\b.*\b(body cam|bodycam|body camera)\b/i,
  /\b(olympic)\b.*\b(culture|woke|spectacle|controversy|boycott)\b/i,
  /\b(school board|zoning|parking|HOA)\b.*\b(vote|meeting|decision|ruling)\b/i,
];

export const ESCALATION_KEYWORDS = {
  'escalat': 1.5, 'deadly': 1.4, 'massacre': 1.5, 'catastroph': 1.5,
  'kill': 1.3, 'destroy': 1.3, 'collapse': 1.3, 'crisis': 1.2,
  'emergency': 1.2, 'threaten': 1.1, 'attack': 1.3, 'bomb': 1.4,
  'war': 1.3, 'conflict': 1.2, 'nuclear': 1.5, 'weapon': 1.2,
  'invasion': 1.4, 'siege': 1.3, 'famine': 1.3, 'genocide': 1.5,
  'casualt': 1.3, 'death toll': 1.4, 'militant': 1.2, 'terror': 1.4,
  'coup': 1.4, 'martial law': 1.4, 'crackdown': 1.2, 'shell': 1.3,
  'airstrike': 1.4, 'drone strike': 1.3, 'offensive': 1.2, 'hostage': 1.3
};

export const DEESCALATION_KEYWORDS = {
  'ceasefire': -4, 'peace': -3, 'agreement': -2, 'deal': -2,
  'resolution': -3, 'treaty': -4, 'accord': -3, 'settle': -2,
  'release': -1.5, 'freed': -1.5, 'pardon': -1.5, 'amnesty': -2,
  'relief': -1, 'aid deliver': -1, 'reconcil': -2.5, 'dialogue': -1.5,
  'negotiat': -1.5, 'truce': -3.5, 'withdraw': -2, 'de-escalat': -3,
  'deescalat': -3, 'stabiliz': -2, 'rebuild': -1.5, 'reconstruct': -1.5,
  'democra': -1, 'election held': -1.5, 'peaceful protest': -1,
  'humanitarian corridor': -2, 'prisoner exchange': -2, 'diplomatic': -1.5
};

export const CATEGORY_WEIGHTS = {
  'CONFLICT': 12, 'CRISIS': 10, 'SECURITY': 8,
  'POLITICS': 3, 'ECONOMY': 2, 'CLIMATE': 2,
  'DIPLOMACY': -3, 'TECH': 1, 'WORLD': 1
};

export const COUNTRY_DEMONYMS = {
    'Afghanistan': ['afghan', 'kabul', 'taliban'],
    'Albania': ['albanian', 'tirana'],
    'Algeria': ['algerian', 'algiers'],
    'Andorra': ['andorran'],
    'Angola': ['angolan', 'luanda'],
    'Antigua and Barbuda': ['antiguan', 'barbudan'],
    'Argentina': ['argentine', 'argentinian', 'buenos aires'],
    'Armenia': ['armenian', 'yerevan'],
    'Australia': ['australian', 'canberra', 'sydney', 'melbourne'],
    'Austria': ['austrian', 'vienna'],
    'Azerbaijan': ['azerbaijani', 'baku'],
    'Bahamas': ['bahamian', 'nassau'],
    'Bahrain': ['bahraini', 'manama'],
    'Bangladesh': ['bangladeshi', 'dhaka'],
    'Barbados': ['barbadian', 'bridgetown'],
    'Belarus': ['belarusian', 'minsk', 'lukashenko'],
    'Belgium': ['belgian', 'brussels'],
    'Benin': ['beninese', 'porto-novo', 'cotonou'],
    'Bhutan': ['bhutanese', 'thimphu'],
    'Bolivia': ['bolivian', 'la paz'],
    'Bosnia and Herzegovina': ['bosnian', 'sarajevo'],
    'Botswana': ['motswana', 'botswanan', 'gaborone'],
    'Brazil': ['brazilian', 'brasilia', 'rio', 'sao paulo', 'lula'],
    'Brunei': ['bruneian', 'bandar seri begawan'],
    'Bulgaria': ['bulgarian', 'sofia'],
    'Burkina Faso': ['burkinabe', 'ouagadougou'],
    'Burundi': ['burundian', 'bujumbura', 'gitega'],
    'Cambodia': ['cambodian', 'phnom penh'],
    'Cameroon': ['cameroonian', 'yaounde'],
    'Canada': ['canadian', 'ottawa', 'toronto', 'trudeau'],
    'Cape Verde': ['cape verdean', 'praia'],
    'Central African Republic': ['central african', 'bangui'],
    'Chad': ['chadian', "n'djamena"],
    'Chile': ['chilean', 'santiago'],
    'China': ['chinese', 'beijing', 'xi jinping', 'ccp', 'prc'],
    'Colombia': ['colombian', 'bogota'],
    'Comoros': ['comorian', 'moroni'],
    'Democratic Republic of Congo': ['congolese', 'kinshasa', 'drc'],
    'Republic of Congo': ['congo-brazzaville', 'brazzaville'],
    'Costa Rica': ['costa rican', 'san jose'],
    'Croatia': ['croatian', 'zagreb'],
    'Cuba': ['cuban', 'havana'],
    'Cyprus': ['cypriot', 'nicosia'],
    'Czech Republic': ['czech', 'prague'],
    'Denmark': ['danish', 'copenhagen'],
    'Greenland': ['greenlandic', 'nuuk', 'inuit'],
    'Djibouti': ['djiboutian'],
    'Dominica': ['dominican'],
    'Dominican Republic': ['dominican republic', 'santo domingo'],
    'Ecuador': ['ecuadorian', 'quito'],
    'Egypt': ['egyptian', 'cairo', 'sisi'],
    'El Salvador': ['salvadoran', 'san salvador', 'bukele'],
    'Equatorial Guinea': ['equatoguinean', 'malabo'],
    'Eritrea': ['eritrean', 'asmara'],
    'Estonia': ['estonian', 'tallinn'],
    'Eswatini': ['swazi', 'mbabane'],
    'Ethiopia': ['ethiopian', 'addis ababa'],
    'Fiji': ['fijian', 'suva'],
    'Finland': ['finnish', 'helsinki'],
    'France': ['french', 'paris', 'macron', 'élysée'],
    'Gabon': ['gabonese', 'libreville'],
    'Gambia': ['gambian', 'banjul'],
    'Georgia': ['georgian', 'tbilisi'],
    'Germany': ['german', 'berlin', 'scholz', 'bundestag'],
    'Ghana': ['ghanaian', 'accra'],
    'Greece': ['greek', 'athens'],
    'Grenada': ['grenadian'],
    'Guatemala': ['guatemalan'],
    'Guinea': ['guinean', 'conakry'],
    'Guinea-Bissau': ['bissau-guinean', 'bissau'],
    'Guyana': ['guyanese', 'georgetown'],
    'Haiti': ['haitian', 'port-au-prince'],
    'Honduras': ['honduran', 'tegucigalpa'],
    'Hungary': ['hungarian', 'budapest', 'orban'],
    'Iceland': ['icelandic', 'reykjavik'],
    'India': ['indian', 'delhi', 'mumbai', 'modi', 'bjp'],
    'Indonesia': ['indonesian', 'jakarta', 'jokowi'],
    'Iran': ['iranian', 'tehran', 'ayatollah', 'khamenei'],
    'Iraq': ['iraqi', 'baghdad', 'kurdish'],
    'Ireland': ['irish', 'dublin'],
    'Israel': ['israeli', 'tel aviv', 'jerusalem', 'netanyahu', 'idf'],
    'Italy': ['italian', 'rome', 'meloni'],
    'Ivory Coast': ['ivorian', 'abidjan', 'yamoussoukro'],
    'Jamaica': ['jamaican', 'kingston'],
    'Japan': ['japanese', 'tokyo', 'kishida'],
    'Jordan': ['jordanian', 'amman'],
    'Kazakhstan': ['kazakh', 'astana', 'almaty'],
    'Kenya': ['kenyan', 'nairobi'],
    'Kiribati': ['i-kiribati', 'tarawa'],
    'Kosovo': ['kosovar', 'pristina'],
    'Kuwait': ['kuwaiti', 'kuwait city'],
    'Kyrgyzstan': ['kyrgyz', 'bishkek'],
    'Laos': ['laotian', 'vientiane'],
    'Latvia': ['latvian', 'riga'],
    'Lebanon': ['lebanese', 'beirut', 'hezbollah'],
    'Lesotho': ['basotho', 'maseru'],
    'Liberia': ['liberian', 'monrovia'],
    'Libya': ['libyan', 'tripoli'],
    'Liechtenstein': ['liechtensteiner', 'vaduz'],
    'Lithuania': ['lithuanian', 'vilnius'],
    'Luxembourg': ['luxembourgish', 'luxembourger'],
    'Madagascar': ['malagasy', 'antananarivo'],
    'Malawi': ['malawian', 'lilongwe'],
    'Malaysia': ['malaysian', 'kuala lumpur'],
    'Maldives': ['maldivian', 'male'],
    'Mali': ['malian', 'bamako'],
    'Malta': ['maltese', 'valletta'],
    'Marshall Islands': ['marshallese', 'majuro'],
    'Mauritania': ['mauritanian', 'nouakchott'],
    'Mauritius': ['mauritian', 'port louis'],
    'Mexico': ['mexican', 'mexico city'],
    'Micronesia': ['micronesian', 'palikir'],
    'Moldova': ['moldovan', 'chisinau'],
    'Monaco': ['monegasque', 'monte carlo'],
    'Mongolia': ['mongolian', 'ulaanbaatar'],
    'Montenegro': ['montenegrin', 'podgorica'],
    'Morocco': ['moroccan', 'rabat', 'casablanca'],
    'Mozambique': ['mozambican', 'maputo'],
    'Myanmar': ['burmese', 'myanmar', 'yangon', 'junta'],
    'Namibia': ['namibian', 'windhoek'],
    'Nauru': ['nauruan'],
    'Nepal': ['nepali', 'nepalese', 'kathmandu'],
    'Netherlands': ['dutch', 'amsterdam', 'the hague'],
    'New Zealand': ['new zealand', 'kiwi', 'wellington'],
    'Nicaragua': ['nicaraguan', 'managua', 'ortega'],
    'Niger': ['nigerien', 'niamey'],
    'Nigeria': ['nigerian', 'lagos', 'abuja'],
    'North Korea': ['north korean', 'pyongyang', 'kim jong', 'dprk'],
    'North Macedonia': ['macedonian', 'skopje'],
    'Norway': ['norwegian', 'oslo'],
    'Oman': ['omani', 'muscat'],
    'Pakistan': ['pakistani', 'islamabad', 'karachi'],
    'Palau': ['palauan', 'ngerulmud'],
    'Palestine': ['gaza', 'palestinian', 'west bank', 'ramallah', 'hamas', 'fatah', 'pa ', 'palestinian authority'],
    'Panama': ['panamanian', 'panama city'],
    'Papua New Guinea': ['papua new guinean', 'port moresby'],
    'Paraguay': ['paraguayan', 'asuncion'],
    'Peru': ['peruvian', 'lima'],
    'Philippines': ['filipino', 'philippine', 'manila', 'marcos'],
    'Poland': ['polish', 'warsaw'],
    'Portugal': ['portuguese', 'lisbon'],
    'Qatar': ['qatari', 'doha'],
    'Romania': ['romanian', 'bucharest'],
    'Russia': ['russian', 'moscow', 'kremlin', 'putin'],
    'Rwanda': ['rwandan', 'kigali'],
    'Saint Kitts and Nevis': ['kittitian', 'nevisian', 'basseterre'],
    'Saint Lucia': ['saint lucian', 'castries'],
    'Saint Vincent and the Grenadines': ['vincentian'],
    'Samoa': ['samoan', 'apia'],
    'San Marino': ['sammarinese'],
    'Sao Tome and Principe': ['santomean'],
    'Saudi Arabia': ['saudi', 'riyadh', 'mbs'],
    'Senegal': ['senegalese', 'dakar'],
    'Serbia': ['serbian', 'belgrade'],
    'Seychelles': ['seychellois', 'victoria'],
    'Sierra Leone': ['sierra leonean', 'freetown'],
    'Singapore': ['singaporean'],
    'Slovakia': ['slovak', 'bratislava'],
    'Slovenia': ['slovenian', 'ljubljana'],
    'Solomon Islands': ['solomon islander', 'honiara'],
    'Somalia': ['somali', 'mogadishu'],
    'South Africa': ['south african', 'johannesburg', 'pretoria', 'cape town'],
    'South Korea': ['south korean', 'seoul', 'korean'],
    'South Sudan': ['south sudanese', 'juba'],
    'Spain': ['spanish', 'madrid', 'barcelona'],
    'Sri Lanka': ['sri lankan', 'colombo'],
    'Sudan': ['sudanese', 'khartoum'],
    'Suriname': ['surinamese', 'paramaribo'],
    'Sweden': ['swedish', 'stockholm'],
    'Switzerland': ['swiss', 'bern', 'zurich', 'geneva'],
    'Syria': ['syrian', 'damascus', 'assad'],
    'Taiwan': ['taiwanese', 'taipei'],
    'Tajikistan': ['tajik', 'dushanbe'],
    'Tanzania': ['tanzanian', 'dodoma', 'dar es salaam'],
    'Thailand': ['thai', 'bangkok'],
    'Timor-Leste': ['timorese', 'east timor', 'dili'],
    'Togo': ['togolese', 'lome'],
    'Tonga': ['tongan', "nuku'alofa"],
    'Trinidad and Tobago': ['trinidadian', 'tobagonian', 'port of spain'],
    'Tunisia': ['tunisian', 'tunis'],
    'Turkey': ['turkish', 'ankara', 'istanbul', 'erdogan'],
    'Turkmenistan': ['turkmen', 'ashgabat'],
    'Tuvalu': ['tuvaluan', 'funafuti'],
    'Uganda': ['ugandan', 'kampala'],
    'Ukraine': ['ukrainian', 'kyiv', 'zelensky'],
    'United Arab Emirates': ['emirati', 'uae', 'dubai', 'abu dhabi'],
    'United Kingdom': ['british', 'uk', 'britain', 'london', 'parliament', 'westminster'],
    'United States': ['u.s.', 'american', 'washington', 'biden', 'trump', 'congress', 'white house', 'pentagon'],
    'Uruguay': ['uruguayan', 'montevideo'],
    'Uzbekistan': ['uzbek', 'tashkent'],
    'Vanuatu': ['ni-vanuatu', 'port vila'],
    'Venezuela': ['venezuelan', 'caracas', 'rodriguez', 'maduro'],
    'Vietnam': ['vietnamese', 'hanoi', 'ho chi minh'],
    'Yemen': ['yemeni', 'sanaa', 'houthi'],
    'Zambia': ['zambian', 'lusaka'],
    'Zimbabwe': ['zimbabwean', 'harare']
};
