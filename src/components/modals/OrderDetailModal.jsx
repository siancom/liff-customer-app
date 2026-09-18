import React, { useRef, useState } from 'react';
import { X, ReceiptText, Clock, ImageIcon, Info, ShoppingBag, MapPin, Tag, Loader2, QrCode, CheckCircle2, Circle, Download, RefreshCcw, Truck, Package, Ticket } from 'lucide-react';
import { getFuzzyKey } from '../../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

const TRACK17_PHASE_TH = {
    infoReceived: 'แจ้งข้อมูลแล้ว',
    pending: 'รอติดตาม',
    notFound: 'ไม่พบเลขพัสดุ',
    inTransit: 'อยู่ระหว่างขนส่ง',
    outForDelivery: 'กำลังนำส่ง',
    delivered: 'จัดส่งสำเร็จ',
    exception: 'การขนส่งมีปัญหา',
    expired: 'หมดเวลาติดตาม',
    undelivered: 'ส่งไม่สำเร็จ',
};

export default function OrderDetailModal({
    selectedOrder,
    setSelectedOrder,
    confirmCancelOrder,
    setConfirmCancelOrder,
    parseNumber,
    handleCancelOrder,
    isActionLoading,
    handleReorder,
    activeCourses,
    setShowQR
}) {
    const receiptRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!selectedOrder) return null;

    const handleDownloadReceipt = async () => {
        if (!receiptRef.current) return;
        try {
            setIsDownloading(true);
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2, 
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const image = canvas.toDataURL("image/jpeg", 0.9);
            
            const a = document.createElement('a');
            a.href = image;
            a.download = `receipt-${selectedOrder.orderNo || selectedOrder.id || Date.now()}.jpg`;
            a.click();
        } catch (e) {
            console.warn('Download receipt error:', e);
            alert('ไม่สามารถบันทึกใบเสร็จได้ กรุณาแคปหน้าจอแทน');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[110] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in">
            <div className="bg-gray-50 w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <h2 className="text-sm font-black text-gray-900 flex items-center"><ReceiptText size={18} className="mr-2 text-teal-600"/> รายละเอียดคำสั่งซื้อ</h2>
                    <button onClick={() => { setSelectedOrder(null); setConfirmCancelOrder(false); }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><X size={16} /></button>
                </div>
                
                <div ref={receiptRef} className="flex-1 overflow-y-auto p-5 space-y-4 pb-24">
                    {/* Status & Order No */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-mono text-gray-500 font-bold">#{selectedOrder.orderNo || selectedOrder.wooOrderId || selectedOrder.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                                (selectedOrder.status === 'ชำระแล้ว' || selectedOrder.status === 'อนุมัติ' || selectedOrder.status === 'จัดส่งแล้ว') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                (selectedOrder.status || '').includes('รอ') ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                (selectedOrder.status || '').includes('ยกเลิก') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>{selectedOrder.status}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium mb-3"><Clock size={12} className="inline mr-1 mb-0.5"/> {selectedOrder.createdAtStr || new Date(selectedOrder.createdAt).toLocaleString('th-TH')}</p>
                        
                        {(selectedOrder.orderNo || selectedOrder.wooOrderId || selectedOrder.id) && (
                            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100 mt-3">
                                <QRCodeSVG value={selectedOrder.orderNo || selectedOrder.wooOrderId || selectedOrder.id} size={120} level="H" />
                                <span className="text-[9px] text-gray-500 font-bold mt-2 tracking-widest flex items-center"><QrCode size={10} className="mr-1"/> แสกนเพื่อตรวจสอบ</span>
                            </div>
                        )}

                        {/* Order Timeline */}
                        {!(selectedOrder.status || '').includes('ยกเลิก') && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center relative px-2">
                                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
                                    <div className={`absolute top-1/2 left-4 h-0.5 -z-10 -translate-y-1/2 transition-all duration-500 ${
                                        selectedOrder.status === 'จัดส่งแล้ว' ? 'w-[calc(100%-2rem)] bg-teal-500' : 
                                        (selectedOrder.status === 'ชำระแล้ว' || selectedOrder.status === 'อนุมัติ') ? 'w-1/2 bg-teal-500' : 'w-0'
                                    }`}></div>

                                    {/* Step 1: Pending */}
                                    <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                                        <CheckCircle2 size={20} className="text-teal-500 fill-teal-50" />
                                        <span className="text-[9px] font-bold text-gray-800">รอดำเนินการ</span>
                                    </div>

                                    {/* Step 2: Paid / Approved */}
                                    <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                                        {(selectedOrder.status === 'ชำระแล้ว' || selectedOrder.status === 'อนุมัติ' || selectedOrder.status === 'จัดส่งแล้ว' || selectedOrder.status === 'เรียบร้อย') ? 
                                            <CheckCircle2 size={20} className="text-teal-500 fill-teal-50" /> : 
                                            <Circle size={20} className="text-gray-200 fill-white" />
                                        }
                                        <span className={`text-[9px] font-bold ${
                                            (selectedOrder.status === 'ชำระแล้ว' || selectedOrder.status === 'อนุมัติ' || selectedOrder.status === 'จัดส่งแล้ว' || selectedOrder.status === 'เรียบร้อย') ? 'text-gray-800' : 'text-gray-400'
                                        }`}>ชำระเงินแล้ว</span>
                                    </div>

                                    {/* Step 3: Shipped / Completed */}
                                    <div className="flex flex-col items-center gap-1.5 bg-white px-2">
                                        {(selectedOrder.status === 'จัดส่งแล้ว' || selectedOrder.status === 'เรียบร้อย') ? 
                                            <CheckCircle2 size={20} className="text-teal-500 fill-teal-50" /> : 
                                            <Circle size={20} className="text-gray-200 fill-white" />
                                        }
                                        <span className={`text-[9px] font-bold ${(selectedOrder.status === 'จัดส่งแล้ว' || selectedOrder.status === 'เรียบร้อย') ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {selectedOrder.itemType === 'product' ? 'จัดส่งแล้ว' : 'เสร็จสิ้น'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 📦 ติดตามพัสดุ (17TRACK) หรือ แถบสถานะการจัดส่ง (สำหรับสินค้า) */}
                    {(selectedOrder.trackingNo || selectedOrder.itemType === 'product' || selectedOrder.fulfillment) && (() => {
                        const t = selectedOrder.trackingInfo;
                        const phase = t?.phase || 'pending';
                        const phaseTh = TRACK17_PHASE_TH[phase] || phase;
                        const tone = phase === 'delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : (phase === 'exception' || phase === 'undelivered') ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-sky-50 border-sky-200 text-sky-800';
                        return (
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xs font-black text-gray-800 mb-4 flex items-center"><Truck size={14} className="mr-1.5 text-sky-500"/> ติดตามพัสดุ</h3>

                                {/* 🌟 แถบขั้นตอนแบบ Shopee: สั่งซื้อ → จัดส่ง → กำลังขนส่ง → ส่งสำเร็จ */}
                                <div className="flex items-center justify-between mb-5 relative">
                                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-100 -z-0"></div>
                                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-sky-400 -z-0 transition-all" style={{ width: phase === 'delivered' ? '100%' : (phase === 'inTransit' || phase === 'outForDelivery' ? '66%' : (phase !== 'pending' ? '33%' : '0%')) }}></div>
                                    
                                    <div className="flex flex-col items-center gap-1.5 bg-white px-2 relative z-10">
                                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm"><ReceiptText size={14} /></div>
                                        <span className="text-[9px] font-bold text-sky-600">สั่งซื้อแล้ว</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 bg-white px-2 relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${phase !== 'pending' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'}`}><Package size={14} /></div>
                                        <span className={`text-[9px] font-bold ${phase !== 'pending' ? 'text-sky-600' : 'text-gray-400'}`}>จัดส่งแล้ว</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 bg-white px-2 relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${(phase === 'inTransit' || phase === 'outForDelivery' || phase === 'delivered') ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'}`}><Truck size={14} /></div>
                                        <span className={`text-[9px] font-bold ${(phase === 'inTransit' || phase === 'outForDelivery' || phase === 'delivered') ? 'text-sky-600' : 'text-gray-400'}`}>กำลังขนส่ง</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 bg-white px-2 relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${phase === 'delivered' ? 'bg-emerald-50 text-emerald-500 ring-2 ring-emerald-500 ring-inset' : 'bg-gray-100 text-gray-400'}`}>{phase === 'delivered' ? <CheckCircle2 size={16} className="fill-emerald-500 text-white" /> : <CheckCircle2 size={16} />}</div>
                                        <span className={`text-[9px] font-bold ${phase === 'delivered' ? 'text-emerald-600' : 'text-gray-400'}`}>ส่งสำเร็จ</span>
                                    </div>
                                </div>

                                {/* 📦 ข้อมูลพัสดุ */}
                                <div className={`p-3 rounded-xl border flex items-center justify-between mb-4 ${tone}`}>
                                    <div>
                                        <p className="text-[11px] font-black mb-0.5 flex items-center"><Package size={12} className="mr-1"/> {phaseTh}</p>
                                        <p className="text-[10px] opacity-80 font-mono tracking-wider">{selectedOrder.trackingNo} {t?.carrier ? `· ${t.carrier}` : ''}</p>
                                    </div>
                                    {t?.fetchedAt && <span className="text-[8.5px] opacity-70">อัพเดท {new Date(t.fetchedAt).toLocaleString('th-TH', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</span>}
                                </div>

                                {/* 📜 Timeline ล่าสุด */}
                                {!t && <p className="text-[10px] text-gray-400 text-center py-1">ร้านกำลังเตรียมข้อมูลการติดตาม — สถานะจะแสดงที่นี่เมื่อมีการอัพเดทค่ะ</p>}
                                {t?.lastEvent && (
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3">
                                        <p className="text-[9px] font-black text-gray-700 mb-1">กิจกรรมล่าสุด</p>
                                        <p className="text-[10px] text-gray-600 leading-snug">{t.lastEvent.desc}</p>
                                        <p className="text-[9px] text-gray-400 mt-0.5">
                                            {t.lastEvent.time ? new Date(t.lastEvent.time).toLocaleString('th-TH') : ''}
                                            {t.lastEvent.location ? ` · ${t.lastEvent.location}` : ''}
                                        </p>
                                    </div>
                                )}
                                {t?.events?.length > 0 ? (
                                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                                        {t.events.map((ev, i) => (
                                            <div key={i} className="flex gap-2">
                                                <div className="flex flex-col items-center pt-1">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? 'bg-sky-500 ring-2 ring-sky-200' : 'bg-gray-300'}`}></span>
                                                    {i < t.events.length - 1 && <span className="w-px flex-1 bg-gray-200 min-h-[10px]"></span>}
                                                </div>
                                                <div className="flex-1 min-w-0 pb-1">
                                                    <p className="text-[9.5px] font-bold text-gray-700 leading-snug">{ev.desc}</p>
                                                    <p className="text-[8.5px] text-gray-400">{ev.time ? new Date(ev.time).toLocaleString('th-TH') : ''}{ev.location ? ` · ${ev.location}` : ''}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-400">
                                        <Package size={24} className="mx-auto mb-2 opacity-50"/>
                                        <p className="text-xs">อยู่ระหว่างเตรียมการจัดส่ง</p>
                                    </div>
                                )}
                                <p className="text-[8px] text-gray-300 text-right mt-1.5 font-medium">ข้อมูลจาก 17TRACK · อัพเดทโดยร้านค่ะ</p>
                            </div>
                        );
                    })()}
                    
                    {/* 🌟 สลิปการโอนเงินที่แนบมา 🌟 */}
                    {selectedOrder.slipImage && (
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-800 mb-3 flex items-center"><ReceiptText size={14} className="mr-1.5 text-teal-600"/> สลิปการโอนเงิน</h3>
                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center relative max-h-72">
                                <img src={selectedOrder.slipImage} alt="สลิปโอนเงิน" className="w-full h-full object-contain" />
                            </div>
                        </div>
                    )}

                    {/* 🌟 ปรับปรุงการแสดงผลรูปภาพที่แนบ (สินค้า / ผิวหน้า) 🌟 */}
                    {selectedOrder.itemType === 'custom_image' && (selectedOrder.customOrderImage || selectedOrder.faceImage) && (
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-800 mb-3 flex items-center"><ImageIcon size={14} className="mr-1.5 text-blue-500"/> รูปภาพที่แนบ</h3>
                            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                                {selectedOrder.customOrderImage && (
                                    <div className="w-48 h-48 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center relative">
                                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm">สินค้า/ใบสั่งแพทย์</div>
                                        <img src={selectedOrder.customOrderImage} alt="Custom Order" className="w-full h-full object-contain" />
                                    </div>
                                )}
                                {selectedOrder.faceImage && (
                                    <div className="w-48 h-48 shrink-0 bg-emerald-50 rounded-xl overflow-hidden border border-emerald-200 flex items-center justify-center relative">
                                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm">รูปผิวหน้า</div>
                                        <img src={selectedOrder.faceImage} alt="Face" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] font-bold text-gray-700 mt-3 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start"><Info size={14} className="mr-1.5 shrink-0 mt-0.5 text-blue-500"/> {selectedOrder.itemName}</p>
                        </div>
                    )}

                    {/* Cart Items (If not custom image) */}
                    {selectedOrder.itemType !== 'custom_image' && selectedOrder.cartItems && selectedOrder.cartItems.length > 0 && (
                         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                             <h3 className="text-xs font-black text-gray-800 mb-2 flex items-center"><ShoppingBag size={14} className="mr-1.5 text-teal-500"/> รายการสินค้า</h3>
                             {selectedOrder.cartItems.map((item, idx) => (
                                 <div key={idx} className="flex gap-3 relative pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                     <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                                         {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/> : <ShoppingBag size={16} className="text-gray-300"/>}
                                     </div>
                                     <div className="flex-1">
                                         <p className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{item.name}</p>
                                         <div className="flex justify-between items-end">
                                             <span className="text-[10px] text-gray-500 font-medium">จำนวน: {item.qty || 1}</span>
                                             <span className="text-[11px] font-black text-[#EE4D2D]">฿{((parseNumber(item.price)||0) * (item.qty || 1)).toLocaleString()}</span>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    )}

                    {/* Shipping Address */}
                    {selectedOrder.shippingAddress && (
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                             <h3 className="text-xs font-black text-gray-800 mb-2 flex items-center"><MapPin size={14} className="mr-1.5 text-blue-500"/> ที่อยู่จัดส่ง</h3>
                             <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedOrder.shippingAddress}</p>
                        </div>
                    )}

                    {/* Price Summary */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] text-gray-500 font-bold">ยอดรวม ({selectedOrder.itemType === 'custom_image' ? 'รอประเมิน' : 'สินค้า'})</span>
                            <span className="text-[11px] font-black text-gray-800">฿{(parseNumber(selectedOrder.originalPrice)||0).toLocaleString()}</span>
                        </div>
                        
                        {/* แสดงส่วนลดโปรโมชั่นที่ถูกบันทึกไว้ */}
                        {selectedOrder.promoApplied && (
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] text-[#EE4D2D] font-bold flex items-center">
                                    <Tag size={12} className="mr-1"/> {selectedOrder.promoApplied.split(' (')[0]}
                                </span>
                                <span className="text-[11px] font-black text-[#EE4D2D]">-฿{(parseNumber(selectedOrder.originalPrice) - parseNumber(selectedOrder.itemPrice) - (parseNumber(selectedOrder.discountAmount) - (parseNumber(selectedOrder.originalPrice) - parseNumber(selectedOrder.itemPrice)))).toLocaleString()}</span>
                            </div>
                        )}

                        {/* แสดงส่วนลดจากคูปอง (ถ้ามีการระบุใน object) หรือถ้าไม่ได้ระบุ promoApplied ให้แสดง discountAmount ทั้งหมด */}
                        {(parseNumber(selectedOrder.discountAmount) > 0 && !selectedOrder.promoApplied) && (
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] text-rose-500 font-bold">ส่วนลด</span>
                                <span className="text-[11px] font-black text-rose-500">-฿{(parseNumber(selectedOrder.discountAmount)||0).toLocaleString()}</span>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                            <span className="text-xs font-black text-gray-900">ยอดสุทธิ</span>
                            <span className="text-lg font-black text-[#EE4D2D] leading-none">฿{(parseNumber(selectedOrder.itemPrice)||0).toLocaleString()}</span>
                        </div>
                        {selectedOrder.itemType === 'custom_image' && (selectedOrder.status === 'รอประเมินราคา' || selectedOrder.status === 'รอตรวจสอบ') && (
                            <p className="text-[10px] text-orange-500 font-bold mt-3 text-center bg-orange-50 py-2 rounded-lg border border-orange-100">กำลังรอแอดมินประเมินราคา กรุณารอสักครู่ค่ะ</p>
                        )}
                    </div>
                </div>

                {/* Actions Block (Download & Re-order) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 shrink-0 pb-safe flex gap-2">
                    {/* Cancel Actions */}
                    {!(selectedOrder.status || '').includes('ยกเลิก') && !(selectedOrder.status === 'จัดส่งแล้ว') && !(selectedOrder.status === 'อนุมัติ') && !(selectedOrder.status === 'ชำระแล้ว') ? (
                        <div className="w-full">
                            {confirmCancelOrder ? (
                                 <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex flex-col items-center animate-in fade-in zoom-in-95">
                                     <p className="text-[11px] font-bold text-red-700 mb-2">ต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?</p>
                                     <div className="flex gap-2 w-full">
                                         <button onClick={() => setConfirmCancelOrder(false)} className="flex-1 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-[11px] font-bold">ไม่, กลับไป</button>
                                         <button onClick={() => handleCancelOrder(selectedOrder.id)} disabled={isActionLoading} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-[11px] font-bold flex justify-center items-center shadow-sm">
                                             {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : 'ยืนยันยกเลิก'}
                                         </button>
                                     </div>
                                 </div>
                            ) : (
                                <button onClick={() => setConfirmCancelOrder(true)} className="w-full py-3.5 bg-white border border-red-200 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 transition-colors shadow-sm">
                                    ยกเลิกคำสั่งซื้อ
                                </button>
                            )}
                        </div>
                    ) : (
                        /* E-Receipt & Re-order */
                        <>
                            {/* Course Details Button */}
                            {(() => {
                                if (selectedOrder.itemType !== 'course' || !activeCourses || !setShowQR) return null;
                                const matchingCourse = activeCourses.find(c => {
                                    const refKeys = ["หมายเลขคำสั่งซื้อ", "อ้างอิง", "เลขที่ใบเสร็จ", "เลขที่ใบคอส"];
                                    return refKeys.some(k => String(getFuzzyKey(c, k)) === selectedOrder.orderNo) || c.id === selectedOrder.original?.id;
                                });
                                if (!matchingCourse) return null;
                                return (
                                    <button 
                                        onClick={() => {
                                            setSelectedOrder(null);
                                            setShowQR(matchingCourse);
                                        }}
                                        className="flex-[2] py-3.5 bg-[#12B981] hover:bg-[#059669] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30"
                                    >
                                        <Ticket size={16} /> ดูรายละเอียดคอร์ส
                                    </button>
                                );
                            })()}

                            {(selectedOrder.status === 'ชำระแล้ว' || selectedOrder.status === 'อนุมัติ' || selectedOrder.status === 'จัดส่งแล้ว' || selectedOrder.status === 'เรียบร้อย') && (
                                <button 
                                    onClick={handleDownloadReceipt}
                                    disabled={isDownloading}
                                    className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-black hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                                >
                                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                    {isDownloading ? 'บันทึกรูป...' : 'ใบเสร็จ'}
                                </button>
                            )}
                            
                            {/* Re-order is available if it has cartItems */}
                            {selectedOrder.itemType !== 'course' && selectedOrder.cartItems && selectedOrder.cartItems.length > 0 && typeof handleReorder === 'function' && (
                                <button 
                                    onClick={() => handleReorder(selectedOrder.cartItems)}
                                    className="flex-[2] py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <RefreshCcw size={16} /> ซื้ออีกครั้ง
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
