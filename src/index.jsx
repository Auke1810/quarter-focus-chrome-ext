import React from 'react';
import ReactDOM from 'react-dom/client';
import PomodoroTimer from './components/PomodoroTimer';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PomodoroTimer />
  </React.StrictMode>
);