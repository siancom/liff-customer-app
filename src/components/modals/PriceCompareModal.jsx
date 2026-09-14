import React, { useState } from 'react';
import { X, CheckCircle, Search, Gift, ShieldCheck, Zap, ArrowRight, MessageCircle } from 'lucide-react';

const PriceCompareModal = ({ isOpen, onClose, product }) => {
    const [competitorPrice, setCompetitorPrice] = useState('');
    const [result, setResult] = useState(null);

    if (!isOpen || !product) return null;

    const handleCompare = () => {
        const compPrice = parseFloat(competitorPrice);
        if (isNaN(compPrice) || compPrice <= 0) return;
        
        const ourPrice = product.price;
        
        if (ourPrice < compPrice) {
            setResult({
                status: 'cheaper',
                diff: compPrice - ourPrice,
                title: 'ซื้อกับเรา คุ้มกว่าแน่นอน! 🎉',
                desc: `คุณประหยัดเงินได้ถึง ฿${(compPrice - ourPrice).toLocaleString()} แถมยังมั่นใจได้ 100% ว่าเป็นของแท้ พร้อมบริการดูแลหลังการขายโดยผู้เชี่ยวชาญ`
            });
        } else if (ourPrice === compPrice) {
            setResult({
                status: 'equal',
                diff: 0,
                title: 'ราคาเท่ากัน แต่เราให้มากกว่า! ✨',
                desc: `ในราคาที่เท่ากัน คุณจะได้รับบริการที่เหนือระดับกว่า ทั้งการดูแลอย่างใกล้ชิด สะสมแต้มได้ และการรับประกันที่หาจากที่อื่นไม่ได้`
            });
        } else {
            setResult({
                status: 'expensive',
                diff: ourPrice - compPrice,
                title: 'ทำไมของเราจึงคุ้มค่าที่สุด? 💎',
                desc: `แม้ราคาจะสูงกว่า ฿${(ourPrice - compPrice).toLocaleString()} แต่สิ่งที่คุณจะได้คือ "ความมั่นใจ" ว่าปลอดภัย สินค้าได้มาตรฐาน ไม่เสี่ยงเจอของปลอม พร้อมผู้เชี่ยวชาญดูแลตลอดการใช้งาน`
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-400 to-rose-500 p-5 pt-6 text-white text-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                        <X size={18} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md mb-3 shadow-inner">
                        <Search size={32} className="text-white drop-shadow-md" />
                    </div>
                    <h2 className="text-lg font-black tracking-wide">เช็คความคุ้มค่า 🆚</h2>
                    <p className="text-xs font-medium opacity-90 mt-1 line-clamp-1">{product.name}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!result ? (
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-gray-700 text-center mb-2">คุณเจอสินค้านี้จากแอปอื่นราคาเท่าไหร่?</p>
                            
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">฿</span>
                                <input 
                                    type="number" 
                                    value={competitorPrice} 
                                    onChange={(e) => setCompetitorPrice(e.target.value)}
                                    placeholder="ใส่ราคาที่เจอ..." 
                                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-black text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 transition-all"
                                />
                            </div>

                            <button 
                                onClick={handleCompare}
                                disabled={!competitorPrice}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 mt-2 flex justify-center items-center"
                            >
                                เปรียบเทียบราคา <ArrowRight size={16} className="ml-1.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                            
                            <div className={`p-5 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden ${
                                result.status === 'cheaper' ? 'bg-emerald-50 border-emerald-100' :
                                result.status === 'equal' ? 'bg-blue-50 border-blue-100' :
                                'bg-purple-50 border-purple-100'
                            }`}>
                                <h3 className={`text-base font-black mb-2 ${
                                    result.status === 'cheaper' ? 'text-emerald-700' :
                                    result.status === 'equal' ? 'text-blue-700' :
                                    'text-purple-700'
                                }`}>{result.title}</h3>
                                
                                <p className="text-xs font-medium text-gray-700 leading-relaxed">
                                    {result.desc}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                    <ShieldCheck size={20} className="text-teal-500 mb-1" />
                                    <span className="text-[9px] font-bold text-gray-600">ของแท้ 100%</span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                    <Gift size={20} className="text-rose-500 mb-1" />
                                    <span className="text-[9px] font-bold text-gray-600">สะสมแต้มได้</span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                                    <MessageCircle size={20} className="text-blue-500 mb-1" />
                                    <span className="text-[9px] font-bold text-gray-600">ปรึกษาฟรี</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => { setResult(null); setCompetitorPrice(''); }} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors">
                                    เช็คใหม่
                                </button>
                                <button onClick={onClose} className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-500/20 hover:scale-[1.02] transition-all">
                                    กลับไปซื้อเลย
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PriceCompareModal;
