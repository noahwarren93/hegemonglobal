// compare.js - Compare mode, radar chart, country comparison data

const COMPARE_DATA = {
  'United States': { gdp:'25.46T', gdpGrowth:'2.5%', gdpPerCapita:'$76,330', inflation:'3.1%', unemployment:'3.7%', debt:'123%', milSpend:'$886B', milPercent:'3.5%', milPersonnel:'1.39M', nuclear:'Yes', alliances:'NATO, AUKUS, Quad', pop:'334M', medianAge:'38.9', democracy:'7.85', pressFreedom:'45th', hdi:'0.921', stockYTD:'+8.2%', fdi:'$285B' },
  'China': { gdp:'17.96T', gdpGrowth:'5.2%', gdpPerCapita:'$12,720', inflation:'0.2%', unemployment:'5.2%', debt:'83%', milSpend:'$296B', milPercent:'1.7%', milPersonnel:'2.03M', nuclear:'Yes', alliances:'SCO, BRICS', pop:'1.41B', medianAge:'39.0', democracy:'1.94', pressFreedom:'179th', hdi:'0.768', stockYTD:'-2.1%', fdi:'$163B' },
  'Russia': { gdp:'1.78T', gdpGrowth:'3.6%', gdpPerCapita:'$12,200', inflation:'7.4%', unemployment:'2.9%', debt:'22%', milSpend:'$109B', milPercent:'6.1%', milPersonnel:'1.15M', nuclear:'Yes', alliances:'CSTO, SCO, BRICS', pop:'144M', medianAge:'40.3', democracy:'2.22', pressFreedom:'164th', hdi:'0.822', stockYTD:'-5.4%', fdi:'$18B' },
  'India': { gdp:'3.73T', gdpGrowth:'7.8%', gdpPerCapita:'$2,612', inflation:'5.1%', unemployment:'8.0%', debt:'82%', milSpend:'$83B', milPercent:'2.4%', milPersonnel:'1.46M', nuclear:'Yes', alliances:'Quad, BRICS', pop:'1.43B', medianAge:'28.7', democracy:'7.04', pressFreedom:'161st', hdi:'0.644', stockYTD:'+4.5%', fdi:'$49B' },
  'Japan': { gdp:'4.23T', gdpGrowth:'1.9%', gdpPerCapita:'$33,815', inflation:'3.3%', unemployment:'2.6%', debt:'264%', milSpend:'$55B', milPercent:'1.3%', milPersonnel:'247K', nuclear:'No', alliances:'US-Japan, Quad', pop:'124M', medianAge:'48.6', democracy:'8.33', pressFreedom:'68th', hdi:'0.920', stockYTD:'+12.3%', fdi:'$33B' },
  'United Kingdom': { gdp:'3.07T', gdpGrowth:'0.1%', gdpPerCapita:'$45,850', inflation:'4.0%', unemployment:'4.3%', debt:'101%', milSpend:'$68B', milPercent:'2.3%', milPersonnel:'150K', nuclear:'Yes', alliances:'NATO, AUKUS', pop:'67M', medianAge:'40.6', democracy:'8.54', pressFreedom:'26th', hdi:'0.929', stockYTD:'+3.1%', fdi:'$78B' },
  'Brazil': { gdp:'2.13T', gdpGrowth:'2.9%', gdpPerCapita:'$9,920', inflation:'4.6%', unemployment:'7.8%', debt:'74%', milSpend:'$22B', milPercent:'1.1%', milPersonnel:'367K', nuclear:'No', alliances:'BRICS', pop:'214M', medianAge:'34.3', democracy:'6.78', pressFreedom:'92nd', hdi:'0.754', stockYTD:'-4.2%', fdi:'$62B' },
  'South Korea': { gdp:'1.67T', gdpGrowth:'1.4%', gdpPerCapita:'$32,423', inflation:'3.6%', unemployment:'2.7%', debt:'54%', milSpend:'$54B', milPercent:'2.8%', milPersonnel:'555K', nuclear:'No', alliances:'US-ROK', pop:'52M', medianAge:'44.6', democracy:'8.03', pressFreedom:'47th', hdi:'0.925', stockYTD:'+6.1%', fdi:'$18B' },
  'Saudi Arabia': { gdp:'1.07T', gdpGrowth:'-0.8%', gdpPerCapita:'$30,436', inflation:'1.6%', unemployment:'4.9%', debt:'26%', milSpend:'$75B', milPercent:'6.0%', milPersonnel:'257K', nuclear:'No', alliances:'GCC, OPEC+', pop:'36M', medianAge:'31.8', democracy:'2.08', pressFreedom:'166th', hdi:'0.875', stockYTD:'+1.2%', fdi:'$12B' },
  'Turkey': { gdp:'1.11T', gdpGrowth:'4.5%', gdpPerCapita:'$12,850', inflation:'65%', unemployment:'9.4%', debt:'34%', milSpend:'$16B', milPercent:'1.4%', milPersonnel:'425K', nuclear:'No', alliances:'NATO', pop:'85M', medianAge:'32.2', democracy:'4.35', pressFreedom:'165th', hdi:'0.838', stockYTD:'+15.2%', fdi:'$10B' },
  'Afghanistan': { gdp:'$14B', gdpGrowth:'2.1%', gdpPerCapita:'$341', inflation:'14.9%', unemployment:'11.7%', debt:'105', milSpend:'$0B', milPercent:'3.3%', milPersonnel:'210K', nuclear:'No', alliances:'Unaligned', pop:'41M', medianAge:'34.8', democracy:'3.32', pressFreedom:'155', hdi:'0.44', stockYTD:'-9.4%', fdi:'$605M' },
  'Albania': { gdp:'$23B', gdpGrowth:'2.7%', gdpPerCapita:'$8,214', inflation:'2.8%', unemployment:'3.4%', debt:'46', milSpend:'$0B', milPercent:'2.4%', milPersonnel:'16K', nuclear:'No', alliances:'Unaligned', pop:'2.8M', medianAge:'39.8', democracy:'6.11', pressFreedom:'54', hdi:'0.766', stockYTD:'+20.8%', fdi:'$794M' },
  'Algeria': { gdp:'$190B', gdpGrowth:'1.8%', gdpPerCapita:'$4,222', inflation:'6.9%', unemployment:'8.8%', debt:'64', milSpend:'$7B', milPercent:'3.5%', milPersonnel:'352K', nuclear:'No', alliances:'Unaligned', pop:'45M', medianAge:'39.8', democracy:'5.74', pressFreedom:'74', hdi:'0.618', stockYTD:'+10.2%', fdi:'$5B' },
  'Andorra': { gdp:'$3.4B', gdpGrowth:'2.2%', gdpPerCapita:'$42,500', inflation:'1.5%', unemployment:'5.7%', debt:'57', milSpend:'$0B', milPercent:'1.7%', milPersonnel:'247', nuclear:'No', alliances:'Unaligned', pop:'80K', medianAge:'36.0', democracy:'8.69', pressFreedom:'16', hdi:'0.809', stockYTD:'-9.7%', fdi:'$168M' },
  'Angola': { gdp:'$118B', gdpGrowth:'2.2%', gdpPerCapita:'$3,277', inflation:'7.5%', unemployment:'6.5%', debt:'71', milSpend:'$3B', milPercent:'2.1%', milPersonnel:'330K', nuclear:'No', alliances:'AU', pop:'36M', medianAge:'21.6', democracy:'5.59', pressFreedom:'63', hdi:'0.667', stockYTD:'+15.7%', fdi:'$5B' },
  'Antigua and Barbuda': { gdp:'$2B', gdpGrowth:'1.4%', gdpPerCapita:'$20,000', inflation:'4.6%', unemployment:'4.8%', debt:'7', milSpend:'$0B', milPercent:'2.0%', milPersonnel:'441', nuclear:'No', alliances:'Unaligned', pop:'100K', medianAge:'35.3', democracy:'6.25', pressFreedom:'33', hdi:'0.8', stockYTD:'+22.6%', fdi:'$90M' },
  'Argentina': { gdp:'$641B', gdpGrowth:'1.7%', gdpPerCapita:'$13,934', inflation:'7.3%', unemployment:'6.3%', debt:'83', milSpend:'$14B', milPercent:'3.2%', milPersonnel:'460K', nuclear:'No', alliances:'MERCOSUR', pop:'46M', medianAge:'37.7', democracy:'3.64', pressFreedom:'117', hdi:'0.564', stockYTD:'-4.8%', fdi:'$34B' },
  'Armenia': { gdp:'$20B', gdpGrowth:'3.0%', gdpPerCapita:'$7,142', inflation:'6.4%', unemployment:'8.5%', debt:'91', milSpend:'$1B', milPercent:'3.5%', milPersonnel:'11K', nuclear:'No', alliances:'Unaligned', pop:'2.8M', medianAge:'30.6', democracy:'4.77', pressFreedom:'112', hdi:'0.552', stockYTD:'+7.2%', fdi:'$1B' },
  'Australia': { gdp:'$1.7T', gdpGrowth:'2.8%', gdpPerCapita:'$65,384', inflation:'2.6%', unemployment:'6.3%', debt:'4', milSpend:'$25B', milPercent:'2.5%', milPersonnel:'228K', nuclear:'No', alliances:'AUKUS, Quad', pop:'26M', medianAge:'34.5', democracy:'7.59', pressFreedom:'28', hdi:'0.877', stockYTD:'+11.6%', fdi:'$53B' },
  'Austria': { gdp:'$471B', gdpGrowth:'2.7%', gdpPerCapita:'$52,333', inflation:'2.2%', unemployment:'6.3%', debt:'45', milSpend:'$8B', milPercent:'2.1%', milPersonnel:'40K', nuclear:'No', alliances:'EU', pop:'9M', medianAge:'39.9', democracy:'6.57', pressFreedom:'56', hdi:'0.744', stockYTD:'-12.0%', fdi:'$15B' },
  'Bahamas': { gdp:'$14B', gdpGrowth:'2.9%', gdpPerCapita:'$35,000', inflation:'2.3%', unemployment:'3.5%', debt:'24', milSpend:'$0B', milPercent:'2.1%', milPersonnel:'2K', nuclear:'No', alliances:'Unaligned', pop:'400K', medianAge:'35.7', democracy:'7.39', pressFreedom:'29', hdi:'0.827', stockYTD:'+4.6%', fdi:'$259M' },
  'Bahrain': { gdp:'$46B', gdpGrowth:'1.1%', gdpPerCapita:'$30,666', inflation:'4.2%', unemployment:'3.6%', debt:'52', milSpend:'$1B', milPercent:'1.8%', milPersonnel:'12K', nuclear:'No', alliances:'GCC, OPEC+', pop:'1.5M', medianAge:'31.6', democracy:'5.46', pressFreedom:'30', hdi:'0.743', stockYTD:'-9.7%', fdi:'$3B' },
  'Bangladesh': { gdp:'$460B', gdpGrowth:'1.7%', gdpPerCapita:'$2,705', inflation:'5.1%', unemployment:'9.8%', debt:'77', milSpend:'$15B', milPercent:'2.4%', milPersonnel:'1.26M', nuclear:'No', alliances:'Unaligned', pop:'170M', medianAge:'25.2', democracy:'4.59', pressFreedom:'80', hdi:'0.594', stockYTD:'-3.7%', fdi:'$33B' },
  'Barbados': { gdp:'$6B', gdpGrowth:'2.7%', gdpPerCapita:'$20,833', inflation:'2.3%', unemployment:'3.3%', debt:'33', milSpend:'$0B', milPercent:'2.3%', milPersonnel:'3K', nuclear:'No', alliances:'Unaligned', pop:'288K', medianAge:'32.5', democracy:'6.78', pressFreedom:'34', hdi:'0.885', stockYTD:'+10.3%', fdi:'$359M' },
  'Belarus': { gdp:'$73B', gdpGrowth:'1.4%', gdpPerCapita:'$8,111', inflation:'7.4%', unemployment:'10.6%', debt:'89', milSpend:'$3B', milPercent:'2.8%', milPersonnel:'60K', nuclear:'No', alliances:'Unaligned', pop:'9M', medianAge:'37.8', democracy:'2.44', pressFreedom:'100', hdi:'0.532', stockYTD:'-2.5%', fdi:'$5B' },
  'Belgium': { gdp:'$582B', gdpGrowth:'1.6%', gdpPerCapita:'$48,500', inflation:'2.1%', unemployment:'5.9%', debt:'58', milSpend:'$8B', milPercent:'1.2%', milPersonnel:'66K', nuclear:'No', alliances:'NATO, EU', pop:'12M', medianAge:'39.6', democracy:'6.92', pressFreedom:'21', hdi:'0.891', stockYTD:'+15.4%', fdi:'$26B' },
  'Belize': { gdp:'$3.3B', gdpGrowth:'1.2%', gdpPerCapita:'$7,674', inflation:'2.9%', unemployment:'5.1%', debt:'47', milSpend:'$0B', milPercent:'2.1%', milPersonnel:'3K', nuclear:'No', alliances:'Unaligned', pop:'430K', medianAge:'36.6', democracy:'5.23', pressFreedom:'41', hdi:'0.797', stockYTD:'+8.2%', fdi:'$59M' },
  'Benin': { gdp:'$19B', gdpGrowth:'1.3%', gdpPerCapita:'$1,461', inflation:'3.8%', unemployment:'4.9%', debt:'44', milSpend:'$0B', milPercent:'1.1%', milPersonnel:'90K', nuclear:'No', alliances:'AU', pop:'13M', medianAge:'18.1', democracy:'5.77', pressFreedom:'50', hdi:'0.709', stockYTD:'+13.1%', fdi:'$559M' },
  'Bhutan': { gdp:'$3B', gdpGrowth:'1.6%', gdpPerCapita:'$3,846', inflation:'1.1%', unemployment:'5.4%', debt:'58', milSpend:'$0B', milPercent:'1.9%', milPersonnel:'5K', nuclear:'No', alliances:'Unaligned', pop:'780K', medianAge:'27.5', democracy:'8.19', pressFreedom:'29', hdi:'0.85', stockYTD:'+21.6%', fdi:'$132M' },
  'Bolivia': { gdp:'$44B', gdpGrowth:'1.9%', gdpPerCapita:'$3,666', inflation:'7.6%', unemployment:'5.3%', debt:'47', milSpend:'$1B', milPercent:'2.2%', milPersonnel:'52K', nuclear:'No', alliances:'Unaligned', pop:'12M', medianAge:'34.1', democracy:'5.39', pressFreedom:'53', hdi:'0.679', stockYTD:'-5.1%', fdi:'$3B' },
  'Bosnia and Herzegovina': { gdp:'$28B', gdpGrowth:'2.8%', gdpPerCapita:'$8,750', inflation:'6.4%', unemployment:'6.7%', debt:'65', milSpend:'$1B', milPercent:'2.2%', milPersonnel:'17K', nuclear:'No', alliances:'Unaligned', pop:'3.2M', medianAge:'37.8', democracy:'4.76', pressFreedom:'83', hdi:'0.656', stockYTD:'-12.8%', fdi:'$804M' },
  'Botswana': { gdp:'$19B', gdpGrowth:'2.0%', gdpPerCapita:'$7,307', inflation:'1.2%', unemployment:'6.0%', debt:'23', milSpend:'$0B', milPercent:'2.3%', milPersonnel:'16K', nuclear:'No', alliances:'AU', pop:'2.6M', medianAge:'23.9', democracy:'7.1', pressFreedom:'8', hdi:'0.855', stockYTD:'+24.7%', fdi:'$521M' },
  'Brunei': { gdp:'$18B', gdpGrowth:'2.9%', gdpPerCapita:'$40,000', inflation:'2.2%', unemployment:'6.5%', debt:'25', milSpend:'$0B', milPercent:'1.2%', milPersonnel:'4K', nuclear:'No', alliances:'ASEAN', pop:'450K', medianAge:'27.0', democracy:'7.62', pressFreedom:'15', hdi:'0.893', stockYTD:'+5.4%', fdi:'$264M' },
  'Bulgaria': { gdp:'$100B', gdpGrowth:'1.3%', gdpPerCapita:'$15,384', inflation:'4.1%', unemployment:'6.6%', debt:'35', milSpend:'$2B', milPercent:'1.7%', milPersonnel:'43K', nuclear:'No', alliances:'NATO, EU', pop:'6.5M', medianAge:'38.4', democracy:'6.54', pressFreedom:'44', hdi:'0.709', stockYTD:'-7.5%', fdi:'$8B' },
  'Burkina Faso': { gdp:'$19B', gdpGrowth:'1.2%', gdpPerCapita:'$863', inflation:'10.4%', unemployment:'18.3%', debt:'7', milSpend:'$1B', milPercent:'3.3%', milPersonnel:'202K', nuclear:'No', alliances:'AU', pop:'22M', medianAge:'20.8', democracy:'1.08', pressFreedom:'143', hdi:'0.493', stockYTD:'-12.2%', fdi:'$1B' },
  'Burundi': { gdp:'$3B', gdpGrowth:'2.6%', gdpPerCapita:'$230', inflation:'13.4%', unemployment:'10.5%', debt:'53', milSpend:'$0B', milPercent:'2.5%', milPersonnel:'45K', nuclear:'No', alliances:'AU', pop:'13M', medianAge:'21.9', democracy:'2.62', pressFreedom:'109', hdi:'0.525', stockYTD:'+13.9%', fdi:'$155M' },
  'Cambodia': { gdp:'$32B', gdpGrowth:'3.6%', gdpPerCapita:'$1,882', inflation:'7.2%', unemployment:'11.6%', debt:'46', milSpend:'$1B', milPercent:'2.3%', milPersonnel:'145K', nuclear:'No', alliances:'ASEAN', pop:'17M', medianAge:'26.2', democracy:'4.11', pressFreedom:'58', hdi:'0.693', stockYTD:'+13.1%', fdi:'$2B' },
  'Cameroon': { gdp:'$46B', gdpGrowth:'2.3%', gdpPerCapita:'$1,642', inflation:'14.8%', unemployment:'10.2%', debt:'45', milSpend:'$2B', milPercent:'2.3%', milPersonnel:'149K', nuclear:'No', alliances:'AU', pop:'28M', medianAge:'23.1', democracy:'2.03', pressFreedom:'109', hdi:'0.518', stockYTD:'+13.6%', fdi:'$492M' },
  'Canada': { gdp:'$2.1T', gdpGrowth:'2.7%', gdpPerCapita:'$52,500', inflation:'1.5%', unemployment:'3.3%', debt:'48', milSpend:'$28B', milPercent:'1.9%', milPersonnel:'270K', nuclear:'No', alliances:'NATO, AUKUS', pop:'40M', medianAge:'37.5', democracy:'7.64', pressFreedom:'29', hdi:'0.879', stockYTD:'+19.3%', fdi:'$143B' },
  'Cape Verde': { gdp:'$2.5B', gdpGrowth:'1.5%', gdpPerCapita:'$4,166', inflation:'1.7%', unemployment:'5.6%', debt:'24', milSpend:'$0B', milPercent:'1.0%', milPersonnel:'5K', nuclear:'No', alliances:'AU', pop:'600K', medianAge:'21.9', democracy:'7.12', pressFreedom:'33', hdi:'0.872', stockYTD:'+0.8%', fdi:'$162M' },
  'Central African Republic': { gdp:'$2.5B', gdpGrowth:'2.7%', gdpPerCapita:'$500', inflation:'12.0%', unemployment:'17.6%', debt:'76', milSpend:'$0B', milPercent:'7.3%', milPersonnel:'42K', nuclear:'No', alliances:'AU', pop:'5M', medianAge:'20.3', democracy:'2.66', pressFreedom:'129', hdi:'0.423', stockYTD:'+7.1%', fdi:'$97M' },
  'Chad': { gdp:'$13B', gdpGrowth:'2.8%', gdpPerCapita:'$722', inflation:'8.5%', unemployment:'10.3%', debt:'85', milSpend:'$0B', milPercent:'2.4%', milPersonnel:'153K', nuclear:'No', alliances:'AU', pop:'18M', medianAge:'18.6', democracy:'3.47', pressFreedom:'91', hdi:'0.54', stockYTD:'+12.5%', fdi:'$368M' },
  'Chile': { gdp:'$301B', gdpGrowth:'2.2%', gdpPerCapita:'$15,842', inflation:'2.8%', unemployment:'3.0%', debt:'4', milSpend:'$5B', milPercent:'1.1%', milPersonnel:'127K', nuclear:'No', alliances:'CPTPP', pop:'19M', medianAge:'31.2', democracy:'6.98', pressFreedom:'54', hdi:'0.786', stockYTD:'+13.0%', fdi:'$7B' },
  'Colombia': { gdp:'$314B', gdpGrowth:'1.7%', gdpPerCapita:'$6,038', inflation:'5.1%', unemployment:'5.3%', debt:'38', milSpend:'$10B', milPercent:'3.0%', milPersonnel:'256K', nuclear:'No', alliances:'USMCA', pop:'52M', medianAge:'33.0', democracy:'4.44', pressFreedom:'73', hdi:'0.648', stockYTD:'-1.5%', fdi:'$12B' },
  'Comoros': { gdp:'$1.3B', gdpGrowth:'2.4%', gdpPerCapita:'$1,444', inflation:'4.6%', unemployment:'11.0%', debt:'72', milSpend:'$0B', milPercent:'2.2%', milPersonnel:'9K', nuclear:'No', alliances:'AU', pop:'900K', medianAge:'21.8', democracy:'6.06', pressFreedom:'86', hdi:'0.692', stockYTD:'+8.6%', fdi:'$32M' },
  'Costa Rica': { gdp:'$69B', gdpGrowth:'2.5%', gdpPerCapita:'$13,800', inflation:'2.9%', unemployment:'6.9%', debt:'29', milSpend:'$1B', milPercent:'1.1%', milPersonnel:'45K', nuclear:'No', alliances:'CARICOM', pop:'5M', medianAge:'38.5', democracy:'8.87', pressFreedom:'22', hdi:'0.817', stockYTD:'+15.8%', fdi:'$2B' },
  'Croatia': { gdp:'$71B', gdpGrowth:'2.9%', gdpPerCapita:'$17,750', inflation:'1.0%', unemployment:'3.2%', debt:'4', milSpend:'$1B', milPercent:'1.6%', milPersonnel:'25K', nuclear:'No', alliances:'NATO, EU', pop:'4M', medianAge:'32.5', democracy:'7.33', pressFreedom:'31', hdi:'0.892', stockYTD:'+22.8%', fdi:'$1B' },
  'Cuba': { gdp:'$107B', gdpGrowth:'3.0%', gdpPerCapita:'$9,727', inflation:'8.4%', unemployment:'11.3%', debt:'68', milSpend:'$4B', milPercent:'2.6%', milPersonnel:'82K', nuclear:'No', alliances:'Unaligned', pop:'11M', medianAge:'30.8', democracy:'4.82', pressFreedom:'115', hdi:'0.592', stockYTD:'+15.6%', fdi:'$7B' },
  'Cyprus': { gdp:'$32B', gdpGrowth:'2.0%', gdpPerCapita:'$24,615', inflation:'4.1%', unemployment:'4.7%', debt:'63', milSpend:'$0B', milPercent:'2.4%', milPersonnel:'8K', nuclear:'No', alliances:'EU', pop:'1.3M', medianAge:'39.5', democracy:'6.75', pressFreedom:'38', hdi:'0.764', stockYTD:'-0.3%', fdi:'$1B' },
  'Czech Republic': { gdp:'$290B', gdpGrowth:'2.7%', gdpPerCapita:'$29,000', inflation:'2.1%', unemployment:'4.0%', debt:'21', milSpend:'$3B', milPercent:'2.5%', milPersonnel:'47K', nuclear:'No', alliances:'NATO, EU', pop:'10M', medianAge:'36.8', democracy:'7.26', pressFreedom:'9', hdi:'0.884', stockYTD:'-8.5%', fdi:'$22B' },
  'DRC': { gdp:'$65B', gdpGrowth:'2.5%', gdpPerCapita:'$656', inflation:'7.7%', unemployment:'10.1%', debt:'62', milSpend:'$3B', milPercent:'7.0%', milPersonnel:'935K', nuclear:'No', alliances:'AU', pop:'99M', medianAge:'21.4', democracy:'2.96', pressFreedom:'145', hdi:'0.405', stockYTD:'+5.4%', fdi:'$5B' },
  'Denmark': { gdp:'$395B', gdpGrowth:'2.7%', gdpPerCapita:'$65,833', inflation:'2.4%', unemployment:'4.7%', debt:'3', milSpend:'$6B', milPercent:'2.4%', milPersonnel:'27K', nuclear:'No', alliances:'NATO, EU', pop:'6M', medianAge:'33.7', democracy:'6.99', pressFreedom:'16', hdi:'0.9', stockYTD:'+12.9%', fdi:'$10B' },
  'Djibouti': { gdp:'$4B', gdpGrowth:'2.6%', gdpPerCapita:'$4,000', inflation:'2.3%', unemployment:'6.2%', debt:'47', milSpend:'$0B', milPercent:'1.5%', milPersonnel:'5K', nuclear:'No', alliances:'AU', pop:'1M', medianAge:'21.8', democracy:'5.91', pressFreedom:'60', hdi:'0.741', stockYTD:'+12.2%', fdi:'$103M' },
  'Dominica': { gdp:'$600M', gdpGrowth:'2.6%', gdpPerCapita:'$8,333', inflation:'2.8%', unemployment:'5.9%', debt:'47', milSpend:'$0B', milPercent:'1.4%', milPersonnel:'636', nuclear:'No', alliances:'Unaligned', pop:'72K', medianAge:'29.5', democracy:'6.99', pressFreedom:'59', hdi:'0.732', stockYTD:'+2.4%', fdi:'$47M' },
  'Dominican Republic': { gdp:'$114B', gdpGrowth:'1.2%', gdpPerCapita:'$10,363', inflation:'3.3%', unemployment:'4.9%', debt:'31', milSpend:'$1B', milPercent:'1.1%', milPersonnel:'57K', nuclear:'No', alliances:'Unaligned', pop:'11M', medianAge:'34.6', democracy:'5.04', pressFreedom:'49', hdi:'0.735', stockYTD:'+10.1%', fdi:'$6B' },
  'Ecuador': { gdp:'$107B', gdpGrowth:'1.5%', gdpPerCapita:'$5,944', inflation:'7.0%', unemployment:'5.3%', debt:'91', milSpend:'$4B', milPercent:'3.2%', milPersonnel:'142K', nuclear:'No', alliances:'Unaligned', pop:'18M', medianAge:'31.6', democracy:'5.0', pressFreedom:'101', hdi:'0.539', stockYTD:'-0.5%', fdi:'$6B' },
  'Egypt': { gdp:'$387B', gdpGrowth:'2.3%', gdpPerCapita:'$3,685', inflation:'6.3%', unemployment:'9.7%', debt:'82', milSpend:'$12B', milPercent:'3.6%', milPersonnel:'579K', nuclear:'No', alliances:'AU, Arab League', pop:'105M', medianAge:'37.2', democracy:'4.53', pressFreedom:'80', hdi:'0.557', stockYTD:'+19.5%', fdi:'$19B' },
  'El Salvador': { gdp:'$33B', gdpGrowth:'1.5%', gdpPerCapita:'$5,076', inflation:'7.7%', unemployment:'9.1%', debt:'41', milSpend:'$1B', milPercent:'3.4%', milPersonnel:'53K', nuclear:'No', alliances:'Unaligned', pop:'6.5M', medianAge:'36.9', democracy:'4.0', pressFreedom:'54', hdi:'0.611', stockYTD:'+13.3%', fdi:'$2B' },
  'Equatorial Guinea': { gdp:'$12B', gdpGrowth:'2.6%', gdpPerCapita:'$7,058', inflation:'5.8%', unemployment:'8.8%', debt:'78', milSpend:'$0B', milPercent:'3.8%', milPersonnel:'9K', nuclear:'No', alliances:'AU', pop:'1.7M', medianAge:'23.3', democracy:'6.42', pressFreedom:'57', hdi:'0.67', stockYTD:'+0.8%', fdi:'$462M' },
  'Eritrea': { gdp:'$2.3B', gdpGrowth:'2.9%', gdpPerCapita:'$638', inflation:'9.6%', unemployment:'11.1%', debt:'7', milSpend:'$0B', milPercent:'4.0%', milPersonnel:'35K', nuclear:'No', alliances:'AU', pop:'3.6M', medianAge:'22.6', democracy:'4.8', pressFreedom:'83', hdi:'0.532', stockYTD:'+16.7%', fdi:'$101M' },
  'Estonia': { gdp:'$38B', gdpGrowth:'2.7%', gdpPerCapita:'$27,142', inflation:'3.5%', unemployment:'5.3%', debt:'52', milSpend:'$1B', milPercent:'1.8%', milPersonnel:'5K', nuclear:'No', alliances:'NATO, EU', pop:'1.4M', medianAge:'39.3', democracy:'6.76', pressFreedom:'30', hdi:'0.758', stockYTD:'-6.5%', fdi:'$2B' },
  'Eswatini': { gdp:'$5B', gdpGrowth:'3.2%', gdpPerCapita:'$4,166', inflation:'4.1%', unemployment:'6.1%', debt:'32', milSpend:'$0B', milPercent:'3.1%', milPersonnel:'6K', nuclear:'No', alliances:'AU', pop:'1.2M', medianAge:'18.7', democracy:'5.91', pressFreedom:'76', hdi:'0.677', stockYTD:'+20.3%', fdi:'$128M' },
  'Ethiopia': { gdp:'$126B', gdpGrowth:'1.7%', gdpPerCapita:'$1,000', inflation:'5.2%', unemployment:'7.6%', debt:'49', milSpend:'$4B', milPercent:'2.5%', milPersonnel:'619K', nuclear:'No', alliances:'AU', pop:'126M', medianAge:'23.2', democracy:'2.33', pressFreedom:'83', hdi:'0.541', stockYTD:'+10.9%', fdi:'$5B' },
  'Fiji': { gdp:'$5B', gdpGrowth:'1.8%', gdpPerCapita:'$5,376', inflation:'4.3%', unemployment:'4.7%', debt:'33', milSpend:'$0B', milPercent:'2.2%', milPersonnel:'7K', nuclear:'No', alliances:'Pacific Islands Forum', pop:'930K', medianAge:'32.1', democracy:'6.77', pressFreedom:'40', hdi:'0.765', stockYTD:'+22.7%', fdi:'$321M' },
  'Finland': { gdp:'$281B', gdpGrowth:'1.9%', gdpPerCapita:'$46,833', inflation:'2.2%', unemployment:'3.0%', debt:'59', milSpend:'$3B', milPercent:'1.4%', milPersonnel:'38K', nuclear:'No', alliances:'NATO, EU', pop:'6M', medianAge:'30.3', democracy:'5.38', pressFreedom:'32', hdi:'0.718', stockYTD:'+15.0%', fdi:'$19B' },
  'France': { gdp:'$2.8T', gdpGrowth:'1.5%', gdpPerCapita:'$41,176', inflation:'3.2%', unemployment:'11.3%', debt:'45', milSpend:'$101B', milPercent:'3.4%', milPersonnel:'613K', nuclear:'Yes', alliances:'NATO, EU', pop:'68M', medianAge:'42.8', democracy:'4.15', pressFreedom:'71', hdi:'0.699', stockYTD:'+3.8%', fdi:'$71B' },
  'Gabon': { gdp:'$21B', gdpGrowth:'3.6%', gdpPerCapita:'$8,750', inflation:'7.4%', unemployment:'11.4%', debt:'79', milSpend:'$0B', milPercent:'2.6%', milPersonnel:'17K', nuclear:'No', alliances:'AU', pop:'2.4M', medianAge:'20.8', democracy:'4.9', pressFreedom:'75', hdi:'0.617', stockYTD:'+2.2%', fdi:'$1B' },
  'Gambia': { gdp:'$2.4B', gdpGrowth:'2.7%', gdpPerCapita:'$888', inflation:'2.0%', unemployment:'4.8%', debt:'59', milSpend:'$0B', milPercent:'1.3%', milPersonnel:'14K', nuclear:'No', alliances:'AU', pop:'2.7M', medianAge:'20.8', democracy:'5.67', pressFreedom:'51', hdi:'0.783', stockYTD:'+24.0%', fdi:'$130M' },
  'Gaza': { gdp:'$1.7B', gdpGrowth:'-1.5%', gdpPerCapita:'$809', inflation:'21.5%', unemployment:'23.7%', debt:'125', milSpend:'$0B', milPercent:'6.6%', milPersonnel:'11K', nuclear:'No', alliances:'Arab League', pop:'2.1M', medianAge:'24.8', democracy:'1.16', pressFreedom:'178', hdi:'0.3', stockYTD:'+16.5%', fdi:'$63M' },
  'Georgia': { gdp:'$25B', gdpGrowth:'1.0%', gdpPerCapita:'$6,756', inflation:'13.0%', unemployment:'5.6%', debt:'68', milSpend:'$1B', milPercent:'3.0%', milPersonnel:'30K', nuclear:'No', alliances:'Unaligned', pop:'3.7M', medianAge:'37.6', democracy:'2.77', pressFreedom:'94', hdi:'0.586', stockYTD:'+17.1%', fdi:'$1B' },
  'Germany': { gdp:'$4.2T', gdpGrowth:'2.8%', gdpPerCapita:'$50,000', inflation:'5.2%', unemployment:'11.3%', debt:'46', milSpend:'$116B', milPercent:'3.2%', milPersonnel:'601K', nuclear:'No', alliances:'NATO, EU', pop:'84M', medianAge:'40.0', democracy:'5.06', pressFreedom:'77', hdi:'0.622', stockYTD:'+16.3%', fdi:'$139B' },
  'Ghana': { gdp:'$79B', gdpGrowth:'1.9%', gdpPerCapita:'$2,323', inflation:'2.7%', unemployment:'5.1%', debt:'69', milSpend:'$1B', milPercent:'2.2%', milPersonnel:'117K', nuclear:'No', alliances:'AU', pop:'34M', medianAge:'23.3', democracy:'6.92', pressFreedom:'30', hdi:'0.706', stockYTD:'-13.3%', fdi:'$4B' },
  'Greece': { gdp:'$219B', gdpGrowth:'1.8%', gdpPerCapita:'$21,900', inflation:'4.0%', unemployment:'4.0%', debt:'34', milSpend:'$3B', milPercent:'1.2%', milPersonnel:'81K', nuclear:'No', alliances:'NATO, EU', pop:'10M', medianAge:'38.5', democracy:'6.26', pressFreedom:'56', hdi:'0.738', stockYTD:'-3.1%', fdi:'$16B' },
  'Greenland': { gdp:'$3.1B', gdpGrowth:'3.9%', gdpPerCapita:'$54,385', inflation:'6.4%', unemployment:'7.2%', debt:'37', milSpend:'$0B', milPercent:'2.8%', milPersonnel:'539', nuclear:'No', alliances:'Unaligned', pop:'57K', medianAge:'36.2', democracy:'4.03', pressFreedom:'83', hdi:'0.621', stockYTD:'-13.1%', fdi:'$196M' },
  'Grenada': { gdp:'$1.3B', gdpGrowth:'2.7%', gdpPerCapita:'$10,400', inflation:'2.4%', unemployment:'5.7%', debt:'45', milSpend:'$0B', milPercent:'1.4%', milPersonnel:'736', nuclear:'No', alliances:'Unaligned', pop:'125K', medianAge:'29.8', democracy:'6.71', pressFreedom:'14', hdi:'0.861', stockYTD:'-13.3%', fdi:'$58M' },
  'Guatemala': { gdp:'$95B', gdpGrowth:'3.0%', gdpPerCapita:'$5,588', inflation:'6.2%', unemployment:'11.6%', debt:'32', milSpend:'$4B', milPercent:'2.7%', milPersonnel:'112K', nuclear:'No', alliances:'Unaligned', pop:'17M', medianAge:'31.0', democracy:'5.45', pressFreedom:'54', hdi:'0.635', stockYTD:'-6.3%', fdi:'$7B' },
  'Guinea': { gdp:'$21B', gdpGrowth:'2.6%', gdpPerCapita:'$1,500', inflation:'3.5%', unemployment:'8.6%', debt:'35', milSpend:'$1B', milPercent:'2.6%', milPersonnel:'120K', nuclear:'No', alliances:'AU', pop:'14M', medianAge:'21.2', democracy:'4.11', pressFreedom:'75', hdi:'0.687', stockYTD:'-3.1%', fdi:'$566M' },
  'Guinea-Bissau': { gdp:'$2B', gdpGrowth:'2.8%', gdpPerCapita:'$952', inflation:'5.0%', unemployment:'9.0%', debt:'32', milSpend:'$0B', milPercent:'3.0%', milPersonnel:'8K', nuclear:'No', alliances:'AU', pop:'2.1M', medianAge:'19.4', democracy:'5.02', pressFreedom:'59', hdi:'0.684', stockYTD:'+1.9%', fdi:'$64M' },
  'Guyana': { gdp:'$15B', gdpGrowth:'2.4%', gdpPerCapita:'$18,750', inflation:'4.3%', unemployment:'8.2%', debt:'77', milSpend:'$0B', milPercent:'3.6%', milPersonnel:'5K', nuclear:'No', alliances:'Unaligned', pop:'0.8M', medianAge:'31.4', democracy:'4.07', pressFreedom:'86', hdi:'0.67', stockYTD:'+16.4%', fdi:'$1B' },
  'Haiti': { gdp:'$20B', gdpGrowth:'0.8%', gdpPerCapita:'$1,724', inflation:'26.3%', unemployment:'15.2%', debt:'99', milSpend:'$1B', milPercent:'7.7%', milPersonnel:'80K', nuclear:'No', alliances:'Unaligned', pop:'11.6M', medianAge:'32.4', democracy:'1.39', pressFreedom:'179', hdi:'0.3', stockYTD:'+19.8%', fdi:'$1B' },
  'Honduras': { gdp:'$32B', gdpGrowth:'1.5%', gdpPerCapita:'$3,200', inflation:'3.1%', unemployment:'11.7%', debt:'5', milSpend:'$1B', milPercent:'4.0%', milPersonnel:'99K', nuclear:'No', alliances:'Unaligned', pop:'10M', medianAge:'39.5', democracy:'5.25', pressFreedom:'65', hdi:'0.696', stockYTD:'+21.1%', fdi:'$506M' },
  'Hungary': { gdp:'$188B', gdpGrowth:'3.7%', gdpPerCapita:'$18,800', inflation:'5.9%', unemployment:'9.8%', debt:'4', milSpend:'$6B', milPercent:'3.6%', milPersonnel:'98K', nuclear:'No', alliances:'NATO, EU', pop:'10M', medianAge:'41.0', democracy:'5.74', pressFreedom:'73', hdi:'0.601', stockYTD:'-0.1%', fdi:'$13B' },
  'Iceland': { gdp:'$27B', gdpGrowth:'2.4%', gdpPerCapita:'$67,500', inflation:'1.5%', unemployment:'3.0%', debt:'43', milSpend:'$1B', milPercent:'2.4%', milPersonnel:'2K', nuclear:'No', alliances:'NATO', pop:'0.4M', medianAge:'36.8', democracy:'7.27', pressFreedom:'37', hdi:'0.853', stockYTD:'+23.2%', fdi:'$1B' },
  'Indonesia': { gdp:'$1.3T', gdpGrowth:'1.8%', gdpPerCapita:'$4,693', inflation:'2.5%', unemployment:'5.1%', debt:'35', milSpend:'$19B', milPercent:'1.1%', milPersonnel:'1.69M', nuclear:'No', alliances:'ASEAN', pop:'277M', medianAge:'34.5', democracy:'5.27', pressFreedom:'40', hdi:'0.723', stockYTD:'+9.9%', fdi:'$73B' },
  'Iran': { gdp:'$388B', gdpGrowth:'3.0%', gdpPerCapita:'$4,459', inflation:'7.5%', unemployment:'13.8%', debt:'107', milSpend:'$13B', milPercent:'4.5%', milPersonnel:'642K', nuclear:'No', alliances:'SCO', pop:'87M', medianAge:'28.8', democracy:'1.83', pressFreedom:'128', hdi:'0.402', stockYTD:'+2.7%', fdi:'$27B' },
  'Iraq': { gdp:'$270B', gdpGrowth:'2.4%', gdpPerCapita:'$6,136', inflation:'11.1%', unemployment:'10.6%', debt:'57', milSpend:'$9B', milPercent:'3.4%', milPersonnel:'150K', nuclear:'No', alliances:'Arab League', pop:'44M', medianAge:'26.3', democracy:'2.77', pressFreedom:'107', hdi:'0.56', stockYTD:'+8.6%', fdi:'$14B' },
  'Ireland': { gdp:'$533B', gdpGrowth:'2.0%', gdpPerCapita:'$106,600', inflation:'1.0%', unemployment:'6.4%', debt:'6', milSpend:'$6B', milPercent:'1.3%', milPersonnel:'41K', nuclear:'No', alliances:'EU', pop:'5M', medianAge:'40.8', democracy:'8.32', pressFreedom:'40', hdi:'0.849', stockYTD:'+8.5%', fdi:'$41B' },
  'Israel': { gdp:'$525B', gdpGrowth:'1.0%', gdpPerCapita:'$55,263', inflation:'6.6%', unemployment:'10.2%', debt:'102', milSpend:'$32B', milPercent:'3.4%', milPersonnel:'31K', nuclear:'Yes', alliances:'AUKUS (informal)', pop:'9.5M', medianAge:'29.9', democracy:'3.4', pressFreedom:'150', hdi:'0.421', stockYTD:'+14.3%', fdi:'$38B' },
  'Italy': { gdp:'$2.1T', gdpGrowth:'2.5%', gdpPerCapita:'$35,593', inflation:'3.9%', unemployment:'6.1%', debt:'69', milSpend:'$39B', milPercent:'2.0%', milPersonnel:'515K', nuclear:'No', alliances:'NATO, EU', pop:'59M', medianAge:'43.8', democracy:'6.41', pressFreedom:'49', hdi:'0.702', stockYTD:'0.0%', fdi:'$135B' },
  'Ivory Coast': { gdp:'$80B', gdpGrowth:'1.6%', gdpPerCapita:'$2,758', inflation:'4.7%', unemployment:'4.5%', debt:'61', milSpend:'$1B', milPercent:'2.5%', milPersonnel:'101K', nuclear:'No', alliances:'AU', pop:'29M', medianAge:'19.5', democracy:'5.56', pressFreedom:'55', hdi:'0.757', stockYTD:'-4.8%', fdi:'$4B' },
  'Jamaica': { gdp:'$17B', gdpGrowth:'1.2%', gdpPerCapita:'$5,666', inflation:'3.8%', unemployment:'5.9%', debt:'39', milSpend:'$0B', milPercent:'1.1%', milPersonnel:'14K', nuclear:'No', alliances:'Unaligned', pop:'3M', medianAge:'34.8', democracy:'6.24', pressFreedom:'50', hdi:'0.793', stockYTD:'-11.9%', fdi:'$728M' },
  'Jordan': { gdp:'$51B', gdpGrowth:'1.5%', gdpPerCapita:'$4,636', inflation:'3.8%', unemployment:'6.2%', debt:'43', milSpend:'$1B', milPercent:'1.1%', milPersonnel:'40K', nuclear:'No', alliances:'Arab League', pop:'11M', medianAge:'26.7', democracy:'6.71', pressFreedom:'52', hdi:'0.752', stockYTD:'-5.8%', fdi:'$1B' },
  'Kazakhstan': { gdp:'$260B', gdpGrowth:'1.8%', gdpPerCapita:'$13,000', inflation:'4.9%', unemployment:'6.3%', debt:'34', milSpend:'$5B', milPercent:'2.4%', milPersonnel:'69K', nuclear:'No', alliances:'SCO, CSTO', pop:'20M', medianAge:'38.2', democracy:'6.75', pressFreedom:'31', hdi:'0.765', stockYTD:'+7.8%', fdi:'$19B' },
  'Kenya': { gdp:'$113B', gdpGrowth:'2.1%', gdpPerCapita:'$2,092', inflation:'7.5%', unemployment:'5.5%', debt:'32', milSpend:'$4B', milPercent:'3.4%', milPersonnel:'392K', nuclear:'No', alliances:'AU', pop:'54M', medianAge:'18.9', democracy:'5.81', pressFreedom:'60', hdi:'0.652', stockYTD:'-7.1%', fdi:'$8B' },
  'Kiribati': { gdp:'$200M', gdpGrowth:'1.0%', gdpPerCapita:'$1,538', inflation:'13.9%', unemployment:'7.6%', debt:'56', milSpend:'$0B', milPercent:'2.4%', milPersonnel:'1K', nuclear:'No', alliances:'Pacific Islands Forum', pop:'130K', medianAge:'34.7', democracy:'4.52', pressFreedom:'110', hdi:'0.511', stockYTD:'+13.2%', fdi:'$6M' },
  'Kosovo': { gdp:'$10B', gdpGrowth:'2.3%', gdpPerCapita:'$5,555', inflation:'6.0%', unemployment:'11.1%', debt:'76', milSpend:'$0B', milPercent:'3.6%', milPersonnel:'15K', nuclear:'No', alliances:'Unaligned', pop:'1.8M', medianAge:'31.9', democracy:'4.44', pressFreedom:'78', hdi:'0.682', stockYTD:'-13.2%', fdi:'$457M' },
  'Kuwait': { gdp:'$165B', gdpGrowth:'1.9%', gdpPerCapita:'$38,372', inflation:'1.5%', unemployment:'5.1%', debt:'28', milSpend:'$3B', milPercent:'2.5%', milPersonnel:'21K', nuclear:'No', alliances:'GCC, OPEC+', pop:'4.3M', medianAge:'31.2', democracy:'6.89', pressFreedom:'35', hdi:'0.89', stockYTD:'+1.3%', fdi:'$7B' },
  'Kyrgyzstan': { gdp:'$12B', gdpGrowth:'3.6%', gdpPerCapita:'$1,714', inflation:'7.5%', unemployment:'9.2%', debt:'49', milSpend:'$0B', milPercent:'3.2%', milPersonnel:'58K', nuclear:'No', alliances:'SCO, CSTO', pop:'7M', medianAge:'32.2', democracy:'5.71', pressFreedom:'67', hdi:'0.605', stockYTD:'+10.5%', fdi:'$256M' },
  'Laos': { gdp:'$15B', gdpGrowth:'3.4%', gdpPerCapita:'$2,000', inflation:'3.1%', unemployment:'7.9%', debt:'57', milSpend:'$0B', milPercent:'3.4%', milPersonnel:'53K', nuclear:'No', alliances:'ASEAN', pop:'7.5M', medianAge:'28.5', democracy:'6.3', pressFreedom:'54', hdi:'0.681', stockYTD:'+19.0%', fdi:'$603M' },
  'Latvia': { gdp:'$41B', gdpGrowth:'1.9%', gdpPerCapita:'$21,578', inflation:'3.3%', unemployment:'5.4%', debt:'34', milSpend:'$1B', milPercent:'1.8%', milPersonnel:'7K', nuclear:'No', alliances:'NATO, EU', pop:'1.9M', medianAge:'36.4', democracy:'6.65', pressFreedom:'41', hdi:'0.744', stockYTD:'+12.0%', fdi:'$2B' },
  'Lebanon': { gdp:'$22B', gdpGrowth:'2.8%', gdpPerCapita:'$4,000', inflation:'8.8%', unemployment:'17.2%', debt:'66', milSpend:'$1B', milPercent:'6.6%', milPersonnel:'40K', nuclear:'No', alliances:'Arab League', pop:'5.5M', medianAge:'25.1', democracy:'1.46', pressFreedom:'135', hdi:'0.406', stockYTD:'-10.1%', fdi:'$731M' },
  'Lesotho': { gdp:'$2.5B', gdpGrowth:'2.1%', gdpPerCapita:'$1,086', inflation:'4.2%', unemployment:'7.2%', debt:'42', milSpend:'$0B', milPercent:'3.7%', milPersonnel:'21K', nuclear:'No', alliances:'AU', pop:'2.3M', medianAge:'19.1', democracy:'5.28', pressFreedom:'53', hdi:'0.652', stockYTD:'+19.3%', fdi:'$129M' },
  'Liberia': { gdp:'$4B', gdpGrowth:'2.3%', gdpPerCapita:'$740', inflation:'2.9%', unemployment:'4.9%', debt:'48', milSpend:'$0B', milPercent:'2.3%', milPersonnel:'41K', nuclear:'No', alliances:'AU', pop:'5.4M', medianAge:'22.2', democracy:'6.66', pressFreedom:'32', hdi:'0.758', stockYTD:'+23.8%', fdi:'$301M' },
  'Libya': { gdp:'$41B', gdpGrowth:'1.0%', gdpPerCapita:'$5,857', inflation:'14.9%', unemployment:'10.6%', debt:'42', milSpend:'$1B', milPercent:'2.6%', milPersonnel:'36K', nuclear:'No', alliances:'Unaligned', pop:'7M', medianAge:'33.0', democracy:'4.41', pressFreedom:'82', hdi:'0.595', stockYTD:'+3.2%', fdi:'$3B' },
  'Liechtenstein': { gdp:'$7B', gdpGrowth:'2.3%', gdpPerCapita:'$175,000', inflation:'1.9%', unemployment:'4.5%', debt:'32', milSpend:'$0B', milPercent:'1.2%', milPersonnel:'226', nuclear:'No', alliances:'Unaligned', pop:'40K', medianAge:'35.5', democracy:'8.74', pressFreedom:'26', hdi:'0.866', stockYTD:'-11.6%', fdi:'$507M' },
  'Lithuania': { gdp:'$70B', gdpGrowth:'1.7%', gdpPerCapita:'$25,000', inflation:'3.4%', unemployment:'5.7%', debt:'42', milSpend:'$2B', milPercent:'1.0%', milPersonnel:'21K', nuclear:'No', alliances:'NATO, EU', pop:'2.8M', medianAge:'38.1', democracy:'5.12', pressFreedom:'49', hdi:'0.72', stockYTD:'-0.9%', fdi:'$4B' },
  'Luxembourg': { gdp:'$87B', gdpGrowth:'2.9%', gdpPerCapita:'$124,285', inflation:'2.5%', unemployment:'6.0%', debt:'54', milSpend:'$2B', milPercent:'1.6%', milPersonnel:'6K', nuclear:'No', alliances:'NATO, EU', pop:'0.7M', medianAge:'43.4', democracy:'7.93', pressFreedom:'20', hdi:'0.842', stockYTD:'+1.3%', fdi:'$3B' },
  'Madagascar': { gdp:'$16B', gdpGrowth:'1.5%', gdpPerCapita:'$533', inflation:'3.3%', unemployment:'10.1%', debt:'55', milSpend:'$1B', milPercent:'3.5%', milPersonnel:'109K', nuclear:'No', alliances:'AU', pop:'30M', medianAge:'23.2', democracy:'5.27', pressFreedom:'51', hdi:'0.649', stockYTD:'-5.6%', fdi:'$742M' },
  'Malawi': { gdp:'$14B', gdpGrowth:'1.5%', gdpPerCapita:'$666', inflation:'2.6%', unemployment:'5.7%', debt:'42', milSpend:'$0B', milPercent:'1.4%', milPersonnel:'84K', nuclear:'No', alliances:'AU', pop:'21M', medianAge:'23.0', democracy:'5.05', pressFreedom:'49', hdi:'0.752', stockYTD:'+22.2%', fdi:'$665M' },
  'Malaysia': { gdp:'$407B', gdpGrowth:'1.1%', gdpPerCapita:'$11,970', inflation:'2.7%', unemployment:'3.3%', debt:'59', milSpend:'$8B', milPercent:'1.7%', milPersonnel:'268K', nuclear:'No', alliances:'ASEAN', pop:'34M', medianAge:'34.8', democracy:'5.83', pressFreedom:'57', hdi:'0.772', stockYTD:'+19.8%', fdi:'$28B' },
  'Maldives': { gdp:'$7B', gdpGrowth:'1.8%', gdpPerCapita:'$13,461', inflation:'3.5%', unemployment:'6.4%', debt:'32', milSpend:'$0B', milPercent:'1.1%', milPersonnel:'4K', nuclear:'No', alliances:'Unaligned', pop:'520K', medianAge:'24.3', democracy:'6.09', pressFreedom:'44', hdi:'0.725', stockYTD:'+4.1%', fdi:'$225M' },
  'Mali': { gdp:'$19B', gdpGrowth:'1.9%', gdpPerCapita:'$863', inflation:'13.7%', unemployment:'16.0%', debt:'67', milSpend:'$1B', milPercent:'6.6%', milPersonnel:'193K', nuclear:'No', alliances:'AU', pop:'22M', medianAge:'22.3', democracy:'1.4', pressFreedom:'154', hdi:'0.447', stockYTD:'+21.0%', fdi:'$1B' },
  'Malta': { gdp:'$18B', gdpGrowth:'2.0%', gdpPerCapita:'$36,000', inflation:'2.5%', unemployment:'4.7%', debt:'24', milSpend:'$0B', milPercent:'1.3%', milPersonnel:'4K', nuclear:'No', alliances:'EU', pop:'0.5M', medianAge:'35.4', democracy:'7.8', pressFreedom:'30', hdi:'0.81', stockYTD:'+14.4%', fdi:'$1B' },
  'Marshall Islands': { gdp:'$270M', gdpGrowth:'2.3%', gdpPerCapita:'$4,500', inflation:'2.8%', unemployment:'5.5%', debt:'39', milSpend:'$0B', milPercent:'1.6%', milPersonnel:'476', nuclear:'No', alliances:'Pacific Islands Forum', pop:'60K', medianAge:'36.2', democracy:'5.98', pressFreedom:'42', hdi:'0.732', stockYTD:'-8.3%', fdi:'$13M' },
  'Mauritania': { gdp:'$10B', gdpGrowth:'2.2%', gdpPerCapita:'$2,000', inflation:'2.5%', unemployment:'6.6%', debt:'64', milSpend:'$0B', milPercent:'2.5%', milPersonnel:'19K', nuclear:'No', alliances:'AU', pop:'5M', medianAge:'20.4', democracy:'5.05', pressFreedom:'35', hdi:'0.753', stockYTD:'+21.4%', fdi:'$468M' },
  'Mauritius': { gdp:'$15B', gdpGrowth:'2.5%', gdpPerCapita:'$11,538', inflation:'1.1%', unemployment:'4.2%', debt:'57', milSpend:'$0B', milPercent:'2.4%', milPersonnel:'13K', nuclear:'No', alliances:'AU', pop:'1.3M', medianAge:'20.2', democracy:'8.43', pressFreedom:'6', hdi:'0.821', stockYTD:'+5.7%', fdi:'$210M' },
  'Mexico': { gdp:'$1.3T', gdpGrowth:'1.6%', gdpPerCapita:'$10,000', inflation:'7.0%', unemployment:'8.4%', debt:'74', milSpend:'$45B', milPercent:'2.9%', milPersonnel:'589K', nuclear:'No', alliances:'USMCA', pop:'130M', medianAge:'36.1', democracy:'4.44', pressFreedom:'65', hdi:'0.677', stockYTD:'+0.7%', fdi:'$20B' },
  'Micronesia': { gdp:'$400M', gdpGrowth:'2.5%', gdpPerCapita:'$3,478', inflation:'3.3%', unemployment:'4.8%', debt:'65', milSpend:'$0B', milPercent:'1.0%', milPersonnel:'991', nuclear:'No', alliances:'Pacific Islands Forum', pop:'115K', medianAge:'30.6', democracy:'5.48', pressFreedom:'44', hdi:'0.789', stockYTD:'-3.7%', fdi:'$27M' },
  'Moldova': { gdp:'$15B', gdpGrowth:'1.5%', gdpPerCapita:'$5,769', inflation:'13.0%', unemployment:'8.3%', debt:'82', milSpend:'$0B', milPercent:'3.1%', milPersonnel:'11K', nuclear:'No', alliances:'Unaligned', pop:'2.6M', medianAge:'38.2', democracy:'2.06', pressFreedom:'108', hdi:'0.507', stockYTD:'+18.0%', fdi:'$708M' },
  'Monaco': { gdp:'$8.6B', gdpGrowth:'1.5%', gdpPerCapita:'$215,000', inflation:'3.0%', unemployment:'5.8%', debt:'51', milSpend:'$0B', milPercent:'2.2%', milPersonnel:'322', nuclear:'No', alliances:'Unaligned', pop:'40K', medianAge:'31.1', democracy:'6.98', pressFreedom:'4', hdi:'0.88', stockYTD:'+2.6%', fdi:'$256M' },
  'Mongolia': { gdp:'$17B', gdpGrowth:'1.8%', gdpPerCapita:'$5,000', inflation:'1.6%', unemployment:'3.9%', debt:'3', milSpend:'$0B', milPercent:'1.3%', milPersonnel:'16K', nuclear:'No', alliances:'Unaligned', pop:'3.4M', medianAge:'35.2', democracy:'7.83', pressFreedom:'23', hdi:'0.821', stockYTD:'-9.4%', fdi:'$432M' },
  'Montenegro': { gdp:'$7B', gdpGrowth:'2.3%', gdpPerCapita:'$11,290', inflation:'2.7%', unemployment:'4.7%', debt:'47', milSpend:'$0B', milPercent:'1.2%', milPersonnel:'5K', nuclear:'No', alliances:'Unaligned', pop:'620K', medianAge:'39.8', democracy:'5.18', pressFreedom:'58', hdi:'0.796', stockYTD:'+22.7%', fdi:'$443M' },
  'Morocco': { gdp:'$132B', gdpGrowth:'2.8%', gdpPerCapita:'$3,567', inflation:'3.2%', unemployment:'4.5%', debt:'54', milSpend:'$3B', milPercent:'1.8%', milPersonnel:'205K', nuclear:'No', alliances:'AU', pop:'37M', medianAge:'39.6', democracy:'5.87', pressFreedom:'44', hdi:'0.736', stockYTD:'+19.5%', fdi:'$8B' },
  'Mozambique': { gdp:'$20B', gdpGrowth:'2.0%', gdpPerCapita:'$606', inflation:'10.1%', unemployment:'11.2%', debt:'78', milSpend:'$1B', milPercent:'2.8%', milPersonnel:'240K', nuclear:'No', alliances:'AU', pop:'33M', medianAge:'18.9', democracy:'3.23', pressFreedom:'101', hdi:'0.573', stockYTD:'+22.1%', fdi:'$1B' },
  'Myanmar': { gdp:'$65B', gdpGrowth:'-0.3%', gdpPerCapita:'$1,203', inflation:'13.8%', unemployment:'18.4%', debt:'15', milSpend:'$3B', milPercent:'4.3%', milPersonnel:'394K', nuclear:'No', alliances:'ASEAN', pop:'54M', medianAge:'28.5', democracy:'2.18', pressFreedom:'177', hdi:'0.3', stockYTD:'+4.0%', fdi:'$3B' },
  'Namibia': { gdp:'$14B', gdpGrowth:'2.1%', gdpPerCapita:'$5,384', inflation:'2.6%', unemployment:'6.2%', debt:'54', milSpend:'$0B', milPercent:'2.2%', milPersonnel:'15K', nuclear:'No', alliances:'AU', pop:'2.6M', medianAge:'23.6', democracy:'7.36', pressFreedom:'33', hdi:'0.842', stockYTD:'-2.5%', fdi:'$622M' },
  'Nauru': { gdp:'$150M', gdpGrowth:'1.9%', gdpPerCapita:'$13,636', inflation:'2.4%', unemployment:'3.9%', debt:'41', milSpend:'$0B', milPercent:'2.0%', milPersonnel:'72', nuclear:'No', alliances:'Pacific Islands Forum', pop:'11K', medianAge:'37.2', democracy:'5.09', pressFreedom:'30', hdi:'0.715', stockYTD:'+20.9%', fdi:'$8M' },
  'Nepal': { gdp:'$42B', gdpGrowth:'1.3%', gdpPerCapita:'$1,400', inflation:'4.6%', unemployment:'6.8%', debt:'69', milSpend:'$1B', milPercent:'1.5%', milPersonnel:'298K', nuclear:'No', alliances:'Unaligned', pop:'30M', medianAge:'23.1', democracy:'6.5', pressFreedom:'46', hdi:'0.76', stockYTD:'-8.2%', fdi:'$755M' },
  'Netherlands': { gdp:'$991B', gdpGrowth:'2.4%', gdpPerCapita:'$55,055', inflation:'3.0%', unemployment:'6.6%', debt:'67', milSpend:'$20B', milPercent:'1.9%', milPersonnel:'147K', nuclear:'No', alliances:'NATO, EU', pop:'18M', medianAge:'39.5', democracy:'5.2', pressFreedom:'48', hdi:'0.773', stockYTD:'-10.1%', fdi:'$76B' },
  'New Zealand': { gdp:'$247B', gdpGrowth:'2.8%', gdpPerCapita:'$49,400', inflation:'1.6%', unemployment:'3.8%', debt:'52', milSpend:'$5B', milPercent:'1.9%', milPersonnel:'21K', nuclear:'No', alliances:'AUKUS, Quad', pop:'5M', medianAge:'34.6', democracy:'8.92', pressFreedom:'24', hdi:'0.846', stockYTD:'+7.1%', fdi:'$6B' },
  'Nicaragua': { gdp:'$15B', gdpGrowth:'3.0%', gdpPerCapita:'$2,142', inflation:'13.1%', unemployment:'7.6%', debt:'54', milSpend:'$0B', milPercent:'3.1%', milPersonnel:'61K', nuclear:'No', alliances:'Unaligned', pop:'7M', medianAge:'32.5', democracy:'2.68', pressFreedom:'108', hdi:'0.512', stockYTD:'-3.7%', fdi:'$310M' },
  'Niger': { gdp:'$15B', gdpGrowth:'1.1%', gdpPerCapita:'$576', inflation:'5.6%', unemployment:'19.4%', debt:'84', milSpend:'$0B', milPercent:'7.0%', milPersonnel:'112K', nuclear:'No', alliances:'AU', pop:'26M', medianAge:'22.5', democracy:'3.94', pressFreedom:'145', hdi:'0.433', stockYTD:'+6.6%', fdi:'$620M' },
  'Nigeria': { gdp:'$477B', gdpGrowth:'2.2%', gdpPerCapita:'$2,139', inflation:'12.9%', unemployment:'7.5%', debt:'77', milSpend:'$19B', milPercent:'2.8%', milPersonnel:'1.34M', nuclear:'No', alliances:'AU', pop:'223M', medianAge:'20.6', democracy:'4.05', pressFreedom:'95', hdi:'0.519', stockYTD:'-6.3%', fdi:'$20B' },
  'North Korea': { gdp:'$18B', gdpGrowth:'2.7%', gdpPerCapita:'$692', inflation:'8.0%', unemployment:'20.0%', debt:'61', milSpend:'$1B', milPercent:'6.1%', milPersonnel:'216K', nuclear:'Yes', alliances:'Unaligned', pop:'26M', medianAge:'38.1', democracy:'2.19', pressFreedom:'131', hdi:'0.471', stockYTD:'+13.4%', fdi:'$186M' },
  'North Macedonia': { gdp:'$15B', gdpGrowth:'3.0%', gdpPerCapita:'$7,142', inflation:'2.2%', unemployment:'4.0%', debt:'4', milSpend:'$0B', milPercent:'2.0%', milPersonnel:'17K', nuclear:'No', alliances:'Unaligned', pop:'2.1M', medianAge:'33.5', democracy:'6.2', pressFreedom:'46', hdi:'0.71', stockYTD:'-12.2%', fdi:'$637M' },
  'Norway': { gdp:'$579B', gdpGrowth:'1.8%', gdpPerCapita:'$115,800', inflation:'2.9%', unemployment:'3.5%', debt:'56', milSpend:'$8B', milPercent:'1.4%', milPersonnel:'40K', nuclear:'No', alliances:'NATO', pop:'5M', medianAge:'37.2', democracy:'8.01', pressFreedom:'29', hdi:'0.857', stockYTD:'+20.0%', fdi:'$30B' },
  'Oman': { gdp:'$104B', gdpGrowth:'2.3%', gdpPerCapita:'$20,800', inflation:'1.7%', unemployment:'3.5%', debt:'27', milSpend:'$2B', milPercent:'1.6%', milPersonnel:'39K', nuclear:'No', alliances:'GCC', pop:'5M', medianAge:'26.4', democracy:'6.56', pressFreedom:'5', hdi:'0.849', stockYTD:'+21.8%', fdi:'$5B' },
  'Pakistan': { gdp:'$350B', gdpGrowth:'2.6%', gdpPerCapita:'$1,515', inflation:'7.9%', unemployment:'11.0%', debt:'72', milSpend:'$13B', milPercent:'2.7%', milPersonnel:'1.18M', nuclear:'Yes', alliances:'Unaligned', pop:'231M', medianAge:'25.8', democracy:'2.28', pressFreedom:'118', hdi:'0.538', stockYTD:'+16.9%', fdi:'$22B' },
  'Palau': { gdp:'$280M', gdpGrowth:'1.6%', gdpPerCapita:'$15,555', inflation:'2.8%', unemployment:'4.1%', debt:'39', milSpend:'$0B', milPercent:'2.1%', milPersonnel:'97', nuclear:'No', alliances:'Pacific Islands Forum', pop:'18K', medianAge:'36.5', democracy:'7.04', pressFreedom:'15', hdi:'0.837', stockYTD:'-7.6%', fdi:'$17M' },
  'Palestine': { gdp:'$18B', gdpGrowth:'2.5%', gdpPerCapita:'$5,625', inflation:'14.7%', unemployment:'19.2%', debt:'66', milSpend:'$1B', milPercent:'7.7%', milPersonnel:'28K', nuclear:'No', alliances:'Arab League', pop:'3.2M', medianAge:'29.2', democracy:'3.48', pressFreedom:'140', hdi:'0.475', stockYTD:'-5.1%', fdi:'$900M' },
  'Panama': { gdp:'$77B', gdpGrowth:'1.4%', gdpPerCapita:'$17,500', inflation:'2.8%', unemployment:'4.6%', debt:'48', milSpend:'$1B', milPercent:'1.2%', milPersonnel:'30K', nuclear:'No', alliances:'Unaligned', pop:'4.4M', medianAge:'37.1', democracy:'6.82', pressFreedom:'33', hdi:'0.715', stockYTD:'+14.7%', fdi:'$2B' },
  'Papua New Guinea': { gdp:'$32B', gdpGrowth:'2.5%', gdpPerCapita:'$3,200', inflation:'7.3%', unemployment:'7.0%', debt:'58', milSpend:'$1B', milPercent:'3.4%', milPersonnel:'45K', nuclear:'No', alliances:'Pacific Islands Forum', pop:'10M', medianAge:'32.6', democracy:'5.08', pressFreedom:'51', hdi:'0.622', stockYTD:'-1.1%', fdi:'$777M' },
  'Paraguay': { gdp:'$44B', gdpGrowth:'1.1%', gdpPerCapita:'$6,285', inflation:'3.3%', unemployment:'3.9%', debt:'55', milSpend:'$1B', milPercent:'1.1%', milPersonnel:'39K', nuclear:'No', alliances:'MERCOSUR', pop:'7M', medianAge:'37.8', democracy:'5.13', pressFreedom:'47', hdi:'0.722', stockYTD:'+19.6%', fdi:'$3B' },
  'Peru': { gdp:'$242B', gdpGrowth:'2.7%', gdpPerCapita:'$7,117', inflation:'3.6%', unemployment:'9.7%', debt:'43', milSpend:'$7B', milPercent:'3.4%', milPersonnel:'308K', nuclear:'No', alliances:'CPTPP', pop:'34M', medianAge:'34.1', democracy:'4.24', pressFreedom:'70', hdi:'0.696', stockYTD:'+18.3%', fdi:'$18B' },
  'Philippines': { gdp:'$404B', gdpGrowth:'3.9%', gdpPerCapita:'$3,513', inflation:'6.0%', unemployment:'9.6%', debt:'47', milSpend:'$15B', milPercent:'3.8%', milPersonnel:'477K', nuclear:'No', alliances:'ASEAN', pop:'115M', medianAge:'33.7', democracy:'5.91', pressFreedom:'79', hdi:'0.689', stockYTD:'-3.8%', fdi:'$11B' },
  'Poland': { gdp:'$688B', gdpGrowth:'2.1%', gdpPerCapita:'$18,105', inflation:'3.1%', unemployment:'4.4%', debt:'45', milSpend:'$9B', milPercent:'1.6%', milPersonnel:'254K', nuclear:'No', alliances:'NATO, EU', pop:'38M', medianAge:'37.4', democracy:'5.81', pressFreedom:'33', hdi:'0.767', stockYTD:'-6.5%', fdi:'$37B' },
  'Portugal': { gdp:'$252B', gdpGrowth:'2.6%', gdpPerCapita:'$25,200', inflation:'2.0%', unemployment:'4.2%', debt:'49', milSpend:'$4B', milPercent:'1.4%', milPersonnel:'46K', nuclear:'No', alliances:'NATO, EU', pop:'10M', medianAge:'43.7', democracy:'8.95', pressFreedom:'22', hdi:'0.876', stockYTD:'+13.8%', fdi:'$18B' },
  'Qatar': { gdp:'$221B', gdpGrowth:'2.0%', gdpPerCapita:'$73,666', inflation:'1.3%', unemployment:'5.0%', debt:'47', milSpend:'$2B', milPercent:'1.1%', milPersonnel:'11K', nuclear:'No', alliances:'GCC, OPEC+', pop:'3M', medianAge:'25.4', democracy:'6.88', pressFreedom:'18', hdi:'0.86', stockYTD:'+13.6%', fdi:'$8B' },
  'Republic of Congo': { gdp:'$13B', gdpGrowth:'2.4%', gdpPerCapita:'$2,166', inflation:'6.0%', unemployment:'7.3%', debt:'43', milSpend:'$0B', milPercent:'3.5%', milPersonnel:'30K', nuclear:'No', alliances:'AU', pop:'6M', medianAge:'21.7', democracy:'5.65', pressFreedom:'73', hdi:'0.673', stockYTD:'+21.1%', fdi:'$802M' },
  'Romania': { gdp:'$301B', gdpGrowth:'1.6%', gdpPerCapita:'$15,842', inflation:'2.5%', unemployment:'5.9%', debt:'58', milSpend:'$7B', milPercent:'1.1%', milPersonnel:'167K', nuclear:'No', alliances:'NATO, EU', pop:'19M', medianAge:'37.8', democracy:'6.68', pressFreedom:'33', hdi:'0.736', stockYTD:'+4.0%', fdi:'$8B' },
  'Rwanda': { gdp:'$14B', gdpGrowth:'3.1%', gdpPerCapita:'$1,000', inflation:'7.1%', unemployment:'5.4%', debt:'72', milSpend:'$0B', milPercent:'3.0%', milPersonnel:'77K', nuclear:'No', alliances:'AU', pop:'14M', medianAge:'21.3', democracy:'4.08', pressFreedom:'84', hdi:'0.605', stockYTD:'+18.6%', fdi:'$1B' },
  'Saint Kitts and Nevis': { gdp:'$1.1B', gdpGrowth:'2.4%', gdpPerCapita:'$20,000', inflation:'1.2%', unemployment:'6.5%', debt:'25', milSpend:'$0B', milPercent:'1.9%', milPersonnel:'502', nuclear:'No', alliances:'Unaligned', pop:'55K', medianAge:'32.3', democracy:'8.0', pressFreedom:'9', hdi:'0.817', stockYTD:'+18.0%', fdi:'$64M' },
  'Saint Lucia': { gdp:'$2.1B', gdpGrowth:'2.1%', gdpPerCapita:'$11,666', inflation:'2.8%', unemployment:'5.3%', debt:'24', milSpend:'$0B', milPercent:'2.3%', milPersonnel:'687', nuclear:'No', alliances:'Unaligned', pop:'180K', medianAge:'33.0', democracy:'6.67', pressFreedom:'13', hdi:'0.892', stockYTD:'-13.2%', fdi:'$160M' },
  'Saint Vincent and the Grenadines': { gdp:'$900M', gdpGrowth:'2.8%', gdpPerCapita:'$8,181', inflation:'3.4%', unemployment:'3.2%', debt:'56', milSpend:'$0B', milPercent:'1.4%', milPersonnel:'811', nuclear:'No', alliances:'Unaligned', pop:'110K', medianAge:'28.5', democracy:'6.73', pressFreedom:'60', hdi:'0.703', stockYTD:'+21.7%', fdi:'$28M' },
  'Samoa': { gdp:'$800M', gdpGrowth:'2.4%', gdpPerCapita:'$3,636', inflation:'1.0%', unemployment:'6.3%', debt:'48', milSpend:'$0B', milPercent:'1.8%', milPersonnel:'2K', nuclear:'No', alliances:'Pacific Islands Forum', pop:'220K', medianAge:'37.8', democracy:'6.61', pressFreedom:'24', hdi:'0.849', stockYTD:'+1.9%', fdi:'$38M' },
  'San Marino': { gdp:'$1.9B', gdpGrowth:'1.8%', gdpPerCapita:'$55,882', inflation:'2.5%', unemployment:'6.5%', debt:'34', milSpend:'$0B', milPercent:'2.3%', milPersonnel:'319', nuclear:'No', alliances:'Unaligned', pop:'34K', medianAge:'39.6', democracy:'8.63', pressFreedom:'31', hdi:'0.838', stockYTD:'+8.8%', fdi:'$107M' },
  'Sao Tome and Principe': { gdp:'$600M', gdpGrowth:'1.1%', gdpPerCapita:'$2,666', inflation:'2.6%', unemployment:'4.8%', debt:'44', milSpend:'$0B', milPercent:'1.7%', milPersonnel:'1K', nuclear:'No', alliances:'AU', pop:'225K', medianAge:'21.7', democracy:'5.42', pressFreedom:'59', hdi:'0.777', stockYTD:'-7.9%', fdi:'$11M' },
  'Senegal': { gdp:'$28B', gdpGrowth:'2.9%', gdpPerCapita:'$1,555', inflation:'2.7%', unemployment:'4.2%', debt:'45', milSpend:'$1B', milPercent:'2.0%', milPersonnel:'92K', nuclear:'No', alliances:'AU', pop:'18M', medianAge:'21.0', democracy:'6.68', pressFreedom:'41', hdi:'0.709', stockYTD:'+23.0%', fdi:'$2B' },
  'Serbia': { gdp:'$63B', gdpGrowth:'2.5%', gdpPerCapita:'$9,000', inflation:'3.1%', unemployment:'7.3%', debt:'41', milSpend:'$2B', milPercent:'2.6%', milPersonnel:'44K', nuclear:'No', alliances:'Unaligned', pop:'7M', medianAge:'32.7', democracy:'6.07', pressFreedom:'76', hdi:'0.624', stockYTD:'-14.8%', fdi:'$3B' },
  'Seychelles': { gdp:'$1.7B', gdpGrowth:'2.7%', gdpPerCapita:'$17,000', inflation:'2.4%', unemployment:'5.6%', debt:'36', milSpend:'$0B', milPercent:'2.1%', milPersonnel:'423', nuclear:'No', alliances:'AU', pop:'100K', medianAge:'21.1', democracy:'6.59', pressFreedom:'13', hdi:'0.852', stockYTD:'-5.6%', fdi:'$115M' },
  'Sierra Leone': { gdp:'$4.5B', gdpGrowth:'1.8%', gdpPerCapita:'$523', inflation:'2.8%', unemployment:'4.5%', debt:'31', milSpend:'$0B', milPercent:'1.1%', milPersonnel:'85K', nuclear:'No', alliances:'AU', pop:'8.6M', medianAge:'22.4', democracy:'6.78', pressFreedom:'52', hdi:'0.711', stockYTD:'+6.2%', fdi:'$220M' },
  'Singapore': { gdp:'$424B', gdpGrowth:'2.3%', gdpPerCapita:'$70,666', inflation:'1.3%', unemployment:'5.4%', debt:'45', milSpend:'$8B', milPercent:'1.9%', milPersonnel:'47K', nuclear:'No', alliances:'ASEAN', pop:'6M', medianAge:'30.2', democracy:'7.38', pressFreedom:'6', hdi:'0.806', stockYTD:'+17.4%', fdi:'$29B' },
  'Slovakia': { gdp:'$133B', gdpGrowth:'2.1%', gdpPerCapita:'$24,629', inflation:'4.7%', unemployment:'3.3%', debt:'61', milSpend:'$2B', milPercent:'2.2%', milPersonnel:'21K', nuclear:'No', alliances:'NATO, EU', pop:'5.4M', medianAge:'35.5', democracy:'6.22', pressFreedom:'51', hdi:'0.734', stockYTD:'+21.7%', fdi:'$6B' },
  'Slovenia': { gdp:'$62B', gdpGrowth:'2.6%', gdpPerCapita:'$31,000', inflation:'2.9%', unemployment:'5.1%', debt:'27', milSpend:'$1B', milPercent:'2.4%', milPersonnel:'6K', nuclear:'No', alliances:'NATO, EU', pop:'2M', medianAge:'31.5', democracy:'7.35', pressFreedom:'12', hdi:'0.84', stockYTD:'-10.4%', fdi:'$2B' },
  'Solomon Islands': { gdp:'$1.6B', gdpGrowth:'3.9%', gdpPerCapita:'$2,222', inflation:'3.1%', unemployment:'9.8%', debt:'44', milSpend:'$0B', milPercent:'2.9%', milPersonnel:'7K', nuclear:'No', alliances:'Pacific Islands Forum', pop:'720K', medianAge:'32.8', democracy:'5.79', pressFreedom:'74', hdi:'0.697', stockYTD:'-8.9%', fdi:'$93M' },
  'Somalia': { gdp:'$8B', gdpGrowth:'1.7%', gdpPerCapita:'$444', inflation:'15.0%', unemployment:'17.9%', debt:'73', milSpend:'$0B', milPercent:'5.4%', milPersonnel:'101K', nuclear:'No', alliances:'AU', pop:'18M', medianAge:'19.4', democracy:'2.09', pressFreedom:'156', hdi:'0.425', stockYTD:'+20.0%', fdi:'$145M' },
  'South Africa': { gdp:'$399B', gdpGrowth:'3.8%', gdpPerCapita:'$6,650', inflation:'6.2%', unemployment:'5.3%', debt:'46', milSpend:'$15B', milPercent:'3.2%', milPersonnel:'370K', nuclear:'No', alliances:'AU, BRICS', pop:'60M', medianAge:'19.0', democracy:'4.71', pressFreedom:'61', hdi:'0.644', stockYTD:'+7.1%', fdi:'$23B' },
  'South Sudan': { gdp:'$4B', gdpGrowth:'1.1%', gdpPerCapita:'$363', inflation:'14.4%', unemployment:'10.3%', debt:'8', milSpend:'$0B', milPercent:'5.7%', milPersonnel:'108K', nuclear:'No', alliances:'AU', pop:'11M', medianAge:'23.2', democracy:'3.95', pressFreedom:'121', hdi:'0.468', stockYTD:'-13.5%', fdi:'$267M' },
  'Spain': { gdp:'$1.4T', gdpGrowth:'1.2%', gdpPerCapita:'$29,166', inflation:'4.8%', unemployment:'5.4%', debt:'51', milSpend:'$33B', milPercent:'1.1%', milPersonnel:'457K', nuclear:'No', alliances:'NATO, EU', pop:'48M', medianAge:'39.1', democracy:'6.89', pressFreedom:'42', hdi:'0.748', stockYTD:'-2.8%', fdi:'$20B' },
  'Sri Lanka': { gdp:'$75B', gdpGrowth:'2.6%', gdpPerCapita:'$3,409', inflation:'7.1%', unemployment:'11.0%', debt:'45', milSpend:'$2B', milPercent:'2.1%', milPersonnel:'216K', nuclear:'No', alliances:'Unaligned', pop:'22M', medianAge:'27.8', democracy:'5.5', pressFreedom:'83', hdi:'0.667', stockYTD:'-6.8%', fdi:'$2B' },
  'Sudan': { gdp:'$34B', gdpGrowth:'-0.4%', gdpPerCapita:'$739', inflation:'27.4%', unemployment:'23.6%', debt:'14', milSpend:'$1B', milPercent:'5.1%', milPersonnel:'371K', nuclear:'No', alliances:'AU', pop:'46M', medianAge:'20.9', democracy:'2.65', pressFreedom:'171', hdi:'0.3', stockYTD:'+15.5%', fdi:'$1B' },
  'Suriname': { gdp:'$4B', gdpGrowth:'2.0%', gdpPerCapita:'$6,451', inflation:'4.9%', unemployment:'4.2%', debt:'45', milSpend:'$0B', milPercent:'2.4%', milPersonnel:'4K', nuclear:'No', alliances:'Unaligned', pop:'620K', medianAge:'38.1', democracy:'6.63', pressFreedom:'38', hdi:'0.711', stockYTD:'-12.8%', fdi:'$217M' },
  'Sweden': { gdp:'$585B', gdpGrowth:'2.4%', gdpPerCapita:'$58,500', inflation:'2.9%', unemployment:'3.7%', debt:'55', milSpend:'$12B', milPercent:'1.5%', milPersonnel:'93K', nuclear:'No', alliances:'NATO, EU', pop:'10M', medianAge:'35.9', democracy:'5.64', pressFreedom:'51', hdi:'0.731', stockYTD:'+8.3%', fdi:'$37B' },
  'Switzerland': { gdp:'$808B', gdpGrowth:'2.6%', gdpPerCapita:'$89,777', inflation:'2.9%', unemployment:'3.8%', debt:'29', milSpend:'$9B', milPercent:'1.1%', milPersonnel:'44K', nuclear:'No', alliances:'Unaligned', pop:'9M', medianAge:'42.3', democracy:'8.95', pressFreedom:'11', hdi:'0.863', stockYTD:'+10.3%', fdi:'$55B' },
  'Syria': { gdp:'$9B', gdpGrowth:'2.0%', gdpPerCapita:'$409', inflation:'13.2%', unemployment:'17.7%', debt:'92', milSpend:'$1B', milPercent:'7.2%', milPersonnel:'210K', nuclear:'No', alliances:'Arab League', pop:'22M', medianAge:'24.8', democracy:'2.16', pressFreedom:'127', hdi:'0.404', stockYTD:'+5.5%', fdi:'$647M' },
  'Taiwan': { gdp:'$790B', gdpGrowth:'2.0%', gdpPerCapita:'$32,916', inflation:'6.4%', unemployment:'15.7%', debt:'115', milSpend:'$35B', milPercent:'6.9%', milPersonnel:'117K', nuclear:'No', alliances:'Unaligned', pop:'24M', medianAge:'44.7', democracy:'2.63', pressFreedom:'142', hdi:'0.457', stockYTD:'-12.8%', fdi:'$45B' },
  'Tajikistan': { gdp:'$12B', gdpGrowth:'4.0%', gdpPerCapita:'$1,200', inflation:'7.2%', unemployment:'11.5%', debt:'5', milSpend:'$0B', milPercent:'3.3%', milPersonnel:'61K', nuclear:'No', alliances:'SCO, CSTO', pop:'10M', medianAge:'35.3', democracy:'5.68', pressFreedom:'75', hdi:'0.616', stockYTD:'+4.0%', fdi:'$176M' },
  'Tanzania': { gdp:'$76B', gdpGrowth:'1.9%', gdpPerCapita:'$1,169', inflation:'2.8%', unemployment:'6.3%', debt:'6', milSpend:'$1B', milPercent:'1.1%', milPersonnel:'230K', nuclear:'No', alliances:'AU', pop:'65M', medianAge:'18.9', democracy:'6.39', pressFreedom:'40', hdi:'0.777', stockYTD:'-9.8%', fdi:'$5B' },
  'Thailand': { gdp:'$495B', gdpGrowth:'2.4%', gdpPerCapita:'$7,071', inflation:'4.0%', unemployment:'7.3%', debt:'64', milSpend:'$10B', milPercent:'3.1%', milPersonnel:'597K', nuclear:'No', alliances:'ASEAN', pop:'70M', medianAge:'32.2', democracy:'4.92', pressFreedom:'52', hdi:'0.637', stockYTD:'-7.6%', fdi:'$33B' },
  'Timor-Leste': { gdp:'$3B', gdpGrowth:'1.4%', gdpPerCapita:'$2,142', inflation:'4.0%', unemployment:'4.2%', debt:'69', milSpend:'$0B', milPercent:'1.8%', milPersonnel:'5K', nuclear:'No', alliances:'ASEAN', pop:'1.4M', medianAge:'29.4', democracy:'6.67', pressFreedom:'41', hdi:'0.703', stockYTD:'+20.6%', fdi:'$40M' },
  'Togo': { gdp:'$9B', gdpGrowth:'2.8%', gdpPerCapita:'$1,000', inflation:'5.5%', unemployment:'5.1%', debt:'79', milSpend:'$0B', milPercent:'2.4%', milPersonnel:'81K', nuclear:'No', alliances:'AU', pop:'9M', medianAge:'19.4', democracy:'4.32', pressFreedom:'68', hdi:'0.699', stockYTD:'-7.5%', fdi:'$398M' },
  'Tonga': { gdp:'$500M', gdpGrowth:'1.6%', gdpPerCapita:'$4,716', inflation:'2.1%', unemployment:'3.0%', debt:'21', milSpend:'$0B', milPercent:'1.4%', milPersonnel:'369', nuclear:'No', alliances:'Pacific Islands Forum', pop:'106K', medianAge:'32.2', democracy:'6.63', pressFreedom:'18', hdi:'0.881', stockYTD:'+8.0%', fdi:'$19M' },
  'Trinidad and Tobago': { gdp:'$28B', gdpGrowth:'1.2%', gdpPerCapita:'$20,000', inflation:'2.6%', unemployment:'6.0%', debt:'62', milSpend:'$1B', milPercent:'1.5%', milPersonnel:'5K', nuclear:'No', alliances:'Unaligned', pop:'1.4M', medianAge:'29.9', democracy:'5.77', pressFreedom:'38', hdi:'0.779', stockYTD:'-5.1%', fdi:'$1B' },
  'Tunisia': { gdp:'$47B', gdpGrowth:'1.3%', gdpPerCapita:'$3,916', inflation:'13.1%', unemployment:'9.9%', debt:'57', milSpend:'$2B', milPercent:'3.3%', milPersonnel:'73K', nuclear:'No', alliances:'Unaligned', pop:'12M', medianAge:'38.5', democracy:'3.01', pressFreedom:'105', hdi:'0.57', stockYTD:'-1.9%', fdi:'$2B' },
  'Turkmenistan': { gdp:'$60B', gdpGrowth:'3.7%', gdpPerCapita:'$9,230', inflation:'4.8%', unemployment:'9.5%', debt:'8', milSpend:'$2B', milPercent:'3.8%', milPersonnel:'44K', nuclear:'No', alliances:'SCO', pop:'6.5M', medianAge:'34.5', democracy:'5.59', pressFreedom:'51', hdi:'0.676', stockYTD:'-6.3%', fdi:'$949M' },
  'Tuvalu': { gdp:'$60M', gdpGrowth:'2.7%', gdpPerCapita:'$5,454', inflation:'12.3%', unemployment:'5.6%', debt:'79', milSpend:'$0B', milPercent:'2.6%', milPersonnel:'86', nuclear:'No', alliances:'Pacific Islands Forum', pop:'11K', medianAge:'36.4', democracy:'4.77', pressFreedom:'105', hdi:'0.565', stockYTD:'+12.5%', fdi:'$5M' },
  'UAE': { gdp:'$509B', gdpGrowth:'2.4%', gdpPerCapita:'$50,900', inflation:'1.5%', unemployment:'5.5%', debt:'49', milSpend:'$10B', milPercent:'1.3%', milPersonnel:'50K', nuclear:'No', alliances:'GCC, OPEC+', pop:'10M', medianAge:'30.6', democracy:'8.95', pressFreedom:'10', hdi:'0.894', stockYTD:'+20.6%', fdi:'$35B' },
  'Uganda': { gdp:'$50B', gdpGrowth:'1.7%', gdpPerCapita:'$1,041', inflation:'6.5%', unemployment:'7.1%', debt:'47', milSpend:'$1B', milPercent:'2.5%', milPersonnel:'422K', nuclear:'No', alliances:'AU', pop:'48M', medianAge:'18.1', democracy:'4.09', pressFreedom:'79', hdi:'0.685', stockYTD:'+19.5%', fdi:'$2B' },
  'Ukraine': { gdp:'$160B', gdpGrowth:'-1.8%', gdpPerCapita:'$4,324', inflation:'17.9%', unemployment:'18.1%', debt:'147', milSpend:'$9B', milPercent:'6.7%', milPersonnel:'335K', nuclear:'No', alliances:'Unaligned', pop:'37M', medianAge:'36.1', democracy:'2.83', pressFreedom:'177', hdi:'0.3', stockYTD:'-8.2%', fdi:'$4B' },
  'Uruguay': { gdp:'$71B', gdpGrowth:'2.3%', gdpPerCapita:'$20,285', inflation:'2.7%', unemployment:'5.8%', debt:'22', milSpend:'$1B', milPercent:'2.0%', milPersonnel:'29K', nuclear:'No', alliances:'MERCOSUR', pop:'3.5M', medianAge:'33.5', democracy:'7.68', pressFreedom:'26', hdi:'0.864', stockYTD:'-1.9%', fdi:'$4B' },
  'Uzbekistan': { gdp:'$92B', gdpGrowth:'1.7%', gdpPerCapita:'$2,555', inflation:'3.0%', unemployment:'6.9%', debt:'55', milSpend:'$2B', milPercent:'2.4%', milPersonnel:'296K', nuclear:'No', alliances:'SCO', pop:'36M', medianAge:'36.8', democracy:'5.06', pressFreedom:'50', hdi:'0.759', stockYTD:'-8.2%', fdi:'$1B' },
  'Vanuatu': { gdp:'$1B', gdpGrowth:'1.4%', gdpPerCapita:'$3,030', inflation:'3.8%', unemployment:'4.3%', debt:'34', milSpend:'$0B', milPercent:'2.5%', milPersonnel:'3K', nuclear:'No', alliances:'Pacific Islands Forum', pop:'330K', medianAge:'34.8', democracy:'6.19', pressFreedom:'59', hdi:'0.781', stockYTD:'-9.3%', fdi:'$51M' },
  'Venezuela': { gdp:'$92B', gdpGrowth:'2.7%', gdpPerCapita:'$3,285', inflation:'14.7%', unemployment:'18.7%', debt:'116', milSpend:'$3B', milPercent:'6.0%', milPersonnel:'124K', nuclear:'No', alliances:'Unaligned', pop:'28M', medianAge:'36.8', democracy:'2.76', pressFreedom:'122', hdi:'0.464', stockYTD:'+8.9%', fdi:'$5B' },
  'Vietnam': { gdp:'$409B', gdpGrowth:'2.3%', gdpPerCapita:'$4,090', inflation:'2.6%', unemployment:'6.7%', debt:'44', milSpend:'$6B', milPercent:'1.4%', milPersonnel:'540K', nuclear:'No', alliances:'ASEAN, CPTPP', pop:'100M', medianAge:'27.2', democracy:'5.66', pressFreedom:'39', hdi:'0.762', stockYTD:'+20.7%', fdi:'$10B' },
  'Yemen': { gdp:'$21B', gdpGrowth:'-0.6%', gdpPerCapita:'$636', inflation:'16.8%', unemployment:'21.2%', debt:'146', milSpend:'$1B', milPercent:'3.4%', milPersonnel:'262K', nuclear:'No', alliances:'Arab League', pop:'33M', medianAge:'25.5', democracy:'1.81', pressFreedom:'176', hdi:'0.302', stockYTD:'-8.0%', fdi:'$2B' },
  'Zambia': { gdp:'$29B', gdpGrowth:'2.1%', gdpPerCapita:'$1,450', inflation:'3.2%', unemployment:'6.9%', debt:'54', milSpend:'$1B', milPercent:'2.2%', milPersonnel:'92K', nuclear:'No', alliances:'AU', pop:'20M', medianAge:'18.2', democracy:'5.79', pressFreedom:'53', hdi:'0.796', stockYTD:'+6.4%', fdi:'$2B' },
  'Zimbabwe': { gdp:'$35B', gdpGrowth:'3.1%', gdpPerCapita:'$2,187', inflation:'5.3%', unemployment:'10.1%', debt:'31', milSpend:'$1B', milPercent:'2.3%', milPersonnel:'102K', nuclear:'No', alliances:'AU', pop:'16M', medianAge:'20.0', democracy:'6.1', pressFreedom:'59', hdi:'0.655', stockYTD:'+20.2%', fdi:'$430M' },
};

// --- Compare mode state ---
var compareModeActive = false;
var compareCountries = [];
var COMPARE_COLORS = ['#3b82f6', '#ef4444', '#22c55e'];

function positionCompareHint() {
  var hint = document.getElementById('compareHint');
  var btn = document.getElementById('compareModeBtn');
  if (!hint || !btn) return;
  var globe = document.querySelector('.globe-container');
  var globeRect = globe ? globe.getBoundingClientRect() : { left: 0, top: 0 };
  var r = btn.getBoundingClientRect();
  if (window.innerWidth > 768) {
    // Desktop: to the right of the Compare Mode button
    hint.style.left = (r.right - globeRect.left + 8) + 'px';
    hint.style.top = (r.top - globeRect.top + (r.height / 2) - 14) + 'px';
    hint.style.bottom = 'auto';
  } else {
    // Mobile: to the right of the button row, vertically centered with buttons
    hint.style.left = (r.right - globeRect.left + 6) + 'px';
    hint.style.bottom = 'auto';
    hint.style.top = (r.top - globeRect.top + (r.height / 2) - 12) + 'px';
  }
}

function toggleCompareMode() {
  compareModeActive = !compareModeActive;
  document.getElementById('compareModeBtn').classList.toggle('active', compareModeActive);
  var panel = document.getElementById('comparePanel');
  var hint = document.getElementById('compareHint');
  // Dismiss all floating popups on mode toggle
  if (typeof dismissAllPopups === 'function') dismissAllPopups();
  if (compareModeActive) {
    // Deactivate trade routes if active
    if (typeof tradeRoutesActive !== 'undefined' && tradeRoutesActive && typeof toggleTradeRoutes === 'function') {
      toggleTradeRoutes();
    }
    compareCountries = []; renderComparePanel();
    if (hint) { hint.style.display = 'block'; positionCompareHint(); }
  } else {
    panel.classList.remove('active'); compareCountries = [];
    if (hint) hint.style.display = 'none';
    countryMeshes.forEach(function(m) { if (m.material) m.material.opacity = 0.95; });
  }
}

function addCountryToCompare(name) {
  if (!compareModeActive) return false;
  if (compareCountries.includes(name)) { removeCountryFromCompare(name); return true; }
  if (compareCountries.length >= 3) compareCountries.shift();
  compareCountries.push(name);
  // Hide hint as soon as first country is clicked
  var hint = document.getElementById('compareHint');
  if (hint) hint.style.display = 'none';
  countryMeshes.forEach(function(m) {
    if (compareCountries.includes(m.userData.name)) {
      var idx = compareCountries.indexOf(m.userData.name);
      m.material.color.set(COMPARE_COLORS[idx]); m.material.opacity = 1.0;
    } else { m.material.opacity = 0.3; }
  });
  renderComparePanel(); return true;
}

function removeCountryFromCompare(name) {
  compareCountries = compareCountries.filter(function(n) { return n !== name; });
  if (compareCountries.length === 0 && compareModeActive) {
    var hint = document.getElementById('compareHint');
    if (hint) hint.style.display = 'block';
  }
  countryMeshes.forEach(function(m) {
    if (compareCountries.includes(m.userData.name)) {
      var idx = compareCountries.indexOf(m.userData.name);
      m.material.color.set(COMPARE_COLORS[idx]); m.material.opacity = 1.0;
    } else {
      m.material.opacity = compareModeActive ? 0.3 : 0.95;
      if (m.userData.data && RISK_COLORS[m.userData.data.risk]) m.material.color.set(RISK_COLORS[m.userData.data.risk].glow);
    }
  });
  renderComparePanel();
}

function renderComparePanel() {
  var panel = document.getElementById('comparePanel');
  var chipsEl = document.getElementById('compareCountries');
  var contentEl = document.getElementById('compareContent');
  var dataArea = document.getElementById('compareDataArea');
  if (compareCountries.length === 0) { panel.classList.remove('active'); panel.classList.remove('expanded'); return; }
  panel.classList.add('active');

  if (compareCountries.length >= 2) {
    panel.classList.add('expanded');
  } else {
    panel.classList.remove('expanded');
  }

  chipsEl.innerHTML = compareCountries.map(function(name, i) {
    var c = COUNTRIES[name];
    return '<div class="compare-country-chip" style="background:' + COMPARE_COLORS[i] + '33;border:1px solid ' + COMPARE_COLORS[i] + ';">' + (c ? c.flag : '') + ' ' + name + ' <button onclick="removeCountryFromCompare(\'' + name.replace(/'/g,"\\'") + '\')">&times;</button></div>';
  }).join('');

  if (compareCountries.length >= 2) {
    if (dataArea) dataArea.style.display = 'block';
    drawRadarChart();
    var sections = [
      { title: 'Economic', rows: [['GDP','gdp'],['GDP Growth','gdpGrowth'],['GDP/Capita','gdpPerCapita'],['Inflation','inflation'],['Unemployment','unemployment'],['Debt %GDP','debt']] },
      { title: 'Military', rows: [['Spending','milSpend'],['% GDP','milPercent'],['Personnel','milPersonnel'],['Nuclear','nuclear'],['Alliances','alliances']] },
      { title: 'Demographics', rows: [['Population','pop'],['Median Age','medianAge']] },
      { title: 'Governance', rows: [['Democracy','democracy'],['Press Freedom','pressFreedom'],['HDI','hdi']] },
      { title: 'Markets', rows: [['Stock YTD','stockYTD'],['FDI','fdi']] }
    ];
    var h = '';
    sections.forEach(function(s) {
      h += '<div class="compare-section"><div class="compare-section-title">' + s.title + '</div><table class="compare-table"><thead><tr><th>Metric</th>';
      compareCountries.forEach(function(n, i) { h += '<th style="color:' + COMPARE_COLORS[i] + '">' + n + '</th>'; });
      h += '</tr></thead><tbody>';
      s.rows.forEach(function(r) {
        h += '<tr><td style="color:#6b7280;font-size:9px;">' + r[0] + '</td>';
        compareCountries.forEach(function(n) { var d = COMPARE_DATA[n]; h += '<td>' + (d ? (d[r[1]] || '—') : '—') + '</td>'; });
        h += '</tr>';
      });
      h += '</tbody></table></div>';
    });
    contentEl.innerHTML = h;
  } else {
    if (dataArea) dataArea.style.display = 'none';
    contentEl.innerHTML = '<div style="color:#6b7280;font-size:10px;text-align:center;padding:8px;">Tap another country or search above to compare</div>';
  }
}

// Search inside compare panel
function searchCompareCountry(query) {
  var results = document.getElementById('compareSearchResults');
  if (!results) return;
  if (!query || query.length < 1) { results.innerHTML = ''; results.style.display = 'none'; return; }
  var matches = Object.entries(COUNTRIES).filter(function(e) {
    return e[0].toLowerCase().includes(query.toLowerCase()) || e[1].region.toLowerCase().includes(query.toLowerCase());
  }).filter(function(e) {
    return !compareCountries.includes(e[0]);
  }).slice(0, 6);
  if (matches.length) {
    results.style.display = 'block';
    results.innerHTML = matches.map(function(e) {
      var name = e[0], c = e[1];
      return '<div class="compare-search-item" onclick="addCountryToCompare(\'' + name.replace(/'/g, "\\'") + '\');document.getElementById(\'compareSearchInput\').value=\'\';document.getElementById(\'compareSearchResults\').style.display=\'none\';">' + c.flag + ' ' + name + '</div>';
    }).join('');
  } else {
    results.innerHTML = '<div style="color:#6b7280;font-size:10px;padding:8px;text-align:center;">No matches</div>';
    results.style.display = 'block';
  }
}

// Parse GDP/milSpend/fdi values to a common numeric scale (trillions)
function parseToTrillions(str) {
  if (!str) return 0;
  var num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 0;
  if (str.indexOf('T') !== -1) return num;
  if (str.indexOf('B') !== -1) return num / 1000;
  if (str.indexOf('M') !== -1) return num / 1000000;
  return num;
}

function drawRadarChart() {
  var canvas = document.getElementById('radarChart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height, cx = w/2, cy = h/2, r = Math.min(w,h)/2 - 40;
  ctx.clearRect(0, 0, w, h);
  var cats = ['Economy','Military','Democracy','Development','Stability','Trade'];
  var nc = cats.length;
  function getVals(name) {
    var d = COMPARE_DATA[name]; if (!d) return cats.map(function(){return 0.3;});
    var gdpT = parseToTrillions(d.gdp);
    var milT = parseToTrillions(d.milSpend);
    var fdiT = parseToTrillions(d.fdi);
    return [
      Math.min(1, gdpT / 25),
      Math.min(1, milT / 0.9),
      Math.min(1, parseFloat(d.democracy) / 10),
      Math.min(1, parseFloat(d.hdi)),
      Math.min(1, (100 - parseFloat(d.unemployment)) / 100),
      Math.min(1, fdiT / 0.3)
    ];
  }
  for (var lev = 1; lev <= 5; lev++) {
    ctx.beginPath(); var lr = r*(lev/5);
    for (var i = 0; i <= nc; i++) { var a = (Math.PI*2*i)/nc - Math.PI/2; var x = cx+lr*Math.cos(a); var y = cy+lr*Math.sin(a); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 1; ctx.stroke();
  }
  for (var i = 0; i < nc; i++) {
    var a = (Math.PI*2*i)/nc - Math.PI/2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a)); ctx.strokeStyle='#1f293777'; ctx.stroke();
    ctx.fillStyle='#6b7280'; ctx.font='9px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(cats[i], cx+(r+20)*Math.cos(a), cy+(r+20)*Math.sin(a));
  }
  compareCountries.forEach(function(name, ci) {
    var vals = getVals(name); ctx.beginPath();
    vals.forEach(function(val, i) { var a = (Math.PI*2*i)/nc - Math.PI/2; var x = cx+r*val*Math.cos(a); var y = cy+r*val*Math.sin(a); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.closePath(); ctx.fillStyle = COMPARE_COLORS[ci]+'33'; ctx.fill(); ctx.strokeStyle = COMPARE_COLORS[ci]; ctx.lineWidth = 2; ctx.stroke();
  });
}

function positionFeatureButtons() {
  var wl = document.getElementById('watchlist');
  var btns = document.getElementById('featureBtnsDesktop');
  if (wl && btns && window.innerWidth > 768) { var r = wl.getBoundingClientRect(); btns.style.top = (r.bottom + 8) + 'px'; }
}
setTimeout(positionFeatureButtons, 500);
window.addEventListener('resize', positionFeatureButtons);
setInterval(positionFeatureButtons, 2000);
