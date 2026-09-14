const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

content = content.replace(
    'const t = getFuzzyKey(h, "ประเภท") || \'\';',
    'const t = String(getFuzzyKey(h, "ประเภท") || \'\');'
).replace(
    'const t = getFuzzyKey(h, "ประเภท") || \'\';',
    'const t = String(getFuzzyKey(h, "ประเภท") || \'\');'
);

// In case there are other places where I used `.includes` on potentially non-string `t`
fs.writeFileSync(appPath, content);
console.log("Fixed t.includes issue");
