export interface InvoiceData {
  orderNumber: string;
  status: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: { name: string; price: number; quantity: number; image?: string }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  deliveryPartner?: { name: string; phone: string };
}

export function generateInvoice(order: InvoiceData): string {
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const time = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  const itemRows = order.items.map((item, i) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:right;">₹${item.price}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:right;font-weight:600;">₹${item.price * item.quantity}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f9fafb; color: #111827; }
    .invoice { max-width: 800px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 32px; }
    .header h1 { font-size: 24px; font-weight: 700; }
    .header p { font-size: 13px; opacity: 0.8; margin-top: 4px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 12px; text-transform: uppercase; }
    .content { padding: 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .info-box { background: #f9fafb; border-radius: 12px; padding: 16px; }
    .info-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; }
    .info-box p { font-size: 14px; color: #111827; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f9fafb; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; text-align: left; border-bottom: 2px solid #e5e7eb; }
    th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
    .totals { display: flex; justify-content: flex-end; }
    .totals table { width: 300px; }
    .totals td { padding: 8px 12px; font-size: 14px; }
    .totals .total-row td { font-size: 18px; font-weight: 700; border-top: 2px solid #111827; padding-top: 12px; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    @media print { body { background: white; } .invoice { box-shadow: none; margin: 0; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>ASF Shopee</h1>
      <p>Premium Grocery Delivery</p>
      <div class="badge">${order.status === "delivered" ? "Delivered" : "Order Invoice"}</div>
    </div>
    <div class="content">
      <div class="grid">
        <div class="info-box">
          <h3>Order Details</h3>
          <p><strong>#${order.orderNumber}</strong></p>
          <p>${date} at ${time}</p>
        </div>
        <div class="info-box">
          <h3>Customer</h3>
          <p><strong>${order.userName}</strong></p>
          <p>${order.userEmail}</p>
          <p>+91 ${order.userPhone}</p>
        </div>
      </div>
      <div class="info-box" style="margin-bottom:24px;">
        <h3>Delivery Address</h3>
        <p>${order.deliveryAddress.line1}${order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      <div class="totals">
        <table>
          <tr><td>Subtotal</td><td style="text-align:right;">₹${order.subtotal}</td></tr>
          <tr><td>Delivery</td><td style="text-align:right;">${order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee}`}</td></tr>
          <tr class="total-row"><td>Total</td><td style="text-align:right;">₹${order.total}</td></tr>
        </table>
      </div>
      ${order.deliveryPartner ? `
      <div class="info-box" style="margin-top:24px;">
        <h3>Delivery Partner</h3>
        <p>${order.deliveryPartner.name} · +91 ${order.deliveryPartner.phone}</p>
      </div>` : ""}
    </div>
    <div class="footer">
      <p>Thank you for shopping with ASF Shopee! For support, contact us at support@asfshopee.com</p>
    </div>
  </div>
</body>
</html>`;
}

export function downloadInvoice(order: InvoiceData) {
  const html = generateInvoice(order);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = window.open(url, "_blank");
  if (a) {
    a.onload = () => {
      a.print();
    };
  }
}
