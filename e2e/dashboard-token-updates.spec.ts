import { test, expect } from '@playwright/test';

test.describe('Dashboard Token Updates after Purchase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display dashboard header with user greeting', async ({ page }) => {
    await expect(page.locator('text=Hi there Michael')).toBeVisible();
    await expect(page.locator('text=Points available:')).toBeVisible();
    await expect(page.locator('text=1569 pts')).toBeVisible();
  });

  test('should display tokens section in dashboard', async ({ page }) => {
    const tokensSection = page.locator('text=Latest tokens acquired').locator('..');
    await expect(tokensSection).toBeVisible();
    await expect(page.locator('text=Show all tokens...')).toBeVisible();
  });

  test('should display existing token collection', async ({ page }) => {
    const tokenNames = [
      'CAOBA',
      'ALMENDRO', 
      'SAUCE LLORÓN',
      'CENÍZARO',
      'ESPABEL'
    ];
    
    for (const tokenName of tokenNames) {
      await expect(page.locator(`text=${tokenName}`)).toBeVisible();
    }
  });

  test('should display token icons for each acquired token', async ({ page }) => {
    const tokenIcons = page.locator('.bg-black.rounded-full .w-6.h-6');
    await expect(tokenIcons).toHaveCount(5);
    
    for (let i = 0; i < 5; i++) {
      await expect(tokenIcons.nth(i)).toBeVisible();
    }
  });

  test('should update tokens section after successful purchase', async ({ page }) => {
    await page.route('**/token/buy-token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true,
          transaction_id: 'test-tx-123',
          tokens_purchased: 1,
          new_token: {
            name: 'ROBLE',
            project_id: '1'
          }
        }),
      });
    });

    await page.goto('/projects');
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    const applyButton = modal.locator('text=Apply to this project');
    await applyButton.click();
    
    await expect(page.locator('text=Tree adopted successfully!')).toBeVisible();
    
    await page.goto('/dashboard');
    
    await expect(page.locator('text=ROBLE')).toBeVisible();
  });

  test('should display active projects card', async ({ page }) => {
    const activeProjectsCard = page.locator('text=Active Projects').locator('..');
    await expect(activeProjectsCard).toBeVisible();
  });

  test('should display footprint card with CO2 data', async ({ page }) => {
    const footprintCard = page.locator('text=Carbon Footprint').locator('..');
    await expect(footprintCard).toBeVisible();
  });

  test('should display projects card in middle column', async ({ page }) => {
    const projectsCard = page.locator('.grid.grid-cols-3 > div:nth-child(2)');
    await expect(projectsCard).toBeVisible();
  });

  test('should display achievements card', async ({ page }) => {
    const achievementsCard = page.locator('text=Achievements').locator('..');
    await expect(achievementsCard).toBeVisible();
  });

  test('should display coupons section', async ({ page }) => {
    const couponsSection = page.locator('text=Coupons').locator('..');
    await expect(couponsSection).toBeVisible();
  });

  test('should maintain responsive layout', async ({ page }) => {
    const mainGrid = page.locator('.grid.grid-cols-3');
    await expect(mainGrid).toBeVisible();
    
    const columns = mainGrid.locator('> div');
    await expect(columns).toHaveCount(3);
  });

  test('should show all tokens link functionality', async ({ page }) => {
    const showAllTokensLink = page.locator('text=Show all tokens...');
    await expect(showAllTokensLink).toBeVisible();
    await expect(showAllTokensLink).toHaveClass(/hover:text-gray-700/);
  });

  test('should display token count correctly after multiple purchases', async ({ page }) => {
    let purchaseCount = 0;
    
    await page.route('**/token/buy-token', async route => {
      purchaseCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true,
          transaction_id: `test-tx-${purchaseCount}`,
          tokens_purchased: 1,
          total_tokens: 5 + purchaseCount
        }),
      });
    });

    await page.goto('/projects');
    
    for (let i = 0; i < 2; i++) {
      const firstCard = page.locator('.grid .cursor-pointer').first();
      await firstCard.click();
      
      const modal = page.locator('[role="dialog"]');
      const applyButton = modal.locator('text=Apply to this project');
      await applyButton.click();
      
      await expect(page.locator('text=Tree adopted successfully!')).toBeVisible();
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.goto('/dashboard');
    
    const tokenIcons = page.locator('.bg-black.rounded-full .w-6.h-6');
    await expect(tokenIcons).toHaveCount(7);
  });

  test('should handle token loading states', async ({ page }) => {
    await page.route('**/api/tokens/**', async route => {
      await page.waitForTimeout(1000);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/dashboard');
    
    const tokensSection = page.locator('text=Latest tokens acquired');
    await expect(tokensSection).toBeVisible();
  });
});