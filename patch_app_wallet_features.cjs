const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Import necessary components
if (!content.includes('Camera')) {
    content = content.replace(`import { `, `import { Camera, Image as ImageIcon, CheckCircle, Save, `);
}

// 2. Add State Variables
const stateAnchor = `const [showCreditPayQR, setShowCreditPayQR] = useState(false);`;
const newState = `const [showCreditPayQR, setShowCreditPayQR] = useState(false);
  const [showPayQR, setShowPayQR] = useState(false);
  const [qrTimeLeft, setQrTimeLeft] = useState(0);
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [memberFormData, setMemberFormData] = useState({ image: null, isCompressing: false });
`;
if (!content.includes('showPayQR')) {
    content = content.replace(stateAnchor, stateAnchor + '\n' + newState);
}

// 3. Add useEffect for QR Timer
const effectAnchor = `useEffect(() => {
     if (customerData?.id) {`;
const qrEffect = `
  useEffect(() => {
    let timer;
    if (showPayQR && qrTimeLeft > 0) {
      timer = setInterval(() => {
        setQrTimeLeft((prev) => {
          if (prev <= 1) {
            setShowPayQR(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPayQR, qrTimeLeft]);

  const generatePayQR = () => {
    setShowPayQR(true);
    setQrTimeLeft(300); // 5 minutes
  };
`;
if (!content.includes('qrTimeLeft > 0')) {
    content = content.replace(effectAnchor, qrEffect + effectAnchor);
}

// 4. Implement Member Form Submission Logic
const formLogicAnchor = `const handleRedeemReward = async (reward) => {`;
const formLogic = `
  const handleMemberApply = async () => {
      if (!memberFormData.image) {
          alert('กรุณาอัปโหลดหรือถ่ายรูปบัตร');
          return;
      }
      
      try {
          setMemberFormData(prev => ({...prev, isCompressing: true}));
          
          const img = new Image();
          img.src = memberFormData.image;
          await new Promise(resolve => img.onload = resolve);
          
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
              if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
              }
          } else {
              if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
              }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          await addDoc(getAppCollection('customer_documents'), {
              customerId: customerData.id,
              title: 'รูปถ่ายบัตรสมาชิก (จากแอป)',
              type: 'digital',
              physicalLocation: '',
              fileUrl: compressedBase64,
              fileName: \`member_app_\${Date.now()}.jpg\`,
              notes: 'ลูกค้ายื่นสมัครผ่านแอปพลิเคชัน',
              createdAt: serverTimestamp()
          });
          
          alert('ส่งรูปทำบัตรสมาชิกเรียบร้อยแล้ว รอแอดมินตรวจสอบครับ');
          setIsMemberFormOpen(false);
          setMemberFormData({ image: null, isCompressing: false });
      } catch (error) {
          console.error("Upload error:", error);
          alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
      } finally {
          setMemberFormData(prev => ({...prev, isCompressing: false}));
      }
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => setMemberFormData(prev => ({...prev, image: e.target.result}));
          reader.readAsDataURL(file);
      }
  };
`;
if (!content.includes('handleMemberApply')) {
    content = content.replace(formLogicAnchor, formLogic + formLogicAnchor);
}

// 5. Update Pay Page UI
const oldPayPageDiv = `<div className="w-full text-left">
                  {(() => {
                   const totalCreditValue = activeCourses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0);
                   return (
                     <div className="relative z-10 grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">`;

const newPayPageDiv = `<div className="w-full text-left">
                  {(() => {
                   const totalCreditValue = activeCourses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0);
                   
                   const totalCourseAmt = ledgerHistory.filter(h => {
                       const t = getFuzzyKey(h, "ประเภท") || '';
                       return t.includes("คอร์ส") || t.includes("คอส") || t.includes("เปิดคอร์ส");
                   }).reduce((sum, h) => sum + parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด"])), 0);
                   
                   const totalProductAmt = ledgerHistory.filter(h => {
                       const t = getFuzzyKey(h, "ประเภท") || '';
                       return t.includes("สินค้า");
                   }).reduce((sum, h) => sum + parseNumber(getFuzzyKey(h, ["ยอดสินค้า", "ยอดจัดซื้อ", "ยอดเงิน", "ยอด"])), 0);
                   
                   const totalAccumulated = parseNumber(customerData.realAccumulatedAmount) || 0;
                   const showTempVip = totalAccumulated >= 5000;
                   
                   return (
                     <div className="relative z-10 grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mb-2">
                        <div>
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">ยอดสะสมสุทธิ</p>
                           <p className="text-xl font-black truncate leading-none">฿{totalAccumulated.toLocaleString()}</p>
                           <p className="text-[8px] text-white/50 mt-1">(คอร์ส: ฿{totalCourseAmt.toLocaleString()} | สินค้า: ฿{totalProductAmt.toLocaleString()})</p>
                        </div>
                        <div className="text-right border-l border-white/20 pl-4">
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/70 mb-1">เครดิตวงเงินเหลือ</p>
                           <p className="text-xl font-black text-amber-300 truncate leading-none">฿{totalCreditValue.toLocaleString()}</p>
                           <button onClick={() => setIsMemberFormOpen(true)} className="mt-1.5 px-2 py-0.5 bg-white/10 rounded-full text-[8px] text-white border border-white/20 hover:bg-white/20">ทำบัตรสมาชิก</button>
                        </div>
                        <div className="col-span-2 mt-2 pt-4 border-t border-white/10">
                           <div className="flex justify-between items-end mb-1.5">
                              <span className="text-[10px] font-bold text-white/90">สถานะ: <span className="text-amber-300 font-black ml-1 uppercase">{customerData.isApproved ? 'VIP' : (customerData.memberStatus || 'ทั่วไป')}</span></span>
                              <span className="text-[9px] font-bold text-white/70">ขาดอีก ฿{Math.max(0, 100000 - totalAccumulated).toLocaleString()} จะได้อัปเกรด</span>
                           </div>
                           <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden shadow-inner mb-1.5">
                              <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 rounded-full relative overflow-hidden" style={{ width: \`\${Math.min(100, (totalAccumulated / 100000) * 100)}%\` }}>
                                  <div className="absolute inset-0 bg-white/40 animate-[shimmer_2s_infinite] -skew-x-12"></div>
                              </div>
                           </div>
                           {showTempVip && !customerData.isApproved && (
                               <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-1.5 mb-1.5 flex items-center justify-center">
                                   <Award size={12} className="text-amber-300 mr-1" />
                                   <span className="text-[9px] font-bold text-amber-100">🎉 ได้รับส่วนลดสมาชิกชั่วคราว (ยอดเกิน 5,000)</span>
                               </div>
                           )}
                           <p className="text-[9px] text-white/50 text-center leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>
                        </div>
                        `;

if (content.includes(oldPayPageDiv)) {
    content = content.replace(oldPayPageDiv, newPayPageDiv);
}

// Update the QR Section in Pay Page
const oldQRArea = `                  <div className="bg-white p-5 rounded-[28px] shadow-lg border border-gray-100 relative z-10 mb-6">
                       <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-[32px] blur opacity-30"></div>
                       <div className="relative bg-white rounded-[20px] p-2">
                           <QRCodeSVG 
                               value={JSON.stringify({
                                   type: "credit_pay",
                                   code: customerData?.cleanPhone || customerData?.id,
                                   phone: customerData?.cleanPhone,
                                   customerId: customerData?.id
                               })} 
                               size={200} 
                               level="M" 
                               includeMargin={false} 
                           />
                       </div>
                  </div>`;

const newQRArea = `                  <div className="bg-white p-5 rounded-[28px] shadow-lg border border-gray-100 relative z-10 mb-6 w-full max-w-[260px] mx-auto min-h-[260px] flex items-center justify-center">
                       <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-[32px] blur opacity-30"></div>
                       <div className="relative bg-white rounded-[20px] p-2 w-full h-full flex flex-col items-center justify-center">
                           {!showPayQR ? (
                               <button 
                                   onClick={generatePayQR}
                                   className="flex flex-col items-center justify-center py-6 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-100 hover:border-emerald-300 transition-all group w-full h-full"
                               >
                                   <QrCode size={48} className="text-gray-300 group-hover:text-emerald-500 mb-3 transition-colors" />
                                   <span className="text-sm font-black text-gray-700 group-hover:text-emerald-600">กดเพื่อแสดง QR Code</span>
                                   <span className="text-[10px] text-gray-400 mt-2 text-center leading-tight">มีอายุการใช้งาน 5 นาที<br/>เพื่อความปลอดภัยของบัญชี</span>
                               </button>
                           ) : (
                               <div className="flex flex-col items-center w-full animate-in zoom-in-95 duration-300">
                                   <QRCodeSVG 
                                       value={JSON.stringify({
                                           type: "credit_pay",
                                           code: customerData?.cleanPhone || customerData?.id,
                                           phone: customerData?.cleanPhone,
                                           customerId: customerData?.id,
                                           timestamp: Date.now()
                                       })} 
                                       size={200} 
                                       level="M" 
                                       includeMargin={false} 
                                   />
                                   <div className="mt-4 flex items-center justify-center bg-gray-100 rounded-full px-4 py-1.5 border border-gray-200">
                                       <Clock size={12} className="text-rose-500 mr-1.5" />
                                       <span className="text-[11px] font-bold text-gray-600">
                                           หมดอายุใน <span className="text-rose-500 font-mono">{String(Math.floor(qrTimeLeft / 60)).padStart(2, '0')}:{String(qrTimeLeft % 60).padStart(2, '0')}</span>
                                       </span>
                                   </div>
                               </div>
                           )}
                       </div>
                  </div>`;

if (content.includes(oldQRArea)) {
    content = content.replace(oldQRArea, newQRArea);
}

// 6. Add Member Application Modal
const memberModal = `
        {/* 🌟 MEMBER APPLICATION MODAL 🌟 */}
        {isMemberFormOpen && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[100] flex flex-col justify-center items-center p-4 animate-in fade-in duration-200">
             <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 relative shrink-0 text-center">
                   <button onClick={() => setIsMemberFormOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"><X size={18} /></button>
                   <Award size={32} className="text-white mx-auto mb-2 opacity-90" />
                   <h2 className="text-base font-black text-white mb-1">ทำบัตรสมาชิก</h2>
                   <p className="text-indigo-100 text-[10px]">อัปโหลดรูปเพื่อใช้ประกอบบัตรสมาชิก</p>
                </div>
                
                <div className="p-6 flex flex-col bg-gray-50 max-h-[70vh] overflow-y-auto">
                   <div className="mb-4">
                       <label className="text-xs font-bold text-gray-700 mb-2 block">รูปถ่ายหน้าตรง / บัตรสมาชิกเดิม</label>
                       {!memberFormData.image ? (
                           <div className="relative">
                               <input 
                                   type="file" 
                                   accept="image/*" 
                                   onChange={handleFileChange}
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                               />
                               <div className="w-full aspect-[4/3] bg-white border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                                   <Camera size={36} className="mb-2" />
                                   <span className="text-xs font-bold">กดเพื่อถ่ายรูป หรืออัปโหลด</span>
                               </div>
                           </div>
                       ) : (
                           <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-sm">
                               <img src={memberFormData.image} alt="Member preview" className="w-full h-full object-cover" />
                               <button 
                                   onClick={() => setMemberFormData(prev => ({...prev, image: null}))}
                                   className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70"
                               >
                                   <X size={16} />
                               </button>
                           </div>
                       )}
                   </div>
                   
                   <p className="text-[10px] text-gray-500 bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-6 leading-relaxed">
                       * กรุณาใช้รูปถ่ายหน้าตรงที่ชัดเจน รูปจะถูกส่งให้แอดมินเพื่อดำเนินการออกบัตรสมาชิกของคุณ
                   </p>
                   
                   <button 
                       onClick={handleMemberApply}
                       disabled={!memberFormData.image || memberFormData.isCompressing}
                       className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
                   >
                       {memberFormData.isCompressing ? 'กำลังประมวลผล...' : 'ส่งข้อมูลทำบัตรสมาชิก'}
                   </button>
                </div>
             </div>
          </div>
        )}
`;

const modalsAnchor = `{/* 🌟 CREDIT PAY QR MODAL 🌟 */}`;
if (content.includes(modalsAnchor)) {
    content = content.replace(modalsAnchor, memberModal + '\n' + modalsAnchor);
} else {
    const backupAnchor = `{/* 🌟 MODALS 🌟 */}`;
    if (content.includes(backupAnchor)) {
        content = content.replace(backupAnchor, backupAnchor + '\n' + memberModal);
    }
}

fs.writeFileSync(appPath, content);
console.log("Patched wallet features completely.");
