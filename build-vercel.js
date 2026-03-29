import fs from 'fs';

// Clean and create public directory
fs.rmSync('public', { recursive: true, force: true });
fs.mkdirSync('public/playground', { recursive: true });
fs.mkdirSync('public/dist', { recursive: true });

// Copy directories
fs.cpSync('playground', 'public/playground', { recursive: true });
fs.cpSync('dist', 'public/dist', { recursive: true });

console.log("Vercel public directory successfully built.");
