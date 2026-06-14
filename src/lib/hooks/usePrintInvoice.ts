/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/usePrintInvoice.ts
import { formatBDT } from "@/lib/utils/currency";

export const usePrintInvoice = () => {
  const formatAddress = (addr: any) => {
    if (!addr) return "N/A";
    const lines = [
      addr.fullName,
      addr.addressLine1,
      addr.addressLine2,
      `${addr.city_district || ""} ${addr.postalCode || ""}`.trim(),
      addr.country,
      addr.phone ? `Phone: ${addr.phone}` : "",
    ].filter(Boolean);
    return lines.join("<br>");
  };

  const generateInvoiceHTML = (
    order: any,
    index: number,
    totalOrders: number,
  ) => {
    // console.log(order);
    // Extract vendor info from first item (all should be same vendor)
    const firstItem = order.items?.[0];
    const vendor = firstItem?.product?.vendor;
    const vendorName = vendor?.storeName || "Elite Store";
    const supportEmail = vendor?.supportEmail || "support@elitestore.com";
    const supportPhone = vendor?.supportPhone || "+880 1234 567890";
    const returnPolicy =
      `${vendor?.returnPolicy} </br> If you find any abnormality you can request for return.` ||
      "Returns accepted within 3 days of delivery. Please contact support for assistance. If you find any abnormality you can request for return.";
    const rating = vendor?.rating;

    const subtotal = Number(order.subtotal);
    const shipping = Number(order.shippingFee);
    const discount = Number(order.discount); // order-level discount (coupon etc.)
    const tax = Number(order.tax);
    const total = Number(order.total);
    const totalDue = 0; // assume fully paid

    // Billing address handling
    const hasBilling =
      order.billingAddress && Object.keys(order.billingAddress).length > 0;

    // Alternate row shading
    const itemsRows = order.items
      ?.map((item: any, idx: number) => {
        const discountPercent =
          item.snapshot?.discountType === "PERCENTAGE"
            ? item.snapshot.discountValue
            : 0;
        const itemTotal = Number(item.totalPrice);
        const unitPrice = Number(item.unitPrice);
        const discountColumn =
          discountPercent > 0 ? `${discountPercent}%` : "-";
        const rowBg = idx % 2 === 0 ? "#ffedfa" : "white";
        return `
        <tr style="border-bottom: 1px solid #e5e7eb; background-color: ${rowBg};">
          <td style="padding: 8px 5px;">
            ${item.product?.name}<br>
            <small style="color: #6b7280;">${
              item.variant?.name || "Default"
            } | SKU: ${item.variant?.sku || "—"}</small>
          </td>
          <td style="padding: 8px 5px; text-align: center;">${
            item.quantity
          }</td>
          <td style="padding: 8px 5px; text-align: right;">${formatBDT(
            unitPrice,
          )}</td>
          <td style="padding: 8px 5px; text-align: center; color: #ff3e9b;">${discountColumn}</td>
          <td style="padding: 8px 5px; text-align: right;">${formatBDT(
            itemTotal,
          )}</td>
        </tr>
      `;
      })
      .join("");

    return `
      <div style="page-break-after: ${
        index < totalOrders - 1 ? "always" : "auto"
      };">
        <div style="max-width: 900px; margin: 0 auto; padding: 25px 20px; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: white; color: #1f2937;">
          
          <!-- Header with barcode, invoice number, and payment method -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div>
              <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #ff3e9b, #d4006f); -webkit-background-clip: text; background-clip: text; color: transparent;">
                Elite Store
              </div>
              <div style="font-size: 12px; color: #6b7280;">We ensure quality alogn with elegance</div>
            </div>
            <div style="text-align: right;">
              <canvas id="barcode-${
                order.id
              }" style="width: 350px; height: 60px; margin-bottom: 5px;"></canvas>
              <div style="font-size: 12px; font-weight: 500; color: #6b7280;">Invoice #${order.orderNumber.slice(
                -8,
              )}</div>
              <div style="font-size: 20px; font-weight: bold; color: #d4006f; margin-top: 6px;">
                ${order.payment?.method?.replace(/_/g, " ") || "N/A"}
              </div>
            </div>
          </div>

          <!-- Addresses -->
          <div style="display: flex; gap: 30px; margin-bottom: 25px; background: #ffedfa; border-radius: 12px; padding: 12px 16px;">
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 6px; color: #d4006f;">
                ${hasBilling ? "BILLING ADDRESS" : "SHIPPING & BILLING ADDRESS"}
              </div>
              <div style="font-size: 13px; line-height: 1.5;">${formatAddress(
                order.shippingAddress,
              )}</div>
            </div>
            ${
              hasBilling
                ? `
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 6px; color: #d4006f;">SHIPPING ADDRESS</div>
              <div style="font-size: 13px; line-height: 1.5;">${formatAddress(
                order.shippingAddress,
              )}</div>
            </div>
            `
                : ""
            }
          </div>

          <!-- Items table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #ff88ba; border-bottom: 2px solid #ff3e9b;">
                <th style="padding: 10px 5px; text-align: left; font-size: 13px; color: white;">Product Description</th>
                <th style="padding: 10px 5px; text-align: center; font-size: 13px; color: white;">Quantity</th>
                <th style="padding: 10px 5px; text-align: right; font-size: 13px; color: white;">Unit Price</th>
                <th style="padding: 10px 5px; text-align: center; font-size: 13px; color: white;">Discount</th>
                <th style="padding: 10px 5px; text-align: right; font-size: 13px; color: white;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Totals panel -->
          <div style="display: flex; justify-content: flex-end; margin: 15px 0 25px;">
            <div style="width: 280px;">
              <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                <span style="font-weight: 500;">Subtotal</span>
                <span>${formatBDT(subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                <span style="font-weight: 500;">Shipping</span>
                <span>${formatBDT(shipping)}</span>
              </div>
              ${
                discount > 0
                  ? `
              <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                <span style="font-weight: 500;">Order Discount</span>
                <span style="color: #ff3e9b;">-${formatBDT(discount)}</span>
              </div>
              `
                  : ""
              }
              ${
                tax > 0
                  ? `
              <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                <span style="font-weight: 500;">Tax</span>
                <span>${formatBDT(tax)}</span>
              </div>
              `
                  : ""
              }
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #e5e7eb; margin-top: 4px;">
                <span style="font-weight: 500;">Total Amount Paid</span>
                <span style="font-weight: bold; color: #d4006f;">${formatBDT(
                  total,
                )}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                <span style="font-weight: 500;">Total Due</span>
                <span>${formatBDT(totalDue)}</span>
              </div>
            </div>
          </div>

          <!-- Footer: Vendor info, return policy, and support -->
          <div style="font-size: 11px; color: #4b5563; border-top: 1px solid #ffedfa; padding-top: 16px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
              <div>
                <strong style="color: #d4006f;">${vendorName}</strong><br>
                <span>${supportEmail}</span><br>
                <span>${supportPhone}</span><br>
                <span>${rating > 0 ? `${rating} ★ Vendor` : ""}</span>
                
              </div>
              <div style="flex: 1;">
                <strong style="color: #d4006f;">Return Policy</strong><br>
                <span style="font-size: 10px;">${returnPolicy}</span>
              </div>
            </div>
            <div style="text-align: center; margin-top: 12px;">
              <p style="margin: 0;">Thank you for shopping with us!</p>
            </div>
          </div>

        </div>
      </div>
    `;
  };

  const printInvoices = (orders: any[]) => {
    if (!orders.length) return;

    const invoicesHtml = orders
      .map((order, idx) => generateInvoiceHTML(order, idx, orders.length))
      .join("");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print invoices");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoices for Selected Orders</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
            }
            body {
              font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            @page {
              size: A4;
              margin: 1.5cm;
            }
          </style>
        </head>
        <body>
          ${invoicesHtml}
          <script>
            window.onload = function() {
              ${orders
                .map(
                  (order) => `
                JsBarcode("#barcode-${order.id}", "${order.orderNumber}", {
                  format: "CODE128",
                  lineColor: "#000",
                  width: 1.5,
                  height: 40,
                  displayValue: true,
                  fontSize: 12
                });
              `,
                )
                .join("")}
              window.print();
              window.onafterprint = () => window.close();
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return { printInvoices };
};
