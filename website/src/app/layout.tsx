import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import Navbar from "@/components/Navbar";
import SplashGate from "@/components/SplashGate";

export const metadata: Metadata = {
  title: "ASF Shopee — Premium Grocery, Delivered Fast",
  description: "ASF Shopee is a premium grocery commerce experience with fast delivery, curated products, and live order tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-asf-cream min-h-screen">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SplashGate>
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <footer className="border-t border-asf-mist mt-20 py-10 text-center text-sm text-asf-slate">
                <div className="container-app">
                  <p className="font-display text-lg text-asf-slateDeep mb-1">ASF</p>
                  <p>© {new Date().getFullYear()} ASF Shopee. Crafted for premium grocery delivery.</p>
                </div>
              </footer>
            </SplashGate>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
