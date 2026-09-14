const fs = require('fs');
let modalContent = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', 'utf8');

// 1. Add state hooks for daily usage
const stateTarget = `    const [isFullScreenPhoto, setIsFullScreenPhoto] = useState(false);
    const [showFullDetails, setShowFullDetails] = useState(true);`;
const stateInjection = `    const [isFullScreenPhoto, setIsFullScreenPhoto] = useState(false);
    const [showFullDetails, setShowFullDetails] = useState(true);

    // --- Quota Tracking ---
    const MAX_FREE_USES = 2;
    const getDailyUsage = () => {
        try {
            const today = new Date().toLocaleDateString('en-CA');
            const key = \`ai_skin_usage_\${today}\`;
            return parseInt(localStorage.getItem(key) || '0', 10);
        } catch (e) { return 0; }
    };
    const [dailyUsage, setDailyUsage] = useState(getDailyUsage);

    const incrementDailyUsage = () => {
        try {
            const today = new Date().toLocaleDateString('en-CA');
            const key = \`ai_skin_usage_\${today}\`;
            const current = getDailyUsage();
            localStorage.setItem(key, (current + 1).toString());
            setDailyUsage(current + 1);
        } catch (e) {}
    };`;

if (!modalContent.includes('const MAX_FREE_USES')) {
    modalContent = modalContent.replace(stateTarget, stateInjection);
}

// 2. Increment usage when starting analysis
const analyzeTarget = `    // Call Gemini API
    const analyzeSkin = async () => {`;
const analyzeInjection = `    // Call Gemini API
    const analyzeSkin = async () => {
        incrementDailyUsage();`;

if (!modalContent.includes('incrementDailyUsage();')) {
    modalContent = modalContent.replace(analyzeTarget, analyzeInjection);
}

// 3. Render the Progress Bar below instructions and update buttons
const uiTargetRegex = /\{\/\*\s*Buttons\s*\*\/\}[\s\S]*?(?=\}\s*\)\s*:\s*\(\s*<div\s+className="absolute\s+inset-0)/s;

const newUI = `{/* Quota Progress Bar */}
                            <div className="w-full mt-5 bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="text-[12px] font-black text-gray-800">โควต้าสแกนฟรีวันนี้</h4>
                                        <p className="text-[10px] text-gray-500">รับสิทธิ์ฟรี 2 ครั้งต่อวัน (รีเซ็ตเที่ยงคืน)</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-teal-600">{MAX_FREE_USES - dailyUsage > 0 ? MAX_FREE_USES - dailyUsage : 0}</span>
                                        <span className="text-[10px] text-gray-500 font-bold ml-1">/ {MAX_FREE_USES} ครั้ง</span>
                                    </div>
                                </div>
                                
                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={\`h-full rounded-full transition-all duration-500 \${dailyUsage >= MAX_FREE_USES ? 'bg-rose-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}\`}
                                        style={{ width: \`\${Math.min((dailyUsage / MAX_FREE_USES) * 100, 100)}%\` }}
                                    ></div>
                                </div>
                                
                                {dailyUsage >= MAX_FREE_USES && (
                                    <div className="mt-3 text-[10px] text-rose-600 font-bold flex items-center bg-rose-50 p-2 rounded-lg">
                                        <AlertCircle size={14} className="mr-1.5 shrink-0" />
                                        สิทธิ์ฟรีของวันนี้หมดแล้ว กรุณาไปที่ร้านค้าเพื่อซื้อสินค้าเพิ่มเติม
                                    </div>
                                )}
                            </div>

                            {!isCameraOpen ? (
                                <div className="w-full space-y-3 mt-4">
                                    <button 
                                        onClick={dailyUsage >= MAX_FREE_USES ? () => {
                                            if (onGoToShop) {
                                                onClose();
                                                setTimeout(() => onGoToShop(), 300);
                                            }
                                        } : startCamera}
                                        className={\`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center cursor-pointer shadow-sm \${
                                            dailyUsage >= MAX_FREE_USES 
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/30 hover:opacity-90 active:scale-95' 
                                                : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/30 hover:opacity-90 active:scale-95'
                                        }\`}
                                    >
                                        {dailyUsage >= MAX_FREE_USES ? (
                                            <><ShoppingBag size={18} className="mr-2" /> ไปที่ร้านค้าเพื่อรับสิทธิ์สแกน</>
                                        ) : (
                                            <><Camera size={18} className="mr-2" /> เปิดกล้องถ่ายรูปสแกนสด</>
                                        )}
                                    </button>
                                    
                                    {dailyUsage < MAX_FREE_USES && (
                                        <label className="w-full bg-white border-2 border-teal-500 text-teal-600 py-3.5 rounded-xl font-black text-sm shadow-sm hover:bg-teal-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                                            <Upload size={18} className="mr-2" />
                                            อัปโหลดจากอัลบั้ม
                                            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} capture="user" />
                                        </label>
                                    )}
                                </div>
`;

// wait, the old UI didn't have {/* Buttons */} exactly. It was:
const oldUiBlock = `                            {!isCameraOpen ? (
                                <div className="w-full space-y-3 mt-4">
                                    <button 
                                        onClick={startCamera}
                                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-teal-500/30 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                    >
                                        <Camera size={18} className="mr-2" />
                                        เปิดกล้องถ่ายรูปสแกนสด
                                    </button>
                                    
                                    <label className="w-full bg-white border-2 border-teal-500 text-teal-600 py-3.5 rounded-xl font-black text-sm shadow-sm hover:bg-teal-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                                        <Upload size={18} className="mr-2" />
                                        อัปโหลดจากอัลบั้ม
                                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} capture="user" />
                                    </label>
                                </div>`;

if (modalContent.includes(oldUiBlock)) {
    modalContent = modalContent.replace(oldUiBlock, newUI.replace('{/* Quota Progress Bar */}', ''));
}

fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', modalContent, 'utf8');
console.log("Patched AI Quota");
