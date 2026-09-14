const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Remove the button from Profile page
const oldProfileButton = `<div className="mt-5 pt-5 border-t border-white/10 relative z-10 flex flex-col gap-3">
                            <button onClick={() => setShowCreditPayQR(true)} className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-2xl py-3.5 px-4 shadow-lg flex items-center justify-center font-black text-[13px] hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group border border-white/20">
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                                <QrCode size={20} className="mr-2 drop-shadow-md" />
                                <span className="tracking-wide">สแกนจ่ายเงิน (ตัดเครดิต)</span>
                            </button>
                            <div className="grid grid-cols-3 gap-2">`;

const newProfileButton = `<div className="mt-5 pt-5 border-t border-white/10 relative z-10 flex flex-col gap-3">
                            <div className="grid grid-cols-3 gap-2">`;
if (content.includes(oldProfileButton)) content = content.replace(oldProfileButton, newProfileButton);

// 2. Add Pay page right before Profile page
const profilePageAnchor = `{activeNav === 'profile' && (`;
const payPage = `{activeNav === 'pay' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                  <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="absolute left-0 bottom-0 w-32 h-32 bg-emerald-400/30 rounded-full -ml-10 -mb-10 blur-xl"></div>
                  
                  <Banknote size={48} className="text-white/90 mb-3 relative z-10 drop-shadow-md" />
                  <h2 className="text-xl font-black mb-1 relative z-10">สแกนเพื่อชำระเงิน</h2>
                  <p className="text-emerald-100 text-[11px] mb-6 relative z-10 font-mono tracking-widest">ตัดยอดเงินจากเครดิตคงเหลือ</p>
                  
                  <div className="bg-white p-5 rounded-[28px] shadow-lg border border-gray-100 relative z-10 mb-6">
                       <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-[32px] blur opacity-30"></div>
                       <div className="relative bg-white rounded-[20px] p-2">
                           <QRCodeSVG 
                               value={JSON.stringify({
                                   type: "credit_pay",
                                   code: customerData?.cleanPhone || customerData?.id,
                                   phone: customerData?.cleanPhone,
                                   customerId: customerData?.id
                               })} 
                               size={200} 
                               level="M" 
                               includeMargin={false} 
                           />
                       </div>
                  </div>
                  
                  <div className="relative z-10 w-full bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                       <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mb-1">วงเงินคงเหลือของคุณ</p>
                       <p className="text-2xl font-black text-white">
                           ฿{activeCourses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0).toLocaleString()}
                       </p>
                  </div>
               </div>
               
               <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-800 flex items-center mb-3"><HistoryIcon size={16} className="mr-1.5 text-teal-500"/> ประวัติการใช้งานเครดิต</h3>
                  <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                      <Clock size={32} className="mb-2 opacity-50" />
                      <p className="text-[11px] font-bold">สามารถดูประวัติทั้งหมดได้ในหน้าโปรไฟล์</p>
                  </div>
               </div>
            </div>
         )}
         
         `;
if (!content.includes(`activeNav === 'pay'`)) content = content.replace(profilePageAnchor, payPage + profilePageAnchor);

// 3. Update Bottom Nav
const bottomNavAnchor = `<div className="flex justify-between items-center px-1 py-2">`;
const oldBottomNavTarget = `<div className="flex justify-between items-center px-1 py-2">
             <button onClick={() => setActiveNav('home')} className={\`flex flex-col items-center justify-center w-full py-1 space-y-1 transition-colors \${activeNav === 'home' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1.5 rounded-xl transition-all \${activeNav === 'home' ? 'bg-teal-50' : ''}\`}><Ticket size={20} className={activeNav === 'home' ? 'fill-teal-100/50' : ''} /></div><span className="text-[9px] font-bold">คอร์สฉัน</span>
             </button>
             <button onClick={() => setActiveNav('shop')} className={\`flex flex-col items-center justify-center w-full py-1 space-y-1 transition-colors \${activeNav === 'shop' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1.5 rounded-xl transition-all \${activeNav === 'shop' ? 'bg-teal-50' : ''}\`}><Store size={20} className={activeNav === 'shop' ? 'fill-teal-100/50' : ''} /></div><span className="text-[9px] font-bold">ซื้อคอร์ส</span>
             </button>
             <button onClick={() => setActiveNav('booking')} className={\`flex flex-col items-center justify-center w-full py-1 space-y-1 transition-colors \${activeNav === 'booking' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1.5 rounded-xl transition-all \${activeNav === 'booking' ? 'bg-blue-50' : ''}\`}><CalendarDays size={20} className={activeNav === 'booking' ? 'fill-blue-100/50' : ''} /></div><span className="text-[9px] font-bold">จองคิว</span>
             </button>
             <button onClick={() => setActiveNav('orders')} className={\`flex flex-col items-center justify-center w-full py-1 space-y-1 transition-colors \${activeNav === 'orders' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1.5 rounded-xl transition-all \${activeNav === 'orders' ? 'bg-orange-50' : ''}\`}><ReceiptText size={20} className={activeNav === 'orders' ? 'fill-orange-100/50' : ''} /></div><span className="text-[9px] font-bold">คำสั่งซื้อ</span>
             </button>
             <button onClick={() => setActiveNav('rewards')} className={\`flex flex-col items-center justify-center w-full py-1 space-y-1 transition-colors \${activeNav === 'rewards' ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1.5 rounded-xl transition-all \${activeNav === 'rewards' ? 'bg-rose-50' : ''}\`}><Gift size={20} className={activeNav === 'rewards' ? 'fill-rose-100/50' : ''} /></div><span className="text-[9px] font-bold">สิทธิพิเศษ</span>
             </button>
             <button onClick={() => setActiveNav('profile')} className={\`flex flex-col items-center justify-center w-full py-1 space-y-1 transition-colors \${activeNav === 'profile' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1.5 rounded-xl transition-all \${activeNav === 'profile' ? 'bg-indigo-50' : ''}\`}><User size={20} className={activeNav === 'profile' ? 'fill-indigo-100/50' : ''} /></div><span className="text-[9px] font-bold">โปรไฟล์</span>
             </button>
          </div>`;

const newBottomNav = `<div className="flex justify-between items-center px-0.5 py-2 relative">
             <button onClick={() => setActiveNav('home')} className={\`flex-1 min-w-0 flex flex-col items-center justify-center py-1 space-y-1 transition-colors \${activeNav === 'home' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1 rounded-xl transition-all \${activeNav === 'home' ? 'bg-teal-50' : ''}\`}><Ticket size={18} className={activeNav === 'home' ? 'fill-teal-100/50' : ''} /></div><span className="text-[8px] font-bold truncate w-full text-center">คอร์สฉัน</span>
             </button>
             <button onClick={() => setActiveNav('shop')} className={\`flex-1 min-w-0 flex flex-col items-center justify-center py-1 space-y-1 transition-colors \${activeNav === 'shop' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1 rounded-xl transition-all \${activeNav === 'shop' ? 'bg-teal-50' : ''}\`}><Store size={18} className={activeNav === 'shop' ? 'fill-teal-100/50' : ''} /></div><span className="text-[8px] font-bold truncate w-full text-center">ซื้อคอร์ส</span>
             </button>
             <button onClick={() => setActiveNav('booking')} className={\`flex-1 min-w-0 flex flex-col items-center justify-center py-1 space-y-1 transition-colors \${activeNav === 'booking' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1 rounded-xl transition-all \${activeNav === 'booking' ? 'bg-blue-50' : ''}\`}><CalendarDays size={18} className={activeNav === 'booking' ? 'fill-blue-100/50' : ''} /></div><span className="text-[8px] font-bold truncate w-full text-center">จองคิว</span>
             </button>
             
             {/* 🌟 PROMINENT CENTER PAY BUTTON 🌟 */}
             <div className="relative -top-6 flex flex-col items-center justify-center shrink-0 px-1.5 z-50">
                 <button onClick={() => setActiveNav('pay')} className={\`w-[52px] h-[52px] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all border-4 border-white \${activeNav === 'pay' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-teal-500/40' : 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-teal-500/30'}\`}>
                     <QrCode size={24} className="drop-shadow-sm" />
                 </button>
                 <span className={\`text-[9px] font-black mt-1 \${activeNav === 'pay' ? 'text-teal-600' : 'text-gray-600'}\`}>จ่ายเงิน</span>
             </div>

             <button onClick={() => setActiveNav('orders')} className={\`flex-1 min-w-0 flex flex-col items-center justify-center py-1 space-y-1 transition-colors \${activeNav === 'orders' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1 rounded-xl transition-all \${activeNav === 'orders' ? 'bg-orange-50' : ''}\`}><ReceiptText size={18} className={activeNav === 'orders' ? 'fill-orange-100/50' : ''} /></div><span className="text-[8px] font-bold truncate w-full text-center">คำสั่งซื้อ</span>
             </button>
             <button onClick={() => setActiveNav('rewards')} className={\`flex-1 min-w-0 flex flex-col items-center justify-center py-1 space-y-1 transition-colors \${activeNav === 'rewards' ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1 rounded-xl transition-all \${activeNav === 'rewards' ? 'bg-rose-50' : ''}\`}><Gift size={18} className={activeNav === 'rewards' ? 'fill-rose-100/50' : ''} /></div><span className="text-[8px] font-bold truncate w-full text-center">แลกรางวัล</span>
             </button>
             <button onClick={() => setActiveNav('profile')} className={\`flex-1 min-w-0 flex flex-col items-center justify-center py-1 space-y-1 transition-colors \${activeNav === 'profile' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}\`}>
                <div className={\`p-1 rounded-xl transition-all \${activeNav === 'profile' ? 'bg-indigo-50' : ''}\`}><User size={18} className={activeNav === 'profile' ? 'fill-indigo-100/50' : ''} /></div><span className="text-[8px] font-bold truncate w-full text-center">โปรไฟล์</span>
             </button>
          </div>`;

if (content.includes(oldBottomNavTarget)) content = content.replace(oldBottomNavTarget, newBottomNav);

// 4. Optionally remove the old showCreditPayQR Modal if it exists, since it's now a full page
const oldModalStart = `{/* 🌟 CREDIT PAY QR MODAL 🌟 */}`;
const oldModalEnd = `)}
`;
const startIndex = content.indexOf(oldModalStart);
if (startIndex !== -1) {
    const endStr = `          </div>
        )}
`;
    const endIndex = content.indexOf(endStr, startIndex) + endStr.length;
    if (endIndex > startIndex) {
        content = content.slice(0, startIndex) + content.slice(endIndex);
    }
}

fs.writeFileSync(appPath, content);
console.log("Patched pay page UI into bottom nav.");
