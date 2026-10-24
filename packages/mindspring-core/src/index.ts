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
  note?: string;
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
  return { profile: null, goals: [], habits: [], checkIns: [], journalEntries: [] };
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRecentDateKeys(count: number, today: Date = new Date()): string[] {
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return Array.from({ length: safeCount }, (_, index) => {
    const offset = safeCount - 1 - index;
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset, 12);
    return getLocalDateKey(date);
  });
}

export function getLastSevenDateKeys(today: Date = new Date()): string[] {
  return getRecentDateKeys(7, today);
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearPart, monthPart, dayPart] = match;
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isAppData(value: unknown): value is AppData {
  if (!isRecord(value)) return false;
  const { profile, goals, habits, checkIns, journalEntries } = value;
  const validProfile = profile === null || (
    isRecord(profile) && typeof profile.displayName === 'string' && typeof profile.intention === 'string'
  );
  const validGoals = Array.isArray(goals) && goals.every((goal) => (
    isRecord(goal) && typeof goal.id === 'string' && typeof goal.title === 'string' && typeof goal.completed === 'boolean'
  ));
  const validHabits = Array.isArray(habits) && habits.every((habit) => (
    isRecord(habit) && typeof habit.id === 'string' && typeof habit.title === 'string' &&
    Array.isArray(habit.completedDates) && habit.completedDates.every(isDateKey)
  ));
  const validCheckIns = Array.isArray(checkIns) && checkIns.every((checkIn) => (
    isRecord(checkIn) && isDateKey(checkIn.dateKey) &&
    ['low', 'steady', 'bright'].includes(String(checkIn.mood)) &&
    Number.isInteger(checkIn.energy) && Number(checkIn.energy) >= 1 && Number(checkIn.energy) <= 5 &&
    (checkIn.note === undefined || typeof checkIn.note === 'string')
  ));
  const validJournalEntries = Array.isArray(journalEntries) && journalEntries.every((entry) => (
    isRecord(entry) && typeof entry.id === 'string' && isDateKey(entry.dateKey) &&
    typeof entry.createdAt === 'string' && typeof entry.body === 'string' &&
    (entry.prompt === undefined || typeof entry.prompt === 'string')
  ));
  return validProfile && validGoals && validHabits && validCheckIns && validJournalEntries;
}

export interface WeeklyDay {
  dateKey: string;
  checkIn: boolean;
  habitCompletions: number;
  mood: Mood | null;
  energy: number | null;
}

export interface WeeklySummary {
  days: WeeklyDay[];
  checkInDays: number;
  habitCompletions: number;
  moodCounts: Record<Mood, number>;
  averageEnergy: number | null;
}

export interface ActivityDay {
  dateKey: string;
  checkIn: DailyCheckIn | null;
  habitCompletions: number;
  reflections: number;
}

export function summarizeLastSevenDays(data: AppData, today: Date = new Date()): WeeklySummary {
  const checkInsByDate = new Map(data.checkIns.map((checkIn) => [checkIn.dateKey, checkIn]));
  const days: WeeklyDay[] = getLastSevenDateKeys(today).map((dateKey) => {
    const checkIn = checkInsByDate.get(dateKey);
    return {
      dateKey,
      checkIn: Boolean(checkIn),
      habitCompletions: data.habits.filter((habit) => habit.completedDates.includes(dateKey)).length,
      mood: checkIn?.mood ?? null,
      energy: checkIn?.energy ?? null,
    };
  });
  const moodCounts: Record<Mood, number> = { low: 0, steady: 0, bright: 0 };
  const recordedEnergy: number[] = [];
  days.forEach((day) => {
    if (day.mood) moodCounts[day.mood] += 1;
    if (day.energy !== null) recordedEnergy.push(day.energy);
  });
  return {
    days,
    checkInDays: days.filter((day) => day.checkIn).length,
    habitCompletions: days.reduce((total, day) => total + day.habitCompletions, 0),
    moodCounts,
    averageEnergy: recordedEnergy.length
      ? Math.round(recordedEnergy.reduce((total, energy) => total + energy, 0) / recordedEnergy.length * 10) / 10
      : null,
  };
}

export function summarizeLastThirtyDays(data: AppData, today: Date = new Date()): ActivityDay[] {
  const checkIns = new Map(data.checkIns.map((checkIn) => [checkIn.dateKey, checkIn]));
  const reflections = new Map<string, number>();
  data.journalEntries.forEach((entry) => reflections.set(entry.dateKey, (reflections.get(entry.dateKey) ?? 0) + 1));
  const recentDates = getRecentDateKeys(30, today);
  const recentDateSet = new Set(recentDates);
  const habitCompletions = new Map<string, number>();
  data.habits.forEach((habit) => habit.completedDates.forEach((dateKey) => {
    if (recentDateSet.has(dateKey)) habitCompletions.set(dateKey, (habitCompletions.get(dateKey) ?? 0) + 1);
  }));
  return recentDates.map((dateKey) => ({
    dateKey,
    checkIn: checkIns.get(dateKey) ?? null,
    habitCompletions: habitCompletions.get(dateKey) ?? 0,
    reflections: reflections.get(dateKey) ?? 0,
  }));
}

export const themes = [
  { id: 'berry', name: 'Berry', description: 'Warm plum and rose' },
  { id: 'coastal', name: 'Coastal', description: 'Cool sea and sky' },
  { id: 'grove', name: 'Grove', description: 'Soft green and earth' },
] as const;

export type ThemeId = (typeof themes)[number]['id'];
export type ThemeAppearance = 'light' | 'dark';

export interface ThemeTokens {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  primaryText: string;
  goals: string;
  habits: string;
  journal: string;
  insights: string;
  success: string;
  warning: string;
  danger: string;
}

const themeTokens: Record<ThemeId, Record<ThemeAppearance, ThemeTokens>> = {
  berry: {
    light: {
      background: '#FBF7F8', surface: '#FFFFFF', surfaceAlt: '#F7EAF0', text: '#2F1C29', mutedText: '#755F6C', border: '#E9D8E1',
      primary: '#49273F', primaryText: '#FFFFFF', goals: '#9A3D6C', habits: '#B96583', journal: '#79618D', insights: '#9B731A',
      success: '#34735B', warning: '#8B6414', danger: '#A43F4E',
    },
    dark: {
      background: '#1E141B', surface: '#2B1D27', surfaceAlt: '#392632', text: '#F8EDF3', mutedText: '#C7B3BF', border: '#513B4A',
      primary: '#E7A2C1', primaryText: '#321725', goals: '#E78AB5', habits: '#E6A0B5', journal: '#C2A9DE', insights: '#E7C36D',
      success: '#8DD0AE', warning: '#E8C66E', danger: '#F39AA3',
    },
  },
  coastal: {
    light: {
      background: '#F4FAFB', surface: '#FFFFFF', surfaceAlt: '#E8F4F5', text: '#18333A', mutedText: '#557078', border: '#D4E7E9',
      primary: '#185B63', primaryText: '#FFFFFF', goals: '#286C83', habits: '#3D8A87', journal: '#596F9B', insights: '#9A6B27',
      success: '#347458', warning: '#886116', danger: '#A0444D',
    },
    dark: {
      background: '#101D21', surface: '#1A2B30', surfaceAlt: '#23383D', text: '#E8F5F6', mutedText: '#AAC0C4', border: '#355158',
      primary: '#77C9C4', primaryText: '#102629', goals: '#79C9E2', habits: '#75D1C2', journal: '#A9B7F0', insights: '#E4C06A',
      success: '#8BD4A5', warning: '#EAC875', danger: '#F19BA0',
    },
  },
  grove: {
    light: {
      background: '#F7FAF5', surface: '#FFFFFF', surfaceAlt: '#EDF3E9', text: '#263326', mutedText: '#5F6E5A', border: '#DDE8D8',
      primary: '#3D6343', primaryText: '#FFFFFF', goals: '#775C89', habits: '#507A58', journal: '#98704F', insights: '#6E792A',
      success: '#367353', warning: '#916115', danger: '#A24844',
    },
    dark: {
      background: '#151C16', surface: '#212B22', surfaceAlt: '#2D392D', text: '#ECF3E9', mutedText: '#B8C4B2', border: '#435141',
      primary: '#A6CE9D', primaryText: '#1D2D1E', goals: '#C7A8DF', habits: '#9FD1A0', journal: '#DBB18A', insights: '#CCD27C',
      success: '#8FD2A0', warning: '#E8C779', danger: '#F0A09B',
    },
  },
};

export function isThemeId(value: unknown): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

export function getThemeTokens(theme: ThemeId, appearance: ThemeAppearance): ThemeTokens {
  return themeTokens[theme][appearance];
}

export const DAILY_PROMPTS = [
  'What helped you feel present today?',
  'What gave you a little energy today?',
  'Which small moment would you like to remember?',
  'What felt difficult, and what helped?',
  'What did you do today that deserves kindness?',
  'What would you like a little more of tomorrow?',
  'What felt easier than it used to?',
] as const;

export const WEEKLY_PROMPT = 'What would you like to carry into next week?';

export function getDailyPromptIndex(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  return ((dayNumber % DAILY_PROMPTS.length) + DAILY_PROMPTS.length) % DAILY_PROMPTS.length;
}
