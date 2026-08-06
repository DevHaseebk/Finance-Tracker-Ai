import { View, StyleSheet } from 'react-native';
import FrequencyPicker from './FrequencyPicker';
import DayOfWeekPicker from './DayOfWeekPicker';
import DayOfMonthPicker from './DayOfMonthPicker';
import EndDatePickerField from './EndDatePickerField';
import { spacing } from '../lib/theme';
import type { RecurringFrequency } from '../types';

interface RecurrenceFieldsProps {
  frequency: RecurringFrequency;
  onFrequencyChange: (f: RecurringFrequency) => void;
  dayOfWeek: number;
  onDayOfWeekChange: (d: number) => void;
  dayOfMonth: number;
  onDayOfMonthChange: (d: number) => void;
  endDate: Date | null;
  onEndDateChange: (d: Date | null) => void;
  /** The rule's start date — the end date picker can't go earlier than this. */
  startDate: Date;
}

/**
 * Frequency + the day picker that matches it (day-of-week chips for weekly,
 * a 1-31 grid for monthly, nothing for daily) + the optional end date.
 * Shared between the Add Transaction screen's recurring toggle and the
 * Recurring Transactions edit form so both stay in sync automatically.
 */
export default function RecurrenceFields({
  frequency,
  onFrequencyChange,
  dayOfWeek,
  onDayOfWeekChange,
  dayOfMonth,
  onDayOfMonthChange,
  endDate,
  onEndDateChange,
  startDate,
}: RecurrenceFieldsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <FrequencyPicker value={frequency} onChange={onFrequencyChange} />
      </View>

      {frequency === 'weekly' ? (
        <View style={styles.section}>
          <DayOfWeekPicker value={dayOfWeek} onChange={onDayOfWeekChange} />
        </View>
      ) : null}

      {frequency === 'monthly' ? (
        <View style={styles.section}>
          <DayOfMonthPicker value={dayOfMonth} onChange={onDayOfMonthChange} />
        </View>
      ) : null}

      <View style={styles.section}>
        <EndDatePickerField value={endDate} onChange={onEndDateChange} minimumDate={startDate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  section: {
    marginBottom: spacing.lg,
  },
});
