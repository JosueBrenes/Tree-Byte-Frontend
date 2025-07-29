import { Page, Locator } from '@playwright/test';

export class ProjectHelpers {
  constructor(private page: Page) {}

  async openFirstProject(): Promise<void> {
    const firstCard = this.page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
  }

  async clickApplyToProject(): Promise<void> {
    const modal = this.page.locator('[role="dialog"]');
    const applyButton = modal.locator('text=Apply to this project');
    await applyButton.click();
  }

  async fillTokenAmount(amount: string): Promise<void> {
    const amountInput = this.page.locator('input[type="number"]');
    await amountInput.fill(amount);
  }

  async confirmPurchase(): Promise<void> {
    const confirmButton = this.page.locator('text=Confirm Purchase');
    await confirmButton.click();
  }

  async getProjectModal(): Promise<Locator> {
    return this.page.locator('[role="dialog"]');
  }

  async waitForSuccessToast(): Promise<void> {
    await this.page.locator('text=Tree adopted successfully!').waitFor();
  }

  async waitForErrorToast(): Promise<void> {
    await this.page.locator('text=Purchase failed').waitFor();
  }
}

export class DashboardHelpers {
  constructor(private page: Page) {}

  async getTokensSection(): Promise<Locator> {
    return this.page.locator('text=Latest tokens acquired').locator('..');
  }

  async getTokenByName(name: string): Promise<Locator> {
    return this.page.locator(`text=${name}`);
  }

  async getTokenIcons(): Promise<Locator> {
    return this.page.locator('.bg-black.rounded-full .w-6.h-6');
  }

  async getUserGreeting(): Promise<Locator> {
    return this.page.locator('text=Hi there Michael');
  }

  async getPointsDisplay(): Promise<Locator> {
    return this.page.locator('text=1569 pts');
  }
}

export class NavigationHelpers {
  constructor(private page: Page) {}

  async goToProjects(): Promise<void> {
    await this.page.goto('/projects');
  }

  async goToDashboard(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async goToAdoptFlow(): Promise<void> {
    await this.page.goto('/adopt-flow');
  }

  async goHome(): Promise<void> {
    await this.page.goto('/');
  }
}

export function setupAPIRoutes(page: Page) {
  return {
    mockSuccessfulPurchase: async (tokenData?: any) => {
      await page.route('**/token/buy-token', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            transaction_id: 'test-tx-123',
            tokens_purchased: 1,
            ...tokenData
          }),
        });
      });
    },

    mockFailedPurchase: async (errorMessage = 'Purchase failed') => {
      await page.route('**/token/buy-token', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: errorMessage }),
        });
      });
    },

    mockNetworkError: async () => {
      await page.route('**/token/buy-token', async route => {
        await route.abort('failed');
      });
    },

    mockSlowResponse: async (delay = 2000) => {
      await page.route('**/token/buy-token', async route => {
        await page.waitForTimeout(delay);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });
    }
  };
}