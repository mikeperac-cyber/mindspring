import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getLocalDateKey } from '../../app/model';
import { DAILY_PROMPTS, getDailyPromptIndex, WEEKLY_PROMPT } from '../../app/prompts';
import { useAppStore } from '../../app/store';
import './journal.css';

function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

export function JournalPage() {
  const { data, addJournalEntry } = useAppStore();
  const [searchParams] = useSearchParams();
  const promptParam = searchParams.get('prompt');
  const dateKey = getLocalDateKey();
  const [promptChoice, setPromptChoice] = useState<number | 'weekly'>(() =>
    promptParam === 'weekly' ? 'weekly' : getDailyPromptIndex(dateKey));
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const prompt = promptChoice === 'weekly' ? WEEKLY_PROMPT : DAILY_PROMPTS[promptChoice];

  useEffect(() => {
    setPromptChoice(promptParam === 'weekly' ? 'weekly' : getDailyPromptIndex(dateKey));
  }, [promptParam, dateKey]);

  function showAnotherPrompt() {
    setPromptChoice((current) =>
      ((current === 'weekly' ? getDailyPromptIndex(dateKey) : current) + 1) % DAILY_PROMPTS.length);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addJournalEntry(body, prompt)) {
      setError('Write a few words before saving.');
      return;
    }
    setBody('');
    setError(null);
  }

  return (
    <div className="journal-page">
      <header className="feature-page-heading">
        <div>
          <p className="eyebrow tone-journal-label">A little space to notice</p>
          <h1>A quiet place to notice.</h1>
          <p>Write what is on your mind, without needing to make it perfect.</p>
        </div>
        <div className="feature-page-sparkle tone-journal" aria-hidden="true">✎</div>
      </header>

      <section className="surface-card journal-compose section-card tone-journal" aria-labelledby="journal-compose-title">
        <div className="journal-prompt-row">
          <div className="journal-prompt">
            <span className="journal-prompt-mark" aria-hidden="true">“</span>
            <div>
              <p className="eyebrow tone-journal-label">{promptChoice === 'weekly' ? 'A weekly reflection' : 'A prompt for today'}</p>
              <h2 id="journal-compose-title">{prompt}</h2>
            </div>
          </div>
          <button className="journal-next-prompt" type="button" onClick={showAnotherPrompt}>Try another prompt <span aria-hidden="true">↻</span></button>
        </div>
        <form className="journal-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="journal-body">Your reflection</label>
          <textarea
            id="journal-body"
            rows={6}
            placeholder="Start wherever you are…"
            value={body}
            onChange={(event) => { setBody(event.target.value); setError(null); }}
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="journal-submit-row">
            <span>Your entry is saved only in this browser.</span>
            <button className="button-primary compact-button" type="submit">Save reflection <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </section>

      <section className="surface-card journal-history" aria-labelledby="journal-history-title">
        <div className="section-title-row">
          <div>
            <p className="eyebrow tone-journal-label">Your thoughts, over time</p>
            <h2 id="journal-history-title">Saved reflections</h2>
          </div>
          <span className="journal-entry-count">{data.journalEntries.length} {data.journalEntries.length === 1 ? 'entry' : 'entries'}</span>
        </div>
        {data.journalEntries.length === 0 ? (
          <div className="journal-empty-state">
            <span aria-hidden="true">✧</span>
            <p>Your journal is ready when you are.</p>
            <span>One sentence is enough to begin.</span>
          </div>
        ) : (
          <ol className="journal-entry-list">
            {data.journalEntries.map((entry) => (
              <li className="journal-entry" key={entry.id}>
                <time dateTime={entry.dateKey}>{formatDate(entry.dateKey)}</time>
                {entry.prompt && <span className="journal-entry-prompt">{entry.prompt}</span>}
                <p>{entry.body}</p>
              </li>
            ))}
          </ol>
        )}
        <Link className="journal-back-link" to="/app/home">← Back to your space</Link>
      </section>
    </div>
  );
}
