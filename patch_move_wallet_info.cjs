const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// The block to move
const walletBlock = `                {(() => {
                   const totalCreditValue = activeCourses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0);
                   return (
                     <div className="relative z-10 grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div>
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">ยอดสะสมสุทธิ</p>
                           <p className="text-xl font-black truncate">฿{(parseNumber(customerData.realAccumulatedAmount)||0).toLocaleString()}</p>
                        </div>
                        <div className="text-right border-l border-white/20 pl-4">
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">เครดิตวงเงินเหลือ</p>
                           <p className="text-xl font-black text-amber-300 truncate">฿{totalCreditValue.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2 mt-4 pt-4 border-t border-white/10">
                           <div className="flex justify-between items-end mb-1.5">
                              <span className="text-[10px] font-bold text-white/90">สถานะ: <span className="text-amber-300 font-black ml-1 uppercase">{customerData.isApproved ? 'VIP' : (customerData.memberStatus || 'ทั่วไป')}</span></span>
                              <span className="text-[9px] font-bold text-white/70">ขาดอีก ฿{Math.max(0, 100000 - (parseNumber(customerData.realAccumulatedAmount)||0)).toLocaleString()} จะได้อัปเกรด</span>
                           </div>
                           <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden shadow-inner">
                              <div className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 rounded-full relative overflow-hidden" style={{ width: \`\${Math.min(100, ((parseNumber(customerData.realAccumulatedAmount)||0) / 100000) * 100)}%\` }}>
                                  <div className="absolute inset-0 bg-white/40 animate-[shimmer_2s_infinite] -skew-x-12"></div>
                              </div>
                           </div>
                           <p className="text-[9px] text-white/50 text-center mt-1.5 leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>
                        </div>
                        <div className="mt-5 pt-5 border-t border-white/10 relative z-10 flex flex-col gap-3">
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
                        </div>

                     </div>
                   );
                })()}`;

// 1. Remove from Profile
if (content.includes(walletBlock)) {
    content = content.replace(walletBlock, '');
} else {
    console.error("Could not find walletBlock in Profile");
}

// 2. Add to Pay page
const payPageOldDiv = `<div className="relative z-10 w-full bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                       <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mb-1">วงเงินคงเหลือของคุณ</p>
                       <p className="text-2xl font-black text-white">
                           ฿{activeCourses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0).toLocaleString()}
                       </p>
                  </div>`;
const payPageNewDiv = `
                  <div className="w-full text-left">
                  {(() => {
                   const totalCreditValue = activeCourses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0);
                   return (
                     <div className="relative z-10 grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div>
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">ยอดสะสมสุทธิ</p>
                           <p className="text-xl font-black truncate">฿{(parseNumber(customerData.realAccumulatedAmount)||0).toLocaleString()}</p>
                        </div>
                        <div className="text-right border-l border-white/20 pl-4">
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">เครดิตวงเงินเหลือ</p>
                           <p className="text-xl font-black text-amber-300 truncate">฿{totalCreditValue.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2 mt-4 pt-4 border-t border-white/10">
                           <div className="flex justify-between items-end mb-1.5">
                              <span className="text-[10px] font-bold text-white/90">สถานะ: <span className="text-amber-300 font-black ml-1 uppercase">{customerData.isApproved ? 'VIP' : (customerData.memberStatus || 'ทั่วไป')}</span></span>
                              <span className="text-[9px] font-bold text-white/70">ขาดอีก ฿{Math.max(0, 100000 - (parseNumber(customerData.realAccumulatedAmount)||0)).toLocaleString()} จะได้อัปเกรด</span>
                           </div>
                           <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden shadow-inner">
                              <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 rounded-full relative overflow-hidden" style={{ width: \`\${Math.min(100, ((parseNumber(customerData.realAccumulatedAmount)||0) / 100000) * 100)}%\` }}>
                                  <div className="absolute inset-0 bg-white/40 animate-[shimmer_2s_infinite] -skew-x-12"></div>
                              </div>
                           </div>
                           <p className="text-[9px] text-white/50 text-center mt-1.5 leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>
                        </div>
                        <div className="mt-5 pt-5 border-t border-white/10 relative z-10 flex flex-col gap-3">
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
                        </div>

                     </div>
                   );
                  })()}
                  </div>`;

if (content.includes(payPageOldDiv)) {
    content = content.replace(payPageOldDiv, payPageNewDiv);
} else {
    console.error("Could not find payPageOldDiv in Pay page");
}

fs.writeFileSync(appPath, content);
console.log("Moved wallet info successfully.");
