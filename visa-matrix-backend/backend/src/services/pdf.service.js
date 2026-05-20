import { execFile } from "node:child_process";
import {
  access,
  mkdir,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildInvoiceHtml } from "../templates/invoiceTemplate.js";

const execFileAsync = promisify(execFile);
const serviceDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(serviceDirectory, "../../..");
const tempDirectory = path.resolve(serviceDirectory, "../../.pdf-temp");

const browserExecutableCandidates = [
  process.env.PDF_BROWSER_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const defaultLogoCandidates = [
  path.resolve(workspaceRoot, "frontend/src/assets/logo.jpg"),
  path.resolve(workspaceRoot, "frontend/src/assets/logo.png"),
  path.resolve(workspaceRoot, "src/assets/logo.jpg"),
  path.resolve(workspaceRoot, "src/assets/logo.png"),
];

const defaultTerms = [
  "Kindly quote the document number for all payment-related communication.",
  "Processing timelines begin once all required documents are received and verified.",
  "Government charges and statutory fees are non-refundable after submission.",
];

export const sampleInvoiceData = {
  documentType: "invoice",
  invoiceNumber: "INV-2026-0042",
  invoiceDate: "02 Apr 2026",
  dueDate: "05 Apr 2026",
  company: {
    name: "Visa Matrix",
    tagline: "Visa Processing and Travel Documentation Services",
    email: "accounts@visamatrix.com",
    phone: "+91 98765 43210",
    website: "www.visamatrix.com",
    addressLines: [
      "4th Floor, Business Avenue, MG Road",
      "Bengaluru, Karnataka 560001",
    ],
  },
  invoiceTo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+973 1234 5678",
    addressLines: ["Blue Horizon Trading", "Manama, Kingdom of Bahrain"],
  },
  items: [
    {
      no: 1,
      description: "Bahrain Tourist Visa - Normal - Single Entry",
      hsnSac: "9985",
      quantity: 1,
      price: 11500,
      total: 11500,
    },
    {
      no: 2,
      description: "Documentation and application support",
      hsnSac: "9983",
      quantity: 1,
      price: 1500,
      total: 1500,
    },
  ],
  taxes: {
    cgst: 1170,
    sgst: 1170,
    governmentFees: 2200,
  },
  paymentMethod: {
    accountName: "Visa Matrix",
    bankName: "HDFC Bank",
    accountNumber: "12345678901234",
    ifsc: "HDFC0001234",
    branch: "MG Road Branch",
  },
  grandTotal: 17370,
  thankYouMessage:
    "Thank you for choosing Visa Matrix. We appreciate the opportunity to support your travel documentation.",
  terms: defaultTerms,
  notes: "Please remit payment within the due date to avoid processing delays.",
};

const normalizeDocumentType = (value) =>
  String(value ?? "").trim().toLowerCase() === "quotation"
    ? "quotation"
    : "invoice";

const getDocumentText = (documentType) => {
  const normalizedType = normalizeDocumentType(documentType);

  return {
    slug: normalizedType,
    title: normalizedType === "quotation" ? "QUOTATION" : "INVOICE",
    label: normalizedType === "quotation" ? "Quotation" : "Invoice",
    numberPrefix: normalizedType === "quotation" ? "QUO" : "INV",
  };
};

const ensureString = (value, fallback = "") => {
  const resolvedValue = String(value ?? "").trim();
  return resolvedValue || fallback;
};

const toNumber = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value.replace(/[^0-9.-]/g, ""));

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return fallback;
};

const formatDisplayDate = (value) => {
  if (!value) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }

  if (typeof value === "string") {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const toLineArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => ensureString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const ensureFileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const getMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".svg") {
    return "image/svg+xml";
  }

  return "image/jpeg";
};

const toDataUri = async (filePath) => {
  const fileBuffer = await readFile(filePath);
  return `data:${getMimeType(filePath)};base64,${fileBuffer.toString("base64")}`;
};

const resolveLogoUrl = async (inputLogoUrl) => {
  if (ensureString(inputLogoUrl).startsWith("data:")) {
    return inputLogoUrl;
  }

  if (ensureString(inputLogoUrl).startsWith("http")) {
    return inputLogoUrl;
  }

  if (ensureString(inputLogoUrl)) {
    const logoPath = path.isAbsolute(inputLogoUrl)
      ? inputLogoUrl
      : path.resolve(workspaceRoot, inputLogoUrl);

    if (await ensureFileExists(logoPath)) {
      return toDataUri(logoPath);
    }
  }

  for (const candidate of defaultLogoCandidates) {
    if (await ensureFileExists(candidate)) {
      return toDataUri(candidate);
    }
  }

  return "";
};

const resolveBrowserExecutable = async () => {
  for (const candidate of browserExecutableCandidates) {
    if (await ensureFileExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    "No local Chrome or Edge executable was found for invoice/quotation PDF rendering.",
  );
};

const createOutputPath = (documentType) => {
  const { slug } = getDocumentText(documentType);
  return path.resolve(serviceDirectory, `../../generated-${slug}-${Date.now()}.pdf`);
};

const createTempHtmlPath = (documentType) => {
  const { slug } = getDocumentText(documentType);
  return path.resolve(tempDirectory, `${slug}-${Date.now()}-${process.pid}.html`);
};

const resolveItems = (invoiceData) => {
  if (Array.isArray(invoiceData?.items) && invoiceData.items.length > 0) {
    return invoiceData.items.map((item, index) => {
      const quantity = toNumber(item.quantity, 1);
      const price = toNumber(item.price, 0);
      const total =
        item.total !== undefined ? toNumber(item.total, price * quantity) : price * quantity;

      return {
        no: item.no ?? index + 1,
        description: ensureString(item.description, "Service item"),
        hsnSac: ensureString(item.hsnSac ?? item.hsn_sac, "-"),
        quantity,
        price,
        total,
      };
    });
  }

  const legacyTotal = toNumber(invoiceData?.total, 0);
  const descriptionBits = [
    invoiceData?.visa_type,
    invoiceData?.process_type,
    invoiceData?.entry_type,
  ]
    .map((item) => ensureString(item))
    .filter(Boolean);

  return [
    {
      no: 1,
      description:
        descriptionBits.join(" - ") ||
        ensureString(invoiceData?.description, "Visa processing services"),
      hsnSac: ensureString(invoiceData?.hsnSac ?? invoiceData?.hsn_sac, "9985"),
      quantity: toNumber(invoiceData?.quantity, 1),
      price: legacyTotal,
      total: legacyTotal,
    },
  ];
};

const resolveInvoiceTo = (invoiceData) => {
  const invoiceTo = invoiceData?.invoiceTo ?? {};
  const addressLines = [
    ...toLineArray(invoiceTo.addressLines),
    ...toLineArray(invoiceTo.company),
    ...toLineArray(invoiceData?.customer_company),
    ...toLineArray(invoiceData?.country),
  ];

  return {
    name: ensureString(
      invoiceTo.name ?? invoiceData?.customer_name ?? invoiceData?.customer,
      "Customer Name",
    ),
    email: ensureString(invoiceTo.email ?? invoiceData?.customer_email),
    phone: ensureString(invoiceTo.phone ?? invoiceData?.customer_phone),
    addressLines,
  };
};

const resolveCompany = async (invoiceData) => {
  const company = invoiceData?.company ?? {};

  return {
    name: ensureString(company.name ?? invoiceData?.company_name, "Visa Matrix"),
    tagline: ensureString(
      company.tagline,
      "Visa Processing and Travel Documentation Services",
    ),
    email: ensureString(company.email ?? invoiceData?.company_email, "accounts@visamatrix.com"),
    phone: ensureString(company.phone ?? invoiceData?.company_phone, "+91 98765 43210"),
    website: ensureString(company.website ?? invoiceData?.company_website, "www.visamatrix.com"),
    addressLines:
      toLineArray(company.addressLines).length > 0
        ? toLineArray(company.addressLines)
        : [
            "4th Floor, Business Avenue, MG Road",
            "Bengaluru, Karnataka 560001",
          ],
    footerAddress: toLineArray(company.footerAddress),
    logoUrl: await resolveLogoUrl(company.logoUrl ?? invoiceData?.logoUrl),
  };
};

const resolvePaymentMethod = (invoiceData) => {
  const paymentMethod = invoiceData?.paymentMethod ?? {};

  return {
    accountName: ensureString(
      paymentMethod.accountName ?? invoiceData?.accountName,
      "Visa Matrix",
    ),
    bankName: ensureString(paymentMethod.bankName ?? invoiceData?.bankName, "Bank Name"),
    accountNumber: ensureString(
      paymentMethod.accountNumber ?? invoiceData?.accountNumber,
      "Account Number",
    ),
    ifsc: ensureString(paymentMethod.ifsc ?? invoiceData?.ifsc, "IFSC Code"),
    branch: ensureString(paymentMethod.branch ?? invoiceData?.branch),
    upiId: ensureString(paymentMethod.upiId ?? invoiceData?.upiId),
  };
};

const resolveTaxSummary = (invoiceData) => {
  const taxes = invoiceData?.taxes ?? {};

  return {
    cgst: toNumber(taxes.cgst ?? invoiceData?.cgst, 0),
    sgst: toNumber(taxes.sgst ?? invoiceData?.sgst, 0),
    governmentFees: toNumber(
      taxes.governmentFees ?? taxes.government_fees ?? invoiceData?.governmentFees,
      0,
    ),
  };
};

const buildLegacyAwareNumber = (invoiceData, prefix) => {
  const providedNumber = ensureString(
    invoiceData?.documentNumber ??
      invoiceData?.invoiceNumber ??
      invoiceData?.invoice_no ??
      invoiceData?.invoice_number ??
      invoiceData?.quotationNumber,
  );

  if (providedNumber) {
    return providedNumber;
  }

  const compactDate = new Intl.DateTimeFormat("en-CA").format(new Date()).replaceAll("-", "");
  return `${prefix}-${compactDate}`;
};

const resolveInvoiceData = async (invoiceData) => {
  const sourceData = invoiceData ?? sampleInvoiceData;
  const documentType = normalizeDocumentType(
    sourceData.documentType ?? sourceData.type ?? sourceData.kind,
  );
  const documentText = getDocumentText(documentType);
  const items = resolveItems(sourceData);
  const taxSummary = resolveTaxSummary(sourceData);
  const itemsTotal = items.reduce((sum, item) => sum + toNumber(item.total, 0), 0);
  const grandTotal =
    sourceData.grandTotal !== undefined
      ? toNumber(sourceData.grandTotal, itemsTotal)
      : sourceData.total !== undefined
        ? toNumber(sourceData.total, itemsTotal)
        : itemsTotal + taxSummary.cgst + taxSummary.sgst + taxSummary.governmentFees;

  return {
    documentType,
    documentTitle: documentText.title,
    documentLabel: documentText.label,
    documentNumber: buildLegacyAwareNumber(sourceData, documentText.numberPrefix),
    documentDate: formatDisplayDate(
      sourceData.documentDate ?? sourceData.invoiceDate ?? sourceData.date,
    ),
    dueDate: formatDisplayDate(sourceData.dueDate ?? sourceData.validUntil ?? sourceData.date),
    currency: ensureString(sourceData.currency, "INR"),
    company: await resolveCompany(sourceData),
    invoiceTo: resolveInvoiceTo(sourceData),
    items,
    taxSummary,
    paymentMethod: resolvePaymentMethod(sourceData),
    thankYouMessage: ensureString(
      sourceData.thankYouMessage,
      "Thank you for your trust and business. We look forward to assisting you again.",
    ),
    terms:
      Array.isArray(sourceData.terms) && sourceData.terms.length > 0
        ? sourceData.terms
        : defaultTerms,
    grandTotal,
    notes: ensureString(
      sourceData.notes,
      `This ${documentType} is system generated and can be updated dynamically.`,
    ),
  };
};

const renderHtmlToPdf = async (html, outputPath, documentType) => {
  await mkdir(tempDirectory, { recursive: true });

  const browserExecutable = await resolveBrowserExecutable();
  const htmlPath = createTempHtmlPath(documentType);
  const browserProfileDirectory = path.resolve(
    tempDirectory,
    `browser-profile-${Date.now()}-${process.pid}`,
  );

  await mkdir(browserProfileDirectory, { recursive: true });
  await writeFile(htmlPath, html, "utf8");

  const fileUrl = pathToFileURL(htmlPath).href;
  const browserArgSets = [
    [
      "--headless=new",
      "--disable-gpu",
      "--allow-file-access-from-files",
      "--hide-scrollbars",
      "--run-all-compositor-stages-before-draw",
      "--print-to-pdf-no-header",
      `--user-data-dir=${browserProfileDirectory}`,
      `--print-to-pdf=${outputPath}`,
      fileUrl,
    ],
    [
      "--headless",
      "--disable-gpu",
      "--allow-file-access-from-files",
      "--hide-scrollbars",
      "--run-all-compositor-stages-before-draw",
      "--print-to-pdf-no-header",
      `--user-data-dir=${browserProfileDirectory}`,
      `--print-to-pdf=${outputPath}`,
      fileUrl,
    ],
  ];

  let lastError;

  try {
    for (const args of browserArgSets) {
      try {
        await execFileAsync(browserExecutable, args, {
          windowsHide: true,
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024,
        });

        await access(outputPath);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  } finally {
    await unlink(htmlPath).catch(() => undefined);
    await rm(browserProfileDirectory, {
      recursive: true,
      force: true,
      maxRetries: 2,
    }).catch(() => undefined);
  }
};

export const generateInvoicePdf = async (invoiceData = sampleInvoiceData) => {
  try {
    const resolvedData = await resolveInvoiceData(invoiceData);
    const outputPath = createOutputPath(resolvedData.documentType);
    const html = buildInvoiceHtml(resolvedData);

    console.log("[PDF] Starting document generation");
    console.log("[PDF] Rendering type:", resolvedData.documentType);
    console.log("[PDF] Injecting document data:", resolvedData);
    console.log("[PDF] Output path:", outputPath);

    await renderHtmlToPdf(html, outputPath, resolvedData.documentType);

    console.log("[PDF] Document generated successfully:", outputPath);

    return outputPath;
  } catch (error) {
    console.error("[PDF] Failed to generate invoice/quotation PDF:", error);
    throw error;
  }
};
