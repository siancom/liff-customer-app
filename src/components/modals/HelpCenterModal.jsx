import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, Star, CalendarDays, HelpCircle, ChevronRight, MessageCircle, AlertCircle, 
  ShoppingBag, Wallet, Package, Truck, CheckCircle2, XCircle, Gift, Sparkles, Zap, Cake, Ticket, TrendingUp, Calendar
} from 'lucide-react';

export default function HelpCenterModal({ isOpen, onClose, initialTopic = null }) {
  const [activeTopic, setActiveTopic] = useState(initialTopic);

  useEffect(() => {
    if (initialTopic) {
      setActiveTopic(initialTopic);
    }
  }, [initialTopic, isOpen]);

  if (!isOpen) return null;

  const topics = [
    {
      id: 'usage',
      icon: <BookOpen className="text-blue-500" />,
      title: 'การใช้งานแอปพลิเคชัน',
      content: (
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>เมนูต่างๆ ของแอป:</strong></p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-gray-800">คอร์สของฉัน:</strong> ตรวจสอบรายการคอร์สที่คุณมี จำนวนคงเหลือ และประวัติการใช้งาน</li>
            <li><strong className="text-gray-800">ร้านค้า:</strong> เลือกซื้อสินค้าและบริการเพิ่มเติม</li>
            <li><strong className="text-gray-800">จองคิว:</strong> นัดหมายเพื่อเข้ารับบริการล่วงหน้า</li>
            <li><strong className="text-gray-800">สิทธิพิเศษ:</strong> เช็คคะแนนสะสม แลกของรางวัล และร่วมสนุกกับกิจกรรม</li>
            <li><strong className="text-gray-800">บัญชี:</strong> ตรวจสอบประวัติยอดสะสมและตั้งค่าบัญชี</li>
          </ul>
        </div>
      )
    },
    {
      id: 'order_status',
      icon: <ShoppingBag className="text-purple-500" />,
      title: 'ความหมายของสถานะคำสั่งซื้อ',
      content: (
        <div className="space-y-4 text-sm text-gray-600">
          <p>ระบบของเรามีสถานะคำสั่งซื้อ 5 สถานะหลัก ดังนี้:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-xl border border-orange-100">
              <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm shrink-0"><Wallet size={18} strokeWidth={2.5}/></div>
              <div>
                <strong className="text-orange-700 block mb-0.5">ที่ต้องชำระ (รอชำระเงิน)</strong>
                <span className="text-xs text-orange-800/80">คำสั่งซื้อได้รับการบันทึกแล้ว แต่ยังไม่ได้รับการยืนยันการชำระเงิน กรุณาชำระเงินและแจ้งสลิปเพื่อให้แอดมินดำเนินการต่อ</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm shrink-0"><Package size={18} strokeWidth={2.5}/></div>
              <div>
                <strong className="text-blue-700 block mb-0.5">ที่ต้องจัดส่ง (รอดำเนินการ)</strong>
                <span className="text-xs text-blue-800/80">แอดมินได้รับยอดเงินและยืนยันคำสั่งซื้อแล้ว กำลังอยู่ในขั้นตอนการจัดเตรียมสินค้าหรือบรรจุลงกล่อง</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              <div className="p-2 bg-white rounded-full text-indigo-500 shadow-sm shrink-0"><Truck size={18} strokeWidth={2.5}/></div>
              <div>
                <strong className="text-indigo-700 block mb-0.5">ที่ต้องได้รับ (กำลังจัดส่ง)</strong>
                <span className="text-xs text-indigo-800/80">พัสดุถูกส่งมอบให้บริษัทขนส่งแล้ว คุณสามารถติดตามสถานะการจัดส่งได้จากรายละเอียดคำสั่งซื้อ</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <div className="p-2 bg-white rounded-full text-emerald-500 shadow-sm shrink-0"><CheckCircle2 size={18} strokeWidth={2.5}/></div>
              <div>
                <strong className="text-emerald-700 block mb-0.5">สำเร็จแล้ว</strong>
                <span className="text-xs text-emerald-800/80">คำสั่งซื้อเสร็จสมบูรณ์ สินค้าถูกจัดส่งถึงมือผู้รับเรียบร้อยแล้ว หรือกรณีเป็นคอร์ส ระบบได้เพิ่มเข้าบัญชีของคุณแล้ว</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
              <div className="p-2 bg-white rounded-full text-red-500 shadow-sm shrink-0"><XCircle size={18} strokeWidth={2.5}/></div>
              <div>
                <strong className="text-red-700 block mb-0.5">ยกเลิกรายการ</strong>
                <span className="text-xs text-red-800/80">คำสั่งซื้อถูกยกเลิก หากมีการชำระเงินแล้ว กรุณาติดต่อแอดมินเพื่อตรวจสอบการคืนเงินหรือเปลี่ยนแปลงรายการ</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'points',
      icon: <Star className="text-amber-500" />,
      title: 'การสะสมคะแนนและแลกรางวัล (Iris Points Guide)',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          {/* Header Highlight Banner */}
          <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
            <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1.5">
              <Sparkles size={11} className="text-yellow-300 fill-yellow-300" /> สิทธิประโยชน์สมาชิก Iris Clinic
            </span>
            <h4 className="text-base font-black text-white leading-snug">
              ทุกยอดการชำระเงิน เปลี่ยนเป็นความคุ้มค่า!
            </h4>
            <p className="text-[11px] text-teal-50 mt-1 opacity-90 leading-relaxed">
              ทุกครั้งที่คุณใช้บริการ ระบบจะคำนวณคะแนนสะสมให้อัตโนมัติทันที <strong>100 บาท = 1 Iris Point</strong>
            </p>
          </div>

          {/* 3 Step Visual Diagram */}
          <div className="space-y-2.5">
            <div className="font-black text-slate-800 text-xs flex items-center gap-1.5">
              <TrendingUp size={14} className="text-teal-600" /> ขั้นตอนการสะสมและแลกรับรางวัล
            </div>

            {/* Step 1 */}
            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-teal-950 font-black text-xs">ชำระค่าบริการ / ซื้อสินค้า</strong>
                  <span className="text-[10px] font-black bg-teal-200/80 text-teal-800 px-2 py-0.2 rounded-full">100 ฿ = 1 แต้ม</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  ชำระผ่านเงินสด โอนเงิน หรือบัตรเครดิต รับแต้มสะสมอัตโนมัติ (เช่น ยอด 2,000 บ. = 20 แต้ม)
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-950 font-black text-xs">รับคะแนนคูณสอง (Double Points x2)</strong>
                  <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.2 rounded-full">แต้ม x2</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  🌟 <strong>วันเลขเบิ้ล:</strong> (1/1, 2/2, 3/3, 11/11, 12/12) รับแต้ม 2 เท่าทุกบิล!<br />
                  🎂 <strong>ตลอดทั้งเดือนเกิดของคุณ:</strong> ทุกยอดซื้อในเดือนเกิด รับคะแนน 2 เท่าอัตโนมัติ
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-indigo-950 font-black text-xs">แลกรับของรางวัลที่เมนู "สิทธิพิเศษ"</strong>
                  <span className="text-[10px] font-black bg-indigo-200 text-indigo-900 px-2 py-0.2 rounded-full">สิทธิพิเศษ</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  นำคะแนนไปแลกเป็น <strong>คูปองส่วนลด, ทรีตเมนต์/มาร์คหน้าฟรี, หมุนวงล้อลุ้นโชค</strong> หรือรับผลิตภัณฑ์เวชสำอางกลับบ้าน
                </p>
              </div>
            </div>
          </div>

          {/* Member Tiers summary */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
            <strong className="text-slate-800 block text-xs font-black">ระดับสมาชิก Iris Member Tiers:</strong>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                <span className="font-bold text-slate-800">🥉 Member:</span> สมาชิกแรกเข้า สะสมแต้มได้ทันที
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                <span className="font-bold text-blue-700">🥈 Silver:</span> ยอด 10,000+ จองคิว Priority
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                <span className="font-bold text-amber-700">🥇 Gold:</span> ยอด 30,000+ ลด 10% + ของขวัญ
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                <span className="font-bold text-purple-700">👑 VIP:</span> ยอด 100,000+ สิทธิพิเศษสูงสุด
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/80">
            <p className="text-xs text-amber-900 flex items-start gap-1.5">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
              <span>คะแนนสะสมและสถานะสมาชิกคำนวณจากยอดชำระจริง ตรวจสอบประวัติคะแนนได้ตลอดเวลาที่เมนูสิทธิพิเศษ</span>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'booking',
      icon: <CalendarDays className="text-emerald-500" />,
      title: 'การนัดหมายและจองคิว',
      content: (
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>เงื่อนไขการจองคิว:</strong></p>
          <ul className="list-disc pl-5 space-y-2">
            <li>กรุณาจองคิวล่วงหน้าอย่างน้อย 1 วัน</li>
            <li>หากต้องการเลื่อนหรือยกเลิกคิว กรุณากดยกเลิกในแอปหรือแจ้งล่วงหน้าอย่างน้อย 2 ชั่วโมง</li>
            <li>การมาสายเกิน 15 นาที อาจทำให้ต้องจัดคิวใหม่เพื่อไม่ให้กระทบลูกค้าท่านอื่น</li>
          </ul>
        </div>
      )
    },
    {
      id: 'policy',
      icon: <HelpCircle className="text-rose-500" />,
      title: 'นโยบายและการรับประกัน',
      content: (
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>การขอคืนเงิน:</strong></p>
          <p>บริษัทขอสงวนสิทธิ์ในการไม่คืนเงินสำหรับคอร์สหรือแพ็คเกจที่เปิดใช้งานแล้วในทุกกรณี</p>
          <p><strong>การเปลี่ยนคอร์ส:</strong></p>
          <p>สามารถขอเปลี่ยนคอร์สที่มีมูลค่าเท่ากันหรือมากกว่าได้ (เพิ่มส่วนต่าง) ภายใน 7 วันหลังจากการซื้อ โดยต้องยังไม่มีการใช้งานใดๆ</p>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm relative z-10">
        {activeTopic ? (
           <button onClick={() => setActiveTopic(null)} className="p-2 -ml-2 text-gray-500 hover:text-gray-800 transition-colors">
              <ChevronRight size={24} className="rotate-180" />
           </button>
        ) : (
           <div className="w-10"></div>
        )}
        <h2 className="text-lg font-black text-gray-800">
          {activeTopic ? topics.find(t => t.id === activeTopic)?.title : 'ศูนย์ช่วยเหลือ'}
        </h2>
        <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-gray-800 bg-gray-50 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">
        {activeTopic ? (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-right-4">
             <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                <div className="p-2 bg-gray-50 rounded-xl">
                   {topics.find(t => t.id === activeTopic)?.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{topics.find(t => t.id === activeTopic)?.title}</h3>
             </div>
             {topics.find(t => t.id === activeTopic)?.content}
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
               <div className="absolute right-0 top-0 opacity-10"><HelpCircle size={100} className="-mt-4 -mr-4" /></div>
               <h3 className="text-xl font-black mb-2 relative z-10">มีอะไรให้เราช่วยไหม?</h3>
               <p className="text-sm text-blue-100 relative z-10">เลือกหัวข้อที่คุณต้องการทราบรายละเอียดด้านล่างได้เลย</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <h4 className="text-xs font-bold text-gray-500 bg-gray-50 px-4 py-3 border-b border-gray-100 uppercase tracking-widest">
                 หัวข้อที่พบบ่อย
              </h4>
              <div className="divide-y divide-gray-100">
                {topics.map((topic) => (
                  <button 
                    key={topic.id}
                    onClick={() => setActiveTopic(topic.id)}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                         {topic.icon}
                      </div>
                      <span className="font-bold text-gray-700 text-sm">{topic.title}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 text-center">
               <p className="text-xs text-gray-400 mb-3 font-bold">ไม่พบคำตอบที่ต้องการ?</p>
               <a 
                 href="https://line.me/R/ti/p/@your_line_id" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-2 bg-[#00B900] text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-[#009900] transition-colors active:scale-95"
               >
                  <MessageCircle size={18} /> ติดต่อแอดมินผ่านแชท
               </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
