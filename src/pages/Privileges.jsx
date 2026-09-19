import React, { useState } from 'react';
import { Gift, Sparkles, Star, Heart, ArrowRight, Loader2, Ticket, CheckCircle2, QrCode, Camera, Clock } from 'lucide-react';
import { parseThaiDate, getFuzzyKey } from '../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';
import Gamification from './Gamification';

export default function Privileges({ customerData, parseNumber, handleRedeemReward, MOCK_COUPONS, marketingPromotions, handleCollectCoupon, dbLuckyPrizes, dbRedeemTiers, showToast, handleRequestVIPUpgrade }) {
  const tier = customerData?.memberStatus || 'Member';
  const [activeSubTab, setActiveSubTab] = useState('rewards');

  // Calculate birthday month
  const birthdayVal = customerData ? (getFuzzyKey(customerData, ["วันเกิด", "birthday"]) || '') : '';
  let birthMonth = null;
  if (birthdayVal) {
     const birthDateObj = new Date(birthdayVal);
     if (!isNaN(birthDateObj.getTime())) {
        birthMonth = birthDateObj.getMonth();
     } else {
        const parts = String(birthdayVal).split(/[-/]/);
        if (parts.length >= 3) {
           birthMonth = parseInt(parts[1], 10) - 1;
        }
     }
  }

  // Calculate points history & total dynamic points
  let totalEarnedPoints = 0;
  const pointsHistory = [];
  const historyList = customerData?.history || [];
  historyList.forEach((h, index) => {
      const type = String(getFuzzyKey(h, ["ประเภท", "col_4"]) || '');
      const amt = parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด", "col_19"])) || 0;
      const dateStr = String(getFuzzyKey(h, ["วันที่", "col_3", "col_1"]) || '').trim();
      
      const isSpend = type.includes('เบิก') || type.includes('จ่าย') || type.includes('หัก') || type.includes('ถอน');
      if (amt > 0 && !isSpend) {
          let basePoints = Math.floor(amt / 100);
          if (basePoints > 0) {
              let multiplier = 1;
              const badges = [];
              
              const parsedDate = parseThaiDate(dateStr);
              if (parsedDate) {
                  const day = parsedDate.getDate();
                  const month = parsedDate.getMonth();
                  
                  if (day === (month + 1)) {
                      multiplier = 2;
                      badges.push(`วันเลขเบิ้ล (${day}/${month + 1})`);
                  }
                  
                  if (birthMonth !== null && month === birthMonth) {
                      multiplier = 2;
                      badges.push(`โปรเดือนเกิด`);
                  }
              }
              
              const pointsEarned = basePoints * multiplier;
              totalEarnedPoints += pointsEarned;
              pointsHistory.push({
                  id: `earn-${index}`,
                  date: dateStr,
                  title: `ได้รับคะแนนจากการซื้อสินค้า/บริการ`,
                  desc: type || 'ชำระเงินหน้าร้าน',
                  points: pointsEarned,
                  type: 'earn',
                  amount: amt,
                  badges: badges,
                  timestamp: parsedDate ? parsedDate.getTime() : 0
              });
          }
      }
  });

  // Fallback to lifetime spend if no history matched but there is spent balance
  if (totalEarnedPoints === 0 && (parseNumber(customerData?.realAccumulatedAmount) || 0) > 0) {
      totalEarnedPoints = Math.floor((parseNumber(customerData?.realAccumulatedAmount) || 0) / 100);
  }

  const points = totalEarnedPoints - parseNumber(customerData?.redeemedPoints || 0);

  const redeemedRewardsList = customerData?.redeemedRewards || [];
  redeemedRewardsList.forEach((item, index) => {
      pointsHistory.push({
          id: `redeem-${item.id || index}`,
          date: item.redeemedAt ? new Date(item.redeemedAt).toLocaleDateString('th-TH') : '-',
          title: `แลกรับของรางวัล: ${item.name}`,
          desc: item.isUsed ? 'ใช้สิทธิ์เรียบร้อยแล้ว' : 'ยังไม่ได้ใช้สิทธิ์',
          points: -item.points,
          type: 'redeem',
          amount: null,
          badges: [],
          timestamp: item.redeemedAt ? new Date(item.redeemedAt).getTime() : 0
      });
  });

  pointsHistory.sort((a, b) => b.timestamp - a.timestamp);
  const [redeemingId, setRedeemingId] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ show: false, msg: '', type: '' });
  const [showQRVoucher, setShowQRVoucher] = useState(null);

  const activePromos = marketingPromotions?.filter(p => p.isActive !== false) || [];

  const rewards = (dbRedeemTiers || []).filter(r => r.isActive !== false);

  const doRedeem = async (reward) => {
      setRedeemingId(reward.id);
      const res = await handleRedeemReward(reward);
      if(res.success) {
          setAlertMsg({ show: true, msg: 'แลกของรางวัลสำเร็จ!', type: 'success' });
      } else {
          setAlertMsg({ show: true, msg: res.msg || 'เกิดข้อผิดพลาด', type: 'error' });
      }
      setRedeemingId(null);
      setTimeout(() => setAlertMsg({ show: false, msg: '', type: '' }), 3000);
  };

  const redeemedList = customerData?.redeemedRewards || [];
  const collectedCoupons = customerData?.collectedCoupons || [];
  
  const generalCoupons = (MOCK_COUPONS || []).filter(c => !c.isPersonal && !c.isBatch && c.isActive !== false);
  const personalVouchers = (MOCK_COUPONS || []).filter(c => c.isPersonal && c.customerPhone === customerData?.cleanPhone);

  const handleScanCode = async () => {
    if (window.liff && window.liff.isLoggedIn() && window.liff.scanCodeV2) {
      try {
        const result = await window.liff.scanCodeV2();
        if (result && result.value) {
            handleScanResult(result.value);
        }
      } catch (e) {
        if (showToast) showToast("เกิดข้อผิดพลาดในการเปิดกล้อง หรือไม่ได้ใช้งานผ่านแอป LINE", "error");
      }
    } else {
        const code = window.prompt("จำลองการสแกน (นอกแอป LINE) กรุณากรอกรหัสคูปอง:");
        if (code) handleScanResult(code);
    }
  };

  const handleScanResult = (val) => {
      try {
          const data = JSON.parse(val);
          if (data.type === 'voucher' && data.code) {
             handleCollectCoupon(data.code);
          } else {
             handleCollectCoupon(val);
          }
      } catch(e) {
          handleCollectCoupon(val);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      {alertMsg.show && (
         <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center animate-in slide-in-from-top-4 ${alertMsg.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {alertMsg.type === 'success' ? <CheckCircle2 size={16} className="mr-2"/> : null} {alertMsg.msg}
         </div>
      )}

      {/* Header Profile Summary */}
      <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-[32px] p-6 text-white shadow-lg relative overflow-hidden -mx-4 -mt-6 rounded-t-none">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-teal-100 mb-1">สิทธิพิเศษ & ของรางวัล</h2>
            <p className="text-3xl font-black mb-2 flex items-center">
                {points.toLocaleString()} <Star size={24} className="ml-2 text-yellow-300 fill-yellow-300 drop-shadow-sm" />
            </p>
            <p className="text-sm font-bold opacity-90 mb-4">คะแนนสะสม (Iris Points)</p>

            <div className="flex gap-2">
                <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20 flex-1 text-center">
                    <p className="text-[10px] text-teal-100 font-bold mb-1">สถานะสมาชิก</p>
                    <p className="text-sm font-black">{tier}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20 flex-1 text-center">
                    <p className="text-[10px] text-teal-100 font-bold mb-1">คะแนนหมดอายุ</p>
                    <p className="text-sm font-black text-white/80">-</p>
                </div>
            </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-20 mb-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex gap-1">
              <button onClick={() => setActiveSubTab('rewards')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-1.5 ${activeSubTab === 'rewards' ? 'bg-teal-100 text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Gift size={14} /> สิทธิพิเศษ
              </button>
              <button onClick={() => setActiveSubTab('pointsHistory')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-1.5 ${activeSubTab === 'pointsHistory' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Clock size={14} /> ประวัติคะแนน
              </button>
              <button onClick={() => setActiveSubTab('gamification')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-1.5 ${activeSubTab === 'gamification' ? 'bg-purple-100 text-purple-700' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Sparkles size={14} /> ลุ้นโชค
              </button>
          </div>
      </div>

      {activeSubTab === 'pointsHistory' && (
          <div className="space-y-4 animate-in fade-in duration-300 px-1 pb-10">
              <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-6 -mt-6"></div>
                  <div className="relative z-10 flex justify-between items-center">
                      <div>
                          <h4 className="font-bold text-indigo-100 text-xs mb-1 uppercase tracking-wider">คะแนนสะสมทั้งหมด</h4>
                          <span className="text-3xl font-black tracking-tight flex items-center gap-1.5">
                              {points.toLocaleString()} <Star size={24} className="fill-yellow-300 text-yellow-300 drop-shadow-sm" />
                          </span>
                      </div>
                      <div className="text-right bg-white/20 backdrop-blur-sm border border-white/20 px-3.5 py-2 rounded-2xl">
                          <p className="text-[9px] text-indigo-100 font-bold mb-0.5">เดือนเกิดของคุณ</p>
                          <p className="text-xs font-black">
                              {(() => {
                                  if (birthMonth === null) return 'ไม่ได้ระบุ';
                                  const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
                                  return months[birthMonth];
                              })()}
                          </p>
                      </div>
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-3 flex justify-between text-[9px] text-indigo-100/90 font-bold">
                      <span>ยอดแต้มที่เคยสะสมรวม: {totalEarnedPoints.toLocaleString()} แต้ม</span>
                      <span>แลกรับไปแล้ว: {parseNumber(customerData?.redeemedPoints).toLocaleString()} แต้ม</span>
                  </div>
              </div>

              <div className="space-y-3">
                  {pointsHistory.length > 0 ? (
                      pointsHistory.map((item) => {
                          const isEarn = item.type === 'earn';
                          return (
                              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
                                  <div className="flex-1 min-w-0 pr-3">
                                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                          <h4 className="font-bold text-slate-800 text-xs truncate leading-snug">{item.title}</h4>
                                          {item.badges.map(badge => (
                                              <span key={badge} className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-amber-200">
                                                  {badge}
                                              </span>
                                          ))}
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-medium mb-0.5">{item.desc}</p>
                                      <p className="text-[9px] text-slate-400 font-mono">วันที่: {item.date}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                      <span className={`font-black text-base flex items-center justify-end gap-0.5 ${isEarn ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {isEarn ? '+' : ''}{item.points.toLocaleString()} <Star size={12} className={isEarn ? 'fill-emerald-100 text-emerald-600' : 'fill-rose-100 text-rose-600'} />
                                      </span>
                                      {isEarn && item.amount > 0 && (
                                          <p className="text-[8px] text-slate-400 font-bold mt-0.5">ยอดซื้อ ฿{item.amount.toLocaleString()}</p>
                                      )}
                                  </div>
                              </div>
                          );
                      })
                  ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                          <Star size={32} className="mx-auto text-gray-300 mb-2 opacity-50"/>
                          <p className="text-xs text-gray-400 font-bold">ยังไม่มีประวัติการสะสมคะแนน</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeSubTab === 'gamification' && (
          <Gamification 
              customerData={customerData} 
              dbLuckyPrizes={dbLuckyPrizes}
              showToast={showToast}
              onGoToRewards={() => setActiveSubTab('rewards')}
          />
      )}

      {activeSubTab === 'rewards' && (
      <>
      {/* Coupons Section */}
      <div>
         <div className="flex justify-between items-center mb-3 px-1 mt-6">
             <h3 className="text-sm font-black text-gray-800 flex items-center">
                 <Ticket size={18} className="mr-2 text-teal-600"/> คูปองส่วนลดสำหรับคุณ
             </h3>
             <button onClick={handleScanCode} className="bg-teal-50 text-teal-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform border border-teal-100 shadow-sm">
                 <Camera size={14} /> สแกนรับคูปอง
             </button>
         </div>
         <div className="space-y-3 px-1">
            {generalCoupons.length > 0 ? (
                generalCoupons.map(coupon => {
                    const isCollected = collectedCoupons.includes(coupon.code);
                    const isSpins = coupon.type === 'gamification_spins';
                    return (
                        <div key={coupon.code} className={`flex items-center rounded-[20px] p-3 shadow-sm border ${isCollected ? 'bg-gray-50 border-gray-100 opacity-70' : isSpins ? 'bg-white border-purple-100' : 'bg-white border-teal-100'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black mr-3 shrink-0 ${isSpins ? 'bg-purple-50 text-purple-600' : 'bg-teal-50 text-teal-600'}`}>
                                {isSpins ? <Sparkles size={20}/> : coupon.type === 'percent' ? '%' : coupon.type === 'free_item' ? <Gift size={20}/> : '฿'}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-xs mb-0.5">{coupon.code}</h4>
                                <p className="text-[10px] text-gray-500">{coupon.desc}</p>
                            </div>
                            <button 
                                disabled={isCollected}
                                onClick={() => handleCollectCoupon(coupon.code)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isCollected ? 'bg-gray-200 text-gray-400' : isSpins ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-sm' : 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95 shadow-sm'}`}
                            >
                                {isCollected ? 'เก็บแล้ว' : isSpins ? 'กดรับสิทธิ์' : 'เก็บคูปอง'}
                            </button>
                        </div>
                    );
                })
            ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center text-gray-400 text-xs">
                    ยังไม่มีคูปองส่วนลดในขณะนี้
                </div>
            )}
         </div>
      </div>
      
      {/* Vouchers Section */}
      <div>
         <h3 className="text-sm font-black text-gray-800 flex items-center mb-3 px-1 mt-6">
             <Gift size={18} className="mr-2 text-fuchsia-500"/> Gift Voucher ของฉัน (คิวอาร์โค้ด)
         </h3>
         <div className="space-y-3 px-1">
            {personalVouchers.length > 0 ? (
                personalVouchers.map(coupon => {
                    const isUsed = coupon.isUsed;
                    return (
                        <div key={coupon.code} className={`flex items-center rounded-[20px] p-3 shadow-sm border ${isUsed ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-fuchsia-200'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black mr-3 shrink-0 ${isUsed ? 'bg-gray-200 text-gray-400' : 'bg-fuchsia-50 text-fuchsia-600'}`}>
                                {coupon.type === 'percent' ? '%' : coupon.type === 'free_item' ? <Gift size={20}/> : '฿'}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-xs mb-0.5">{coupon.code}</h4>
                                <p className="text-[10px] text-gray-500">{coupon.desc}</p>
                            </div>
                            <button 
                                disabled={isUsed}
                                onClick={() => setShowQRVoucher({ type: 'voucher', code: coupon.code })}
                                className={`px-3 py-1.5 flex items-center gap-1 rounded-lg text-[10px] font-bold transition-all ${isUsed ? 'bg-gray-200 text-gray-400' : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700 active:scale-95 shadow-sm'}`}
                            >
                                {isUsed ? 'ใช้แล้ว' : <><QrCode size={12}/> สแกนใช้สิทธิ์</>}
                            </button>
                        </div>
                    );
                })
            ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center text-gray-400 text-xs">
                    ไม่มี Gift Voucher หรือ E-Coupon ในขณะนี้
                </div>
            )}
         </div>
      </div>

      {/* Promos */}
      <div>
         <h3 className="text-sm font-black text-gray-800 flex items-center mb-4 px-1">
             <Sparkles size={18} className="mr-2 text-teal-600"/> โปรโมชั่นพิเศษสำหรับคุณ
         </h3>
         <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide px-1 snap-x">
             {activePromos && activePromos.length > 0 ? (
                 activePromos.map(promo => (
                     <div key={promo.id} className="w-[280px] shrink-0 bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative group snap-start">
                         <div className="h-32 w-full overflow-hidden relative">
                             <img src={promo.image} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-600 text-[10px] font-black px-2 py-1 rounded-lg border border-white/50 shadow-sm">
                                 {promo.badge}
                             </div>
                         </div>
                         <div className="p-4">
                             <h4 className="font-black text-gray-900 text-sm mb-1 line-clamp-1">{promo.title}</h4>
                             <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{promo.desc}</p>
                         </div>
                     </div>
                 ))
             ) : (
                 <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-center text-gray-400 text-xs">
                     ยังไม่มีแบนเนอร์โปรโมชั่นในขณะนี้
                 </div>
             )}
         </div>
      </div>

      {/* Rewards Catalog */}
      <div>
         <div className="flex justify-between items-center mb-4 px-1">
             <h3 className="text-sm font-black text-gray-800 flex items-center">
                 <Gift size={18} className="mr-2 text-teal-600"/> ของรางวัลน่าแลก
             </h3>
         </div>

         <div className="grid grid-cols-2 gap-3 px-1">
             {rewards.map(reward => {
                 const canRedeem = points >= reward.points;
                 const isRedeeming = redeemingId === reward.id;
                 return (
                 <div key={reward.id} className={`bg-white rounded-[20px] shadow-sm border p-3 flex flex-col relative group ${!canRedeem ? 'border-gray-100 opacity-80' : 'border-teal-100'}`}>
                     <div className={`h-28 rounded-xl overflow-hidden mb-3 bg-gradient-to-br ${reward.grad || 'from-teal-400 to-teal-500'} flex items-center justify-center relative`}>
                         <span className={`text-5xl drop-shadow-md transition-transform duration-300 ${canRedeem ? 'group-hover:scale-110' : 'grayscale'}`}>{reward.emoji || '🎁'}</span>
                     </div>
                     <h4 className="font-bold text-gray-800 text-xs mb-1 line-clamp-2 min-h-[32px] leading-tight">{reward.name}</h4>
                     {reward.desc && <p className="text-[10px] text-gray-500 mb-2 line-clamp-1">{reward.desc}</p>}
                     
                     <div className="mt-auto">
                        <div className={`flex items-center font-black text-sm mb-2 ${canRedeem ? 'text-teal-600' : 'text-gray-400'}`}>
                           <Star size={14} className={`${canRedeem ? 'fill-teal-600 text-teal-600' : 'fill-gray-400 text-gray-400'} mr-1`} />
                           {reward.points.toLocaleString()}
                        </div>
                        <button 
                            disabled={!canRedeem || isRedeeming}
                            onClick={() => doRedeem(reward)}
                            className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all border flex items-center justify-center ${canRedeem ? 'border-teal-200 text-teal-600 hover:bg-teal-50 active:scale-95' : 'border-gray-200 text-gray-400 bg-gray-50'}`}
                        >
                            {isRedeeming ? <Loader2 size={14} className="animate-spin text-teal-600" /> : 'แลกรางวัล'}
                        </button>
                     </div>
                 </div>
             )})}
         </div>
      </div>
      
      {/* Redeemed History */}
      {redeemedList.length > 0 && (
          <div>
             <h3 className="text-sm font-black text-gray-800 flex items-center mb-3 px-1 mt-6">
                 <Gift size={18} className="mr-2 text-indigo-500"/> ของรางวัลที่แลกแล้ว
             </h3>
             <div className="space-y-3 px-1">
                  {redeemedList.map(item => {
                      const isUsed = item.isUsed;
                      return (
                          <div key={item.id} className={`flex items-center rounded-[20px] p-4 shadow-sm border ${isUsed ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-indigo-100'}`}>
                              <div className="flex-1 min-w-0 pr-3">
                                  <h4 className="font-bold text-gray-900 text-xs mb-1 truncate">{item.name}</h4>
                                  <p className="text-[9px] text-gray-500 font-mono">แลกเมื่อ: {new Date(item.redeemedAt).toLocaleDateString('th-TH')}</p>
                              </div>
                              <div className="text-right shrink-0">
                                 {isUsed ? (
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                        ใช้สิทธิ์แล้ว
                                    </span>
                                 ) : (
                                    <button 
                                        onClick={() => setShowQRVoucher({ 
                                            type: 'reward', 
                                            code: item.id, 
                                            customerId: customerData.id, 
                                            name: item.name 
                                        })}
                                        className="px-3 py-1.5 flex items-center gap-1 rounded-lg text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm"
                                    >
                                        <QrCode size={12}/> สแกนใช้สิทธิ์
                                    </button>
                                 )}
                              </div>
                          </div>
                      );
                  })}
             </div>
          </div>
      )}

      <button 
          onClick={() => {
              if (handleRequestVIPUpgrade) {
                  handleRequestVIPUpgrade();
              }
          }}
          className="w-full text-left bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-[24px] p-5 shadow-sm border border-teal-100 flex items-center justify-between mb-4 mt-8 group hover:shadow-md transition-shadow active:scale-95"
      >
          <div>
              <h4 className="font-black text-teal-700 text-sm mb-1 flex items-center"><Heart size={16} className="mr-1.5 text-teal-600" /> อัปเกรดระดับสมาชิก</h4>
              <p className="text-[10px] text-teal-600/80">สะสมยอดซื้อครบ 5,000.- เพื่อเลื่อนเป็น VIP</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm border border-teal-100 group-hover:scale-110 transition-transform">
              <ArrowRight size={18} />
          </div>
      </button>
      </>
      )}

      {/* QR Code Modal */}
      {showQRVoucher && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setShowQRVoucher(null)}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
               <div className="absolute -top-12 bg-white/20 p-2 rounded-full backdrop-blur-md" onClick={() => setShowQRVoucher(null)}>
                  <div className="bg-white text-gray-800 rounded-full p-2 cursor-pointer shadow-lg hover:bg-gray-100">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </div>
               </div>
               
               <div className="text-center mb-6">
                  <h3 className="font-black text-xl text-gray-900">แสกนเพื่อใช้สิทธิ์</h3>
                  <p className="text-sm text-gray-500 mt-1">แสดงคิวอาร์โค้ดนี้ให้พนักงานหน้าเคาน์เตอร์</p>
               </div>
               
               <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
                  <QRCodeSVG 
                     value={JSON.stringify(showQRVoucher)} 
                     size={220} 
                     level="H"
                     includeMargin={false}
                  />
               </div>
               
               <div className="mt-6 text-center w-full px-4">
                  <p className="text-xs font-bold text-gray-400 mb-1">
                     {showQRVoucher.type === 'reward' ? 'ชื่อของรางวัลที่แลก' : 'รหัสอ้างอิง'}
                  </p>
                  <p className={`font-black text-fuchsia-600 ${showQRVoucher.type === 'reward' ? 'text-sm line-clamp-2' : 'text-lg tracking-widest'}`}>
                     {showQRVoucher.type === 'reward' ? showQRVoucher.name : showQRVoucher.code}
                  </p>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
