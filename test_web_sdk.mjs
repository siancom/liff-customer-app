import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function test() {
    try {
        await signInAnonymously(auth);
        console.log("Logged in anonymously");
        const appId = 'iris-clinic-app';
        const snapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'customers'));
        console.log("Customer docs count:", snapshot.size);
        
        let found = false;
        snapshot.forEach(doc => {
            const data = doc.data();
            const strData = JSON.stringify(data).replace(/\s/g, '');
            if (strData.includes('0878523749') || strData.includes('0811112222')) {
                console.log("FOUND MOCKUP CUSTOMER:", data);
                found = true;
            }
        });
        if (!found) console.log("Did not find mockup customer!");
        
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
test();
