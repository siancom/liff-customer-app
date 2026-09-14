import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBS3zKEA6zosmy8tLRTyJ38BPLlUQS30gU",
  authDomain: "iris-clinic-app.firebaseapp.com",
  projectId: "iris-clinic-app",
  storageBucket: "iris-clinic-app.firebasestorage.app",
  messagingSenderId: "372749467528",
  appId: "1:372749467528:web:1e90ecab74274ec965843d",
  measurementId: "G-BQW1W46XSH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "iris-care");

function getFuzzyKey(obj, targetKeys) {
  if (!obj) return undefined;
  const targets = Array.isArray(targetKeys) ? targetKeys : [targetKeys];
  for (let target of targets) {
    if (obj[target] !== undefined && obj[target] !== '') return obj[target];
  }
  for (let target of targets) {
    const cleanTarget = target.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase();
    const exactKey = Object.keys(obj).find(k => {
        const cleanK = k.replace(/[\s\u200B-\u200D\uFEFF"'\r\n]/g, '').toLowerCase();
        return cleanK === cleanTarget;
    });
    if (exactKey && obj[exactKey] !== '') return obj[exactKey];
  }
  for (let target of targets) {
    const cleanTarget = target.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase();
    if (['ยอด', 'ราคา', 'จำนวน', 'ชื่อ'].includes(cleanTarget)) continue;

    const matchingKeys = Object.keys(obj).filter(k => k.replace(/[\s\u200B-\u200D\uFEFF"'\r\n]/g, '').toLowerCase().includes(cleanTarget));

    for (let mk of matchingKeys) {
        if (obj[mk] !== '') return obj[mk];
    }
  }
  return undefined;
}

async function normalizeData() {
  console.log("Signing in anonymously...");
  await signInAnonymously(auth);
  console.log("Signed in.");

  // 1. Normalize Customers
  console.log("Fetching customers...");
  const custSnap = await getDocs(collection(db, 'customers'));
  let custUpdates = 0;
  
  let batch1 = writeBatch(db);
  let b1Count = 0;

  for (const docSnap of custSnap.docs) {
    const data = docSnap.data();
    const dbPhoneRaw = String(getFuzzyKey(data, ["เบอร์โทร", "เบอร์", "โทรศัพท์", "เบอร์โทรศัพท์", "col_3"]) || '');
    const cleanPhone = dbPhoneRaw.replace(/[^0-9]/g, '');
    
    const custNameRaw = String(getFuzzyKey(data, ["ชื่อลูกค้า", "ชื่อ", "ชื่อ-นามสกุล", "col_1"]) || '').trim();
    const cleanName = custNameRaw.replace(/\s/g, '').toLowerCase();

    const updates = {};
    if (cleanPhone && data.cleanPhone !== cleanPhone) {
        updates.cleanPhone = cleanPhone;
    }
    if (cleanName && data.cleanName !== cleanName) {
        updates.cleanName = cleanName;
    }

    if (Object.keys(updates).length > 0) {
        batch1.update(docSnap.ref, updates);
        b1Count++;
        if (b1Count === 400) {
            await batch1.commit();
            console.log("Committed 400 customer updates...");
            batch1 = writeBatch(db);
            b1Count = 0;
        }
    }
  }
  if (b1Count > 0) {
      await batch1.commit();
      console.log(`Committed remaining ${b1Count} customer updates.`);
  }

  console.log("Customers normalized!");

  // 2. Normalize Histories
  console.log("Fetching histories...");
  const histSnap = await getDocs(collection(db, 'histories'));
  let batch2 = writeBatch(db);
  let b2Count = 0;

  for (const docSnap of histSnap.docs) {
      const h = docSnap.data();
      const hNameRaw = String(getFuzzyKey(h, ["ชื่อลูกค้า", "ชื่อ", "col_2"]) || '').trim();
      const hCleanName = hNameRaw.replace(/\s/g, '').toLowerCase();

      if (hCleanName && h.cleanName !== hCleanName) {
          batch2.update(docSnap.ref, { cleanName: hCleanName });
          b2Count++;
          if (b2Count === 400) {
              await batch2.commit();
              console.log("Committed 400 histories updates...");
              batch2 = writeBatch(db);
              b2Count = 0;
          }
      }
  }
  if (b2Count > 0) {
      await batch2.commit();
      console.log(`Committed remaining ${b2Count} histories updates.`);
  }
  console.log("Histories normalized!");

  // 3. Normalize Courses
  console.log("Fetching courses...");
  const courseSnap = await getDocs(collection(db, 'courses'));
  let batch3 = writeBatch(db);
  let b3Count = 0;

  for (const docSnap of courseSnap.docs) {
      const c = docSnap.data();
      const cPhoneRaw = String(getFuzzyKey(c, ["เบอร์โทร", "เบอร์", "โทรศัพท์", "col_1"]) || '');
      const cPhoneClean = cPhoneRaw.replace(/[^0-9]/g, '');
      const cNameRaw = String(getFuzzyKey(c, ["ผู้ซื้อคอส", "ชื่อลูกค้า", "ชื่อ", "col_9"]) || '').trim();
      const cCleanName = cNameRaw.replace(/\s/g, '').toLowerCase();

      const updates = {};
      if (cPhoneClean && c.cleanPhone !== cPhoneClean) updates.cleanPhone = cPhoneClean;
      if (cCleanName && c.cleanName !== cCleanName) updates.cleanName = cCleanName;

      if (Object.keys(updates).length > 0) {
          batch3.update(docSnap.ref, updates);
          b3Count++;
          if (b3Count === 400) {
              await batch3.commit();
              console.log("Committed 400 courses updates...");
              batch3 = writeBatch(db);
              b3Count = 0;
          }
      }
  }
  if (b3Count > 0) {
      await batch3.commit();
      console.log(`Committed remaining ${b3Count} courses updates.`);
  }
  console.log("Courses normalized!");
  
  process.exit(0);
}

normalizeData().catch(console.error);
