import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBS3zKEA6zosmy8tLRTyJ38BPLlUQS30gU",
  authDomain: "iris-clinic-app.firebaseapp.com",
  projectId: "iris-clinic-app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "iris-care");

async function main() {
  const querySnapshot = await getDocs(collection(db, "master_courses"));
  const codes = new Set();
  const examples = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const code = data["รหัส"] || data["รหัสคอส"] || data["col_1"] || data["col_3"];
    codes.add(code);
    examples.push({ code, name: data["col_4"] });
  });
  console.log("Codes:", Array.from(codes).filter(Boolean).slice(0, 20));
  console.log("Examples:", examples.slice(0, 10));
}

main().catch(console.error);
