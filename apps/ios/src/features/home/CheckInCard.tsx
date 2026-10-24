import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type LayoutChangeEvent } from 'react-native';
import type { DailyCheckIn, Mood } from '@mindspring/core';
import { useAppStore } from '../../state/AppProvider';
import { useNativeTheme } from '../../theme/ThemeProvider';

const moodChoices: { value: Mood; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'steady', label: 'Steady' },
  { value: 'bright', label: 'Bright' },
];

export function CheckInCard({
  dateKey,
  checkIn,
  onLayout,
}: {
  dateKey: string;
  checkIn?: DailyCheckIn;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const { saveCheckIn } = useAppStore();
  const { tokens } = useNativeTheme();
  const [mood, setMood] = useState<Mood | null>(checkIn?.mood ?? null);
  const [energy, setEnergy] = useState<number>(checkIn?.energy ?? 3);
  const [note, setNote] = useState(checkIn?.note ?? '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMood(checkIn?.mood ?? null);
    setEnergy(checkIn?.energy ?? 3);
    setNote(checkIn?.note ?? '');
  }, [dateKey, checkIn?.dateKey, checkIn?.mood, checkIn?.energy, checkIn?.note]);

  const save = async () => {
    if (!mood) {
      setError('Choose a mood to save your check-in.');
      setMessage('');
      return;
    }
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const saved = await saveCheckIn({ dateKey, mood, energy: energy as 1 | 2 | 3 | 4 | 5, note });
      if (!saved) throw new Error('The check-in could not be saved.');
      setMessage('Your check-in is saved for today.');
    } catch {
      setError('Your check-in could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      onLayout={onLayout}
      style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
    >
      <View style={styles.heading}>
        <View style={[styles.icon, { backgroundColor: tokens.surfaceAlt }]}>
          <Text style={[styles.iconText, { color: tokens.primary }]} accessibilityElementsHidden>○</Text>
        </View>
        <View style={styles.headingCopy}>
          <Text style={[styles.title, { color: tokens.text }]}>Daily check-in</Text>
          <Text style={[styles.subtitle, { color: tokens.mutedText }]}>How are you arriving today?</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: tokens.text }]}>Mood</Text>
      <View style={styles.choiceRow}>
        {moodChoices.map((choice) => {
          const selected = mood === choice.value;
          const moodColor = choice.value === 'low' ? tokens.journal : choice.value === 'steady' ? tokens.habits : tokens.insights;
          return (
            <Pressable
              key={choice.value}
              onPress={() => { setMood(choice.value); setError(''); }}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={'Mood: ' + choice.label}
              style={[
                styles.choice,
                {
                  backgroundColor: selected ? tokens.surfaceAlt : tokens.background,
                  borderColor: selected ? moodColor : tokens.border,
                },
              ]}
            >
              <Text style={[styles.choiceText, { color: selected ? moodColor : tokens.mutedText }]}>{choice.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.energyHeading}>
        <Text style={[styles.label, { color: tokens.text }]}>Energy</Text>
        <Text style={[styles.helper, { color: tokens.mutedText }]}>1 is very low · 5 is full</Text>
      </View>
      <View style={styles.choiceRow}>
        {[1, 2, 3, 4, 5].map((value) => {
          const selected = energy === value;
          return (
            <Pressable
              key={value}
              onPress={() => setEnergy(value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={'Energy ' + value + ' of 5'}
              style={[
                styles.energyChoice,
                {
                  backgroundColor: selected ? tokens.primary : tokens.background,
                  borderColor: selected ? tokens.primary : tokens.border,
                },
              ]}
            >
              <Text style={[styles.energyText, { color: selected ? tokens.primaryText : tokens.text }]}>{value}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={note}
        onChangeText={setNote}
        accessibilityLabel="Check-in note"
        placeholder="Anything else you want to note? (optional)"
        placeholderTextColor={tokens.mutedText}
        multiline
        textAlignVertical="top"
        style={[styles.note, { backgroundColor: tokens.background, borderColor: tokens.border, color: tokens.text }]}
      />

      {error ? <Text style={[styles.error, { color: tokens.danger }]} accessibilityRole="alert">{error}</Text> : null}
      {message ? <Text style={[styles.message, { color: tokens.success }]} accessibilityLiveRegion="polite">{message}</Text> : null}

      <Pressable
        onPress={save}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel={checkIn ? 'Update check-in' : 'Save check-in'}
        style={[styles.saveButton, { backgroundColor: tokens.primary }, saving && styles.disabled]}
      >
        <Text style={[styles.saveText, { color: tokens.primaryText }]}>{saving ? 'Saving…' : checkIn ? 'Update check-in' : 'Save check-in'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 22, padding: 20, gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 24, lineHeight: 28 },
  headingCopy: { flex: 1, gap: 2 },
  title: { fontSize: 19, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 15, fontWeight: '700' },
  helper: { fontSize: 13 },
  energyHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  choiceRow: { flexDirection: 'row', gap: 8 },
  choice: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 13 },
  choiceText: { fontSize: 14, fontWeight: '600' },
  energyChoice: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 13 },
  energyText: { fontSize: 15, fontWeight: '700' },
  note: { minHeight: 74, borderWidth: 1, borderRadius: 13, padding: 12, fontSize: 15 },
  error: { fontSize: 14, lineHeight: 20 },
  message: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  saveButton: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  saveText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});

