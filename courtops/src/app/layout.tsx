import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import RootProvider from "@/components/providers/RootProvider";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import "./globals.css";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
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
