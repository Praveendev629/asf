import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import SplashGate from "@/components/SplashGate";
import BottomNav from "@/components/BottomNav";
import PushNotificationManager from "@/components/PushNotificationManager";
import SWRegister from "@/components/SWRegister";

export const metadata: Metadata = {
  title: "ASF Shopee — Premium Grocery, Delivered Fast",
  description: "ASF Shopee is a premium grocery commerce experience with fast delivery, curated products, and live order tracking.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ASF Shopee",
  },
  formatDetection: { telephone: false },
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
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans bg-gray-50 min-h-screen pb-20">
        <SWRegister />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SplashGate>
                {children}
                <BottomNav />
                <PushNotificationManager />
              </SplashGate>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
