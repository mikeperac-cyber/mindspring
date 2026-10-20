import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { createEmptyAppData } from '../../app/model';
import { AppProvider } from '../../app/store';
import { STORAGE_KEY } from '../../app/storage';
import { AppRoutes } from '../../app/router';

describe('Profile page', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...createEmptyAppData(), profile: { displayName: 'Maya', intention: 'Make room for rest' },
    }));
  });

  it('saves profile edits in browser storage', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/app/profile']}><AppProvider><AppRoutes /></AppProvider></MemoryRouter>);

    await user.clear(screen.getByRole('textbox', { name: 'Your name' }));
    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Maya R.');
    await user.clear(screen.getByRole('textbox', { name: 'Your intention' }));
    await user.type(screen.getByRole('textbox', { name: 'Your intention' }), 'Trust my pace');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    expect(screen.getByText('Your profile is up to date.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').profile)
      .toEqual({ displayName: 'Maya R.', intention: 'Trust my pace' });
  });

  it('confirms before clearing data, then returns to onboarding', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/app/profile']}><AppProvider><AppRoutes /></AppProvider></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: 'Clear all local data' }));
    expect(screen.getByRole('alertdialog', { name: 'Clear your local data?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep my data' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Clear data and return to welcome' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Keep my data' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear all local data' }));
    await user.click(screen.getByRole('button', { name: 'Keep my data' }));
    expect(screen.getByRole('heading', { name: 'Your space, your settings.' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear all local data' }));
    await user.click(screen.getByRole('button', { name: 'Clear data and return to welcome' }));
    expect(await screen.findByRole('heading', { name: /Let’s begin with/ })).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
