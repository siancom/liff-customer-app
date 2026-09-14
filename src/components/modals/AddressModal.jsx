import React from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';

export default function AddressModal({
    isAddressModalOpen,
    setIsAddressModalOpen,
    deliveryInfo,
    setDeliveryInfo,
    addressSearchQuery,
    handleAddressSearch,
    showSuggestions,
    setShowSuggestions,
    activeAddressSuggestions,
    selectAddressSuggestion,
    handleSaveProfileAddress,
    isActionLoading
}) {
    if (!isAddressModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[110] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in">
            <div className="bg-gray-50 w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95">
                <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-sm font-black text-gray-900 flex items-center"><MapPin size={18} className="mr-2 text-blue-500"/> ที่อยู่จัดส่งสินค้า</h2>
                    <button onClick={() => setIsAddressModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><X size={16} /></button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ชื่อผู้รับ</label>
                            <input type="text" value={deliveryInfo.name} onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">เบอร์โทรศัพท์</label>
                            <input type="text" value={deliveryInfo.phone} onChange={e => setDeliveryInfo({...deliveryInfo, phone: e.target.value.replace(/[^0-9]/g,'')})} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold font-mono" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">บ้านเลขที่ / ซอย / ถนน</label>
                        <textarea value={deliveryInfo.detail} onChange={e => setDeliveryInfo({...deliveryInfo, detail: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold h-20 resize-none" />
                    </div>

                    <div className="relative z-50">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">ตำบล / อำเภอ / จังหวัด / รหัสไปรษณีย์</label>
                        <input 
                            type="text" 
                            placeholder="พิมพ์ค้นหาที่อยู่..." 
                            value={addressSearchQuery} 
                            onChange={handleAddressSearch} 
                            onFocus={() => addressSearchQuery.length >= 2 && setShowSuggestions(true)} 
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold" 
                        />
                        {showSuggestions && activeAddressSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                {activeAddressSuggestions.map((addr, idx) => (
                                    <button key={idx} type="button" onClick={() => selectAddressSuggestion(addr)} className="w-full text-left p-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 text-[11px] font-bold text-gray-700 transition-colors">
                                        ต.{addr.subdistrict} อ.{addr.district} จ.{addr.province} <span className="text-blue-600 ml-1">{addr.zipcode}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleSaveProfileAddress}
                        disabled={isActionLoading}
                        className="w-full mt-4 bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
                    >
                        {isActionLoading ? <Loader2 size={18} className="animate-spin mr-2"/> : <MapPin size={16} className="mr-2"/>}
                        {isActionLoading ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}
                    </button>
                </div>
            </div>
        </div>
    );
}
