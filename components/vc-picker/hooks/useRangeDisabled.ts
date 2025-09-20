import type { RangeValue, PickerMode, Locale } from '../interface';
import { getValue } from '../utils/miscUtil';
import type { GenerateConfig } from '../generate';
import { isSameDate, getQuarter } from '../utils/dateUtil';
import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

export default function useRangeDisabled<DateType>(
  {
    picker,
    locale,
    selectedValue,
    disabledDate,
    disabled,
    generateConfig,
  }: {
    picker: Ref<PickerMode>;
    selectedValue: Ref<RangeValue<DateType>>;
    disabledDate?: Ref<(date: DateType) => boolean>;
    disabled: ComputedRef<[boolean, boolean]>;
    locale: Ref<Locale>;
    generateConfig: Ref<GenerateConfig<DateType>>;
  },
  openRecordsRef: Ref<{
    [x: number]: boolean;
  }>,
) {
  const startDate = computed(() => getValue(selectedValue.value, 0));
  const endDate = computed(() => getValue(selectedValue.value, 1));

  function weekFirstDate(date: DateType) {
    return generateConfig.value.locale.getWeekFirstDate(locale.value.locale, date);
  }

  function monthNumber(date: DateType) {
    const year = generateConfig.value.getYear(date);
    const month = generateConfig.value.getMonth(date);
    return year * 100 + month;
  }

  function quarterNumber(date: DateType) {
    const year = generateConfig.value.getYear(date);
    const quarter = getQuarter(generateConfig.value, date);
    return year * 10 + quarter;
  }

  const disabledStartDate = (date: DateType) => {
    if (disabledDate && disabledDate?.value?.(date)) {
      return true;
    }

    // Disabled range
    if (disabled[1] && endDate) {
      return (
        !isSameDate(generateConfig.value, date, endDate.value as DateType) &&
        generateConfig.value.isAfter(date, endDate.value as DateType)
      );
    }

    // Disabled part
    if (openRecordsRef.value[1] && endDate.value) {
      switch (picker.value) {
        case 'quarter':
          return quarterNumber(date) > quarterNumber(endDate.value as DateType);
        case 'month':
          return monthNumber(date) > monthNumber(endDate.value as DateType);
        case 'week':
          return weekFirstDate(date) > weekFirstDate(endDate.value as DateType);
        default:
          return (
            !isSameDate(generateConfig.value, date, endDate.value as DateType) &&
            generateConfig.value.isAfter(date, endDate.value as DateType)
          );
      }
    }

    return false;
  };

  const disabledEndDate = (date: DateType) => {
    if (disabledDate.value?.(date)) {
      return true;
    }

    // Disabled range
    if (disabled[0] && startDate) {
      return (
        !isSameDate(generateConfig.value, date, endDate.value as DateType) &&
        generateConfig.value.isAfter(startDate.value as DateType, date)
      );
    }

    // Disabled part
    if (openRecordsRef.value[0] && startDate.value) {
      switch (picker.value) {
        case 'quarter':
          return quarterNumber(date) < quarterNumber(startDate.value as DateType);
        case 'month':
          return monthNumber(date) < monthNumber(startDate.value as DateType);
        case 'week':
          return weekFirstDate(date) < weekFirstDate(startDate.value as DateType);
        default:
          return (
            !isSameDate(generateConfig.value, date, startDate.value as DateType) &&
            generateConfig.value.isAfter(startDate.value as DateType, date)
          );
      }
    }

    return false;
  };

  return [disabledStartDate, disabledEndDate];
}
