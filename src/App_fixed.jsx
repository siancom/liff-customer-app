import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles, CheckCircle, Phone, AlertCircle, ArrowRight, LogOut, Award } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { auth, db, appId, getAppCollection, getAppDoc } from './config/firebase';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';

// --- UTILS ---
import { getFuzzyKey } from './utils/helpers';
import { buildCustomerData } from './utils/customerUtils';

// --- COMPONENTS ---
import BottomNav from './components/BottomNav';
import WalletTopUpModal from './components/modals/WalletTopUpModal';
import WalletTransferModal from './components/modals/WalletTransferModal';
import ReceiptModal from './components/modals/ReceiptModal';

// --- PAGES ---
import Home from './pages/Home';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import Orders from './pages/Orders';
import Gamification from './pages/Gamification';

const LIFF_ID = "1657901378-jqDBnplK";
const PROMPTPAY_CONFIG = {
  'สาขาเฉวง': { id: "0815093284", name: "นายอิทธิชัย สังคะโห (สาขาเฉวง)" },
  'สาขาละไม': { id: "0999999999", name: "บจก. ไอริสแคร์ (สาขาละไม)" }
};
const AVAILABLE_BRANCHES = ['สาขาเฉวง', 'สาขาละไม'];

export default function CustomerApp() {
  const [appState, setAppState] = useState('loading');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerData, setCustomerData] = useState(null);
  
  const [lineProfile, setLineProfile] = useState(null);
  const [user, setUser] = useState(null);
  
  const [dbCourses, setDbCourses] = useState([]);
  const [dbCustomersRaw, setDbCustomersRaw] = useState([]);
  const [dbHistories, setDbHistories] = useState([]);

  cons
<truncated 14927 bytes>