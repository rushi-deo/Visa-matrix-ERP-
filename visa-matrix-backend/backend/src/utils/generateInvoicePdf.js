import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const utilsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.resolve(utilsDirectory, "../../generated-invoices");

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0) || 0);

const writeLineItem = (doc, label, value) => {
  doc.font("Helvetica-Bold").text(`${label}:`, 60, doc.y, { continued: true });
  doc.font("Helvetica").text(` ${value}`);
  doc.moveDown(0.5);
};

export const generateInvoicePdf = async (invoice) => {
  await mkdir(outputDirectory, { recursive: true });

  const filePath = path.join(outputDirectory, `invoice-${invoice.id}.pdf`);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = createWriteStream(filePath);

    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);

    doc.fontSize(20).font("Helvetica-Bold").text("Visa Matrix Invoice", {
      align: "center",
    });

    doc.moveDown();
    doc.fontSize(12).font("Helvetica");
    writeLineItem(doc, "Invoice ID", invoice.id);
    writeLineItem(doc, "Country", invoice.country);
    writeLineItem(doc, "Visa Type", invoice.visa_type);

    doc.moveDown();
    doc.font("Helvetica-Bold").fontSize(14).text("Fee Breakdown");
    doc.moveDown(0.75);

    writeLineItem(doc, "Government Fee", formatCurrency(invoice.govt_fee));
    writeLineItem(doc, "Service Fee", formatCurrency(invoice.service_fee));
    writeLineItem(doc, "Consultation Fee", formatCurrency(invoice.consultation_fee));
    writeLineItem(doc, "GST Percent", `${Number(invoice.gst_percent ?? 0) || 0}%`);
    writeLineItem(doc, "GST Amount", formatCurrency(invoice.gst_amount));

    doc.moveDown();
    doc.fontSize(16).font("Helvetica-Bold").text(
      `Total: ${formatCurrency(invoice.total_amount)}`,
      { align: "right" },
    );

    doc.moveDown(2);
    doc.fontSize(10).font("Helvetica").text(
      `Generated on ${new Date(invoice.created_at ?? Date.now()).toLocaleString("en-IN")}`,
      { align: "left" },
    );

    doc.end();
  });

  return {
    filePath,
  };
};
