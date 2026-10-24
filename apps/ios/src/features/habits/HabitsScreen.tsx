import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { getLocalDateKey } from '@mindspring/core';
import { useAppStore } from '../../state/AppProvider';
import { useLocalToday } from '../../state/useLocalToday';
import { useNativeTheme } from '../../theme/ThemeProvider';

export function HabitsScreen({ today, onNavigate, onBack }: { today?: Date; onNavigate?: (route: string) => void; onBack?: () => void }) {
  const router = useRouter();
  const { data, toggleHabitToday } = useAppStore();
  const { tokens } = useNativeTheme();
  const liveTodayKey = useLocalToday();
  const dateKey = today ? getLocalDateKey(today) : liveTodayKey;
  const navigateToAdd = () => onNavigate ? onNavigate('/add') : router.push('/add' as Href);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={onBack ?? (() => router.back())} accessibilityRole="button" accessibilityLabel="Back to today" style={[styles.back, { backgroundColor: tokens.surfaceAlt }]}>
            <Text style={[styles.backText, { color: tokens.primary }]}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: tokens.habits }]}>HABITS · AT YOUR PACE</Text>
            <Text style={[styles.title, { color: tokens.text }]}>Small things, repeated gently.</Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: tokens.mutedText }]}>Choose what fits today. There is no streak to lose.</Text>

        {data.habits.length ? (
          <View style={styles.list}>
            {data.habits.map((habit) => {
              const complete = habit.completedDates.includes(dateKey);
              return (
                <Pressable
                  key={habit.id}
                  onPress={() => { void toggleHabitToday(habit.id, dateKey); }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: complete }}
                  accessibilityLabel={(complete ? 'Undo ' : 'Complete ') + habit.title + ' today'}
                  style={[styles.row, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
                >
                  <View style={[styles.checkMark, { borderColor: tokens.habits, backgroundColor: complete ? tokens.habits : tokens.surface }]} accessibilityElementsHidden>
                    {complete ? <Text style={[styles.checkText, { color: tokens.primaryText }]}>✓</Text> : null}
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.habitTitle, { color: tokens.text }]}>{habit.title}</Text>
                    <Text style={[styles.habitStatus, { color: tokens.mutedText }]}>{complete ? 'Done today' : 'Ready when you are'}</Text>
                  </View>
                  <Text style={[styles.arrow, { color: tokens.habits }]} accessibilityElementsHidden>›</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: tokens.surfaceAlt }]}><Text style={[styles.emptyIconText, { color: tokens.habits }]} accessibilityElementsHidden>✳</Text></View>
            <Text style={[styles.emptyTitle, { color: tokens.text }]}>Nothing to keep up with yet.</Text>
            <Text style={[styles.emptyCopy, { color: tokens.mutedText }]}>Choose one tiny action that could make today feel a little easier.</Text>
            <Pressable onPress={navigateToAdd} accessibilityRole="button" style={[styles.addButton, { backgroundColor: tokens.habits }]}><Text style={[styles.addButtonText, { color: tokens.primaryText }]}>Add a habit</Text></Pressable>
          </View>
        )}

        {data.habits.length ? (
          <Pressable onPress={navigateToAdd} accessibilityRole="button" style={[styles.secondaryButton, { borderColor: tokens.habits }]}><Text style={[styles.secondaryText, { color: tokens.habits }]}>Add another practice</Text></Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 31, lineHeight: 36, marginTop: -2 },
  headerCopy: { flex: 1, gap: 4 },
  eyebrow: { fontSize: 11, letterSpacing: 1.1, fontWeight: '800' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  list: { gap: 10, marginTop: 6 },
  row: { minHeight: 72, borderWidth: 1, borderRadius: 18, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 13 },
  checkMark: { width: 27, height: 27, borderWidth: 2, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontSize: 14, fontWeight: '800' },
  rowText: { flex: 1, gap: 4 },
  habitTitle: { fontSize: 16, fontWeight: '700' },
  habitStatus: { fontSize: 13 },
  arrow: { fontSize: 26, lineHeight: 28 },
  emptyCard: { borderWidth: 1, borderRadius: 22, padding: 20, alignItems: 'flex-start', gap: 12, marginTop: 6 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyIconText: { fontSize: 26 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyCopy: { fontSize: 14, lineHeight: 21 },
  addButton: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 4 },
  addButtonText: { fontSize: 15, fontWeight: '700' },
  secondaryButton: { minHeight: 46, borderWidth: 1, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: 4 },
  secondaryText: { fontSize: 14, fontWeight: '700' },
});
