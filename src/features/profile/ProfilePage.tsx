import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../app/store';
import './profile.css';

export function ProfilePage() {
  const { data, updateProfile, clearData } = useAppStore();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(data.profile?.displayName ?? '');
  const [intention, setIntention] = useState(data.profile?.intention ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const wasDialogOpen = useRef(false);

  useEffect(() => {
    if (confirmOpen) cancelButtonRef.current?.focus();
    else if (wasDialogOpen.current) clearButtonRef.current?.focus();
    wasDialogOpen.current = confirmOpen;
  }, [confirmOpen]);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!updateProfile({ displayName, intention })) {
      setError('Add your name and one intention to save your profile.');
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(true);
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setConfirmOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;

    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
    const firstButton = buttons.item(0);
    const lastButton = buttons.item(buttons.length - 1);
    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault();
      lastButton?.focus();
    } else if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault();
      firstButton?.focus();
    }
  }

  function handleClear() {
    clearData();
    setConfirmOpen(false);
    navigate('/welcome');
  }

  return (
    <div className="profile-page">
      <header className="feature-page-heading">
        <div>
          <p className="eyebrow tone-profile-label">This space is yours</p>
          <h1>Your space, your settings.</h1>
          <p>Keep your intention close, and adjust it whenever life changes.</p>
        </div>
        <div className="feature-page-sparkle tone-profile" aria-hidden="true">○</div>
      </header>

      <section className="surface-card profile-edit-card section-card tone-profile" aria-labelledby="profile-edit-title">
        <div className="profile-card-heading">
          <span className="profile-avatar" aria-hidden="true">{(displayName.trim()[0] ?? 'M').toUpperCase()}</span>
          <div>
            <p className="eyebrow tone-profile-label">A gentle reminder</p>
            <h2 id="profile-edit-title">A little about you</h2>
          </div>
        </div>
        <form className="profile-form" onSubmit={handleSave} noValidate>
          <div className="profile-field">
            <label htmlFor="profile-display-name">Your name</label>
            <input
              id="profile-display-name"
              type="text"
              autoComplete="given-name"
              value={displayName}
              onChange={(event) => { setDisplayName(event.target.value); setSaved(false); setError(null); }}
            />
          </div>
          <div className="profile-field">
            <label htmlFor="profile-intention">Your intention</label>
            <textarea
              id="profile-intention"
              rows={3}
              value={intention}
              onChange={(event) => { setIntention(event.target.value); setSaved(false); setError(null); }}
            />
            <span className="profile-field-hint">It can be simple. It can change.</span>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="profile-save-row">
            <button className="button-primary compact-button" type="submit">Save profile <span aria-hidden="true">→</span></button>
            {saved && <span className="profile-saved-note" role="status">Your profile is up to date.</span>}
          </div>
        </form>
      </section>

      <section className="surface-card profile-privacy-card" aria-labelledby="privacy-title">
        <div className="profile-privacy-copy">
          <span className="privacy-icon" aria-hidden="true">⌑</span>
          <div>
            <p className="eyebrow">Your privacy</p>
            <h2 id="privacy-title">Your data stays in this browser.</h2>
            <p>Mindspring does not use an account or send your reflections to a server.</p>
          </div>
        </div>
        <span className="local-only-badge">Local only</span>
      </section>

      <section className="profile-clear-section" aria-labelledby="clear-data-title">
        <div>
          <p className="eyebrow profile-clear-eyebrow">Start fresh</p>
          <h2 id="clear-data-title">Clear your local data</h2>
          <p>This removes your profile, goals, habits, check-ins, and journal entries from this browser.</p>
        </div>
        <button ref={clearButtonRef} className="button-danger-outline" type="button" onClick={() => setConfirmOpen(true)}>
          Clear all local data
        </button>
      </section>

      {confirmOpen && (
        <div className="dialog-backdrop">
          <div
            className="clear-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-confirm-title"
            aria-describedby="clear-confirm-copy"
            onKeyDown={handleDialogKeyDown}
          >
            <span className="dialog-icon" aria-hidden="true">!</span>
            <p className="eyebrow profile-clear-eyebrow">One last check</p>
            <h2 id="clear-confirm-title">Clear your local data?</h2>
            <p id="clear-confirm-copy">This permanently removes your saved profile and activity from this browser. You’ll return to the welcome flow.</p>
            <div className="dialog-actions">
              <button ref={cancelButtonRef} className="button-secondary" type="button" onClick={() => setConfirmOpen(false)}>Keep my data</button>
              <button className="button-danger" type="button" onClick={handleClear}>Clear data and return to welcome</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
