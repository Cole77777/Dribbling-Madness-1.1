/**
 * Optional SFX: tap and achievement. Uses expo-av.
 * Call initSound() once (e.g. on app load). Then playTap() / playAchievement() when enabled.
 */
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let tapSound = null;
let achievementSound = null;
let initialized = false;

export async function initSound() {
  if (initialized || Platform.OS === 'web') return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentMode: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    initialized = true;
  } catch (_) {}
}

export async function playTap() {
  if (Platform.OS === 'web' || !initialized) return;
  try {
    if (!tapSound) {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/tap.wav'),
        { shouldPlay: false, volume: 0.28 }
      );
      tapSound = sound;
    }
    await tapSound.setPositionAsync(0);
    await tapSound.playAsync();
  } catch (_) {}
}

export async function playAchievement() {
  if (Platform.OS === 'web' || !initialized) return;
  try {
    if (!achievementSound) {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/achievement.wav'),
        { shouldPlay: false, volume: 0.5 }
      );
      achievementSound = sound;
    }
    await achievementSound.setPositionAsync(0);
    await achievementSound.playAsync();
  } catch (_) {}
}
