import { Router } from "express";
import { listApplications } from "../services/applicationService.js";

const router = Router();

// Public route - NO authentication required
// This is for testing frontend-backend connection
router.get("/", async (req, res) => {
  try {
    const applications = await listApplications(req.query);
    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching public applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
});

export default router;
