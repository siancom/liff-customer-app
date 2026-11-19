import React, { useState, useEffect, useMemo, useRef } from 'react';
import { query, where, onSnapshot } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import { 
    X, TrendingUp, ArrowLeftRight, History, Loader2, Camera, 
    ArrowUp, ArrowDown, Minus, Sparkles, CalendarDays, Smile, Frown, Meh, Share2,
    ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ShieldCheck, Activity, Droplets, AlertCircle, Heart, ArrowLeft, CheckCircle2
} from 'lucide-react';

// 🌟 Skin Progress Modal — ประวัติการสแกนผิว + กราฟความคืบหน้า + เทียบ Before/After (สไตล์ Skincare Pro) 🌟

const METRIC_LABELS = {
    acne: 'สิว & รอยแดง',
    wrinkles: 'ริ้วรอย/กระชับ',
    brightness: 'ความกระจ่างใส',
    pores: 'รูขุมขน',
    darkSpots: 'ฝ้า กระ จุดด่างดำ',
    moisture: 'ความชุ่มชื้น',
    darkCircles: 'รอยคล้ำรอบตา',
    acneScars: 'หลุมสิว/ขรุขระ',
    cellTurnover: 'พร้อมผลัดเซลล์',
    overall: 'สุขภาพผิวโดยรวม',
};

// 🌟 ฐานความรู้เจาะลึกแต่ละด้านผิวสำหรับแสดงในหน้ารายละเอียด 🌟
const SKIN_METRICS = {
  acne: {
    label: 'สิว & รอยแดง',
    causes: 'ฮอร์โมน, ความมันส่วนเกิน, รูขุมขนอุดตัน, สะสมสิ่งสกปรก หรือใช้เครื่องสำอางที่อุดตัน',
    homeCare: 'ล้างหน้าเบาๆ วันละ 2 ครั้ง, ไม่บีบสิวเอง, เลือกผลิตภัณฑ์ non-comedogenic, หลีกเลี่ยงของมัน/ทอด/หวานจัด',
    getStatus: (s) => s >= 8 ? { text: 'ผิวใส แทบไม่มีสิว', tone: 'good' } : s >= 6 ? { text: 'มีสิวอุดตัน/รอยแดงเล็กน้อย', tone: 'mid' } : { text: 'มีสิวอักเสบ/รอยแดง ควรดูแล', tone: 'bad' }
  },
  wrinkles: {
    label: 'ริ้วรอย/ความกระชับ',
    causes: 'คอลลาเจนลดลงตามวัย, แสงแดด, การนอนหน้าบีบ, ความเครียด หรือพักผ่อนไม่เพียงพอ',
    homeCare: 'ทากันแดดทุกวัน, บำรุงด้วยวิตามินซี/เรตินอล, นอนหลับให้เพียงพอ, ดื่มน้ำมากๆ',
    getStatus: (s) => s >= 8 ? { text: 'ผิวกระชับ ดูอ่อนเยาว์', tone: 'good' } : s >= 6 ? { text: 'เริ่มมีริ้วรอยเล็กๆ', tone: 'mid' } : { text: 'มีริ้วรอยชัดเจน ควรบำรุง', tone: 'bad' }
  },
  brightness: {
    label: 'ความกระจ่างใส',
    causes: 'ผิวหมองคล้ำจากแดด, สะสมเซลล์ผิวเก่า, พักผ่อนน้อย หรือการดูแลไม่สม่ำเสมอ',
    homeCare: 'ขัด/สครับผิวเบาๆ สัปดาห์ละครั้ง, ทาวิตามินซีเช้า-กันแดดกลางวัน, พักผ่อนให้เพียงพอ',
    getStatus: (s) => s >= 8 ? { text: 'ผิวสว่างกระจ่างใส', tone: 'good' } : s >= 6 ? { text: 'ผิวเริ่มหมองคล้ำเล็กน้อย', tone: 'mid' } : { text: 'ผิวหมองคล้ำ ควรดูแล', tone: 'bad' }
  },
  pores: {
    label: 'รูขุมขน/ผิวเรียบเนียน',
    causes: 'ความมันส่วนเกิน, รูขุมขนอุดตัน, คอลลาเจนลดลงรอบรูขุมขน หรือกรรมพันธุ์',
    homeCare: 'ทำความสะอาดรูขุมขน, หลีกเลี่ยงบีบสิวหัวดำ, ใช้โทนเนอร์/Niacinamide, สครับเบาๆ',
    getStatus: (s) => s >= 8 ? { text: 'ผิวเรียบเนียน รูขุมขนกระชับ', tone: 'good' } : s >= 6 ? { text: 'รูขุมขนกว้างเล็กน้อย', tone: 'mid' } : { text: 'รูขุมขนกว้างชัดเจน ควรดูแล', tone: 'bad' }
  },
  darkSpots: {
    label: 'ฝ้า กระ จุดด่างดำ',
    causes: 'แสงแดดสะสม, ฮอร์โมน, การอักเสบจากสิว (PIH), หรือกรรมพันธุ์',
    homeCare: 'ทากันแดด SPF50+ ทุกวัน, ใช้วิตามินซี/อาร์บูติน, หลีกเลี่ยงแสงแดดจัด',
    getStatus: (s) => s >= 8 ? { text: 'ผิวสะอาด แทบไม่มีจุดด่างดำ', tone: 'good' } : s >= 6 ? { text: 'มีจุดด่างดำ/กระเล็กน้อย', tone: 'mid' } : { text: 'มีฝ้า/จุดด่างดำชัดเจน ควรรักษา', tone: 'bad' }
  },
  moisture: {
    label: 'สมดุลความชุ่มชื้น',
    causes: 'ผิวขาดน้ำ, อากาศแห้ง/ห้องแอร์, ดื่มน้ำน้อย หรือล้างหน้าบ่อยเกินไป',
    homeCare: 'ทามอยส์ไจเซอร์หลังล้างหน้าทันที, ดื่มน้ำวันละ 2 ลิตร, เลือกผลิตภัณฑ์ Hyaluronic Acid/Ceramide',
    getStatus: (s) => s >= 8 ? { text: 'ผิวชุ่มชื้น สมดุลดี', tone: 'good' } : s >= 6 ? { text: 'ผิวเริ่มแห้งตึงเล็กน้อย', tone: 'mid' } : { text: 'ผิวแห้งขาดความชุ่มชื้น', tone: 'bad' }
  },
  cellTurnover: {
    label: 'ผลัดเซลล์ผิว/สมุนไพร',
    causes: 'เซลล์ผิวเก่าสะสม, ผิวหน้าตึง/หนา, ความหมองคล้ำ หรือไม่ได้ขัดพอกผิวมาสักระยะ',
    homeCare: 'ขัดผิวเบาๆ สัปดาห์ละครั้งด้วยสครับอ่อนโยน, หลีกเลี่ยงถูแรง, ทามอยส์ไจเซอร์หลังผลัดเซลล์เสมอ',
    getStatus: (s) => s >= 8 ? { text: 'เซลล์เก่าสะสมมาก พร้อมผลัดเซลล์', tone: 'good' } : s >= 6 ? { text: 'มีเซลล์เก่าพอประมาณ เริ่มผลัดเซลล์ได้', tone: 'mid' } : { text: 'เซลล์ยังใหม่ ยังไม่เร่งผลัดเซลล์', tone: 'bad' }
  },
  darkCircles: {
    label: 'รอยคล้ำรอบดวงตา',
    causes: 'นอนดึก, เครียด, ภูมิแพ้, หลอดเลือดใต้ตา หรือเมลานินสะสม',
    homeCare: 'นอนก่อน 4 ทุ่ม, ประคบเย็นรอบดวงตา, ทาอายครีมบำรุง, หลีกเลี่ยงการขยี้ตา',
    getStatus: (s) => s >= 8 ? { text: 'รอบดวงตาสว่างสดใส', tone: 'good' } : s >= 6 ? { text: 'มีรอยคล้ำเล็กน้อย', tone: 'mid' } : { text: 'รอยคล้ำชัดเจน ดูเหนื่อยล้า', tone: 'bad' }
  },
  acneScars: {
    label: 'หลุมสิว/ความขรุขระ',
    causes: 'การอักเสบรุนแรงจากสิวในอดีต, การบีบแกะสิว, หรือคอลลาเจนใต้ผิวถูกทำลาย',
    homeCare: 'ห้ามบีบสิว, ทาวิตามินซีช่วยกระตุ้นคอลลาเจน, ป้องกันแดดสม่ำเสมอ',
    getStatus: (s) => s >= 8 ? { text: 'ผิวเรียบเนียน แทบไม่มีหลุมสิว', tone: 'good' } : s >= 6 ? { text: 'มีหลุมสิวตื้น/ขรุขระเล็กน้อย', tone: 'mid' } : { text: 'มีหลุมสิวชัดเจน ผิวไม่เรียบ', tone: 'bad' }
  },
};

const getTurnoverStatusBadge = (status) => {
    switch (status) {
        case 'ready':
            return { text: 'พร้อมผลัดเซลล์ผิว', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        case 'peeling_now':
            return { text: 'กำลังผลัดเซลล์อยู่ (เน้นบำรุง)', tone: 'bg-amber-50 text-amber-700 border-amber-200' };
        case 'recovering':
            return { text: 'ผิวใหม่กำลังฟื้นฟู', tone: 'bg-blue-50 text-blue-700 border-blue-200' };
        case 'normal':
        default:
            return { text: 'ผิวสมดุลตามธรรมชาติ', tone: 'bg-teal-50 text-teal-700 border-teal-200' };
    }
};

// 🎨 ธีมการ์ดแชร์ผลเปรียบเทียบผิว (เลือกได้ในแท็บเทียบ B/A)
const SHARE_THEMES = [
  { key: 'purple', label: 'ม่วงโรแมนติก', bg: ['#4f46e5', '#a855f7', '#ec4899'], head: '#ffffff', headSub: 'rgba(255,255,255,0.85)', cardBg: 'rgba(255,255,255,0.96)', cardSub: '#475569', ok: '#059669', bad: '#e11d48', mid: '#475569', chipText: '#1f2937', chip2: '#fbcfe8', date: 'rgba(255,255,255,0.85)', line: 'rgba(255,255,255,0.35)' },
  { key: 'herbal', label: 'เขียวสมุนไพร', bg: ['#064e3b', '#10b981', '#a7f3d0'], head: '#ffffff', headSub: 'rgba(255,255,255,0.85)', cardBg: 'rgba(255,255,255,0.96)', cardSub: '#475569', ok: '#065f46', bad: '#b91c1c', mid: '#475569', chipText: '#1f2937', chip2: '#bbf7d0', date: 'rgba(255,255,255,0.9)', line: 'rgba(255,255,255,0.35)' },
  { key: 'lux', label: 'หรูหรา ดำ-ทอง', bg: ['#111827', '#1f2937', '#b8860b'], head: '#fbbf24', headSub: 'rgba(251,191,36,0.8)', cardBg: 'rgba(17,24,39,0.93)', cardSub: '#d1d5db', ok: '#34d399', bad: '#f87171', mid: '#d1d5db', chipText: '#111827', chip2: '#fde68a', date: 'rgba(251,191,36,0.8)', line: 'rgba(251,191,36,0.3)' },
  { key: 'pastel', label: 'พาสเทลหวาน', bg: ['#fdf2f8', '#fbcfe8', '#e9d5ff'], head: '#9d174d', headSub: 'rgba(157,23,77,0.65)', cardBg: '#ffffff', cardSub: '#6b7280', ok: '#059669', bad: '#e11d48', mid: '#6b7280', chipText: '#9d174d', chip2: '#f9a8d4', date: 'rgba(157,23,77,0.6)', line: 'rgba(157,23,77,0.2)' },
];

const RADAR_AXES = [
    { key: 'acne', label: 'สิว' },
    { key: 'wrinkles', label: 'ริ้วรอย' },
    { key: 'brightness', label: 'กระจ่างใส' },
    { key: 'pores', label: 'รูขุมขน' },
    { key: 'darkSpots', label: 'ฝ้า/จุดดำ' },
    { key: 'moisture', label: 'ชุ่มชื้น' },
    { key: 'darkCircles', label: 'รอยคล้ำตา' },
    { key: 'acneScars', label: 'หลุมสิว' },
];

const gaugeColor = (score) => {
    if (typeof score !== 'number') return '#94a3b8';
    if (score >= 9) return '#10b981';
    if (score >= 8) return '#14b8a6';
    if (score >= 7) return '#0d9488';
    if (score >= 5) return '#f59e0b';
    return '#f43f5e';
};

const fmtDate = (iso) => {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    } catch (e) { return '-'; }
};
const fmtTime = (iso) => {
    try {
        const d = new Date(iso);
        return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    } catch (e) { return ''; }
};
const fmtDateShort = (iso) => {
    try {
        const d = new Date(iso);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    } catch (e) { return '-'; }
};

// วงแหวนคะแนนเล็กๆ (ใช้ใน list / B-A)
function MiniRing({ score, size = 40, stroke = 3.5, fontSize = 12 }) {
    const r = (size - stroke * 2) / 2;
    const c = 2 * Math.PI * r;
    const pct = (typeof score === 'number') ? Math.min(Math.max(score, 0) / 10, 1) : 0;
    const color = gaugeColor(score);
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-black leading-none" style={{ color, fontSize }}>{typeof score === 'number' ? score : '-'}</span>
            </div>
        </div>
    );
}

function DeltaChip({ diff }) {
    const tone = diff > 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : diff < 0 ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-gray-400 bg-gray-50 border-gray-100';
    const Icon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Minus;
    const txt = diff > 0 ? `+${(Math.round(diff * 10) / 10)}` : `${(Math.round(diff * 10) / 10)}`;
    return (
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border text-[10px] font-black ${tone}`}>
            <Icon size={10} /> {txt}
        </span>
    );
}

export default function SkinProgressModal({ isOpen, onClose, phone, getAppCollection }) {
    const [tab, setTab] = useState('progress'); // 'progress' | 'compare'
    const [scans, setScans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [selA, setSelA] = useState(null); // index ก่อน (Before)
    const [selB, setSelB] = useState(null); // index หลัง (After)
    const [selectedScan, setSelectedScan] = useState(null);
    const [expandedMetric, setExpandedMetric] = useState(null);
    const [isBuildingShare, setIsBuildingShare] = useState(false);
    // 🎨 สไตล์การ์ดแชร์ — เลือกได้ + จำค่าไว้
    const [shareTheme, setShareTheme] = useState(() => { try { return localStorage.getItem('skin_share_theme') || 'purple'; } catch (e) { return 'purple'; } });
    const [shareLayout, setShareLayout] = useState(() => { try { return localStorage.getItem('skin_share_layout') || 'side'; } catch (e) { return 'side'; } });
    const setShareStyle = (t, l) => {
        if (t) { setShareTheme(t); try { localStorage.setItem('skin_share_theme', t); } catch (e) {} }
        if (l) { setShareLayout(l); try { localStorage.setItem('skin_share_layout', l); } catch (e) {} }
    };
    const qrWrapRef = useRef(null);

    // โหลดประวัติสแกนจาก Firestore (live)
    useEffect(() => {
        if (!isOpen || !phone || !getAppCollection) return;
        setIsLoading(true);
        setLoadError(false);
        const q = query(getAppCollection('skinScans'), where('phone', '==', phone));
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(s => s.scores && typeof s.scores.overall === 'number')
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setScans(list);
            setIsLoading(false);
        }, (err) => {
            console.error('SkinProgress load error:', err);
            setLoadError(true);
            setIsLoading(false);
        });
        return () => unsub();
    }, [isOpen, phone, getAppCollection]);

    // default selection: ครั้งแรก vs ครั้งล่าสุด
    useEffect(() => {
        if (scans.length >= 2) {
            setSelA(0);
            setSelB(scans.length - 1);
        } else {
            setSelA(null);
            setSelB(null);
        }
    }, [scans.length]);

    if (!isOpen) return null;

    // 📤 สร้างภาพการ์ดแชร์ผลเปรียบเทียบผิว (canvas) → แชร์เข้า LINE/โซเชียล ชวนคนมาใช้แอป
    const loadImg = (src) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
    const roundRect = (ctx, x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    };
    const drawPhotoCircle = (ctx, img, cx, cy, r) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        if (img) {
            const s = Math.max((r * 2) / img.width, (r * 2) / img.height);
            ctx.drawImage(img, cx - (img.width * s) / 2, cy - (img.height * s) / 2, img.width * s, img.height * s);
        } else {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
            ctx.fillStyle = '#94a3b8';
            ctx.font = `bold ${Math.round(r * 0.8)}px Prompt, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('📷', cx, cy);
        }
        ctx.restore();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.lineWidth = 10; ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    };
    const buildCompareShareImage = async (scanA, scanB, themeKey, layout) => {
        const T = SHARE_THEMES.find(t => t.key === themeKey) || SHARE_THEMES[0];
        const stacked = layout === 'stack';
        setIsBuildingShare(true);
        try {
            await document.fonts.ready;
            const W = 1080;

            // ---------- เตรียมข้อมูล ----------
            const hasAge = typeof scanA.estimatedSkinAge === 'number' && typeof scanB.estimatedSkinAge === 'number';
            const before = Number(scanA.scores?.overall ?? 0), after = Number(scanB.scores?.overall ?? 0);
            const d = Math.round((after - before) * 10) / 10;
            const dCol = d > 0 ? T.ok : (d < 0 ? T.bad : T.mid);
            const improvedAll = Object.entries(METRIC_LABELS)
                .filter(([k]) => k !== 'overall' && k !== 'cellTurnover')
                .map(([k, label]) => ({ label, a: scanA.scores?.[k], b: scanB.scores?.[k] }))
                .filter(m => typeof m.a === 'number' && typeof m.b === 'number' && m.b > m.a)
                .sort((x, z) => (z.b - z.a) - (x.b - x.a));
            const days = Math.max(0, Math.round((new Date(scanB.createdAt) - new Date(scanA.createdAt)) / 86400000));
            const ageText = hasAge ? `🎂 อายุผิว ${scanA.estimatedSkinAge} → ${scanB.estimatedSkinAge} ปี${scanB.estimatedSkinAge < scanA.estimatedSkinAge ? ' 🎉' : ''}` : '';
            const durText = days > 0 ? `⏱ ช่วงการดูแล ${days} วัน` : '';

            // ---------- เรดาร์ 8 ด้าน (วาดเองบน canvas) ----------
            const drawRadar = (cx, cy, r) => {
                const n = RADAR_AXES.length;
                const ang = i => (Math.PI * 2 * i) / n - Math.PI / 2;
                // วงแหวนกริด
                ctx.strokeStyle = T.line; ctx.lineWidth = 1.5;
                [2, 4, 6, 8, 10].forEach(v => {
                    ctx.beginPath();
                    for (let i = 0; i <= n; i++) {
                        const rr = (v / 10) * r, a = ang(i % n);
                        const x = cx + Math.cos(a) * rr, yy = cy + Math.sin(a) * rr;
                        i === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
                    }
                    ctx.stroke();
                });
                // เส้นแกน
                for (let i = 0; i < n; i++) {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r);
                    ctx.stroke();
                }
                // รูปหลายเหลี่ยม: ก่อน (เส้นประ) / หลัง (เต็ม)
                const poly = (scan, stroke, fill, dash) => {
                    ctx.beginPath();
                    for (let i = 0; i <= n; i++) {
                        const v = Number(scan.scores?.[RADAR_AXES[i % n].key] ?? 0);
                        const rr = Math.min(Math.max(v, 0), 10) / 10 * r, a = ang(i % n);
                        const x = cx + Math.cos(a) * rr, yy = cy + Math.sin(a) * rr;
                        i === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
                    }
                    if (fill) { ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = fill; ctx.fill(); ctx.restore(); }
                    ctx.setLineDash(dash || []);
                    ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke();
                    ctx.setLineDash([]);
                };
                poly(scanA, T.headSub, null, [8, 6]);
                poly(scanB, T.ok, T.ok, null);
                // ป้ายชื่อแกน
                ctx.fillStyle = T.date;
                ctx.font = 'bold 22px Prompt, sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                RADAR_AXES.forEach((ax, i) => {
                    ctx.fillText(ax.label, cx + Math.cos(ang(i)) * (r + 40), cy + Math.sin(ang(i)) * (r + 40));
                });
            };

            // ---------- แท่งกราฟเปรียบเทียบรายด้าน ----------
            const drawMetricBars = (items, y0, rowH) => {
                items.forEach((m, i) => {
                    const y = y0 + i * rowH;
                    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                    ctx.fillStyle = T.head;
                    ctx.font = 'bold 26px Prompt, sans-serif';
                    ctx.fillText(m.label, 140, y);
                    // แท่ง "ก่อน" (บน) + "หลัง" (ล่าง)
                    const tx = 480, tw = 340;
                    const bar = (val, yy, h, col) => {
                        ctx.fillStyle = col;
                        roundRect(ctx, tx, yy - h / 2, Math.max(4, Math.min(val, 10) / 10 * tw), h, h / 2);
                        ctx.fill();
                    };
                    bar(m.a, y - 12, 12, T.headSub);
                    bar(m.b, y + 6, 14, T.ok);
                    // ตัวเลข
                    ctx.textAlign = 'left';
                    ctx.fillStyle = T.headSub;
                    ctx.font = 'bold 22px Prompt, sans-serif';
                    ctx.fillText(`${m.a}`, tx + tw + 18, y - 12);
                    ctx.fillStyle = dCol;
                    ctx.font = 'bold 26px Prompt, sans-serif';
                    ctx.fillText(`→ ${m.b}`, tx + tw + 62, y + 6);
                });
                ctx.textAlign = 'center';
            };

            // ---------- คำนวณเลย์เอาต์ไดนามิก ----------
            let H, topBlockH, radarR, legendY, statsY0, rowH, dividerY, qrY, qrSize, footY, improved;
            if (!stacked) {
                improved = improvedAll.slice(0, 4);
                topBlockH = 1020;            // จบท้ายการ์ด delta
                radarR = 150;
                // 🌟 legend/สถิติต้องอยู่ "ใต้" ป้ายแกนเรดาร์ (รัศมี + ระยะป้าย 40 + ความสูงป้าย ~30 + ช่องว่าง)
                legendY = topBlockH + 60 + radarR + radarR + 40 + 30 + 26;  // = radarCy + r + 96
                statsY0 = legendY + 58;
                rowH = 58;
                const statsH = (ageText ? 58 : 0) + (durText ? 52 : 0) + improved.length * rowH;
                dividerY = statsY0 + statsH + 22;
                qrY = dividerY + 34; qrSize = 200;
                footY = qrY + qrSize + 46;
                H = Math.max(1620, footY + 46);
            } else {
                improved = improvedAll.slice(0, 3);
                topBlockH = 1385;            // จบวันที่ของรูปหลัง
                radarR = 128;
                legendY = topBlockH + 52 + radarR + radarR + 40 + 30 + 24;  // = radarCy + r + 94
                statsY0 = legendY + 54;
                rowH = 54;
                const statsH = (ageText ? 54 : 0) + (durText ? 50 : 0) + improved.length * rowH;
                dividerY = statsY0 + statsH + 20;
                qrY = dividerY + 30; qrSize = 186;
                footY = qrY + qrSize + 44;
                H = footY + 52;
            }

            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');

            // ---------- พื้นหลัง ----------
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, T.bg[0]); grad.addColorStop(0.5, T.bg[1]); grad.addColorStop(1, T.bg[2]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            [[950, 120, 220], [80, H - 160, 260], [1010, H - 90, 160]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });

            // ---------- หัวการ์ด ----------
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = T.headSub;
            ctx.font = 'bold 30px Prompt, sans-serif';
            ctx.fillText('✨ IRIS CLINIC · AI SKIN ANALYSIS', W / 2, 92);
            ctx.fillStyle = T.head;
            ctx.font = 'bold 56px Prompt, sans-serif';
            ctx.fillText('ผลการดูแลผิว ก่อน–หลัง', W / 2, 160);

            const [imgA, imgB] = await Promise.all([
                (scanA.thumb || scanA.image) ? loadImg(scanA.thumb || scanA.image) : Promise.resolve(null),
                (scanB.thumb || scanB.image) ? loadImg(scanB.thumb || scanB.image) : Promise.resolve(null),
            ]);
            const pill = (cx, cy, text, bg) => {
                ctx.font = 'bold 34px Prompt, sans-serif';
                const w = ctx.measureText(text).width + 56;
                roundRect(ctx, cx - w / 2, cy - 30, w, 60, 30);
                ctx.fillStyle = bg; ctx.fill();
                ctx.fillStyle = T.chipText;
                ctx.fillText(text, cx, cy);
            };

            // ---------- ส่วนบน ----------
            if (!stacked) {
                drawPhotoCircle(ctx, imgA, 285, 430, 205);
                drawPhotoCircle(ctx, imgB, 795, 430, 205);
                pill(285, 703, 'ก่อน', '#ffffff');
                pill(795, 703, 'หลัง', T.chip2);
                ctx.fillStyle = T.date;
                ctx.font = 'bold 28px Prompt, sans-serif';
                ctx.fillText(fmtDate(scanA.createdAt), 285, 762);
                ctx.fillText(fmtDate(scanB.createdAt), 795, 762);

                roundRect(ctx, 110, 820, W - 220, 200, 36);
                ctx.fillStyle = T.cardBg; ctx.fill();
                ctx.fillStyle = dCol;
                ctx.font = 'bold 80px Prompt, sans-serif';
                ctx.fillText(`${d > 0 ? '+' : ''}${d} คะแนน`, W / 2, 886);
                ctx.fillStyle = T.cardSub;
                ctx.font = 'bold 34px Prompt, sans-serif';
                ctx.fillText(`คะแนนรวม ${before} → ${after} / 10`, W / 2, 948);
                ctx.fillStyle = dCol;
                ctx.font = 'bold 30px Prompt, sans-serif';
                ctx.fillText(d > 0 ? 'ผิวดีขึ้นจากการดูแลกับ Iris Clinic ✨' : (d < 0 ? 'ผิวเปลี่ยนแปลง — สแกนติดตามต่อไป' : 'คงระดับการดูแลไว้ได้ดี'), W / 2, 994);
            } else {
                pill(W / 2, 275, 'ก่อน', '#ffffff');
                drawPhotoCircle(ctx, imgA, W / 2, 480, 190);
                ctx.fillStyle = T.date; ctx.font = 'bold 28px Prompt, sans-serif';
                ctx.fillText(fmtDate(scanA.createdAt), W / 2, 710);
                ctx.fillStyle = T.head;
                ctx.beginPath();
                ctx.moveTo(W / 2 - 34, 750); ctx.lineTo(W / 2 + 34, 750); ctx.lineTo(W / 2, 812); ctx.closePath(); ctx.fill();
                ctx.font = 'bold 44px Prompt, sans-serif';
                ctx.fillStyle = dCol;
                ctx.fillText(`${d > 0 ? '+' : ''}${d} คะแนน (${before} → ${after})`, W / 2, 878);
                pill(W / 2, 950, 'หลัง', T.chip2);
                drawPhotoCircle(ctx, imgB, W / 2, 1155, 190);
                ctx.fillStyle = T.date; ctx.font = 'bold 28px Prompt, sans-serif';
                ctx.fillText(fmtDate(scanB.createdAt), W / 2, 1385);
            }

            // ---------- เรดาร์เปรียบเทียบ ----------
            const radarCy = topBlockH + 60 + radarR;
            drawRadar(W / 2, radarCy, radarR);
            ctx.fillStyle = T.date;
            ctx.font = 'bold 26px Prompt, sans-serif';
            ctx.fillText(`- - ก่อน   ●● หลัง`, W / 2, legendY);

            // ---------- สถิติ ----------
            let y = statsY0;
            if (ageText) { ctx.fillStyle = T.chip2; ctx.font = 'bold 38px Prompt, sans-serif'; ctx.fillText(ageText, W / 2, y); y += stacked ? 54 : 58; }
            if (durText) { ctx.fillStyle = T.headSub; ctx.font = 'bold 34px Prompt, sans-serif'; ctx.fillText(durText, W / 2, y); y += stacked ? 50 : 52; }
            if (improved.length > 0) {
                ctx.fillStyle = T.head;
                ctx.font = 'bold 30px Prompt, sans-serif';
                ctx.fillText('📈 ด้านที่ดีขึ้นชัดเจน', W / 2, y - 8);
                drawMetricBars(improved, y + 34, rowH);
                y += 34 + improved.length * rowH;
            }

            // ---------- ท้ายการ์ด ----------
            ctx.strokeStyle = T.line; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(140, dividerY); ctx.lineTo(W - 140, dividerY); ctx.stroke();
            const qrCanvas = qrWrapRef.current?.querySelector('canvas');
            if (qrCanvas) {
                ctx.fillStyle = '#ffffff';
                roundRect(ctx, W / 2 - qrSize / 2 - 9, qrY - 9, qrSize + 18, qrSize + 18, 24); ctx.fill();
                ctx.drawImage(qrCanvas, W / 2 - qrSize / 2, qrY, qrSize, qrSize);
            }
            ctx.fillStyle = T.head;
            ctx.font = `bold ${stacked ? 40 : 42}px Prompt, sans-serif`;
            ctx.fillText('สแกนผิวหน้าฟรีด้วย AI 📸', W / 2, footY);

            canvas.toBlob((blob) => {
                if (!blob) { setIsBuildingShare(false); return; }
                const file = new File([blob], 'iris-skin-before-after.png', { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: 'ผลการดูแลผิวก่อน-หลังจาก Iris Clinic',
                        text: `ผิวฉันดีขึ้น ${d > 0 ? d + ' คะแนน' : 'ต่อเนื่อง'} กับ Iris Clinic ✨ สแกนผิวฟรีด้วย AI ได้เลย!`,
                    }).catch(() => {}).finally(() => setIsBuildingShare(false));
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'iris-skin-before-after.png'; a.click();
                    URL.revokeObjectURL(url);
                    setIsBuildingShare(false);
                }
            }, 'image/png');
        } catch (e) {
            console.error('build share image error', e);
            setIsBuildingShare(false);
        }
    };

    const latest = scans.length ? scans[scans.length - 1] : null;
    const overallTrend = (scans.length >= 2 && typeof scans[0].scores.overall === 'number' && typeof latest.scores.overall === 'number')
        ? latest.scores.overall - scans[0].scores.overall : null;
    const ageTrend = (scans.length >= 2 && typeof scans[0].estimatedSkinAge === 'number' && typeof latest.estimatedSkinAge === 'number')
        ? latest.estimatedSkinAge - scans[0].estimatedSkinAge : null;

    const A = (selA != null && scans[selA]) ? scans[selA] : null;
    const B = (selB != null && scans[selB]) ? scans[selB] : null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[115] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in">
            <div className="bg-slate-50 w-full sm:max-w-md h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 shrink-0 relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex justify-between items-center text-white">
                        <div>
                            <h2 className="text-base font-black flex items-center"><History size={18} className="mr-2" /> ประวัติ & ความคืบหน้าผิว</h2>
                            <p className="text-[10px] font-bold opacity-90 mt-0.5">ติดตามผลสแกน · เทียบก่อน-หลัง เหมือน Skincare Pro</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-3 bg-black/20 p-1 rounded-xl flex space-x-1 backdrop-blur-sm relative z-10">
                        <button onClick={() => setTab('progress')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${tab === 'progress' ? 'bg-white text-indigo-700 shadow-md' : 'text-white/80 hover:text-white'}`}>
                            <TrendingUp size={14} className={tab === 'progress' ? 'text-indigo-600' : ''} />
                            <span>ความคืบหน้า</span>
                        </button>
                        <button onClick={() => setTab('compare')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 ${tab === 'compare' ? 'bg-white text-pink-700 shadow-md' : 'text-white/80 hover:text-white'}`}>
                            <ArrowLeftRight size={14} className={tab === 'compare' ? 'text-pink-600' : ''} />
                            <span>เทียบ Before/After</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">

                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
                            <Loader2 size={32} className="animate-spin text-indigo-400 mb-3" />
                            <p className="text-xs font-bold">กำลังโหลดประวัติการสแกน...</p>
                        </div>
                    ) : loadError ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400 px-8 text-center">
                            <Frown size={32} className="text-rose-300 mb-3" />
                            <p className="text-xs font-bold text-gray-500">โหลดประวัติไม่สำเร็จ</p>
                            <p className="text-[10px] text-gray-400 mt-1">กรุณาปิดแล้วเปิดใหม่อีกครั้ง</p>
                        </div>
                    ) : scans.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative">
                                <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20"></div>
                                <Camera size={34} className="text-indigo-400 relative z-10" />
                            </div>
                            <h3 className="text-base font-black text-gray-700 mb-1">ยังไม่มีประวัติการสแกน</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                สแกนผิวครั้งแรกเลย! ทุกครั้งที่วิเคราะห์ผิวผ่าน AI ระบบจะบันทึกผลอัตโนมัติ
                                เพื่อติดตามความคืบหน้าและเทียบก่อน-หลังการรักษาได้ 📸
                            </p>
                        </div>
                    ) : tab === 'progress' ? (
                        <>
                            {/* สรุปล่าสุด */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold opacity-90 block">คะแนนสุขภาพผิวล่าสุด</span>
                                    <span className="text-[9px] opacity-75">{fmtDate(latest.createdAt)} · สแกนแล้ว {scans.length} ครั้ง</span>
                                    {typeof latest.estimatedSkinAge === 'number' && (
                                        <span className="text-[9px] opacity-75 block">อายุผิวประเมิน {latest.estimatedSkinAge} ปี</span>
                                    )}
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-3xl font-black">{latest.scores.overall}<span className="text-xs font-normal opacity-80">/10</span></span>
                                    {overallTrend != null && (
                                        <span className="text-[10px] font-bold mt-0.5 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                                            {overallTrend > 0 ? <><ArrowUp size={10} /> ดีขึ้น {overallTrend} คะแนน</> :
                                                overallTrend < 0 ? <><ArrowDown size={10} /> ลด {Math.abs(overallTrend)} คะแนน</> :
                                                    <><Minus size={10} /> คงที่</>}
                                            <span className="opacity-75">ตั้งแต่ครั้งแรก</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 📈 กราฟเส้นความคืบหน้า (SVG ล้วน) */}
                            {(() => {
                                const W = 340, H = 160, padL = 26, padR = 14, padT = 16, padB = 26;
                                const innerW = W - padL - padR, innerH = H - padT - padB;
                                const n = scans.length;
                                const xs = scans.map((_, i) => (n === 1 ? padL + innerW / 2 : padL + innerW * (i / (n - 1))));
                                const ys = scans.map(s => padT + innerH * (1 - (s.scores.overall / 10)));
                                const linePts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
                                const areaPath = `M ${xs[0]},${padT + innerH} L ${xs.map((x, i) => `${x},${ys[i]}`).join(' L ')} L ${xs[n - 1]},${padT + innerH} Z`;
                                // แนวโน้มอายุผิว (เส้นประ จางๆ)
                                const agePts = scans.map((s, i) => typeof s.estimatedSkinAge === 'number' ? `${xs[i]},${padT + innerH * (1 - Math.min(s.estimatedSkinAge, 60) / 60)}` : null).filter(Boolean);
                                return (
                                    <div className="bg-white border border-indigo-100 rounded-2xl p-3 shadow-sm">
                                        <h4 className="text-xs font-black text-gray-700 mb-2 flex items-center">
                                            <TrendingUp size={14} className="mr-1.5 text-indigo-500" /> กราฟคะแนนสุขภาพผิวโดยรวม
                                        </h4>
                                        <div className="flex justify-center overflow-hidden">
                                            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full">
                                                <defs>
                                                    <linearGradient id="progGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                                                    </linearGradient>
                                                </defs>
                                                {/* grid lines 2/4/6/8/10 */}
                                                {[2, 4, 6, 8, 10].map(v => {
                                                    const y = padT + innerH * (1 - v / 10);
                                                    return (
                                                        <g key={v}>
                                                            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={v === 10 ? '0' : '3,3'} />
                                                            <text x={padL - 5} y={y} textAnchor="end" dominantBaseline="middle" className="fill-gray-400" style={{ fontSize: '8px', fontWeight: 700 }}>{v}</text>
                                                        </g>
                                                    );
                                                })}
                                                {/* area + line */}
                                                <path d={areaPath} fill="url(#progGrad)" />
                                                <polyline points={linePts} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                                                {/* เส้นประอายุผิว (สเกล 0-60 ปี) */}
                                                {agePts.length >= 2 && <polyline points={agePts.join(' ')} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />}
                                                {/* points + labels */}
                                                {scans.map((s, i) => (
                                                    <g key={s.id || i}>
                                                        <circle cx={xs[i]} cy={ys[i]} r={n > 12 ? 2.5 : 4} fill="#fff" stroke={gaugeColor(s.scores.overall)} strokeWidth="2.5" />
                                                        {(n <= 8 || i === n - 1) && (
                                                            <text x={xs[i]} y={ys[i] - 8} textAnchor="middle" className="fill-indigo-600" style={{ fontSize: '8px', fontWeight: 800 }}>{s.scores.overall}</text>
                                                        )}
                                                        {(n <= 8 || i === n - 1 || i === 0) && (
                                                            <text x={xs[i]} y={H - 8} textAnchor="middle" className="fill-gray-400" style={{ fontSize: '7.5px', fontWeight: 700 }}>{fmtDateShort(s.createdAt)}</text>
                                                        )}
                                                    </g>
                                                ))}
                                            </svg>
                                        </div>
                                        <div className="flex items-center justify-center gap-4 mt-1">
                                            <span className="text-[9px] text-gray-500 font-bold flex items-center"><span className="w-3 h-0.5 bg-indigo-500 rounded inline-block mr-1"></span> คะแนนผิว</span>
                                            <span className="text-[9px] text-gray-500 font-bold flex items-center"><span className="w-3 h-0.5 bg-amber-400 rounded inline-block mr-1" style={{ borderTop: '1.5px dashed #f59e0b', height: 0 }}></span> อายุผิว (ปี)</span>
                                        </div>
                                        {ageTrend != null && (
                                            <p className="text-[9px] text-center text-amber-600 font-bold mt-1">
                                                อายุผิว: {scans[0].estimatedSkinAge} → {latest.estimatedSkinAge} ปี {ageTrend < 0 ? `(อ่อนเยาว์ลง ${Math.abs(ageTrend)} ปี 🎉)` : ageTrend > 0 ? `(สูงขึ้น ${ageTrend} ปี)` : '(คงที่)'}
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* รายการสแกนทั้งหมด */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center">
                                        <CalendarDays size={14} className="mr-1.5 text-indigo-500" /> ประวัติการสแกน ({scans.length})
                                    </h4>
                                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                        แตะเพื่อดูรายละเอียด
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {[...scans].reverse().map((s, ri) => {
                                        const idx = scans.length - 1 - ri;
                                        const prev = idx > 0 ? scans[idx - 1] : null;
                                        const diff = prev ? s.scores.overall - prev.scores.overall : null;
                                        return (
                                            <button
                                                key={s.id || idx}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedScan(s);
                                                    setExpandedMetric(null);
                                                }}
                                                className="w-full bg-white border border-gray-100 hover:border-indigo-300 hover:shadow-md rounded-2xl p-2.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-all text-left group cursor-pointer"
                                            >
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                                                    {(s.thumb || s.image) ? (
                                                        <img src={(s.thumb || s.image)} alt="scan" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Camera size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[11px] font-black text-gray-800">{fmtDate(s.createdAt)}</span>
                                                        {diff != null && <DeltaChip diff={diff} />}
                                                        {idx === scans.length - 1 && (
                                                            <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md border border-indigo-100">ล่าสุด</span>
                                                        )}
                                                    </div>
                                                    {(s.estimatedSkinAge || s.raw?.estimatedSkinAge) && (
                                                        <span className="text-[9px] text-gray-400 font-bold block">
                                                            อายุผิว ~{s.estimatedSkinAge || s.raw?.estimatedSkinAge} ปี
                                                        </span>
                                                    )}
                                                    <p className="text-[10px] text-gray-500 leading-snug line-clamp-2 mt-0.5">
                                                        {s.summary || s.raw?.summary || 'คะแนนสแกนผิวด้วย AI'}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 flex items-center gap-1.5">
                                                    <MiniRing score={s.scores.overall} />
                                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ================= TAB: COMPARE ================= */
                        scans.length < 2 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center">
                                <Meh size={34} className="text-amber-300 mb-3" />
                                <h3 className="text-sm font-black text-gray-700 mb-1">ต้องมีผลสแกนอย่างน้อย 2 ครั้ง</h3>
                                <p className="text-xs text-gray-500">สแกนอีกครั้งหลังทำทรีตเมนต์/ดูแลผิว แล้วกลับมาเทียบก่อน-หลังที่นี่ค่ะ</p>
                            </div>
                        ) : (
                            <>
                                {/* เลือก 2 จุดเวลา */}
                                <div className="bg-white border border-pink-100 rounded-2xl p-3 shadow-sm space-y-2.5">
                                    <p className="text-[10px] text-gray-500 font-bold flex items-center"><ArrowLeftRight size={12} className="mr-1 text-pink-500" /> เลือก 2 ผลสแกนที่ต้องการเทียบ</p>
                                    {[
                                        { label: 'ก่อน (Before)', sel: selA, set: setSelA, tone: 'gray' },
                                        { label: 'หลัง (After)', sel: selB, set: setSelB, tone: 'pink' },
                                    ].map(({ label, sel, set, tone }) => (
                                        <div key={label}>
                                            <span className={`text-[9px] font-black ${tone === 'pink' ? 'text-pink-600' : 'text-gray-500'}`}>{label}</span>
                                            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 mt-1">
                                                {scans.map((s, i) => (
                                                    <button key={s.id || i} onClick={() => set(i)}
                                                        className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${sel === i
                                                            ? (tone === 'pink' ? 'bg-pink-500 text-white border-pink-500 shadow shadow-pink-200' : 'bg-gray-800 text-white border-gray-800 shadow')
                                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                                                        {fmtDate(s.createdAt)} · {s.scores.overall}/10
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {A && B && (() => {
                                    const dOverall = (B.scores.overall ?? 0) - (A.scores.overall ?? 0);
                                    const dAge = (typeof B.estimatedSkinAge === 'number' && typeof A.estimatedSkinAge === 'number') ? B.estimatedSkinAge - A.estimatedSkinAge : null;
                                    return (
                                        <>
                                            {/* ภาพเทียบข้างกัน */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {[{ s: A, tag: 'ก่อน', cls: 'bg-gray-800 border-gray-700' }, { s: B, tag: 'หลัง', cls: 'bg-pink-500 border-pink-400' }].map(({ s, tag, cls }) => (
                                                    <div key={tag} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                                        <div className={`relative aspect-square bg-gray-100`}>
                                                            {(s.thumb || s.image) ? <img src={(s.thumb || s.image)} alt={tag} className="w-full h-full object-cover" />
                                                                : <div className="w-full h-full flex items-center justify-center text-gray-300"><Camera size={24} /></div>}
                                                            <span className={`absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-lg ${cls}`}>{tag}</span>
                                                        </div>
                                                        <div className="p-2 flex items-center justify-between gap-1">
                                                            <div className="min-w-0">
                                                                <p className="text-[9px] font-black text-gray-700 truncate">{fmtDate(s.createdAt)}</p>
                                                                {typeof s.estimatedSkinAge === 'number' && <p className="text-[8px] text-gray-400 font-bold">อายุผิว ~{s.estimatedSkinAge} ปี</p>}
                                                            </div>
                                                            <MiniRing score={s.scores.overall} size={34} stroke={3} fontSize={11} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* สรุปผลต่าง */}
                                            <div className={`p-3.5 rounded-2xl shadow-sm border text-center ${dOverall > 0 ? 'bg-emerald-50 border-emerald-200' : dOverall < 0 ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200'}`}>
                                                <p className="text-xs font-black flex items-center justify-center gap-1.5 text-gray-700">
                                                    <Sparkles size={14} className="text-purple-500" /> ผลลัพธ์การเปลี่ยนแปลง
                                                </p>
                                                <p className={`text-2xl font-black mt-1 ${dOverall > 0 ? 'text-emerald-600' : dOverall < 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                                                    {dOverall > 0 ? `+${Math.round(dOverall * 10) / 10}` : `${Math.round(dOverall * 10) / 10}`} คะแนน
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-600">
                                                    {dOverall > 0 ? 'ผิวดีขึ้น! ดูแลได้ดีมากค่ะ 🎉' : dOverall < 0 ? 'ผิวเปลี่ยนแปลงเล็กน้อย ควรดูแลเพิ่ม' : 'คงที่ — ยังรักษาระดับเดิมได้อยู่ค่ะ'}
                                                </p>
                                                {dAge != null && (
                                                    <p className="text-[10px] font-bold text-amber-600 mt-1 bg-white/70 inline-block px-2 py-0.5 rounded-full border border-amber-100">
                                                        อายุผิว {A.estimatedSkinAge} → {B.estimatedSkinAge} ปี {dAge < 0 ? `(อ่อนเยาว์ลง 🎉)` : dAge > 0 ? `(สูงขึ้น ${dAge} ปี)` : '(คงที่)'}
                                                    </p>
                                                )}
                                            </div>

                                            {/* เทียบรายด้าน */}
                                            <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                                                <h4 className="text-xs font-black text-gray-700 mb-2">เปรียบเทียบรายด้าน (ก่อน → หลัง)</h4>
                                                <div className="space-y-1.5">
                                                    {Object.keys(METRIC_LABELS).map(k => {
                                                        const a = A.scores?.[k], b = B.scores?.[k];
                                                        if (typeof a !== 'number' && typeof b !== 'number') return null;
                                                        const diff = (typeof b === 'number' ? b : 0) - (typeof a === 'number' ? a : 0);
                                                        return (
                                                            <div key={k} className="flex items-center justify-between bg-gray-50 rounded-xl px-2.5 py-1.5">
                                                                <span className="text-[10px] font-bold text-gray-600 flex-1 min-w-0 truncate">{METRIC_LABELS[k]}</span>
                                                                <span className="text-[10px] font-black text-gray-400 tabular-nums">{a ?? '-'} → {b ?? '-'}</span>
                                                                <span className="ml-2"><DeltaChip diff={diff} /></span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-[8.5px] text-gray-400 font-medium mt-2">* ด้าน "พร้อมผลัดเซลล์" คะแนนสูง = เซลล์เก่าสะสมมาก ผิวพร้อมผลัดเซลล์ด้วยสมุนไพร</p>
                                            </div>

                                            {/* เรดาร์ 2 ชั้น */}
                                            {(() => {
                                                const size = 250;
                                                const cx = size / 2, cy = size / 2, radius = 82;
                                                const n = RADAR_AXES.length;
                                                const angles = RADAR_AXES.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);
                                                const polyFor = (scan) => RADAR_AXES.map((ax, i) => {
                                                    const val = scan.scores?.[ax.key];
                                                    const r = (typeof val === 'number' ? val / 10 : 0) * radius;
                                                    return [cx + Math.cos(angles[i]) * r, cy + Math.sin(angles[i]) * r];
                                                });
                                                const ptsA = polyFor(A), ptsB = polyFor(B);
                                                const rings = [2, 4, 6, 8, 10];
                                                const axisEnds = angles.map(a => [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
                                                const labelPos = angles.map(a => [cx + Math.cos(a) * (radius + 17), cy + Math.sin(a) * (radius + 17)]);
                                                return (
                                                    <div className="bg-white border border-teal-100 rounded-2xl p-3 shadow-sm">
                                                        <h4 className="text-xs font-black text-gray-700 mb-1.5 flex items-center justify-center">
                                                            <TrendingUp size={14} className="mr-1.5 text-teal-600" /> เรดาร์เปรียบเทียบ ก่อน-หลัง
                                                        </h4>
                                                        <div className="flex justify-center">
                                                            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
                                                                <defs>
                                                                    <linearGradient id="baGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                                                                        <stop offset="100%" stopColor="#db2777" stopOpacity="0.15" />
                                                                    </linearGradient>
                                                                </defs>
                                                                {rings.map(r => {
                                                                    const rr = (r / 10) * radius;
                                                                    const pts = angles.map(a => `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`).join(' ');
                                                                    return <polygon key={r} points={pts} fill={r === 10 ? '#f8fafc' : 'none'} stroke="#e2e8f0" strokeWidth="1" />;
                                                                })}
                                                                {axisEnds.map((end, i) => (
                                                                    <line key={i} x1={cx} y1={cy} x2={end[0]} y2={end[1]} stroke="#e2e8f0" strokeWidth="1" />
                                                                ))}
                                                                {/* Before — เทา ๆ เส้นประ */}
                                                                <polygon points={ptsA.map(p => p.join(',')).join(' ')} fill="rgba(100,116,139,0.10)" stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="4,3" strokeLinejoin="round" />
                                                                {/* After — ชมพู */}
                                                                <polygon points={ptsB.map(p => p.join(',')).join(' ')} fill="url(#baGrad)" stroke="#db2777" strokeWidth="2.2" strokeLinejoin="round" />
                                                                {ptsB.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#db2777" stroke="#fff" strokeWidth="1.2" />)}
                                                                {labelPos.map((pos, i) => (
                                                                    <text key={i} x={pos[0]} y={pos[1]} textAnchor="middle" dominantBaseline="middle" className="fill-gray-600" style={{ fontSize: '8.5px', fontWeight: 700 }}>
                                                                        {RADAR_AXES[i].label}
                                                                    </text>
                                                                ))}
                                                            </svg>
                                                        </div>
                                                        <div className="flex items-center justify-center gap-4 mt-1">
                                                            <span className="text-[9px] text-gray-500 font-bold flex items-center"><span className="w-3 border-t-2 border-dashed border-gray-400 inline-block mr-1"></span> ก่อน ({A.scores.overall})</span>
                                                            <span className="text-[9px] text-gray-500 font-bold flex items-center"><span className="w-3 h-1.5 bg-pink-600 rounded inline-block mr-1"></span> หลัง ({B.scores.overall})</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* สรุป 2 ผล */}
                                            <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm space-y-2">
                                                <div>
                                                    <span className="text-[9px] font-black text-gray-400">สรุปช่วงก่อน ({fmtDate(A.createdAt)})</span>
                                                    <p className="text-[10px] text-gray-600 leading-snug">{A.summary || '-'}</p>
                                                </div>
                                                <div className="border-t border-gray-100 pt-2">
                                                    <span className="text-[9px] font-black text-pink-500">สรุปช่วงหลัง ({fmtDate(B.createdAt)})</span>
                                                    <p className="text-[10px] text-gray-600 leading-snug">{B.summary || '-'}</p>
                                                </div>
                                            </div>

                                            {/* 🎨 เลือกสไตล์การ์ดแชร์ — ธีมสี 4 แบบ + เลย์เอาต์ 2 แบบ (จำค่าที่เลือกไว้) */}
                                            <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">🎨 เลือกสไตล์การ์ดแชร์</p>
                                                <div className="grid grid-cols-4 gap-1.5 mb-2">
                                                    {SHARE_THEMES.map(t => (
                                                        <button key={t.key} onClick={() => setShareStyle(t.key, null)}
                                                            className={`rounded-xl p-1.5 border-2 transition-all ${shareTheme === t.key ? 'border-teal-500 ring-2 ring-teal-200 scale-105' : 'border-gray-100'}`}>
                                                            <div className="h-8 rounded-lg mb-1 shadow-inner" style={{ background: `linear-gradient(135deg, ${t.bg[0]}, ${t.bg[1]}, ${t.bg[2]})` }}></div>
                                                            <p className={`text-[7.5px] font-black leading-tight ${shareTheme === t.key ? 'text-teal-600' : 'text-gray-500'}`}>{t.label}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex gap-1.5">
                                                    {[{ k: 'side', l: '🖼️ แนวนอน' }, { k: 'stack', l: '📱 แนวตั้ง (สตอรี่)' }].map(o => (
                                                        <button key={o.k} onClick={() => setShareStyle(null, o.k)}
                                                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black border transition-all ${shareLayout === o.k ? 'bg-teal-500 text-white border-teal-500 shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                            {o.l}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 📤 ปุ่มแชร์ผลเปรียบเทียบเป็นรูปสวยๆ — ชวนเพื่อนมาสแกนผิว */}
                                            <button
                                                onClick={() => buildCompareShareImage(A, B, shareTheme, shareLayout)}
                                                disabled={isBuildingShare}
                                                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-purple-300 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                            >
                                                {isBuildingShare ? <Loader2 size={18} className="animate-spin"/> : <Share2 size={18}/>}
                                                {isBuildingShare ? 'กำลังสร้างรูป...' : `📤 แชร์การ์ด${(SHARE_THEMES.find(t => t.key === shareTheme) || {}).label || ''} · ${shareLayout === 'stack' ? 'แนวตั้ง' : 'แนวนอน'}`}
                                            </button>
                                            <p className="text-[9px] text-gray-400 text-center font-medium">แชร์เป็นรูปภาพพร้อม QR — ส่งต่อใน LINE หรือโซเชียลได้เลย</p>
                                        </>
                                    );
                                })()}
                            </>
                        )
                    )}
                </div>

                {/* 🌟 Detail View Overlay when a scan is selected 🌟 */}
                {selectedScan && (
                    <div className="absolute inset-0 bg-slate-50 z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-3.5 shrink-0 flex items-center justify-between text-white shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="relative z-10 flex items-center space-x-2">
                                <button
                                    onClick={() => setSelectedScan(null)}
                                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div>
                                    <h3 className="text-xs font-black">รายละเอียดผลสแกนผิว AI</h3>
                                    <p className="text-[10px] font-bold opacity-80">{fmtDate(selectedScan.createdAt)} · {fmtTime(selectedScan.createdAt)}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer relative z-10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 hide-scrollbar">
                            {/* Photo (if available) */}
                            {(selectedScan.image || selectedScan.thumb) && (
                                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black shadow-md border border-gray-100">
                                    <img src={selectedScan.image || selectedScan.thumb} alt="Scan Face" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-teal-200">Iris AI Verified Result</span>
                                        </div>
                                        <span className="text-[10px] font-bold opacity-80">{fmtDate(selectedScan.createdAt)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Overall Score & Estimated Skin Age Banner */}
                            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <MiniRing score={selectedScan.scores?.overall} size={58} stroke={5} fontSize={18} />
                                        <div>
                                            <span className="text-[11px] font-black text-gray-800 flex items-center gap-1">
                                                <ShieldCheck size={14} className="text-indigo-600" /> คะแนนสุขภาพผิวโดยรวม
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                                                {selectedScan.scores?.overall >= 8 ? '🌟 ผิวสุขภาพดีเยี่ยม' : selectedScan.scores?.overall >= 6 ? '✨ ผิวสมดุลปานกลาง' : '⚠️ ควรได้รับการฟื้นฟู'}
                                            </span>
                                        </div>
                                    </div>
                                    {(selectedScan.estimatedSkinAge || selectedScan.raw?.estimatedSkinAge) && (
                                        <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-xl px-3 py-2 text-center shrink-0 shadow-xs">
                                            <span className="text-[9px] font-bold text-purple-600 block">อายุผิวประเมิน</span>
                                            <span className="text-base font-black text-gray-900 leading-tight">
                                                ~{selectedScan.estimatedSkinAge || selectedScan.raw?.estimatedSkinAge} <span className="text-[10px] font-bold text-gray-400">ปี</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {(selectedScan.skinAgeStatus || selectedScan.raw?.skinAgeStatus) && (
                                    <div className="mt-3 pt-2.5 border-t border-purple-100/80 flex items-center gap-1.5 text-[10px] font-bold text-purple-800">
                                        <Sparkles size={12} className="text-pink-500 shrink-0" />
                                        <span>{selectedScan.skinAgeStatus || selectedScan.raw?.skinAgeStatus}</span>
                                    </div>
                                )}
                            </div>

                            {/* AI Warning Banner */}
                            {(selectedScan.warning || selectedScan.raw?.warning) && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-start gap-2 shadow-xs">
                                    <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-[10px] leading-relaxed">
                                        <span className="font-bold block mb-0.5">ข้อควรระวังภาพถ่าย</span>
                                        {selectedScan.warning || selectedScan.raw?.warning}
                                    </div>
                                </div>
                            )}

                            {/* AI Summary Card */}
                            {(selectedScan.summary || selectedScan.raw?.summary) && (
                                <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm space-y-1.5">
                                    <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                                        <Heart size={14} className="text-rose-500 fill-rose-500" /> บทวิเคราะห์จากผู้เชี่ยวชาญ AI
                                    </h4>
                                    <p className="text-[11px] text-gray-600 leading-relaxed">
                                        {selectedScan.summary || selectedScan.raw?.summary}
                                    </p>
                                </div>
                            )}

                            {/* 9 Metric Scores Grid */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                                        <Activity size={14} className="text-teal-600" /> คะแนนสภาพผิว 9 ด้าน (เต็ม 10)
                                    </h4>
                                    <span className="text-[9px] text-gray-400 font-medium">แตะแต่ละด้านเพื่อดูคำแนะนำ</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(SKIN_METRICS).map(([key, metric]) => {
                                        const score = selectedScan.scores?.[key];
                                        if (typeof score !== 'number') return null;
                                        const isExpanded = expandedMetric === key;
                                        const status = metric.getStatus ? metric.getStatus(score) : null;
                                        const statusTone = status?.tone === 'good' ? 'bg-emerald-50 text-emerald-700' : status?.tone === 'mid' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700';
                                        return (
                                            <React.Fragment key={key}>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedMetric(isExpanded ? null : key)}
                                                    className={`col-span-1 bg-white border ${isExpanded ? 'border-indigo-400 ring-2 ring-indigo-400/20 shadow-sm' : 'border-gray-100'} p-2 rounded-xl flex items-center gap-2 text-left hover:border-gray-300 transition-all active:scale-[0.98] cursor-pointer`}
                                                >
                                                    <MiniRing score={score} size={36} stroke={3} fontSize={11} />
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[10px] text-gray-700 font-bold leading-tight block truncate">
                                                            {metric.label}
                                                        </span>
                                                        <span className="text-[8px] text-gray-400 font-medium flex items-center gap-0.5 mt-0.5">
                                                            {isExpanded ? <ChevronUp size={10} className="text-indigo-500" /> : <ChevronDown size={10} />}
                                                            <span>{isExpanded ? 'ย่อ' : 'ดูคำแนะนำ'}</span>
                                                        </span>
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="col-span-2 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 space-y-2 animate-in fade-in duration-200">
                                                        {status && (
                                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${statusTone}`}>
                                                                <Activity size={9} /> {status.text}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-500 mb-0.5 flex items-center gap-1">
                                                                <AlertCircle size={10} className="text-rose-400" /> สาเหตุ / ปัจจัย
                                                            </p>
                                                            <p className="text-[10px] text-gray-700 leading-relaxed">{metric.causes}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-500 mb-0.5 flex items-center gap-1">
                                                                <Sparkles size={10} className="text-amber-500" /> การดูแลเองที่บ้าน
                                                            </p>
                                                            <p className="text-[10px] text-gray-700 leading-relaxed">{metric.homeCare}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Hydration Analysis */}
                            {selectedScan.raw?.hydrationAnalysis && (
                                <div className="bg-white border border-blue-100 rounded-2xl p-3.5 shadow-sm space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                                            <Droplets size={14} className="text-blue-500" /> สมดุลความชุ่มชื้น & น้ำใต้ผิว
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border ${selectedScan.raw.hydrationAnalysis.isDry ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                {selectedScan.raw.hydrationAnalysis.isDry ? 'ผิวแห้ง' : 'ไม่แห้ง'}
                                            </span>
                                            <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border ${selectedScan.raw.hydrationAnalysis.isDehydrated ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                {selectedScan.raw.hydrationAnalysis.isDehydrated ? 'ผิวขาดน้ำ' : 'น้ำสมดุล'}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedScan.raw.hydrationAnalysis.description && (
                                        <p className="text-[11px] text-gray-600 leading-relaxed">{selectedScan.raw.hydrationAnalysis.description}</p>
                                    )}
                                    {selectedScan.raw.hydrationAnalysis.recommendation && (
                                        <div className="bg-blue-50/60 rounded-xl p-2.5 text-[10px] text-blue-800 leading-relaxed flex items-start gap-1.5">
                                            <Sparkles size={12} className="text-blue-500 shrink-0 mt-0.5" />
                                            <span>{selectedScan.raw.hydrationAnalysis.recommendation}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Cell Turnover Info */}
                            {selectedScan.raw?.cellTurnoverInfo && (
                                <div className="bg-white border border-emerald-100 rounded-2xl p-3.5 shadow-sm space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                                            <Sparkles size={14} className="text-emerald-500" /> สถานะการผลัดเซลล์ผิวสมุนไพร
                                        </h4>
                                        {(() => {
                                            const badge = getTurnoverStatusBadge(selectedScan.raw.cellTurnoverInfo.status);
                                            return (
                                                <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border ${badge.tone}`}>
                                                    {badge.text}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    {selectedScan.raw.cellTurnoverInfo.description && (
                                        <p className="text-[11px] text-gray-600 leading-relaxed">{selectedScan.raw.cellTurnoverInfo.description}</p>
                                    )}
                                    {selectedScan.raw.cellTurnoverInfo.statusEvidence && (
                                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <span className="font-bold">หลักฐานที่สังเกตเห็น:</span>
                                            <span>{selectedScan.raw.cellTurnoverInfo.statusEvidence}</span>
                                        </div>
                                    )}
                                    {selectedScan.raw.cellTurnoverInfo.herbalRecommendation && (
                                        <div className="bg-emerald-50/70 rounded-xl p-2.5 text-[10px] text-emerald-900 leading-relaxed flex items-start gap-1.5 border border-emerald-100">
                                            <Sparkles size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold block text-[9.5px] text-emerald-800">คำแนะนำสมุนไพรไอริส:</span>
                                                {selectedScan.raw.cellTurnoverInfo.herbalRecommendation}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AI Recommendation */}
                            {(selectedScan.recommendation || selectedScan.raw?.recommendation) && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-3.5 shadow-sm space-y-1.5">
                                    <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-amber-500" /> คำแนะนำการดูแลผิวประจำวัน
                                    </h4>
                                    <p className="text-[11px] text-gray-700 leading-relaxed">
                                        {selectedScan.recommendation || selectedScan.raw?.recommendation}
                                    </p>
                                </div>
                            )}

                            {/* Compare Action Button */}
                            <div className="pt-2 pb-6 space-y-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const foundIdx = scans.findIndex(x => (x.id && x.id === selectedScan.id) || x.createdAt === selectedScan.createdAt);
                                        if (foundIdx !== -1) {
                                            setSelB(foundIdx);
                                            if (foundIdx > 0) setSelA(foundIdx - 1);
                                            else if (scans.length > 1) setSelA(1);
                                        }
                                        setSelectedScan(null);
                                        setTab('compare');
                                    }}
                                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-2xl font-black text-xs shadow-md shadow-purple-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <ArrowLeftRight size={14} /> นำผลครั้งนี้ไปเทียบ Before/After
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedScan(null)}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                                >
                                    ย้อนกลับไปรายการประวัติ
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR ซ่อนไว้สำหรับใส่ในภาพแชร์ */}
                <div ref={qrWrapRef} className="hidden" aria-hidden="true">
                    <QRCodeCanvas value="https://iris-clinic-app.web.app" size={176} level="M" />
                </div>

                {/* Footer note */}
                {scans.length > 0 && (
                    <div className="p-3 border-t border-gray-100 bg-white shrink-0">
                        <p className="text-[9px] text-gray-400 text-center font-medium leading-relaxed">
                            ระบบบันทึกผลสแกนอัตโนมัติทุกครั้งที่วิเคราะห์ผิวผ่าน AI (เฉพาะโหมดวิเคราะห์สุขภาพผิว) เพื่อติดตามผลการดูแลของคุณต่อเนื่องค่ะ 💜
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
