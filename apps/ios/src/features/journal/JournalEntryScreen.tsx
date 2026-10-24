import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useAppStore } from '../../state/AppProvider';
import { useNativeTheme } from '../../theme/ThemeProvider';

export function JournalEntryScreen({ id, onBack }: { id?: string; onBack?: () => void }) {
  const router = useRouter();
  const { data } = useAppStore();
  const { tokens } = useNativeTheme();
  const entry = data.journalEntries.find((item) => item.id === id);
  const back = () => onBack ? onBack() : router.back();
  const dateLabel = entry ? new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(entry.dateKey + 'T12:00:00')) : '';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: tokens.background }]}>
      <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back to journal" style={[styles.back, { backgroundColor: tokens.surfaceAlt }]}><Text style={[styles.backText, { color: tokens.journal }]}>‹</Text><Text style={[styles.backLabel, { color: tokens.journal }]}>Journal</Text></Pressable>
      {entry ? (
        <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.eyebrow, { color: tokens.journal }]}>A REFLECTION</Text>
          <Text style={[styles.date, { color: tokens.mutedText }]}>{dateLabel}</Text>
          {entry.prompt ? <Text style={[styles.prompt, { color: tokens.journal }]}>{entry.prompt}</Text> : null}
          <Text accessibilityLabel="Saved reflection" style={[styles.body, { color: tokens.text }]}>{entry.body}</Text>
          <Text style={[styles.privacy, { color: tokens.mutedText }]}>Saved only on this iPhone.</Text>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.eyebrow, { color: tokens.journal }]}>REFLECTION NOT FOUND</Text>
          <Text style={[styles.body, { color: tokens.text }]}>This reflection may have been removed from this iPhone.</Text>
          <Pressable onPress={() => router.replace('/(tabs)/journal' as Href)} accessibilityRole="button" style={[styles.openButton, { backgroundColor: tokens.journal }]}><Text style={[styles.openText, { color: tokens.primaryText }]}>Open journal</Text></Pressable>
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 32, gap: 16 }, back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, borderRadius: 14, gap: 6 }, backText: { fontSize: 28 }, backLabel: { fontSize: 14, fontWeight: '700' }, card: { borderWidth: 1, borderRadius: 21, padding: 20, gap: 14 }, eyebrow: { fontSize: 10, letterSpacing: 1.1, fontWeight: '800' }, date: { fontSize: 13 }, prompt: { borderLeftWidth: 3, paddingLeft: 12, fontSize: 16, lineHeight: 23, fontWeight: '600' }, body: { fontSize: 16, lineHeight: 26 }, privacy: { fontSize: 12, lineHeight: 18, marginTop: 10 }, openButton: { minHeight: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 16 }, openText: { fontSize: 14, fontWeight: '700' }, });
