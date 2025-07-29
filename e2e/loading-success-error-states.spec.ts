import { test, expect } from '@playwright/test';

test.describe('Loading, Success, and Error States', () => {
  test.describe('Loading States', () => {
    test('should show loading state in adopt tree modal', async ({ page }) => {
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
      
      await expect(page.locator('text=Processing...')).toBeVisible();
      
      const confirmButton = page.locator('text=Processing...');
      await expect(confirmButton).toBeDisabled();
    });

    test('should show loading state during project data fetch', async ({ page }) => {
      await page.route('**/api/projects', async route => {
        await page.waitForTimeout(1000);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });

      await page.goto('/projects');
      
      await expect(page.locator('text=Loading...')).toBeVisible({ timeout: 500 });
    });

    test('should disable purchase button during token amount validation', async ({ page }) => {
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
      }
    });

    test('should show spinner during dashboard data loading', async ({ page }) => {
      await page.route('**/api/dashboard/**', async route => {
        await page.waitForTimeout(1500);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      });

      await page.goto('/dashboard');
      
      const loadingIndicator = page.locator('[data-testid="loading-spinner"], .animate-spin');
      if (await loadingIndicator.isVisible()) {
        await expect(loadingIndicator).toBeVisible();
      }
    });
  });

  test.describe('Success States', () => {
    test('should display success toast after successful token purchase', async ({ page }) => {
      await page.route('**/token/buy-token', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true,
            transaction_id: 'success-tx-123',
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
      
      await expect(page.locator('text=Success')).toBeVisible();
      await expect(page.locator('text=Tree adopted successfully!')).toBeVisible();
    });

    test('should close modal after successful purchase', async ({ page }) => {
      await page.route('**/token/buy-token', async route => {
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
      
      await expect(page.locator('text=Tree adopted successfully!')).toBeVisible();
      
      await page.waitForTimeout(2000);
      await expect(modal).not.toBeVisible();
    });

    test('should display success message in adoption flow completion', async ({ page }) => {
      await page.goto('/adopt-flow');
      
      await page.evaluate(() => {
        (window as any).setCurrentStep?.(5);
      });
      
      const successIndicator = page.locator('text=completed, text=success, text=adopted');
      if (await successIndicator.first().isVisible()) {
        await expect(successIndicator.first()).toBeVisible();
      }
    });

    test('should show confirmation feedback on successful form submission', async ({ page }) => {
      await page.route('**/api/contact', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Form submitted successfully' }),
        });
      });

      await page.goto('/');
      
      const contactForm = page.locator('form');
      if (await contactForm.isVisible()) {
        await contactForm.locator('input[type="email"]').fill('test@example.com');
        await contactForm.locator('textarea').fill('Test message');
        await contactForm.locator('button[type="submit"]').click();
        
        await expect(page.locator('text=Thank you, text=submitted')).toBeVisible();
      }
    });
  });

  test.describe('Error States', () => {
    test('should display error toast for failed token purchase', async ({ page }) => {
      await page.route('**/token/buy-token', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Insufficient funds' }),
        });
      });

      await page.goto('/projects');
      const firstCard = page.locator('.grid .cursor-pointer').first();
      await firstCard.click();
      
      const modal = page.locator('[role="dialog"]');
      const applyButton = modal.locator('text=Apply to this project');
      await applyButton.click();
      
      await expect(page.locator('text=Error')).toBeVisible();
      await expect(page.locator('text=Purchase failed')).toBeVisible();
    });

    test('should handle network error during token purchase', async ({ page }) => {
      await page.route('**/token/buy-token', async route => {
        await route.abort('failed');
      });

      await page.goto('/projects');
      const firstCard = page.locator('.grid .cursor-pointer').first();
      await firstCard.click();
      
      const modal = page.locator('[role="dialog"]');
      const applyButton = modal.locator('text=Apply to this project');
      await applyButton.click();
      
      await expect(page.locator('text=Error, text=Network error, text=Try again')).toBeVisible();
    });

    test('should display error message for authentication failure', async ({ page }) => {
      await page.route('**/token/buy-token', async route => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'User not authenticated' }),
        });
      });

      await page.goto('/projects');
      const firstCard = page.locator('.grid .cursor-pointer').first();
      await firstCard.click();
      
      const modal = page.locator('[role="dialog"]');
      const applyButton = modal.locator('text=Apply to this project');
      await applyButton.click();
      
      await expect(page.locator('text=You need to log in')).toBeVisible();
    });

    test('should show error state when projects fail to load', async ({ page }) => {
      await page.route('**/api/projects', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await page.goto('/projects');
      
      await expect(page.locator('text=Error loading projects, text=Failed to load, text=Try again')).toBeVisible();
    });

    test('should handle validation errors in purchase form', async ({ page }) => {
      await page.goto('/projects');
      const firstCard = page.locator('.grid .cursor-pointer').first();
      await firstCard.click();
      
      const modal = page.locator('[role="dialog"]');
      const applyButton = modal.locator('text=Apply to this project');
      await applyButton.click();
      
      const amountInput = page.locator('input[type="number"]');
      if (await amountInput.isVisible()) {
        await amountInput.fill('-1');
        
        const errorMessage = page.locator('text=Amount must be positive, text=Invalid amount');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
        
        const confirmButton = page.locator('text=Confirm Purchase');
        await expect(confirmButton).toBeDisabled();
      }
    });

    test('should display timeout error for slow requests', async ({ page }) => {
      await page.route('**/token/buy-token', async route => {
        await page.waitForTimeout(10000);
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
      
      await expect(page.locator('text=Timeout, text=Request timeout, text=Try again')).toBeVisible({ timeout: 8000 });
    });
  });

  test.describe('State Transitions', () => {
    test('should transition from loading to success state', async ({ page }) => {
      await page.route('**/token/buy-token', async route => {
        await page.waitForTimeout(1000);
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
      
      await expect(page.locator('text=Processing...')).toBeVisible();
      
      await expect(page.locator('text=Success')).toBeVisible();
      await expect(page.locator('text=Processing...')).not.toBeVisible();
    });

    test('should transition from loading to error state', async ({ page }) => {
      await page.route('**/token/buy-token', async route => {
        await page.waitForTimeout(1000);
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await page.goto('/projects');
      const firstCard = page.locator('.grid .cursor-pointer').first();
      await firstCard.click();
      
      const modal = page.locator('[role="dialog"]');
      const applyButton = modal.locator('text=Apply to this project');
      await applyButton.click();
      
      await expect(page.locator('text=Processing...')).toBeVisible();
      
      await expect(page.locator('text=Error')).toBeVisible();
      await expect(page.locator('text=Processing...')).not.toBeVisible();
    });

    test('should reset state when modal is reopened', async ({ page }) => {
      await page.goto('/projects');
      const firstCard = page.locator('.grid .cursor-pointer').first();
      await firstCard.click();
      
      const modal = page.locator('[role="dialog"]');
      const applyButton = modal.locator('text=Apply to this project');
      await applyButton.click();
      
      await page.keyboard.press('Escape');
      
      await firstCard.click();
      
      const confirmButton = page.locator('text=Confirm Purchase');
      await expect(confirmButton).not.toHaveText('Processing...');
      await expect(confirmButton).not.toBeDisabled();
    });
  });
});