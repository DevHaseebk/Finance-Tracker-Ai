import { Platform } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

interface OpenAndroidDatePickerOptions {
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (date: Date) => void;
}

/**
 * Opens Android's native date dialog imperatively. No-op on iOS/web — iOS
 * renders <DateTimePicker> inline via NativeDateSheet instead, and the
 * library's own platform fallback makes this a harmless no-op on web.
 */
export function openAndroidDatePicker({
  value,
  minimumDate,
  maximumDate,
  onChange,
}: OpenAndroidDatePickerOptions) {
  if (Platform.OS !== 'android') return;

  DateTimePickerAndroid.open({
    value,
    mode: 'date',
    minimumDate,
    maximumDate,
    onChange: (event, selected) => {
      if (event.type === 'set' && selected) onChange(selected);
    },
  });
}
