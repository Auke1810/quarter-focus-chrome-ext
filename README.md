# quarter-focus-chrome-ext

A Pomodoro timer extension focused on simplicity and daily task tracking.

![Version](https://img.shields.io/badge/version-2.3.0-blue.svg)

## Features
- 25/5 minute work/break intervals (Pomodoro technique)
- Daily task tracking with completion timestamps
- Strategy planning modal
- Key Focus and Secondary Focus task setting
- Daily intention setting
- Task archive functionality
- Sound notifications
- Browser integration with focus reminders
- Task duration tracking

### Tech Stack
- React 18
- Vite 4
- TailwindCSS 3
- Lucide React (for icons)

## Development

### Setup
```bash
git clone [your-repo-url]
cd quarter-focus-chrome-ext
npm install
```

### Running
```bash
npm run build    # Build extension
npm run watch    # Build with auto-reload
```

### Loading Extension
1. Open Chrome
2. Go to chrome://extensions/
3. Enable Developer Mode
4. Click "Load unpacked"
5. Select `dist` directory

### Project Structure
```
quarter-focus-chrome-ext/
├── src/
│   ├── background/
│   │   └── service-worker.js    # Timer and state management
│   ├── components/
│   │   ├── layout/             # Layout components (Header, Footer)
│   │   ├── tasks/              # Task management components
│   │   ├── timer/              # Timer related components
│   │   ├── strategy/           # Strategy and intention components
│   │   ├── PomodoroTimer.jsx   # Main application component
│   │   ├── StrategyModal.jsx   # Strategy planning interface
│   │   └── TaskArchiveModal.jsx # Task history and archives
│   ├── index.css               # Global styles
│   └── index.jsx               # Entry point
├── public/
│   ├── notification.wav        # Timer completion sound
│   └── icons/                  # Extension icons
└── [config files]              # Vite, TailwindCSS, and extension configs
```

## Roadmap
- [ ] Task categories/tags
- [ ] Statistics/analytics
- [ ] Settings panel
- [ ] Data export
