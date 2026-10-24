import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useAppStore } from '../../state/AppProvider';
import { useNativeTheme } from '../../theme/ThemeProvider';

function previewLabel(body: string): string {
  const preview = body.trim();
  return preview.length > 120 ? preview.slice(0, 117).trimEnd() + '…' : preview;
}

function formatDate(dateKey: string): string {
  const date = new Date(dateKey + 'T12:00:00');
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function JournalScreen({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const router = useRouter();
  const { data } = useAppStore();
  const { tokens } = useNativeTheme();
  const entries = useMemo(() => [...data.journalEntries].sort((left, right) => right.createdAt.localeCompare(left.createdAt)), [data.journalEntries]);
  const navigate = (route: string) => onNavigate ? onNavigate(route) : router.push(route as Href);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: tokens.background }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}><Text style={[styles.eyebrow, { color: tokens.journal }]}>JOURNAL · A QUIET SPACE</Text><Text style={[styles.title, { color: tokens.text }]}>Your words, kept gently.</Text><Text style={[styles.subtitle, { color: tokens.mutedText }]}>A place to notice what’s here without needing to fix it.</Text></View>
        <Pressable onPress={() => navigate('/journal/compose')} accessibilityRole="button" accessibilityLabel="Write a reflection" style={[styles.writeButton, { backgroundColor: tokens.journal }]}><Text style={[styles.writeText, { color: tokens.primaryText }]}>＋</Text></Pressable>
      </View>
      {entries.length ? (
        <View style={styles.list}>
          {entries.map((entry) => (
            <Pressable key={entry.id} onPress={() => navigate('/journal/entry/' + encodeURIComponent(entry.id))} accessibilityRole="button" accessibilityLabel={'Journal reflection: ' + previewLabel(entry.body)} style={[styles.entry, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
              <View style={[styles.accent, { backgroundColor: tokens.journal }]} />
              <View style={styles.entryCopy}>
                <Text style={[styles.date, { color: tokens.journal }]}>{formatDate(entry.dateKey)}</Text>
                {entry.prompt ? <Text numberOfLines={1} style={[styles.prompt, { color: tokens.mutedText }]}>{entry.prompt}</Text> : null}
                <Text numberOfLines={3} style={[styles.body, { color: tokens.text }]}>{entry.body}</Text>
              </View>
              <Text style={[styles.arrow, { color: tokens.journal }]} accessibilityElementsHidden>›</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={[styles.empty, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <View style={[styles.emptyMark, { backgroundColor: tokens.surfaceAlt }]}><Text style={[styles.emptyIcon, { color: tokens.journal }]} accessibilityElementsHidden>✎</Text></View>
          <Text style={[styles.emptyTitle, { color: tokens.text }]}>You can start with one honest sentence.</Text>
          <Text style={[styles.emptyText, { color: tokens.mutedText }]}>Your reflections stay on this iPhone. There’s no need to write every day.</Text>
          <Pressable onPress={() => navigate('/journal/compose')} accessibilityRole="button" accessibilityLabel="Write your first reflection" style={[styles.writeCta, { backgroundColor: tokens.journal }]}><Text style={[styles.writeCtaText, { color: tokens.primaryText }]}>Write a reflection</Text></Pressable>
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 36, gap: 20 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerCopy: { flex: 1, gap: 5 }, eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }, title: { fontSize: 26, lineHeight: 33, fontWeight: '700' }, subtitle: { fontSize: 14, lineHeight: 21 }, writeButton: { width: 47, height: 47, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, writeText: { fontSize: 26, lineHeight: 30 },
  list: { gap: 10 }, entry: { minHeight: 96, borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'stretch', gap: 12 }, accent: { width: 4, borderRadius: 3 }, entryCopy: { flex: 1, gap: 5 }, date: { fontSize: 11, fontWeight: '800' }, prompt: { fontSize: 12, lineHeight: 17 }, body: { fontSize: 15, lineHeight: 21 }, arrow: { fontSize: 25, alignSelf: 'center' },
  empty: { borderWidth: 1, borderRadius: 22, padding: 20, gap: 12 }, emptyMark: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, emptyIcon: { fontSize: 24 }, emptyTitle: { fontSize: 19, lineHeight: 25, fontWeight: '700' }, emptyText: { fontSize: 14, lineHeight: 21 }, writeCta: { minHeight: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 18, marginTop: 4 }, writeCtaText: { fontSize: 14, fontWeight: '700' },
});
