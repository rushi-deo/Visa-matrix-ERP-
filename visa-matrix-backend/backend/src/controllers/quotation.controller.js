import { asyncHandler } from "../core/errors.js";
import { sendCreated, sendSuccess } from "../core/response.js";
import { RequestValidationError } from "../core/errors.js";
import { generateQuotation } from "../services/quotation.service.js";

const getApplicationId = (body = {}) => {
  const applicationId = String(body.applicationId ?? body.application_id ?? "").trim();

  if (!applicationId) {
    throw new RequestValidationError("applicationId is required.");
  }

  return applicationId;
};

export const createQuotationController = asyncHandler(async (req, res) => {
  const quotation = await generateQuotation(getApplicationId(req.body));

  return sendCreated(res, quotation, "Quotation created successfully.");
});

export const getQuotationTemplateController = asyncHandler(async (_req, res) => {
  return sendSuccess(res, {
    company: {
      name: "Visa Matrix",
      logoUrl: "/logo.png",
      address: "Visa Matrix CRM, India",
      contact: "contact@visamatrix.local",
    },
    content:
      "Dear {{customerName}},\n\nThank you for choosing Visa Matrix. We are pleased to share the quotation for your {{destinationCountry}} {{visaType}} application.\n\nThis quotation is based on the details available for passport {{passportNumber}}. Fees may change if embassy requirements, appointment availability, or supporting documents change.",
    pricing: {
      visaFee: 0,
      serviceCharges: 0,
      totalAmount: 0,
    },
  });
});

export const sendQuotationController = asyncHandler(async (req, res) => {
  const applicationId = getApplicationId(req.body);
  const email = String(req.body?.email ?? "").trim();

  if (!email) {
    throw new RequestValidationError("email is required.");
  }

  console.log("Quotation email simulated", {
    application_id: applicationId,
    email,
    sent_at: new Date().toISOString(),
  });

  return sendSuccess(
    res,
    {
      application_id: applicationId,
      email,
      status: "queued",
    },
    {
      message: "Quotation sent successfully.",
    }
  );
});
