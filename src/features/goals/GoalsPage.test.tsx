import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { createEmptyAppData } from '../../app/model';
import { AppProvider } from '../../app/store';
import { STORAGE_KEY } from '../../app/storage';
import { GoalsPage } from './GoalsPage';

function renderGoals() {
  const data = { ...createEmptyAppData(), profile: { displayName: 'Maya', intention: 'Make room for rest' } };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return render(<MemoryRouter><AppProvider><GoalsPage /></AppProvider></MemoryRouter>);
}

describe('Goals page', () => {
  beforeEach(() => localStorage.clear());

  it('adds a trimmed goal and saves completion changes', async () => {
    const user = userEvent.setup();
    renderGoals();

    await user.type(screen.getByRole('textbox', { name: 'New goal' }), '  Read for pleasure  ');
    await user.click(screen.getByRole('button', { name: 'Add goal' }));
    const completion = screen.getByRole('checkbox', { name: 'Complete goal: Read for pleasure' });
    expect(completion).not.toBeChecked();
    await user.click(completion);
    expect(screen.getByRole('checkbox', { name: 'Complete goal: Read for pleasure' })).toBeChecked();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(saved.goals).toEqual([expect.objectContaining({ title: 'Read for pleasure', completed: true })]);
  });

  it('rejects blank goal titles', async () => {
    const user = userEvent.setup();
    renderGoals();
    await user.type(screen.getByRole('textbox', { name: 'New goal' }), '   ');
    await user.click(screen.getByRole('button', { name: 'Add goal' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Give your goal a name first.');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').goals).toEqual([]);
  });
});
