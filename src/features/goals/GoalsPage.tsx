import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../app/store';
import './goals.css';

export function GoalsPage() {
  const { data, addGoal, toggleGoal } = useAppStore();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addGoal(title)) {
      setError('Give your goal a name first.');
      return;
    }
    setTitle('');
    setError(null);
  }

  const completeCount = data.goals.filter((goal) => goal.completed).length;

  return (
    <div className="goals-page">
      <header className="feature-page-heading">
        <div>
          <p className="eyebrow tone-goals-label">A direction, at your pace</p>
          <h1>Make room for what matters.</h1>
          <p>Choose a meaningful direction. You can take it one small step at a time.</p>
        </div>
        <div className="feature-page-sparkle tone-goals" aria-hidden="true">◎</div>
      </header>

      <div className="goals-layout">
        <section className="surface-card goal-form-card section-card tone-goals" aria-labelledby="add-goal-title">
          <p className="eyebrow tone-goals-label">Begin with one</p>
          <h2 id="add-goal-title">What would you like to move toward?</h2>
          <p>Keep it personal, clear, and kind to your real life.</p>
          <form className="goal-add-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="new-goal-title">New goal</label>
            <div className="goal-add-row">
              <input
                id="new-goal-title"
                type="text"
                placeholder="e.g. Feel more rested"
                value={title}
                onChange={(event) => { setTitle(event.target.value); setError(null); }}
              />
              <button className="button-primary compact-button" type="submit">Add goal <span aria-hidden="true">+</span></button>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
          <p className="goal-kind-note"><span aria-hidden="true">♡</span> A goal is a direction, not a deadline.</p>
        </section>

        <section className="surface-card goals-list-card" aria-labelledby="goal-list-title">
          <div className="section-title-row">
            <div>
              <p className="eyebrow tone-goals-label">{completeCount} of {data.goals.length} complete</p>
              <h2 id="goal-list-title">Your intentions</h2>
            </div>
            <span className="goal-count-pill">{data.goals.length} {data.goals.length === 1 ? 'goal' : 'goals'}</span>
          </div>

          {data.goals.length === 0 ? (
            <div className="goal-empty-state">
              <span className="goal-empty-icon" aria-hidden="true">◎</span>
              <p>No goals yet. Start with something that matters to you.</p>
              <span>Even a gentle direction can help you find your next step.</span>
            </div>
          ) : (
            <ul className="goal-list">
              {data.goals.map((goal) => (
                <li className={goal.completed ? 'goal-row completed' : 'goal-row'} key={goal.id}>
                  <span className="goal-row-marker" aria-hidden="true">{goal.completed ? '✓' : '◎'}</span>
                  <span className="goal-row-copy">
                    <span className="goal-row-title">{goal.title}</span>
                    <span className="goal-row-subtitle">{goal.completed ? 'You showed up for this.' : 'One small step is enough for today.'}</span>
                  </span>
                  <label className="goal-toggle-label">
                    <input
                      type="checkbox"
                      aria-label={`Complete goal: ${goal.title}`}
                      checked={goal.completed}
                      onChange={() => toggleGoal(goal.id)}
                    />
                    <span>{goal.completed ? 'Complete' : 'Mark complete'}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <Link className="goals-back-link" to="/app/home">← Back to your space</Link>
        </section>
      </div>
    </div>
  );
}
