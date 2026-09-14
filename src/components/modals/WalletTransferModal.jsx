import React, { useState } from 'react';
import { X, Send, Search, User, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle, Smartphone, QrCode } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, addDoc } from 'firebase/firestore';
import { getFuzzyKey, parseNumber } from '../../utils/helpers';

export default function WalletTransferModal({
    isOpen,
    setIsOpen,
    customerData,
    selectedBranch,
    totalInternalCredit,
    showToast,
    isActionLoading,
    setIsActionLoading,
    getAppCollection,
    getAppDoc,
    onTransferSuccess
}) {
    const [step, setStep] = useState(1); // 1 = input phone, 2 = confirm
    const [targetPhone, setTargetPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [targetCustomer, setTargetCustomer] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    
    useEffect(() => {
        let html5QrcodeScanner;
        if (isScanning) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: {width: 250, height: 250} },
                /* verbose= */ false
            );
            html5QrcodeScanner.render(
                (decodedText) => {
                    try {
                        const data = JSON.parse(decodedText);
                        if (data.type === 'credit_pay' && data.phone) {
                            setTargetPhone(data.phone);
                            setIsScanning(false);
                            html5QrcodeScanner.clear();
                        } else {
                            showToast('QR Code ไม่รองรับ');
                        }
                    } catch (e) {
                        showToast('QR Code ไม่ถูกต้อง');
                    }
                },
                (error) => {}
            );
        }
        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
            }
        };
    }, [isScanning]);

    const handleSearchTarget = async (e) => {
        e.preventDefault();
        
        const cleanPhoneInput = targetPhone.replace(/[^0-9]/g, '');
        if (cleanPhoneInput.length < 9) {
            showToast("กรุณาระบุเบอร์โทรศัพท์ให้ถูกต้อง");
            return;
        }

        if (cleanPhoneInput === customerData.cleanPhone) {
            showToast("ไม่สามารถโอนให้ตัวเองได้");
            return;
        }

        const transferAmt = parseFloat(amount);
        if (!transferAmt || transferAmt <= 0) {
            showToast("กรุณาระบุจำนวนเงินที่ต้องการโอน");
            return;
        }

        if (transferAmt > totalInternalCredit) {
            showToast("เครดิตของคุณไม่เพียงพอ");
            return;
        }

        setIsSearching(true);
        try {
            const q = query(getAppCollection('customers'), where('cleanPhone', '==', cleanPhoneInput));
            const snap = await getDocs(q);
            
            if (snap.empty) {
                showToast("ไม่พบผู้ใช้งานเบอร์นี้ในระบบ");
                setTargetCustomer(null);
                return;
            }

            const docData = snap.docs[0].data();
            const rawName = getFuzzyKey(docData, "ชื่อ") || "ไม่มีชื่อ";
            
            // Mask name (e.g. สมหญิง ส. -> สม****)
            let maskedName = rawName;
            if (rawName.length > 3) {
                maskedName = rawName.substring(0, 2) + "***" + (rawName.includes(' ') ? rawName.split(' ')[1].substring(0,1) + "." : "");
            }

            setTargetCustomer({
                id: snap.docs[0].id,
                name: rawName,
                maskedName: maskedName,
                phone: cleanPhoneInput
            });
            
            setStep(2);
        } catch (err) {
            showToast("เกิดข้อผิดพลาดในการค้นหาผู้รับ");
        } finally {
            setIsSearching(false);
        }
    };

    const handleConfirmTransfer = async () => {
        if (!targetCustomer) return;
        const transferAmt = parseFloat(amount);
        if (transferAmt > totalInternalCredit) {
            showToast("เครดิตของคุณไม่เพียงพอ");
            return;
        }

        setIsActionLoading(true);
        try {
            // 1. Deduct from Sender (Add history)
            // We need to find an active course to deduct from.
            const activeCourse = customerData.courses.find(c => c.status === 'ยังคงเหลือ' || (c.computedRemainCredit && c.computedRemainCredit > 0));
            
            if (!activeCourse) {
                throw new Error("ไม่พบคอร์สเครดิตที่สามารถหักได้");
            }

            const courseId = getFuzzyKey(activeCourse, ["เลขที่ใบคอส", "รหัส", "รหัสคอร์ส", "col_2"]);
            
            const senderHistoryEntry = {
                "วันที่": new Date().toLocaleDateString('th-TH'),
                "เวลา": new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                "ชื่อลูกค้า": getFuzzyKey(customerData, "ชื่อ") || customerData.name || '',
                "เบอร์โทร": getFuzzyKey(customerData, "เบอร์โทร") || customerData.cleanPhone || '',
                "cleanPhone": customerData.cleanPhone,
                "เลขที่ใบคอส": courseId,
                "ประเภท": "หักเครดิต",
                "ยอดเงิน": String(transferAmt),
                "รายละเอียด": `โอนให้เบอร์ ${targetCustomer.phone}`,
                "สาขา": selectedBranch || "สำนักงานใหญ่",
                "transactionType": "transfer",
                "timestamp": new Date().toISOString()
            };

            // 2. Add to Receiver (เปลี่ยนจาก courses → histories เพื่อไม่สร้างใบคอร์ส)
            const receiverHistoryEntry = {
                "วันที่": new Date().toLocaleDateString('th-TH'),
                "เวลา": new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                "ชื่อลูกค้า": targetCustomer.name || '',
                "เบอร์โทร": targetCustomer.phone,
                "cleanPhone": targetCustomer.phone,
                "ประเภท": "รับเครดิต",
                "ยอดเงิน": String(transferAmt),
                "รายละเอียด": `รับโอนจากเบอร์ ${customerData.cleanPhone}`,
                "สาขา": selectedBranch || "สำนักงานใหญ่",
                "transactionType": "transfer",
                "timestamp": new Date().toISOString()
            };

            const transferRefNo = `TR${Date.now().toString().slice(-8)}`;
            await addDoc(getAppCollection('histories'), senderHistoryEntry);
            await addDoc(getAppCollection('histories'), receiverHistoryEntry);

            if (onTransferSuccess) {
                await onTransferSuccess({
                    type: 'transfer',
                    amount: transferAmt,
                    refNo: transferRefNo,
                    date: new Date().toLocaleDateString('th-TH'),
                    time: new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    detail: `โอนให้เบอร์ ${targetCustomer.phone} (${targetCustomer.name || ''})`,
                    status: 'success',
                    customerName: getFuzzyKey(customerData, "ชื่อ") || customerData.name || ''
                });
            }

            showToast("โอนเครดิตสำเร็จ!");
            setIsOpen(false);
            
            // Reset state
            setTimeout(() => {
                setStep(1);
                setTargetPhone('');
                setAmount('');
                setTargetCustomer(null);
            }, 500);

        } catch (err) {
            showToast("เกิดข้อผิดพลาด: " + err.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-gray-50 w-full sm:max-w-md h-[90vh] sm:h-auto max-h-[90vh] overflow-hidden rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col animate-in slide-in-from-bottom-full sm:zoom-in-95">
                
                <div className="bg-white p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-black text-gray-900 flex items-center">
                        <Send size={20} className="mr-2 text-indigo-600"/> 
                        {step === 1 ? 'โอนเครดิต (Transfer)' : 'ยืนยันการโอน'}
                    </h2>
                    <button onClick={() => {
                        if (step === 2) setStep(1);
                        else setIsOpen(false);
                    }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar p-5 pb-10">
                    
                    {/* STEP 1: INPUT */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-indigo-50 p-4 rounded-2xl mb-6 border border-indigo-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-600 mb-0.5">ยอดเครดิตที่โอนได้</p>
                                    <p className="text-xl font-black text-indigo-900">฿{(totalInternalCredit || 0).toLocaleString()}</p>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                                    <ShieldCheck size={20} />
                                </div>
                            </div>

                            <form onSubmit={handleSearchTarget} className="space-y-4">
                                
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-black text-gray-800 flex items-center"><Smartphone size={14} className="mr-1.5 text-indigo-500"/> เบอร์โทรศัพท์ผู้รับ</label>
                                        <button type="button" onClick={() => setIsScanning(!isScanning)} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold flex items-center">
                                            <QrCode size={12} className="mr-1"/> {isScanning ? 'ปิดสแกน' : 'สแกน QR'}
                                        </button>
                                    </div>
                                    {isScanning ? (
                                        <div id="reader" className="w-full mb-3 rounded-xl overflow-hidden border border-indigo-100 bg-black"></div>
                                    ) : null}
                                    <div className="relative">
                                        <input 
                                            type="tel" 
                                            value={targetPhone}
                                            onChange={(e) => setTargetPhone(e.target.value)}
                                            placeholder="08X-XXX-XXXX"
                                            maxLength="12"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                </div><div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <label className="block text-xs font-black text-gray-800 mb-2">จำนวนเงินที่ต้องการโอน (บาท)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">฿</span>
                                        <input 
                                            type="number" 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-2xl font-black text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                    {parseFloat(amount) > totalInternalCredit && (
                                        <p className="text-xs text-red-500 mt-2 flex items-center"><AlertCircle size={12} className="mr-1"/> ยอดเงินไม่เพียงพอ</p>
                                    )}
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSearching || !targetPhone || !amount || parseFloat(amount) > totalInternalCredit}
                                    className={`w-full mt-4 py-3.5 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center ${isSearching || !targetPhone || !amount || parseFloat(amount) > totalInternalCredit ? 'bg-gray-300 text-gray-500 shadow-none' : 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700'}`}
                                >
                                    {isSearching ? <Loader2 size={18} className="animate-spin mr-2"/> : <Search size={18} className="mr-2"/>}
                                    {isSearching ? 'กำลังค้นหา...' : 'ตรวจสอบข้อมูล'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 2: CONFIRM */}
                    {step === 2 && targetCustomer && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6 text-center">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-md">
                                    <User size={32} className="text-indigo-400" />
                                </div>
                                <p className="text-xs text-gray-500 font-bold mb-1">โอนให้ (ผู้รับ)</p>
                                <h3 className="text-2xl font-black text-gray-900 mb-1">{targetCustomer.maskedName}</h3>
                                <p className="text-sm font-mono text-indigo-600">{targetCustomer.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</p>
                            </div>

                            <div className="bg-gray-100 rounded-2xl p-5 mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-gray-500 font-bold">จำนวนเงินที่โอน</span>
                                    <span className="text-2xl font-black text-indigo-600">฿{parseFloat(amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-xs text-gray-500">ค่าธรรมเนียม</span>
                                    <span className="text-xs font-bold text-gray-900">ฟรี</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleConfirmTransfer}
                                disabled={isActionLoading}
                                className={`w-full py-4 rounded-xl font-black text-base shadow-xl active:scale-95 transition-all flex items-center justify-center ${isActionLoading ? 'bg-gray-300 text-gray-500 shadow-none' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/30'}`}
                            >
                                {isActionLoading ? <Loader2 size={20} className="animate-spin mr-2"/> : <CheckCircle size={20} className="mr-2"/>}
                                {isActionLoading ? 'กำลังโอน...' : 'ยืนยันการโอนเงิน'}
                            </button>
                            
                            <button 
                                onClick={() => setStep(1)}
                                disabled={isActionLoading}
                                className="w-full py-3 mt-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
