# App Store Connect – Description & Notes for Resubmission

Use this in **App Store Connect** → your app → **App Information** / **Version Information** to address the "minimal functionality" / 4.2 feedback. The goal is to make the **content and value** obvious to reviewers.

---

## App Description (paste into App Store Connect)

**Subtitle (30 chars max)**  
Basketball trivia + idle tap game

**Promotional Text (170 chars, editable anytime)**  
Trivia at milestones, basketball facts every minute. Daily challenges, rebirth. No account, no ads.

**Description**

Dribbling Madness combines basketball trivia with an idle tap game: earn points by tapping, answer 60+ NBA and basketball trivia questions at score milestones, and use rebirth to get permanently stronger.

**CONTENT & FEATURES**

• **60+ basketball trivia questions** — Multiple-choice at score milestones (10K, 25K, 50K, …). No repeat until rebirth. Correct answers reward points and AP.

• **Basketball facts every minute** — A “Did you know?” fact appears every 60 seconds. No repeat until rebirth. Learn as you play.

• **9 collectible balls** — Unlock balls with AP (earned from trivia and challenges). Each ball increases your score multiplier. Balls reset on rebirth so you can collect again.

• **Daily & weekly challenges** — Rotating goals (taps, score, trivia, rebirths) that reset at local midnight and Monday. Complete them to earn bonus AP.

• **Rebirth progression** — Reach a score threshold to rebirth: reset score and upgrades but keep AP and permanent bonuses. Each rebirth makes the next run stronger.

• **Achievements & stats** — Unlock achievements for taps, balls, trivia, rebirths, and more. Track total score, level, and streaks in Stats.

• **Did you know?** — Basketball facts on the main screen and in a popup every minute.

No account required. Progress is saved on your device. No ads.

---

## What to Tell Reviewers (App Review Information → Notes)

If there’s a field for notes to the review team, you can add:

"We've updated the app to better showcase its content and value. The app includes 60+ basketball trivia questions (at score milestones, no repeat until rebirth), basketball facts every minute in a popup (no repeat until rebirth), a 'Did you know?' section on the main screen, and an 'About this app' section in Settings. We believe it provides substantive entertainment and educational value through trivia, facts, and progression. Thank you for your consideration."

---

## Screenshots to Include (so reviewers see content)

1. **Play** — Ball, score, "Did you know?" tip visible.
2. **Trivia** — A trivia question with four answers (shows real content).
3. **Challenges** — Daily and weekly challenges with progress.
4. **Shop** — Click/Auto upgrades and Balls section.
5. **Settings** — "About this app" section visible (scroll if needed).

---

## Build

Use the latest build (build number **15** for 1.0.1) that includes:
- 63 trivia questions (no repeat until rebirth)
- Basketball facts every minute in a popup (no repeat until rebirth)
- "Did you know?" tips on Play screen
- "About this app" in Settings
- Per-ball themes on Play screen

Then submit for review again with the updated description and screenshots.

---

## App Store checklist (before submit)

- [ ] **Icons** — `assets/icon.png` (1024×1024) and `assets/ios-app-icon/` set (plugin copies to native). Android: `assets/adaptive-icon.png`.
- [ ] **Splash** — `assets/splash.png`, backgroundColor `#0A0A0F` in app.json.
- [ ] **Version** — app.json: `version` (e.g. 1.0.1), iOS `buildNumber`, Android `versionCode`.
- [ ] **Privacy** — No account, no analytics; no privacy policy URL required unless you add tracking later.
- [ ] **EAS** — `eas build --platform ios --profile production` then `eas submit --platform ios --latest`. See **APP_STORE_READY.md** for full steps.
- [ ] **Screenshots** — Use the 5 screens listed above; resize with `scripts/resize-screenshots-for-apple.js` if needed.
