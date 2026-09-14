import React from 'react';
import { X, AlertCircle, CreditCard, QrCode, Store, Banknote, Copy, CheckCircle, Upload, Lock, Loader2 } from 'lucide-react';

export default function BalancePaymentModal({
    shopModal,
    setShopModal,
    parseNumber,
    totalInternalCredit,
    paymentMethod,
    setPaymentMethod,
    availableBranches,
    paymentBranch,
    setPaymentBranch,
    PROMPTPAY_CONFIG,
    showToast,
    slipImage,
    handleSlipChange,
    handleBalancePaymentSubmit,
    isSubmittingOrder
}) {
    if (!shopModal) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[110] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in">
            <div className="bg-gray-50 w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 max-h-[90vh]">
                <div className="bg-red-500 p-4 relative shrink-0 flex justify-between items-center">
                    <h2 className="text-base font-black text-white flex items-center"><AlertCircle size={18} className="mr-2"/> ชำระยอดค้าง</h2>
                    <button onClick={() => setShopModal(null)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"><X size={18} /></button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto">
                    <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 mb-5">
                        <p className="text-[11px] text-gray-500 font-bold mb-1">รายการ</p>
                        <p className="text-[15px] font-black text-gray-800 mb-1">{shopModal.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono mb-4">{shopModal.desc}</p>
                        <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                            <span className="text-[13px] font-black text-gray-900">ยอดที่ต้องชำระ</span>
                            <span className="text-2xl font-black text-red-600 leading-none">฿{(parseNumber(shopModal.price)||0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[13px] font-black text-gray-800 flex items-center"><CreditCard size={18} className="mr-2 text-indigo-600"/> วิธีชำระเงิน</h3>
                            {totalInternalCredit > 0 && (
                                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200 shadow-sm">
                                    เครดิตที่มี: ฿{(totalInternalCredit||0).toLocaleString()}
                                </span>
                            )}
                        </div>
                        
                        <div className="bg-[#f8faff] p-5 rounded-[20px] border border-blue-100 text-center mb-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                            <Store size={28} className="mx-auto text-blue-400 mb-2.5 relative z-10"/>
                            <label className="block text-[12px] font-black text-blue-900 mb-3 relative z-10">เลือกสาขาที่ทำรายการ</label>
                            <div className="flex gap-2 justify-center relative z-10">
                                {availableBranches.map(b => (
                                    <button key={b} type="button" onClick={() => setPaymentBranch(b)} className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${paymentBranch === b ? 'bg-blue-500 border-blue-600 text-white shadow-md' : 'bg-white border-blue-200 text-blue-600 hover:border-blue-400'}`}>
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-5">
                            <button onClick={() => setPaymentMethod('transfer')} className={`p-4 rounded-[16px] border-2 flex flex-col items-center justify-center gap-2.5 transition-all ${paymentMethod === 'transfer' ? 'bg-indigo-50/50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50/30'}`}>
                                <QrCode size={24} className={paymentMethod === 'transfer' ? 'text-indigo-600' : 'text-gray-400'}/>
                                <span className="text-[11px] font-bold text-center">โอนเงิน / QR</span>
                            </button>
                            <button onClick={() => setPaymentMethod('branch')} className={`p-4 rounded-[16px] border-2 flex flex-col items-center justify-center gap-2.5 transition-all ${paymentMethod === 'branch' ? 'bg-teal-50/50 border-teal-500 text-teal-700 shadow-sm' : 'bg-white border-gray-100 text-gray-500 hover:border-teal-200 hover:bg-teal-50/30'}`}>
                                <Store size={24} className={paymentMethod === 'branch' ? 'text-teal-600' : 'text-gray-400'}/>
                                <span className="text-[11px] font-bold text-center">ชำระที่สาขา</span>
                            </button>
                            <button 
                                onClick={() => {
                                    if (totalInternalCredit >= shopModal.price) {
                                        setPaymentMethod('credit');
                                    } else {
                                        showToast('เครดิตไม่เพียงพอ');
                                    }
                                }} 
                                className={`p-4 rounded-[16px] border-2 flex flex-col items-center justify-center gap-2.5 transition-all ${paymentMethod === 'credit' ? 'bg-amber-50/50 border-amber-500 text-amber-700 shadow-sm' : 'bg-white border-gray-100 text-gray-500 hover:border-amber-200 hover:bg-amber-50/30'}`}
                            >
                                <Banknote size={24} className={paymentMethod === 'credit' ? 'text-amber-600' : 'text-gray-400'}/>
                                <span className="text-[11px] font-bold text-center">หักเครดิต</span>
                            </button>
                        </div>

                        {paymentMethod === 'transfer' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <div className="bg-[#f8faff] p-6 rounded-[20px] border border-indigo-100 text-center mb-4 relative overflow-hidden">
                                    <p className="text-[11px] font-bold text-gray-500 mb-2">โอนเงินเข้าบัญชี</p>
                                    {(() => {
                                        const ppInfo = PROMPTPAY_CONFIG[paymentBranch] || PROMPTPAY_CONFIG['สาขาเฉวง'];
                                        return (
                                            <>
                                                <p className="text-2xl font-mono font-black text-indigo-700 tracking-wider mb-1.5">{ppInfo.id.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</p>
                                                <p className="text-[13px] font-black text-indigo-900 mb-4">{ppInfo.name}</p>
                                                
                                                {/* 🌟 QR Code สำหรับโอนเงินพร้อมยอดชำระ 🌟 */}
                                                {shopModal.price > 0 && (
                                                    <div className="bg-white p-3 rounded-[20px] border border-indigo-100 shadow-sm mx-auto w-44 h-44 mb-4 flex items-center justify-center relative">
                                                        <img src={`https://promptpay.io/${ppInfo.id}/${shopModal.price}.png`} alt="PromptPay QR" className="w-full h-full object-contain" />
                                                    </div>
                                                )}

                                                <button onClick={() => {
                                                    navigator.clipboard.writeText(ppInfo.id.replace(/-/g, ''));
                                                    showToast('คัดลอกเลขบัญชีแล้ว');
                                                }} className="text-[11px] text-indigo-600 font-bold flex items-center justify-center mx-auto bg-white px-5 py-2.5 rounded-xl border border-indigo-200 shadow-sm hover:bg-indigo-50 active:scale-95 transition-all">
                                                    <Copy size={14} className="mr-1.5"/> คัดลอกเลขบัญชี
                                                </button>
                                            </>
                                        )
                                    })()}
                                </div>

                                <div className="border-2 border-dashed border-gray-200 rounded-[20px] p-6 text-center hover:bg-gray-50 hover:border-indigo-300 transition-colors relative cursor-pointer bg-white">
                                    <input type="file" accept="image/*" onChange={handleSlipChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {slipImage ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-32 rounded-xl overflow-hidden border border-gray-200 mb-3 shadow-sm">
                                                <img src={slipImage} alt="slip" className="w-full h-full object-cover"/>
                                            </div>
                                            <p className="text-[11px] font-bold text-teal-600 flex items-center bg-teal-50 px-3 py-1.5 rounded-lg"><CheckCircle size={14} className="mr-1.5"/> แนบสลิปแล้ว (แตะเปลี่ยน)</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3"><Upload size={20} className="text-gray-400"/></div>
                                            <p className="text-[13px] font-black text-gray-800 mb-1">แนบรูปสลิปโอนเงิน</p>
                                            <p className="text-[10px] font-medium text-gray-400">รองรับ JPG, PNG</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'branch' && (
                            <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-teal-50 rounded-[16px] border border-teal-100 text-center mt-4">
                                <p className="text-[11px] text-teal-700 font-bold">
                                    กรุณาชำระเงินที่เคาน์เตอร์สาขา <span className="font-black">"{paymentBranch}"</span>
                                </p>
                            </div>
                        )}
                        {paymentMethod === 'credit' && (
                            <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-amber-50 rounded-[16px] border border-amber-100 text-center mt-4">
                                <p className="text-[11px] text-amber-700 font-bold">
                                    ระบบจะหักเครดิต และบันทึกยอดเข้าสาขา <span className="font-black">"{paymentBranch}"</span>
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={handleBalancePaymentSubmit}
                            disabled={isSubmittingOrder}
                            className="w-full mt-5 bg-red-500 text-white py-4 rounded-xl font-black text-sm shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center"
                        >
                            {isSubmittingOrder ? <Loader2 size={18} className="animate-spin mr-2"/> : <Lock size={16} className="mr-2"/>}
                            {isSubmittingOrder ? 'กำลังดำเนินการ...' : 'แจ้งโอนเงิน/ยืนยัน'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
