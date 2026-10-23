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
