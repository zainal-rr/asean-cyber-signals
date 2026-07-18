import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const preferredRegion = "sin1";

export const metadata: Metadata = {
  title: {
    default: "ASEAN Cyber Signals",
    template: "%s | ASEAN Cyber Signals",
  },
  description:
    "Public-source cybersecurity trends for presales conversations across Singapore, Malaysia, and Indonesia.",
  applicationName: "ASEAN Cyber Signals",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f9fb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-theme="light"
    >
      <body>{children}</body>
    </html>
  );
}
