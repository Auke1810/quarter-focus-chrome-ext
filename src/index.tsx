import React from 'react';
import { createRoot } from 'react-dom/client';
import PomodoroTimer from './components/PomodoroTimer';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

const rootElement = createRoot(root);

rootElement.render(
  <React.StrictMode>
    <PomodoroTimer />
  </React.StrictMode>
);