const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Import modals
if (!content.includes('SkinCheckModal')) {
    content = content.replace(
        "import { initializeApp } from 'firebase/app';",
        "import SkinCheckModal from './components/modals/SkinCheckModal';\nimport PriceCompareModal from './components/modals/PriceCompareModal';\nimport { initializeApp } from 'firebase/app';"
    );
}

// 2. State variables
if (!content.includes('isSkinCheckModalOpen')) {
    content = content.replace(
        "const [isCartOpen, setIsCartOpen] = useState(false);",
        "const [isCartOpen, setIsCartOpen] = useState(false);\n  const [isSkinCheckModalOpen, setIsSkinCheckModalOpen] = useState(false);\n  const [skinCheckCourse, setSkinCheckCourse] = useState(null);\n  const [isPriceCompareModalOpen, setIsPriceCompareModalOpen] = useState(false);\n  const [priceCompareProduct, setPriceCompareProduct] = useState(null);"
    );
}

// 3. Sort activeCourses
content = content.replace(
    /const activeCourses = customerData\.courses\.filter\(c => \{\s+if \(c\.status === 'ยกเลิก'\) return false;\s+return c\.status === 'ยังคงเหลือ' \|\| \(c\.computedTotalCredit > 0 && c\.computedRemainCredit > 0\);\s+\}\);/g,
    `const activeCourses = customerData.courses.filter(c => {
     if (c.status === 'ยกเลิก') return false;
     return c.status === 'ยังคงเหลือ' || (c.computedTotalCredit > 0 && c.computedRemainCredit > 0);
  }).sort((a,b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0));`
);

// 4. Home Banner
const homeBannerHTML = `
          {/* AI Skin Check Banner */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden mb-4 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1" onClick={() => setIsSkinCheckModalOpen(true)}>
             <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-black flex items-center mb-1"><Sparkles size={18} className="mr-1.5 text-yellow-300"/> ตรวจสภาพผิวด้วย AI</h3>
                   <p className="text-[11px] font-medium opacity-90">วิเคราะห์ผิวหน้าฟรี พร้อมรับคำแนะนำคอร์สที่เหมาะสมสำหรับคุณโดยเฉพาะ</p>
                </div>
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm shrink-0 ml-3">
                   <ChevronRight size={20} />
                </div>
             </div>
          </div>
`;
if (!content.includes('AI Skin Check Banner')) {
    content = content.replace(
        '<div className="space-y-4 animate-in fade-in duration-300">',
        '<div className="space-y-4 animate-in fade-in duration-300">\n' + homeBannerHTML
    );
}

// 5. Course Button AI
const aiCourseBtnHTML = `
                    <button onClick={() => { setSkinCheckCourse(course); setIsSkinCheckModalOpen(true); }} className="mt-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center space-x-1.5 py-2.5 rounded-xl font-bold text-[11px] active:scale-95 transition-transform shadow-md shadow-indigo-500/30 hover:opacity-90">
                       <Sparkles size={14} /><span>สแกนติดตามผลผิวหน้า (AI)</span>
                    </button>
`;
if (!content.includes('สแกนติดตามผลผิวหน้า')) {
    content = content.replace(
        /<span>จองคิวบริการ<\/span>\s*<\/button>\s*<\/div>/g,
        `<span>จองคิวบริการ</span>\n                       </button>\n                    </div>\n` + aiCourseBtnHTML
    );
}

// 6. Price compare button & receive immediately button
const oldAddToCartSection1 = `                                     <button 
                                       onClick={(e) => { e.stopPropagation(); handleAddToCart(prod); }} 
                                       className="w-6 h-6 shrink-0 rounded-full border border-[#EE4D2D] flex items-center justify-center text-[#EE4D2D] hover:bg-[#EE4D2D] hover:text-white transition-all ml-1"
                                     >
                                       <ShoppingCart size={12} strokeWidth={2.5} className="-ml-[1px]" />
                                     </button>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>`;
                      
const newAddToCartSection1 = `                                     <button 
                                       onClick={(e) => { e.stopPropagation(); handleAddToCart(prod); }} 
                                       className="h-6 px-2 shrink-0 rounded-md border border-[#EE4D2D] flex items-center justify-center text-[#EE4D2D] hover:bg-[#EE4D2D] hover:text-white transition-all ml-1 text-[9px] font-black"
                                     >
                                       {prod.type === 'course' ? 'รับทันที' : <ShoppingCart size={12} strokeWidth={2.5} />}
                                     </button>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); setPriceCompareProduct(prod); setIsPriceCompareModalOpen(true); }} className="mt-2 w-full bg-gradient-to-r from-orange-400 to-rose-500 text-white text-[9px] font-black py-1.5 rounded-lg shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center overflow-hidden relative group">
                                     <Sparkles size={10} className="mr-1 animate-pulse" /> เช็คความคุ้มค่า 🆚
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>`;

content = content.replaceAll(oldAddToCartSection1, newAddToCartSection1);

// 7. Modals at the end
const modalsHTML = `
        {/* Modals */}
        <SkinCheckModal isOpen={isSkinCheckModalOpen} onClose={() => setIsSkinCheckModalOpen(false)} course={skinCheckCourse} app={null} />
        <PriceCompareModal isOpen={isPriceCompareModalOpen} onClose={() => setIsPriceCompareModalOpen(false)} product={priceCompareProduct} />
`;
if (!content.includes('SkinCheckModal isOpen')) {
    content = content.replace(
        '      </div>\n    </div>\n  );\n}',
        modalsHTML + '\n      </div>\n    </div>\n  );\n}'
    );
}

fs.writeFileSync(appPath, content);
console.log("Patched 2");
