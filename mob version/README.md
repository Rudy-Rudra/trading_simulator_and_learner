# 📱 SIMDEX Pro — Native Android App & APK Build Guide

This directory contains the **complete native Android Studio project** for **SIMDEX Pro (Gamified ₹1 Lakh Trading Simulator)**, configured with a high-performance, hardware-accelerated WebView engine.

---

## 📂 Android Project Structure

```text
mob version/
│
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml       # App permissions, icon & portrait lock
│   │       ├── java/com/simdex/trading/
│   │       │   └── MainActivity.java     # Hardware acceleration, DOM storage & back navigation
│   │       ├── assets/www/               # Full Touch-Optimized SIMDEX Web App
│   │       │   ├── index.html
│   │       │   ├── style.css
│   │       │   ├── app.js
│   │       │   ├── app_logo.png
│   │       │   └── resources.md
│   │       └── res/                      # Android layouts, colors, strings & themes
│   └── build.gradle                      # App-level Gradle build configuration
│
├── build.gradle                          # Root Gradle configuration
├── settings.gradle                       # Project settings
├── gradle.properties                     # JVM & AndroidX memory properties
└── README.md                             # This guide
```

---

## 🛠️ How to Build the APK (Choose Option A or B)

### 🥇 Option A: Using Android Studio (Recommended & Easiest)

1. Open **Android Studio**.
2. Click **Open** (or `File` ➔ `Open...`).
3. Select the folder:
   ```text
   C:\Users\rudra\Code\trading_simulator_and_learner\mob version
   ```
4. Wait a few seconds for Gradle to sync dependencies.
5. In the top menu bar, click:
   ```text
   Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)
   ```
6. Android Studio will compile your project. Once complete, a pop-up in the bottom right will say **"APK(s) generated successfully"**.
7. Click **locate** to find your `app-debug.apk` file! Transfer this `.apk` to your Android phone, tap to install, and enjoy trading on mobile!

---

### 💻 Option B: Using Gradle Command Line

If you have Java & the Android SDK on your path:

```bash
cd "C:\Users\rudra\Code\trading_simulator_and_learner\mob version"

# Build Debug APK
./gradlew assembleDebug

# Output APK Location:
# app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚡ Mobile Features & Optimizations Included

* **🚀 Full Hardware Acceleration**: Smooth 60 FPS HTML5 Canvas candlestick and moving average rendering.
* **📱 Responsive Mobile Layout**: Neatly stacks watchlist, candlestick chart, 4 action buttons, and positions on mobile viewports.
* **📳 Haptic Feedback**: Vibrates on order execution, profit target triggers, and level-ups (Android vibration permissions configured).
* **📴 100% Offline Capable**: All assets and sound synthesizers are packaged directly inside the APK (`file:///android_asset/www/`). No internet connection required to trade!
* **🔄 Smart Back-Button Handling**: Navigates modal overlays smoothly or asks for confirmation before quitting the app.
