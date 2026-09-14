import React from 'react';
import { X, ImageIcon, History as HistoryIcon, ShoppingBag, Trash2, Minus, Plus, Upload, CheckCircle, Sparkles, User, Loader2 } from 'lucide-react';

export default function CustomOrderModal({
    isCustomOrderOpen,
    setIsCustomOrderOpen,
    customOrderItems,
    setCustomOrderItems,
    customOrderBudget,
    setCustomOrderBudget,
    customOrderImage,
    setCustomOrderImage,
    customOrderFaceImage,
    setCustomOrderFaceImage,
    customOrderNote,
    setCustomOrderNote,
    customOrderSkinConditions,
    setCustomOrderSkinConditions,
    customOrderSkinOther,
    setCustomOrderSkinOther,
    buyAgainItems,
    handleAddCustomItem,
    removeCustomItem,
    adjustCustomItemQty,
    parseNumber,
    handleCustomImageChange,
    handleCustomFaceImageChange,
    handleCustomOrderSubmit,
    isSubmittingCustomOrder
}) {
    if (!isCustomOrderOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[110] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in">
            <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <h2 className="text-sm font-black text-gray-900 flex items-center"><ImageIcon size={18} className="mr-2 text-blue-500"/> สั่งสินค้าจากรูปภาพ / ประวัติ</h2>
                    <button onClick={() => { setIsCustomOrderOpen(false); setCustomOrderItems([]); setCustomOrderBudget(0); setCustomOrderImage(null); setCustomOrderFaceImage(null); setCustomOrderNote(''); setCustomOrderSkinConditions([]); setCustomOrderSkinOther(''); }} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"><X size={16} /></button>
                </div>
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                    <p className="text-[11px] text-gray-600 leading-relaxed font-bold">
                        เลือกสินค้าจากประวัติ หรืออัปโหลดรูปภาพสินค้า/ใบสั่งแพทย์ เพื่อให้แอดมินตรวจสอบและสรุปยอดให้ค่ะ
                    </p>
                    
                    {buyAgainItems.length > 0 && (
                        <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                            <h3 className="text-[11px] font-bold text-blue-800 mb-2 flex items-center">
                                <HistoryIcon size={14} className="mr-1.5" /> เลือกด่วนจากประวัติสั่งซื้อ
                            </h3>
                            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 snap-x">
                                {buyAgainItems.map((prod, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => handleAddCustomItem(prod)} 
                                        className="snap-start shrink-0 w-[64px] bg-white rounded-[10px] border border-blue-100 p-1 shadow-sm flex flex-col relative group hover:border-blue-300 transition-all cursor-pointer active:scale-95"
                                    >
                                        <div className="w-full aspect-square bg-gray-50 rounded-md overflow-hidden mb-1 flex items-center justify-center relative">
                                            {prod.image ? (
                                                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ShoppingBag size={14} className="text-gray-300" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-[8px] line-clamp-2 leading-[1.15] mb-0.5 text-center">{prod.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {customOrderItems.length > 0 && (
                        <div className="bg-white rounded-2xl p-3 shadow-sm border border-blue-100 space-y-3">
                            <h3 className="text-[11px] font-black text-gray-800 flex items-center"><ShoppingBag size={14} className="mr-1.5 text-teal-500"/> รายการที่เลือก</h3>
                            {customOrderItems.map((item, idx) => (
                                <div key={idx} className="flex gap-3 relative pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <button onClick={() => removeCustomItem(item.id)} className="absolute top-0 right-0 p-1 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/> : <ShoppingBag size={16} className="text-gray-300"/>}
                                    </div>
                                    <div className="flex-1 pr-6">
                                        <p className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight">{item.name}</p>
                                        <div className="flex justify-between items-end mt-1.5">
                                            <p className="text-[10px] font-black text-[#EE4D2D]">฿{(parseNumber(item.price)||0).toLocaleString()}</p>
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-0.5">
                                                <button onClick={() => adjustCustomItemQty(item.id, -1)} className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-md"><Minus size={10}/></button>
                                                <span className="text-[10px] font-black w-5 text-center">{item.qty}</span>
                                                <button onClick={() => adjustCustomItemQty(item.id, 1)} className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-md"><Plus size={10}/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl p-4 text-center hover:bg-blue-50/50 transition-colors relative cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleCustomImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {customOrderImage ? (
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-40 rounded-xl overflow-hidden border border-blue-200 mb-2 shadow-sm">
                                    <img src={customOrderImage} alt="custom-order" className="w-full h-full object-cover"/>
                                </div>
                                <p className="text-[10px] font-bold text-blue-600 flex items-center"><CheckCircle size={12} className="mr-1"/> แนบรูปแล้ว (แตะเพื่อเปลี่ยน)</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3"><Upload size={20} className="text-blue-500"/></div>
                                <p className="text-sm font-black text-blue-800 mb-1">แนบรูปภาพสินค้า / ใบสั่งแพทย์</p>
                                <p className="text-[10px] text-blue-500 font-bold">แตะเพื่ออัปโหลดรูปเพิ่มเติม</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                         <label className="text-[11px] font-bold text-emerald-800 mb-3 flex items-center">
                             <Sparkles size={14} className="mr-1.5" /> สภาพผิวหน้าปัจจุบัน (ให้แอดมินช่วยประเมิน)
                         </label>

                         {/* 🌟 ปุ่มอัปโหลดรูปผิวหน้า 🌟 */}
                         <div className="mb-3 border border-dashed border-emerald-300 bg-white rounded-xl p-3 text-center relative cursor-pointer hover:bg-emerald-50 transition-colors">
                             <input type="file" accept="image/*" onChange={handleCustomFaceImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                             {customOrderFaceImage ? (
                                 <div className="flex items-center justify-center gap-3">
                                     <div className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-200 shrink-0 shadow-sm">
                                         <img src={customOrderFaceImage} alt="face" className="w-full h-full object-cover"/>
                                     </div>
                                     <div className="text-left">
                                         <p className="text-[10px] font-bold text-emerald-700 flex items-center"><CheckCircle size={12} className="mr-1"/> แนบรูปผิวหน้าแล้ว</p>
                                         <p className="text-[9px] text-emerald-500 mt-0.5">แตะเพื่อเปลี่ยนรูป</p>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="flex flex-col items-center py-1">
                                     <User size={16} className="text-emerald-500 mb-1.5" />
                                     <p className="text-[10px] font-bold text-emerald-700 mb-0.5">แนบรูปผิวหน้าของคุณ</p>
                                     <p className="text-[9px] text-emerald-500">เพื่อให้แอดมินประเมินได้แม่นยำขึ้น</p>
                                 </div>
                             )}
                         </div>

                         <div className="flex flex-wrap gap-2 mb-2">
                             {['ผิวแห้ง', 'ผิวมัน', 'ปกติ', 'ลอกบางส่วน', 'มีสิว', 'หน้าหมอง', 'อื่นๆ'].map(condition => (
                                 <button
                                     key={condition}
                                     onClick={() => setCustomOrderSkinConditions(prev => prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition])}
                                     className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${customOrderSkinConditions.includes(condition) ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                                 >
                                     {condition}
                                 </button>
                             ))}
                         </div>
                         {customOrderSkinConditions.includes('อื่นๆ') && (
                             <input
                                 type="text"
                                 placeholder="ระบุสภาพผิวอื่นๆ..."
                                 value={customOrderSkinOther}
                                 onChange={(e) => setCustomOrderSkinOther(e.target.value)}
                                 className="w-full mt-2 p-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                             />
                         )}
                    </div>

                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                         <div className="flex justify-between items-center mb-2">
                             <label className="text-[11px] font-bold text-gray-700">ตั้งงบประมาณ (ไม่บังคับ)</label>
                             <span className="text-[11px] font-black text-orange-600 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-orange-100">
                                 {customOrderBudget > 0 ? `ไม่เกิน ฿${customOrderBudget.toLocaleString()}` : 'ไม่จำกัดงบ'}
                             </span>
                         </div>
                         <input 
                             type="range" 
                             min="0" max="10000" step="500" 
                             value={customOrderBudget} 
                             onChange={e => setCustomOrderBudget(Number(e.target.value))}
                             className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                         />
                         <div className="flex justify-between text-[9px] text-gray-400 mt-1 font-mono font-bold">
                             <span>0</span>
                             <span>5k</span>
                             <span>10k+</span>
                         </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5 pl-1">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                        <textarea 
                            value={customOrderNote} 
                            onChange={e => setCustomOrderNote(e.target.value)} 
                            placeholder="เช่น ขอซื้อแบบนี้ 2 ขวดค่ะ"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold h-20 resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <button 
                        onClick={handleCustomOrderSubmit}
                        disabled={isSubmittingCustomOrder || (!customOrderImage && !customOrderFaceImage && !customOrderNote.trim() && customOrderItems.length === 0 && customOrderSkinConditions.length === 0)}
                        className={`w-full py-3.5 rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center mt-2 ${(!customOrderImage && !customOrderFaceImage && !customOrderNote.trim() && customOrderItems.length === 0 && customOrderSkinConditions.length === 0) || isSubmittingCustomOrder ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-600/30'}`}
                    >
                        {isSubmittingCustomOrder ? <Loader2 size={18} className="animate-spin mr-2"/> : <Upload size={16} className="mr-2"/>}
                        {isSubmittingCustomOrder ? 'กำลังส่งข้อมูล...' : 'ส่งรายการให้แอดมิน'}
                    </button>
                </div>
            </div>
        </div>
    );
}
