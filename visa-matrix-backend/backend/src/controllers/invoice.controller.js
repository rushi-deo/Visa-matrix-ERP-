import supabase from "../config/supabase.js";
import { asyncHandler, RequestValidationError } from "../core/errors.js";
import { sendCreated } from "../core/response.js";
import { createInvoice } from "../services/invoice.service.js";
import { generateInvoicePdf } from "../utils/generateInvoicePdf.js";
import { applyTenantToPayload } from "../utils/tenantSecurity.js";

export const generateInvoice = async (req, res) => {
  try {
    const { country, visaType } = req.body;

    const { data, error } = await supabase
      .from("visa_fees_import")
      .select("*")
      .eq("country_name", country)
      .eq("visa_type", visaType)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Pricing not found" });
    }

    const govtFee = Number(String(data.govt_fee ?? 0).replace(/,/g, "").trim()) || 0;
    const serviceFee = Number(String(data.service_fee ?? 0).replace(/,/g, "").trim()) || 0;
    const consultationFee = Number(data.consultation_fee ?? 0) || 0;
    const gstPercent = Number(String(data.gst_percentage ?? 0).replace(/%/g, "").trim()) || 0;

    const baseTotal = govtFee + serviceFee + consultationFee;
    const gstAmount = (baseTotal * gstPercent) / 100;
    const totalAmount = baseTotal + gstAmount;

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert([
        applyTenantToPayload({
          country,
          visa_type: visaType,
          govt_fee: govtFee,
          service_fee: serviceFee,
          consultation_fee: consultationFee,
          gst_percent: gstPercent,
          gst_amount: gstAmount,
          subtotal: baseTotal,
          tax_amount: gstAmount,
          total_amount: totalAmount,
          status: "generated",
        }, req.auth),
      ])
      .select("*")
      .single();

    if (invoiceError || !invoice) {
      console.error("Error saving invoice:", invoiceError);
      return res.status(500).json({
        error: invoiceError?.message || "Failed to save invoice",
      });
    }

    const pdf = await generateInvoicePdf(invoice);

    return res.json({
      invoice,
      totalAmount,
      pdf: pdf.filePath,
      invoiceId: invoice.id,
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const createInvoiceController = asyncHandler(async (req, res) => {
  const quotationId = String(req.body?.quotationId ?? req.body?.quotation_id ?? "").trim();

  if (!quotationId) {
    throw new RequestValidationError("quotationId is required.");
  }

  const invoice = await createInvoice(quotationId, req.auth);
  return sendCreated(res, invoice, "Invoice created successfully.");
});
