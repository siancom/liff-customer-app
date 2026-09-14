function getFuzzyKey(obj, targetKeys) {
  if (!obj) return undefined;
  const targets = Array.isArray(targetKeys) ? targetKeys : [targetKeys];
  for (let target of targets) {
    if (obj[target] !== undefined && obj[target] !== "") return obj[target];
  }
  return undefined;
}
function parseNumber(val) {
  if (val === undefined || val === null) return 0;
  const cleaned = String(val).replace(/,/g, "").replace(/[^\d.-]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const ledgerHistory = [ { "ประเภท": "คอร์ส", "ยอดเงิน": 100 } ];
const activeCourses = [ { computedRemainCredit: 50 } ];

const totalCreditValue = (activeCourses || []).reduce((sum, c) => sum + (c?.computedRemainCredit || 0), 0);
const totalCourseAmt = (ledgerHistory || []).filter(h => {
    const t = String(getFuzzyKey(h, "ประเภท") || "");
    return t.includes("คอร์ส") || t.includes("คอส") || t.includes("เปิดคอร์ส");
}).reduce((sum, h) => sum + parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด"])), 0);

console.log(totalCreditValue, totalCourseAmt);
