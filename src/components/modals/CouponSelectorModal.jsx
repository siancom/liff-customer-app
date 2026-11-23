import React from 'react';
import { X, Ticket, Percent, Sparkles, Check } from 'lucide-react';

export default function CouponSelectorModal({
    showCouponSelector,
    setShowCouponSelector,
    customerData,
    MOCK_COUPONS = [],
    applyCoupon
}) {
    if (!showCouponSelector) return null;

    const collectedCodes = (customerData?.collectedCoupons || []).map(c => String(c).toUpperCase());

    // คูปองที่ลูกค้าเก็บไว้แล้ว
    const myCoupons = (MOCK_COUPONS || []).filter(c => 
        c.isActive !== false && (
            (!c.isPersonal && !c.isBatch && collectedCodes.includes(String(c.code).toUpperCase())) || 
            (c.isPersonal && c.customerPhone === customerData?.cleanPhone && !c.isUsed)
        )
    );

    // คูปองโปรโมชั่นสาธารณะ CRM ที่ยังไม่ได้กดเก็บ (แนะนำให้กดใช้ได้เลย)
    const recommendedCoupons = (MOCK_COUPONS || []).filter(c => 
        c.isActive !== false && !c.isPersonal && !c.isBatch && !collectedCodes.includes(String(c.code).toUpperCase())
    );

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[110] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in">
            <div className="bg-gray-50 w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95">
                <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-sm font-black text-gray-900 flex items-center">
                        <Ticket size={18} className="mr-2 text-rose-500"/> เลือกโค้ดส่วนลด / คูปอง CRM
                    </h2>
                    <button 
                        onClick={() => setShowCouponSelector(false)} 
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Input Code */}
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            id="manualCouponInput" 
                            placeholder="กรอกโค้ดส่วนลด เช่น CRM20" 
                            className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold uppercase focus:ring-2 focus:ring-rose-400 focus:outline-none" 
                        />
                        <button 
                            type="button"
                            onClick={() => {
                                const val = document.getElementById('manualCouponInput').value;
                                if(val) applyCoupon(val.trim());
                            }} 
                            className="bg-gray-800 text-white px-4 rounded-xl font-bold text-xs hover:bg-gray-900 active:scale-95 transition-all"
                        >
                            ใช้โค้ด
                        </button>
                    </div>
                    
                    {/* คูปองที่คุณมี */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-600 mb-2.5 flex items-center gap-1.5">
                            <Ticket size={14} className="text-rose-500" />
                            คูปองในกระเป๋าของคุณ ({myCoupons.length})
                        </h3>
                        {myCoupons.length > 0 ? (
                            <div className="space-y-2.5">
                                {myCoupons.map((cInfo, idx) => (
                                    <div key={idx} className="bg-white border border-rose-200/80 rounded-2xl flex items-center p-3 shadow-xs relative overflow-hidden">
                                        <div className="absolute left-0 top-0 w-1.5 h-full bg-rose-500"></div>
                                        <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center mr-3 shrink-0">
                                            <Percent size={18} className="text-rose-500"/>
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <p className="font-black text-rose-600 text-sm">{cInfo.code}</p>
                                                {cInfo.type === 'percent' && (
                                                    <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded border border-rose-100">
                                                        ลด {cInfo.value}% ทั้งบิล
                                                    </span>
                                                )}
                                                {(cInfo.type === 'course_percent' || cInfo.type === 'course_fixed') && (
                                                    <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded border border-rose-100">
                                                        {cInfo.type === 'course_percent' ? `ลด ${cInfo.value}%` : `ลด ฿${cInfo.value}`}
                                                        {cInfo.scope === 'all_courses' || cInfo.posItemName === 'ทุกคอร์ส'
                                                            ? ' (ทุกคอร์ส)'
                                                            : cInfo.scope === 'category'
                                                            ? ` (หมวด ${cInfo.targetCategoryLabel || cInfo.targetCategory})`
                                                            : ` (${cInfo.posItemName || 'เฉพาะคอร์ส'})`}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-600 font-medium line-clamp-1">{cInfo.name || cInfo.desc}</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => applyCoupon(cInfo.code)} 
                                            className="bg-rose-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 active:scale-95 shrink-0 transition-all"
                                        >
                                            ใช้โค้ด
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-white rounded-xl border border-gray-200 border-dashed">
                                <p className="text-[11px] text-gray-400 font-medium">ยังไม่มีคูปองที่เก็บไว้</p>
                            </div>
                        )}
                    </div>

                    {/* คูปองโปรโมชั่นแนะนำสำหรับคุณ */}
                    {recommendedCoupons.length > 0 && (
                        <div className="pt-2 border-t border-gray-200/60">
                            <h3 className="text-xs font-bold text-amber-800 mb-2.5 flex items-center gap-1.5">
                                <Sparkles size={14} className="text-amber-500 fill-amber-500" />
                                สิทธิพิเศษ CRM แนะนำ (แตะเก็บ & ใช้ทันที)
                            </h3>
                            <div className="space-y-2.5">
                                {recommendedCoupons.map((cInfo, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-amber-50/60 to-yellow-50/40 border border-amber-200 rounded-2xl flex items-center p-3 shadow-xs relative overflow-hidden">
                                        <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-400"></div>
                                        <div className="w-11 h-11 bg-amber-100/70 rounded-xl flex items-center justify-center mr-3 shrink-0">
                                            <Sparkles size={18} className="text-amber-600"/>
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <p className="font-black text-amber-700 text-sm">{cInfo.code}</p>
                                                {cInfo.type === 'percent' && (
                                                    <span className="text-[10px] font-black bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">
                                                        ลด {cInfo.value}% ทั้งบิล
                                                    </span>
                                                )}
                                                {(cInfo.type === 'course_percent' || cInfo.type === 'course_fixed') && (
                                                    <span className="text-[10px] font-black bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">
                                                        {cInfo.type === 'course_percent' ? `ลด ${cInfo.value}%` : `ลด ฿${cInfo.value}`}
                                                        {cInfo.scope === 'all_courses' || cInfo.posItemName === 'ทุกคอร์ส'
                                                            ? ' (ทุกคอร์ส)'
                                                            : cInfo.scope === 'category'
                                                            ? ` (หมวด ${cInfo.targetCategoryLabel || cInfo.targetCategory})`
                                                            : ` (${cInfo.posItemName || 'เฉพาะคอร์ส'})`}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-700 font-medium line-clamp-1">{cInfo.name || cInfo.desc}</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => applyCoupon(cInfo.code)} 
                                            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm active:scale-95 shrink-0 transition-all"
                                        >
                                            เก็บ & ใช้
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
