import React, { useState, useEffect } from 'react';
import { Camera, X, CheckCircle, Save, AlertCircle } from 'lucide-react';
import { doc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getAppCollection, getAppDoc, storage } from '../../config/firebase';
import SignaturePad from '../SignaturePad';

// Reusable Input Field Component
const InputField = ({ label, type = "text", value, onChange, placeholder, required, maxLength }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>
);

export default function VipRegistrationModal({ isOpen, onClose, customerData, showToast }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    idCard: '',
    dob: '',
    age: '',
    gender: 'หญิง',
    addressNo: '',
    village: '',
    soi: '',
    road: '',
    subDistrict: '',
    district: '',
    province: '',
    zipcode: '',
    phone: '',
    email: ''
  });
  
  const [cardImage, setCardImage] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && customerData) {
      setFormData(prev => ({
        ...prev,
        firstName: customerData.name?.split(' ')[0] || '',
        lastName: customerData.name?.split(' ')[1] || '',
        phone: customerData.cleanPhone || customerData.เบอร์โทร || '',
      }));
    }
  }, [isOpen, customerData]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              width = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setCardImage(dataUrl);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDobChange = (e) => {
    const val = e.target.value;
    let newAge = formData.age;
    
    const yearMatch = val.match(/\d{4}/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0], 10);
      const currentYearCE = new Date().getFullYear();
      if (year > 2400 && year <= currentYearCE + 543) {
        newAge = String(currentYearCE + 543 - year);
      } else if (year > 1900 && year <= currentYearCE) {
        newAge = String(currentYearCE - year);
      }
    }
    
    setFormData({...formData, dob: val, age: newAge});
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setErrorMsg('กรุณากรอกชื่อ นามสกุล และเบอร์โทรศัพท์');
      return;
    }
    if (!cardImage) {
      setErrorMsg('กรุณาถ่ายรูปหรืออัปโหลดรูปบัตรสมาชิก');
      return;
    }
    if (!signatureImage) {
      setErrorMsg('กรุณาเซ็นชื่อรับรอง');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload Images to Storage
      let cardUrl = '';
      let sigUrl = '';
      
      if (cardImage) {
        const cardRef = ref(storage, `customer_documents/${customerData.id}/vip_card_${Date.now()}.jpg`);
        await uploadString(cardRef, cardImage, 'data_url');
        cardUrl = await getDownloadURL(cardRef);
      }
      
      if (signatureImage) {
        const sigRef = ref(storage, `customer_documents/${customerData.id}/vip_sig_${Date.now()}.png`);
        await uploadString(sigRef, signatureImage, 'data_url');
        sigUrl = await getDownloadURL(sigRef);
      }

      // 2. Save document records
      if (cardUrl) {
        await addDoc(getAppCollection('customer_documents'), {
          customerId: customerData.id,
          title: 'รูปถ่ายบัตรสมาชิก (จากแอป)',
          fileUrl: cardUrl,
          createdAt: new Date(),
          uploadedBy: 'Customer (LIFF)'
        });
      }
      if (sigUrl) {
        await addDoc(getAppCollection('customer_documents'), {
          customerId: customerData.id,
          title: 'ลายเซ็น (จากแอป)',
          fileUrl: sigUrl,
          createdAt: new Date(),
          uploadedBy: 'Customer (LIFF)'
        });
      }

      // 3. Update customer details in customers collection
      const customerRef = getAppDoc('customers', customerData.id);
      const computedName = `${formData.firstName} ${formData.lastName}`.trim();
      
      await updateDoc(customerRef, {
        "ชื่อ": computedName, // Maintain backward compatibility
        "เบอร์โทร": formData.phone,
        computedName: computedName,
        computedPhone: formData.phone,
        nickname: formData.nickname,
        idCard: formData.idCard,
        dob: formData.dob,
        age: formData.age,
        gender: formData.gender,
        addressNo: formData.addressNo,
        village: formData.village,
        soi: formData.soi,
        road: formData.road,
        subDistrict: formData.subDistrict,
        district: formData.district,
        province: formData.province,
        zipcode: formData.zipcode,
        email: formData.email,
        updatedAt: new Date()
      });

      // 4. Create VIP Upgrade Request
      await addDoc(getAppCollection('vip_upgrade_requests'), {
        customerPhone: formData.phone,
        customerName: computedName,
        customerId: customerData.id,
        currentPoints: customerData?.totalEarnedPoints || 0,
        requestDate: new Date().toISOString(),
        status: 'pending',
        hasDocuments: true
      });

      showToast('ส่งคำขออัปเกรด VIP เรียบร้อยแล้ว แอดมินจะตรวจสอบข้อมูลเร็วๆ นี้', 'success');
      onClose();
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMsg('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง (' + err.message + ')');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">ข้อมูลผู้สมัคร VIP</h2>
              <p className="text-xs text-slate-500">อัปเกรดระดับสมาชิก</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-white space-y-5">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-orange-800 text-xs mb-4 leading-relaxed">
            กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน ถ่ายรูปบัตรสมาชิก และเซ็นชื่อเพื่อใช้ประกอบการพิจารณาอัปเกรดเป็น VIP
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="ชื่อ" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
            <InputField label="นามสกุล" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
            <InputField label="ชื่อเล่น" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} />
            <InputField label="เลขบัตรประชาชน" value={formData.idCard} onChange={e => setFormData({...formData, idCard: e.target.value})} maxLength={13} />
            <InputField label="วัน/เดือน/ปีเกิด" value={formData.dob} onChange={handleDobChange} placeholder="วว/ดด/ปปปป (พ.ศ.)" />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="อายุ" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} type="number" />
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">เพศ</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="หญิง">หญิง</option>
                  <option value="ชาย">ชาย</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-bold text-sm text-gray-700 mb-3">ที่อยู่ผู้สมัคร</h4>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="บ้านเลขที่" value={formData.addressNo} onChange={e => setFormData({...formData, addressNo: e.target.value})} />
              <InputField label="หมู่บ้าน" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} />
              <InputField label="ซอย/ตรอก" value={formData.soi} onChange={e => setFormData({...formData, soi: e.target.value})} />
              <InputField label="ถนน" value={formData.road} onChange={e => setFormData({...formData, road: e.target.value})} />
              <InputField label="แขวง/ตำบล" value={formData.subDistrict} onChange={e => setFormData({...formData, subDistrict: e.target.value})} />
              <InputField label="เขต/อำเภอ" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
              <InputField label="จังหวัด" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} />
              <InputField label="รหัสไปรษณีย์" value={formData.zipcode} onChange={e => setFormData({...formData, zipcode: e.target.value})} />
              <InputField label="เบอร์โทร" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              <InputField label="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-bold text-sm text-gray-700 mb-3">รูปถ่ายบัตรสมาชิกจริง</h4>
            <div className="flex items-center gap-4">
              {cardImage ? (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={cardImage} alt="Card Preview" className="w-full h-full object-cover" />
                  <button onClick={() => setCardImage(null)} className="absolute top-1 right-1 bg-white rounded-full p-0.5 text-red-500 shadow"><X size={14} /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 font-bold">กดเพื่อถ่ายรูป หรืออัปโหลดบัตรสมาชิก</p>
                  </div>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-bold text-sm text-gray-700 mb-3">ลายเซ็นลูกค้า</h4>
            <SignaturePad label="เซ็นชื่อที่นี่" onSigned={setSignatureImage} />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-gray-50">
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-black rounded-xl shadow-lg shadow-teal-500/30 flex justify-center items-center gap-2 active:scale-95 transition-all"
          >
            {isSubmitting ? (
              <>กำลังส่งข้อมูล...</>
            ) : (
              <><Save size={20} /> ยืนยันการส่งข้อมูลอัปเกรด VIP</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
