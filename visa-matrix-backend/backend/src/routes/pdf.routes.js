import { Router } from "express";
import { downloadPdf } from "../controllers/pdf.controller.js";
import { generateInvoicePdf, sampleInvoiceData } from "../services/pdf.service.js";

const router = Router();

router.get("/test-pdf", async (_req, res) => {
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

router.post("/download-pdf", downloadPdf);

export default router;
