/**
 * Game data: balls, click/auto upgrades, AP upgrades, levels, trivia, rebirth scaling.
 */
/** Balls: cost in AP (apCost); minRebirths gates unlock. */
export const BALLS = {
  orange:  { id: 'orange',  name: 'Classic', color: '#FF8C00', multiplier: 1,  apCost: 0,    minRebirths: 0 },
  blue:    { id: 'blue',    name: 'Cool Blue', color: '#4A90D9', multiplier: 2,  apCost: 30,   minRebirths: 0 },
  red:     { id: 'red',     name: 'Fire', color: '#E53935', multiplier: 3,  apCost: 80,   minRebirths: 0 },
  gold:    { id: 'gold',    name: 'Gold', color: '#FFD700', multiplier: 5,  apCost: 200,  minRebirths: 0 },
  green:   { id: 'green',   name: 'Court', color: '#2E7D32', multiplier: 8,  apCost: 500,  minRebirths: 0 },
  purple:  { id: 'purple',  name: 'Royal', color: '#7B1FA2', multiplier: 12, apCost: 1200, minRebirths: 1 },
  black:   { id: 'black',   name: 'Elite', color: '#212121', multiplier: 20, apCost: 3500, minRebirths: 2 },
  rainbow: { id: 'rainbow', name: 'Legend', color: '#E040FB', multiplier: 35, apCost: 10000, minRebirths: 3 },
};

/** Rebirth: each rebirth increases point costs by this much (additive). 0.12 = +12% per rebirth. */
export const REBIRTH_COST_MULT_PER = 0.12;
/** Rebirth: each rebirth gives this much more score (additive). 0.10 = +10% per rebirth. */
export const REBIRTH_BOOST_PER = 0.10;
/** First trivia appears when score reaches this. */
export const TRIVIA_FIRST_AT = 10e3;

/** Click power: cost in points, mult = points per click multiplier */
export const CLICK_UPGRADES = [
  { id: 'x2',   cost: 100,      mult: 2,   name: 'Double click' },
  { id: 'x3',   cost: 500,      mult: 3,   name: 'Triple click' },
  { id: 'x5',   cost: 2e3,      mult: 5,   name: 'Power click' },
  { id: 'x10',  cost: 12e3,     mult: 10,  name: 'Mega click' },
  { id: 'x25',  cost: 60e3,     mult: 25,  name: 'Ultra click' },
  { id: 'x50',  cost: 300e3,    mult: 50,  name: 'Super click' },
  { id: 'x100', cost: 1.5e6,    mult: 100, name: 'Hyper click' },
  { id: 'x250', cost: 8e6,      mult: 250, name: 'Max click' },
  { id: 'x500', cost: 50e6,     mult: 500, name: 'Omega click' },
  { id: 'x1k',  cost: 300e6,   mult: 1000, name: 'Ultimate click' },
];

/** Auto click: points per second */
export const AUTO_CLICK_UPGRADES = [
  { id: 'a1',  cost: 300,    perSec: 1,   name: 'Auto click 1' },
  { id: 'a2',  cost: 2.5e3,  perSec: 2,   name: 'Auto click 2' },
  { id: 'a3',  cost: 18e3,   perSec: 5,   name: 'Auto click 3' },
  { id: 'a4',  cost: 100e3,  perSec: 10,  name: 'Auto click 4' },
  { id: 'a5',  cost: 500e3,  perSec: 25,  name: 'Auto click 5' },
  { id: 'a6',  cost: 3e6,    perSec: 50,  name: 'Auto click 6' },
  { id: 'a7',  cost: 20e6,   perSec: 100, name: 'Auto click 7' },
  { id: 'a8',  cost: 120e6,  perSec: 250, name: 'Auto click 8' },
  { id: 'a9',  cost: 700e6,  perSec: 500, name: 'Auto click 9' },
];

/** AP upgrades: cost AP, give permanent score multiplier (multiplicative). Survives rebirth. */
export const AP_UPGRADES = [
  { id: 'ap1', cost: 150,  mult: 1.05, name: 'AP Boost +5%' },
  { id: 'ap2', cost: 400,  mult: 1.10, name: 'AP Boost +10%' },
  { id: 'ap3', cost: 800,  mult: 1.15, name: 'AP Boost +15%' },
  { id: 'ap4', cost: 1500, mult: 1.25, name: 'AP Boost +25%' },
  { id: 'ap5', cost: 3000, mult: 1.40, name: 'AP Boost +40%' },
  { id: 'ap6', cost: 6000, mult: 1.60, name: 'AP Boost +60%' },
  { id: 'ap7', cost: 12e3, mult: 2.00, name: 'AP Boost ×2' },
  { id: 'ap8', cost: 25e3, mult: 2.50, name: 'AP Boost ×2.5' },
  { id: 'ap9', cost: 50e3, mult: 3.00, name: 'AP Boost ×3' },
];

/** Rebirth: score threshold (reach this score to rebirth); each next requires more. */
export const REBIRTH_COST_BASE = 50e3;
/** Rebirth: threshold multiplier per rebirth. */
export const REBIRTH_COST_MULT = 1.5;
export function getRebirthCost(rebirths) {
  return Math.floor(REBIRTH_COST_BASE * Math.pow(REBIRTH_COST_MULT, rebirths ?? 0));
}

/** Score thresholds that trigger one trivia. Extended for long progression. */
export const TRIVIA_MILESTONES = [
  10e3, 25e3, 50e3, 100e3, 250e3, 500e3, 1e6, 2e6, 5e6, 10e6, 25e6, 50e6, 100e6, 250e6, 500e6, 1e9,
];

/** Base rewards for first trivia (index 0); later milestones scale up. */
export const TRIVIA_REWARD_PTS_BASE = 2000;
export const TRIVIA_REWARD_AP_BASE = 100;
/** Scale factor per milestone index (reward = BASE * (1 + index * SCALE)). */
export const TRIVIA_REWARD_SCALE = 0.3;

export function getTriviaRewardPts(milestoneIndex) {
  return Math.floor(TRIVIA_REWARD_PTS_BASE * (1 + (milestoneIndex ?? 0) * TRIVIA_REWARD_SCALE));
}

export function getTriviaRewardAP(milestoneIndex) {
  return Math.floor(TRIVIA_REWARD_AP_BASE * (1 + (milestoneIndex ?? 0) * TRIVIA_REWARD_SCALE));
}

/** Level thresholds (total score). Level index 0 = 0–99k, 1 = 100k–999k, etc. */
export const LEVEL_THRESHOLDS = [0, 100e3, 1e6, 10e6, 50e6, 100e6, 500e6, 1e9, 5e9];
export const LEVEL_NAMES = ['Rookie', 'Pro', 'All-Star', 'MVP', 'Champion', 'Legend', 'Hall of Fame', 'GOAT', 'Immortal'];

/** Prestige: cost in AP, permanent score multipliers. Only visible when rebirths >= minRebirths. Survives rebirth. */
export const PRESTIGE_UPGRADES = [
  { id: 'prestige1', cost: 500,  mult: 1.5, name: 'Prestige +50%', minRebirths: 3 },
  { id: 'prestige2', cost: 2000, mult: 2,   name: 'Prestige ×2',   minRebirths: 5 },
  { id: 'prestige3', cost: 8000, mult: 2.5, name: 'Prestige ×2.5', minRebirths: 7 },
];

export const STORAGE_KEY = 'dribbling_madness_v3';
