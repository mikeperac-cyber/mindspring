import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useAppStore } from '../state/AppProvider';
import { useNativeTheme } from '../theme/ThemeProvider';
import { clearAddDraft, getAddDraft, getSelectedAddKind, setAddDraft, setSelectedAddKind, type AddKind } from './addDraft';

export function AddSheet({
  onNavigate,
  onClose,
}: {
  onNavigate?: (route: string) => void;
  onClose?: () => void;
}) {
  const router = useRouter();
  const { addGoal, addHabit } = useAppStore();
  const { tokens } = useNativeTheme();
  const [kind, setKind] = useState<AddKind | null>(getSelectedAddKind());
  const [value, setValue] = useState(() => kind ? getAddDraft(kind) : '');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const choose = (next: AddKind) => {
    setSelectedAddKind(next);
    setKind(next);
    setValue(getAddDraft(next));
    setError('');
    setNotice('');
  };
  const navigate = (route: string) => onNavigate ? onNavigate(route) : router.push(route as Href);
  const close = () => onClose ? onClose() : router.back();
  const changeValue = (next: string) => {
    if (kind) setAddDraft(kind, next);
    setValue(next);
    setError('');
    setNotice('');
  };
  const save = async () => {
    if (!kind) return;
    const clean = value.trim();
    if (!clean) {
      setError(kind === 'habit' ? 'Enter a name for this habit.' : 'Enter a name for this goal.');
      setNotice('');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = kind === 'habit' ? await addHabit(clean) : await addGoal(clean);
      if (!saved) throw new Error('The item could not be saved.');
      clearAddDraft(kind);
      setValue('');
      setNotice(kind === 'habit' ? 'Your habit is ready for today.' : 'Your goal has been added.');
    } catch {
      setError('This could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={[styles.page, { backgroundColor: tokens.background }]}>
      <View style={styles.grabber} accessibilityElementsHidden />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: tokens.primary }]}>A SMALL STEP</Text>
          <Text style={[styles.title, { color: tokens.text }]}>What would feel helpful?</Text>
          <Text style={[styles.subtitle, { color: tokens.mutedText }]}>Keep it simple. You can change it whenever you need.</Text>
        </View>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close add sheet" style={[styles.close, { backgroundColor: tokens.surfaceAlt }]}>
          <Text style={[styles.closeText, { color: tokens.text }]}>×</Text>
        </Pressable>
      </View>

      <View style={styles.options}>
        <Pressable onPress={() => choose('goal')} accessibilityRole="button" accessibilityLabel="Add a goal" style={[styles.option, { backgroundColor: tokens.surface, borderColor: kind === 'goal' ? tokens.goals : tokens.border }]}>
          <View style={[styles.optionMark, { backgroundColor: tokens.surfaceAlt }]}><Text style={[styles.optionIcon, { color: tokens.goals }]}>◎</Text></View>
          <View style={styles.optionCopy}><Text style={[styles.optionTitle, { color: tokens.text }]}>Add a goal</Text><Text style={[styles.optionDescription, { color: tokens.mutedText }]}>Name something that matters to you.</Text></View>
          <Text style={[styles.arrow, { color: tokens.goals }]}>›</Text>
        </Pressable>
        <Pressable onPress={() => choose('habit')} accessibilityRole="button" accessibilityLabel="Add a habit" style={[styles.option, { backgroundColor: tokens.surface, borderColor: kind === 'habit' ? tokens.habits : tokens.border }]}>
          <View style={[styles.optionMark, { backgroundColor: tokens.surfaceAlt }]}><Text style={[styles.optionIcon, { color: tokens.habits }]}>✳</Text></View>
          <View style={styles.optionCopy}><Text style={[styles.optionTitle, { color: tokens.text }]}>Add a habit</Text><Text style={[styles.optionDescription, { color: tokens.mutedText }]}>Choose one tiny practice for your day.</Text></View>
          <Text style={[styles.arrow, { color: tokens.habits }]}>›</Text>
        </Pressable>
        <Pressable onPress={() => navigate('/journal/compose')} accessibilityRole="button" accessibilityLabel="Journal reflection" style={[styles.option, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <View style={[styles.optionMark, { backgroundColor: tokens.surfaceAlt }]}><Text style={[styles.optionIcon, { color: tokens.journal }]}>✎</Text></View>
          <View style={styles.optionCopy}><Text style={[styles.optionTitle, { color: tokens.text }]}>Journal reflection</Text><Text style={[styles.optionDescription, { color: tokens.mutedText }]}>Make space for a few honest words.</Text></View>
          <Text style={[styles.arrow, { color: tokens.journal }]}>›</Text>
        </Pressable>
      </View>

      {kind ? (
        <View style={[styles.form, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.formTitle, { color: tokens.text }]}>{kind === 'habit' ? 'Your daily practice' : 'A goal that matters'}</Text>
          <TextInput
            value={value}
            onChangeText={changeValue}
            accessibilityLabel={kind === 'habit' ? 'Habit name' : 'Goal name'}
            placeholder={kind === 'habit' ? 'e.g. Take a short walk' : 'e.g. Make more time to read'}
            placeholderTextColor={tokens.mutedText}
            returnKeyType="done"
            onSubmitEditing={() => { void save(); }}
            style={[styles.input, { color: tokens.text, backgroundColor: tokens.background, borderColor: tokens.border }]}
          />
          {error ? <Text accessibilityRole="alert" style={[styles.message, { color: tokens.danger }]}>{error}</Text> : null}
          {notice ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: tokens.success }]}>{notice}</Text> : null}
          <Pressable onPress={() => { void save(); }} disabled={saving} accessibilityRole="button" accessibilityLabel={kind === 'habit' ? 'Save habit' : 'Save goal'} style={[styles.save, { backgroundColor: kind === 'habit' ? tokens.habits : tokens.goals }, saving && styles.disabled]}>
            <Text style={[styles.saveText, { color: tokens.primaryText }]}>{saving ? 'Saving…' : kind === 'habit' ? 'Save habit' : 'Save goal'}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30, gap: 18 },
  grabber: { width: 38, height: 5, borderRadius: 3, backgroundColor: '#C7BCC5', alignSelf: 'center', marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerCopy: { flex: 1, gap: 5 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  close: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 26, lineHeight: 30 },
  options: { gap: 10 },
  option: { minHeight: 76, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 18, padding: 13, gap: 12 },
  optionMark: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  optionIcon: { fontSize: 22, fontWeight: '700' },
  optionCopy: { flex: 1, gap: 4 },
  optionTitle: { fontSize: 15, fontWeight: '700' },
  optionDescription: { fontSize: 12, lineHeight: 17 },
  arrow: { fontSize: 25, lineHeight: 28 },
  form: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  formTitle: { fontSize: 17, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, fontSize: 15 },
  message: { fontSize: 14, lineHeight: 19 },
  save: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  saveText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
