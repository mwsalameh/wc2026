import { getNationalityAr } from './nationalityAr';

export interface RefereeInfo {
  nameAr: string;
  nameEn?: string;       // override when API returns an abbreviated/incorrect English name
  nationality: string;   // English adjective used in NATIONALITY_AR map
  countryCode: string;   // ISO 3166-1 alpha-2 for flag emoji
}

// Converts ISO alpha-2 country code to the corresponding flag emoji.
export function getFlagEmoji(code: string): string {
  if (!code || code.length < 2) return '';
  return [...code.toUpperCase().slice(0, 2)].map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('');
}

// Maps country names (as returned by the API's referee field) to ISO codes.
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'Argentina': 'AR', 'Brazil': 'BR', 'Uruguay': 'UY', 'Colombia': 'CO',
  'Ecuador': 'EC', 'Chile': 'CL', 'Venezuela': 'VE', 'Paraguay': 'PY',
  'Peru': 'PE', 'Bolivia': 'BO',
  'France': 'FR', 'Germany': 'DE', 'Spain': 'ES', 'England': 'GB',
  'Portugal': 'PT', 'Netherlands': 'NL', 'Belgium': 'BE', 'Italy': 'IT',
  'Croatia': 'HR', 'Switzerland': 'CH', 'Denmark': 'DK', 'Sweden': 'SE',
  'Norway': 'NO', 'Poland': 'PL', 'Austria': 'AT', 'Serbia': 'RS',
  'Romania': 'RO', 'Hungary': 'HU', 'Czech Republic': 'CZ', 'Slovakia': 'SK',
  'Turkey': 'TR', 'Scotland': 'GB', 'Wales': 'GB', 'Ireland': 'IE',
  'Bulgaria': 'BG', 'Slovenia': 'SI', 'Albania': 'AL',
  'USA': 'US', 'United States': 'US', 'Mexico': 'MX', 'Canada': 'CA',
  'El Salvador': 'SV', 'Honduras': 'HN', 'Panama': 'PA', 'Costa Rica': 'CR',
  'Jamaica': 'JM', 'Trinidad and Tobago': 'TT', 'Guatemala': 'GT',
  'Senegal': 'SN', 'Nigeria': 'NG', 'Ghana': 'GH', 'Morocco': 'MA',
  'Algeria': 'DZ', 'Tunisia': 'TN', 'Egypt': 'EG', 'South Africa': 'ZA',
  'Zambia': 'ZM', 'Ethiopia': 'ET', 'Guinea': 'GN', 'Gambia': 'GM',
  'Cameroon': 'CM', 'Rwanda': 'RW', 'Tanzania': 'TZ', 'Angola': 'AO',
  'Liberia': 'LR', 'Comoros': 'KM', 'Mauritania': 'MR', 'Mali': 'ML',
  'Qatar': 'QA', 'Saudi Arabia': 'SA', 'UAE': 'AE', 'United Arab Emirates': 'AE',
  'Bahrain': 'BH', 'Jordan': 'JO', 'Iraq': 'IQ', 'Iran': 'IR',
  'Kuwait': 'KW', 'Oman': 'OM', 'Syria': 'SY', 'Lebanon': 'LB',
  'Japan': 'JP', 'South Korea': 'KR', 'China': 'CN', 'Australia': 'AU',
  'New Zealand': 'NZ', 'Uzbekistan': 'UZ', 'Indonesia': 'ID', 'India': 'IN',
};

export function getCountryCodeFromName(countryName: string): string | null {
  if (!countryName) return null;
  return COUNTRY_NAME_TO_CODE[countryName] ?? null;
}

// Maps country names to Arabic nationality strings (for referees not in our database).
const COUNTRY_NAME_TO_NATIONALITY_AR: Record<string, string> = {
  'Argentina': 'أرجنتيني', 'Brazil': 'برازيلي', 'Uruguay': 'أوروغواياني',
  'Colombia': 'كولومبي', 'Ecuador': 'إكوادوري', 'Chile': 'تشيلي',
  'Venezuela': 'فنزويلي', 'Paraguay': 'باراغوياني', 'Peru': 'بيروفي',
  'France': 'فرنسي', 'Germany': 'ألماني', 'Spain': 'إسباني',
  'England': 'إنجليزي', 'Portugal': 'برتغالي', 'Netherlands': 'هولندي',
  'Belgium': 'بلجيكي', 'Italy': 'إيطالي', 'Croatia': 'كرواتي',
  'Switzerland': 'سويسري', 'Denmark': 'دنماركي', 'Sweden': 'سويدي',
  'Norway': 'نرويجي', 'Poland': 'بولندي', 'Austria': 'نمساوي',
  'Serbia': 'صربي', 'Romania': 'روماني', 'Slovakia': 'سلوفاكي',
  'Turkey': 'تركي', 'Bulgaria': 'بلغاري', 'Slovenia': 'سلوفيني',
  'Scotland': 'اسكتلندي', 'Ireland': 'إيرلندي',
  'USA': 'أمريكي', 'United States': 'أمريكي', 'Mexico': 'مكسيكي',
  'Canada': 'كندي', 'El Salvador': 'سلفادوري', 'Honduras': 'هندوراسي',
  'Panama': 'بنمي', 'Costa Rica': 'كوستاريكي', 'Jamaica': 'جامايكي',
  'Guatemala': 'غواتيمالي',
  'Senegal': 'سنغالي', 'Nigeria': 'نيجيري', 'Ghana': 'غاني',
  'Morocco': 'مغربي', 'Algeria': 'جزائري', 'Tunisia': 'تونسي',
  'Egypt': 'مصري', 'South Africa': 'جنوب أفريقي', 'Zambia': 'زامبي',
  'Ethiopia': 'إثيوبي', 'Guinea': 'غيني', 'Gambia': 'غامبي',
  'Cameroon': 'كاميروني', 'Rwanda': 'رواندي', 'Mali': 'مالي',
  'Qatar': 'قطري', 'Saudi Arabia': 'سعودي', 'UAE': 'إماراتي',
  'United Arab Emirates': 'إماراتي', 'Bahrain': 'بحريني', 'Jordan': 'أردني',
  'Iraq': 'عراقي', 'Iran': 'إيراني', 'Kuwait': 'كويتي', 'Oman': 'عُماني',
  'Japan': 'ياباني', 'South Korea': 'كوري جنوبي', 'China': 'صيني',
  'Australia': 'أسترالي', 'Uzbekistan': 'أوزبكي', 'Indonesia': 'إندونيسي',
};

export function getCountryNationalityAr(countryName: string): string {
  if (!countryName) return '';
  return COUNTRY_NAME_TO_NATIONALITY_AR[countryName] ?? countryName;
}

export function getRefereeNameAr(name: string): string | null {
  return REFEREE_DATA[name]?.nameAr ?? null;
}

// ─── Automatic Latin → Arabic phonetic transliteration ────────────────────────
// Used as a fallback when a referee has no manual entry in REFEREE_DATA.
// Handles Spanish, Portuguese, French, English, and most other Latin-script names.

const DIGRAPHS: Record<string, string> = {
  'sh': 'ش', 'ch': 'تش', 'ph': 'ف', 'th': 'ث',
  'gh': 'غ', 'ck': 'ك', 'qu': 'ك', 'll': 'ي',
  'sz': 'ش', 'cz': 'تش', 'ts': 'تس', 'tz': 'تز', 'wh': 'و',
};

const INITIAL_VOWELS: Record<string, string> = {
  'a': 'أ', 'e': 'إي', 'i': 'إي', 'o': 'أو', 'u': 'أو',
};

const MEDIAL_VOWELS: Record<string, string> = {
  'a': 'ا', 'e': 'ي', 'i': 'ي', 'o': 'و', 'u': 'و',
};

const CONSONANTS: Record<string, string> = {
  'b': 'ب', 'd': 'د', 'f': 'ف', 'h': 'ه', 'j': 'خ',
  'k': 'ك', 'l': 'ل', 'm': 'م', 'n': 'ن', 'p': 'ب',
  'q': 'ك', 'r': 'ر', 's': 'س', 't': 'ت', 'v': 'ف',
  'w': 'و', 'x': 'كس', 'y': 'ي', 'z': 'ز',
};

function transliterateWord(word: string): string {
  // Strip accents (é→e, ñ→n, ü→u …) so we work with plain ASCII
  const s = word.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let out = '';
  let i = 0;

  while (i < s.length) {
    const c = s[i];
    const next = s[i + 1] ?? '';
    const isFirst = out === '';

    // Double consonant → write once (gemination)
    if (c === next && !'aeiou'.includes(c)) {
      out += CONSONANTS[c] ?? c;
      i += 2;
      continue;
    }

    // Two-character digraph
    const two = c + next;
    if (DIGRAPHS[two]) {
      out += DIGRAPHS[two];
      i += 2;
      continue;
    }

    // Vowel
    if ('aeiou'.includes(c)) {
      out += isFirst ? (INITIAL_VOWELS[c] ?? 'أ') : (MEDIAL_VOWELS[c] ?? 'ا');
      i++;
      continue;
    }

    // Context-sensitive: c → س before e/i, otherwise ك
    if (c === 'c') { out += 'ei'.includes(next) ? 'س' : 'ك'; i++; continue; }
    // Context-sensitive: g → خ before e/i (Spanish/French), otherwise غ
    if (c === 'g') { out += 'ei'.includes(next) ? 'خ' : 'غ'; i++; continue; }

    out += CONSONANTS[c] ?? c;
    i++;
  }

  return out;
}

export function transliterateToArabic(name: string): string {
  return name.split(/\s+/).map(transliterateWord).join(' ');
}

export function getRefereeInfo(name: string, country?: string): RefereeInfo | null {
  // 1. Exact match
  if (REFEREE_DATA[name]) return REFEREE_DATA[name];

  // 2. Case-insensitive exact match (handles capitalisation differences)
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(REFEREE_DATA)) {
    if (key.toLowerCase() === lower) return val;
  }

  // 3. Country + first-name prefix match (handles API truncations / abbreviated names).
  //    Safe for WC because each country sends at most 1–2 referees with distinct first names.
  if (country) {
    const targetCode = COUNTRY_NAME_TO_CODE[country];
    if (targetCode) {
      const firstName = name.split(/\s+/)[0].toLowerCase();
      for (const [key, val] of Object.entries(REFEREE_DATA)) {
        if (val.countryCode === targetCode && key.toLowerCase().startsWith(firstName)) {
          return val;
        }
      }
    }
  }

  return null;
}

export function getRefereeNationalityAr(info: RefereeInfo): string {
  return getNationalityAr(info.nationality) ?? info.nationality;
}

const REFEREE_DATA: Record<string, RefereeInfo> = {
  // ── Europe ──────────────────────────────────────────────────────────────────
  'Szymon Marciniak': {
    nameAr: 'شيمون مارشينياك',
    nationality: 'Polish',
    countryCode: 'PL',
  },
  'Slavko Vincic': {
    nameAr: 'سلافكو فينشيتش',
    nationality: 'Slovenian',
    countryCode: 'SI',
  },
  'Slavko Vinčić': {
    nameAr: 'سلافكو فينشيتش',
    nationality: 'Slovenian',
    countryCode: 'SI',
  },
  'Clement Turpin': {
    nameAr: 'كليمان تورپان',
    nationality: 'French',
    countryCode: 'FR',
  },
  'Clément Turpin': {
    nameAr: 'كليمان تورپان',
    nationality: 'French',
    countryCode: 'FR',
  },
  'Danny Makkelie': {
    nameAr: 'داني ماكيلي',
    nationality: 'Dutch',
    countryCode: 'NL',
  },
  'Glenn Nyberg': {
    nameAr: 'غلين نيبرغ',
    nationality: 'Swedish',
    countryCode: 'SE',
  },
  'Felix Zwayer': {
    nameAr: 'فيليكس زفاير',
    nationality: 'German',
    countryCode: 'DE',
  },
  'Daniel Siebert': {
    nameAr: 'دانيال زيبرت',
    nationality: 'German',
    countryCode: 'DE',
  },
  'Tobias Stieler': {
    nameAr: 'توبياس شتيلر',
    nationality: 'German',
    countryCode: 'DE',
  },
  'Alejandro Hernandez': {
    nameAr: 'أليخاندرو هيرنانديز',
    nationality: 'Spanish',
    countryCode: 'ES',
  },
  'Carlos Del Cerro Grande': {
    nameAr: 'كارلوس ديل سيرو غراندي',
    nationality: 'Spanish',
    countryCode: 'ES',
  },
  'Jesus Gil Manzano': {
    nameAr: 'خيسوس خيل مانزانو',
    nationality: 'Spanish',
    countryCode: 'ES',
  },
  'Artur Dias': {
    nameAr: 'آرتور دياس',
    nationality: 'Portuguese',
    countryCode: 'PT',
  },
  'Halil Umut Meler': {
    nameAr: 'هاليل أوموت ميلر',
    nationality: 'Turkish',
    countryCode: 'TR',
  },
  'Ivan Kruzliak': {
    nameAr: 'إيفان كروزلياك',
    nationality: 'Slovak',
    countryCode: 'SK',
  },
  'Georgi Kabakov': {
    nameAr: 'غيورغي كاباكوف',
    nationality: 'Bulgarian',
    countryCode: 'BG',
  },
  'Daniele Orsato': {
    nameAr: 'دانييلي أورساتو',
    nationality: 'Italian',
    countryCode: 'IT',
  },
  'Marco Guida': {
    nameAr: 'ماركو غويدا',
    nationality: 'Italian',
    countryCode: 'IT',
  },
  'Davide Massa': {
    nameAr: 'دافيدي ماسا',
    nationality: 'Italian',
    countryCode: 'IT',
  },
  'Michael Oliver': {
    nameAr: 'مايكل أوليفر',
    nationality: 'English',
    countryCode: 'GB',
  },
  'Anthony Taylor': {
    nameAr: 'أنتوني تايلور',
    nationality: 'English',
    countryCode: 'GB',
  },
  'Simon Marciniak': {
    nameAr: 'سيمون مارشينياك',
    nationality: 'Polish',
    countryCode: 'PL',
  },
  'Francois Letexier': {
    nameAr: 'فرانسوا لوتيكسييه',
    nationality: 'French',
    countryCode: 'FR',
  },
  'François Letexier': {
    nameAr: 'فرانسوا لوتيكسييه',
    nationality: 'French',
    countryCode: 'FR',
  },
  'Benoit Bastien': {
    nameAr: 'بينوا باستيان',
    nationality: 'French',
    countryCode: 'FR',
  },
  'Benoît Bastien': {
    nameAr: 'بينوا باستيان',
    nationality: 'French',
    countryCode: 'FR',
  },
  'Andreas Ekberg': {
    nameAr: 'أندرياس إيكبرغ',
    nationality: 'Swedish',
    countryCode: 'SE',
  },
  'Erik Lambrechts': {
    nameAr: 'إريك لامبريختس',
    nationality: 'Belgian',
    countryCode: 'BE',
  },
  'Lawrence Visser': {
    nameAr: 'لورانس فيسر',
    nationality: 'Belgian',
    countryCode: 'BE',
  },
  'Serdar Gözübüyük': {
    nameAr: 'سردار غوزوبويوك',
    nationality: 'Dutch',
    countryCode: 'NL',
  },
  'Serdar Gozubuyuk': {
    nameAr: 'سردار غوزوبويوك',
    nationality: 'Dutch',
    countryCode: 'NL',
  },
  'Istvan Kovacs': {
    nameAr: 'إيستفان كوفاتش',
    nationality: 'Romanian',
    countryCode: 'RO',
  },
  'István Kovács': {
    nameAr: 'إيستفان كوفاتش',
    nationality: 'Romanian',
    countryCode: 'RO',
  },
  'Radu Marian Petrescu': {
    nameAr: 'رادو بيتريسكو',
    nationality: 'Romanian',
    countryCode: 'RO',
  },

  // ── South America ────────────────────────────────────────────────────────────
  'Wilton Sampaio': {
    nameAr: 'ويلتون سامبايو',
    nationality: 'Brazilian',
    countryCode: 'BR',
  },
  'Ramon Abatti Abel': {
    nameAr: 'رامون أباتي آبيل',
    nationality: 'Brazilian',
    countryCode: 'BR',
  },
  'Yael Falcon Perez': {
    nameAr: 'يائيل فالكون بيريز',
    nationality: 'Argentine',
    countryCode: 'AR',
  },
  'Yael Falcón Pérez': {
    nameAr: 'يائيل فالكون بيريز',
    nationality: 'Argentine',
    countryCode: 'AR',
  },
  'Facundo Tello': {
    nameAr: 'فاكوندو تييو',
    nationality: 'Argentine',
    countryCode: 'AR',
  },
  'Fernando Rapallini': {
    nameAr: 'فيرناندو راباليني',
    nationality: 'Argentine',
    countryCode: 'AR',
  },
  'Patricio Loustau': {
    nameAr: 'باتريسيو لوستاو',
    nationality: 'Argentine',
    countryCode: 'AR',
  },
  'Nestor Pitana': {
    nameAr: 'نيستور بيتانا',
    nationality: 'Argentine',
    countryCode: 'AR',
  },
  'Néstor Pitana': {
    nameAr: 'نيستور بيتانا',
    nationality: 'Argentine',
    countryCode: 'AR',
  },
  'Jesus Valenzuela': {
    nameAr: 'خيسوس فالينزويلا',
    nationality: 'Venezuelan',
    countryCode: 'VE',
  },
  'Jesús Valenzuela': {
    nameAr: 'خيسوس فالينزويلا',
    nationality: 'Venezuelan',
    countryCode: 'VE',
  },
  'Pablo Lescano': {
    nameAr: 'بابلو ليسكانو',
    nationality: 'Ecuadorian',
    countryCode: 'EC',
  },
  'Piero Maza': {
    nameAr: 'بييرو ماسا',
    nationality: 'Chilean',
    countryCode: 'CL',
  },
  'Andres Rojas': {
    nameAr: 'أندريس روخاس',
    nationality: 'Colombian',
    countryCode: 'CO',
  },
  'Andrés Rojas': {
    nameAr: 'أندريس روخاس',
    nationality: 'Colombian',
    countryCode: 'CO',
  },
  'Wilmar Roldan': {
    nameAr: 'ويلمار رولدان',
    nationality: 'Colombian',
    countryCode: 'CO',
  },
  'Wilmar Roldán': {
    nameAr: 'ويلمار رولدان',
    nationality: 'Colombian',
    countryCode: 'CO',
  },

  // ── North & Central America ──────────────────────────────────────────────────
  'Cesar Ramos': {
    nameAr: 'سيزار راموس',
    nationality: 'Mexican',
    countryCode: 'MX',
  },
  'César Ramos': {
    nameAr: 'سيزار راموس',
    nationality: 'Mexican',
    countryCode: 'MX',
  },
  'Ismail Elfath': {
    nameAr: 'إسماعيل الفتح',
    nationality: 'American',
    countryCode: 'US',
  },
  'Ivan Barton': {
    nameAr: 'إيفان بارتون',
    nationality: 'Salvadoran',
    countryCode: 'SV',
  },
  'John Pitti': {
    nameAr: 'جون بيتي',
    nationality: 'Panamanian',
    countryCode: 'PA',
  },
  'Said Martinez': {
    nameAr: 'سايد مارتينيز',
    nationality: 'Honduran',
    countryCode: 'HN',
  },

  // ── Africa ───────────────────────────────────────────────────────────────────
  'Victor Gomes': {
    nameAr: 'فيكتور غوميس',
    nationality: 'South African',
    countryCode: 'ZA',
  },
  'Janny Sikazwe': {
    nameAr: 'جاني سيكازوي',
    nationality: 'Zambian',
    countryCode: 'ZM',
  },
  'Bakary Gassama': {
    nameAr: 'باكاري غاساما',
    nationality: 'Gambian',
    countryCode: 'GM',
  },
  'Mustapha Ghorbal': {
    nameAr: 'مصطفى غربال',
    nationality: 'Algerian',
    countryCode: 'DZ',
  },
  'Maguette Ndiaye': {
    nameAr: 'ماغيت نداي',
    nationality: 'Senegalese',
    countryCode: 'SN',
  },
  'Bamlak Tessema Weyesa': {
    nameAr: 'باملاك تيسيما وييسا',
    nationality: 'Ethiopian',
    countryCode: 'ET',
  },
  'Redouane Jiyed': {
    nameAr: 'رضوان جيد',
    nationality: 'Moroccan',
    countryCode: 'MA',
  },
  'Jalal Jayed': {
    nameAr: 'جلال جيد',
    nationality: 'Moroccan',
    countryCode: 'MA',
  },
  'Ghead Grisha': {
    nameAr: 'جياد غريشة',
    nationality: 'Egyptian',
    countryCode: 'EG',
  },
  'Souleymane Diallo': {
    nameAr: 'سليمان ديالو',
    nationality: 'Guinean',
    countryCode: 'GN',
  },

  // ── Asia ─────────────────────────────────────────────────────────────────────
  'Abdulrahman Al-Jassim': {
    nameAr: 'عبدالرحمن الجاسم',
    nationality: 'Qatari',
    countryCode: 'QA',
  },
  'Abdulrahman Al Jassim': {
    nameAr: 'عبدالرحمن الجاسم',
    nationality: 'Qatari',
    countryCode: 'QA',
  },
  'Mohammed Al-Hoaish': {
    nameAr: 'محمد الحويش',
    nationality: 'Saudi Arabian',
    countryCode: 'SA',
  },
  'Mohammed Al Hoaish': {
    nameAr: 'محمد الحويش',
    nationality: 'Saudi Arabian',
    countryCode: 'SA',
  },
  'Nawaf Shukralla': {
    nameAr: 'نواف شقرة',
    nationality: 'Bahraini',
    countryCode: 'BH',
  },
  'Adel Al-Naqbi': {
    nameAr: 'عادل النقبي',
    nationality: 'Emirati',
    countryCode: 'AE',
  },
  'Adel Al Naqbi': {
    nameAr: 'عادل النقبي',
    nationality: 'Emirati',
    countryCode: 'AE',
  },
  'Ma Ning': {
    nameAr: 'ما نينغ',
    nationality: 'Chinese',
    countryCode: 'CN',
  },
  'Ryuji Sato': {
    nameAr: 'ريوجي ساتو',
    nationality: 'Japanese',
    countryCode: 'JP',
  },
  'Ilgiz Tantashev': {
    nameAr: 'إلغيز تانتاشيف',
    nationality: 'Uzbek',
    countryCode: 'UZ',
  },
  'Chris Beath': {
    nameAr: 'كريس بيث',
    nationality: 'Australian',
    countryCode: 'AU',
  },
  'Alireza Faghani': {
    nameAr: 'عليرضا فقاني',
    nationality: 'Iranian',
    countryCode: 'IR',
  },
  'Ravshan Irmatov': {
    nameAr: 'رافشان إيرماتوف',
    nationality: 'Uzbek',
    countryCode: 'UZ',
  },
  'Adham Mohammad': {
    nameAr: 'أدهم المخادمة',
    nameEn: 'Adham Al Makhadmeh',
    nationality: 'Jordanian',
    countryCode: 'JO',
  },
  'Adham Makhadmeh': {
    nameAr: 'أدهم المخادمة',
    nationality: 'Jordanian',
    countryCode: 'JO',
  },
  'Adham Al-Makhadmeh': {
    nameAr: 'أدهم المخادمة',
    nationality: 'Jordanian',
    countryCode: 'JO',
  },
  'Adham Al Makhadmeh': {
    nameAr: 'أدهم المخادمة',
    nationality: 'Jordanian',
    countryCode: 'JO',
  },
  'Turki Al-Khudair': {
    nameAr: 'تركي الخضير',
    nationality: 'Saudi Arabian',
    countryCode: 'SA',
  },
  'Salman Falahi': {
    nameAr: 'سلمان فلاحي',
    nationality: 'Qatari',
    countryCode: 'QA',
  },
};
