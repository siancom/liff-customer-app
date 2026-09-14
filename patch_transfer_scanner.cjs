const fs = require('fs');

let content = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/WalletTransferModal.jsx', 'utf8');

if (!content.includes('import { Html5QrcodeScanner }')) {
    content = content.replace(
        `import { X, Send, Search, User, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';`,
        `import { X, Send, Search, User, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle, Smartphone, QrCode } from 'lucide-react';\nimport { Html5QrcodeScanner } from 'html5-qrcode';\nimport { useEffect } from 'react';`
    );
}

if (!content.includes('const [isScanning, setIsScanning] = useState(false);')) {
    content = content.replace(
        `const [isSearching, setIsSearching] = useState(false);`,
        `const [isSearching, setIsSearching] = useState(false);\n    const [isScanning, setIsScanning] = useState(false);`
    );
}

if (!content.includes('useEffect(() => {')) {
    const useEffectBlock = `
    useEffect(() => {
        let html5QrcodeScanner;
        if (isScanning) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: {width: 250, height: 250} },
                /* verbose= */ false
            );
            html5QrcodeScanner.render(
                (decodedText) => {
                    try {
                        const data = JSON.parse(decodedText);
                        if (data.type === 'credit_pay' && data.phone) {
                            setTargetPhone(data.phone);
                            setIsScanning(false);
                            html5QrcodeScanner.clear();
                        } else {
                            showToast('QR Code ไม่รองรับ');
                        }
                    } catch (e) {
                        showToast('QR Code ไม่ถูกต้อง');
                    }
                },
                (error) => {}
            );
        }
        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
            }
        };
    }, [isScanning]);
`;
    content = content.replace(
        `const handleSearchTarget = async (e) => {`,
        useEffectBlock + `\n    const handleSearchTarget = async (e) => {`
    );
}

if (!content.includes('<div id="reader"')) {
    const scannerHtml = `
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-black text-gray-800 flex items-center"><Smartphone size={14} className="mr-1.5 text-indigo-500"/> เบอร์โทรศัพท์ผู้รับ</label>
                                        <button type="button" onClick={() => setIsScanning(!isScanning)} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold flex items-center">
                                            <QrCode size={12} className="mr-1"/> {isScanning ? 'ปิดสแกน' : 'สแกน QR'}
                                        </button>
                                    </div>
                                    {isScanning ? (
                                        <div id="reader" className="w-full mb-3 rounded-xl overflow-hidden border border-indigo-100 bg-black"></div>
                                    ) : null}
                                    <div className="relative">
                                        <input 
                                            type="tel" 
                                            value={targetPhone}
                                            onChange={(e) => setTargetPhone(e.target.value)}
                                            placeholder="08X-XXX-XXXX"
                                            maxLength="12"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                </div>`;
                                
    // We need to replace the old input div block
    const oldBlockStart = `<div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">\n                                    <label className="block text-xs font-black text-gray-800 mb-2 flex items-center"><Smartphone size={14} className="mr-1.5 text-indigo-500"/> เบอร์โทรศัพท์ผู้รับ</label>\n                                    <div className="relative">\n                                        <input \n                                            type="tel"`;
    
    // Using string replacement or index replacement
    const oldBlockStartIndex = content.indexOf(`<div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">`);
    // Wait, there are multiple of these, let's find the one containing "เบอร์โทรศัพท์ผู้รับ"
    const targetLabel = `<label className="block text-xs font-black text-gray-800 mb-2 flex items-center"><Smartphone size={14} className="mr-1.5 text-indigo-500"/> เบอร์โทรศัพท์ผู้รับ</label>`;
    const targetLabelIdx = content.indexOf(targetLabel);
    
    if (targetLabelIdx !== -1) {
        const blockStart = content.lastIndexOf(`<div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">`, targetLabelIdx);
        const nextBlock = content.indexOf(`<div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">`, targetLabelIdx);
        
        content = content.substring(0, blockStart) + scannerHtml + content.substring(nextBlock);
    }
}

fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/WalletTransferModal.jsx', content, 'utf8');
console.log("Patched WalletTransferModal with QR scanner.");
