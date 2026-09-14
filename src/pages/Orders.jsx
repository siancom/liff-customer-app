import React, { useState } from 'react';
import { ReceiptText, CreditCard, Clock, Truck, Search, X } from 'lucide-react';

export default function Orders({
  orderFilter,
  setOrderFilter,
  myOrders,
  setSelectedOrder,
  setConfirmCancelOrder,
  parseNumber
}) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
       <h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><ReceiptText size={18} className="mr-2 text-teal-500"/> สถานะคำสั่งซื้อของฉัน</h2>
       
       {/* Search Bar */}
       <div className="relative">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
               <Search size={16} />
           </span>
           <input 
               type="text" 
               placeholder="ค้นหาหมายเลขคำสั่งซื้อ หรือชื่อสินค้า..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
           />
           {searchQuery && (
               <button 
                   onClick={() => setSearchQuery('')}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1 transition-colors"
               >
                   <X size={12} />
               </button>
           )}
       </div>
       
       <div className="flex bg-gray-100/80 rounded-xl p-1 mb-2 overflow-x-auto hide-scrollbar">
          <button onClick={() => setOrderFilter('all')} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all shrink-0 ${orderFilter === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>ทั้งหมด</button>
          <button onClick={() => setOrderFilter('pending')} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all shrink-0 ${orderFilter === 'pending' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>รอดำเนินการ</button>
          <button onClick={() => setOrderFilter('completed')} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all shrink-0 ${orderFilter === 'completed' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>สำเร็จแล้ว</button>
          <button onClick={() => setOrderFilter('cancelled')} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all shrink-0 ${orderFilter === 'cancelled' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>ยกเลิก</button>
       </div>
       
       {myOrders.filter(od => {
          if (searchQuery) {
              const query = searchQuery.toLowerCase();
              const name = (od.itemName || od.courseName || '').toLowerCase();
              const id = (od.orderNo || od.id || '').toLowerCase();
              if (!name.includes(query) && !id.includes(query)) return false;
          }
          if (orderFilter === 'all') return true;
          if (orderFilter === 'pending') return (od.status || '').includes('รอ');
          if (orderFilter === 'completed') return od.status === 'ชำระแล้ว' || od.status === 'อนุมัติ' || od.status === 'จัดส่งแล้ว';
          if (orderFilter === 'cancelled') return (od.status || '').includes('ยกเลิก');
          return true;
       }).length > 0 ? (
         <div className="space-y-3">
           {myOrders.filter(od => {
              if (searchQuery) {
                  const query = searchQuery.toLowerCase();
                  const name = (od.itemName || od.courseName || '').toLowerCase();
                  const id = (od.orderNo || od.id || '').toLowerCase();
                  if (!name.includes(query) && !id.includes(query)) return false;
              }
              if (orderFilter === 'all') return true;
              if (orderFilter === 'pending') return (od.status || '').includes('รอ');
              if (orderFilter === 'completed') return od.status === 'ชำระแล้ว' || od.status === 'อนุมัติ' || od.status === 'จัดส่งแล้ว';
              if (orderFilter === 'cancelled') return (od.status || '').includes('ยกเลิก');
              return true;
           }).map((od, i) => {
              let statusColor = "bg-teal-500";
              let statusBg = "bg-teal-50 text-teal-600 border-teal-100";
              if (od.status === 'ชำระแล้ว' || od.status === 'อนุมัติ' || od.status === 'จัดส่งแล้ว') { statusColor = "bg-emerald-500"; statusBg = "bg-emerald-50 text-emerald-600 border-emerald-100"; }
              else if ((od.status || '').includes('รอ')) { statusColor = "bg-orange-400"; statusBg = "bg-orange-50 text-orange-600 border-orange-100"; }
              else if ((od.status || '').includes('ยกเลิก')) { statusColor = "bg-red-400"; statusBg = "bg-red-50 text-red-600 border-red-100"; }

              return (
              <div key={i} onClick={() => { setSelectedOrder(od); setConfirmCancelOrder(false); }} className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-200 relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                 <div className={`absolute top-0 left-0 w-1.5 h-full ${statusColor}`}></div>
                 <div className="flex justify-between items-start mb-2 pl-2">
                    <span className="text-[10px] font-mono text-gray-500 font-bold">#{od.orderNo}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusBg}`}>{od.status}</span>
                 </div>
                 <h4 className="font-black text-gray-900 text-sm mb-1 pl-2 line-clamp-1">{od.itemName || od.courseName || 'รายการสั่งซื้อ'}</h4>
                 <div className="flex justify-between items-end pl-2 mt-2">
                    <div>
                       <span className="text-[10px] text-gray-500 flex items-center mb-1"><CreditCard size={10} className="mr-1"/>{od.paymentMethodStr || (od.paymentMethod === 'transfer' ? 'โอนผ่านบัญชี' : (od.paymentMethod === 'credit' ? 'หักเครดิต' : 'ชำระหน้าสาขา'))}</span>
                       <span className="text-[10px] text-gray-400 flex items-center"><Clock size={10} className="mr-1"/>{new Date(od.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="text-right">
                       {(od.discountAmount > 0 || od.discount > 0) && <p className="text-[9px] text-rose-500 line-through">฿{(parseNumber(od.originalPrice || (parseNumber(od.price) + parseNumber(od.discount)))||0).toLocaleString()}</p>}
                       <span className="font-black text-teal-600 text-base">฿{(parseNumber(od.itemPrice || od.price)||0).toLocaleString()}</span>
                    </div>
                 </div>
                 {od.itemType === 'product' && (
                    <div className="mt-3 pl-2 pt-2 border-t border-gray-50 flex items-center text-[10px] text-blue-600 font-bold">
                       <Truck size={12} className="mr-1.5" /> จัดส่งถึงบ้าน
                    </div>
                 )}
              </div>
           )})}
         </div>
       ) : (
         <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100 shadow-sm"><ReceiptText size={40} className="mx-auto text-gray-200 mb-3"/><p className="text-xs text-gray-400 font-bold">ไม่พบประวัติคำสั่งซื้อในสถานะนี้</p></div>
       )}
    </div>
  );
}
