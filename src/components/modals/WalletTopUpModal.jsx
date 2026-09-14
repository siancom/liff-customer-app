import React, { useState } from 'react';
import { X, ArrowDownToLine, Banknote, Upload, CheckCircle, Copy, Loader2, AlertCircle } from 'lucide-react';
import { getFuzzyKey } from '../../utils/helpers';
import { addDoc } from 'firebase/firestore';

export default function WalletTopUpModal({
    isOpen,
    setIsOpen,
    customerData,
    selectedBranch,
    availableBranches,
    PROMPTPAY_CONFIG,
    showToast,
    isActionLoading,
    setIsActionLoading,
    getAppCollection,
    onTopUpSuccess
}) {
    const [amount, setAmount] = useState('');
    const [slipImage, setSlipImage] = useState(null);
    const predefinedAmounts = [500, 1000, 3000, 5000, 10000];

    const handleSlipChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSlipImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTopUpSubmit = async (e) => {
        e.preventDefault();
        const topUpAmount = parseFloat(amount);
        
        if (!topUpAmount || topUpAmount <= 0) {
            showToast("กรุณาระบุจำนวนเงินที่ต้องการเติม");
            return;
        }
        
        if (!slipImage) {
            showToast("กรุณาแนบรูปสลิปการโอนเงิน");
            return;
        }

        try {
            setIsActionLoading(true);
            const orderNo = `TU${Date.now().toString().slice(-6)}`;
            
            const orderData = {
               orderNo,
               customerName: getFuzzyKey(customerData, "ชื่อ") || customerData.name || '',
               customerPhone: getFuzzyKey(customerData, "เบอร์โทร") || customerData.cleanPhone || '',
               itemType: 'topup',
               itemName: `เติมเครดิต (Wallet Top-up)`,
               originalPrice: topUpAmount,
               discountAmount: 0,
               itemPrice: topUpAmount, 
               paymentMethod: 'transfer',
               status: 'รอตรวจสอบ',
               slipImage: slipImage,
               shippingAddress: '',
               createdAt: new Date().toISOString(),
               source: 'Wallet_TopUp',
               branch: selectedBranch,
               customer_note: `เติมเครดิตเข้าบัญชี`
            };

            await addDoc(getAppCollection('orders'), orderData);
            
            // 🌟 ออกใบเสร็จทันที (สถานะรอตรวจสอบ — รอแอดมินอนุมัติสลิป)
            if (onTopUpSuccess) {
                onTopUpSuccess({
                    type: 'topup',
                    amount: topUpAmount,
                    refNo: orderNo,
                    date: new Date().toLocaleDateString('th-TH'),
                    time: new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    detail: `แจ้งเติมเครดิต (${selectedBranch}) — รอแอดมินตรวจสอบสลิป`,
                    status: 'pending',
                    customerName: getFuzzyKey(customerData, "ชื่อ") || customerData.name || ''
                });
            }
            
            showToast("ส่งคำขอเติมเครดิตเรียบร้อยแล้ว รอแอดมินตรวจสอบสลิปค่ะ");
            setIsOpen(false);
            setAmount('');
            setSlipImage(null);
        } catch (err) {
            showToast("เกิดข้อผิดพลาด: " + err.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (!isOpen) return null;

    const ppInfo = PROMPTPAY_CONFIG[selectedBranch] || PROMPTPAY_CONFIG['สาขาเฉวง'];
    const currentAmount = parseFloat(amount) || 0;

    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-gray-50 w-full sm:max-w-md h-[90vh] sm:h-auto max-h-[90vh] overflow-hidden rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col animate-in slide-in-from-bottom-full sm:zoom-in-95">
                
                <div className="bg-white p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-black text-gray-900 flex items-center"><ArrowDownToLine size={20} className="mr-2 text-teal-600"/> เติมเครดิต (Top-up)</h2>
                    <button onClick={() => setIsOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar p-5 pb-10">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                        <label className="block text-[11px] font-black text-gray-800 mb-3 flex items-center"><Banknote size={14} className="mr-1.5 text-teal-500"/> ระบุจำนวนเงินที่ต้องการเติม</label>
                        <div className="relative mb-4">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">฿</span>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xl font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {predefinedAmounts.map(amt => (
                                <button 
                                    key={amt}
                                    onClick={() => setAmount(amt.toString())}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${amount === amt.toString() ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'}`}
                                >
                                    +{amt.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#f8faff] p-6 rounded-[20px] border border-indigo-100 text-center mb-4 relative overflow-hidden">
                        
                        <p className="text-[11px] font-bold text-gray-500 mb-2">โอนเงินเข้าบัญชี</p>
                        <p className="text-2xl font-mono font-black text-indigo-700 tracking-wider mb-1.5">{ppInfo.id.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</p>
                        <p className="text-[13px] font-black text-indigo-900 mb-4">{ppInfo.name}</p>
                        
                        {currentAmount > 0 && (
                            <div className="bg-white p-3 rounded-[20px] border border-indigo-100 shadow-sm mx-auto w-44 h-44 mb-4 flex items-center justify-center relative">
                                <img src={`https://promptpay.io/${ppInfo.id}/${currentAmount}.png`} alt="PromptPay QR" className="w-full h-full object-contain" />
                            </div>
                        )}

                        <button onClick={() => {
                            navigator.clipboard.writeText(ppInfo.id.replace(/-/g, ''));
                            showToast('คัดลอกเลขบัญชีแล้ว');
                        }} className="text-[11px] text-indigo-600 font-bold flex items-center justify-center mx-auto bg-white px-5 py-2.5 rounded-xl border border-indigo-200 shadow-sm hover:bg-indigo-50 active:scale-95 transition-all">
                            <Copy size={14} className="mr-1.5"/> คัดลอกเลขบัญชี
                        </button>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative cursor-pointer bg-white">
                        <input type="file" accept="image/*" onChange={handleSlipChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {slipImage ? (
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-28 rounded-lg overflow-hidden border border-gray-200 mb-3 shadow-sm">
                                    <img src={slipImage} alt="slip" className="w-full h-full object-cover"/>
                                </div>
                                <p className="text-xs font-bold text-teal-600 flex items-center"><CheckCircle size={14} className="mr-1"/> แนบสลิปแล้ว (แตะเพื่อเปลี่ยน)</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100 shadow-sm"><Upload size={20} className="text-gray-400"/></div>
                                <p className="text-sm font-bold text-gray-700 mb-1">แนบรูปสลิปโอนเงิน</p>
                                <p className="text-[10px] text-gray-500">เพื่อยืนยันการเติมเครดิต</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border-t border-gray-100 p-4 pb-safe shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
                    <button 
                        onClick={handleTopUpSubmit}
                        disabled={isActionLoading || !slipImage || !amount}
                        className={`w-full py-3.5 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center ${isActionLoading || !slipImage || !amount ? 'bg-gray-300 text-gray-500 shadow-none' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/30 hover:opacity-90'}`}
                    >
                        {isActionLoading ? <Loader2 size={18} className="animate-spin mr-2"/> : <ArrowDownToLine size={18} className="mr-2"/>}
                        {isActionLoading ? 'กำลังส่งข้อมูล...' : 'แจ้งโอนเงินและเติมเครดิต'}
                    </button>
                </div>
            </div>
        </div>
    );
}
