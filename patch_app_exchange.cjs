const fs = require('fs');

let appContent = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', 'utf8');

if (!appContent.includes('import WalletExchangeModal')) {
    appContent = appContent.replace(
        `import WalletTransferModal from './components/modals/WalletTransferModal';`,
        `import WalletTransferModal from './components/modals/WalletTransferModal';\nimport WalletExchangeModal from './components/modals/WalletExchangeModal';`
    );
}

const modalsToInsert = `
        <WalletExchangeModal 
            isOpen={isExchangeOpen} 
            setIsOpen={setIsExchangeOpen} 
        />
`;

if (!appContent.includes('<WalletExchangeModal')) {
    appContent = appContent.replace(
        `<SkinCheckModal isOpen={isSkinCheckModalOpen}`,
        modalsToInsert + `\n        <SkinCheckModal isOpen={isSkinCheckModalOpen}`
    );
}

fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', appContent, 'utf8');
console.log("Patched App.jsx with Exchange Modal");
