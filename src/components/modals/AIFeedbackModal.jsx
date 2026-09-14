import React, { useState, useEffect } from 'react';
import { query, where, getDocs, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { X, Gift, Star, Copy, Check, Loader2, ClipboardList, Sparkles } from 'lucide-react';

// 🎁 แบบประเมินความพอใจ AI (ช่วงทดสอบ) — ทำครั้งเดียวต่อเบอร์ รับส่วนลด AIFEED 50.- (ขั้นต่ำ 200.-)

const ACCURACY_OPTS = [
    { key: 'very', label: 'ตรงมาก' },
    { key: 'some', label: 'ค่อนข้างตรง' },
    { key: 'no', label: 'ยังไม่ตรง' },
];
const RECOMMEND_OPTS = [
    { key: 'yes', label: 'แนะนำแน่นอน 💚' },
    { key: 'maybe', label: 'อาจแนะนำ 🤔' },
    { key: 'no', label: 'ยังไม่แนะนำ' },
];

export default function AIFeedbackModal({ isOpen, onClose, customerData, getAppCollection, getAppDoc, showToast }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existing, setExisting] = useState(null); // เคยทำแล้ว → แสดงโค้ดเดิม
    const [rating, setRating] = useState(0);
    const [accuracy, setAccuracy] = useState(null);
    const [recommend, setRecommend] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [rewardCode, setRewardCode] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);   // เก็บเข้าคูปองของฉันแล้ว?
    const [saving, setSaving] = useState(false);

    const cleanPhone = customerData?.cleanPhone || String(customerData?.['เบอร์โทร'] || '').replace(/\D/g, '');

    useEffect(() => {
        if (!isOpen || !cleanPhone || !getAppCollection) return;
        setLoading(true);
        setExisting(null); setRewardCode(null); setCopied(false);
        setRating(0); setAccuracy(null); setRecommend(null); setFeedback('');
        (async () => {
            try {
                const q = query(getAppCollection('surveys'), where('phone', '==', cleanPhone));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const doc = snap.docs[0].data();
                    setExisting(doc);
                    setRewardCode(doc.rewardCode || null);
                    // เช็คว่าเก็บเข้าคูปองของฉันแล้วหรือยัง
                    if (doc.rewardCode && Array.isArray(customerData?.collectedCoupons) && customerData.collectedCoupons.includes(doc.rewardCode)) {
                        setIsSaved(true);
                    }
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [isOpen, cleanPhone]);

    if (!isOpen) return null;

    const copyCode = async () => {
        if (!rewardCode) return;
        try {
            await navigator.clipboard.writeText(rewardCode);
            setCopied(true);
            showToast('คัดลอกโค้ดส่วนลดแล้ว นำไปใส่ตอนสั่งซื้อได้เลยค่ะ');
            setTimeout(() => setCopied(false), 2500);
        } catch (e) { showToast('กดค้างเพื่อคัดลอกโค้ดได้เลยค่ะ'); }
    };

    // 🎟️ เก็บโค้ดเข้า "คูปองของฉัน" — จะไปโผล่ในหน้าชำระเงิน (collectedCoupons)
    const saveToMyCoupons = async () => {
        if (!rewardCode || !customerData?.id || !getAppDoc || saving) return;
        setSaving(true);
        try {
            await updateDoc(getAppDoc('customers', customerData.id), { collectedCoupons: arrayUnion(rewardCode) });
            setIsSaved(true);
            showToast('เก็บตั๋วเข้าคูปองของฉันแล้ว — ใช้ตอนชำระเงินได้เลยค่ะ 🎟️');
        } catch (e) {
            showToast('เก็บคูปองไม่สำเร็จ: ' + e.message);
        } finally { setSaving(false); }
    };

    const handleSubmit = async () => {
        if (!rating) return showToast('กรุณาให้คะแนนความพอใจก่อนนะคะ');
        if (!accuracy) return showToast('กรุณาเลือกว่าผลวิเคราะห์ตรงกับสภาพผิวจริงไหม');
        setSubmitting(true);
        try {
            const code = `AIFEED${Date.now().toString().slice(-5)}`;
            await addDoc(getAppCollection('surveys'), {
                phone: cleanPhone,
                rating,
                accuracy,
                recommend: recommend || '',
                feedback: feedback.trim(),
                rewardCode: code,
                source: 'ai_skin_test',
                createdAt: new Date().toISOString(),
            });
            setRewardCode(code);
            showToast('ขอบคุณมากนะคะ! รับส่วนลด 50.- เลยค่ะ 🎁');
        } catch (e) {
            showToast('ส่งแบบประเมินไม่สำเร็จ: ' + e.message);
        } finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-[112] bg-gray-900/70 backdrop-blur-sm flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in">
            <div className="bg-white w-full sm:max-w-md sm:rounded-[32px] rounded-t-[32px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-4 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/15 rounded-full -mr-8 -mt-8 blur-xl"></div>
                    <div className="relative z-10 flex justify-between items-center text-white">
                        <div>
                            <h2 className="text-base font-black flex items-center"><ClipboardList size={18} className="mr-2"/> ช่วงเราทดสอบ AI สแกนผิว 🧪</h2>
                            <p className="text-[10px] font-bold opacity-90 mt-0.5">แลกความคิดเห็น 2 นาที รับส่วนลด 50.- ทันที</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"><X size={18}/></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {loading ? (
                        <div className="py-14 flex flex-col items-center text-gray-400">
                            <Loader2 size={30} className="animate-spin text-amber-400 mb-2"/>
                            <p className="text-xs font-bold">กำลังตรวจสอบ...</p>
                        </div>
                    ) : rewardCode ? (
                        /* ---------- หน้ารับรางวัล: ตั๋วคูปองแบบ Voucher ---------- */
                        <div className="text-center py-2 animate-in zoom-in-95">
                            <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-3 relative">
                                <div className="absolute inset-0 bg-amber-300 rounded-full animate-ping opacity-20"></div>
                                <Gift size={38} className="text-amber-500 relative z-10"/>
                            </div>
                            <h3 className="text-lg font-black text-gray-800">ขอบคุณนะคะ 💛</h3>
                            <p className="text-xs text-gray-500 mt-1">รับตั๋วส่วนลดจากการช่วยทดสอบ AI เรียบร้อย</p>

                            {/* 🎫 ตั๋วคูปอง — หัวตั๋ว + รอยปรุ + ส่วนฉีกโค้ด */}
                            <div className="mt-4 relative text-left shadow-xl rotate-[-1deg] hover:rotate-0 transition-transform">
                                {/* หัวตั๋ว */}
                                <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-t-2xl p-4 text-white relative overflow-hidden">
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/15 rounded-full"></div>
                                    <div className="absolute bottom-2 right-3 text-5xl opacity-20">🎁</div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-90">✨ Iris Clinic · AI Tester Reward</p>
                                            <p className="text-3xl font-black mt-1 leading-none">ส่วนลด ฿50</p>
                                            <p className="text-[10px] font-bold opacity-90 mt-1">ขอบคุณจากการประเมิน AI สแกนผิวหน้า</p>
                                        </div>
                                    </div>
                                </div>
                                {/* รอยปรุ (เส้นประ + รูล้อข้างตั๋ว) */}
                                <div className="relative bg-amber-50 border-x-2 border-amber-200">
                                    <div className="border-t-2 border-dashed border-amber-300"></div>
                                    <div className="absolute -left-3 top-0 w-6 h-6 bg-white rounded-full border-2 border-amber-200 -translate-y-1/2"></div>
                                    <div className="absolute -right-3 top-0 w-6 h-6 bg-white rounded-full border-2 border-amber-200 -translate-y-1/2"></div>
                                </div>
                                {/* ส่วนโค้ด */}
                                <div className="bg-amber-50 rounded-b-2xl border-x-2 border-b-2 border-amber-200 px-4 py-3.5">
                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest text-center">รหัสตั๋ว (แสดงที่สาขา หรือใส่ตอนชำระเงิน)</p>
                                    <div className="flex items-center justify-center gap-2 mt-1.5">
                                        <span className="text-2xl font-black text-amber-700 font-mono tracking-[0.15em]">{rewardCode}</span>
                                        <button onClick={copyCode} title="คัดลอกโค้ด" className="w-9 h-9 bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0 shadow-md">
                                            {copied ? <Check size={16}/> : <Copy size={16}/>}
                                        </button>
                                    </div>
                                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
                                        <div className="bg-white/70 rounded-lg py-1.5"><p className="text-[9px] font-black text-gray-500">ขั้นต่ำ</p><p className="text-[11px] font-black text-gray-800">฿200</p></div>
                                        <div className="bg-white/70 rounded-lg py-1.5"><p className="text-[9px] font-black text-gray-500">อายุ</p><p className="text-[11px] font-black text-gray-800">30 วัน</p></div>
                                        <div className="bg-white/70 rounded-lg py-1.5"><p className="text-[9px] font-black text-gray-500">สิทธิ์</p><p className="text-[11px] font-black text-gray-800">1 / เบอร์</p></div>
                                    </div>
                                    {/* ปุ่มเก็บเข้าแอป — โค้ดจะไปโผล่ใน "คูปองที่คุณมี" ตอนชำระเงิน */}
                                    {customerData?.id ? (
                                        isSaved ? (
                                            <div className="mt-2.5 w-full py-2.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-600 text-xs font-black flex items-center justify-center gap-1.5">
                                                <Check size={14}/> เก็บในคูปองของฉันแล้ว — เลือกใช้ตอนชำระเงินได้เลย
                                            </div>
                                        ) : (
                                            <button onClick={saveToMyCoupons} disabled={saving}
                                                className="mt-2.5 w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-xs font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60">
                                                {saving ? <Loader2 size={14} className="animate-spin"/> : '🎟️'} {saving ? 'กำลังเก็บ...' : 'เก็บเข้า "คูปองของฉัน" ในแอป'}
                                            </button>
                                        )
                                    ) : null}
                                </div>
                            </div>
                            <button onClick={onClose} className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-700 transition-colors">เสร็จสิ้น</button>
                        </div>
                    ) : (
                        /* ---------- ฟอร์มแบบประเมิน ---------- */
                        <>
                            {/* Q1 ความพอใจ */}
                            <div>
                                <p className="text-xs font-black text-gray-700 mb-2">1. พอใจกับการสแกนผิว AI โดยรวมแค่ไหน? <span className="text-rose-500">*</span></p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} onClick={() => setRating(n)} className="flex flex-col items-center gap-1 group">
                                            <Star size={34} className={`transition-all ${n <= rating ? 'text-amber-400 fill-amber-400 scale-110' : 'text-gray-200 group-hover:text-amber-200'}`}/>
                                            <span className={`text-[8px] font-black ${n <= rating ? 'text-amber-500' : 'text-gray-300'}`}>{['แย่', 'งั้นๆ', 'พอใช้', 'ดี', 'ดีมาก'][n-1]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q2 ความแม่น */}
                            <div>
                                <p className="text-xs font-black text-gray-700 mb-2">2. ผลวิเคราะห์ตรงกับสภาพผิวจริงของคุณไหม? <span className="text-rose-500">*</span></p>
                                <div className="grid grid-cols-3 gap-2">
                                    {ACCURACY_OPTS.map(o => (
                                        <button key={o.key} onClick={() => setAccuracy(o.key)}
                                            className={`py-2.5 rounded-xl text-[11px] font-black border-2 transition-all ${accuracy === o.key ? 'bg-teal-500 text-white border-teal-500 shadow-md' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-teal-200'}`}>
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q3 แนะนำ */}
                            <div>
                                <p className="text-xs font-black text-gray-700 mb-2">3. จะแนะนำเพื่อนมาลองสแกนไหม?</p>
                                <div className="space-y-2">
                                    {RECOMMEND_OPTS.map(o => (
                                        <button key={o.key} onClick={() => setRecommend(o.key)}
                                            className={`w-full py-2.5 rounded-xl text-[11px] font-black border-2 transition-all text-left px-3 ${recommend === o.key ? 'bg-emerald-50 text-emerald-700 border-emerald-400' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q4 ข้อเสนอแนะ */}
                            <div>
                                <p className="text-xs font-black text-gray-700 mb-2">4. ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)</p>
                                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="อยากให้ AI บอกอะไรเพิ่ม หรือปรับปรุงตรงไหนดีคะ..."
                                    className="w-full border-2 border-gray-200 rounded-xl p-3 text-xs leading-relaxed focus:border-amber-400 outline-none h-20 resize-none"/>
                            </div>

                            <button onClick={handleSubmit} disabled={submitting}
                                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-orange-300 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                {submitting ? <Loader2 size={18} className="animate-spin"/> : <Gift size={18}/>}
                                {submitting ? 'กำลังส่ง...' : 'ส่งแบบประเมิน รับส่วนลด 50.-'}
                            </button>
                            <p className="text-[9px] text-gray-400 text-center flex items-center justify-center gap-1"><Sparkles size={10}/> ทำครั้งเดียวต่อเบอร์ · โค้ดใช้กับคำสั่งซื้อขั้นต่ำ 200.-</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
