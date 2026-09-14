const fs = require('fs');

// --- Patch App.jsx ---
let appContent = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', 'utf8');

appContent = appContent.replace(
    `            onBookService={openBookingModal}\n            onAddToCart={handleAddToCart}`,
    `            onBookService={() => setActiveNav('booking')}\n            onAddToCart={handleAddToCart}\n            onGoToShop={() => setActiveNav('shop')}`
);

fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', appContent, 'utf8');


// --- Patch SkinCheckModal.jsx ---
let modalContent = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', 'utf8');

// 1. Update SkinCheckModal signature to include onGoToShop
modalContent = modalContent.replace(
    `export default function SkinCheckModal({ isOpen, onClose, course, app, shopItems = [], onBookService, onAddToCart }) {`,
    `export default function SkinCheckModal({ isOpen, onClose, course, app, shopItems = [], onBookService, onAddToCart, onGoToShop }) {`
);

// 2. Add "ซื้อสินค้าเพิ่มเติม" button after the recommended items list
const oldButtonArea = `                                </div>
                            )}

                            {/* Buttons */}`;
const newButtonArea = `                                </div>
                            )}

                            {aiResult.recommendedCourses && aiResult.recommendedCourses.length > 0 && (
                                <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 delay-500 fill-mode-both px-2">
                                    <button 
                                        onClick={() => {
                                            onClose();
                                            if (onGoToShop) setTimeout(() => onGoToShop(), 300);
                                        }}
                                        className="w-full bg-indigo-50 text-indigo-700 py-3.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-indigo-100 active:scale-95 transition-all flex items-center justify-center border border-indigo-100"
                                    >
                                        <ShoppingBag size={18} className="mr-2" /> ดูสินค้าและคอร์สเพิ่มเติมในร้าน
                                    </button>
                                </div>
                            )}

                            {/* Buttons */}`;

if (!modalContent.includes('ดูสินค้าและคอร์สเพิ่มเติมในร้าน')) {
    modalContent = modalContent.replace(oldButtonArea, newButtonArea);
}

// 3. Add ShoppingBag to lucide-react imports if not there
if (!modalContent.includes('ShoppingBag')) {
    modalContent = modalContent.replace('ShoppingCart', 'ShoppingCart, ShoppingBag');
}

fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', modalContent, 'utf8');
console.log("Patched SkinCheckModal navigation");
