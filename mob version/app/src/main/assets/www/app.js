/**
 * SIMDEX Pro — Gamified ₹1 Lakh Trading Simulator & Learner
 * Features:
 * - Starting capital: ₹1,00,000 (₹1 Lakh)
 * - 5 Gamified Progression Levels:
 *     Level 1: ₹1,00,000+ (🌱 Rookie Trader)
 *     Level 2: ₹1,10,000+ (📈 Skilled Trader)
 *     Level 3: ₹1,20,000+ (🚀 Pro Trader)
 *     Level 4: ₹1,30,000+ (💎 Master Trader)
 *     Level 5: ₹1,50,000+ (👑 Legendary Champion -> Unlocks Certificate)
 * - Profile Hub: Persistent Name, Date of Birth (DOB), Level Tracker, Theme Switcher, Sound Toggle, User Guide & Reset
 * - Official Printable Certificate of Mastery with User's Name & DOB
 * - 4 Action Types: Buy Now, Limit Order, Safety Net Stop-Loss, Pocket Prize Take-Profit
 * - Realistic Stock Engine: Sector correlations, momentum, mean reversion, breaking news catalysts
 * - HTML5 Canvas Candlestick ("Mood Bars") + Moving Averages & Interactive Crosshair Tooltip
 * - Real-Time Live Market Clock (h:m:s)
 * - LocalStorage persistence and Instant Hard Reset (back to ₹1 Lakh)
 */

(function () {
  "use strict";

  /* ==========================================================================
     CONSTANTS & STOCK DEFINITIONS
     ========================================================================== */
  const STARTING_CASH = 100000; // ₹1,00,000 (₹1 Lakh INR)
  const PROFILE_STORAGE_KEY = "SIMDEX_USER_PROFILE_V1";
  const APP_STORAGE_KEY = "SIMDEX_TRADING_SIMULATOR_STATE_V3";

  const LEVEL_THRESHOLDS = [
    { level: 1, req: 100000, name: "🌱 Rookie Trader", label: "Level 1 (₹1.00L)" },
    { level: 2, req: 110000, name: "📈 Skilled Trader", label: "Level 2 (₹1.10L)" },
    { level: 3, req: 120000, name: "🚀 Pro Trader", label: "Level 3 (₹1.20L)" },
    { level: 4, req: 130000, name: "💎 Master Trader", label: "Level 4 (₹1.30L)" },
    { level: 5, req: 150000, name: "👑 Legendary Champion", label: "Level 5 (₹1.50L)" }
  ];

  const STOCKS = [
    {
      sym: "RELI-TECH",
      name: "Reliance & Tata Tech",
      sector: "Mega Tech",
      price: 2840.50,
      vol: 0.005,
      drift: 0.00007,
      beta: 0.85,
      description: "India's premier digital & enterprise software conglomerate."
    },
    {
      sym: "PIXEL-PLAY",
      name: "Pixel Interactive Gaming",
      sector: "Gaming / Media",
      price: 640.25,
      vol: 0.014,
      drift: 0.00012,
      beta: 1.6,
      description: "Creator of viral esports titles and interactive streaming hits."
    },
    {
      sym: "BHARAT-EV",
      name: "Bharat Electric Mobility",
      sector: "Automotive / EV",
      price: 1420.80,
      vol: 0.011,
      drift: 0.00009,
      beta: 1.3,
      description: "Leading manufacturer of next-gen smart electric cars & 2-wheelers."
    },
    {
      sym: "AURA-MED",
      name: "Aura Life Sciences",
      sector: "Biotech / Pharma",
      price: 980.40,
      vol: 0.008,
      drift: 0.00006,
      beta: 0.7,
      description: "Pioneering oncology medications and global vaccines."
    },
    {
      sym: "CHAI-CORP",
      name: "Royal Chai & Snacks",
      sector: "Consumer Staples",
      price: 380.15,
      vol: 0.004,
      drift: 0.00004,
      beta: 0.5,
      description: "Iconic FMCG brand with millions of daily consumer touchpoints."
    },
    {
      sym: "SURYA-SOLAR",
      name: "Surya Green Energy",
      sector: "Renewables",
      price: 520.60,
      vol: 0.012,
      drift: 0.00010,
      beta: 1.45,
      description: "Solar farms and hydrogen fuel systems powering clean cities."
    },
    {
      sym: "INDUS-BANK",
      name: "Indus Premier Bank",
      sector: "Banking / Finance",
      price: 1890.30,
      vol: 0.006,
      drift: 0.00005,
      beta: 0.9,
      description: "Premier banking powerhouse serving millions of retail & corporate clients."
    },
    {
      sym: "BHARAT-SEMI",
      name: "Bharat Silicon Chips",
      sector: "Semiconductors",
      price: 3450.00,
      vol: 0.013,
      drift: 0.00011,
      beta: 1.5,
      description: "Domestic high-speed AI chips and wafer fabrication facilities."
    }
  ];

  const NEWS_TEMPLATES = [
    { text: "PIXEL-PLAY breaks global records with 50M downloads in first week!", sym: "PIXEL-PLAY", impact: 0.04, duration: 40 },
    { text: "RBI announces supportive monetary policy boost for industrial lending.", sector: "Banking / Finance", impact: 0.025, duration: 35 },
    { text: "SURYA-SOLAR secures 5,000 MW government green corridor contract!", sym: "SURYA-SOLAR", impact: 0.045, duration: 50 },
    { text: "Supply chain delays temporarily restrict EV battery imports.", sym: "BHARAT-EV", impact: -0.03, duration: 40 },
    { text: "AURA-MED receives US-FDA Phase 3 approval for breakthrough formula.", sym: "AURA-MED", impact: 0.05, duration: 60 },
    { text: "RELI-TECH announces ₹15,000 Cr AI Cloud infrastructure buildout.", sym: "RELI-TECH", impact: 0.03, duration: 45 },
    { text: "CHAI-CORP reports resilient rural festive demand & margins up 18%.", sym: "CHAI-CORP", impact: 0.02, duration: 30 },
    { text: "BHARAT-SEMI inks strategic chip manufacturing export alliance.", sym: "BHARAT-SEMI", impact: 0.05, duration: 50 },
    { text: "Global chip materials index drops due to raw mineral export ban.", sym: "BHARAT-SEMI", impact: -0.035, duration: 40 },
    { text: "Tech sector optimism surges on robust quarter-end IT deal wins.", sector: "Mega Tech", impact: 0.022, duration: 30 }
  ];

  /* ==========================================================================
     APP STATE
     ========================================================================== */
  let cash = STARTING_CASH;
  let holdings = {}; // sym -> { qty, avgCost }
  let pendingOrders = []; // { id, time, type, sym, qty, targetPrice }
  let trades = []; // { id, time, side, orderType, sym, qty, price, total, realizedPnl }
  let equityHistory = [];
  let userProfile = {
    name: "Trader",
    dob: ""
  };
  let previousLevel = 1;

  let selectedStock = STOCKS[0];
  let currentOrderMode = "buy-now"; // 'buy-now' | 'limit-buy' | 'stop-loss' | 'take-profit'
  let currentGroupSize = 5;
  let showMA = true;
  let showVolume = true;
  let currentTheme = "dark"; // 'light' | 'system' | 'dark'
  let soundEnabled = true;
  let searchQuery = "";

  let activeNews = null;
  let activeNewsTicksRemaining = 0;
  let hoveredCandleIndex = null;

  /* ==========================================================================
     AUDIO SYNTHESIZER (Web Audio API)
     ========================================================================== */
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq, type, duration, delay = 0) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + duration);
    } catch (e) {}
  }

  function playBuySound() {
    playTone(523.25, "sine", 0.12, 0);
    playTone(659.25, "sine", 0.18, 0.08);
    playTone(783.99, "sine", 0.25, 0.16);
  }

  function playSellSound() {
    playTone(783.99, "triangle", 0.12, 0);
    playTone(987.77, "triangle", 0.24, 0.08);
  }

  function playLevelUpSound() {
    playTone(440, "sine", 0.1, 0);
    playTone(554.37, "sine", 0.1, 0.08);
    playTone(659.25, "sine", 0.1, 0.16);
    playTone(880, "sine", 0.3, 0.24);
  }

  function playAlertSound() {
    playTone(440, "sawtooth", 0.15, 0);
    playTone(554.37, "sawtooth", 0.2, 0.1);
  }

  /* ==========================================================================
     THEME MANAGEMENT
     ========================================================================== */
  function applyTheme(theme) {
    currentTheme = theme;
    let effective = theme;
    if (theme === "system") {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      effective = prefersDark ? "dark" : "light";
    }

    document.documentElement.setAttribute("data-theme", effective);

    document.querySelectorAll(".profile-theme-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-theme") === theme);
    });

    try {
      localStorage.setItem("SIMDEX_THEME_CHOICE_V3", theme);
    } catch (e) {}

    drawPriceChart();
    const eqCanvas = document.getElementById("equityChart");
    if (eqCanvas) drawEquityLine(eqCanvas, equityHistory);
    renderWatchlist();
  }

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (currentTheme === "system") applyTheme("system");
    });
  }

  /* ==========================================================================
     STORAGE & PROFILE PERSISTENCE
     ========================================================================== */
  function saveProfile() {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name) userProfile.name = parsed.name;
        if (parsed.dob) userProfile.dob = parsed.dob;
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  }

  function saveState() {
    try {
      const state = {
        cash,
        holdings,
        pendingOrders,
        trades,
        soundEnabled,
        equityHistory: equityHistory.slice(-120)
      };
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
      saveProfile();
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  }

  function loadState() {
    try {
      loadProfile();

      const themeChoice = localStorage.getItem("SIMDEX_THEME_CHOICE_V3") || "dark";
      applyTheme(themeChoice);

      const raw = localStorage.getItem(APP_STORAGE_KEY);
      if (!raw) return false;
      const state = JSON.parse(raw);
      if (typeof state.cash === "number") cash = state.cash;
      if (state.holdings) holdings = state.holdings;
      if (Array.isArray(state.pendingOrders)) pendingOrders = state.pendingOrders;
      if (Array.isArray(state.trades)) trades = state.trades;
      if (Array.isArray(state.equityHistory)) equityHistory = state.equityHistory;
      if (typeof state.soundEnabled === "boolean") {
        soundEnabled = state.soundEnabled;
        updateSoundButton();
      }
      return true;
    } catch (e) {
      console.error("Failed to load state:", e);
      return false;
    }
  }

  function hardReset() {
    localStorage.removeItem(APP_STORAGE_KEY);
    cash = STARTING_CASH;
    holdings = {};
    pendingOrders = [];
    trades = [];
    equityHistory = [];
    previousLevel = 1;
    initStocks();
    saveState();
    renderAll();
    playAlertSound();
    showToast("Simulation cleanly reset! ₹1,00,000 restored to wallet.", "success");
  }

  /* ==========================================================================
     INDIAN CURRENCY FORMATTING
     ========================================================================== */
  function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function fmtMoney(n) {
    const isNeg = n < 0;
    const absVal = Math.abs(n);
    const parts = absVal.toFixed(2).split(".");
    let intPart = parts[0];
    const decPart = parts[1];

    if (intPart.length > 3) {
      const last3 = intPart.substring(intPart.length - 3);
      const rest = intPart.substring(0, intPart.length - 3);
      intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
    }

    return (isNeg ? "-₹" : "₹") + intPart + "." + decPart;
  }

  function fmtMoneyShort(n) {
    const isNeg = n < 0;
    const abs = Math.abs(n);
    let str = "";
    if (abs >= 10000000) {
      str = (abs / 10000000).toFixed(2) + " Cr";
    } else if (abs >= 100000) {
      str = (abs / 100000).toFixed(2) + " L";
    } else if (abs >= 1000) {
      str = (abs / 1000).toFixed(1) + " K";
    } else {
      str = abs.toFixed(2);
    }
    return (isNeg ? "-₹" : "₹") + str;
  }

  function fmtPct(n) {
    return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
  }

  function fmtVol(n) {
    if (n >= 1e7) return (n / 1e7).toFixed(2) + " Cr";
    if (n >= 1e5) return (n / 1e5).toFixed(1) + " L";
    if (n >= 1e3) return (n / 1e3).toFixed(0) + " K";
    return String(Math.round(n));
  }

  /* ==========================================================================
     SIMULATION ENGINE
     ========================================================================== */
  function initStocks() {
    STOCKS.forEach(s => {
      s.history = [s.price];
      s.basePrice = s.price;
      for (let i = 0; i < 90; i++) {
        const r = gaussianRandom();
        let p = s.history[s.history.length - 1] * (1 + s.drift + s.vol * r);
        if (p < 5) p = 5;
        s.history.push(p);
      }
      s.price = s.history[s.history.length - 1];
      s.prevPrice = s.history[s.history.length - 2];
      s.openPrice = s.history[0];
      s.high = Math.max.apply(null, s.history);
      s.low = Math.min.apply(null, s.history);
      s.volume = Math.floor(Math.random() * 500000 + 100000);
    });
  }

  function triggerNewsEvent() {
    if (Math.random() < 0.05 && activeNewsTicksRemaining <= 0) {
      const template = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
      activeNews = template;
      activeNewsTicksRemaining = template.duration;
      updateNewsBanner(template.text);
      playAlertSound();
      showToast("📢 Breaking News: " + template.text, template.impact > 0 ? "success" : "error");
    }
  }

  function updateStockPrices() {
    STOCKS.forEach(s => {
      let newsBoost = 0;
      if (activeNews && activeNewsTicksRemaining > 0) {
        if (activeNews.sym === s.sym || activeNews.sector === s.sector) {
          newsBoost = (activeNews.impact / activeNews.duration) * (0.8 + Math.random() * 0.4);
        }
      }

      const distFromOpen = (s.price - s.openPrice) / s.openPrice;
      const meanReversion = -0.0003 * distFromOpen;

      const r = gaussianRandom();
      const changePct = s.drift + meanReversion + newsBoost + (s.vol * r * s.beta);

      s.prevPrice = s.price;
      let p = s.price * (1 + changePct);
      if (p < 5) p = 5;
      s.price = p;
      s.history.push(p);
      if (s.history.length > 500) s.history.shift();

      s.high = Math.max(s.high, p);
      s.low = Math.min(s.low, p);
      s.volume += Math.floor(Math.random() * 4000 + 300);
    });

    if (activeNewsTicksRemaining > 0) {
      activeNewsTicksRemaining--;
      if (activeNewsTicksRemaining <= 0) {
        activeNews = null;
        updateNewsBanner("Market operates smoothly. Keep an eye on sector trends, momentum breakouts, and golden trading rules!");
      }
    }
  }

  /* ==========================================================================
     ORDER EXECUTION (4 ACTION TYPES)
     ========================================================================== */
  function executeMarketOrder(side, sym, qty) {
    const stock = STOCKS.find(s => s.sym === sym);
    if (!stock || qty <= 0) return false;
    const price = stock.price;
    const total = qty * price;

    if (side === "BUY") {
      if (total > cash) {
        showToast("Insufficient game coins! You need " + fmtMoney(total) + " to buy " + qty + " shares.", "error");
        return false;
      }
      cash -= total;
      const h = holdings[sym] || { qty: 0, avgCost: 0 };
      const newQty = h.qty + qty;
      h.avgCost = (h.avgCost * h.qty + total) / newQty;
      h.qty = newQty;
      holdings[sym] = h;

      logTrade("BUY", "BUY NOW (Market)", sym, qty, price, total, 0);
      playBuySound();
      showToast("🛒 Bought " + qty + " " + sym + " @ " + fmtMoney(price), "success");
    } else {
      const h = holdings[sym];
      if (!h || h.qty < qty) {
        showToast("You don't own enough " + sym + " to sell that amount!", "error");
        return false;
      }
      const realizedPnl = (price - h.avgCost) * qty;
      h.qty -= qty;
      cash += total;
      if (h.qty <= 0) {
        delete holdings[sym];
      } else {
        holdings[sym] = h;
      }

      logTrade("SELL", "SELL NOW (Market)", sym, qty, price, total, realizedPnl);
      playSellSound();
      showToast("💰 Sold " + qty + " " + sym + " @ " + fmtMoney(price) + (realizedPnl >= 0 ? " (Profit: " : " (Loss: ") + fmtMoney(realizedPnl) + ")", realizedPnl >= 0 ? "success" : "info");
    }

    saveState();
    renderAll();
    return true;
  }

  function addPendingOrder(type, sym, qty, targetPrice) {
    const stock = STOCKS.find(s => s.sym === sym);
    if (!stock || qty <= 0 || targetPrice <= 0) {
      showToast("Please enter a valid quantity and target price.", "error");
      return;
    }

    if (type === "LIMIT_BUY") {
      const totalCost = qty * targetPrice;
      if (totalCost > cash) {
        showToast("Not enough cash to reserve this limit order (" + fmtMoney(totalCost) + ")", "error");
        return;
      }
    }

    if (type === "STOP_LOSS" || type === "TAKE_PROFIT") {
      const h = holdings[sym];
      if (!h || h.qty < qty) {
        showToast("You must already own at least " + qty + " shares of " + sym + " to set this safety order.", "error");
        return;
      }
    }

    const order = {
      id: "ORD-" + Math.floor(Math.random() * 900000 + 100000),
      time: new Date().toLocaleTimeString(),
      type,
      sym,
      qty,
      targetPrice
    };

    pendingOrders.push(order);
    saveState();
    renderPendingOrders();

    const nameMap = {
      LIMIT_BUY: "⏳ Wait for My Price (Limit Buy)",
      STOP_LOSS: "🛡️ Safety Net (Stop-Loss)",
      TAKE_PROFIT: "🎁 Pocket the Prize (Take-Profit)"
    };
    showToast("Active: " + nameMap[type] + " set for " + qty + " " + sym + " @ " + fmtMoney(targetPrice), "info");
  }

  function cancelPendingOrder(orderId) {
    pendingOrders = pendingOrders.filter(o => o.id !== orderId);
    saveState();
    renderPendingOrders();
    showToast("Pending order cancelled.", "info");
  }

  function checkPendingOrders() {
    const remaining = [];
    pendingOrders.forEach(order => {
      const stock = STOCKS.find(s => s.sym === order.sym);
      if (!stock) {
        remaining.push(order);
        return;
      }

      let triggered = false;

      if (order.type === "LIMIT_BUY" && stock.price <= order.targetPrice) {
        const total = order.qty * stock.price;
        if (cash >= total) {
          cash -= total;
          const h = holdings[order.sym] || { qty: 0, avgCost: 0 };
          const newQty = h.qty + order.qty;
          h.avgCost = (h.avgCost * h.qty + total) / newQty;
          h.qty = newQty;
          holdings[order.sym] = h;

          logTrade("BUY", "LIMIT (Lucky Price)", order.sym, order.qty, stock.price, total, 0);
          playBuySound();
          showToast("🎯 Limit Order Filled! Bought " + order.qty + " " + order.sym + " @ " + fmtMoney(stock.price), "success");
          triggered = true;
        }
      } else if (order.type === "STOP_LOSS" && stock.price <= order.targetPrice) {
        const h = holdings[order.sym];
        if (h && h.qty > 0) {
          const sellQty = Math.min(order.qty, h.qty);
          const proceeds = sellQty * stock.price;
          const realizedPnl = (stock.price - h.avgCost) * sellQty;
          h.qty -= sellQty;
          cash += proceeds;
          if (h.qty <= 0) delete holdings[order.sym]; else holdings[order.sym] = h;

          logTrade("SELL", "SAFETY NET (Stop-Loss)", order.sym, sellQty, stock.price, proceeds, realizedPnl);
          playAlertSound();
          showToast("🛡️ Safety Net Triggered! Sold " + sellQty + " " + order.sym + " to protect coins @ " + fmtMoney(stock.price), "error");
          triggered = true;
        }
      } else if (order.type === "TAKE_PROFIT" && stock.price >= order.targetPrice) {
        const h = holdings[order.sym];
        if (h && h.qty > 0) {
          const sellQty = Math.min(order.qty, h.qty);
          const proceeds = sellQty * stock.price;
          const realizedPnl = (stock.price - h.avgCost) * sellQty;
          h.qty -= sellQty;
          cash += proceeds;
          if (h.qty <= 0) delete holdings[order.sym]; else holdings[order.sym] = h;

          logTrade("SELL", "POCKET PRIZE (Take-Profit)", order.sym, sellQty, stock.price, proceeds, realizedPnl);
          playSellSound();
          showToast("🎁 Pocketed the Prize! Sold " + sellQty + " " + order.sym + " @ " + fmtMoney(stock.price) + " for nice reward!", "success");
          triggered = true;
        }
      }

      if (!triggered) {
        remaining.push(order);
      }
    });

    if (remaining.length !== pendingOrders.length) {
      pendingOrders = remaining;
      saveState();
      renderPendingOrders();
      renderPositions();
      renderPortfolioSummary();
    }
  }

  function logTrade(side, orderType, sym, qty, price, total, realizedPnl = 0) {
    const trade = {
      id: "TRD-" + (trades.length + 1),
      time: new Date().toLocaleTimeString(),
      side,
      orderType,
      sym,
      qty,
      price,
      total,
      realizedPnl
    };
    trades.unshift(trade);
    if (trades.length > 100) trades.length = 100;
    renderBlotter();
    renderStats();
  }

  /* ==========================================================================
     5-LEVEL PROGRESS TRACKER & CERTIFICATE LOGIC
     ========================================================================== */
  function getCurrentLevel(equity) {
    if (equity >= 150000) return LEVEL_THRESHOLDS[4];
    if (equity >= 130000) return LEVEL_THRESHOLDS[3];
    if (equity >= 120000) return LEVEL_THRESHOLDS[2];
    if (equity >= 110000) return LEVEL_THRESHOLDS[1];
    return LEVEL_THRESHOLDS[0];
  }

  function updateLevelDisplay(equity) {
    const current = getCurrentLevel(equity);
    const topBadge = document.getElementById("topLevelBadge");
    const currentLevelLabel = document.getElementById("currentLevelLabel");
    const progressBar = document.getElementById("levelProgressBar");

    if (topBadge) topBadge.textContent = `⭐ Lvl ${current.level}`;
    if (currentLevelLabel) currentLevelLabel.textContent = `${current.label} · ${current.name}`;

    const pct = Math.min(100, Math.max(10, ((equity - 100000) / (150000 - 100000)) * 100));
    if (progressBar) progressBar.style.width = pct + "%";

    for (let i = 1; i <= 5; i++) {
      const card = document.getElementById("levelCard" + i);
      if (card) {
        card.classList.toggle("achieved", equity >= LEVEL_THRESHOLDS[i - 1].req);
        card.classList.toggle("current", current.level === i);
      }
    }

    if (current.level > previousLevel) {
      playLevelUpSound();
      showToast(`🎉 Level Up! You achieved ${current.name} (${current.label})!`, "success");
      if (current.level === 5) {
        showToast(`👑 Congratulations! You unlocked the Level 5 Certificate of Mastery!`, "success");
      }
    }
    previousLevel = current.level;
  }

  function updateLiveClock() {
    const clockEl = document.getElementById("liveClockDisplay");
    if (clockEl) {
      clockEl.textContent = new Date().toLocaleTimeString();
    }
  }

  function renderProfileHeader(forceInputs = false) {
    const name = userProfile.name || "Trader";
    const initial = name.charAt(0).toUpperCase() || "T";
    const dobText = userProfile.dob ? `DOB: ${userProfile.dob}` : "DOB: Not set";

    const topNameEl = document.getElementById("topProfileName");
    const topAvatarEl = document.getElementById("topAvatarLetter");
    const modalNameEl = document.getElementById("modalProfileDisplayName");
    const modalAvatarEl = document.getElementById("modalAvatarLetter");
    const modalDobEl = document.getElementById("modalProfileDobDisplay");

    if (topNameEl) topNameEl.textContent = name;
    if (topAvatarEl) topAvatarEl.textContent = initial;
    if (modalNameEl) modalNameEl.textContent = name;
    if (modalAvatarEl) modalAvatarEl.textContent = initial;
    if (modalDobEl) modalDobEl.textContent = `${dobText} · Starting Balance: ₹1,00,000`;

    const nameInput = document.getElementById("profileNameInput");
    const dobInput = document.getElementById("profileDobInput");

    if (nameInput && (forceInputs || document.activeElement !== nameInput)) {
      nameInput.value = userProfile.name || "";
    }
    if (dobInput && (forceInputs || document.activeElement !== dobInput)) {
      dobInput.value = userProfile.dob || "";
    }
  }

  function openCertificateModal() {
    const name = userProfile.name || "Trader";
    const holdingsValue = Object.keys(holdings).reduce((sum, sym) => {
      const stock = STOCKS.find(s => s.sym === sym);
      const price = stock ? stock.price : 0;
      return sum + (holdings[sym].qty * price);
    }, 0);
    const equity = cash + holdingsValue;
    const isLevel5 = equity >= 150000;

    document.getElementById("certUserName").textContent = name;
    document.getElementById("certAwardDate").textContent = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    document.getElementById("certUserDobLine").textContent = userProfile.dob ? `DOB: ${userProfile.dob}` : "DOB: Verified";

    const certWrapper = document.getElementById("printableCertificate");
    const lockOverlay = document.getElementById("certificateLockOverlay");
    const headerTitle = document.getElementById("certModalHeaderTitle");
    const lockStatus = document.getElementById("certLockStatusText");
    const printBtn = document.getElementById("printCertBtn");

    if (isLevel5) {
      certWrapper.classList.remove("blurred");
      lockOverlay.classList.add("unlocked");
      headerTitle.textContent = "🏆 Official Certificate of Trading Mastery (Unlocked!)";
      printBtn.disabled = false;
      printBtn.textContent = "🖨️ Print / Save as PDF";
      printBtn.style.opacity = "1";
    } else {
      certWrapper.classList.add("blurred");
      lockOverlay.classList.remove("unlocked");
      headerTitle.textContent = "🔒 Certificate of Trading Mastery (Locked Preview)";
      lockStatus.textContent = `Current Net Worth: ${fmtMoney(equity)} / Target: ₹1,50,000.00`;
      printBtn.disabled = true;
      printBtn.textContent = "🔒 Locked (Reach ₹1.50L to Print)";
      printBtn.style.opacity = "0.5";
    }

    document.getElementById("certificateModal").classList.add("open");
  }

  /* ==========================================================================
     CANDLESTICK CHARTING WITH INTERACTIVE CROSSHAIR
     ========================================================================== */
  function buildCandles(history, groupSize) {
    const candles = [];
    for (let i = 0; i < history.length; i += groupSize) {
      const chunk = history.slice(i, i + groupSize);
      if (chunk.length === 0) continue;
      candles.push({
        open: chunk[0],
        close: chunk[chunk.length - 1],
        high: Math.max.apply(null, chunk),
        low: Math.min.apply(null, chunk),
        volume: Math.floor(chunk.length * (Math.random() * 4000 + 1000))
      });
    }
    return candles.slice(-44);
  }

  function calculateSMA(candles, period) {
    const ma = [];
    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) {
        ma.push(null);
      } else {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
          sum += candles[j].close;
        }
        ma.push(sum / period);
      }
    }
    return ma;
  }

  function drawPriceChart() {
    const canvas = document.getElementById("priceChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const gridColor = isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.05)";
    const textColor = isLight ? "#64748b" : "#8494a7";
    const greenColor = isLight ? "#059669" : "#0ecb81";
    const redColor = isLight ? "#dc2626" : "#f6465d";

    const candles = buildCandles(selectedStock.history, currentGroupSize);
    if (candles.length < 2) return;

    const allHigh = Math.max.apply(null, candles.map(c => c.high));
    const allLow = Math.min.apply(null, candles.map(c => c.low));
    const pad = (allHigh - allLow) * 0.14 || allHigh * 0.02 || 10;
    const top = allHigh + pad;
    const bottom = Math.max(0, allLow - pad);
    const w = rect.width;
    const h = rect.height;
    const rightGutter = 76;
    const plotW = w - rightGutter;

    // Gridlines & Price Scale
    ctx.strokeStyle = gridColor;
    ctx.fillStyle = textColor;
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.textAlign = "left";
    const levels = 5;
    for (let i = 0; i <= levels; i++) {
      const val = top - (i / levels) * (top - bottom);
      const y = h - ((val - bottom) / (top - bottom)) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(plotW, y);
      ctx.stroke();
      ctx.fillText(fmtMoneyShort(val), plotW + 8, y + 4);
    }

    const candleWidth = plotW / candles.length;

    // Volume Bars
    if (showVolume) {
      const maxVol = Math.max.apply(null, candles.map(c => c.volume)) || 1;
      const volH = h * 0.20;
      candles.forEach((c, i) => {
        const x = i * candleWidth + candleWidth / 2;
        const isUp = c.close >= c.open;
        ctx.fillStyle = isUp ? (isLight ? "rgba(5, 150, 105, 0.20)" : "rgba(14, 203, 129, 0.18)") : (isLight ? "rgba(220, 38, 38, 0.20)" : "rgba(246, 70, 93, 0.18)");
        const barH = (c.volume / maxVol) * volH;
        ctx.fillRect(x - (candleWidth * 0.35), h - barH, candleWidth * 0.7, barH);
      });
    }

    // Candlesticks
    candles.forEach((c, i) => {
      const x = i * candleWidth + candleWidth / 2;
      const yOpen = h - ((c.open - bottom) / (top - bottom)) * h;
      const yClose = h - ((c.close - bottom) / (top - bottom)) * h;
      const yHigh = h - ((c.high - bottom) / (top - bottom)) * h;
      const yLow = h - ((c.low - bottom) / (top - bottom)) * h;
      const isUp = c.close >= c.open;
      const color = isUp ? greenColor : redColor;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      const bodyWidth = Math.max(candleWidth * 0.65, 3);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1.5);
      ctx.fillStyle = color;
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    });

    // 20-SMA
    if (showMA) {
      const ma20 = calculateSMA(candles, 8);
      ctx.strokeStyle = "#f0b90b";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;
      ma20.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = h - ((val - bottom) / (top - bottom)) * h;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Crosshair & Tooltip
    if (hoveredCandleIndex !== null && hoveredCandleIndex >= 0 && hoveredCandleIndex < candles.length) {
      const c = candles[hoveredCandleIndex];
      const x = hoveredCandleIndex * candleWidth + candleWidth / 2;
      const yClose = h - ((c.close - bottom) / (top - bottom)) * h;

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.4)" : "rgba(240, 244, 248, 0.4)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, yClose);
      ctx.lineTo(plotW, yClose);
      ctx.stroke();
      ctx.setLineDash([]);

      const tooltip = document.getElementById("chartTooltip");
      if (tooltip) {
        tooltip.style.display = "block";
        tooltip.style.left = Math.min(plotW - 130, Math.max(10, x - 65)) + "px";
        tooltip.style.top = "10px";
        const isUp = c.close >= c.open;
        tooltip.innerHTML = `<div><b>O:</b> ${fmtMoney(c.open)} <b>H:</b> ${fmtMoney(c.high)}</div>
          <div><b>L:</b> ${fmtMoney(c.low)} <b>C:</b> <span style="color:${isUp ? greenColor : redColor};font-weight:700;">${fmtMoney(c.close)}</span></div>
          <div><b>Vol:</b> ${fmtVol(c.volume)}</div>`;
      }
    }
  }

  function setupChartHover() {
    const wrap = document.getElementById("chartCanvasWrap");
    const canvas = document.getElementById("priceChart");
    const tooltip = document.getElementById("chartTooltip");
    if (!wrap || !canvas) return;

    function handleMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const plotW = rect.width - 76;
      const candles = buildCandles(selectedStock.history, currentGroupSize);
      if (candles.length === 0 || x < 0 || x > plotW) {
        hoveredCandleIndex = null;
        if (tooltip) tooltip.style.display = "none";
        drawPriceChart();
        return;
      }
      const candleWidth = plotW / candles.length;
      hoveredCandleIndex = Math.floor(x / candleWidth);
      drawPriceChart();
    }

    function handleLeave() {
      hoveredCandleIndex = null;
      if (tooltip) tooltip.style.display = "none";
      drawPriceChart();
    }

    wrap.addEventListener("mousemove", handleMove);
    wrap.addEventListener("mouseleave", handleLeave);
    wrap.addEventListener("touchmove", handleMove, { passive: true });
    wrap.addEventListener("touchend", handleLeave);
  }

  function drawSparkline(canvas, history, colorUp, colorDown) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const points = history.slice(-28);
    if (points.length < 2) return;
    const min = Math.min.apply(null, points), max = Math.max.apply(null, points);
    const range = (max - min) || 1;
    const up = points[points.length - 1] >= points[0];
    ctx.strokeStyle = up ? colorUp : colorDown;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function drawEquityLine(canvas, history) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const points = history.slice(-70);
    if (points.length < 2) return;
    const min = Math.min.apply(null, points), max = Math.max.apply(null, points);
    const range = (max - min) || 1000;
    const up = points[points.length - 1] >= points[0];
    const color = up ? (isLight ? "#059669" : "#0ecb81") : (isLight ? "#dc2626" : "#f6465d");
    const w = rect.width, h = rect.height;

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = up ? "rgba(14, 203, 129, 0.14)" : "rgba(246, 70, 93, 0.14)";
    ctx.fill();

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  /* ==========================================================================
     UI RENDERING ROUTINES
     ========================================================================== */
  function updateNewsBanner(text) {
    const newsTextEl = document.getElementById("newsBannerText");
    if (newsTextEl) newsTextEl.textContent = text;
  }

  function renderTickerTape() {
    const tickerTrackEl = document.getElementById("tickerTrack");
    if (!tickerTrackEl) return;
    const items = STOCKS.map(s => {
      const changePct = ((s.price - s.openPrice) / s.openPrice) * 100;
      const dir = changePct >= 0 ? "up" : "down";
      const arrow = changePct >= 0 ? "▲" : "▼";
      return `<div class="ticker-item" data-sym="${s.sym}">
        <span class="tsym">${s.sym}</span>
        <span class="tprice">${fmtMoney(s.price)}</span>
        <span class="tchg ${dir}"><span>${arrow}</span> ${fmtPct(changePct)}</span>
      </div>`;
    }).join("");
    tickerTrackEl.innerHTML = items + items;

    tickerTrackEl.querySelectorAll(".ticker-item").forEach(item => {
      item.addEventListener("click", () => selectStock(item.getAttribute("data-sym")));
    });
  }

  function renderWatchlist() {
    const watchlistBodyEl = document.getElementById("watchlistBody");
    if (!watchlistBodyEl) return;

    const filtered = STOCKS.filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return s.sym.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q);
    });

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const greenColor = isLight ? "#059669" : "#0ecb81";
    const redColor = isLight ? "#dc2626" : "#f6465d";

    watchlistBodyEl.innerHTML = filtered.map(s => {
      const changePct = ((s.price - s.openPrice) / s.openPrice) * 100;
      return `<div class="watch-row ${s.sym === selectedStock.sym ? "selected" : ""}" data-sym="${s.sym}" id="row-${s.sym}" tabindex="0">
        <canvas class="spark" id="spark-${s.sym}" width="44" height="28"></canvas>
        <div class="watch-meta">
          <div class="watch-sym-row">
            <span class="watch-sym">${s.sym}</span>
            <span class="watch-sector-tag">${s.sector}</span>
          </div>
          <div class="watch-name">${s.name}</div>
        </div>
        <div class="watch-right">
          <div class="watch-price">${fmtMoney(s.price)}</div>
          <div class="watch-change ${changePct >= 0 ? "up" : "down"}">${fmtPct(changePct)}</div>
        </div>
      </div>`;
    }).join("");

    filtered.forEach(s => {
      const sparkEl = document.getElementById("spark-" + s.sym);
      if (sparkEl) drawSparkline(sparkEl, s.history, greenColor, redColor);
    });

    watchlistBodyEl.querySelectorAll(".watch-row").forEach(row => {
      row.addEventListener("click", () => selectStock(row.getAttribute("data-sym")));
    });
  }

  function selectStock(sym) {
    const s = STOCKS.find(x => x.sym === sym);
    if (!s) return;
    selectedStock = s;
    renderWatchlist();
    renderChartHeader();
    drawPriceChart();
    updateOrderForm();
  }

  function renderChartHeader() {
    const s = selectedStock;
    document.getElementById("chartSymbol").textContent = s.sym;
    document.getElementById("chartSector").textContent = s.sector;
    document.getElementById("chartName").textContent = s.name;
    document.getElementById("chartPrice").textContent = fmtMoney(s.price);

    const chg = s.price - s.openPrice;
    const chgPct = (chg / s.openPrice) * 100;
    const changeEl = document.getElementById("chartChange");
    changeEl.textContent = (chg >= 0 ? "+" : "") + fmtMoney(chg) + " (" + fmtPct(chgPct) + ")";
    changeEl.className = "chart-change " + (chg >= 0 ? "up" : "down");

    document.getElementById("statOpen").textContent = fmtMoney(s.openPrice);
    document.getElementById("statHigh").textContent = fmtMoney(s.high);
    document.getElementById("statLow").textContent = fmtMoney(s.low);
    document.getElementById("statVol").textContent = fmtVol(s.volume);
  }

  function updateOrderForm() {
    const qtyInput = document.getElementById("orderQty");
    const targetPriceInput = document.getElementById("orderTargetPrice");
    const targetGroup = document.getElementById("targetPriceGroup");
    const modeInfoText = document.getElementById("modeInfoText");
    const executeBtn = document.getElementById("executeOrderBtn");
    const estTotalEl = document.getElementById("orderEstTotal");
    const availableCashEl = document.getElementById("orderAvailableCash");
    const ownedSharesEl = document.getElementById("orderOwnedShares");

    const qty = parseInt(qtyInput.value, 10) || 0;
    const currentPrice = selectedStock.price;
    const holding = holdings[selectedStock.sym] || { qty: 0 };

    availableCashEl.textContent = fmtMoney(cash);
    ownedSharesEl.textContent = holding.qty + " shares";

    let targetPrice = parseFloat(targetPriceInput.value) || currentPrice;

    if (currentOrderMode === "buy-now") {
      targetGroup.style.display = "none";
      modeInfoText.textContent = "🛒 Buy Now: Grabs the card/stock immediately at the current market price.";
      estTotalEl.textContent = fmtMoney(qty * currentPrice);
      executeBtn.textContent = "Buy Now (" + selectedStock.sym + ")";
      executeBtn.className = "action-btn-main buy";
    } else if (currentOrderMode === "limit-buy") {
      targetGroup.style.display = "block";
      document.getElementById("targetPriceLabel").textContent = "Lucky Target Price (₹)";
      modeInfoText.textContent = "⏳ Wait for My Price: Automatically buys when price drops to your lucky number!";
      estTotalEl.textContent = fmtMoney(qty * targetPrice);
      executeBtn.textContent = "Set Limit Buy (" + selectedStock.sym + ")";
      executeBtn.className = "action-btn-main limit";
    } else if (currentOrderMode === "stop-loss") {
      targetGroup.style.display = "block";
      document.getElementById("targetPriceLabel").textContent = "Safety Net Floor Price (₹)";
      modeInfoText.textContent = "🛡️ Safety Net: Automatically sells if price drops here so you never lose your piggy bank!";
      estTotalEl.textContent = fmtMoney(qty * targetPrice);
      executeBtn.textContent = "Set Safety Net (" + selectedStock.sym + ")";
      executeBtn.className = "action-btn-main stoploss";
    } else if (currentOrderMode === "take-profit") {
      targetGroup.style.display = "block";
      document.getElementById("targetPriceLabel").textContent = "Prize Reward Price (₹)";
      modeInfoText.textContent = "🎁 Pocket the Prize: Automatically sells once the stock hits your profit goal!";
      estTotalEl.textContent = fmtMoney(qty * targetPrice);
      executeBtn.textContent = "Set Take-Profit (" + selectedStock.sym + ")";
      executeBtn.className = "action-btn-main takeprofit";
    }
  }

  function setOrderMode(mode) {
    currentOrderMode = mode;
    document.querySelectorAll(".mode-tab").forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-mode") === mode);
    });

    const targetPriceInput = document.getElementById("orderTargetPrice");
    const currentPrice = selectedStock.price;
    if (mode === "limit-buy") {
      targetPriceInput.value = (currentPrice * 0.96).toFixed(2);
    } else if (mode === "stop-loss") {
      targetPriceInput.value = (currentPrice * 0.93).toFixed(2);
    } else if (mode === "take-profit") {
      targetPriceInput.value = (currentPrice * 1.10).toFixed(2);
    }
    updateOrderForm();
  }

  function renderPositions() {
    const tbody = document.getElementById("positionsBody");
    const emptyState = document.getElementById("positionsEmpty");
    const badge = document.getElementById("positionsBadge");
    if (!tbody) return;

    const syms = Object.keys(holdings).filter(s => holdings[s].qty > 0);
    badge.textContent = syms.length;

    if (syms.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    tbody.innerHTML = syms.map(sym => {
      const h = holdings[sym];
      const stock = STOCKS.find(s => s.sym === sym);
      const curPrice = stock ? stock.price : h.avgCost;
      const mktVal = h.qty * curPrice;
      const costBasis = h.qty * h.avgCost;
      const pnl = mktVal - costBasis;
      const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      const cls = pnl >= 0 ? "pos" : "neg";

      return `<tr>
        <td><b>${sym}</b></td>
        <td>${h.qty}</td>
        <td>${fmtMoney(h.avgCost)}</td>
        <td>${fmtMoney(curPrice)}</td>
        <td>${fmtMoney(mktVal)}</td>
        <td class="${cls}">${fmtMoney(pnl)}</td>
        <td class="${cls}">${fmtPct(pnlPct)}</td>
        <td>
          <button class="table-action-btn" onclick="window.sellPositionNow('${sym}')">Sell All</button>
        </td>
      </tr>`;
    }).join("");
  }

  function renderPendingOrders() {
    const tbody = document.getElementById("pendingOrdersBody");
    const emptyState = document.getElementById("pendingOrdersEmpty");
    const badge = document.getElementById("ordersBadge");
    if (!tbody) return;

    badge.textContent = pendingOrders.length;
    if (pendingOrders.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    tbody.innerHTML = pendingOrders.map(o => {
      const typeLabels = {
        LIMIT_BUY: "⏳ Limit Buy",
        STOP_LOSS: "🛡️ Safety Net",
        TAKE_PROFIT: "🎁 Take-Profit"
      };
      return `<tr>
        <td>${o.time}</td>
        <td><b>${o.sym}</b></td>
        <td>${typeLabels[o.type] || o.type}</td>
        <td>${o.qty}</td>
        <td>${fmtMoney(o.targetPrice)}</td>
        <td>
          <button class="table-action-btn" onclick="window.cancelOrderNow('${o.id}')">Cancel</button>
        </td>
      </tr>`;
    }).join("");
  }

  function renderBlotter() {
    const tbody = document.getElementById("blotterBody");
    const emptyState = document.getElementById("blotterEmpty");
    const badge = document.getElementById("blotterBadge");
    if (!tbody) return;

    badge.textContent = trades.length;
    if (trades.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    tbody.innerHTML = trades.slice(0, 40).map(t => {
      const isBuy = t.side === "BUY";
      return `<tr>
        <td>${t.time}</td>
        <td><span style="color:${isBuy ? "var(--green)" : "var(--red)"}; font-weight:700;">${t.side}</span></td>
        <td><b>${t.sym}</b></td>
        <td>${t.orderType}</td>
        <td>${t.qty}</td>
        <td>${fmtMoney(t.price)}</td>
        <td>${fmtMoney(t.total)}</td>
      </tr>`;
    }).join("");
  }

  function renderStats() {
    const totalTradesEl = document.getElementById("statTotalTrades");
    const winRateEl = document.getElementById("statWinRate");
    const realizedPnlEl = document.getElementById("statRealizedPnl");
    const bestTradeEl = document.getElementById("statBestTrade");

    const sellTrades = trades.filter(t => t.side === "SELL");
    const winningTrades = sellTrades.filter(t => t.realizedPnl > 0);
    const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;
    const totalRealizedPnl = sellTrades.reduce((sum, t) => sum + (t.realizedPnl || 0), 0);
    const bestTrade = sellTrades.length > 0 ? Math.max.apply(null, sellTrades.map(t => t.realizedPnl || 0)) : 0;

    totalTradesEl.textContent = trades.length;
    winRateEl.textContent = winRate.toFixed(1) + "%";
    realizedPnlEl.textContent = fmtMoney(totalRealizedPnl);
    realizedPnlEl.className = "sc-value " + (totalRealizedPnl >= 0 ? "pos" : "neg");
    bestTradeEl.textContent = fmtMoney(bestTrade);
  }

  function renderPortfolioSummary() {
    const holdingsValue = Object.keys(holdings).reduce((sum, sym) => {
      const stock = STOCKS.find(s => s.sym === sym);
      const price = stock ? stock.price : 0;
      return sum + (holdings[sym].qty * price);
    }, 0);

    const equity = cash + holdingsValue;
    const dayPnl = equity - STARTING_CASH;

    document.getElementById("cashVal").textContent = fmtMoney(cash);
    document.getElementById("holdingsVal").textContent = fmtMoney(holdingsValue);
    document.getElementById("equityVal").textContent = fmtMoney(equity);

    const dayPnlEl = document.getElementById("dayPnlVal");
    dayPnlEl.textContent = (dayPnl >= 0 ? "+" : "") + fmtMoney(dayPnl);
    dayPnlEl.className = "val " + (dayPnl >= 0 ? "pos" : "neg");

    updateLevelDisplay(equity);

    equityHistory.push(equity);
    if (equityHistory.length > 200) equityHistory.shift();

    const eqCanvas = document.getElementById("equityChart");
    if (eqCanvas) drawEquityLine(eqCanvas, equityHistory);
  }

  function exportBlotterCSV() {
    if (trades.length === 0) {
      showToast("No trades executed yet to export.", "info");
      return;
    }
    let csv = "Time,Side,Symbol,Method,Quantity,Price,Total Amount,Realized PnL\n";
    trades.forEach(t => {
      csv += `"${t.time}","${t.side}","${t.sym}","${t.orderType}",${t.qty},${t.price},${t.total},${t.realizedPnl || 0}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SIMDEX_Trades_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Trade history exported as CSV.", "success");
  }

  function updateSoundButton() {
    const btn = document.getElementById("profileSoundBtn");
    if (btn) {
      btn.textContent = soundEnabled ? "🔊 Sound On" : "🔇 Sound Off";
      btn.classList.toggle("danger", !soundEnabled);
    }
  }

  function renderAll() {
    renderProfileHeader();
    renderTickerTape();
    renderWatchlist();
    renderChartHeader();
    drawPriceChart();
    renderPositions();
    renderPendingOrders();
    renderBlotter();
    renderStats();
    renderPortfolioSummary();
    updateOrderForm();
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(msg, type) {
    const host = document.getElementById("toastHost");
    if (!host) return;
    const t = document.createElement("div");
    t.className = "toast " + (type || "info");
    t.textContent = msg;
    host.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 250);
    }, 3200);
  }

  /* ==========================================================================
     EVENT HANDLERS & EXPORTS
     ========================================================================== */
  window.sellPositionNow = function (sym) {
    const h = holdings[sym];
    if (h && h.qty > 0) {
      executeMarketOrder("SELL", sym, h.qty);
    }
  };

  window.cancelOrderNow = function (orderId) {
    cancelPendingOrder(orderId);
  };

  function setupEvents() {
    const profileModal = document.getElementById("profileModal");
    const guideModal = document.getElementById("guideModal");
    const resetModal = document.getElementById("resetModal");
    const certificateModal = document.getElementById("certificateModal");

    // Open Profile Modal (force populate inputs from userProfile)
    document.getElementById("openProfileBtn").addEventListener("click", () => {
      renderProfileHeader(true);
      profileModal.classList.add("open");
    });
    document.getElementById("closeProfileBtn").addEventListener("click", () => profileModal.classList.remove("open"));

    // Real-time Name & DOB Input handlers (safe without fighting keystrokes)
    const nameInput = document.getElementById("profileNameInput");
    const dobInput = document.getElementById("profileDobInput");

    if (nameInput) {
      nameInput.addEventListener("input", e => {
        userProfile.name = e.target.value;
        const initial = (userProfile.name.trim().charAt(0) || "T").toUpperCase();
        document.getElementById("topProfileName").textContent = userProfile.name.trim() || "Trader";
        document.getElementById("topAvatarLetter").textContent = initial;
        document.getElementById("modalProfileDisplayName").textContent = userProfile.name.trim() || "Trader";
        document.getElementById("modalAvatarLetter").textContent = initial;
        saveProfile();
      });
    }

    if (dobInput) {
      dobInput.addEventListener("change", e => {
        userProfile.dob = e.target.value;
        const dobText = userProfile.dob ? `DOB: ${userProfile.dob}` : "DOB: Not set";
        document.getElementById("modalProfileDobDisplay").textContent = `${dobText} · Starting Balance: ₹1,00,000`;
        saveProfile();
      });
    }

    document.getElementById("saveProfileBtn").addEventListener("click", () => {
      if (nameInput) userProfile.name = nameInput.value.trim() || "Trader";
      if (dobInput) userProfile.dob = dobInput.value;
      saveProfile();
      renderProfileHeader(true);
      profileModal.classList.remove("open");
      showToast("Profile settings saved permanently!", "success");
    });

    // Theme Switchers inside Profile
    document.getElementById("pThemeLightBtn").addEventListener("click", () => applyTheme("light"));
    document.getElementById("pThemeSystemBtn").addEventListener("click", () => applyTheme("system"));
    document.getElementById("pThemeDarkBtn").addEventListener("click", () => applyTheme("dark"));

    // Sound toggle in Profile
    document.getElementById("profileSoundBtn").addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      updateSoundButton();
      saveState();
      showToast(soundEnabled ? "Audio chimes enabled." : "Audio muted.", "info");
    });

    // User Guide in Profile
    document.getElementById("profileGuideBtn").addEventListener("click", () => {
      guideModal.classList.add("open");
    });
    document.getElementById("closeGuideBtn").addEventListener("click", () => guideModal.classList.remove("open"));

    // Reset Simulation in Profile
    document.getElementById("profileResetBtn").addEventListener("click", () => {
      resetModal.classList.add("open");
    });
    document.getElementById("cancelResetBtn").addEventListener("click", () => resetModal.classList.remove("open"));
    document.getElementById("confirmResetBtn").addEventListener("click", () => {
      resetModal.classList.remove("open");
      profileModal.classList.remove("open");
      hardReset();
    });

    // Certificate modal triggers
    document.getElementById("openCertificateBtn").addEventListener("click", openCertificateModal);
    document.getElementById("closeCertModalBtn").addEventListener("click", () => certificateModal.classList.remove("open"));
    document.getElementById("doneCertBtn").addEventListener("click", () => certificateModal.classList.remove("open"));

    // Watchlist search
    const searchInput = document.getElementById("watchlistSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", e => {
        searchQuery = e.target.value.trim();
        renderWatchlist();
      });
    }

    // Order mode tabs
    document.querySelectorAll(".mode-tab").forEach(tab => {
      tab.addEventListener("click", () => setOrderMode(tab.getAttribute("data-mode")));
    });

    // Qty controls
    const qtyInput = document.getElementById("orderQty");
    document.getElementById("qtyDec").addEventListener("click", () => {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 5);
      updateOrderForm();
    });
    document.getElementById("qtyInc").addEventListener("click", () => {
      qtyInput.value = (parseInt(qtyInput.value, 10) || 0) + 5;
      updateOrderForm();
    });
    qtyInput.addEventListener("input", updateOrderForm);

    document.querySelectorAll(".chip-btn").forEach(chip => {
      chip.addEventListener("click", () => {
        const val = chip.getAttribute("data-qty");
        if (val === "MAX") {
          const maxShares = Math.floor(cash / selectedStock.price);
          qtyInput.value = Math.max(1, maxShares);
        } else {
          qtyInput.value = parseInt(val, 10);
        }
        updateOrderForm();
      });
    });

    document.getElementById("orderTargetPrice").addEventListener("input", updateOrderForm);

    // Main execute button
    document.getElementById("executeOrderBtn").addEventListener("click", () => {
      const qty = parseInt(qtyInput.value, 10) || 0;
      const targetPrice = parseFloat(document.getElementById("orderTargetPrice").value) || 0;

      if (currentOrderMode === "buy-now") {
        executeMarketOrder("BUY", selectedStock.sym, qty);
      } else if (currentOrderMode === "limit-buy") {
        addPendingOrder("LIMIT_BUY", selectedStock.sym, qty, targetPrice);
      } else if (currentOrderMode === "stop-loss") {
        addPendingOrder("STOP_LOSS", selectedStock.sym, qty, targetPrice);
      } else if (currentOrderMode === "take-profit") {
        addPendingOrder("TAKE_PROFIT", selectedStock.sym, qty, targetPrice);
      }
    });

    // Instant Sell button
    document.getElementById("instantSellBtn").addEventListener("click", () => {
      const qty = parseInt(qtyInput.value, 10) || 0;
      executeMarketOrder("SELL", selectedStock.sym, qty);
    });

    // Timeframe selector
    document.querySelectorAll(".tf-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tf-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentGroupSize = parseInt(btn.getAttribute("data-group"), 10);
        drawPriceChart();
      });
    });

    // Indicator toggles
    const maBtn = document.getElementById("toggleMA");
    const volBtn = document.getElementById("toggleVol");
    if (maBtn) {
      maBtn.addEventListener("click", () => {
        showMA = !showMA;
        maBtn.classList.toggle("active", showMA);
        drawPriceChart();
      });
    }
    if (volBtn) {
      volBtn.addEventListener("click", () => {
        showVolume = !showVolume;
        volBtn.classList.toggle("active", showVolume);
        drawPriceChart();
      });
    }

    // Export CSV
    const exportBtn = document.getElementById("exportBlotterBtn");
    if (exportBtn) exportBtn.addEventListener("click", exportBlotterCSV);

    // Bottom tab switching
    document.querySelectorAll(".tab-nav-btn").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab-nav-btn").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        const targetId = tab.getAttribute("data-target");
        document.getElementById(targetId).classList.add("active");
      });
    });

    // Close on overlay click
    [profileModal, guideModal, resetModal, certificateModal].forEach(modal => {
      modal.addEventListener("click", e => {
        if (e.target === modal) modal.classList.remove("open");
      });
    });

    // Chart Crosshair
    setupChartHover();

    // Window resize
    window.addEventListener("resize", () => {
      drawPriceChart();
      const eqCanvas = document.getElementById("equityChart");
      if (eqCanvas) drawEquityLine(eqCanvas, equityHistory);
    });
  }

  /* ==========================================================================
     MAIN HEARTBEAT LOOP
     ========================================================================== */
  function tick() {
    triggerNewsEvent();
    updateStockPrices();
    checkPendingOrders();
    renderTickerTape();
    renderWatchlist();
    renderChartHeader();
    drawPriceChart();
    renderPositions();
    renderPortfolioSummary();
    saveState();
  }

  function boot() {
    const loaded = loadState();
    if (!loaded) {
      initStocks();
      saveState();
    } else {
      initStocks();
    }

    setupEvents();
    renderAll();
    setOrderMode("buy-now");
    updateLiveClock();

    setInterval(tick, 1400);
    setInterval(updateLiveClock, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
