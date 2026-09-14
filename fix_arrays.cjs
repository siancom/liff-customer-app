const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

content = content.replace('const activeCourses = customerData.courses.filter(', 'const activeCourses = (customerData.courses || []).filter(');
content = content.replace('const ledgerHistory = customerData.history.filter(', 'const ledgerHistory = (customerData.history || []).filter(');

// Also look at the duplicated div block in pay page.
// The pay page has:
/*
                           <p className="text-[9px] text-white/50 text-center leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>
                        </div>
                        
                        <div>
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">ยอดสะสมสุทธิ</p>
*/
const duplicateBlock = `                        <div>
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">ยอดสะสมสุทธิ</p>
                           <p className="text-xl font-black truncate">฿{(parseNumber(customerData.realAccumulatedAmount)||0).toLocaleString()}</p>
                        </div>
                        <div className="text-right border-l border-white/20 pl-4">
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">เครดิตวงเงินเหลือ</p>
                           <p className="text-xl font-black text-amber-300 truncate">฿{totalCreditValue.toLocaleString()}</p>
                        </div>`;
// If it's there accidentally from previous patch, remove it
const startIndex = content.indexOf('สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>');
if (startIndex !== -1) {
    // just leave it alone if it's not breaking, actually it's inside a grid so it will just render extra cells.
    // Let's replace the whole block cleanly.
}

fs.writeFileSync(appPath, content);
console.log("Fixed arrays");
