import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DAILY_PROMPTS, getDailyPromptIndex } from '@mindspring/core';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../state/AppProvider';
import { useLocalToday } from '../../state/useLocalToday';
import { useNativeTheme } from '../../theme/ThemeProvider';
import { clearJournalDraft, getJournalDraft, setJournalDraft } from './journalDraft';

export function JournalComposer({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const { addJournalEntry } = useAppStore();
  const { tokens } = useNativeTheme();
  const today = useLocalToday();
  const prompt = DAILY_PROMPTS[getDailyPromptIndex(today)];
  const [body, setBody] = useState(getJournalDraft);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const changeBody = (value: string) => {
    setBody(value);
    setJournalDraft(value);
    setError('');
    setNotice('');
  };
  const save = async () => {
    if (!body.trim()) {
      setError('Write a few words before saving.');
      setNotice('');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = await addJournalEntry(body, prompt);
      if (!saved) throw new Error('The reflection could not be saved.');
      clearJournalDraft();
      setBody('');
      setNotice('Your reflection is saved. Thank you for taking a moment.');
    } catch {
      setError('Your reflection could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.header}>
          <Pressable onPress={onBack ?? (() => router.back())} accessibilityRole="button" accessibilityLabel="Back to journal" style={[styles.back, { backgroundColor: tokens.surfaceAlt }]}>
            <Text style={[styles.backText, { color: tokens.primary }]}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: tokens.journal }]}>JOURNAL · A QUIET PAUSE</Text>
            <Text style={[styles.title, { color: tokens.text }]}>A moment to notice</Text>
          </View>
        </View>
        <View style={[styles.prompt, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.journal }] }>
          <Text style={[styles.promptLabel, { color: tokens.journal }]}>TODAY’S PROMPT</Text>
          <Text style={[styles.promptText, { color: tokens.text }]}>{prompt}</Text>
        </View>
        <TextInput
          value={body}
          onChangeText={changeBody}
          accessibilityLabel="Reflection entry"
          placeholder="Start wherever you are. A few words are enough."
          placeholderTextColor={tokens.mutedText}
          multiline
          textAlignVertical="top"
          style={[styles.entry, { color: tokens.text, backgroundColor: tokens.surface, borderColor: tokens.border }]}
        />
        <Text style={[styles.privacy, { color: tokens.mutedText }]}>Your reflections stay on this iPhone.</Text>
        {error ? <Text accessibilityRole="alert" style={[styles.message, { color: tokens.danger }]}>{error}</Text> : null}
        {notice ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: tokens.success }]}>{notice}</Text> : null}
        <Pressable onPress={() => { void save(); }} disabled={saving} accessibilityRole="button" accessibilityLabel="Save reflection" style={[styles.save, { backgroundColor: tokens.journal }, saving && styles.disabled]}>
          <Text style={[styles.saveText, { color: tokens.primaryText }]}>{saving ? 'Saving…' : 'Save reflection'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 30, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  back: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 31, lineHeight: 36, marginTop: -2 },
  headerCopy: { flex: 1, gap: 5 },
  eyebrow: { fontSize: 10, letterSpacing: 1.1, fontWeight: '800' },
  title: { fontSize: 24, lineHeight: 31, fontWeight: '700' },
  prompt: { borderLeftWidth: 4, borderWidth: 1, borderRadius: 18, padding: 16, gap: 8 },
  promptLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  promptText: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  entry: { minHeight: 220, borderWidth: 1, borderRadius: 18, padding: 16, fontSize: 16, lineHeight: 24 },
  privacy: { fontSize: 12, lineHeight: 18 },
  message: { fontSize: 14, lineHeight: 20 },
  save: { minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  saveText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
