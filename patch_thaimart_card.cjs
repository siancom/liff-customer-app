const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const targetStr = `<Sparkles size={10} className="mr-1 animate-pulse" /> เช็คความคุ้มค่า 🆚
                                  </button>`;

const newStr = `<Sparkles size={10} className="mr-1 animate-pulse" /> เช็คความคุ้มค่า 🆚
                                  </button>
                                  {prod.type === 'product' && (
                                     <a 
                                       href="https://thaimart.com/sellers/ศูนย์ความงามไอริสเกาะสมุย-zM0AEw"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       onClick={(e) => e.stopPropagation()}
                                       className="mt-1.5 w-full bg-[#E42E2C] text-white text-[9px] font-black py-1.5 rounded-lg shadow-sm hover:bg-[#CC0027] active:scale-95 transition-all flex items-center justify-between px-2"
                                     >
                                       <div className="flex items-center">
                                          <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center mr-1.5 shadow-sm">
                                             <span className="text-[#E42E2C] text-[6px]">🐘</span>
                                          </div>
                                          <span>ส่งฟรี! แอพ Thaimart</span>
                                       </div>
                                       <ChevronRight size={10} className="opacity-80"/>
                                     </a>
                                  )}`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(appPath, content);
console.log("Patched product card with Thaimart link.");
