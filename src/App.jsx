import React, { useState, useEffect, useMemo } from 'react';
import { 
  QrCode, Clock, CheckCircle, CreditCard, ChevronRight, User, 
  AlertCircle, Info, Ticket, Phone, Loader2, ArrowRight, Tag, 
  LogOut, Sparkles, MapPin, Award, Banknote, ShoppingBag, HeartPulse,
  History as HistoryIcon, ShoppingCart, ReceiptText, ArrowDownToLine, X, CalendarDays, CalendarPlus, Gift, HelpCircle
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { auth, app, getAppCollection, getAppDoc, db } from './config/firebase';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { onSnapshot, addDoc, writeBatch, doc, query, where, updateDoc } from 'firebase/firestore';

import Shop from './pages/Shop';
import Orders from './pages/Orders';
import Booking from './pages/Booking';
import Privileges from './pages/Privileges';
import BookingModal from './components/modals/BookingModal';
import CartCheckoutModal from './components/modals/CartCheckoutModal';
import ProductDetailModal from './components/modals/ProductDetailModal';
import OrderDetailModal from './components/modals/OrderDetailModal';
import PromotionModal from './components/modals/PromotionModal';
import { fetchWithProxy, WOO_CFG } from './utils/wooProxy';
import { MOCK_COUPONS } from './data/mockData';
import { getFullPrice, computeFinalPrice } from './utils/priceUtils';

// --- 🌟 SKIN AI MODALS 🌟 ---
import SkinCheckModal from './components/modals/SkinCheckModal';
import SkinProgressModal from './components/modals/SkinProgressModal';
import AIFeedbackModal from './components/modals/AIFeedbackModal';

// --- WALLET MODAL ---
import WalletTopUpModal from './components/modals/WalletTopUpModal';
import HelpCenterModal from './components/modals/HelpCenterModal';
import VipRegistrationModal from './components/modals/VipRegistrationModal';

// --- UTILS ---
import { buildCustomerData } from './utils/customerUtils';
import { parseThaiDate } from './utils/helpers';

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
  const [dashboardTab, setDashboardTab] = useState('courses');
  const [showQR, setShowQR] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 🌟 NEW STATE FOR SHOP & CART 🌟
  const [dbProducts, setDbProducts] = useState([]);
  const [dbOrders, setDbOrders] = useState([]);
  const [dbMasterCourses, setDbMasterCourses] = useState([]);
  const [shopTab, setShopTab] = useState('products');
  const [cart, setCart] = useState([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // 🌟 WOO COMMERCE: สินค้าเซต (grouped) / หลายตัวเลือก (variable) 🌟
  const [wooProducts, setWooProducts] = useState([]);
  const [subItems, setSubItems] = useState([]);
  const [isLoadingSubItems, setIsLoadingSubItems] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [groupedSelections, setGroupedSelections] = useState({});

  // 🌟 ORDER HISTORY STATE 🌟
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState(false);

  // 🌟 SKIN AI STATES + FEATURE FLAGS + TOAST 🌟
  const [showSkinCheck, setShowSkinCheck] = useState(false);
  const [showSkinProgress, setShowSkinProgress] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({});
  const [dbCoupons, setDbCoupons] = useState([]);
  const [dbRedeemTiers, setDbRedeemTiers] = useState([]);
  const [dbLuckyPrizes, setDbLuckyPrizes] = useState([]);
  const [toast, setToast] = useState(null);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isVipRegistrationOpen, setIsVipRegistrationOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  
  // 🌟 WALLET STATE 🌟
  const [isWalletTopUpOpen, setIsWalletTopUpOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);

  // 🌟 BOOKING STATE 🌟
  const [dbBookings, setDbBookings] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingCourse, setBookingCourse] = useState(null);
  const [bookingForm, setBookingForm] = useState({ 
    branch: localStorage.getItem('defaultBranch') || 'สาขาเฉวง', 
    date: '', 
    time: '', 
    serviceName: '',
    guestName: '',
    guestPhone: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // 🌟 บันทึกผลสแกนผิวเข้าประวัติ (skinScans) — ใช้โดย SkinProgressModal ทันที
  const handleScanComplete = async (data, image) => {
    try {
      await addDoc(getAppCollection('skinScans'), {
        phone: customerData?.cleanPhone || phoneNumber.trim(),
        scores: data?.scores || {},
        image: image || null,
        raw: data || null,
        createdAt: new Date().toISOString()
      });
      showToast('บันทึกผลสแกนเข้าประวัติเรียบร้อยแล้วค่ะ ✨');
    } catch (e) {
      console.error('save skinScan error:', e);
    }
  };

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

  // ═══════════ 🌟 WOOCOMMERCE: สินค้าเซต (grouped) + หลายตัวเลือก (variable) 🌟 ═══════════

  // 🌟 (Moved WooCommerce sync to Admin Dashboard for performance and deduplication)
  useEffect(() => {
    setWooProducts([]);
  }, []);

  // 🌟 โหลดตัวเลือกย่อยเมื่อเปิดดูสินค้า Woo: variable → variations, grouped → สินค้าลูกในเซต
  useEffect(() => {
    if (!selectedProduct || !selectedProduct.isWoo) {
      setSubItems([]); setSelectedVariation(null); setGroupedSelections({});
      return;
    }
    const isGroupedType = ['grouped', 'bundle', 'woosb'].includes(selectedProduct.wooType);
    const needSub = selectedProduct.wooType === 'variable' ||
      (isGroupedType && selectedProduct.groupedIds?.length > 0);
    if (!needSub) {
      setSubItems([]); setSelectedVariation(null); setGroupedSelections({});
      return;
    }

    let isMounted = true;
    const fetchSub = async () => {
      setIsLoadingSubItems(true);
      try {
        const baseUrl = WOO_CFG.url.endsWith('/') ? WOO_CFG.url.slice(0, -1) : WOO_CFG.url;
        if (selectedProduct.wooType === 'variable') {
          const data = await fetchWithProxy(`${baseUrl}/wp-json/wc/v3/products/${selectedProduct.wooId}/variations`);
          if (!isMounted) return;
          const list = Array.isArray(data) ? data : [];
          // 🌟 แนบราคาสมาชิก
          setSubItems(list.map(s => ({ ...s, memberPrice: parseNumber(s.regular_price || s.price || 0) })));
          if (list.length > 0) setSelectedVariation({ ...list[0], memberPrice: parseNumber(list[0].regular_price || list[0].price || 0) });
        } else if (isGroupedType) {
          const data = await fetchWithProxy(`${baseUrl}/wp-json/wc/v3/products?include=${selectedProduct.groupedIds.join(',')}&per_page=100`);
          if (!isMounted) return;
          const list = Array.isArray(data) ? data : [];
          // 🌟 แนบราคาสมาชิก
          setSubItems(list.map(s => ({ ...s, memberPrice: parseNumber(s.regular_price || s.price || 0) })));
          const initial = {};
          list.forEach(item => { initial[item.id] = 1; });
          setGroupedSelections(initial);
        }
      } catch (e) {
        console.error('Fetch sub items error:', e);
      } finally {
        if (isMounted) setIsLoadingSubItems(false);
      }
    };
    fetchSub();
    return () => { isMounted = false; };
  }, [selectedProduct?.id]);

  // 🌟 หยิบใส่ตะกร้าจากหน้าสินค้า — รองรับตัวเลือก (variation) และเซต (grouped)
  // ลูกค้าสมาชิก (isApproved) จ่ายราคาสมาชิกเหมือน POS เมื่อมีราคาสมาชิกและถูกกว่าราคาปกติ
  const applyMemberPrice = (basePrice, memberPrice) => {
    if (customerData?.isApproved && memberPrice > 0 && memberPrice < basePrice) return memberPrice;
    return basePrice;
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return false;

    if (selectedProduct.wooType === 'variable') {
      if (!selectedVariation) {
        showToast('กรุณาเลือกตัวเลือกสินค้าก่อนครับ');
        return false;
      }
      const vReg = parseFloat(selectedVariation.price || 0);
      const vPrice = applyMemberPrice(vReg, selectedVariation.memberPrice);
      let vOriginal = parseFloat(selectedVariation.regular_price || 0);
      if (vOriginal <= vPrice) vOriginal = vReg;
      const attrs = (selectedVariation.attributes || []).map(a => a.option).filter(Boolean).join(', ');
      handleAddToCart({
        ...selectedProduct,
        id: `${selectedProduct.id}-${selectedVariation.id}`,
        wooVariationId: selectedVariation.id,
        name: attrs ? `${selectedProduct.name} (${attrs})` : selectedProduct.name,
        price: vPrice,
        originalPrice: vOriginal,
        image: selectedVariation.image?.src || selectedProduct.image,
        priceRange: null,
        isUsingMemberPrice: vPrice < vReg
      });
      showToast(`เพิ่ม "${selectedProduct.name}" ลงตะกร้าแล้ว`);
      return true;

    } else if (['grouped', 'bundle', 'woosb'].includes(selectedProduct.wooType) && selectedProduct.groupedIds?.length > 0) {
      let totalAdded = 0;
      subItems.forEach(subItem => {
        const qty = groupedSelections[subItem.id] || 0;
        if (qty > 0) {
          const subReg = parseFloat(subItem.price || 0);
          const subPrice = applyMemberPrice(subReg, subItem.memberPrice);
          let subOrig = parseFloat(subItem.regular_price || 0);
          if (subOrig <= subPrice) subOrig = subReg;
          handleAddToCart({
            id: `woo-${subItem.id}`, wooId: subItem.id,
            name: subItem.name,
            price: subPrice, originalPrice: subOrig,
            type: 'product', isWoo: true,
            image: subItem.images?.[0]?.src || selectedProduct.image,
            priceRange: null,
            isUsingMemberPrice: subPrice < subReg
          });
          // เพิ่มจำนวนที่เลือก (handleAddToCart เพิ่มทีละ 1)
          for (let i = 1; i < qty; i++) {
            setCart(prev => prev.map(p => p.id === `woo-${subItem.id}` ? { ...p, qty: p.qty + 1 } : p));
          }
          totalAdded++;
        }
      });
      if (totalAdded === 0) {
        showToast('กรุณาเลือกสินค้าอย่างน้อย 1 ชิ้นในเซต');
        return false;
      }
      showToast(`เพิ่มสินค้าในเซต ${totalAdded} รายการลงตะกร้าแล้ว`);
      return true;

    } else {
      const reg = parseNumber(selectedProduct.price) || parseFloat(selectedProduct.price || 0);
      const finalP = applyMemberPrice(reg, selectedProduct.memberPrice);
      handleAddToCart({
        ...selectedProduct,
        price: finalP,
        originalPrice: finalP < reg ? reg : (parseNumber(selectedProduct.originalPrice) || 0),
        priceRange: null,
        isUsingMemberPrice: finalP < reg
      });
      showToast(`เพิ่ม "${selectedProduct.name}" ลงตะกร้าแล้ว`);
      return true;
    }
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
    if (!customerData?.history || !dbProducts) return [];
    const pastNames = customerData.history.map(h => String(getFuzzyKey(h, ["ชื่อสินค้า", "col_2", "รายการ"]) || '').toLowerCase());
    const matchedRaw = dbProducts.filter(p => {
        const pName = String(getFuzzyKey(p, ["ชื่อสินค้า", "col_2", "ชื่อ", "name"]) || '').toLowerCase();
        return pastNames.some(name => pName.includes(name) || name.includes(pName));
    });

    return matchedRaw.map(p => ({
        ...p,
        name: String(getFuzzyKey(p, ["ชื่อสินค้า", "col_2", "ชื่อ", "name"]) || p.name).trim(),
        // 🌟 ลำดับ field ตรงกับแอดมิน (ราคาขายเต็ม → ราคา → col_6) — col_5 คือหน่วยนับ ไม่ใช่ราคา
        price: parseNumber(getFuzzyKey(p, ["ราคาขายเต็ม", "ราคา", "col_6"])),
        image: getFuzzyKey(p, ["รูปภาพ", "รูป", "image", "img", "col_13"]) || p.image,
        type: 'product'
    }));
  }, [customerData, dbProducts]);

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
                userId: profile.userId,
                displayName: profile.displayName,
                pictureUrl: profile.pictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}&backgroundColor=b6e3f4`
              });
              const savedPhone = localStorage.getItem(`liff_phone_${profile.userId}`);
              if (savedPhone) {
                  setPhoneNumber(savedPhone);
                  setAppState('auto_login');
              } else {
                  setAppState('login'); 
              }
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
        userId: 'mock_user',
        displayName: "LINE User (จำลอง)",
        pictureUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=LINEUser&backgroundColor=e2e8f0`
      });
      const savedPhone = localStorage.getItem(`liff_phone_mock_user`);
      if (savedPhone) {
          setPhoneNumber(savedPhone);
          setAppState('auto_login');
      } else {
          setTimeout(() => setAppState('login'), 1000);
      }
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

    // 2.4 ดึงข้อมูลสินค้าจากระบบ
    const unsubProducts = onSnapshot(getAppCollection('products'), (snapshot) => {
      setDbProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Products fetch error:", err));

    // 2.5 ดึงข้อมูล master_courses
    const unsubMasterCourses = onSnapshot(getAppCollection('master_courses'), (snapshot) => {
      setDbMasterCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Master courses fetch error:", err));

    // 2.6 🌟 สวิตช์เปิด/ปิดฟีเจอร์ (realtime จากแอดมิน) config/featureFlags
    const unsubFlags = onSnapshot(getAppDoc('config', 'featureFlags'), (snap) => {
      if (snap.exists()) setFeatureFlags(snap.data());
    }, (err) => console.error("Feature flags fetch error:", err));

    const unsubCoupons = onSnapshot(getAppCollection('coupons'), (snapshot) => {
      setDbCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Coupons fetch error:", err));

    const unsubRedeemTiers = onSnapshot(getAppDoc('config', 'redeemTiers'), (snap) => {
      if (snap.exists()) setDbRedeemTiers(Array.isArray(snap.data()?.tiers) ? snap.data().tiers : []);
    }, (err) => console.error("Redeem tiers fetch error:", err));

    const unsubLuckyPrizes = onSnapshot(getAppCollection('lucky_wheel_prizes'), (snapshot) => {
      setDbLuckyPrizes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Lucky prizes fetch error:", err));

    // 2.7 ดึงข้อมูลคำสั่งซื้อเพื่อดูสถานะการจัดส่ง
    const unsubOrders = onSnapshot(getAppCollection('orders'), (snapshot) => {
      setDbOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Orders fetch error:", err));

    return () => { 
      unsubCourses(); 
      unsubCustomers(); 
      unsubHistories(); 
      unsubProducts(); 
      unsubMasterCourses(); 
      unsubFlags(); 
      unsubCoupons(); 
      unsubRedeemTiers(); 
      unsubLuckyPrizes(); 
      unsubOrders(); 
    };
  }, [user]);


  useEffect(() => {
     if (appState === 'auto_login') {
         if (dbCustomersRaw.length > 0) {
             handleLogin();
         }
     }
  }, [appState, dbCustomersRaw]);


  // 3. ฟังก์ชันตรวจสอบเบอร์โทรศัพท์ (Login ด้วยข้อมูลจาก Firebase)
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setAppState('loading');
    setErrorMsg('');

    setTimeout(() => {
      const cleanPhone = phoneNumber.trim();
      
      // ค้นหาลูกค้าจากฐานข้อมูล Firebase
      const rawCustomer = dbCustomersRaw.find(c => getFuzzyKey(c, "เบอร์โทร") === cleanPhone);
      
      if (rawCustomer) {
        // Use central utility to build consistent customer data
        const builtData = buildCustomerData(rawCustomer, cleanPhone, dbHistories, dbCourses, dbOrders);
        
        setCustomerData({
          ...builtData,
          lineDisplayName: lineProfile?.displayName,
          lineProfilePic: lineProfile?.pictureUrl
        });
        
        if (lineProfile?.userId) {
            localStorage.setItem(`liff_phone_${lineProfile.userId}`, cleanPhone);
        }
        
        setAppState('dashboard');
        setActiveNav('home');
      } else {
        setErrorMsg('ไม่พบข้อมูลสำหรับเบอร์โทรศัพท์นี้ กรุณาลองใหม่อีกครั้งค่ะ');
        if (lineProfile?.userId) {
            localStorage.removeItem(`liff_phone_${lineProfile.userId}`);
        }
        setAppState('login');
      }
    }, 1000);
  };

  // 4. Update customerData in real-time if database changes
  useEffect(() => {
    let unsubBookings = () => {};
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

      unsubBookings = onSnapshot(query(getAppCollection('bookings'), where("cleanPhone", "==", cleanPhone)), (snapshot) => {
         setDbBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error("Booking fetch error:", err));
    }
    return () => unsubBookings();
  }, [dbCustomersRaw, dbHistories, dbCourses, appState, phoneNumber, lineProfile]);

  // 🌟 BOOKING HANDLERS 🌟
  const timeSlots = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
  const timeToMins = (t) => {
    const [h, m] = String(t || '0:0').split(':').map(Number);
    return h * 60 + m;
  };
  const getLocalDateString = (d) => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(d - tzOffset)).toISOString().split('T')[0];
  };
  const formatShortDate = (dateObj) => {
    const d = new Date(dateObj);
    const dayName = d.toLocaleDateString('th-TH', { weekday: 'short' });
    const monthName = d.toLocaleDateString('th-TH', { month: 'short' });
    const dateNum = d.getDate();
    return { dayName, dateNum, monthName, fullValue: getLocalDateString(d) };
  };

  const bookingDateList = Array.from({length: 14}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const bookedTimeRanges = dbBookings
    .filter(b => b.date === bookingForm.date && b.branch === bookingForm.branch && b.status !== 'ยกเลิก' && b.status !== 'ยกเลิกโดยลูกค้า' && b.status !== 'ยกเลิกฉุกเฉิน' && b.status !== 'ไม่มาตามนัด')
    .map(b => {
        const start = timeToMins(b.time);
        return { start, end: start + (b.duration || 60) };
    });

  const handleBookingSubmit = async (e) => {
    e?.preventDefault();
    if (!bookingForm.date || !bookingForm.time || (!bookingCourse && !bookingForm.serviceName)) {
        setBookingError('กรุณาเลือกวันที่ เวลา และบริการ');
        return;
    }
    setBookingError('');
    setIsSubmittingBooking(true);
    try {
        const ticketNo = `BK${Date.now().toString().slice(-6)}${Math.floor(Math.random()*10)}`;
        const courseName = bookingCourse ? getFuzzyKey(bookingCourse, "ชื่อคอส") : bookingForm.serviceName;
        
        const bookingData = {
            ticketNo,
            cleanPhone: customerData ? customerData.cleanPhone : bookingForm.guestPhone,
            customerName: customerData ? getFuzzyKey(customerData, "ชื่อ") : bookingForm.guestName,
            isGuest: !customerData,
            branch: bookingForm.branch,
            date: bookingForm.date,
            time: bookingForm.time,
            serviceName: courseName,
            courseName: courseName,
            courseId: bookingCourse ? bookingCourse.id : null,
            courseRef: bookingCourse ? getFuzzyKey(bookingCourse, "เลขที่ใบคอส") : null,
            status: 'รอเข้ารับบริการ',
            createdAt: new Date().toISOString()
        };
        
        await addDoc(getAppCollection('bookings'), bookingData);
        setGeneratedTicket(bookingData);
        setBookingStep(2);
        showToast('จองคิวสำเร็จแล้ว!');
    } catch (err) {
        setBookingError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
        setIsSubmittingBooking(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
      e?.preventDefault();
      if (!bookingForm.date || !bookingForm.time) {
          setBookingError('กรุณาเลือกวันที่ และเวลาใหม่');
          return;
      }
      setBookingError('');
      setIsSubmittingBooking(true);
      try {
          const bookingRef = doc(getAppCollection('bookings'), generatedTicket.id);
          await updateDoc(bookingRef, {
              date: bookingForm.date,
              time: bookingForm.time,
              status: 'รอเข้ารับบริการ'
          });
          setGeneratedTicket({...generatedTicket, date: bookingForm.date, time: bookingForm.time, status: 'รอเข้ารับบริการ'});
          setBookingStep(2);
          showToast('เลื่อนคิวสำเร็จแล้ว!');
      } catch (err) {
          setBookingError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      } finally {
          setIsSubmittingBooking(false);
      }
  };

  const handleCancelBooking = async () => {
      setIsActionLoading(true);
      try {
          const bookingRef = doc(getAppCollection('bookings'), generatedTicket.id);
          await updateDoc(bookingRef, {
              status: 'ยกเลิกโดยลูกค้า',
              cancelReason: 'ลูกค้ายกเลิกผ่านแอป',
              canceledAt: new Date().toISOString()
          });
          setGeneratedTicket({...generatedTicket, status: 'ยกเลิกโดยลูกค้า'});
          setShowCancelConfirm(false);
          showToast('ยกเลิกคิวแล้ว');
      } catch (err) {
          showToast('เกิดข้อผิดพลาดในการยกเลิก', 'error');
      } finally {
          setIsActionLoading(false);
      }
  };

  const openReschedule = () => {
      setBookingForm({ ...bookingForm, date: generatedTicket.date, time: generatedTicket.time });
      setBookingStep(3);
  };

  const openBookingModal = (course = null) => {
      setBookingCourse(course);
      setBookingForm({ ...bookingForm, serviceName: course ? getFuzzyKey(course, "ชื่อคอส") : '', date: '', time: '' });
      setBookingStep(1);
      setBookingError('');
      setIsBookingModalOpen(true);
  };


  // --- SCREEN 1: LOADING ---
  if (appState === 'loading' || appState === 'auto_login') {
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

            <div className="w-full mt-8">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm font-black text-gray-800">บริการสำหรับคุณ</span>
                <div className="flex items-center space-x-1.5 bg-white border border-gray-200 py-1.5 px-3 rounded-full shadow-sm">
                  <MapPin size={12} className="text-teal-600" />
                  <select 
                    value={bookingForm.branch} 
                    onChange={(e) => {
                      setBookingForm({...bookingForm, branch: e.target.value});
                      localStorage.setItem('defaultBranch', e.target.value);
                    }}
                    className="text-[10px] font-bold text-gray-600 bg-transparent outline-none focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="สาขาเฉวง">สาขาเฉวง</option>
                    <option value="สาขาละไม">สาขาละไม</option>
                  </select>
                  <ChevronRight size={12} className="text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setIsBookingModalOpen(true)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-all group hover:border-teal-300">
                   <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                     <CalendarPlus size={22} />
                   </div>
                   <span className="text-[11px] font-bold text-gray-700">จองคิว</span>
                </button>

                <button onClick={() => setIsPromotionModalOpen(true)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-all group hover:border-pink-300 relative">
                   <div className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full mt-2 mr-2 animate-pulse"></div>
                   <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-2 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                     <Gift size={22} />
                   </div>
                   <span className="text-[11px] font-bold text-gray-700">โปรโมชัน</span>
                </button>

                <button onClick={() => setIsHelpCenterOpen(true)} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-all group hover:border-blue-300">
                   <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                     <HelpCircle size={22} />
                   </div>
                   <span className="text-[11px] font-bold text-gray-700">ช่วยเหลือ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <BookingModal
            isBookingModalOpen={isBookingModalOpen}
            closeBookingModal={() => setIsBookingModalOpen(false)}
            bookingStep={bookingStep}
            bookingCourse={bookingCourse}
            bookingForm={bookingForm}
            customerData={customerData}
            setBookingForm={setBookingForm}
            handleBookingSubmit={handleBookingSubmit}
            handleRescheduleSubmit={handleRescheduleSubmit}
            bookingError={bookingError}
            availableBranches={["สาขาเฉวง", "สาขาหน้าทอน"]}
            bookingDateList={bookingDateList}
            formatShortDate={formatShortDate}
            getLocalDateString={getLocalDateString}
            storeHolidays={[]}
            timeSlots={timeSlots}
            bookedTimeRanges={bookedTimeRanges}
            timeToMins={timeToMins}
            isSubmittingBooking={isSubmittingBooking}
            generatedTicket={generatedTicket}
            setGeneratedTicket={setGeneratedTicket}
            setBookingStep={setBookingStep}
            setBookingCourse={setBookingCourse}
            setIsBookingModalOpen={setIsBookingModalOpen}
            setShowCancelConfirm={setShowCancelConfirm}
            setBookingError={setBookingError}
            showCancelConfirm={showCancelConfirm}
            isActionLoading={isActionLoading}
            handleCancelBooking={handleCancelBooking}
            openReschedule={openReschedule}
        />
        <PromotionModal
           isOpen={isPromotionModalOpen}
           onClose={() => setIsPromotionModalOpen(false)}
        />
        <HelpCenterModal
          isOpen={isHelpCenterOpen}
          onClose={() => setIsHelpCenterOpen(false)}
        />
      </div>
    );
  }

  // --- SCREEN 3: DASHBOARD ---
  if (!customerData || !customerData.courses) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center items-center">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  const activeCourses = customerData.courses.filter(c => {
    if (c.status !== 'ยังคงเหลือ') return false;
    const courseName = String(getFuzzyKey(c, ["ชื่อคอส", "ชื่อคอร์ส", "col_8"]) || '').toLowerCase();
    const isCreditCourse = courseName.includes('วงเงิน') || courseName.includes('เติมเงิน') || courseName.includes('เครดิต') || courseName.includes('voucher') || courseName.includes('บัตรกำนัล') || courseName.includes('ฝากเงิน');
    return !isCreditCourse;
  }).sort((a, b) => {
      const dateA = parseThaiDate(getFuzzyKey(a, ["วันที่", "วันที่ซื้อ", "col_1"])) || new Date(0);
      const dateB = parseThaiDate(getFuzzyKey(b, ["วันที่", "วันที่ซื้อ", "col_1"])) || new Date(0);
      return dateB.getTime() - dateA.getTime();
  });

  // 🌟 คอร์สรายครั้งของลูกค้าที่ยังใช้ได้ — ไปแสดงในแท็บ "คอร์สรายครั้ง" ของร้านค้า
  const isSingleCourse = (c) => {
    const name = String(getFuzzyKey(c, ["ชื่อคอส", "ชื่อคอร์ส"]) || '');
    return parseNumber(getFuzzyKey(c, ["จำนวนครั้งที่ได้"])) === 1 || name.includes('รายครั้ง') || name.includes('1 ครั้ง') || name.includes('1ฟรี1');
  };
  const mySingleCourses = activeCourses.filter(isSingleCourse);
  const myNormalCourses = activeCourses.filter(c => !isSingleCourse(c));
  
  const totalCreditBalance = customerData.courses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0);
  const maxTotalCredit = customerData.courses.reduce((sum, c) => sum + (c.computedTotalCredit || 0), 0);
  
  const courseUsages = customerData.history.filter(h => getFuzzyKey(h, "ประเภท")?.includes('ใช้') || getFuzzyKey(h, "ประเภท")?.includes('เบิก') || getFuzzyKey(h, "ประเภท") === 'คอส');
  const productPurchases = customerData.history.filter(h => {
     const rawAmount = getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด", "col_19"]);
     return parseNumber(rawAmount) > 0;
  });

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative flex flex-col overflow-hidden pb-20">
        
        {/* HEADER */}
        {activeNav === 'profile' && (
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
              <button onClick={() => { 
                if (lineProfile?.userId) localStorage.removeItem(`liff_phone_${lineProfile.userId}`);
                setAppState('login'); 
                setPhoneNumber(''); 
                setCustomerData(null);
              }} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white backdrop-blur-md transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
        )}

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-6 relative z-0">
          
          {/* NAV 1: HOME (คอร์สของฉัน) */}
          {activeNav === 'home' && (
            <div className="space-y-4 animate-in fade-in duration-300">



              {/* 🌟 แบนเนอร์วิเคราะห์ผิว AI (เปิด/ปิดได้จากแอดมิน: flag skinCheck) 🌟 */}
              {featureFlags.skinCheck !== false && (
                <div className="bg-gradient-to-br from-fuchsia-500 via-violet-600 to-indigo-600 rounded-[24px] p-5 shadow-lg shadow-violet-500/25 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-36 h-36 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  <div className="absolute left-0 bottom-0 w-24 h-24 bg-fuchsia-300/20 rounded-full -ml-8 -mb-8 blur-xl"></div>
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/25 shrink-0 shadow-inner">
                      <Sparkles size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-black text-base leading-tight">วิเคราะห์ผิวด้วย AI</h3>
                      <p className="text-[10px] text-white/80 font-bold leading-relaxed mt-1">สแกนใบหน้า รู้สภาพผิว 8 ด้าน + แนะนำแผนดูแล<br/>เก็บประวัติ เทียบ Before/After ก่อน-หลังได้</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => setShowSkinCheck(true)} className="bg-white text-violet-700 text-[11px] font-black px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-transform flex items-center gap-1.5">
                          <span>เริ่มสแกนฟรี ({Math.max(0, 20 - (parseInt(localStorage.getItem(`ai_skin_usage_${new Date().toLocaleDateString('en-CA')}`) || '0', 10)))}/20)</span><ArrowRight size={13} />
                        </button>
                        {featureFlags.skinProgress !== false && (
                          <button onClick={() => setShowSkinProgress(true)} className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-[10px] font-bold px-3 py-2.5 rounded-xl border border-white/20 active:scale-95 transition-all">
                            ประวัติผิวของฉัน
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <h2 className="text-sm font-black text-gray-800 flex items-center mb-3"><Ticket size={18} className="mr-2 text-teal-600"/> คอร์สที่ใช้งานได้ ({activeCourses.length})</h2>
              
              <div className="flex space-x-2 mb-4 bg-gray-200/50 p-1 rounded-xl">
                <button 
                  onClick={() => setDashboardTab('courses')}
                  className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${dashboardTab === 'courses' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  คอร์ส ({myNormalCourses.length})
                </button>
                <button 
                  onClick={() => setDashboardTab('single')}
                  className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${dashboardTab === 'single' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  รายครั้ง ({mySingleCourses.length})
                </button>
              </div>
              
              {(dashboardTab === 'courses' ? myNormalCourses : mySingleCourses).length > 0 ? (dashboardTab === 'courses' ? myNormalCourses : mySingleCourses).map((course, idx) => {
                const isPendingPayment = parseNumber(getFuzzyKey(course, "ยอดค้างชำระ")) > 0;
                return (
                <div key={idx} onClick={() => setSelectedCourseDetail(course)} className={`bg-white rounded-[24px] p-5 shadow-sm border-2 ${isPendingPayment ? 'border-red-100' : 'border-transparent'} relative overflow-hidden cursor-pointer`}>
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

                    <div className="space-y-2 mt-4">
                      <button onClick={(e) => { e.stopPropagation(); setShowQR(course); }} className="w-full bg-gray-900 text-white flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
                        <QrCode size={18} /><span>แสดง QR เพื่อใช้งาน</span>
                      </button>
                      
                      <button onClick={(e) => { e.stopPropagation(); setShowSkinProgress(true); }} className="w-full bg-teal-50 text-teal-700 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm shadow-sm border border-teal-100 active:scale-95 transition-transform">
                        <Sparkles size={18} /><span>ดูประวัติการวิเคราะห์ผิว</span>
                      </button>
                    </div>
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

          {/* NAV 1.5: BOOKING (จองคิว) */}
          {activeNav === 'booking' && (
            <div className="space-y-4 animate-in fade-in duration-300 px-4 pt-4 pb-20">
              <Booking 
                openBookingModal={openBookingModal}
                myBookings={dbBookings}
                setGeneratedTicket={setGeneratedTicket}
                setBookingStep={setBookingStep}
                setBookingCourse={setBookingCourse}
                setIsBookingModalOpen={setIsBookingModalOpen}
                setShowCancelConfirm={setShowCancelConfirm}
                setBookingError={setBookingError}
                activeCourses={activeCourses}
              />
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
                dbProducts={dbProducts}
                dbFirestoreProducts={dbProducts}
                dbMasterCourses={dbMasterCourses}
                wooImagesMap={new Map()}
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
                cart={cart}
                setIsCartModalOpen={setIsCartModalOpen}
                onOpenSkinCheck={featureFlags.skinCheck !== false ? () => setShowSkinCheck(true) : undefined}
                mySingleCourses={mySingleCourses}
                onShowCourseQR={(course) => setShowQR(course)}
             />
          )}

          {/* NAV 4: ORDERS (ประวัติคำสั่งซื้อ) */}
          {activeNav === 'orders' && (
             <Orders
                orderFilter={orderFilter}
                setOrderFilter={setOrderFilter}
                myOrders={customerData?.history || []}
                setSelectedOrder={setSelectedOrder}
                setConfirmCancelOrder={setConfirmCancelOrder}
                parseNumber={parseNumber}
             />
          )}

          {/* NAV 5: PRIVILEGES (สิทธิพิเศษ) */}
          {activeNav === 'privileges' && (
             <Privileges
                customerData={customerData}
                parseNumber={parseNumber}
                handleRedeemReward={async (reward) => {
                  return { success: true }; 
                }}
                MOCK_COUPONS={dbCoupons}
                marketingPromotions={[]}
                handleCollectCoupon={(code) => {
                  showToast('เก็บคูปอง ' + code + ' เรียบร้อยแล้ว!', 'success');
                }}
                dbLuckyPrizes={dbLuckyPrizes}
                dbRedeemTiers={dbRedeemTiers}
                showToast={showToast}
                handleRequestVIPUpgrade={() => setIsVipRegistrationOpen(true)}
             />
          )}

          {activeNav === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><User size={18} className="mr-2 text-indigo-500"/> บัญชีสะสมยอด</h2>
              
              {/* 🌟 บัตรสมาชิกและกระเป๋าเงิน (Merged VIP Card) 🌟 */}
              <div className={`p-6 rounded-[24px] shadow-lg text-white relative overflow-hidden ${customerData.isApproved ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-orange-500/30' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-indigo-500/30'}`}>
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                
                {/* --- Top Section: Membership --- */}
                <div className="relative z-10 flex justify-between items-start mb-4">
                   <div>
                     <p className="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-0.5">สถานะสมาชิก</p>
                     <p className="font-black text-lg flex items-center gap-1.5">
                       {customerData.memberStatus}
                       {customerData.isApproved && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] border border-white/30 uppercase tracking-widest backdrop-blur-sm shadow-sm">VIP</span>}
                     </p>
                   </div>
                   <Award size={28} className={customerData.isApproved ? "text-yellow-200" : "text-indigo-200"} />
                </div>
                
                <div className="relative z-10 mb-1">
                   <p className="text-[11px] uppercase tracking-widest font-bold text-white/80 mb-1">ยอดสะสมรวมทั้งหมด</p>
                   <p className="text-4xl font-black leading-none mb-1">฿{customerData.realAccumulatedAmount.toLocaleString()}</p>
                   <p className="text-[10px] text-white/70 font-medium">ยอดซื้อสินค้า: ฿{(customerData.productAccumulatedAmount || 0).toLocaleString()}</p>
                </div>

                {/* --- Divider --- */}
                <div className="relative z-10 h-px w-full bg-white/20 my-5"></div>

                {/* --- Bottom Section: Wallet --- */}
                <div className="relative z-10 flex justify-between items-center mb-2">
                   <div className="flex items-center space-x-2">
                     <div className="bg-white/20 text-white p-1.5 rounded-lg backdrop-blur-sm"><Banknote size={16}/></div>
                     <h3 className="text-xs font-black text-white/95">วงเงินเครดิตคงเหลือ</h3>
                   </div>
                   <button onClick={() => setIsCartModalOpen(true)} className="text-[10px] font-bold text-white bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm">ประวัติวงเงิน</button>
                </div>

                <div className="relative z-10 flex items-baseline mb-4">
                   <span className="text-3xl font-black text-white tracking-tight drop-shadow-sm">฿{totalCreditBalance.toLocaleString()}</span>
                   {maxTotalCredit > totalCreditBalance && (
                     <span className="text-xs text-white/70 font-bold ml-2">/ ฿{maxTotalCredit.toLocaleString()}</span>
                   )}
                </div>

                <div className="relative z-10 flex space-x-2 mt-2">
                   <button 
                     onClick={() => {
                        showToast('ฟีเจอร์นี้อยู่ระหว่างการพัฒนา กรุณาติดต่อหน้าร้าน');
                     }}
                     className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 text-[11px] font-black py-3 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                   >
                     <QrCode size={14}/><span>ชำระด้วยเครดิต</span>
                   </button>
                   <button 
                     onClick={() => setIsWalletTopUpOpen(true)}
                     className={`flex-1 bg-white hover:bg-gray-50 text-[11px] font-black py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1.5 ${customerData.isApproved ? 'text-orange-600' : 'text-indigo-600'}`}
                   >
                     <ArrowDownToLine size={14}/><span>เติมเครดิต</span>
                   </button>
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

              {/* 🌟 ซื้ออีกครั้ง — แสดงเฉพาะหน้าบัญชีหน้านี้หน้าเดียว (กรองราคา 0 และรายการเสริมออก) 🌟 */}
              {buyAgainItems.filter(p => Number(p.price) > 0).length > 0 && (
              <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 mb-2">
                  <h3 className="text-[13px] font-black text-rose-500 flex items-center mb-3"><HistoryIcon size={16} className="mr-1.5"/> ซื้ออีกครั้ง</h3>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 snap-x">
                      {buyAgainItems.filter(p => Number(p.price) > 0).slice(0, 20).map((prod, idx) => (
                      <div key={idx} onClick={() => setSelectedProduct(prod)} className="snap-start shrink-0 w-[76px] bg-gray-50 rounded-xl border border-rose-100 p-1.5 shadow-sm flex flex-col relative hover:border-rose-300 transition-all cursor-pointer active:scale-95">
                          <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[7px] font-black px-1.5 py-[2px] rounded-full z-10 shadow-sm border border-white leading-none">ซื้อซ้ำ</div>
                          <div className="w-full aspect-square bg-white rounded-md overflow-hidden mb-1 flex items-center justify-center relative">
                              {prod.image ? (
                                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${prod.type === 'course' ? 'bg-teal-50 text-teal-300' : 'bg-blue-50 text-blue-300'}`}>
                                      {prod.type === 'course' ? <HeartPulse size={16} /> : <ShoppingBag size={16} />}
                                  </div>
                              )}
                          </div>
                          <h4 className="font-bold text-gray-800 text-[8px] line-clamp-2 leading-[1.15] mb-0.5 min-h-[18px] flex items-center justify-center text-center">{prod.name}</h4>
                          <span className={`font-black text-[9px] text-center ${prod.type === 'course' ? 'text-teal-600' : 'text-blue-600'}`}>฿{Number(prod.price || 0).toLocaleString()}</span>
                      </div>
                      ))}
                  </div>
              </div>
              )}

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
              
              {/* ศูนย์ช่วยเหลือลูกค้า */}
              <button 
                onClick={() => setIsHelpCenterOpen(true)}
                className="w-full bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center justify-between mt-4 group active:scale-95 transition-all"
              >
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       <HelpCircle size={20} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-bold text-gray-800 text-sm">ศูนย์ช่วยเหลือลูกค้า</h4>
                       <p className="text-[10px] text-gray-500">วิธีใช้งานแอป นโยบาย และติดต่อแอดมิน</p>
                    </div>
                 </div>
                 <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </button>
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
             
             {/* กึ่งกลาง จองคิว */}
             <div className="relative -top-6 flex justify-center w-full max-w-[80px]">
                <button 
                  onClick={() => setActiveNav('booking')}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-[0_10px_25px_rgba(37,99,235,0.4)] transition-transform hover:scale-105 relative border-4 border-white"
                >
                  <CalendarDays size={24} />
                </button>
             </div>


             <button onClick={() => setActiveNav('privileges')} className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-colors ${activeNav === 'privileges' ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <div className={`p-1.5 rounded-xl transition-all ${activeNav === 'privileges' ? 'bg-pink-50' : ''}`}><Gift size={22} className={activeNav === 'privileges' ? 'text-pink-500' : ''} /></div><span className="text-[9px] font-bold">สิทธิพิเศษ</span>
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
            isLoadingSubItems={isLoadingSubItems}
            subItems={subItems}
            selectedVariation={selectedVariation}
            setSelectedVariation={setSelectedVariation}
            groupedSelections={groupedSelections}
            setGroupedSelections={setGroupedSelections}
            handleModalAddToCart={handleModalAddToCart}
            handleModalBuyNow={() => {
                if (handleModalAddToCart()) {
                    setSelectedProduct(null);
                    setIsCartModalOpen(true);
                }
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
                  
                  const customDateObj = new Date();
                  const cName = customerData ? String(getFuzzyKey(customerData, "ชื่อ")) : 'ลูกค้าทั่วไป';
                  const cPhone = customerData?.phone || customerData?.cleanPhone || '';
                  const custCleanPhone = cPhone.replace(/[^0-9]/g, '');
                  const orderNo = `LIFF${Date.now().toString().slice(-6)}`;
                  const dateStr = customDateObj.toLocaleDateString('th-TH');
                  const timeStr = customDateObj.toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' });

                  if (orderData.paymentMethod === 'credit') {
                      const batch = writeBatch(db);

                      // Deduct credit by creating a history record
                      if (orderData.finalPrice > 0) {
                          const activeCourses = (customerData?.courses || []).filter(c => c.status === 'ยังคงเหลือ');
                          let remainingToDeduct = orderData.finalPrice;
                          for (const c of activeCourses) {
                              if (remainingToDeduct <= 0) break;
                              const available = c.computedRemainCredit || 0;
                              if (available <= 0) continue;
                              const deductAmt = Math.min(available, remainingToDeduct);
                              
                              const historyRef = doc(getAppCollection('histories'));
                              batch.set(historyRef, {
                                  "วันที่": dateStr,
                                  "เวลา": timeStr,
                                  "ชื่อลูกค้า": cName,
                                  "เบอร์โทร": cPhone,
                                  "cleanPhone": custCleanPhone,
                                  "เลขที่ใบคอส": c.courseRefKey || String(getFuzzyKey(c, ["เลขที่ใบคอส", "col_3"])),
                                  "อ้างอิง": orderNo,
                                  "ประเภท": "เบิกใช้เครดิต",
                                  "ยอดเงิน": String(deductAmt),
                                  "รายละเอียด": `ใช้เครดิตชำระสินค้าออนไลน์ผ่านแอป ${orderNo}`,
                                  "สาขา": "ซื้อผ่านแอป"
                              });
                              remainingToDeduct -= deductAmt;
                          }
                      }

                      // Create courses for purchased courses/services
                      for (const item of orderData.cart) {
                          if (item.type === 'course' || item.type === 'single_course') {
                              for (let i = 0; i < item.qty; i++) {
                                  const courseNo = `IC${Date.now().toString().slice(-6)}${i}`;
                                  const courseRef = doc(getAppCollection('courses'));
                                  
                                  const courseTotalQty = String(getFuzzyKey(item.originalItem, ["จำนวนครั้ง", "col_7"]) || "1");
                                  let creditReceived = String(getFuzzyKey(item.originalItem, ["เครดิตที่ได้รับ", "เครดิตที่ได้", "ยอดเครดิต", "เครดิต", "วงเงินคอร์ส", "col_14"]) || "0");
                                  if (parseNumber(creditReceived) === 0 && String(item.name).match(/(เติมเงิน|เครดิต|วงเงิน|ฝากเงิน|voucher)/i)) {
                                      creditReceived = String(item.price);
                                  }

                                  let expireDateStr = "";
                                  if (item.type === 'single_course') {
                                      const expDate = new Date(customDateObj);
                                      expDate.setDate(expDate.getDate() + 7);
                                      const exY = expDate.getFullYear() + 543;
                                      expireDateStr = `${String(expDate.getDate()).padStart(2, '0')}/${String(expDate.getMonth() + 1).padStart(2, '0')}/${exY}`;
                                  }

                                  const courseData = {
                                      "เบอร์โทร": cPhone,
                                      "cleanPhone": custCleanPhone,
                                      "เลขที่ใบคอส": courseNo,
                                      "วันที่ซื้อ": dateStr,
                                      "ผู้ซื้อคอส": cName,
                                      "ชื่อคอส": item.name,
                                      "สาขาที่ซื้อ": "ซื้อผ่านแอป",
                                      "ราคา": String(item.price),
                                      "เครดิตที่ได้รับ": creditReceived,
                                      "จำนวนครั้งที่ได้": courseTotalQty,
                                      "ยอดค้างชำระ": "0",
                                      "ยอดชำระแล้วทั้งหมด": String(item.price),
                                      "ครั้งที่ใช้": "0",
                                      "ครั้งที่เหลือดิบ": courseTotalQty,
                                      "สถานะ": "ยังคงเหลือ",
                                      "ประเภทการชำระ": "จ่ายเต็มผ่านเครดิต (LIFF)",
                                      "รายการที่ได้รับ": String(getFuzzyKey(item.originalItem, ["รายการที่ได้รับ", "col_11"]) || ''),
                                      "ฟรีบัตรสมาชิก": String(getFuzzyKey(item.originalItem, ["ฟรีบัตรสมาชิก"]) || 'ไม่'),
                                      "claimedItems": []
                                  };
                                  if (expireDateStr) courseData["วันหมดอายุ"] = expireDateStr;
                                  batch.set(courseRef, courseData);

                                  const historyRef = doc(getAppCollection('histories'));
                                  batch.set(historyRef, {
                                      "วันที่": dateStr,
                                      "ชื่อลูกค้า": cName,
                                      "เบอร์โทร": cPhone,
                                      "cleanPhone": custCleanPhone,
                                      "หมายเลขคำสั่งซื้อ": orderNo,
                                      "ประเภท": "ซื้อคอร์ส",
                                      "สถานะ": "เรียบร้อย",
                                      "สินค้า": item.name,
                                      "ยอดเงิน": String(item.price),
                                      "สาขา": "ซื้อผ่านแอป",
                                      "อ้างอิง": courseNo
                                  });
                              }
                          } else if (item.type === 'product') {
                              // We can also record history for product purchases just in case
                              const historyRef = doc(getAppCollection('histories'));
                              batch.set(historyRef, {
                                  "วันที่": dateStr,
                                  "ชื่อลูกค้า": cName,
                                  "เบอร์โทร": cPhone,
                                  "cleanPhone": custCleanPhone,
                                  "หมายเลขคำสั่งซื้อ": orderNo,
                                  "ประเภท": "ซื้อสินค้า",
                                  "สถานะ": "เรียบร้อย",
                                  "สินค้า": item.name,
                                  "จำนวน": String(item.qty),
                                  "ยอดเงิน": String(item.price * item.qty),
                                  "สาขา": "ซื้อผ่านแอป"
                              });
                          }
                      }

                      await batch.commit();
                      setIsCartModalOpen(false);
                      setCart([]);
                      showToast('ชำระเงินและเพิ่มคอร์สเรียบร้อยแล้วค่ะ! ✨');
                      return { success: true, orderId: orderNo };
                  } else {
                      const batch = writeBatch(db);
                      
                      // Remove undefined values from cart to prevent Firestore errors
                      const cleanCart = orderData.cart.map(item => {
                          const cleaned = { ...item };
                          Object.keys(cleaned).forEach(key => cleaned[key] === undefined && delete cleaned[key]);
                          return cleaned;
                      });

                      // 1. Create order for Admin Dashboard to verify
                      const orderRef = doc(getAppCollection('orders'));
                      batch.set(orderRef, {
                          orderNo: orderNo,
                          customerName: cName,
                          customerPhone: cPhone,
                          cleanPhone: custCleanPhone,
                          cartItems: cleanCart,
                          totalPrice: orderData.finalPrice,
                          paymentMethod: orderData.paymentMethod,
                          slipImage: orderData.slipImage || '',
                          status: 'รอตรวจสอบ',
                          shippingAddress: orderData.deliveryInfo || '',
                          createdAt: customDateObj.toISOString(),
                          updatedAt: customDateObj.toISOString()
                      });

                      // 2. Create history record for Customer App so it shows in 'Orders' immediately
                      const historyRef = doc(getAppCollection('histories'));
                      const mainItemName = orderData.cart.length > 0 ? orderData.cart[0].name + (orderData.cart.length > 1 ? ` และอื่นๆ (+${orderData.cart.length-1})` : '') : 'รายการสั่งซื้อ';
                      
                      batch.set(historyRef, {
                          "วันที่": dateStr,
                          "เวลา": timeStr,
                          "ชื่อลูกค้า": cName,
                          "เบอร์โทร": cPhone,
                          "cleanPhone": custCleanPhone,
                          "หมายเลขคำสั่งซื้อ": orderNo,
                          "ประเภท": orderData.cart.some(i => i.type === 'product') ? "สั่งซื้อสินค้า" : "สั่งซื้อคอร์ส",
                          "สถานะ": "รอตรวจสอบ",
                          "สินค้า": mainItemName,
                          "ยอดเงิน": String(orderData.finalPrice),
                          "สาขา": "ซื้อผ่านแอป",
                          "cartItems": cleanCart,
                          "slipImage": orderData.slipImage || '',
                          "shippingAddress": orderData.deliveryInfo || ''
                      });

                      await batch.commit();
                      setIsCartModalOpen(false);
                      setCart([]);
                      showToast('ส่งคำสั่งซื้อเรียบร้อยแล้วค่ะ รอแอดมินตรวจสอบสักครู่นะคะ ✨');
                      return { success: true, orderId: orderNo };
                  }
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

        {/* --- 🌟 SKIN AI MODALS 🌟 --- */}
        <SkinCheckModal
          isOpen={showSkinCheck}
          onClose={() => setShowSkinCheck(false)}
          app={app}
          shopItems={dbProducts.filter(p => p.id).map(p => ({ id: p.id, name: String(getFuzzyKey(p, ["ชื่อสินค้า", "ชื่อ", "name"]) || ''), price: parseNumber(getFuzzyKey(p, ["ราคาขายเต็ม", "ราคา", "col_6"])), type: 'product', image: getFuzzyKey(p, ["รูปภาพ", "รูป", "image", "img"]) }))}
          historyEnabled={featureFlags.skinProgress !== false}
          moleEnabled={featureFlags.moleScan !== false}
          onScanComplete={handleScanComplete}
          onOpenHistory={() => setShowSkinProgress(true)}
          onOpenSurvey={() => setShowSurvey(true)}
          onBookService={() => showToast('ฟีเจอร์จองบริการจากผลวิเคราะห์จะเปิดในเร็วๆ นี้ค่ะ ติดต่อสาขาได้เลย')}
          onAddToCart={(item) => { handleAddToCart({ ...item, price: Number(item.price || 0) }); showToast(`เพิ่ม "${item.name}" ลงตะกร้าแล้ว`); }}
          onGoToShop={() => { setShowSkinCheck(false); setActiveNav('shop'); }}
        />
        <SkinProgressModal
          isOpen={showSkinProgress}
          onClose={() => setShowSkinProgress(false)}
          phone={customerData?.cleanPhone}
          getAppCollection={getAppCollection}
        />

        <HelpCenterModal
          isOpen={isHelpCenterOpen}
          onClose={() => setIsHelpCenterOpen(false)}
        />

        {/* VIP REGISTRATION MODAL */}
        <VipRegistrationModal 
           isOpen={isVipRegistrationOpen} 
           onClose={() => setIsVipRegistrationOpen(false)} 
           customerData={customerData}
           showToast={showToast}
        />

        <PromotionModal
           isOpen={isPromotionModalOpen}
           onClose={() => setIsPromotionModalOpen(false)}
        />

        <WalletTopUpModal
          isOpen={isWalletTopUpOpen}
          setIsOpen={setIsWalletTopUpOpen}
          customerData={customerData}
          selectedBranch="สาขาเฉวง"
          availableBranches={["สาขาเฉวง", "สาขาหน้าทอน"]}
          PROMPTPAY_CONFIG={{
              "สาขาเฉวง": { id: "0811111111", name: "บจก. ไอริส คลินิก" },
              "สาขาหน้าทอน": { id: "0822222222", name: "บจก. ไอริส คลินิก" }
          }}
          showToast={showToast}
          isActionLoading={isActionLoading}
          setIsActionLoading={setIsActionLoading}
          getAppCollection={getAppCollection}
          onTopUpSuccess={(data) => {
              // This is handled inside WalletTopUpModal, just a callback hook
          }}
        />
        <AIFeedbackModal
          isOpen={showSurvey}
          onClose={() => setShowSurvey(false)}
          customerData={customerData}
          getAppCollection={getAppCollection}
          getAppDoc={getAppDoc}
          showToast={showToast}
        />

        {/* --- TOAST --- */}
        {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-bottom-4 duration-300 px-4 w-full max-w-md pointer-events-none">
            <div className={`mx-auto px-5 py-3.5 rounded-2xl shadow-2xl flex items-center text-white font-bold text-xs ${toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'}`}>
              {toast.type === 'error' ? <AlertCircle size={16} className="mr-2 shrink-0"/> : <CheckCircle size={16} className="mr-2 shrink-0"/>}
              <span className="leading-relaxed">{toast.msg}</span>
            </div>
          </div>
        )}

        {/* --- COURSE DETAIL MODAL (เหมือนฝั่งแอดมิน) --- */}
        {selectedCourseDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 border border-gray-100">
               
               {/* Header */}
               <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-teal-500 to-emerald-500 text-white relative shrink-0">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
                  <div className="relative z-10">
                     <h2 className="text-xl font-black mb-1 pr-6">{getFuzzyKey(selectedCourseDetail, "ชื่อคอส")}</h2>
                     <p className="font-mono text-white/80 text-[10px]">Ref: {getFuzzyKey(selectedCourseDetail, "เลขที่ใบคอส")}</p>
                  </div>
                  <button onClick={() => setSelectedCourseDetail(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 relative z-10 shrink-0"><X size={16}/></button>
               </div>

               <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-gray-50/50">
                  {/* Customer Info & Status */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                     <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                             {customerData.lineProfilePic ? <img src={customerData.lineProfilePic} alt="Profile" className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400" />}
                         </div>
                        <div className="overflow-hidden">
                            <p className="text-[9px] font-bold text-gray-400 uppercase">ลูกค้า</p>
                            <p className="font-black text-sm text-gray-800 line-clamp-1">{getFuzzyKey(customerData, "ชื่อ")}</p>
                            <p className="text-[10px] font-mono text-gray-500">{customerData.cleanPhone}</p>
                        </div>
                     </div>
                     <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-right flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">สถานะปัจจุบัน</p>
                        <p className={`font-black text-lg ${selectedCourseDetail.remaining > 0 ? 'text-teal-600' : 'text-gray-500'}`}>{selectedCourseDetail.remaining > 0 ? 'ยังคงเหลือ' : 'ใช้ครบแล้ว'}</p>
                     </div>
                  </div>
                  
                  {/* Usage Stats */}
                  <div className="flex justify-around items-center border-4 border-gray-800 bg-white rounded-3xl p-4 mb-5 text-center shadow-sm">
                     <div><p className="text-[10px] font-bold text-gray-500 uppercase">ทั้งหมด</p><p className="text-2xl font-black">{parseNumber(getFuzzyKey(selectedCourseDetail, "จำนวนครั้งที่ได้"))}</p></div><div className="w-px h-10 bg-gray-200"></div>
                     <div><p className="text-[10px] font-bold text-teal-600 uppercase">ใช้ไปแล้ว</p><p className="text-2xl font-black text-teal-600">{selectedCourseDetail.totalUsed}</p></div><div className="w-px h-10 bg-gray-200"></div>
                     <div><p className="text-[10px] font-bold text-orange-600 uppercase">คงเหลือ</p><p className="text-3xl font-black text-orange-600">{selectedCourseDetail.remaining}</p></div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex justify-between text-[10px] font-bold mb-2">
                          <span className="text-gray-600">การใช้คอร์ส ({Math.round(Math.min(100, Math.max(0, (selectedCourseDetail.totalUsed / Math.max(1, parseNumber(getFuzzyKey(selectedCourseDetail, "จำนวนครั้งที่ได้")))) * 100)))}%)</span>
                          {getFuzzyKey(selectedCourseDetail, "หมดอายุ") && <span className="flex items-center text-gray-500"><Clock size={10} className="mr-1"/> หมดอายุ: {getFuzzyKey(selectedCourseDetail, "หมดอายุ")}</span>}
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, (selectedCourseDetail.totalUsed / Math.max(1, parseNumber(getFuzzyKey(selectedCourseDetail, "จำนวนครั้งที่ได้")))) * 100))}%` }}></div>
                      </div>
                  </div>

                  {/* Actions */}
                  <div className="mb-6 space-y-2">
                     <button onClick={() => { setSelectedCourseDetail(null); setShowQR(selectedCourseDetail); }} className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-teal-500/30 flex items-center justify-center text-base active:scale-95 transition-all"><QrCode className="mr-2"/> รับบริการ / เบิกสินค้า (แสดง QR)</button>
                     
                     <button onClick={() => { 
                        const courseName = String(getFuzzyKey(selectedCourseDetail, "ชื่อคอส") || '').trim();
                        const matchingMaster = dbMasterCourses.find(mc => String(getFuzzyKey(mc, ["ชื่อคอส", "col_4"]) || '').trim() === courseName);
                        if (matchingMaster) {
                          const rawPrice = parseNumber(getFuzzyKey(matchingMaster, ["ราคา", "ราคาขาย", "col_6", "col_5"]) || matchingMaster.price || 0);
                          const desc = String(getFuzzyKey(matchingMaster, ["รายละเอียดสินค้า", "รายละเอียด", "รายละเอียดสินค้า (ถ้ามี)", "description", "details"]) || matchingMaster.desc || '').trim();
                          const credit = parseNumber(getFuzzyKey(matchingMaster, ["เครดิต", "วงเงิน", "credit", "col_8"]) || 0);
                          const itemCat = String(getFuzzyKey(matchingMaster, ["หมวดหมู่", "หมวดสินค้า", "category", "ประเภท", "col_2"]) || 'บริการคลินิก').trim();
                          const validity = String(getFuzzyKey(matchingMaster, ["อายุ", "อายุคอร์ส", "validity", "กำหนดเวลา"]) || '').trim();
                          
                          const vipVal = String(getFuzzyKey(matchingMaster, ["แถม VIP", "แถม VIP Card", "vip", "ฟรีบัตรสมาชิก"]) || '').trim().toLowerCase();
                          const isVip = vipVal === 'true' || vipVal === 'yes' || vipVal === 'ใช่' || vipVal === 'แถม' || vipVal === 'มี';
                          
                          const receivedItems = String(getFuzzyKey(matchingMaster, ["รายการที่ได้รับในคอร์ส", "รายการที่ได้รับ", "receivedItems", "คอร์สย่อย"]) || '').trim();

                          const imageStr = String(getFuzzyKey(matchingMaster, ["รูปภาพ", "รูป", "image", "img", "col_13"]) || '').trim();
                          const imagesArray = imageStr.split(/[\n, ]+/).map(s => s.trim()).filter(s => s.startsWith('http'));
                          const finalImages = imagesArray.length > 0 ? imagesArray : (matchingMaster.images || []);
                          const finalImage = finalImages.length > 0 ? (typeof finalImages[0] === 'object' ? finalImages[0].src : finalImages[0]) : '';

                          setSelectedProduct({
                            ...matchingMaster,
                            name: String(getFuzzyKey(matchingMaster, ["ชื่อคอส", "col_4"]) || matchingMaster.name).trim(),
                            image: finalImage,
                            images: finalImages,
                            price: rawPrice,
                            type: 'course',
                            desc: desc,
                            credit: credit,
                            itemCategory: itemCat,
                            validity: validity,
                            isVip: isVip,
                            receivedItems: receivedItems
                          });
                        } else {
                          const matchingProd = dbProducts.find(p => String(getFuzzyKey(p, ["ชื่อสินค้า", "col_2", "ชื่อ", "name"]) || '').trim() === courseName);
                          if (matchingProd) {
                            const rawPrice = parseNumber(getFuzzyKey(matchingProd, ["ราคาขายเต็ม", "ราคาปกติ", "col_6"]) || matchingProd.price || 0);
                            const desc = String(getFuzzyKey(matchingProd, ["รายละเอียดสินค้า", "รายละเอียด", "รายละเอียดสินค้า (ถ้ามี)", "description", "details"]) || matchingProd.description || '').trim();
                            const imageStr = String(getFuzzyKey(matchingProd, ["รูปภาพ", "รูป", "image", "img", "col_13"]) || matchingProd.image || '').trim();
                            const imagesArray = imageStr.split(/[\n, ]+/).map(s => s.trim()).filter(s => s.startsWith('http'));
                            const finalImages = matchingProd.images && matchingProd.images.length > 0 ? matchingProd.images : (imagesArray.length > 0 ? imagesArray : []);
                            const finalImage = finalImages.length > 0 ? (typeof finalImages[0] === 'object' ? finalImages[0].src : finalImages[0]) : '';

                            setSelectedProduct({
                              ...matchingProd,
                              name: String(getFuzzyKey(matchingProd, ["ชื่อสินค้า", "col_2", "ชื่อ", "name"]) || matchingProd.name).trim(),
                              image: finalImage,
                              images: finalImages,
                              price: rawPrice,
                              type: 'product',
                              desc: desc
                            });
                          }
                          else alert("ไม่พบรายละเอียดคอร์สนี้ในระบบ (อาจถูกลบหรือเปลี่ยนชื่อ)");
                        }
                     }} className="w-full bg-white text-gray-700 py-3 rounded-2xl font-bold border border-gray-200 shadow-sm flex items-center justify-center text-sm active:scale-95 transition-all hover:bg-gray-50"><Info className="mr-2" size={16}/> ดูรายละเอียดสิ่งที่ได้รับในคอร์ส</button>
                  </div>

                  {/* History */}
                  <h3 className="font-black text-gray-800 mb-3 flex items-center text-sm"><HistoryIcon size={16} className="mr-2 text-gray-400"/> ประวัติการรับบริการ / หักยอดคอร์ส</h3>
                  <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                     {(() => {
                         const refKey = String(getFuzzyKey(selectedCourseDetail, "อ้างอิง") || getFuzzyKey(selectedCourseDetail, "เลขที่ใบคอส") || selectedCourseDetail.id || '');
                         const histories = courseUsages.filter(h => {
                            const hRef = String(getFuzzyKey(h, ["อ้างอิง", "เลขที่ใบคอส", "col_6"]) || '');
                            return hRef === refKey && refKey !== '';
                         });

                         if (histories.length === 0) return <div className="text-center py-6 text-gray-400 italic text-xs">ไม่มีประวัติการใช้งาน</div>;

                         return (
                             <div className="space-y-3">
                                 {histories.map((h, i) => (
                                     <div key={i} className="flex justify-between items-center text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                         <div>
                                             <span className="font-mono text-gray-400 mr-2">{getFuzzyKey(h, "วันที่")}</span>
                                             <span className="font-bold text-gray-800">{getFuzzyKey(h, "ประเภท")} {getFuzzyKey(h, "รายการ") ? `: ${getFuzzyKey(h, "รายการ")}` : ''}</span>
                                         </div>
                                         <span className="font-black px-2 py-0.5 rounded bg-teal-50 text-teal-600 text-[10px] shrink-0 ml-2">หัก {parseNumber(getFuzzyKey(h, "จำนวน")) || 1}</span>
                                     </div>
                                 ))}
                             </div>
                         );
                     })()}
                  </div>
               </div>
            </div>
          </div>
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

        <BookingModal
            isBookingModalOpen={isBookingModalOpen}
            closeBookingModal={() => setIsBookingModalOpen(false)}
            bookingStep={bookingStep}
            bookingCourse={bookingCourse}
            bookingForm={bookingForm}
            customerData={customerData}
            setBookingForm={setBookingForm}
            handleBookingSubmit={handleBookingSubmit}
            handleRescheduleSubmit={handleRescheduleSubmit}
            bookingError={bookingError}
            availableBranches={["สาขาเฉวง", "สาขาหน้าทอน"]}
            bookingDateList={bookingDateList}
            formatShortDate={formatShortDate}
            getLocalDateString={getLocalDateString}
            storeHolidays={[]}
            timeSlots={timeSlots}
            bookedTimeRanges={bookedTimeRanges}
            timeToMins={timeToMins}
            isSubmittingBooking={isSubmittingBooking}
            generatedTicket={generatedTicket}
            setGeneratedTicket={setGeneratedTicket}
            setBookingStep={setBookingStep}
            setBookingCourse={setBookingCourse}
            setIsBookingModalOpen={setIsBookingModalOpen}
            setShowCancelConfirm={setShowCancelConfirm}
            setBookingError={setBookingError}
            showCancelConfirm={showCancelConfirm}
            isActionLoading={isActionLoading}
            handleCancelBooking={handleCancelBooking}
            openReschedule={openReschedule}
        />

      </div>
    </div>
  );
}