import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { BetaBanner }
from "@/components/layout/BetaBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIIPro | Análise de Fundos Imobiliários",
  description:
    "Analise fundos imobiliários, acompanhe dividendos, cotações e indicadores em uma plataforma completa para investidores.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

  <Header />

  <BetaBanner />

  <main className="flex-1">
    {children}
  </main>

  <Footer />

</body>
    </html>
  );
}
