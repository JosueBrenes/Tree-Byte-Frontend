import { test, expect } from '@playwright/test';

test.describe('Simple Token Purchase Flow', () => {
  test('complete flow from projects to adopt tree modal', async ({ page }) => {
    // Mock successful purchase
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

    // Go to projects page
    await page.goto('/projects');
    
    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Our Projects');
    
    // Verify project cards are present
    const projectCards = page.locator('.grid .cursor-pointer');
    await expect(projectCards).toHaveCount(9);
    
    // Click first project card
    const firstCard = projectCards.first();
    await firstCard.click();
    
    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 10000 });
    
    // Find and click Adopt Tree button
    const adoptButton = modal.locator('text=Adopt Tree');
    await expect(adoptButton).toBeVisible();
    await adoptButton.click();
    
    // Wait for adopt modal to appear
    const adoptModal = page.locator('[role="dialog"]:has-text("Adopt a Tree")');
    await expect(adoptModal).toBeVisible({ timeout: 10000 });
    
    // Verify modal content
    await expect(adoptModal.locator('text=Enter the amount of tokens')).toBeVisible();
    const amountInput = adoptModal.locator('input[type="number"]');
    await expect(amountInput).toBeVisible();
    
    // Set amount and purchase
    await amountInput.fill('2');
    
    const confirmButton = adoptModal.locator('text=Confirm Purchase');
    await expect(confirmButton).toBeVisible();
    await expect(confirmButton).not.toBeDisabled();
    
    await confirmButton.click();
    
    // Expect success message
    await expect(page.locator('text=Tree adopted successfully!')).toBeVisible({ timeout: 10000 });
  });

  test('should display projects page correctly', async ({ page }) => {
    await page.goto('/projects');
    
    await expect(page.locator('h1')).toContainText('Our Projects');
    
    const projectCards = page.locator('.grid .cursor-pointer');
    await expect(projectCards).toHaveCount(9);
    
    const firstCard = projectCards.first();
    await expect(firstCard.locator('h3')).toContainText('Finca Chapinero');
    await expect(firstCard.locator('text=Turriaba, Cartago')).toBeVisible();
  });

  test('should display dashboard page correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('text=Hi there Michael')).toBeVisible();
    await expect(page.locator('text=Points available:')).toBeVisible();
    await expect(page.locator('text=Latest tokens acquired')).toBeVisible();
    
    const tokenIcons = page.locator('.bg-black.rounded-full .w-6.h-6');
    await expect(tokenIcons).toHaveCount(5);
  });

  test('should display adopt flow page correctly', async ({ page }) => {
    await page.goto('/adopt-flow');
    
    await expect(page.locator('h1')).toContainText('How to adopt your tree on TreeByte?');
    await expect(page.locator('text=Back to home')).toBeVisible();
    
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
});