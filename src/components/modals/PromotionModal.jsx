import React from 'react';
import { Gift, X, ChevronRight, Tag } from 'lucide-react';

export default function PromotionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Mocked promotions
  const promotions = [
    {
      id: 1,
      title: 'บุฟเฟต์เลเซอร์ขนรักแร้ 1 ปี',
      desc: 'ลดพิเศษเหลือเพียง 3,990.- จากปกติ 12,000.- พิเศษสำหรับลูกค้าใหม่',
      isVip: false
    },
    {
      id: 2,
      title: 'โปรโมชันฉีดหน้าใส Meso 5 แถม 2',
      desc: 'จ่ายเพียง 5 ครั้ง รับไปเลย 7 ครั้ง พร้อมของแถมพิเศษ',
      isVip: true
    },
    {
      id: 3,
      title: 'ลด 50% คอร์สลดน้ำหนัก 10 ครั้ง',
      desc: 'โปรโมชันเฉพาะเดือนนี้เท่านั้น ห้ามพลาด!',
      isVip: false
    }
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-hidden rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 relative z-10 shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors z-20"><X size={20} /></button>
          <div className="flex items-center text-white mb-2">
            <Gift size={28} className="mr-3" />
            <h2 className="text-xl font-black tracking-wide">โปรโมชันพิเศษ</h2>
          </div>
          <p className="text-pink-100 text-xs font-medium">รวมโปรโมชันเด็ดๆ ที่คุณไม่ควรพลาด!</p>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {promotions.map((promo, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${promo.isVip ? 'bg-amber-400' : 'bg-pink-400'}`}></div>
              <div className="pl-2 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-sm">{promo.title}</h3>
                  {promo.isVip && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded uppercase ml-2 shrink-0">VIP Only</span>}
                </div>
                <p className="text-xs text-gray-500 mb-4">{promo.desc}</p>
                <button className="w-full bg-gray-50 text-pink-600 hover:bg-pink-50 border border-gray-200 hover:border-pink-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-colors">
                  <Tag size={14} className="mr-2" /> สนใจโปรโมชันนี้
                </button>
              </div>
            </div>
          ))}

          <div className="mt-6 text-center">
             <p className="text-xs text-gray-400">ติดต่อพนักงานที่สาขาเพื่อรับสิทธิ์ หรือสอบถามเพิ่มเติมผ่าน LINE OA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
