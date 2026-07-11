import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "ASF Delivery Partner",
  description: "ASF Shopee Delivery Partner Portal",
};

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 min-h-screen">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
