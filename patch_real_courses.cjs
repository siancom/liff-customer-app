const fs = require('fs');

let content = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', 'utf8');

// 1. Update the signature of SkinCheckModal
content = content.replace(
    `export default function SkinCheckModal({ isOpen, onClose, course, app }) {`,
    `export default function SkinCheckModal({ isOpen, onClose, course, app, shopItems = [], onBookService, onAddToCart }) {`
);

// 2. Insert shopItems compacting logic before prompt generation
const promptStartTarget = `            let prompt = '';
            if (scanMode === 'skin') {`;
const minifiedShopListCode = `
            // Compact shop items to save tokens
            const minifiedShop = shopItems
                .filter(item => item && item.id && item.name && (item.type === 'course' || item.type === 'simple' || item.type === 'product'))
                .map(item => ({ id: item.id, name: item.name, type: item.type === 'course' ? 'บริการคลินิก' : 'สินค้า' }));
            const shopCatalogJson = JSON.stringify(minifiedShop);

            let prompt = '';
            if (scanMode === 'skin') {`;
content = content.replace(promptStartTarget, minifiedShopListCode);

// 3. Update the prompt to pass catalog and change JSON schema
const promptTarget = `                ระบุพิกัด 2D Bounding Box ของตำแหน่งที่มีปัญหาผิว (สิว, รอยดำ/ฝ้า, รูขุมขน, ริ้วรอย) จำนวน 3-7 ตำแหน่งหลัก
                ใช้สเกล 0 ถึง 1000 ในรูปแบบ [ymin, xmin, ymax, xmax]

                ส่งผลลัพธ์กลับมาเป็น JSON เท่านั้น โครงสร้างดังนี้:
                {`;
const newPromptTarget = `                ระบุพิกัด 2D Bounding Box ของตำแหน่งที่มีปัญหาผิว (สิว, รอยดำ/ฝ้า, รูขุมขน, ริ้วรอย) จำนวน 3-7 ตำแหน่งหลัก
                ใช้สเกล 0 ถึง 1000 ในรูปแบบ [ymin, xmin, ymax, xmax]

                คุณมีรายการคอร์สและสินค้าดังนี้:
                \${shopCatalogJson}
                จงเลือกแนะนำคอร์สหรือสินค้าที่เหมาะสมที่สุดกับสภาพผิวของลูกค้าจากรายการด้านบน (แนะนำ 1-3 รายการ) โดยคืนค่าเป็น id ของสินค้าหรือคอร์สนั้นๆ พร้อมระบุเหตุผลสั้นๆ

                ส่งผลลัพธ์กลับมาเป็น JSON เท่านั้น โครงสร้างดังนี้:
                {`;
content = content.replace(promptTarget, newPromptTarget);

// Update recommendedCourses JSON schema
const oldRecommendedCourses = `"recommendedCourses": [
                        { "name": "ชื่อคอร์สบำรุงที่แนะนำ 1", "reason": "เหตุผลสั้นๆ" }
                    ],`;
const newRecommendedCourses = `"recommendedCourses": [
                        { "id": "รหัส id ของคอร์ส/สินค้าที่เลือกจากรายการ", "reason": "เหตุผลสั้นๆ" }
                    ],`;
content = content.replace(oldRecommendedCourses, newRecommendedCourses);

// 4. Update the UI to render actual courses and products
const uiTargetStart = `{/* Recommended Courses */}`;
const uiTargetCode = `{/* Recommended Courses */}
                            {aiResult.recommendedCourses && aiResult.recommendedCourses.length > 0 && (
                                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 delay-300 fill-mode-both">
                                    <h4 className="text-sm font-black text-gray-800 mb-4 flex items-center">
                                        <Target size={18} className="mr-2 text-teal-600" /> คอร์สบำรุงที่ AI แนะนำสำหรับคุณ
                                    </h4>
                                    <div className="space-y-3">
                                        {aiResult.recommendedCourses.map((rec, index) => {
                                            const realItem = shopItems.find(item => item.id === rec.id) || shopItems.find(item => item.name === rec.name);
                                            
                                            return (
                                            <div key={index} className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100 flex flex-col relative overflow-hidden group hover:border-teal-300 transition-colors">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-200/40 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                                                
                                                {realItem && (realItem.image || (realItem.images && realItem.images.length > 0)) && (
                                                    <div className="w-full h-32 mb-3 rounded-xl overflow-hidden bg-white">
                                                        <img src={realItem.image || realItem.images[0]} alt={realItem.name} className="w-full h-full object-cover" />
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start mb-1 z-10">
                                                    <h5 className="font-bold text-teal-900 text-[13px] pr-2">{realItem ? realItem.name : rec.name}</h5>
                                                    
                                                    {realItem && (
                                                        <span className="font-black text-teal-600 text-sm whitespace-nowrap bg-white px-2 py-0.5 rounded-lg shadow-sm">
                                                            ฿{realItem.price?.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-teal-700/80 leading-relaxed mb-3">{rec.reason}</p>
                                                
                                                {realItem && (
                                                    <div className="flex space-x-2 mt-auto pt-2 border-t border-teal-100/50">
                                                        {realItem.type === 'course' ? (
                                                            <button 
                                                                onClick={() => {
                                                                    if (onBookService) {
                                                                        onClose(); // ปิด modal สแกนผิว
                                                                        setTimeout(() => onBookService(realItem), 300); // เปิด modal จองคิว
                                                                    }
                                                                }}
                                                                className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-2 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
                                                            >
                                                                <Calendar size={14} className="mr-1.5" /> จองคิวตอนนี้
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => {
                                                                    if (onAddToCart) {
                                                                        onAddToCart(realItem);
                                                                    }
                                                                }}
                                                                className="flex-1 bg-white border border-teal-500 text-teal-600 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-teal-50 active:scale-95 transition-all flex items-center justify-center"
                                                            >
                                                                <ShoppingCart size={14} className="mr-1.5" /> หยิบลงตะกร้า
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {!realItem && (
                                                    <button className="bg-teal-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shrink-0 shadow-sm hover:bg-teal-700 active:scale-95 transition-transform self-end">
                                                        สอบถาม
                                                    </button>
                                                )}
                                            </div>
                                        )})}
                                    </div>
                                </div>
                            )}`;

const oldUiPattern = /\{\/\*\s*Recommended Courses\s*\*\/\}.*?(?=\{\/\*\s*Buttons\s*\*\/\}|<\/div>\s*<\/div>\s*\)\})/s;
content = content.replace(oldUiPattern, uiTargetCode + '\n\n                                ');

// Wait, need to add ShoppingCart to lucide-react imports
if (!content.includes('ShoppingCart')) {
    content = content.replace('Calendar, ChevronRight', 'Calendar, ChevronRight, ShoppingCart');
}


fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', content, 'utf8');
console.log("Patched Real Courses & Booking");
