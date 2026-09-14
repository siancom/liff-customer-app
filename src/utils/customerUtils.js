import { getFuzzyKey, parseNumber } from './helpers';

export const buildCustomerData = (rawCustomer, cleanPhone, dbHistories, dbCourses) => {
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
    return (getFuzzyKey(h, ["ชื่อลูกค้า", "ชื่อ"]) || '').trim() === custName;
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
         } else if (currentAmt > 0 && map.get(ref)._groupedAmount === 0) {
             map.get(ref)._groupedAmount = currentAmt;
         }
     } else {
         uniqueMyHistories.push({ ...h, _groupedAmount: currentAmt });
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

  const userCourses = dbCourses.filter(c => getFuzzyKey(c, "เบอร์โทร") === cleanPhone).map(c => {
    const total = parseNumber(getFuzzyKey(c, ["จำนวนครั้งที่ได้", "col_10"]));
    const used = parseNumber(getFuzzyKey(c, ["ครั้งที่ใช้", "col_5"]));
    const remainingRaw = getFuzzyKey(c, ["ครั้งที่เหลือดิบ", "ครั้งที่เหลือ", "col_4"]) !== undefined ? parseNumber(getFuzzyKey(c, ["ครั้งที่เหลือดิบ", "ครั้งที่เหลือ", "col_4"])) : 0;
    const totalUsed = remainingRaw + used;
    const remaining = Math.max(0, total - totalUsed);

    const courseNo = String(getFuzzyKey(c, ["เลขที่ใบคอส", "รหัส", "รหัสคอร์ส", "col_2"]) || '').trim();
    const cleanCourseNo = courseNo.replace(new RegExp('\\s', 'g'), '').toLowerCase();
    
    // Find all histories linked to this course
    let totalAmountLinkedToCourse = 0;
    dbHistories.forEach(h => {
        if (h.isCancelled || String(getFuzzyKey(h, ["สถานะ", "col_7", "col_8", "col_9"]) || '') === 'ยกเลิก') return;
        
        const hCust = String(getFuzzyKey(h, ["ชื่อลูกค้า", "ชื่อ", "col_2"]) || '').trim();
        const isMyHistory = (h.cleanPhone && String(h.cleanPhone) === cleanPhone) || (!h.cleanPhone && hCust === custName);
        if (!isMyHistory) return;

        const hRef = String(getFuzzyKey(h, ["เลขที่ใบคอส", "รหัสใบคอส", "อ้างอิง", "col_6"]) || '').replace(new RegExp('\\s', 'g'), '').toLowerCase();
        
        if ((cleanCourseNo && cleanCourseNo.length > 2 && hRef.startsWith(cleanCourseNo)) || h.courseId === c.id) {
            const type = String(getFuzzyKey(h, ["ประเภท", "col_4"]) || '').trim();
            if (type.match(/(เบิก|หัก|จ่าย)/)) { 
                const amt = parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอดรวม", "ยอดเบิก", "ยอดหัก", "จำนวนเงิน", "ราคา", "ยอดหักเครดิต", "col_19"]));
                if (amt > 0) totalAmountLinkedToCourse += amt;
            }
        }
    });

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
      totalUsed: totalUsed,
      remaining: remaining,
      status: remaining <= 0 ? 'ใช้ครบแล้ว' : 'ยังคงเหลือ',
      computedRemainCredit: Math.max(0, remainingCredit)
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

  return {
    ...rawCustomer,
    cleanPhone,
    realAccumulatedAmount: totalAccumulated,
    memberStatus: memberStatus,
    isApproved: isApproved,
    courses: userCourses,
    history: sortedHistory,
    creditTransactions: creditTransactions,
    receivedCredit: receivedCredit
  };
};
