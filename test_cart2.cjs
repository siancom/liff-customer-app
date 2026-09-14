const puppeteer = require('puppeteer');
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.goto('http://localhost:5173');
    await wait(2000);
    
    console.log("Clicking cart...");
    await page.evaluate(() => {
        const cartBtns = Array.from(document.querySelectorAll('button'));
        const cartBtn = cartBtns.find(btn => btn.innerHTML.includes('ShoppingCart') || btn.innerHTML.includes('lucide-shopping-cart') || btn.innerHTML.includes('ShoppingBag') || btn.innerHTML.includes('รถเข็น') || btn.innerHTML.includes('cart'));
        if (cartBtn) {
            cartBtn.click();
            console.log("Clicked Cart Button!");
        } else {
            console.log("Cart button not found!");
        }
    });
    
    await wait(2000);
    await browser.close();
    process.exit(0);
})();
