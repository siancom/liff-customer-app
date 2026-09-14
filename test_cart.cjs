const puppeteer = require('puppeteer');
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.goto('http://localhost:5173');
    await wait(2000);
    
    console.log("Clicking shop nav...");
    await page.evaluate(() => {
        const navBtns = Array.from(document.querySelectorAll('button'));
        const shopBtn = navBtns.find(btn => btn.innerText && btn.innerText.includes('สินค้า'));
        if (shopBtn) shopBtn.click();
    });
    
    await wait(1000);
    
    console.log("Clicking cart...");
    await page.evaluate(() => {
        const cartBtns = Array.from(document.querySelectorAll('button'));
        // Find the one that has a shopping cart icon or position absolute top right etc.
        // It's the only button in the shop view that opens the cart.
        const cartBtn = cartBtns.find(btn => btn.innerHTML.includes('ShoppingCart') || btn.innerHTML.includes('lucide-shopping-cart') || btn.innerHTML.includes('ShoppingBag') || btn.className.includes('absolute') && btn.className.includes('right-4'));
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
