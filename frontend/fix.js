const fs = require('fs');
const path = require('path');

const replacer = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace colors
    content = content.replace(/slate/g, 'gray');
    content = content.replace(/emerald/g, 'green');
    content = content.replace(/rose/g, 'red');
    content = content.replace(/amber/g, 'yellow');

    // Replace opacities
    content = content.replace(/bg-white\/80/g, 'bg-white bg-opacity-80');
    content = content.replace(/bg-white\/50/g, 'bg-white bg-opacity-50');
    content = content.replace(/bg-white\/40/g, 'bg-white bg-opacity-40');
    content = content.replace(/bg-white\/20/g, 'bg-white bg-opacity-20');
    
    content = content.replace(/border-white\/40/g, 'border-white border-opacity-40');
    content = content.replace(/border-white\/20/g, 'border-white border-opacity-20');
    content = content.replace(/border-white\/10/g, 'border-white border-opacity-10');

    content = content.replace(/bg-purple-500\/20/g, 'bg-purple-500 bg-opacity-20');
    content = content.replace(/shadow-purple-500\/20/g, 'shadow-lg');
    content = content.replace(/ring-purple-500\/20/g, 'ring-purple-500 ring-opacity-20');
    content = content.replace(/ring-purple-500\/30/g, 'ring-purple-500 ring-opacity-30');

    content = content.replace(/shadow-gray-200\/50/g, 'shadow-md');
    content = content.replace(/ring-indigo-500\/20/g, 'ring-indigo-500 ring-opacity-20');

    content = content.replace(/bg-green-500\/90/g, 'bg-green-500 bg-opacity-90');
    content = content.replace(/bg-red-500\/90/g, 'bg-red-500 bg-opacity-90');
    content = content.replace(/bg-blue-500\/90/g, 'bg-blue-500 bg-opacity-90');

    content = content.replace(/text-white\/70/g, 'text-white text-opacity-70');
    content = content.replace(/bg-indigo-900\/40/g, 'bg-indigo-900 bg-opacity-40');
    
    fs.writeFileSync(filePath, content);
};

const walkSync = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkSync(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.css')) {
            replacer(filePath);
        }
    }
};

walkSync(path.join(__dirname, 'src'));
console.log('Done replacing tailwind 3 classes with tailwind 2 classes.');
