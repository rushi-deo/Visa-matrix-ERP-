import {
  listQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "./quotation.repository.js";
import supabase from "../../config/supabase.js";
import { createInvoiceRecord } from "../invoices/invoice.service.js";
export const getQuotations = async (query) =>
  listQuotations(query);

export const getQuotation = async (id) =>
  getQuotationById(id);

export const createQuotationRecord = async (payload) =>
  createQuotation(payload);

export const updateQuotationRecord = async (
  id,
  payload
) =>
  updateQuotation(id, payload);

export const deleteQuotationRecord = async (id) =>
  deleteQuotation(id);
export const generateInvoiceFromQuotation = async (quotationId) => {
  // 1. Fetch quotation
 const { data: quotation, error: quotationError } = await supabase
  .from("quotations")
  .select("*")
  .eq("id", quotationId)
  .single();

if (quotationError) {
  throw quotationError;
}

if (!quotation) {
  throw new Error("Quotation not found");
}

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  // 2. Fetch quotation items
  const { data: quotationItems, error: quotationItemsError } =
    await supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", quotationId);

  if (quotationItemsError) {
    throw quotationItemsError;
  }

  // 3. Create invoice
  console.log("Quotation fetched:", quotation);

console.log("Creating invoice with:", {
  customer_id: quotation.customer_id,
  subtotal: quotation.subtotal,
  tax_amount: quotation.gst_amount,
  total_amount: quotation.grand_total,
  status: "unpaid",
});
  const invoice = await createInvoiceRecord({
  customer_id: quotation.customer_id,
  subtotal: quotation.subtotal,
  tax_amount: quotation.gst_amount,
  total_amount: quotation.grand_total,
  status: "unpaid",
});

  // 4. Copy quotation items into invoice_items
  const invoiceItems = quotationItems.map((item) => ({
    invoice_id: invoice.id,
    service_id: item.service_id,
    label: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    gst_percentage: item.gst_percentage,
    amount: item.line_total,
  }));

  const { error: invoiceItemsError } = await supabase
    .from("invoice_items")
    .insert(invoiceItems);

  if (invoiceItemsError) {
    throw invoiceItemsError;
  }

  return invoice;
};