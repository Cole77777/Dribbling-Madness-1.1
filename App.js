import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Alert,
  AppState,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors, spacing, radius, typography } from './theme.js';
import {
  BALLS,
  CLICK_UPGRADES,
  AUTO_CLICK_UPGRADES,
  AP_UPGRADES,
  getRebirthCost,
  REBIRTH_COST_MULT_PER,
  REBIRTH_BOOST_PER,
  TRIVIA_MILESTONES,
  FACT_INTERVAL_MS,
  RUN_MILESTONES,
  getTriviaRewardPts,
  getTriviaRewardAP,
  STORAGE_KEY,
  LEVEL_THRESHOLDS,
  LEVEL_NAMES,
  PRESTIGE_UPGRADES,
} from './src/constants/gameData.js';
import { ACHIEVEMENTS } from './src/constants/achievements.js';
import { ALL_CHALLENGES, getTodayDateString, getWeekStartDateString, getActiveDailyChallenges, getActiveWeeklyChallenges } from './src/constants/challenges.js';
import { TRIVIA_QUESTIONS } from './src/constants/trivia.js';
import { BASKETBALL_TIPS } from './src/constants/tips.js';
import { formatNumber } from './src/utils/formatNumber.js';
import { initSound, playTap, playAchievement } from './src/utils/sound.js';

const TABS = [
  { id: 'play', label: 'Play', icon: '🏀' },
  { id: 'shop', label: 'Shop', icon: '🛒' },
  { id: 'awards', label: 'Awards', icon: '🏆' },
  { id: 'challenges', label: 'Challenges', icon: '🎯' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function initialState() {
  return {
    score: 0,
    ap: 0,
    rebirths: 0,
    totalClicks: 0,
    totalScore: 0,
    clickMult: 1,
    autoPerSec: 0,
    currentBall: 'orange',
    unlockedBalls: ['orange'],
    completedAchievements: [],
    boughtApUpgrades: [],
    boughtPrestigeUpgrades: [],
    triviaMilestonesDone: [],
    triviaAskedThisRun: [],
    settings: { haptic: true, animations: true, sound: false },
    clicksIn10s: 0,
    loginStreak: 0,
    lastLoginDate: new Date().toDateString(),
    triviaAnswered: 0,
    triviaCorrect: 0,
    tab: 'play',
    showTrivia: false,
    currentTrivia: null,
    triviaSelected: null,
    triviaSubmitted: false,
    triviaRewardIndex: 0,
    didYouKnowIndex: 0,
    newAchievementPopups: [],
    challengeLastDailyReset: null,
    challengeLastWeeklyReset: null,
    challengeDaySnapshot: null,
    challengeWeekSnapshot: null,
    challengeClaimed: {},
    runMilestoneToast: null,
    runMilestonesCelebrated: [],
    showHelpModal: false,
    helpSeenOnce: false,
  };
}

function hapticTap() {
  if (Platform.OS === 'web') return;
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (_) {}
}

function hapticAchievement() {
  if (Platform.OS === 'web') return;
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (_) {}
}

function ScorePop({ value, onDone }) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(ty, { toValue: -44, duration: 600, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => {
      Animated.timing(op, { toValue: 0, duration: 180, useNativeDriver: true }).start(onDone);
    }, 450);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={[s.popup, { opacity: op, transform: [{ translateY: ty }] }]} pointerEvents="none">
      <Text style={s.popupText}>+{formatNumber(value)}</Text>
    </Animated.View>
  );
}

class ErrorBoundary extends React.Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    if (this.state.err) {
      return (
        <View style={[s.container, s.center]}>
          <Text style={[typography.title, { color: colors.text }]}>Something went wrong</Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>Restart the app to continue.</Text>
          <TouchableOpacity style={[s.primaryBtn, { marginTop: spacing.xl }]} onPress={() => this.setState({ err: false })}>
            <Text style={s.primaryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function Game() {
  const [state, setState] = useState(initialState);
  const [popups, setPopups] = useState([]);
  const [achievementCanDismiss, setAchievementCanDismiss] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const saveRef = useRef(null);
  const stateRef = useRef(state);
  const triviaOverlayOp = useRef(new Animated.Value(0)).current;
  const triviaCardScale = useRef(new Animated.Value(0.92)).current;
  const achOverlayOp = useRef(new Animated.Value(0)).current;
  const achCardScale = useRef(new Animated.Value(0.92)).current;
  const tabOpacities = useRef(TABS.map(t => new Animated.Value(t.id === 'play' ? 1 : 0))).current;
  const getTabOpacity = (tabId) => tabOpacities[TABS.findIndex(t => t.id === tabId)];
  stateRef.current = state;
  const ball = BALLS[state.currentBall] || BALLS.orange;
  const rebirths = state.rebirths || 0;
  const costMult = 1 + rebirths * REBIRTH_COST_MULT_PER;
  const rebirthBoost = 1 + rebirths * REBIRTH_BOOST_PER;
  const apBonusMult = (state.boughtApUpgrades || []).reduce((m, id) => {
    const u = AP_UPGRADES.find(x => x.id === id);
    return m * (u ? u.mult : 1);
  }, 1);
  const prestigeMult = (state.boughtPrestigeUpgrades || []).reduce((m, id) => {
    const u = PRESTIGE_UPGRADES.find(x => x.id === id);
    return m * (u ? u.mult : 1);
  }, 1);
  const clickValue = Math.floor(state.clickMult * ball.multiplier * apBonusMult * rebirthBoost * prestigeMult);
  const levelIndex = LEVEL_THRESHOLDS.reduce((i, t, idx) => (state.totalScore >= t ? idx : i), 0);
  const levelName = LEVEL_NAMES[Math.min(levelIndex, LEVEL_NAMES.length - 1)];

  useEffect(() => {
    initSound();
  }, []);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (c) return;
        if (!raw) {
          setState(prev => ({ ...prev, showHelpModal: true }));
          return;
        }
        const d = JSON.parse(raw);
        if (d?.state && typeof d.state.score === 'number') {
          const loaded = d.state;
          setState(prev => ({
            ...prev,
            ...loaded,
            score: typeof loaded.score === 'number' ? loaded.score : prev.score,
            ap: typeof loaded.ap === 'number' ? loaded.ap : prev.ap,
            rebirths: typeof loaded.rebirths === 'number' ? loaded.rebirths : prev.rebirths,
            totalClicks: loaded.totalClicks ?? loaded.totalTaps ?? 0,
            totalScore: typeof loaded.totalScore === 'number' ? loaded.totalScore : prev.totalScore,
            clickMult: typeof loaded.clickMult === 'number' ? loaded.clickMult : prev.clickMult,
            autoPerSec: typeof loaded.autoPerSec === 'number' ? loaded.autoPerSec : prev.autoPerSec,
            currentBall: loaded.currentBall || prev.currentBall,
            unlockedBalls: Array.isArray(loaded.unlockedBalls) ? loaded.unlockedBalls : prev.unlockedBalls,
            completedAchievements: Array.isArray(loaded.completedAchievements) ? loaded.completedAchievements : prev.completedAchievements,
            boughtApUpgrades: Array.isArray(loaded.boughtApUpgrades) ? loaded.boughtApUpgrades : [],
            boughtPrestigeUpgrades: Array.isArray(loaded.boughtPrestigeUpgrades) ? loaded.boughtPrestigeUpgrades : [],
            triviaMilestonesDone: Array.isArray(loaded.triviaMilestonesDone) ? loaded.triviaMilestonesDone : [],
            triviaAskedThisRun: Array.isArray(loaded.triviaAskedThisRun) ? loaded.triviaAskedThisRun : [],
            settings: {
              haptic: loaded.settings?.haptic !== false,
              animations: loaded.settings?.animations !== false,
              sound: loaded.settings?.sound === true,
            },
            clicksIn10s: loaded.clicksIn10s ?? loaded.tapsIn10s ?? 0,
            loginStreak: typeof loaded.loginStreak === 'number' ? loaded.loginStreak : prev.loginStreak,
            lastLoginDate: loaded.lastLoginDate || prev.lastLoginDate,
            triviaAnswered: typeof loaded.triviaAnswered === 'number' ? loaded.triviaAnswered : prev.triviaAnswered,
            triviaCorrect: typeof loaded.triviaCorrect === 'number' ? loaded.triviaCorrect : prev.triviaCorrect,
            newAchievementPopups: [],
            showTrivia: false,
            currentTrivia: null,
            challengeLastDailyReset: loaded.challengeLastDailyReset ?? prev.challengeLastDailyReset,
            challengeLastWeeklyReset: loaded.challengeLastWeeklyReset ?? prev.challengeLastWeeklyReset,
            challengeDaySnapshot: loaded.challengeDaySnapshot ?? prev.challengeDaySnapshot,
            challengeWeekSnapshot: loaded.challengeWeekSnapshot ?? prev.challengeWeekSnapshot,
            challengeClaimed: loaded.challengeClaimed && typeof loaded.challengeClaimed === 'object' ? loaded.challengeClaimed : prev.challengeClaimed,
            runMilestonesCelebrated: Array.isArray(loaded.runMilestonesCelebrated) ? loaded.runMilestonesCelebrated : [],
            helpSeenOnce: loaded.helpSeenOnce === true,
          }));
        } else {
          setState(prev => ({ ...prev, showHelpModal: true }));
        }
        const today = new Date().toDateString();
        setState(prev => {
          if (prev.lastLoginDate === today) return prev;
          const last = new Date(prev.lastLoginDate).getTime();
          const days = Math.floor((Date.now() - last) / 86400000);
          const streak = days === 1 ? prev.loginStreak + 1 : days > 1 ? 1 : prev.loginStreak;
          return { ...prev, lastLoginDate: today, loginStreak: streak };
        });
      } catch (_) {}
    })();
    return () => { c = true; };
  }, []);

  useEffect(() => {
    const today = getTodayDateString();
    const weekStart = getWeekStartDateString(new Date());
    setState(prev => {
      const needDaily = prev.challengeLastDailyReset === null || prev.challengeLastDailyReset !== today || prev.challengeDaySnapshot == null;
      const needWeekly = prev.challengeLastWeeklyReset === null || prev.challengeLastWeeklyReset !== weekStart || prev.challengeWeekSnapshot == null;
      if (!needDaily && !needWeekly) return prev;
      const next = { ...prev, challengeClaimed: { ...prev.challengeClaimed } };
      if (needDaily) {
        next.challengeLastDailyReset = today;
        next.challengeDaySnapshot = { totalClicks: prev.totalClicks, totalScore: prev.totalScore, triviaCorrect: prev.triviaCorrect };
        ALL_CHALLENGES.filter(c => c.period === 'daily').forEach(c => delete next.challengeClaimed[c.id]);
      }
      if (needWeekly) {
        next.challengeLastWeeklyReset = weekStart;
        next.challengeWeekSnapshot = { rebirths: prev.rebirths, totalClicks: prev.totalClicks, triviaCorrect: prev.triviaCorrect, totalScore: prev.totalScore };
        ALL_CHALLENGES.filter(c => c.period === 'weekly').forEach(c => delete next.challengeClaimed[c.id]);
      }
      return next;
    });
  }, [state.totalClicks, state.rebirths, state.triviaCorrect, state.challengeLastDailyReset, state.challengeLastWeeklyReset]);

  useEffect(() => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      try {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ state: stateRef.current }));
      } catch (_) {}
    }, 1000);
    return () => { if (saveRef.current) clearTimeout(saveRef.current); };
  }, [state]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        if (saveRef.current) {
          clearTimeout(saveRef.current);
          saveRef.current = null;
        }
        try {
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ state: stateRef.current }));
        } catch (_) {}
      }
    });
    return () => sub?.remove?.();
  }, []);

  useEffect(() => {
    if (state.autoPerSec <= 0) return;
    const apMult = (state.boughtApUpgrades || []).reduce((m, id) => m * (AP_UPGRADES.find(x => x.id === id)?.mult ?? 1), 1);
    const prestigeMultVal = (state.boughtPrestigeUpgrades || []).reduce((m, id) => m * (PRESTIGE_UPGRADES.find(x => x.id === id)?.mult ?? 1), 1);
    const rebirthBoostVal = 1 + (state.rebirths || 0) * REBIRTH_BOOST_PER;
    const gain = state.autoPerSec * ball.multiplier * apMult * rebirthBoostVal * prestigeMultVal;
    const id = setInterval(() => {
      setState(prev => {
        const newScore = prev.score + gain;
        const done = prev.triviaMilestonesDone || [];
        const nextMilestone = TRIVIA_MILESTONES.find(M => newScore >= M && !done.includes(M));
        const next = {
          ...prev,
          score: newScore,
          totalClicks: prev.totalClicks + state.autoPerSec,
          totalScore: prev.totalScore + gain,
        };
        if (nextMilestone != null && !prev.showTrivia && Array.isArray(TRIVIA_QUESTIONS) && TRIVIA_QUESTIONS.length > 0) {
          const asked = prev.triviaAskedThisRun || [];
          const indices = TRIVIA_QUESTIONS.map((_, i) => i);
          const unasked = indices.filter(i => !asked.includes(i));
          if (unasked.length > 0) {
            const idx = unasked[Math.floor(Math.random() * unasked.length)];
            next.showTrivia = true;
            next.currentTrivia = TRIVIA_QUESTIONS[idx];
            next.triviaSelected = null;
            next.triviaSubmitted = false;
            next.triviaMilestonesDone = [...done, nextMilestone];
            next.triviaAskedThisRun = [...asked, idx];
            next.triviaRewardIndex = done.length;
          }
        }
        const celebrated = prev.runMilestonesCelebrated || [];
        const crossed = RUN_MILESTONES.find(M => prev.score < M && newScore >= M && !celebrated.includes(M));
        if (crossed != null) {
          next.runMilestoneToast = formatNumber(crossed) + ' run!';
          next.runMilestonesCelebrated = [...celebrated, crossed];
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.autoPerSec, state.boughtApUpgrades, state.boughtPrestigeUpgrades, state.rebirths, ball.multiplier]);

  useEffect(() => {
    const id = setInterval(() => setState(prev => ({ ...prev, clicksIn10s: 0 })), 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const done = state.completedAchievements;
    const unlock = [];
    ACHIEVEMENTS.forEach(a => {
      if (done.includes(a.id)) return;
      let v = 0;
      if (a.type === 'clicks') v = state.totalClicks;
      else if (a.type === 'balls') v = state.unlockedBalls.length;
      else if (a.type === 'speed') v = state.clicksIn10s;
      else if (a.type === 'rebirths') v = state.rebirths;
      else if (a.type === 'trivia_ok') v = state.triviaCorrect;
      else if (a.type === 'login_streak') v = state.loginStreak;
      else if (a.type === 'total_score') v = state.totalScore;
      if (v >= a.requirement) unlock.push(a);
    });
    if (unlock.length === 0) return;
    const reward = unlock.reduce((sum, a) => sum + a.reward, 0);
    if (state.settings.sound) playAchievement();
    if (state.settings.haptic) hapticAchievement();
    setState(prev => ({
      ...prev,
      completedAchievements: [...prev.completedAchievements, ...unlock.map(a => a.id)],
      ap: prev.ap + reward,
      newAchievementPopups: [...(prev.newAchievementPopups || []), ...unlock],
    }));
  }, [state.totalClicks, state.unlockedBalls.length, state.clicksIn10s, state.rebirths, state.triviaCorrect, state.loginStreak, state.totalScore]);

  const onTap = useCallback(() => {
    setState(prev => {
      const next = {
        ...prev,
        score: prev.score + clickValue,
        totalClicks: prev.totalClicks + 1,
        totalScore: prev.totalScore + clickValue,
        clicksIn10s: prev.clicksIn10s + 1,
      };
      const done = prev.triviaMilestonesDone || [];
      const nextMilestone = TRIVIA_MILESTONES.find(M => next.score >= M && !done.includes(M));
      if (nextMilestone != null && !prev.showTrivia && Array.isArray(TRIVIA_QUESTIONS) && TRIVIA_QUESTIONS.length > 0) {
        const asked = prev.triviaAskedThisRun || [];
        const indices = TRIVIA_QUESTIONS.map((_, i) => i);
        const unasked = indices.filter(i => !asked.includes(i));
        if (unasked.length > 0) {
          const idx = unasked[Math.floor(Math.random() * unasked.length)];
          next.showTrivia = true;
          next.currentTrivia = TRIVIA_QUESTIONS[idx];
          next.triviaSelected = null;
          next.triviaSubmitted = false;
          next.triviaMilestonesDone = [...done, nextMilestone];
          next.triviaAskedThisRun = [...asked, idx];
          next.triviaRewardIndex = done.length;
        }
      }
      const celebrated = prev.runMilestonesCelebrated || [];
      const crossed = RUN_MILESTONES.find(M => prev.score < M && next.score >= M && !celebrated.includes(M));
      if (crossed != null) {
        next.runMilestoneToast = formatNumber(crossed) + ' run!';
        next.runMilestonesCelebrated = [...celebrated, crossed];
      }
      return next;
    });
    if (state.settings.haptic) hapticTap();
    if (state.settings.sound) playTap();
    if (state.settings.animations) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 50, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 200 }),
      ]).start();
    }
    setPopups(p => [...p.slice(-5), { id: Date.now(), value: clickValue }]);
  }, [clickValue, state.settings, scale]);

  const removePopup = useCallback(id => setPopups(p => p.filter(x => x.id !== id)), []);

  const submitTrivia = useCallback(() => {
    if (state.triviaSelected == null || !state.currentTrivia) return;
    const ok = state.triviaSelected === state.currentTrivia.correct;
    const rewardIndex = state.triviaRewardIndex ?? 0;
    const pts = ok ? getTriviaRewardPts(rewardIndex) : 0;
    const ap = ok ? getTriviaRewardAP(rewardIndex) : 0;
    setState(prev => ({
      ...prev,
      triviaSubmitted: true,
      triviaAnswered: prev.triviaAnswered + 1,
      triviaCorrect: ok ? prev.triviaCorrect + 1 : prev.triviaCorrect,
      score: prev.score + pts,
      ap: prev.ap + ap,
    }));
  }, [state.triviaSelected, state.currentTrivia, state.triviaRewardIndex]);

  const closeTrivia = useCallback(() => {
    setState(prev => ({ ...prev, showTrivia: false, currentTrivia: null, triviaSelected: null, triviaSubmitted: false, triviaRewardIndex: 0 }));
  }, []);

  const rebirthCost = getRebirthCost(state.rebirths);
  const rebirth = useCallback(() => {
    if (state.score < rebirthCost) return;
    setState(prev => ({
      ...prev,
      score: 0,
      clickMult: 1,
      autoPerSec: 0,
      currentBall: 'orange',
      unlockedBalls: ['orange'],
      rebirths: prev.rebirths + 1,
      showTrivia: false,
      currentTrivia: null,
      triviaSelected: null,
      triviaSubmitted: false,
      triviaRewardIndex: 0,
      triviaMilestonesDone: [],
      triviaAskedThisRun: [],
      runMilestoneToast: null,
      runMilestonesCelebrated: [],
    }));
  }, [state.score, state.rebirths]);

  const buyApUpgrade = useCallback((item) => {
    if (state.ap < item.cost || (state.boughtApUpgrades || []).includes(item.id)) return;
    setState(prev => ({
      ...prev,
      ap: prev.ap - item.cost,
      boughtApUpgrades: [...(prev.boughtApUpgrades || []), item.id],
    }));
  }, [state.ap, state.boughtApUpgrades]);

  const buyClick = useCallback((item) => {
    const cost = Math.floor(item.cost * costMult);
    if (state.score < cost || state.clickMult >= item.mult) return;
    setState(prev => ({ ...prev, score: prev.score - cost, clickMult: item.mult }));
  }, [state.score, state.clickMult, costMult]);

  const buyAuto = useCallback((item) => {
    const cost = Math.floor(item.cost * costMult);
    if (state.score < cost || state.autoPerSec >= item.perSec) return;
    setState(prev => ({ ...prev, score: prev.score - cost, autoPerSec: item.perSec }));
  }, [state.score, state.autoPerSec, costMult]);

  const selectBall = useCallback((id) => {
    if (state.unlockedBalls.includes(id)) {
      setState(prev => ({ ...prev, currentBall: id }));
      return;
    }
    const b = BALLS[id];
    const minReb = b?.minRebirths ?? 0;
    const apCost = b?.apCost ?? 0;
    if (!b || state.rebirths < minReb || state.ap < apCost) return;
    setState(prev => ({
      ...prev,
      ap: prev.ap - apCost,
      unlockedBalls: [...prev.unlockedBalls, id],
      currentBall: id,
    }));
  }, [state.unlockedBalls, state.ap, state.rebirths]);

  const buyPrestigeUpgrade = useCallback((item) => {
    if (state.rebirths < item.minRebirths || state.ap < item.cost || (state.boughtPrestigeUpgrades || []).includes(item.id)) return;
    setState(prev => ({
      ...prev,
      ap: prev.ap - item.cost,
      boughtPrestigeUpgrades: [...(prev.boughtPrestigeUpgrades || []), item.id],
    }));
  }, [state.ap, state.rebirths, state.boughtPrestigeUpgrades]);

  const resetData = useCallback(() => {
    const doReset = async () => {
      try { await AsyncStorage.removeItem(STORAGE_KEY); } catch (_) {}
      setState(prev => ({ ...initialState(), settings: prev.settings }));
    };
    if (Platform.OS !== 'web' && Alert?.alert) {
      Alert.alert('Reset all data?', 'Progress will be permanently deleted. This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: doReset },
      ]);
    } else if (typeof window !== 'undefined' && window.confirm?.('Reset all data? Progress will be deleted.')) {
      doReset();
    } else {
      doReset();
    }
  }, []);

  const setTab = t => setState(prev => ({ ...prev, tab: t }));
  const toggleSetting = k => setState(prev => ({ ...prev, settings: { ...prev.settings, [k]: !prev.settings[k] } }));

  const progress = (a) => {
    if (a.type === 'clicks') return state.totalClicks;
    if (a.type === 'balls') return state.unlockedBalls.length;
    if (a.type === 'speed') return state.clicksIn10s;
    if (a.type === 'rebirths') return state.rebirths;
    if (a.type === 'trivia_ok') return state.triviaCorrect;
    if (a.type === 'login_streak') return state.loginStreak;
    if (a.type === 'total_score') return state.totalScore;
    return 0;
  };

  function getChallengeProgress(c) {
    if (c.type === 'run_score') return state.score;
    const snap = c.period === 'daily' ? state.challengeDaySnapshot : state.challengeWeekSnapshot;
    if (!snap) return 0;
    switch (c.type) {
      case 'clicks_today': return Math.max(0, state.totalClicks - (snap.totalClicks ?? 0));
      case 'score_today': return Math.max(0, state.totalScore - (snap.totalScore ?? 0));
      case 'trivia_today': return Math.max(0, state.triviaCorrect - (snap.triviaCorrect ?? 0));
      case 'clicks_week': return Math.max(0, state.totalClicks - (snap.totalClicks ?? 0));
      case 'score_week': return Math.max(0, state.totalScore - (snap.totalScore ?? 0));
      case 'rebirths_week': return Math.max(0, state.rebirths - (snap.rebirths ?? 0));
      case 'trivia_week': return Math.max(0, state.triviaCorrect - (snap.triviaCorrect ?? 0));
      default: return 0;
    }
  }

  const claimChallenge = useCallback((c) => {
    setState(prev => {
      if (prev.challengeClaimed[c.id]) return prev;
      let prog = 0;
      if (c.type === 'run_score') {
        prog = prev.score;
      } else {
        const snap = c.period === 'daily' ? prev.challengeDaySnapshot : prev.challengeWeekSnapshot;
        if (!snap) return prev;
        switch (c.type) {
          case 'clicks_today': prog = prev.totalClicks - (snap.totalClicks ?? 0); break;
          case 'score_today': prog = prev.totalScore - (snap.totalScore ?? 0); break;
          case 'trivia_today': prog = prev.triviaCorrect - (snap.triviaCorrect ?? 0); break;
          case 'clicks_week': prog = prev.totalClicks - (snap.totalClicks ?? 0); break;
          case 'score_week': prog = prev.totalScore - (snap.totalScore ?? 0); break;
          case 'rebirths_week': prog = prev.rebirths - (snap.rebirths ?? 0); break;
          case 'trivia_week': prog = prev.triviaCorrect - (snap.triviaCorrect ?? 0); break;
          default: break;
        }
      }
      if (prog < c.requirement) return prev;
      if (prev.settings.haptic) hapticAchievement();
      if (prev.settings.sound) playAchievement();
      return {
        ...prev,
        ap: prev.ap + c.reward,
        challengeClaimed: { ...prev.challengeClaimed, [c.id]: true },
      };
    });
  }, []);

  const activeDailyChallenges = getActiveDailyChallenges(getTodayDateString());
  const activeWeeklyChallenges = getActiveWeeklyChallenges(getWeekStartDateString(new Date()));
  const hasClaimableChallenge = [...activeDailyChallenges, ...activeWeeklyChallenges].some(c => !state.challengeClaimed[c.id] && getChallengeProgress(c) >= c.requirement);

  const dismissAchievementPopup = useCallback(() => {
    if (!achievementCanDismiss) return;
    setState(prev => ({
      ...prev,
      newAchievementPopups: (prev.newAchievementPopups || []).slice(1),
    }));
    setAchievementCanDismiss(false);
  }, [achievementCanDismiss]);

  const currentAchievementForPopup = (state.newAchievementPopups || [])[0];
  useEffect(() => {
    if (!currentAchievementForPopup) return;
    setAchievementCanDismiss(false);
    const t = setTimeout(() => setAchievementCanDismiss(true), 1800);
    return () => clearTimeout(t);
  }, [currentAchievementForPopup?.id]);

  useEffect(() => {
    if (!state.showTrivia || !state.currentTrivia) return;
    triviaOverlayOp.setValue(0);
    triviaCardScale.setValue(0.92);
    Animated.parallel([
      Animated.timing(triviaOverlayOp, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(triviaCardScale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 120 }),
    ]).start();
  }, [state.showTrivia, state.currentTrivia]);

  useEffect(() => {
    const cur = (state.newAchievementPopups || [])[0];
    if (!cur) return;
    achOverlayOp.setValue(0);
    achCardScale.setValue(0.92);
    Animated.parallel([
      Animated.timing(achOverlayOp, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(achCardScale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 120 }),
    ]).start();
  }, [currentAchievementForPopup?.id]);

  useEffect(() => {
    if (!state.runMilestoneToast) return;
    const t = setTimeout(() => setState(prev => ({ ...prev, runMilestoneToast: null })), 2500);
    return () => clearTimeout(t);
  }, [state.runMilestoneToast]);

  useEffect(() => {
    const id = setInterval(() => {
      setState(prev => {
        const len = Array.isArray(BASKETBALL_TIPS) ? BASKETBALL_TIPS.length : 0;
        if (len === 0) return prev;
        return { ...prev, didYouKnowIndex: (prev.didYouKnowIndex + 1) % len };
      });
    }, FACT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const activeIdx = TABS.findIndex(t => t.id === state.tab);
    if (activeIdx < 0) return;
    const anims = TABS.map((_, i) =>
      Animated.timing(tabOpacities[i], { toValue: i === activeIdx ? 1 : 0, duration: state.settings.animations ? 180 : 0, useNativeDriver: true })
    );
    Animated.parallel(anims).start();
  }, [state.tab, state.settings.animations]);

  const triviaModal = state.showTrivia && state.currentTrivia && (
    <Animated.View style={[s.modalOverlay, { opacity: triviaOverlayOp }]} pointerEvents="auto">
      <Animated.View style={[s.modalCard, { transform: [{ scale: triviaCardScale }] }]}>
        <Text style={s.modalTitle}>Trivia</Text>
        <Text style={s.modalQuestion}>{state.currentTrivia.question}</Text>
        <View style={s.answers}>
          {state.currentTrivia.answers.map((ans, i) => (
            <TouchableOpacity
              key={i}
              style={[
                s.answerBtn,
                state.triviaSelected === i && s.answerSelected,
                state.triviaSubmitted && i === state.currentTrivia.correct && s.answerCorrect,
                state.triviaSubmitted && state.triviaSelected === i && i !== state.currentTrivia.correct && s.answerWrong,
              ]}
              onPress={() => !state.triviaSubmitted && setState(prev => ({ ...prev, triviaSelected: i }))}
              disabled={state.triviaSubmitted}
            >
              <Text style={s.answerText}>{ans}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {state.triviaSubmitted && (
          <Text style={state.triviaSelected === state.currentTrivia.correct ? s.resultOk : s.resultBad}>
            {state.triviaSelected === state.currentTrivia.correct
              ? `Correct! +${formatNumber(getTriviaRewardPts(state.triviaRewardIndex ?? 0))} pts, +${getTriviaRewardAP(state.triviaRewardIndex ?? 0)} AP`
              : 'Wrong — better luck next time!'}
          </Text>
        )}
        {state.triviaSubmitted ? (
          <TouchableOpacity style={s.primaryBtn} onPress={closeTrivia}>
            <Text style={s.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.primaryBtn, state.triviaSelected == null && s.btnDisabled]} onPress={submitTrivia} disabled={state.triviaSelected == null}>
            <Text style={s.primaryBtnText}>Submit</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );

  const currentAchievement = (state.newAchievementPopups || [])[0];
  const achievementPopup = currentAchievement ? (
    <Animated.View style={[s.modalOverlay, { opacity: achOverlayOp }]} pointerEvents="auto">
      <Animated.View style={[s.modalCard, s.achievementPopupCard, { transform: [{ scale: achCardScale }] }]}>
        <Text style={s.achievementPopupTitle}>Achievement unlocked!</Text>
        <Text style={s.achievementPopupIcon}>{currentAchievement.icon}</Text>
        <Text style={s.achievementPopupName}>{currentAchievement.name}</Text>
        <Text style={s.achievementPopupReward}>+{currentAchievement.reward} AP</Text>
        <TouchableOpacity
          style={[s.primaryBtn, !achievementCanDismiss && s.btnDisabled]}
          onPress={dismissAchievementPopup}
          disabled={!achievementCanDismiss}
        >
          <Text style={s.primaryBtnText}>{achievementCanDismiss ? 'Nice!' : '...'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  ) : null;

  const playAccent = state.tab === 'play' && ball.theme?.accent ? ball.theme.accent : null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <LinearGradient
          colors={state.tab === 'play' && ball.theme?.gradient ? ball.theme.gradient : [colors.background, colors.court]}
          style={s.gradient}
        >
        <View style={s.header}>
          <View style={s.scoreCard}>
            <Text style={s.scoreLabel}>Score</Text>
            <Text style={s.scoreValue}>{formatNumber(state.score)}</Text>
          </View>
          <View style={s.scoreCard}>
            <Text style={s.scoreLabel}>AP</Text>
            <Text style={s.scoreValue}>{formatNumber(state.ap)}</Text>
          </View>
          {levelIndex === 0 && (
            <TouchableOpacity style={s.helpBtnOverlay} onPress={() => setState(prev => ({ ...prev, showHelpModal: true }))}>
              <Text style={s.helpBtnText}>?</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity key={t.id} style={[s.tab, state.tab === t.id && s.tabActive]} onPress={() => setTab(t.id)}>
              <View style={s.tabIconWrap}>
                <Text style={s.tabIcon}>{t.icon}</Text>
                {t.id === 'challenges' && hasClaimableChallenge && (
                  <View style={s.tabBadge}>
                    <Text style={s.tabBadgeText}>!</Text>
                  </View>
                )}
              </View>
              <Text style={[s.tabLabel, state.tab === t.id && s.tabLabelActive]} numberOfLines={1}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {state.tab === 'play' && (
          <Animated.View style={[s.tabPanel, { opacity: getTabOpacity('play') }]}>
            <View style={s.logoBlock}>
              <Text style={s.logoTitle}>Dribbling Madness</Text>
              <View style={s.levelRow}>
                <Text style={[s.levelBadgeText, playAccent && { color: playAccent }]}>{levelName}</Text>
                <Text style={s.triviaUnlockText}>
                  {(() => {
                    const done = state.triviaMilestonesDone || [];
                    const nextAt = TRIVIA_MILESTONES.find(M => !done.includes(M));
                    return nextAt != null ? `Trivia at ${formatNumber(nextAt)}` : 'Trivia (next run)';
                  })()}
                </Text>
              </View>
            </View>
            {state.runMilestoneToast ? (
              <View style={[s.runMilestoneBanner, playAccent && { borderColor: playAccent, backgroundColor: playAccent + '33' }]}>
                <Text style={[s.runMilestoneBannerText, playAccent && { color: playAccent }]}>🎉 {state.runMilestoneToast}</Text>
              </View>
            ) : null}
            <View style={s.ballZone}>
              {popups.map(p => (
                <ScorePop key={p.id} value={p.value} onDone={() => removePopup(p.id)} />
              ))}
              <TouchableOpacity activeOpacity={1} onPress={onTap} style={s.ballTouch}>
                <Animated.View style={[s.ballOuter, { transform: [{ scale }] }, playAccent && { borderColor: playAccent }]}>
                  <View style={[s.ballInner, { backgroundColor: ball.color }]} />
                  <Text style={s.ballEmoji}>🏀</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
            {state.autoPerSec > 0 && (
              <View style={s.autoBadge}>
                <Text style={s.autoText}>+{formatNumber(Math.floor(state.autoPerSec * ball.multiplier * apBonusMult * rebirthBoost * prestigeMult))}/s</Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                s.rebirthBtn,
                state.score < rebirthCost && s.rebirthDisabled,
                state.score >= rebirthCost && s.rebirthCanAfford,
                state.score >= rebirthCost && playAccent && { borderColor: playAccent, backgroundColor: playAccent + '22', shadowColor: playAccent },
              ]}
              onPress={rebirth}
              disabled={state.score < rebirthCost}
            >
              <Text style={[s.rebirthText, state.score >= rebirthCost && (playAccent ? { color: playAccent } : s.rebirthTextAfford)]}>{state.score >= rebirthCost ? 'Rebirth ready!' : 'Rebirth'}</Text>
              <Text style={[s.rebirthSub, state.score >= rebirthCost && s.rebirthSubAfford]}>{formatNumber(rebirthCost)} pts · +{Math.round((state.rebirths + 1) * REBIRTH_BOOST_PER * 100)}% score (permanent)</Text>
            </TouchableOpacity>
            <View style={[s.didYouKnowBlock, playAccent && { borderLeftColor: playAccent }]}>
              <Text style={[s.didYouKnowLabel, playAccent && { color: playAccent }]}>Did you know?</Text>
              <Text style={s.didYouKnowText}>
                {BASKETBALL_TIPS.length > 0 ? BASKETBALL_TIPS[state.didYouKnowIndex % BASKETBALL_TIPS.length] : ''}
              </Text>
            </View>
          </Animated.View>
        )}

        {state.tab === 'shop' && (
          <Animated.View style={[s.tabPanel, { opacity: getTabOpacity('shop') }]}>
          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={s.sectionTitle}>Click power</Text>
            {CLICK_UPGRADES.map(item => {
              const cost = Math.floor(item.cost * costMult);
              const canAfford = state.score >= cost && state.clickMult < item.mult;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.card, state.clickMult >= item.mult && s.cardBought, canAfford && s.cardCanAfford]}
                  onPress={() => buyClick(item)}
                  disabled={state.score < cost || state.clickMult >= item.mult}
                >
                  <Text style={s.cardName}>{item.name}</Text>
                  <Text style={s.cardMeta}>×{item.mult} · {formatNumber(cost)} pts</Text>
                </TouchableOpacity>
              );
            })}
            <Text style={s.sectionTitle}>Auto click</Text>
            {AUTO_CLICK_UPGRADES.map(item => {
              const cost = Math.floor(item.cost * costMult);
              const canAfford = state.score >= cost && state.autoPerSec < item.perSec;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.card, state.autoPerSec >= item.perSec && s.cardBought, canAfford && s.cardCanAfford]}
                  onPress={() => buyAuto(item)}
                  disabled={state.score < cost || state.autoPerSec >= item.perSec}
                >
                  <Text style={s.cardName}>{item.name}</Text>
                  <Text style={s.cardMeta}>+{item.perSec}/s · {formatNumber(cost)} pts</Text>
                </TouchableOpacity>
              );
            })}
            <Text style={s.sectionTitle}>AP upgrades</Text>
            {AP_UPGRADES.map(item => {
              const boughtIds = state.boughtApUpgrades || [];
              const bought = boughtIds.includes(item.id) || boughtIds.some(id => {
                const u = AP_UPGRADES.find(x => x.id === id);
                return u && u.mult > item.mult;
              });
              const canAfford = state.ap >= item.cost && !bought;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.card, bought && s.cardBought, canAfford && s.cardCanAfford]}
                  onPress={() => buyApUpgrade(item)}
                  disabled={state.ap < item.cost || bought}
                >
                  <Text style={s.cardName}>{item.name}</Text>
                  <Text style={s.cardMeta}>+{Math.round((item.mult - 1) * 100)}% score · {formatNumber(item.cost)} AP</Text>
                </TouchableOpacity>
              );
            })}
            {PRESTIGE_UPGRADES.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Prestige</Text>
                {PRESTIGE_UPGRADES.map(item => {
                  const prestigeIds = state.boughtPrestigeUpgrades || [];
                  const bought = prestigeIds.includes(item.id) || prestigeIds.some(id => {
                    const u = PRESTIGE_UPGRADES.find(x => x.id === id);
                    return u && u.mult > item.mult;
                  });
                  const canSee = state.rebirths >= item.minRebirths;
                  const canBuy = canSee && state.ap >= item.cost && !bought;
                  const canAfford = canSee && state.ap >= item.cost && !bought;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[s.card, bought && s.cardBought, !canSee && s.cardLocked, canAfford && s.cardCanAfford]}
                      onPress={() => buyPrestigeUpgrade(item)}
                      disabled={!canBuy}
                    >
                      <Text style={s.cardName}>{item.name}</Text>
                      <Text style={s.cardMeta}>
                        {!canSee ? `Need ${item.minRebirths} rebirths` : bought ? 'Owned' : `${formatNumber(item.cost)} AP · +${Math.round((item.mult - 1) * 100)}%`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
            <Text style={s.sectionTitle}>Balls</Text>
            {Object.values(BALLS).map(b => {
              const minReb = b.minRebirths ?? 0;
              const apCost = b.apCost ?? 0;
              const lockedByRebirth = state.rebirths < minReb;
              const unlocked = state.unlockedBalls.includes(b.id);
              const lockedByCost = !unlocked && state.ap < apCost;
              const locked = lockedByRebirth || lockedByCost;
              const canAfford = !lockedByRebirth && !unlocked && state.ap >= apCost;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    s.card,
                    state.currentBall === b.id && s.cardActive,
                    unlocked && s.cardBought,
                    locked && s.cardLocked,
                    canAfford && s.cardCanAfford,
                  ]}
                  onPress={() => selectBall(b.id)}
                  disabled={locked}
                >
                  <View style={[s.ballDot, { backgroundColor: b.color }]} />
                  <View style={s.cardBody}>
                    <Text style={s.cardName}>{b.name}</Text>
                    <Text style={s.cardMeta}>
                      {lockedByRebirth ? `Need ${minReb} rebirths` : unlocked ? 'Owned · ×' + b.multiplier : (apCost === 0 ? 'Free' : formatNumber(apCost) + ' AP') + ' · ×' + b.multiplier}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          </Animated.View>
        )}

        {state.tab === 'awards' && (
          <Animated.View style={[s.tabPanel, { opacity: getTabOpacity('awards') }]}>
          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            {ACHIEVEMENTS.map(a => {
              const done = state.completedAchievements.includes(a.id);
              const n = Math.min(progress(a), a.requirement);
              const pct = (n / a.requirement) * 100;
              return (
                <View key={a.id} style={s.card}>
                  <Text style={s.achIcon}>{a.icon}</Text>
                  <View style={s.achBody}>
                    <Text style={[s.cardName, done && { color: colors.success }]}>{a.name}</Text>
                    <View style={s.progressBar}>
                      <View style={[s.progressFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={s.caption}>{n} / {a.requirement} · +{a.reward} AP</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          </Animated.View>
        )}

        {state.tab === 'challenges' && (
          <Animated.View style={[s.tabPanel, { opacity: getTabOpacity('challenges') }]}>
          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={s.sectionTitle}>Daily</Text>
            <Text style={s.challengeSubtitle}>Resets at midnight</Text>
            {activeDailyChallenges.map(c => {
              const prog = getChallengeProgress(c);
              const done = prog >= c.requirement;
              const claimed = state.challengeClaimed[c.id];
              return (
                <View key={c.id} style={[s.card, claimed && s.cardBought, done && !claimed && s.cardCanAfford]}>
                  <Text style={s.challengeIcon}>{c.icon}</Text>
                  <View style={s.achBody}>
                    <Text style={s.cardName}>{c.label}</Text>
                    <View style={s.progressBar}>
                      <View style={[s.progressFill, { width: `${Math.min(100, (prog / c.requirement) * 100)}%` }]} />
                    </View>
                    <Text style={s.caption}>{formatNumber(prog)} / {formatNumber(c.requirement)} · +{c.reward} AP</Text>
                    {done && !claimed && (
                      <TouchableOpacity style={s.claimBtn} onPress={() => claimChallenge(c)}>
                        <Text style={s.claimBtnText}>Claim +{c.reward} AP</Text>
                      </TouchableOpacity>
                    )}
                    {claimed && <Text style={s.challengeClaimed}>Claimed</Text>}
                  </View>
                </View>
              );
            })}
            <Text style={[s.sectionTitle, { marginTop: spacing.xl }]}>Weekly</Text>
            <Text style={s.challengeSubtitle}>Resets Monday</Text>
            {activeWeeklyChallenges.map(c => {
              const prog = getChallengeProgress(c);
              const done = prog >= c.requirement;
              const claimed = state.challengeClaimed[c.id];
              return (
                <View key={c.id} style={[s.card, claimed && s.cardBought, done && !claimed && s.cardCanAfford]}>
                  <Text style={s.challengeIcon}>{c.icon}</Text>
                  <View style={s.achBody}>
                    <Text style={s.cardName}>{c.label}</Text>
                    <View style={s.progressBar}>
                      <View style={[s.progressFill, { width: `${Math.min(100, (prog / c.requirement) * 100)}%` }]} />
                    </View>
                    <Text style={s.caption}>{formatNumber(prog)} / {formatNumber(c.requirement)} · +{c.reward} AP</Text>
                    {done && !claimed && (
                      <TouchableOpacity style={s.claimBtn} onPress={() => claimChallenge(c)}>
                        <Text style={s.claimBtnText}>Claim +{c.reward} AP</Text>
                      </TouchableOpacity>
                    )}
                    {claimed && <Text style={s.challengeClaimed}>Claimed</Text>}
                  </View>
                </View>
              );
            })}
          </ScrollView>
          </Animated.View>
        )}

        {state.tab === 'stats' && (
          <Animated.View style={[s.tabPanel, { opacity: getTabOpacity('stats') }]}>
          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={s.statsGrid}>
              {[
                [levelName, 'Level'],
                [formatNumber(state.totalScore), 'Total score'],
                [formatNumber(state.totalClicks), 'Clicks'],
                [state.rebirths, 'Rebirths'],
                [state.unlockedBalls.length + '/' + Object.keys(BALLS).length, 'Balls'],
                [state.triviaCorrect + ' correct', 'Trivia'],
                [state.loginStreak + ' days', 'Login streak'],
              ].map(([val, label], i) => (
                <View key={i} style={s.statBox}>
                  <Text style={s.statValue}>{val}</Text>
                  <Text style={s.statLabel}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={s.helpText}>Trivia appears at score milestones (10K, 25K, 50K, …). Correct answers give pts + AP; rewards scale with each milestone.</Text>
          </ScrollView>
          </Animated.View>
        )}

        {state.tab === 'settings' && (
          <Animated.View style={[s.tabPanel, { opacity: getTabOpacity('settings') }]}>
          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={s.card} onPress={() => toggleSetting('haptic')}>
              <Text style={s.cardName}>Haptic feedback</Text>
              <Text style={s.cardMeta}>{state.settings.haptic ? 'On' : 'Off'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.card} onPress={() => toggleSetting('animations')}>
              <Text style={s.cardName}>Animations</Text>
              <Text style={s.cardMeta}>{state.settings.animations ? 'On' : 'Off'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.card} onPress={() => toggleSetting('sound')}>
              <Text style={s.cardName}>Sound</Text>
              <Text style={s.cardMeta}>{state.settings.sound ? 'On' : 'Off'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.card, s.dangerCard]} onPress={resetData}>
              <Text style={s.dangerText}>Reset all data</Text>
            </TouchableOpacity>
            <Text style={s.sectionTitle}>About this app</Text>
            <View style={s.aboutBlock}>
              <Text style={s.aboutBullet}>• 60+ basketball trivia questions at score milestones — no repeat until rebirth</Text>
              <Text style={s.aboutBullet}>• Basketball facts every minute — did you know? (no repeat until rebirth)</Text>
              <Text style={s.aboutBullet}>• 9 collectible balls — unlock with AP and boost your score multiplier</Text>
              <Text style={s.aboutBullet}>• Daily & weekly challenges — earn bonus AP; resets at midnight and Monday</Text>
              <Text style={s.aboutBullet}>• Rebirth progression — reset to grow stronger with permanent bonuses</Text>
              <Text style={s.aboutBullet}>• Achievements & stats — track taps, trivia, rebirths, and more</Text>
              <Text style={s.aboutBullet}>• No account required — progress saved on this device only</Text>
            </View>
            <Text style={s.helpText}>Rebirth costs score (reach the pts threshold); each rebirth costs more. You keep AP, AP boosts, rebirth count, and achievements. Balls reset to orange—buy them again with AP. Click and Auto upgrades cost pts. Progress is saved on this device only.</Text>
          </ScrollView>
          </Animated.View>
        )}
        </LinearGradient>
        {triviaModal}
        {achievementPopup}
        {state.showHelpModal && (
          <View style={s.modalOverlay} pointerEvents="auto">
            <View style={s.modalCard}>
              <Text style={s.helpModalTitle}>How it works</Text>
              <Text style={s.helpModalBullet}>• <Text style={s.helpModalBold}>Points (pts)</Text> — Tap to earn. Spend on Click & Auto upgrades in Shop. Reset when you Rebirth.</Text>
              <Text style={s.helpModalBullet}>• <Text style={s.helpModalBold}>AP</Text> — Earn from trivia and challenges. Spend on Balls and AP/Prestige upgrades. Kept when you Rebirth.</Text>
              <Text style={s.helpModalBullet}>• <Text style={s.helpModalBold}>Rebirth</Text> — Resets score and point upgrades but gives a permanent score bonus. Do it when you hit the pts threshold to get stronger each run.</Text>
              <TouchableOpacity style={[s.primaryBtn, { marginTop: spacing.lg }]} onPress={() => setState(prev => ({ ...prev, showHelpModal: false, helpSeenOnce: true }))}>
                <Text style={s.primaryBtnText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  gradient: { flex: 1 },
  header: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md, alignItems: 'center', position: 'relative' },
  scoreCard: { flex: 1, backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, alignItems: 'center' },
  helpBtnOverlay: { position: 'absolute', top: spacing.lg, right: spacing.lg, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  helpBtnText: { ...typography.headline, color: colors.textMuted, fontSize: 16 },
  runMilestoneBanner: { backgroundColor: colors.accentDim, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: radius.md, alignSelf: 'center', borderWidth: 1, borderColor: colors.accent },
  runMilestoneBannerText: { ...typography.body, color: colors.accentBright, fontWeight: '700' },
  helpModalTitle: { ...typography.title, color: colors.text, marginBottom: spacing.lg },
  helpModalBullet: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 22 },
  helpModalBold: { color: colors.text, fontWeight: '700' },
  scoreLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 4 },
  scoreValue: { ...typography.score, color: colors.text },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.sm, paddingVertical: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  tabPanel: { flex: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.accentDim },
  tabIconWrap: { position: 'relative' },
  tabIcon: { fontSize: 22, marginBottom: 2 },
  tabBadge: { position: 'absolute', top: -4, right: -10, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.danger, justifyContent: 'center', alignItems: 'center' },
  tabBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  tabLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },
  tabLabelActive: { color: colors.accent },
  logoBlock: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.md },
  logoTitle: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: 0.5 },
  levelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  levelBadgeText: { ...typography.bodySmall, color: colors.accent, marginRight: spacing.sm },
  triviaUnlockText: { ...typography.caption, color: colors.textMuted },
  ballZone: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200, position: 'relative' },
  ballTouch: { alignItems: 'center', justifyContent: 'center' },
  ballOuter: { width: 132, height: 132, borderRadius: 66, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(0,0,0,0.2)' },
  ballInner: { position: 'absolute', width: 122, height: 122, borderRadius: 61 },
  ballEmoji: { fontSize: 62 },
  popup: { position: 'absolute', top: '32%' },
  popupText: { ...typography.headline, color: colors.accentBright, fontSize: 20, textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  autoBadge: { backgroundColor: colors.surface, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.full, alignSelf: 'center', marginBottom: spacing.md },
  autoText: { ...typography.bodySmall, color: colors.textSecondary },
  rebirthBtn: { backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginBottom: spacing.lg, padding: spacing.lg, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  rebirthDisabled: { opacity: 0.5 },
  rebirthCanAfford: { borderColor: colors.accent, backgroundColor: colors.accentDim, shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  rebirthText: { ...typography.headline, color: colors.text },
  rebirthTextAfford: { color: colors.accentBright },
  rebirthSub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  rebirthSubAfford: { color: colors.textSecondary },
  didYouKnowBlock: { marginHorizontal: spacing.lg, marginBottom: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: radius.sm, borderLeftWidth: 3, borderLeftColor: colors.accent },
  didYouKnowLabel: { ...typography.caption, color: colors.accent, marginBottom: 4, fontWeight: '700' },
  didYouKnowText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 18 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 40 },
  sectionTitle: { ...typography.title, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardBought: { borderColor: colors.success, backgroundColor: colors.successDim },
  cardActive: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  cardLocked: { opacity: 0.6 },
  cardName: { ...typography.body, color: colors.text, flex: 1 },
  cardMeta: { ...typography.caption, color: colors.textSecondary },
  cardBody: { flex: 1 },
  ballDot: { width: 36, height: 36, borderRadius: 18, marginRight: spacing.md },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  caption: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  achIcon: { fontSize: 30, marginRight: spacing.md },
  achBody: { flex: 1 },
  challengeIcon: { fontSize: 28, marginRight: spacing.md },
  challengeSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: -spacing.sm, marginBottom: spacing.sm },
  claimBtn: { backgroundColor: colors.accent, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.sm, alignSelf: 'flex-start', marginTop: spacing.sm },
  claimBtnText: { ...typography.bodySmall, color: '#000', fontWeight: '700' },
  challengeClaimed: { ...typography.caption, color: colors.success, marginTop: spacing.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, alignItems: 'center', marginBottom: spacing.md },
  statValue: { ...typography.headline, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  helpText: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.lg, lineHeight: 20 },
  aboutBlock: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  aboutBullet: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 6, lineHeight: 20 },
  dangerCard: { borderColor: colors.danger, backgroundColor: colors.dangerDim },
  dangerText: { ...typography.body, color: colors.danger },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.court, borderRadius: radius.lg, padding: spacing.xxl, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: colors.border },
  modalTitle: { ...typography.title, color: colors.accent, marginBottom: spacing.lg, textAlign: 'center' },
  modalQuestion: { ...typography.body, color: colors.text, marginBottom: spacing.xl, textAlign: 'center', lineHeight: 24 },
  answers: { marginBottom: spacing.xl },
  answerBtn: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  answerSelected: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  answerCorrect: { borderColor: colors.success, backgroundColor: colors.successDim },
  answerWrong: { borderColor: colors.danger, backgroundColor: colors.dangerDim },
  answerText: { ...typography.body, color: colors.text },
  primaryBtn: { backgroundColor: colors.accent, padding: spacing.lg, borderRadius: radius.md, alignItems: 'center' },
  primaryBtnText: { ...typography.headline, color: '#000' },
  btnDisabled: { opacity: 0.5 },
  resultOk: { ...typography.body, color: colors.success, textAlign: 'center', marginBottom: spacing.lg },
  resultBad: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  achievementPopupCard: { alignItems: 'center' },
  achievementPopupTitle: { ...typography.caption, color: colors.accent, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  achievementPopupIcon: { fontSize: 48, marginBottom: spacing.sm },
  achievementPopupName: { ...typography.title, color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
  achievementPopupReward: { ...typography.bodySmall, color: colors.success, marginBottom: spacing.lg },
  cardCanAfford: { borderColor: colors.accent, backgroundColor: colors.accentDim, shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
});

export default function App() {
  return (
    <ErrorBoundary>
      <Game />
    </ErrorBoundary>
  );
}
