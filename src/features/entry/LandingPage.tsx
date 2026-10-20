import { Link } from 'react-router-dom';
import { StorageNotice } from '../../components/StorageNotice';
import './entry.css';

export function LandingPage() {
  return (
    <div className="public-page landing-page">
      <StorageNotice />
      <header className="public-header">
        <Link className="brand" to="/" aria-label="Mindspring home">
          <span className="brand-mark" aria-hidden="true">m</span>
          <span className="brand-word">mindspring</span>
        </Link>
        <span className="public-header-note">A little more room to grow</span>
      </header>

      <main className="landing-grid">
        <section className="landing-copy">
          <p className="landing-kicker"><span className="kicker-sparkle" aria-hidden="true">✳</span> A gentler way to grow</p>
          <h1>Small steps.<br /><em>More you.</em></h1>
          <p className="landing-description">
            Make space for the things that help you feel like yourself. One check-in, one kind habit, one day at a time.
          </p>
          <Link className="button-primary landing-cta" to="/welcome">
            Start your journey <span aria-hidden="true">→</span>
          </Link>
          <div className="landing-promises" aria-label="Mindspring highlights">
            <span><i aria-hidden="true">✓</i> No pressure to be perfect</span>
            <span><i aria-hidden="true">✓</i> Your space stays on this device</span>
          </div>
        </section>

        <aside className="landing-preview" aria-label="Preview of a Mindspring home screen">
          <div className="preview-orbit preview-orbit-one" aria-hidden="true" />
          <div className="preview-orbit preview-orbit-two" aria-hidden="true" />
          <div className="preview-window">
            <div className="preview-window-top">
              <span className="preview-brand"><span className="preview-brand-mark">m</span> your space</span>
              <span className="preview-day">TUESDAY · OCT 20</span>
            </div>
            <div className="preview-greeting">
              <div>
                <span className="preview-overline">A MOMENT FOR YOU</span>
                <h2>Good morning,<br />Maya.</h2>
                <p>One small step is still a step.</p>
              </div>
              <div className="preview-ring" aria-label="62 percent of today's practices complete">
                <span>62<small>%</small></span>
              </div>
            </div>
            <div className="preview-checkin">
              <div className="preview-section-heading">
                <span className="preview-color-dot tone-rose-dot" />
                <span>Daily check-in</span>
                <span className="preview-checkin-time">just for today</span>
              </div>
              <p>How are you arriving?</p>
              <div className="preview-moods" aria-label="Mood choices">
                <span>Low</span><span className="selected">Steady</span><span>Bright</span>
              </div>
            </div>
            <div className="preview-focus">
              <div className="preview-section-heading">
                <span className="preview-color-dot tone-habit-dot" />
                <span>Your focus today</span>
                <span className="preview-count">2 little things</span>
              </div>
              <div className="preview-task"><span className="task-check">✓</span><span>Drink water</span><b className="tone-habit-text">Habit</b></div>
              <div className="preview-task"><span className="task-empty" /><span>Take a 10-minute walk</span><b className="tone-goal-text">Goal</b></div>
            </div>
            <div className="preview-tags" aria-label="Color-coded areas">
              <span className="tag-goals">Goals</span><span className="tag-habits">Habits</span><span className="tag-journal">Journal</span><span className="tag-insights">Insights</span>
            </div>
          </div>
          <div className="preview-note"><span className="note-plant" aria-hidden="true">✿</span><span>Progress, at your own pace.</span></div>
        </aside>
      </main>

      <footer className="landing-footer">
        <span>Made for real life, not perfect streaks.</span>
        <span><span className="footer-lock" aria-hidden="true">⌑</span> No account needed · saved on this device</span>
      </footer>
    </div>
  );
}
