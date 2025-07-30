import { test, expect } from '@playwright/test';

test.describe('Token Purchase Flow via Adopt Tree Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('should display Adopt Tree button in project modal', async ({ page }) => {
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    const adoptButton = modal.locator('text=Adopt Tree');
    await expect(adoptButton).toBeVisible();
  });

  test('should navigate to adopt flow page directly', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    await expect(page).toHaveURL(/\/adopt-flow/);
    await expect(page.locator('h1')).toContainText('How to adopt your tree on TreeByte?');
  });

  test('should display adoption flow steps', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    const steps = [
      'Select',
      'Connect your wallet', 
      'Adopt your tree',
      'Receive your NFT',
      'Track your impact'
    ];
    
    for (const step of steps) {
      await expect(page.locator(`h3:has-text("${step}")`).first()).toBeVisible();
    }
  });

  test('should show step 1 as active initially', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    const activeStep = page.locator('.bg-green-500').first();
    await expect(activeStep).toBeVisible();
    
    const selectStepHeader = page.locator('h3:has-text("Select")').first();
    await expect(selectStepHeader).toHaveClass(/text-green-600/);
  });

  test('should display farm selection step content', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    await expect(page.locator('h2:has-text("Select your farm")')).toBeVisible();
  });

  test('should display back to home link', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    const backLink = page.locator('text=Back to home');
    await expect(backLink).toBeVisible();
  });

  test('should display loading state during token purchase', async ({ page }) => {
    await page.route('**/token/buy-token', async route => {
      await page.waitForTimeout(2000);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/projects');
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    const adoptButton = modal.locator('text=Adopt Tree');
    await adoptButton.click();
    
    const adoptModal = page.locator('[role="dialog"]:has-text("Adopt a Tree")');
    await expect(adoptModal).toBeVisible();
    
    const confirmButton = adoptModal.locator('text=Confirm Purchase');
    await confirmButton.click();
    
    await expect(adoptModal.locator('text=Processing...')).toBeVisible({ timeout: 1000 });
  });

  test('should handle successful token purchase', async ({ page }) => {
    await page.route('**/token/buy-token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true,
          transaction_id: 'test-tx-123',
          tokens_purchased: 1
        }),
      });
    });

    await page.goto('/projects');
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    const adoptButton = modal.locator('text=Adopt Tree');
    await adoptButton.click();
    
    const adoptModal = page.locator('[role="dialog"]:has-text("Adopt a Tree")');
    const confirmButton = adoptModal.locator('text=Confirm Purchase');
    await confirmButton.click();
    
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Tree adopted successfully!')).toBeVisible();
  });

  test('should handle token purchase error', async ({ page }) => {
    await page.route('**/token/buy-token', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Insufficient funds'
        }),
      });
    });

    await page.goto('/projects');
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    const adoptButton = modal.locator('text=Adopt Tree');
    await adoptButton.click();
    
    const adoptModal = page.locator('[role="dialog"]:has-text("Adopt a Tree")');
    const confirmButton = adoptModal.locator('text=Confirm Purchase');
    await confirmButton.click();
    
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Purchase failed')).toBeVisible();
  });

  test('should validate token amount input', async ({ page }) => {
    await page.goto('/projects');
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    const adoptButton = modal.locator('text=Adopt Tree');
    await adoptButton.click();
    
    const adoptModal = page.locator('[role="dialog"]:has-text("Adopt a Tree")');
    const amountInput = adoptModal.locator('input[type="number"]');
    
    await amountInput.fill('0');
    const confirmButton = adoptModal.locator('text=Confirm Purchase');
    await expect(confirmButton).toBeDisabled();
    
    await amountInput.fill('5');
    await expect(confirmButton).not.toBeDisabled();
  });

  test('should display adopt tree modal content', async ({ page }) => {
    await page.goto('/projects');
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    const adoptButton = modal.locator('text=Adopt Tree');
    await adoptButton.click();
    
    const adoptModal = page.locator('[role="dialog"]:has-text("Adopt a Tree")');
    await expect(adoptModal.locator('text=Enter the amount of tokens')).toBeVisible();
    await expect(adoptModal.locator('input[type="number"]')).toBeVisible();
    await expect(adoptModal.locator('text=Confirm Purchase')).toBeVisible();
  });
});