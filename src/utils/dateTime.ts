import { isToday, isTomorrow, isYesterday, format } from 'date-fns';
import { ar as arLocale } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import * as Localization from 'expo-localization';

const getDeviceTimezone = (): string =>
  Localization.getCalendars()[0]?.timeZone ?? 'UTC';

export const formatMatchTime = (utcDateString: string): string => {
  const tz = getDeviceTimezone();
  return formatInTimeZone(new Date(utcDateString), tz, 'HH:mm');
};

interface DateLabels {
  today?: string;
  tomorrow?: string;
  yesterday?: string;
  language?: string;
}

// Pattern helpers — Arabic uses day-first order and Arabic comma (،)
const dayDatePattern = (isAr: boolean) =>
  isAr ? "EEEE'، 'd MMMM" : 'EEEE, MMM d';

const dayDateFullPattern = (isAr: boolean) =>
  isAr ? "EEEE'، 'd MMMM" : 'EEEE, MMMM d';

export const formatMatchDate = (utcDateString: string, labels?: DateLabels): string => {
  const tz = getDeviceTimezone();
  const date = new Date(utcDateString);
  const isAr = labels?.language === 'ar';
  const locale = isAr ? arLocale : undefined;
  if (isToday(date)) return labels?.today ?? 'Today';
  if (isTomorrow(date)) return labels?.tomorrow ?? 'Tomorrow';
  if (isYesterday(date)) return labels?.yesterday ?? 'Yesterday';
  return formatInTimeZone(date, tz, dayDatePattern(isAr), { locale });
};

export const formatMatchDateTime = (utcDateString: string, labels?: DateLabels): string => {
  const tz = getDeviceTimezone();
  const date = new Date(utcDateString);
  const isAr = labels?.language === 'ar';
  const locale = isAr ? arLocale : undefined;
  const todayLabel = labels?.today ?? 'Today';
  const tomorrowLabel = labels?.tomorrow ?? 'Tomorrow';
  if (isToday(date)) return `${todayLabel} • ${formatInTimeZone(date, tz, 'HH:mm')}`;
  if (isTomorrow(date)) return `${tomorrowLabel} • ${formatInTimeZone(date, tz, 'HH:mm')}`;
  const day = formatInTimeZone(date, tz, dayDatePattern(isAr), { locale });
  return `${day} • ${formatInTimeZone(date, tz, 'HH:mm')}`;
};

export const formatKickoffFull = (utcDateString: string, language?: string): string => {
  const tz = getDeviceTimezone();
  const isAr = language === 'ar';
  const locale = isAr ? arLocale : undefined;
  const day = formatInTimeZone(new Date(utcDateString), tz, dayDatePattern(isAr), { locale });
  const time = formatInTimeZone(new Date(utcDateString), tz, 'HH:mm');
  return `${day} • ${time}`;
};

// For a yyyy-MM-dd string (home screen section headers and calendar button).
// Uses full month name in English to match "Wednesday, June 17" style.
export const formatDateWithWeekday = (dateStr: string, language?: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  const isAr = language === 'ar';
  const locale = isAr ? arLocale : undefined;
  return format(date, dayDateFullPattern(isAr), { locale });
};

export const getTimezoneAbbr = (): string => {
  const tz = getDeviceTimezone();
  return formatInTimeZone(new Date(), tz, 'zzz');
};
