// lib/utils/invoiceUtils.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatBDT } from "./currency";
import { formatDate, formatDateTime } from "./date";

const printDate = formatDateTime(new Date(), "en");

// -------------------------------------------------------------------
// Helper: generate barcode as data URL (async)
// -------------------------------------------------------------------
const generateBarcodeDataUrl = async (orderNumber: string): Promise<string> => {
  // Load JsBarcode if not already available
  if (typeof window !== "undefined" && !(window as any).JsBarcode) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  const canvas = document.createElement("canvas");
  (window as any).JsBarcode(canvas, orderNumber, {
    format: "CODE128",
    lineColor: "#1A000C",
    width: 2.5,
    height: 50,
    displayValue: true,
    fontSize: 16,
  });
  // tiny delay to ensure drawing completes
  await new Promise((resolve) => setTimeout(resolve, 10));
  return canvas.toDataURL("image/png");
};

// -------------------------------------------------------------------
// Invoice HTML generator (with barcode as image)
// -------------------------------------------------------------------
const generateInvoiceHTMLWithBarcode = async (
  order: any,
  index: number,
  totalOrders: number,
): Promise<string> => {
  const barcodeDataUrl = await generateBarcodeDataUrl(order.orderNumber);

  const firstItem = order.items?.[0];
  const vendor = firstItem?.product?.vendor;
  const vendorName = vendor?.storeName || "Elite Store";
  const supportEmail = vendor?.supportEmail || "support@elitestore.com";
  const supportPhone = vendor?.supportPhone || "+880 1234 567890";
  const returnPolicy =
    vendor?.returnPolicy || "Returns accepted within 7 days of delivery.";

  const subtotal = Number(order.subtotal);
  const shipping = Number(order.shippingFee);
  const discount = Number(order.discount);
  const tax = Number(order.tax);
  const total = Number(order.total);
  const totalDue = 0;

  const hasBilling =
    order.billingAddress && Object.keys(order.billingAddress).length > 0;

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

  const itemsRows = order.items
    ?.map((item: any, idx: number) => {
      const discountPercent =
        item.snapshot?.discountType === "PERCENTAGE"
          ? item.snapshot.discountValue
          : 0;
      const rowBg = idx % 2 === 0 ? "#ffedfa" : "white";
      return `
  <tr style="
    background-color: ${rowBg};
    border: 1px solid #e5e7eb;
  ">
    
    <td style="
      padding: 8px 5px;
      border: 1px solid #e5e7eb;
    ">
      ${item.product?.name}<br>
      <small style="color: #6b7280;">
        ${item.variant?.name || "Default"} | SKU: ${item.variant?.sku || "—"}
      </small>
    </td>

    <td style="
      padding: 8px 5px;
      text-align: center;
      border: 1px solid #e5e7eb;
    ">
      ${item.quantity}
    </td>

    <td style="
      padding: 8px 5px;
      text-align: right;
      border: 1px solid #e5e7eb;
    ">
      ${formatBDT(Number(item.unitPrice))}
    </td>

    <td style="
      padding: 8px 5px;
      text-align: center;
      color: #ff3e9b;
      border: 1px solid #e5e7eb;
    ">
      ${discountPercent > 0 ? `${discountPercent}%` : "-"}
    </td>

    <td style="
      padding: 8px 5px;
      text-align: right;
      border: 1px solid #e5e7eb;
    ">
      ${formatBDT(Number(item.totalPrice))}
    </td>

  </tr>
`;
    })
    .join("");

  return `
    <div style="page-break-after: ${
      index < totalOrders - 1 ? "always" : "auto"
    };">
      <div style="max-width: 900px; margin: 0 auto; padding: 25px 20px; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: white; color: #1f2937;">
        
        <!-- Header with barcode image -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #ff3e9b, #d4006f); -webkit-background-clip: text; background-clip: text; color: transparent;">
              Elite Store
            </div>
            <div style="font-size: 12px; color: #6b7280;">We ensure quality along with elegance</div>
          </div>
          <div style="text-align: right;">
            <img src="${barcodeDataUrl}" style="width: 250px; height: 50px; margin-bottom: 5px;" />
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
            <tr style="background-color: #ff88ba;">
              <th style="padding: 10px 5px; text-align: left; font-size: 13px; color: white;">Product Description</th>
              <th style="padding: 10px 5px; text-align: center; font-size: 13px; color: white;">Quantity</th>
              <th style="padding: 10px 5px; text-align: right; font-size: 13px; color: white;">Unit Price</th>
              <th style="padding: 10px 5px; text-align: center; font-size: 13px; color: white;">Discount</th>
              <th style="padding: 10px 5px; text-align: right; font-size: 13px; color: white;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <!-- Totals panel -->
        <div style="display: flex; justify-content: flex-end; margin: 15px 0 25px;">
          <div style="width: 280px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Subtotal</span><span>${formatBDT(
              subtotal,
            )}</span></div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Shipping</span><span>${formatBDT(
              shipping,
            )}</span></div>
            ${
              discount > 0
                ? `<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Order Discount</span><span style="color: #ff3e9b;">-${formatBDT(
                    discount,
                  )}</span></div>`
                : ""
            }
            ${
              tax > 0
                ? `<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Tax</span><span>${formatBDT(
                    tax,
                  )}</span></div>`
                : ""
            }
            <div style="border-top: 1px solid #e5e7eb; margin-top: 4px; padding-top: 8px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>Total Amount Paid</span><span style="color: #d4006f;">${formatBDT(
                total,
              )}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>Total Due</span><span>${formatBDT(
                totalDue,
              )}</span></div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="font-size: 11px; color: #4b5563; border-top: 1px solid #ffedfa; padding-top: 16px;">
          <div style="display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
            <div>
              <strong style="color: #d4006f;">${vendorName}</strong><br>
              <span>${supportEmail}</span><br>
              <span>${supportPhone}</span>
            </div>
            <div style="flex: 1;">
              <strong style="color: #d4006f;">Return Policy</strong><br>
              <span style="font-size: 10px;">${returnPolicy}</span>
            </div>
          </div>
          <div style="text-align: center; margin-top: 12px;">Thank you for shopping with us!</div>
        </div>
      </div>
    </div>
  `;
};

// -------------------------------------------------------------------
// Print invoices (opens print dialog)
// -------------------------------------------------------------------
export const printInvoices = async (orders: any[]) => {
  if (!orders.length) return;
  const printDate = formatDateTime(new Date(), "en");
  const invoicesHtml = await Promise.all(
    orders.map((order, idx) =>
      generateInvoiceHTMLWithBarcode(order, idx, orders.length),
    ),
  );
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print invoices");
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoices - ${printDate}</title>
        <style>
          @media print { body { margin: 0; padding: 0; } }
          body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: white; }
          @page { size: A4; margin: 1.5cm; }
        </style>
      </head>
      <body>${invoicesHtml.join("")}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
  printWindow.onafterprint = () => printWindow.close();
};

// -------------------------------------------------------------------
// 3. Export to Excel
// -------------------------------------------------------------------
export const exportToExcel = async (
  orders: any[],
  dateFrom?: string,
  dateTo?: string,
) => {
  const dateFromFormated = dateFrom ? formatDate(dateFrom, "en") : "";
  const dateToFormated = dateTo ? formatDate(dateTo, "en") : "";

  const fileName = `orders_export${
    dateFromFormated && dateToFormated
      ? `_from_${dateFromFormated}_to_${dateToFormated}`
      : dateFromFormated
      ? `_from_${dateFromFormated}`
      : dateToFormated
      ? `_to_${dateToFormated}`
      : ""
  }_printed_on_${printDate}.xlsx`;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Orders");

  // =========================
  // TITLE (CAPITALIZED)
  // =========================
  const title = fileName.replace(".xlsx", "").toUpperCase();

  sheet.mergeCells("A1:V1");
  const titleCell = sheet.getCell("A1");

  titleCell.value = title;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEDFA" },
  };

  sheet.getRow(1).height = 28;

  // =========================
  // HEADERS
  // =========================
  const headers = [
    "SL",
    "Order Number",
    "Order Date",
    "Order Status",
    "Payment Method",
    "Payment Status",
    "Product Name",
    "Variant",
    "SKU",
    "Quantity",
    "Unit Price",
    "Total Price",
    "Subtotal",
    "Shipping Fee",
    "Discount",
    "Tax",
    "Grand Total",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Shipping Address",
  ];

  const headerRow = sheet.addRow(headers);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3E9B" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  sheet.getRow(2).height = 22;

  // =========================
  // MERGE CONFIG
  // =========================
  const mergeColumns = [
    1, // Order Number
    2, // Order Date
    3, // Order Status
    4, // Payment Method
    5, // Payment Status
    12, // Subtotal
    13, // Shipping Fee
    14, // Discount
    15, // Tax
    16, // Grand Total
    17, // Customer Name
    18, // Customer Email
    19, // Customer Phone
    20, // Shipping Address
  ];

  let rowIndex = 3;
  let serial = 1;

  // =========================
  // DATA
  // =========================
  orders.forEach((order) => {
    const startRow = rowIndex;
    const itemCount = order.items.length;

    order.items.forEach((item: any, idx: number) => {
      const rowColor =
        idx % 4 === 0
          ? "FFEDFA"
          : idx % 4 === 1
          ? "FFBCEC"
          : idx % 4 === 2
          ? "FFE6F2"
          : "FFEDFA";

      const row = sheet.addRow([
        serial,
        order.orderNumber,
        formatDate(order.createdAt),
        order.status,
        order.payment?.method?.replace(/_/g, " "),
        order.payment?.status,

        item.product?.name,
        item.variant?.name,
        item.variant?.sku,
        item.quantity,
        Number(item.unitPrice),
        Number(item.totalPrice),

        Number(order.subtotal),
        Number(order.shippingFee),
        Number(order.discount),
        Number(order.tax),
        Number(order.total),

        `${order.user?.accountInfo?.firstName || ""} ${
          order.user?.accountInfo?.lastName || ""
        }`.trim(),

        order.user?.email,
        order.user?.phone,

        [
          order.shippingAddress?.addressLine1,
          order.shippingAddress?.city_district,
          order.shippingAddress?.postalCode,
          order.shippingAddress?.country,
        ]
          .filter(Boolean)
          .join(", "),
      ]);

      // Style each cell
      row.eachCell((cell) => {
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowColor },
        };
      });

      row.height = 22; // fixed height (can be made auto by removing this line)
      rowIndex++;
    });

    const endRow = rowIndex - 1;

    // Merge cells for repeated order data
    if (itemCount > 1) {
      const allMergeCols = [0, ...mergeColumns]; // include SL column (index 0)
      allMergeCols.forEach((col) => {
        sheet.mergeCells(startRow, col + 1, endRow, col + 1);
      });
    }

    serial++;
  });

  // =========================
  // AUTO‑FIT COLUMN WIDTHS
  // =========================
  const columnCount = headers.length;
  const maxWidthPerColumn: number[] = new Array(columnCount).fill(0);

  // Helper to get string length (wide characters count as 2)
  const getStringWidth = (text: string | number | null | undefined): number => {
    if (text === null || text === undefined) return 0;
    const str = String(text);
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code > 0x4e00 && code < 0x9fff) {
        width += 2; // Chinese/Japanese/Korean characters are wider
      } else {
        width += 1;
      }
    }
    return width;
  };

  // Measure header widths
  headers.forEach((header, colIdx) => {
    const headerWidth = getStringWidth(header);
    maxWidthPerColumn[colIdx] = Math.max(
      maxWidthPerColumn[colIdx],
      headerWidth,
    );
  });

  // Measure all data rows
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip title row
    row.eachCell((cell, colNumber) => {
      const cellValue = cell.value;
      let text = "";
      if (cellValue && typeof cellValue === "object") {
        if ("richText" in cellValue) {
          text = cellValue.richText?.map((t: any) => t.text).join("") || "";
        } else if ("text" in cellValue) {
          text = cellValue.text || "";
        } else if ("result" in cellValue) {
          text = String(cellValue.result);
        } else {
          text = JSON.stringify(cellValue);
        }
      } else {
        text = String(cellValue ?? "");
      }
      const width = getStringWidth(text);
      const colIndex = colNumber - 1;
      if (colIndex < maxWidthPerColumn.length) {
        maxWidthPerColumn[colIndex] = Math.max(
          maxWidthPerColumn[colIndex],
          width,
        );
      }
    });
  });

  // Set column widths (minimum 8, maximum 50)
  const minWidth = 8;
  const maxWidth = 50;
  for (let i = 0; i < columnCount; i++) {
    let width = maxWidthPerColumn[i] + 2; // add padding
    width = Math.min(Math.max(width, minWidth), maxWidth);
    sheet.getColumn(i + 1).width = width;
  }

  // =========================
  // ENABLE AUTOFILTER (headers on row 2)
  // =========================
  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: columnCount },
  };

  // =========================
  // EXPORT
  // =========================
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName,
  );
};
