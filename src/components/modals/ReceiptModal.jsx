import React, { useRef, useState } from 'react';
import { X, CheckCircle, Clock, Download, ReceiptText, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

// 🌟 ReceiptModal — ใบเสร็จรับเงินแบบ TrueWallet แสดงทันทีหลังทำธุรกรรม 🌟
// receiptData: { type, amount, refNo, date, time, detail, status, customerName }
// type: 'transfer' | 'topup' | 'balance_pay' | 'receive'
// status: 'success' | 'pending'
export default function ReceiptModal({ isOpen, onClose, receiptData }) {
    const receiptRef = useRef(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen || !receiptData) return null;

    const isSuccess = (receiptData.status || 'success') !== 'pending';
    const typeLabel = {
        transfer: 'โอนเครดิต',
        topup: 'เติมเครดิต',
        balance_pay: 'จ่ายเครดิต',
        receive: 'รับเครดิต',
    }[receiptData.type] || 'ธุรกรรมเครดิต';

    const handleDownload = async () => {
        if (!receiptRef.current) return;
        try {
            setIsDownloading(true);
            const canvas = await html2canvas(receiptRef.current, {
                scale: 3, 
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const image = canvas.toDataURL("image/jpeg", 0.9);
            setGeneratedImage(image);
            
            // Try automatic download for environments that support it
            const a = document.createElement('a');
            a.href = image;
            a.download = `receipt-${receiptData.refNo || Date.now()}.jpg`;
            a.click();
        } catch (e) {
            console.warn('Download receipt error:', e);
            alert('ไม่สามารถบันทึกภาพได้ กรุณาแคปหน้าจอแทน');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[120] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95">

                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div ref={receiptRef} className="flex-1 overflow-y-auto">
                    {/* Header */}
                    <div className={`p-6 text-center text-white relative overflow-hidden ${isSuccess ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
                        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md mb-3 shadow-inner">
                                {isSuccess ? <CheckCircle size={36} className="text-white" /> : <Clock size={36} className="text-white" />}
                            </div>
                            <h2 className="text-lg font-black tracking-wide flex items-center justify-center gap-1.5">
                                <ReceiptText size={18} /> ใบเสร็จรับเงิน
                            </h2>
                            <p className="text-[11px] opacity-90 mt-0.5 font-medium">{isSuccess ? 'ทำรายการสำเร็จ' : 'รอตรวจสอบยอด'}</p>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="px-6 pt-5 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">จำนวนเงิน</p>
                        <p className={`text-4xl font-black ${isSuccess ? 'text-emerald-600' : 'text-amber-600'}`}>
                            ฿{Number(receiptData.amount || 0).toLocaleString()}
                        </p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black ${isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {typeLabel}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="px-6 py-5 space-y-2.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400 font-bold">เลขที่ใบเสร็จ</span>
                            <span className="text-gray-800 font-mono font-black">{receiptData.refNo || '-'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400 font-bold">วันที่</span>
                            <span className="text-gray-800 font-bold">{receiptData.date || '-'} {receiptData.time || ''}</span>
                        </div>
                        {receiptData.customerName && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400 font-bold">ลูกค้า</span>
                                <span className="text-gray-800 font-bold">{receiptData.customerName}</span>
                            </div>
                        )}
                        {receiptData.detail && (
                            <div className="flex justify-between text-xs gap-3">
                                <span className="text-gray-400 font-bold shrink-0">รายละเอียด</span>
                                <span className="text-gray-800 font-bold text-right">{receiptData.detail}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xs pt-2 border-t border-dashed border-gray-200">
                            <span className="text-gray-400 font-bold">สถานะ</span>
                            <span className={`font-black ${isSuccess ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {isSuccess ? 'สำเร็จ' : 'รอตรวจสอบ'}
                            </span>
                        </div>
                    </div>

                    {/* Footer note */}
                    <div className="px-6 pb-2">
                        <p className="text-[9px] text-gray-300 text-center leading-relaxed">
                            ใบเสร็จอิเล็กทรอนิกส์นี้ออกโดยระบบอัตโนมัติ<br/>Iris Clinic — ขอบคุณที่ใช้บริการค่ะ
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-2">
                    <button onClick={handleDownload} disabled={isDownloading} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-black hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50">
                        {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                        {isDownloading ? 'กำลังสร้างรูป...' : 'บันทึกใบเสร็จ'}
                    </button>
                    <button onClick={onClose} className={`flex-1 py-3 rounded-xl text-xs font-black text-white shadow-md active:scale-95 transition-all ${isSuccess ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90'}`}>
                        เสร็จสิ้น
                    </button>
                </div>
            </div>

            {/* Generated Image Overlay for Mobile (LIFF) */}
            {generatedImage && (
                <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-4 animate-in fade-in">
                    <button onClick={() => setGeneratedImage(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <X size={20} />
                    </button>
                    <p className="text-white font-bold mb-4 animate-pulse">แตะค้างที่รูปภาพเพื่อบันทึกใบเสร็จ</p>
                    <img src={generatedImage} alt="Receipt" className="max-w-full max-h-[75vh] rounded-xl shadow-2xl object-contain" />
                    <button onClick={() => setGeneratedImage(null)} className="mt-8 px-8 py-3 bg-white text-gray-900 font-black rounded-full active:scale-95 transition-transform shadow-lg">
                        ปิดหน้าต่างนี้
                    </button>
                </div>
            )}
        </div>
    );
}

