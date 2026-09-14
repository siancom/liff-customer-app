import React, { useState } from 'react';
import { CalendarPlus, CalendarDays, QrCode, ChevronRight, TicketCheck, Ticket, Eye, EyeOff } from 'lucide-react';
import { getFuzzyKey } from '../utils/helpers';

const Booking = ({
    openBookingModal,
    myBookings,
    setGeneratedTicket,
    setBookingStep,
    setBookingCourse,
    setIsBookingModalOpen,
    setShowCancelConfirm,
    setBookingError,
    activeCourses
}) => {
    const [showPastTickets, setShowPastTickets] = useState(false);

    const todayStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD
    const visibleBookings = myBookings.filter(bk => {
        if (showPastTickets) return true;
        if (!bk.date) return true;
        
        try {
           const bkDateStr = new Date(bk.date).toLocaleDateString('en-CA');
           return bkDateStr >= todayStr;
        } catch (e) {
           return true;
        }
    });
    const getStatusTheme = (stRaw) => {
        const st = String(stRaw || '').trim();
        if (st === 'รอการยืนยัน' || st === 'รอเข้ารับบริการ') {
            return { border: 'border-amber-200 shadow-amber-100/50', bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-600', qr: 'text-amber-500' };
        }
        if (st === 'ยืนยันแล้ว') {
            return { border: 'border-blue-200 shadow-blue-100/50', bar: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-600', qr: 'text-blue-500' };
        }
        if (st === 'กำลังใช้บริการ') {
            return { border: 'border-purple-300 shadow-purple-100/50 ring-2 ring-purple-50', bar: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-600', qr: 'text-purple-500' };
        }
        if (st === 'เสร็จสิ้น') {
            return { border: 'border-emerald-200 shadow-emerald-100/50', bar: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600', qr: 'text-emerald-500' };
        }
        if (st.includes('ยกเลิก')) {
            return { border: 'border-gray-200 opacity-75', bar: 'bg-gray-300', badge: 'bg-gray-50 text-gray-500 border-gray-200', text: 'text-gray-500 line-through', qr: 'text-gray-300' };
        }
        return { border: 'border-indigo-100', bar: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', text: 'text-indigo-600', qr: 'text-indigo-500' };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <button onClick={() => openBookingModal()} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-[24px] shadow-lg shadow-blue-500/30 flex items-center justify-between hover:opacity-90 active:scale-95 transition-all border border-blue-400">
                    <div className="flex items-center">
                    <div className="bg-white/20 p-2.5 rounded-xl mr-3"><CalendarPlus size={24} /></div>
                    <div className="text-left">
                        <p className="font-black text-base leading-tight">จองคิวบริการ</p>
                        <p className="text-[10px] font-medium opacity-90 tracking-wide mt-0.5">ทำหน้า, กดสิว, ซื้อคอร์สใหม่, บริการอื่นๆ</p>
                    </div>
                    </div>
                    <ChevronRight size={24} className="opacity-70" />
                </button>
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-black text-gray-800 flex items-center">
                        <CalendarDays size={18} className="mr-2 text-indigo-500"/> ตั๋วนัดหมาย (E-Ticket)
                    </h2>
                    <button 
                        onClick={() => setShowPastTickets(!showPastTickets)}
                        className="flex items-center text-[10px] font-bold text-gray-500 hover:text-indigo-600 bg-white px-2 py-1 rounded-full border shadow-sm transition-colors"
                    >
                        {showPastTickets ? <><EyeOff size={12} className="mr-1"/> ซ่อนที่ผ่านมา</> : <><Eye size={12} className="mr-1"/> ดูที่ผ่านมา</>}
                    </button>
                </div>
                
                {visibleBookings.length > 0 ? (
                    <div className="space-y-3">
                    {visibleBookings.map((bk, i) => {
                        const theme = getStatusTheme(bk.status);
                        return (
                        <div 
                            key={i} 
                            onClick={() => { setGeneratedTicket(bk); setBookingStep(2); setBookingCourse(null); setIsBookingModalOpen(true); setShowCancelConfirm(false); setBookingError(''); }}
                            className={`bg-white rounded-2xl border cursor-pointer hover:shadow-md transition-all ${theme.border} shadow-sm overflow-hidden flex flex-col relative`}
                        >
                            <div className="flex relative">
                                <div className={`w-3 ${theme.bar}`}></div>
                                <div className="p-4 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${theme.badge}`}>{bk.status === 'รอเข้ารับบริการ' ? 'รอการยืนยัน' : bk.status}</span>
                                    <span className="font-mono text-[10px] text-gray-400 font-bold">{bk.ticketNo}</span>
                                </div>
                                <h4 className={`font-black text-sm mb-2 ${theme.text}`}>{bk.courseName}</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs items-end">
                                    <div className="pb-0.5"><p className="text-gray-400 font-bold text-[9px] uppercase">วันที่</p><p className="font-bold text-gray-800">{new Date(bk.date).toLocaleDateString('th-TH')}</p></div>
                                    <div><p className="text-gray-400 font-bold text-[9px] uppercase mb-0.5">เวลา</p><p className={`text-xl sm:text-2xl font-black tracking-tight leading-none ${theme.text.split(' ')[0]}`}>{bk.time} <span className="text-[10px] font-bold opacity-70 tracking-normal">น.</span></p></div>
                                </div>
                                </div>
                                <div className="w-12 bg-gray-50 flex items-center justify-center border-l border-gray-100 border-dashed">
                                <QrCode size={20} className={theme.qr} />
                                </div>
                            </div>
                            {bk.status === 'รอเข้ารับบริการ' && (
                                <div className="bg-amber-50 hover:bg-amber-100 cursor-pointer transition-colors text-amber-600 text-[10px] font-bold py-2 text-center border-t border-amber-100 flex items-center justify-center rounded-b-2xl -mt-2 pt-3">
                                คลิกเพื่อแสดง QR / เลื่อนจอง / ยกเลิกคิว <ChevronRight size={12} className="ml-1" />
                                </div>
                            )}
                        </div>
                        );
                    })}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 text-center shadow-sm">
                    <TicketCheck size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-xs text-gray-500 font-bold">ท่านยังไม่มีตั๋วนัดหมายบริการ</p>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-sm font-black text-gray-800 flex items-center mb-3">
                    <Ticket size={18} className="mr-2 text-teal-500"/> หรือเลือกจากคอร์สที่มีอยู่
                </h2>
                {activeCourses.length > 0 ? (
                    <div className="space-y-3">
                    {activeCourses.map((course, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-teal-300 transition-colors cursor-pointer" onClick={() => openBookingModal(course)}>
                            <div className="pr-4">
                                <h4 className="font-black text-sm text-gray-800 line-clamp-1">{getFuzzyKey(course, "ชื่อคอส")}</h4>
                                <p className="text-[10px] text-teal-600 font-bold mt-1">คงเหลือ {course.remaining} ครั้ง</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                <CalendarPlus size={16} className="text-teal-600" />
                            </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 font-bold text-center mt-4">ไม่มีคอร์สคงเหลือให้จอง</p>
                )}
            </div>
        </div>
    );
};

export default Booking;
