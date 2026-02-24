# Dribbling Madness

A basketball-themed tap game: earn points, unlock balls and upgrades, answer trivia at milestones, and rebirth for long-term progress. Built with Expo so it runs on your iPhone with no Xcode setup.

---

## Run on your iPhone (recommended)

1. **On your iPhone:** Install **Expo Go** from the App Store (free).
2. **On your Mac:** Open Terminal, go to this project folder, and run:
   ```bash
   npm install
   npm start
   ```
3. **Connect:** When the QR code appears, open your **iPhone Camera** and scan it. Tap the banner to open the app in Expo Go.
4. **Play:** The game runs on your phone. Your progress is saved on the device.

No Xcode, no cables, no signing. Same Wi‑Fi for Mac and iPhone is enough.

---

## Run in simulator (Mac only)

```bash
npm start
```

Then press **i** in the terminal to open the iOS Simulator, or **a** for Android.

---

## What’s in the game

- **Play:** Click the basketball to earn points. Your **level** (Rookie → Pro → All-Star → … → Immortal) is based on total score. Spend points in the Shop on click power, auto click, and ball skins. Earn **AP** from achievements and trivia; spend AP on **Rebirth** (1000 AP) or **permanent score boosts** in the Shop.
- **Shop:** Click power (×2 up to ×1000), auto click (+1/s up to +500/s), **AP upgrades** (permanent +% score, cost AP), and 8 balls (multipliers up to ×35).
- **Trivia:** At score milestones (10K, 25K, 50K, 100K, … up to 1B) a basketball trivia modal appears. Correct = +2000 pts, +100 AP. Triggers when you pass a milestone (click or auto).
- **Rebirth:** Costs 1000 AP. Resets score and point upgrades; keeps AP, AP boosts, rebirths, and stats.
- **Awards & Stats:** Unlock achievements for AP; view level, clicks, rebirths, trivia, and streak in Stats.
- **Settings:** Haptic feedback, animations, and reset data.

---

## Project layout

- **App.js** – Main app: state, tabs, game UI, and styles (uses `src/theme.js`).
- **src/theme.js** – Colors, spacing, typography.
- **src/constants/** – Balls, store items, achievements, trivia questions.
- **src/utils/formatNumber.js** – Format large numbers (K, M, B, T).

Progress is saved locally with AsyncStorage.

---

## App Store submission (iOS)

The app is configured for the App Store:

- **app.json:** `version` (1.0.0), `ios.buildNumber` (1), `description`, `bundleIdentifier` (com.dribblingmadness.app).
- **Privacy:** No account, no analytics, no tracking. Only local save (AsyncStorage). No permissions (camera, location, etc.).
- **Destructive action:** “Reset all data” asks for confirmation and clears saved data.
- **Errors:** An error boundary catches crashes and shows “Something went wrong” with a Try again button.

### Build and submit with EAS (Expo Application Services)

1. **Install EAS CLI and log in:**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure the project (first time only):**
   ```bash
   eas build:configure
   ```
   Choose iOS and accept defaults. This creates `eas.json`. You can link an Expo account when prompted.

3. **Build for the App Store:**
   ```bash
   eas build --platform ios --profile production
   ```
   When the build finishes, EAS gives you a link to download the `.ipa` or submit directly.

4. **Submit to App Store Connect:**
   ```bash
   eas submit --platform ios --latest
   ```
   You’ll need an Apple Developer account, an app record in App Store Connect with the same bundle ID (`com.dribblingmadness.app`), and the first build uploaded via EAS or Xcode.

5. **For each new upload:** Bump `ios.buildNumber` in `app.json` (e.g. `"2"`, `"3"`) so Apple accepts the new binary.

### Build and upload with Xcode (Archive → TestFlight)

The iOS project is set up so the Hermes script runs during `pod install`, not during Xcode build, to avoid PhaseScriptExecution failures.

1. **From the project root (once, or after pulling / changing native deps):**
   ```bash
   cd ios && pod install && cd ..
   ```

2. **Open in Xcode:** Open `ios/DribblingMadness.xcworkspace` (not the `.xcodeproj`).

3. **Signing:** In **Signing & Capabilities**, enable “Automatically manage signing” and select your Team.

4. **Archive:** Set the run destination to **Any iOS Device (arm64)** → **Product → Archive**. When the Organizer opens, choose **Distribute App** → **App Store Connect** → **Upload**.

If you ever see “PhaseScriptExecution failed” again, run `pod install` from the `ios` folder and try archiving again.

### App Store readiness checklist

- **app.json:** version, buildNumber, description, bundleIdentifier, primaryColor, usesNonExemptEncryption: false.
- **Icon:** 1024×1024 PNG in assets (basketball icon is included).
- **Privacy:** No account, no tracking, no permissions; local save only.
- **In-app:** Error boundary, reset confirmation, no dev-only UI.

### Assets for store listing

- **Icon:** 1024×1024 PNG in `assets/icon.png` (basketball icon included).
- **Splash:** `assets/splash.png`; background in app.json is `#0A0A0F`.
- In App Store Connect you’ll add screenshots, description, keywords, and age rating (e.g. 4+ for this game).
