import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
       console.log("Generando PDF de presentación...");
       try {
              const browser = await chromium.launch();
              const page = await browser.newPage();

              const filePath = join(__dirname, 'presentation.html');
              await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });

              const outputPath = join(__dirname, '..', 'Presentaci\u00F3n_CourtOps.pdf');

              await page.pdf({
                     path: outputPath,
                     format: 'A4',
                     landscape: true,
                     printBackground: true,
                     margin: { top: 0, bottom: 0, left: 0, right: 0 }
              });

              await browser.close();
              console.log(`\u2705 PDF generado exitosamente en: ${outputPath}`);
       } catch (error) {
              console.error("\u274C Error al generar el PDF:", error);
       }
})();
