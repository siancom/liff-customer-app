export function parseNumber(val) {
  if (val === undefined || val === null) return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseQty(val) {
  return Math.floor(parseNumber(val));
}

export function parseThaiDate(dateStr) {
  if (!dateStr || String(dateStr).trim() === '-' || String(dateStr).trim() === '') return null;
  const cleanStr = String(dateStr).split(' ')[0].split('T')[0];
  const parts = cleanStr.split(/[-/]/);
  
  if (parts.length >= 3) {
    let year, month, day;
    if (parts[0].length >= 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
    } else {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
    }
    if (year > 2500) year -= 543; 
    else if (year > 0 && year < 100) year += 2000;
    
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  const dFallback = new Date(dateStr);
  return isNaN(dFallback.getTime()) ? null : dFallback;
}

export function getLocalDateString(d) {
    if (!d) d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatShortDate(d) {
    const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return {
        dayName: days[d.getDay()],
        dateNum: d.getDate().toString().padStart(2, '0'),
        monthName: months[d.getMonth()],
        fullValue: getLocalDateString(d)
    };
}

export function timeToMins(t) {
    if (!t || typeof t !== 'string') return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

export function getFuzzyKey(obj, targetKeys) {
  if (!obj) return undefined;
  const targets = Array.isArray(targetKeys) ? targetKeys : [targetKeys];
  for (let target of targets) {
    if (obj[target] !== undefined && obj[target] !== '') return obj[target];
  }
  for (let target of targets) {
    const cleanTarget = target.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase();
    const exactKey = Object.keys(obj).find(k => {
        const cleanK = k.replace(/[\s\u200B-\u200D\uFEFF"'\r\n]/g, '').toLowerCase();
        return cleanK === cleanTarget;
    });
    if (exactKey && obj[exactKey] !== '') return obj[exactKey];
  }
  for (let target of targets) {
    const cleanTarget = target.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase();
    if (['ยอด', 'ราคา', 'จำนวน', 'ชื่อ'].includes(cleanTarget)) continue;

    const matchingKeys = Object.keys(obj).filter(k => k.replace(/[\s\u200B-\u200D\uFEFF"'\r\n]/g, '').toLowerCase().includes(cleanTarget));

    for (let mk of matchingKeys) {
        const cleanMK = mk.replace(/[\s\u200B-\u200D\uFEFF"'\r\n]/g, '').toLowerCase();
        if (['เครดิต', 'วงเงิน', 'เครดิตที่ได้รับ', 'เครดิตที่ได้', 'ยอดเครดิต', 'เครดิตทั้งหมด'].includes(cleanTarget) && (cleanMK.includes('หัก') || cleanMK.includes('ใช้') || cleanMK.includes('เหลือ') || cleanMK.includes('เบิก') || cleanMK.includes('เก่า'))) continue;
        if (['ยอดเบิกดิบ', 'เบิกไปแล้ว', 'ยอดเบิก', 'ใช้เครดิต', 'ยอดสะสมดิบ', 'หักเครดิต'].includes(cleanTarget) && (cleanMK.includes('ได้รับ') || cleanMK.includes('ทั้งหมด') || cleanMK.includes('เหลือ'))) continue;
        if (['ครั้งที่เหลือดิบ', 'ครั้งที่เหลือ', 'เหลือ'].includes(cleanTarget)) {
            if (cleanMK.includes('ใช้') || cleanMK.includes('ทั้งหมด')) continue;
        }
        if (cleanTarget.includes('ราคา') && (
            cleanMK.includes('รหัส') || cleanMK.includes('เลข') || cleanMK.includes('barcode') || cleanMK.includes('id') || cleanMK.includes('บาร์โค้ด') || cleanMK.includes('sku') || cleanMK.includes('ทุน') || cleanMK.includes('cost') || cleanMK.includes('สต็อก') || cleanMK.includes('stock')
        )) continue;

        if (obj[mk] !== '') return obj[mk];
    }
  }
  return undefined;
}

export const isMoleHistoryRecord = (h) => String(getFuzzyKey(h, ["ประเภท", "col_4"]) || '').trim().includes('จี้ไฝ');

export const isUsageType = (typeStr) => {
    if (!typeStr) return false;
    const clean = String(typeStr).replace(/\s/g, '').toLowerCase();
    if (clean.match(/(ซื้อ|อัพ|เพิ่ม|แถม|บวก|เปิด|ใหม่)/)) return false;
    return clean.match(/(ใช้|ตัด|หัก|บริการ|treatment|คอส|คอร์ส)/) !== null || clean.includes('เบิก');
};

export const isAddType = (typeStr) => {
    if (!typeStr) return false;
    const clean = String(typeStr).replace(/\s/g, '').toLowerCase();
    return clean.match(/(อัพ|เพิ่ม|แถม|บวก)/) !== null;
};

export const isFreeUsage = (h) => {
    const rawRemark = String(getFuzzyKey(h, ["หมายเหตุ", "col_10", "col_11", "col_12"]) || '').toLowerCase();
    const rawAction = String(getFuzzyKey(h, ["รายการที่ทำ", "รายการ", "col_23", "col_18"]) || '').toLowerCase();
    const rawProduct = String(getFuzzyKey(h, ["สินค้า", "col_18", "col_16"]) || '').toLowerCase();
    
    const cleanRemark = rawRemark.replace(/\s/g, '');
    const cleanAction = rawAction.replace(/\s/g, '');
    const cleanProduct = rawProduct.replace(/\s/g, '');

    if (cleanRemark.includes('แอคทีฟ899') || cleanAction.includes('แอคทีฟ899') || cleanProduct.includes('แอคทีฟ899') ||
        cleanRemark.includes('active899') || cleanAction.includes('active899') || cleanProduct.includes('active899')) {
        return true;
    }

    const isRemarkFree = rawRemark === 'ฟรี' || rawRemark === 'แถม' || rawRemark.includes('ฟรี 1 ครั้ง') || rawRemark.includes('แถม 1 ครั้ง') || rawRemark.includes('ไม่หัก');
    if (isRemarkFree) return true;

    const checkAllFree = (text) => {
        if (!text) return true; 
        const parts = text.split('>>').map(s => s.trim()).filter(Boolean);
        if (parts.length === 0) return true;
        
        return parts.every(part => {
            return part.includes('ฟรี') || part.includes('แถม');
        });
    };

    const hasText = rawAction.length > 0 || rawProduct.length > 0;
    if (hasText) {
        if (rawAction && rawProduct) return checkAllFree(rawAction) && checkAllFree(rawProduct);
        if (rawAction) return checkAllFree(rawAction);
        if (rawProduct) return checkAllFree(rawProduct);
    }

    return false;
};

export const isActive899 = (h) => {
    const rawRemark = String(getFuzzyKey(h, ["หมายเหตุ", "col_10", "col_11", "col_12"]) || '').replace(/\s/g, '').toLowerCase();
    const rawAction = String(getFuzzyKey(h, ["รายการที่ทำ", "รายการ", "col_23", "col_18"]) || '').replace(/\s/g, '').toLowerCase();
    const rawProduct = String(getFuzzyKey(h, ["สินค้า", "col_18", "col_16"]) || '').replace(/\s/g, '').toLowerCase();
    
    return rawRemark.includes('แอคทีฟ899') || rawAction.includes('แอคทีฟ899') || rawProduct.includes('แอคทีฟ899') ||
           rawRemark.includes('active899') || rawAction.includes('active899') || rawProduct.includes('active899');
};

export function extractHistoryQty(h) {
    const rawQty = getFuzzyKey(h, ["จำนวน", "จำนวนที่ใช้", "จำนวนที่ได้", "ตัดคอร์ส", "col_15"]);
    if (rawQty !== undefined && rawQty !== '') {
        const parsed = Math.floor(parseNumber(rawQty));
        if (parsed > 0 && parsed <= 500) return parsed;
    }
    return 1;
};

export const getBrandDetails = (itemName, categoryName = '') => {
    const searchStr = (String(itemName || '') + ' ' + String(categoryName || '')).toLowerCase();
    
    if (searchStr.includes('iris') || searchStr.includes('ไอริส')) return { name: 'Iris', discount: 25, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (searchStr.includes('purefresh') || searchStr.includes('เพียวเฟรช')) return { name: 'Purefresh', discount: 20, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (searchStr.includes('jeness') || searchStr.includes('เจอเนส')) return { name: 'Jeness', discount: 20, color: 'bg-rose-50 text-rose-700 border-rose-200' };
    
    if (searchStr.includes('kvk')) return { name: 'KVK', discount: 25, color: 'bg-purple-50 text-purple-700 border-purple-200' };
    if (searchStr.includes('ime') || searchStr.includes('ไอเม่')) return { name: 'Ime', discount: 25, color: 'bg-pink-50 text-pink-700 border-pink-200' };
    if (searchStr.includes('ploy') || searchStr.includes('พลอย')) return { name: 'Ploy', discount: 25, color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (searchStr.includes('jub') || searchStr.includes('จุ๊บ')) return { name: 'Jub', discount: 25, color: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (searchStr.includes('jula') || searchStr.includes('จุฬา')) return { name: 'Jula', discount: 25, color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' };
    if (searchStr.includes('v-nature') || searchStr.includes('วีเนเจอร์')) return { name: 'V-Nature', discount: 25, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (searchStr.includes('lamer') || searchStr.includes('ลาแมร์')) return { name: 'Lamer', discount: 10, color: 'bg-teal-50 text-teal-700 border-teal-200' };
    if (searchStr.includes('เพชร')) return { name: 'เพชร', discount: 25, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    if (searchStr.includes('ทอง')) return { name: 'ทอง', discount: 25, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return null;
};
