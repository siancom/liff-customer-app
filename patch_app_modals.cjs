const fs = require('fs');

let appContent = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', 'utf8');

if (!appContent.includes('import WalletTopUpModal')) {
    appContent = appContent.replace(
        `import SkinCheckModal from './components/modals/SkinCheckModal';`,
        `import SkinCheckModal from './components/modals/SkinCheckModal';\nimport WalletTopUpModal from './components/modals/WalletTopUpModal';\nimport WalletTransferModal from './components/modals/WalletTransferModal';`
    );
}

const modalsToInsert = `
        <WalletTopUpModal 
            isOpen={isTopupOpen} 
            setIsOpen={setIsTopupOpen} 
            customerData={customerData} 
            availableBranches={availableBranches} 
            PROMPTPAY_CONFIG={PROMPTPAY_CONFIG} 
            showToast={showToast} 
            isActionLoading={isActionLoading} 
            setIsActionLoading={setIsActionLoading} 
            getAppCollection={getAppCollection} 
        />
        <WalletTransferModal 
            isOpen={isScannerOpen} 
            setIsOpen={setIsScannerOpen} 
            customerData={customerData} 
            totalInternalCredit={(activeCourses || []).reduce((sum, c) => sum + (c?.computedRemainCredit || 0), 0)} 
            showToast={showToast} 
            isActionLoading={isActionLoading} 
            setIsActionLoading={setIsActionLoading} 
            getAppCollection={getAppCollection} 
            getAppDoc={getAppDoc} 
            onTransferSuccess={() => { fetchCustomerData(); fetchLedgerHistory(); }} 
        />
`;

if (!appContent.includes('<WalletTopUpModal')) {
    appContent = appContent.replace(
        `<SkinCheckModal isOpen={isSkinCheckModalOpen}`,
        modalsToInsert + `\n        <SkinCheckModal isOpen={isSkinCheckModalOpen}`
    );
}

fs.writeFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx', appContent, 'utf8');
console.log("Patched App.jsx with Modals");
