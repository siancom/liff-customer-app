const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    // Evaluate in page to click the skin check button
    await page.evaluate(() => {
        // Find the skin check banner or button. The banner has text "ดูสภาพผิวหน้า"
        const btns = Array.from(document.querySelectorAll('button, div'));
        const banner = btns.find(b => b.innerText && b.innerText.includes('AI Skin Analysis'));
        if (banner) {
             console.log("Found banner, clicking...");
             banner.click();
        } else {
             console.log("Could not find banner");
        }
    });
    
    await page.waitForTimeout(1000);
    
    // Now simulate uploading a file and scanning
    await page.evaluate(() => {
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            console.log("Found file input, mocking upload not easily possible, let's just trigger startScan if possible. Wait, we need an image.");
        }
    });
    
    await page.waitForTimeout(1000);
    await browser.close();
    process.exit(0);
})();
