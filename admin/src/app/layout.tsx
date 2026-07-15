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
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans bg-asf-cream min-h-screen">
        <SWRegister />
        {children}
        <PushNotificationManager />
      </body>
    </html>
  );
}
