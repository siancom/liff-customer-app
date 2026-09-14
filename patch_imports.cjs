const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const oldImports = `Package, Download, CalendarClock`;
const newImports = `Package, Download, CalendarClock, Send, ArrowRightLeft`;

content = content.replace(oldImports, newImports);
fs.writeFileSync(appPath, content);
console.log("Patched lucide-react imports.");
