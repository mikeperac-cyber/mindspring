import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getLocalDateKey } from '@mindspring/core';

function millisecondsUntilNextLocalDay(now: Date): number {
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return Math.max(1_000, nextDay.getTime() - now.getTime());
}

export function useLocalToday(): string {
  const [dateKey, setDateKey] = useState(() => getLocalDateKey());

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;

    const scheduleNextMidnight = () => {
      timer = setTimeout(() => {
        refreshDate();
      }, millisecondsUntilNextLocalDay(new Date()));
    };

    const refreshDate = () => {
      if (disposed) return;
      setDateKey(getLocalDateKey());
      clearTimeout(timer);
      scheduleNextMidnight();
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshDate();
    });

    scheduleNextMidnight();
    return () => {
      disposed = true;
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return dateKey;
}
