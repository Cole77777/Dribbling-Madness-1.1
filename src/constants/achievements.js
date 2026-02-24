/**
 * Achievements: id, name, requirement, type, reward (AP), icon.
 * AP rewards balanced for economy: balls 0–10k AP, prestige 500–8k AP, AP upgrades 150–50k.
 */
export const ACHIEVEMENTS = [
  // --- Clicks (early = small AP so spam doesn’t buy balls; scales with real effort) ---
  { id: 'click_10',    name: 'Getting started',  requirement: 10,     type: 'clicks',      reward: 3,   icon: '🏀' },
  { id: 'click_50',    name: 'Warm up',          requirement: 50,     type: 'clicks',      reward: 6,   icon: '👆' },
  { id: 'click_100',   name: 'Century',          requirement: 100,    type: 'clicks',      reward: 10,  icon: '💯' },
  { id: 'click_500',   name: 'Tap tap tap',      requirement: 500,    type: 'clicks',      reward: 20,  icon: '✋' },
  { id: 'click_1k',    name: 'Grinder',          requirement: 1000,   type: 'clicks',      reward: 40,  icon: '🔥' },
  { id: 'click_5k',   name: 'Committed',        requirement: 5e3,    type: 'clicks',      reward: 85,  icon: '⭐' },
  { id: 'click_10k',  name: 'Dedicated',        requirement: 10e3,   type: 'clicks',      reward: 140, icon: '🌟' },
  { id: 'click_50k',  name: 'Click machine',     requirement: 50e3,   type: 'clicks',      reward: 280, icon: '🤖' },
  { id: 'click_100k', name: 'Unstoppable',      requirement: 100e3,  type: 'clicks',      reward: 450, icon: '💪' },
  { id: 'click_500k', name: 'Legendary taps',   requirement: 500e3,  type: 'clicks',      reward: 750, icon: '👑' },
  { id: 'click_1m',   name: 'Million clicks',   requirement: 1e6,    type: 'clicks',      reward: 1100, icon: '🏆' },
  // --- Balls (rewards ~match ball apCost progression: 30,80,200,500,1200,3500,10k) ---
  { id: 'ball_2',     name: 'Collector',         requirement: 2,     type: 'balls',       reward: 40,  icon: '🌈' },
  { id: 'ball_3',     name: 'Variety',          requirement: 3,     type: 'balls',       reward: 70,  icon: '🎨' },
  { id: 'ball_4',     name: 'Squad',            requirement: 4,     type: 'balls',       reward: 120, icon: '🔮' },
  { id: 'ball_5',     name: 'Ball hoarder',     requirement: 5,     type: 'balls',       reward: 200, icon: '✨' },
  { id: 'ball_6',     name: 'Showcase',         requirement: 6,     type: 'balls',       reward: 350, icon: '💎' },
  { id: 'ball_7',     name: 'Almost full',      requirement: 7,     type: 'balls',       reward: 550, icon: '🔶' },
  { id: 'ball_8',     name: 'Complete set',     requirement: 8,     type: 'balls',       reward: 900, icon: '🎯' },
  // --- Speed (low AP so Court/500 AP isn’t reachable in seconds from speed alone) ---
  { id: 'speed_5',    name: 'Quick tap',         requirement: 5,    type: 'speed',       reward: 5,   icon: '⚡' },
  { id: 'speed_15',   name: 'Quick hands',      requirement: 15,   type: 'speed',       reward: 12,  icon: '💨' },
  { id: 'speed_30',   name: 'Speed demon',      requirement: 30,   type: 'speed',       reward: 25,  icon: '🔥' },
  { id: 'speed_40',   name: 'Lightning',        requirement: 40,   type: 'speed',       reward: 40,  icon: '⚡' },
  { id: 'speed_60',   name: 'Blur',             requirement: 60,   type: 'speed',       reward: 65,  icon: '👻' },
  // --- Rebirths (no AP from rebirth; these reward commitment; help buy prestige 500/2k/8k) ---
  { id: 'rebirth_1',  name: 'Reborn',           requirement: 1,    type: 'rebirths',    reward: 200, icon: '🔄' },
  { id: 'rebirth_3',  name: 'Third time',       requirement: 3,    type: 'rebirths',    reward: 350, icon: '🔁' },
  { id: 'rebirth_5',  name: 'Veteran',          requirement: 5,    type: 'rebirths',    reward: 550, icon: '👑' },
  { id: 'rebirth_10', name: 'Prestige',         requirement: 10,   type: 'rebirths',    reward: 900, icon: '💫' },
  { id: 'rebirth_15', name: 'Master',           requirement: 15,   type: 'rebirths',    reward: 1400, icon: '🎖️' },
  { id: 'rebirth_25', name: 'Immortal',         requirement: 25,   type: 'rebirths',    reward: 2500, icon: '🌟' },
  // --- Trivia (main AP income; keep meaningful but not overwhelming) ---
  { id: 'trivia_3',   name: 'Curious',          requirement: 3,    type: 'trivia_ok',   reward: 45,  icon: '🧠' },
  { id: 'trivia_5',   name: 'Trivia fan',       requirement: 5,    type: 'trivia_ok',   reward: 75,  icon: '📖' },
  { id: 'trivia_10',  name: 'Smart cookie',     requirement: 10,   type: 'trivia_ok',   reward: 140, icon: '📚' },
  { id: 'trivia_15',  name: 'Trivia master',    requirement: 15,   type: 'trivia_ok',   reward: 220, icon: '🎓' },
  { id: 'trivia_25',  name: 'Scholar',          requirement: 25,   type: 'trivia_ok',   reward: 400, icon: '🏅' },
  { id: 'trivia_50',  name: 'Genius',           requirement: 50,   type: 'trivia_ok',   reward: 750, icon: '💡' },
  // --- Login streak ---
  { id: 'streak_3',   name: 'Three day',        requirement: 3,    type: 'login_streak', reward: 50,  icon: '📅' },
  { id: 'streak_7',   name: 'Week streak',      requirement: 7,    type: 'login_streak', reward: 120, icon: '📆' },
  { id: 'streak_14',  name: 'Two weeks',        requirement: 14,   type: 'login_streak', reward: 280, icon: '🗓️' },
  { id: 'streak_30',  name: 'Monthly',          requirement: 30,   type: 'login_streak', reward: 600, icon: '📌' },
  // --- Total score ---
  { id: 'score_100k',  name: 'Point collector',  requirement: 100e3,   type: 'total_score', reward: 90,  icon: '📈' },
  { id: 'score_1m',    name: 'Millionaire',     requirement: 1e6,    type: 'total_score', reward: 250, icon: '💰' },
  { id: 'score_10m',   name: 'High roller',     requirement: 10e6,   type: 'total_score', reward: 500, icon: '🎰' },
  { id: 'score_100m',  name: 'Tycoon',          requirement: 100e6,   type: 'total_score', reward: 1000, icon: '🌐' },
  { id: 'score_1b',    name: 'Billionaire',     requirement: 1e9,    type: 'total_score', reward: 2000, icon: '👑' },
];
