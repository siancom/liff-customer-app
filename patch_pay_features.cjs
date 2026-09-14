const fs = require('fs');

let appContent = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', 'utf8');

// 1. Add state
if (!appContent.includes('const [isPaySectionVisible, setIsPaySectionVisible]')) {
    appContent = appContent.replace(
        `const [showPayQR, setShowPayQR] = useState(false);`,
        `const [showPayQR, setShowPayQR] = useState(false);\n  const [isPaySectionVisible, setIsPaySectionVisible] = useState(false);`
    );
}

// 2. Change grid-cols-3 to grid-cols-4 and add the จ่าย button
if (appContent.includes('grid-cols-3')) {
    appContent = appContent.replace('grid-cols-3', 'grid-cols-4');
}

const payButtonHtml = `
                      <button onClick={() => setIsPaySectionVisible(!isPaySectionVisible)} className="flex flex-col items-center justify-center bg-white/20 hover:bg-white/30 transition-colors rounded-2xl py-3 backdrop-blur-md shadow-sm border border-white/20">
                          <QrCode size={24} className="text-white mb-1" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">จ่าย</span>
                      </button>
                  </div>`;
if (!appContent.includes('onClick={() => setIsPaySectionVisible(!isPaySectionVisible)}')) {
    // Find the end of the action buttons grid
    // It currently ends with `</button>\n                  </div>`
    const exchangeButtonEnd = `<span className="text-[10px] font-bold text-white uppercase tracking-wider">แลก</span>\n                      </button>\n                  </div>`;
    if (appContent.includes(exchangeButtonEnd)) {
        appContent = appContent.replace(
            exchangeButtonEnd,
            `<span className="text-[10px] font-bold text-white uppercase tracking-wider">แลก</span>\n                      </button>` + payButtonHtml
        );
    }
}

// 3. Wrap the Pay QR block
const payBlockStart = `<Banknote size={48} className="text-white/90 mb-3 relative z-10 drop-shadow-md" />`;
const payBlockEnd = `                               </div>\n                           )}\n                       </div>\n                  </div>`;

if (!appContent.includes('{isPaySectionVisible && (')) {
    if (appContent.includes(payBlockStart) && appContent.includes(payBlockEnd)) {
        appContent = appContent.replace(
            payBlockStart,
            `{isPaySectionVisible && (\n<div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-top-4">\n` + payBlockStart
        );
        appContent = appContent.replace(
            payBlockEnd,
            payBlockEnd + `\n</div>\n)}`
        );
    }
}

// 4. Add long press logic
if (!appContent.includes('let pressTimer = null;')) {
    const longPressLogic = `
  let pressTimer = null;
  const handlePayButtonPress = () => {
      pressTimer = setTimeout(() => {
          setIsPaySectionVisible(true);
          setActiveNav('pay');
      }, 500);
  };
  const handlePayButtonRelease = () => {
      if (pressTimer) clearTimeout(pressTimer);
  };
`;
    appContent = appContent.replace(
        `const generatePayQR = () => {`,
        longPressLogic + `\n  const generatePayQR = () => {`
    );
}

if (!appContent.includes('onPointerDown={handlePayButtonPress}')) {
    const oldBtn = `<button onClick={() => setActiveNav('pay')} className=\`w-[52px]`;
    const newBtn = `<button onClick={() => setActiveNav('pay')} onPointerDown={handlePayButtonPress} onPointerUp={handlePayButtonRelease} onPointerLeave={handlePayButtonRelease} onTouchStart={handlePayButtonPress} onTouchEnd={handlePayButtonRelease} className=\`w-[52px]`;
    if (appContent.includes(oldBtn)) {
        appContent = appContent.replace(oldBtn, newBtn);
    }
}

fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', appContent, 'utf8');
console.log("Patched App.jsx for pay features");
