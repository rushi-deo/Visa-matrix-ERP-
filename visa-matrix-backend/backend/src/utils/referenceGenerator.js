import { randomBytes } from "node:crypto";

const buildDateStamp = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const buildRandomSuffix = (bytes = 3) => {
  return randomBytes(bytes).toString("hex").toUpperCase();
};

export const generateInvoiceNumber = () => {
  return `INV-${buildDateStamp()}-${buildRandomSuffix()}`;
};
