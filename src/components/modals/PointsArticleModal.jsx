import React from 'react';
import { 
  X, Star, Gift, Sparkles, Zap, Cake, Award, ChevronRight, 
  CheckCircle2, Ticket, ShieldCheck, HeartHandshake, ArrowRight,
  TrendingUp, HelpCircle, Layers, Calendar
} from 'lucide-react';

export default function PointsArticleModal({ isOpen, onClose, onGoToPrivileges }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex-1 max-w-xl w-full mx-auto bg-slate-50 flex flex-col overflow-hidden shadow-2xl relative md:my-6 md:rounded-[32px] md:border border-white/20">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-800 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-yellow-300 shadow-inner">
              <Star size={22} className="fill-yellow-300" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-teal-200 font-extrabold flex items-center gap-1">
                <Sparkles size={11} /> IRIS REWARDS GUIDE
              </div>
              <h2 className="text-base font-black leading-tight text-white">การสะสมคะแนน & แลกรางวัล</h2>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Article Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 pb-24 text-slate-700">
          
          {/* Hero Banner / Infographic Overview */}
          <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-44 h-44 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
            <div className="relative z-10">
              <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-2">
                <Sparkles size={11} className="text-yellow-300 fill-yellow-300" /> สิทธิประโยชน์สำหรับสมาชิก Iris Clinic
              </span>
              <h3 className="text-xl font-black mb-1.5 text-white leading-snug">
                ทุกยอดชำระ เปลี่ยนเป็นคะแนนสะสม<br />ยิ่งดูแลผิว ยิ่งสวย ยิ่งคุ้มค่า!
              </h3>
              <p className="text-xs text-teal-50 leading-relaxed opacity-95">
                ทุกครั้งที่คุณใช้จ่ายที่คลินิก ไม่ว่าจะเป็นคอร์สทรีตเมนต์ เลเซอร์ หรือสกินแคร์ ระบบจะคำนวณเป็น <strong>Iris Points</strong> สะสมให้อัตโนมัติทันที
              </p>
            </div>
          </div>

          {/* 🌟 INFOGRAPHIC SECTION 1: 3-STEP CYCLE 🌟 */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">วงจรการสะสมคะแนน (3 ขั้นตอนง่ายๆ)</h4>
                  <p className="text-[10px] text-slate-400">วิธีที่คะแนนของคุณเติบโตและนำไปใช้งาน</p>
                </div>
              </div>
            </div>

            {/* Step Cards with Visual Connectors */}
            <div className="grid grid-cols-1 gap-3 relative">
              
              {/* Step 1 */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50/60 rounded-2xl p-3.5 border border-teal-200/80 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <TrendingUp size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-teal-900">ขั้นตอนที่ 1: ชำระค่าบริการ / ซื้อสินค้า</span>
                    <span className="text-[10px] font-black bg-teal-200/80 text-teal-800 px-2 py-0.5 rounded-full">100 บาท = 1 แต้ม</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    ทุกยอดชำระผ่าน <strong>เงินสด, โอนเงิน (PromptPay), หรือบัตรเครดิต</strong> จะได้รับ 1 Iris Point ทุกๆ 100 บาท สะสมเข้าบัญชีทันทีเมื่อเสร็จสิ้นบิล
                  </p>
                  <div className="mt-2 text-[11px] font-bold text-teal-800 bg-white/80 px-2.5 py-1 rounded-lg border border-teal-200/50 inline-block">
                    💡 ตัวอย่าง: บิลยอด 2,500 บาท = รับทันที 25 คะแนน
                  </div>
                </div>
              </div>

              {/* Step 2: Multipliers */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl p-3.5 border border-amber-200/80 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Zap size={20} className="fill-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-amber-950">ขั้นตอนที่ 2: โบนัสพิเศษ รับแต้มคูณสอง (Double Points x2)</span>
                    <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full animate-pulse">รับแต้ม x2</span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/60 text-xs">
                      <div className="font-bold text-amber-800 flex items-center gap-1.5 mb-0.5">
                        <Calendar size={13} className="text-amber-600" /> วันเลขเบิ้ล (Double Days)
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        ทุกวันที่เลขตรงกับเดือน เช่น <strong>1/1, 2/2, 3/3, 11/11, 12/12</strong> รับคะแนนสะสม 2 เท่า ทุกบิล!
                      </p>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/60 text-xs">
                      <div className="font-bold text-rose-700 flex items-center gap-1.5 mb-0.5">
                        <Cake size={13} className="text-rose-500" /> ตลอดทั้งเดือนเกิดของคุณ
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        เมื่อถึงเดือนเกิดของคุณ ทุกยอดใช้จ่ายทั้งเดือน รับคะแนนสะสม <strong>2 เท่า อัตโนมัติ</strong>!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Redeem */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50/60 rounded-2xl p-3.5 border border-indigo-200/80 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Gift size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-indigo-950">ขั้นตอนที่ 3: แลกรับสิทธิประโยชน์และความคุ้มค่า</span>
                    <span className="text-[10px] font-black bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">เมนู สิทธิพิเศษ</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    นำคะแนนที่สะสมได้ไปแลกของรางวัลสุดพิเศษได้ตลอด 24 ชม. ผ่านแอปพลิเคชัน:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-white p-2 rounded-xl border border-indigo-100 flex items-center gap-2">
                      <Ticket size={16} className="text-indigo-600 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700">คูปองส่วนลดค่าบริการ</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-indigo-100 flex items-center gap-2">
                      <Sparkles size={16} className="text-teal-600 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700">คอร์สทรีตเมนต์/มาร์คฟรี</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-indigo-100 flex items-center gap-2">
                      <Zap size={16} className="text-amber-500 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700">หมุนวงล้อลุ้นโชค</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-indigo-100 flex items-center gap-2">
                      <Gift size={16} className="text-rose-500 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700">แลกรับผลิตภัณฑ์กลับบ้าน</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 🌟 INFOGRAPHIC SECTION 2: MEMBER TIERS & PRIVILEGES 🌟 */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-sm">
                2
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">ระดับสมาชิก Iris Member Tiers</h4>
                <p className="text-[10px] text-slate-400">ยิ่งสะสมยอด ยิ่งปลดล็อกสิทธิพิเศษเหนือระดับ</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { 
                  name: 'Member', 
                  tier: 'สมาชิกทั่วไป', 
                  spend: 'แรกเข้า', 
                  color: 'from-slate-100 to-slate-200 border-slate-300 text-slate-800',
                  badgeColor: 'bg-slate-200 text-slate-700',
                  perks: ['สะสมแต้ม 100 บาท = 1 แต้ม', 'แต้มเบิ้ล x2 วันเลขเบิ้ล & เดือนเกิด', 'แลกคูปองส่วนลดในแอป']
                },
                { 
                  name: 'Silver', 
                  tier: 'ซิลเวอร์', 
                  spend: 'สะสม 10,000 ฿+', 
                  color: 'from-slate-50 to-blue-50 border-blue-200 text-blue-900',
                  badgeColor: 'bg-blue-100 text-blue-800',
                  perks: ['สิทธิ์แลกของรางวัลอัตราพิเศษ', 'จองคิวล่วงหน้าแบบ Priority', 'รับของขวัญวันเกิดพิเศษ']
                },
                { 
                  name: 'Gold', 
                  tier: 'โกลด์', 
                  spend: 'สะสม 30,000 ฿+', 
                  color: 'from-amber-50 to-yellow-50 border-amber-300 text-amber-950',
                  badgeColor: 'bg-amber-200 text-amber-900',
                  perks: ['ส่วนลดค่าบริการพิเศษ 10%', 'รับของขวัญวันเกิดพรีเมียม', 'สิทธิ์ทำทรีตเมนต์ฟรีในเดือนเกิด']
                },
                { 
                  name: 'Platinum', 
                  tier: 'แพลตินัม', 
                  spend: 'สะสม 60,000 ฿+', 
                  color: 'from-cyan-50 to-teal-50 border-teal-300 text-teal-950',
                  badgeColor: 'bg-teal-200 text-teal-900',
                  perks: ['ส่วนลดพิเศษ 15%', 'สิทธิ์ตรวจสแกนสภาพผิวหน้า AI ลึก', 'อัปเกรดเครื่องมือทรีตเมนต์ฟรี']
                },
                { 
                  name: 'VIP', 
                  tier: 'วีไอพี เอ็กซ์คลูซีฟ', 
                  spend: '100,000 ฿+ / ซื้อบัตร VIP', 
                  color: 'from-purple-50 via-pink-50 to-rose-50 border-purple-300 text-purple-950',
                  badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs',
                  perks: ['สิทธิประโยชน์สูงสุดทุกบริการ', 'ห้องทรีตเมนต์ VIP ส่วนตัว', 'วงเงินเครดิตเปิดบิลคุ้มค่า', 'ผู้เชี่ยวชาญดูแลแบบ 1-on-1']
                }
              ].map(t => (
                <div key={t.name} className={`bg-gradient-to-r ${t.color} rounded-2xl p-3.5 border shadow-2xs`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.name}</span>
                      <span className="text-xs font-black">{t.tier}</span>
                    </div>
                    <span className="text-[10px] font-bold opacity-80">{t.spend}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {t.perks.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[11px] opacity-90">
                        <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🌟 INFOGRAPHIC SECTION 3: HOW TO USE IN APP 🌟 */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                3
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">วิธีเช็คและแลกรางวัลผ่านแอป</h4>
                <p className="text-[10px] text-slate-400">สะดวก รวดเร็ว ใช้งานได้ทุกที่</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-[11px] shrink-0">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-800">เข้าเมนู "แลกรางวัล"</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">แตะที่ไอคอนกล่องของขวัญที่แถบเมนูด้านล่างสุดของจอ</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-[11px] shrink-0">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-800">ดูคะแนนและเลือกของรางวัล</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">ตรวจสอบคะแนนคงเหลือ และเลือกคูปองหรือของรางวัลที่สนใจ</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-[11px] shrink-0">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-800">กดแลกรับสิทธิ์</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">กดปุ่ม "แลกรางวัล" หรือ "เก็บคูปอง" เพื่อรับ QR Code หรือรหัสคูปอง</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-black text-[11px] shrink-0">
                  4
                </div>
                <div>
                  <div className="font-bold text-slate-800">นำไปใช้ที่คลินิกหรือในแอป</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">ยื่น QR Code ให้พนักงานที่หน้าร้าน หรือใช้เป็นส่วนลดตอนสั่งซื้อในแอปได้ทันที</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 FAQ & RULES 🌟 */}
          <div className="bg-amber-50/70 rounded-3xl p-4 sm:p-5 border border-amber-200/80 space-y-3">
            <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <HelpCircle size={15} className="text-amber-600" /> ข้อควรรู้เกี่ยวกับคะแนนสะสม (FAQ)
            </h4>
            <div className="space-y-2 text-xs text-amber-900/90 leading-relaxed">
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/50">
                <p className="font-bold text-amber-950 mb-0.5">Q: คะแนนสะสมหมดอายุหรือไม่?</p>
                <p className="text-[11px] text-slate-600">
                  A: คะแนนสะสมจะถูกคำนวณจากยอดการใช้งานจริงตามรอบปีสมาชิก คุณสามารถตรวจสอบประวัติและวันหมดอายุได้ที่แท็บ "ประวัติคะแนน"
                </p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/50">
                <p className="font-bold text-amber-950 mb-0.5">Q: หากยอดคะแนนไม่ขึ้น ต้องทำอย่างไร?</p>
                <p className="text-[11px] text-slate-600">
                  A: ตรวจสอบว่าเบอร์โทรศัพท์ที่ใช้เปิดบิลตรงกับเบอร์ที่ลงทะเบียนไว้ใน LINE หรือส่งสลิปพร้อมเบอร์โทรให้แอดมินช่วยปรับยอดคะแนนสะสมให้ได้ทันที
                </p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/50">
                <p className="font-bold text-amber-950 mb-0.5">Q: สามารถโอนแต้มให้เพื่อนหรือคนในครอบครัวได้ไหม?</p>
                <p className="text-[11px] text-slate-600">
                  A: สำหรับสมาชิก VIP หรือในกรณีคนในครอบครัวเดียวกัน สามารถติดต่อแอดมินเพื่อขอรวมสิทธิ์หรือโอนแต้มระหว่างบัญชีได้
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Fixed Action */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 shadow-lg">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            ปิด
          </button>
          <button 
            type="button" 
            onClick={() => {
              onClose();
              if (onGoToPrivileges) onGoToPrivileges();
            }}
            className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-black text-xs shadow-md shadow-teal-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Gift size={16} />
            <span>ไปที่หน้าสิทธิพิเศษ & แลกรางวัล</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
