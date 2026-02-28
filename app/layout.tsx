import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XC9JGJEGBK" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XC9JGJEGBK');
        `}</Script>
      </body>
    </html>
  );
}
