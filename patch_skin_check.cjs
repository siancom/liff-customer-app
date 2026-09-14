const fs = require('fs');

let content = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', 'utf8');

// 1. Change Model to gemini-1.5-pro
content = content.replace(/model: 'gemini-flash-latest'/g, "model: 'gemini-1.5-pro'");

// 2. Add Pre-scan Guide to UI Step 1
const preScanGuide = `
                                    <div className="mt-4 bg-teal-50 border border-teal-100 p-3 rounded-xl text-left shadow-sm">
                                        <h4 className="text-[11px] font-bold text-teal-800 mb-1.5 flex items-center">
                                            <AlertCircle size={12} className="mr-1" /> คำแนะนำเพื่อความแม่นยำสูงสุด
                                        </h4>
                                        <ul className="text-[10px] text-teal-700 space-y-1 list-disc pl-4">
                                            <li>ถ่ายด้วย <b>หน้าสด</b> (ไม่แต่งหน้า) และไม่สวมแว่นตา</li>
                                            <li><b>ปิดฟิลเตอร์แอปพลิเคชัน</b> ทุกชนิด</li>
                                            <li>ถ่ายในที่ <b>แสงสว่างเพียงพอ</b> (แนะนำแสงธรรมชาติ)</li>
                                        </ul>
                                    </div>
`;

if (!content.includes('คำแนะนำเพื่อความแม่นยำสูงสุด')) {
    // Add to both skin and mole modes before the <div className="w-full space-y-3">
    content = content.replace(
        /<div className="w-full space-y-3">/g,
        preScanGuide + '\n                            <div className="w-full space-y-3 mt-4">'
    );
}

// 3. Update Prompt for Skin Mode
const skinPromptFind = `"recommendedCourses": [
                        { "name": "ชื่อคอร์สบำรุงที่แนะนำ 1", "reason": "เหตุผลสั้นๆ" }
                    ]
                }\`;`;

const skinPromptReplace = `"recommendedCourses": [
                        { "name": "ชื่อคอร์สบำรุงที่แนะนำ 1", "reason": "เหตุผลสั้นๆ" }
                    ],
                    "confidenceScore": 85,
                    "warning": "ถ้าภาพเบลอ มืด แต่งหน้า หรือใช้ฟิลเตอร์ ให้ใส่คำเตือนสั้นๆ ที่นี่ ถ้าภาพชัดเจนดีให้ใส่ค่าว่าง (\"\")"
                }\`;`;

content = content.replace(skinPromptFind, skinPromptReplace);
if (content.includes('1. สิวและรอยแดง (acne)')) {
    content = content.replace(
        '1. สิวและรอยแดง (acne)',
        'หากพบว่าภาพเบลอ มืดไป สว่างไป หรือมีการใช้ฟิลเตอร์/แต่งหน้า ให้แจ้งเตือนในฟิลด์ warning และลดคะแนนลง\n                1. สิวและรอยแดง (acne)'
    );
}

// 4. Update Prompt for Mole Mode
const molePromptFind = `"cauterizeAdvice": "หลังจี้ห้ามโดนน้ำ 3-5 วัน และแต้มผงสมุนไพรลดอักเสบตามที่คลินิกจัดให้ มีประกันดูแลซ้ำ 1 เดือนค่ะ"
                }\`;`;

const molePromptReplace = `"cauterizeAdvice": "หลังจี้ห้ามโดนน้ำ 3-5 วัน และแต้มผงสมุนไพรลดอักเสบตามที่คลินิกจัดให้ มีประกันดูแลซ้ำ 1 เดือนค่ะ",
                    "confidenceScore": 90,
                    "warning": "ถ้าภาพเบลอ มืด หรือใช้ฟิลเตอร์ จนมองไม่เห็นไฝ ให้ใส่คำเตือนสั้นๆ ที่นี่ ถ้าภาพชัดเจนดีให้ใส่ค่าว่าง (\"\")"
                }\`;`;

content = content.replace(molePromptFind, molePromptReplace);
if (content.includes('จงสแกนภาพใบหน้าหรือลำคอนี้อย่างละเอียด')) {
    content = content.replace(
        'จงสแกนภาพใบหน้าหรือลำคอนี้อย่างละเอียด',
        'หากพบว่าภาพเบลอ มืดไป หรือมองเห็นไม่ชัดเจน ให้แจ้งเตือนในฟิลด์ warning\n                จงสแกนภาพใบหน้าหรือลำคอนี้อย่างละเอียด'
    );
}

// 5. Add warning UI in Step 3
const resultTopFind = `{/* Toast Notification */}`;
const resultTopReplace = `
                            {/* AI Warning Banner */}
                            {aiResult.warning && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-start shadow-sm mb-2 animate-in slide-in-from-top-2">
                                    <AlertCircle size={16} className="text-amber-500 mr-2 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold mb-0.5">ข้อควรระวังภาพถ่าย</p>
                                        <p className="text-[10px] leading-relaxed">{aiResult.warning}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Toast Notification */}`;

if (!content.includes('ข้อควรระวังภาพถ่าย')) {
    content = content.replace(resultTopFind, resultTopReplace);
}

fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', content, 'utf8');
console.log('Patched SkinCheckModal.jsx');
