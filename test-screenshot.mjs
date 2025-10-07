import { chromium } from '@playwright/test';

async function takeScreenshot() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navigating to profile page...');
    await page.goto('http://localhost:3001/profile/crypto_collector', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('Waiting for NFT cards to load...');
    await page.waitForSelector('[class*="bg-card"]', { timeout: 10000 });

    // Wait a bit more for images to load
    await page.waitForTimeout(2000);

    console.log('Taking screenshot...');
    await page.screenshot({
      path: 'nft-cards-screenshot.png',
      fullPage: true
    });

    // Get some info about the cards
    const cardCount = await page.locator('[class*="bg-card"][class*="group"]').count();
    console.log(`Found ${cardCount} NFT cards`);

    // Check if prices are visible
    const priceElements = await page.locator('text=/\\d+\\.?\\d* APE/').count();
    console.log(`Found ${priceElements} price elements`);

    // Check for listing badges
    const saleBadges = await page.locator('text=Sale').count();
    const rentBadges = await page.locator('text=Rent').count();
    const swapBadges = await page.locator('text=Swap').count();
    console.log(`Listing badges - Sale: ${saleBadges}, Rent: ${rentBadges}, Swap: ${swapBadges}`);

    console.log('\nScreenshot saved as nft-cards-screenshot.png');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

takeScreenshot();
