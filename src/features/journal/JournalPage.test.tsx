import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { createEmptyAppData, getLocalDateKey } from '../../app/model';
import { AppProvider } from '../../app/store';
import { STORAGE_KEY } from '../../app/storage';
import { JournalPage } from './JournalPage';

describe('Journal page', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...createEmptyAppData(), profile: { displayName: 'Maya', intention: 'Notice small wins' },
    }));
  });

  it('saves a trimmed reflection with today’s local date', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AppProvider><JournalPage /></AppProvider></MemoryRouter>);

    await user.type(screen.getByRole('textbox', { name: 'Your reflection' }), '  I made time to rest.  ');
    await user.click(screen.getByRole('button', { name: 'Save reflection' }));

    expect(screen.getByText('I made time to rest.')).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(saved.journalEntries).toEqual([expect.objectContaining({
      body: 'I made time to rest.', dateKey: getLocalDateKey(),
    })]);
  });

  it('rejects a blank reflection', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AppProvider><JournalPage /></AppProvider></MemoryRouter>);
    await user.type(screen.getByRole('textbox', { name: 'Your reflection' }), '   ');
    await user.click(screen.getByRole('button', { name: 'Save reflection' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Write a few words before saving.');
  });
});
