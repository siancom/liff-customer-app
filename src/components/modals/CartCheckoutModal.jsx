import React, { useState } from 'react';
import { X, ShoppingCart, MapPin, Trash2, Minus, Plus, CreditCard, Store, Banknote, QrCode, AlertCircle, Loader2, Tag, Percent } from 'lucide-react';
import CouponSelectorModal from './CouponSelectorModal';

export default function CartCheckoutModal({
    isOpen,
    onClose,
    cart,
    updateCartQty,
    removeFromCart,
    totals,
    customerData,
    lineProfile,
    onConfirmOrder,
    MOCK_COUPONS = []
}) {
    const [paymentMethod, setPaymentMethod] = useState('promptpay');
    
    // Calculate total available credit from active courses
    const activeCourses = (customerData?.courses || []).filter(c => c.status === 'ยังคงเหลือ');
    const totalCreditValue = activeCourses.reduce((sum, c) => sum + (c.computedRemainCredit || 0), 0);
    const [deliveryInfo, setDeliveryInfo] = useState({ name: '', phone: '', address: '' });
    const [selectedBranch, setSelectedBranch] = useState(customerData?.defaultBranch || 'สาขาเฉวง');
    const availableBranches = ["สาขาเฉวง", "สาขาหน้าทอน"];
    const [isEditingAddress, setIsEditingAddress] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [showCouponSelector, setShowCouponSelector] = useState(false);
    const [slipImage, setSlipImage] = useState(null);
    const [orderNote, setOrderNote] = useState('');

    React.useEffect(() => {
        if (customerData) {
            setDeliveryInfo({
                name: customerData.name || lineProfile?.displayName || '',
                phone: customerData.phone || customerData.cleanPhone || '',
                address: customerData.address || ''
            });
            if (customerData.address) {
                setIsEditingAddress(false);
            }
        }
    }, [customerData, lineProfile]);

    const baseTotal = totals?.subtotal || 0;
    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discountAmount = (baseTotal * appliedCoupon.value) / 100;
        } else {
            discountAmount = appliedCoupon.value;
        }
    }
    const finalPrice = Math.max(0, baseTotal - discountAmount);
    const isCreditSufficient = totalCreditValue >= finalPrice;

    if (!isOpen) return null;

    const parseNumber = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return Number(String(val).replace(/[^0-9.-]+/g, ""));
    };

    const hasPhysicalProducts = cart.some(item => item.type === 'product');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (hasPhysicalProducts && (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address)) {
            setErrorMsg('กรุณากรอกข้อมูลจัดส่งให้ครบถ้วน');
            setIsEditingAddress(true);
            return;
        }
        if (paymentMethod === 'promptpay' && !slipImage) {
            setErrorMsg('กรุณาแนบสลิปการโอนเงิน');
            return;
        }

        setIsSubmitting(true);
        const orderData = {
            cart,
            deliveryInfo,
            paymentMethod,
            slipImage,
            appliedCoupon,
            baseTotal,
            discountAmount,
            finalPrice,
            orderNote,
            selectedBranch
        };

        const result = await onConfirmOrder(orderData);
        if (!result.success) {
            setErrorMsg(result.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[100] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-gray-50 w-full sm:max-w-md h-[95vh] sm:h-auto max-h-[95vh] overflow-hidden rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col animate-in slide-in-from-bottom-full sm:zoom-in-95">
                
                {/* Header */}
                <div className="bg-white p-4 pt-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-black text-gray-900 flex items-center"><ShoppingCart size={20} className="mr-2 text-teal-600"/> ตะกร้าสินค้า</h2>
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><X size={18} /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto hide-scrollbar bg-gray-50 p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <ShoppingCart size={48} className="mb-4" />
                            <p className="font-bold">ตะกร้าของคุณว่างเปล่า</p>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="bg-white p-3 rounded-2xl flex gap-3 shadow-sm border border-gray-100 relative">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Store size={24} className="text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <h3 className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                                            <p className="text-teal-600 font-black text-sm mt-0.5">฿{parseNumber(item.price).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                            <div className="flex items-center gap-2 bg-gray-50 px-1 py-1 rounded-xl border border-gray-200">
                                                <button type="button" onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-gray-500 shadow-sm border border-gray-100 hover:text-teal-600 hover:border-teal-200"><Minus size={14} strokeWidth={3} /></button>
                                                <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                                                <button type="button" onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-gray-500 shadow-sm border border-gray-100 hover:text-teal-600 hover:border-teal-200"><Plus size={14} strokeWidth={3} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Delivery Info for Products */}
                            {hasPhysicalProducts && (
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-xs font-black text-gray-800 flex items-center"><MapPin size={16} className="mr-1.5 text-teal-600"/> ข้อมูลจัดส่ง</h3>
                                        {!isEditingAddress && <button type="button" onClick={() => setIsEditingAddress(true)} className="text-[10px] text-teal-600 font-bold underline">แก้ไข</button>}
                                    </div>
                                    
                                    {isEditingAddress ? (
                                        <div className="space-y-3">
                                            <input type="text" placeholder="ชื่อ-นามสกุล" value={deliveryInfo.name} onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-teal-500 outline-none" required />
                                            <input type="tel" placeholder="เบอร์โทรศัพท์" value={deliveryInfo.phone} onChange={e => setDeliveryInfo({...deliveryInfo, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-teal-500 outline-none" required />
                                            <textarea placeholder="ที่อยู่สำหรับจัดส่งแบบครบถ้วน" value={deliveryInfo.address} onChange={e => setDeliveryInfo({...deliveryInfo, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-teal-500 outline-none h-20 resize-none" required />
                                            <button type="button" onClick={() => setIsEditingAddress(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 rounded-xl transition-colors">ยืนยันที่อยู่</button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600">
                                            <p className="font-bold text-gray-800">{deliveryInfo.name} ({deliveryInfo.phone})</p>
                                            <p className="mt-1">{deliveryInfo.address}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Coupon Section */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <h3 className="text-xs font-black text-gray-800 flex items-center mb-3"><Tag size={16} className="mr-1.5 text-teal-600"/> โค้ดส่วนลด</h3>
                                {appliedCoupon ? (
                                    <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-green-700">{appliedCoupon.code}</p>
                                            <p className="text-[10px] text-green-600">{appliedCoupon.desc}</p>
                                        </div>
                                        <button onClick={() => setAppliedCoupon(null)} className="text-[10px] text-red-500 font-bold underline">เอาออก</button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowCouponSelector(true)}
                                        className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Percent size={18} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
                                            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-800">เลือกหรือกรอกโค้ดส่วนลด</span>
                                        </div>
                                        <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded-md">คุ้มกว่า!</span>
                                    </button>
                                )}
                            </div>

                            {/* Branch Selection */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <h3 className="text-xs font-black text-gray-800 flex items-center mb-3"><Store size={16} className="mr-1.5 text-teal-600"/> สาขาที่รับบริการ/รับสินค้า</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {availableBranches.map(branch => (
                                        <button 
                                            key={branch}
                                            type="button" 
                                            onClick={() => setSelectedBranch(branch)}
                                            className={`p-3 rounded-xl border font-bold text-xs transition-all ${selectedBranch === branch ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-teal-300'}`}
                                        >
                                            {branch}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Order Note */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <h3 className="text-xs font-black text-gray-800 mb-2">หมายเหตุถึงร้านค้า (ตัวเลือก)</h3>
                                <textarea 
                                    placeholder="ฝากข้อความถึงร้านค้า เช่น แพ็คกันกระแทกหนาๆ..." 
                                    value={orderNote} 
                                    onChange={e => setOrderNote(e.target.value)} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-teal-500 outline-none h-16 resize-none"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <h3 className="text-xs font-black text-gray-800 flex items-center mb-3"><CreditCard size={16} className="mr-1.5 text-teal-600"/> เลือกวิธีชำระเงิน</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <button type="button" onClick={() => setPaymentMethod('promptpay')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'promptpay' ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm scale-[1.02]' : 'border-gray-200 text-gray-500 hover:border-teal-300'}`}>
                                        <QrCode size={24} className={paymentMethod === 'promptpay' ? 'text-teal-600' : 'text-gray-400'} />
                                        <span className="text-[10px] font-bold text-center">โอนเงิน<br/>สแกนจ่าย</span>
                                    </button>
                                    <button type="button" onClick={() => setPaymentMethod('cash')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash' ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm scale-[1.02]' : 'border-gray-200 text-gray-500 hover:border-teal-300'}`}>
                                        <Store size={24} className={paymentMethod === 'cash' ? 'text-teal-600' : 'text-gray-400'} />
                                        <span className="text-[10px] font-bold text-center">จ่ายหน้า<br/>คลินิก</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            if (isCreditSufficient) setPaymentMethod('credit');
                                        }} 
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'credit' ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm scale-[1.02]' : 'border-gray-200 text-gray-500 hover:border-teal-300'} ${!isCreditSufficient ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Banknote size={24} className={paymentMethod === 'credit' ? 'text-teal-600' : 'text-gray-400'} />
                                        <span className="text-[10px] font-bold text-center">หักวงเงิน<br/>เครดิต</span>
                                    </button>
                                </div>
                                
                                {paymentMethod === 'credit' && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                        <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center border border-dashed ${isCreditSufficient ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'}`}>
                                            <Banknote size={32} className={isCreditSufficient ? 'text-teal-500 mb-2' : 'text-red-400 mb-2'} />
                                            <p className="text-xs font-bold text-gray-800">ยอดคงเหลือ: ฿{totalCreditValue.toLocaleString()}</p>
                                            {!isCreditSufficient ? (
                                                <p className="text-[10px] text-red-500 mt-1 font-bold">วงเงินไม่เพียงพอสำหรับการชำระยอด ฿{finalPrice.toLocaleString()}</p>
                                            ) : (
                                                <p className="text-[10px] text-teal-600 mt-1 font-bold">ยอดหลังหักชำระ: ฿{(totalCreditValue - finalPrice).toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'promptpay' && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 mb-4">
                                            <QrCode size={48} className="text-gray-400 mb-2" />
                                            <p className="text-xs font-bold text-gray-800">สแกนจ่ายผ่าน QR Code</p>
                                            <p className="text-[10px] text-gray-500 mt-1">ชื่อบัญชี: บจก. ไอริส เนเจอร์ส</p>
                                            <p className="text-[10px] text-gray-500">เลขที่บัญชี: 123-4-56789-0 (KBANK)</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-2">แนบหลักฐานการโอนเงิน</label>
                                            <input type="file" accept="image/*" onChange={e => {
                                                const file = e.target.files[0];
                                                if(file) {
                                                    const reader = new FileReader();
                                                    reader.onload = e => setSlipImage(e.target.result);
                                                    reader.readAsDataURL(file);
                                                }
                                            }} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer" />
                                        </div>
                                        {slipImage && (
                                            <div className="mt-3 relative w-24 h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                                                <img src={slipImage} alt="Slip" className="w-full h-full object-cover" />
                                                <button onClick={() => setSlipImage(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><X size={12} /></button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Totals */}
                {cart.length > 0 && (
                    <div className="bg-white border-t border-gray-200 p-4 pb-safe shrink-0">
                        {errorMsg && (
                            <div className="mb-3 bg-red-50 text-red-600 text-[10px] font-bold p-2 rounded-lg flex items-center">
                                <AlertCircle size={14} className="mr-1.5 shrink-0" />
                                {errorMsg}
                            </div>
                        )}
                        <div className="space-y-1 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">ยอดรวมสินค้า</span>
                                <span className="text-xs font-bold text-gray-800">฿{baseTotal.toLocaleString()}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-green-600">
                                    <span className="text-[10px] font-bold">ส่วนลด ({appliedCoupon?.code})</span>
                                    <span className="text-xs font-bold">-฿{discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                                <span className="text-xs font-bold text-gray-500">ยอดชำระสุทธิ</span>
                                <span className="text-2xl font-black text-teal-600 leading-none">฿{finalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-70 disabled:scale-100 text-white font-black text-sm py-4 rounded-2xl shadow-lg shadow-teal-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={18} className="animate-spin" /> <span>กำลังดำเนินการ...</span></>
                            ) : (
                                <span>ยืนยันการสั่งซื้อ</span>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <CouponSelectorModal
                showCouponSelector={showCouponSelector}
                setShowCouponSelector={setShowCouponSelector}
                customerData={customerData}
                MOCK_COUPONS={MOCK_COUPONS}
                applyCoupon={(code) => {
                    const found = MOCK_COUPONS.find(c => c.code === code);
                    if (found) {
                        setAppliedCoupon(found);
                        setShowCouponSelector(false);
                        setErrorMsg('');
                    } else {
                        alert('ไม่พบโค้ดส่วนลดนี้ หรือโค้ดหมดอายุแล้ว');
                    }
                }}
            />
        </div>
    );
}
