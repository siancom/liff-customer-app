const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add state variable
const stateAnchor = `const [showRewardQR, setShowRewardQR] = useState(null);`;
const newState = `const [showRewardQR, setShowRewardQR] = useState(null);\n  const [showCreditPayQR, setShowCreditPayQR] = useState(false);`;
if (!content.includes('showCreditPayQR')) {
    content = content.replace(stateAnchor, newState);
}

// 2. Patch the buttons UI
const oldButtons = `<div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 relative z-10">
                            <button className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 active:scale-95 transition-all">
                                <Download size={22} className="mb-2" />
                                <span className="text-[10px] font-bold text-center">เติมเครดิต</span>
                            </button>
                            <button className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 active:scale-95 transition-all">
                                <Send size={22} className="mb-2" />
                                <span className="text-[10px] font-bold text-center">โอนให้เพื่อน</span>
                            </button>
                            <button className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 active:scale-95 transition-all">
                                <ArrowRightLeft size={22} className="mb-2" />
                                <span className="text-[10px] font-bold text-center">แลกสินค้า</span>
                            </button>
                        </div>`;

const newButtons = `<div className="mt-5 pt-5 border-t border-white/10 relative z-10 flex flex-col gap-3">
                            <button onClick={() => setShowCreditPayQR(true)} className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-2xl py-3.5 px-4 shadow-lg flex items-center justify-center font-black text-[13px] hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group border border-white/20">
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                                <QrCode size={20} className="mr-2 drop-shadow-md" />
                                <span className="tracking-wide">สแกนจ่ายเงิน (ตัดเครดิต)</span>
                            </button>
                            <div className="grid grid-cols-3 gap-2">
                                <button className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/30 active:scale-95 transition-all">
                                    <Download size={18} className="mb-1.5 opacity-90" />
                                    <span className="text-[9px] font-bold text-center">เติมเครดิต</span>
                                </button>
                                <button className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/30 active:scale-95 transition-all">
                                    <Send size={18} className="mb-1.5 opacity-90" />
                                    <span className="text-[9px] font-bold text-center">โอนให้เพื่อน</span>
                                </button>
                                <button className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/30 active:scale-95 transition-all">
                                    <ArrowRightLeft size={18} className="mb-1.5 opacity-90" />
                                    <span className="text-[9px] font-bold text-center">แลกสินค้า</span>
                                </button>
                            </div>
                        </div>`;

content = content.replace(oldButtons, newButtons);

// 3. Add Modal
const modalsAnchor = `{/* 🌟 MODALS 🌟 */}`;
const creditQRModal = `
        {/* 🌟 CREDIT PAY QR MODAL 🌟 */}
        {showCreditPayQR && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex flex-col justify-center items-center p-6 animate-in fade-in duration-200" onClick={() => setShowCreditPayQR(false)}>
             <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col animate-in zoom-in-95 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 relative shrink-0 text-center">
                   <button onClick={() => setShowCreditPayQR(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"><X size={18} /></button>
                   <Banknote size={32} className="text-white mx-auto mb-2 opacity-90" />
                   <h2 className="text-base font-black text-white mb-1">สแกนชำระเงิน</h2>
                   <p className="text-emerald-100 text-[10px] font-mono tracking-widest">ตัดยอดเงินจากเครดิตคงเหลือ</p>
                </div>
                
                <div className="p-8 flex flex-col items-center bg-gray-50">
                   <div className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 mb-6 relative">
                       <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-[26px] blur opacity-20"></div>
                       <div className="relative bg-white rounded-2xl p-2">
                           <QRCodeSVG 
                               value={JSON.stringify({
                                   type: "credit_pay",
                                   code: customerData?.cleanPhone || customerData?.id,
                                   phone: customerData?.cleanPhone,
                                   customerId: customerData?.id
                               })} 
                               size={180} 
                               level="M" 
                               includeMargin={false} 
                           />
                       </div>
                   </div>
                   
                   <div className="text-center">
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">วงเงินคงเหลือปัจจุบัน</p>
                       <p className="text-xl font-black text-emerald-600">
                           ฿{activeCourses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0).toLocaleString()}
                       </p>
                   </div>
                </div>
             </div>
          </div>
        )}
`;

if (!content.includes('CREDIT PAY QR MODAL')) {
    content = content.replace(modalsAnchor, modalsAnchor + creditQRModal);
}

fs.writeFileSync(appPath, content);
console.log("Patched credit pay UI.");
