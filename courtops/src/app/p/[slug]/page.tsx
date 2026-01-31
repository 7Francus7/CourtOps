import { getPublicClubBySlug } from '@/actions/public-booking'
import { getOpenMatches } from '@/actions/open-matches'
import PublicBookingWizard from '@/components/public/PublicBookingWizard'
import { notFound } from 'next/navigation'

import { Suspense } from 'react'

// Helpers for consistent theme colors
function hexToRgb(hex: string) {
       const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
       return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

function hexToHsl(hex: string) {
       let r = parseInt(hex.slice(1, 3), 16) / 255;
       let g = parseInt(hex.slice(3, 5), 16) / 255;
       let b = parseInt(hex.slice(5, 7), 16) / 255;

       let max = Math.max(r, g, b), min = Math.min(r, g, b);
       let h = 0, s = 0, l = (max + min) / 2;

       if (max !== min) {
              let d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch (max) {
                     case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                     case g: h = (b - r) / d + 2; break;
                     case b: h = (r - g) / d + 4; break;
              }
              h /= 6;
       }
       return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

function getContrastColorHsl(hex: string) {
       const r = parseInt(hex.slice(1, 3), 16);
       const g = parseInt(hex.slice(3, 5), 16);
       const b = parseInt(hex.slice(5, 7), 16);
       const yiq = (r * 299 + g * 587 + b * 114) / 1000;
       return yiq >= 128 ? '222.2 84% 4.9%' : '210 40% 98%'; // Dark Slate vs Off-White
}

export default async function PublicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
       const resolvedParams = await params
       const club = await getPublicClubBySlug(resolvedParams.slug)
       const openMatches = await getOpenMatches(resolvedParams.slug)

       if (!club) {
              notFound()
       }

       const now = new Date().toISOString()

       // Dynamic Theme Injection for Public Pages
       let themeStyle = ''
       if (club.themeColor) {
              const color = club.themeColor
              const hsl = hexToHsl(color)
              const rgb = hexToRgb(color)
              const contrast = getContrastColorHsl(color)
              themeStyle = `
                     :root {
                            --primary: ${hsl};
                            --primary-foreground: ${contrast};
                            ${rgb ? `--primary-rgb: ${rgb};` : ''}
                     }
              `
       }

       return (
              <>
                     {themeStyle && <style dangerouslySetInnerHTML={{ __html: themeStyle }} />}
                     <Suspense fallback={<div className="min-h-screen bg-background flex flex-center items-center justify-center text-foreground font-bold">Cargando...</div>}>
                            <PublicBookingWizard club={club} initialDateStr={now} openMatches={openMatches} />
                     </Suspense>
              </>
       )
}
