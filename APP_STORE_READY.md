# App Store Ready — Submit Checklist

Use this to build and submit **Dribbling Madness** to the App Store.

---

## 1. Pre-build check

- [ ] **Assets** — `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png`, and `assets/ios-app-icon/` (full set) are present.
- [ ] **Version** — `app.json`: `version` **1.0.1**, iOS `buildNumber` **15**, Android `versionCode` **15**.
- [ ] **EAS** — Logged in: `eas whoami`. Project linked: `extra.eas.projectId` in app.json.

---

## 2. Build for production

**iOS (App Store):**

```bash
eas build --platform ios --profile production
```

- Uses **production** profile (auto-increment can be enabled in eas.json).
- Build number **15** is set in app.json for this release.
- When the build finishes, download the `.ipa` or note the build ID for submit.

**Android (optional, Play Store):**

```bash
eas build --platform android --profile production
```

---

## 3. Submit to App Store Connect

**Option A — Submit from CLI (recommended):**

```bash
eas submit --platform ios --latest
```

- Submits the latest iOS build. Have your **App Store Connect** Apple ID and app-specific password (or API key) ready.
- Or submit a specific build: `eas submit --platform ios --id <build-id>`.

**Option B — Manual upload:**

1. Download the `.ipa` from [expo.dev](https://expo.dev) → your project → Builds.
2. Use **Transporter** (Mac App Store) or **Xcode → Window → Organizer** to upload the IPA to App Store Connect.

---

## 4. App Store Connect — Version & metadata

In **App Store Connect** → your app → **1.0.1** (or create version):

1. **Build** — Select build **15** (or the one you just submitted).
2. **Paste text from `APP_STORE_DESCRIPTION.md`:**
   - **Subtitle:** Basketball trivia + idle tap game  
   - **Promotional Text:** Trivia at milestones, basketball facts every minute. Daily challenges, rebirth. No account, no ads.  
   - **Description:** Full description and CONTENT & FEATURES bullets from APP_STORE_DESCRIPTION.md.  
   - **App Review Information → Notes:** Paste the “What to Tell Reviewers” paragraph from APP_STORE_DESCRIPTION.md.

3. **Screenshots** — Add 5 screens (see APP_STORE_DESCRIPTION.md): Play, Trivia, Challenges, Shop, Settings. Resize with `scripts/resize-screenshots-for-apple.js` if needed.
4. **Privacy** — No account, no analytics; no privacy policy URL required.
5. **Submit for Review.**

---

## 5. One-line recap

```bash
eas build --platform ios --profile production && eas submit --platform ios --latest
```

Then in App Store Connect: attach build, paste metadata from APP_STORE_DESCRIPTION.md, add screenshots, submit.

---

**You’re App Store ready.** Assets and version are set; use this checklist and APP_STORE_DESCRIPTION.md for each submission.
