import React from 'react';
import { 
    X, 
    CheckCircle2, 
    Sparkles, 
    ReceiptText, 
    Ticket, 
    ArrowRight, 
    ShoppingBag, 
    CreditCard, 
    CalendarCheck, 
    HeartPulse, 
    Copy, 
    Check 
} from 'lucide-react';

export default function OrderSuccessModal({
    isOpen,
    onClose,
    orderData,
    onViewCourses,
    onViewOrders
}) {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen || !orderData) return null;

    const cartItems = orderData.cart || [];
    const hasCourses = orderData.hasCourses !== undefined 
        ? orderData.hasCourses 
        : cartItems.some(i => i.type === 'course' || i.type === 'single_course' || i.isCourse);
    const hasProducts = orderData.hasProducts !== undefined
        ? orderData.hasProducts
        : cartItems.some(i => i.type === 'product');

    const handleCopyOrderNo = () => {
        if (!orderData.orderNo) return;
        navigator.clipboard?.writeText(orderData.orderNo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case 'credit':
                return 'ชำระด้วยเครดิตคงเหลือ (สำเร็จทันที)';
            case 'promptpay':
                return 'โอนชำระพร้อมเพย์ (แนบสลิปเรียบร้อย)';
            case 'omise':
            case 'omise_creditcard':
                return 'บัตรเครดิต / เดบิต ออนไลน์';
            case 'omise_promptpay':
                return 'QR พร้อมเพย์ออนไลน์';
            case 'omise_mobile':
                return 'Mobile Banking';
            case 'omise_installment':
                return 'ผ่อนชำระผ่านบัตรเครดิต';
            case 'omise_shopeepay':
                return 'ShopeePay';
            default:
                return method || 'ชำระเงินเรียบร้อย';
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[130] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col hide-scrollbar border border-slate-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
                
                {/* Header Close button */}
                <div className="absolute top-4 right-4 z-20">
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
                        title="ปิด"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 text-center pt-8">
                    {/* Animated Checkmark Badge */}
                    <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60"></div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 relative z-10">
                            <CheckCircle2 size={44} strokeWidth={2.5} />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md z-20">
                            <Sparkles size={14} className="fill-slate-950" />
                        </div>
                    </div>

                    {/* Thank you title & message */}
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 leading-tight">
                        ขอบคุณสำหรับการสั่งซื้อค่ะ! ✨
                    </h2>
                    <p className="text-xs text-slate-500 font-medium px-2 mb-5 leading-relaxed">
                        {orderData.isInstant 
                            ? 'ระบบได้ดำเนินการตัดยอดและบันทึกคอร์สของคุณเรียบร้อยแล้ว พร้อมเปิดใช้งานทันทีค่ะ' 
                            : 'เราได้รับคำสั่งซื้อและหลักฐานการชำระเงินของคุณแล้ว ทางคลินิกกำลังดำเนินการตรวจสอบความถูกต้องให้นะคะ'}
                    </p>

                    {/* Order Reference Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left mb-5 shadow-2xs">
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/70">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    หมายเลขคำสั่งซื้อ
                                </span>
                                <span className="text-sm font-black font-mono text-slate-800">
                                    {orderData.orderNo || '-'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyOrderNo}
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                            >
                                {copied ? <><Check size={11} className="text-emerald-600" /> คัดลอกแล้ว</> : <><Copy size={11} /> คัดลอก</>}
                            </button>
                        </div>

                        {/* Order Summary Specs */}
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between items-center text-slate-600">
                                <span className="text-[11px] font-medium text-slate-500">วันที่สั่งซื้อ:</span>
                                <span className="font-bold text-slate-700">
                                    {orderData.dateStr || new Date().toLocaleDateString('th-TH')} {orderData.timeStr ? `• ${orderData.timeStr} น.` : ''}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600">
                                <span className="text-[11px] font-medium text-slate-500">การชำระเงิน:</span>
                                <span className="font-bold text-teal-700 text-right max-w-[200px] truncate">
                                    {getPaymentMethodLabel(orderData.paymentMethod)}
                                </span>
                            </div>

                            {/* Items count & summary */}
                            <div className="pt-2 mt-2 border-t border-slate-200/60">
                                <div className="text-[11px] font-black text-slate-700 mb-1.5 flex items-center justify-between">
                                    <span>รายการที่สั่งซื้อ ({cartItems.length} รายการ):</span>
                                    <span className="text-[10px] text-slate-400 font-bold">รวม {cartItems.reduce((s, i) => s + (Number(i.qty) || 1), 0)} ชิ้น</span>
                                </div>
                                <div className="max-h-28 overflow-y-auto hide-scrollbar space-y-1 pr-0.5">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl border border-slate-150">
                                            <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                                                {item.type === 'course' || item.type === 'single_course' || item.isCourse ? (
                                                    <HeartPulse size={12} className="text-pink-500 shrink-0" />
                                                ) : (
                                                    <ShoppingBag size={12} className="text-blue-500 shrink-0" />
                                                )}
                                                <span className="font-bold text-slate-800 truncate">
                                                    {item.name}
                                                </span>
                                                {Number(item.qty) > 1 && (
                                                    <span className="text-[9px] font-black text-slate-400">
                                                        x{item.qty}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-black text-slate-900 shrink-0">
                                                ฿{(Number(item.price || 0) * (Number(item.qty) || 1)).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2.5 mt-2 border-t border-slate-200/80 flex justify-between items-baseline">
                                <span className="text-xs font-black text-slate-800">ยอดชำระสุทธิ:</span>
                                <span className="text-lg font-black text-pink-600">
                                    ฿{Number(orderData.finalPrice || 0).toLocaleString()}.-
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 🌟 ACTION BUTTONS (ตามที่ผู้ใช้ต้องการ) 🌟 */}
                    <div className="space-y-2.5">
                        {/* 1. ปุ่มไปดูคอร์สของฉัน (แสดงเด่นเมื่อมีการซื้อคอร์ส) */}
                        {hasCourses && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof onViewCourses === 'function') {
                                        onViewCourses();
                                    } else {
                                        onClose();
                                    }
                                }}
                                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 active:scale-98 transition-all"
                            >
                                <Ticket size={18} className="stroke-[2.5]" />
                                <span>ไปที่คอร์สของฉัน (ดูใบคอร์ส / จองคิว)</span>
                                <ArrowRight size={15} strokeWidth={3} className="ml-auto" />
                            </button>
                        )}

                        {/* 2. ปุ่มดูคำสั่งซื้อ */}
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof onViewOrders === 'function') {
                                    onViewOrders();
                                } else {
                                    onClose();
                                }
                            }}
                            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-98 ${
                                !hasCourses 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700' 
                                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                            }`}
                        >
                            <ReceiptText size={18} className={!hasCourses ? 'text-white' : 'text-slate-500'} />
                            <span>ดูประวัติคำสั่งซื้อ (Orders)</span>
                            <ArrowRight size={15} strokeWidth={2.5} className="ml-auto opacity-70" />
                        </button>

                        {/* 3. ปุ่มเลือกดูบริการอื่นต่อ */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-xs transition-colors"
                        >
                            กลับไปเลือกซื้อบริการอื่นๆ ต่อ
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

