import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useAppStore } from './store';
import { LandingPage } from '../features/entry/LandingPage';
import { OnboardingPage } from '../features/entry/OnboardingPage';

function Placeholder({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <section className="page-placeholder">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="muted-copy">A little space to notice what matters and take your next small step.</p>
    </section>
  );
}

function ProtectedAppRoute() {
  const { data } = useAppStore();
  return data.profile ? <AppShell /> : <Navigate to="/welcome" replace />;
}

function WelcomeRoute() {
  const { data } = useAppStore();
  return data.profile ? <Navigate to="/app/home" replace /> : <OnboardingPage />;
}

export function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/welcome" element={<WelcomeRoute />} />
        <Route path="/app" element={<ProtectedAppRoute />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Placeholder eyebrow="Your daily pause" title="Good morning." />} />
          <Route path="goals" element={<Placeholder eyebrow="Goals" title="Make room for what matters." />} />
          <Route path="habits" element={<Placeholder eyebrow="Habits" title="Small actions, gently repeated." />} />
          <Route path="journal" element={<Placeholder eyebrow="Journal" title="A quiet place to notice." />} />
          <Route path="insights" element={<Placeholder eyebrow="Insights" title="Your progress, in perspective." />} />
          <Route path="profile" element={<Placeholder eyebrow="Profile" title="Your space, your settings." />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
