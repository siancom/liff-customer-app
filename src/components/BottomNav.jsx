import React from 'react';
import { Ticket, Store, Calendar, Receipt, Gift, User, QrCode } from 'lucide-react';

const BottomNav = ({ activeNav, setActiveNav, openPaymentModal }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe z-[100] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center px-1 py-1 h-[70px] relative">
        
        {/* Left Side */}
        <button onClick={() => setActiveNav('home')} className={`flex flex-col items-center justify-center w-full space-y-1 transition-all ${activeNav === 'home' ? 'text-teal-500 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
          <Ticket size={22} strokeWidth={activeNav === 'home' ? 2.5 : 2} />
          <span className="text-[9px] font-bold">คอร์สฉัน</span>
        </button>
        <button onClick={() => setActiveNav('shop')} className={`flex flex-col items-center justify-center w-full space-y-1 transition-all ${activeNav === 'shop' ? 'text-teal-500 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
          <Store size={22} strokeWidth={activeNav === 'shop' ? 2.5 : 2} />
          <span className="text-[9px] font-bold">ช้อปปิ้ง</span>
        </button>
        <button onClick={() => setActiveNav('booking')} className={`flex flex-col items-center justify-center w-full space-y-1 transition-all ${activeNav === 'booking' ? 'text-teal-500 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
          <Calendar size={22} strokeWidth={activeNav === 'booking' ? 2.5 : 2} />
          <span className="text-[9px] font-bold">จองคิว</span>
        </button>

        {/* Center Big Button (Pay) */}
        <div className="flex justify-center w-full relative">
          <button 
            onClick={openPaymentModal}
            className="absolute -top-10 bg-gradient-to-tr from-teal-500 to-emerald-400 w-16 h-16 rounded-full flex flex-col items-center justify-center text-white shadow-lg shadow-teal-500/40 border-[4px] border-white active:scale-95 transition-all"
          >
            <QrCode size={24} strokeWidth={2.5} />
          </button>
          <span className="text-[9px] font-bold text-gray-700 absolute -bottom-7">จ่ายเงิน</span>
        </div>

        {/* Right Side */}
        <button onClick={() => setActiveNav('orders')} className={`flex flex-col items-center justify-center w-full space-y-1 transition-all ${activeNav === 'orders' ? 'text-teal-500 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
          <Receipt size={22} strokeWidth={activeNav === 'orders' ? 2.5 : 2} />
          <span className="text-[9px] font-bold">คำสั่งซื้อ</span>
        </button>
        <button onClick={() => setActiveNav('gamification')} className={`flex flex-col items-center justify-center w-full space-y-1 transition-all ${activeNav === 'gamification' ? 'text-teal-500 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
          <Gift size={22} strokeWidth={activeNav === 'gamification' ? 2.5 : 2} />
          <span className="text-[9px] font-bold">แลกรางวัล</span>
        </button>
        <button onClick={() => setActiveNav('profile')} className={`flex flex-col items-center justify-center w-full space-y-1 transition-all ${activeNav === 'profile' ? 'text-teal-500 scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
          <User size={22} strokeWidth={activeNav === 'profile' ? 2.5 : 2} />
          <span className="text-[9px] font-bold">โปรไฟล์</span>
        </button>

      </div>
    </div>
  );
};

export default BottomNav;
