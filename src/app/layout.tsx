import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWARegister } from "@/components/pwa-register";
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
  title: {
    default: "ChurchFlow — Church Management",
    template: "%s · ChurchFlow",
  },
  description:
    "Church management platform for membership, attendance, giving and more.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  themeColor: "#3B82F6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChurchFlow",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
