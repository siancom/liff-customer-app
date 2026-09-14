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
  const allNames = [];
  querySnapshot.forEach((doc) => {
    allNames.push(doc.data()["col_4"]);
  });
  const singleTime = allNames.filter(n => n && (n.includes("1 ครั้ง") || n.includes("รายครั้ง") || n.includes("1ครั้ง")));
  const multiTime = allNames.filter(n => n && (n.match(/[2-9]\s*ครั้ง|1[0-9]\s*ครั้ง/)));
  console.log("Single Time (Sample 10):", singleTime.slice(0, 10));
  console.log("Multi Time (Sample 10):", multiTime.slice(0, 10));
}

main().catch(console.error);
