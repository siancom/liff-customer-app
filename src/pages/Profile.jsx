import React, { useState } from 'react';
import { User, Sparkles, Award, Download, Loader2, Database, ShoppingBag, HeartPulse, Banknote, MapPin, Plus, Share2, LogOut, ReceiptText, ChevronRight, QrCode, X, Wallet, ArrowRightLeft, Send, ArrowDownToLine, Star, Calendar } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getFuzzyKey } from '../utils/helpers';

export default function Profile({
  customerData,
  activeCourses,
  ledgerHistory,
  shopItems,
  parseNumber,
  handleSaveCard,
  isSavingCard,
  openAddressModal,
  handleShareRefCode,
  lineProfile,
  setAppState,
  setPhoneNumber,
  setActiveNav,
  openTopUpModal,
  openTransferModal,
  handleUpdateBirthday
}) {
  const [showCustomerQR, setShowCustomerQR] = useState(false);
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);
  const [birthdayInput, setBirthdayInput] = useState(getFuzzyKey(customerData, ["วันเกิด", "birthday"]) || '');

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      <div className="bg-gradient-to-b from-teal-600 to-teal-800 pt-8 pb-8 px-6 rounded-3xl shadow-lg relative shrink-0 mb-6 -mx-4 -mt-6">
        <div className="flex justify-between items-center relative z-10">
           <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md p-0.5 shadow-lg">
                <img 
                  src={customerData.lineProfilePic} 
                  onError={(e) => { e.target.onerror = null; e.target.src = lineProfile?.pictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback&backgroundColor=b6e3f4`; }}
                  alt="Profile" 
                  className="w-full h-full rounded-xl object-cover bg-white" 
                />
              </div>
              <div className="text-white">
                <p className="text-[10px] opacity-80 mb-0.5 uppercase">สวัสดีค่ะ, คุณ{customerData.lineDisplayName}</p>
                <h1 className="text-lg font-black max-w-[200px] truncate flex items-center gap-1">{getFuzzyKey(customerData, "ชื่อ")}{customerData.isApproved && <Award size={16} className="text-amber-300 ml-1"/>}</h1>
              </div>
            </div>
            <button onClick={() => { setAppState('login'); setPhoneNumber(''); }} className="bg-white/10 p-2.5 rounded-xl text-white hover:bg-white/20 transition-colors"><LogOut size={18} /></button>
        </div>
      </div>

      <h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><User size={18} className="mr-2 text-indigo-500"/> บัญชีสะสมยอด</h2>
      
      <div id="member-card-capture" className="bg-white p-2 sm:p-3 rounded-[32px] shadow-sm border border-gray-100 mb-6 pb-4 relative">
        <div className={`p-6 rounded-[28px] shadow-xl text-white relative overflow-hidden ${customerData.isApproved ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600' : 'bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900'}`}>
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        
        <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button 
                data-html2canvas-ignore="true"
                onClick={() => setShowCustomerQR(true)} 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md w-9 h-9 rounded-full transition-all flex items-center justify-center border border-white/20 shadow-sm"
                title="แสดงคิวอาร์โค้ด"
            >
                <QrCode size={16} className="text-white" />
            </button>
            <button 
                data-html2canvas-ignore="true"
                onClick={handleSaveCard} 
                disabled={isSavingCard}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md w-9 h-9 rounded-full transition-all flex items-center justify-center border border-white/20 shadow-sm"
                title="บันทึกรูปบัตร"
            >
                {isSavingCard ? <Loader2 size={16} className="animate-spin text-white" /> : <Download size={16} className="text-white" />}
            </button>
        </div>

        <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Sparkles size={20} className="text-white" />
               </div>
               <div>
                 <p className="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-0.5">IrisCare Clinic</p>
                 <p className="font-black text-lg flex items-center gap-1.5 leading-none">
                     {customerData.memberStatus} 
                     {customerData.isApproved && <Award size={16} className="text-amber-300"/>}
                 </p>
               </div>
            </div>
        </div>
        
        <div className="relative z-10 mb-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-1">ชื่อสมาชิก (Member Name)</p>
            <p className="text-xl font-black tracking-wide mb-0.5">{getFuzzyKey(customerData, "ชื่อ")}</p>
            <p className="text-sm font-mono opacity-90 tracking-widest">{customerData.cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</p>
        </div>

        {(() => {
           const totalCreditValue = activeCourses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0);
           const points = Math.floor((parseNumber(customerData.realAccumulatedAmount) || 0) / 100) - parseNumber(customerData.redeemedPoints || 0);
           return (
             <div className="relative z-10 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-[10px] uppercase tracking-widest font-bold text-white/85">เครดิตคงเหลือ</p>
                           <Wallet size={14} className="text-white/60"/>
                        </div>
                        <div className="flex items-end gap-1">
                           <span className="text-xs font-bold text-white/90 pb-0.5">฿</span>
                           <span className="text-2xl font-black text-amber-300 tracking-tight leading-none">{totalCreditValue.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-[10px] uppercase tracking-widest font-bold text-white/85">คะแนนสะสม</p>
                           <Star size={14} className="text-yellow-300 fill-yellow-300"/>
                        </div>
                        <div className="flex items-end gap-1">
                           <span className="text-2xl font-black text-yellow-300 tracking-tight leading-none">{points.toLocaleString()}</span>
                           <span className="text-[10px] font-bold text-white/70 pb-0.5">แต้ม</span>
                        </div>
                    </div>
                </div>

                <div className="mt-3.5 text-[9px] text-white/70 font-bold border-t border-white/10 pt-2.5 grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-[8px] opacity-75 uppercase mb-0.5">สะสมสินค้า</p>
                        <p className="font-black text-amber-200">฿{(customerData.productAccumulatedAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="border-x border-white/10">
                        <p className="text-[8px] opacity-75 uppercase mb-0.5">สะสมคอร์ส</p>
                        <p className="font-black text-amber-200">฿{(customerData.courseAccumulatedAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[8px] opacity-75 uppercase mb-0.5">สะสมทั้งหมด</p>
                        <p className="font-black text-white">฿{(customerData.realAccumulatedAmount || 0).toLocaleString()}</p>
                    </div>
                </div>
             </div>
           );
        })()}

        {/* Action Buttons */}
        <div className="relative z-10 grid grid-cols-3 gap-2">
            <button onClick={openTopUpModal} className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all border border-white/20 shadow-sm active:scale-95">
                <ArrowDownToLine size={20} className="text-white"/>
                <span className="text-[10px] font-bold text-white">เติมเครดิต</span>
            </button>
            <button onClick={openTransferModal} className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all border border-white/20 shadow-sm active:scale-95">
                <Send size={20} className="text-white"/>
                <span className="text-[10px] font-bold text-white">โอนให้เพื่อน</span>
            </button>
            <button onClick={() => setActiveNav('shop')} className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all border border-white/20 shadow-sm active:scale-95">
                <ArrowRightLeft size={20} className="text-white"/>
                <span className="text-[10px] font-bold text-white">แลกสินค้า</span>
            </button>
        </div>

        </div>

        <div className="mt-6 px-2 sm:px-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1 flex items-center">
             <Database size={14} className="mr-1.5"/> ประวัติการสะสมยอด (Ledger)
          </h3>
          {ledgerHistory.length > 0 ? ledgerHistory.map((p, i) => {
            const typeStr = String(getFuzzyKey(p, "ประเภท") || '');
            const isNegative = typeStr.includes('เบิก') || typeStr.includes('จ่าย') || typeStr.includes('หัก') || typeStr.includes('ตัด');
            const productStr = getFuzzyKey(p, ["สินค้า", "ชื่อคอส", "คอสที่ซื้อ", "col_18", "col_16"]) || '';
            const actionStr = getFuzzyKey(p, ["รายการ", "รายการที่ทำ", "col_23"]) || '';
            const displayItemName = productStr || actionStr || (isNegative ? 'ทำรายการเบิก/หัก' : 'ยอดจัดซื้อ / สินค้า');
            const amt = parseNumber(getFuzzyKey(p, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด", "col_19"])) || 0;

            const cleanActionName = displayItemName.split('>>')[0].trim().toLowerCase().replace(/\s+/g, '');
            
            let matchedItem = shopItems.find(item => item.name.toLowerCase().replace(/\s+/g, '') === cleanActionName);
            
            if (!matchedItem) {
                const possibleMatches = [...shopItems]
                    .sort((a, b) => b.name.length - a.name.length)
                    .filter(item => {
                        const pName = item.name.toLowerCase().replace(/\s+/g, '');
                        if (!cleanActionName || !pName) return false;
                        if (pName.length <= 2 && cleanActionName.length > 2) return false;
                        return cleanActionName.includes(pName) || pName.includes(cleanActionName);
                    });
                matchedItem = possibleMatches.find(item => item.image) || possibleMatches[0];
            }
            const actionImage = matchedItem ? matchedItem.image : null;
            const FallbackIcon = (matchedItem?.type === 'course' || displayItemName.includes('คอร์ส')) ? HeartPulse : (isNegative ? ShoppingBag : Banknote);

            const orderNo = String(getFuzzyKey(p, ["หมายเลขคำสั่งซื้อ", "อ้างอิง", "col_21", "col_5"]) || '').toUpperCase();
            let channelTag = null;
            if (typeStr.toLowerCase().includes('shopee') || (orderNo.length > 13 && !orderNo.startsWith('POS') && !orderNo.startsWith('WOO') && /^[0-9A-Z]+$/.test(orderNo))) {
                channelTag = { name: 'Shopee', color: 'bg-orange-50 text-orange-600 border-orange-200' };
            } else if (orderNo.startsWith('WOO') || orderNo.startsWith('W00') || typeStr.toLowerCase().includes('web') || typeStr.toLowerCase().includes('เว็บ')) {
                channelTag = { name: 'Website', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
            } else if (orderNo.startsWith('POS') || typeStr.includes('ซื้อสินค้า') || typeStr.includes('ซื้อคอร์ส')) {
                channelTag = { name: 'หน้าร้าน', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' };
            }

            return (
            <div key={i} className="bg-gray-50 rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden mb-2">
              <div className={`absolute left-0 top-0 w-1.5 h-full ${isNegative ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
              <div className="flex items-center flex-1 min-w-0 pl-1">
                  {actionImage ? (
                      <img src={actionImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 bg-white shadow-sm mr-3" />
                  ) : (
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 mr-3 shadow-sm">
                          <FallbackIcon size={16} className="text-gray-300"/>
                      </div>
                  )}
                  <div className="flex-1 pr-2 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 leading-tight">{displayItemName}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                       <span className="font-mono text-gray-400">{getFuzzyKey(p, "วันที่")}</span>
                       <span className={`${isNegative ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} font-bold px-1.5 py-0.5 rounded border whitespace-nowrap`}>
                           {typeStr || (isNegative ? 'เบิก' : 'ได้รับ')}
                       </span>
                       {channelTag && !isNegative && (
                           <span className={`${channelTag.color} font-bold px-1.5 py-0.5 rounded border whitespace-nowrap`}>
                               {channelTag.name}
                           </span>
                       )}
                    </div>
                  </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`font-black text-base ${isNegative ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isNegative ? '-' : '+'} {amt.toLocaleString()}
                </span>
              </div>
            </div>
          )}) : (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                <ShoppingBag size={24} className="mx-auto text-gray-300 mb-2"/>
                <p className="text-[11px] text-gray-400 font-bold">ไม่มีประวัติการทำรายการ</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-sm font-black text-gray-800 flex items-center"><MapPin size={18} className="mr-2 text-blue-500"/> ที่อยู่จัดส่งสินค้า</h3>
              <button onClick={openAddressModal} className="text-[10px] text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors active:scale-95">
                  {customerData?.address ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่'}
              </button>
          </div>
          
          {customerData?.address ? (
              <div className="text-xs text-gray-700 bg-gray-50/80 p-4 rounded-xl border border-gray-200 relative z-10">
                  <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-400 rounded-l-xl"></div>
                  <p className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-2 flex items-center justify-between">
                     <span>{customerData.deliveryName || getFuzzyKey(customerData, "ชื่อ")}</span>
                     <span className="font-mono text-gray-500 font-normal">{customerData.deliveryPhone || getFuzzyKey(customerData, "เบอร์โทร")}</span>
                  </p>
                  <p className="leading-relaxed text-gray-600 mt-2">{customerData.address}</p>
              </div>
          ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200 border-dashed relative z-10">
                  <p className="text-[11px] text-gray-500 mb-3">ยังไม่ได้เพิ่มที่อยู่สำหรับจัดส่งสินค้า</p>
                  <button onClick={openAddressModal} className="text-[10px] bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-gray-700 shadow-sm flex items-center mx-auto hover:bg-gray-50 active:scale-95 transition-all">
                      <Plus size={14} className="mr-1.5"/> เพิ่มที่อยู่ใหม่
                  </button>
              </div>
          )}
      </div>

      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-sm font-black text-gray-800 flex items-center"><Calendar size={18} className="mr-2 text-indigo-500"/> ข้อมูลวันเกิด (Birthday Info)</h3>
              {!isEditingBirthday && (
                  <button 
                      onClick={() => setIsEditingBirthday(true)} 
                      className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors active:scale-95"
                  >
                      {birthdayInput ? 'แก้ไขวันเกิด' : 'ระบุวันเกิด'}
                  </button>
              )}
          </div>
          
          {isEditingBirthday ? (
              <div className="space-y-3 relative z-10">
                  <input 
                      type="date" 
                      value={birthdayInput} 
                      onChange={e => setBirthdayInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                  />
                  <div className="flex gap-2 justify-end">
                      <button 
                          onClick={() => {
                              setIsEditingBirthday(false);
                              setBirthdayInput(getFuzzyKey(customerData, ["วันเกิด", "birthday"]) || '');
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                      >
                          ยกเลิก
                      </button>
                      <button 
                          onClick={async () => {
                              if (handleUpdateBirthday) {
                                  await handleUpdateBirthday(birthdayInput);
                              }
                              setIsEditingBirthday(false);
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                      >
                          บันทึก
                      </button>
                  </div>
              </div>
          ) : (
              <div className="text-xs text-gray-700 bg-gray-50/80 p-4 rounded-xl border border-gray-200 relative z-10 flex justify-between items-center">
                  <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-400 rounded-l-xl"></div>
                  <div>
                      <p className="font-bold text-gray-900 mb-1">วันเกิดของคุณ</p>
                      <p className="text-gray-500 font-mono">
                          {(() => {
                              const bDay = getFuzzyKey(customerData, ["วันเกิด", "birthday"]);
                              if (!bDay) return 'ยังไม่ได้ระบุวันเกิด';
                              const d = new Date(bDay);
                              if (isNaN(d.getTime())) return bDay;
                              const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
                              return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + (d.getFullYear() < 2500 ? 543 : 0)}`;
                          })()}
                      </p>
                  </div>
                  <Calendar size={20} className="text-indigo-400 opacity-60"/>
              </div>
          )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[24px] p-5 shadow-sm border border-blue-100 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-400/10 rounded-full blur-xl -mr-10 -mt-10"></div>
        <div className="flex justify-between items-center mb-3 relative z-10">
            <h3 className="text-sm font-black text-indigo-800 flex items-center"><Share2 size={18} className="mr-2 text-indigo-500"/> ชวนเพื่อนรับส่วนลด</h3>
            <span className="bg-indigo-100 text-indigo-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Referral</span>
        </div>
        <p className="text-xs text-gray-600 mb-4 relative z-10 leading-relaxed">
            กดแชร์ส่งให้เพื่อนสมัครสมาชิก <br/><strong className="text-indigo-600">รับทันทีคูปองส่วนลด 100.- และหมุนวงล้อฟรี 1 ครั้ง</strong> ทั้งคุณและเพื่อน!
        </p>
        <div className="flex items-center gap-2 relative z-10">
            <div className="flex-1 bg-white border border-blue-200 rounded-xl py-2.5 px-3 flex items-center justify-center border-dashed">
                <span className="font-mono font-black text-lg text-indigo-600 tracking-widest">
                    REF-{customerData.cleanPhone.slice(-4)}
                </span>
            </div>
            <button 
                onClick={handleShareRefCode}
                className="bg-indigo-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center"
            >
                <Share2 size={14} className="mr-1.5" /> แชร์เลย
            </button>
        </div>
      </div>

      <button 
        onClick={() => setActiveNav('orders')}
        className="w-full bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all mb-4"
      >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <ReceiptText size={20} />
            </div>
            <div className="text-left">
                <h3 className="text-sm font-black text-gray-800">ประวัติคำสั่งซื้อ</h3>
                <p className="text-[10px] text-gray-500">ดูรายการสั่งซื้อและการจัดส่งทั้งหมด</p>
            </div>
        </div>
        <ChevronRight size={20} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
      </button>

      {/* 🌟 Customer QR FULLSCREEN MODAL 🌟 */}
      {showCustomerQR && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 flex justify-between items-center bg-gray-50 border-b border-gray-100 shrink-0">
                <h2 className="font-black text-gray-800 text-lg">คิวอาร์โค้ดลูกค้า</h2>
                <button onClick={() => setShowCustomerQR(false)} className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"><X size={20}/></button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white overflow-y-auto">
                <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-gray-100 mb-8 relative">
                    <div className="w-64 h-64 border-4 border-[#12B981] rounded-[24px] flex items-center justify-center p-4 relative overflow-hidden bg-white">
                        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#12b981,#12b981_10px,transparent_10px,transparent_20px)] opacity-5 absolute rounded-xl inset-0"></div>
                        <QRCodeSVG value={customerData?.cleanPhone || ''} size={200} className="relative z-10" />
                    </div>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{getFuzzyKey(customerData, "ชื่อ")}</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-4">แสดงคิวอาร์โค้ดนี้ให้พนักงานสาขา<br/>เพื่อค้นหาข้อมูลสมาชิกของคุณ</p>
                <button onClick={() => setShowCustomerQR(false)} className="mt-8 bg-gray-100 text-gray-700 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all">
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
      )}

    </div>
  );
}
