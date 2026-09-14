import fs from 'fs';
const appData = fs.readFileSync('src/App.jsx', 'utf8');
const keys = appData.match(/getFuzzyKey\(c, \[(.*?)\]\)/g);
console.log(keys);
