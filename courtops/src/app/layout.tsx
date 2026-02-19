import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import RootProvider from "@/components/providers/RootProvider";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import "./globals.css";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { getCachedClubTheme } from "@/lib/club-cache";

const font = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CourtOps - Gestión Integral de Clubes Deportivos",
    template: "%s | CourtOps",
  },
  description: "La plataforma definitiva para clubes deportivos. Reservas, Pagos, Kiosco y Métricas en un solo lugar. Sin comisiones por reserva.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CourtOps",
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://courtops.vercel.app'),
  openGraph: {
    title: "CourtOps - Tu club en piloto automático",
    description: "Reservas online, control de caja, kiosco POS y reportes inteligentes. Todo lo que necesitas para profesionalizar tu club deportivo.",
    url: '/',
    siteName: 'CourtOps',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CourtOps - Gestión de Clubes Deportivos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CourtOps - Tu club en piloto automático',
    description: 'Reservas, Pagos, Kiosco y Métricas en un solo lugar. Sin comisiones.',
    images: ['/og-image.png'],
  },
  keywords: ['gestión clubes deportivos', 'reservas padel', 'turnos online', 'kiosco pos', 'club deportivo software', 'SaaS deportes', 'CourtOps'],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0080ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)
  let themeStyle = ''

  if (session?.user?.clubId) {
    const club = await getCachedClubTheme(session.user.clubId)

    if (club?.themeColor) {
      const color = club.themeColor
      const rgb = hexToRgb(color)

      themeStyle = `
        :root {
          --primary: ${color};
          --brand-blue: ${color};
          --brand-green: ${color}; /* Override secondary mapping alias if needed, though usually distinct. Let's keep primary override. */
          ${rgb ? `--primary-rgb: ${rgb};` : ''}
        }
        
        /* Overrides for specific classes if they don't use the variable directly */
        .input-dark:focus {
          border-color: ${color} !important;
          --tw-ring-color: ${color} !important; 
        }
      `
    }
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Google Tag Manager - Script needs to be as high as practically possible, but Next.js Script handles it well */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5J6QTJSP');
          `}
        </Script>
        {themeStyle && (
          <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
        )}
      </head>
      <body
        suppressHydrationWarning
        className={`${font.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5J6QTJSP"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <RootProvider session={session}>
          {children}
          <InstallPrompt />
        </RootProvider>
      </body>
    </html>
  );
}
