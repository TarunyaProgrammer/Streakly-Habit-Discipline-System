# Streakly · ![License](https://img.shields.io/badge/license-MIT-blue.svg) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

> **A discipline mirror that records every promise you keep — and every one you break.**

streakly.app (Coming Soon)

## ⚡ What is Streakly?

Streakly is not a checklist. It is a **Discipline System** designed for those who demand accountability. Built with a "Void Discipline" aesthetic, it offers a distraction-free, high-contrast interface to track your mandatory and optional protocols.

Unlike forgiving habit trackers, Streakly is **strict**:

- **Miss a mandatory habit?** Your streak resets. No excuses.
- **Timezone Aware**: Late night grinder? We handle it.
- **Offline First**: Your discipline data lives on your device (IndexedDB). No cloud required.

## 🖤 The Void Theme

Designed to be stared at in the dark at 2 AM.

- **Background**: `#0B0E14` (Void)
- **Accents**: `#3B82F6` (Electric Blue) & `#22C55E` (Success)
- **Feedback**: Neon pulses for high streaks, angry shakes for failures.

## 🛠️ Tech Stack

Built for speed, performance, and pure client-side persistence.

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Icons**: Lucide React
- **Persistence**: IndexedDB (via `idb`)
- **Effects**: Canvas Confetti

## 🚀 Getting Started

Clone the repository and initiate the protocol.

```bash
# 1. Clone
git clone https://github.com/TarunyaProgrammer/Streakly-Habit-Discipline-System.git

# 2. Enter the Void
cd Streakly-Habit-Discipline-System

# 3. Install
npm install

# 4. Run
npm run dev
```

## 🧩 Key Features

### 1. The Grid

A visual matrix of your consistency. Rows are habits, columns are days.

- **Grey**: Future (Locked)
- **Blue**: Today (Active)
- **Green**: Done
- **Red**: Missed (Implied by broken streak)

### 2. Strict Streak Logic

Calculated live.

- **Mandatory**: Must be done daily (unless weekend off). Missing one resets the counter.
- **Optional**: Adds to completion % but doesn't break the main streak.

### 3. Visual Feedback

- **Spark**: Click a cell for a satisfying toggle.
- **Pulse**: Maintain a 7+ day streak to see your flame pulse with neon energy.
- **Shake**: Break a streak, and watch the UI reject your failure.

## 🤝 Contributing

Discipline is shared.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**[TarunyaProgrammer](https://github.com/TarunyaProgrammer)**
