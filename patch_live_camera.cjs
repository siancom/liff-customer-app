const fs = require('fs');

let content = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', 'utf8');

// Add useRef to imports if not already there
if (!content.includes('useRef')) {
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';");
}

// Add state variables and refs inside SkinCheckModal
const stateVarsInsert = `
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [lightLevel, setLightLevel] = useState('good'); // 'too-dark', 'good', 'too-bright'
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const lightIntervalRef = useRef(null);
`;
content = content.replace("const [step, setStep] = useState(1);", stateVarsInsert + "\n    const [step, setStep] = useState(1);");

// Add useEffect to cleanup camera on unmount
const cleanupInsert = `
    // Cleanup camera when unmounting or modal closes
    useEffect(() => {
        if (!isOpen) {
            closeCamera();
        }
        return () => {
            closeCamera();
        };
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setIsCameraOpen(true);
            
            // Start Light analysis loop
            if (lightIntervalRef.current) clearInterval(lightIntervalRef.current);
            lightIntervalRef.current = setInterval(analyzeLight, 500);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้องในเบราว์เซอร์");
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (lightIntervalRef.current) {
            clearInterval(lightIntervalRef.current);
            lightIntervalRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const analyzeLight = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        
        if (video.videoWidth === 0) return; // Not ready yet
        
        // Draw video frame to a small 64x64 canvas for fast processing
        canvas.width = 64;
        canvas.height = 64;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let brightnessSum = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            // Calculate brightness using standard formula (Rec. 709)
            const brightness = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
            brightnessSum += brightness;
        }
        
        const avgBrightness = brightnessSum / (canvas.width * canvas.height);
        
        if (avgBrightness < 40) {
            setLightLevel('too-dark');
        } else if (avgBrightness > 220) {
            setLightLevel('too-bright');
        } else {
            setLightLevel('good');
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        
        // Create full resolution canvas
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
        
        const ctx = captureCanvas.getContext('2d');
        // Mirror the image horizontally if using front camera
        ctx.translate(captureCanvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        
        // Get Base64 image
        const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.9);
        
        // Stop camera
        closeCamera();
        
        // Proceed to next step
        setImage(dataUrl);
        // We simulate a file object since the existing code expects imageFile for fileToGenerativePart
        // But actually the existing code does await fileToGenerativePart
        // We will need to modify that to handle base64 directly or convert to Blob.
        // Let's convert dataUrl to Blob and then File
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                setImageFile(file);
                setStep(2);
            });
    };
`;
content = content.replace("// Reset when opened", cleanupInsert + "\n\n    // Reset when opened");

// Add Live Camera view UI
const uploadStepFind = `<div className="w-full space-y-3 mt-4">`;
const uploadStepReplace = `
                            {!isCameraOpen ? (
                                <div className="w-full space-y-3 mt-4">
                                    <button 
                                        onClick={startCamera}
                                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-teal-500/30 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                    >
                                        <Camera size={18} className="mr-2" />
                                        เปิดกล้องถ่ายรูปสแกนสด
                                    </button>
                                    
                                    <label className="w-full bg-white border-2 border-teal-500 text-teal-600 py-3.5 rounded-xl font-black text-sm shadow-sm hover:bg-teal-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                                        <Upload size={18} className="mr-2" />
                                        อัปโหลดจากอัลบั้ม
                                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} capture="user" />
                                    </label>
                                </div>
                            ) : (
                                <div className="absolute inset-0 z-50 bg-black flex flex-col">
                                    {/* Top Bar */}
                                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent text-white">
                                        <button onClick={closeCamera} className="p-2 bg-white/20 rounded-full backdrop-blur-md">
                                            <X size={20} />
                                        </button>
                                        
                                        {/* Light Meter UI */}
                                        <div className={\`px-3 py-1.5 rounded-full text-xs font-bold flex items-center backdrop-blur-md \${
                                            lightLevel === 'good' ? 'bg-emerald-500/80' : 
                                            lightLevel === 'too-dark' ? 'bg-rose-500/80' : 'bg-amber-500/80'
                                        }\`}>
                                            <Sparkles size={14} className="mr-1.5" />
                                            {lightLevel === 'good' ? 'แสงพอดี' : lightLevel === 'too-dark' ? 'มืดเกินไป' : 'สว่างเกินไป'}
                                        </div>
                                    </div>

                                    {/* Video Container */}
                                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                                        <video 
                                            ref={videoRef} 
                                            className="w-full h-full object-cover -scale-x-100" 
                                            playsInline 
                                            autoPlay 
                                            muted 
                                        />
                                        <canvas ref={canvasRef} className="hidden" />
                                        
                                        {/* Distance Guide Overlay (Oval) */}
                                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                            <div className="w-64 h-80 rounded-[50%] border-4 border-dashed transition-colors duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center"
                                                style={{ borderColor: lightLevel === 'good' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255, 255, 255, 0.4)' }}>
                                                <div className="text-white/70 text-[10px] font-bold bg-black/40 px-3 py-1 rounded-full absolute bottom-4 text-center w-max">
                                                    วางใบหน้าให้พอดีกับกรอบ
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Bar */}
                                    <div className="bg-black p-6 pb-8 flex items-center justify-center relative z-20">
                                        <button 
                                            onClick={capturePhoto}
                                            className={\`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all \${
                                                lightLevel === 'good' ? 'border-emerald-500 bg-white' : 'border-white/50 bg-white/80'
                                            }\`}
                                        >
                                            <div className={\`w-16 h-16 rounded-full \${lightLevel === 'good' ? 'bg-emerald-100' : 'bg-transparent'}\`}></div>
                                        </button>
                                    </div>
                                </div>
                            )}
`;

content = content.replace(uploadStepFind, uploadStepReplace);

// Remove the old upload button that was inside the uploadStepFind
content = content.replace(`<label className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-teal-500/30 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer">
                                    <Camera size={18} className="mr-2" />
                                    {scanMode === 'skin' ? 'ถ่ายรูป / อัปโหลดรูปหน้าตรง' : 'ถ่ายรูป / อัปโหลดบริเวณที่จะจี้'}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} capture="user" />
                                </label>`, "");


fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/components/modals/SkinCheckModal.jsx', content, 'utf8');
console.log('Patched Live Camera into SkinCheckModal.jsx');
