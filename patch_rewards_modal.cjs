const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const modalsAnchor = `{/* 🌟 MODALS 🌟 */}`;
const rewardQRModal = `
        {/* 🌟 REWARD QR MODAL 🌟 */}
        {showRewardQR && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex flex-col justify-center items-center p-6 animate-in fade-in duration-200" onClick={() => setShowRewardQR(null)}>
             <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col animate-in zoom-in-95 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-5 relative shrink-0 text-center">
                   <button onClick={() => setShowRewardQR(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"><X size={18} /></button>
                   <Gift size={32} className="text-white mx-auto mb-2 opacity-90" />
                   <h2 className="text-base font-black text-white mb-1 line-clamp-1">{showRewardQR.rewardName}</h2>
                   <p className="text-rose-100 text-xs font-mono">ID: {showRewardQR.id || '-'}</p>
                </div>
                
                <div className="p-8 flex flex-col items-center">
                   <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase tracking-widest text-center">สแกน QR Code เพื่อรับสิทธิ์ที่สาขา</p>
                   <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                       <QrCode size={160} className="text-gray-800" />
                   </div>
                   <p className="text-xs text-gray-500 font-bold mt-6 text-center">
                       {customerData?.lineDisplayName ? \`คุณ \${customerData.lineDisplayName}\` : 'ลูกค้าไอริสแคร์'}
                   </p>
                </div>
             </div>
          </div>
        )}
`;

if (!content.includes('REWARD QR MODAL')) {
    content = content.replace(modalsAnchor, modalsAnchor + rewardQRModal);
    fs.writeFileSync(appPath, content);
    console.log("Patched Reward QR modal.");
} else {
    console.log("Reward QR modal already exists.");
}
