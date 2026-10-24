import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useAppStore } from '../../state/AppProvider';
import { useNativeTheme } from '../../theme/ThemeProvider';

export function GoalsScreen({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const router = useRouter();
  const { data, addGoal, toggleGoal } = useAppStore();
  const { tokens } = useNativeTheme();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = (route: string) => onNavigate ? onNavigate(route) : router.push(route as Href);

  const save = async () => {
    if (!title.trim()) {
      setError('Enter a name for this goal.');
      setNotice('');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = await addGoal(title);
      if (!saved) throw new Error('Goal save failed.');
      setTitle('');
      setShowForm(false);
      setNotice('Your goal has been added.');
    } catch {
      setError('This goal could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const completed = data.goals.filter((goal) => goal.completed).length;
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: tokens.background }]} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: tokens.goals }]}>GOALS · YOUR DIRECTION</Text>
          <Text style={[styles.title, { color: tokens.text }]}>Make room for what matters.</Text>
          <Text style={[styles.subtitle, { color: tokens.mutedText }]}>Small, meaningful intentions can guide your next step.</Text>
        </View>
        <View style={[styles.count, { backgroundColor: tokens.surfaceAlt }]}><Text style={[styles.countText, { color: tokens.goals }]}>{completed}/{data.goals.length}</Text><Text style={[styles.countLabel, { color: tokens.mutedText }]}>complete</Text></View>
      </View>

      {notice ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: tokens.success }]}>{notice}</Text> : null}
      {data.goals.length ? (
        <View style={styles.list}>
          {data.goals.map((goal) => (
            <Pressable key={goal.id} onPress={() => { void toggleGoal(goal.id); }} accessibilityRole="checkbox" accessibilityState={{ checked: goal.completed }} accessibilityLabel={(goal.completed ? 'Reopen ' : 'Complete ') + goal.title} style={[styles.goal, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
              <View style={[styles.check, { borderColor: tokens.goals, backgroundColor: goal.completed ? tokens.goals : tokens.surface }]} accessibilityElementsHidden>{goal.completed ? <Text style={[styles.checkText, { color: tokens.primaryText }]}>✓</Text> : null}</View>
              <View style={styles.goalCopy}><Text style={[styles.goalTitle, { color: tokens.text }]}>{goal.title}</Text><Text style={[styles.goalStatus, { color: goal.completed ? tokens.success : tokens.mutedText }]}>{goal.completed ? 'Completed at your pace' : 'One step at a time'}</Text></View>
              <Text style={[styles.goalArrow, { color: tokens.goals }]} accessibilityElementsHidden>›</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={[styles.empty, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <View style={[styles.emptyMark, { backgroundColor: tokens.surfaceAlt }]}><Text style={[styles.emptyMarkText, { color: tokens.goals }]} accessibilityElementsHidden>◎</Text></View>
          <Text style={[styles.emptyTitle, { color: tokens.text }]}>Start with something that matters.</Text>
          <Text style={[styles.emptyCopy, { color: tokens.mutedText }]}>A goal is a direction, not a deadline. Choose one that feels kind and possible.</Text>
          <Pressable onPress={() => setShowForm(true)} accessibilityRole="button" accessibilityLabel="Create a goal" style={[styles.primaryButton, { backgroundColor: tokens.goals }]}><Text style={[styles.primaryText, { color: tokens.primaryText }]}>Create a goal</Text></Pressable>
        </View>
      )}

      {showForm ? (
        <View style={[styles.form, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.formTitle, { color: tokens.text }]}>What would you like to work toward?</Text>
          <TextInput value={title} onChangeText={(value) => { setTitle(value); setError(''); }} accessibilityLabel="Goal name" placeholder="e.g. Read for 10 minutes" placeholderTextColor={tokens.mutedText} returnKeyType="done" onSubmitEditing={() => { void save(); }} style={[styles.input, { color: tokens.text, backgroundColor: tokens.background, borderColor: tokens.border }]} />
          {error ? <Text accessibilityRole="alert" style={[styles.message, { color: tokens.danger }]}>{error}</Text> : null}
          <View style={styles.formActions}>
            <Pressable onPress={() => { setShowForm(false); setError(''); }} accessibilityRole="button" style={[styles.cancelButton, { borderColor: tokens.border }]}><Text style={[styles.cancelText, { color: tokens.text }]}>Cancel</Text></Pressable>
            <Pressable onPress={() => { void save(); }} disabled={saving} accessibilityRole="button" accessibilityLabel="Save goal" style={[styles.primaryButton, { backgroundColor: tokens.goals }, saving && styles.disabled]}><Text style={[styles.primaryText, { color: tokens.primaryText }]}>{saving ? 'Saving…' : 'Save goal'}</Text></Pressable>
          </View>
        </View>
      ) : null}
      {data.goals.length > 0 ? <Pressable onPress={() => setShowForm((value) => !value)} accessibilityRole="button" accessibilityLabel="Create a goal" style={[styles.outlineButton, { borderColor: tokens.goals }]}><Text style={[styles.outlineText, { color: tokens.goals }]}>{showForm ? 'Close goal form' : 'Add another goal'}</Text></Pressable> : null}
      {error && !showForm ? <Text accessibilityRole="alert" style={[styles.message, { color: tokens.danger }]}>{error}</Text> : null}
      <Pressable onPress={() => navigate('/add')} accessibilityRole="button" accessibilityLabel="Open quick add" style={styles.quickAdd}><Text style={[styles.quickAddText, { color: tokens.mutedText }]}>Need a habit or reflection instead? <Text style={{ color: tokens.goals, fontWeight: '700' }}>Open quick add</Text></Text></Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 36, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerCopy: { flex: 1, gap: 5 }, eyebrow: { fontSize: 10, letterSpacing: 1.1, fontWeight: '800' }, title: { fontSize: 26, lineHeight: 33, fontWeight: '700' }, subtitle: { fontSize: 14, lineHeight: 21 },
  count: { minWidth: 66, borderRadius: 17, paddingVertical: 10, paddingHorizontal: 9, alignItems: 'center', gap: 2 }, countText: { fontSize: 18, fontWeight: '800' }, countLabel: { fontSize: 10 },
  list: { gap: 10 }, goal: { minHeight: 78, borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, check: { width: 27, height: 27, borderWidth: 2, borderRadius: 9, justifyContent: 'center', alignItems: 'center' }, checkText: { fontSize: 14, fontWeight: '800' }, goalCopy: { flex: 1, gap: 5 }, goalTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700' }, goalStatus: { fontSize: 12 }, goalArrow: { fontSize: 25 },
  empty: { borderWidth: 1, borderRadius: 22, padding: 20, gap: 12 }, emptyMark: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }, emptyMarkText: { fontSize: 25 }, emptyTitle: { fontSize: 19, lineHeight: 25, fontWeight: '700' }, emptyCopy: { fontSize: 14, lineHeight: 21 },
  form: { borderWidth: 1, borderRadius: 19, padding: 16, gap: 12 }, formTitle: { fontSize: 16, fontWeight: '700' }, input: { minHeight: 50, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, fontSize: 15 }, formActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryButton: { minHeight: 46, borderRadius: 14, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' }, primaryText: { fontSize: 14, fontWeight: '700' }, cancelButton: { minHeight: 46, borderWidth: 1, borderRadius: 14, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' }, cancelText: { fontSize: 14, fontWeight: '600' }, outlineButton: { minHeight: 46, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' }, outlineText: { fontSize: 14, fontWeight: '700' }, message: { fontSize: 13, lineHeight: 18 }, quickAdd: { paddingVertical: 5 }, quickAddText: { fontSize: 13, lineHeight: 19 }, disabled: { opacity: 0.6 },
});
