import React, { useState } from 'react';
import { ReceiptText, CreditCard, Clock, Truck, Search, X, Wallet, Package, CheckCircle2, XCircle, ClipboardList, Ticket } from 'lucide-react';
import { getFuzzyKey, parseThaiDate } from '../utils/helpers';

export default function Orders({
  orderFilter,
  setOrderFilter,
  myOrders = [],
  courses = [],
  setSelectedOrder,
  setConfirmCancelOrder,
  parseNumber,
  handleBuyAgain,
  dbProducts = [],
  dbMasterCourses = [],
  setActiveNav,
  setShowQR,
  setSelectedCourseDetail,
  onGoToCourse
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // 🌟 Helper: Find if a course order is already linked to an active course in the customer's account
  const findMatchingCourse = (order, courseList = []) => {
    if (!order || !courseList.length) return null;
    const orderNo = String(order.orderNo || order.id || getFuzzyKey(order, ["หมายเลขคำสั่งซื้อ", "col_21", "col_5"]) || '').trim();
    const orderItemName = String(order.itemName || order.name || getFuzzyKey(order, ["สินค้า", "ชื่อคอส", "คอสที่ซื้อ", "รายการ", "col_18", "col_16"]) || '').trim().toLowerCase();
    const orderRef = String(order.original?.["อ้างอิง"] || order.original?.col_6 || order.ref || '').trim();

    // 1. Direct match on order number
    if (orderNo) {
        const byOrder = courseList.find(c => {
            const cOrderNo = String(c.orderNo || c.refOrderNo || getFuzzyKey(c, ["หมายเลขคำสั่งซื้อ", "Order", "Ref", "col_21"]) || '').trim();
            return cOrderNo && (cOrderNo === orderNo || cOrderNo.includes(orderNo) || orderNo.includes(cOrderNo));
        });
        if (byOrder) return byOrder;
    }

    // 2. Direct match on course reference code (e.g. IC...)
    if (orderRef) {
        const byRef = courseList.find(c => {
            const cCourseNo = String(c.courseRefKey || getFuzzyKey(c, ["เลขที่ใบคอส", "col_2"]) || c.id || '').trim();
            return cCourseNo && (cCourseNo === orderRef || cCourseNo.includes(orderRef) || orderRef.includes(cCourseNo));
        });
        if (byRef) return byRef;
    }

    // 3. Match by Course Name in customer's courses
    if (orderItemName) {
        const byName = courseList.find(c => {
            const cName = String(getFuzzyKey(c, ["ชื่อคอส", "ชื่อคอร์ส", "col_8", "col_4"]) || '').trim().toLowerCase();
            return cName && (cName === orderItemName || cName.includes(orderItemName) || orderItemName.includes(cName));
        });
        if (byName) return byName;
    }

    return null;
  };

  const isPaidOrCompletedStatus = (statusStr) => {
    if (!statusStr) return false;
    const s = String(statusStr).trim();
    return s.includes('ชำระแล้ว') || s.includes('ชำระเงินแล้ว') || s.includes('อนุมัติ') || s.includes('สำเร็จ') || s.includes('เรียบร้อย');
  };

  // Map and filter dbHistories to online/shop purchases
  const rawMappedOrders = myOrders
    .filter(od => {
        const type = String(getFuzzyKey(od, ["ประเภท", "col_4"]) || '').toLowerCase();
        return type.includes("ซื้อ");
    })
    .map(od => {
        const createdAtStr = String(getFuzzyKey(od, ["วันที่", "col_3", "col_1"]) || '');
        const parsedDate = parseThaiDate(createdAtStr);
        const orderNo = String(getFuzzyKey(od, ["หมายเลขคำสั่งซื้อ", "อ้างอิง", "เลขที่ใบเสร็จ", "col_21", "col_5"]) || od.id || '');
        const rawStatus = String(od.status || getFuzzyKey(od, ["สถานะ", "col_22"]) || "เรียบร้อย");
        const itemType = String(getFuzzyKey(od, ["ประเภท", "col_4"])).includes("สินค้า") ? 'product' : 'course';
        
        // Check if there is already a created/active course for this customer
        const matchingCourse = itemType !== 'product' ? findMatchingCourse({ ...od, orderNo }, courses) : null;
        
        // If course is already in customer's courses or status indicates paid, elevate to "ชำระเงินแล้ว"
        let effectiveStatus = rawStatus;
        if (itemType !== 'product') {
            if (matchingCourse) {
                effectiveStatus = isPaidOrCompletedStatus(rawStatus) ? rawStatus : 'ชำระเงินแล้ว';
            } else if (isPaidOrCompletedStatus(rawStatus)) {
                effectiveStatus = rawStatus;
            }
        }
        
        return {
            original: od,
            orderNo: orderNo,
            status: effectiveStatus,
            rawStatus: rawStatus,
            itemName: String(getFuzzyKey(od, ["สินค้า", "ชื่อคอส", "คอสที่ซื้อ", "รายการ", "col_18", "col_16"]) || 'รายการสั่งซื้อ'),
            paymentMethodStr: String(getFuzzyKey(od, ["ช่องทาง", "การชำระเงิน", "ประเภท", "col_4"]) || 'ชำระแล้วผ่านแอป'),
            createdAtStr: createdAtStr,
            createdAt: parsedDate ? parsedDate.toISOString() : (od.createdAt ? new Date(od.createdAt).toISOString() : new Date().toISOString()), 
            _parsedTimestamp: parsedDate ? parsedDate.getTime() : (od.createdAt ? new Date(od.createdAt).getTime() : 0),
            trackingNo: od.trackingNo || null,
            trackingInfo: od.trackingInfo || null,
            fulfillment: od.fulfillment || null,
            price: od._groupedAmount !== undefined ? od._groupedAmount : parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"])),
            itemPrice: od._groupedAmount !== undefined ? od._groupedAmount : parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"])),
            originalPrice: od._groupedAmount !== undefined ? od._groupedAmount : parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"])),
            discountAmount: 0,
            itemType: itemType,
            matchingCourse: matchingCourse,
            cartItems: od.cartItems || [{
                name: String(getFuzzyKey(od, ["สินค้า", "ชื่อคอส", "คอสที่ซื้อ", "รายการ", "col_18", "col_16"]) || 'รายการสั่งซื้อ'),
                qty: Number(getFuzzyKey(od, ["จำนวน"])) || 1,
                price: parseNumber(getFuzzyKey(od, ["ยอดเงิน", "ยอดสินค้า", "ยอด", "ราคา", "col_19"]))
            }]
        };
    })
    .sort((a, b) => b._parsedTimestamp - a._parsedTimestamp);

  // 🌟 Deduplicate orders with the same orderNo, keeping the most updated (paid/completed) record
  const deduplicatedMap = new Map();
  rawMappedOrders.forEach(od => {
    const key = od.orderNo || od.original?.id;
    if (!key) return;
    if (!deduplicatedMap.has(key)) {
        deduplicatedMap.set(key, od);
    } else {
        const existing = deduplicatedMap.get(key);
        const existingPaid = isPaidOrCompletedStatus(existing.status) || Boolean(existing.matchingCourse);
        const currentPaid = isPaidOrCompletedStatus(od.status) || Boolean(od.matchingCourse);
        if (!existingPaid && currentPaid) {
            deduplicatedMap.set(key, { ...existing, ...od, status: od.status, matchingCourse: od.matchingCourse || existing.matchingCourse });
        }
    }
  });

  const mappedOrders = Array.from(deduplicatedMap.values()).sort((a, b) => b._parsedTimestamp - a._parsedTimestamp);

  const handleGoToCourse = (od) => {
    const targetCourse = od.matchingCourse || findMatchingCourse(od, courses);
    if (onGoToCourse) {
        onGoToCourse(targetCourse || od);
    } else if (setActiveNav) {
        setActiveNav('home');
        if (targetCourse && setShowQR) {
            setShowQR(targetCourse);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredOrders = mappedOrders.filter(od => {
      if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const name = od.itemName.toLowerCase();
          const id = od.orderNo.toLowerCase();
          if (!name.includes(query) && !id.includes(query)) return false;
      }
      
      const status = od.status;
      const isProduct = od.itemType === 'product';
      const isCourse = !isProduct;
      const isPaid = isPaidOrCompletedStatus(status) || Boolean(od.matchingCourse);

      if (orderFilter === 'all') return true;

      if (orderFilter === 'to_pay') {
          if (status.includes('รอชำระเงิน')) return true;
          // If course order is waiting for payment verification and no course has been issued yet
          if (isCourse && status.includes('รอตรวจสอบ') && !isPaid) return true;
          return false;
      }

      // 📦 "ที่ต้องจัดส่ง": เฉพาะสินค้าที่ต้องส่งพัสดุเท่านั้น! คอร์สบริการไม่ต้องจัดส่ง
      if (orderFilter === 'to_ship') {
          if (!isProduct) return false;
          return (status.includes('รอตรวจสอบ') || status.includes('รอจัดส่ง') || status.includes('รอดำเนินการ') || status.includes('ชำระแล้ว') || status.includes('ชำระเงินแล้ว') || status.includes('อนุมัติ')) 
                 && !status.includes('กำลังจัดส่ง') && !status.includes('จัดส่งแล้ว') && !status.includes('สำเร็จ') && !status.includes('เรียบร้อย') && !status.includes('ยกเลิก');
      }

      // 🚚 "ที่ต้องได้รับ": เฉพาะสินค้าพัสดุที่กำลังเดินทาง
      if (orderFilter === 'to_receive') {
          if (!isProduct) return false;
          return status.includes('กำลังจัดส่ง');
      }

      // ✅ "สำเร็จแล้ว": สินค้าจัดส่งสำเร็จแล้ว หรือ คอร์สที่ชำระเงินเรียบร้อยแล้ว/ได้รับคอร์สแล้ว
      if (orderFilter === 'completed') {
          if (status.includes('ยกเลิก')) return false;
          if (isProduct) {
              return status.includes('สำเร็จ') || status.includes('เรียบร้อย') || status.includes('จัดส่งแล้ว') || status.includes('ได้รับ');
          } else {
              // คอร์สที่ชำระเงินแล้ว หรือได้รับคอร์สในระบบแล้ว
              return isPaid;
          }
      }

      if (orderFilter === 'cancelled') return status.includes('ยกเลิก');
      return true;
  });

  const counts = {
      all: mappedOrders.length,
      to_pay: mappedOrders.filter(od => {
          const s = od.status;
          return s.includes('รอชำระเงิน') || (od.itemType !== 'product' && s.includes('รอตรวจสอบ') && !isPaidOrCompletedStatus(s) && !od.matchingCourse);
      }).length,
      to_ship: mappedOrders.filter(od => {
          if (od.itemType !== 'product') return false;
          const s = od.status;
          return (s.includes('รอตรวจสอบ') || s.includes('รอจัดส่ง') || s.includes('รอดำเนินการ') || s.includes('ชำระแล้ว') || s.includes('ชำระเงินแล้ว') || s.includes('อนุมัติ')) 
                 && !s.includes('กำลังจัดส่ง') && !s.includes('จัดส่งแล้ว') && !s.includes('สำเร็จ') && !s.includes('เรียบร้อย') && !s.includes('ยกเลิก');
      }).length,
      to_receive: mappedOrders.filter(od => od.itemType === 'product' && od.status.includes('กำลังจัดส่ง')).length,
      completed: mappedOrders.filter(od => {
          if (od.status.includes('ยกเลิก')) return false;
          if (od.itemType === 'product') {
              return od.status.includes('สำเร็จ') || od.status.includes('เรียบร้อย') || od.status.includes('จัดส่งแล้ว') || od.status.includes('ได้รับ');
          } else {
              return isPaidOrCompletedStatus(od.status) || Boolean(od.matchingCourse);
          }
      }).length,
      cancelled: mappedOrders.filter(od => od.status.includes('ยกเลิก')).length,
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
       <h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><ReceiptText size={18} className="mr-2 text-teal-500"/> สถานะคำสั่งซื้อของฉัน</h2>
       
       <div className="flex bg-white rounded-2xl p-2 mb-2 overflow-x-auto hide-scrollbar border border-gray-100 shadow-sm gap-2">
          <button onClick={() => setOrderFilter('all')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 cursor-pointer ${orderFilter === 'all' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <ClipboardList size={24} strokeWidth={orderFilter === 'all' ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'all' ? 'text-gray-900' : ''}`}>ทั้งหมด</span>
          </button>

          <button onClick={() => setOrderFilter('to_pay')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 cursor-pointer ${orderFilter === 'to_pay' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <Wallet size={24} strokeWidth={orderFilter === 'to_pay' ? 2.5 : 2} />
                {counts.to_pay > 0 && <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-[1px] rounded-full min-w-[16px] text-center border-2 border-white shadow-sm">{counts.to_pay > 99 ? '99+' : counts.to_pay}</span>}
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'to_pay' ? 'text-orange-700' : ''}`}>ที่ต้องชำระ</span>
          </button>
          
          <button onClick={() => setOrderFilter('to_ship')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 cursor-pointer ${orderFilter === 'to_ship' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <Package size={24} strokeWidth={orderFilter === 'to_ship' ? 2.5 : 2} />
                {counts.to_ship > 0 && <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-[1px] rounded-full min-w-[16px] text-center border-2 border-white shadow-sm">{counts.to_ship > 99 ? '99+' : counts.to_ship}</span>}
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'to_ship' ? 'text-blue-700' : ''}`}>ที่ต้องจัดส่ง</span>
          </button>

          <button onClick={() => setOrderFilter('to_receive')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 cursor-pointer ${orderFilter === 'to_receive' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <Truck size={24} strokeWidth={orderFilter === 'to_receive' ? 2.5 : 2} />
                {counts.to_receive > 0 && <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-[1px] rounded-full min-w-[16px] text-center border-2 border-white shadow-sm">{counts.to_receive > 99 ? '99+' : counts.to_receive}</span>}
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'to_receive' ? 'text-indigo-700' : ''}`}>ที่ต้องได้รับ</span>
          </button>

          <div className="w-px bg-gray-100 my-2 mx-1 flex-shrink-0"></div>

          <button onClick={() => setOrderFilter('completed')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 cursor-pointer ${orderFilter === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <div className="relative mb-1">
                <CheckCircle2 size={24} strokeWidth={orderFilter === 'completed' ? 2.5 : 2} />
                {counts.completed > 0 && <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-[1px] rounded-full min-w-[16px] text-center border-2 border-white shadow-sm">{counts.completed > 99 ? '99+' : counts.completed}</span>}
            </div>
            <span className={`text-[10px] font-bold ${orderFilter === 'completed' ? 'text-emerald-700' : ''}`}>สำเร็จแล้ว</span>
          </button>

          <button onClick={() => setOrderFilter('cancelled')} className={`relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all rounded-xl flex-shrink-0 cursor-pointer ${orderFilter === 'cancelled' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}>
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
              const isPaid = isPaidOrCompletedStatus(status) || Boolean(od.matchingCourse);
              
              if (isPaid || status.includes('สำเร็จ') || status.includes('เรียบร้อย') || status.includes('จัดส่งแล้ว') || status.includes('ได้รับ')) { 
                statusColor = "bg-emerald-500"; 
                statusBg = "bg-emerald-50 text-emerald-600 border-emerald-100"; 
              }
              else if (status.includes('รอชำระ')) { 
                statusColor = "bg-orange-400"; 
                statusBg = "bg-orange-50 text-orange-600 border-orange-100"; 
              }
              else if (status.includes('รอตรวจสอบ') || status.includes('รอจัดส่ง') || status.includes('รอดำเนินการ')) { 
                statusColor = "bg-blue-400"; 
                statusBg = "bg-blue-50 text-blue-600 border-blue-100"; 
              }
              else if (status.includes('กำลังจัดส่ง')) { 
                statusColor = "bg-indigo-400"; 
                statusBg = "bg-indigo-50 text-indigo-600 border-indigo-100"; 
              }
              else if (status.includes('ยกเลิก')) { 
                statusColor = "bg-red-400"; 
                statusBg = "bg-red-50 text-red-600 border-red-100"; 
              }
              else { 
                statusColor = "bg-gray-400"; 
                statusBg = "bg-gray-50 text-gray-600 border-gray-100"; 
              }

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
                          {od.itemType !== 'product' && (
                             <span className="flex items-center text-[9px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                                <Ticket size={9} className="mr-1" /> คอร์สบริการ
                             </span>
                          )}
                       </div>
                       <span className="text-[9px] text-gray-400 flex items-center mt-1"><Clock size={9} className="mr-1"/>{od.createdAtStr}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ml-1 mt-0.5 ${statusBg}`}>
                      {od.itemType !== 'product' && isPaid ? 'ชำระเงินแล้ว' : status}
                    </span>
                 </div>
                 
                 <h4 className="font-black text-gray-900 text-[13px] mb-1.5 pl-2 line-clamp-1">{od.itemName}</h4>
                 
                 <div className="flex justify-between items-end pl-2">
                    <span className="text-[10px] text-gray-500 flex items-center"><CreditCard size={10} className="mr-1"/>{od.paymentMethodStr}</span>
                    <div className="text-right flex flex-col justify-end">
                       {od.discountAmount > 0 && <span className="text-[9px] text-rose-500 line-through">฿{(od.price + od.discountAmount).toLocaleString()}</span>}
                       <span className="font-black text-teal-600 text-[15px] leading-none mt-0.5">฿{(od.price).toLocaleString()}</span>
                    </div>
                 </div>

                 {/* 🌟 รูปภาพสินค้าในออเดอร์ 🌟 */}
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

                 {/* 🌟 ACTIONS: ปุ่มไปยังคอร์สของฉัน และ ปุ่มซื้อซ้ำ 🌟 */}
                 <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-end gap-2 pl-2">
                    {od.itemType !== 'product' && (
                       <button 
                         type="button"
                         onClick={(e) => { e.stopPropagation(); handleGoToCourse(od); }}
                         className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-[11px] font-black rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                       >
                         <Ticket size={13} /> ไปยังคอร์สของฉัน
                       </button>
                    )}

                    {(isPaid || status.includes('สำเร็จ') || status.includes('เรียบร้อย') || status.includes('จัดส่งแล้ว') || status.includes('ได้รับ')) && handleBuyAgain && (
                       <button 
                         type="button"
                         onClick={(e) => { e.stopPropagation(); handleBuyAgain(od.itemName); }}
                         className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-xl transition-colors active:scale-95 flex items-center cursor-pointer"
                       >
                         ซื้อซ้ำ
                       </button>
                    )}
                 </div>
              </div>
           )})}
         </div>
       ) : (
         <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100 shadow-sm"><ReceiptText size={40} className="mx-auto text-gray-200 mb-3"/><p className="text-xs text-gray-400 font-bold">ไม่พบประวัติคำสั่งซื้อในสถานะนี้</p></div>
       )}
    </div>
  );
}
