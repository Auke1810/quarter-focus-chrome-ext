import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        // Copy manifest.json
        fs.copyFileSync('manifest.json', 'dist/manifest.json');
        
        // Ensure icons directory exists
        if (!fs.existsSync('dist/icons')) {
          fs.mkdirSync('dist/icons', { recursive: true });
        }
        
        // Copy icons
        ['16', '48', '128'].forEach(size => {
          const iconPath = `public/icons/icon${size}.png`;
          if (fs.existsSync(iconPath)) {
            fs.copyFileSync(iconPath, `dist/icons/icon${size}.png`);
          }
        });

        // Copy notification sound
        const notificationSound = 'public/notification.wav';
        if (fs.existsSync(notificationSound)) {
          fs.copyFileSync(notificationSound, 'dist/notification.wav');
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/service-worker.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js';
        }
      }
    },
    emptyOutDir: true,
  }
});