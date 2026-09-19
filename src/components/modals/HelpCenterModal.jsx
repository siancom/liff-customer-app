import React, { useState } from 'react';
import { X, BookOpen, Star, CalendarDays, HelpCircle, ChevronRight, MessageCircle, AlertCircle } from 'lucide-react';

export default function HelpCenterModal({ isOpen, onClose }) {
  const [activeTopic, setActiveTopic] = useState(null);

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
      id: 'points',
      icon: <Star className="text-amber-500" />,
      title: 'การสะสมคะแนนและแลกรางวัล',
      content: (
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>วิธีสะสมคะแนน:</strong></p>
          <p>ทุกยอดการชำระเงินของคุณจะถูกนำมาคำนวณเป็นคะแนนสะสมโดยอัตโนมัติ (ยอดที่ชำระด้วยเงินสด โอน หรือบัตรเครดิต)</p>
          <p><strong>การใช้คะแนน:</strong></p>
          <p>สามารถนำคะแนนไปแลกเป็นคูปองส่วนลด คอร์สฟรี หรือของรางวัลอื่นๆ ได้ที่เมนู <strong className="text-teal-600">สิทธิพิเศษ</strong></p>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
            <p className="text-xs text-amber-800 flex items-start gap-1.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>คะแนนสะสมอาจมีวันหมดอายุ กรุณาตรวจสอบรายละเอียดในหน้าสิทธิพิเศษ</span>
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
