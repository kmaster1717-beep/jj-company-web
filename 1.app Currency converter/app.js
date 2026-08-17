// API URL for exchange rates
const API_URL = 'https://open.er-api.com/v6/latest/USD';

// UI Elements
const amountInput = document.getElementById('amount-input');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const convertedAmountText = document.getElementById('converted-amount');
const targetSymbolText = document.getElementById('target-symbol');
const baseSymbolText = document.getElementById('base-symbol');
const swapBtn = document.getElementById('swap-btn');
const rateText = document.getElementById('rate-text');
const updateTimeText = document.getElementById('update-time-text');

// New UI Elements for Language Toggle
const langBtn = document.getElementById('lang-btn');
const subtitleText = document.getElementById('subtitle-text');
const amountLabel = document.getElementById('amount-label');
const fromLabel = document.getElementById('from-label');
const toLabel = document.getElementById('to-label');
const resultHeader = document.getElementById('result-header');

// State Variables
let exchangeRates = {};
let currenciesList = [];
let currentLang = 'en'; // Default language is English
let lastUpdateTimeUTC = '';

// Main/Priority Currencies (will be displayed at the top)
const priorityCurrencies = [
    { code: 'USD', nameEn: 'US Dollar (USD)', nameKo: '미국 달러 (USD)', symbol: '$' },
    { code: 'EUR', nameEn: 'Euro (EUR)', nameKo: '유럽 유로 (EUR)', symbol: '€' },
    { code: 'JPY', nameEn: 'Japanese Yen (JPY)', nameKo: '일본 엔 (JPY)', symbol: '¥' },
    { code: 'GBP', nameEn: 'British Pound (GBP)', nameKo: '영국 파운드 (GBP)', symbol: '£' },
    { code: 'KRW', nameEn: 'South Korean Won (KRW)', nameKo: '대한민국 원 (KRW)', symbol: '₩' },
    { code: 'CNY', nameEn: 'Chinese Yuan (CNY)', nameKo: '중국 위안 (CNY)', symbol: '¥' },
    { code: 'TWD', nameEn: 'New Taiwan Dollar (TWD)', nameKo: '대만 달러 (TWD)', symbol: 'NT$' }
];

// Fallback symbols mapping for other currencies
const currencySymbols = {
    KRW: '₩', USD: '$', JPY: '¥', EUR: '€', GBP: '£', CNY: '¥',
    AUD: 'A$', CAD: 'C$', CHF: 'CHF', HKD: 'HK$', NZD: 'NZ$',
    SGD: 'S$', INR: '₹', TWD: 'NT$', PHP: '₱', THB: '฿', VND: '₫'
};

// Comprehensive English & Korean Currency Names mapping
const currencyNames = {
    USD: { en: "US Dollar", ko: "미국 달러" },
    EUR: { en: "Euro", ko: "유럽 유로" },
    JPY: { en: "Japanese Yen", ko: "일본 엔" },
    GBP: { en: "British Pound", ko: "영국 파운드" },
    AUD: { en: "Australian Dollar", ko: "호주 달러" },
    CAD: { en: "Canadian Dollar", ko: "캐나다 달러" },
    CHF: { en: "Swiss Franc", ko: "스위스 프랑" },
    CNY: { en: "Chinese Yuan", ko: "중국 위안" },
    HKD: { en: "Hong Kong Dollar", ko: "홍콩 달러" },
    NZD: { en: "New Zealand Dollar", ko: "뉴질랜드 달러" },
    SEK: { en: "Swedish Krona", ko: "스웨덴 크로나" },
    NOK: { en: "Norwegian Krone", ko: "노르웨이 크로네" },
    DKK: { en: "Danish Krone", ko: "덴마크 크로네" },
    SGD: { en: "Singapore Dollar", ko: "싱가포르 달러" },
    INR: { en: "Indian Rupee", ko: "인도 루피" },
    MXN: { en: "Mexican Peso", ko: "멕시코 페소" },
    BRL: { en: "Brazilian Real", ko: "브라질 레알" },
    ZAR: { en: "South African Rand", ko: "남아프리카 공화국 랜드" },
    RUB: { en: "Russian Ruble", ko: "러시아 루블" },
    TRY: { en: "Turkish Lira", ko: "터키 리라" },
    KRW: { en: "South Korean Won", ko: "대한민국 원" },
    TWD: { en: "New Taiwan Dollar", ko: "대만 달러" },
    THB: { en: "Thai Baht", ko: "태국 바트" },
    PHP: { en: "Philippine Peso", ko: "필리핀 페소" },
    VND: { en: "Vietnamese Dong", ko: "베트남 동" },
    MYR: { en: "Malaysian Ringgit", ko: "말레이시아 링깃" },
    IDR: { en: "Indonesian Rupiah", ko: "인도네시아 루피아" },
    SAR: { en: "Saudi Riyal", ko: "사우디 리얄" },
    AED: { en: "UAE Dirham", ko: "아랍에미리트 디르함" },
    ILS: { en: "Israeli Shekel", ko: "이스라엘 셰켈" },
    EGP: { en: "Egyptian Pound", ko: "이집트 파운드" },
    PLN: { en: "Polish Zloty", ko: "폴란드 즈로티" },
    HUF: { en: "Hungarian Forint", ko: "헝가리 포린트" },
    CZK: { en: "Czech Koruna", ko: "체코 코루나" },
    RON: { en: "Romanian Leu", ko: "루마니아 레우" },
    BGN: { en: "Bulgarian Lev", ko: "불가리아 레프" },
    ISK: { en: "Icelandic Krona", ko: "아이슬란드 크로나" },
    CLP: { en: "Chilean Peso", ko: "칠레 페소" },
    COP: { en: "Colombian Peso", ko: "콜롬비아 페소" },
    PEN: { en: "Peruvian Sol", ko: "페루 솔" },
    ARS: { en: "Argentine Peso", ko: "아르헨티나 페소" },
    KES: { en: "Kenyan Shilling", ko: "케냐 실링" },
    NGN: { en: "Nigerian Naira", ko: "나이지리아 나이라" },
    GHS: { en: "Ghanaian Cedi", ko: "가나 세디" },
    PKR: { en: "Pakistani Rupee", ko: "파키스탄 루피" },
    BDT: { en: "Bangladeshi Taka", ko: "방글라데시 타카" },
    LKR: { en: "Sri Lankan Rupee", ko: "스리랑카 루피" },
    UAH: { en: "Ukrainian Hryvnia", ko: "우크라이나 그리브나" },
    KZT: { en: "Kazakhstani Tenge", ko: "카자흐스탄 텐게" },
    QAR: { en: "Qatari Riyal", ko: "카타르 리얄" },
    KWD: { en: "Kuwaiti Dinar", ko: "쿠웨이트 디나르" },
    BHD: { en: "Bahraini Dinar", ko: "바레인 디나르" },
    OMR: { en: "Omani Rial", ko: "오만 리알" },
    DZD: { en: "Algerian Dinar", ko: "알제리 디나르" },
    MAD: { en: "Moroccan Dirham", ko: "모로코 디르함" },
    IQD: { en: "Iraqi Dinar", ko: "이라크 디나르" },
    JOD: { en: "Jordanian Dinar", ko: "요르단 디나르" },
    LBP: { en: "Lebanese Pound", ko: "레바논 파운드" },
    LYD: { en: "Libyan Dinar", ko: "리비아 디나르" },
    TND: { en: "Tunisian Dinar", ko: "튜니지아 디나르" },
    YER: { en: "Yemeni Rial", ko: "예멘 리알" },
    CRC: { en: "Costa Rican Colon", ko: "코스타리카 콜론" },
    DOP: { en: "Dominican Peso", ko: "도미니카 페소" },
    GTQ: { en: "Guatemalan Quetzal", ko: "과테말라 케찰" },
    HNL: { en: "Honduran Lempira", ko: "온두라스 렘피라" },
    NIO: { en: "Nicaraguan Cordoba", ko: "니카라과 코르도바" },
    PAB: { en: "Panamanian Balboa", ko: "파나마 발보아" },
    PYG: { en: "Paraguayan Guarani", ko: "파라과이 과라니" },
    UYU: { en: "Uruguayan Peso", ko: "우루과이 페소" },
    VES: { en: "Venezuelan Bolivar", ko: "베네수엘라 볼리바르" },
    BOB: { en: "Bolivian Boliviano", ko: "볼리비아 볼리비아노" },
    FJD: { en: "Fijian Dollar", ko: "피지 달러" },
    GMD: { en: "Gambian Dalasi", ko: "감비아 달라시" },
    GNF: { en: "Guinean Franc", ko: "기니 프랑" },
    GYD: { en: "Guyanese Dollar", ko: "가이아나 달러" },
    HTG: { en: "Haitian Gourde", ko: "아이티 구르드" },
    KHR: { en: "Cambodian Riel", ko: "캄보디아 리엘" },
    KMF: { en: "Comorian Franc", ko: "코모로 프랑" },
    KPW: { en: "North Korean Won", ko: "조선민주주의인민공화국 원" },
    LAK: { en: "Lao Kip", ko: "라오스 킵" },
    LRD: { en: "Liberian Dollar", ko: "라이베리아 달러" },
    LSL: { en: "Lesotho Loti", ko: "레소토 로티" },
    MGA: { en: "Malagasy Ariary", ko: "마다가스카르 아리아리" },
    MMK: { en: "Myanmar Kyat", ko: "미얀마 짯" },
    MNT: { en: "Mongolian Togrog", ko: "몽골 투그릭" },
    MOP: { en: "Macanese Pataca", ko: "마카오 파타카" },
    MRU: { en: "Mauritanian Ouguiya", ko: "모리타니 우기야" },
    MUR: { en: "Mauritian Rupee", ko: "모리셔스 루피" },
    MVR: { en: "Maldivian Rufiyaa", ko: "몰디브 루피야" },
    MWK: { en: "Malawian Kwacha", ko: "말라위 콰차" },
    MZN: { en: "Mozambican Metical", ko: "모잠비크 메티칼" },
    NAD: { en: "Namibian Dollar", ko: "나미비아 달러" },
    NPR: { en: "Nepalese Rupee", ko: "네팔 루피" },
    PGK: { en: "Papua New Guinean Kina", ko: "파푸아뉴기니 키나" },
    RWF: { en: "Rwandan Franc", ko: "르완다 프랑" },
    SBD: { en: "Solomon Islands Dollar", ko: "솔로몬 제도 달러" },
    SCR: { en: "Seychellois Rupee", ko: "세이셸 루피" },
    SDG: { en: "Sudanese Pound", ko: "수단 파운드" },
    SHP: { en: "Saint Helena Pound", ko: "세인트헬레나 파운드" },
    SLL: { en: "Sierra Leonean Leone", ko: "시에라리온 리온" },
    SOS: { en: "Somali Shilling", ko: "소말리아 실링" },
    SRD: { en: "Surinamese Dollar", ko: "수리남 달러" },
    SSP: { en: "South Sudanese Pound", ko: "남수단 파운드" },
    STN: { en: "Sao Tome and Principe Dobra", ko: "상투메 프린시페 도브라" },
    SVC: { en: "Salvadoran Colon", ko: "엘살바도르 콜론" },
    SYP: { en: "Syrian Pound", ko: "시리아 파운드" },
    SZL: { en: "Swazi Lilangeni", ko: "스와질란드 릴랑게니" },
    TJS: { en: "Tajikistani Somoni", ko: "타지키스탄 소모니" },
    TMT: { en: "Turkmenistan Manat", ko: "투르크메니스탄 마나트" },
    TOP: { en: "Tongan Pa'anga", ko: "통가 파앙가" },
    TTD: { en: "Trinidad and Tobago Dollar", ko: "트리니다드 토바고 달러" },
    TZS: { en: "Tanzanian Shilling", ko: "탄자니아 실링" },
    UGX: { en: "Ugandan Shilling", ko: "우간다 실링" },
    UZS: { en: "Uzbekistani Somoni", ko: "우즈베키스탄 솜" },
    VUV: { en: "Vanuatu Vatu", ko: "바누아투 바투" },
    WST: { en: "Samoan Tala", ko: "사모아 탈라" },
    XAF: { en: "Central African CFA Franc", ko: "중앙아프리카 CFA 프랑" },
    XCD: { en: "East Caribbean Dollar", ko: "동카리브 달러" },
    XOF: { en: "West African CFA Franc", ko: "서아프리카 CFA 프랑" },
    XPF: { en: "CFP Franc", ko: "CFP 프랑" },
    ZMW: { en: "Zambian Kwacha", ko: "잠비아 콰차" },
    ZWL: { en: "Zimbabwean Dollar", ko: "짐바브웨 달러" },
    XAG: { en: "Silver Ounce", ko: "은 온스" },
    XAU: { en: "Gold Ounce", ko: "금 온스" },
    XPD: { en: "Palladium Ounce", ko: "팔라듐 온스" },
    XPT: { en: "Platinum Ounce", ko: "백금 온스" },
    BTC: { en: "Bitcoin", ko: "비트코인" },
    ETH: { en: "Ethereum", ko: "이더리움" }
};

// UI Translations
const translations = {
    en: {
        subtitle: "Real-time Automatic Currency Converter",
        amountLabel: "Enter Amount",
        amountPlaceholder: "Enter amount...",
        fromLabel: "From Currency",
        toLabel: "To Currency",
        resultHeader: "Conversion Result",
        loading: "Loading exchange rates...",
        lastUpdate: "Last Updated",
        popularGroup: "Popular Currencies",
        otherGroup: "Other Currencies",
        failedLoad: "Failed to load exchange rates.",
        networkError: "A network error occurred.",
        langBtnText: "KO"
    },
    ko: {
        subtitle: "실시간 API 연동 자동 환율 계산기",
        amountLabel: "금액 입력",
        amountPlaceholder: "금액을 입력하세요...",
        fromLabel: "기준 통화 (From)",
        toLabel: "변경 통화 (To)",
        resultHeader: "환전 결과",
        loading: "환율 정보를 불러오는 중...",
        lastUpdate: "마지막 업데이트",
        popularGroup: "주요 통화",
        otherGroup: "기타 통화",
        failedLoad: "환율 정보를 불러오는 데 실패했습니다.",
        networkError: "네트워크 오류가 발생했습니다.",
        langBtnText: "EN"
    }
};

// Initialize Application
async function init() {
    // Add event listener for language button
    langBtn.addEventListener('click', toggleLanguage);

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.result === 'success') {
            exchangeRates = data.rates;
            currenciesList = Object.keys(exchangeRates);
            lastUpdateTimeUTC = data.time_last_update_utc;
            
            // Build the select dropdowns
            populateSelectOptions();
            
            // Set default selections
            fromCurrencySelect.value = 'USD';
            toCurrencySelect.value = 'KRW';
            updateBaseSymbol();
            
            // Set update time and UI text
            updateLanguageUI();
            
            // Add Event Listeners for Live/Auto calculation
            amountInput.addEventListener('input', calculateConversion);
            fromCurrencySelect.addEventListener('change', () => {
                updateBaseSymbol();
                calculateConversion();
            });
            toCurrencySelect.addEventListener('change', calculateConversion);
            swapBtn.addEventListener('click', swapCurrencies);
            
            // Initial calculation
            calculateConversion();
        } else {
            rateText.textContent = translations[currentLang].failedLoad;
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        rateText.textContent = translations[currentLang].networkError;
    }
}

// Populate the currency dropdown elements
function populateSelectOptions() {
    // Generate options html
    const optionsHTML = generateDropdownHTML();
    
    // Remember current values to restore them after rebuild
    const prevFrom = fromCurrencySelect.value;
    const prevTo = toCurrencySelect.value;

    fromCurrencySelect.innerHTML = optionsHTML;
    toCurrencySelect.innerHTML = optionsHTML;

    if (prevFrom) fromCurrencySelect.value = prevFrom;
    if (prevTo) toCurrencySelect.value = prevTo;
}

// Sort and format options HTML based on current language
function generateDropdownHTML() {
    let html = '';
    const isEn = currentLang === 'en';
    
    // 1. Add priority currencies
    html += `<optgroup label="${translations[currentLang].popularGroup}">`;
    priorityCurrencies.forEach(curr => {
        if (currenciesList.includes(curr.code)) {
            const displayName = isEn ? curr.nameEn : curr.nameKo;
            html += `<option value="${curr.code}">${displayName}</option>`;
        }
    });
    html += '</optgroup>';
    
    // 2. Add remaining currencies in alphabetical order
    html += `<optgroup label="${translations[currentLang].otherGroup}">`;
    const priorityCodes = priorityCurrencies.map(c => c.code);
    currenciesList
        .filter(code => !priorityCodes.includes(code))
        .sort()
        .forEach(code => {
            let name = '';
            if (currencyNames[code]) {
                name = isEn ? currencyNames[code].en : currencyNames[code].ko;
            }
            const fullName = name ? `${name} (${code})` : code;
            html += `<option value="${code}">${fullName}</option>`;
        });
    html += '</optgroup>';
    
    return html;
}

// Update the input symbol prefix based on the selected base currency
function updateBaseSymbol() {
    const fromCode = fromCurrencySelect.value;
    const symbol = currencySymbols[fromCode] || fromCode;
    baseSymbolText.textContent = symbol;
}

// Perform currency conversion calculation
function calculateConversion() {
    const amount = parseFloat(amountInput.value);
    
    // Handle empty or invalid input
    if (isNaN(amount) || amount < 0) {
        convertedAmountText.textContent = '0.00';
        rateText.textContent = '-';
        return;
    }
    
    const fromCode = fromCurrencySelect.value;
    const toCode = toCurrencySelect.value;
    
    // Convert to USD base first, then convert to target currency
    const rateInUSD = exchangeRates[fromCode];
    const targetRateInUSD = exchangeRates[toCode];
    
    if (rateInUSD && targetRateInUSD) {
        // Calculation logic
        const converted = (amount / rateInUSD) * targetRateInUSD;
        
        // Display result (2 decimal places for general)
        convertedAmountText.textContent = converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        targetSymbolText.textContent = toCode;
        
        // Live rate description text
        const singleRate = (1 / rateInUSD) * targetRateInUSD;
        rateText.textContent = `1 ${fromCode} = ${singleRate.toFixed(4)} ${toCode}`;
    }
}

// Swap base and target currencies
function swapCurrencies() {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
    
    updateBaseSymbol();
    calculateConversion();
}

// Toggle Application Language
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ko' : 'en';
    document.documentElement.lang = currentLang;
    
    // Refresh Select Options with translated names
    populateSelectOptions();
    
    // Refresh UI text elements
    updateLanguageUI();
    
    // Recalculate to update results layout/rate description text if needed
    calculateConversion();
}

// Update all UI labels and texts based on current language
function updateLanguageUI() {
    const t = translations[currentLang];
    
    // Text labels
    subtitleText.textContent = t.subtitle;
    amountLabel.textContent = t.amountLabel;
    amountInput.placeholder = t.amountPlaceholder;
    fromLabel.textContent = t.fromLabel;
    toLabel.textContent = t.toLabel;
    resultHeader.textContent = t.resultHeader;
    
    // Language Toggle button text
    langBtn.innerHTML = `<i class="fa-solid fa-globe"></i> <span>${t.langBtnText}</span>`;
    
    // Update Time formatted according to locale
    if (lastUpdateTimeUTC) {
        const lastUpdate = new Date(lastUpdateTimeUTC);
        const localeStr = currentLang === 'ko' ? 'ko-KR' : 'en-US';
        updateTimeText.textContent = `${t.lastUpdate}: ${lastUpdate.toLocaleString(localeStr)}`;
    }
}

// Run the app on window load
window.addEventListener('DOMContentLoaded', init);
