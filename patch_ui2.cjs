const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const globalHeaderHTML = `<div className="bg-gradient-to-b from-teal-600 to-teal-800 pt-12 pb-8 px-6 rounded-b-[32px] shadow-lg relative z-20 shrink-0">
          <div className="flex justify-between items-center relative z-10">
             <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md p-0.5 shadow-lg">
                  <img 
                    src={customerData.lineProfilePic} 
                    onError={(e) => { e.target.onerror = null; e.target.src = lineProfile?.pictureUrl || \`https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback&backgroundColor=b6e3f4\`; }}
                    alt="Profile" 
                    className="w-full h-full rounded-xl object-cover bg-white" 
                  />
                </div>
                <div className="text-white">
                  <p className="text-[10px] opacity-80 mb-0.5 uppercase">สวัสดีค่ะ, คุณ{customerData.lineDisplayName}</p>
                  <h1 className="text-lg font-black max-w-[200px] truncate flex items-center gap-1">{getFuzzyKey(customerData, "ชื่อ")}{customerData.isApproved && <Award size={16} className="text-amber-300 ml-1"/>}</h1>
                </div>
              </div>
              <button onClick={() => { setAppState('login'); setPhoneNumber(''); }} className="bg-white/10 p-2.5 rounded-xl text-white hover:bg-white/20 transition-colors"><LogOut size={18} /></button>
          </div>
        </div>`;

if (content.includes(globalHeaderHTML)) {
    content = content.replace(globalHeaderHTML, '');
    
    const profileHeader = globalHeaderHTML
        .replace('bg-gradient-to-b from-teal-600 to-teal-800 pt-12 pb-8 px-6 rounded-b-[32px] shadow-lg relative z-20 shrink-0', 'bg-gradient-to-b from-teal-600 to-teal-800 p-6 rounded-[32px] shadow-sm mb-6');
        
    const profileAnchor = `<h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><User size={18} className="mr-2 text-indigo-500"/> บัญชีสะสมยอด</h2>`;
    content = content.replace(profileAnchor, profileAnchor + '\n' + profileHeader);
} else {
    console.log("Could not find global header EXACT match");
}

const profileButtons = `
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 relative z-10">
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
                        </div>
`;

const progressBarEnd = `<p className="text-[9px] text-white/50 text-center mt-1.5 leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>\n                        </div>`;

if (content.includes(progressBarEnd)) {
    content = content.replace(progressBarEnd, progressBarEnd + profileButtons);
} else {
    console.log("Could not find progress bar to insert buttons");
}

if (!content.includes('ArrowRightLeft')) {
    content = content.replace('Download, CalendarClock', 'Download, CalendarClock, ArrowRightLeft, Send');
}

fs.writeFileSync(appPath, content);
console.log("Patched UI 2");
