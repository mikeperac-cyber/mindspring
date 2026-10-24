import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { DAILY_PROMPTS, getDailyPromptIndex, getLocalDateKey, getTodayProgress, type AppData } from '@mindspring/core';
import { useAppStore } from '../../state/AppProvider';
import { useLocalToday } from '../../state/useLocalToday';
import { useNativeTheme } from '../../theme/ThemeProvider';
import { CheckInCard } from './CheckInCard';

export interface NextAction {
  message: string;
  label: string;
  destination: 'check-in' | '/habits' | '/(tabs)/insights';
}

export function getContextualNextAction(data: AppData, dateKey: string): NextAction {
  const hasCheckIn = data.checkIns.some((checkIn) => checkIn.dateKey === dateKey);
  if (!hasCheckIn) return { message: 'A short pause can help you notice what you need today.', label: 'Start a check-in', destination: 'check-in' };
  const completedHabits = data.habits.filter((habit) => habit.completedDates.includes(dateKey)).length;
  if (completedHabits < data.habits.length) return { message: 'One small action is enough. Choose a focus habit when it fits.', label: 'See habits', destination: '/habits' };
  return { message: 'You showed up for yourself today. Take a moment to notice that.', label: 'Review progress', destination: '/(tabs)/insights' };
}

export function HomeScreen({ today, onNavigate }: { today?: Date; onNavigate?: (route: string) => void }) {
  const router = useRouter();
  const { data, toggleHabitToday } = useAppStore();
  const { tokens } = useNativeTheme();
  const liveTodayKey = useLocalToday();
  const dateKey = today ? getLocalDateKey(today) : liveTodayKey;
  const progress = getTodayProgress(data, dateKey);
  const action = getContextualNextAction(data, dateKey);
  const prompt = DAILY_PROMPTS[getDailyPromptIndex(dateKey)];
  const checkIn = data.checkIns.find((item) => item.dateKey === dateKey);
  const focusHabits = data.habits.slice(0, 3);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const checkInOffset = useRef(0);
  const [focusMessage, setFocusMessage] = useState('');

  const navigate = (route: string) => onNavigate ? onNavigate(route) : router.push(route as Href);
  const handleNextAction = () => {
    if (action.destination === 'check-in') scrollRef.current?.scrollTo({ y: Math.max(0, checkInOffset.current - 12), animated: true });
    else navigate(action.destination);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <View style={styles.topCopy}>
            <Text style={[styles.eyebrow, { color: tokens.primary }]}>MINDSPRING · TODAY</Text>
            <Text style={[styles.greeting, { color: tokens.text }]}>Good morning, {data.profile?.displayName ?? 'friend'}</Text>
            <Text style={[styles.intention, { color: tokens.mutedText }]}>{data.profile?.intention ?? 'A small step is enough for today.'}</Text>
          </View>
          <Pressable onPress={() => navigate('/add')} accessibilityRole="button" accessibilityLabel="Add a goal, habit, or journal reflection" style={[styles.addButton, { backgroundColor: tokens.primary }]}>
            <Text style={[styles.addButtonText, { color: tokens.primaryText }]}>＋</Text>
          </Pressable>
        </View>

        <View style={[styles.momentumCard, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <View style={styles.momentumText}>
            <Text style={[styles.sectionEyebrow, { color: tokens.insights }]}>TODAY’S MOMENTUM</Text>
            <Text style={[styles.momentumTitle, { color: tokens.text }]}>Small steps, at your pace.</Text>
            <Text style={[styles.momentumSummary, { color: tokens.mutedText }]}>{progress.completed} of {progress.total} tracker {progress.total === 1 ? 'step' : 'steps'} · {progress.percentage}%</Text>
          </View>
          <View accessibilityRole="progressbar" accessibilityLabel="Today momentum" accessibilityValue={{ min: 0, max: 100, now: progress.percentage }} style={[styles.progressCircle, { borderColor: tokens.insights, backgroundColor: tokens.surface }]}>
            <Text style={[styles.progressPercent, { color: tokens.text }]}>{progress.percentage}%</Text>
          </View>
        </View>

        <View style={[styles.promptCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <View style={[styles.accentBar, { backgroundColor: tokens.journal }]} />
          <View style={styles.promptCopy}>
            <Text style={[styles.sectionEyebrow, { color: tokens.journal }]}>A MOMENT TO NOTICE</Text>
            <Text style={[styles.promptText, { color: tokens.text }]}>{prompt}</Text>
          </View>
          <Pressable onPress={() => navigate('/journal/compose')} accessibilityRole="button" accessibilityLabel="Write a reflection" style={[styles.lightButton, { backgroundColor: tokens.surfaceAlt }]}>
            <Text style={[styles.lightButtonText, { color: tokens.primary }]}>Write</Text>
          </Pressable>
        </View>

        <View style={[styles.nextCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <View style={styles.nextCopy}>
            <Text style={[styles.sectionEyebrow, { color: tokens.habits }]}>YOUR NEXT GENTLE STEP</Text>
            <Text style={[styles.nextMessage, { color: tokens.text }]}>{action.message}</Text>
          </View>
          <Pressable onPress={handleNextAction} accessibilityRole="button" style={[styles.secondaryButton, { borderColor: tokens.habits }]}>
            <Text style={[styles.secondaryButtonText, { color: tokens.habits }]}>{action.label}</Text>
          </Pressable>
        </View>

        <View onLayout={(event) => { checkInOffset.current = event.nativeEvent.layout.y; }} style={styles.section}>
          <View style={styles.sectionHeading}>
            <View><Text style={[styles.sectionTitle, { color: tokens.text }]}>Check in with yourself</Text><Text style={[styles.sectionSubtitle, { color: tokens.mutedText }]}>There is no right way to feel.</Text></View>
          </View>
          <CheckInCard dateKey={dateKey} checkIn={checkIn} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionHeadingCopy}><Text style={[styles.sectionTitle, { color: tokens.text }]}>Your focus today</Text><Text style={[styles.sectionSubtitle, { color: tokens.mutedText }]}>One small practice is plenty.</Text></View>
            <Pressable onPress={() => navigate('/habits')} accessibilityRole="button" accessibilityLabel="See all habits" hitSlop={8}><Text style={[styles.linkText, { color: tokens.habits }]}>See all</Text></Pressable>
          </View>
          {focusHabits.length ? (
            <View style={styles.habitList}>
              {focusHabits.map((habit) => {
                const complete = habit.completedDates.includes(dateKey);
                return (
                  <Pressable key={habit.id} onPress={() => { void toggleHabitToday(habit.id, dateKey); setFocusMessage('Your focus is updated.'); }} accessibilityRole="checkbox" accessibilityState={{ checked: complete }} accessibilityLabel={(complete ? 'Undo ' : 'Complete ') + habit.title + ' today'} style={[styles.habitRow, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
                    <View style={[styles.checkMark, { borderColor: tokens.habits, backgroundColor: complete ? tokens.habits : tokens.surface }]} accessibilityElementsHidden>{complete ? <Text style={[styles.checkText, { color: tokens.primaryText }]}>✓</Text> : null}</View>
                    <Text style={[styles.habitTitle, { color: tokens.text }]}>{habit.title}</Text>
                    <Text style={[styles.habitState, { color: tokens.mutedText }]}>{complete ? 'Done today' : 'Mark done'}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
              <Text style={[styles.emptyText, { color: tokens.mutedText }]}>No daily practices yet. You can start with one tiny habit.</Text>
              <Pressable onPress={() => navigate('/add')} accessibilityRole="button" style={[styles.secondaryButton, { borderColor: tokens.habits }]}><Text style={[styles.secondaryButtonText, { color: tokens.habits }]}>Add a habit</Text></Pressable>
            </View>
          )}
          {focusMessage ? <Text style={[styles.announce, { color: tokens.success }]} accessibilityLiveRegion="polite">{focusMessage}</Text> : null}
        </View>
        <View style={[styles.kindNote, { backgroundColor: tokens.surfaceAlt }]}><Text style={[styles.kindNoteMark, { color: tokens.primary }]} accessibilityElementsHidden>♡</Text><Text style={[styles.kindNoteText, { color: tokens.mutedText }]}>Progress is noticing your effort. A missed day does not take it away.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 18 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 }, topCopy: { flex: 1, gap: 4 }, eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }, greeting: { fontSize: 26, lineHeight: 32, fontWeight: '700' }, intention: { fontSize: 14, lineHeight: 21 },
  addButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, addButtonText: { fontSize: 27, lineHeight: 31 },
  momentumCard: { borderWidth: 1, borderRadius: 22, padding: 18, minHeight: 118, flexDirection: 'row', alignItems: 'center', gap: 16 }, momentumText: { flex: 1, gap: 5 }, sectionEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1 }, momentumTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700' }, momentumSummary: { fontSize: 13, lineHeight: 19 }, progressCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 6, alignItems: 'center', justifyContent: 'center' }, progressPercent: { fontSize: 16, fontWeight: '800' },
  promptCard: { borderWidth: 1, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, accentBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 }, promptCopy: { flex: 1, gap: 5 }, promptText: { fontSize: 16, lineHeight: 22, fontWeight: '600' }, lightButton: { minHeight: 42, minWidth: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingHorizontal: 12 }, lightButtonText: { fontSize: 14, fontWeight: '700' },
  nextCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 14 }, nextCopy: { gap: 6 }, nextMessage: { fontSize: 16, lineHeight: 23 }, secondaryButton: { minHeight: 44, borderWidth: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, alignSelf: 'flex-start' }, secondaryButtonText: { fontSize: 14, fontWeight: '700' },
  section: { gap: 12 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, sectionHeadingCopy: { flex: 1 }, sectionTitle: { fontSize: 19, lineHeight: 25, fontWeight: '700' }, sectionSubtitle: { fontSize: 13, lineHeight: 19, marginTop: 2 }, linkText: { fontSize: 14, fontWeight: '700' }, habitList: { gap: 9 },
  habitRow: { minHeight: 58, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, checkMark: { width: 25, height: 25, borderWidth: 2, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, checkText: { fontSize: 14, fontWeight: '800' }, habitTitle: { flex: 1, fontSize: 15, fontWeight: '600' }, habitState: { fontSize: 12 }, emptyCard: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 }, emptyText: { fontSize: 14, lineHeight: 21 }, announce: { fontSize: 13, lineHeight: 18 }, kindNote: { borderRadius: 17, flexDirection: 'row', gap: 10, padding: 14 }, kindNoteMark: { fontSize: 22 }, kindNoteText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
