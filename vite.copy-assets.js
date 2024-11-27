import fs from 'fs';
import path from 'path';

export function copyAssets() {
  return {
    name: 'copy-assets',
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

      // Copy sound files
      ['notification.wav', 'complete.wav'].forEach(sound => {
        const soundPath = `public/${sound}`;
        if (fs.existsSync(soundPath)) {
          fs.copyFileSync(soundPath, `dist/${sound}`);
        }
      });
    }
  };
}
