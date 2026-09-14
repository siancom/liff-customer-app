const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const badStr = `                           )}
                           <p className="text-[9px] text-white/50 text-center leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>
                        </div>
                        
                        <div>
         
                     </div>`;

const goodStr = `                           )}
                           <p className="text-[9px] text-white/50 text-center leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>
                        </div>
                     </div>`;

content = content.replace(badStr, goodStr);

fs.writeFileSync(appPath, content);
console.log("Fixed unclosed div");
