const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Import QRCodeSVG
const qrImportTarget = `} from 'lucide-react';`;
const qrImportNew = `} from 'lucide-react';\nimport { QRCodeSVG } from 'qrcode.react';`;
if (!content.includes('QRCodeSVG')) content = content.replace(qrImportTarget, qrImportNew);

// 2. Remove customer_rewards_redemptions listener
const oldEffectTarget = `  useEffect(() => {
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

const newEffect = `  useEffect(() => {
     if (customerData?.redeemedRewards) {
        setRewardRedemptions(customerData.redeemedRewards);
     } else {
        setRewardRedemptions([]);
     }
  }, [customerData?.redeemedRewards]);`;

if (content.includes('customer_rewards_redemptions')) {
    content = content.replace(oldEffectTarget, newEffect);
}

// 3. Update handleRedeemReward
const oldHandleRedeem = `  const handleRedeemReward = async (reward) => {
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
  };`;

const newHandleRedeem = `  const handleRedeemReward = async (reward) => {
      if (!customerData?.id) {
          alert("ไม่พบข้อมูลลูกค้า");
          return;
      }
      
      const totalAccumulated = parseNumber(customerData.realAccumulatedAmount) || 0;
      const totalPoints = Math.floor(totalAccumulated / 50);
      const spentPoints = rewardRedemptions.reduce((sum, r) => sum + (r.pointsUsed || r.points || 0), 0);
      const currentPoints = totalPoints - spentPoints;

      if (currentPoints < reward.points) {
          alert("แต้มสะสมของคุณไม่เพียงพอสำหรับการแลกรางวัลนี้");
          return;
      }
      
      if (window.confirm(\`ยืนยันการแลก \${reward.name} ใช้ \${reward.points} แต้ม?\`)) {
          setIsRedeeming(true);
          try {
              const custRef = getAppDoc("customers", customerData.id);
              const newReward = {
                  id: \`rw_\${Date.now()}\`,
                  rewardId: reward.id,
                  name: reward.name,
                  pointsUsed: reward.points,
                  type: reward.type,
                  isUsed: false,
                  redeemedAt: new Date().toISOString()
              };
              
              const updatedRewards = [...(customerData.redeemedRewards || []), newReward];
              await updateDoc(custRef, { redeemedRewards: updatedRewards });
              
              alert('แลกรางวัลสำเร็จ! สามารถใช้ QR Code ยื่นให้พนักงานสาขาได้เลย');
          } catch (error) {
              console.error("Redeem error:", error);
              alert("เกิดข้อผิดพลาดในการแลกรางวัล");
          } finally {
              setIsRedeeming(false);
          }
      }
  };`;

content = content.replace(oldHandleRedeem, newHandleRedeem);

// 4. Update the Reward History rendering to use correct fields (reward.name instead of rewardName, redeemedAt instead of createdAt)
// Actually, in UI we used redemption.rewardName and redemption.createdAt
const oldHistoryRender = `<h4 className="text-[11px] font-bold text-gray-800 mb-0.5">{redemption.rewardName}</h4>
                                       <p className="text-[9px] text-gray-400 flex items-center">
                                           <Clock size={10} className="mr-1"/> 
                                           {redemption.createdAt?.toDate ? redemption.createdAt.toDate().toLocaleDateString('th-TH') : 'กำลังดำเนินการ'}
                                       </p>`;
const newHistoryRender = `<h4 className="text-[11px] font-bold text-gray-800 mb-0.5 flex items-center gap-1">
                                          {redemption.name || redemption.rewardName}
                                          {redemption.isUsed && <span className="bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded font-black">ใช้แล้ว</span>}
                                       </h4>
                                       <p className="text-[9px] text-gray-400 flex items-center">
                                           <Clock size={10} className="mr-1"/> 
                                           {redemption.redeemedAt ? new Date(redemption.redeemedAt).toLocaleDateString('th-TH') : (redemption.createdAt?.toDate ? redemption.createdAt.toDate().toLocaleDateString('th-TH') : 'กำลังดำเนินการ')}
                                       </p>`;
content = content.replace(oldHistoryRender, newHistoryRender);

const oldPointsUI = `const spentPoints = rewardRedemptions.reduce((sum, r) => sum + (r.pointsUsed || 0), 0);`;
const newPointsUI = `const spentPoints = rewardRedemptions.reduce((sum, r) => sum + (r.pointsUsed || r.points || 0), 0);`;
content = content.replace(oldPointsUI, newPointsUI);

const qrModalTarget = `                       <QrCode size={160} className="text-gray-800" />`;
const qrModalNew = `                       <QRCodeSVG 
                           value={JSON.stringify({
                               type: "reward",
                               code: showRewardQR.id,
                               customerId: customerData?.id,
                               phone: customerData?.cleanPhone
                           })} 
                           size={160} 
                           level="M" 
                           includeMargin={false} 
                       />`;
content = content.replace(qrModalTarget, qrModalNew);

// Also fix the name display in the QR modal
const qrNameTarget = `<h2 className="text-base font-black text-white mb-1 line-clamp-1">{showRewardQR.rewardName}</h2>`;
const qrNameNew = `<h2 className="text-base font-black text-white mb-1 line-clamp-1">{showRewardQR.name || showRewardQR.rewardName}</h2>`;
content = content.replace(qrNameTarget, qrNameNew);


fs.writeFileSync(appPath, content);
console.log("Patched App.jsx for admin compatibility.");
