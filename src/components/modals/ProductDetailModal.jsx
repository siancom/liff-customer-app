import React from 'react';
import { X, HeartPulse, ShoppingBag, Loader2, Minus, Plus, ShoppingCart, FileText, CreditCard, Hourglass } from 'lucide-react';
import { ProductImage } from '../ui/ProductImage';

export default function ProductDetailModal({
    selectedProduct,
    isCartOpen,
    setSelectedProduct,
    activeImageIndex,
    setActiveImageIndex,
    isLoadingSubItems,
    subItems,
    selectedVariation,
    setSelectedVariation,
    groupedSelections,
    setGroupedSelections,
    handleModalAddToCart,
    handleModalBuyNow
}) {
    if (!selectedProduct || isCartOpen) return null;

    if (selectedProduct.type === 'course') {
        let sessionCount = null;
        const match = selectedProduct.name.match(/\(?(\d+)\s*ครั้ง\)?/);
        if (match) {
            sessionCount = parseInt(match[1]);
        } else if (selectedProduct.name.includes('รายครั้ง')) {
            sessionCount = 1;
        }
        const isSingle = sessionCount === 1;
        
        const hasValidity = !isSingle && selectedProduct.validity && selectedProduct.validity !== '0' && selectedProduct.validity !== '0 เดือน' && selectedProduct.validity !== '-';
        
        return (
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
                <div className="bg-white w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col hide-scrollbar">
                    
                    <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between z-20 rounded-t-[32px] sm:rounded-[32px] sm:rounded-b-none">
                        <div className="flex items-center text-pink-500 font-bold">
                            <FileText size={20} className="mr-2" /> 
                            รายละเอียดคอร์ส
                        </div>
                        <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><X size={16} /></button>
                    </div>
                    
                    <div className="p-5 flex-1 relative z-10 pb-24">
                        {selectedProduct.brand && (
                            <span className={`text-[10px] font-black mb-1 inline-block text-pink-500 lowercase`}>
                                {selectedProduct.brand.name}
                            </span>
                        )}
                        <h2 className="text-xl font-black text-[#1d273a] mb-6 leading-tight">{selectedProduct.name}</h2>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col">
                                <span className="text-[11px] font-bold text-gray-500 mb-1">ราคาขาย</span>
                                <span className="text-xl font-black text-[#1d273a]">฿{(Number(selectedProduct.price)||0).toLocaleString()}</span>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 flex flex-col">
                                <span className="text-[11px] font-bold text-[#c2410c] mb-1">เครดิต / วงเงิน</span>
                                <span className="text-xl font-black text-[#c2410c]">฿{(Number(selectedProduct.credit)||0).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            <div className="bg-pink-50 text-pink-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
                                หมวดหมู่: {selectedProduct.itemCategory || 'บริการคลินิก'}
                            </div>
                            {hasValidity && (
                                <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
                                    <Hourglass size={14} className="mr-1.5" /> อายุ {selectedProduct.validity}
                                </div>
                            )}
                            {selectedProduct.isVip && (
                                <div className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
                                    <CreditCard size={14} className="mr-1.5" /> แถม VIP Card
                                </div>
                            )}
                        </div>
                        
                        {(selectedProduct.desc || selectedProduct.receivedItems) && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-700 mb-2">รายการที่ได้รับในคอร์ส:</h3>
                                <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-4">
                                    {selectedProduct.desc && (
                                        <div>
                                            <div className="font-bold text-gray-700 mb-1">รายละเอียด / สินค้าที่ได้รับ:</div>
                                            <div className="whitespace-pre-line pl-2">{selectedProduct.desc.replace(/\\n/g, '\n')}</div>
                                        </div>
                                    )}
                                    {selectedProduct.receivedItems && (
                                        <div>
                                            <div className="font-bold text-gray-700 mb-1">คอร์สย่อย/เสริม:</div>
                                            <div className="whitespace-pre-line pl-2">{selectedProduct.receivedItems.replace(/\\n/g, '\n')}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 rounded-b-[32px]">
                        <button onClick={() => { if(handleModalAddToCart()) setSelectedProduct(null); }} className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold text-sm hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/30 flex items-center justify-center">
                            เพิ่มลงตะกร้า
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
           <div className="bg-gray-50 w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col">
               <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:bg-white/80 transition-colors z-20 shadow-sm"><X size={18} /></button>
               
               <div className="w-full aspect-square bg-white relative shrink-0">
                   {selectedProduct.images && selectedProduct.images.length > 1 ? (
                       <>
                           <div 
                               className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full"
                               onScroll={(e) => {
                                   if (e.target.clientWidth > 0) {
                                       setActiveImageIndex(Math.round(e.target.scrollLeft / e.target.clientWidth));
                                   }
                               }}
                           >
                               {selectedProduct.images.map((img, idx) => (
                                   <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                                       <ProductImage src={img} alt={`${selectedProduct.name} - ${idx+1}`} fallbackIcon={selectedProduct.type === 'course' ? HeartPulse : ShoppingBag} />
                                   </div>
                               ))}
                           </div>
                           <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                               {selectedProduct.images.map((_, idx) => (
                                   <div 
                                       key={idx} 
                                       className={`h-1.5 rounded-full transition-all shadow-sm ${idx === activeImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                                   />
                               ))}
                           </div>
                       </>
                   ) : (
                       <ProductImage src={selectedProduct.image} alt={selectedProduct.name} fallbackIcon={selectedProduct.type === 'course' ? HeartPulse : ShoppingBag} />
                   )}
               </div>

               <div className="p-5 flex-1 bg-white rounded-t-[32px] -mt-6 relative z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
                   {selectedProduct.brand && (
                       <span className={`text-[10px] font-black px-2 py-1 rounded border mb-2 inline-block ${selectedProduct.brand.color}`}>
                           {selectedProduct.brand.name}
                       </span>
                   )}
                   <h2 className="text-xl font-black text-gray-900 mb-2 leading-tight">{selectedProduct.name}</h2>
                   {/* 🌟 ช่วงราคาสมาชิกของเซต — คำนวณจากราคาสมาชิกแต่ละชิ้นในเซต */}
                   {(() => {
                     const members = subItems.map(s => Number(s.memberPrice) || 0).filter(v => v > 0);
                     const showMemberRange = selectedProduct.wooType === 'grouped' && members.length > 0;
                     const showMemberSingle = selectedProduct.wooType !== 'grouped' && Number(selectedProduct.memberPrice) > 0;
                     if (!showMemberRange && !showMemberSingle) return null;
                     return (
                       <div className="inline-flex items-center gap-1.5 mb-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                         <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wide">ราคาสมาชิก</span>
                         <span className="text-[13px] font-black text-emerald-700">
                           {showMemberRange
                             ? `฿${Math.min(...members).toLocaleString()} - ฿${Math.max(...members).toLocaleString()}`
                             : `฿${Number(selectedProduct.memberPrice).toLocaleString()}`}
                         </span>
                       </div>
                     );
                   })()}
                   <div className="flex items-end gap-2 mb-4">
                       {selectedProduct.priceRange ? (
                           <span className="text-2xl font-black text-[#EE4D2D]">{selectedProduct.priceRange}</span>
                       ) : (
                           <span className="text-2xl font-black text-[#EE4D2D]">฿{Number(selectedProduct.price || 0).toLocaleString()}</span>
                       )}
                       {!selectedProduct.priceRange && selectedProduct.originalPrice > selectedProduct.price && (
                           <span className="text-sm text-gray-400 line-through mb-1">฿{Number(selectedProduct.originalPrice || 0).toLocaleString()}</span>
                       )}
                   </div>
                   
                   {selectedProduct.desc && (
                       <div className="mb-6">
                           <h3 className="text-xs font-bold text-gray-500 mb-2">รายละเอียด</h3>
                           <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedProduct.desc}</p>
                       </div>
                   )}

                   {/* Variations / Sub-items */}
                   {selectedProduct.wooType === 'variable' && (
                       <div className="mb-6">
                           <h3 className="text-xs font-bold text-gray-500 mb-2">เลือกตัวเลือก</h3>
                           {isLoadingSubItems ? (
                               <div className="flex items-center text-[10px] text-gray-500"><Loader2 size={14} className="animate-spin mr-2"/> กำลังโหลดตัวเลือก...</div>
                           ) : (
                               <div className="flex flex-wrap gap-2">
                                   {subItems.map((variation, idx) => {
                                       const isSelected = selectedVariation?.id === variation.id;
                                       const attrs = variation.attributes.map(a => a.option).join(', ');
                                       return (
                                           <button 
                                               key={idx}
                                               onClick={() => setSelectedVariation(variation)}
                                               className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}
                                           >
                                               {attrs} (+฿{parseFloat(variation.price || 0).toLocaleString()}{Number(variation.memberPrice) > 0 && Number(variation.memberPrice) < parseFloat(variation.price || 0) ? ` / สมาชิก ฿${Number(variation.memberPrice).toLocaleString()}` : ''})
                                           </button>
                                       );
                                   })}
                               </div>
                           )}
                       </div>
                   )}

                   {selectedProduct.wooType === 'grouped' && (
                       <div className="mb-6">
                           <h3 className="text-xs font-bold text-gray-500 mb-2">รายการในเซต</h3>
                           {isLoadingSubItems ? (
                               <div className="flex items-center text-[10px] text-gray-500"><Loader2 size={14} className="animate-spin mr-2"/> กำลังโหลดรายการ...</div>
                           ) : (
                               <div className="space-y-2">
                                   {subItems.map((subItem, idx) => (
                                       <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
                                           <div className="flex items-center gap-2 flex-1">
                                               <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
                                                   <img src={subItem.images?.[0]?.src} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                               </div>
                                               <div>
                                                   <p className="text-[10px] font-bold text-gray-800 line-clamp-1">{subItem.name}</p>
                                                   <p className="text-[10px] text-[#EE4D2D] font-bold flex items-center gap-1.5">
                                                       ฿{parseFloat(subItem.price||0).toLocaleString()}
                                                       {Number(subItem.memberPrice) > 0 && Number(subItem.memberPrice) < parseFloat(subItem.price || 0) && (
                                                           <span className="text-emerald-600">| สมาชิก ฿{Number(subItem.memberPrice).toLocaleString()}</span>
                                                       )}
                                                   </p>
                                               </div>
                                           </div>
                                           <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-0.5 shrink-0 ml-2">
                                               <button onClick={() => setGroupedSelections(prev => ({...prev, [subItem.id]: Math.max(0, (prev[subItem.id] || 0) - 1)}))} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md"><Minus size={12}/></button>
                                               <span className="text-[11px] font-bold w-4 text-center">{groupedSelections[subItem.id] || 0}</span>
                                               <button onClick={() => setGroupedSelections(prev => ({...prev, [subItem.id]: (prev[subItem.id] || 0) + 1}))} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md"><Plus size={12}/></button>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   )}

                   <div className="grid grid-cols-2 gap-3 mt-6">
                       <button onClick={() => { if(handleModalAddToCart()) setSelectedProduct(null); }} className="py-3.5 bg-teal-50 text-teal-600 rounded-xl font-bold text-xs hover:bg-teal-100 transition-colors border border-teal-100 flex items-center justify-center"><ShoppingCart size={16} className="mr-1.5"/> เพิ่มลงตะกร้า</button>
                       <button onClick={handleModalBuyNow} className="py-3.5 bg-[#EE4D2D] text-white rounded-xl font-bold text-xs hover:bg-[#d64124] transition-colors shadow-md shadow-red-500/20">ซื้อเลย</button>
                   </div>
               </div>
           </div>
        </div>
    );
}
