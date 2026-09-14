import React, { useState, useEffect } from 'react';
import { Gift, Ticket, Sparkles, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { updateDoc, doc, addDoc, collection, getFirestore, query, where, getDocs, setDoc } from 'firebase/firestore';

export default function Gamification({ customerData, dbLuckyPrizes, showToast, onGoToRewards }) {
    const db = getFirestore();
    const [activeTab, setActiveTab] = useState('spin'); // 'spin' or 'golden'
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [spinHistory, setSpinHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Get phone and name using both English and Thai keys
    const custPhone = customerData?.cleanPhone || customerData?.['เบอร์โทร'] || customerData?.tel || '';
    const custName = customerData?.['ชื่อลูกค้า'] || customerData?.['ชื่อ'] || customerData?.name || '';
    
    const [localSpinTickets, setLocalSpinTickets] = useState(Number(customerData?.spinTickets || 0));

    // Update local state if customerData prop changes
    useEffect(() => {
        setLocalSpinTickets(Number(customerData?.spinTickets || 0));
    }, [customerData?.spinTickets]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!custPhone) return;
            setIsLoadingHistory(true);
            try {
                const q = query(
                    collection(db, 'lucky_draw_winners'),
                    where('customerTel', '==', custPhone)
                );
                const snap = await getDocs(q);
                let history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // sort descending by date client-side to avoid needing a composite index
                history.sort((a, b) => new Date(b.date || 0) < new Date(a.date || 0) ? 1 : -1);
                setSpinHistory(history);
            } catch (e) {
                console.error("Error fetching history:", e);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [custPhone, spinResult]); // Re-fetch when spinResult changes (new prize won)


    const goldenTickets = customerData?.goldenTickets || [];

    // Fallback mock prizes if none exist in DB
    const effectivePrizes = (dbLuckyPrizes && dbLuckyPrizes.length > 0) ? dbLuckyPrizes : [
        { id: '1', name: 'คูปองส่วนลด 100 บาท', type: 'coupon', value: '100', probability: 40 },
        { id: '2', name: 'มาส์กหน้าฟรี 1 ครั้ง', type: 'free_course', value: 'free_mask', probability: 30 },
        { id: '3', name: 'คะแนนสะสม 500 แต้ม', type: 'points', value: '500', probability: 20 },
        { id: '4', name: 'ส่วนลด 50% คอร์สสิว', type: 'coupon_percent', value: '50', probability: 9 },
        { id: '5', name: 'ทองคำ 1 สลึง (ตั๋วทอง)', type: 'physical', value: 'gold', probability: 1 }
    ];

    const handleSpin = async () => {
        if (localSpinTickets <= 0) return showToast("สิทธิ์หมุนของคุณหมดแล้ว! สะสมยอดซื้อเพื่อรับเพิ่ม");
        if (!effectivePrizes || effectivePrizes.length === 0) return showToast("ระบบรางวัลยังไม่พร้อมใช้งาน");
        
        setIsSpinning(true);
        setSpinResult(null);

        // Calculate random winner based on probability
        const randomNum = Math.random() * 100;
        let cumulativeProb = 0;
        let wonPrize = effectivePrizes[effectivePrizes.length - 1]; // Default to last if fallback needed

        for (const prize of effectivePrizes) {
            cumulativeProb += Number(prize.probability || 0);
            if (randomNum <= cumulativeProb) {
                wonPrize = prize;
                break;
            }
        }

        // Fake rotation for wheel animation (multiple full spins + random offset)
        const baseRotations = 360 * 5; // 5 full spins
        const extraRot = Math.floor(Math.random() * 360);
        const finalRotation = rotation + baseRotations + extraRot;
        setRotation(finalRotation);

        // Wait for animation to finish
        setTimeout(async () => {
            setIsSpinning(false);
            setSpinResult(wonPrize);
            
            try {
                // Deduct ticket and process reward
                const newSpinTickets = Math.max(0, localSpinTickets - 1);
                setLocalSpinTickets(newSpinTickets); // Update UI immediately
                const updateData = { spinTickets: newSpinTickets };
                
                if (wonPrize.type === 'points') {
                    updateData.realAccumulatedAmount = String((Number(customerData?.realAccumulatedAmount || 0) / 100 * 100) + (Number(wonPrize.value) * 100)); 
                } else {
                    // Generate a personal voucher for coupon, free_course, physical prizes
                    const generatedCode = `WIN${Math.random().toString(36).substring(2,8).toUpperCase()}`;
                    await setDoc(doc(db, 'coupons', generatedCode), {
                        code: generatedCode,
                        type: wonPrize.type === 'coupon' ? 'baht' : 'free_item',
                        desc: `รางวัลหมุนวงล้อ: ${wonPrize.name}`,
                        value: wonPrize.type === 'coupon' ? wonPrize.value : wonPrize.name,
                        isPersonal: true,
                        customerPhone: custPhone,
                        isUsed: false,
                        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days expiry
                        createdAt: new Date().toISOString()
                    });
                }
                
                await updateDoc(doc(db, 'customers', customerData.id), updateData);
                
                // Add to history
                await addDoc(collection(db, 'lucky_draw_winners'), {
                    customerId: customerData.id,
                    customerName: custName,
                    customerTel: custPhone,
                    prizeName: wonPrize.name,
                    prizeType: wonPrize.type,
                    prizeValue: wonPrize.value,
                    date: new Date().toISOString()
                });
                
            } catch(e) {
                console.error("Error giving prize:", e);
                showToast("เกิดข้อผิดพลาดในการรับรางวัล กรุณาติดต่อแอดมิน");
            }
        }, 3000); // 3 seconds animation
    };

    return (
        <div className="animate-in fade-in duration-500 w-full pb-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 pt-8 pb-6 px-6 shadow-lg relative overflow-hidden rounded-[32px] mx-1 mt-4">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                <div className="relative z-10 text-center">
                    <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2 tracking-tight">
                        <Gift size={28} className="text-yellow-300 drop-shadow-md" /> ลุ้นโชค
                    </h2>
                    <p className="text-sm font-bold text-white/80">สะสมยอดซื้อ รับสิทธิ์ลุ้นรางวัลมากมาย!</p>
                </div>
            </div>

            <div className="px-4 -mt-4 relative z-20 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex">
                    <button onClick={() => setActiveTab('spin')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${activeTab === 'spin' ? 'bg-purple-100 text-purple-700' : 'text-slate-400 hover:text-slate-600'}`}>
                        <RefreshCw size={16} /> หมุนวงล้อ
                    </button>
                    <button onClick={() => setActiveTab('golden')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${activeTab === 'golden' ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-600'}`}>
                        <Ticket size={16} /> ตั๋วทองชิงโชค
                    </button>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {activeTab === 'spin' && (
                    <div className="animate-in fade-in">
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-purple-100 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><RefreshCw size={100} /></div>
                            
                            <h3 className="text-lg font-black text-slate-800 mb-1">วงล้อเสี่ยงโชค (Lucky Spin)</h3>
                            <p className="text-sm text-slate-500 font-bold mb-6">สิทธิ์หมุนคงเหลือ: <span className="text-2xl font-black text-purple-600 mx-1">{localSpinTickets}</span> ครั้ง</p>
                            
                            <div className="relative w-64 h-64 mx-auto mb-8">
                                {/* Simple Wheel CSS */}
                                <div className="absolute inset-0 rounded-full border-[8px] border-purple-600 shadow-xl overflow-hidden transition-transform duration-[3000ms] ease-out"
                                     style={{ transform: `rotate(${rotation}deg)` }}>
                                    {effectivePrizes && effectivePrizes.length > 0 ? (
                                        effectivePrizes.map((prize, idx) => {
                                            const angle = 360 / effectivePrizes.length;
                                            const rot = idx * angle;
                                            return (
                                                <div key={prize.id} className="absolute inset-0 flex justify-center items-start pt-6 text-[10px] font-black"
                                                     style={{ 
                                                        transform: `rotate(${rot}deg)`, 
                                                        background: idx % 2 === 0 ? '#f3e8ff' : '#e9d5ff', 
                                                        clipPath: `polygon(50% 50%, 0 0, 100% 0)` // Approximation for small slices
                                                     }}>
                                                    <span className="truncate max-w-[80px] -rotate-90 origin-bottom mt-8 text-purple-800">{prize.name}</span>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">ไม่มีรางวัล</div>
                                    )}
                                </div>
                                {/* Pointer */}
                                <div className="absolute top-0 left-1/2 -ml-3 -mt-4 text-rose-500 z-10 filter drop-shadow-md">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 0L24 12H0L12 0Z"/></svg>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleSpin}
                                disabled={isSpinning || localSpinTickets <= 0}
                                className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${isSpinning ? 'bg-slate-300 text-slate-500 cursor-not-allowed scale-95' : localSpinTickets > 0 ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:scale-[1.02] active:scale-95 shadow-purple-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isSpinning ? 'กำลังหมุน...' : localSpinTickets > 0 ? 'กดหมุนวงล้อเลย!' : 'ไม่มีสิทธิ์หมุน'}
                            </button>
                        </div>
                        
                        {spinResult && !isSpinning && (
                            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in zoom-in duration-300 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10"><Gift size={80}/></div>
                                <Sparkles size={32} className="mx-auto text-emerald-500 mb-2" />
                                <p className="text-sm font-bold text-emerald-700 mb-1">ยินดีด้วย! คุณได้รับ</p>
                                <h4 className="text-xl font-black text-emerald-900 mb-4">{spinResult.name}</h4>
                                <button 
                                   onClick={() => {
                                      showToast("เก็บของรางวัลเรียบร้อย! กรุณาดูที่หน้าสิทธิพิเศษ");
                                      setSpinResult(null);
                                      if (typeof onGoToRewards === 'function') onGoToRewards();
                                   }}
                                   className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl w-full shadow-md hover:bg-emerald-700 transition-all active:scale-95"
                                >
                                   เก็บของรางวัล / นำไปใช้งาน
                                </button>
                                {spinResult.type === 'coupon' && <p className="text-[10px] text-emerald-600 mt-3 font-medium">* ระบบส่งคูปองนี้ไปยังหน้าสิทธิพิเศษเรียบร้อยแล้ว</p>}
                            </div>
                        )}

                        <div className="mt-8">
                            <h3 className="text-sm font-black text-slate-800 flex items-center mb-3">
                                <Clock size={16} className="mr-2 text-slate-500" /> ประวัติการรับสิทธิ์ (ล่าสุด)
                            </h3>
                            {isLoadingHistory ? (
                                <div className="text-center text-xs text-slate-400 py-4">กำลังโหลด...</div>
                            ) : spinHistory.length > 0 ? (
                                <div className="space-y-2">
                                    {spinHistory.slice(0, 5).map(hist => (
                                        <div key={hist.id} className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                                    <Gift size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-xs text-slate-800">{hist.prizeName}</h4>
                                                    <p className="text-[10px] text-slate-500">{new Date(hist.date).toLocaleString('th-TH')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-4 text-center text-slate-400 text-xs border border-slate-100">
                                    ยังไม่มีประวัติการหมุนวงล้อ
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'golden' && (
                    <div className="animate-in fade-in">
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[32px] p-6 shadow-lg shadow-orange-500/20 text-center relative overflow-hidden text-white">
                            <div className="absolute top-0 left-0 p-4 opacity-20"><Ticket size={100} /></div>
                            
                            <h3 className="text-xl font-black mb-1 drop-shadow-sm relative z-10">Golden E-Ticket</h3>
                            <p className="text-sm font-bold text-white/80 mb-6 relative z-10">สลากชิงโชคของคุณ รอลุ้นจับแจกทอง!</p>
                            
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/30 relative z-10">
                                <p className="text-sm font-bold mb-1">สลากทั้งหมดที่คุณมี</p>
                                <p className="text-4xl font-black">{goldenTickets.length} <span className="text-lg font-bold">ใบ</span></p>
                            </div>
                            
                            <div className="space-y-3 relative z-10">
                                {goldenTickets.length > 0 ? (
                                    goldenTickets.map((ticket, idx) => (
                                        <div key={idx} className="bg-white text-amber-800 rounded-xl p-3 flex justify-between items-center shadow-sm border border-amber-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><Ticket size={18}/></div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">TICKET NO.</p>
                                                    <p className="font-black text-lg tracking-wider leading-none">{ticket}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white/10 rounded-xl p-6 text-center border border-white/20 border-dashed">
                                        <p className="text-sm font-bold">ยังไม่มีตั๋วชิงโชค</p>
                                        <p className="text-[11px] text-white/70 mt-1">ซื้อแพ็กเกจหรือคอร์สเพื่อรับตั๋วทองคำ!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
