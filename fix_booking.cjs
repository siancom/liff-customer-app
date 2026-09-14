const fs = require('fs');
let content = fs.readFileSync('src/pages/Booking.jsx', 'utf8');

// 1. Update imports
content = content.replace(/import React from 'react';/, "import React, { useState } from 'react';");
content = content.replace(/Ticket \} from 'lucide-react';/, "Ticket, Eye, EyeOff } from 'lucide-react';");

// 2. Add state inside Booking component
const componentStart = `const Booking = ({
    openBookingModal,
    myBookings,
    setGeneratedTicket,
    setBookingStep,
    setBookingCourse,
    setIsBookingModalOpen,
    setShowCancelConfirm,
    setBookingError,
    activeCourses
}) => {`;

const stateCode = `    const [showPastTickets, setShowPastTickets] = useState(false);

    const todayStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD
    const visibleBookings = myBookings.filter(bk => {
        if (showPastTickets) return true;
        if (!bk.date) return true;
        
        try {
           const bkDateStr = new Date(bk.date).toLocaleDateString('en-CA');
           return bkDateStr >= todayStr;
        } catch (e) {
           return true;
        }
    });`;

content = content.replace(componentStart, componentStart + '\n' + stateCode);

// 3. Update the mapping from myBookings to visibleBookings and add the eye icon next to the title
const headerOld = `<h2 className="text-sm font-black text-gray-800 flex items-center mb-3">
                    <CalendarDays size={18} className="mr-2 text-indigo-500"/> ตั๋วนัดหมายของฉัน (E-Ticket)
                </h2>`;

const headerNew = `<div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-black text-gray-800 flex items-center">
                        <CalendarDays size={18} className="mr-2 text-indigo-500"/> ตั๋วนัดหมาย (E-Ticket)
                    </h2>
                    <button 
                        onClick={() => setShowPastTickets(!showPastTickets)}
                        className="flex items-center text-[10px] font-bold text-gray-500 hover:text-indigo-600 bg-white px-2 py-1 rounded-full border shadow-sm transition-colors"
                    >
                        {showPastTickets ? <><EyeOff size={12} className="mr-1"/> ซ่อนที่ผ่านมา</> : <><Eye size={12} className="mr-1"/> ดูที่ผ่านมา</>}
                    </button>
                </div>`;

content = content.replace(headerOld, headerNew);

content = content.replace(/\{myBookings\.length > 0 \? \(/, '{visibleBookings.length > 0 ? (');
content = content.replace(/\{myBookings\.map\(\(bk, i\) => \{/, '{visibleBookings.map((bk, i) => {');

fs.writeFileSync('src/pages/Booking.jsx', content, 'utf8');
console.log("Updated Booking.jsx");
