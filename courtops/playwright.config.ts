import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
       testDir: './tests',
       testIgnore: '**/unit/**',
       // El funnel registro→onboarding→reserva es secuencial: un solo worker
       fullyParallel: false,
       workers: 1,
       forbidOnly: !!process.env.CI,
       retries: process.env.CI ? 2 : 0,
       timeout: 90_000,
       expect: { timeout: 15_000 },
       reporter: [['list'], ['html', { open: 'never' }]],
       use: {
              baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
              trace: 'retain-on-failure',
              screenshot: 'only-on-failure',
              locale: 'es-AR',
              timezoneId: 'America/Argentina/Buenos_Aires',
       },
       projects: [
              {
                     name: 'chromium',
                     use: { ...devices['Desktop Chrome'] },
              },
              {
                     name: 'mobile-375',
                     // Android gama media a 375px — Chromium, no requiere WebKit instalado
                     use: { ...devices['Pixel 5'], viewport: { width: 375, height: 667 } },
              },
       ],
       webServer: {
              command: 'npm run dev',
              url: 'http://localhost:3000',
              reuseExistingServer: !process.env.CI,
              timeout: 120 * 1000,
       },
});
