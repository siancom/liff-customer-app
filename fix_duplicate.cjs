const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const targetStr = `                           <p className="text-[9px] text-white/50 text-center leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>
                        </div>
                        
                        <div>
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">ยอดสะสมสุทธิ</p>
                           <p className="text-xl font-black truncate">฿{(parseNumber(customerData.realAccumulatedAmount)||0).toLocaleString()}</p>
                        </div>
                        <div className="text-right border-l border-white/20 pl-4">
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">เครดิตวงเงินเหลือ</p>
                           <p className="text-xl font-black text-amber-300 truncate">฿{totalCreditValue.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2 mt-4 pt-4 border-t border-white/10">`;

const replaceStr = `                           <p className="text-[9px] text-white/50 text-center leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>
                        </div>`;

// Actually the old block might have more. Let's just use regex or split.
const idx1 = content.indexOf(`สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>\n                        </div>\n                        \n                        <div>\n                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">ยอดสะสมสุทธิ</p>`);

if (idx1 !== -1) {
    const endStr = `                     </div>\n                   );\n                  })()}`;
    const idx2 = content.indexOf(endStr, idx1);
    if (idx2 !== -1) {
        content = content.slice(0, idx1 + 146) + '\n' + endStr + content.slice(idx2 + endStr.length);
    }
}

fs.writeFileSync(appPath, content);
console.log("Cleaned up duplicated block in Pay page");
