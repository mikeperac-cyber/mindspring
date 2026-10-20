import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';

function Placeholder({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <section className="page-placeholder">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="muted-copy">A little space to notice what matters and take your next small step.</p>
    </section>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder eyebrow="A gentler kind of progress" title="Small steps can change a lot." />} />
        <Route path="/welcome" element={<Placeholder eyebrow="Your space begins here" title="Choose one intention." />} />
        <Route path="/app" element={<AppShell />}>
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
    </BrowserRouter>
  );
}
