import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

/** Recursive copy for cross-platform support without dependencies */
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

try {
    console.log('🚀 [ZENODE] Starting Cross-Platform Production Build...');
    
    // 1. Build the library
    console.log('📦 Compiling Engine Library...');
    execSync('npx rollup -c', { stdio: 'inherit' });

    const publicDir = path.join(process.cwd(), 'public');
    
    // 2. Clean and setup public directory
    if (fs.existsSync(publicDir)) {
        fs.rmSync(publicDir, { recursive: true, force: true });
    }
    fs.mkdirSync(path.join(publicDir, 'dist'), { recursive: true });

    // 3. Copy Assets
    console.log('📂 Syncing Playground, Dist, README, and Assets...');
    copyRecursiveSync('playground', publicDir);
    copyRecursiveSync('dist', path.join(publicDir, 'dist'));
    copyRecursiveSync('assets', path.join(publicDir, 'assets'));
    fs.copyFileSync('README.md', path.join(publicDir, 'README.md'));

    // 4. Patch Pathing for Production Folder Structure
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf8');
        // Translate development paths to production paths
        content = content.replace(/\"\.\.\/dist\//g, '"./dist/');
        content = content.replace(/from \"\.\.\/dist\//g, 'from "./dist/');
        // Fix README fetch path for production
        content = content.replace(/fetch\(\'\.\.\/README\.md\'\)/g, "fetch('./README.md')");
        // Fix GitHub links
        content = content.replace(/github\.com\/zenode\/designer/g, "github.com/martinmanu/Zenode");
        fs.writeFileSync(indexPath, content);
    }

    console.log('✅ [ZENODE] Build Successful! Production-ready site at /public');
} catch (err) {
    console.error('❌ Build failed:', err.message);
    process.exit(1);
}
