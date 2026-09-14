import { initializeApp } from "firebase/app";
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
const db = getFirestore(app, "iris-care");

async function main() {
  const querySnapshot = await getDocs(collection(db, "master_courses"));
  const cats = new Set();
  const names = new Set();
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    cats.add(data["ประเภท"] || data["หมวดหมู่"] || data["col_2"]);
    if (String(data["col_4"]).includes("ครั้ง") || String(data["col_2"]).includes("ครั้ง")) {
      names.add(`${data["col_4"]} [${data["col_2"]}]`);
    }
  });
  console.log("Categories:", Array.from(cats).filter(Boolean));
  console.log("Names with 'ครั้ง':", Array.from(names).slice(0, 10));
}

main().catch(console.error);
