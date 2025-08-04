import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Desarrollo en Movimiento - Dashboard ONG",
  description: "Sistema de gestión integral para organizaciones no gubernamentales. Administra formularios, estadísticas, plantillas y organizaciones de manera eficiente y transparente.",
  keywords: "ONG, dashboard, gestión, organizaciones, formularios, estadísticas, plantillas, desarrollo social",
  authors: [{ name: "Desarrollo en Movimiento" }],
  creator: "Desarrollo en Movimiento",
  publisher: "Desarrollo en Movimiento",
  openGraph: {
    title: "Desarrollo en Movimiento - Dashboard ONG",
    description: "Sistema de gestión integral para organizaciones no gubernamentales",
    type: "website",
    locale: "es_ES",
    siteName: "Desarrollo en Movimiento",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desarrollo en Movimiento - Dashboard ONG",
    description: "Sistema de gestión integral para organizaciones no gubernamentales",
    creator: "@desarrollo_mov",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
