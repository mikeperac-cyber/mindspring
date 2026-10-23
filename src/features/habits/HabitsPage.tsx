import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getLastSevenDateKeys, getLocalDateKey } from '../../app/model';
import { useAppStore } from '../../app/store';
import { useLocalToday } from '../../app/useLocalToday';
import './habits.css';

export function HabitsPage() {
  const { data, addHabit, toggleHabitToday } = useAppStore();
  const today = useLocalToday();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dateKey = getLocalDateKey(today);
  const recentDates = getLastSevenDateKeys(today);
  const completeCount = data.habits.filter((habit) => habit.completedDates.includes(dateKey)).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addHabit(title)) {
      setError('Give your habit a name first.');
      return;
    }
    setTitle('');
    setError(null);
  }

  return (
    <div className="habits-page">
      <header className="feature-page-heading">
        <div>
          <p className="eyebrow tone-habits-label">Your daily practices</p>
          <h1>Habits that fit real life.</h1>
          <p>Tiny actions add up. Check in when you’ve done one; each new day starts fresh.</p>
        </div>
        <div className="feature-page-sparkle tone-habits" aria-hidden="true">✳</div>
      </header>

      <div className="habits-layout">
        <section className="surface-card habit-form-card" aria-labelledby="add-habit-title">
          <p className="eyebrow tone-habits-label">Start small</p>
          <h2 id="add-habit-title">Add a little practice</h2>
          <p>Choose something kind and easy to return to.</p>
          <form className="habit-add-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="new-habit-title">New habit</label>
            <div className="habit-add-row">
              <input
                id="new-habit-title"
                type="text"
                placeholder="e.g. Drink a glass of water"
                value={title}
                onChange={(event) => { setTitle(event.target.value); setError(null); }}
              />
              <button className="button-primary compact-button" type="submit">Add habit <span aria-hidden="true">+</span></button>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
          <div className="habit-kind-note"><span aria-hidden="true">♡</span> Every habit is a practice, not a promise.</div>
        </section>

        <section className="surface-card habits-list-card" aria-labelledby="habit-list-title">
          <div className="section-title-row">
            <div>
              <p className="eyebrow tone-habits-label">Today · {completeCount} of {data.habits.length} complete</p>
              <h2 id="habit-list-title">Your small actions</h2>
            </div>
            <span className="habit-day-pill">{today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>

          {data.habits.length === 0 ? (
            <div className="habit-empty-state">
              <span className="habit-empty-icon" aria-hidden="true">✳</span>
              <p>No habits yet. Begin with one small action.</p>
              <span>Something that takes a minute is a lovely place to start.</span>
            </div>
          ) : (
            <ul className="habit-list">
              {data.habits.map((habit, index) => {
                const completed = habit.completedDates.includes(dateKey);
                const recentCount = recentDates.filter((date) => habit.completedDates.includes(date)).length;
                return (
                  <li key={habit.id} className={completed ? 'habit-row completed' : 'habit-row'}>
                    <span className={`habit-row-marker habit-marker-${index % 4}`} aria-hidden="true">{['✳', '◌', '⌁', '✿'][index % 4]}</span>
                    <label className="habit-row-label">
                      <span className="habit-row-title">{habit.title}</span>
                      <span className="habit-row-subtitle">{completed ? 'A small step, done.' : 'Whenever it feels right today.'}</span>
                    </label>
                    <label className="habit-toggle-label">
                      <input
                        type="checkbox"
                        aria-label={`${habit.title} done today`}
                        checked={completed}
                        onChange={() => toggleHabitToday(habit.id, dateKey)}
                      />
                      <span>{completed ? 'Done' : 'Mark done'}</span>
                    </label>
                    <div className="habit-week">
                      <div className="habit-week-heading"><span>Last 7 days</span><strong>{recentCount} of 7 marked done</strong></div>
                      <ol className="habit-week-days" aria-label={`${habit.title} activity over the last seven days`}>
                        {recentDates.map((recentDate) => {
                          const [year, month, day] = recentDate.split('-').map(Number);
                          const dayDate = new Date(year, month - 1, day, 12);
                          const dayLabel = dayDate.toLocaleDateString(undefined, { weekday: 'short' });
                          const fullLabel = dayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
                          const wasDone = habit.completedDates.includes(recentDate);
                          return (
                            <li key={recentDate} className={wasDone ? 'done' : ''}>
                              <time dateTime={recentDate} aria-label={`${fullLabel}: ${wasDone ? 'marked done' : 'not marked done'}`}>
                                <span>{dayLabel}</span><span aria-hidden="true">{wasDone ? '✓' : '—'}</span>
                              </time>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Link className="habits-back-link" to="/app/home">← Back to your space</Link>
        </section>
      </div>
    </div>
  );
}
