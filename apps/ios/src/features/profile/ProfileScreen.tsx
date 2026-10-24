import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useAppStore } from '../../state/AppProvider';
import { ThemePicker } from '../../components/ThemePicker';
import { useNativeTheme } from '../../theme/ThemeProvider';
import type { ThemeId } from '@mindspring/core';

export function ProfileScreen({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const router = useRouter();
  const { data, theme, updateProfile, setTheme, clearData } = useAppStore();
  const { appearance, tokens } = useNativeTheme();
  const [displayName, setDisplayName] = useState(data.profile?.displayName ?? '');
  const [intention, setIntention] = useState(data.profile?.intention ?? '');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    setDisplayName(data.profile?.displayName ?? '');
    setIntention(data.profile?.intention ?? '');
  }, [data.profile?.displayName, data.profile?.intention]);

  const saveProfile = async () => {
    if (!displayName.trim() || !intention.trim()) {
      setError('Add both your name and intention to save your profile.');
      setNotice('');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = await updateProfile({ displayName, intention });
      if (!saved) throw new Error('Profile could not be saved.');
      setNotice('Your profile is saved on this iPhone.');
    } catch {
      setError('Your profile could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const chooseTheme = async (nextTheme: ThemeId) => {
    setSavingTheme(true);
    setNotice('');
    await setTheme(nextTheme);
    setNotice('Your ' + nextTheme + ' theme is selected.');
    setSavingTheme(false);
  };

  const confirmDelete = async () => {
    await clearData();
    setConfirmClear(false);
    if (onNavigate) onNavigate('/welcome');
    else router.replace('/welcome' as Href);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: tokens.background }]} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <Text style={[styles.eyebrow, { color: tokens.primary }]}>PROFILE · YOUR SPACE</Text>
      <Text style={[styles.title, { color: tokens.text }]}>Make this space feel like yours.</Text>
      <Text style={[styles.subtitle, { color: tokens.mutedText }]}>Your name and intention help MINDSPRING greet you in a familiar way.</Text>

      <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <Text style={[styles.cardTitle, { color: tokens.text }]}>Your profile</Text>
        <Text style={[styles.fieldLabel, { color: tokens.text }]}>Display name</Text>
        <TextInput value={displayName} onChangeText={(value) => { setDisplayName(value); setError(''); }} accessibilityLabel="Display name" placeholder="Your name" placeholderTextColor={tokens.mutedText} style={[styles.input, { color: tokens.text, backgroundColor: tokens.background, borderColor: tokens.border }]} />
        <Text style={[styles.fieldLabel, { color: tokens.text }]}>My intention</Text>
        <TextInput value={intention} onChangeText={(value) => { setIntention(value); setError(''); }} accessibilityLabel="My intention" placeholder="What would you like more of?" placeholderTextColor={tokens.mutedText} multiline textAlignVertical="top" style={[styles.input, styles.intentionInput, { color: tokens.text, backgroundColor: tokens.background, borderColor: tokens.border }]} />
        {error ? <Text accessibilityRole="alert" style={[styles.message, { color: tokens.danger }]}>{error}</Text> : null}
        {notice ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: tokens.success }]}>{notice}</Text> : null}
        <Pressable onPress={() => { void saveProfile(); }} disabled={saving} accessibilityRole="button" accessibilityLabel="Save profile" style={[styles.primaryButton, { backgroundColor: tokens.primary }, saving && styles.disabled]}><Text style={[styles.primaryText, { color: tokens.primaryText }]}>{saving ? 'Saving…' : 'Save profile'}</Text></Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <View style={styles.themeHeading}><View style={styles.themeCopy}><Text style={[styles.cardTitle, { color: tokens.text }]}>Color theme</Text><Text style={[styles.cardSubtitle, { color: tokens.mutedText }]}>Feature colors stay distinct within each palette.</Text></View>{savingTheme ? <Text style={[styles.themeSaving, { color: tokens.mutedText }]}>Saving…</Text> : null}</View>
        <ThemePicker onSelect={(nextTheme) => { void chooseTheme(nextTheme); }} />
        <Text accessibilityLiveRegion="polite" style={[styles.appearance, { color: tokens.mutedText }]}>Appearance follows your iPhone settings · currently {appearance} mode.</Text>
        <Text style={[styles.currentTheme, { color: tokens.primary }]}>Selected theme: {theme[0].toUpperCase() + theme.slice(1)}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <Text style={[styles.cardTitle, { color: tokens.text }]}>Your data</Text>
        <Text style={[styles.privacy, { color: tokens.mutedText }]}>Your MINDSPRING data is stored on this iPhone using local app storage. This app does not encrypt it, sync it, or back it up to an account.</Text>
        {!confirmClear ? (
          <Pressable onPress={() => setConfirmClear(true)} accessibilityRole="button" accessibilityLabel="Clear local data" style={[styles.clearButton, { borderColor: tokens.danger }]}><Text style={[styles.clearText, { color: tokens.danger }]}>Clear local data</Text></Pressable>
        ) : (
          <View accessibilityViewIsModal style={[styles.confirmBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.danger }]}>
            <Text style={[styles.confirmTitle, { color: tokens.text }]}>Clear this iPhone’s MINDSPRING data?</Text>
            <Text style={[styles.confirmCopy, { color: tokens.mutedText }]}>This removes your profile, goals, habits, check-ins, reflections, and selected theme from this iPhone.</Text>
            <View style={styles.confirmActions}>
              <Pressable onPress={() => setConfirmClear(false)} accessibilityRole="button" style={[styles.cancelButton, { borderColor: tokens.border }]}><Text style={[styles.cancelText, { color: tokens.text }]}>Cancel</Text></Pressable>
              <Pressable onPress={() => { void confirmDelete(); }} accessibilityRole="button" accessibilityLabel="Delete everything" style={[styles.deleteButton, { backgroundColor: tokens.danger }]}><Text style={[styles.deleteText, { color: tokens.primaryText }]}>Delete everything</Text></Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 36, gap: 15 }, eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }, title: { fontSize: 26, lineHeight: 33, fontWeight: '700' }, subtitle: { fontSize: 14, lineHeight: 21, marginTop: -9 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 11 }, cardTitle: { fontSize: 17, fontWeight: '700' }, cardSubtitle: { fontSize: 12, lineHeight: 17 }, fieldLabel: { fontSize: 13, fontWeight: '700', marginTop: 2 }, input: { minHeight: 48, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11, fontSize: 15 }, intentionInput: { minHeight: 86 }, message: { fontSize: 13, lineHeight: 19 }, primaryButton: { minHeight: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, alignSelf: 'flex-start' }, primaryText: { fontSize: 14, fontWeight: '700' }, disabled: { opacity: 0.6 },
  themeHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 }, themeCopy: { flex: 1, gap: 4 }, themeSaving: { fontSize: 12 }, appearance: { fontSize: 12, lineHeight: 18 }, currentTheme: { fontSize: 12, fontWeight: '700' }, privacy: { fontSize: 13, lineHeight: 20 }, clearButton: { minHeight: 44, borderWidth: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: 15 }, clearText: { fontSize: 14, fontWeight: '700' },
  confirmBox: { borderWidth: 1, borderRadius: 17, padding: 14, gap: 10 }, confirmTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700' }, confirmCopy: { fontSize: 13, lineHeight: 19 }, confirmActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 3 }, cancelButton: { minHeight: 44, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15 }, cancelText: { fontSize: 13, fontWeight: '600' }, deleteButton: { minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 }, deleteText: { fontSize: 13, fontWeight: '700' },
});
