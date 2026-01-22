# 🎬 ScreenTest

> **Automated Visual Regression Testing Tool**
> *Casting the perfect shot for every viewport.*

ScreenTest is a CLI tool designed for CI/CD pipelines to automate UI testing across mobile, tablet, and desktop viewports. It generates a cinematic, Netflix-style HTML report for reviewing visual regressions.

![ScreenTest Dashboard](https://via.placeholder.com/800x400?text=Cinematic+Dashboard+Preview)

## 🚀 Features
- **Multi-Device Casting:** Automatically tests iPhone, iPad, and Desktop 1080p.
- **Visual Engine:** Uses `pixelmatch` to detect pixel-perfect regressions.
- **Cinematic Reporting:** Generates a responsive, dark-mode dashboard for results.
- **Baseline Management:** Auto-creates baselines for new views.

## 🛠️ Usage

### 1. Run an Audition (No Install Needed)
Run the tool instantly using npx:
```bash
npx screentest-cli-diptaraj audition --url [https://www.apple.com](https://www.apple.com)
```

### 2. Run an Audition (Test)
To capture screenshots and compare them against baselines:
```bash
node index.js audition --url [https://www.apple.com](https://www.apple.com)
```

### 3. Update Baselines
If the UI changes are intentional (e.g., a new feature release), use the update flag to overwrite the old baselines:
```bash
node index.js audition --url [https://www.apple.com](https://www.apple.com) --update
```

## 🏗️ Architecture
- **Director:** Node.js CLI (Commander.js)
- **Camera:** Playwright (Headless Browsers)
- **Editor:** Pixelmatch (Image Comparison)
- **Distribution:** HTML5 + CSS Grid (No external CSS dependencies)

## 🏁 How to Verify
1. **First Run:** Run the command. Output should be "New Baseline Created" (Blue).
2. **Second Run:** Run the exact same command. Output should be "Perfect Match" (Green).
3. **Visual Regression:** Change the URL slightly (or resize the viewport config) and run it again. Output should be "Mismatch" (Red), and the report will highlight the pixel differences.

---
*Created by Diptaraj Sinha*