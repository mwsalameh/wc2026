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
  'Dallas': 'دالاس',
  'Boston': 'بوسطن',
  'Atlanta': 'أتلانتا',
  'Seattle': 'سياتل',
  'New York': 'نيويورك',
  'East Rutherford': 'إيست رذرفورد',
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
};

export function getVenueNameAr(name: string): string {
  return VENUE_NAMES_AR[name] ?? name;
}

export function getCityNameAr(city: string): string {
  return CITY_NAMES_AR[city] ?? city;
}
