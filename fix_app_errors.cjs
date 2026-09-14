const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// Fix imports
content = content.replace('import { Camera, Image as ImageIcon, CheckCircle, Save, QrCode, Clock, CheckCircle', 'import { Camera, Save, QrCode, Clock, CheckCircle');
content = content.replace('Upload, Image as ImageIcon, ReceiptText', 'Upload, ReceiptText');

// Fix duplicated state
content = content.replace(`const [showCreditPayQR, setShowCreditPayQR] = useState(false);
const [showCreditPayQR, setShowCreditPayQR] = useState(false);`, `const [showCreditPayQR, setShowCreditPayQR] = useState(false);`);

fs.writeFileSync(appPath, content);
console.log("Fixed syntax errors");
