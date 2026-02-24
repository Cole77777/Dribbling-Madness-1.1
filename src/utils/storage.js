import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from '../constants/gameData';

const REQUIRED_KEYS = ['score', 'apPoints', 'currentBall', 'unlockedBalls', 'currentTab', 'completedAchievements', 'settings'];

function isValidGameState(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return REQUIRED_KEYS.every((k) => obj.hasOwnProperty(k));
}

export async function loadGameData() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    if (data.gameState && !isValidGameState(data.gameState)) return null;
    if (data.apSpent != null && typeof data.apSpent !== 'number') data.apSpent = 0;
    return data;
  } catch (e) {
    if (__DEV__) console.warn('[DribblingMadness] loadGameData error:', e);
    return null;
  }
}

export async function saveGameData(gameState, apSpent) {
  try {
    if (!isValidGameState(gameState)) return;
    const payload = { gameState, apSpent: Number(apSpent) || 0, timestamp: Date.now() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    if (__DEV__) console.warn('[DribblingMadness] saveGameData error:', e);
  }
}
