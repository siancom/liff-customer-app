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
const dbDefault = getFirestore(app);
const dbIrisCare = getFirestore(app, "iris-care");

async function test() {
    try {
        await signInAnonymously(auth);
        
        try {
            const snap1 = await getDocs(collection(dbDefault, 'artifacts', 'iris-clinic-app', 'public', 'data', 'customers'));
            console.log("Default DB -> artifacts/.../customers:", snap1.size);
        } catch(e) { console.log("Default DB -> artifacts/.../customers FAILED", e.message); }

        try {
            const snap2 = await getDocs(collection(dbDefault, 'customers'));
            console.log("Default DB -> /customers:", snap2.size);
        } catch(e) { console.log("Default DB -> /customers FAILED", e.message); }

        try {
            const snap3 = await getDocs(collection(dbIrisCare, 'artifacts', 'iris-clinic-app', 'public', 'data', 'customers'));
            console.log("iris-care DB -> artifacts/.../customers:", snap3.size);
        } catch(e) { console.log("iris-care DB -> artifacts/.../customers FAILED", e.message); }

        try {
            const snap4 = await getDocs(collection(dbIrisCare, 'customers'));
            console.log("iris-care DB -> /customers:", snap4.size);
            if (snap4.size > 0) {
                let found = false;
                snap4.forEach(doc => {
                    if (JSON.stringify(doc.data()).includes('0878523749')) found = true;
                });
                console.log("Mockup found in iris-care DB -> /customers:", found);
            }
        } catch(e) { console.log("iris-care DB -> /customers FAILED", e.message); }

        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
test();
