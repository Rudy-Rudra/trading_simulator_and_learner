# 🎮 SIMDEX Pro — Gamified Trading Simulator & Learner

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5 / CSS3 / Vanilla JS](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue.svg)](#tech-stack)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Local)-green.svg)](#features)

**SIMDEX Pro** is an interactive, gamified stock trading simulator designed for everyone—from kids and teens to adults—to learn real-world trading mechanics and risk management with **₹1,00,000 (₹1 Lakh)** virtual capital in a zero-risk sandbox.

---

## 🚀 Key Features

* **₹1,00,00,000 / ₹1 Lakh Starting Balance**: Realistic Indian currency formatting (`₹ Lakhs`, `₹ Crores`) with real-time portfolio tracking.
* **The 4 Core Action Types**:
  * 🛒 **Buy Now** *(Market Order)*: Instant trade execution.
  * ⏳ **Wait for My Price** *(Limit Order)*: Automated pending buy at your target lucky price.
  * 🛡️ **Safety Net** *(Stop-Loss)*: Automatic sell floor protecting your capital.
  * 🎁 **Pocket the Prize** *(Take-Profit)*: Automated profit-locking target.
* **Realistic Market Simulation Engine**:
  * Semi-deterministic price movements with sector correlations (`Mega Tech`, `Gaming`, `EV`, `Biotech`, `Renewables`, `FMCG`, `Banking`, `Semiconductors`).
  * Price momentum, support/resistance bounces, and mean reversion.
  * **Breaking News Catalyst Engine**: Live simulated news alerts directly impacting stock trends.
* **Interactive Candlestick Charting ("Mood Bars")**:
  * Green (Happy) & Red (Sad) candles with high/low wicks.
  * Multi-timeframe selector (`1M`, `5M`, `15M`, `30M`).
  * Technical overlays: **20-period Moving Average (SMA)** & **Volume Bars**.
  * Interactive Crosshair & OHLC hover inspection tooltips.
* **5 Gamified Progression Levels**:
  * **Level 1**: ₹1,00,000+ (🌱 *Rookie Trader*)
  * **Level 2**: ₹1,10,000+ (📈 *Skilled Trader*)
  * **Level 3**: ₹1,20,000+ (🚀 *Pro Trader*)
  * **Level 4**: ₹1,30,000+ (💎 *Master Trader*)
  * **Level 5**: ₹1,50,000+ (👑 *Legendary Champion*)
* **Personalized Certificate of Mastery**:
  * Unlocks at **Level 5 (₹1,50,000+)** with user's **Name**, **Date of Birth**, and official verification seal.
  * Includes a **Print / Save as PDF** feature.
* **User Profile & Customization Hub**:
  * **Theme Switcher**: ☀️ Light Mode, 🌙 Dark Mode, and 💻 System Mode.
  * **Audio Chimes**: Web Audio API sound synthesizer for orders and news.
  * **Watchlist Search**: Fast live search filter for stocks and sectors.
  * **Analytics & CSV Export**: Trade blotter journal with one-click `.csv` download.
  * **Instant Hard Reset**: Reset your wallet back to ₹1 Lakh anytime.
* **Zero Friction**: No login or backend server needed; runs 100% offline in any modern web browser.

---

## 📁 Project Structure

```text
trading_simulator_and_learner/
│
├── index.html         # Main application UI layout & modals
├── style.css          # Dark/Light theme styles, animations, responsive grid
├── app.js             # Trading simulation, order execution & persistence engine
├── app_logo.png       # Official application logo and browser favicon
├── resources.md       # Kid-friendly trading cheat sheet & golden rules
├── README.md          # Project documentation & GitHub guide
└── .gitignore         # Standard git ignore patterns
```

---

## 🛠️ Tech Stack

* **Front-End**: HTML5, Semantic CSS3 (Flexbox & CSS Grid), CSS Variables
* **Programming**: Pure Vanilla JavaScript (ES6+), Canvas API, Web Audio API
* **Persistence**: Browser `localStorage` API
* **Typography**: Space Grotesk, Inter, JetBrains Mono

---

## 💻 How to Run Locally

No installations or local servers required!

1. Clone or download the repository.
2. Open `index.html` directly in your favorite browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
