import { getLocalDateKey, type AppData } from '../../app/model';
import { useAppStore } from '../../app/store';
import './insights.css';

export interface WeeklyDay {
  dateKey: string;
  checkIn: boolean;
  habitCompletions: number;
}

export interface WeeklySummary {
  days: WeeklyDay[];
  checkInDays: number;
  habitCompletions: number;
}

export function summarizeLastSevenDays(data: AppData, today: Date = new Date()): WeeklySummary {
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const days: WeeklyDay[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - offset);
    const dateKey = getLocalDateKey(date);
    days.push({
      dateKey,
      checkIn: data.checkIns.some((checkIn) => checkIn.dateKey === dateKey),
      habitCompletions: data.habits.filter((habit) => habit.completedDates.includes(dateKey)).length,
    });
  }
  return {
    days,
    checkInDays: days.filter((day) => day.checkIn).length,
    habitCompletions: days.reduce((total, day) => total + day.habitCompletions, 0),
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
  const summary = summarizeLastSevenDays(data, today);
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

      <section className="surface-card weekly-card section-card tone-insights" aria-labelledby="weekly-title">
        <div className="weekly-card-heading">
          <div>
            <p className="eyebrow tone-insights-label">Your recent rhythm</p>
            <h2 id="weekly-title">The last seven days</h2>
          </div>
          <span className="weekly-legend"><span aria-hidden="true" /> Days with a check-in</span>
        </div>
        <p className="weekly-text-summary" id="weekly-text-summary">{checkInCopy}. {habitCopy}.</p>
        <div className="weekly-chart" role="img" aria-label="Daily check-ins across the last 7 days" aria-describedby="weekly-text-summary">
          {summary.days.map((day) => {
            const labels = displayDay(day.dateKey);
            return (
              <div className={day.checkIn ? 'weekly-day checked-in' : 'weekly-day'} key={day.dateKey}>
                <span className="weekly-day-total">{day.habitCompletions}</span>
                <span className="weekly-day-bar" aria-hidden="true"><span /></span>
                <span className="weekly-day-name" title={labels.long}>{labels.short}</span>
              </div>
            );
          })}
        </div>
        <p className="weekly-note">The small number above each day is how many habits you marked done.</p>
      </section>

      <section className="insight-kind-note">
        <span aria-hidden="true">♡</span>
        <p>Progress here means showing up in ways that work for you. There is no streak to lose.</p>
      </section>
    </div>
  );
}
