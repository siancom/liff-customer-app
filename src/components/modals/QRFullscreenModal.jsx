import React from 'react';
import { X, QrCode } from 'lucide-react';
import { getFuzzyKey } from "../../utils/helpers";
import { QRCodeSVG } from 'qrcode.react';

const QRFullscreenModal = ({ showQRFullscreen, setShowQRFullscreen, showQR }) => {
    if (!showQRFullscreen || !showQR) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex justify-between items-center bg-gray-50 border-b border-gray-100 shrink-0">
                <h2 className="font-black text-gray-800 text-lg">สแกนเพื่อรับบริการ</h2>
                <button onClick={() => setShowQRFullscreen(false)} className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"><X size={20}/></button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white overflow-y-auto">
                <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-gray-100 mb-8 relative">
                    <div className="w-64 h-64 border-4 border-[#12B981] rounded-[24px] flex items-center justify-center p-4 relative overflow-hidden bg-white">
                        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#12b981,#12b981_10px,transparent_10px,transparent_20px)] opacity-5 absolute rounded-xl inset-0"></div>
                        <QRCodeSVG value={getFuzzyKey(showQR, "เลขที่ใบคอส") || getFuzzyKey(showQR, "รหัสคอส") || ''} size={180} className="relative z-10" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-5 py-1.5 rounded-full border border-gray-200 font-mono text-sm font-bold text-gray-600 shadow-sm whitespace-nowrap">
                        Ref: {getFuzzyKey(showQR, "เลขที่ใบคอส") || '-'}
                    </div>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{getFuzzyKey(showQR, "ชื่อคอส")}</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-4">แสดงหน้าจอนี้ให้พนักงานสาขาเพื่อรับบริการ<br/>หรือใช้สำหรับตัดยอดคอร์ส/ยอดเงินของคุณ</p>
                <button onClick={() => setShowQRFullscreen(false)} className="mt-8 bg-gray-100 text-gray-700 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all">
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
    );
};

export default QRFullscreenModal;
