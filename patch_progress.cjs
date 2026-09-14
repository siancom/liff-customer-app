const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const oldProfileHTML = `<p className="text-xl font-black text-amber-300 truncate">฿{totalCreditValue.toLocaleString()}</p>
                        </div>`;

const newProfileHTML = `<p className="text-xl font-black text-amber-300 truncate">฿{totalCreditValue.toLocaleString()}</p>
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
                        </div>`;

if (content.includes(oldProfileHTML) && !content.includes('ขาดอีก ฿')) {
    content = content.replace(oldProfileHTML, newProfileHTML);
    fs.writeFileSync(appPath, content);
    console.log("Patched progress bar");
} else {
    console.log("Could not find anchor or already patched");
}
