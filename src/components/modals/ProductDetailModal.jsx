import React, { useState, useEffect } from 'react';
import { X, HeartPulse, ShoppingBag, Loader2, Minus, Plus, ShoppingCart, FileText, CreditCard, Hourglass, Sparkles, Check, Zap, Flame } from 'lucide-react';
import { ProductImage } from '../ui/ProductImage';
import { MACHINE_TREATMENT_ADDONS } from '../../data/machineAddons';

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
    const [selectedPromoIndex, setSelectedPromoIndex] = useState(0);
    const [selectedAddonQuantities, setSelectedAddonQuantities] = useState({});
    const [selectedProgramLetter, setSelectedProgramLetter] = useState('A');
    const [selectedProgramTierIndex, setSelectedProgramTierIndex] = useState(0);

    useEffect(() => {
        setSelectedPromoIndex(0);
        setSelectedAddonQuantities({});
        setSelectedProgramLetter('A');
        setSelectedProgramTierIndex(0);
    }, [selectedProduct?.id]);

    if (!selectedProduct || isCartOpen) return null;

    if (selectedProduct.type === 'course') {
        const hasPrograms = Array.isArray(selectedProduct.programs) && selectedProduct.programs.length > 0;
        const currentProgram = hasPrograms 
            ? (selectedProduct.programs.find(p => p.letter === selectedProgramLetter) || selectedProduct.programs[0])
            : null;
        const currentProgramTiers = currentProgram?.tiers || [];
        const activeProgramTier = currentProgramTiers[selectedProgramTierIndex] || currentProgramTiers[0] || null;

        const rawPackages = Array.isArray(selectedProduct.packages) ? selectedProduct.packages.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            sessions: p.name
        })) : [];
        const promoOptions = Array.isArray(selectedProduct.promoOptions) && selectedProduct.promoOptions.length > 0 
            ? selectedProduct.promoOptions.filter(o => o && (o.name || o.price)) 
            : rawPackages;
        const hasPromoOptions = promoOptions.length > 0;

        let currentPromo = null;
        if (hasPrograms && currentProgram && activeProgramTier) {
            currentPromo = {
                id: `opt_${activeProgramTier.code}`,
                code: activeProgramTier.code,
                name: `${currentProgram.baseName} (${activeProgramTier.sessions} ครั้ง)`,
                programLetter: currentProgram.letter,
                programName: currentProgram.baseName,
                sessions: activeProgramTier.sessions,
                price: activeProgramTier.price,
                originalPrice: activeProgramTier.originalPrice,
                validity: activeProgramTier.validity,
                items: currentProgram.itemsDesc,
                badge: activeProgramTier.badge
            };
        } else {
            currentPromo = hasPromoOptions ? (promoOptions[selectedPromoIndex] || promoOptions[0]) : null;
        }

        let sessionCount = null;
        const courseDisplayName = String(selectedProduct.name || selectedProduct["ชื่อคอส"] || selectedProduct.col_4 || 'โปรแกรมทรีทเม้นท์ผิวหน้า');
        const match = courseDisplayName.match(/\(?(\d+)\s*ครั้ง\)?/);
        if (match) {
            sessionCount = parseInt(match[1]);
        } else if (courseDisplayName.includes('รายครั้ง')) {
            sessionCount = 1;
        }
        const activeSessions = currentPromo?.sessions || selectedProduct.sessions || sessionCount || 1;
        const activePrice = currentPromo ? (Number(currentPromo.price) || Number(selectedProduct.price) || 0) : (Number(selectedProduct.price) || 0);
        const isSingle = String(activeSessions) === '1';
        
        const hasValidity = currentPromo?.validity || (!isSingle && selectedProduct.validity && selectedProduct.validity !== '0' && selectedProduct.validity !== '0 เดือน' && selectedProduct.validity !== '-');
        const validityText = currentPromo?.validity || selectedProduct.validity;

        const toggleAddon = (addon) => {
            setSelectedAddonQuantities(prev => {
                const currentQty = prev[addon.id] || 0;
                if (currentQty > 0) {
                    const next = { ...prev };
                    delete next[addon.id];
                    return next;
                } else {
                    // Default to course's activeSessions (จำนวนครั้งที่ได้รับ) automatically
                    const defaultSessions = Math.max(1, Number(activeSessions) || 1);
                    return {
                        ...prev,
                        [addon.id]: defaultSessions
                    };
                }
            });
        };

        const updateAddonQty = (addonId, delta) => {
            setSelectedAddonQuantities(prev => {
                const currentQty = prev[addonId] || 0;
                const newQty = currentQty + delta;
                if (newQty <= 0) {
                    const next = { ...prev };
                    delete next[addonId];
                    return next;
                }
                return {
                    ...prev,
                    [addonId]: newQty
                };
            });
        };

        const selectedAddonList = MACHINE_TREATMENT_ADDONS
            .filter(addon => (selectedAddonQuantities[addon.id] || 0) > 0)
            .map(addon => {
                const qty = selectedAddonQuantities[addon.id];
                return {
                    ...addon,
                    qty,
                    linePrice: Number(addon.price || 0) * qty
                };
            });

        const totalAddonPrice = selectedAddonList.reduce((sum, a) => sum + a.linePrice, 0);
        const totalAddonSessions = selectedAddonList.reduce((sum, a) => sum + a.qty, 0);
        const finalPrice = activePrice + totalAddonPrice;
        
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
                    
                    {/* 🌟 แสดงรูปภาพคอร์สโปรโมชั่นแนวตั้ง (Vertical Course Image) - ยกเว้น All-in-One A-J เพื่อให้เปิดมาเห็นตัวเลือกทันที 🌟 */}
                    {selectedProduct.image && !hasPrograms && (
                        <div className="w-full bg-slate-50 relative flex items-center justify-center border-b border-gray-100 overflow-hidden max-h-[380px]">
                            <img 
                                src={selectedProduct.image} 
                                alt={courseDisplayName} 
                                className="w-full h-auto max-h-[380px] object-contain" 
                            />
                        </div>
                    )}
                    
                    <div className="p-5 flex-1 relative z-10 pb-24">
                        {selectedProduct.brand && (
                            <span className={`text-[10px] font-black mb-1 inline-block text-pink-500 lowercase`}>
                                {selectedProduct.brand.name}
                            </span>
                        )}
                        <h2 className="text-xl font-black text-[#1d273a] mb-4 leading-tight">{courseDisplayName}</h2>
                        
                        {/* 🌟 1. กรณีคอร์สรวมโปรแกรมทรีทเม้นท์ (A - J All-in-One) 🌟 */}
                        {hasPrograms && currentProgram && (
                            <div className="mb-6">
                                {/* ขั้นตอนที่ 1: เลือกโปรแกรม A ถึง J */}
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                        <Sparkles size={15} className="text-pink-500 fill-pink-500" />
                                        1. เลือกโปรแกรมทรีทเม้นท์ ({selectedProduct.programs.length} โปรแกรม):
                                    </div>
                                    <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                                        โปรแกรม {currentProgram.letter}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {selectedProduct.programs.map((prog) => {
                                        const isProgSelected = currentProgram.letter === prog.letter;
                                        const startPrice = prog.tiers && prog.tiers.length > 0 ? prog.tiers[0].price : '0';
                                        return (
                                            <button
                                                key={prog.letter}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProgramLetter(prog.letter);
                                                    setSelectedProgramTierIndex(0);
                                                }}
                                                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                                                    isProgSelected 
                                                        ? 'border-pink-500 bg-pink-50/80 text-pink-700 shadow-xs ring-1 ring-pink-500/30' 
                                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                                    isProgSelected ? 'bg-pink-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {prog.letter}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className={`text-[11px] leading-tight truncate ${isProgSelected ? 'font-black' : 'font-bold'}`}>
                                                        {(prog.baseName || '').replace(/^[A-J]\.\s*/, '')}
                                                    </div>
                                                    <div className="text-[10px] text-pink-600 font-extrabold mt-0.5">
                                                        เริ่ม ฿{Number(startPrice).toLocaleString()}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* รายละเอียดขั้นตอนของโปรแกรมที่เลือก */}
                                {currentProgram.itemsDesc && (
                                    <div className="mb-4 bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80">
                                        <div className="text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1.5">
                                            <Sparkles size={12} className="text-pink-500" /> 
                                            ขั้นตอนการดูแล: {currentProgram.baseName}
                                        </div>
                                        <div className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed font-medium">
                                            {currentProgram.itemsDesc}
                                        </div>
                                    </div>
                                )}

                                {/* ขั้นตอนที่ 2: เลือกจำนวนครั้ง */}
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                        <Sparkles size={15} className="text-pink-500 fill-pink-500" />
                                        2. เลือกจำนวนครั้ง ({currentProgramTiers.length} แพ็กเกจ):
                                    </div>
                                    <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                                        แตะเลือกแพ็กเกจ
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {currentProgramTiers.map((tier, tIdx) => {
                                        const isTierSelected = selectedProgramTierIndex === tIdx;
                                        return (
                                            <div
                                                key={tier.code || tIdx}
                                                onClick={() => setSelectedProgramTierIndex(tIdx)}
                                                className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                                    isTierSelected 
                                                        ? 'border-pink-500 bg-gradient-to-r from-pink-50/80 to-rose-50/50 shadow-sm ring-1 ring-pink-500/20' 
                                                        : 'border-slate-200 bg-white hover:border-pink-200 hover:bg-slate-50/50'
                                                }`}
                                            >
                                                {tier.badge && (
                                                    <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                                        <Sparkles size={9} /> {tier.badge}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                        isTierSelected ? 'border-pink-600 bg-pink-600 text-white' : 'border-slate-300 bg-white'
                                                    }`}>
                                                        {isTierSelected && <Check size={12} strokeWidth={3} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                                                            {tier.sessions} ครั้ง
                                                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/60">
                                                                {(currentProgram.baseName || '').replace(/^[A-J]\.\s*/, '')}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-medium">
                                                            อายุคอร์ส {tier.validity}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="text-[10px] text-slate-400 font-bold block">จ่ายเพียง</span>
                                                    <span className="text-base font-black text-pink-600">
                                                        ฿{Number(tier.price || 0).toLocaleString()}
                                                    </span>
                                                    {Number(tier.originalPrice) > Number(tier.price) && (
                                                        <span className="text-[10px] text-gray-400 line-through block">
                                                            ฿{Number(tier.originalPrice).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 🌟 2. ตัวเลือกแพ็กเกจโปรโมชั่นทั่วไป (General Promo Options) 🌟 */}
                        {!hasPrograms && hasPromoOptions && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                        <Sparkles size={15} className="text-pink-500 fill-pink-500" />
                                        เลือกโปรโมชั่น ({promoOptions.length} แพ็กเกจ):
                                    </div>
                                    <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                                        แตะเลือกโปรที่ต้องการ
                                    </span>
                                </div>

                                <div className="space-y-2.5">
                                    {promoOptions.map((opt, oIdx) => {
                                        const isSelected = selectedPromoIndex === oIdx;
                                        return (
                                            <div 
                                                key={opt.id || oIdx}
                                                onClick={() => setSelectedPromoIndex(oIdx)}
                                                className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'border-pink-500 bg-gradient-to-br from-pink-50/70 via-white to-rose-50/40 shadow-sm ring-2 ring-pink-500/20' 
                                                        : 'border-slate-200 bg-white hover:border-pink-200 hover:bg-slate-50/50'
                                                }`}
                                            >
                                                {opt.badge && (
                                                    <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                                        <Sparkles size={9} /> {opt.badge}
                                                    </div>
                                                )}

                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                            isSelected ? 'border-pink-600 bg-pink-600 text-white' : 'border-slate-300 bg-white'
                                                        }`}>
                                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-extrabold text-slate-800 text-sm leading-tight mb-1">
                                                                {opt.name || `โปรที่ ${oIdx + 1}`}
                                                            </div>
                                                            {opt.sessions && (
                                                                <div className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1">
                                                                    ✨ จำนวน {opt.sessions} ครั้ง
                                                                </div>
                                                            )}
                                                            {opt.items && (
                                                                <div className="text-[11px] text-slate-500 mt-1 line-clamp-3 leading-relaxed whitespace-pre-line bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                                                                    {opt.items}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <span className="text-[10px] text-slate-400 font-bold block">จ่ายเพียง</span>
                                                        <span className="text-base font-black text-pink-600">
                                                            ฿{Number(opt.price || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col">
                                <span className="text-[11px] font-bold text-gray-500 mb-1">
                                    {hasPrograms || hasPromoOptions ? 'ราคาแพ็กเกจที่เลือก' : 'ราคาขาย'}
                                </span>
                                <span className="text-xl font-black text-[#1d273a]">฿{activePrice.toLocaleString()}</span>
                            </div>
                            <div className="bg-teal-50 rounded-xl p-3 border border-teal-100 flex flex-col">
                                <span className="text-[11px] font-bold text-teal-700 mb-1">จำนวนครั้งที่ได้</span>
                                <span className="text-xl font-black text-teal-800">{activeSessions} ครั้ง</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            <div className="bg-pink-50 text-pink-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
                                หมวดหมู่: {selectedProduct.itemCategory || 'บริการคลินิก'}
                            </div>
                            {hasValidity && (
                                <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
                                    <Hourglass size={14} className="mr-1.5" /> อายุ {validityText}
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

                        {/* 🌟 บริการเสริมพิเศษ / ลงเครื่องรายครั้ง (Add-on Treatments Upsell) 🌟 */}
                        <div className="mb-6">
                            <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 p-3.5 rounded-2xl border border-pink-200/80 mb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-sm shrink-0">
                                            <Sparkles size={15} />
                                        </span>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-800 leading-tight">
                                                บริการเสริมพิเศษ / ลงเครื่องรายครั้ง
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                เริ่มต้น 100.-/ครั้ง • ปรับจำนวนครั้งตามคอร์ส ({activeSessions} ครั้ง) หรือปรับเพิ่ม/ลดได้
                                            </p>
                                        </div>
                                    </div>
                                    {selectedAddonList.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAddonQuantities({})}
                                            className="text-[10px] text-pink-600 font-bold hover:underline bg-white px-2 py-0.5 rounded-lg border border-pink-200 shadow-2xs shrink-0"
                                        >
                                            ล้างทั้งหมด
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* รายการเครื่อง 12 รายการแบบ Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {MACHINE_TREATMENT_ADDONS.map((addon) => {
                                    const qty = selectedAddonQuantities[addon.id] || 0;
                                    const isChecked = qty > 0;
                                    const itemTotal = Number(addon.price) * (qty || 1);

                                    return (
                                        <div
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon)}
                                            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative select-none ${
                                                isChecked
                                                    ? 'border-pink-500 bg-gradient-to-br from-pink-50/80 via-white to-rose-50/50 shadow-xs ring-1 ring-pink-500/20'
                                                    : 'border-slate-200/90 bg-white hover:border-pink-200 hover:bg-slate-50/50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div className={`mt-2 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                    isChecked ? 'border-pink-600 bg-pink-600 text-white' : 'border-slate-300 bg-white'
                                                }`}>
                                                    {isChecked && <Check size={12} strokeWidth={3} />}
                                                </div>

                                                {/* 🌟 รูปภาพเล็กประจำบริการลงเครื่อง 🌟 */}
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 relative flex items-center justify-center shadow-2xs">
                                                    {addon.image ? (
                                                        <img 
                                                            src={addon.image} 
                                                            alt={addon.name} 
                                                            className="w-full h-full object-cover" 
                                                            onError={(e) => { 
                                                                e.target.style.display = 'none'; 
                                                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`w-full h-full flex items-center justify-center text-pink-400 bg-pink-50/50 ${addon.image ? 'hidden' : 'flex'}`}>
                                                        <Sparkles size={16} />
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                                        <span className="text-xs font-extrabold text-slate-800 truncate">
                                                            {addon.name}
                                                        </span>
                                                        <div className="text-right shrink-0">
                                                            <span className="text-xs font-black text-pink-600 block">
                                                                +฿{(isChecked ? itemTotal : addon.price).toLocaleString()}
                                                            </span>
                                                            {isChecked && (
                                                                <span className="text-[9px] text-slate-400 font-bold block">
                                                                    (฿{addon.price} x {qty} ครั้ง)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 line-clamp-1 leading-snug">
                                                        {addon.desc}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-[9px] font-bold text-slate-400">
                                                            ฿{addon.price} / ครั้ง
                                                        </span>
                                                        {addon.tag && (
                                                            <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                                                {addon.tag}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stepper ปรับจำนวนครั้ง (แสดงเมื่อเลือก) */}
                                            {isChecked && (
                                                <div 
                                                    className="mt-2.5 pt-2 border-t border-pink-100 flex items-center justify-between"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="text-[10px] font-bold text-pink-700 flex items-center gap-1">
                                                        <Sparkles size={11} /> จำนวนครั้ง:
                                                    </span>
                                                    <div className="flex items-center gap-1.5 bg-white rounded-lg border border-pink-200 p-0.5 shadow-2xs">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateAddonQty(addon.id, -1)}
                                                            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-pink-100 hover:text-pink-600 transition-colors active:scale-90"
                                                            title="ลดจำนวนครั้ง"
                                                        >
                                                            <Minus size={11} strokeWidth={3} />
                                                        </button>
                                                        <span className="text-xs font-black text-pink-700 w-6 text-center">
                                                            {qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateAddonQty(addon.id, 1)}
                                                            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-pink-100 hover:text-pink-600 transition-colors active:scale-90"
                                                            title="เพิ่มจำนวนครั้ง (เกิน 1 ครั้ง)"
                                                        >
                                                            <Plus size={11} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedAddonList.length > 0 && (
                                <div className="mt-2.5 p-2.5 rounded-xl bg-pink-50/90 border border-pink-200 flex items-center justify-between text-xs animate-in fade-in duration-150">
                                    <span className="font-bold text-pink-800 flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-pink-600" />
                                        เลือกบริการเสริม {selectedAddonList.length} รายการ (รวม {totalAddonSessions} ครั้ง)
                                    </span>
                                    <span className="font-black text-pink-600">
                                        +฿{totalAddonPrice.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 border-t border-gray-100 rounded-b-[32px] flex gap-2.5 z-30">
                        <button 
                            onClick={() => { 
                                if (handleModalAddToCart(currentPromo, selectedAddonList)) {
                                    setSelectedProduct(null); 
                                }
                            }} 
                            className="flex-1 py-3.5 bg-pink-50 text-pink-600 border border-pink-200 rounded-2xl font-bold text-xs sm:text-sm hover:bg-pink-100 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                        >
                            <ShoppingCart size={16} /> เพิ่มลงตะกร้า {selectedAddonList.length > 0 && `(+${selectedAddonList.length})`}
                        </button>
                        <button 
                            onClick={() => {
                                if (handleModalBuyNow) {
                                    handleModalBuyNow(currentPromo, selectedAddonList);
                                } else if (handleModalAddToCart(currentPromo, selectedAddonList)) {
                                    setSelectedProduct(null);
                                }
                            }}
                            className="flex-[1.2] py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-black text-xs sm:text-sm hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-1.5 active:scale-95"
                        >
                            ซื้อทันที • ฿{finalPrice.toLocaleString()}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const productDisplayName = String(selectedProduct.name || selectedProduct["ชื่อสินค้า"] || selectedProduct["ชื่อคอส"] || selectedProduct.col_2 || selectedProduct.col_4 || '');

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
                                       <ProductImage src={img} alt={`${productDisplayName} - ${idx+1}`} fallbackIcon={selectedProduct.type === 'course' ? HeartPulse : ShoppingBag} />
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
                       <ProductImage src={selectedProduct.image} alt={productDisplayName} fallbackIcon={selectedProduct.type === 'course' ? HeartPulse : ShoppingBag} />
                   )}
                   {Number(selectedProduct.salesScore) > 0 && (
                       <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-20 flex items-center gap-1 animate-in fade-in duration-200">
                           <Flame size={13} className="fill-white" />
                           <span>ขายดี {Number(selectedProduct.salesScore) > 1 ? `(${selectedProduct.salesScore})` : ''}</span>
                       </div>
                   )}
               </div>

               <div className="p-5 flex-1 bg-white rounded-t-[32px] -mt-6 relative z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
                   <div className="flex items-center gap-2 mb-2 flex-wrap">
                       {selectedProduct.brand && (
                           <span className={`text-[10px] font-black px-2 py-1 rounded border inline-block ${selectedProduct.brand.color}`}>
                               {selectedProduct.brand.name}
                           </span>
                       )}
                       {Number(selectedProduct.salesScore) > 0 && (
                           <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs inline-flex items-center gap-1 animate-in fade-in duration-200">
                               <Flame size={11} className="fill-white" /> ขายดี {Number(selectedProduct.salesScore) > 1 ? `(${selectedProduct.salesScore})` : ''}
                           </span>
                       )}
                   </div>
                   <h2 className="text-xl font-black text-gray-900 mb-2 leading-tight">{productDisplayName}</h2>
                   {/* 🌟 ช่วงราคาสมาชิกของเซต — คำนวณจากราคาสมาชิกแต่ละชิ้นในเซต */}
                   {(() => {
                     const members = subItems.map(s => Number(s.memberPrice) || 0).filter(v => v > 0);
                     const showMemberRange = ['grouped', 'bundle', 'woosb'].includes(selectedProduct.wooType) && members.length > 0;
                     const showMemberSingle = !['grouped', 'bundle', 'woosb'].includes(selectedProduct.wooType) && Number(selectedProduct.memberPrice) > 0;
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

                   {['grouped', 'bundle', 'woosb'].includes(selectedProduct.wooType) && (
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
