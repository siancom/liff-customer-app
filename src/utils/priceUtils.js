import { getFuzzyKey, parseNumber } from './helpers';

// 🌟 มิเรอร์จากแอดมิน (admin-dashboard/src/utils/priceUtils.js) — ให้ราคาหน้าร้าน/แอปลูกค้าตรงกันเป๊ะ 🌟
// สำคัญ: ลำดับ field ต้องเป็น "ราคาขายเต็ม" ก่อนเสมอ
// (ถ้าหาด้วย "ราคา" ก่อน จะ fuzzy ไปโดน "ราคาสมาชิก"/"ราคา25%"/"ราคาขายคงเหลือ" ซึ่งเป็นคนละค่า)
// col_6 = คอลัมน์ราคาของข้อมูลเก่า (col_5 คือหน่วยนับ ไม่ใช่ราคา!)

// 🌟 ส่วนลด VIP ตามแบรนด์สินค้า 🌟
export const VIP_DISCOUNT_MAP = {
  'IRIS': 0.25,      // 25%
  'JENESS': 0.20,    // 20%
  'PUREFRESH': 0.20  // 20%
};

export const getVipDiscountRate = (product) => {
  const category = String(getFuzzyKey(product, ["หมวดสินค้า", "col_4"]) || '').trim().toUpperCase();
  const unit = String(getFuzzyKey(product, ["หน่วยนับ", "col_7", "col_5"]) || '').trim().toLowerCase();

  // ยกเว้นสินค้าประเภทซอง
  if (unit.includes('ซอง')) return 0;

  if (category === 'IRIS' || category.includes('IRIS') || category.includes('ไอริส')) return VIP_DISCOUNT_MAP['IRIS'];
  if (category === 'JENESS' || category.includes('JENESS')) return VIP_DISCOUNT_MAP['JENESS'];
  if (category === 'PUREFRESH' || category.includes('PUREFRESH')) return VIP_DISCOUNT_MAP['PUREFRESH'];
};

// ราคาเต็ม (ราคาขายปกติ) — สำหรับสินค้า; คอร์สให้ส่ง priceKeys ["ราคา","ราคาขาย","col_5"]
export const getFullPrice = (product, priceKeys = ["ราคาขายเต็ม", "ราคา", "col_6"]) =>
  parseNumber(getFuzzyKey(product, priceKeys));

// ราคาที่ลูกค้าจ่ายจริง: VIP ลดตามแบรนด์ (ยกเว้นซอง) → fallback ราคาสมาชิก → ราคาเต็ม (เหมือน POS แอดมิน)
export const computeFinalPrice = (product, isVipCustomer, priceKeys = ["ราคาขายเต็ม", "ราคา", "col_6"]) => {
  const fullPrice = getFullPrice(product, priceKeys);
  if (!isVipCustomer) return fullPrice;

  const discountRate = getVipDiscountRate(product);
  if (discountRate > 0) {
    return Math.ceil(fullPrice * (1 - discountRate));
  }
  const memberPriceRaw = parseNumber(getFuzzyKey(product, ["ราคาสมาชิก", "col_10"]));
  return memberPriceRaw > 0 ? memberPriceRaw : fullPrice;
};
