import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Image as ImageIcon, ArrowRight, Sparkles, ShoppingCart, Ticket, HeartPulse, ShoppingBag, Loader2, HistoryIcon, Star, Truck, Percent, Search, X, Gift, ShieldCheck, MessageCircle, CheckCircle2, Zap, LayoutGrid } from 'lucide-react';
import { getFuzzyKey } from '../utils/helpers';
import PriceCompareModal from '../components/modals/PriceCompareModal';

const COURSE_FALLBACKS = [
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1519824145371-29689420aec5?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=500&q=80'
];

const PRODUCT_FALLBACKS = [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=500&q=80'
];

const Shop = ({
    setIsCustomOrderOpen,
    shopTab,
    setShopTab,
    dbProducts = [],
    dbMasterCourses = [],
    wooImagesMap = new Map(),
    selectedPackages,
    setSelectedPackages,
    setSelectedProduct,
    handleAddToCart,
    customerData,
    MOCK_COUPONS,
    handleCollectCoupon,
    buyAgainItems,
    isPaginating,
    shopDisplayLimit
}) => {
    const [priceCheckItem, setPriceCheckItem] = useState(null);
    const [competitorPrice, setCompetitorPrice] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCourseCategory, setActiveCourseCategory] = useState('all');
    const [localDisplayLimit, setLocalDisplayLimit] = useState(10);
    const observerTarget = useRef(null);

    // Reset display limit on tab change
    useEffect(() => {
        setLocalDisplayLimit(10);
    }, [shopTab, activeCourseCategory]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setLocalDisplayLimit(prev => prev + 10);
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [observerTarget]);

    // Stable shuffle function
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const COURSE_CATEGORIES = [
        { id: 'all', label: 'ทั้งหมด' },
        { id: 'facial', label: 'ผิวหน้า' },
        { id: 'machine', label: 'ลงเครื่อง' },
        { id: 'acne_sets', label: 'รักษาสิว' },
        { id: 'nourish', label: 'บำรุง' },
        { id: 'ipl', label: 'เลเซอร์/IPL' }
    ];

    const getCourseCategory = (c) => {
        if (!c) return 'other';
        const type = String(getFuzzyKey(c, ["ประเภท", "col_2"]) || '');
        if (type === 'ผิวหน้า (A-J)') return 'facial';
        if (type === 'เคลียร์สิว') return 'acne_sets';
        if (type === 'ลงเครื่อง') return 'machine';
        if (type === 'รักษาสิว/ฝ้า') return 'acne_sets';
        if (type === 'บำรุงฟื้นฟู') return 'nourish';
        if (type === 'IPL กำจัดขน') return 'ipl';
        if (type === 'วอคอิน') return 'walkin';
        
        let code = String(getFuzzyKey(c, ["รหัสคอส", "col_1"]) || '');
        if (!code) return 'other';
        if (!code.startsWith('F-')) return 'old_courses';
        if (code.startsWith('F-MA') || code.startsWith('F-M')) return 'machine';
        if (code.startsWith('F-S')) return 'acne_sets';
        if (code.startsWith('F-N')) return 'nourish';
        if (code.startsWith('F-AC')) return 'acne_sets';
        if (code.startsWith('F-IPL')) return 'ipl';
        if (/^F-[A-J]/.test(code)) return 'facial';
        return 'other';
    };

    const currentTabItems = useMemo(() => {
        let items = [];
        if (shopTab === 'products') {
            items = dbProducts.filter(p => {
                const name = String(getFuzzyKey(p, ["ชื่อสินค้า", "col_2", "ชื่อ", "name"]) || '').trim();
                const status = String(getFuzzyKey(p, ["สถานะ", "status", "การใช้งาน", "state"]) || '').trim();
                if (!name) return false;
                if (status === 'ร่าง' || status === 'draft' || status === 'ปิดใช้งาน' || status === 'ปิด' || status === 'ไม่แสดง' || status === 'ซ่อน') return false;
                if (p.isStoreUseOnly) return false;
                
                // Exclude WooCommerce courses from physical products tab
                if (p.categories && Array.isArray(p.categories)) {
                    const isCourse = p.categories.some(cat => cat.name && (cat.name.includes('คอร์ส') || cat.name.toLowerCase().includes('course')));
                    if (isCourse) return false;
                }
                
                return true;
            }).map(p => {
                // Ensure standard format for UI
                const rawPrice = Number(getFuzzyKey(p, ["ราคา", "ราคาขาย", "col_5"]) || p.price || 0);
                const isMemberDiscount = p.canDiscount && p.isMemberDiscount; // existing flag support
                const name = String(getFuzzyKey(p, ["ชื่อสินค้า", "col_2", "ชื่อ", "name"]) || p.name).trim();
                const code = String(getFuzzyKey(p, ["รหัส", "col_1"]) || '').trim();
                
                const memberPrice = Number(getFuzzyKey(p, ["ราคาสมาชิก", "col_10"]) || 0);
                
                let isUsingMemberPrice = false;
                if (customerData?.isApproved && memberPrice > 0 && memberPrice < rawPrice) {
                    isUsingMemberPrice = true;
                }
                
                let finalPrice = isUsingMemberPrice ? memberPrice : rawPrice;
                let finalOriginalPrice = isUsingMemberPrice ? rawPrice : (p.originalPrice || 0);
                
                let image = getFuzzyKey(p, ["รูปภาพ", "รูป", "image", "img", "col_13"]) || p.image;
                if (p.images && p.images.length > 0) {
                    image = p.images[0].src;
                }
                if (!image || image.length < 5) {
                    image = (code ? wooImagesMap.get(code.toUpperCase()) : null) || wooImagesMap.get(name.toLowerCase());
                }

                return {
                    ...p,
                    id: p.id,
                    name: name,
                    price: finalPrice,
                    originalPrice: finalOriginalPrice,
                    image: image,
                    isUsingMemberPrice: isUsingMemberPrice,
                    type: 'product',
                    stock: Number(getFuzzyKey(p, ["จำนวนคงเหลือ", "col_12"]) || 0),
                    isBrochure: p.isBrochure || false
                };
            });
        }
        
        else if (shopTab === 'courses' || shopTab === 'single_courses') {
            items = dbMasterCourses.filter(mc => {
                const name = String(getFuzzyKey(mc, ["ชื่อคอส", "col_4"]) || '').trim();
                const status = String(getFuzzyKey(mc, ["สถานะ", "status", "การใช้งาน", "state"]) || '').trim();
                if (!name) return false;
                if (status === 'ร่าง' || status === 'draft' || status === 'ปิดใช้งาน' || status === 'ปิด' || status === 'ไม่แสดง' || status === 'ซ่อน') return false;
                
                const qty = String(getFuzzyKey(mc, ["จำนวนครั้ง", "col_7"]) || '').trim();
                if (shopTab === 'courses' && qty === '1') return false; // Hide single in package tab
                if (shopTab === 'single_courses' && qty !== '1') return false; // Hide package in single tab
                if (getCourseCategory(mc) === 'old_courses') return false;

                if (shopTab === 'single_courses' && activeCourseCategory !== 'all') {
                    if (getCourseCategory(mc) !== activeCourseCategory) return false;
                }

                return true;
            }).map(mc => {
                let rawPrice = Number(getFuzzyKey(mc, ["ราคา", "ราคาขาย", "col_6", "col_5"]) || mc.price || 0);
                const memberPrice = Number(getFuzzyKey(mc, ["ราคาสมาชิก", "col_10", "col_11"]) || 0);
                
                let isUsingMemberPrice = false;
                if (customerData?.isApproved && memberPrice > 0 && memberPrice < rawPrice) {
                    isUsingMemberPrice = true;
                }
                
                let finalPrice = isUsingMemberPrice ? memberPrice : rawPrice;
                let finalOriginalPrice = isUsingMemberPrice ? rawPrice : (mc.originalPrice || 0);

                return {
                    ...mc,
                    id: mc.id,
                    name: String(getFuzzyKey(mc, ["ชื่อคอส", "col_4"]) || mc.name).trim(),
                    price: finalPrice,
                    originalPrice: finalOriginalPrice,
                    image: mc.image,
                    isUsingMemberPrice: isUsingMemberPrice,
                    type: 'course',
                    isBrochure: mc.isBrochure || false
                };
            });
        }

        // Shuffle the valid items first to keep it randomized
        const shuffledItems = shuffleArray(items);

        // Filter by search term if it exists
        return shuffledItems.filter(item => searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [shopTab, dbProducts, dbMasterCourses, searchTerm, activeCourseCategory, wooImagesMap]);



    return (
        <div className="space-y-6 animate-in fade-in duration-300 relative">
            {/* Tab Switcher */}
            <div className="px-1 flex bg-gray-100 rounded-xl p-1 mb-2">
                <button 
                    onClick={() => setShopTab('products')} 
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${shopTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    สินค้า
                </button>
                <button 
                    onClick={() => setShopTab('courses')} 
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${shopTab === 'courses' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    คอร์สแพ็กเกจ
                </button>
                <button 
                    onClick={() => setShopTab('single_courses')} 
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${shopTab === 'single_courses' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    คอร์สรายครั้ง
                </button>
            </div>

            {/* Search Bar & Filters */}
            <div className="px-1 mb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={shopTab === 'products' ? "ค้นหาสินค้า..." : "ค้นหาคอร์ส..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {shopTab === 'single_courses' && (
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-3 pb-1">
                        {COURSE_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCourseCategory(cat.id)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeCourseCategory === cat.id ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-1">
                <button 
                    onClick={() => setIsCustomOrderOpen(true)}
                    className="w-full relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-[24px] p-5 shadow-[0_8px_30px_rgb(79,70,229,0.3)] text-white overflow-hidden text-left hover:shadow-[0_8px_30px_rgb(79,70,229,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center group"
                >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transition-transform duration-1000 ease-in-out group-hover:translate-x-[200%] z-0"></div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>
                    
                    <div className="bg-white/20 backdrop-blur-md p-3.5 rounded-2xl mr-4 border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)] shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon size={30} className="text-white drop-shadow-lg" />
                        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping"></div>
                        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-indigo-600 shadow-sm"></div>
                    </div>

                    <div className="relative z-10 flex-1">
                        <div className="flex items-center space-x-2 mb-1.5">
                            <span className="bg-gradient-to-r from-rose-400 to-orange-500 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/20 text-white shadow-sm flex items-center">
                                <Sparkles size={10} className="mr-1 animate-pulse" /> Fast Order
                            </span>
                        </div>
                        <h2 className="text-[19px] font-black mb-0.5 leading-tight drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                            สั่งสินค้าจากรูปภาพ
                        </h2>
                        <p className="text-[11px] text-blue-50 font-medium leading-snug opacity-90 group-hover:opacity-100 transition-opacity">
                            ถ่ายรูปใบสั่งแพทย์ หรือขวดเดิม<br/>ส่งให้แอดมินจัดยาให้ได้เลย!
                        </p>
                    </div>

                    <div className="bg-white w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg relative z-10 group-hover:bg-blue-50 transition-colors border border-white/50 text-indigo-600">
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </button>
            </div>

            <div className="px-1">
                <a 
                    href="https://thaimart.com/sellers/%E0%B8%A8%E0%B8%B9%E0%B8%99%E0%B8%A2%E0%B9%8C%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%87%E0%B8%B2%E0%B8%A1%E0%B9%84%E0%B8%AD%E0%B8%A3%E0%B8%B4%E0%B8%AA%E0%B9%80%E0%B8%81%E0%B8%B2%E0%B8%B0%E0%B8%AA%E0%B8%A1%E0%B8%B8%E0%B8%A2-zM0AEw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-gradient-to-r from-red-50 to-rose-100/40 border border-red-200/60 rounded-[22px] p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-300"
                >
                    <div className="flex items-center space-x-3">
                        {/* Custom Thaimart Logo SVG */}
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-[#E11D48] shadow-sm">
                            <svg viewBox="0 0 64 64" className="w-full h-full p-1">
                                <path 
                                    d="M46,38 C46,26 38,18 28,18 C18,18 14,24 14,32 C14,37 17,41 20,43 C22,44 24,43 24,41 C24,37 19,35 19,32 C19,27 23,22 28,22 C33,22 37,27 37,32 C37,38 31,43 25,43 C22,43 20,41 19,39 C18,37 16,38 16,40 C16,44 20,47 25,47 C34,47 46,38 46,32" 
                                    fill="none" 
                                    stroke="white" 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                                <circle cx="23" cy="28" r="2.5" fill="white" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="bg-red-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">THAIMART</span>
                                <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                                    <Truck size={10} className="stroke-[2.5]" /> ส่งฟรีทุกชิ้น
                                </span>
                            </div>
                            <h3 className="font-black text-xs text-gray-800 leading-tight">
                                สั่งซื้อผ่านไทยมาร์ท ส่งฟรีทุกราคา!
                            </h3>
                            <p className="text-[10px] text-gray-500 font-medium">
                                ช็อปปิ้งง่ายๆ ไม่มีขั้นต่ำ จัดส่งตรงถึงบ้านคุณ
                            </p>
                        </div>
                    </div>
                    <div className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-2 rounded-xl flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-all gap-0.5 ml-2">
                        <span>สั่งเลย</span>
                        <ArrowRight size={10} />
                    </div>
                </a>
            </div>

            {/* 🌟 ส่วนแสดงโปรโมชั่นโบรชัวร์ (Fast Buy Courses) 🌟 */}
            {shopTab === 'courses' && currentTabItems.some(i => i.isBrochure) && (
                <div className="pt-2 pb-2">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h3 className="text-[15px] font-black text-rose-600 flex items-center bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 shadow-sm">
                            <Sparkles size={18} className="mr-1.5 animate-pulse text-rose-500"/> โปรโมชั่นพิเศษ (แนะนำ)
                        </h3>
                    </div>
                    <div className="flex flex-col gap-4 px-1">
                        {currentTabItems.filter(i => i.isBrochure).map((brochure, idx) => {
                            const hasPackages = brochure.packages && brochure.packages.length > 0;
                            const activePkgId = selectedPackages[brochure.id] || (hasPackages ? brochure.packages[0].id : null);
                            const activePkg = hasPackages ? brochure.packages.find(p => p.id === activePkgId) : null;

                            const displayPrice = activePkg ? (Number(activePkg.price) || 0) : (Number(brochure.price) || 0);
                            const displayOriginalPrice = activePkg ? (Number(activePkg.originalPrice) || 0) : (Number(brochure.originalPrice) || 0);

                            return (
                                <div key={idx} className={`w-full rounded-[24px] shadow-lg border-0 relative overflow-hidden group transition-all bg-gradient-to-br ${String(brochure.theme || '')}`}>
                                    
                                    {/* 🌟 Background Watermark Text 🌟 */}
                                    <div className="absolute -bottom-6 -right-2 text-[100px] font-black text-white/10 leading-none z-0 pointer-events-none select-none tracking-tighter whitespace-nowrap transform -rotate-12 mix-blend-overlay">
                                        {String(brochure.bgText || '').toUpperCase() || String(brochure.name).substring(0, 5).toUpperCase()}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col relative z-10 cursor-pointer" onClick={() => setSelectedProduct(brochure)}>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="bg-white/90 backdrop-blur-md text-rose-600 text-[10px] font-black px-3 py-1 rounded-md shadow-sm uppercase tracking-wider">HOT DEAL</span>
                                            {displayOriginalPrice > displayPrice && displayOriginalPrice > 0 && (
                                                <span className="bg-rose-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm shadow-rose-500/50">
                                                    ลด {Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100) || 0}%
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-white font-black text-lg leading-tight mb-2 drop-shadow-md">{String(brochure.name || '')}</h3>
                                        <p className="text-white/90 text-xs leading-relaxed font-medium mb-4 bg-black/20 p-3 rounded-xl border border-white/10 shadow-inner">{String(brochure.desc || '')}</p>
                                        
                                        {/* Package Selection (1 ครั้ง / 10 ครั้ง) */}
                                        {hasPackages && (
                                            <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
                                                {brochure.packages.map(pkg => (
                                                    <button 
                                                        key={pkg.id}
                                                        onClick={(e) => { e.stopPropagation(); setSelectedPackages(prev => ({...prev, [brochure.id]: pkg.id})); }}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activePkgId === pkg.id ? 'bg-white border-white text-rose-600 shadow-md scale-105' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}`}
                                                    >
                                                        {String(pkg.name || '')}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-auto flex justify-between items-end pt-2 border-t border-white/20">
                                            <div>
                                                {displayOriginalPrice > displayPrice && displayOriginalPrice > 0 && (
                                                    <p className="text-white/60 text-xs line-through mb-0.5">฿{(Number(displayOriginalPrice) || 0).toLocaleString()}</p>
                                                )}
                                                <p className="text-white font-black text-3xl leading-none drop-shadow-md">฿{(Number(displayPrice) || 0).toLocaleString()}</p>
                                                <span className="inline-flex items-center gap-0.5 bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full mt-1.5 shadow-sm border border-amber-300">
                                                    <Star size={8} className="fill-amber-950 text-amber-950" /> +{Math.floor(displayPrice / 100)} แต้ม
                                                </span>
                                            </div>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    if(hasPackages && activePkg) {
                                                        handleAddToCart({ ...brochure, id: activePkg.id, name: `${String(brochure.name || '')} (${String(activePkg.name || '')})`, price: activePkg.price, originalPrice: activePkg.originalPrice });
                                                    } else {
                                                        handleAddToCart(brochure); 
                                                    }
                                                }} 
                                                className="px-5 py-3 bg-white text-rose-600 rounded-xl flex items-center justify-center font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <ShoppingCart size={18} className="mr-1.5"/> ซื้อ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-[13px] font-black text-gray-800 mb-3 px-1 flex items-center"><Ticket size={16} className="mr-1.5 text-rose-500"/> เก็บโค้ดส่วนลด</h3>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-3 snap-x px-1">
                    {MOCK_COUPONS.filter(c => !c.code?.includes('LUCKY') && !c.isPersonal && !c.isBatch && c.isActive !== false).map((coupon, i) => {
                    const isCollected = customerData?.collectedCoupons?.includes(coupon.code);
                    return (
                    <div key={i} className="snap-center shrink-0 w-64 bg-gradient-to-r from-rose-400 to-orange-400 rounded-2xl p-[2px] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-gray-100 rounded-full z-10"></div>
                        <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-gray-100 rounded-full z-10"></div>
                        
                        <div className="bg-white rounded-[14px] flex h-full">
                            <div className="flex-1 p-3 border-r-2 border-dashed border-gray-200 flex flex-col justify-center pl-4">
                                <p className="font-black text-rose-500 text-xl leading-none mb-1">
                                {coupon.type === 'percent' ? `${coupon.value}%` : `฿${coupon.value}`}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium leading-tight">{coupon.desc}</p>
                            </div>
                            <div className="w-20 bg-rose-50/50 flex flex-col justify-center items-center rounded-r-[14px]">
                                <button 
                                onClick={() => handleCollectCoupon(coupon.code)}
                                disabled={isCollected}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-all ${isCollected ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95'}`}
                                >
                                {isCollected ? 'เก็บแล้ว' : 'เก็บคูปอง'}
                                </button>
                            </div>
                        </div>
                    </div>
                    )})}
                </div>
            </div>

            {buyAgainItems.length > 0 && (
            <div>
                <div className="flex justify-between items-end mb-3 px-1">
                    <h3 className="text-[13px] font-black text-rose-500 flex items-center"><HistoryIcon size={16} className="mr-1.5"/> ซื้ออีกครั้ง</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 snap-x px-1">
                    {buyAgainItems.map((prod, idx) => (
                    <div key={idx} onClick={() => setSelectedProduct(prod)} className="snap-start shrink-0 w-[72px] bg-white rounded-[10px] border border-rose-100 p-1 shadow-sm flex flex-col relative group hover:border-rose-300 transition-all cursor-pointer active:scale-95">
                        <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[7px] font-black px-1.5 py-[2px] rounded-full z-10 shadow-sm border border-white leading-none">ซื้อซ้ำ</div>
                        
                        <div className="w-full aspect-square bg-gray-50 rounded-md overflow-hidden mb-1 flex items-center justify-center relative">
                            {prod.image ? (
                                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center ${prod.type === 'course' ? 'bg-teal-50 text-teal-300' : 'bg-blue-50 text-blue-300'}`}>
                                    {prod.type === 'course' ? <HeartPulse size={16} /> : <ShoppingBag size={16} />}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col flex-1 justify-between text-center px-0.5 pb-0.5">
                            <h3 className="font-bold text-gray-800 text-[8px] line-clamp-2 leading-[1.15] mb-0.5 min-h-[18px] flex items-center justify-center">{prod.name}</h3>
                            <span className={`font-black text-[9px] ${prod.type === 'course' ? 'text-teal-600' : 'text-blue-600'}`}>฿{prod.price.toLocaleString()}</span>
                        </div>
                    </div>
                    ))}
                    </div>
                </div>
            )}

            {/* 🌟 สินค้าและบริการทั้งหมด (Main Grid) 🌟 */}
            {currentTabItems.filter(i => !i.isBrochure).length > 0 && (
                <div className="pt-2">
                    <div className="flex justify-between items-end mb-3 px-1">
                        <h3 className="text-[14px] font-black text-gray-800 flex items-center">
                            {shopTab === 'products' && <><ShoppingBag size={18} className="mr-1.5 text-blue-500"/> สินค้าทั้งหมด</>}
                            {shopTab === 'courses' && <><HeartPulse size={18} className="mr-1.5 text-teal-500"/> คอร์สแพ็กเกจทั้งหมด</>}
                            {shopTab === 'single_courses' && <><LayoutGrid size={18} className="mr-1.5 text-rose-500"/> คอร์สรายครั้งทั้งหมด</>}
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 px-1 pb-4">
                        {currentTabItems.filter(i => !i.isBrochure).slice(0, localDisplayLimit).map((item, idx) => {
                            if (shopTab === 'courses' || shopTab === 'single_courses') {
                                return (
                                    <div key={idx} onClick={() => setSelectedProduct(item)} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col relative transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer pb-2">
                                        <div className="relative aspect-[4/3] bg-slate-50/50 p-2 border-b border-slate-50 overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.target.onerror = null; e.target.src = COURSE_FALLBACKS[idx % COURSE_FALLBACKS.length]; }} />
                                            ) : (
                                                <img src={COURSE_FALLBACKS[idx % COURSE_FALLBACKS.length]} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            )}
                                            {Number(item.price) > 500 && (
                                                <div className="absolute bottom-0 left-0 w-full flex h-6 text-[9px] font-black select-none z-10">
                                                    <div className="flex-[1.2] bg-[#0db09c] text-white flex items-center justify-center gap-0.5 px-1.5">
                                                        <Zap size={9} className="stroke-[3] text-yellow-300 fill-yellow-300" />
                                                        <div className="flex flex-col leading-none scale-[0.8] origin-left">
                                                            <span>รับทันที</span>
                                                            <span className="text-[5px] opacity-90 font-medium">คลินิกโค้ดคุ้ม</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 bg-[#ffb300] text-[#730] flex items-center justify-center gap-0.5 px-1.5">
                                                        <Percent size={9} className="stroke-[3]" />
                                                        <div className="flex flex-col leading-none scale-[0.8] origin-left">
                                                            <span>ส่วนลด</span>
                                                            <span className="text-[5px] opacity-90 font-medium">ร้านโค้ดคุ้ม</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col flex-1 pb-1">
                                            <h4 className="font-bold text-slate-700 text-[11px] sm:text-xs line-clamp-2 leading-tight mb-1 text-left h-8">{item.name}</h4>
                                            
                                            {/* Shopee Style Price Layout */}
                                            <div className="flex items-baseline gap-0.5 mt-1 text-left flex-wrap">
                                                <span className="text-[#EE4D2D] font-black text-[10px]">฿</span>
                                                <span className="text-[#EE4D2D] font-black text-base leading-none">{(Number(item.price)||0).toLocaleString()}</span>
                                                {item.originalPrice > item.price && item.originalPrice > 0 && (
                                                    <span className="text-[9px] text-gray-400 line-through ml-1">฿{(Number(item.originalPrice)||0).toLocaleString()}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 mt-1.5 mb-2">
                                                <span className="bg-amber-50 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-amber-200">
                                                    <Star size={8} className="fill-amber-400 text-amber-500" /> +{Math.floor((Number(item.price) || 0) / 100)} แต้ม
                                                </span>
                                                {item.stock <= 0 && (
                                                    <span className="text-[9px] font-bold text-red-500 ml-auto bg-red-50 px-1 rounded border border-red-100">หมดชั่วคราว</span>
                                                )}
                                            </div>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }} 
                                                disabled={item.stock <= 0}
                                                className={`w-full py-1.5 rounded-xl flex items-center justify-center text-xs font-bold gap-1 shadow-sm mt-1 transition-colors ${
                                                    item.stock <= 0 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white active:scale-95'
                                                }`}
                                            >
                                                <ShoppingCart size={14} /> เพิ่ม
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                            
                            return (
                                <div key={idx} onClick={() => setSelectedProduct(item)} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col relative transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer pb-2">
                                    {/* Thaimart Free Shipping Badge */}
                                    <div className="absolute top-0 left-0 bg-[#E11D48] text-white text-[8px] font-black px-2 py-0.5 rounded-br-xl shadow-sm z-20 flex items-center gap-1">
                                        <svg viewBox="0 0 64 64" className="w-3.5 h-3.5">
                                            <path 
                                                d="M46,38 C46,26 38,18 28,18 C18,18 14,24 14,32 C14,37 17,41 20,43 C22,44 24,43 24,41 C24,37 19,35 19,32 C19,27 23,22 28,22 C33,22 37,27 37,32 C37,38 31,43 25,43 C22,43 20,41 19,39 C18,37 16,38 16,40 C16,44 20,47 25,47 C34,47 46,38 46,32" 
                                                fill="none" 
                                                stroke="white" 
                                                strokeWidth="5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                            />
                                            <circle cx="23" cy="28" r="3.5" fill="white" />
                                        </svg>
                                        <span>ส่งฟรี</span>
                                    </div>

                                    {/* Tags */}
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
                                        {item.isUsingMemberPrice && (
                                            <span className="bg-teal-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/50">ราคาสมาชิก</span>
                                        )}
                                        {item.canDiscount && item.isMemberDiscount && !item.isUsingMemberPrice && (
                                            <span className="bg-teal-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/50">MEMBER</span>
                                        )}
                                    </div>

                                    <div className="relative aspect-[4/3] bg-slate-50/50 p-2 border-b border-slate-50 overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.target.onerror = null; e.target.src = PRODUCT_FALLBACKS[idx % PRODUCT_FALLBACKS.length]; }} />
                                        ) : (
                                            <img src={PRODUCT_FALLBACKS[idx % PRODUCT_FALLBACKS.length]} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        )}
                                        {Number(item.price) > 500 && (
                                            <div className="absolute bottom-0 left-0 w-full flex h-6 text-[9px] font-black select-none z-10">
                                                <div className="flex-[1.2] bg-[#0db09c] text-white flex items-center justify-center gap-0.5 px-1.5">
                                                    <Truck size={9} className="stroke-[3]" />
                                                    <div className="flex flex-col leading-none scale-[0.8] origin-left">
                                                        <span>ส่งฟรี</span>
                                                        <span className="text-[5px] opacity-90 font-medium">ร้านโค้ดคุ้ม</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-[#ffb300] text-[#730] flex items-center justify-center gap-0.5 px-1.5">
                                                    <Percent size={9} className="stroke-[3]" />
                                                    <div className="flex flex-col leading-none scale-[0.8] origin-left">
                                                        <span>ส่วนลด</span>
                                                        <span className="text-[5px] opacity-90 font-medium">ร้านโค้ดคุ้ม</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-3 flex flex-col flex-1 relative pr-12 pb-1">
                                        <h4 className="font-bold text-slate-700 text-[11px] sm:text-xs line-clamp-2 leading-tight mb-1 text-left h-8">{item.name}</h4>
                                        
                                        {/* Shopee Style Price Layout */}
                                        <div className="flex items-baseline gap-0.5 mt-1 text-left flex-wrap">
                                            <span className="text-[#EE4D2D] font-black text-[10px]">฿</span>
                                            <span className="text-[#EE4D2D] font-black text-base leading-none">{(Number(item.price)||0).toLocaleString()}</span>
                                            {item.originalPrice > item.price && item.originalPrice > 0 && (
                                                <span className="text-[9px] text-gray-400 line-through ml-1">฿{(Number(item.originalPrice)||0).toLocaleString()}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 mt-1.5">
                                            <span className="bg-amber-50 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-amber-200">
                                                <Star size={8} className="fill-amber-400 text-amber-500" /> +{Math.floor((Number(item.price) || 0) / 100)} แต้ม
                                            </span>
                                        </div>

                                        <div className="absolute bottom-1.5 right-1.5 flex flex-col gap-1.5 items-end">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setPriceCheckItem(item); }} 
                                                className="relative overflow-hidden bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>
                                                <Sparkles size={10} className="relative z-10 animate-pulse" /> 
                                                <span className="relative z-10 drop-shadow-sm">เจอที่อื่นถูกกว่า?</span>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }} 
                                                className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-[#EE4D2D] hover:text-white active:scale-95 transition-colors shadow-sm border border-rose-100"
                                            >
                                                <ShoppingCart size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Infinite Scroll Loader */}
                    {localDisplayLimit < currentTabItems.filter(i => !i.isBrochure).length && (
                        <div ref={observerTarget} className="w-full flex justify-center py-6">
                            <Loader2 size={24} className="text-gray-300 animate-spin" />
                        </div>
                    )}
                </div>
            )}

            {/* fallback list items if currentTabItems has items but none match brochure/etc */}
            {!currentTabItems.some(i => i.isBrochure) && buyAgainItems.length === 0 && currentTabItems.filter(i => !i.isBrochure).length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    {shopTab === 'courses' ? <HeartPulse size={32} className="mx-auto text-gray-200 mb-2"/> : <ShoppingBag size={32} className="mx-auto text-gray-200 mb-2"/>}
                    <p className="text-xs font-bold text-gray-400">{shopTab === 'courses' ? 'ไม่พบคอร์สในระบบ' : 'ไม่พบสินค้าในระบบ'}</p>
                </div>
            )}

            {isPaginating && (
            <div className="flex justify-center items-center py-6 animate-in fade-in">
                <Loader2 className="animate-spin text-[#EE4D2D]" size={24} />
            </div>
            )}
            {shopDisplayLimit >= currentTabItems.length && currentTabItems.length > 0 && (
            <div className="text-center py-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">แสดงรายการทั้งหมดแล้ว</p>
            </div>
            )}

            {/* 🌟 Price Check Modal 🌟 */}
            <PriceCompareModal
                isOpen={!!priceCheckItem}
                onClose={() => setPriceCheckItem(null)}
                product={priceCheckItem}
            />
        </div>
    );
};

export default Shop;
