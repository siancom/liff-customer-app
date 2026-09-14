const fs = require('fs');
let content = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', 'utf8');

// 1. Update the AI Prompt
content = content.replace(
    `7. ความหมองคล้ำรอบดวงตา (darkCircles)\n                8. คะแนนสุขภาพผิวโดยรวม (overall)`,
    `7. ความหมองคล้ำรอบดวงตา (darkCircles)\n                8. หลุมสิวและความขรุขระ (acneScars)\n                9. คะแนนสุขภาพผิวโดยรวม (overall)`
);

// 2. Update JSON mock structure in prompt
content = content.replace(
    `"acne": 8, "wrinkles": 7, "brightness": 6, "pores": 7, "darkSpots": 6, "moisture": 8, "darkCircles": 5, "overall": 7`,
    `"acne": 8, "wrinkles": 7, "brightness": 6, "pores": 7, "darkSpots": 6, "moisture": 8, "darkCircles": 5, "acneScars": 7, "overall": 7`
);

// 3. Add acneScars to getMarkerColor
content = content.replace(
    `            case 'acne':\n                return { ring: 'border-rose-400 bg-rose-500/40 text-white', ping: 'bg-rose-400', badge: 'bg-rose-600' };`,
    `            case 'acne':\n                return { ring: 'border-rose-400 bg-rose-500/40 text-white', ping: 'bg-rose-400', badge: 'bg-rose-600' };\n            case 'acneScars':\n                return { ring: 'border-orange-400 bg-orange-500/40 text-white', ping: 'bg-orange-400', badge: 'bg-orange-600' };`
);

// 4. Add UI for acneScars (Line 880-884 is darkCircles)
const darkCirclesUI = `<div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                                                                <EyeOff size={16} className="text-slate-500" />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-700">รอยคล้ำใต้ตา</span>
                                                        </div>
                                                        <span className={\`text-sm font-black \${aiResult.scores?.darkCircles >= 7 ? 'text-teal-600' : 'text-amber-600'}\`}>{aiResult.scores?.darkCircles || '-'}/10</span>
                                                    </div>`;

const acneScarsUI = `<div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                                                                <Layers size={16} className="text-orange-500" />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-700">หลุมสิว/ความขรุขระ</span>
                                                        </div>
                                                        <span className={\`text-sm font-black \${aiResult.scores?.acneScars >= 7 ? 'text-teal-600' : 'text-amber-600'}\`}>{aiResult.scores?.acneScars || '-'}/10</span>
                                                    </div>`;

content = content.replace(darkCirclesUI, darkCirclesUI + '\n                                                    ' + acneScarsUI);

// 5. Update share text
content = content.replace(
    `\`🔹 ความกระจ่างใส: \${scores.brightness || '-'}/10 | รูขุมขน: \${scores.pores || '-'}/10\\n\\n\``,
    `\`🔹 ความกระจ่างใส: \${scores.brightness || '-'}/10 | รูขุมขน: \${scores.pores || '-'}/10\\n\` +\n                \`🔹 รอยคล้ำใต้ตา: \${scores.darkCircles || '-'}/10 | หลุมสิว: \${scores.acneScars || '-'}/10\\n\\n\``
);

fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', content, 'utf8');
console.log('Patched Acne Scars');
