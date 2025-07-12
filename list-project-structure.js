const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd(); // Gets the current working directory
const maxDepth = 3; // Adjust this number to go deeper or shallower

function listDirectory(currentPath, depth) {
    if (depth > maxDepth) {
        return;
    }

    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
        const filePath = path.join(currentPath, file);
        const stats = fs.statSync(filePath);
        const indent = '  '.repeat(depth);

        // Skip node_modules to keep output manageable
        if (file === 'node_modules' && stats.isDirectory()) {
            console.log(`${indent}📁 ${file}/ (skipped)`);
            return;
        }

        if (stats.isDirectory()) {
            console.log(`${indent}📁 ${file}/`);
            listDirectory(filePath, depth + 1);
        } else {
            console.log(`${indent}📄 ${file}`);
        }
    });
}

console.log(`Project Structure for: ${projectRoot}`);
console.log(`(Max depth: ${maxDepth}, node_modules skipped)`);
console.log('--------------------------------------------------');
listDirectory(projectRoot, 0);
console.log('--------------------------------------------------');
console.log('Please copy the entire output above and paste it into our chat.');
