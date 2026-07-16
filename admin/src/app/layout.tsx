import type { Metadata, Viewport } from "next";
import "./globals.css";
import SWRegister from "@/components/SWRegister";
import PushNotificationManager from "@/components/PushNotificationManager";

export const metadata: Metadata = {
  title: "ASF Admin Dashboard",
  description: "Manage ASF Shopee operations.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "ASF Admin" },
};

export const viewport: Viewport = {
  themeColor: "#B8763E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#B8763E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo.png" />
      </head>
      <body className="font-sans bg-asf-cream min-h-screen">
        <SWRegister />
        {children}
        <PushNotificationManager />
      </body>
    </html>
  );
}
