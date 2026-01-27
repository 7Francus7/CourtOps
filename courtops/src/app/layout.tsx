import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import RootProvider from "@/components/providers/RootProvider";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import "./globals.css";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { getCachedClubTheme } from "@/lib/club-cache";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CourtOps - Gestión de Clubes",
  description: "Plataforma SaaS para gestión integral de complejos deportivos.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
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
        {themeStyle && (
          <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
        )}
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} antialiased`}
      >
        <RootProvider session={session}>
          {children}
          <InstallPrompt />
        </RootProvider>
      </body>
    </html>
  );
}
