import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CookieBanner } from "@/app/components/cookie-banner";
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
  title: "Lekcjo - Znajdź najlepszego korepetytora | Lekcjo.pl",
  description: "Największa platforma korepetycji w Polsce. Znajdź korepetytora lub ucznia w kilka minut. Matematyka, angielski, fizyka i wiele więcej.",
  openGraph: {
    title: "Lekcjo - Znajdź najlepszego korepetytora | Lekcjo.pl",
    description: "Największa platforma korepetycji w Polsce. Znajdź korepetytora lub ucznia w kilka minut.",
    url: "https://lekcjo.pl",
    siteName: "Lekcjo.pl",
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lekcjo - Znajdź najlepszego korepetytora | Lekcjo.pl",
    description: "Największa platforma korepetycji w Polsce. Znajdź korepetytora lub ucznia w kilka minut.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors />
        <CookieBanner />
      </body>
    </html>
  );
}
