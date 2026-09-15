import React, { useState } from 'react';
import { ReceiptText, CreditCard, Clock, Truck, Search, X } from 'lucide-react';
import { getFuzzyKey } from '../utils/helpers';

export default function Orders({
  orderFilter,
  setOrderFilter,
  myOrders,
  setSelectedOrder,
  setConfirmCancelOrder,
  parseNumber
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Map and filter dbHistories to only online/shop purchases
  const mappedOrders = myOrders
    .filter(od => {
        const type = String(getFuzzyKey(od, ["ประเภท", "col_4"])).toLowerCase();
        return type.includes("ซื้อ");
    })
    .map(od => {
        return {
            original: od,
            orderNo: String(getFuzzyKey(od, ["หมายเลขคำสั่งซื้อ", "อ้างอิง", "เลขที่ใบเสร็จ", "col_21", "col_5"]) || od.id || ''),
            status: String(getFuzzyKey(od, ["สถานะ", "col_22"]) || "เรียบร้อย"),
            itemName: String(getFuzzyKey(od, ["สินค้า", "ชื่อคอส", "คอสที่ซื้อ", "รายการ", "col_18", "col_16"]) || 'รายการสั่งซื้อ'),
            paymentMethodStr: String(getFuzzyKey(od, ["ช่องทาง", "การชำระเงิน", "ประเภท", "col_4"]) || 'ชำระแล้วผ่านแอป'),
            createdAtStr: String(getFuzzyKey(od, ["วันที่", "col_3", "col_1"]) || ''),
            createdAt: new Date().toISOString(), // Fallback for Modal
            price: parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"])),
            itemPrice: parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"])),
            originalPrice: parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"])),
            discountAmount: 0,
            itemType: String(getFuzzyKey(od, ["ประเภท", "col_4"])).includes("สินค้า") ? 'product' : 'course',
            cartItems: [{
                name: String(getFuzzyKey(od, ["สินค้า", "ชื่อคอส", "คอสที่ซื้อ", "รายการ", "col_18", "col_16"]) || 'รายการสั่งซื้อ'),
                qty: Number(getFuzzyKey(od, ["จำนวน"])) || 1,
                price: parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"]))
            }]
        };
    });

  const filteredOrders = mappedOrders.filter(od => {
      if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const name = od.itemName.toLowerCase();
          const id = od.orderNo.toLowerCase();
          if (!name.includes(query) && !id.includes(query)) return false;
      }
      
      const status = od.status;
      if (orderFilter === 'all') return true;
      if (orderFilter === 'pending') return status.includes('รอ');
      if (orderFilter === 'completed') return status.includes('สำเร็จ') || status.includes('เรียบร้อย') || status.includes('ชำระแล้ว') || status.includes('อนุมัติ') || status.includes('จัดส่งแล้ว');
      if (orderFilter === 'cancelled') return status.includes('ยกเลิก');
      return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
       <h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><ReceiptText size={18} className="mr-2 text-teal-500"/> สถานะคำสั่งซื้อของฉัน</h2>
       
       <div className="flex bg-gray-100/80 rounded-xl p-1 mb-2 overflow-x-auto hide-scrollbar">
          <button onClick={() => setOrderFilter('all')} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all shrink-0 ${orderFilter === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>ทั้งหมด</button>
          <button onClick={() => setOrderFilter('pending')} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all shrink-0 ${orderFilter === 'pending' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>รอดำเนินการ</button>
          <button onClick={() => setOrderFilter('completed')} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all shrink-0 ${orderFilter === 'completed' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>สำเร็จแล้ว</button>
          <button onClick={() => setOrderFilter('cancelled')} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all shrink-0 ${orderFilter === 'cancelled' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>ยกเลิก</button>
       </div>
       
       {filteredOrders.length > 0 ? (
         <div className="space-y-3">
           {filteredOrders.map((od, i) => {
              let statusColor = "bg-teal-500";
              let statusBg = "bg-teal-50 text-teal-600 border-teal-100";
              const status = od.status;
              
              if (status.includes('สำเร็จ') || status.includes('เรียบร้อย') || status.includes('ชำระแล้ว') || status.includes('อนุมัติ') || status.includes('จัดส่งแล้ว')) { statusColor = "bg-emerald-500"; statusBg = "bg-emerald-50 text-emerald-600 border-emerald-100"; }
              else if (status.includes('รอ')) { statusColor = "bg-orange-400"; statusBg = "bg-orange-50 text-orange-600 border-orange-100"; }
              else if (status.includes('ยกเลิก')) { statusColor = "bg-red-400"; statusBg = "bg-red-50 text-red-600 border-red-100"; }

              return (
              <div key={i} onClick={() => { setSelectedOrder(od); setConfirmCancelOrder(false); }} className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-200 relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                 <div className={`absolute top-0 left-0 w-1.5 h-full ${statusColor}`}></div>
                 <div className="flex justify-between items-start mb-2 pl-2">
                    <span className="text-[10px] font-mono text-gray-500 font-bold">#{od.orderNo}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusBg}`}>{status}</span>
                 </div>
                 <h4 className="font-black text-gray-900 text-sm mb-1 pl-2 line-clamp-1">{od.itemName}</h4>
                 <div className="flex justify-between items-end pl-2 mt-2">
                    <div>
                       <span className="text-[10px] text-gray-500 flex items-center mb-1"><CreditCard size={10} className="mr-1"/>{od.paymentMethodStr}</span>
                       <span className="text-[10px] text-gray-400 flex items-center"><Clock size={10} className="mr-1"/>{od.createdAtStr}</span>
                    </div>
                    <div className="text-right">
                       {od.discountAmount > 0 && <p className="text-[9px] text-rose-500 line-through">฿{(od.price + od.discountAmount).toLocaleString()}</p>}
                       <span className="font-black text-teal-600 text-base">฿{(od.price).toLocaleString()}</span>
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
