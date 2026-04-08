const fs = require('fs');
const path = require('path');

const root = process.cwd();
const publicDir = path.join(root, 'public');

/**
 * Robustly copies a directory and all its contents (recursive).
 */
function copyFolderSync(from, to) {
    if (!fs.existsSync(from)) return;
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isDirectory()) {
            copyFolderSync(fromPath, toPath);
        } else {
            fs.copyFileSync(fromPath, toPath);
        }
    });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

console.log('[DEPLOY] Preparing clean public/ directory...');
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
ensureDir(publicDir);

// 1. Copy Static Assets
console.log('[DEPLOY] Copying Playground HTML/CSS...');
fs.copyFileSync(path.join(root, 'playground/index.html'), path.join(publicDir, 'index.html'));
if (fs.existsSync(path.join(root, 'playground/zenode.css'))) {
  fs.copyFileSync(path.join(root, 'playground/zenode.css'), path.join(publicDir, 'zenode.css'));
} else if (fs.existsSync(path.join(root, 'packages/designer/zenode.css'))) {
  fs.copyFileSync(path.join(root, 'packages/designer/zenode.css'), path.join(publicDir, 'zenode.css'));
}

// 2. Copy Full Package Builds
console.log('[DEPLOY] Syncing package bundles...');
copyFolderSync(path.join(root, 'packages/designer/dist'), path.join(publicDir, 'dist/designer'));
copyFolderSync(path.join(root, 'packages/serializer/dist'), path.join(publicDir, 'dist/serializer'));

// 3. Copy Serializer Playground
console.log('[DEPLOY] Syncing serializer playground...');
copyFolderSync(path.join(root, 'playground/serializer'), path.join(publicDir, 'serializer'));

console.log('[DEPLOY] Done! All artifacts collected in public/');
