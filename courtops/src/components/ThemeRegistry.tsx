'use client'

import { useEffect } from 'react'

function hexToRgb(hex: string) {
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ?
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : null;
}

export function ThemeRegistry({ themeColor }: { themeColor?: string | null }) {
   if (!themeColor) return null;

   const rgb = hexToRgb(themeColor);

   return (
      <style jsx global>{`
      :root {
        /* Primary - The main brand color */
        --primary: ${themeColor} !important;
        --brand-blue: ${themeColor} !important;
        ${rgb ? `--primary-rgb: ${rgb} !important;` : ''}

        /* Secondary - Map to the same theme color or a variation */
        /* Currently ensuring EVERYTHING green becomes the theme color */
        --secondary: ${themeColor} !important; 
        --brand-green: ${themeColor} !important;
        ${rgb ? `--secondary-rgb: ${rgb} !important;` : ''}

        /* Update Shadows */
        --box-shadow-neon-blue: 0 0 10px ${themeColor}66;
        --box-shadow-neon-green: 0 0 10px ${themeColor}66;
      }
      
      /* Utility overrides */
      .text-primary { color: ${themeColor} !important; }
      .bg-primary { background-color: ${themeColor} !important; }
      .border-primary { border-color: ${themeColor} !important; }

      .text-brand-green { color: ${themeColor} !important; }
      .bg-brand-green { background-color: ${themeColor} !important; }
      .border-brand-green { border-color: ${themeColor} !important; }
    `}</style>
   )
}
