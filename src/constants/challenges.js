/**
 * Daily and weekly challenges. Reset at midnight (daily) or Monday 00:00 (weekly).
 * Progress types: clicks_today, score_today, trivia_today, rebirths_week, clicks_week, trivia_week.
 */
export const DAILY_CHALLENGES = [
  { id: 'daily_clicks_100',   type: 'clicks_today',  requirement: 100,   reward: 5,  label: 'Tap 100 times today',      icon: '👆', period: 'daily' },
  { id: 'daily_clicks_500',   type: 'clicks_today',  requirement: 500,   reward: 12, label: 'Tap 500 times today',      icon: '🔥', period: 'daily' },
  { id: 'daily_score_50k',    type: 'score_today',   requirement: 50e3,  reward: 8,  label: 'Score 50K today',          icon: '📈', period: 'daily' },
  { id: 'daily_score_250k',   type: 'score_today',   requirement: 250e3, reward: 18, label: 'Score 250K today',         icon: '💰', period: 'daily' },
  { id: 'daily_trivia_1',     type: 'trivia_today', requirement: 1,     reward: 6,  label: 'Get 1 trivia correct today', icon: '🧠', period: 'daily' },
  { id: 'daily_trivia_3',     type: 'trivia_today', requirement: 3,     reward: 15, label: 'Get 3 trivia correct today', icon: '📚', period: 'daily' },
];

export const WEEKLY_CHALLENGES = [
  { id: 'weekly_clicks_1k',   type: 'clicks_week',   requirement: 1000,  reward: 15, label: 'Tap 1,000 times this week', icon: '✋', period: 'weekly' },
  { id: 'weekly_clicks_5k',   type: 'clicks_week',   requirement: 5e3,   reward: 35, label: 'Tap 5,000 times this week', icon: '💪', period: 'weekly' },
  { id: 'weekly_rebirth_1',   type: 'rebirths_week', requirement: 1,     reward: 25, label: 'Rebirth once this week',    icon: '🔄', period: 'weekly' },
  { id: 'weekly_rebirth_2',   type: 'rebirths_week', requirement: 2,     reward: 55, label: 'Rebirth twice this week',   icon: '🔁', period: 'weekly' },
  { id: 'weekly_trivia_5',    type: 'trivia_week',  requirement: 5,     reward: 30, label: 'Get 5 trivia correct this week', icon: '🎓', period: 'weekly' },
  { id: 'weekly_trivia_10',   type: 'trivia_week',  requirement: 10,    reward: 60, label: 'Get 10 trivia correct this week', icon: '🏅', period: 'weekly' },
];

export const ALL_CHALLENGES = [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES];

/** Get start of week (Monday) as YYYY-MM-DD */
export function getWeekStartDateString(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

/** Get today as YYYY-MM-DD */
export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}
