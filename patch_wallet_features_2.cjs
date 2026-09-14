const fs = require('fs');

let appContent = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', 'utf8');

const extractBlock = (content, startTag, endTag) => {
    const startIdx = content.indexOf(startTag);
    if (startIdx === -1) return null;
    let nextIdx = startIdx;
    while(true) {
        const tempEndIdx = content.indexOf(endTag, nextIdx);
        if (tempEndIdx === -1) break;
        return { start: startIdx, end: tempEndIdx + endTag.length, text: content.substring(startIdx, tempEndIdx + endTag.length) };
    }
    return null;
}

const vipBlock = extractBlock(appContent, `<div className="w-full text-left">\n                   {(() => {\n                    const totalCreditValue`, `);\n                    })()}\n                  </div>`);
const titleBlock = extractBlock(appContent, `<Banknote size={48}`, `ตัดยอดเงินจากเครดิตคงเหลือ</p>`);

if (vipBlock && titleBlock) {
    console.log("Blocks found, swapping...");
    let newContent = appContent.substring(0, vipBlock.start) + appContent.substring(vipBlock.end);
    
    const insertPoint = newContent.indexOf(titleBlock.text);
    
    const actionButtons = `
                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3 w-full mb-6 relative z-10 mt-4">
                      <button onClick={() => setIsTopupOpen(true)} className="flex flex-col items-center justify-center bg-white/20 hover:bg-white/30 transition-colors rounded-2xl py-3 backdrop-blur-md shadow-sm border border-white/20">
                          <Banknote size={24} className="text-white mb-1" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">เติม</span>
                      </button>
                      <button onClick={() => setIsScannerOpen(true)} className="flex flex-col items-center justify-center bg-white/20 hover:bg-white/30 transition-colors rounded-2xl py-3 backdrop-blur-md shadow-sm border border-white/20">
                          <RefreshCcw size={24} className="text-white mb-1" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">โอน</span>
                      </button>
                      <button onClick={() => setIsExchangeOpen(true)} className="flex flex-col items-center justify-center bg-white/20 hover:bg-white/30 transition-colors rounded-2xl py-3 backdrop-blur-md shadow-sm border border-white/20">
                          <Gift size={24} className="text-white mb-1" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">แลก</span>
                      </button>
                  </div>
`;

    newContent = newContent.substring(0, insertPoint) + vipBlock.text + '\n' + actionButtons + '\n' + titleBlock.text + newContent.substring(insertPoint + titleBlock.text.length);
    
    if (!newContent.includes('import { Html5QrcodeScanner }')) {
        newContent = newContent.replace(`import { collection, query, where, getDocs, orderBy, limit, addDoc, updateDoc, doc } from 'firebase/firestore';`, `import { collection, query, where, getDocs, orderBy, limit, addDoc, updateDoc, doc } from 'firebase/firestore';\nimport { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';`);
    }
    if (!newContent.includes('const [isTopupOpen, setIsTopupOpen]')) {
        newContent = newContent.replace(`const [activeNav, setActiveNav] = useState('home');`, `const [activeNav, setActiveNav] = useState('home');\n  const [isTopupOpen, setIsTopupOpen] = useState(false);\n  const [isExchangeOpen, setIsExchangeOpen] = useState(false);\n  const [isScannerOpen, setIsScannerOpen] = useState(false);\n  const [transferTarget, setTransferTarget] = useState(null);\n  const [transferAmount, setTransferAmount] = useState('');\n  const [isTransferConfirmOpen, setIsTransferConfirmOpen] = useState(false);`);
    }

    fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', newContent, 'utf8');
    console.log("Successfully patched App.jsx UI.");
} else {
    console.log("Could not find blocks. VIP:", !!vipBlock, "Title:", !!titleBlock);
}
