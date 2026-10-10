import React from 'react';
import { CalendarPlus, AlertCircle, X, CalendarDays, Loader2, CheckCircle, QrCode, Sparkles, Droplets, Zap, Crosshair, MessageCircle, Package, Clock, XCircle, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function BookingModal({
    isBookingModalOpen,
    closeBookingModal,
    bookingStep,
    bookingCourse,
    bookingForm,
    setBookingForm,
    handleBookingSubmit,
    handleRescheduleSubmit,
    bookingError,
    availableBranches,
    bookingDateList,
    formatShortDate,
    getLocalDateString,
    storeHolidays = [],
    timeSlots,
    bookedTimeRanges,
    timeToMins,
    isSubmittingBooking,
    generatedTicket,
    setGeneratedTicket,
    setBookingStep,
    setBookingCourse,
    setIsBookingModalOpen,
    setShowCancelConfirm,
    setBookingError,
    showCancelConfirm,
    isActionLoading,
    handleCancelBooking,
    openReschedule,
    customerData
}) {
    const getStatusUI = (status) => {
        const s = status || '';
        switch(s) {
            case 'รอการยืนยัน':
            case 'รอเข้ารับบริการ':
                return {
                    bgGradient: 'from-amber-50 to-white',
                    border: 'border-amber-100',
                    topBar: 'bg-amber-500',
                    iconWrapper: 'border-amber-50',
                    iconColor: 'text-amber-500',
                    Icon: Clock,
                    title: 'รอการยืนยัน'
                };
            case 'ยืนยันแล้ว':
            case 'รอรับบริการ':
                return { 
                    bgGradient: 'from-teal-50 to-white', 
                    border: 'border-teal-100', 
                    topBar: 'bg-teal-500', 
                    iconWrapper: 'border-teal-50', 
                    iconColor: 'text-teal-500', 
                    Icon: CheckCircle, 
                    title: 'ยืนยันการจองแล้ว' 
                };
            case 'กำลังให้บริการ': 
            case 'กำลังใช้บริการ':
                return { 
                    bgGradient: 'from-blue-50 to-white', 
                    border: 'border-blue-100', 
                    topBar: 'bg-blue-500', 
                    iconWrapper: 'border-blue-50', 
                    iconColor: 'text-blue-500', 
                    Icon: Clock, 
                    title: 'กำลังให้บริการ' 
                };
            case 'เสร็จสิ้น': 
            case 'ให้บริการเสร็จสิ้น':
                return { 
                    bgGradient: 'from-emerald-50 to-white', 
                    border: 'border-emerald-100', 
                    topBar: 'bg-emerald-500', 
                    iconWrapper: 'border-emerald-50', 
                    iconColor: 'text-emerald-500', 
                    Icon: CheckCircle, 
                    title: 'ให้บริการเสร็จสิ้น' 
                };
            case 'ยกเลิก':
            case 'ยกเลิกโดยลูกค้า':
            case 'ยกเลิกฉุกเฉิน':
                return { 
                    bgGradient: 'from-rose-50 to-white', 
                    border: 'border-rose-100', 
                    topBar: 'bg-rose-500', 
                    iconWrapper: 'border-rose-50', 
                    iconColor: 'text-rose-500', 
                    Icon: XCircle, 
                    title: 'ยกเลิกคิวแล้ว' 
                };
            case 'ไม่มาตามนัด':
                return { 
                    bgGradient: 'from-slate-50 to-white', 
                    border: 'border-slate-100', 
                    topBar: 'bg-slate-500', 
                    iconWrapper: 'border-slate-50', 
                    iconColor: 'text-slate-500', 
                    Icon: XCircle, 
                    title: 'ไม่มาตามนัด' 
                };
            default:
                return { 
                    bgGradient: 'from-teal-50 to-white', 
                    border: 'border-teal-100', 
                    topBar: 'bg-teal-500', 
                    iconWrapper: 'border-teal-50', 
                    iconColor: 'text-teal-500', 
                    Icon: CheckCircle, 
                    title: 'จองคิวสำเร็จ!' 
                };
        }
    };

    if (!isBookingModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
           <div className="bg-white w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl relative flex flex-col">
              <button onClick={closeBookingModal} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-20"><X size={20} /></button>

              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                 <CalendarPlus size={24} className="mr-2 text-teal-600"/>
                 {bookingStep === 1 ? 'จองคิวเข้ารับบริการ' : bookingStep === 2 ? 'E-Ticket นัดหมาย' : 'เลื่อนคิวนัดหมาย'}
              </h2>

              {/* STEP 1 & 3: FORM */}
              {(bookingStep === 1 || bookingStep === 3) && (
                 <form onSubmit={bookingStep === 1 ? handleBookingSubmit : handleRescheduleSubmit} className="space-y-5">
                    {bookingError && (
                        <div className="bg-red-50 text-red-600 text-[11px] font-bold p-3 rounded-xl border border-red-100 flex items-start">
                           <AlertCircle size={14} className="mr-1.5 shrink-0 mt-0.5"/> {bookingError}
                        </div>
                    )}

                    {/* สาขา (Global / Interactive) */}
                    <div className="mb-4">
                        <label className="flex items-center text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            <MapPin size={14} className="mr-1 text-teal-500" />
                            เลือกสาขาที่ต้องการจอง
                        </label>
                        <div className="flex gap-2">
                            {availableBranches?.map(b => (
                                <button 
                                    key={b} 
                                    type="button" 
                                    onClick={() => {
                                        setBookingForm({...bookingForm, branch: b});
                                        // Update the default branch in local storage to keep it consistent with the user's latest choice
                                        localStorage.setItem('defaultBranch', b);
                                    }}
                                    className={`flex-1 py-3.5 rounded-2xl text-[13px] font-bold transition-all border-2 ${
                                        bookingForm.branch === b 
                                            ? 'bg-teal-500 border-teal-600 text-white shadow-md shadow-teal-500/20' 
                                            : 'bg-white border-gray-100 text-gray-600 hover:border-teal-300 hover:text-teal-600'
                                    }`}
                                >
                                    {b.replace('สาขา', '')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ข้อมูลลูกค้า (Guest) */}
                    {!customerData && (
                        <div className="space-y-4 mb-4 p-5 bg-orange-50 border-2 border-orange-100 rounded-3xl">
                            <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-2 ml-1">ข้อมูลผู้จอง (เนื่องจากยังไม่ได้เข้าสู่ระบบ)</p>
                            <div>
                                <input
                                    type="text"
                                    required
                                    placeholder="ชื่อผู้จอง"
                                    value={bookingForm.guestName || ''}
                                    onChange={e => setBookingForm({...bookingForm, guestName: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-white bg-white rounded-xl outline-none focus:border-teal-400 transition-all font-medium text-gray-800 text-sm shadow-sm"
                                />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    required
                                    placeholder="เบอร์โทรศัพท์ติดต่อ"
                                    value={bookingForm.guestPhone || ''}
                                    onChange={e => setBookingForm({...bookingForm, guestPhone: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-white bg-white rounded-xl outline-none focus:border-teal-400 transition-all font-medium text-gray-800 text-sm shadow-sm"
                                />
                            </div>
                        </div>
                    )}

                    {/* วันที่ Banner */}
                    <div>
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">วันที่ต้องการจอง</label>
                       <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x pb-2 items-center">
                           {bookingDateList.map((d, i) => {
                               const shortDate = formatShortDate(d);
                               const isSelected = bookingForm.date === shortDate.fullValue;
                               
                               // Check if date is a holiday
                               const isHoliday = storeHolidays.some(h => {
                                   if (h.id === shortDate.fullValue) return true;
                                   if (h.date === shortDate.fullValue) return true;
                                   return false;
                               });

                               return (
                                   <button 
                                      key={i} 
                                      type="button" 
                                      disabled={isHoliday}
                                      onClick={() => setBookingForm({...bookingForm, date: shortDate.fullValue, time: ''})} 
                                      className={`snap-start shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 transition-all ${
                                          isHoliday 
                                              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' 
                                              : isSelected 
                                                  ? 'bg-teal-500 border-teal-600 text-white shadow-md scale-105' 
                                                  : 'bg-white border-gray-100 text-gray-600 hover:border-teal-300'
                                      }`}
                                   >
                                       <span className="text-[10px] font-bold opacity-90">{i === 0 ? 'วันนี้' : i === 1 ? 'พรุ่งนี้' : shortDate.dayName}</span>
                                       <span className="text-2xl font-black">{shortDate.dateNum}</span>
                                       <span className="text-[10px] font-medium">{shortDate.monthName}</span>
                                       {isHoliday && <span className="text-[9px] font-bold text-red-500 mt-1">หยุด</span>}
                                   </button>
                               )
                           })}
                           {/* Calendar Picker Fallback */}
                           <div className="snap-start shrink-0 relative flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all">
                               <input type="date" value={bookingForm.date} min={getLocalDateString(new Date())} onChange={e => setBookingForm({...bookingForm, date: e.target.value, time: ''})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                               <CalendarDays size={20} className="mb-1" />
                               <span className="text-[9px] font-bold mt-1">ปฏิทิน</span>
                           </div>
                       </div>
                    </div>

                    {/* บริการ */}
                    {!bookingCourse && bookingStep === 1 && (
                       <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">บริการที่ต้องการ</label>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                             {[
                                { text: 'ทำหน้า', icon: Sparkles },
                                { text: 'กดสิว', icon: Droplets },
                                { text: 'IPLรักแร้', icon: Zap },
                                { text: 'จี้ไฝ', icon: Crosshair },
                                { text: 'ปรึกษา', icon: MessageCircle },
                                { text: 'ใช้คอส', icon: Package }
                             ].map(svc => {
                                 const currentServices = (bookingForm.serviceName || '').split(',').map(s => s.trim()).filter(Boolean);
                                 const isSelected = currentServices.includes(svc.text);
                                 return (
                                     <button
                                         key={svc.text}
                                         type="button"
                                         onClick={() => {
                                             let newServices;
                                             if (isSelected) {
                                                 newServices = currentServices.filter(s => s !== svc.text);
                                             } else {
                                                 newServices = [...currentServices, svc.text];
                                             }
                                             setBookingForm({...bookingForm, serviceName: newServices.join(', ')});
                                         }}
                                         className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border text-[11px] font-black transition-all active:scale-95 ${isSelected ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white border-teal-500 shadow-md shadow-teal-500/30' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700'}`}
                                     >
                                         <svc.icon size={20} className={isSelected ? 'text-white' : 'text-teal-500'} />
                                         {svc.text}
                                     </button>
                                 );
                             })}
                          </div>
                          <input
                             type="text"
                             value={bookingForm.serviceName}
                             onChange={e => setBookingForm({...bookingForm, serviceName: e.target.value})}
                             placeholder="เช่น ทำหน้า, กดสิว"
                             className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50/50 rounded-2xl outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-400/10 transition-all font-medium text-gray-800"
                          />
                       </div>
                    )}

                    {/* เวลา */}
                    <div>
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">เวลา (เลือกเวลาที่ว่าง)</label>
                       <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                          {timeSlots.map(time => {
                              const slotStart = timeToMins(time);
                              const isBooked = bookedTimeRanges.some(b => Math.max(slotStart, b.start) < Math.min(slotStart + 60, b.end));

                              let isPast = false;
                              if (bookingForm.date === getLocalDateString(new Date())) {
                                  const now = new Date();
                                  const currentMins = now.getHours() * 60 + now.getMinutes();
                                  isPast = slotStart < currentMins + 30;
                              }

                              const disabled = isBooked || isPast;

                              return (
                                  <button
                                      key={time}
                                      type="button"
                                      disabled={disabled}
                                      onClick={() => setBookingForm({...bookingForm, time})}
                                      className={`py-2.5 rounded-xl text-xs font-mono font-black border-2 transition-all ${
                                          bookingForm.time === time
                                              ? 'bg-teal-500 border-teal-600 text-white shadow-md'
                                              : disabled
                                                  ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                  : 'bg-white border-gray-100 text-gray-700 hover:border-teal-300 hover:text-teal-600'
                                      }`}
                                  >
                                      {time}
                                  </button>
                              );
                          })}
                       </div>
                    </div>

                    <div className="pt-2">
                       <button
                          type="submit"
                          disabled={isSubmittingBooking}
                          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-teal-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-base"
                       >
                          {isSubmittingBooking ? <Loader2 size={20} className="animate-spin" /> : <CalendarPlus size={20} />}
                          ยืนยันการจองคิว
                       </button>
                    </div>
                 </form>
              )}

              {/* STEP 2: TICKET VIEW */}
              {bookingStep === 2 && generatedTicket && (() => {
                 const statusUI = getStatusUI(generatedTicket.status);
                 return (
                 <div className="space-y-4 animate-in zoom-in-95">
                     <div className={`bg-gradient-to-b ${statusUI.bgGradient} p-5 rounded-2xl border ${statusUI.border} text-center relative overflow-hidden`}>
                         <div className={`absolute top-0 left-0 w-full h-2 ${statusUI.topBar}`}></div>
                         <div className={`mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border ${statusUI.iconWrapper} mb-3`}>
                             <statusUI.Icon size={32} className={statusUI.iconColor} />
                         </div>
                         <h3 className="font-black text-lg text-gray-900 mb-1">{statusUI.title}</h3>
                         <p className="text-[11px] text-gray-500 mb-4">แสดง E-Ticket นี้ให้พนักงานเมื่อมาถึงสาขา</p>

                         <div className={`bg-white p-4 rounded-xl border border-dashed ${statusUI.border} mb-4 text-left space-y-2 relative`}>
                             <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                 <span className="text-[10px] text-gray-500 font-bold">หมายเลขการจอง</span>
                                 <span className={`text-sm font-mono font-black ${statusUI.iconColor}`}>{generatedTicket.ticketNo}</span>
                             </div>
                             <div className="flex justify-between items-center pb-1">
                                 <span className="text-[10px] text-gray-500 font-bold">บริการ</span>
                                 <span className="text-xs font-black text-gray-800 line-clamp-1 text-right ml-4">{generatedTicket.courseName}</span>
                             </div>
                             <div className="flex justify-between items-center pb-1">
                                 <span className="text-[10px] text-gray-500 font-bold">สาขา</span>
                                 <span className="text-xs font-bold text-gray-800">{generatedTicket.branch}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-[10px] text-gray-500 font-bold">วัน-เวลา</span>
                                 <span className="text-xs font-black text-indigo-600">
                                     {new Date(generatedTicket.date).toLocaleDateString('th-TH')} <span className="mx-1">เวลา</span> {generatedTicket.time} น.
                                 </span>
                             </div>
                             {generatedTicket.status === 'ยกเลิกฉุกเฉิน' && generatedTicket.cancelReason && (
                                 <div className="flex justify-between items-center pt-2 mt-2 border-t border-rose-100">
                                     <span className="text-[10px] text-rose-500 font-bold">สาเหตุการยกเลิก</span>
                                     <span className="text-[11px] font-black text-rose-600 text-right ml-4 line-clamp-2">{generatedTicket.cancelReason}</span>
                                 </div>
                             )}
                         </div>

                         <div className="mx-auto bg-white p-2 rounded-xl inline-block border border-gray-100 shadow-sm">
                             <QRCodeSVG value={generatedTicket.ticketNo} size={100} level="H" />
                         </div>
                     </div>

                     {/* Action Buttons */}
                     {(!generatedTicket.status || !['ยกเลิก', 'ยกเลิกโดยลูกค้า', 'ยกเลิกฉุกเฉิน', 'เสร็จสิ้น', 'ให้บริการเสร็จสิ้น', 'ไม่มาตามนัด', 'กำลังให้บริการ', 'กำลังใช้บริการ'].includes(generatedTicket.status)) && (
                     <div className="grid grid-cols-2 gap-3 mt-4">
                         {showCancelConfirm ? (
                             <div className="col-span-2 bg-red-50 border border-red-200 p-3 rounded-xl flex flex-col items-center">
                                 <p className="text-[11px] font-bold text-red-700 mb-2">ต้องการยกเลิกคิวนี้ใช่หรือไม่?</p>
                                 <div className="flex gap-2 w-full">
                                     <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-[10px] font-bold">ไม่, กลับไป</button>
                                     <button onClick={handleCancelBooking} disabled={isActionLoading} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-[10px] font-bold flex justify-center items-center">
                                         {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : 'ยืนยันยกเลิกคิว'}
                                     </button>
                                 </div>
                             </div>
                         ) : (
                             <>
                                <button onClick={() => setShowCancelConfirm(true)} className="py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors border border-red-100">ยกเลิกคิว</button>
                                <button onClick={openReschedule} className="py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors border border-indigo-100">เลื่อนคิว</button>
                             </>
                         )}
                     </div>
                     )}
                 </div>
                 );
              })()}
           </div>
        </div>
    );
}
