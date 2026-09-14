const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Patch Firestore imports
const oldFsImports = `import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';`;
const newFsImports = `import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';`;
content = content.replace(oldFsImports, newFsImports);

// 2. Add State Variables for Rewards
const stateAnchor = `  const [activeImageIndex, setActiveImageIndex] = useState(0);`;
const rewardStates = `  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rewardRedemptions, setRewardRedemptions] = useState([]);
  const [showRewardQR, setShowRewardQR] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);`;
content = content.replace(stateAnchor, rewardStates);

// 3. Add MOCK_REWARDS
const mockAnchor = `const fallbackFirebaseConfig = {`;
const mockRewards = `const MOCK_REWARDS = [
    { id: 'r1', name: 'ทรีทเมนท์หน้าใส 1 ครั้ง', points: 200, type: 'course', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71c9?q=80&w=800&auto=format&fit=crop', desc: 'ผิวกระจ่างใสขึ้นทันทีหลังทำ' },
    { id: 'r2', name: 'เซรั่มบำรุงผิวสูตรพิเศษ', points: 150, type: 'product', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop', desc: 'ขวดขนาด 30ml มูลค่า 890 บาท' },
    { id: 'r3', name: 'ส่วนลดคอร์ส 500 บาท', points: 100, type: 'discount', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=800&auto=format&fit=crop', desc: 'ใช้เป็นส่วนลดสำหรับคอร์สใดก็ได้' }
];

const fallbackFirebaseConfig = {`;
content = content.replace(mockAnchor, mockRewards);

// 4. Add useEffect for rewardRedemptions
const effectAnchor = `  useEffect(() => {
     if (selectedProduct) setActiveImageIndex(0);
  }, [selectedProduct]);`;

const rewardEffect = `  useEffect(() => {
     if (selectedProduct) setActiveImageIndex(0);
  }, [selectedProduct]);

  useEffect(() => {
     if (customerData?.cleanPhone) {
        const q = query(getAppCollection("customer_rewards_redemptions"), where("customerPhone", "==", customerData.cleanPhone), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, snap => {
            const arr = [];
            snap.forEach(doc => arr.push({id: doc.id, ...doc.data()}));
            setRewardRedemptions(arr);
        });
        return () => unsub();
     } else {
        setRewardRedemptions([]);
     }
  }, [customerData?.cleanPhone]);`;
content = content.replace(effectAnchor, rewardEffect);

// 5. Add handleRedeemReward
const handleAnchor = `  const handleModalAddToCart = () => {`;
const redeemHandler = `  const handleRedeemReward = async (reward) => {
      if (!customerData?.cleanPhone) return;
      
      const totalAccumulated = parseNumber(customerData.realAccumulatedAmount) || 0;
      const totalPoints = Math.floor(totalAccumulated / 50);
      const spentPoints = rewardRedemptions.reduce((sum, r) => sum + (r.pointsUsed || 0), 0);
      const currentPoints = totalPoints - spentPoints;

      if (currentPoints < reward.points) {
          alert("แต้มสะสมของคุณไม่เพียงพอสำหรับการแลกรางวัลนี้");
          return;
      }
      
      if (window.confirm(\`ยืนยันการแลก \${reward.name} ใช้ \${reward.points} แต้ม?\`)) {
          setIsRedeeming(true);
          try {
              await addDoc(getAppCollection("customer_rewards_redemptions"), {
                  customerId: customerData.id || '',
                  customerPhone: customerData.cleanPhone,
                  rewardId: reward.id,
                  rewardName: reward.name,
                  pointsUsed: reward.points,
                  type: reward.type,
                  status: 'redeemed',
                  createdAt: serverTimestamp()
              });
              alert('แลกรางวัลสำเร็จ! สามารถดูรายละเอียดได้ในประวัติการแลก');
          } catch (error) {
              console.error("Redeem error:", error);
              alert("เกิดข้อผิดพลาดในการแลกรางวัล");
          } finally {
              setIsRedeeming(false);
          }
      }
  };

  const handleModalAddToCart = () => {`;
content = content.replace(handleAnchor, redeemHandler);

fs.writeFileSync(appPath, content);
console.log("Patched rewards logic successfully.");
