import { Router } from "express";
import env from "../config/env.js";
import { authenticateUser } from "../middleware/auth.js";
import { downloadPdf } from "../controllers/pdf.controller.js";
import { generateInvoicePdf, sampleInvoiceData } from "../services/pdf.service.js";

const router = Router();

router.get("/test-pdf", async (_req, res) => {
  if (env.isProduction) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  try {
    console.log("[PDF] GET /api/pdf/test-pdf requested");

    const generatedFilePath = await generateInvoicePdf(sampleInvoiceData);

    return res.download(generatedFilePath, "generated-invoice.pdf", (error) => {
      if (error) {
        console.error("[PDF] Failed to send generated invoice:", error);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Failed to download generated PDF.",
          });
        }

        return;
      }

      console.log("[PDF] Generated invoice download completed");
    });
  } catch (error) {
    console.error("[PDF] Route error while generating invoice:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF.",
      error: error.message,
    });
  }
});

router.post(
  "/download-pdf",
  authenticateUser,
  downloadPdf,
);

export default router;
