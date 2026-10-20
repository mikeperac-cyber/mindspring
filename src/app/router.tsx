import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useAppStore } from './store';
import { LandingPage } from '../features/entry/LandingPage';
import { OnboardingPage } from '../features/entry/OnboardingPage';
import { HomePage } from '../features/home/HomePage';
import { HabitsPage } from '../features/habits/HabitsPage';
import { GoalsPage } from '../features/goals/GoalsPage';
import { JournalPage } from '../features/journal/JournalPage';
import { InsightsPage } from '../features/insights/InsightsPage';
import { ProfilePage } from '../features/profile/ProfilePage';

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
          <Route path="home" element={<HomePage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="profile" element={<ProfilePage />} />
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
