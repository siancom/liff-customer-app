import { getFuzzyKey, parseNumber } from './helpers';

export const buildCustomerData = (rawCustomer, cleanPhone, dbHistories, dbCourses, dbOrders = []) => {
  const custName = (getFuzzyKey(rawCustomer, ["ชื่อลูกค้า", "ชื่อ"]) || '').trim();
  const oldAmount = parseNumber(getFuzzyKey(rawCustomer, ["ยอดสะสม", "ยอดยกมา", "ยอดสะสมเดิม"]));

  const isCreditTx = (h) => {
    const type = String(getFuzzyKey(h, "ประเภท") || '');
    return !!h.transactionType || ['หักเครดิต', 'รับเครดิต', 'รับโอนเครดิต', 'เบิกใช้เครดิต'].includes(type);
  };

  const creditTransactions = dbHistories.filter(h => {
    if (!isCreditTx(h)) return false;
    if (h.cleanPhone && String(h.cleanPhone) === cleanPhone) return true;
    if (!h.cleanPhone && (getFuzzyKey(h, ["ชื่อลูกค้า", "ชื่อ"]) || '').trim() === custName) return true;
    return false;
  }).sort((a, b) => String(b.timestamp || b.createdAt || '').localeCompare(String(a.timestamp || a.createdAt || '')));

  const customerHistory = dbHistories.filter(h => {
    if (h.transactionType) return false;
    const nameMatch = custName && (getFuzzyKey(h, ["ชื่อลูกค้า", "ชื่อ"]) || '').trim() === custName;
    const phoneMatch = cleanPhone && h.cleanPhone && String(h.cleanPhone) === cleanPhone;
    return nameMatch || phoneMatch;
  });
  
  const map = new Map();
  const uniqueMyHistories = [];
  customerHistory.forEach(h => {
     const refRaw = getFuzzyKey(h, ["หมายเลขคำสั่งซื้อ", "เลขที่คำสั่งซื้อ", "รหัสคำสั่งซื้อ", "หมายเลขเอกสาร", "เลขที่บิล", "Order", "Ref"]);
     const ref = refRaw ? String(refRaw).trim() : '';
     const currentAmt = parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด"]));
     
     if (ref && ref !== '-' && ref.toLowerCase() !== 'null') {
         if (!map.has(ref)) {
             const newObj = { ...h, _groupedAmount: currentAmt };
             map.set(ref, newObj);
             uniqueMyHistories.push(newObj);
         } else {
             const existing = map.get(ref);
             if (currentAmt > 0) {
                 existing._groupedAmount = (existing._groupedAmount || 0) + currentAmt;
             }
             const existingStatus = getFuzzyKey(existing, ["สถานะ", "col_22"]) || '';
             const newStatus = getFuzzyKey(h, ["สถานะ", "col_22"]) || '';
             
             const statusWeight = (s) => {
                 if (['ยกเลิก', 'ปฏิเสธ'].includes(s)) return -1;
                 if (['รอตรวจสอบ', 'รอดำเนินการ'].includes(s)) return 0;
                 return 1; // เรียบร้อย, ชำระแล้ว, อนุมัติ, จัดส่งแล้ว
             };

             if (statusWeight(newStatus) > statusWeight(existingStatus)) {
                 existing["สถานะ"] = newStatus;
                 existing.status = newStatus;
             }
         }
     } else {
         uniqueMyHistories.push({ ...h, _groupedAmount: currentAmt });
     }
  });

  // Attach tracking info from orders collection
  uniqueMyHistories.forEach(h => {
     const hRef = getFuzzyKey(h, ["หมายเลขคำสั่งซื้อ", "เลขที่คำสั่งซื้อ", "รหัสคำสั่งซื้อ", "หมายเลขเอกสาร", "เลขที่บิล", "Order", "Ref"]);
     if (hRef && dbOrders.length > 0) {
         const matchingOrder = dbOrders.find(o => String(o.orderNo) === String(hRef) || String(o.id) === String(hRef));
         if (matchingOrder) {
             if (matchingOrder.status) {
                 h.status = matchingOrder.status;
                 h["สถานะ"] = matchingOrder.status;
             }
             if (matchingOrder.trackingNo) h.trackingNo = matchingOrder.trackingNo;
             if (matchingOrder.trackingInfo) h.trackingInfo = matchingOrder.trackingInfo;
             if (matchingOrder.fulfillment) h.fulfillment = matchingOrder.fulfillment;
             if (matchingOrder.cartItems) h.cartItems = matchingOrder.cartItems;
             if (matchingOrder.price) h._groupedAmount = parseNumber(matchingOrder.price); // Use total order price
         }
     }
  });

  let historyEarned = 0;
  let historySpent = 0;
  let productEarned = 0;

  uniqueMyHistories.forEach(h => {
      const type = String(getFuzzyKey(h, ["ประเภท", "col_4"]) || '');
      const amt = h._groupedAmount || 0;
      if (amt > 0) {
          if (type.includes('เบิก') || type.includes('จ่าย') || type.includes('หัก')) {
              historySpent += amt;
          } else {
              historyEarned += amt;
              if (type.includes('สินค้า')) {
                  productEarned += amt;
              }
          }
      }
  });

  const totalAccumulated = oldAmount + historyEarned - historySpent;
  const productAccumulatedAmount = oldAmount + productEarned;
  
  let memberStatus = getFuzzyKey(rawCustomer, "สถานะสมาชิก") || "ยังไม่สะสมยอด";
  
  if (productAccumulatedAmount >= 5000 && ['ยังไม่สะสมยอด', 'ทั่วไป', 'สะสมยอด', ''].includes(memberStatus)) {
      memberStatus = 'รอบัตร';
  } else if (productAccumulatedAmount > 0 && productAccumulatedAmount < 5000 && ['ยังไม่สะสมยอด', 'ทั่วไป', ''].includes(memberStatus)) {
      memberStatus = 'สะสมยอด';
  }

  const basicStatuses = ['ยังไม่สะสมยอด', 'ทั่วไป', 'สะสมยอด', 'รอบัตร', ''];
  let isApproved = !basicStatuses.includes(memberStatus) && memberStatus !== '';

  // 🌟 Force member price if product purchases >= 5000
  if (productAccumulatedAmount >= 5000) {
      isApproved = true;
  }

  const userCourses = dbCourses.filter(c => String(getFuzzyKey(c, ["เบอร์โทร", "col_1"]) || '').trim() === cleanPhone).map(c => {
    const total = parseNumber(getFuzzyKey(c, ["จำนวนครั้งที่ได้", "col_10"])) || 1;
    const oldUsedRaw = getFuzzyKey(c, ["ครั้งที่ใช้", "col_5"]);
    const oldRemainingRaw = getFuzzyKey(c, ["ครั้งที่เหลือดิบ", "ครั้งที่เหลือ", "col_4"]);

    let baseUsed = 0;
    if (oldUsedRaw !== undefined && oldUsedRaw !== '') {
        baseUsed = parseNumber(oldUsedRaw);
    } else if (oldRemainingRaw !== undefined && oldRemainingRaw !== '') {
        baseUsed = Math.max(0, total - parseNumber(oldRemainingRaw));
    }
    const courseNo = String(getFuzzyKey(c, ["เลขที่ใบคอส", "รหัส", "รหัสคอร์ส", "col_2"]) || '').trim();
    const cleanCourseNo = courseNo.replace(new RegExp('\\s', 'g'), '').toLowerCase();
    const courseNameRaw = String(getFuzzyKey(c, ["ชื่อคอส", "ชื่อคอร์ส", "col_8"]) || '');
    const cleanCourseName = courseNameRaw.replace(new RegExp('\\s', 'g'), '').toLowerCase();
    const isPosCourse = cleanCourseNo.toUpperCase().startsWith('IC');
    const custNameClean = custName.replace(new RegExp('\\s', 'g'), '').toLowerCase();

    // 🌟 ลิงก์ประวัติเข้าคอร์สแบบเดียวกับฝั่งแอดมิน (admin App.jsx normalizeCourse):
    // 1) h.courseId === course.id  2) เลขอ้างอิงตรงเป๊ะ  3) prefix เฉพาะเลขคอร์สยาว > 4 (กัน false match)
    // 4) คอร์สที่ไม่ใช่ POS (ไม่ขึ้นต้น IC): จับคู่ด้วยชื่อคอร์สกับรายการในประวัติของลูกค้าเอง
    let totalAmountLinkedToCourse = 0;
    let newSystemUsed = 0;
    let newSystemAdded = 0;
    dbHistories.forEach(h => {
        if (h.isCancelled || String(getFuzzyKey(h, ["สถานะ", "col_7", "col_8", "col_9"]) || '') === 'ยกเลิก') return;

        const hRef = String(getFuzzyKey(h, ["เลขที่ใบคอส", "รหัสใบคอส", "อ้างอิง", "col_6"]) || '').replace(new RegExp('\\s', 'g'), '').toLowerCase();

        let linked = false;
        if (c.id && h.courseId === c.id) linked = true;
        if (!linked && cleanCourseNo.length > 2 && hRef === cleanCourseNo) linked = true;
        if (!linked && cleanCourseNo.length > 4 && hRef.startsWith(cleanCourseNo)) linked = true;
        if (!linked && !isPosCourse) {
            // ต้องเป็นประวัติของลูกค้ารายนี้เอง (เหมือน byCustomer ของแอดมิน)
            const hCust = String(getFuzzyKey(h, ["ชื่อลูกค้า", "ชื่อ", "col_2"]) || '').replace(new RegExp('\\s', 'g'), '').toLowerCase();
            const own = (h.cleanPhone && String(h.cleanPhone) === cleanPhone) || (!h.cleanPhone && hCust && hCust === custNameClean);
            if (own) {
                const hItem = String(getFuzzyKey(h, ["สินค้า", "ชื่อคอส", "รายการ", "col_18", "col_16", "col_23"]) || '').replace(new RegExp('\\s', 'g'), '').toLowerCase();
                if (cleanCourseName && hItem && (cleanCourseName.includes(hItem) || hItem.includes(cleanCourseName))) linked = true;
            }
        }

        if (linked) {
            const type = String(getFuzzyKey(h, ["ประเภท", "col_4"]) || '').trim();
            if (type.match(/(เบิก|หัก|จ่าย)/)) {
                const amt = parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอดรวม", "ยอดเบิก", "ยอดหัก", "จำนวนเงิน", "ราคา", "ยอดหักเครดิต", "col_19"]));
                if (amt > 0) totalAmountLinkedToCourse += amt;
            }

            // Same usage tracking logic as admin
            const isMole = type.includes('จี้ไฝ');
            if (!isMole) {
                const isUsageType = (t) => {
                    if (!t) return false;
                    const clean = String(t).replace(/\s/g, '').toLowerCase();
                    if (clean.match(/(ซื้อ|อัพ|เพิ่ม|แถม|บวก|เปิด|ใหม่)/)) return false;
                    return clean.match(/(ใช้|ตัด|หัก|บริการ|treatment|คอส|คอร์ส)/) !== null || clean.includes('เบิก');
                };
                const isAddType = (t) => {
                    if (!t) return false;
                    return String(t).replace(/\s/g, '').toLowerCase().match(/(อัพ|เพิ่ม|แถม|บวก)/) !== null;
                };
                
                if (isUsageType(type)) {
                    // check free usage roughly
                    const rawRemark = String(getFuzzyKey(h, ["หมายเหตุ", "col_10", "col_11", "col_12"]) || '').toLowerCase();
                    const isFree = rawRemark.includes('ฟรี') || rawRemark.includes('แถม') || rawRemark.includes('ไม่หัก');
                    if (!isFree) {
                        const isLegacy = !h.courseId;
                        const hasValidSigs = h.customerSignature?.length > 2000 && h.staffSignature?.length > 2000;
                        if (isLegacy || hasValidSigs) {
                            const rawQty = getFuzzyKey(h, ["จำนวน", "จำนวนที่ใช้", "ตัดคอร์ส", "col_15"]);
                            let qty = 1;
                            if (rawQty !== undefined && rawQty !== '') {
                                const parsed = Math.floor(parseNumber(rawQty));
                                if (parsed > 0 && parsed <= 500) qty = parsed;
                            }
                            if (!(type.includes('เบิก') && (rawQty === undefined || rawQty === ''))) {
                                if (isPosCourse) {
                                    if (!h.courseUpdatedDirectly) newSystemUsed += qty;
                                } else {
                                    newSystemUsed += qty;
                                }
                            }
                        }
                    }
                } else if (isAddType(type)) {
                    const rawQty = getFuzzyKey(h, ["จำนวน", "จำนวนที่ใช้", "ตัดคอร์ส", "col_15"]);
                    let qty = 1;
                    if (rawQty !== undefined && rawQty !== '') {
                        const parsed = Math.floor(parseNumber(rawQty));
                        if (parsed > 0 && parsed <= 500) qty = parsed;
                    }
                    newSystemAdded += qty;
                }
            }
        }
    });

    const currentTotal = total + newSystemAdded;
    let finalUsed = baseUsed + newSystemUsed;
    finalUsed = Math.min(currentTotal, finalUsed);
    const remaining = Math.max(0, currentTotal - finalUsed);

    const rawExplicitCredit = getFuzzyKey(c, ["เครดิตที่ได้รับ", "เครดิตที่ได้", "เครดิตทั้งหมด", "ยอดเครดิต", "วงเงินคอร์ส", "เครดิต", "วงเงิน", "วงเงินที่ได้รับ", "มูลค่าเครดิต", "col_14"]);
    const coursePrice = parseNumber(getFuzzyKey(c, ["ราคา", "ราคาคอร์ส", "ยอดเต็ม", "ยอดเงิน", "จำนวนเงิน", "ยอดสุทธิ", "ราคาขาย", "col_13"]));
    const courseName = String(getFuzzyKey(c, ["ชื่อคอส", "ชื่อคอร์ส", "col_8"]) || '').replace(new RegExp('\\s', 'g'), '').toLowerCase();
    
    let initialCredit = rawExplicitCredit !== undefined && rawExplicitCredit !== '' ? parseNumber(rawExplicitCredit) : 0;
    
    if (initialCredit === 0 && coursePrice > 0) {
        if (courseName.includes('เครดิต') || courseName.includes('วงเงิน') || courseName.includes('voucher') || courseName.includes('บัตรกำนัล') || courseName.includes('เติมเงิน') || courseName.includes('ฝากเงิน')) {
            initialCredit = coursePrice;
        }
    }
    
    const courseOldBerq = parseNumber(getFuzzyKey(c, ["ยอดเบิกดิบ", "เบิกไปแล้ว", "ยอดเบิก", "ใช้เครดิต", "หักเครดิต", "col_15"]));
    const courseOldAccum = parseNumber(getFuzzyKey(c, ["ยอดสะสมดิบ", "ยอดสะสม", "col_16"]));
    
    let finalBerqAmount = courseOldBerq + courseOldAccum + totalAmountLinkedToCourse;
    finalBerqAmount = Math.min(initialCredit, finalBerqAmount);

    const remainingCredit = initialCredit - finalBerqAmount; 

    return {
      ...c,
      totalUsed: finalUsed,
      remaining: remaining,
      status: remaining <= 0 && currentTotal > 0 ? 'ใช้ครบแล้ว' : 'ยังคงเหลือ',
      computedRemainCredit: Math.max(0, remainingCredit),
      computedTotalCredit: initialCredit
    };
  });

  const sortedHistory = uniqueMyHistories.sort((a,b) => {
     const refA = String(getFuzzyKey(a, ["หมายเลขเอกสาร", "Ref", "เลขที่บิล"]) || "");
     const refB = String(getFuzzyKey(b, ["หมายเลขเอกสาร", "Ref", "เลขที่บิล"]) || "");
     const numA = parseInt(refA.replace(/[^0-9]/g, ''), 10) || 0;
     const numB = parseInt(refB.replace(/[^0-9]/g, ''), 10) || 0;
     if (numA !== numB) return numB - numA;
     return refB.localeCompare(refA);
  });

  const receivedCredit = creditTransactions
    .filter(h => String(getFuzzyKey(h, "ประเภท") || '') === 'รับเครดิต')
    .reduce((s, h) => s + parseNumber(getFuzzyKey(h, "ยอดเงิน")), 0);

  const sortedCourses = userCourses.sort((a,b) => {
     const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
     const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
     if (timeA !== timeB && timeA > 0 && timeB > 0) return timeB - timeA;

     const refA = String(getFuzzyKey(a, ["เลขที่ใบคอส", "รหัส", "รหัสคอร์ส", "col_2"]) || "");
     const refB = String(getFuzzyKey(b, ["เลขที่ใบคอส", "รหัส", "รหัสคอร์ส", "col_2"]) || "");
     const numA = parseInt(refA.replace(/[^0-9]/g, ''), 10) || 0;
     const numB = parseInt(refB.replace(/[^0-9]/g, ''), 10) || 0;
     if (numA !== numB) return numB - numA;
     
     return refB.localeCompare(refA);
  });

  return {
    ...rawCustomer,
    cleanPhone,
    realAccumulatedAmount: totalAccumulated,
    productAccumulatedAmount: productAccumulatedAmount,
    memberStatus: memberStatus,
    isApproved: isApproved,
    courses: sortedCourses,
    history: sortedHistory,
    creditTransactions: creditTransactions,
    receivedCredit: receivedCredit
  };
};
