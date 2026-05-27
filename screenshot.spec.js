const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const URLS = {
  home: 'http://localhost:3007',
  game: 'http://localhost:3007/technical/agent-game'
};

const VIEWPORTS = [
  { name: 'desktop_large', width: 1920, height: 1080 },
  { name: 'desktop_small', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 }
];

const OUTPUT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

test('capture screenshots', async ({ page }) => {
  // Increase test timeout
  test.setTimeout(120000);

  for (const [pageName, url] of Object.entries(URLS)) {
    console.log(`\nNavigating to ${pageName}: ${url}`);
    for (const vp of VIEWPORTS) {
      console.log(`Capturing ${pageName} at ${vp.name} (${vp.width}x${vp.height})...`);
      
      // Set viewport
      await page.setViewportSize({ width: vp.width, height: vp.height });
      
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait a bit for animations/renders
        await page.waitForTimeout(2000);
        
        // Full page screenshot
        const screenshotPath = path.join(OUTPUT_DIR, `${pageName}_${vp.name}_full.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Saved ${screenshotPath}`);
      } catch (e) {
        console.error(`Error capturing ${pageName} at ${vp.name}:`, e.message);
      }
    }
  }
});
