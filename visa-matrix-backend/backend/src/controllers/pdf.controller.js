import { generateInvoicePdf } from "../services/pdf.service.js";

export const downloadPdf = async (req, res) => {
  try {
    console.log("[PDF] POST /api/pdf/download-pdf requested");
    console.log("[PDF] Request body:", req.body);

    const generatedFilePath = await generateInvoicePdf(req.body);

    return res.download(generatedFilePath, (error) => {
      if (error) {
        console.error("[PDF] Failed to send dynamic invoice:", error);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Failed to download generated PDF.",
          });
        }

        return;
      }

      console.log("[PDF] Dynamic invoice download completed");
    });
  } catch (error) {
    console.error("[PDF] Controller error while generating invoice:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF.",
      error: error.message,
    });
  }
};
