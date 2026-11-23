import React, { useState } from 'react';
import { 
    CalendarPlus, 
    CalendarDays, 
    QrCode, 
    ChevronRight, 
    TicketCheck, 
    Ticket, 
    Eye, 
    EyeOff, 
    Sparkles, 
    ShoppingBag, 
    ArrowRight, 
    X, 
    ExternalLink, 
    Award,
    Zap,
    Layers,
    ShieldCheck,
    Flame,
    Tag
} from 'lucide-react';
import { getFuzzyKey } from '../utils/helpers';
import BookingCountdown from '../components/BookingCountdown';

const COURSE_CATEGORY_BANNERS = [
    {
        id: 'facial',
        tab: 'courses',
        title: 'ทรีทเม้นท์ผิวหน้า',
        subtitle: '10 โปรแกรม (A - J)',
        badge: 'ยอดนิยมอันดับ 1',
        desc: 'นวดหน้าใส • ดูดสิว • RF • นาโนไวท์',
        priceTag: 'เริ่มต้น ฿399.-',
        gradient: 'from-[#ec4899] via-[#f43f5e] to-[#fb923c]',
        shadow: 'shadow-rose-500/25',
        code: 'A - J'
    },
    {
        id: 'acne_clear',
        tab: 'courses',
        title: 'เคลียร์สิว & สิวเสี้ยน',
        subtitle: 'สูตรจบปัญหาสิว',
        badge: 'ขายดีประจำคลินิก',
        desc: 'กดสิวทั่วหน้า • โอโซนร้อน • มาร์คคาเวียร์',
        priceTag: 'เริ่มต้น ฿349.-',
        gradient: 'from-[#0d9488] via-[#059669] to-[#06b6d4]',
        shadow: 'shadow-teal-500/25',
        code: 'ACNE CLEAR'
    },
    {
        id: 'machine',
        tab: 'single_courses',
        title: 'ลงเครื่องรายครั้ง (Add-on)',
        subtitle: 'เสริมการดูแลเฉพาะจุด',
        badge: 'ปรับจำนวนครั้งได้',
        desc: 'สกินสครับ • โอโซน • ไครโอ • เมโสผลักยา',
        priceTag: 'เริ่มต้น ฿100.- / ครั้ง',
        gradient: 'from-[#6366f1] via-[#7c3aed] to-[#8b5cf6]',
        shadow: 'shadow-indigo-500/25',
        code: 'MACHINE'
    },
    {
        id: 'acne_sets',
        tab: 'courses',
        title: 'รักษาสิว & ฝ้ากระ',
        subtitle: 'ฟื้นฟูผิวขั้นลึก',
        badge: 'ดูแลต่อเนื่อง 1 ปี',
        desc: 'Active Skin • ปรับสภาพผิว • เซ็ตสิว/ฝ้าลึก',
        priceTag: 'เริ่มต้น ฿1,999.-',
        gradient: 'from-[#d97706] via-[#ea580c] to-[#e11d48]',
        shadow: 'shadow-amber-500/25',
        code: 'INTENSIVE'
    },
    {
        id: 'ipl',
        tab: 'courses',
        title: 'IPL เลเซอร์กำจัดขน',
        subtitle: 'ผิวเนียนใสไร้ขน',
        badge: 'ไม่เจ็บ ปลอดภัย',
        desc: 'รักแร้ • หนวด • แขน • ขา เผยผิวเนียนใส',
        priceTag: 'เริ่มต้น ฿550.-',
        gradient: 'from-[#2563eb] via-[#4f46e5] to-[#3b82f6]',
        shadow: 'shadow-blue-500/25',
        code: 'IPL LASER'
    },
    {
        id: 'promo',
        tab: 'courses',
        title: 'โปรโมชั่นพิเศษสุดคุ้ม',
        subtitle: 'Hot Deals & 1 แถม 1',
        badge: 'ลดสูงสุด 50%',
        desc: 'โปรโมชั่น 1 แถม 1 • สิทธิพิเศษสมาชิก CRM',
        priceTag: 'ลดสูงสุด 50%',
        gradient: 'from-[#e11d48] via-[#be123c] to-[#9f1239]',
        shadow: 'shadow-red-500/25',
        code: 'HOT DEALS'
    }
];

const Booking = ({
    openBookingModal,
    myBookings,
    setGeneratedTicket,
    setBookingStep,
    setBookingCourse,
    setIsBookingModalOpen,
    setShowCancelConfirm,
    setBookingError,
    activeCourses,
    onNavigateToCategory,
    customerData,
    handleCollectCoupon,
    MOCK_COUPONS
}) => {
    const [showPastTickets, setShowPastTickets] = useState(false);
    const [showCrmPosterModal, setShowCrmPosterModal] = useState(false);

    const collectedCodes = (customerData?.collectedCoupons || []).map(c => String(c).toUpperCase());
    const isCrm20Collected = collectedCodes.includes('CRM20');
    const isBook10Collected = collectedCodes.includes('BOOK10');

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
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* 1. ปุ่ม จองคิวบริการ / ตรวจดูคิวว่าง */}
            <div>
                <button onClick={() => openBookingModal()} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-[24px] shadow-lg shadow-blue-500/30 flex items-center justify-between hover:opacity-90 active:scale-95 transition-all border border-blue-400">
                    <div className="flex items-center">
                    <div className="bg-white/20 p-2.5 rounded-xl mr-3"><CalendarPlus size={24} /></div>
                    <div className="text-left">
                        <p className="font-black text-base leading-tight">จองคิวบริการ / ตรวจดูคิวว่าง</p>
                        <p className="text-[10px] font-medium opacity-90 tracking-wide mt-0.5">เช็คตารางเวลาว่างแบบเรียลไทม์ และจองนัดหมายทันที</p>
                    </div>
                    </div>
                    <ChevronRight size={24} className="opacity-70" />
                </button>
            </div>

            {/* 🌟 2. CRM HERO BANNER (ชวนใช้ระบบจองคิว & สะสมแต้มออนไลน์ ลดสูงสุด 20%) 🌟 */}
            <div className="relative overflow-hidden rounded-[26px] border border-amber-400/40 shadow-xl shadow-indigo-950/20 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-4 text-white">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs uppercase tracking-wider">
                            <Award size={10} className="fill-slate-950" /> สิทธิพิเศษ CRM • ถึง 31 ธ.ค. 69
                        </span>
                        <button 
                            type="button"
                            onClick={() => setShowCrmPosterModal(true)}
                            className="text-[10px] text-amber-300 hover:text-white font-bold flex items-center gap-0.5 underline underline-offset-2 opacity-90 transition-opacity"
                        >
                            ดูโปสเตอร์เต็ม <ExternalLink size={10} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[17px] sm:text-lg font-black text-white leading-tight drop-shadow-xs">
                                ชวนใช้ระบบจองคิว & สะสมแต้ม
                            </h3>
                            <p className="text-amber-200/90 text-[11px] font-medium leading-snug mt-1">
                                จองง่าย สะดวก ได้ส่วนลดทันที ไม่ต้องรอคิว
                            </p>

                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                                <span className="bg-white/10 backdrop-blur-xs text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-amber-400/30">
                                    🏷️ ซื้อคอร์สออนไลน์: ลดทันที 20%*
                                </span>
                                <span className="bg-white/10 backdrop-blur-xs text-rose-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-rose-400/30">
                                    🚶‍♂️ Walk-in หน้าร้าน: ลด 10%*
                                </span>
                            </div>

                            {/* 🎟️ 1-TAP COUPON COLLECT BUTTONS 🎟️ */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                <button
                                    type="button"
                                    onClick={() => handleCollectCoupon && handleCollectCoupon('CRM20')}
                                    disabled={isCrm20Collected}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all shadow-xs ${
                                        isCrm20Collected
                                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 cursor-default'
                                            : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 active:scale-95'
                                    }`}
                                >
                                    <span>{isCrm20Collected ? '✓ เก็บแล้ว (ลด 20%)' : '🎁 เก็บโค้ดลด 20% ซื้อคอร์ส'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleCollectCoupon && handleCollectCoupon('BOOK10')}
                                    disabled={isBook10Collected}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                                        isBook10Collected
                                            ? 'bg-white/10 text-slate-300 border border-white/20 cursor-default'
                                            : 'bg-white/15 text-white hover:bg-white/25 active:scale-95 border border-white/30'
                                    }`}
                                >
                                    <span>{isBook10Collected ? '✓ เก็บโค้ดจอง 10% แล้ว' : '🎟️ เก็บโค้ดจอง 10%'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Poster Thumbnail Clickable */}
                        <div 
                            onClick={() => setShowCrmPosterModal(true)}
                            className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden shrink-0 border-2 border-amber-400/60 shadow-md relative group cursor-pointer bg-slate-900"
                        >
                            <img 
                                src="/posters/crm_promo_poster.jpg" 
                                alt="CRM Promotion" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-end justify-center p-1">
                                <span className="bg-black/70 backdrop-blur-xs text-white text-[8px] font-black px-1.5 py-0.5 rounded-md w-full text-center">
                                    แตะดูเต็มใบ
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action row */}
                    <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-300 font-medium truncate">
                            🎁 ทุกบริการสะสมคะแนน แลกรับของรางวัล & คอร์สฟรี
                        </span>
                        {onNavigateToCategory && (
                            <button
                                type="button"
                                onClick={() => onNavigateToCategory('facial', 'courses')}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all shrink-0"
                            >
                                <span>ดูคอร์สลด 20%</span>
                                <ArrowRight size={13} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 🌟 3. HORIZONTAL CATEGORY BANNERS (แบนเนอร์แนวนอนเลือกซื้อคอร์สแต่ละประเภท) 🌟 */}
            <div>
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <Sparkles size={16} className="text-pink-500 fill-pink-500" />
                        เลือกซื้อคอร์สตามหมวดหมู่ (สิทธิพิเศษ CRM)
                    </h3>
                    {onNavigateToCategory && (
                        <button
                            type="button"
                            onClick={() => onNavigateToCategory('all', 'courses')}
                            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-0.5"
                        >
                            ดูทั้งหมด <ChevronRight size={14} />
                        </button>
                    )}
                </div>

                {/* Horizontal Snap Scroll Container */}
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x px-0.5">
                    {COURSE_CATEGORY_BANNERS.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onNavigateToCategory && onNavigateToCategory(cat.id, cat.tab)}
                            className={`snap-start shrink-0 w-[240px] sm:w-[260px] rounded-[22px] p-4 text-white relative overflow-hidden shadow-lg ${cat.shadow} cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-br ${cat.gradient} flex flex-col justify-between`}
                        >
                            {/* Watermark Code */}
                            <div className="absolute -bottom-3 -right-2 text-[56px] font-black text-white/10 pointer-events-none select-none tracking-tighter uppercase leading-none">
                                {cat.code}
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className="bg-white/20 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {cat.badge}
                                    </span>
                                    <span className="text-[10px] text-white/90 font-mono font-bold bg-black/15 px-2 py-0.5 rounded-md">
                                        {cat.code}
                                    </span>
                                </div>

                                <h4 className="text-base font-black leading-tight text-white drop-shadow-xs">
                                    {cat.title}
                                </h4>
                                <p className="text-[11px] text-white/90 font-semibold mt-0.5">
                                    {cat.subtitle}
                                </p>
                                <p className="text-[10px] text-white/75 font-medium leading-relaxed mt-1 line-clamp-1">
                                    {cat.desc}
                                </p>
                            </div>

                            <div className="mt-3.5 pt-2 border-t border-white/20 flex items-end justify-between relative z-10">
                                <div>
                                    <span className="text-[9px] text-white/80 block font-medium">ราคาพิเศษ</span>
                                    <span className="text-sm font-black text-white">{cat.priceTag}</span>
                                </div>
                                <div className="bg-white text-slate-900 rounded-xl px-2.5 py-1 text-[11px] font-black flex items-center gap-1 shadow-xs hover:bg-slate-100">
                                    <span>เลือกดู</span>
                                    <ArrowRight size={11} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. ตั๋วนัดหมาย (E-Ticket) */}
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
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${theme.badge}`}>{bk.status === 'รอเข้ารับบริการ' ? 'รอการยืนยัน' : bk.status}</span>
                                        {Number(bk.guestsCount || bk.pax || 1) > 1 && (
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                                👥 {bk.guestsCount || bk.pax} ท่าน
                                            </span>
                                        )}
                                        <BookingCountdown booking={bk} />
                                    </div>
                                    <span className="font-mono text-[10px] text-gray-400 font-bold shrink-0">{bk.ticketNo}</span>
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
                            {(bk.status === 'รอเข้ารับบริการ' || bk.status === 'รอการยืนยัน' || bk.status === 'ยืนยันแล้ว') && (
                                <div className={`${bk.status === 'ยืนยันแล้ว' ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'} cursor-pointer transition-colors text-[10px] font-bold py-2 text-center border-t flex items-center justify-center rounded-b-2xl -mt-2 pt-3`}>
                                คลิกเพื่อดู E-Ticket / เลื่อนจอง / ยกเลิกคิว <ChevronRight size={12} className="ml-1" />
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

            {/* 5. หรือเลือกจากคอร์สที่มีอยู่ */}
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
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 text-center shadow-sm">
                        <p className="text-xs text-gray-500 font-bold">ไม่มีคอร์สคงเหลือให้จอง</p>
                        {onNavigateToCategory && (
                            <button
                                type="button"
                                onClick={() => onNavigateToCategory('facial', 'courses')}
                                className="mt-2.5 px-4 py-2 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                            >
                                <Sparkles size={13} /> เลือกซื้อคอร์สใหม่เพื่อจองคิว
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 🌟 6. POPUP MODAL: แสดงโปสเตอร์สิทธิพิเศษ CRM เต็มใบ 🌟 */}
            {showCrmPosterModal && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-3 animate-in fade-in duration-200"
                    onClick={() => setShowCrmPosterModal(false)}
                >
                    <div 
                        className="bg-slate-900 rounded-[28px] max-w-sm w-full overflow-hidden shadow-2xl border border-amber-400/40 relative flex flex-col max-h-[92vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-3 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-amber-400/30 flex items-center justify-between text-white">
                            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                                <Award size={16} /> สิทธิพิเศษระบบจองคิว & สะสมแต้มออนไลน์
                            </div>
                            <button 
                                onClick={() => setShowCrmPosterModal(false)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-2 overflow-y-auto flex-1 flex items-center justify-center bg-slate-950">
                            <img 
                                src="/posters/crm_promo_poster.jpg" 
                                alt="CRM Promotion Full Poster" 
                                className="w-full h-auto max-h-[72vh] object-contain rounded-xl"
                            />
                        </div>

                        <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                            <button
                                onClick={() => setShowCrmPosterModal(false)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
                            >
                                ปิด
                            </button>
                            {onNavigateToCategory && (
                                <button
                                    onClick={() => {
                                        setShowCrmPosterModal(false);
                                        onNavigateToCategory('facial', 'courses');
                                    }}
                                    className="flex-[1.5] py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                                >
                                    <ShoppingBag size={14} />
                                    <span>ไปเลือกซื้อคอร์สเลย</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Booking;
