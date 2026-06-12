import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { colors, fontFamily, radius } from '@/constants/theme';
import { WC_2026 } from '@/constants/tournament';
import { useLanguageStore } from '@/store/languageStore';

LocaleConfig.locales['ar'] = {
  monthNames: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  monthNamesShort: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  dayNames: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
  dayNamesShort: ['أح','إث','ثل','أر','خم','جم','سب'],
  today: 'اليوم',
};

LocaleConfig.locales['en'] = {
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  today: 'Today',
};

interface Props {
  selectedDate: string | null;
  matchDates: Set<string>;
  onSelectDate: (date: string) => void;
}

export function MatchCalendar({ selectedDate, matchDates, onSelectDate }: Props) {
  const { language } = useLanguageStore();
  LocaleConfig.defaultLocale = language;

  const markedDates = useMemo(() => {
    const result: Record<string, object> = {};

    matchDates.forEach((d) => {
      result[d] = { marked: true, dotColor: colors.gold };
    });

    if (selectedDate) {
      result[selectedDate] = {
        ...(result[selectedDate] ?? {}),
        selected: true,
        selectedColor: colors.gold,
        selectedTextColor: colors.background,
      };
    }

    return result;
  }, [matchDates, selectedDate]);

  return (
    <Calendar
      key={language}
      minDate={WC_2026.START_DATE}
      maxDate={WC_2026.END_DATE}
      onDayPress={(day: DateData) => onSelectDate(day.dateString)}
      markedDates={markedDates}
      enableSwipeMonths
      style={styles.calendar}
      theme={{
        backgroundColor: colors.surface,
        calendarBackground: colors.surface,
        textSectionTitleColor: colors.textMuted,
        selectedDayBackgroundColor: colors.gold,
        selectedDayTextColor: colors.background,
        todayTextColor: colors.gold,
        dayTextColor: colors.textPrimary,
        textDisabledColor: colors.border,
        dotColor: colors.gold,
        selectedDotColor: colors.background,
        arrowColor: colors.gold,
        disabledArrowColor: colors.border,
        monthTextColor: colors.textPrimary,
        textDayFontFamily: fontFamily.bodyRegular,
        textMonthFontFamily: fontFamily.bodySemiBold,
        textDayHeaderFontFamily: fontFamily.bodyMedium,
        textDayFontSize: 14,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 12,
      }}
    />
  );
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
