const fs = require('fs');
const appFile = '/Users/ittichai/ZCodeProject/liff-customer-app /src/App.jsx';
const newRewards = fs.readFileSync('/Users/ittichai/ZCodeProject/liff-customer-app /new_rewards.jsx', 'utf8');

let appContent = fs.readFileSync(appFile, 'utf8');
const startToken = "{activeNav === 'rewards' && (() => {";
const endToken = "         {activeNav === 'pay' && (";

const startIndex = appContent.indexOf(startToken);
const endIndex = appContent.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1) {
    appContent = appContent.substring(0, startIndex) + newRewards + "\n" + appContent.substring(endIndex);
    fs.writeFileSync(appFile, appContent);
    console.log("Successfully replaced the rewards block.");
} else {
    console.log("Tokens not found.", { startIndex, endIndex });
}
