const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(/\!\(b\.status \|\| ''\)\.includes\('ยกเลิก'\)/g, "!(b.status || '').includes('ยกเลิก') && !(b.status || '').includes('เสร็จสิ้น')");

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log("Fixed slots in liff-customer-app");
