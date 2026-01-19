
import { test, expect } from '@playwright/test';

test.describe('Public Booking Flow', () => {
       test('should load the booking page for alfa-padel', async ({ page }) => {
              // Navigate to the public club page
              await page.goto('/p/alfa-padel');

              // Expect the page title or a header to contain the club name
              // Adjust selector based on actual UI
              await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

              // Check if grid is visible (assuming there is a grid or date picker)
              // This is a basic smoke test
              const mainContent = page.locator('main');
              await expect(mainContent).toBeVisible();
       });
});
