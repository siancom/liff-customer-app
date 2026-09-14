import React from 'react';
import { X, Ticket, Percent } from 'lucide-react';

export default function CouponSelectorModal({
    showCouponSelector,
    setShowCouponSelector,
    customerData,
    MOCK_COUPONS,
    applyCoupon
}) {
    if (!showCouponSelector) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[110] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in">
            <div className="bg-gray-50 w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95">
                <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-sm font-black text-gray-900 flex items-center"><Ticket size={18} className="mr-2 text-rose-500"/> เลือกโค้ดส่วนลด</h2>
                    <button onClick={() => setShowCouponSelector(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Input Code */}
                    <div className="flex gap-2">
                        <input type="text" id="manualCouponInput" placeholder="กรอกโค้ดส่วนลด" className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold uppercase" />
                        <button onClick={() => {
                            const val = document.getElementById('manualCouponInput').value;
                            if(val) applyCoupon(val);
                        }} className="bg-gray-800 text-white px-4 rounded-xl font-bold text-xs hover:bg-gray-900">ใช้โค้ด</button>
                    </div>
                    
                    <div className="pt-2">
                        <h3 className="text-xs font-bold text-gray-500 mb-3">คูปองที่คุณมี</h3>
                        {(() => {
                            const collectedCoupons = customerData?.collectedCoupons || [];
                            const availableCoupons = MOCK_COUPONS.filter(c => 
                                c.isActive !== false && (
                                    (!c.isPersonal && !c.isBatch && collectedCoupons.includes(c.code)) || 
                                    (c.isPersonal && c.customerPhone === customerData?.cleanPhone && !c.isUsed)
                                )
                            );
                            return availableCoupons.length > 0 ? (
                                <div className="space-y-3">
                                    {availableCoupons.map((cInfo, idx) => {
                                        return (
                                            <div key={idx} className="bg-white border border-rose-100 rounded-2xl flex items-center p-3 shadow-sm relative overflow-hidden">
                                                <div className="absolute left-0 top-0 w-1.5 h-full bg-rose-400"></div>
                                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mr-3 shrink-0"><Percent size={20} className="text-rose-500"/></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-rose-600 text-sm">{cInfo.code}</p>
                                                    <p className="text-[10px] text-gray-500 line-clamp-1">{cInfo.desc}</p>
                                                </div>
                                                <button onClick={() => applyCoupon(cInfo.code)} className="ml-2 bg-rose-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-rose-600 active:scale-95 shrink-0">ใช้โค้ด</button>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-white rounded-xl border border-gray-100 border-dashed">
                                    <Ticket size={24} className="mx-auto text-gray-300 mb-2"/>
                                    <p className="text-[11px] text-gray-400 font-bold">ไม่มีคูปองที่เก็บไว้</p>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
