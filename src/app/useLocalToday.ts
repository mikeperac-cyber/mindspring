import { useEffect, useState } from 'react';
import { getLocalDateKey } from './model';

/** Keep date-based screens current when a tab stays open overnight or resumes from sleep. */
export function useLocalToday(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function refresh() {
      const now = new Date();
      setToday((previous) => getLocalDateKey(previous) === getLocalDateKey(now) ? previous : now);
    }

    function scheduleNextDay() {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(() => {
        refresh();
        scheduleNextDay();
      }, nextMidnight.getTime() - now.getTime() + 100);
    }

    function refreshOnResume() {
      if (!document.hidden) {
        refresh();
        clearTimeout(timer);
        scheduleNextDay();
      }
    }

    scheduleNextDay();
    window.addEventListener('focus', refreshOnResume);
    document.addEventListener('visibilitychange', refreshOnResume);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refreshOnResume);
      document.removeEventListener('visibilitychange', refreshOnResume);
    };
  }, []);

  return today;
}
