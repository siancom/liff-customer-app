import React from 'react';
import { X, Clock, QrCode, CalendarPlus, Sparkles, HistoryIcon, ShoppingBag, CheckCircle } from 'lucide-react';
import { getFuzzyKey, parseNumber } from "../../utils/helpers";

const CourseDetailModal = ({ 
    showQR, 
    setShowQR, 
    customerData, 
    setShowQRFullscreen, 
    openBookingModal, 
    shopItems 
}) => {
    if (!showQR) return null;

    const isFreeUsage = (h) => {
        const amt = parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดเบิก", "ยอดเงิน", "col_19"]));
        const t = String(getFuzzyKey(h, "ประเภท") || '');
        return amt === 0 && !t.includes('ซื้อ') && !t.includes('ได้รับ');
    };

    const isActive899 = (h) => {
        const action = getFuzzyKey(h, ["รายการที่ทำ", "รายการ", "สินค้า", "col_23", "col_18"]);
        return String(action).includes('แอคทีฟ899') || String(action).includes('Active 899');
    };

    const isUsageType = (t) => {
        return t.includes('เบิก') || t.includes('จ่าย') || t.includes('หัก') || t.includes('ตัด');
    };

    const extractHistoryQty = (h) => {
        const t = String(getFuzzyKey(h, "ประเภท") || '');
        const match = t.match(/หัก\s*(\d+)/) || t.match(/เบิก\s*(\d+)/);
        if (match) return parseInt(match[1]);
        const q = getFuzzyKey(h, ["จำนวน", "col_20", "col_21"]);
        if (q && !isNaN(parseInt(q))) return parseInt(q);
        return 1;
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-gray-50 w-full sm:max-w-md h-[90vh] sm:h-auto overflow-hidden rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col animate-in slide-in-from-bottom-full sm:zoom-in-95">
                {/* Header */}
                <div className="bg-[#12B981] p-5 pt-6 relative shrink-0">
                    <button onClick={() => setShowQR(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"><X size={18} /></button>
                    <h2 className="text-xl font-black text-white mb-1 pr-8 line-clamp-1">{getFuzzyKey(showQR, "ชื่อคอส")}</h2>
                    <p className="text-emerald-100 text-xs font-mono">Ref: {getFuzzyKey(showQR, "เลขที่ใบคอส") || '-'}</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar pb-10">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-[16px] border border-gray-100 p-3 flex items-center gap-3 shadow-sm">
                            <img src={customerData.lineProfilePic} alt="profile" className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[9px] text-gray-500 font-bold mb-0.5">ลูกค้า</p>
                                <p className="text-[11px] font-black text-gray-800 line-clamp-1">{getFuzzyKey(customerData, "ชื่อ")}</p>
                                <p className="text-[10px] text-gray-500 font-mono line-clamp-1">{customerData.cleanPhone}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-[16px] border border-gray-100 p-3 flex flex-col justify-center items-end shadow-sm">
                            <p className="text-[9px] text-gray-500 font-bold mb-1">สถานะปัจจุบัน</p>
                            <p className={`text-sm font-black ${showQR.remaining > 0 ? 'text-[#12B981]' : 'text-gray-400'}`}>{showQR.status}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[20px] border-2 border-[#1a1f2c] py-4 px-2 grid grid-cols-3 divide-x divide-gray-200 shadow-sm">
                        <div className="text-center flex flex-col items-center justify-center">
                            <p className="text-[10px] text-gray-500 font-bold mb-1">ทั้งหมด</p>
                            <p className="text-2xl font-black text-[#1a1f2c]">{showQR.totalQty}</p>
                        </div>
                        <div className="text-center flex flex-col items-center justify-center">
                            <p className="text-[10px] text-teal-600 font-bold mb-1">ใช้ไปแล้ว</p>
                            <p className="text-2xl font-black text-[#12B981]">{showQR.totalUsed}</p>
                        </div>
                        <div className="text-center flex flex-col items-center justify-center">
                            <p className="text-[10px] text-[#EE4D2D] font-bold mb-1">คงเหลือ</p>
                            <p className="text-2xl font-black text-[#EE4D2D]">{showQR.remaining}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[20px] border border-gray-100 p-4 shadow-sm mt-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-gray-800">การใช้คอร์ส ({Math.round((showQR.totalUsed / Math.max(1, showQR.totalQty)) * 100)}%)</span>
                            <span className="text-[10px] text-gray-500 flex items-center font-medium"><Clock size={10} className="mr-1"/> หมดอายุ: {getFuzzyKey(showQR, ["วันหมดอายุ", "หมดอายุ"]) || '-'}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-[#12B981] h-full rounded-full transition-all" style={{ width: `${(showQR.totalUsed / Math.max(1, showQR.totalQty)) * 100}%` }}></div>
                        </div>
                    </div>
                    
                    {showQR.computedTotalCredit > 0 && (
                        <div className="bg-white rounded-[20px] border border-orange-100 p-4 shadow-sm mt-3 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>
                            <div className="flex justify-between items-end mb-2 pl-2">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-gray-800">เครดิต/วงเงินคงเหลือ</span>
                                    <span className="text-xl font-black text-[#EE4D2D] leading-none mt-1">฿{showQR.computedRemainCredit.toLocaleString()}</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-[10px] text-gray-500 font-bold">จากวงเงินรวม ฿{showQR.computedTotalCredit.toLocaleString()}</span>
                                    <span className="text-[9px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded mt-1 border border-orange-100 font-black">เบิกใช้ไปแล้ว ฿{showQR.computedUsedCredit.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden ml-1 mt-3">
                                <div className="bg-gradient-to-r from-orange-300 to-orange-500 h-full rounded-full transition-all" style={{ width: `${(showQR.computedUsedCredit / Math.max(1, showQR.computedTotalCredit)) * 100}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <button onClick={() => setShowQRFullscreen(true)} className="bg-white border border-[#12B981] text-[#12B981] py-3.5 rounded-[16px] font-bold text-xs flex justify-center items-center shadow-sm hover:bg-emerald-50 active:scale-95 transition-all">
                            <QrCode size={18} className="mr-1.5" /> แสดง QR ให้สแกน
                        </button>
                        <button onClick={() => { setShowQR(null); openBookingModal(showQR); }} className="bg-[#1a1f2c] text-white py-3.5 rounded-[16px] font-bold text-xs flex justify-center items-center shadow-md hover:bg-black active:scale-95 transition-all">
                            <CalendarPlus size={16} className="mr-1.5" /> จองคิวนัดหมาย
                        </button>
                    </div>

                    {(() => {
                        const freeHistories = (showQR.myHistories || []).filter(h => isFreeUsage(h));
                        if(freeHistories.length === 0) return null;
                        return (
                            <div className="pt-2">
                                <h3 className="text-[12px] font-black text-[#f43f5e] mb-3 flex items-center"><Sparkles size={14} className="mr-1.5"/> รายการฟรี / สิทธิ์พิเศษ</h3>
                                <div className="space-y-2">
                                    {freeHistories.map((h, i) => {
                                        const active899 = isActive899(h);
                                        const actionName = getFuzzyKey(h, ["รายการที่ทำ", "รายการ", "สินค้า", "col_23", "col_18"]);
                                        return (
                                            <div key={i} className={`bg-white border ${active899 ? 'border-purple-200' : 'border-rose-100'} p-3 rounded-2xl flex items-center justify-between shadow-sm`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-500 font-mono">{getFuzzyKey(h, "วันที่")}</span>
                                                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 max-w-[120px]">{actionName}</span>
                                                    {active899 ? (
                                                        <span className="bg-purple-50 text-purple-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-purple-100">แอคทีฟ899</span>
                                                    ) : (
                                                        <span className="bg-rose-50 text-rose-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-rose-100">ฟรี</span>
                                                    )}
                                                </div>
                                                <span className={`${active899 ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-rose-50 text-rose-500 border-rose-100'} text-[8px] font-black px-2 py-1 rounded-md border`}>ไม่หักยอด</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    <div className="pt-2 pb-4">
                        <h3 className="text-[12px] font-black text-gray-600 mb-3 flex items-center"><HistoryIcon size={14} className="mr-1.5"/> ประวัติการรับบริการ / หักเครดิตสินค้า</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[9px] text-gray-500 font-bold">
                                        <th className="py-3 px-3 font-medium whitespace-nowrap w-24">วันที่ / เวลา</th>
                                        <th className="py-3 px-2 font-medium">รายการที่ใช้บริการ</th>
                                        <th className="py-3 px-2 font-medium text-center whitespace-nowrap w-20">ยอดเบิก / มูลค่า</th>
                                        <th className="py-3 px-3 font-medium text-center w-20">ลายเซ็นลูกค้า</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(showQR.myHistories || []).filter(h => !isFreeUsage(h) && isUsageType(String(getFuzzyKey(h, "ประเภท")))).length > 0 ? 
                                        (showQR.myHistories || []).filter(h => !isFreeUsage(h) && isUsageType(String(getFuzzyKey(h, "ประเภท")))).map((h, i) => {
                                            const action = getFuzzyKey(h, ["รายการที่ทำ", "รายการ", "สินค้า", "col_23", "col_18"]) || '-';
                                            const date = getFuzzyKey(h, "วันที่") || '-';
                                            const qty = extractHistoryQty(h);
                                            const amt = parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดเบิก", "ยอดเงิน", "col_19"]));
                                            
                                            const cleanActionName = action.split('>>')[0].trim().toLowerCase();
                                            const matchedItem = shopItems.find(p => {
                                                const pName = p.name.toLowerCase();
                                                return cleanActionName.includes(pName) || pName.includes(cleanActionName);
                                            });
                                            const actionImage = matchedItem ? matchedItem.image : null;

                                            return (
                                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-3 text-[10px] font-bold text-gray-500 whitespace-nowrap align-top">{date}</td>
                                                    <td className="py-3 px-2 text-[11px] font-bold text-gray-800">
                                                        <div className="flex items-start gap-2">
                                                            {actionImage ? (
                                                                <img src={actionImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 bg-white shadow-sm" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                                                    <ShoppingBag size={16} className="text-gray-300"/>
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="line-clamp-2 leading-snug">{action}</div>
                                                                <div className="mt-1.5 flex flex-wrap gap-1">
                                                                    <span className="bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.5 rounded border border-gray-200">หัก {qty} ครั้ง</span>
                                                                    {amt > 0 && <span className="bg-orange-50 text-orange-600 text-[9px] px-1.5 py-0.5 rounded border border-orange-100 font-bold shadow-sm">ตัดวงเงิน</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2 text-center align-top">
                                                        {amt > 0 ? (
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[12px] font-black text-[#EE4D2D] bg-[#FFEFEA] px-2 py-1 rounded-md border border-red-100 whitespace-nowrap">
                                                                    ฿{amt.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="py-3 px-3 text-center align-top">
                                                        <div className="inline-flex flex-col items-center justify-center bg-emerald-50 text-[#12B981] rounded-lg py-1.5 px-2 border border-emerald-100 w-[60px]">
                                                            <CheckCircle size={14} className="mb-0.5" />
                                                            <span className="text-[7px] font-black uppercase">Verified</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan="4" className="py-6 text-center text-xs text-gray-400 font-medium">ไม่มีประวัติการใช้งาน</td></tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailModal;
