
import { test, expect } from '@playwright/test';

test.describe('Public Booking Flow', () => {
       test('should complete a guest booking flow for alfa-padel', async ({ page }) => {
              // 1. Navigate to the public club page
              await page.goto('/p/alfa-padel');

              // 2. Click on "Reservar Turno"
              const reserveButton = page.getByRole('button', { name: /Reservar Turno/i });
              await expect(reserveButton).toBeVisible();
              await reserveButton.click();

              // 3. Select a date (default is today, let's just pick one if visible)
              // Wait for day buttons to be visible
              await page.waitForSelector('button.snap-center');

              // 4. Wait for slots to load
              await expect(page.locator('text=Buscando canchas...')).not.toBeVisible({ timeout: 10000 });

              // 5. Select the first available slot
              const firstSlot = page.locator('div.bg-white.dark\\:bg-\\[\\#161B22\\].rounded-\\[2rem\\]').first();
              await expect(firstSlot).toBeVisible();

              const firstCourtButton = firstSlot.locator('button').first();
              await firstCourtButton.click();

              // 6. Fill guest information
              await expect(page.getByText(/Confirmar Datos/i)).toBeVisible();

              await page.fill('input#name', 'Test Guest');
              await page.fill('input#phone', '1234567890');

              // 7. Confirm booking
              const confirmButton = page.getByRole('button', { name: /Confirmar Turno/i });
              await confirmButton.click();

              // 8. Assert Success (Ticket UI)
              await expect(page.getByText(/¡Turno Reservado!/i)).toBeVisible({ timeout: 15000 });
              await expect(page.getByText(/Test Guest/i)).not.toBeVisible(); // Name is not usually in the ticket but let's check general success
              await expect(page.getByRole('button', { name: /Pagar Seña/i })).toBeVisible();
       });
});
