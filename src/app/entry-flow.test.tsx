import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProvider } from './store';
import { AppRouter } from './router';

function renderApp(path = '/') {
  window.history.replaceState({}, '', path);
  return render(
    <AppProvider>
      <AppRouter />
    </AppProvider>,
  );
}

describe('landing and first-run flow', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('moves from the landing page into the short onboarding flow', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: /start your journey/i }));

    expect(screen.getByRole('heading', { name: /one intention/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Your first name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'One intention for now' })).toBeInTheDocument();
  });

  it('rejects a blank name and a blank intention', async () => {
    const user = userEvent.setup();
    renderApp('/welcome');

    await user.click(screen.getByRole('button', { name: 'Enter my space' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter your name to continue.');

    await user.type(screen.getByRole('textbox', { name: 'Your first name' }), 'Maya');
    await user.click(screen.getByRole('button', { name: 'Enter my space' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please add one intention.');
  });

  it('saves a valid local profile and keeps the Home route available after reload', async () => {
    const user = userEvent.setup();
    const view = renderApp();
    await user.click(screen.getByRole('link', { name: /start your journey/i }));
    await user.type(screen.getByRole('textbox', { name: 'Your first name' }), 'Maya');
    await user.type(screen.getByRole('textbox', { name: 'One intention for now' }), 'Make room for rest');
    await user.click(screen.getByRole('button', { name: 'Enter my space' }));

    const desktopNav = within(screen.getByRole('navigation', { name: 'Primary navigation' }));
    expect(desktopNav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(JSON.parse(localStorage.getItem('mindspring:v1') ?? '{}').profile).toEqual({
      displayName: 'Maya',
      intention: 'Make room for rest',
    });

    view.unmount();
    renderApp('/app/home');
    expect(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('redirects a first-time visitor away from protected app routes', () => {
    renderApp('/app/goals');

    expect(screen.getByRole('heading', { name: /one intention/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Your first name' })).toBeInTheDocument();
  });
});
