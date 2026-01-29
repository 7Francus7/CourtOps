'use client'

import { useEffect } from 'react'

function hexToRgb(hex: string) {
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ?
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : null;
}

function hexToHsl(hex: string) {
   let c = hex.substring(1).split('');
   if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
   }
   const hexValue = c.join('');

   const r = parseInt(hexValue.substring(0, 2), 16) / 255;
   const g = parseInt(hexValue.substring(2, 4), 16) / 255;
   const b = parseInt(hexValue.substring(4, 6), 16) / 255;

   const max = Math.max(r, g, b), min = Math.min(r, g, b);
   let h = 0, s = 0, l = (max + min) / 2;

   if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
         case r: h = (g - b) / d + (g < b ? 6 : 0); break;
         case g: h = (b - r) / d + 2; break;
         case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
   }

   return {
      css: `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`,
      l: l
   };
}

export function ThemeRegistry({ themeColor }: { themeColor?: string | null }) {
   if (!themeColor) return null;

   const rgb = hexToRgb(themeColor);
   const hsl = hexToHsl(themeColor);

   // Calculate readable foreground based on lightness
   // If background is dark (l < 0.5), use white. If light, use dark slate.
   const foregroundColor = hsl.l > 0.6 ? '222.2 84% 4.9%' : '210 40% 98%';

   return (
      <style jsx global>{`
      :root {
        /* Primary - The main brand color - MUST BE HSL FOR TAILWIND */
        --primary: ${hsl.css} !important;
        --brand-blue: ${hsl.css} !important;
        --primary-foreground: ${foregroundColor} !important;
        ${rgb ? `--primary-rgb: ${rgb} !important;` : ''}

        /* Secondary - Map to the same theme color or a variation */
        /* Currently ensuring EVERYTHING green becomes the theme color */
        --secondary: ${hsl.css} !important; 
        --brand-green: ${hsl.css} !important;
        ${rgb ? `--secondary-rgb: ${rgb} !important;` : ''}

        /* Update Shadows */
        --box-shadow-neon-blue: 0 0 10px ${themeColor}66;
        --box-shadow-neon-green: 0 0 10px ${themeColor}66;
        
        /* Ensure primary button text is readable */
        .text-primary-foreground {
           color: hsl(var(--primary-foreground));
        }
      }
    `}</style>
   )
}
