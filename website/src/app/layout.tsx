import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "ASF Shopee — Premium Grocery, Delivered Fast",
  description: "ASF Shopee is a premium grocery commerce experience with fast delivery, curated products, and live order tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 min-h-screen pb-20">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <BottomNav />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
