const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Extract and remove global header
const globalHeaderRegex = /<div className="bg-gradient-to-b from-teal-600 to-teal-800 pt-12 pb-8 px-6 rounded-b-\[32px\] shadow-lg relative z-20 shrink-0">[\s\S]*?<\/div>\s*<\/div>/;
const match = content.match(globalHeaderRegex);
if (!match) {
    console.log("Could not find global header");
} else {
    const globalHeader = match[0];
    content = content.replace(globalHeader, '');
    
    // Convert to a profile header (remove pt-12 and rounded-b-[32px] to make it fit in the profile flow)
    const profileHeader = globalHeader
        .replace('bg-gradient-to-b from-teal-600 to-teal-800 pt-12 pb-8 px-6 rounded-b-[32px] shadow-lg relative z-20 shrink-0', 'bg-gradient-to-b from-teal-600 to-teal-800 p-6 rounded-[32px] shadow-sm mb-6')
        .replace('absolute bottom-24 right-4 bg-teal-600 text-white w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(13,148,136,0.5)] flex items-center justify-center z-[60] hover:bg-teal-700 active:scale-95 transition-all', 'hidden'); // Just in case it captured the cart button, wait, the cart button is before the header!
        
    // Insert into profile section
    const profileAnchor = `<h2 className="text-sm font-black text-gray-800 flex items-center mb-2"><User size={18} className="mr-2 text-indigo-500"/> บัญชีสะสมยอด</h2>`;
    content = content.replace(profileAnchor, profileAnchor + '\n' + profileHeader);
}

// 2. Add the 3 buttons to the profile card
const profileButtons = `
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 relative z-10">
                            <button className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 active:scale-95 transition-all">
                                <Download size={22} className="mb-2" />
                                <span className="text-[10px] font-bold">เติมเครดิต</span>
                            </button>
                            <button className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 active:scale-95 transition-all">
                                <Send size={22} className="mb-2" />
                                <span className="text-[10px] font-bold">โอนให้เพื่อน</span>
                            </button>
                            <button className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 active:scale-95 transition-all">
                                <ArrowRightLeft size={22} className="mb-2" />
                                <span className="text-[10px] font-bold">แลกสินค้า</span>
                            </button>
                        </div>
`;

// Find the progress bar div and insert the buttons after it, inside the card.
// We added the progress bar in the previous step. It ends with:
// <p className="text-[9px] text-white/50 text-center mt-1.5 leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>
// </div>
const progressBarEnd = `<p className="text-[9px] text-white/50 text-center mt-1.5 leading-tight">สะสมครบ ฿100,000 เพื่อรับสิทธิพิเศษระดับสูงสุด</p>\n                        </div>`;

if (content.includes(progressBarEnd)) {
    content = content.replace(progressBarEnd, progressBarEnd + profileButtons);
} else {
    console.log("Could not find progress bar to insert buttons");
}

// Make sure ArrowRightLeft and Send are imported
if (!content.includes('ArrowRightLeft')) {
    content = content.replace('Download, CalendarClock', 'Download, CalendarClock, ArrowRightLeft, Send');
}

fs.writeFileSync(appPath, content);
console.log("Patched UI");
