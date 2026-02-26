# App Store screenshots – Dribbling Madness

Use the iOS Simulator to capture screens, then upload these in App Store Connect.

## Quick capture (recommended)

1. **Build and run in Simulator**  
   From Xcode: open `ios/DribblingMadness.xcworkspace`, pick **iPhone 15 Pro Max** (or **iPhone 14 Plus**), run (⌘R).

2. **Capture each screen**  
   Put the app on the screen you want, then in Terminal (same machine):

   ```bash
   cd "/Users/colemilstein/Downloads/dribling madness for wardlaw"
   ./scripts/capture-screenshot.sh 01-play
   ```

   Change the last argument for each screen: `02-shop`, `03-balls`, `04-rebirth`, `05-trivia`, `06-challenges`, etc.

3. **Output**  
   Screenshots are saved in `app-store-screenshots/` with names like `01-play.png`. Upload those in App Store Connect for the device size you used (e.g. 6.7" / 1290×2796).

---

## Recommended screens (order for App Store)

| #  | Tab/Screen        | What to show |
|----|-------------------|--------------|
| 01 | **Play**          | Ball, score, AP, “Trivia at 10K”, Rebirth button, **“Did you know?”** tip visible |
| 02 | **Shop**          | Click power + Auto click rows (a few upgrades visible, at least one affordable) |
| 03 | **Shop → Balls**  | Scroll to Balls section; show several balls with AP costs |
| 04 | **Trivia**        | Trivia modal with question and 4 answers (tap to 10K score to trigger) |
| 05 | **Challenges**    | Daily + Weekly challenges with progress bars |
| 06 | **Settings**      | Scroll so **“About this app”** (6 bullets) is visible — important for review |
| 07 | **Awards**        | (Optional) Achievements list with progress |
| 08 | **Stats**         | (Optional) Stats grid |

Use at least **4–6** screens. Include **01 (Play with Did you know?)**, **04 (Trivia)**, and **06 (About this app)** for the best chance with App Review.

---

## Apple’s required sizes (minimum set)

You need screenshots for **at least one** iPhone size. Easiest:

- **iPhone 6.7"** (e.g. 15 Pro Max): **1290 × 2796** px (portrait).  
  Simulator for “iPhone 15 Pro Max” gives this when you capture.

If you add iPad later:

- **iPad Pro 12.9"**: **2048 × 2732** px (portrait).

---

## Manual capture (no script)

1. Run the app in Simulator.
2. Navigate to the screen.
3. **⌘S** in Simulator saves a screenshot to Desktop (or use **File → Save Screen**).
4. Rename and move into `app-store-screenshots/` (e.g. `01-play.png`).

Then in **App Store Connect** → your app → **App Store** tab → **Screenshots**: select the device size and upload the images in order.
