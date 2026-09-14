export const MOCK_COUPONS = [
  { code: 'WELCOME100', type: 'fixed', value: 100, desc: 'ลด 100.- ลูกค้าใหม่' },
  { code: 'SALE10', type: 'percent', value: 10, desc: 'ลด 10% ทุกรายการ' },
  { code: 'FREESHIP', type: 'fixed', value: 50, desc: 'ส่วนลดค่าจัดส่ง 50.-' }
];

export const BROCHURE_COURSES = [
  // --- โปรแกรมทรีทเม้นท์หน้า (Facial Treatment) จัดหมวด A-I ตามโบรชัวร์ ---
  { id: 'bro-trt-a', name: '[A] นวดหน้าใสครบขั้นตอน', bgText: 'A', desc: '1.ปรนนิบัติผิว 2.ขัดหน้าขาว 3.ไครโอเย็นกระชับรูขุมขน 4.มาร์คหน้าใส', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1608283086545-d8dc157cb760?w=400&q=80', isBrochure: true, theme: 'from-pink-400 to-rose-500',
    packages: [
      { id: 'bro-trt-a-1', name: '1 ครั้ง', price: 399, originalPrice: 550 },
      { id: 'bro-trt-a-5', name: '5 ครั้ง', price: 1750, originalPrice: 2750 },
      { id: 'bro-trt-a-10', name: 'เหมา 10 ครั้ง', price: 2999, originalPrice: 5500 }
    ]
  },
  { id: 'bro-trt-b', name: '[B] ดูดสิวเสี้ยนครบขั้นตอน', bgText: 'B', desc: '1.โอโซนร้อน 2.ดูดสิวเสี้ยน 3.ขัดหน้าขาวลดความมัน 4.ไครโอเย็น 5.มาร์คหน้าตามสภาพผิว', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80', isBrochure: true, theme: 'from-amber-400 to-orange-500',
    packages: [
      { id: 'bro-trt-b-1', name: '1 ครั้ง', price: 499, originalPrice: 650 },
      { id: 'bro-trt-b-5', name: '5 ครั้ง', price: 2250, originalPrice: 3250 },
      { id: 'bro-trt-b-10', name: 'เหมา 10 ครั้ง', price: 3999, originalPrice: 6500 }
    ]
  },
  { id: 'bro-trt-c', name: '[C] เคลียร์สิวครบขั้นตอน', bgText: 'C', desc: '1.กดสิวทั่วหน้า 2.โอโซนร้อน 3.พอกลดความมัน 4.มาร์คคาเวียร์ลดรอยแดงหน้าใส 5.ไครโอเย็น/LED', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1598440947619-2ce32f05f6ce?w=400&q=80', isBrochure: true, theme: 'from-emerald-400 to-teal-500',
    packages: [
      { id: 'bro-trt-c-1', name: '1 ครั้ง', price: 499, originalPrice: 699 },
      { id: 'bro-trt-c-5', name: '5 ครั้ง', price: 2250, originalPrice: 3495 },
      { id: 'bro-trt-c-10', name: 'เหมา 10 ครั้ง', price: 3999, originalPrice: 6990 }
    ]
  },
  { id: 'bro-trt-d', name: '[D] เมโสยกกระชับหน้าใส', bgText: 'D', desc: '1.ปรนนิบัติผิว 2.พอกหน้า 3.เช็ดทรีทเม้นท์ 4.เมโสผลักวิตามิน 5.มาร์คโบทิวคลดริ้วรอย', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1570172619644-defd000f07df?w=400&q=80', isBrochure: true, theme: 'from-cyan-400 to-blue-500',
    packages: [
      { id: 'bro-trt-d-1', name: '1 ครั้ง', price: 499, originalPrice: 699 },
      { id: 'bro-trt-d-5', name: '5 ครั้ง', price: 2250, originalPrice: 3495 },
      { id: 'bro-trt-d-10', name: 'เหมา 10 ครั้ง', price: 3999, originalPrice: 6990 }
    ]
  },
  { id: 'bro-trt-e', name: '[E] เมโสตาครบขั้นตอน', bgText: 'E', desc: '1.ปรนนิบัติผิว 2.ขัดหน้าขาว 3.มาร์คสาหร่ายรอบดวงตา 4.เมโสรอบดวงตา 5.ไครโอเย็นกระชับรูขุมขน', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80', isBrochure: true, theme: 'from-violet-400 to-purple-500',
    packages: [
      { id: 'bro-trt-e-1', name: '1 ครั้ง', price: 499, originalPrice: 699 },
      { id: 'bro-trt-e-5', name: '5 ครั้ง', price: 2250, originalPrice: 3495 },
      { id: 'bro-trt-e-10', name: 'เหมา 10 ครั้ง', price: 3999, originalPrice: 6990 }
    ]
  },
  { id: 'bro-trt-f', name: '[F] นาโนไวท์ผลักวิตามินหน้าใส', bgText: 'F', desc: '1.ปรนนิบัติผิว 2.พอกหน้าปรับสภาพผิว 3.สกินสครับเบอร์ 4.เช็ดทรีทเม้นท์ 5.ลงเครื่องนาโนผลักวิตามิน 6.ไครโอเย็นหน้าใสลดริ้วรอย', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1616409840905-1a221f76b5fc?w=400&q=80', isBrochure: true, theme: 'from-fuchsia-400 to-pink-500',
    packages: [
      { id: 'bro-trt-f-1', name: '1 ครั้ง', price: 599, originalPrice: 899 },
      { id: 'bro-trt-f-5', name: '5 ครั้ง', price: 2750, originalPrice: 4495 },
      { id: 'bro-trt-f-10', name: 'เหมา 10 ครั้ง', price: 4999, originalPrice: 8990 }
    ]
  },
  { id: 'bro-trt-g', name: '[G] RF ยกกระชับสลายไขมัน', bgText: 'G', desc: '1.ปรนนิบัติผิว 2.พอกหน้าปรับสภาพผิว 3.เช็ดAHA 4.ลงเครื่องRFยกกระชับหน้าใส 5.มาร์คโบทิวค 6.ไครโอเย็นริ้วรอยหน้าเด้ง', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80', isBrochure: true, theme: 'from-red-400 to-rose-600',
    packages: [
      { id: 'bro-trt-g-1', name: '1 ครั้ง', price: 699, originalPrice: 999 },
      { id: 'bro-trt-g-5', name: '5 ครั้ง', price: 3250, originalPrice: 4995 },
      { id: 'bro-trt-g-10', name: 'เหมา 10 ครั้ง', price: 5999, originalPrice: 9990 }
    ]
  },
  { id: 'bro-trt-h', name: '[H] ริดพิคเม้นลดฝ้ากระ', bgText: 'H', desc: '1.ปรนนิบัติผิว 2.พอกหน้าปรับสภาพผิว 3.AHA 4.ยิงริดพิคเม้น 5.ไครเย็นหน้าใสลดริ้วรอย 6.มาร์คลดฝ้าหน้าใส', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1598440947619-2ce32f05f6ce?w=400&q=80', isBrochure: true, theme: 'from-indigo-400 to-purple-600',
    packages: [
      { id: 'bro-trt-h-1', name: '1 ครั้ง', price: 699, originalPrice: 950 },
      { id: 'bro-trt-h-5', name: '5 ครั้ง', price: 3250, originalPrice: 4750 },
      { id: 'bro-trt-h-10', name: 'เหมา 10 ครั้ง', price: 5999, originalPrice: 9500 }
    ]
  },
  { id: 'bro-trt-i', name: '[I] เมโสสปีดไวท์ครบขั้นตอน', bgText: 'I', desc: '1.ปรนนิบัติผิว 2.พอก 3.เมโสตา 4.เมโสหน้า 5.ไครโอ 6.มาร์คหน้าตามสภาพผิว 7.สกินสครับเบอร์', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1570172619644-defd000f07df?w=400&q=80', isBrochure: true, theme: 'from-yellow-400 to-amber-600',
    packages: [
      { id: 'bro-trt-i-1', name: '1 ครั้ง', price: 899, originalPrice: 1200 },
      { id: 'bro-trt-i-5', name: '5 ครั้ง', price: 4250, originalPrice: 6000 },
      { id: 'bro-trt-i-10', name: 'เหมา 10 ครั้ง', price: 7999, originalPrice: 12000 }
    ]
  },

  // --- ชุดรักษาสิว-ฝ้า (ปรับสภาพผิวเคลียร์สิว - ฟื้นฟูผิว-ลดฝ้า) ---
  { id: 'bro-set-a', name: 'SET.A คอร์สรักษาสิว/ฝ้า', bgText: 'SET A', desc: 'ผลิตภัณฑ์ 3000 บ. | ฟรีลงเครื่อง 15 ครั้ง | ฟรีแอคทีฟสกิน 1 ครั้ง', price: 5900, originalPrice: 8900, type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1616409840905-1a221f76b5fc?w=400&q=80', isBrochure: true, theme: 'from-blue-600 to-indigo-800' },
  { id: 'bro-set-b', name: 'SET.B คอร์สรักษาสิว/ฝ้า', bgText: 'SET B', desc: 'ผลิตภัณฑ์ 5000 บ. | ฟรีลงเครื่อง 20 ครั้ง | ฟรีแอคทีฟสกิน 1 ครั้ง | ฟรีนาโนไวท์ 1 ครั้ง | ฟรีบัตรสมาชิก', price: 9500, originalPrice: 12500, type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80', isBrochure: true, theme: 'from-indigo-600 to-purple-800' },
  { id: 'bro-set-c', name: 'SET.C คอร์สรักษาสิว/ฝ้า', bgText: 'SET C', desc: 'ผลิตภัณฑ์ 5000 บ. | ฟรีลงเครื่อง 25 ครั้ง | ฟรีแอคทีฟสกิน 3 ครั้ง | ฟรีนาโนไวท์ 2 ครั้ง | ฟรีบัตรสมาชิก', price: 12900, originalPrice: 16900, type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1598440947619-2ce32f05f6ce?w=400&q=80', isBrochure: true, theme: 'from-purple-600 to-fuchsia-800' },
  
  // --- ชุดบำรุง (ดูแลปัญหารอยสิว-ฟื้นฟูผิว-บำรุง) ---
  { id: 'bro-mnt-a', name: 'SET.A บำรุงฟื้นฟูผิว', bgText: 'SET A', desc: 'ผลิตภัณฑ์ 1200 บ. | ฟรีแอคทีฟสกิน 1 ครั้ง | ฟรีเมโสครบขั้นตอน 1 ครั้ง', price: 2500, originalPrice: 3500, type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1570172619644-defd000f07df?w=400&q=80', isBrochure: true, theme: 'from-sky-500 to-blue-600' },
  { id: 'bro-mnt-b', name: 'SET.B บำรุงฟื้นฟูผิว', bgText: 'SET B', desc: 'ผลิตภัณฑ์ 1500 บ. | ฟรีแอคทีฟสกิน 1 ครั้ง | ฟรีนาโนไวท์ 1 ครั้ง | ฟรีเมโสครบขั้นตอน 1 ครั้ง', price: 3500, originalPrice: 4500, type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1608283086545-d8dc157cb760?w=400&q=80', isBrochure: true, theme: 'from-blue-500 to-indigo-600' },
  { id: 'bro-mnt-c', name: 'SET.C บำรุงฟื้นฟูผิว', bgText: 'SET C', desc: 'ผลิตภัณฑ์ 2500 บ. | ฟรีแอคทีฟสกิน 1 ครั้ง | ฟรีนาโนไวท์ 1 ครั้ง | ฟรีลงเครื่อง 5 ครั้ง', price: 5000, originalPrice: 6500, type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80', isBrochure: true, theme: 'from-indigo-500 to-violet-600' },
  
  // --- ลงเครื่องเพิ่ม ---
  { id: 'bro-mac', name: 'ลงเครื่องผลักวิตามิน', bgText: 'เครื่อง', desc: 'ซื้อบริการลงเครื่องตามสภาพผิวเพิ่ม', type: 'course', itemCategory: 'โปรโมชั่นโบรชัวร์', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80', isBrochure: true, theme: 'from-slate-700 to-slate-900',
    packages: [
      { id: 'bro-mac-5', name: 'ลงเครื่อง 5 ครั้ง', price: 1299, originalPrice: 1500 },
      { id: 'bro-mac-10', name: 'ลงเครื่อง 10 ครั้ง', price: 1999, originalPrice: 3000 },
      { id: 'bro-mac-20', name: 'ลงเครื่อง 20 ครั้ง', price: 2999, originalPrice: 6000 }
    ]
  }
];

export const PROMO_COURSES = [
  { id: 'promo-acne-199', name: 'กดสิวอย่างเดียว', desc: 'เริ่มต้นเพียง 199฿', price: 199, originalPrice: 0, type: 'course', image: null },
  { id: 'promo-acne-299', name: 'กดสิว + พอกฆ่าเชื้อ', desc: 'ลดสิวอักเสบ ฆ่าเชื้อสิว', price: 299, originalPrice: 0, type: 'course', image: null },
  { id: 'promo-acne-499', name: 'โปรแกรมเคลียร์สิว', desc: 'กดสิว, โอโซนร้อน, พอกลดมัน, ไครโอเย็น, มาร์คลดรอยแดง', price: 499, originalPrice: 0, type: 'course', image: null },
  { id: 'promo-acne-599', name: 'เคลียร์สิว + ดูดสิวเสี้ยน (Best Seller)', desc: 'ครบสูตร: กดสิว, โอโซนร้อน, ดูดสิวเสี้ยน, พอกลดมัน, ไครโอเย็น, มาร์คลดรอยแดง', price: 599, originalPrice: 799, type: 'course', image: null },
  { id: 'machine-scrub', name: 'สกินสครับเบอร์', desc: 'ลงเครื่องรายครั้ง', price: 100, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-ozone', name: 'โอโซนร้อน/เย็น', desc: 'ลงเครื่องรายครั้ง', price: 100, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-meso-eye', name: 'เมโสรอบดวงตา', desc: 'ลงเครื่องรายครั้ง', price: 200, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-meso-vit', name: 'เมโสผลักวิตามิน', desc: 'ลงเครื่องรายครั้ง', price: 200, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-phono', name: 'โฟโนผลักวิตามิน', desc: 'ลงเครื่องรายครั้ง', price: 200, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-rf', name: 'RF ยกกระชับ', desc: 'ลงเครื่องรายครั้ง', price: 200, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-cryo', name: 'ไครโอเย็น (สปาเย็น)', desc: 'ลงเครื่องรายครั้ง', price: 200, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-softlaser', name: 'ซอฟเลเซอร์', desc: 'ลงเครื่องรายครั้ง', price: 200, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-led', name: 'แสงบำบัด (LED)', desc: 'ลงเครื่องรายครั้ง', price: 200, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-ridpigment', name: 'ริดพิคเม้น', desc: 'ลงเครื่องรายครั้ง', price: 250, originalPrice: 0, type: 'course', image: null },
  { id: 'machine-nanowhite', name: 'นาโนไวท์', desc: 'ลงเครื่องรายครั้ง', price: 250, originalPrice: 0, type: 'course', image: null },
];
