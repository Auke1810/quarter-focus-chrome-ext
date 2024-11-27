# quarter-focus-chrome-ext

A Pomodoro timer extension focused on simplicity and daily task tracking.

![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)

## Features
- 25/5 minute work/break intervals (Pomodoro technique)
- Daily task tracking with completion timestamps
- Strategy planning modal
  - Key Focus and Secondary Focus task setting
  - Planned Pomodoro count per task (with time estimation)
  - Visual feedback for overrun tasks (red highlighting)
  - Daily intention setting
- Task archive functionality
- Sound notifications
  - Timer completion sound
  - Break-end reminder sound
- Browser integration with focus reminders
- Task duration tracking
  - Actual vs planned Pomodoro comparison
  - Total time spent per task
  - Visual indicators for tasks exceeding planned time

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

### Roadmap
- [x] Pomodoro timer
- [x] Task management
- [x] Strategy planning
- [x] Task archive
- [x] Timer completion sound
- [x] Break-end reminder sound
- [x] Browser integration
- [x] Task duration tracking
- [x] Visual indicators for tasks exceeding planned time
- [x] Being able to stop the timer when break has ended
- [ ] Save task after first pomodoro completion display under "Tasks done today" and update after each pomodoro.
- [ ] If the timer runs, display a countdown timer in an overlay.
- VERSION 3.
- [ ] Add tasks to timer with details and planed pomodoros
- [ ] Show list of task and start pomodoro from task.
- [ ] Settings panel
- [ ] Statistics/analytics
- [ ] settings - pomodoro focus and break intervals
- [ ] settings - pauze or resume after timer ends
- [ ] settings - notification sound customization (volume and file)
- [ ] Show Google Calendar events
- [ ] Settings - Google Calendar integration
- VERSION 4.
- [ ] Add Accountability AI coach
- [ ] Data export

### Bugs
- [ ] Clicking on the Chrome extension icon opens a second timer window

### Future Improvements

#### 1. Code Structure and Organization
- [x] Split PomodoroTimer.jsx into smaller components
- [x] Create a dedicated services directory for Chrome storage operations
- [x] Move Chrome API interactions into a separate service layer
- [x] Create constants file for magic numbers (25 minutes, timer intervals, etc.)
- [x] Implement proper TypeScript for better type safety

#### 2. State Management
- [x] Consider using a state management solution (Redux/Zustand)
- [x] Move timer state logic to a custom hook (useTimer)
- [ ] Create separate hooks for storage operations (useStorage)
- [ ] Implement proper loading states for async operations

#### 3. Error Handling
- [ ] Add proper error boundaries for React components
- [ ] Implement comprehensive error handling for Chrome API calls
- [ ] Add error states and user feedback for failed operations
- [ ] Create a dedicated error logging service

#### 4. Performance
- [ ] Memoize expensive calculations (calculateTotalTime, groupedTasks)
- [ ] Use React.memo() for pure components
- [ ] Optimize re-renders in CompletedTasks component
- [ ] Implement proper cleanup in useEffect hooks
- [ ] Reduce the number of Chrome storage operations

#### 5. Testing
- [ ] Add unit tests for core functionality
- [ ] Implement integration tests for Chrome API interactions
- [ ] Add E2E tests for critical user flows
- [ ] Add proper test coverage for utility functions

#### 6. Code Quality
- [ ] Add proper JSDoc documentation for functions
- [ ] Implement stricter ESLint rules
- [ ] Add prop-types or TypeScript interfaces
- [ ] Create consistent naming conventions for event handlers

#### 7. Security
- [ ] Implement proper sanitization for user inputs
- [ ] Add rate limiting for storage operations
- [ ] Implement proper data validation
- [ ] Add security headers

#### 8. Accessibility
- [ ] Add proper ARIA labels
- [ ] Improve keyboard navigation
- [ ] Add proper focus management
- [ ] Implement proper color contrast

#### 9. Best Practices
- [ ] Implement proper loading states
- [ ] Add proper data persistence strategy
- [ ] Create proper build optimization
- [ ] Add proper environment configuration

#### 10. Developer Experience
- [ ] Add better development documentation
- [ ] Implement proper debugging tools
- [ ] Add development utilities
- [ ] Create proper development workflow

#### 11. UI/UX
- [x] Add proper transitions
- [x] Create consistent styling system
- [ ] Add proper loading indicators
- [ ] Implement proper error states

#### 12. Maintenance
- [ ] Add proper versioning system
- [ ] Create proper deployment strategy
- [ ] Implement proper logging
- [ ] Add proper monitoring

#### 13. Browser Extension Specific
- [ ] Optimize manifest.json
- [ ] Implement proper background script handling
- [ ] Add proper permissions handling
- [ ] Create proper extension lifecycle management

#### 14. Build System
- [ ] Optimize Vite configuration
- [ ] Implement proper code splitting
- [ ] Add proper asset optimization
- [ ] Create proper production builds

#### 15. Dependencies
- [ ] Audit and update dependencies
- [ ] Remove unused dependencies
- [ ] Add proper dependency management
- [ ] Implement proper version control