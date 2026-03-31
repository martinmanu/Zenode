import fs from 'fs';
import path from 'path';

const indexPath = path.join(process.cwd(), 'public', 'index.html');
if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');

    // Replace relative paths for the production public folder
    // Changes "../dist/" to "./dist/"
    content = content.replace(/\"\.\.\/dist\//g, '"./dist/');
    content = content.replace(/from \"\.\.\/dist\//g, 'from "./dist/');

    fs.writeFileSync(indexPath, content);
    console.log('✅ Patched playground paths for production deployment!');
} else {
    console.error('❌ public/index.html not found! Skipping path patch.');
}
