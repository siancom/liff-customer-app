import React from 'react';
import { X, Gift } from 'lucide-react';

export default function WalletExchangeModal({ isOpen, setIsOpen }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md p-8 rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom-full sm:zoom-in-95">
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                    <X size={18} />
                </button>
                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4 border border-pink-100">
                    <Gift size={40} className="text-pink-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">แลกของรางวัล</h2>
                <p className="text-gray-500 font-medium mb-6">ฟีเจอร์นี้กำลังจะเปิดให้บริการเร็วๆ นี้<br/>สะสมเครดิตไว้เตรียมแลกของรางวัลสุดพิเศษได้เลยค่ะ!</p>
                <button onClick={() => setIsOpen(false)} className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    กลับหน้าหลัก
                </button>
            </div>
        </div>
    );
}
