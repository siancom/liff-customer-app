import React, { useState, useEffect, useRef } from 'react';
import { X, Scan, Camera, Sparkles, Upload, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Ban, ArrowRight, Target, Activity, Share2, Smile, Droplets, Eye, Check, Copy, Heart, ShieldCheck, Tag, CircleCheck, Coins, HelpCircle, EyeOff, Layers, Maximize2, ChevronDown, ChevronUp, UserCheck, Calendar, ChevronRight, ShoppingCart, ShoppingBag, History, Gauge, Gift } from 'lucide-react';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

// 🌟 ฐานความรู้เจาะลึกแต่ละด้านผิว (ใช้เมื่อกดขยายการ์ดคะแนน) 🌟
const SKIN_METRICS = {
  acne: {
    label: 'สิว & รอยแดง',
    causes: 'ฮอร์โมน, ความมันส่วนเกิน, รูขุมขนอุดตัน, สะสมสิ่งสกปรก หรือใช้เครื่องสำอางที่อุดตัน',
    homeCare: 'ล้างหน้าเบาๆ วันละ 2 ครั้ง, ไม่บีบสิวเอง, เลือกผลิตภัณฑ์ non-comedogenic, หลีกเลี่ยงมันทอด/หวานจัด',
    relatedServiceKeywords: ['สิว', 'คีบสิว', 'กดสิว', 'เคลียร์สิว', 'ดูดสิว'],
    getStatus: (s) => s >= 8 ? { text: 'ผิวใส แทบไม่มีสิว', tone: 'good' } : s >= 6 ? { text: 'มีสิวอุดตัน/รอยแดงเล็กน้อย', tone: 'mid' } : { text: 'มีสิวอักเสบ/รอยแดง ควรดูแล', tone: 'bad' }
  },
  wrinkles: {
    label: 'ริ้วรอย/กระชับ',
    causes: 'คอลลาเจนลดลงตามวัย, แสงแดด, การนอนหน้าบีบ, สูบบุหรี่ หรือพักผ่อนไม่เพียงพอ',
    homeCare: 'ทากันแดดทุกวัน, บำรุงด้วยวิตามินซี/เรตินอล, นอนหลับให้เพียงพอ, ดื่มน้ำมากๆ',
    relatedServiceKeywords: ['RF', 'โบ', 'ฟิลเลอร์', 'มาร์ค', 'นาโนไวท์', 'เมโส', 'คอลลาเจน', 'ยกกระชับ'],
    getStatus: (s) => s >= 8 ? { text: 'ผิวกระชับ ดูอ่อนเยาว์', tone: 'good' } : s >= 6 ? { text: 'เริ่มมีริ้วรอยเล็กๆ', tone: 'mid' } : { text: 'มีริ้วรอยชัดเจน ควรบำรุง', tone: 'bad' }
  },
  brightness: {
    label: 'ความกระจ่างใส',
    causes: 'ผิวหมองคล้ำจากแดด, สะสมเซลล์ผิวเก่า, พักผ่อนน้อย หรือการดูแลไม่สม่ำเสมอ',
    homeCare: 'ขัด/สครับผิวเบาๆ สัปดาห์ละครั้ง, ทาวิตามินซีเช้า-กันแดดกลางวัน, นอนก่อน 4 ทุ่ม',
    relatedServiceKeywords: ['ไวท์', 'ออร่า', 'วิตามิน', 'นาโน', 'สครับ', 'AHA', 'ผลักวิตามิน', 'เมโสไวท์'],
    getStatus: (s) => s >= 8 ? { text: 'ผิวสว่างกระจ่างใส', tone: 'good' } : s >= 6 ? { text: 'ผิวเริ่มหมองคล้ำเล็กน้อย', tone: 'mid' } : { text: 'ผิวหมองคล้ำ ควรดูแล', tone: 'bad' }
  },
  pores: {
    label: 'รูขุมขน/ผิวเนียน',
    causes: 'ความมันส่วนเกิน, รูขุมขนอุดตัน, คอลลาเจนลดลงรอบรูขุมขน หรือกรรมพันธุ์',
    homeCare: 'ทำความสะอาดรูขุมขน, หลีกเลี่ยงบีบสิวหัวดำ, ใช้โทนเนอร์/Niacinamide, สครับเบาๆ',
    relatedServiceKeywords: ['สครับ', 'ดูดสิวเสี้ยน', 'AHA', 'เมโส', 'นาโน', 'คีบสิว'],
    getStatus: (s) => s >= 8 ? { text: 'ผิวเรียบเนียน รูขุมขนกระชับ', tone: 'good' } : s >= 6 ? { text: 'รูขุมขนกว้างเล็กน้อย', tone: 'mid' } : { text: 'รูขุมขนกว้างชัดเจน ควรดูแล', tone: 'bad' }
  },
  darkSpots: {
    label: 'ฝ้า กระ จุดด่างดำ',
    causes: 'แสงแดดสะสม, ฮอร์โมน, การอักเสบจากสิว (PIH), กรรมพันธุ์ หรือการใช้ยาบางชนิด',
    homeCare: 'ทากันแดด SPF50+ ทุกวันทั้งเช้า-บ่าย, ใช้วิตามินซี/อาร์บูติน, หลีกเลี่ยงแดดจัด',
    relatedServiceKeywords: ['พิกเม้น', 'ฝ้า', 'กระ', 'เลเซอร์', 'ไวท์', 'เมโส', 'จุดด่างดำ', 'IPL', 'วิตามิน'],
    getStatus: (s) => s >= 8 ? { text: 'ผิวสะอาด แทบไม่มีจุดด่างดำ', tone: 'good' } : s >= 6 ? { text: 'มีจุดด่างดำ/กระเล็กน้อย', tone: 'mid' } : { text: 'มีฝ้า/จุดด่างดำชัดเจน ควรรักษา', tone: 'bad' }
  },
  moisture: {
    label: 'สมดุลความชุ่มชื้น',
    causes: 'ผิวขาดน้ำ, หน้าหนาว/แอร์, ใช้โทนเนอร์แอลกอฮอล์สูง, ดื่มน้ำน้อย หรือล้างหน้าบ่อยเกินไป',
    homeCare: 'ทามอยส์ไจเซอร์หลังล้างหน้า, ดื่มน้ำวันละ 2 ลิตร, เลือกผลิตภัณฑ์ Hyaluronic Acid/Ceramide',
    relatedServiceKeywords: ['มอยส์', 'ไฮยาลู', 'โบ', 'ฟิลเลอร์', 'มาร์ค', 'วิตามิน', 'บำรุง'],
    getStatus: (s) => s >= 8 ? { text: 'ผิวชุ่มชื้น สมดุลดี', tone: 'good' } : s >= 6 ? { text: 'ผิวเริ่มแห้งตึงเล็กน้อย', tone: 'mid' } : { text: 'ผิวแห้งขาดความชุ่มชื้น', tone: 'bad' }
  },
  cellTurnover: {
    label: 'ผลัดเซลล์ผิว/สมุนไพร',
    causes: 'เซลล์ผิวเก่าสะสม, ผิวหน้าตึง/หนา, ความหมองคล้ำ, ไม่ได้ขัดผิว/สครับมาสักพัก หรือผิวขรุขระ',
    homeCare: 'ขัดผิวเบาๆ สัปดาห์ละครั้งด้วยสครับอ่อนโยน, หลีกเลี่ยงถูแรง, ทามอยส์ไจเซอร์หลังผลัดเซลล์เสมอ',
    relatedServiceKeywords: ['สมุนไพร', 'ผลัดเซลล์', 'สครับ', 'ลอก', 'AHA', 'ขัดผิว', 'พอกหน้า'],
    getStatus: (s) => s >= 8 ? { text: 'เซลล์เก่าสะสมมาก พร้อมผลัดเซลล์', tone: 'good' } : s >= 6 ? { text: 'มีเซลล์เก่าพอประมาณ เริ่มผลัดเซลล์ได้', tone: 'mid' } : { text: 'เซลล์ยังใหม่ ยังไม่เร่งผลัดเซลล์', tone: 'bad' }
  },
  darkCircles: {
    label: 'รอยหมองคล้ำรอบดวงตา',
    causes: 'นอนดึก, เครียด, ภูมิแพ้/อาการคัดจมูก, หลอดเลือดใต้ตา, กรรมพันธุ์ หรือเมลานินสะสม',
    homeCare: 'นอนก่อน 4 ทุ่ม, ประคบเย็นรอบดวงตา, ทาครีมบำรุงรอบดวงตา, หลีกเลี่ยงถูตา',
    relatedServiceKeywords: ['เมโสตา', 'ฟิลเลอร์', 'โบ', 'ตา', 'รอบดวงตา', 'มาร์ค'],
    getStatus: (s) => s >= 8 ? { text: 'รอบดวงตาสว่างใส', tone: 'good' } : s >= 6 ? { text: 'มีรอยคล้ำเล็กน้อย', tone: 'mid' } : { text: 'รอยคล้ำชัดเจน ดูเหนื่อยล้า', tone: 'bad' }
  },
  acneScars: {
    label: 'หลุมสิว/ความขรุขระ',
    causes: 'การอักเสบรุนแรงจากสิวอุดตัน/สิวหัวหนอง, การบีบสิวผิดวิธี, คอลลาเจนถูกทำลาย หรือสิวที่หายช้า',
    homeCare: 'ห้ามบีบสิวเด็ดขาด, ทาวิตามินเอ/เรตินอลเบาๆ, ป้องกันแดด, บำรุงด้วยวิตามินซีช่วยกระตุ้นคอลลาเจน',
    relatedServiceKeywords: ['หลุมสิว', 'เมโส', 'ฟิลเลอร์', 'หน้าใส', 'สกินบูสต์', 'RF', 'ไมโครนีดลิง', 'เลเซอร์', 'มาร์ค', 'วิตามิน'],
    getStatus: (s) => s >= 8 ? { text: 'ผิวเรียบเนียน แทบไม่มีหลุมสิว', tone: 'good' } : s >= 6 ? { text: 'มีหลุมสิวตื้น/รูขุมขนกว้างเล็กน้อย', tone: 'mid' } : { text: 'มีหลุมสิวชัดเจน ผิวขรุขระ', tone: 'bad' }
  },
};

// 🌟 label สั้นสำหรับวงคะแนนลอยบนรูปถ่าย (สไตล์ Skincare Pro)
const SCORE_BUBBLE_LABELS = {
  acne: 'สิว', wrinkles: 'ริ้วรอย', brightness: 'กระจ่างใส', pores: 'รูขุมขน',
  darkSpots: 'ฝ้า/จุดดำ', moisture: 'ชุ่มชื้น', cellTurnover: 'ผลัดเซลล์',
  darkCircles: 'รอยคล้ำตา', acneScars: 'หลุมสิว'
};

// 🌿 เกจเข็มครึ่งวงกลม (speedometer) แสดงระดับความพร้อมผลัดเซลล์ผิว
function CellTurnoverGauge({ score }) {
    const W = 220, H = 122, cx = W / 2, cy = 104, R = 82, strokeW = 13;
    const frac = (typeof score === 'number') ? Math.min(Math.max(score, 0), 10) / 10 : 0;
    const aFor = (s) => Math.PI * (1 - Math.min(Math.max(s, 0), 10) / 10); // π = ซ้าย(0) → 0 = ขวา(10)
    const polar = (a, r) => [cx + Math.cos(a) * r, cy - Math.sin(a) * r];
    const arc = (a1, a2) => {
        const [x1, y1] = polar(a1, R);
        const [x2, y2] = polar(a2, R);
        return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
    };
    const angle = aFor(score);
    const [nx, ny] = polar(angle, R - 22);
    const [tipX, tipY] = polar(angle, R - 3);
    // โซนระดับ: 0-6 ยังไม่พร้อม / 6-8 พร้อมปานกลาง / 8-10 พร้อมมาก
    const zones = [
        { from: 0, to: 6, label: 'ยังไม่พร้อม' },
        { from: 6, to: 8, label: 'พร้อมปานกลาง' },
        { from: 8, to: 10, label: 'พร้อมมาก' },
    ];
    const zoneColors = ['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.88)'];
    const activeZone = (typeof score === 'number') ? (score >= 8 ? 2 : score >= 6 ? 1 : 0) : -1;
    return (
        <div className="flex flex-col items-center">
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full">
                {/* แถบโซน 3 ช่วง */}
                {zones.map((z, i) => (
                    <path key={i} d={arc(aFor(z.from), aFor(z.to))} stroke={zoneColors[i]} strokeWidth={strokeW} fill="none" strokeLinecap="butt" />
                ))}
                {/* ขีดแบ่งโซน 6 และ 8 */}
                {[6, 8].map(v => {
                    const [x1, y1] = polar(aFor(v), R - strokeW / 2 - 3);
                    const [x2, y2] = polar(aFor(v), R + strokeW / 2 + 3);
                    return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.22)" strokeWidth="2" />;
                })}
                {/* เข็มชี้คะแนนปัจจุบัน */}
                <line x1={nx} y1={ny} x2={tipX} y2={tipY} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' }} />
                <circle cx={nx} cy={ny} r="6" fill="#ffffff" />
                <circle cx={nx} cy={ny} r="2.2" fill="rgba(0,0,0,0.35)" />
                {/* ตัวเลขคะแนนกลางเกจ */}
                <text x={cx} y={cy - 16} textAnchor="middle" className="fill-white" style={{ fontSize: '30px', fontWeight: 900 }}>{typeof score === 'number' ? score : '-'}</text>
                <text x={cx} y={cy - 1} textAnchor="middle" className="fill-white/85" style={{ fontSize: '10px', fontWeight: 800 }}>จาก 10 คะแนน</text>
                {/* label ปลายสองข้าง */}
                <text x={cx - R - 2} y={cy + 10} textAnchor="start" className="fill-white/70" style={{ fontSize: '8px', fontWeight: 800 }}>น้อย</text>
                <text x={cx + R + 2} y={cy + 10} textAnchor="end" className="fill-white/70" style={{ fontSize: '8px', fontWeight: 800 }}>พร้อมสุด</text>
            </svg>
            {/* ชิประดับ 3 ช่วง — ไฮไลท์ช่วงปัจจุบัน */}
            <div className="flex gap-1 mt-0.5 flex-wrap justify-center">
                {zones.map((z, i) => (
                    <span key={i} className={`text-[8.5px] font-black px-2 py-0.5 rounded-full transition-all ${activeZone === i ? 'bg-white text-gray-800 shadow' : 'bg-white/20 text-white/75'}`}>{z.label}</span>
                ))}
            </div>
        </div>
    );
}

// 🗓️ โปรแกรมดูแลผิวเฉพาะบุคคล — แยกปัญหา (สิว vs ฝ้า/กระ) แล้วจัดลำดับการรักษาตามหลักคลินิก
// หลักการ: สงบสิวก่อน → ผลัดเซลล์/หน้าใส → ลดฝ้ากระ → เก็บหลุมสิว → ยกกระชับ → รอบดวงตา (คู่ขนาน)
function CarePlanCard({ scores = {}, recommendedCourses = [], shopItems = [], turnoverStatus, onAddToCart, onAsk }) {
    const PROBLEM_LABELS = {
        acne: 'สิว/รอยแดง', darkSpots: 'ฝ้า/กระ/จุดด่างดำ', acneScars: 'หลุมสิว',
        wrinkles: 'ริ้วรอย', darkCircles: 'รอยคล้ำตา', moisture: 'ความชุ่มชื้น',
        brightness: 'ความกระจ่างใส', pores: 'รูขุมขน',
    };
    const PHASES = [
        { key: 'acne', icon: '🎯', title: 'สงบสิว & ลดการอักเสบ', scoreKey: 'acne', keywords: ['สิว', 'คีบสิว', 'กดสิว', 'เคลียร์สิว', 'ดูดสิว', 'Acne'], note: 'ต้องทำก่อนอย่างอื่น — การอักเสบต้องสงบก่อนเริ่มโปรแกรมอื่น' },
        { key: 'renewal', icon: '🌿', title: 'ผลัดเซลล์ + หน้าใสกระจ่าง', scoreKey: 'brightness', keywords: ['สมุนไพร', 'ผลัดเซลล์', 'สครับ', 'หน้าใส', 'AHA', 'ขัดผิว', 'ลอก', 'วิตามิน'], note: 'ช่วยให้ผิวดูดซับสารบำรุงได้ดีขึ้นในเฟสถัดไป' },
        { key: 'darkSpots', icon: '✨', title: 'ลดฝ้า กระ จุดด่างดำ', scoreKey: 'darkSpots', keywords: ['พิกเม้น', 'ฝ้า', 'กระ', 'เลเซอร์', 'ไวท์', 'วิตามิน', 'IPL', 'เมโส', 'นาโน'], note: 'ควรเริ่มเมื่อสิวสงบแล้ว และเว้นห่างจากการผลัดเซลล์อย่างน้อย 7 วัน' },
        { key: 'acneScars', icon: '💠', title: 'ฟื้นฟูหลุมสิว & รูขุมขน', scoreKey: 'acneScars', keywords: ['หลุมสิว', 'สกินบูสต์', 'ไมโครนีดลิง', 'RF', 'เมโส', 'ฟิลเลอร์'], note: 'ต้องรอให้สิวสงบสนิทก่อนเริ่มเฟสนี้' },
        { key: 'wrinkles', icon: '🔮', title: 'กระตุ้นคอลลาเจน ยกกระชับ', scoreKey: 'wrinkles', keywords: ['โบ', 'ฟิลเลอร์', 'มาร์ค', 'คอลลาเจน', 'ยกกระชับ', 'RF', 'ไฮยาลู'], note: 'เสริมได้เมื่อปัญหาหลักดีขึ้นแล้ว' },
        { key: 'darkCircles', icon: '👁️', title: 'บำรุงรอบดวงตา', scoreKey: 'darkCircles', keywords: ['เมโสตา', 'ฟิลเลอร์', 'รอบดวงตา', 'ตา'], note: 'ทำคู่ขนานไปกับเฟสอื่นได้' },
    ];
    // เฟสไหนจำเป็นบ้าง (คะแนนต่ำกว่า 7 = มีปัญหา)
    const need = {
        acne: typeof scores.acne === 'number' && scores.acne < 7,
        renewal: (typeof scores.brightness === 'number' && scores.brightness < 7) || (typeof scores.pores === 'number' && scores.pores < 7),
        darkSpots: typeof scores.darkSpots === 'number' && scores.darkSpots < 7,
        acneScars: typeof scores.acneScars === 'number' && scores.acneScars < 7,
        wrinkles: typeof scores.wrinkles === 'number' && scores.wrinkles < 7,
        darkCircles: typeof scores.darkCircles === 'number' && scores.darkCircles < 7,
    };
    const activePhases = PHASES.filter(p => need[p.key]);
    const allGood = activePhases.length === 0;

    // จับคู่บริการ/สินค้าของร้านเข้ากับแต่ละเฟส (AI แนะนำก่อน แล้วเสริมจากแคตตาล็อก)
    const matchServices = (keywords) => {
        const seen = new Set();
        const out = [];
        for (const c of recommendedCourses) {
            const name = String(c.name || '');
            if (name && !seen.has(name) && keywords.some(kw => name.includes(kw))) {
                seen.add(name);
                out.push({ name, reason: c.reason });
            }
        }
        for (const s of shopItems) {
            if (out.length >= 3) break;
            const name = String(s?.name || '');
            if (name && !seen.has(name) && keywords.some(kw => name.includes(kw))) {
                seen.add(name);
                // 🌟 คอร์สโบรชัวร์ไม่มี price หลัก — ราคาอยู่ใน packages ให้ใช้แพ็กเกจถูกสุด (1 ครั้ง)
                const pkgs = Array.isArray(s?.packages) ? s.packages.filter(p => p && typeof p.price === 'number') : [];
                const bestPkg = pkgs.length ? pkgs.reduce((a, b) => (a.price <= b.price ? a : b)) : null;
                const finalPrice = (typeof s.price === 'number' && s.price > 0) ? s.price : (bestPkg ? bestPkg.price : null);
                out.push({
                    name,
                    price: finalPrice,
                    minPrice: (typeof s.price !== 'number' || s.price <= 0) && bestPkg ? bestPkg.price : null,
                    id: (typeof s.price === 'number' && s.price > 0) ? s.id : (bestPkg ? bestPkg.id : s.id),
                    packName: bestPkg && !(typeof s.price === 'number' && s.price > 0) ? bestPkg.name : null,
                    type: s.type || 'course',
                    isShop: true,
                });
            }
        }
        return out.slice(0, 3);
    };

    // ปัญหาหลักเรียงจากรุนแรงสุด (คะแนนต่ำสุด)
    const problems = Object.entries(PROBLEM_LABELS)
        .filter(([k]) => k !== 'moisture')
        .map(([k, label]) => ({ k, label, score: scores[k] }))
        .filter(p => typeof p.score === 'number' && p.score < 7)
        .sort((a, b) => a.score - b.score);

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-2xl p-3.5 shadow-sm">
            <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1 flex items-center">
                <Calendar size={14} className="mr-1.5 text-indigo-500" /> โปรแกรมดูแลผิวเฉพาะบุคคล 🗓️
            </h4>
            <p className="text-[9px] text-gray-400 font-medium mb-2.5 leading-relaxed">
                💡 ปัญหา "สิว" กับ "ฝ้า/กระ" ต้องการการดูแลต่างกัน — ระบบจัดลำดับให้ทีละปัญหาตามหลักคลินิก ไม่ทำทับกันจนผิวระคายเคือง
            </p>

            {/* สรุปปัญหาหลักที่พบ เรียงตามความรุนแรง */}
            {problems.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2.5">
                    <span className="text-[9px] font-black text-gray-500 self-center mr-0.5">ปัญหาหลัก:</span>
                    {problems.map(p => (
                        <span key={p.k} className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${p.score < 5 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {p.label} {p.score}/10
                        </span>
                    ))}
                </div>
            )}

            {/* เตือนถ้าผิวกำลังผลัด/ฟื้น — ยังไม่เริ่มโปรแกรม */}
            {(turnoverStatus === 'peeling_now' || turnoverStatus === 'recovering') && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl px-2.5 py-2 mb-2.5 flex items-start gap-1.5">
                    <Clock size={12} className="mt-0.5 shrink-0 text-sky-500" />
                    <p className="text-[9.5px] text-sky-800 leading-snug font-bold">ผิวกำลังผลัด/ฟื้นตัว — เริ่มโปรแกรมนี้ได้หลังผิวหลุดหมดและฟื้นแข็งแรง (~5-7 วัน) เริ่มจากเฟสที่ 1 ตามลำดับเสมอ</p>
                </div>
            )}

            {allGood ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-[11px] font-black text-emerald-700">🎉 ผิวคุณแข็งแรงดีทุกด้าน!</p>
                    <p className="text-[10px] text-emerald-600 mt-1 leading-relaxed">โปรแกรมของคุณคือการ "ดูแลรักษา": ทำความสะอาดอ่อนโยน + มอยส์เจอไรเซอร์ + กันแดด SPF50+ ทุกวัน และผลัดเซลล์สมุนไพรเป็นระยะทุก 3-4 สัปดาห์</p>
                </div>
            ) : (
                <div className="space-y-0">
                    {activePhases.map((p, i) => {
                        const score = scores[p.scoreKey];
                        const isLast = i === activePhases.length - 1;
                        const services = matchServices(p.keywords);
                        return (
                            <div key={p.key} className="flex gap-2.5">
                                {/* เส้นไทม์ไลน์ + เลขเฟส */}
                                <div className="flex flex-col items-center">
                                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-md shadow-indigo-300">{i + 1}</span>
                                    {!isLast && <span className="w-0.5 flex-1 bg-indigo-200 min-h-[12px]"></span>}
                                </div>
                                {/* เนื้อหาเฟส */}
                                <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-3'}`}>
                                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                        <span className="text-[11px] font-black text-gray-800">{p.icon} {p.title}</span>
                                        {typeof score === 'number' && (
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${score < 5 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'}`}>{score}/10</span>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-gray-500 leading-snug mt-0.5">ℹ️ {p.note}</p>
                                    {services.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {services.map((s, j) => (
                                                <span key={j} className="inline-flex items-center gap-1 bg-white border border-indigo-200 rounded-full pl-2 pr-1 py-0.5 text-[9px] font-bold text-indigo-700 shadow-sm max-w-full">
                                                    <span className="truncate max-w-[120px]">{s.name}</span>
                                                    {s.price != null
                                                        ? <span className="text-indigo-400 shrink-0">{s.minPrice != null ? `เริ่ม ฿${s.minPrice.toLocaleString()}` : `฿${s.price.toLocaleString()}`}</span>
                                                        : <span className="text-indigo-300 shrink-0">สอบถาม</span>}
                                                    {s.isShop && s.id && onAddToCart && s.price != null
                                                        ? <button
                                                            onClick={() => onAddToCart({
                                                                id: s.id,
                                                                name: s.packName ? `${s.name} (${s.packName})` : s.name,
                                                                price: s.price,
                                                                type: s.type
                                                            })}
                                                            className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform">+</button>
                                                        : <button onClick={onAsk} className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 active:scale-90 transition-transform text-[8px] font-black">?</button>}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* พื้นฐานตลอดโปรแกรม */}
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-2 flex items-start gap-1.5">
                        <span className="text-sm leading-none mt-0.5">🧴</span>
                        <p className="text-[9.5px] text-amber-800 leading-snug">
                            <b>พื้นฐานตลอดโปรแกรม:</b> มอยส์เจอไรเซอร์ + ครีมกันแดด SPF50+ ทุกวัน
                            {typeof scores.moisture === 'number' && scores.moisture < 7 && <> (ผิวคุณขาดความชุ่มชื้น — ดื่มน้ำให้เพียงพอและทามอยส์เจอไรเซอร์เป็นประจำ)</>}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

async function fileToGenerativePart(fileBlobOrDataUrl) {
  if (typeof fileBlobOrDataUrl === 'string' && fileBlobOrDataUrl.startsWith('data:')) {
    const parts = fileBlobOrDataUrl.split(',');
    const mimeType = parts[0].split(':')[1].split(';')[0];
    return {
        inlineData: {
            data: parts[1],
            mimeType: mimeType
        }
    };
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
        inlineData: {
            data: reader.result.split(',')[1],
            mimeType: fileBlobOrDataUrl.type
        }
    });
    reader.readAsDataURL(fileBlobOrDataUrl);
  });
}

// 🌟 CircularGauge — วงแหวนคะแนนแบบวงกลมสวยๆ (SVG ล้วน) 🌟
const gaugeColor = (score) => {
    if (typeof score !== 'number') return '#94a3b8';
    if (score >= 9) return '#10b981';   // emerald
    if (score >= 8) return '#14b8a6';   // teal
    if (score >= 7) return '#0d9488';   // teal-600
    if (score >= 5) return '#f59e0b';   // amber
    return '#f43f5e';                    // rose
};

function CircularGauge({ score, size = 44, stroke = 4, label, sublabel, big = false, onClick, active = false, icon }) {
    const r = (size - stroke * 2) / 2;
    const c = 2 * Math.PI * r;
    const pct = (typeof score === 'number') ? Math.min(score / 10, 1) : 0;
    const color = gaugeColor(score);
    const Wrapper = onClick ? 'button' : 'div';
    return (
        <Wrapper
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center gap-1 ${onClick ? 'active:scale-95 transition-transform cursor-pointer' : ''}`}
        >
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90 drop-shadow-sm">
                    {/* track */}
                    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
                    {/* value arc with gradient feel */}
                    <circle
                        cx={size/2} cy={size/2} r={r} fill="none"
                        stroke={color} strokeWidth={stroke}
                        strokeDasharray={c}
                        strokeDashoffset={c * (1 - pct)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                    {/* inner subtle glow when active */}
                    {active && <circle cx={size/2} cy={size/2} r={r - stroke} fill={color} opacity="0.08" />}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {icon ? icon : (
                        <>
                            <span className={`${big ? 'text-2xl' : 'text-[13px]'} font-black leading-none`} style={{ color }}>{score ?? '-'}</span>
                            {!big && <span className="text-[7px] text-gray-400 font-bold leading-none mt-0.5">/10</span>}
                        </>
                    )}
                </div>
            </div>
            {label && <span className={`${big ? 'text-xs' : 'text-[10px]'} font-bold text-gray-700 text-center leading-tight max-w-[72px]`}>{label}</span>}
            {sublabel && <span className="text-[9px] text-gray-400 font-medium">{sublabel}</span>}
        </Wrapper>
    );
}

export default function SkinCheckModal({ isOpen, onClose, course, app, shopItems = [], onBookService, onAddToCart, onGoToShop, onScanComplete, onOpenHistory, onOpenSurvey, historyEnabled = true, moleEnabled = true }) {
    const [scanMode, setScanMode] = useState('skin'); // 'skin' | 'mole'
    
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [lightLevel, setLightLevel] = useState('good'); // 'too-dark', 'good', 'too-bright'
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const lightIntervalRef = useRef(null);

    const [step, setStep] = useState(1);
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [diagnosticMode, setDiagnosticMode] = useState(false);
    const [diagnosticLog, setDiagnosticLog] = useState([]);
    const [copiedToast, setCopiedToast] = useState(false);
    
    // UI Markers state
    const [showMarkers, setShowMarkers] = useState(true);
    const [showScoreGauges, setShowScoreGauges] = useState(true); // 🌟 วงคะแนนลอยบนรูป (สไตล์ Skincare Pro)
    const [activeMarkerIndex, setActiveMarkerIndex] = useState(null);
    const [isFullScreenPhoto, setIsFullScreenPhoto] = useState(false);
    const [showFullDetails, setShowFullDetails] = useState(true);
    const [expandedMetric, setExpandedMetric] = useState(null); // key ของด้านผิวที่กำลังขยายดูรายละเอียด

    // --- Quota Tracking ---
    const MAX_FREE_USES = 20;
    const getDailyUsage = () => {
        try {
            const today = new Date().toLocaleDateString('en-CA');
            const key = `ai_skin_usage_${today}`;
            return parseInt(localStorage.getItem(key) || '0', 10);
        } catch (e) { return 0; }
    };
    const [dailyUsage, setDailyUsage] = useState(getDailyUsage);

    const incrementDailyUsage = () => {
        try {
            const today = new Date().toLocaleDateString('en-CA');
            const key = `ai_skin_usage_${today}`;
            const current = getDailyUsage();
            localStorage.setItem(key, (current + 1).toString());
            setDailyUsage(current + 1);
        } catch (e) {}
    };

    
    // Cleanup camera when unmounting or modal closes
    useEffect(() => {
        if (!isOpen) {
            closeCamera();
        }
        return () => {
            closeCamera();
        };
    }, [isOpen]);

    // Assign stream to video element when camera opens
    useEffect(() => {
        if (isCameraOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(e => console.error('Video play error:', e));
        }
    }, [isCameraOpen]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } }
            });
            streamRef.current = stream;
            setIsCameraOpen(true);
            
            // Start Light analysis loop
            if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
            lightIntervalRef.current = setInterval(analyzeLight, 500);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้องในเบราว์เซอร์");
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (lightIntervalRef.current) {
            clearInterval(lightIntervalRef.current);
            lightIntervalRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const analyzeLight = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        
        if (video.videoWidth === 0) return; // Not ready yet
        
        // Draw video frame to a small 64x64 canvas for fast processing
        canvas.width = 64;
        canvas.height = 64;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightnessSum = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            // Calculate brightness using standard formula (Rec. 709)
            const brightness = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
            brightnessSum += brightness;
        }
        
        const avgBrightness = brightnessSum / (canvas.width * canvas.height);
        
        if (avgBrightness < 40) {
            setLightLevel('too-dark');
        } else if (avgBrightness > 220) {
            setLightLevel('too-bright');
        } else {
            setLightLevel('good');
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        
        // Create full resolution canvas
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
        
        const ctx = captureCanvas.getContext('2d');
        // Mirror the image horizontally if using front camera
        ctx.translate(captureCanvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        
        // Get Base64 image
        const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.9);
        
        // Stop camera
        closeCamera();
        
        // Proceed to next step
        setImage(dataUrl);
        setImageFile(dataUrl);
        setStep(2);
    };


    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setScanMode('skin');
            setStep(1);
            setImage(null);
            setImageFile(null);
            setIsScanning(false);
            setAiResult(null);
            setErrorMsg(null);
            setDiagnosticMode(false);
            setDiagnosticLog([]);
            setCopiedToast(false);
            setShowMarkers(true);
            setShowScoreGauges(true);
            setShowFullDetails(false); // 🌟 ค่าเริ่มต้น: เปิดมาเห็นรูปก่อนเลย (รายละเอียดย่อไว้ กดค่อยขยาย)
            setActiveMarkerIndex(null);
            setIsFullScreenPhoto(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(URL.createObjectURL(file));
            setImageFile(file);
            setStep(2);
        }
    };

    const logDiag = (msg, status = 'info') => {
        setDiagnosticLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, status }]);
    };

    const runDiagnostics = async () => {
        setDiagnosticMode(true);
        setDiagnosticLog([]);
        logDiag('เริ่มตรวจสอบความพร้อมของระบบ AI...', 'info');
        
        try {
            if (!app) {
                logDiag('ไม่พบการเชื่อมต่อ Firebase App', 'error');
                return false;
            }
            logDiag('เชื่อมต่อ Firebase App สำเร็จ (OK)', 'success');

            if (typeof getAI !== 'function' || typeof getGenerativeModel !== 'function') {
                logDiag('โหลดโมดูล Firebase AI SDK ไม่สมบูรณ์', 'error');
                return false;
            }
            logDiag('โหลดโมดูล Firebase AI SDK สำเร็จ (OK)', 'success');

            let ai;
            try {
                ai = getAI(app, { backend: new GoogleAIBackend() });
                logDiag('กำหนดค่า AI Backend สำเร็จ (OK)', 'success');
            } catch (e) {
                logDiag('การกำหนดค่า AI Backend ล้มเหลว: ' + e.message, 'error');
                return false;
            }

            try {
                const model = getGenerativeModel(ai, { model: 'gemini-flash-latest' });
                logDiag('เข้าถึงโมเดล Gemini สำเร็จ (OK)', 'success');
            } catch (e) {
                logDiag('เข้าถึงโมเดลล้มเหลว: ' + e.message, 'error');
                return false;
            }

            logDiag('✅ ระบบ AI พร้อมทำงาน 100%', 'success');
            setTimeout(() => setDiagnosticMode(false), 2000);
            return true;
        } catch (err) {
            logDiag('เกิดข้อผิดพลาดไม่คาดคิด: ' + err.message, 'error');
            return false;
        }
    };

    const startScan = async () => {
        incrementDailyUsage();
        setIsScanning(true);
        setErrorMsg(null);
        
        const isReady = await runDiagnostics();
        if (!isReady) {
            setIsScanning(false);
            setErrorMsg('ระบบ AI ไม่พร้อมใช้งาน กรุณาดูรายละเอียดในหน้าต่างตรวจสอบ');
            return;
        }

        try {
            const ai = getAI(app, { backend: new GoogleAIBackend() });
            const model = getGenerativeModel(ai, {
                model: 'gemini-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                }
            });


            // Compact shop items to save tokens
            const minifiedShop = shopItems
                .filter(item => item && item.id && item.name && (item.type === 'course' || item.type === 'simple' || item.type === 'product'))
                .map(item => ({ id: item.id, name: item.name, type: item.type === 'course' ? 'บริการคลินิก' : 'สินค้า' }));
            const shopCatalogJson = JSON.stringify(minifiedShop);

            let prompt = '';
            if (scanMode === 'skin') {
                prompt = `คุณคือผู้เชี่ยวชาญด้านผิวพรรณประจำ Iris Clinic (ไอริส คลินิก) ที่มีความรอบรู้ สุภาพ อบอุ่น เป็นกันเอง ใส่ใจลูกค้า
                จงวิเคราะห์ภาพใบหน้านี้อย่างละเอียดในด้านหลักต่อไปนี้ (คะแนน 1-10 โดย 10 คือสมบูรณ์แบบ):
                หากพบว่าภาพเบลอ มืดไป สว่างไป หรือมีการใช้ฟิลเตอร์/แต่งหน้า ให้แจ้งเตือนในฟิลด์ warning และลดคะแนนลง
                1. สิวและรอยแดง (acne)
                2. ริ้วรอยและความกระชับ (wrinkles)
                3. ความสว่างกระจ่างใส (brightness)
                4. รูขุมขนและความเรียบเนียน (pores)
                5. ฝ้า กระ จุดด่างดำ (darkSpots)
                6. ความชุ่มชื้นและสมดุลความมัน (moisture)
                7. ความหมองคล้ำรอบดวงตา (darkCircles)
                8. หลุมสิวและความขรุขระ (acneScars)
                9. คะแนนสุขภาพผิวโดยรวม (overall)
                10. ระดับความพร้อมผลัดเซลล์ผิว (cellTurnover) — อิงจากการสะสมของเซลล์ผิวเก่า ความหมองคล้ำ ผิวหน้าตึง/หนา และความขรุขระ หากคะแนนสูงแปลว่ามีเซลล์เก่าสะสมมาก ผิวพร้อมถูกผลัด/ลอกออก

                *สำคัญมาก: จำแนก "สถานะการผลัดเซลล์" ของผิวในภาพนี้ตอนนี้ (status ใน cellTurnoverInfo) โดยดูจากลักษณะที่เห็นจริง:
                - "ready" = ผิวสะสมเซลล์เก่า หนา/หมองคล้ำ/ขุนขระ/รูขุมขนอุดตัน แต่ไม่มีขุยลอก → แนะนำให้เริ่มผลัดเซลล์
                - "peeling_now" = ผิวกำลังผลัดเซลล์อยู่ขณะนี้ เห็นขุยแห้ง ผิวลอกเป็นแผ่นๆ กำลังหลุดลอกชัดเจน → ต้องงดผลัดซ้ำ เน้นบำรุงความชุ่มชื้น
                - "recovering" = เพิ่งผลัดเซลล์/ทำทรีตเมนต์เสร็จใหม่ๆ ผิวใหม่บาง อ่อนไหว อาจมีรอยแดงอ่อนๆ ผิวดูเรียบเนียนผิดปกติ → ต้องรอฟื้น 1-2 สัปดาห์ก่อนผลัดครั้งถัดไป
                - "normal" = ผิวปกติ ผลัดเซลล์ตามรอบธรรมชาติ ยังไม่จำเป็นต้องเร่ง
                พร้อมระบุหลักฐานที่สังเกตเห็นจากภาพสั้นๆ ใน statusEvidence เช่น "เห็นขุยแห้งบริเวณแก้ม" หรือ "ผิวหนาหมองมีสิ่งอุดตันตรงทีโซน"
                หาก status เป็น peeling_now หรือ recovering ต้องระวังเป็นพิเศษ: ใน herbalRecommendation ให้แนะนำ "ผงพอกสมุนไพรไอริส" (พอกบำรุงปลอบผิว ไม่ใช่ผงเร่ง) ร่วมกับการบำรุงความชุ่มชื้นเท่านั้น และห้ามแนะนำครีมกลุ่มผลัดเซลล์ (AHA/BHA/Retinol) ผงเร่ง/โคลนเร่ง หรือการผลัดเซลล์ซ้ำเด็ดขาด
                ขั้นตอนที่ควรแนะนำเป็นลำดับ: (1) ใช้คลีนซิ่งน้ำนมนวดขัดเบาๆ ก่อนล้างหน้าเพื่อขจัดเซลล์ที่หลุดอยู่ให้ลอยออกอย่างอ่อนโยน (2) ล้างหน้าแล้วพอกบำรุงด้วยผงพอกสมุนไพรไอริส (3) ปิดท้ายด้วยการทาครีมกันแดดทุกครั้ง เพราะผิวใหม่ไวแสงแดดมาก และขั้นท้ายสุด (4) สามารถเอาผงพอกสมุนไพรไอริสผสมน้ำแล้วแต้มเป็นจุดๆ ที่รอย สิว หรือจุดที่มีปัญหา เพื่อบำรุงเข้มข้นเฉพาะจุดได้

                *ข้อสำคัญ: จงวิเคราะห์แยกระหว่าง "ผิวแห้ง (Dry Skin - ขาดน้ำมัน)" และ "ผิวขาดน้ำ (Dehydrated Skin - ขาดน้ำ)" อย่างชัดเจน โดยพิจารณาจากรูขุมขน ความมันวาว ความแห้งกร้าน ขุย และริ้วรอย ให้ระบุใน hydrationAnalysis*

                พร้อมประเมินอายุผิวหน้าจากสภาพผิวที่มองเห็น (estimatedSkinAge ตัวเลขจำนวนเต็ม เช่น 25, 32)
                และระบุข้อความสถานะอายุผิวแบบชมเชยหรือนุ่มนวล (skinAgeStatus)

                คุณมีรายการคอร์สและสินค้าดังนี้:
                ${shopCatalogJson}
                จงเลือกแนะนำคอร์สหรือสินค้าที่เหมาะสมที่สุดกับสภาพผิวของลูกค้าจากรายการด้านบน (แนะนำ 1-3 รายการ) โดยคืนค่าเป็น id ของสินค้าหรือคอร์สนั้นๆ พร้อมระบุเหตุผลสั้นๆ

                ส่งผลลัพธ์กลับมาเป็น JSON เท่านั้น โครงสร้างดังนี้:
                {
                    "mode": "skin",
                    "greeting": "สวัสดีค่ะคุณลูกค้าสุดน่ารัก อบอุ่นสั้นๆ จาก Iris Clinic",
                    "estimatedSkinAge": 28,
                    "skinAgeStatus": "ผิวดูกระชับสดใส แลดูอ่อนเยาว์กว่าอายุจริงค่ะ ✨",
                    "scores": {
                        "acne": 8, "wrinkles": 7, "brightness": 6, "pores": 7, "darkSpots": 6, "moisture": 8, "darkCircles": 5, "acneScars": 7, "cellTurnover": 6, "overall": 7
                    },
                    "hydrationAnalysis": {
                        "isDry": true,
                        "isDehydrated": true,
                        "description": "ผิวขาดทั้งน้ำและน้ำมัน มีลักษณะแห้งกร้านและเห็นริ้วรอยขาดน้ำชัดเจน",
                        "recommendation": "ควรดื่มน้ำให้เพียงพอและทำทรีตเมนต์เติมน้ำให้ผิวชั้นลึก"
                    },
                    "cellTurnoverInfo": {
                        "status": "ready",
                        "statusEvidence": "หลักฐานที่เห็นจากภาพ เช่น เห็นขุยแห้งหลุดเป็นแผ่นบริเวณแก้ม หรือ ผิวหนาหมองมีสิ่งอุดตันตรงทีโซน",
                        "level": "พร้อมผลัดเซลล์ ระดับปานกลาง",
                        "description": "สภาพผิวมีเซลล์เก่าสะสมอยู่บ้าง ผิวหมองเล็กน้อย สามารถเริ่มผลัดเซลล์ได้แล้ว",
                        "herbalRecommendation": "แนะนำให้ผลัดเซลล์ผิวด้วยสมุนไพรธรรมชาติของทางร้าน เพื่อขจัดเซลล์เก่าอย่างอ่อนโยน ผิวเรียบเนียน กระจ่างใสขึ้น"
                    },
                    "summary": "ข้อความสรุปสภาพผิวที่พบด้วยภาษาเป็นกันเอง ห่วงใย และอ่านง่าย",
                    "recommendation": "คำแนะนำการดูแลผิวประจำวันสั้นๆ นุ่มนวล",
                    "recommendedCourses": [
                        { "id": "รหัส id ของคอร์ส/สินค้าที่เลือกจากรายการ", "reason": "เหตุผลสั้นๆ" }
                    ],
                    "confidenceScore": 85,
                    "warning": "ถ้าภาพเบลอ มืด แต่งหน้า หรือใช้ฟิลเตอร์ ให้ใส่คำเตือนสั้นๆ ที่นี่ ถ้าภาพชัดเจนดีให้ใส่ค่าว่าง ("")"
                }`;
            } else {
                // Mole & Skin Tag Counter Prompt
                prompt = `คุณคือแพทย์และผู้เชี่ยวชาญการจี้ไฝ ติ่งเนื้อ กระเนื้อ สิวหิน ประจำ Iris Clinic (ไอริส คลินิก)
                หากพบว่าภาพเบลอ มืดไป หรือมองเห็นไม่ชัดเจน ให้แจ้งเตือนในฟิลด์ warning
                จงสแกนภาพใบหน้าหรือลำคอนี้อย่างละเอียด นับจำนวนจุดที่พบ และระบุพิกัดตำแหน่ง 2D Bounding Box ของแต่ละจุดที่พบอย่างแม่นยำที่สุด
                ใช้สเกล 0 ถึง 1000 ในรูปแบบ [ymin, xmin, ymax, xmax]

                พร้อมประเมินอายุผิวหน้าเบื้องต้น (estimatedSkinAge) และระบุข้อความสถานะอายุผิว (skinAgeStatus)

                จำแนกประเภทดังนี้:
                - type: "mole" (ไฝ/ขี้แมลงวัน)
                - type: "freckle" (กระเนื้อ/กระแดด)
                - type: "skinTag" (ติ่งเนื้อ/สิวหิน)

                คำนวณราคาประเมินค่าบริการจี้เบื้องต้น (หน่วยบาท):
                - จุดละ 100 - 150 บาท (หาก 1-3 จุด)
                - 4-10 จุด เหมาแพ็กเกจ 500 - 900 บาท
                - มากกว่า 10 จุด เหมาทั่วหน้า/ลำคอ 1,200 - 1,800 บาท

                ส่งผลลัพธ์กลับมาเป็น JSON เท่านั้น โครงสร้างดังนี้:
                {
                    "mode": "mole",
                    "greeting": "สวัสดีค่ะคุณลูกค้า สรุปผลการตรวจนับจุดไฝและติ่งเนื้อสำหรับเตรียมจี้ออกนะคะ",
                    "estimatedSkinAge": 30,
                    "skinAgeStatus": "สภาพผิวโดยรวมแข็งแรงดี พร้อมบริการจี้ลบจุดอย่างปลอดภัยค่ะ",
                    "counts": {
                        "moles": 2, "freckles": 4, "skinTags": 1, "total": 7
                    },
                    "markers": [
                        { "box2d": [420, 380, 450, 410], "type": "mole", "label": "ไฝ / ขี้แมลงวัน" },
                        { "box2d": [500, 600, 530, 630], "type": "freckle", "label": "กระเนื้อ" },
                        { "box2d": [780, 480, 810, 510], "type": "skinTag", "label": "ติ่งเนื้อ" }
                    ],
                    "locations": ["โหนกแก้มซ้าย", "ข้างมุมปาก", "ลำคอ"],
                    "estimatedPriceMin": 500,
                    "estimatedPriceMax": 900,
                    "summary": "พบไฝเล็กน้อย และมีกระเนื้อบริเวณโหนกแก้มร่วมกับติ่งเนื้อที่ลำคอ สามารถจี้ออกได้เรียบเนียนในการทำครั้งเดียว",
                    "cauterizeAdvice": "หลังจี้ห้ามโดนน้ำ 3-5 วัน และแต้มผงสมุนไพรลดอักเสบตามที่คลินิกจัดให้ มีประกันดูแลซ้ำ 1 เดือนค่ะ",
                    "confidenceScore": 90,
                    "warning": "ถ้าภาพเบลอ มืด หรือใช้ฟิลเตอร์ จนมองไม่เห็นไฝ ให้ใส่คำเตือนสั้นๆ ที่นี่ ถ้าภาพชัดเจนดีให้ใส่ค่าว่าง ("")"
                }`;
            }

            const imagePart = await fileToGenerativePart(imageFile);
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();
            
            let jsonString = responseText;
            if (jsonString.includes('```json')) {
                jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
            }
            const data = JSON.parse(jsonString);

            // Convert Bounding Box [ymin, xmin, ymax, xmax] (0-1000) to Center Coordinates (x%, y%)
            if (data.markers && Array.isArray(data.markers)) {
                data.markers = data.markers.map(m => {
                    if (m.box2d && Array.isArray(m.box2d) && m.box2d.length === 4) {
                        const [ymin, xmin, ymax, xmax] = m.box2d;
                        const centerX = ((xmin + xmax) / 2) / 10;
                        const centerY = ((ymin + ymax) / 2) / 10;
                        return { ...m, x: Math.max(5, Math.min(95, centerX)), y: Math.max(5, Math.min(95, centerY)) };
                    } else if (typeof m.x === 'number' && typeof m.y === 'number') {
                        return m;
                    }
                    return null;
                }).filter(Boolean);
            }

            setAiResult(data);
            setStep(3);

            // 🌟 บันทึกผลสแกนเข้าประวัติ (Skin Progress / Before-After) — เฉพาะโหมดวิเคราะห์ผิว 🌟
            if (onScanComplete && scanMode === 'skin') {
                try {
                    const createThumb = (src) => new Promise(resolve => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_SIZE = 256;
                            let w = img.width, h = img.height;
                            if (w > h && w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; }
                            else if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; }
                            canvas.width = w; canvas.height = h;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                        };
                        img.onerror = () => resolve(src);
                        img.src = src;
                    });
                    const thumb = await createThumb(image);
                    onScanComplete(data, thumb);
                } catch (e) { console.error('save scan history error:', e); }
            }
        } catch (err) {
            console.error('AI Scan Error:', err);
            let detailedError = err.message;
            if (detailedError.includes('403') || detailedError.includes('PERMISSION_DENIED')) {
                detailedError = 'ยังไม่ได้เปิดใช้งาน Firebase AI Logic (Permission Denied)';
            }
            logDiag('ข้อผิดพลาดระหว่างวิเคราะห์: ' + detailedError, 'error');
            setDiagnosticMode(true);
            setErrorMsg('เกิดข้อผิดพลาดในการวิเคราะห์ AI: ' + detailedError);
        } finally {
            setIsScanning(false);
        }
    };

    const handleShareResults = async () => {
        if (!aiResult) return;
        
        let shareText = '';
        if (aiResult.mode === 'mole') {
            const counts = aiResult.counts || {};
            shareText = `🎯 ผลตรวจนับไฝ & ติ่งเนื้อจาก AI (Iris Clinic) 🎯\n\n` +
                `🎂 อายุผิวประเมิน: ${aiResult.estimatedSkinAge || '-'} ปี\n` +
                `📍 พบบริเวณ: ${(aiResult.locations || []).join(', ') || 'ใบหน้า/ลำคอ'}\n` +
                `🔴 ไฝ/ขี้แมลงวัน: ${counts.moles || 0} จุด | 🟡 กระเนื้อ: ${counts.freckles || 0} จุด | 🟢 ติ่งเนื้อ: ${counts.skinTags || 0} จุด\n\n` +
                `💰 ประเมินราคาจี้เบื้องต้น: ฿${(aiResult.estimatedPriceMin || 0).toLocaleString()} - ฿${(aiResult.estimatedPriceMax || 0).toLocaleString()}\n\n` +
                `นับจุดไฝและประเมินราคาจี้ฟรีที่ Iris Clinic!`;
        } else {
            const scores = aiResult.scores || {};
            shareText = `✨ ผลวิเคราะห์สภาพผิวหน้าจาก AI (Iris Clinic) ✨\n\n` +
                `🎂 อายุผิวประเมิน: ${aiResult.estimatedSkinAge || '-'} ปี (${aiResult.skinAgeStatus || ''})\n` +
                `🌟 คะแนนรวมสุขภาพผิว: ${scores.overall || '-'}/10\n` +
                `🔹 สิว&รอยแดง: ${scores.acne || '-'}/10 | ริ้วรอย: ${scores.wrinkles || '-'}/10\n` +
                `🔹 ความกระจ่างใส: ${scores.brightness || '-'}/10 | รูขุมขน: ${scores.pores || '-'}/10\n` +
                `🔹 รอยคล้ำใต้ตา: ${scores.darkCircles || '-'}/10 | หลุมสิว: ${scores.acneScars || '-'}/10\n` +
                `🌿 พร้อมผลัดเซลล์สมุนไพร: ${aiResult.cellTurnoverInfo?.level || (scores.cellTurnover != null ? `${scores.cellTurnover}/10` : '-')}\n\n` +
                `💡 คำแนะนำ: ${aiResult.recommendation || ''}\n\n` +
                `ให้ AI ช่วยวิเคราะห์ผิวของคุณฟรีที่ Iris Clinic!`;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'ผลวิเคราะห์ AI - Iris Clinic',
                    text: shareText,
                });
                return;
            } catch (e) {
                console.log('Share error/cancelled:', e);
            }
        }

        try {
            await navigator.clipboard.writeText(shareText);
            setCopiedToast(true);
            setTimeout(() => setCopiedToast(false), 3000);
        } catch (e) {
            alert('คัดลอกข้อความผลลัพธ์เรียบร้อย');
        }
    };

    // Helper to get color classes based on spot type
    const getMarkerColor = (type) => {
        switch (type) {
            case 'mole':
                return { ring: 'border-rose-400 bg-rose-500/40 text-white', ping: 'bg-rose-400', badge: 'bg-rose-600' };
            case 'freckle':
                return { ring: 'border-amber-400 bg-amber-500/40 text-white', ping: 'bg-amber-400', badge: 'bg-amber-600' };
            case 'skinTag':
                return { ring: 'border-emerald-400 bg-emerald-500/40 text-white', ping: 'bg-emerald-400', badge: 'bg-emerald-600' };
            case 'acne':
                return { ring: 'border-rose-400 bg-rose-500/40 text-white', ping: 'bg-rose-400', badge: 'bg-rose-600' };
            case 'acneScars':
                return { ring: 'border-orange-400 bg-orange-500/40 text-white', ping: 'bg-orange-400', badge: 'bg-orange-600' };
            case 'darkSpots':
                return { ring: 'border-amber-400 bg-amber-500/40 text-white', ping: 'bg-amber-400', badge: 'bg-amber-600' };
            default:
                return { ring: 'border-cyan-400 bg-cyan-500/40 text-white', ping: 'bg-cyan-400', badge: 'bg-cyan-600' };
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex flex-col sm:items-center sm:justify-center animate-in fade-in duration-200 p-0 sm:p-6">
            <div className="bg-white w-full sm:max-w-md h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 p-4 shrink-0 relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex justify-between items-center text-white">
                        <div>
                            <h2 className="text-lg font-black flex items-center"><Scan size={20} className="mr-2"/> AI Skin & Mole Analysis</h2>
                            <p className="text-[10px] font-bold opacity-90 truncate mt-0.5">ระบบสแกนผิว ประเมินอายุผิว & ปักพิกัดวงล้อมจุด Iris AI</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Mode Selector Tabs */}
                    {step === 1 && (
                        <div className="mt-3 bg-black/20 p-1 rounded-xl flex space-x-1 backdrop-blur-sm relative z-10">
                            <button 
                                onClick={() => setScanMode('skin')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${scanMode === 'skin' ? 'bg-white text-teal-800 shadow-md' : 'text-white/80 hover:text-white'}`}
                            >
                                <Sparkles size={14} className={scanMode === 'skin' ? 'text-teal-600' : ''} />
                                <span>วิเคราะห์สุขภาพผิว & อายุผิว</span>
                            </button>
                            <button 
                                onClick={() => setScanMode('mole')}
                                className={`${moleEnabled ? '' : 'hidden'} flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${scanMode === 'mole' ? 'bg-white text-emerald-800 shadow-md' : 'text-white/80 hover:text-white'}`}
                            >
                                <Tag size={14} className={scanMode === 'mole' ? 'text-emerald-600' : ''} />
                                <span>นับไฝ/ประเมินราคาจี้</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col relative">
                    
                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                            
                            {scanMode === 'skin' ? (
                                <>
                                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-4 relative">
                                        <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-20"></div>
                                        <Sparkles size={36} className="text-teal-500 relative z-10" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800 mb-1.5">เช็คสภาพผิว & อายุผิวด้วย AI</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-6 px-4">
                                        ถ่ายรูปหรืออัปโหลดภาพใบหน้า เพื่อประเมินอายุผิวหน้า สิว ริ้วรอย ความกระจ่างใส รูขุมขน และฝ้ากระ พร้อมปักเรดาร์จุด
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 relative">
                                        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                                        <Tag size={36} className="text-emerald-600 relative z-10" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800 mb-1.5">นับจุด & ประเมินราคาจี้ด้วย AI</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-6 px-4">
                                        ถ่ายรูปใบหน้าหรือลำคอ AI จะปักเรดาร์วงล้อมทุกจุดที่พบ (ไฝ กระ ติ่งเนื้อ) พร้อมประเมินอายุผิวและคำนวณราคาจี้
                                    </p>
                                </>
                            )}
                            
                            
                                    <div className="mt-4 bg-teal-50 border border-teal-100 p-3 rounded-xl text-left shadow-sm">
                                        <h4 className="text-[11px] font-bold text-teal-800 mb-1.5 flex items-center">
                                            <AlertCircle size={12} className="mr-1" /> คำแนะนำเพื่อความแม่นยำสูงสุด
                                        </h4>
                                        <ul className="text-[10px] text-teal-700 space-y-1 list-disc pl-4">
                                            <li>ถ่ายด้วย <b>หน้าสด</b> (ไม่แต่งหน้า) และไม่สวมแว่นตา</li>
                                            <li><b>ปิดฟิลเตอร์แอปพลิเคชัน</b> ทุกชนิด</li>
                                            <li>ถ่ายในที่ <b>แสงสว่างเพียงพอ</b> (แนะนำแสงธรรมชาติ)</li>
                                        </ul>
                                    </div>

                            

                            <div className="w-full mt-5 bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="text-[12px] font-black text-gray-800">โควต้าสแกนฟรีวันนี้</h4>
                                        <p className="text-[10px] text-gray-500">รับสิทธิ์ฟรี {MAX_FREE_USES} ครั้งต่อวัน (รีเซ็ตเที่ยงคืน)</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-teal-600">{MAX_FREE_USES - dailyUsage > 0 ? MAX_FREE_USES - dailyUsage : 0}</span>
                                        <span className="text-[10px] text-gray-500 font-bold ml-1">/ {MAX_FREE_USES} ครั้ง</span>
                                    </div>
                                </div>
                                
                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${dailyUsage >= MAX_FREE_USES ? 'bg-rose-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`}
                                        style={{ width: `${Math.min((dailyUsage / MAX_FREE_USES) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                
                                {dailyUsage >= MAX_FREE_USES && (
                                    <div className="mt-3 text-[10px] text-rose-600 font-bold flex items-center bg-rose-50 p-2 rounded-lg">
                                        <AlertCircle size={14} className="mr-1.5 shrink-0" />
                                        สิทธิ์ฟรีของวันนี้หมดแล้ว กรุณาไปที่ร้านค้าเพื่อซื้อสินค้าเพิ่มเติม
                                    </div>
                                )}
                            </div>

                            {/* 🌟 ปุ่มเปิดประวัติสแกน & ความคืบหน้า (มีเฉพาะลูกค้าที่ล็อคอินแล้ว) 🌟 */}
                            {onOpenHistory && historyEnabled && (
                                <button
                                    onClick={onOpenHistory}
                                    className="w-full mt-3 bg-white border-2 border-indigo-200 text-indigo-600 py-2.5 rounded-xl font-black text-xs shadow-sm hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center"
                                >
                                    <History size={15} className="mr-1.5" />
                                    ดูประวัติสแกน & ความคืบหน้าผิว
                                    <ChevronRight size={14} className="ml-1" />
                                </button>
                            )}

                            {!isCameraOpen ? (
                                <div className="w-full space-y-3 mt-4">
                                    <button 
                                        onClick={dailyUsage >= MAX_FREE_USES ? () => {
                                            if (onGoToShop) {
                                                onClose();
                                                setTimeout(() => onGoToShop(), 300);
                                            }
                                        } : startCamera}
                                        className={`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                                            dailyUsage >= MAX_FREE_USES 
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/30 hover:opacity-90 active:scale-95' 
                                                : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/30 hover:opacity-90 active:scale-95'
                                        }`}
                                    >
                                        {dailyUsage >= MAX_FREE_USES ? (
                                            <><ShoppingBag size={18} className="mr-2" /> ไปที่ร้านค้าเพื่อรับสิทธิ์สแกน</>
                                        ) : (
                                            <><Camera size={18} className="mr-2" /> เปิดกล้องถ่ายรูปสแกนสด</>
                                        )}
                                    </button>
                                    
                                    {dailyUsage < MAX_FREE_USES && (
                                        <label className="w-full bg-white border-2 border-teal-500 text-teal-600 py-3.5 rounded-xl font-black text-sm shadow-sm hover:bg-teal-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                                            <Upload size={18} className="mr-2" />
                                            อัปโหลดจากอัลบั้ม
                                            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                                        </label>
                                    )}
                                </div>

                            ) : (
                                <div className="absolute inset-0 z-50 bg-black flex flex-col">
                                    {/* Top Bar */}
                                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent text-white">
                                        <button onClick={closeCamera} className="p-2 bg-white/20 rounded-full backdrop-blur-md">
                                            <X size={20} />
                                        </button>
                                        
                                        {/* Light Meter UI */}
                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center backdrop-blur-md ${
                                            lightLevel === 'good' ? 'bg-emerald-500/80' : 
                                            lightLevel === 'too-dark' ? 'bg-rose-500/80' : 'bg-amber-500/80'
                                        }`}>
                                            <Sparkles size={14} className="mr-1.5" />
                                            {lightLevel === 'good' ? 'แสงพอดี' : lightLevel === 'too-dark' ? 'มืดเกินไป' : 'สว่างเกินไป'}
                                        </div>
                                    </div>

                                    {/* Video Container */}
                                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                                        <video 
                                            ref={videoRef} 
                                            className="w-full h-full object-cover -scale-x-100" 
                                            playsInline 
                                            autoPlay 
                                            muted 
                                        />
                                        <canvas ref={canvasRef} className="hidden" />
                                        
                                        {/* Distance Guide Overlay (Oval) */}
                                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                            <div className="w-64 h-80 rounded-[50%] border-4 border-dashed transition-colors duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center"
                                                style={{ borderColor: lightLevel === 'good' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255, 255, 255, 0.4)' }}>
                                                <div className="text-white/70 text-[10px] font-bold bg-black/40 px-3 py-1 rounded-full absolute bottom-4 text-center w-max">
                                                    วางใบหน้าให้พอดีกับกรอบ
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Bar */}
                                    <div className="bg-black p-6 pb-8 flex items-center justify-center relative z-20">
                                        <button 
                                            onClick={capturePhoto}
                                            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                                                lightLevel === 'good' ? 'border-emerald-500 bg-white' : 'border-white/50 bg-white/80'
                                            }`}
                                        >
                                            <div className={`w-16 h-16 rounded-full ${lightLevel === 'good' ? 'bg-emerald-100' : 'bg-transparent'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Scanning */}
                    {step === 2 && (
                        <div className="flex-1 flex flex-col p-6 animate-in fade-in">
                            <div className="flex-1 relative rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
                                {image && <img src={image} alt="Face" className={`w-full h-full object-contain transition-all duration-700 ${isScanning ? 'brightness-50 contrast-125' : ''}`} />}
                                
                                {isScanning ? (
                                    <>
                                        {/* Scanner UI */}
                                        <div className="absolute inset-0 border-4 border-teal-500/50 rounded-2xl z-10">
                                            {/* Grid */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                                        </div>
                                        
                                        {diagnosticMode && (
                                            <div className="absolute inset-0 bg-gray-900/95 z-50 p-6 flex flex-col items-start justify-start overflow-y-auto">
                                                <h3 className="text-teal-400 font-bold mb-4 flex items-center"><Activity size={18} className="mr-2"/> System Diagnostics</h3>
                                                <div className="w-full space-y-2 font-mono text-[10px]">
                                                    {diagnosticLog.map((log, i) => (
                                                        <div key={i} className={`p-2 rounded border ${log.status === 'error' ? 'bg-red-900/50 border-red-500 text-red-200' : log.status === 'success' ? 'bg-teal-900/50 border-teal-500 text-teal-200' : 'bg-gray-800 border-gray-600 text-gray-300'}`}>
                                                            <span className="opacity-50 mr-2">[{log.time}]</span>
                                                            {log.msg}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => setDiagnosticMode(false)} className="mt-auto w-full bg-gray-800 text-white py-2 rounded-xl border border-gray-600 font-bold">ปิดหน้าต่างตรวจสอบ</button>
                                            </div>
                                        )}

                                        {/* Scanning Line */}
                                        <div className="absolute top-0 left-0 w-full h-[150%] bg-gradient-to-b from-transparent via-teal-400/50 to-transparent animate-[scan_2s_ease-in-out_infinite] z-20" style={{ boxShadow: '0 0 20px rgba(45,212,191,0.5)' }}></div>
                                        
                                        {/* Analyzing Text Overlay */}
                                        <div className="absolute inset-0 z-30 flex items-center justify-center">
                                            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full flex flex-col items-center">
                                                <div className="flex items-center mb-1">
                                                    <Loader2 size={16} className="text-teal-400 animate-spin mr-2"/>
                                                    <span className="text-teal-400 font-bold text-xs tracking-wider uppercase">AI Analyzing...</span>
                                                </div>
                                                <span className="text-white/70 text-[9px]">
                                                    กำลังประเมินอายุผิวและสแกนระบุพิกัดจุด
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute bottom-4 left-0 w-full px-4 z-30">
                                        {errorMsg && (
                                            <div className="mb-2 bg-red-500/90 text-white text-[10px] p-2 rounded-lg text-center backdrop-blur-sm border border-red-400">
                                                {errorMsg}
                                            </div>
                                        )}
                                        <button onClick={startScan} className="w-full bg-white/20 backdrop-blur-md text-white border border-white/50 py-3.5 rounded-xl font-black text-sm hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center shadow-lg">
                                            <Sparkles size={18} className="mr-2 text-yellow-300" />
                                            {scanMode === 'skin' ? 'เริ่มวิเคราะห์สภาพผิว & อายุผิว (Iris AI)' : 'เริ่มตรวจนับจุด & ประเมินราคาจี้ (Iris AI)'}
                                        </button>
                                        <button onClick={() => setStep(1)} className="w-full mt-2 text-white/70 text-xs py-2 hover:text-white transition-colors">
                                            ถ่ายภาพใหม่
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Result */}
                    {step === 3 && aiResult && (
                        <div className="flex-1 flex flex-col p-4 animate-in slide-in-from-right-4 bg-white relative overflow-y-auto space-y-3.5">
                            
                            
                            {/* AI Warning Banner */}
                            {aiResult.warning && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-start shadow-sm mb-2 animate-in slide-in-from-top-2">
                                    <AlertCircle size={16} className="text-amber-500 mr-2 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold mb-0.5">ข้อควรระวังภาพถ่าย</p>
                                        <p className="text-[10px] leading-relaxed">{aiResult.warning}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Toast Notification */}
                            {copiedToast && (
                                <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-teal-800 text-white text-xs px-4 py-2 rounded-full shadow-2xl z-50 flex items-center animate-in zoom-in-90">
                                    <Check size={14} className="mr-1.5 text-teal-300"/> คัดลอกผลลัพธ์แล้ว พร้อมแชร์ต่อ!
                                </div>
                            )}

                            {/* AI Estimated Skin Age has been moved into the image container as a banner overlay */}

                            {/* Controls Bar above Image */}
                            <div className="flex justify-between items-center bg-slate-900 text-white p-2.5 rounded-xl shadow-sm">
                                <span className="text-[11px] font-bold text-teal-300 flex items-center min-w-0">
                                    <Target size={14} className={`mr-1.5 text-teal-400 shrink-0 ${aiResult.mode === 'mole' ? 'animate-spin' : ''}`} style={aiResult.mode === 'mole' ? { animationDuration: '6s' } : undefined}/>
                                    <span className="truncate">{aiResult.mode === 'mole' ? `AI Target Radar (${aiResult.markers?.length || 0} จุด)` : 'Iris AI Skin Analysis'}</span>
                                </span>

                                <div className="flex items-center space-x-1.5">
                                    {aiResult.mode === 'mole' && (
                                        <button
                                            onClick={() => setShowMarkers(!showMarkers)}
                                            className="bg-slate-800 border border-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-slate-700 transition-colors flex items-center text-slate-200 shrink-0"
                                        >
                                            {showMarkers ? <><Eye size={12} className="mr-1 text-teal-400"/> ซ่อนวงชี้จุด</> : <><EyeOff size={12} className="mr-1 text-amber-400"/> แสดงวงชี้จุด</>}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowScoreGauges(!showScoreGauges)}
                                        className="bg-slate-800 border border-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-slate-700 transition-colors flex items-center text-slate-200 shrink-0"
                                    >
                                        <Gauge size={12} className={`mr-1 ${showScoreGauges ? 'text-pink-400' : 'text-amber-400'}`} /> วงคะแนน
                                    </button>
                                    
                                    <button 
                                        onClick={() => setIsFullScreenPhoto(true)}
                                        className="bg-teal-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-teal-500 transition-colors flex items-center shadow shrink-0"
                                    >
                                        <Maximize2 size={12} className="mr-1" /> ขยายรูป
                                    </button>
                                </div>
                            </div>

                            {/* Precise Image Container — บังคับสัดส่วน 3:4 เสมอ (ภาพไหนก็แสดงเท่ากัน) */}
                            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-2 border-teal-500/40 bg-black">
                                <img src={image} alt="Scanned Result" className="absolute inset-0 w-full h-full object-cover" />
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none rounded-2xl"></div>

                                {/* Futuristic Bounding Markers Layer (เฉพาะโหมดนับไฝ/ติ่งเนื้อ — โหมดวิเคราะห์ผิวไม่ปักพิกัดแล้ว) */}
                                {aiResult.mode === 'mole' && showMarkers && aiResult.markers && aiResult.markers.map((m, idx) => {
                                    const colors = getMarkerColor(m.type);
                                    const isActive = activeMarkerIndex === idx;

                                    return (
                                        <div 
                                            key={idx}
                                            style={{ left: `${m.x}%`, top: `${m.y}%` }}
                                            onClick={() => setActiveMarkerIndex(isActive ? null : idx)}
                                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/marker"
                                        >
                                            {/* Pulse Ring */}
                                            <div className={`absolute -inset-2 rounded-full ${colors.ping} animate-ping opacity-70`}></div>
                                            
                                            {/* Radar Ring Pin */}
                                            <div className={`w-7 h-7 rounded-full border-2 ${colors.ring} shadow-2xl flex items-center justify-center transition-transform hover:scale-125 ${isActive ? 'scale-125 border-yellow-300 ring-4 ring-yellow-300/60 z-30' : ''}`}>
                                                <span className="text-[10px] font-black text-white drop-shadow-md">#{idx + 1}</span>
                                            </div>

                                            {/* Sleek Tooltip - Active Only */}
                                            {isActive && (
                                                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap ${colors.badge} text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl z-40 animate-in zoom-in-95 flex items-center border border-white/30`}>
                                                    <span className="mr-1">#{idx + 1}</span> {m.label || m.type}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                
                                {/* 🌟 วงคะแนนลอยบนรูปแบบ Skincare Pro (เต็ม 100) — วางไว้ด้านบนรูป ไม่บังใบหน้า — กดวงใดก็เปิดรายละเอียดด้านนั้น */}
                                {showScoreGauges && aiResult.scores && (
                                    <div className="absolute left-1.5 right-1.5 top-2 z-30">
                                        <div className="bg-black/50 backdrop-blur-md rounded-2xl px-1 py-1.5 flex gap-0.5 overflow-x-auto hide-scrollbar items-end">
                                            {Object.keys(SCORE_BUBBLE_LABELS).map(key => {
                                                const score = aiResult.scores?.[key];
                                                if (typeof score !== 'number') return null;
                                                const isActive = expandedMetric === key;
                                                const color = gaugeColor(score);
                                                const size = 38, stroke = 3.5;
                                                const rr = (size - stroke * 2) / 2;
                                                const cc = 2 * Math.PI * rr;
                                                return (
                                                    <button key={key} type="button"
                                                        onClick={() => {
                                                            setExpandedMetric(isActive ? null : key);
                                                            if (!isActive && !showFullDetails) {
                                                                setShowFullDetails(true);
                                                            }
                                                        }}
                                                        className={`flex flex-col items-center shrink-0 px-1.5 py-1 rounded-xl transition-all ${isActive ? 'bg-white/25 scale-105' : 'active:scale-95 hover:bg-white/10'}`}>
                                                        <div className="relative" style={{ width: size, height: size }}>
                                                            <svg width={size} height={size} className="-rotate-90">
                                                                <circle cx={size / 2} cy={size / 2} r={rr} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} />
                                                                <circle cx={size / 2} cy={size / 2} r={rr} fill="none" stroke={color} strokeWidth={stroke}
                                                                    strokeDasharray={cc} strokeDashoffset={cc * (1 - Math.min(score / 10, 1))} strokeLinecap="round" />
                                                            </svg>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-[12px] font-black text-white leading-none drop-shadow-md">{Math.round(score * 10)}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[7.5px] font-bold text-white/90 whitespace-nowrap mt-1">{SCORE_BUBBLE_LABELS[key]}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Shopee-style AI Estimated Skin Age Banner Overlay */}
                                {aiResult.estimatedSkinAge && (
                                    <div 
                                        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[92%] bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] text-white rounded-full px-2 py-1.5 flex items-center justify-between shadow-2xl border border-white/20 z-40 animate-in slide-in-from-bottom-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        onClick={() => setShowFullDetails(prev => !prev)}
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <div className="w-8 h-8 bg-white rounded-full flex flex-col items-center justify-center shrink-0 shadow-inner">
                                                 <Calendar size={14} className="text-[#ee4d2d]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black leading-tight tracking-wide">อายุผิวประเมิน: {aiResult.estimatedSkinAge || '-'} ปี!</span>
                                                <span className="text-[9px] font-bold text-white/90 leading-tight truncate max-w-[160px]">{aiResult.skinAgeStatus || 'ผิวหน้าได้รับการดูแลอย่างดีค่ะ'}</span>
                                            </div>
                                        </div>
                                        <div className="pr-1.5 flex items-center">
                                            <span className="text-[9px] font-bold mr-1 opacity-90">ดูรายละเอียด</span>
                                            <ChevronRight size={14} className="animate-pulse" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Active Marker Info Card (If a marker is tapped) */}
                            {aiResult.mode === 'mole' && activeMarkerIndex !== null && aiResult.markers && aiResult.markers[activeMarkerIndex] && (
                                <div className="bg-slate-900 text-white p-3 rounded-xl border border-teal-500/50 flex justify-between items-center animate-in slide-in-from-bottom-2 shadow-lg">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-6 h-6 rounded-full bg-teal-500 text-white font-black text-xs flex items-center justify-center">
                                            #{activeMarkerIndex + 1}
                                        </span>
                                        <div>
                                            <h5 className="font-bold text-xs text-teal-300">{aiResult.markers[activeMarkerIndex].label}</h5>
                                            <p className="text-[10px] text-slate-300">พิกัด x: {Math.round(aiResult.markers[activeMarkerIndex].x)}%, y: {Math.round(aiResult.markers[activeMarkerIndex].y)}%</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveMarkerIndex(null)} className="text-slate-400 hover:text-white p-1">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Expand / Collapse Details Toggle Button */}
                            <button 
                                onClick={() => setShowFullDetails(!showFullDetails)}
                                className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-xs"
                            >
                                <span>{showFullDetails ? 'ซ่อนรายละเอียดเพิ่มเติม' : 'เปิดดูรายละเอียดวิเคราะห์เพิ่มเติม'}</span>
                                {showFullDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                            </button>

                            {/* Expandable Details Container */}
                            {showFullDetails && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    {/* Mode 1: General Skin Analysis Result */}
                                    {aiResult.mode === 'skin' ? (
                                        <>
                                            {/* Greeting Card */}
                                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
                                                <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                                                    <Heart size={20} className="fill-white"/>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-xs text-teal-800 mb-1">{aiResult.greeting || 'สวัสดีค่ะคุณลูกค้า Iris Clinic'}</h4>
                                                    <p className="text-[11px] text-gray-600 leading-relaxed">{aiResult.summary}</p>
                                                </div>
                                            </div>

                                            {/* Score Cards (7 Metrics) — กดเพื่อดูรายละเอียดเจาะลึกได้ */}
                                            <div>
                                                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 flex items-center">
                                                    <Activity size={14} className="mr-1.5 text-teal-600"/> คะแนนสภาพผิว 7 ด้านหลัก (เต็ม 10)
                                                </h4>
                                                <p className="text-[9px] text-gray-400 mb-2.5 font-medium">💡 กดแต่ละด้านเพื่อดูรายละเอียดและคำแนะนำการดูแล</p>
                                                <div className="grid grid-cols-2 gap-2.5">

                                                    {/* Overall — กราฟวงกลมใหญ่ */}
                                                    <div className="col-span-2 bg-gradient-to-br from-teal-50 via-white to-emerald-50 border border-teal-100 p-4 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden">
                                                        <div className="absolute right-0 top-0 w-24 h-24 bg-teal-200/20 rounded-full -mr-8 -mt-8 blur-xl"></div>
                                                        <div className="relative z-10 flex items-center gap-3">
                                                            <CircularGauge score={aiResult.scores?.overall} size={72} stroke={6} big />
                                                            <div>
                                                                <span className="text-[11px] font-black text-teal-800 flex items-center gap-1">
                                                                    <ShieldCheck size={13} className="text-teal-600"/> สุขภาพผิวโดยรวม
                                                                </span>
                                                                <span className="text-[10px] text-gray-500 font-medium block mt-0.5">คำนวณจากทุกปัจจัยทั้งหมด</span>
                                                                <span className="text-[9px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full bg-white/70 border border-teal-100" style={{ color: gaugeColor(aiResult.scores?.overall) }}>
                                                                    {(() => { const s = aiResult.scores?.overall; return typeof s === 'number' ? (s >= 8 ? 'ผิวแข็งแรงมาก' : s >= 6 ? 'ผิวดี มีจุดที่ควรปรับปรุง' : 'ควรดูแลเพิ่มเติม') : '-'; })()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {Object.entries(SKIN_METRICS).map(([key, metric]) => {
                                                        const score = aiResult.scores?.[key];
                                                        const isExpanded = expandedMetric === key;
                                                        const status = (typeof score === 'number') ? metric.getStatus(score) : null;
                                                        const statusTone = status?.tone === 'good' ? 'text-teal-600 bg-teal-50' : status?.tone === 'mid' ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
                                                        // กรองบริการที่เกี่ยวข้องจาก recommendedCourses
                                                        const relatedCourses = (aiResult.recommendedCourses || []).filter(c => {
                                                            const txt = String(c.name || '') + String(c.reason || '');
                                                            return metric.relatedServiceKeywords.some(kw => txt.includes(kw));
                                                        });
                                                        return (
                                                            <React.Fragment key={key}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setExpandedMetric(isExpanded ? null : key)}
                                                                    className={`col-span-1 ${key === 'acneScars' ? 'col-span-2' : ''} bg-slate-50/70 border ${isExpanded ? 'border-teal-400 ring-2 ring-teal-400/20 bg-white' : 'border-slate-100'} p-2 rounded-xl flex items-center gap-2.5 text-left hover:bg-white hover:shadow-sm active:scale-[0.98] transition-all`}
                                                                >
                                                                    <div className="shrink-0 relative" style={{ width: 44, height: 44 }}>
                                                                        <svg width="44" height="44" className="-rotate-90">
                                                                            <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                                                                            <circle cx="22" cy="22" r="18" fill="none" stroke={gaugeColor(score)} strokeWidth="4"
                                                                                strokeDasharray={2 * Math.PI * 18}
                                                                                strokeDashoffset={2 * Math.PI * 18 * (1 - (typeof score === 'number' ? Math.min(score/10, 1) : 0))}
                                                                                strokeLinecap="round"
                                                                                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                                                                        </svg>
                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                            <span className="text-[13px] font-black leading-none" style={{ color: gaugeColor(score) }}>{score ?? '-'}</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-700 font-bold flex-1 leading-tight flex items-center gap-0.5">
                                                                        {metric.label}
                                                                        {isExpanded ? <ChevronUp size={10} className="text-teal-500 shrink-0" /> : <ChevronDown size={10} className="text-gray-400 shrink-0" />}
                                                                    </span>
                                                                </button>
                                                                {isExpanded && (
                                                                    <div className="col-span-2 bg-white border border-teal-200 rounded-xl p-3 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm">
                                                                        {status && (
                                                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${statusTone}`}>
                                                                                <Activity size={10} /> {status.text}
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><AlertCircle size={10} className="text-rose-400" /> สาเหตุ/ปัจจัย</p>
                                                                            <p className="text-[10px] text-gray-700 leading-relaxed">{metric.causes}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Sparkles size={10} className="text-amber-400" /> ดูแลเองที่บ้าน</p>
                                                                            <p className="text-[10px] text-gray-700 leading-relaxed">{metric.homeCare}</p>
                                                                        </div>
                                                                        {relatedCourses.length > 0 && (
                                                                            <div>
                                                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Target size={10} className="text-teal-500" /> บริการคลินิกที่เกี่ยวข้อง</p>
                                                                                <div className="space-y-1">
                                                                                    {relatedCourses.map((c, i) => (
                                                                                        <div key={i} className="bg-teal-50/60 border border-teal-100 rounded-lg px-2 py-1.5">
                                                                                            <p className="text-[10px] font-bold text-teal-900">{c.name}</p>
                                                                                            {c.reason && <p className="text-[9px] text-teal-700 opacity-90 mt-0.5">{c.reason}</p>}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Hydration Analysis */}
                                            {aiResult.hydrationAnalysis && (
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-400/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                                                    <div className="relative z-10">
                                                        <h4 className="font-black text-sm text-blue-900 flex items-center mb-2">
                                                            <Droplets size={16} className="mr-1.5 text-blue-500" /> วิเคราะห์ความชุ่มชื้น & น้ำมันผิว
                                                        </h4>
                                                        <div className="flex mb-2">
                                                            {(() => {
                                                                const { isDry, isDehydrated } = aiResult.hydrationAnalysis;
                                                                let label = "";
                                                                let colorClass = "";
                                                                if (isDry && isDehydrated) {
                                                                    label = "ผิวแห้งและขาดน้ำ (Dry & Dehydrated)";
                                                                    colorClass = "bg-rose-100 text-rose-700";
                                                                } else if (!isDry && isDehydrated) {
                                                                    label = "ผิวมันแต่ขาดน้ำ (Dehydrated Oily Skin)";
                                                                    colorClass = "bg-amber-100 text-amber-700";
                                                                } else if (isDry && !isDehydrated) {
                                                                    label = "ผิวแห้งขาดน้ำมัน (Dry Skin)";
                                                                    colorClass = "bg-orange-100 text-orange-700";
                                                                } else {
                                                                    label = "ผิวสมดุลชุ่มชื้นดี (Balanced & Hydrated)";
                                                                    colorClass = "bg-emerald-100 text-emerald-700";
                                                                }
                                                                return (
                                                                    <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black ${colorClass}`}>
                                                                        {label}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                        <p className="text-[11px] text-blue-800/90 leading-relaxed mb-2">{aiResult.hydrationAnalysis.description}</p>
                                                        {aiResult.hydrationAnalysis.recommendation && (
                                                            <div className="bg-blue-100/50 rounded-xl p-2.5">
                                                                <p className="text-[10px] font-black text-blue-900 mb-0.5 flex items-center"><Sparkles size={10} className="mr-1" /> คำแนะนำ</p>
                                                                <p className="text-[11px] text-blue-800 leading-relaxed">{aiResult.hydrationAnalysis.recommendation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cell Turnover Info (Herbal Peeling) */}
                                            {(() => {
                                                const info = aiResult.cellTurnoverInfo || {};
                                                const score = aiResult.scores?.cellTurnover;
                                                // fallback: ถ้า AI ไม่ส่ง cellTurnoverInfo ให้คำนวณ level จาก score
                                                let level = info.level;
                                                let tone = 'amber';
                                                if (!level && typeof score === 'number') {
                                                    if (score >= 8) { level = 'พร้อมผลัดเซลล์ (เซลล์เก่าสะสมมาก)'; tone = 'emerald'; }
                                                    else if (score >= 6) { level = 'พร้อมผลัดเซลล์ ระดับปานกลาง'; tone = 'amber'; }
                                                    else { level = 'ควรเตรียมผิวก่อนผลัดเซลล์'; tone = 'rose'; }
                                                } else if (typeof score === 'number') {
                                                    tone = score >= 8 ? 'emerald' : score >= 6 ? 'amber' : 'rose';
                                                }
                                                // 🌟 สถานะการผลัดเซลล์ปัจจุบัน: กำลังผลัดอยู่ / กำลังฟื้น / พร้อมผลัด / ปกติ
                                                const status = info.status || (typeof score === 'number' ? (score >= 6 ? 'ready' : 'normal') : 'normal');
                                                const STATUS_MAP = {
                                                    peeling_now: { label: 'ผิวกำลังผลัดเซลล์อยู่ตอนนี้', emoji: '🔄', tone: 'sky', stopTitle: 'ระหว่างผิวกำลังผลัด — หยุดของกลุ่มผลัดเซลล์ก่อน!', advice: 'งดผลัดเซลล์ซ้ำเด็ดขาด! ปล่อยให้ผิวหลุดเองตามธรรมชาติ เน้นบำรุงความชุ่มชื้น ห้ามขัดถูหรือลอกเอง' },
                                                    recovering: { label: 'ผิวใหม่กำลังฟื้นตัว', emoji: '🛡️', tone: 'violet', stopTitle: 'ผิวใหม่ยังอ่อนไหว — หยุดของกลุ่มผลัดเซลล์ก่อน!', advice: 'เพิ่งผลัดเซลล์/ทำทรีตเมนต์เสร็จใหม่ๆ ผิวยังอ่อนไหว — รอ 1-2 สัปดาห์ก่อนผลัดครั้งถัดไป และทากันแดดทุกวัน' },
                                                    ready: { label: 'พร้อมผลัดเซลล์ด้วยสมุนไพร', emoji: '✅', tone: 'emerald', stopTitle: null, advice: null },
                                                    normal: { label: 'ผิวปกติ ผลัดตามรอบธรรมชาติ', emoji: '🌿', tone: 'amber', stopTitle: null, advice: null },
                                                };
                                                const statusObj = STATUS_MAP[status] || STATUS_MAP.normal;
                                                // สีการ์ดเปลี่ยนตามสถานะ (ถ้า AI บอกสถานะชัดเจน)
                                                if (info.status && STATUS_MAP[info.status]) tone = statusObj.tone;
                                                const toneCls = {
                                                    emerald: { bg: 'from-emerald-500 to-teal-600', chip: 'bg-emerald-100 text-emerald-700' },
                                                    amber: { bg: 'from-amber-500 to-orange-500', chip: 'bg-amber-100 text-amber-700' },
                                                    rose: { bg: 'from-rose-500 to-pink-500', chip: 'bg-rose-100 text-rose-700' },
                                                    sky: { bg: 'from-sky-500 to-blue-600', chip: 'bg-sky-100 text-sky-700' },
                                                    violet: { bg: 'from-violet-500 to-purple-600', chip: 'bg-violet-100 text-violet-700' },
                                                }[tone] || { bg: 'from-amber-500 to-orange-500', chip: 'bg-amber-100 text-amber-700' };
                                                // บริการสมุนไพรที่เกี่ยวข้องจาก recommendedCourses (แสดงเฉพาะเมื่อผิวพร้อมผลัด)
                                                const herbalKeywords = ['สมุนไพร', 'ผลัดเซลล์', 'สครับ', 'ลอก', 'ขัดผิว', 'พอกหน้า'];
                                                const herbalCourses = (aiResult.recommendedCourses || []).filter(c => {
                                                    const txt = String(c.name || '') + String(c.reason || '');
                                                    return herbalKeywords.some(kw => txt.includes(kw));
                                                });
                                                const shouldOfferHerbal = status === 'ready' || status === 'normal';
                                                return (
                                                    <div className={`bg-gradient-to-br ${toneCls.bg} text-white rounded-2xl p-4 shadow-lg relative overflow-hidden`}>
                                                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                                        <div className="relative z-10">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-black text-sm flex items-center"><Sparkles size={16} className="mr-1.5 text-yellow-200" /> 🌿 พร้อมผลัดเซลล์ด้วยสมุนไพร?</h4>
                                                            </div>

                                                            {/* 🌟 สถานะปัจจุบัน: กำลังผลัดอยู่ / กำลังฟื้น / พร้อมผลัด / ปกติ */}
                                                            <div className="bg-white/25 backdrop-blur-sm rounded-xl px-3 py-2 mb-2 flex items-start gap-2.5 border border-white/20">
                                                                <span className="text-xl leading-none shrink-0">{statusObj.emoji}</span>
                                                                <div className="min-w-0">
                                                                    <p className="text-[12px] font-black leading-tight">{statusObj.label}</p>
                                                                    {info.statusEvidence && (
                                                                        <p className="text-[9.5px] opacity-90 mt-0.5 leading-snug">เห็นจากภาพ: {info.statusEvidence}</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* เกจเข็มครึ่งวงแสดงระดับความพร้อม */}
                                                            <CellTurnoverGauge score={score} />
                                                            {level && (
                                                                <p className="text-center text-[11px] font-black mt-1.5 mb-2 flex items-center justify-center gap-1">
                                                                    <Sparkles size={11} className="text-yellow-200" /> {level}
                                                                </p>
                                                            )}
                                                            {info.description && <p className="text-[11px] opacity-95 leading-relaxed mb-2">{info.description}</p>}
                                                            {info.herbalRecommendation && (
                                                                <div className="bg-white/15 rounded-xl p-2.5 mb-2">
                                                                    <p className="text-[10px] font-black opacity-90 mb-0.5 flex items-center"><Sparkles size={10} className="mr-1" /> คำแนะนำ</p>
                                                                    <p className="text-[11px] opacity-95 leading-relaxed">{info.herbalRecommendation}</p>
                                                                </div>
                                                            )}

                                                            {/* 🌟 ถ้ากำลังผลัด/กำลังฟื้น → เตือนกระพริบ: หยุดครีมผลัดเซลล์ + ผงเร่ง, ใช้ผงพอกสมุนไพรไอริสได้ */}
                                                            {!shouldOfferHerbal && (
                                                                <div className="bg-black/30 rounded-2xl p-3 border border-yellow-300/60 space-y-2 shadow-inner">
                                                                    {/* หัวเตือนพร้อมไอคอนกระพริบ */}
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg animate-blink-alert shrink-0">
                                                                            <AlertTriangle size={17} className="text-gray-900" />
                                                                        </span>
                                                                        <p className="text-[11.5px] font-black leading-tight">{statusObj.stopTitle}</p>
                                                                    </div>

                                                                    {/* รายการหยุดใช้ */}
                                                                    <p className="text-[9.5px] font-black opacity-90 tracking-wide">🚫 หยุดใช้ชั่วคราวจนผิวหลุดหมดและผิวใหม่แข็งแรง:</p>
                                                                    <div className="flex items-start gap-1.5 bg-rose-600 border border-rose-300/50 rounded-xl px-2 py-1.5 shadow-sm">
                                                                        <Ban size={11} className="mt-0.5 shrink-0 text-rose-50" />
                                                                        <p className="text-[10px] leading-snug"><b>ครีมกลุ่มผลัดเซลล์ทุกชนิด</b> — AHA / BHA / Retinol / ครีมผลัดลอก / ครีมเร่งผลัด / สครับขัดผิว</p>
                                                                    </div>
                                                                    <div className="flex items-start gap-1.5 bg-rose-600 border border-rose-300/50 rounded-xl px-2 py-1.5 shadow-sm">
                                                                        <Ban size={11} className="mt-0.5 shrink-0 text-rose-50" />
                                                                        <p className="text-[10px] leading-snug"><b>ผงเร่ง / โคลนเร่ง</b> — งดใช้จนกว่าผิวจะผลัดหมดสนิท (ประมาณ 5-7 วัน)</p>
                                                                    </div>

                                                                    {/* รายการใช้ได้ */}
                                                                    <div className="flex items-start gap-1.5 bg-emerald-400/30 border border-emerald-200/40 rounded-xl px-2 py-1.5">
                                                                        <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-100" />
                                                                        <p className="text-[10px] leading-snug"><b>ใช้ได้: ผงพอกสมุนไพรไอริส 🌿</b> — สมุนไพรอ่อนโยน ช่วยปลอบผิว ลดรอยแดง ฟื้นฟูผิวให้กลับมาสมดุลได้ตามปกติ</p>
                                                                    </div>

                                                                    {/* 📋 ขั้นตอนดูแลระหว่างผิวผลัด */}
                                                                    <div className="bg-white/15 border border-white/25 rounded-xl px-2.5 py-2 space-y-1.5">
                                                                        <p className="text-[9.5px] font-black opacity-95 tracking-wide">📋 ขั้นตอนดูแลระหว่างผิวผลัด:</p>
                                                                        <div className="flex items-start gap-1.5">
                                                                            <span className="w-4 h-4 rounded-full bg-white text-gray-900 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                                                                            <p className="text-[10px] leading-snug">🥛 ใช้<b>คลีนซิ่งน้ำนม นวดขัดเบาๆ ก่อนล้างหน้า</b> — ช่วยขจัดเซลล์ผิวที่กำลังหลุดให้ลอยออกอย่างอ่อนโยน ไม่ต้องออกแรงถู</p>
                                                                        </div>
                                                                        <div className="flex items-start gap-1.5">
                                                                            <span className="w-4 h-4 rounded-full bg-white text-gray-900 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                                                                            <p className="text-[10px] leading-snug">🌿 ล้างหน้าตามปกติ แล้วพอกบำรุงด้วย<b>ผงพอกสมุนไพรไอริส</b> + มอยส์เจอไรเซอร์เติมความชุ่มชื้น</p>
                                                                        </div>
                                                                        <div className="flex items-start gap-1.5 bg-yellow-400/20 border border-yellow-300/30 rounded-lg px-1.5 py-1 -mx-1">
                                                                            <span className="w-4 h-4 rounded-full bg-yellow-400 text-gray-900 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                                                                            <p className="text-[10px] leading-snug">☀️ <b>ทาครีมกันแดด SPF50+ ทุกวัน ห้ามขาด!</b> — ผิวใหม่ที่เพิ่งผลัดบางมาก ไวต่อแสงแดดเป็นพิเศษ</p>
                                                                        </div>
                                                                        <div className="flex items-start gap-1.5 bg-emerald-400/25 border border-emerald-200/40 rounded-lg px-1.5 py-1 -mx-1">
                                                                            <span className="w-4 h-4 rounded-full bg-emerald-400 text-gray-900 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">4</span>
                                                                            <p className="text-[10px] leading-snug">✨ <b>เคล็ดลับขั้นท้ายสุด:</b> เอา<b>ผงพอกสมุนไพรไอริสผสมน้ำ แล้วแต้มเป็นจุดๆ</b> ที่รอย สิว หรือจุดที่มีปัญหา — เข้มข้นเฉพาะจุด ช่วยลดเลือนรอยและสงบสิวได้เร็วขึ้น</p>
                                                                        </div>
                                                                    </div>

                                                                    {statusObj.advice && (
                                                                        <p className="text-[9.5px] opacity-90 leading-relaxed border-t border-white/20 pt-1.5">{statusObj.advice}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {shouldOfferHerbal && herbalCourses.length > 0 && (
                                                                <div className="space-y-1.5">
                                                                    {herbalCourses.map((c, i) => (
                                                                        <div key={i} className="bg-white/15 rounded-lg px-2.5 py-1.5 flex justify-between items-center">
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[10px] font-bold truncate">{c.name}</p>
                                                                                {c.reason && <p className="text-[9px] opacity-80 truncate">{c.reason}</p>}
                                                                            </div>
                                                                            <button onClick={onClose} className="shrink-0 bg-white text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg active:scale-95 transition-transform ml-2">สอบถาม</button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* 📊 Radar Chart — ภาพรวมระดับปัญหาผิว */}
                                            {(() => {
                                                // ด้านที่จะ plot (ใช้ label สั้น)
                                                const radarAxes = [
                                                    { key: 'acne', label: 'สิว' },
                                                    { key: 'wrinkles', label: 'ริ้วรอย' },
                                                    { key: 'brightness', label: 'กระจ่างใส' },
                                                    { key: 'pores', label: 'รูขุมขน' },
                                                    { key: 'darkSpots', label: 'ฝ้า/จุดดำ' },
                                                    { key: 'moisture', label: 'ชุ่มชื้น' },
                                                    { key: 'darkCircles', label: 'รอยคล้ำตา' },
                                                    { key: 'acneScars', label: 'หลุมสิว' },
                                                ];
                                                const size = 240;
                                                const cx = size / 2, cy = size / 2;
                                                const radius = 85;
                                                const n = radarAxes.length;
                                                const angles = radarAxes.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);
                                                // จุดของผลลัพธ์ (score/10 * radius)
                                                const points = radarAxes.map((ax, i) => {
                                                    const val = aiResult.scores?.[ax.key];
                                                    const r = (typeof val === 'number' ? val / 10 : 0) * radius;
                                                    return [cx + Math.cos(angles[i]) * r, cy + Math.sin(angles[i]) * r];
                                                });
                                                const polygon = points.map(p => p.join(',')).join(' ');
                                                // grid rings (2,4,6,8,10)
                                                const rings = [2, 4, 6, 8, 10];
                                                // จุดปลายแกน (สำหรับเส้นแกน + label)
                                                const axisEnds = angles.map(a => [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
                                                const labelPos = angles.map(a => [cx + Math.cos(a) * (radius + 18), cy + Math.sin(a) * (radius + 18)]);
                                                return (
                                                    <div className="bg-white border border-teal-100 rounded-2xl p-3">
                                                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-center">
                                                            <Activity size={14} className="mr-1.5 text-teal-600"/> กราฟวงกลมสภาพผิว (Radar)
                                                        </h4>
                                                        <div className="flex justify-center">
                                                            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
                                                                <defs>
                                                                    <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.45" />
                                                                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.2" />
                                                                    </linearGradient>
                                                                </defs>
                                                                {/* grid rings */}
                                                                {rings.map(r => {
                                                                    const rr = (r / 10) * radius;
                                                                    const pts = angles.map(a => `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`).join(' ');
                                                                    return <polygon key={r} points={pts} fill={r === 10 ? '#f8fafc' : 'none'} stroke="#e2e8f0" strokeWidth="1" />;
                                                                })}
                                                                {/* axes */}
                                                                {axisEnds.map((end, i) => (
                                                                    <line key={i} x1={cx} y1={cy} x2={end[0]} y2={end[1]} stroke="#e2e8f0" strokeWidth="1" />
                                                                ))}
                                                                {/* data polygon — gradient fill */}
                                                                <polygon points={polygon} fill="url(#radarGrad)" stroke="#0d9488" strokeWidth="2" strokeLinejoin="round" />
                                                                {/* data points — สีตามคะแนน + ขอบขาว */}
                                                                {points.map((p, i) => {
                                                                    const val = aiResult.scores?.[radarAxes[i].key];
                                                                    return (
                                                                        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={gaugeColor(val)} stroke="#ffffff" strokeWidth="1.5" />
                                                                    );
                                                                })}
                                                                {/* labels */}
                                                                {labelPos.map((pos, i) => {
                                                                    const val = aiResult.scores?.[radarAxes[i].key];
                                                                    return (
                                                                        <text key={i} x={pos[0]} y={pos[1]} textAnchor="middle" dominantBaseline="middle" className="fill-gray-600" style={{ fontSize: '9px', fontWeight: 700 }}>
                                                                            {radarAxes[i].label}
                                                                            {typeof val === 'number' && <tspan x={pos[0]} dy={11} style={{ fontSize: '8px', fontWeight: 800 }} fill={gaugeColor(val)}>{val}</tspan>}
                                                                        </text>
                                                                    );
                                                                })}
                                                            </svg>
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 text-center mt-1 font-medium">ยิ่งรูปทรงขยายเต็มวง = ผิวด้านนั้นแข็งแรงดี</p>
                                                    </div>
                                                );
                                            })()}

                                            {/* Daily Advice */}
                                            <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-2xl">
                                                <h4 className="font-bold text-xs text-amber-800 mb-1 flex items-center"><Sparkles size={14} className="mr-1.5 text-amber-500"/> คำแนะนำการดูแลตัวเองประจำวัน</h4>
                                                <p className="text-[11px] text-amber-900/80 leading-relaxed">{aiResult.recommendation}</p>
                                            </div>

                                            {/* 🗓️ โปรแกรมดูแลผิวเฉพาะบุคคล — แยกปัญหาสิว/ฝ้ากระ แล้วจัดลำดับการรักษา */}
                                            <CarePlanCard
                                                scores={aiResult.scores || {}}
                                                recommendedCourses={aiResult.recommendedCourses || []}
                                                shopItems={shopItems}
                                                turnoverStatus={aiResult.cellTurnoverInfo?.status}
                                                onAddToCart={onAddToCart}
                                                onAsk={onClose}
                                            />

                                            {/* Recommended Courses from Iris Clinic */}
                                            {aiResult.recommendedCourses && aiResult.recommendedCourses.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center">
                                                        <Target size={14} className="mr-1.5 text-teal-600"/> คอร์สบำรุงที่ AI แนะนำสำหรับคุณ
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {aiResult.recommendedCourses.map((cItem, idx) => (
                                                            <div key={idx} className="bg-teal-50/50 border border-teal-100 p-3 rounded-xl flex justify-between items-center">
                                                                <div>
                                                                    <h5 className="font-bold text-xs text-teal-900">{cItem.name}</h5>
                                                                    <p className="text-[10px] text-teal-700 opacity-90 mt-0.5">{cItem.reason}</p>
                                                                </div>
                                                                <button onClick={onClose} className="shrink-0 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform ml-2">
                                                                    สอบถาม
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* Mode 2: Mole & Skin Tag Counter Result */
                                        <>
                                            {/* Price Banner */}
                                            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
                                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[11px] font-bold opacity-90 uppercase tracking-wider flex items-center">
                                                            <Coins size={14} className="mr-1 text-yellow-300"/> ราคาประเมินค่าบริการจี้เบื้องต้น
                                                        </span>
                                                        <span className="bg-yellow-400 text-teal-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                                                            ประกันซ้ำ 1 เดือน
                                                        </span>
                                                    </div>
                                                    <div className="text-3xl font-black text-yellow-300 my-1">
                                                        ฿{(aiResult.estimatedPriceMin || 0).toLocaleString()} - ฿{(aiResult.estimatedPriceMax || 0).toLocaleString()}
                                                    </div>
                                                    <p className="text-[10px] opacity-80">*ราคานี้ขึ้นอยู่กับขนาดของจุดและความลึกของรากไฝ ประเมินโดยประมาณ</p>
                                                </div>
                                            </div>

                                            {/* Spot Breakdown Cards */}
                                            <div>
                                                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center">
                                                    <Tag size={14} className="mr-1.5 text-emerald-600"/> รายการตรวจพบทั้งหมด ({aiResult.counts?.total || 0} จุด)
                                                </h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl text-center">
                                                        <span className="text-[10px] text-rose-700 font-bold block mb-1">ไฝ / ขี้แมลงวัน</span>
                                                        <span className="text-xl font-black text-rose-800">{aiResult.counts?.moles || 0} <span className="text-xs font-normal text-rose-600">จุด</span></span>
                                                    </div>
                                                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-center">
                                                        <span className="text-[10px] text-amber-700 font-bold block mb-1">กระเนื้อ / กระแดด</span>
                                                        <span className="text-xl font-black text-amber-800">{aiResult.counts?.freckles || 0} <span className="text-xs font-normal text-amber-600">จุด</span></span>
                                                    </div>
                                                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-center">
                                                        <span className="text-[10px] text-emerald-700 font-bold block mb-1">ติ่งเนื้อ / สิวหิน</span>
                                                        <span className="text-xl font-black text-emerald-800">{aiResult.counts?.skinTags || 0} <span className="text-xs font-normal text-emerald-600">จุด</span></span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Locations Found */}
                                            {aiResult.locations && aiResult.locations.length > 0 && (
                                                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                                    <span className="text-[10px] text-gray-500 font-bold block mb-1.5">บริเวณที่ตรวจพบจุด:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {aiResult.locations.map((loc, i) => (
                                                            <span key={i} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                                                                📍 {loc}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Summary & Care Advice */}
                                            <div className="bg-teal-50/60 border border-teal-100 p-3.5 rounded-2xl">
                                                <h4 className="font-bold text-xs text-teal-800 mb-1 flex items-center">
                                                    <ShieldCheck size={14} className="mr-1.5 text-teal-600"/> รายละเอียดคำแนะนำหลังจี้
                                                </h4>
                                                <p className="text-[11px] text-teal-900/80 leading-relaxed mb-2">{aiResult.summary}</p>
                                                <p className="text-[10px] text-teal-700 font-medium border-t border-teal-200/60 pt-2">{aiResult.cauterizeAdvice}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons: Share & Consult */}
                            <div className="pt-2 space-y-2">
                                {onOpenSurvey && (
                                    <button onClick={onOpenSurvey} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-orange-300 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center">
                                        <Gift size={16} className="mr-2" />
                                        🧪 ช่วยทดสอบ AI — ทำแบบประเมิน 2 นาที รับส่วนลด 50.-
                                    </button>
                                )}
                                {onOpenHistory && historyEnabled && (
                                    <button onClick={onOpenHistory} className="w-full bg-white border-2 border-indigo-200 text-indigo-600 py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center">
                                        <History size={16} className="mr-2 text-indigo-500" />
                                        ดูประวัติสแกน & เทียบ Before/After
                                    </button>
                                )}
                                <button onClick={handleShareResults} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-xs shadow-md hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center">
                                    <Share2 size={16} className="mr-2 text-teal-400" />
                                    แชร์ผลวิเคราะห์ / คัดลอกผลลัพธ์
                                </button>
                                
                                <button onClick={() => {
                                    onClose();
                                    if (onBookService) onBookService();
                                }} className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center">
                                    {scanMode === 'mole' ? 'จองคิวจี้ไฝ / ปรึกษาแอดมิน' : 'ปรึกษาแอดมิน / จองคิวรับบริการ'} <ArrowRight size={14} className="ml-1.5"/>
                                </button>
                            </div>

                        </div>
                    )}
                    
                </div>
            </div>

            {/* Full Screen Photo Viewer Modal */}
            {isFullScreenPhoto && image && (
                <div className="fixed inset-0 bg-black/95 z-[120] flex flex-col p-4 animate-in fade-in">
                    <div className="flex justify-between items-center text-white mb-2">
                        <span className="text-xs font-bold flex items-center text-teal-400">
                            <Target size={16} className="mr-1.5 animate-spin" style={{ animationDuration: '6s' }}/>
                            รูปถ่ายสแกนแบบเต็มจอ (AI Radar View)
                        </span>
                        <button onClick={() => setIsFullScreenPhoto(false)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                        <img src={image} alt="Full Screen Scan" className="max-w-full max-h-full object-contain" />

                        {/* Markers on Full Screen (เฉพาะโหมดนับไฝ) */}
                        {aiResult?.mode === 'mole' && showMarkers && aiResult?.markers && aiResult.markers.map((m, idx) => {
                            const colors = getMarkerColor(m.type);
                            const isActive = activeMarkerIndex === idx;

                            return (
                                <div 
                                    key={idx}
                                    style={{ left: `${m.x}%`, top: `${m.y}%` }}
                                    onClick={() => setActiveMarkerIndex(isActive ? null : idx)}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                                >
                                    <div className={`absolute -inset-3 rounded-full ${colors.ping} animate-ping opacity-60`}></div>
                                    <div className={`w-8 h-8 rounded-full border-2 ${colors.ring} flex items-center justify-center shadow-xl ${isActive ? 'ring-4 ring-yellow-300' : ''}`}>
                                        <span className="text-xs font-black text-white">#{idx + 1}</span>
                                    </div>
                                    {isActive && (
                                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap ${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                                            #{idx + 1} {m.label || m.type}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Custom keyframes for scanner */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                @keyframes blinkAlert {
                    0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7); }
                    50% { opacity: 0.55; transform: scale(0.88); box-shadow: 0 0 0 8px rgba(250, 204, 21, 0); }
                }
                .animate-blink-alert { animation: blinkAlert 1.1s ease-in-out infinite; }
            `}} />
        </div>
    );
}
