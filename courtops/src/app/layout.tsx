import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CourtOps - Gestión de Clubes",
  description: "Plataforma SaaS para gestión integral de complejos deportivos.",
};

import { Toaster } from "sonner"; // Import Sonner
import QueryProvider from "@/components/providers/QueryProvider";

// ... metadata ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster theme="dark" richColors position="top-center" closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
