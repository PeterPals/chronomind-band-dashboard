# ChronoMind Band Dashboard

A React + Vite + Tailwind CSS web application for **ChronoMind Band** — a student-centered biometric, sleep cycle, circadian study planner, and privacy-first parent companion dashboard.

## Features

- **Trung tâm Sinh học (Biometric Hub)**: Live optical PPG metrics (HR, HRV, SpO2), morning recovery radial gauge, and 24-hour 3-axis actigraphy breakdown.
- **Chu kỳ Giấc ngủ (Sleep Cycle & Anti-Sleep Inertia)**: 90-minute hypnogram visualization (`N1 → N2 → N3 → REM`) and smart wake-window calculator targeting light sleep (`N2`).
- **Mục tiêu & Chỉ số (Quantitative Goals & Adaptive Scheduling)**: Define specific numeric targets (e.g., `SAT 1560`, `8.0 điểm Toán`, `2 km chạy bộ mỗi ngày`), track inline progress (`+`/`-` steps or direct numeric entry), visualize daily Golden Hour time allocation, and automatically generate/adjust scheduled study and exercise blocks based on remaining gap, priority, and morning recovery.
- **Lịch Thời điểm vàng (Golden Hours Planner)**: Circadian energy curve synced with morning recovery, featuring Day / Week / Month / Semester views, manual task creation/completion/deletion, live semester goal tracking, and goal-driven schedule blocks.
- **Trợ lý Tinh thần AI (Mood & Auto-Rebalance)**: Daily mood check-in, private local journal, HRV correlation, and one-click schedule rebalancing with undo support.
- **Điều khiển Vòng tay (Band Features)**: Zero-Distraction focus timer + simulated OLED band display, 60-second guided breathing modal, Burnout Guard sitting tracker, protected family/connection blocks, and Privacy-First Parent Companion view.
- **Mô phỏng tín hiệu vòng tay (Demo Mode)**: Interactive simulator in the bottom-right corner for HR spike, 95-minute sitting alert, and sleep deprivation scenarios.

## Prerequisites

- **Node.js** `>= 18` (tested on `v22.23.1`)
- **npm** `>= 9`

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Project Structure

```text
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── BandFeaturesTab.jsx
│   │   ├── BiometricsTab.jsx
│   │   ├── BreathingModal.jsx
│   │   ├── GoalsTab.jsx
│   │   ├── MoodTab.jsx
│   │   ├── ParentCompanionView.jsx
│   │   ├── PlannerTab.jsx
│   │   ├── RecoveryGauge.jsx
│   │   └── SleepTab.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── utils/
│   │   ├── goalScheduler.js
│   │   └── sleepCalculator.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
