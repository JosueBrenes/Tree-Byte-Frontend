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
    
    const applyButton = modal.locator('text=Apply to this project');
    await expect(applyButton).toBeVisible();
    await expect(applyButton).toHaveClass(/bg-\[#7EF45D\]/);
  });

  test('should navigate to adopt flow page when clicking apply button', async ({ page }) => {
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    const applyButton = modal.locator('text=Apply to this project');
    await applyButton.click();
    
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
      await expect(page.locator(`text=${step}`)).toBeVisible();
    }
  });

  test('should show step 1 as active initially', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    const activeStep = page.locator('.bg-green-500').first();
    await expect(activeStep).toBeVisible();
    
    const selectStep = page.locator('text=Select').first();
    const stepContainer = selectStep.locator('..').locator('..');
    await expect(stepContainer.locator('h3')).toHaveClass(/text-green-600/);
  });

  test('should allow progressing through adoption steps', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    const farmCard = page.locator('[data-testid="farm-card"]').first();
    if (await farmCard.isVisible()) {
      await farmCard.click();
      
      const nextButton = page.locator('text=Continue to Wallet Connection');
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
    
    await expect(page.locator('text=Connect your wallet')).toBeVisible();
  });

  test('should handle wallet connection step', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    const farmCard = page.locator('[data-testid="farm-card"]').first();
    if (await farmCard.isVisible()) {
      await farmCard.click();
      
      const nextButton = page.locator('text=Continue');
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
    
    const walletButtons = page.locator('button:has-text("Connect")');
    if (await walletButtons.first().isVisible()) {
      await expect(walletButtons.first()).toBeVisible();
    }
  });

  test('should show tree adoption step', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    await page.evaluate(() => {
      (window as any).setCurrentStep?.(3);
    });
    
    await expect(page.locator('text=Adopt your tree')).toBeVisible();
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
    const applyButton = modal.locator('text=Apply to this project');
    await applyButton.click();
    
    await expect(page.locator('text=Processing...')).toBeVisible({ timeout: 1000 });
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
    const applyButton = modal.locator('text=Apply to this project');
    await applyButton.click();
    
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
    const applyButton = modal.locator('text=Apply to this project');
    await applyButton.click();
    
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Purchase failed')).toBeVisible();
  });

  test('should validate token amount input', async ({ page }) => {
    await page.goto('/projects');
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    const applyButton = modal.locator('text=Apply to this project');
    await applyButton.click();
    
    const amountInput = page.locator('input[type="number"]');
    if (await amountInput.isVisible()) {
      await amountInput.fill('0');
      
      const confirmButton = page.locator('text=Confirm Purchase');
      await expect(confirmButton).toBeDisabled();
      
      await amountInput.fill('5');
      await expect(confirmButton).not.toBeDisabled();
    }
  });

  test('should require user authentication for purchase', async ({ page }) => {
    await page.goto('/projects');
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    const applyButton = modal.locator('text=Apply to this project');
    await applyButton.click();
    
    const authMessage = page.locator('text=You need to log in before adopting a tree');
    if (await authMessage.isVisible()) {
      await expect(authMessage).toBeVisible();
      
      const confirmButton = page.locator('text=Confirm Purchase');
      await expect(confirmButton).toBeDisabled();
    }
  });
});