const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

content = content.replace('<SkinCheckModal isOpen={isSkinCheckModalOpen} onClose={() => setIsSkinCheckModalOpen(false)} course={skinCheckCourse} app={null} />', '<SkinCheckModal isOpen={isSkinCheckModalOpen} onClose={() => setIsSkinCheckModalOpen(false)} course={skinCheckCourse} app={app} />');

fs.writeFileSync(appPath, content);
console.log("Patched SkinCheckModal app prop");
