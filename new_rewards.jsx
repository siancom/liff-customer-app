         {activeNav === 'rewards' && (() => {
            const totalAccumulated = parseNumber(customerData?.realAccumulatedAmount) || 0;
            const totalPoints = Math.floor(totalAccumulated / 50);
            const spentPoints = rewardRedemptions.reduce((sum, r) => sum + (r.pointsUsed || r.points || 0), 0);
            const currentPoints = totalPoints - spentPoints;
            const spins = Number(customerData?.spinTickets) || 0;
            const goldens = customerData?.goldenTickets || [];

            return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
               {/* 🌟 Premium Dark Points Card 🌟 */}
               <div className="relative rounded-[28px] p-6 text-white shadow-2xl overflow-hidden mx-1">
                  {/* Animated Gradient Background */}
                  <div className="absolute inset-0 bg-slate-900"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[40px] -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/20 rounded-full blur-[40px] -ml-10 -mb-10"></div>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  
                  <div className="relative z-10 flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                           <Gift size={20} className="text-white drop-shadow-md" />
                        </div>
                        <div>
                           <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">IRIS Privilege</h2>
                           <p className="text-sm font-bold text-white tracking-wide">Rewards</p>
                        </div>
                     </div>
                     <span className="text-[9px] bg-white/10 px-2.5 py-1 rounded-full font-black border border-white/20 backdrop-blur-md">1 แต้ม = 50 บาท</span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center justify-center py-4 my-2">
                     <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-1">แต้มสะสมปัจจุบัน</p>
                     <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black bg-gradient-to-r from-white via-indigo-100 to-rose-200 text-transparent bg-clip-text drop-shadow-lg">{currentPoints.toLocaleString()}</span>
                        <span className="text-sm font-bold text-white/70">PTS</span>
                     </div>
                  </div>

                  <div className="relative z-10 flex justify-between items-center text-[10px] font-black text-white/60 bg-white/5 rounded-2xl p-3 border border-white/10 backdrop-blur-sm mt-4">
                     <div className="flex flex-col">
                        <span className="text-white/40 uppercase tracking-wider text-[8px]">สะสมทั้งหมด</span>
                        <span className="text-white text-sm">{totalPoints.toLocaleString()}</span>
                     </div>
                     <div className="w-px h-8 bg-white/10"></div>
                     <div className="flex flex-col text-right">
                        <span className="text-white/40 uppercase tracking-wider text-[8px]">ใช้ไปแล้ว</span>
                        <span className="text-white text-sm">{spentPoints.toLocaleString()}</span>
                     </div>
                  </div>
               </div>

               {/* 🎰 Gamification VIP Tickets (If any) */}
               {(spins > 0 || goldens.length > 0) && (
                   <div className="mx-1 mt-2">
                       <div className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 p-0.5 rounded-[24px] shadow-lg shadow-amber-500/20">
                           <div className="bg-gradient-to-br from-amber-50 to-white rounded-[22px] p-4 relative overflow-hidden">
                               <div className="absolute right-0 top-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl"></div>
                               <div className="relative z-10">
                                   <div className="flex items-center gap-2 mb-3">
                                       <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                                           <Sparkles size={16} />
                                       </div>
                                       <div>
                                           <h3 className="text-sm font-black text-amber-900 leading-tight">สิทธิ์จับรางวัลพิเศษ</h3>
                                           <p className="text-[9px] font-bold text-amber-600">Gamification Privileges</p>
                                       </div>
                                   </div>
                                   <div className="flex flex-wrap gap-2">
                                       {spins > 0 && (
                                           <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-md">
                                               <span className="text-sm">🎡</span>
                                               <span className="text-[10px] font-black tracking-wide">หมุนวงล้อ x{spins}</span>
                                           </div>
                                       )}
                                       {goldens.map((g, i) => (
                                           <div key={i} className="flex items-center gap-1.5 bg-slate-900 text-amber-400 px-3 py-1.5 rounded-full shadow-md border border-amber-500/30">
                                               <span className="text-sm">⭐</span>
                                               <span className="text-[10px] font-black font-mono">{g}</span>
                                           </div>
                                       ))}
                                   </div>
                                   <p className="text-[9px] font-bold text-amber-700/60 mt-3 flex items-center gap-1">
                                       <Info size={10} /> โปรดแจ้งพนักงานที่สาขาเพื่อใช้สิทธิ์
                                   </p>
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {/* 🎯 แลกแต้มรับสิทธิพิเศษ */}
               <div className="px-1">
                   <div className="flex items-center justify-between mb-4">
                       <h3 className="text-[13px] font-black text-gray-800 flex items-center gap-1.5"><Target size={16} className="text-indigo-500"/> แลกแต้มรับคูปอง</h3>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                       {REDEEM_TIERS.map((reward, i) => {
                           const canRedeem = currentPoints >= reward.points;
                           return (
                               <div key={i} className={`group bg-white rounded-[24px] border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ${canRedeem ? 'shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1' : 'opacity-80 grayscale-[20%]'}`}>
                                   <div className={`h-24 bg-gradient-to-br ${reward.grad} relative flex items-center justify-center`}>
                                       <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
                                       <div className="absolute top-2.5 right-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-black text-white px-2 py-0.5 rounded-full shadow-sm">
                                           {reward.points} แต้ม
                                       </div>
                                       <span className={`text-4xl drop-shadow-lg transition-transform duration-500 ${canRedeem ? 'group-hover:scale-110' : ''}`}>{reward.emoji}</span>
                                   </div>
                                   <div className="p-3.5 flex flex-col flex-1 bg-white">
                                       <h4 className="text-[11px] font-black text-gray-800 leading-tight mb-1">{reward.name}</h4>
                                       <p className="text-[9px] text-gray-500 leading-tight flex-1 mb-3">{reward.desc}</p>
                                       <button
                                           onClick={() => handleRedeemReward(reward)}
                                           disabled={!canRedeem || isRedeeming}
                                           className={`w-full py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${
                                               canRedeem 
                                               ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 active:scale-95 hover:bg-slate-800' 
                                               : 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'
                                           }`}>
                                           {canRedeem ? 'แลกรางวัลเลย' : `ขาดอีก ${reward.points - currentPoints} แต้ม`}
                                       </button>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               </div>

               {/* 🎫 คูปอง & โปรโมชั่น */}
               {(() => {
                   const personalCoupons = dbCoupons.filter(c => c.isPersonal && c.customerPhone === customerData?.cleanPhone).map(c => c.code);
                   const myCouponCodes = Array.from(new Set([...(customerData?.collectedCoupons || []), ...personalCoupons]));
                   const validCoupons = myCouponCodes.map(code => resolveCouponInfo(code)).filter(Boolean);
                   const available = dbCoupons.filter(c => c.code && !c.isPersonal && !c.isUsed && !c.isBatch && !(customerData?.collectedCoupons || []).includes(c.code)).slice(0, 4);
                   
                   if (validCoupons.length === 0 && available.length === 0) return null;

                   return (
                   <div className="px-1 mt-6">
                       <h3 className="text-[13px] font-black text-gray-800 flex items-center mb-3 gap-1.5"><TicketCheck size={16} className="text-teal-500"/> คูปองส่วนลดของคุณ</h3>
                       
                       {available.length > 0 && (
                           <div className="mb-4">
                               <p className="text-[9px] font-bold text-teal-600 mb-2 uppercase tracking-wide">คูปองใหม่ที่เก็บได้</p>
                               <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3 -mx-1 px-1">
                                   {available.map((c, i) => {
                                       const v = Number(c.value) || 0;
                                       const desc = c.desc || (c.type === 'percent' ? `ลด ${v}%` : `ลด ฿${v}`);
                                       return (
                                           <div key={i} className="shrink-0 w-44 relative bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-0.5 shadow-sm">
                                               <div className="bg-white rounded-[14px] p-3 h-full flex flex-col justify-between">
                                                   <div>
                                                       <span className="text-lg font-black bg-gradient-to-r from-teal-500 to-emerald-500 text-transparent bg-clip-text leading-none">{c.type === 'percent' ? `${v}%` : `฿${v}`}</span>
                                                       <p className="text-[9px] text-gray-500 font-bold mt-1 line-clamp-2">{desc}</p>
                                                   </div>
                                                   <button
                                                       onClick={async () => {
                                                           await handleCollectCoupon(c.code);
                                                           showToast('เก็บคูปองสำเร็จ! 🎟️');
                                                       }}
                                                       className="mt-3 w-full py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white rounded-lg text-[9px] font-black transition-colors">
                                                       เก็บคูปอง
                                                   </button>
                                               </div>
                                           </div>
                                       );
                                   })}
                               </div>
                           </div>
                       )}

                       {validCoupons.length > 0 && (
                           <div>
                               <p className="text-[9px] font-bold text-gray-400 mb-2 uppercase tracking-wide">คูปองของฉัน ({validCoupons.length})</p>
                               <div className="space-y-3">
                                   {validCoupons.map((info, idx) => (
                                       <div key={idx}
                                           onClick={() => { if (!info.isUsed) setShowCouponQR(info); }}
                                           className={`relative rounded-2xl border flex items-center p-3 transition-all ${
                                               info.isUsed 
                                               ? 'bg-gray-50 border-gray-100 opacity-60' 
                                               : 'bg-white border-teal-100 shadow-sm hover:shadow-md hover:border-teal-300 cursor-pointer active:scale-[0.98]'
                                           }`}>
                                           
                                           {/* Left Decorator */}
                                           {!info.isUsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-teal-400 to-emerald-400 rounded-r-full"></div>}
                                           
                                           <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ml-2 ${
                                               info.isUsed ? 'bg-gray-100 text-gray-400' : 'bg-teal-50 text-teal-600'
                                           }`}>
                                               <span className="text-[10px] font-black leading-none">ลด</span>
                                               <span className="text-base font-black leading-none mt-0.5">{info.type === 'percent' ? `${info.value}%` : `฿${info.value}`}</span>
                                           </div>
                                           
                                           <div className="flex-1 min-w-0 px-3 border-r border-dashed border-gray-200">
                                               <p className={`font-black text-xs font-mono tracking-wide flex items-center gap-1.5 ${info.isUsed ? 'text-gray-500' : 'text-slate-800'}`}>
                                                   {info.code}
                                                   {info.isUsed && <span className="text-[8px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-sans">ใช้แล้ว</span>}
                                               </p>
                                               <p className="text-[9px] text-gray-500 truncate mt-0.5">{info.desc}</p>
                                               {info.validUntil && <p className="text-[8px] text-orange-500 font-bold mt-1 bg-orange-50 inline-block px-1.5 py-0.5 rounded">หมดอายุ {info.validUntil}</p>}
                                           </div>
                                           
                                           <div className="w-16 shrink-0 flex flex-col items-center justify-center">
                                               {info.isUsed ? (
                                                   <span className="text-[10px] font-black text-gray-300">USED</span>
                                               ) : (
                                                   <>
                                                       <QrCode size={20} className="text-teal-500 mb-1" />
                                                       <span className="text-[8px] font-black text-teal-600">แตะใช้สิทธิ์</span>
                                                   </>
                                               )}
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}
                   </div>
                   );
               })()}

               {/* 🔥 โปรโมชั่นจากร้าน */}
               {(() => {
                   const promos = dbPromotions.filter(p => p.name && p.isActive !== false).slice(0, 5);
                   if (promos.length === 0) return null;
                   return (
                       <div className="px-1 mt-6">
                           <h3 className="text-[13px] font-black text-gray-800 flex items-center mb-3 gap-1.5"><Flame size={16} className="text-rose-500"/> ฮอตโปรโมชั่น</h3>
                           <div className="grid gap-3">
                               {promos.map((p, i) => {
                                   const badge = (Number(p.freeItemQty) >= 1) ? '🎁 ซื้อ 1 ฟรี 1'
                                       : (Number(p.value) > 0 && Number(p.minPurchaseAmount) > 0) ? `ลด ฿${Number(p.value).toLocaleString()}`
                                       : (Number(p.value) > 0) ? `ลด ฿${Number(p.value).toLocaleString()}`
                                       : 'โปรพิเศษ';
                                   return (
                                       <div key={p.id || i} className="bg-white border border-gray-100 rounded-[20px] p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                                           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 flex flex-col items-center justify-center shrink-0">
                                               <span className="text-lg">🔥</span>
                                           </div>
                                           <div className="flex-1 min-w-0">
                                               <div className="flex items-start justify-between gap-2">
                                                   <p className="text-[11px] font-black text-gray-800 leading-snug line-clamp-2">{p.name}</p>
                                                   <span className="shrink-0 text-[8px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 whitespace-nowrap">{badge}</span>
                                               </div>
                                               {p.description && <p className="text-[9px] text-gray-500 leading-snug mt-1 line-clamp-1">{p.description}</p>}
                                           </div>
                                       </div>
                                   );
                               })}
                           </div>
                       </div>
                   );
               })()}

               {/* 🌟 Redemption History 🌟 */}
               {rewardRedemptions.length > 0 && (
               <div className="mt-8 px-1">
                   <h3 className="text-[13px] font-black text-gray-800 flex items-center mb-3 gap-1.5"><HistoryIcon size={16} className="text-slate-400"/> ประวัติการแลกแต้ม</h3>
                   <div className="space-y-3">
                       {rewardRedemptions.map((redemption, i) => (
                           <div key={i} className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                       <Gift size={18} />
                                   </div>
                                   <div>
                                       <h4 className="text-[11px] font-bold text-gray-800 mb-0.5 flex items-center gap-1.5">
                                          {redemption.name || redemption.rewardName}
                                          {redemption.isUsed && <span className="bg-slate-100 text-slate-500 text-[8px] px-1.5 py-0.5 rounded font-black">ใช้แล้ว</span>}
                                       </h4>
                                       <p className="text-[9px] text-gray-400 flex items-center">
                                           <Clock size={10} className="mr-1"/> 
                                           {redemption.redeemedAt ? new Date(redemption.redeemedAt).toLocaleDateString('th-TH') : (redemption.createdAt?.toDate ? redemption.createdAt.toDate().toLocaleDateString('th-TH') : 'กำลังดำเนินการ')}
                                       </p>
                                   </div>
                               </div>
                               <div className="text-right shrink-0">
                                   <span className="text-slate-600 font-black text-[11px] block mb-1">-{redemption.pointsUsed} pts</span>
                                   {!redemption.isUsed && (
                                       <button 
                                          onClick={() => setShowRewardQR(redemption)}
                                          className="text-[9px] bg-slate-900 text-white px-2.5 py-1 rounded-lg font-bold shadow-sm active:scale-95 transition-transform"
                                       >
                                          QR Code
                                       </button>
                                   )}
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
               )}
            </div>
            );
         })()}
