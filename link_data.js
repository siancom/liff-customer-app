import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';

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

async function linkData() {
  console.log("Signing in anonymously...");
  await signInAnonymously(auth);
  
  console.log("Loading all customers...");
  const custSnap = await getDocs(collection(db, 'customers'));
  const customers = custSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log("Loading all histories...");
  const histSnap = await getDocs(collection(db, 'histories'));
  
  let batch = writeBatch(db);
  let count = 0;

  for (const docSnap of histSnap.docs) {
      const h = docSnap.data();
      if (h.cleanPhone) continue; // Already linked

      const hCleanName = h.cleanName || "";
      if (!hCleanName) continue;

      // Find matching customer using the same includes logic
      const matchedCust = customers.find(c => {
          const cCleanName = c.cleanName || "";
          return cCleanName && (cCleanName === hCleanName || cCleanName.includes(hCleanName) || hCleanName.includes(cCleanName));
      });

      if (matchedCust && matchedCust.cleanPhone) {
          batch.update(docSnap.ref, { cleanPhone: matchedCust.cleanPhone });
          count++;
          if (count === 400) {
              await batch.commit();
              console.log("Committed 400 history links...");
              batch = writeBatch(db);
              count = 0;
          }
      }
  }
  if (count > 0) {
      await batch.commit();
      console.log(`Committed remaining ${count} history links.`);
  }
  console.log("Histories linked to cleanPhone!");

  console.log("Loading all courses...");
  const courseSnap = await getDocs(collection(db, 'courses'));
  
  let batch2 = writeBatch(db);
  let count2 = 0;

  for (const docSnap of courseSnap.docs) {
      const c = docSnap.data();
      if (c.cleanPhone) continue; // Already has phone

      const cCleanName = c.cleanName || "";
      if (!cCleanName) continue;

      const matchedCust = customers.find(cust => {
          const custCleanName = cust.cleanName || "";
          return custCleanName && (custCleanName === cCleanName || custCleanName.includes(cCleanName) || cCleanName.includes(custCleanName));
      });

      if (matchedCust && matchedCust.cleanPhone) {
          batch2.update(docSnap.ref, { cleanPhone: matchedCust.cleanPhone });
          count2++;
          if (count2 === 400) {
              await batch2.commit();
              console.log("Committed 400 course links...");
              batch2 = writeBatch(db);
              count2 = 0;
          }
      }
  }
  if (count2 > 0) {
      await batch2.commit();
      console.log(`Committed remaining ${count2} course links.`);
  }
  console.log("Courses linked to cleanPhone!");

  process.exit(0);
}

linkData().catch(console.error);
