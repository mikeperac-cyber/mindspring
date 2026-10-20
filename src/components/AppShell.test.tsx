import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProvider } from '../app/store';
import type { StorageLike } from '../app/storage';
import { AppShell } from './AppShell';

describe('AppShell navigation', () => {
  it('renders desktop and mobile navigation with the agreed destinations', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/app/home']}>
          <AppShell>
            <p>Dashboard content</p>
          </AppShell>
        </MemoryRouter>
      </AppProvider>,
    );

    const desktop = within(screen.getByRole('navigation', { name: 'Primary navigation' }));
    expect(desktop.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/app/home');
    expect(desktop.getByRole('link', { name: 'Goals' })).toHaveAttribute('href', '/app/goals');
    expect(desktop.getByRole('link', { name: 'Habits' })).toHaveAttribute('href', '/app/habits');
    expect(desktop.getByRole('link', { name: 'Journal' })).toHaveAttribute('href', '/app/journal');
    expect(desktop.getByRole('link', { name: 'Insights' })).toHaveAttribute('href', '/app/insights');
    expect(desktop.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/app/profile');

    const mobile = within(screen.getByRole('navigation', { name: 'Mobile navigation' }));
    expect(mobile.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/app/home');
    expect(mobile.getByRole('link', { name: 'Goals' })).toHaveAttribute('href', '/app/goals');
    expect(mobile.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(mobile.getByRole('link', { name: 'Journal' })).toHaveAttribute('href', '/app/journal');
    expect(mobile.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/app/profile');
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('shows and dismisses a saved-data recovery notice', () => {
    const brokenStorage: StorageLike = {
      getItem: () => '{not json',
      setItem: () => undefined,
      removeItem: () => undefined,
    };

    render(
      <AppProvider storage={brokenStorage}>
        <MemoryRouter initialEntries={['/app/home']}>
          <AppShell><p>Dashboard content</p></AppShell>
        </MemoryRouter>
      </AppProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Saved data could not be read. A fresh space is ready.');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notice' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
