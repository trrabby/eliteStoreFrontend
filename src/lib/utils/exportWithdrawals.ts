/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { formatBDT } from "@/lib/utils/currency";

export const exportWithdrawalsToExcel = async (
  requests: any[],
  dateFrom?: string,
  dateTo?: string,
) => {
  const now = new Date();
  const printDate = formatDateTime(now, "en");
  const dateFromFormated = dateFrom ? formatDate(dateFrom, "en") : "";
  const dateToFormated = dateTo ? formatDate(dateTo, "en") : "";

  const fileName = `withdrawals_export${
    dateFromFormated && dateToFormated
      ? `_from_${dateFromFormated}_to_${dateToFormated}`
      : dateFromFormated
      ? `_from_${dateFromFormated}`
      : dateToFormated
      ? `_to_${dateToFormated}`
      : ""
  }_printed_on_${printDate}.xlsx`;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Withdrawals");

  // Title
  const title = fileName.replace(".xlsx", "").toUpperCase();
  sheet.mergeCells("A1:L1"); // increased columns to 12
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

  // Headers (12 columns)
  const headers = [
    "SL",
    "Request ID",
    "Vendor",
    "Amount",
    "Requested Payment Method",
    "Status",
    "Requested Channel",
    "Requested At",
    "Paid On",
    "Paid Through",
    "Processing Details",
    "Cancel Reason",
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

  // Data rows
  requests.forEach((r, idx) => {
    const row = sheet.addRow([
      idx + 1,
      r.publicId || r.id,
      r.vendor?.storeName || "",
      formatBDT(r.amount),
      r.paymentMethod,
      r.status,
      r.description || "",
      formatDateTime(r.createdAt),
      r.paidOn ? formatDateTime(r.paidOn) : "",
      r.paidThrough || "",
      r.processingDetails || "",
      r.cancelReason || "",
    ]);
    row.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      const fillColor = idx % 2 === 0 ? "FFFFFFFF" : "FFF5F5F5";
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor },
      };
    });
    row.height = 22;
  });

  // Auto-fit columns
  const columnCount = headers.length;
  const maxWidths = new Array(columnCount).fill(10);
  sheet.eachRow((row) => {
    row.eachCell((cell, colIndex) => {
      const len = String(cell.value || "").length;
      maxWidths[colIndex - 1] = Math.max(maxWidths[colIndex - 1], len + 2);
    });
  });
  maxWidths.forEach((width, i) => {
    sheet.getColumn(i + 1).width = Math.min(Math.max(width, 8), 40);
  });

  // Enable filter
  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: columnCount },
  };

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName,
  );
};
