import fs from 'fs';

// Clean and create public directory
fs.rmSync('public', { recursive: true, force: true });
fs.mkdirSync('public', { recursive: true });

// Read the HTML file and fix relative paths for the production root
let html = fs.readFileSync('playground/index.html', 'utf-8');
html = html.replace(/\.\.\/dist\//g, './dist/');
fs.writeFileSync('public/index.html', html);

// Copy remaining assets directly to the root
fs.cpSync('playground/zenode.css', 'public/zenode.css');

// Copy the distribution folder
fs.cpSync('dist', 'public/dist', { recursive: true });

console.log("Vercel public directory successfully built and flattened.");
