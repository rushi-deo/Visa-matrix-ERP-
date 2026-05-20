import express from "express";

const router = express.Router();

/**
 * GET /reference/:referenceNumber
 * Search application by reference number
 */
router.get("/:referenceNumber", async (req, res) => {
  try {
    const { referenceNumber } = req.params;

    if (!referenceNumber) {
      return res.status(400).json({
        success: false,
        message: "Reference number is required"
      });
    }

    return res.status(200).json({
      success: true,
      reference: referenceNumber,
      message: "Reference search working"
    });

  } catch (error) {
    console.error("Reference search error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while searching reference"
    });
  }
});

export default router;