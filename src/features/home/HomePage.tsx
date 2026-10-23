import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../app/store';
import { getLocalDateKey, getTodayProgress, type Mood } from '../../app/model';
import { DAILY_PROMPTS, getDailyPromptIndex } from '../../app/prompts';
import './home.css';

const moods: { value: Mood; label: string; emoji: string }[] = [
  { value: 'low', label: 'Low', emoji: '◡' },
  { value: 'steady', label: 'Steady', emoji: '○' },
  { value: 'bright', label: 'Bright', emoji: '✳' },
];

function DailyCheckInCard() {
  const { data, saveCheckIn } = useAppStore();
  const dateKey = getLocalDateKey();
  const existingCheckIn = data.checkIns.find((checkIn) => checkIn.dateKey === dateKey);
  const [mood, setMood] = useState<Mood>(existingCheckIn?.mood ?? 'steady');
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5>(existingCheckIn?.energy ?? 3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMood(existingCheckIn?.mood ?? 'steady');
    setEnergy(existingCheckIn?.energy ?? 3);
  }, [existingCheckIn?.mood, existingCheckIn?.energy]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCheckIn({ dateKey, mood, energy });
    setSaved(true);
  }

  return (
    <section className="surface-card checkin-card" aria-labelledby="checkin-title">
      <div className="card-heading-row">
        <span className="category-marker tone-habits-marker" aria-hidden="true">✳</span>
        <div>
          <p className="eyebrow tone-habits-label">A daily pause</p>
          <h2 id="checkin-title">Daily check-in</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <fieldset className="mood-fieldset">
          <legend>How are you arriving?</legend>
          <div className="mood-options">
            {moods.map((option) => (
              <label key={option.value} className={`mood-option mood-${option.value}${mood === option.value ? ' selected' : ''}`}>
                <input type="radio" name="mood" value={option.value} checked={mood === option.value} onChange={() => { setMood(option.value); setSaved(false); }} />
                <span className="mood-emoji" aria-hidden="true">{option.emoji}</span>
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="energy-control">
          <div className="energy-label-row">
            <label htmlFor="energy-level">Energy</label>
            <output htmlFor="energy-level">{energy} <span>of 5</span></output>
          </div>
          <input
            id="energy-level"
            aria-label="Energy level"
            type="range"
            min={1}
            max={5}
            step={1}
            value={energy}
            aria-valuetext={`${energy} of 5`}
            onChange={(event) => { setEnergy(Number(event.target.value) as 1 | 2 | 3 | 4 | 5); setSaved(false); }}
          />
          <div className="energy-scale" aria-hidden="true"><span>Running low</span><span>Full of energy</span></div>
        </div>
        <div className="checkin-submit-row">
          <button className="button-primary compact-button" type="submit">Save today’s check-in <span aria-hidden="true">→</span></button>
          {saved && <span className="saved-note" role="status">Check-in saved. Thanks for checking in.</span>}
        </div>
      </form>
    </section>
  );
}

function MomentumCard() {
  const { data } = useAppStore();
  const progress = getTodayProgress(data, getLocalDateKey());
  const style = { '--progress': `${progress.percentage}%` } as CSSProperties;

  return (
    <section className="surface-card momentum-card tone-insights section-card" aria-labelledby="momentum-title">
      <div className="momentum-copy">
        <p className="eyebrow tone-insights-label">Today’s momentum</p>
        <h2 id="momentum-title">A little adds up.</h2>
        <p>Keep going at your own pace. Every step counts.</p>
        <strong>{progress.completed} of {progress.total} practices complete</strong>
      </div>
      <div className="momentum-ring" role="img" aria-label={`Today's momentum ${progress.percentage} percent`} style={style}>
        <span>{progress.percentage}<small>%</small></span>
      </div>
    </section>
  );
}

function FocusHabits() {
  const { data, toggleHabitToday } = useAppStore();
  const dateKey = getLocalDateKey();

  return (
    <section className="surface-card focus-card" aria-labelledby="focus-title">
      <div className="section-title-row">
        <div>
          <p className="eyebrow tone-habits-label">Gentle reminders</p>
          <h2 id="focus-title">Your focus today</h2>
        </div>
        <Link className="subtle-link" to="/app/habits">Manage habits <span aria-hidden="true">→</span></Link>
      </div>
      {data.habits.length === 0 ? (
        <div className="empty-inline">
          <span className="empty-sparkle" aria-hidden="true">✳</span>
          <div>
            <p>No habits yet. Start with one small thing.</p>
            <Link to="/app/habits">Add a habit</Link>
          </div>
        </div>
      ) : (
        <ul className="focus-habit-list">
          {data.habits.map((habit) => {
            const complete = habit.completedDates.includes(dateKey);
            return (
              <li key={habit.id} className={complete ? 'focus-habit complete' : 'focus-habit'}>
                <label>
                  <input
                    type="checkbox"
                    checked={complete}
                    aria-label={`${habit.title} done today`}
                    onChange={() => toggleHabitToday(habit.id, dateKey)}
                  />
                  <span className="focus-habit-title">{habit.title}</span>
                  <span className="habit-completion-label">{complete ? 'Done today' : 'A gentle reminder'}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function HomePage() {
  const { data } = useAppStore();
  const profile = data.profile;
  const activeGoals = data.goals.filter((goal) => !goal.completed).length;
  const journalCount = data.journalEntries.length;
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const dailyPrompt = DAILY_PROMPTS[getDailyPromptIndex(getLocalDateKey())];

  return (
    <div className="home-page">
      <header className="home-page-heading">
        <div>
          <p className="eyebrow">{dateLabel} · A moment for you</p>
          <h1>Good morning, {profile?.displayName ?? 'friend'}.</h1>
          <p className="home-intention">Today, make a little room for <strong>{profile?.intention ?? 'what matters to you'}</strong>.</p>
        </div>
        <Link className="home-avatar" to="/app/profile" aria-label="Open your profile">{profile?.displayName.slice(0, 1).toUpperCase() ?? 'M'}</Link>
      </header>

      <div className="home-top-grid">
        <section className="welcome-card">
          <span className="welcome-orb" aria-hidden="true">✳</span>
          <p className="welcome-kicker">A prompt for today</p>
          <h2>One small step<br />is still a step.</h2>
          <p>{dailyPrompt}</p>
          <Link to="/app/journal">Write a reflection <span aria-hidden="true">→</span></Link>
          <span className="welcome-decoration" aria-hidden="true">✿</span>
        </section>
        <MomentumCard />
      </div>

      <div className="home-action-grid">
        <DailyCheckInCard />
        <FocusHabits />
      </div>

      <section className="growth-space" aria-labelledby="growth-space-title">
        <div className="section-title-row growth-space-title-row">
          <div>
            <p className="eyebrow">Your gentle toolkit</p>
            <h2 id="growth-space-title">Your growth space</h2>
          </div>
          <span className="growth-note">A little progress is still progress.</span>
        </div>
        <div className="growth-card-grid">
          <Link className="growth-card tone-goals section-card" to="/app/goals">
            <span className="growth-card-icon" aria-hidden="true">◎</span>
            <span className="growth-card-title">Goals</span>
            <span className="growth-card-detail">{activeGoals} active · {data.goals.length - activeGoals} complete</span>
            <span className="growth-card-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link className="growth-card tone-habits section-card" to="/app/habits">
            <span className="growth-card-icon" aria-hidden="true">✳</span>
            <span className="growth-card-title">Habits</span>
            <span className="growth-card-detail">{data.habits.length} small {data.habits.length === 1 ? 'practice' : 'practices'}</span>
            <span className="growth-card-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link className="growth-card tone-journal section-card" to="/app/journal">
            <span className="growth-card-icon" aria-hidden="true">✎</span>
            <span className="growth-card-title">Journal</span>
            <span className="growth-card-detail">{journalCount} {journalCount === 1 ? 'reflection' : 'reflections'} saved</span>
            <span className="growth-card-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link className="growth-card tone-insights section-card" to="/app/insights">
            <span className="growth-card-icon" aria-hidden="true">⌁</span>
            <span className="growth-card-title">Insights</span>
            <span className="growth-card-detail">Notice your own rhythm</span>
            <span className="growth-card-arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
