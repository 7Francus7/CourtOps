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
        --primary: ${themeColor} !important;
        --brand-blue: ${themeColor} !important;
        ${rgb ? `--primary-rgb: ${rgb} !important;` : ''}
        
        /* Auto-calculate hover state if needed, but for now relying on opacity layers in Tailwind */
        --box-shadow-neon-blue: 0 0 10px ${themeColor}66; /* 40% opacity hex aprox */
      }
      
      .text-primary {
         color: ${themeColor} !important;
      }
      
      .bg-primary {
         background-color: ${themeColor} !important;
      }
      
      .border-primary {
         border-color: ${themeColor} !important;
      }
    `}</style>
       )
}
