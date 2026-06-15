// Arabic venue names keyed by the exact English name returned by api-football
export const VENUE_NAMES_AR: Record<string, string> = {
  // Mexico
  'Estadio Azteca': 'ملعب أزتيكا',
  'Estadio Akron': 'ملعب أكرون',
  'Estadio BBVA': 'ملعب بي بي في إيه',

  // Canada
  'BMO Field': 'ملعب بي إم أو',
  'BC Place': 'قاعة بي سي',

  // USA
  'AT&T Stadium': 'ملعب أي تي آند تي',
  'Gillette Stadium': 'ملعب جيليت',
  'Mercedes-Benz Stadium': 'ملعب مرسيدس بنز',
  'Lumen Field': 'ملعب لومن فيلد',
  'MetLife Stadium': 'ملعب ميتلايف',
  'SoFi Stadium': 'ملعب سوفاي',
  'Rose Bowl': 'ملعب روز بول',
  'Arrowhead Stadium': 'ملعب أروهيد',
  'NRG Stadium': 'ملعب إن آر جي',
  'Lincoln Financial Field': 'ملعب لينكولن',
  'Caesars Superdome': 'قبة سيزارز',
  'Hard Rock Stadium': 'ملعب هارد روك',
  "Levi's Stadium": 'ملعب ليفايز',
  'Levis Stadium': 'ملعب ليفايز',
  'Dignity Health Sports Park': 'ملعب ديغنيتي هيلث',
};

export const CITY_NAMES_AR: Record<string, string> = {
  // Mexico
  'Mexico City': 'مكسيكو سيتي',
  'Guadalajara': 'غواداخالارا',
  'Monterrey': 'مونتيري',

  // Canada
  'Toronto': 'تورنتو',
  'Vancouver': 'فانكوفر',

  // USA
  'Arlington': 'أرلينغتون',
  'Dallas': 'دالاس',
  'Boston': 'بوسطن',
  'Atlanta': 'أتلانتا',
  'Seattle': 'سياتل',
  'New York': 'نيويورك',
  'East Rutherford': 'إيست رذرفورد',
  'New York New Jersey': 'نيويورك / نيو جيرسي',
  'Los Angeles': 'لوس أنجلوس',
  'Inglewood': 'إنغلوود',
  'Pasadena': 'باسادينا',
  'Kansas City': 'كانساس سيتي',
  'Houston': 'هيوستن',
  'Philadelphia': 'فيلادلفيا',
  'Foxborough': 'فوكسبورو',
  'New Orleans': 'نيو أورليانز',
  'Miami': 'ميامي',
  'Miami Gardens': 'ميامي غاردنز',
  'San Francisco': 'سان فرانسيسكو',
  'San Francisco Bay Area': 'منطقة خليج سان فرانسيسكو',
  'Santa Clara': 'سانتا كلارا',
  'Bay Area': 'منطقة الخليج',
};

export function getVenueNameAr(name: string): string {
  return VENUE_NAMES_AR[name] ?? name;
}

export function getCityNameAr(city: string): string {
  const result = CITY_NAMES_AR[city];
  if (__DEV__ && city && !result) {
    console.warn('[venueNamesAr] MISS city:', JSON.stringify(city));
  }
  return result ?? city;
}

export interface HostCountry {
  name: string;
  nameAr: string;
  code: string;
}

const CITY_HOST_COUNTRY: Record<string, HostCountry> = {
  // Mexico
  'Mexico City': { name: 'Mexico', nameAr: 'المكسيك', code: 'MX' },
  'Guadalajara': { name: 'Mexico', nameAr: 'المكسيك', code: 'MX' },
  'Monterrey': { name: 'Mexico', nameAr: 'المكسيك', code: 'MX' },
  // Canada
  'Toronto': { name: 'Canada', nameAr: 'كندا', code: 'CA' },
  'Vancouver': { name: 'Canada', nameAr: 'كندا', code: 'CA' },
  // USA
  'Arlington': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Dallas': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Boston': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Foxborough': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Atlanta': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Seattle': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'New York': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'East Rutherford': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'New York New Jersey': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Los Angeles': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Inglewood': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Pasadena': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Santa Clara': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Kansas City': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Houston': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Philadelphia': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'New Orleans': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Miami': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Miami Gardens': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'San Francisco': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'San Francisco Bay Area': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Bay Area': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
};

export function getVenueHostCountry(city: string): HostCountry | null {
  return CITY_HOST_COUNTRY[city] ?? null;
}

const VENUE_HOST_COUNTRY: Record<string, HostCountry> = {
  // Mexico
  'Estadio Azteca':  { name: 'Mexico', nameAr: 'المكسيك', code: 'MX' },
  'Estadio Akron':   { name: 'Mexico', nameAr: 'المكسيك', code: 'MX' },
  'Estadio BBVA':    { name: 'Mexico', nameAr: 'المكسيك', code: 'MX' },
  // Canada
  'BMO Field':  { name: 'Canada', nameAr: 'كندا', code: 'CA' },
  'BC Place':   { name: 'Canada', nameAr: 'كندا', code: 'CA' },
  // USA
  'AT&T Stadium':          { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Gillette Stadium':      { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Mercedes-Benz Stadium': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Lumen Field':           { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'MetLife Stadium':       { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'SoFi Stadium':          { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Rose Bowl':             { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Arrowhead Stadium':     { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'NRG Stadium':           { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Lincoln Financial Field': { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Caesars Superdome':     { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Hard Rock Stadium':     { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  "Levi's Stadium":        { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
  'Levis Stadium':         { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US' },
};

/** Looks up host country by venue name first, then falls back to city. */
export function getVenueCountry(venueName: string, city: string): HostCountry | null {
  return VENUE_HOST_COUNTRY[venueName] ?? CITY_HOST_COUNTRY[city] ?? null;
}
