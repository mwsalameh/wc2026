import { isToday, isTomorrow, isYesterday } from 'date-fns';
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

export const formatMatchDate = (utcDateString: string, labels?: DateLabels): string => {
  const tz = getDeviceTimezone();
  const date = new Date(utcDateString);
  const locale = labels?.language === 'ar' ? arLocale : undefined;
  if (isToday(date)) return labels?.today ?? 'Today';
  if (isTomorrow(date)) return labels?.tomorrow ?? 'Tomorrow';
  if (isYesterday(date)) return labels?.yesterday ?? 'Yesterday';
  return formatInTimeZone(date, tz, 'MMM d', { locale });
};

export const formatMatchDateTime = (utcDateString: string, labels?: DateLabels): string => {
  const tz = getDeviceTimezone();
  const date = new Date(utcDateString);
  const locale = labels?.language === 'ar' ? arLocale : undefined;
  const todayLabel = labels?.today ?? 'Today';
  const tomorrowLabel = labels?.tomorrow ?? 'Tomorrow';

  if (isToday(date)) return `${todayLabel} • ${formatInTimeZone(date, tz, 'HH:mm')}`;
  if (isTomorrow(date)) return `${tomorrowLabel} • ${formatInTimeZone(date, tz, 'HH:mm')}`;
  return formatInTimeZone(date, tz, 'MMM d • HH:mm', { locale });
};

export const formatKickoffFull = (utcDateString: string, language?: string): string => {
  const tz = getDeviceTimezone();
  const locale = language === 'ar' ? arLocale : undefined;
  return formatInTimeZone(new Date(utcDateString), tz, 'EEEE, MMM d • HH:mm', { locale });
};

export const getTimezoneAbbr = (): string => {
  const tz = getDeviceTimezone();
  return formatInTimeZone(new Date(), tz, 'zzz');
};
