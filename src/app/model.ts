export type Mood = 'low' | 'steady' | 'bright';

export interface Profile {
  displayName: string;
  intention: string;
}

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  completedDates: string[];
}

export interface DailyCheckIn {
  dateKey: string;
  mood: Mood;
  energy: 1 | 2 | 3 | 4 | 5;
}

export interface JournalEntry {
  id: string;
  dateKey: string;
  createdAt: string;
  body: string;
  prompt?: string;
}

export interface AppData {
  profile: Profile | null;
  goals: Goal[];
  habits: Habit[];
  checkIns: DailyCheckIn[];
  journalEntries: JournalEntry[];
}

export function createEmptyAppData(): AppData {
  return {
    profile: null,
    goals: [],
    habits: [],
    checkIns: [],
    journalEntries: [],
  };
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLastSevenDateKeys(today: Date = new Date()): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index), 12);
    return getLocalDateKey(date);
  });
}

export interface TodayProgress {
  completed: number;
  total: number;
  percentage: number;
}

export function getTodayProgress(data: AppData, dateKey: string): TodayProgress {
  const checkInComplete = data.checkIns.some((checkIn) => checkIn.dateKey === dateKey);
  const habitsComplete = data.habits.filter((habit) => habit.completedDates.includes(dateKey)).length;
  const total = 1 + data.habits.length;
  const completed = Number(checkInComplete) + habitsComplete;
  return { completed, total, percentage: Math.round((completed / total) * 100) };
}
