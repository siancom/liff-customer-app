import React, { useState, useEffect, useMemo } from 'react';
import { 
  QrCode, Clock, CheckCircle, CreditCard, ChevronRight, User, 
  AlertCircle, Info, Ticket, Phone, Loader2, ArrowRight, Tag, 
  LogOut, Sparkles, MapPin, Award, Banknote, ShoppingBag, HeartPulse,
  History as HistoryIcon, ShoppingCart, ReceiptText
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { auth, getAppCollection } from './config/firebase';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';

import Shop from './pages/Shop';
import Orders from './pages/Orders';
import CartCheckoutModal from './components/modals/CartCheckoutModal';
import ProductDetailModal from './components/modals/ProductDetailModal';
import OrderDetailModal from './components/modals/OrderDetailModal';
import { fetchWithProxy, WOO_CFG } from './utils/wooProxy';
import { MOCK_COUPONS } from './data/mockData';

// --- UTILS ---
import { buildCustomerData } from './utils/customerUtils';

function parseNumber(val) {
  if (val === undefined || val === null) return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

function getFuzzyKey(obj, targetKeys) {
  if (!obj) return undefined;
  const targets = Array.isArray(targetKeys) ? targetKeys : [targetKeys];
  for (let target of targets) {
    if (obj[target] !== undefined) return obj[target];
    const cleanTarget = target.replace(/\s/g, '').toLowerCase();
    const foundKey = Object.keys(obj).find(k => {
        const cleanK = k.replace(/[\s\u200B-\u200D\uFEFF"'\r\n]/g, '').toLowerCase();
        return cleanK === cleanTarget || cleanK.includes(cleanTarget);
    });
    if (foundKey) return obj[foundKey];
  }
  return undefined;
}

export default function CustomerApp() {
  const [appState, setAppState] = useState('loading'); // loading, login, dashboard
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerData, setCustomerData] = useState(null);
  
  // 🌟 ตัวแปรสำหรับเก็บข้อมูลจาก LINE LIFF
  const [lineProfile, setLineProfile] = useState(null);
  
  // 🛑 กรุณานำ LIFF ID ของคุณมาใส่ตรงนี้ (ถ้ามี) 🛑
  const LIFF_ID = "1657901378-jqDBnplK"; // เช่น "165xxxxxxx-xxxxxxx"

  // 🌟 STATE สำหรับเก็บข้อมูลจาก Firebase 🌟
  const [user, setUser] = useState(null);
  const [dbCourses, setDbCourses] = useState([]);
  const [dbCustomersRaw, setDbCustomersRaw] = useState([]);
  const [dbHistories, setDbHistories] = useState([]);

  const [activeNav, setActiveNav] = useState('home'); 
  const [showQR, setShowQR] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 🌟 NEW STATE FOR SHOP & CART 🌟
  const [dbWooProducts, setDbWooProducts] = useState([]);
  const [wooImagesMap, setWooImagesMap] = useState(new Map());
  const [shopTab, setShopTab] = useState('products');
  const [cart, setCart] = useState([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // 🌟 ORDER HISTORY STATE 🌟
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState(false);

  const handleAddToCart = (item) => {
      setCart(prev => {
          const existing = prev.find(i => i.id === item.id);
          if (existing) {
              return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
          }
          return [...prev, { ...item, qty: 1 }];
      });
      console.log('Added to cart:', item);
  };

  const adjustCartQty = (id, delta) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) {
              const newQty = Math.max(1, item.qty + delta);
              return { ...item, qty: newQty };
          }
          return item;
      }));
  };

  const removeFromCart = (id) => {
      setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateCartTotals = () => {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      return { subtotal, autoDiscountPercent: 0, autoDiscountAmount: 0, manualDiscountAmount: 0, finalPrice: subtotal };
  };

  const buyAgainItems = useMemo(() => {
    if (!customerData?.history || !dbWooProducts) return [];
    const pastNames = [...new Set(customerData.history.map(h => getFuzzyKey(h, ["ชื่อสินค้า", "รายการ", "col_18"])).filter(Boolean))];
    return dbWooProducts.filter(p => pastNames.some(name => p.name.includes(name) || name.includes(p.name)));
  }, [customerData, dbWooProducts]);

  // 1. โหลดและ Initialize LINE LIFF SDK
  useEffect(() => {
    const initLiff = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
          try {
            await window.liff.init({ liffId: LIFF_ID });
            
            if (window.liff.isLoggedIn()) {
              const profile = await window.liff.getProfile();
              setLineProfile({
                displayName: profile.displayName,
                pictureUrl: profile.pictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}&backgroundColor=b6e3f4`
              });
              setAppState('login'); 
            } else {
              window.liff.login();
            }
          } catch (initError) {
            console.warn("LIFF Init Failed (ใช้โหมดจำลองแทน):", initError);
            fallbackToMockMode();
          }
        };
      } catch (err) {
        console.error("Script Load Error", err);
        fallbackToMockMode();
      }
    };

    const fallbackToMockMode = () => {
      setLineProfile({
        displayName: "LINE User (จำลอง)",
        pictureUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=LINEUser&backgroundColor=e2e8f0`
      });
      setTimeout(() => setAppState('login'), 1000);
    };

    initLiff();
  }, []);

  // 2. 🚀 FIREBASE SETUP: เข้าสู่ระบบและดึงข้อมูล 🚀
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          try {
            await signInWithCustomToken(auth, window.__initial_auth_token);
          } catch (tokenErr) {
            console.warn("Custom token mismatch. Falling back to anonymous auth.", tokenErr);
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWooProducts = async () => {
      if (!WOO_CFG.url) return;
      try {
        const newImgMap = new Map();
        const allProducts = [];
        let page = 1;
        let hasMore = true;
        while (hasMore && page <= 10) {
          const data = await fetchWithProxy(`${WOO_CFG.url.replace(/\/$/, '')}/wp-json/wc/v3/products?per_page=100&page=${page}`, { method: 'GET' });
          if (Array.isArray(data) && data.length > 0) {
            data.forEach(wp => {
              allProducts.push(wp);
              if (wp.images && wp.images.length > 0) {
                const imgSrc = wp.images[0].src;
                if (wp.sku) newImgMap.set(String(wp.sku).trim().toUpperCase(), imgSrc);
                if (wp.name) newImgMap.set(String(wp.name).toLowerCase().trim(), imgSrc);
              }
            });
            if (data.length < 100) hasMore = false;
            else page++;
          } else {
            hasMore = false;
          }
        }
        setWooImagesMap(newImgMap);
        setDbWooProducts(allProducts);
      } catch (err) {
        console.error("Failed to fetch woo products:", err);
      }
    };
    fetchWooProducts();
  }, []);

  useEffect(() => {
    if (!user) return;

    // 2.1 ดึงข้อมูลคอร์ส
    const unsubCourses = onSnapshot(getAppCollection('courses'), (snapshot) => {
      setDbCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Course fetch error:", err));

    // 2.2 ดึงข้อมูลลูกค้า
    const unsubCustomers = onSnapshot(getAppCollection('customers'), (snapshot) => {
      setDbCustomersRaw(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Customer fetch error:", err));

    // 2.3 ดึงประวัติ
    const unsubHistories = onSnapshot(getAppCollection('histories'), (snapshot) => {
      setDbHistories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("History fetch error:", err));

    return () => { unsubCourses(); unsubCustomers(); unsubHistories(); };
  }, [user]);


  // 3. ฟังก์ชันตรวจสอบเบอร์โทรศัพท์ (Login ด้วยข้อมูลจาก Firebase)
  const handleLogin = (e) => {
    e.preventDefault();
    setAppState('loading');
    setErrorMsg('');

    setTimeout(() => {
      const cleanPhone = phoneNumber.trim();
      
      // ค้นหาลูกค้าจากฐานข้อมูล Firebase
      const rawCustomer = dbCustomersRaw.find(c => getFuzzyKey(c, "เบอร์โทร") === cleanPhone);
      
      if (rawCustomer) {
        // Use central utility to build consistent customer data
        const builtData = buildCustomerData(rawCustomer, cleanPhone, dbHistories, dbCourses);
        
        setCustomerData({
          ...builtData,
          lineDisplayName: lineProfile?.displayName,
          lineProfilePic: lineProfile?.pictureUrl
        });
        
        setAppState('dashboard');
        setActiveNav('home');
      } else {
        setErrorMsg('ไม่พบข้อมูลสำหรับเบอร์โทรศัพท์นี้ กรุณาลองใหม่อีกครั้งค่ะ');
        setAppState('login');
      }
    }, 1000);
  };

  // 4. Update customerData in real-time if database changes
  useEffect(() => {
    if (appState === 'dashboard' && phoneNumber) {
      const cleanPhone = phoneNumber.trim();
      const rawCustomer = dbCustomersRaw.find(c => getFuzzyKey(c, "เบอร์โทร") === cleanPhone);
      if (rawCustomer) {
        const builtData = buildCustomerData(rawCustomer, cleanPhone, dbHistories, dbCourses);
        setCustomerData(prev => ({
          ...builtData,
          lineDisplayName: prev?.lineDisplayName || lineProfile?.displayName,
          lineProfilePic: prev?.lineProfilePic || lineProfile?.pictureUrl
        }));
      }
    }
  }, [dbCustomersRaw, dbHistories, dbCourses, appState, phoneNumber, lineProfile]);

  // --- SCREEN 1: LOADING ---
  if (appState === 'loading') {
    return (
      <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-20 -mt-20 blur-3xl"></div>
        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[32px] border border-white/30 flex items-center justify-center mb-6 shadow-2xl animate-pulse">
           <Sparkles size={48} className="text-white" />
        </div>
        <h1 className="text-white text-3xl font-black tracking-widest mb-2">IrisCare</h1>
        <p className="text-teal-100 text-sm tracking-widest uppercase mb-10 font-bold">เชื่อมต่อกับฐานข้อมูล...</p>
        <Loader2 size={32} className="text-white animate-spin" />
      </div>
    );
  }

  // --- SCREEN 2: LOGIN (ผูกเบอร์โทรกับบัญชี LINE) ---
  if (appState === 'login') {
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center font-sans relative overflow-hidden">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative z-10">
          <div className="h-64 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-700 relative overflow-hidden rounded-b-[48px] shadow-lg">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white pt-8">
                <Sparkles size={36} className="mb-2 opacity-90"/>
                <h1 className="text-2xl font-black tracking-widest uppercase">IrisCare</h1>
                <p className="text-sm opacity-80 tracking-wide mt-1">ยินดีต้อนรับสู่ระบบสมาชิก</p>
             </div>
          </div>
          
          <div className="flex-1 px-8 pt-8 pb-12 flex flex-col items-center -mt-10 z-20">
            
            {/* แสดงรูปโปรไฟล์และชื่อจาก LINE LIFF */}
            <div className="w-24 h-24 rounded-[32px] bg-white p-1.5 shadow-xl mb-3 relative">
              <img src={lineProfile?.pictureUrl} alt="LINE Profile" className="w-full h-full rounded-[24px] object-cover" />
              <div className="absolute -bottom-2 -right-2 bg-green-500 border-[3px] border-white text-white p-1 rounded-full shadow-sm">
                 <CheckCircle size={16} />
              </div>
            </div>
            <h2 className="text-base font-black text-gray-800 mb-6 flex items-center">
              <span className="text-green-500 mr-2 text-xl">•</span> {lineProfile?.displayName}
            </h2>
            
            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed px-4">
              กรุณายืนยันเบอร์โทรศัพท์ที่ใช้สมัครบริการ<br/>เพื่อเข้าถึงข้อมูลคอร์สและยอดสะสมของคุณ
            </p>

            {errorMsg && (
              <div className="w-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-2xl mb-6 flex items-start shadow-sm animate-in fade-in">
                 <AlertCircle size={16} className="mr-2 shrink-0 mt-0.5" />
                 <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-5">
              <div className="relative">
                <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" />
                <input 
                  type="tel" 
                  placeholder="กรอกเบอร์โทรศัพท์ (เช่น 0812345678)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 text-base transition-all font-mono font-bold text-gray-800 tracking-wider shadow-inner"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black text-base py-4 rounded-[20px] hover:opacity-90 shadow-lg shadow-teal-500/30 flex items-center justify-center space-x-2 active:scale-95 transition-all">
                <span>เข้าสู่ระบบด้วยเบอร์โทร</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-auto w-full flex flex-col space-y-2 pt-10">
               <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest mb-1">MOCKUP ACCOUNTS (ทดสอบ)</p>
               <button onClick={() => setPhoneNumber('0878523749')} className="text-xs bg-gray-50 text-gray-600 py-2 rounded-xl font-medium border border-gray-200">เบอร์: 0878523749 (ยังไม่อนุมัติ VIP)</button>
               <button onClick={() => setPhoneNumber('0811112222')} className="text-xs bg-gray-50 text-gray-600 py-2 rounded-xl font-medium border border-gray-200">เบอร์: 0811112222 (ผ่อนชำระ & VIP)</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SCREEN 3: DASHBOARD ---
  const activeCourses = customerData.courses.filter(c => c.status === 'ยังคงเหลือ');
  const courseUsages = customerData.history.filter(h => getFuzzyKey(h, "ประเภท")?.includes('ใช้') || getFuzzyKey(h, "ประเภท")?.includes('เบิก') || getFuzzyKey(h, "ประเภท") === 'คอส');
  const productPurchases = customerData.history.filter(h => {
     const rawAmount = getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด", "col_19"]);
     return parseNumber(rawAmount) > 0;
  });

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative flex flex-col overflow-hidden pb-20">
        
        {/* HEADER */}
        <div className="bg-gradient-to-b from-teal-600 to-teal-800 pt-12 pb-8 px-6 rounded-b-[32px] shadow-lg relative z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="flex justify-between items-center relative z-10">
             <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 p-0.5 shadow-lg">
                  {/* แสดงรูปโปรไฟล์ LINE ถ้ามี ถ้าไม่มีใช้รูปจำลอง */}
                  <img src={customerData.lineProfilePic} alt="Profile" className="w-full h-full rounded-xl object-cover" />
                </div>
                <div className="text-white">
                  <p className="text-[10px] opacity-80 mb-0.5 tracking-wide uppercase">สวัสดีค่ะ, คุณ{customerData.lineDisplayName}</p>
                  <h1 className="text-lg font-black leading-tight max-w-[200px] truncate flex items-center gap-1">
                    {getFuzzyKey(customerData, "ชื่อ")}
                    {customerData.isApproved && <Award size={16} className="text-amber-300 ml-1"/>}
                  </h1>
                </div>
             </div>
              <button onClick={() => { setAppState('login'); setPhoneNumber(''); }} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white backdrop-blur-md transition-colors"><LogOut size={18} /></button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-6 relative z-0">
          
          {/* NAV 1: HOME (คอร์สของฉัน) */}
          {activeNav === 'home' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><Ticket size={18} className="mr-2 text-teal-600"/> คอร์สที่ใช้งานได้ ({activeCourses.length})</h2>
              
              {activeCourses.length > 0 ? activeCourses.map((course, idx) => {
                const isPendingPayment = parseNumber(getFuzzyKey(course, "ยอดค้างชำระ")) > 0;
                return (
                <div key={idx} className={`bg-white rounded-[24px] p-5 shadow-sm border-2 ${isPendingPayment ? 'border-red-100' : 'border-transparent'} relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${isPendingPayment ? 'bg-red-400' : 'bg-teal-400'}`}></div>
                  
                  <div className="relative z-10 pl-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-1 rounded-md uppercase flex items-center"><MapPin size={10} className="mr-1"/> {getFuzzyKey(course, "สาขาที่ซื้อ")}</span>
                      <span className="text-[10px] font-mono text-gray-400">ซื้อ: {getFuzzyKey(course, "วันที่ซื้อ")}</span>
                    </div>
                    
                    <h3 className="text-base font-black text-gray-900 leading-tight mb-2">{getFuzzyKey(course, "ชื่อคอส")}</h3>
                    
                    {isPendingPayment && (
                      <div className="mb-3 bg-red-50 p-2.5 rounded-xl border border-red-100 flex items-center">
                         <AlertCircle size={14} className="text-red-500 mr-2"/>
                         <span className="text-[11px] font-bold text-red-700">ผ่อนชำระ: มียอดค้าง ฿{parseNumber(getFuzzyKey(course, "ยอดค้างชำระ")).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-500 font-bold">ใช้ไปแล้ว <span className="font-black text-gray-900 text-sm mx-0.5">{course.totalUsed}</span>/{parseNumber(getFuzzyKey(course, "จำนวนครั้งที่ได้"))}</span>
                        <span className="text-teal-600 font-black text-sm">เหลือ {course.remaining} ครั้ง</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${isPendingPayment ? 'bg-gradient-to-r from-red-400 to-orange-400' : 'bg-gradient-to-r from-teal-400 to-emerald-400'}`} style={{ width: `${(course.totalUsed / Math.max(1, parseNumber(getFuzzyKey(course, "จำนวนครั้งที่ได้")))) * 100}%` }}></div>
                      </div>
                    </div>

                    <button onClick={() => setShowQR(course)} className="w-full bg-gray-900 text-white flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
                      <QrCode size={18} /><span>แสดง QR เพื่อใช้งาน</span>
                    </button>
                  </div>
                </div>
                );
              }) : (
                <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><Ticket size={32} className="text-gray-300" /></div>
                  <h3 className="text-gray-800 font-black text-base mb-1">ไม่มีคอร์สที่ใช้งานได้</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed px-6">ดูเหมือนว่าคุณจะใช้คอร์สครบหมดแล้ว<br/>สอบถามโปรโมชั่นใหม่ๆ ได้ที่เคาน์เตอร์</p>
                </div>
              )}
            </div>
          )}

          {/* NAV 2: HISTORY (ประวัติการใช้งาน) */}
          {activeNav === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><HistoryIcon size={18} className="mr-2 text-pink-500"/> ประวัติเข้ารับบริการ</h2>
              {courseUsages.length > 0 ? courseUsages.map((h, i) => {
                const isBerq = getFuzzyKey(h, "ประเภท")?.includes('เบิก');
                const amt = parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด", "col_19"]));
                return (
                <div key={i} className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
                  <div className={`absolute left-0 top-0 w-1.5 h-full ${isBerq ? 'bg-indigo-400' : 'bg-pink-400'}`}></div>
                  <div className="flex-1 pl-2">
                    <div className="flex justify-between items-center mb-1.5">
                       <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{getFuzzyKey(h, "วันที่")}</span>
                       <span className="text-[10px] text-gray-500 font-bold flex items-center"><MapPin size={10} className="mr-1"/>{getFuzzyKey(h, "สาขา") || '-'}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1.5">{getFuzzyKey(h, ["ชื่อคอส", "คอสที่ซื้อ", "สินค้า", "col_16", "col_18"]) || '-'}</h4>
                    <div className="flex flex-wrap items-center gap-2">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center ${isBerq ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}><CheckCircle size={10} className="mr-1"/> {getFuzzyKey(h, "ประเภท")} {getFuzzyKey(h, "รายการ") ? `: ${getFuzzyKey(h, "รายการ")}` : ''}</span>
                       {isBerq && amt > 0 && <span className="text-[10px] bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-md border border-orange-100">เบิก: ฿{amt.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
                );
              }) : (
                <div className="text-center py-16 bg-white rounded-[24px] border border-gray-100 shadow-sm"><HeartPulse size={40} className="mx-auto text-gray-200 mb-3"/><p className="text-xs text-gray-400 font-bold">ยังไม่มีประวัติเข้าใช้บริการ</p></div>
              )}
            </div>
          )}

          {/* NAV 3: SHOP (ร้านค้า) */}
          {activeNav === 'shop' && (
             <Shop
                shopTab={shopTab}
                setShopTab={setShopTab}
                dbProducts={dbWooProducts}
                dbMasterCourses={dbCourses}
                wooImagesMap={wooImagesMap}
                customerData={customerData}
                handleAddToCart={handleAddToCart}
                setIsCustomOrderOpen={() => {}}
                selectedPackages={null}
                setSelectedPackages={() => {}}
                setSelectedProduct={setSelectedProduct}
                MOCK_COUPONS={MOCK_COUPONS}
                buyAgainItems={buyAgainItems}
                handleCollectCoupon={() => {}}
                isPaginating={false}
                shopDisplayLimit={50}
             />
          )}

          {/* NAV 4: ORDERS (ประวัติคำสั่งซื้อ) */}
          {activeNav === 'orders' && (
             <Orders
                orderFilter={orderFilter}
                setOrderFilter={setOrderFilter}
                myOrders={dbHistories || []}
                setSelectedOrder={setSelectedOrder}
                setConfirmCancelOrder={setConfirmCancelOrder}
                parseNumber={parseNumber}
             />
          )}

          {activeNav === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><User size={18} className="mr-2 text-indigo-500"/> บัญชีสะสมยอด</h2>
              
              {/* บัตรสะสมยอด */}
              <div className={`p-6 rounded-[24px] shadow-lg text-white relative overflow-hidden ${customerData.isApproved ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-orange-500/30' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-indigo-500/30'}`}>
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                   <div>
                     <p className="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-0.5">สถานะสมาชิก</p>
                     <p className="font-black text-lg flex items-center gap-1.5">
                       {customerData.memberStatus}
                       {customerData.isApproved && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] border border-white/30 uppercase tracking-widest">VIP</span>}
                     </p>
                   </div>
                   <Award size={28} className={customerData.isApproved ? "text-yellow-200" : "text-indigo-200"} />
                </div>
                <div className="relative z-10">
                   <p className="text-[11px] uppercase tracking-widest font-bold text-white/80 mb-1">ยอดสะสมรวมทั้งหมด</p>
                   <p className="text-4xl font-black leading-none mb-2">฿{customerData.realAccumulatedAmount.toLocaleString()}</p>
                   <p className="text-[10px] text-white/70 font-medium">ยอดซื้อสินค้า: ฿{(customerData.productAccumulatedAmount || 0).toLocaleString()}</p>
                </div>
              </div>

              <button 
                onClick={() => setActiveNav('orders')}
                className="w-full bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all mt-6 mb-2"
              >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                        <ReceiptText size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-black text-gray-800">ประวัติคำสั่งซื้อ</h3>
                        <p className="text-[10px] text-gray-500">ดูรายการสั่งซื้อและการจัดส่งทั้งหมด</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
              </button>

              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4 mb-2 pl-2">ประวัติการได้รับยอดสะสม</h3>
              {productPurchases.length > 0 ? productPurchases.map((p, i) => {
                const isBerq = getFuzzyKey(p, "ประเภท")?.includes('เบิก');
                return (
                <div key={i} className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
                  <div className={`absolute left-0 top-0 w-1.5 h-full ${isBerq ? 'bg-indigo-400' : 'bg-orange-400'}`}></div>
                  <div className="flex-1 pl-2 pr-2">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{getFuzzyKey(p, ["สินค้า", "รายการ", "ชื่อคอส", "col_18", "col_16"]) || '-'}</h4>
                    <div className="flex items-center space-x-2 text-[10px]">
                       <span className="font-mono text-gray-400">{getFuzzyKey(p, "วันที่")}</span>
                       <span className={`${isBerq ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-100'} font-bold px-1.5 py-0.5 rounded border`}>{getFuzzyKey(p, "ประเภท")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-orange-600">+ {parseNumber(getFuzzyKey(p, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด", "col_19"])).toLocaleString()}</span>
                  </div>
                </div>
                );
              }) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100"><ShoppingBag size={32} className="mx-auto text-gray-200 mb-2"/><p className="text-xs text-gray-400 font-bold">ไม่มีประวัติการได้ยอดสะสม</p></div>
              )}
            </div>
          )}

        </div>

        {/* --- BOTTOM NAVIGATION BAR --- */}
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200/60 pb-safe z-40">
          <div className="flex justify-between items-center px-1 h-[70px] relative">
             <button onClick={() => setActiveNav('home')} className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-colors ${activeNav === 'home' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <div className={`p-1.5 rounded-xl transition-all ${activeNav === 'home' ? 'bg-teal-50' : ''}`}><Ticket size={22} className={activeNav === 'home' ? 'fill-teal-100/50' : ''} /></div><span className="text-[9px] font-bold">คอร์สของฉัน</span>
             </button>
             <button onClick={() => setActiveNav('shop')} className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-colors ${activeNav === 'shop' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <div className={`p-1.5 rounded-xl transition-all ${activeNav === 'shop' ? 'bg-emerald-50' : ''}`}><ShoppingBag size={22} className={activeNav === 'shop' ? 'fill-emerald-100/50' : ''} /></div><span className="text-[9px] font-bold">ร้านค้า</span>
             </button>
             
             {/* กึ่งกลาง ตะกร้าสินค้า */}
             <div className="relative -top-6 flex justify-center w-full max-w-[80px]">
                <button 
                  onClick={() => setIsCartModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-[0_10px_25px_rgba(79,70,229,0.4)] transition-transform hover:scale-105 relative border-4 border-white"
                >
                  <ShoppingCart size={24} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cart.reduce((s,i)=>s+i.qty,0)}
                    </span>
                  )}
                </button>
             </div>

             <button onClick={() => setActiveNav('history')} className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-colors ${activeNav === 'history' ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <div className={`p-1.5 rounded-xl transition-all ${activeNav === 'history' ? 'bg-pink-50' : ''}`}><HistoryIcon size={22} className={activeNav === 'history' ? 'fill-pink-100/50' : ''} /></div><span className="text-[9px] font-bold">ประวัติ</span>
             </button>
             <button onClick={() => setActiveNav('profile')} className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-colors ${activeNav === 'profile' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <div className={`p-1.5 rounded-xl transition-all ${activeNav === 'profile' ? 'bg-indigo-50' : ''}`}><User size={22} className={activeNav === 'profile' ? 'fill-indigo-100/50' : ''} /></div>
                <span className="text-[9px] font-bold">บัญชี/ยอดสะสม</span>
             </button>
          </div>
        </div>

        {/* --- DETAIL MODALS --- */}
        {selectedProduct && (
          <ProductDetailModal
            selectedProduct={selectedProduct}
            isCartOpen={isCartModalOpen}
            setSelectedProduct={setSelectedProduct}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
            isLoadingSubItems={false}
            subItems={[]}
            selectedVariation={null}
            setSelectedVariation={() => {}}
            groupedSelections={{}}
            setGroupedSelections={() => {}}
            handleModalAddToCart={() => { 
                handleAddToCart(selectedProduct); 
                return true; 
            }}
            handleModalBuyNow={() => { 
                handleAddToCart(selectedProduct); 
                setSelectedProduct(null);
                setIsCartModalOpen(true); 
            }}
          />
        )}

        {/* --- CART CHECKOUT MODAL --- */}
        {isCartModalOpen && (
          <CartCheckoutModal
             isOpen={isCartModalOpen}
             onClose={() => setIsCartModalOpen(false)}
             cart={cart}
             updateCartQty={adjustCartQty}
             removeFromCart={removeFromCart}
             totals={calculateCartTotals()}
             customerData={customerData}
             lineProfile={lineProfile}
             MOCK_COUPONS={MOCK_COUPONS}
             onConfirmOrder={async (orderData) => {
                try {
                  console.log('Order submitted:', orderData);
                  setIsCartModalOpen(false);
                  setCart([]);
                  // In a real app, we would write to Firebase here
                  return { success: true, orderId: `ORDER_${Date.now()}` };
                } catch(e) {
                  return { success: false, message: e.message };
                }
             }}
          />
        )}

        {/* --- ORDER DETAIL MODAL --- */}
        {selectedOrder && (
          <OrderDetailModal
             selectedOrder={selectedOrder}
             setSelectedOrder={setSelectedOrder}
             confirmCancelOrder={confirmCancelOrder}
             setConfirmCancelOrder={setConfirmCancelOrder}
             parseNumber={parseNumber}
             handleCancelOrder={async (id) => {
                 // Implement cancel order logic here
                 console.log('Cancel order:', id);
                 setConfirmCancelOrder(false);
                 setSelectedOrder(null);
                 alert('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว (จำลอง)');
             }}
             isActionLoading={false}
             handleReorder={(items) => {
                 // Add all items back to cart
                 items.forEach(item => {
                     setCart(prev => {
                         const existing = prev.find(i => i.id === item.id);
                         if (existing) {
                             return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i);
                         }
                         return [...prev, { ...item, qty: item.qty || 1 }];
                     });
                 });
                 setSelectedOrder(null);
                 setConfirmCancelOrder(false);
                 setIsCartModalOpen(true);
             }}
          />
        )}

        {/* --- QR CODE MODAL --- */}
        {showQR && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[32px] p-8 flex flex-col items-center shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
              <h2 className="text-lg font-black text-gray-900 mb-1 text-center leading-tight mt-2">{getFuzzyKey(showQR, "ชื่อคอส")}</h2>
              <p className="text-[11px] text-gray-500 mb-6 font-mono tracking-widest bg-gray-100 px-3 py-1 rounded-lg">Ref: {getFuzzyKey(showQR, "เลขที่ใบคอส")}</p>
              
              <div className="bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm mb-6 flex items-center justify-center relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-500 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-500 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-500 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-500 rounded-br-xl"></div>
                {getFuzzyKey(showQR, "คิวอาร์โค้ด") && getFuzzyKey(showQR, "คิวอาร์โค้ด").includes("barcode.tec-it.com") ? (
                  <img src={getFuzzyKey(showQR, "คิวอาร์โค้ด")} alt="QR Code" className="w-40 h-40 object-contain" />
                ) : (<QrCode size={160} className="text-gray-900" />)}
              </div>
              
              <div className="w-full bg-teal-50 rounded-2xl p-4 mb-6 flex justify-between items-center border border-teal-100/50">
                 <div><p className="text-[10px] font-bold text-teal-600/70 uppercase tracking-wide mb-1">สาขา</p><p className="font-bold text-teal-900 text-sm">{getFuzzyKey(showQR, "สาขาที่ซื้อ")}</p></div>
                 <div className="text-right"><p className="text-[10px] font-bold text-teal-600/70 uppercase tracking-wide mb-1">ยอดคงเหลือ</p><p className="font-black text-teal-600 text-xl leading-none">{showQR.remaining} <span className="text-xs font-bold opacity-70 tracking-normal">ครั้ง</span></p></div>
              </div>
              <p className="text-[11px] font-bold text-gray-400 text-center mb-6 leading-relaxed">โปรดแสดงหน้าจอนี้ให้พนักงานที่เคาน์เตอร์<br/>เพื่อทำการสแกนรับบริการ</p>
              <button onClick={() => setShowQR(null)} className="w-full py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all">ปิดหน้าต่าง</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}