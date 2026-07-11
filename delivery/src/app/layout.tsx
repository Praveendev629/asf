import "../globals.css";
export const metadata = { title: "ASF Delivery Partner" };
export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="font-sans min-h-screen">{children}</body></html>;
}
