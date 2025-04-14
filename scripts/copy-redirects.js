// scripts/copy-redirects.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientDistDir = path.resolve(rootDir, 'client/dist');

// Ensure client/dist directory exists
if (!fs.existsSync(clientDistDir)) {
  console.error('Error: client/dist directory does not exist');
  process.exit(1);
}

// Copy _redirects file to client/dist
const redirectsSource = path.resolve(rootDir, '_redirects');
const redirectsDestination = path.resolve(clientDistDir, '_redirects');

try {
  fs.copyFileSync(redirectsSource, redirectsDestination);
  console.log('Successfully copied _redirects to client/dist');
} catch (error) {
  console.error('Error copying _redirects file:', error);
  process.exit(1);
}