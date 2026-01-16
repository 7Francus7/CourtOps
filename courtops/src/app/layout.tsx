import type { Metadata } from "next";
import { Inter } from "next/font/google";
import RootProvider from "@/components/providers/RootProvider";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CourtOps - Gestión de Clubes",
  description: "Plataforma SaaS para gestión integral de complejos deportivos.",
};

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
        </RootProvider>
      </body>
    </html>
  );
}
