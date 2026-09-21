import React, { useState } from 'react';
import { ReceiptText, CreditCard, Clock, Truck, Search, X, Wallet, Package, CheckCircle2, XCircle, ClipboardList } from 'lucide-react';
import { getFuzzyKey, parseThaiDate } from '../utils/helpers';

export default function Orders({
  orderFilter,
  setOrderFilter,
  myOrders,
  setSelectedOrder,
  setConfirmCancelOrder,
  parseNumber,
  handleBuyAgain,
  dbProducts = [],
  dbMasterCourses = []
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Map and filter dbHistories to only online/shop purchases
  const mappedOrders = myOrders
    .filter(od => {
        const type = String(getFuzzyKey(od, ["ประเภท", "col_4"])).toLowerCase();
        return type.includes("ซื้อ");
    })
    .map(od => {
        const createdAtStr = String(getFuzzyKey(od, ["วันที่", "col_3", "col_1"]) || '');
        const parsedDate = parseThaiDate(createdAtStr);
        
        return {
            original: od,
            orderNo: String(getFuzzyKey(od, ["หมายเลขคำสั่งซื้อ", "อ้างอิง", "เลขที่ใบเสร็จ", "col_21", "col_5"]) || od.id || ''),
            status: String(getFuzzyKey(od, ["สถานะ", "col_22"]) || "เรียบร้อย"),
            itemName: String(getFuzzyKey(od, ["สินค้า", "ชื่อคอส", "คอสที่ซื้อ", "รายการ", "col_18", "col_16"]) || 'รายการสั่งซื้อ'),
            paymentMethodStr: String(getFuzzyKey(od, ["ช่องทาง", "การชำระเงิน", "ประเภท", "col_4"]) || 'ชำระแล้วผ่านแอป'),
            createdAtStr: createdAtStr,
            createdAt: parsedDate ? parsedDate.toISOString() : (od.createdAt ? new Date(od.createdAt).toISOString() : new Date().toISOString()), 
            _parsedTimestamp: parsedDate ? parsedDate.getTime() : (od.createdAt ? new Date(od.createdAt).getTime() : 0),
            trackingNo: od.trackingNo || null,
            trackingInfo: od.trackingInfo || null,
            fulfillment: od.fulfillment || null,
            price: parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"])),
            itemPrice: parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"])),
            originalPrice: parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"])),
            discountAmount: 0,
            itemType: String(getFuzzyKey(od, ["ประเภท", "col_4"])).includes("สินค้า") ? 'product' : 'course',
            cartItems: od.cartItems || [{
                name: String(getFuzzyKey(od, ["สินค้า", "ชื่อคอส", "คอสที่ซื้อ", "รายการ", "col_18", "col_16"]) || 'รายการสั่งซื้อ'),
                qty: Number(getFuzzyKey(od, ["จำนวน"])) || 1,
                price: parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"]))
            }]
        };
    })
    .sort((a, b) => b._parsedTimestamp - a._parsedTimestamp);

  const filteredOrders = mappedOrders.filter(od => {
      if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const name = od.itemName.toLowerCase();
          const id = od.orderNo.toLowerCase();
          if (!name.includes(query) && !id.includes(query)) return false;
      }
      
      const status = od.status;
      if (orderFilter === 'all') return true;
      if (orderFilter === 'to_pay') return status.includes('รอชำระเงิน');
      if (orderFilter === 'to_ship') return status.includes('รอตรวจสอบ') || status.includes('รอจัดส่ง') || status.includes('รอดำเนินการ');
      if (orderFilter === 'to_receive') return status.includes('กำลังจัดส่ง');
      if (orderFilter === 'completed') return status.includes('สำเร็จ') || status.includes('เรียบร้อย') || status.includes('ชำระแล้ว') || status.includes('อนุมัติ') || status.includes('จัดส่งแล้ว') || status.includes('ได้รับ');
      if (orderFilter === 'cancelled') return status.includes('ยกเลิก');
      return true;
  });

  const counts = {
      all: mappedOrders.length,
      to_pay: mappedOrders.filter(od => od.status.includes('รอชำระเงิน')).length,
      to_ship: mappedOrders.filter(od => od.status.includes('รอตรวจสอบ') || od.status.includes('รอจัดส่ง') || od.status.includes('รอดำเนินการ')).length,
      to_receive: mappedOrders.filter(od => od.status.includes('กำลังจัดส่ง')).length,
      completed: mappedOrders.filter(od => od.status.includes('สำเร็จ') || od.status.includes('เรียบร้อย') || od.status.includes('ชำระแล้ว') || od.status.includes('อนุมัติ') || od.status.includes('จัดส่งแล้ว') || od.status.includes('ได้รับ')).length,
      cancelled: mappedOrders.filter(od => od.status.includes('ยกเลิก')).length,
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
       <h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><ReceiptText size={18} className="mr-2 text-teal-500"/> สถานะคำสั่งซื้อของฉัน</h2>
       
       <div className="flex bg-white rounded-2xl p-2 mb-2 overflow-x-auto hide-scrollbar border border-gray-100 shadow-sm gap-2">
          <button onClick={() => setOrderFilter('all')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 ${orderFilter === 'all' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <ClipboardList size={24} strokeWidth={orderFilter === 'all' ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'all' ? 'text-gray-900' : ''}`}>ทั้งหมด</span>
          </button>

          <button onClick={() => setOrderFilter('to_pay')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 ${orderFilter === 'to_pay' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <Wallet size={24} strokeWidth={orderFilter === 'to_pay' ? 2.5 : 2} />
                {counts.to_pay > 0 && <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-[1px] rounded-full min-w-[16px] text-center border-2 border-white shadow-sm">{counts.to_pay > 99 ? '99+' : counts.to_pay}</span>}
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'to_pay' ? 'text-orange-700' : ''}`}>ที่ต้องชำระ</span>
          </button>
          
          <button onClick={() => setOrderFilter('to_ship')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 ${orderFilter === 'to_ship' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <Package size={24} strokeWidth={orderFilter === 'to_ship' ? 2.5 : 2} />
                {counts.to_ship > 0 && <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-[1px] rounded-full min-w-[16px] text-center border-2 border-white shadow-sm">{counts.to_ship > 99 ? '99+' : counts.to_ship}</span>}
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'to_ship' ? 'text-blue-700' : ''}`}>ที่ต้องจัดส่ง</span>
          </button>

          <button onClick={() => setOrderFilter('to_receive')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 ${orderFilter === 'to_receive' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <Truck size={24} strokeWidth={orderFilter === 'to_receive' ? 2.5 : 2} />
                {counts.to_receive > 0 && <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-[1px] rounded-full min-w-[16px] text-center border-2 border-white shadow-sm">{counts.to_receive > 99 ? '99+' : counts.to_receive}</span>}
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'to_receive' ? 'text-indigo-700' : ''}`}>ที่ต้องได้รับ</span>
          </button>

          <div className="w-px bg-gray-100 my-2 mx-1 flex-shrink-0"></div>

          <button onClick={() => setOrderFilter('completed')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 ${orderFilter === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <CheckCircle2 size={24} strokeWidth={orderFilter === 'completed' ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'completed' ? 'text-emerald-700' : ''}`}>สำเร็จแล้ว</span>
          </button>

          <button onClick={() => setOrderFilter('cancelled')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 ${orderFilter === 'cancelled' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <XCircle size={24} strokeWidth={orderFilter === 'cancelled' ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'cancelled' ? 'text-red-700' : ''}`}>ยกเลิก</span>
          </button>
       </div>
       
       {filteredOrders.length > 0 ? (
         <div className="space-y-3">
           {filteredOrders.map((od, i) => {
              let statusColor = "bg-teal-500";
              let statusBg = "bg-teal-50 text-teal-600 border-teal-100";
              const status = od.status;
              
              if (status.includes('สำเร็จ') || status.includes('เรียบร้อย') || status.includes('ชำระแล้ว') || status.includes('อนุมัติ') || status.includes('จัดส่งแล้ว') || status.includes('ได้รับ')) { statusColor = "bg-emerald-500"; statusBg = "bg-emerald-50 text-emerald-600 border-emerald-100"; }
              else if (status.includes('รอชำระ')) { statusColor = "bg-orange-400"; statusBg = "bg-orange-50 text-orange-600 border-orange-100"; }
              else if (status.includes('รอตรวจสอบ') || status.includes('รอจัดส่ง') || status.includes('รอดำเนินการ')) { statusColor = "bg-blue-400"; statusBg = "bg-blue-50 text-blue-600 border-blue-100"; }
              else if (status.includes('กำลังจัดส่ง')) { statusColor = "bg-indigo-400"; statusBg = "bg-indigo-50 text-indigo-600 border-indigo-100"; }
              else if (status.includes('ยกเลิก')) { statusColor = "bg-red-400"; statusBg = "bg-red-50 text-red-600 border-red-100"; }
              else { statusColor = "bg-gray-400"; statusBg = "bg-gray-50 text-gray-600 border-gray-100"; }

              return (
              <div key={i} onClick={() => { setSelectedOrder(od); setConfirmCancelOrder(false); }} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                 <div className={`absolute top-0 left-0 w-1.5 h-full ${statusColor}`}></div>
                 
                 <div className="flex justify-between items-start mb-1.5 pl-2">
                    <div className="flex flex-col">
                       <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-gray-500 font-bold">#{od.orderNo}</span>
                          {(od.itemType === 'product' && od.trackingNo) && (
                             <span className="flex items-center text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                <Truck size={9} className="mr-1" /> จัดส่งถึงบ้าน
                             </span>
                          )}
                       </div>
                       <span className="text-[9px] text-gray-400 flex items-center mt-1"><Clock size={9} className="mr-1"/>{od.createdAtStr}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ml-1 mt-0.5 ${statusBg}`}>{status}</span>
                 </div>
                 
                 <h4 className="font-black text-gray-900 text-[13px] mb-1.5 pl-2 line-clamp-1">{od.itemName}</h4>
                 
                 <div className="flex justify-between items-end pl-2">
                    <span className="text-[10px] text-gray-500 flex items-center"><CreditCard size={10} className="mr-1"/>{od.paymentMethodStr}</span>
                    <div className="text-right flex flex-col justify-end">
                       {od.discountAmount > 0 && <span className="text-[9px] text-rose-500 line-through">฿{(od.price + od.discountAmount).toLocaleString()}</span>}
                       <span className="font-black text-teal-600 text-[15px] leading-none mt-0.5">฿{(od.price).toLocaleString()}</span>
                    </div>
                 </div>

                 {/* 🌟 รูปภาพสินค้าในออเดอร์ (รองรับหลายชิ้น เลื่อนได้) 🌟 */}
                 {od.cartItems && od.cartItems.length > 0 && (
                    <div className="mt-2 pl-2 flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                      {od.cartItems.map((item, idx) => {
                         const foundProduct = dbProducts.find(p => String(getFuzzyKey(p, ["ชื่อสินค้า", "col_2", "ชื่อ", "name"]) || '').trim() === item.name) ||
                                              dbMasterCourses.find(c => String(getFuzzyKey(c, ["ชื่อคอส", "ชื่อคอร์ส", "col_2"]) || '').trim() === item.name);
                         const imageUrl = foundProduct ? (getFuzzyKey(foundProduct, ["รูปภาพ", "รูป", "image", "img", "col_13"]) || foundProduct.image) : null;
                         
                         return (
                           <div key={idx} className="shrink-0 w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 p-0.5 flex items-center justify-center relative">
                             {imageUrl ? (
                               <img 
                                 src={imageUrl} 
                                 alt="" 
                                 className="w-full h-full object-cover rounded-md text-[0px]" 
                                 onError={(e) => { e.target.style.display = 'none'; }} 
                               />
                             ) : (
                               <Package size={14} className="text-gray-300" />
                             )}
                             {item.qty > 1 && (
                               <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                                 {item.qty}
                               </span>
                             )}
                           </div>
                         );
                      })}
                    </div>
                 )}
                 {(status.includes('สำเร็จ') || status.includes('เรียบร้อย') || status.includes('ชำระแล้ว') || status.includes('อนุมัติ') || status.includes('จัดส่งแล้ว') || status.includes('ได้รับ')) && handleBuyAgain && (
                    <div className="mt-3 flex justify-end">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleBuyAgain(od.itemName); }}
                         className="px-3 py-1.5 bg-[#EE4D2D] text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-[#d64124] transition-colors active:scale-95 flex items-center"
                       >
                         ซื้อซ้ำ
                       </button>
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
