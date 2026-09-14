const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'components', 'modals', 'SkinCheckModal.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// Replace the startScan function to include detailed diagnostics
const oldScan = `    const startScan = async () => {
        setIsScanning(true);
        setErrorMsg(null);
        try {
            const ai = getAI(app, { backend: new GoogleAIBackend() });
            const model = getGenerativeModel(ai, {
                model: 'gemini-2.5-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                }
            });
            const prompt = \`คุณคือแพทย์ผิวหนังเชี่ยวชาญ จงวิเคราะห์ใบหน้าจากภาพนี้ ประเมินระดับ 1) สิวและรอยแดง 2) ริ้วรอย 3) ความสว่างกระจ่างใส และ 4) สุขภาพผิวโดยรวม 
            ให้คะแนน 1-10 ในแต่ละด้าน (10 คือดีมาก 1 คือแย่มาก) และให้คำแนะนำเบื้องต้นสั้นๆ สำหรับการดูแลรักษา 
            ส่งผลลัพธ์มาเป็น JSON เท่านั้น โครงสร้างดังนี้:
            {
                "scores": { "acne": 8, "wrinkles": 7, "brightness": 6, "overall": 7 },
                "summary": "ข้อความสรุปปัญหาหลักที่พบสั้นๆ",
                "recommendation": "คำแนะนำการดูแลสั้นๆ"
            }\`;
            const imagePart = await fileToGenerativePart(imageFile);
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();
            
            // Clean markdown json formatting if any
            let jsonString = responseText;
            if (jsonString.includes('\`\`\`json')) {
                jsonString = jsonString.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
            }
            const data = JSON.parse(jsonString);
            setAiResult(data);
            setStep(3);
        } catch (err) {
            console.error('AI Scan Error:', err);
            setErrorMsg('เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsScanning(false);
        }
    };`;

const newScan = `    const [diagnosticMode, setDiagnosticMode] = useState(false);
    const [diagnosticLog, setDiagnosticLog] = useState([]);

    const logDiag = (msg, status = 'info') => {
        setDiagnosticLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, status }]);
    };

    const runDiagnostics = async () => {
        setDiagnosticMode(true);
        setDiagnosticLog([]);
        logDiag('เริ่มตรวจสอบความพร้อมของระบบ AI...', 'info');
        
        try {
            // Check 1: Firebase App
            if (!app) {
                logDiag('ไม่พบการเชื่อมต่อ Firebase App', 'error');
                return false;
            }
            logDiag('เชื่อมต่อ Firebase App สำเร็จ (OK)', 'success');

            // Check 2: SDK modules
            if (typeof getAI !== 'function' || typeof getGenerativeModel !== 'function') {
                logDiag('โหลดโมดูล Firebase AI SDK ไม่สมบูรณ์', 'error');
                return false;
            }
            logDiag('โหลดโมดูล Firebase AI SDK สำเร็จ (OK)', 'success');

            // Check 3: Initialize AI
            let ai;
            try {
                ai = getAI(app, { backend: new GoogleAIBackend() });
                logDiag('กำหนดค่า AI Backend สำเร็จ (OK)', 'success');
            } catch (e) {
                logDiag('การกำหนดค่า AI Backend ล้มเหลว: ' + e.message, 'error');
                return false;
            }

            // Check 4: Test Model Access
            try {
                const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash-latest' });
                logDiag('เข้าถึงโมเดล Gemini สำเร็จ (OK)', 'success');
            } catch (e) {
                logDiag('เข้าถึงโมเดลล้มเหลว: ' + e.message, 'error');
                return false;
            }

            logDiag('✅ ระบบ AI พร้อมทำงาน 100%', 'success');
            setTimeout(() => setDiagnosticMode(false), 2000);
            return true;
        } catch (err) {
            logDiag('เกิดข้อผิดพลาดไม่คาดคิด: ' + err.message, 'error');
            return false;
        }
    };

    const startScan = async () => {
        setIsScanning(true);
        setErrorMsg(null);
        
        // 1. Run Diagnostics First
        const isReady = await runDiagnostics();
        if (!isReady) {
            setIsScanning(false);
            setErrorMsg('ระบบ AI ไม่พร้อมใช้งาน กรุณาดูรายละเอียดในหน้าต่างตรวจสอบ');
            return;
        }

        try {
            const ai = getAI(app, { backend: new GoogleAIBackend() });
            const model = getGenerativeModel(ai, {
                model: 'gemini-2.5-flash-latest',
                generationConfig: {
                    responseMimeType: 'application/json',
                }
            });
            const prompt = \`คุณคือแพทย์ผิวหนังเชี่ยวชาญ จงวิเคราะห์ใบหน้าจากภาพนี้ ประเมินระดับ 1) สิวและรอยแดง 2) ริ้วรอย 3) ความสว่างกระจ่างใส และ 4) สุขภาพผิวโดยรวม 
            ให้คะแนน 1-10 ในแต่ละด้าน (10 คือดีมาก 1 คือแย่มาก) และให้คำแนะนำเบื้องต้นสั้นๆ สำหรับการดูแลรักษา 
            ส่งผลลัพธ์มาเป็น JSON เท่านั้น โครงสร้างดังนี้:
            {
                "scores": { "acne": 8, "wrinkles": 7, "brightness": 6, "overall": 7 },
                "summary": "ข้อความสรุปปัญหาหลักที่พบสั้นๆ",
                "recommendation": "คำแนะนำการดูแลสั้นๆ"
            }\`;
            const imagePart = await fileToGenerativePart(imageFile);
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();
            
            // Clean markdown json formatting if any
            let jsonString = responseText;
            if (jsonString.includes('\`\`\`json')) {
                jsonString = jsonString.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
            }
            const data = JSON.parse(jsonString);
            setAiResult(data);
            setStep(3);
        } catch (err) {
            console.error('AI Scan Error:', err);
            let detailedError = err.message;
            if (detailedError.includes('403') || detailedError.includes('PERMISSION_DENIED')) {
                detailedError = 'ยังไม่ได้เปิดใช้งาน Firebase AI Logic (Permission Denied)';
            }
            logDiag('ข้อผิดพลาดระหว่างวิเคราะห์: ' + detailedError, 'error');
            setDiagnosticMode(true);
            setErrorMsg('เกิดข้อผิดพลาดในการวิเคราะห์ AI: ' + detailedError);
        } finally {
            setIsScanning(false);
        }
    };`;

content = content.replace(oldScan, newScan);

// We need to inject the diagnostic UI when diagnosticMode is true
const diagUI = `
                                        {diagnosticMode && (
                                            <div className="absolute inset-0 bg-gray-900/95 z-50 p-6 flex flex-col items-start justify-start overflow-y-auto">
                                                <h3 className="text-teal-400 font-bold mb-4 flex items-center"><Activity size={18} className="mr-2"/> System Diagnostics</h3>
                                                <div className="w-full space-y-2 font-mono text-[10px]">
                                                    {diagnosticLog.map((log, i) => (
                                                        <div key={i} className={\`p-2 rounded border \${log.status === 'error' ? 'bg-red-900/50 border-red-500 text-red-200' : log.status === 'success' ? 'bg-teal-900/50 border-teal-500 text-teal-200' : 'bg-gray-800 border-gray-600 text-gray-300'}\`}>
                                                            <span className="opacity-50 mr-2">[{log.time}]</span>
                                                            {log.msg}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => setDiagnosticMode(false)} className="mt-auto w-full bg-gray-800 text-white py-2 rounded-xl border border-gray-600 font-bold">ปิดหน้าต่างตรวจสอบ</button>
                                            </div>
                                        )}
`;

const scanBlockMatch = `{/* Scanning Line */}`;
if (content.includes(scanBlockMatch)) {
    content = content.replace(scanBlockMatch, diagUI + '\n                                        ' + scanBlockMatch);
}

fs.writeFileSync(appPath, content);
console.log("Patched SkinCheckModal with diagnostics");
