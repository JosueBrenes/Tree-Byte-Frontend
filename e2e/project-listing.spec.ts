import { test, expect } from '@playwright/test';

test.describe('Project Listing Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('should display projects page header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Projects');
    await expect(page.locator('text=Discover and adopt trees')).toBeVisible();
  });

  test('should display grid of project cards', async ({ page }) => {
    const projectCards = page.locator('[data-testid="project-card"], .grid .cursor-pointer');
    await expect(projectCards).toHaveCount(9);
  });

  test('should display project card information', async ({ page }) => {
    const firstCard = page.locator('.grid .cursor-pointer').first();
    
    await expect(firstCard.locator('img')).toBeVisible();
    await expect(firstCard.locator('h3')).toContainText('Finca Chapinero');
    await expect(firstCard.locator('text=Turriaba, Cartago')).toBeVisible();
    await expect(firstCard.locator('text=Available')).toBeVisible();
    await expect(firstCard.locator('text=325/750')).toBeVisible();
  });

  test('should have different statuses for projects', async ({ page }) => {
    const availableProjects = page.locator('text=Available');
    const comingSoonProjects = page.locator('text=Coming soon');
    
    await expect(availableProjects).toHaveCount(6);
    await expect(comingSoonProjects).toHaveCount(3);
  });

  test('should open project modal when card is clicked', async ({ page }) => {
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toContainText('Finca Oso Perezoso');
    await expect(modal.locator('text=Turrialba, Cartago')).toBeVisible();
  });

  test('should display project modal content', async ({ page }) => {
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    
    await expect(modal.locator('text=800/1500')).toBeVisible();
    await expect(modal.locator('text=700 remaining')).toBeVisible();
    await expect(modal.locator('text=21.6 tons CO2/year')).toBeVisible();
    await expect(modal.locator('text=About our project')).toBeVisible();
    await expect(modal.locator('text=Mission')).toBeVisible();
    await expect(modal.locator('text=Available Species:')).toBeVisible();
    await expect(modal.locator('text=Activities:')).toBeVisible();
    await expect(modal.locator('text=Available Tokens:')).toBeVisible();
  });

  test('should close modal when clicking outside or close button', async ({ page }) => {
    const firstCard = page.locator('.grid .cursor-pointer').first();
    await firstCard.click();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('should have hover effects on project cards', async ({ page }) => {
    const firstCard = page.locator('.grid .cursor-pointer').first();
    
    await firstCard.hover();
    await page.waitForTimeout(100);
    
    const cardClasses = await firstCard.getAttribute('class');
    expect(cardClasses).toContain('hover:shadow-lg');
  });

  test('should display correct project images', async ({ page }) => {
    const images = page.locator('.grid .cursor-pointer img');
    
    for (let i = 0; i < 9; i++) {
      const image = images.nth(i);
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute('alt');
    }
  });
});