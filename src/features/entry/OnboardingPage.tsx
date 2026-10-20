import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StorageNotice } from '../../components/StorageNotice';
import { useAppStore } from '../../app/store';
import './entry.css';

export function OnboardingPage() {
  const [displayName, setDisplayName] = useState('');
  const [intention, setIntention] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { completeOnboarding } = useAppStore();
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your name to continue.');
      return;
    }
    if (!intention.trim()) {
      setError('Please add one intention.');
      return;
    }
    if (completeOnboarding({ displayName, intention })) navigate('/app/home');
  }

  return (
    <div className="public-page onboarding-page">
      <StorageNotice />
      <header className="public-header onboarding-header">
        <Link className="brand" to="/" aria-label="Mindspring home">
          <span className="brand-mark" aria-hidden="true">m</span>
          <span className="brand-word">mindspring</span>
        </Link>
        <span className="onboarding-step"><span>01</span> / 01 <span className="step-label">FIRST, ONE INTENTION</span></span>
      </header>

      <main className="onboarding-layout">
        <div className="onboarding-side-note" aria-hidden="true">
          <span className="onboarding-flower">✳</span>
          <p>You don’t have to<br />figure it all out today.</p>
          <span className="side-note-line" />
        </div>

        <section className="onboarding-card" aria-labelledby="onboarding-title">
          <p className="eyebrow">A fresh start, at your pace</p>
          <h1 id="onboarding-title">Let’s begin with<br /><em>one intention.</em></h1>
          <p className="onboarding-intro">A little about you helps make this space feel like yours. You can change it any time.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="display-name">Your first name</label>
              <input
                id="display-name"
                name="displayName"
                type="text"
                autoComplete="given-name"
                placeholder="Maya"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="intention">One intention for now</label>
              <textarea
                id="intention"
                name="intention"
                rows={3}
                placeholder="What would you like to make a little more room for?"
                value={intention}
                onChange={(event) => setIntention(event.target.value)}
                required
              />
              <span className="field-hint">It can be simple. It can change.</span>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button-primary onboarding-submit" type="submit">
              Enter my space <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="onboarding-privacy"><span aria-hidden="true">⌑</span> Your profile stays in this browser. No account or password needed.</p>
          <Link className="back-link" to="/">← Back to the beginning</Link>
        </section>
      </main>
    </div>
  );
}
