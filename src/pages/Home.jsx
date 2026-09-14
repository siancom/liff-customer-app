import React, { useState } from 'react';
import { Ticket, MapPin, Clock, AlertCircle, Info, CalendarPlus, Wallet, ArrowDownToLine, Send, ArrowRightLeft, Sparkles, ArrowRight, QrCode, Zap } from 'lucide-react';
import { getFuzzyKey, parseNumber } from '../utils/helpers';

// 🎯 แยกคอร์สรายครั้ง (จำนวนครั้งที่ได้ 1 ครั้ง หรือชื่อมีคำว่า รายครั้ง)
const isSingleSession = (course) => {
    const name = String(getFuzzyKey(course, ["ชื่อคอส", "ชื่อคอร์ส"]) || '');
    return course.totalQty === 1 || name.includes('รายครั้ง') || name.includes('1 ครั้ง') || name.includes('1ฟรี1');
};

const Home = ({
    activeCourses,
    openBalancePaymentModal,
    setShowQR,
    openBookingModal,
    setActiveNav,
    customerData,
    totalInternalCredit,
    openTopUpModal,
    openTransferModal,
    openSkinCheckModal
}) => {
    // 🎯 ฟิลเตอร์คอร์ส: ทั้งหมด / คอร์สแพ็กเกจ / รายครั้ง
    const [courseFilter, setCourseFilter] = useState('all');
    const singleCourses = activeCourses.filter(isSingleSession);
    const packageCourses = activeCourses.filter(c => !isSingleSession(c));
    const shownCourses = courseFilter === 'single' ? singleCourses : courseFilter === 'package' ? packageCourses : activeCourses;
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* MINI WALLET BANNER */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-5 shadow-lg relative overflow-hidden mb-2">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="relative z-10 flex justify-between items-center mb-4 border-b border-white/20 pb-3">
                    <div className="flex items-center text-white/90">
                        <Wallet size={18} className="mr-2" />
                        <span className="font-bold text-sm tracking-wide">Iris Wallet</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-white/70 font-bold mb-0.5 uppercase">เครดิตคงเหลือ</p>
                        <p className="text-xl font-black text-amber-300">฿{(totalInternalCredit || 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="relative z-10 grid grid-cols-3 gap-3">
                    <button onClick={openTopUpModal} className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl py-2 flex flex-col items-center justify-center gap-1 transition-all border border-white/20 shadow-sm active:scale-95">
                        <ArrowDownToLine size={16} className="text-white"/>
                        <span className="text-[10px] font-bold text-white">เติมเครดิต</span>
                    </button>
                    <button onClick={openTransferModal} className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl py-2 flex flex-col items-center justify-center gap-1 transition-all border border-white/20 shadow-sm active:scale-95">
                        <Send size={16} className="text-white"/>
                        <span className="text-[10px] font-bold text-white">โอนให้เพื่อน</span>
                    </button>
                    <button onClick={() => setActiveNav('shop')} className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl py-2 flex flex-col items-center justify-center gap-1 transition-all border border-white/20 shadow-sm active:scale-95">
                        <ArrowRightLeft size={16} className="text-white"/>
                        <span className="text-[10px] font-bold text-white">แลกสินค้า</span>
                    </button>
                </div>
            </div>

            {/* 🌟 AI SKIN CHECK BANNER 🌟 */}
            <div 
                onClick={() => openSkinCheckModal(null)}
                className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 rounded-3xl p-4 shadow-lg shadow-teal-500/20 relative overflow-hidden flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all mb-2"
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl -mr-8 -mt-8"></div>
                
                <div className="relative z-10 flex-1">
                    <h3 className="text-white font-black text-sm tracking-wide flex items-center mb-0.5">
                        <Sparkles size={16} className="mr-1.5 text-yellow-300 animate-pulse" /> AI Skin Analysis
                    </h3>
                    <p className="text-teal-50 text-[10px] leading-tight">เช็คสภาพผิวหน้าด้วย AI สุดล้ำ<br/>พร้อมรับคำแนะนำจากผู้เชี่ยวชาญ</p>
                </div>
                
                <div className="relative z-10 bg-white text-teal-600 font-black text-[10px] px-3 py-1.5 rounded-full shadow-sm flex items-center whitespace-nowrap">
                    เริ่มตรวจเลย <ArrowRight size={12} className="ml-1" />
                </div>
            </div>

            <h2 className="text-sm font-black text-gray-800 flex items-center mb-2 mt-4"><Ticket size={18} className="mr-2 text-teal-600"/> คอร์สที่ใช้งานได้ ({activeCourses.length})</h2>

            {/* 🎯 แท็บกรอง: ทั้งหมด / แพ็กเกจ / รายครั้ง */}
            {activeCourses.length > 0 && singleCourses.length > 0 && packageCourses.length > 0 && (
                <div className="flex gap-1.5 mb-3 bg-gray-100/70 p-1 rounded-2xl">
                    {[
                        { key: 'all', label: `ทั้งหมด (${activeCourses.length})` },
                        { key: 'package', label: `แพ็กเกจ (${packageCourses.length})` },
                        { key: 'single', label: `⚡ รายครั้ง (${singleCourses.length})` },
                    ].map(t => (
                        <button key={t.key} onClick={() => setCourseFilter(t.key)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${courseFilter === t.key ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            )}
            {courseFilter === 'single' && (
                <p className="text-[9px] text-gray-400 mb-2 font-medium">⚡ คอร์สจ่ายรายครั้ง ใช้ได้ทันที 1 ครั้ง — ยื่น QR ที่สาขาเพื่อใช้บริการได้เลย</p>
            )}
            {shownCourses.length > 0 ? shownCourses.map((course, idx) => {
                const isPendingPayment = parseNumber(getFuzzyKey(course, "ยอดค้างชำระ")) > 0;
                return (
                    <div key={idx} className={`bg-white rounded-[24px] p-5 shadow-sm border-2 ${isPendingPayment ? 'border-red-100' : 'border-transparent'} relative overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${isPendingPayment ? 'bg-red-400' : 'bg-teal-400'}`}></div>
                        <div className="relative z-10 pl-1">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col gap-1 items-start">
                                    <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1 rounded-md uppercase flex items-center"><MapPin size={10} className="mr-1"/> {getFuzzyKey(course, "สาขาที่ซื้อ")}</span>
                                    {getFuzzyKey(course, ["รหัสคอส", "col_1"]) && (
                                        <span className="bg-teal-50 text-teal-600 border border-teal-100 text-[9px] font-bold px-2 py-1 rounded-md uppercase inline-block">
                                            {getFuzzyKey(course, ["รหัสคอส", "col_1"])}
                                        </span>
                                    )}
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-[10px] font-mono text-gray-400">ซื้อ: {getFuzzyKey(course, "วันที่ซื้อ")}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 border ${course.diffDays < 0 ? 'bg-gray-50 text-gray-500 border-gray-200' : course.diffDays <= 30 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                        <Clock size={8} className="inline mr-1 -mt-0.5"/>
                                        {course.expireText}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-base font-black text-gray-900 mb-2">{getFuzzyKey(course, "ชื่อคอส")}</h3>
                            
                            {isPendingPayment && (
                                <div className="mb-3 bg-red-50/50 p-3 rounded-xl border border-red-100 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <AlertCircle size={14} className="text-red-500 mr-2 shrink-0"/>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-[10px] font-bold text-red-600">ยอดค้างชำระ</span>
                                            <span className="text-sm font-black text-red-700">฿{parseNumber(getFuzzyKey(course, "ยอดค้างชำระ")).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => openBalancePaymentModal(course)} className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-red-600 active:scale-95 transition-all">
                                        ชำระยอดค้าง
                                    </button>
                                </div>
                            )}
                            
                            <div className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-gray-500 font-bold">ใช้ไปแล้ว <span className="font-black text-gray-900 text-sm mx-0.5">{course.totalUsed}</span>/{course.totalQty}</span>
                                    <span className="text-teal-600 font-black text-sm">เหลือ {course.remaining} ครั้ง</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${isPendingPayment ? 'bg-gradient-to-r from-red-400 to-orange-400' : 'bg-gradient-to-r from-teal-400 to-emerald-400'}`} style={{ width: `${(course.totalUsed / Math.max(1, course.totalQty)) * 100}%` }}></div>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-gray-200 border-dashed">
                                    <div className="flex justify-between text-[11px] mb-1.5">
                                        <span className="text-gray-500 font-bold">ใช้เครดิตไป <span className="font-black text-gray-900 text-xs mx-0.5">฿{((course.computedTotalCredit || 0) - (course.computedRemainCredit || 0)).toLocaleString()}</span></span>
                                        <span className="text-teal-600 font-black text-xs">เหลือวงเงิน ฿{(course.computedRemainCredit || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-teal-50 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${(((course.computedTotalCredit || 0) - (course.computedRemainCredit || 0)) / Math.max(1, course.computedTotalCredit || 1)) * 100}%` }}></div>
                                    </div>
                                    <div className="text-[9px] text-gray-400 text-right mt-1 font-mono tracking-tighter">วงเงินคอร์สทั้งหมด ฿{(course.computedTotalCredit || 0).toLocaleString()}</div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-4">
                                <button onClick={() => openSkinCheckModal(course)} className="w-full bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 text-teal-700 flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-[11px] active:scale-95 transition-transform hover:bg-teal-100 shadow-sm relative overflow-hidden">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-teal-500 text-white rounded-md flex items-center justify-center mr-2 shadow-sm">
                                            <Sparkles size={12} />
                                        </div>
                                        <div className="text-left flex flex-col leading-tight">
                                            <span>ดูสภาพผิวหน้า</span>
                                            <span className="text-[9px] text-teal-500 font-medium">AI Skin Check</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-teal-400"/>
                                </button>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setShowQR(course)} className="w-full bg-gray-900 text-white flex items-center justify-center space-x-1.5 py-3 rounded-xl font-bold text-[11px] active:scale-95 transition-transform hover:bg-gray-800 shadow-md">
                                        <QrCode size={16} /><span>แสดง QR ใช้คอร์ส</span>
                                    </button>
                                    <button onClick={() => openBookingModal(course)} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white flex items-center justify-center space-x-1.5 py-3 rounded-xl font-bold text-[11px] active:scale-95 transition-transform shadow-md shadow-teal-500/30 hover:opacity-90">
                                        <CalendarPlus size={16} /><span>จองคิวบริการ</span>
                                    </button>
                                </div>
                                {isSingleSession(course) && (
                                    <div className="mt-2 flex items-center justify-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-full py-1.5">
                                        <Zap size={10} className="fill-amber-400"/> คอร์สรายครั้ง — แสดง QR ที่สาขาแล้วใช้ได้เลย
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }) : (
                <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><Ticket size={32} className="text-gray-300" /></div>
                    <h3 className="text-gray-800 font-black text-base mb-1">ไม่มีคอร์สที่ใช้งานได้</h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed px-6 mb-4">สอบถามโปรโมชั่นใหม่ๆ หรือเลือกซื้อผ่านแอปได้เลย</p>
                    <button onClick={() => setActiveNav('shop')} className="bg-teal-50 text-teal-600 font-bold px-6 py-2.5 rounded-xl border border-teal-100 shadow-sm hover:bg-teal-100 transition-colors text-sm">ไปที่ร้านค้า</button>
                </div>
            )}
        </div>
    );
};

export default Home;
