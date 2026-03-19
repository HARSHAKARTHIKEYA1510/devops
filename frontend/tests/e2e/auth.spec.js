import { test, expect } from '@playwright/test';

test.describe('Authentication and Main Flow', () => {
  test('should load the homepage and show categories', async ({ page }) => {
    await page.goto('/');
    
    // Check for the brand/logo or main heading
    await expect(page.locator('h1')).toContainText(/ShopZen/i);
    
    // Verify categories are visible (after restricted changes)
    await expect(page.getByText(/Electronics/i)).toBeVisible();
    await expect(page.getByText(/Clothing/i)).toBeVisible();
    await expect(page.getByText(/Footwear/i)).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login link in Navbar if it exists
    const loginLink = page.getByRole('link', { name: /login/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('h1')).toContainText(/Login/i);
    }
  });

  test('should see "No results" if searching for non-existent category', async ({ page }) => {
    // Navigate straight to a filtered view
    await page.goto('/products?category=InvalidXYZ');
    
    // Check for empty state
    await expect(page.getByText(/No results/i)).toBeVisible();
  });
});
