/**
 * Daily and weekly challenges. Reset at midnight (daily) or Monday 00:00 (weekly).
 * Progress types: clicks_today, score_today, trivia_today, run_score, rebirths_week, clicks_week, trivia_week.
 * run_score = current run score (no snapshot); claim when score >= requirement.
 * score_week = totalScore gained this week (snapshot has totalScore).
 */
export const DAILY_CHALLENGES = [
  { id: 'daily_clicks_100',   type: 'clicks_today',  requirement: 100,   reward: 5,  label: 'Tap 100 times today',      icon: '👆', period: 'daily' },
  { id: 'daily_clicks_500',   type: 'clicks_today',  requirement: 500,   reward: 12, label: 'Tap 500 times today',      icon: '🔥', period: 'daily' },
  { id: 'daily_clicks_1k',    type: 'clicks_today',  requirement: 1e3,   reward: 18, label: 'Tap 1,000 times today',     icon: '✋', period: 'daily' },
  { id: 'daily_score_50k',    type: 'score_today',   requirement: 50e3,  reward: 8,  label: 'Score 50K today',          icon: '📈', period: 'daily' },
  { id: 'daily_score_250k',   type: 'score_today',   requirement: 250e3, reward: 18, label: 'Score 250K today',         icon: '💰', period: 'daily' },
  { id: 'daily_score_500k',   type: 'score_today',   requirement: 500e3, reward: 28, label: 'Score 500K today',         icon: '📊', period: 'daily' },
  { id: 'daily_run_100k',     type: 'run_score',     requirement: 100e3, reward: 12, label: 'Reach 100K in one run today', icon: '🎯', period: 'daily' },
  { id: 'daily_trivia_1',     type: 'trivia_today', requirement: 1,     reward: 6,  label: 'Get 1 trivia correct today', icon: '🧠', period: 'daily' },
  { id: 'daily_trivia_3',     type: 'trivia_today', requirement: 3,     reward: 15, label: 'Get 3 trivia correct today', icon: '📚', period: 'daily' },
];

export const WEEKLY_CHALLENGES = [
  { id: 'weekly_clicks_1k',   type: 'clicks_week',   requirement: 1000,  reward: 15, label: 'Tap 1,000 times this week', icon: '✋', period: 'weekly' },
  { id: 'weekly_clicks_5k',   type: 'clicks_week',   requirement: 5e3,   reward: 35, label: 'Tap 5,000 times this week', icon: '💪', period: 'weekly' },
  { id: 'weekly_clicks_10k',  type: 'clicks_week',   requirement: 10e3,  reward: 50, label: 'Tap 10,000 times this week', icon: '🔥', period: 'weekly' },
  { id: 'weekly_score_1m',    type: 'score_week',    requirement: 1e6,   reward: 45, label: 'Score 1M total this week',  icon: '📈', period: 'weekly' },
  { id: 'weekly_rebirth_1',   type: 'rebirths_week', requirement: 1,     reward: 25, label: 'Rebirth once this week',    icon: '🔄', period: 'weekly' },
  { id: 'weekly_rebirth_2',   type: 'rebirths_week', requirement: 2,     reward: 55, label: 'Rebirth twice this week',   icon: '🔁', period: 'weekly' },
  { id: 'weekly_run_500k',    type: 'run_score',     requirement: 500e3, reward: 40, label: 'Reach 500K in one run',      icon: '🎯', period: 'weekly' },
  { id: 'weekly_trivia_5',    type: 'trivia_week',  requirement: 5,     reward: 30, label: 'Get 5 trivia correct this week', icon: '🎓', period: 'weekly' },
  { id: 'weekly_trivia_10',   type: 'trivia_week',  requirement: 10,    reward: 60, label: 'Get 10 trivia correct this week', icon: '🏅', period: 'weekly' },
];

export const ALL_CHALLENGES = [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES];

/** Number of daily/weekly challenges to show (rotation). */
const DAILY_PICK = 4;
const WEEKLY_PICK = 5;

/** Deterministic index from date string for rotation. */
function seedFromDate(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) h = ((h << 5) - h) + dateStr.charCodeAt(i) | 0;
  return Math.abs(h);
}

/** Get the subset of daily challenges for today (rotates by day). */
export function getActiveDailyChallenges(todayStr) {
  const seed = seedFromDate(todayStr);
  const n = DAILY_CHALLENGES.length;
  const start = seed % n;
  return Array.from({ length: DAILY_PICK }, (_, i) => DAILY_CHALLENGES[(start + i) % n]);
}

/** Get the subset of weekly challenges for this week (rotates by week). */
export function getActiveWeeklyChallenges(weekStartStr) {
  const seed = seedFromDate(weekStartStr);
  const n = WEEKLY_CHALLENGES.length;
  const start = seed % n;
  return Array.from({ length: WEEKLY_PICK }, (_, i) => WEEKLY_CHALLENGES[(start + i) % n]);
}

/** Get start of week (Monday) as YYYY-MM-DD in local time */
export function getWeekStartDateString(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  const y = d.getFullYear(), m = d.getMonth(), da = d.getDate();
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(da).padStart(2, '0')}`;
}

/** Get today as YYYY-MM-DD in local time (resets at local midnight) */
export function getTodayDateString() {
  const d = new Date();
  const y = d.getFullYear(), m = d.getMonth(), da = d.getDate();
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(da).padStart(2, '0')}`;
}
