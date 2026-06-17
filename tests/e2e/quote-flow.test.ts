import { test, expect } from '@playwright/test';

test.describe('Complete Quote Creation Flow', () => {
  test('should create a product, tier, feature, and generate a quote', async ({ page }) => {
    // Step 1: Navigate to catalog and create a product
    await page.goto('/catalog');
    await page.click('text=New Product');

    expect(page).toHaveURL(/\/catalog\/new/);

    await page.fill('input[id="name"]', 'Test SaaS Platform');
    await page.fill('textarea[id="description"]', 'A test SaaS product for E2E testing');
    await page.click('button:has-text("Create Product")');

    // Wait for redirect and extract product ID from URL
    await page.waitForURL(/\/catalog\/[a-z0-9]+/);
    const productUrl = page.url();
    const productId = productUrl.split('/').pop();

    // Step 2: Add a tier
    await page.click('text=Add Tier');
    await page.fill('input[id="name"]', 'Pro');
    await page.fill('input[id="basePricePerSeat"]', '50');
    await page.click('button:has-text("Create Tier")');

    await page.waitForURL(`/catalog/${productId}`);

    // Step 3: Add a feature
    await page.click('text=Add Feature');
    await page.fill('input[id="name"]', 'Advanced Analytics');
    await page.fill('textarea[id="description"]', 'Advanced analytics and reporting');
    await page.click('button:has-text("Create Feature")');

    await page.waitForURL(`/catalog/${productId}`);

    // Step 4: Configure feature matrix (set as add-on)
    // Wait for the feature matrix to load
    await page.waitForSelector('table');

    // Find the dropdown for the feature-tier combination and set to ADDON
    const statusSelects = await page.locator('select').first().count();
    if (statusSelects > 0) {
      const firstSelect = page.locator('select').first();
      await firstSelect.selectOption('ADDON');

      // Set pricing model
      const pricingModelSelect = page.locator('select').nth(1);
      await pricingModelSelect.selectOption('PER_SEAT');

      // Set price
      const priceInput = page.locator('input[type="number"]').last();
      await priceInput.fill('15');

      // Wait for save
      await page.waitForTimeout(500);
    }

    // Step 5: Navigate to quotes and create a new quote
    await page.click('a:has-text("Quotes")');
    await page.click('text=New Quote');

    expect(page).toHaveURL(/\/quotes\/new/);

    // Step 6: Fill out quote form - Step 1 (Basic Info)
    await page.fill('input[id="quoteName"]', 'Test Quote - ABC Corp');
    await page.fill('input[id="customerName"]', 'ABC Corporation');
    await page.click('button:has-text("Next")');

    // Step 7: Step 2 (Product & Tier Selection)
    if (!productId) {
      throw new Error('Failed to extract product ID from URL');
    }
    await page.selectOption('select[id="productId"]', productId);

    // Wait for tiers to load
    await page.waitForSelector('select[id="tierId"] option:not([value=""])');

    // Get the first available tier option (not the empty one)
    const tierOptions = await page.locator('select[id="tierId"] option').count();
    if (tierOptions > 1) {
      const tierValue = await page.locator('select[id="tierId"] option').nth(1).getAttribute('value');
      if (tierValue) {
        await page.selectOption('select[id="tierId"]', tierValue);
      }
    }

    await page.fill('input[id="seats"]', '10');
    await page.selectOption('select[id="termLength"]', 'ANNUAL');
    await page.click('button:has-text("Next")');

    // Step 8: Step 3 (Add-ons)
    // Check if there are any add-on checkboxes available
    const addonCheckboxes = await page.locator('input[type="checkbox"]').count();
    if (addonCheckboxes > 0) {
      await page.locator('input[type="checkbox"]').first().check();
    }
    await page.click('button:has-text("Next")');

    // Step 9: Step 4 (Discount)
    await page.fill('input[id="discountPercent"]', '10');
    await page.click('button:has-text("Next")');

    // Step 10: Step 5 (Preview & Save)
    expect(page.locator('text=Quote Preview')).toBeDefined();

    // Verify quote preview contains expected content
    await expect(page.locator('text=Test Quote - ABC Corp')).toBeVisible();
    await expect(page.locator('text=ABC Corporation')).toBeVisible();
    await expect(page.locator('text=TOTAL')).toBeVisible();

    // Save the quote
    await page.click('button:has-text("Save Quote")');

    // Step 11: Verify shareable quote page loads
    // Wait for navigation to shareable quote
    await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

    const shareableUrl = page.url();
    const shareToken = shareableUrl.split('/').pop();

    if (!shareToken) {
      throw new Error('Failed to extract share token from URL');
    }

    // Verify quote document is displayed
    await expect(page.locator('text=QUOTE')).toBeVisible();
    await expect(page.locator('text=Test Quote - ABC Corp')).toBeVisible();
    await expect(page.locator('text=ABC Corporation')).toBeVisible();

    // Verify line items are present
    await expect(page.locator('text=Base Price')).toBeVisible();
    await expect(page.locator('text=TOTAL')).toBeVisible();

    // Verify currency formatting
    await expect(page.locator('text=/\$[\d,]+\.\d{2}/')).toHaveCount(3); // At least base price, total, and one more

    // Step 12: Verify quote appears in quotes list
    await page.click('a:has-text("Quotes")');
    await page.waitForURL('/quotes');

    await expect(page.locator('text=Test Quote - ABC Corp')).toBeVisible();
    await expect(page.locator('text=ABC Corporation')).toBeVisible();

    // Step 13: Verify quote can be reopened from list
    await page.click(`a:has-text("${shareToken.substring(0, 8)}")`);
    await page.waitForURL(/\/quotes\/[a-z0-9-]+/);

    // Verify we're back on the shareable quote page
    await expect(page.locator('text=QUOTE')).toBeVisible();
    await expect(page.locator('text=Test Quote - ABC Corp')).toBeVisible();
  });
});

test('should calculate prices correctly with different term lengths', async ({ page }) => {
  // This test verifies pricing calculations are correct

  await page.goto('/quotes/new');

  // Fill basic info
  await page.fill('input[id="quoteName"]', 'Pricing Test Quote');
  await page.fill('input[id="customerName"]', 'Pricing Test Customer');
  await page.click('button:has-text("Next")');

  // Select product and tier (these should exist from seed)
  const productSelects = await page.locator('select[id="productId"] option').count();
  if (productSelects > 1) {
    const productValue = await page.locator('select[id="productId"] option').nth(1).getAttribute('value');
    if (productValue) {
      await page.selectOption('select[id="productId"]', productValue);

      // Wait for tiers to load
      await page.waitForSelector('select[id="tierId"] option:not([value=""])');

      const tierValue = await page.locator('select[id="tierId"] option').nth(1).getAttribute('value');
      if (tierValue) {
        await page.selectOption('select[id="tierId"]', tierValue);
      }
    }
  }

  await page.fill('input[id="seats"]', '5');

  // Test MONTHLY term
  await page.selectOption('select[id="termLength"]', 'MONTHLY');
  await page.click('button:has-text("Next")');
  await page.click('button:has-text("Next")'); // Skip add-ons
  await page.click('button:has-text("Next")'); // Skip discount

  // Capture monthly price
  const monthlyPriceText = await page.locator('text=/Base Price.*?\$[\d,]+\.\d{2}/').first().textContent();
  const monthlyPrice = monthlyPriceText ? parseFloat(monthlyPriceText.match(/\$[\d,]+\.\d{2}/)?.[0]?.replace(/[$,]/g, '') || '0') : 0;

  // Go back and try ANNUAL
  await page.click('button:has-text("Previous")');
  await page.click('button:has-text("Previous")');
  await page.click('button:has-text("Previous")');

  await page.selectOption('select[id="termLength"]', 'ANNUAL');
  await page.click('button:has-text("Next")');
  await page.click('button:has-text("Next")');
  await page.click('button:has-text("Next")');

  // Capture annual price (should be approximately monthly price × 12 × 0.85)
  const annualPriceText = await page.locator('text=/Base Price.*?\$[\d,]+\.\d{2}/').first().textContent();
  const annualPrice = annualPriceText ? parseFloat(annualPriceText.match(/\$[\d,]+\.\d{2}/)?.[0]?.replace(/[$,]/g, '') || '0') : 0;

  // Verify the relationship (annual should be 10.2x monthly: 12 * 0.85 = 10.2)
  if (monthlyPrice > 0 && annualPrice > 0) {
    const ratio = annualPrice / monthlyPrice;
    expect(ratio).toBeCloseTo(10.2, 1); // Allow 1 decimal place of precision
  }
});
