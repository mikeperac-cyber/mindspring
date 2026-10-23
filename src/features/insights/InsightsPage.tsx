import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLastSevenDateKeys, getRecentDateKeys, type AppData, type Mood } from '../../app/model';
import { WEEKLY_PROMPT } from '../../app/prompts';
import { useAppStore } from '../../app/store';
import './insights.css';

export interface WeeklyDay {
  dateKey: string;
  checkIn: boolean;
  habitCompletions: number;
  mood: Mood | null;
  energy: number | null;
}

export interface WeeklySummary {
  days: WeeklyDay[];
  checkInDays: number;
  habitCompletions: number;
  moodCounts: Record<Mood, number>;
  averageEnergy: number | null;
}

interface ActivityDay {
  dateKey: string;
  checkIn: AppData['checkIns'][number] | null;
  habitCompletions: number;
  reflections: number;
}

function summarizeLastThirtyDays(data: AppData, today: Date): ActivityDay[] {
  const checkIns = new Map(data.checkIns.map((checkIn) => [checkIn.dateKey, checkIn]));
  const reflections = new Map<string, number>();
  data.journalEntries.forEach((entry) => reflections.set(entry.dateKey, (reflections.get(entry.dateKey) ?? 0) + 1));
  return getRecentDateKeys(30, today).map((dateKey) => ({
    dateKey,
    checkIn: checkIns.get(dateKey) ?? null,
    habitCompletions: data.habits.filter((habit) => habit.completedDates.includes(dateKey)).length,
    reflections: reflections.get(dateKey) ?? 0,
  }));
}

export function summarizeLastSevenDays(data: AppData, today: Date = new Date()): WeeklySummary {
  const checkInsByDate = new Map(data.checkIns.map((checkIn) => [checkIn.dateKey, checkIn]));
  const days: WeeklyDay[] = getLastSevenDateKeys(today).map((dateKey) => {
    const checkIn = checkInsByDate.get(dateKey);
    return {
      dateKey,
      checkIn: Boolean(checkIn),
      habitCompletions: data.habits.filter((habit) => habit.completedDates.includes(dateKey)).length,
      mood: checkIn?.mood ?? null,
      energy: checkIn?.energy ?? null,
    };
  });
  const moodCounts: Record<Mood, number> = { low: 0, steady: 0, bright: 0 };
  const recordedEnergy: number[] = [];
  days.forEach((day) => {
    if (day.mood) moodCounts[day.mood] += 1;
    if (day.energy !== null) recordedEnergy.push(day.energy);
  });
  return {
    days,
    checkInDays: days.filter((day) => day.checkIn).length,
    habitCompletions: days.reduce((total, day) => total + day.habitCompletions, 0),
    moodCounts,
    averageEnergy: recordedEnergy.length
      ? Math.round(recordedEnergy.reduce((total, energy) => total + energy, 0) / recordedEnergy.length * 10) / 10
      : null,
  };
}

function displayDay(dateKey: string): { short: string; long: string } {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return {
    short: date.toLocaleDateString(undefined, { weekday: 'short' }),
    long: date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
  };
}

export function InsightsPage({ today = new Date() }: { today?: Date }) {
  const { data } = useAppStore();
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const summary = summarizeLastSevenDays(data, today);
  const monthDays = summarizeLastThirtyDays(data, today);
  const selectedDay = monthDays.find((day) => day.dateKey === selectedDateKey) ?? monthDays[monthDays.length - 1];
  const activeDays = monthDays.filter((day) => day.checkIn || day.habitCompletions || day.reflections).length;
  const monthReflections = monthDays.reduce((total, day) => total + day.reflections, 0);
  const dateRange = [monthDays[0], monthDays[monthDays.length - 1]]
    .map((day) => {
      const [year, month, date] = day.dateKey.split('-').map(Number);
      return new Date(year, month - 1, date, 12).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }).join(' – ');
  const checkInCopy = `${summary.checkInDays} check-in${summary.checkInDays === 1 ? '' : 's'} in the last 7 days`;
  const habitCopy = `${summary.habitCompletions} habit completion${summary.habitCompletions === 1 ? '' : 's'} in the last 7 days`;

  return (
    <div className="insights-page">
      <header className="feature-page-heading">
        <div>
          <p className="eyebrow tone-insights-label">Small steps, seen over time</p>
          <h1>Your progress, in perspective.</h1>
          <p>Notice your own rhythm. A missed day doesn’t erase the care you’ve already shown yourself.</p>
        </div>
        <div className="feature-page-sparkle tone-insights" aria-hidden="true">⌁</div>
      </header>

      <section className="insights-summary-grid" aria-label="Last seven days at a glance">
        <article className="surface-card insight-stat-card section-card tone-insights">
          <span className="insight-stat-icon" aria-hidden="true">◷</span>
          <p className="eyebrow tone-insights-label">Daily pauses</p>
          <p className="insight-stat-value">{summary.checkInDays}<span> / 7</span></p>
          <p className="insight-stat-copy">{checkInCopy}</p>
        </article>
        <article className="surface-card insight-stat-card section-card tone-habits">
          <span className="insight-stat-icon tone-habits-label" aria-hidden="true">✳</span>
          <p className="eyebrow tone-habits-label">Small actions</p>
          <p className="insight-stat-value">{summary.habitCompletions}</p>
          <p className="insight-stat-copy">{habitCopy}</p>
        </article>
      </section>

      <section className="surface-card mood-summary-card section-card tone-journal" aria-labelledby="mood-summary-title">
        <div>
          <p className="eyebrow tone-journal-label">How you felt</p>
          <h2 id="mood-summary-title">Your check-in picture</h2>
          <p>These are the moods you recorded in the last seven days. Every kind of day belongs here.</p>
        </div>
        {summary.checkInDays === 0 ? (
          <p className="mood-summary-empty">No check-ins this week yet. <Link to="/app/home">Start with today’s check-in.</Link></p>
        ) : (
          <div className="mood-summary-content">
            <ul className="mood-breakdown" aria-label="Mood counts over the last seven days">
              {(['low', 'steady', 'bright'] as const).map((mood) => (
                <li key={mood} className={`mood-breakdown-${mood}`}>
                  <span className="mood-breakdown-label">{mood[0].toUpperCase() + mood.slice(1)}</span>
                  <span className="mood-breakdown-track" aria-hidden="true"><span style={{ width: `${summary.moodCounts[mood] / summary.checkInDays * 100}%` }} /></span>
                  <strong>{summary.moodCounts[mood]}</strong>
                </li>
              ))}
            </ul>
            <p className="mood-energy-copy">Average energy: <strong>{summary.averageEnergy} of 5</strong> across {summary.checkInDays} check-in{summary.checkInDays === 1 ? '' : 's'}.</p>
          </div>
        )}
      </section>

      <section className="surface-card weekly-card section-card tone-insights" aria-labelledby="weekly-title">
        <div className="weekly-card-heading">
          <div>
            <p className="eyebrow tone-insights-label">Your recent rhythm</p>
            <h2 id="weekly-title">The last seven days</h2>
          </div>
          <span className="weekly-legend"><span aria-hidden="true">✓</span> Check-in completed</span>
        </div>
        <p className="weekly-text-summary" id="weekly-text-summary">{checkInCopy}. {habitCopy}.</p>
        <div className="weekly-chart" role="img" aria-label="Daily check-ins across the last 7 days" aria-describedby="weekly-text-summary weekly-day-summary">
          {summary.days.map((day) => {
            const labels = displayDay(day.dateKey);
            return (
              <div className={day.checkIn ? 'weekly-day checked-in' : 'weekly-day'} key={day.dateKey}>
                <span className="weekly-day-total">{day.habitCompletions}</span>
                <span className="weekly-day-state" aria-hidden="true">{day.checkIn ? '✓' : '—'}</span>
                <span className="weekly-day-bar" aria-hidden="true"><span /></span>
                <span className="weekly-day-name" title={labels.long}>{labels.short}</span>
              </div>
            );
          })}
        </div>
        <ul className="visually-hidden" id="weekly-day-summary" aria-label="Daily progress details">
          {summary.days.map((day) => {
            const labels = displayDay(day.dateKey);
            const checkInText = day.checkIn ? 'check-in completed' : 'no check-in';
            const habitText = day.habitCompletions === 1 ? '1 habit completed' : `${day.habitCompletions} habits completed`;
            return <li key={day.dateKey}>{`${labels.long}: ${checkInText}; ${habitText}.`}</li>;
          })}
        </ul>
        <p className="weekly-note">The small number above each day is how many habits you marked done.</p>
      </section>

      <section className="surface-card activity-card section-card tone-insights" aria-labelledby="activity-title">
        <div className="activity-heading">
          <div>
            <p className="eyebrow tone-insights-label">A wider view</p>
            <h2 id="activity-title">Your last 30 days</h2>
            <p className="activity-range">{dateRange}</p>
            <p>{activeDays} active {activeDays === 1 ? 'day' : 'days'} and {monthReflections} saved {monthReflections === 1 ? 'reflection' : 'reflections'}. Select a date to see its details.</p>
          </div>
          <span className="activity-legend">✓ Check-in &nbsp; ✳ Habit &nbsp; ✎ Reflection</span>
        </div>
        <ol className="activity-map" aria-label="Activity over the last 30 days">
          {monthDays.map((day) => {
            const labels = displayDay(day.dateKey);
            const hasActivity = Boolean(day.checkIn || day.habitCompletions || day.reflections);
            const activityLabel = `${labels.long}: ${day.checkIn ? 'check-in saved' : 'no check-in'}, ${day.habitCompletions} ${day.habitCompletions === 1 ? 'habit' : 'habits'} completed, ${day.reflections} ${day.reflections === 1 ? 'reflection' : 'reflections'}`;
            return (
              <li key={day.dateKey}>
                <button type="button" className={`activity-day${hasActivity ? ' active' : ''}${selectedDay.dateKey === day.dateKey ? ' selected' : ''}`} aria-label={activityLabel} aria-pressed={selectedDay.dateKey === day.dateKey} onClick={() => setSelectedDateKey(day.dateKey)}>
                  <span>{Number(day.dateKey.slice(-2))}</span>
                  <span className="activity-day-symbol" aria-hidden="true">{day.checkIn ? '✓' : day.habitCompletions ? '✳' : day.reflections ? '✎' : '·'}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="activity-detail" role="status" aria-live="polite">
          <strong>{displayDay(selectedDay.dateKey).long}</strong>
          <p>{selectedDay.checkIn ? `Check-in: ${selectedDay.checkIn.mood}, energy ${selectedDay.checkIn.energy} of 5.` : 'No check-in recorded.'} {selectedDay.habitCompletions} {selectedDay.habitCompletions === 1 ? 'habit' : 'habits'} completed. {selectedDay.reflections} {selectedDay.reflections === 1 ? 'reflection' : 'reflections'} saved.</p>
          {selectedDay.checkIn?.note && <blockquote>“{selectedDay.checkIn.note}”</blockquote>}
        </div>
      </section>

      <section className="insight-kind-note">
        <span aria-hidden="true">♡</span>
        <p>Progress here means showing up in ways that work for you. There is no streak to lose.</p>
      </section>

      <section className="surface-card weekly-reflection-card" aria-labelledby="weekly-reflection-title">
        <div>
          <p className="eyebrow tone-journal-label">A moment to reflect</p>
          <h2 id="weekly-reflection-title">{WEEKLY_PROMPT}</h2>
          <p>You can carry the question into your journal whenever you are ready.</p>
        </div>
        <Link className="button-primary compact-button" to="/app/journal?prompt=weekly">Write a weekly reflection <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
