const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const thaimartBanner = `
          {/* Thaimart Free Shipping Banner */}
          <a href="https://thaimart.com/sellers/ศูนย์ความงามไอริสเกาะสมุย-zM0AEw" target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden mb-4 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1">
             <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-black flex items-center mb-1"><Truck size={18} className="mr-1.5 text-yellow-300"/> ส่งฟรี! เมื่อสั่งผ่าน Thaimart</h3>
                   <p className="text-[11px] font-medium opacity-90">จัดส่งฟรีทุกราคา ไม่มีขั้นต่ำ กดที่นี่เพื่อไปยังร้านค้า</p>
                </div>
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm shrink-0 ml-3">
                   <ChevronRight size={20} />
                </div>
             </div>
          </a>`;

if (content.includes(thaimartBanner)) {
    content = content.replace(thaimartBanner, '');
    fs.writeFileSync(appPath, content);
    console.log("Removed top Thaimart banner.");
} else {
    console.log("Top banner not found.");
}
