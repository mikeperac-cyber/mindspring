import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { summarizeLastSevenDays, summarizeLastThirtyDays, getLocalDateKey, type ActivityDay } from '@mindspring/core';
import { useAppStore } from '../../state/AppProvider';
import { useLocalToday } from '../../state/useLocalToday';
import { useNativeTheme } from '../../theme/ThemeProvider';

function parseDateKey(dateKey: string): Date { return new Date(dateKey + 'T12:00:00'); }
function monthDay(dateKey: string): string { return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(parseDateKey(dateKey)); }
function fullDate(dateKey: string): string { return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(parseDateKey(dateKey)); }
function weekLabel(dateKey: string): string { return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(parseDateKey(dateKey)); }
function countLabel(count: number, singular: string): string { return count + ' ' + singular + (count === 1 ? '' : 's'); }
function activityHint(day: ActivityDay): string {
  const parts: string[] = [];
  if (day.checkIn) parts.push('check-in');
  if (day.habitCompletions) parts.push(countLabel(day.habitCompletions, 'habit practice'));
  if (day.reflections) parts.push(countLabel(day.reflections, 'journal reflection'));
  return parts.length ? parts.join(', ') : 'no recorded activity';
}

export function InsightsScreen({ today }: { today?: Date }) {
  const { data } = useAppStore();
  const { tokens } = useNativeTheme();
  const liveToday = useLocalToday();
  const todayDate = useMemo(() => today ?? parseDateKey(liveToday), [today, liveToday]);
  const todayKey = getLocalDateKey(todayDate);
  const week = useMemo(() => summarizeLastSevenDays(data, todayDate), [data, todayDate]);
  const activity = useMemo(() => summarizeLastThirtyDays(data, todayDate), [data, todayDate]);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  useEffect(() => setSelectedDate(todayKey), [todayKey]);
  const selected = activity.find((day) => day.dateKey === selectedDate) ?? activity[activity.length - 1];
  const selectedDetail = selected
    ? `${selected.checkIn?.mood ? selected.checkIn.mood + ' mood' : 'No check-in'}, ${selected.checkIn ? 'energy ' + selected.checkIn.energy + ' of 5' : 'no energy rating'}, ${countLabel(selected.habitCompletions, 'habit practice')}, ${countLabel(selected.reflections, 'journal reflection')}.`
    : 'No activity details available.';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: tokens.background }]}>
      <Text style={[styles.eyebrow, { color: tokens.insights }]}>INSIGHTS · YOUR OWN RHYTHM</Text>
      <Text style={[styles.title, { color: tokens.text }]}>Notice what’s adding up.</Text>
      <Text style={[styles.subtitle, { color: tokens.mutedText }]}>A reflection of your recent effort, without scores or comparisons.</Text>

      <View style={[styles.summary, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
        <Text style={[styles.summaryLabel, { color: tokens.insights }]}>LAST SEVEN DAYS</Text>
        <Text accessibilityLabel="Weekly activity summary" style={[styles.summaryText, { color: tokens.text }]}>
          This week: {week.checkInDays} check-in{week.checkInDays === 1 ? '' : 's'} · {week.habitCompletions} habit practice{week.habitCompletions === 1 ? '' : 's'}
        </Text>
        <Text style={[styles.summaryNote, { color: tokens.mutedText }]}>
          {week.averageEnergy === null ? 'Energy ratings appear here when you add a check-in.' : `Average energy: ${week.averageEnergy} of 5`}
        </Text>
        <View style={styles.week}>
          {week.days.map((day) => {
            const activityCount = Number(day.checkIn) + day.habitCompletions;
            const selectedDay = selectedDate === day.dateKey;
            return (
              <Pressable key={day.dateKey} onPress={() => setSelectedDate(day.dateKey)} accessibilityRole="button" accessibilityState={{ selected: selectedDay }} accessibilityLabel={'Week day ' + fullDate(day.dateKey)} accessibilityHint={`${activityCount} tracker step${activityCount === 1 ? '' : 's'} recorded`} style={styles.weekDay}>
                <Text style={[styles.weekDayLabel, { color: tokens.mutedText }]}>{weekLabel(day.dateKey)}</Text>
                <View style={[styles.barTrack, { backgroundColor: tokens.surface, borderColor: tokens.border }]}><View style={[styles.barFill, { height: `${activityCount ? Math.min(100, 30 + activityCount * 22) : 8}%`, backgroundColor: tokens.insights }]} /></View>
                <Text style={[styles.weekDayCount, { color: selectedDay ? tokens.insights : tokens.mutedText }]}>{activityCount || '·'}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.activityCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <View style={styles.activityHeader}>
          <View style={styles.activityHeaderCopy}><Text style={[styles.cardTitle, { color: tokens.text }]}>Your last 30 days</Text><Text style={[styles.cardSubtitle, { color: tokens.mutedText }]}>Select a day to see what you noticed.</Text></View>
          <Text style={[styles.legend, { color: tokens.insights }]}>● activity</Text>
        </View>
        <View style={styles.grid}>
          {activity.map((day) => {
            const active = Boolean(day.checkIn || day.habitCompletions || day.reflections);
            const selectedDay = selectedDate === day.dateKey;
            return (
              <Pressable key={day.dateKey} onPress={() => setSelectedDate(day.dateKey)} accessibilityRole="button" accessibilityState={{ selected: selectedDay }} accessibilityLabel={'Activity ' + monthDay(day.dateKey)} accessibilityHint={activityHint(day)} style={[styles.gridDay, { backgroundColor: selectedDay ? tokens.surfaceAlt : tokens.background, borderColor: selectedDay ? tokens.insights : tokens.border }]}>
                <Text style={[styles.gridDate, { color: tokens.text }]}>{parseDateKey(day.dateKey).getDate()}</Text>
                <Text style={[styles.gridMark, { color: active ? tokens.insights : tokens.mutedText }]}>{active ? '●' : '·'}</Text>
              </Pressable>
            );
          })}
        </View>
        <View accessibilityLiveRegion="polite" style={[styles.detail, { backgroundColor: tokens.surfaceAlt }]}>
          <Text style={[styles.detailDate, { color: tokens.insights }]}>{selected ? fullDate(selected.dateKey) : 'Activity details'}</Text>
          <Text style={[styles.detailText, { color: tokens.text }]}>{selectedDetail}</Text>
        </View>
      </View>
      <Text style={[styles.reassurance, { color: tokens.mutedText }]}>Your rhythm is yours. A quiet day still belongs in your story.</Text>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 36, gap: 16 }, eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }, title: { fontSize: 26, lineHeight: 33, fontWeight: '700' }, subtitle: { fontSize: 14, lineHeight: 21 },
  summary: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 }, summaryLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 }, summaryText: { fontSize: 16, lineHeight: 22, fontWeight: '700' }, summaryNote: { fontSize: 13, lineHeight: 19 }, week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 7 }, weekDay: { flex: 1, alignItems: 'center', gap: 6 }, weekDayLabel: { fontSize: 10, fontWeight: '600' }, barTrack: { height: 68, width: '100%', borderWidth: 1, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' }, barFill: { width: '100%', borderRadius: 6 }, weekDayCount: { fontSize: 11, fontWeight: '700' },
  activityCard: { borderWidth: 1, borderRadius: 20, padding: 15, gap: 14 }, activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 }, activityHeaderCopy: { flex: 1, gap: 3 }, cardTitle: { fontSize: 17, fontWeight: '700' }, cardSubtitle: { fontSize: 12, lineHeight: 17 }, legend: { fontSize: 11, fontWeight: '700' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start' }, gridDay: { width: '12.5%', minWidth: 32, height: 39, borderWidth: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 2 }, gridDate: { fontSize: 11, fontWeight: '600' }, gridMark: { fontSize: 8 }, detail: { borderRadius: 14, padding: 12, gap: 5 }, detailDate: { fontSize: 12, fontWeight: '800' }, detailText: { fontSize: 14, lineHeight: 20 }, reassurance: { fontSize: 13, lineHeight: 19 },
});
