# quarter-focus-chrome-ext

A Pomodoro timer extension focused on simplicity and daily task tracking.

## Features
- 5/2 minute work/break intervals
- Daily task tracking with total time
- Window focus reminders
- Browser integration
- Task duration tracking

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
│   │   └── PomodoroTimer.jsx   # Main timer interface
│   ├── index.css               # Global styles
│   └── index.jsx               # Entry point
├── public/
│   ├── notification.wav        # Timer completion sound
│   └── icons/                  # Extension icons
└── [config files]
```

## Roadmap
- [ ] Sound notifications
- [ ] Task categories/tags
- [ ] Statistics/analytics
- [ ] Settings panel
- [ ] Data export
- [ ] Task duration estimates
