interface OrderItem {
  id: number;
  productName: string;
  variantInfo: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceData {
  id: number;
  code: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  createdAt: string;
}

export const printInvoice = (order: InvoiceData) => {
  const formatPrice = (price: number) =>
    price.toLocaleString('vi-VN') + ' ₫';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const itemRows = order.items
    .map(
      (item, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>
          <strong>${item.productName}</strong>
          ${item.variantInfo ? `<br/><span style="color:#666;font-size:12px">${item.variantInfo}</span>` : ''}
        </td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${formatPrice(item.unitPrice)}</td>
        <td style="text-align:right">${formatPrice(item.totalPrice)}</td>
      </tr>`
    )
    .join('');

  const finalAmount = order.totalAmount - (order.discountAmount || 0);

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Hoá đơn #${order.code}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 32px; color: #333; background: #fff; }
        .invoice { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #0052D9; }
        .header h1 { font-size: 28px; color: #0052D9; margin-bottom: 4px; }
        .header h2 { font-size: 18px; font-weight: normal; color: #666; }
        .store-info { text-align: center; font-size: 13px; color: #666; margin-top: 8px; }
        .info-section { display: flex; justify-content: space-between; margin: 20px 0; gap: 24px; }
        .info-block { flex: 1; }
        .info-block h3 { font-size: 14px; color: #0052D9; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e8e8e8; padding-bottom: 4px; }
        .info-block p { font-size: 13px; line-height: 1.8; }
        .info-block strong { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        thead th { background: #0052D9; color: #fff; padding: 10px 8px; font-size: 13px; text-align: left; }
        tbody td { padding: 10px 8px; border-bottom: 1px solid #e8e8e8; font-size: 13px; }
        tbody tr:hover { background: #f9f9f9; }
        .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
        .totals table { width: 320px; }
        .totals td { padding: 6px 8px; font-size: 14px; border: none; }
        .totals .final { font-size: 18px; font-weight: bold; color: #0052D9; border-top: 2px solid #0052D9; }
        .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8e8e8; }
        .footer p { font-size: 13px; color: #666; }
        .footer .thanks { font-size: 16px; font-weight: bold; color: #0052D9; margin-bottom: 8px; }
        @media print {
          body { padding: 0; }
          @page { margin: 15mm; }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <h1>S-SHOP ONLINE</h1>
          <h2>HOÁ ĐƠN BÁN HÀNG</h2>
          <div class="store-info">
            <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM | SĐT: 0123 456 789</p>
          </div>
        </div>

        <div class="info-section">
          <div class="info-block">
            <h3>Thông tin đơn hàng</h3>
            <p><strong>Mã hoá đơn:</strong> ${order.code}</p>
            <p><strong>Ngày tạo:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Thanh toán:</strong> ${order.paymentMethod || 'COD'}</p>
          </div>
          <div class="info-block">
            <h3>Thông tin khách hàng</h3>
            <p><strong>Họ tên:</strong> ${order.customerName || '—'}</p>
            <p><strong>SĐT:</strong> ${order.customerPhone || '—'}</p>
            <p><strong>Địa chỉ:</strong> ${order.shippingAddress || '—'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:50px;text-align:center">STT</th>
              <th>Sản phẩm</th>
              <th style="width:60px;text-align:center">SL</th>
              <th style="width:130px;text-align:right">Đơn giá</th>
              <th style="width:130px;text-align:right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Tổng cộng:</td>
              <td style="text-align:right">${formatPrice(order.totalAmount)}</td>
            </tr>
            <tr>
              <td>Giảm giá:</td>
              <td style="text-align:right">${formatPrice(order.discountAmount || 0)}</td>
            </tr>
            <tr class="final">
              <td>Thanh toán:</td>
              <td style="text-align:right">${formatPrice(finalAmount)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p class="thanks">Cảm ơn quý khách đã mua hàng!</p>
          <p>Mọi thắc mắc xin vui lòng liên hệ hotline: 0123 456 789</p>
          <p>Website: www.s-shop.vn</p>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};
