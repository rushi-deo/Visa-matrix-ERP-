import express from "express";
import supabase from "../config/supabaseClient.js";

const router = express.Router();

router.get("/:reference", async (req, res) => {
  try {

    const { reference } = req.params;

    const { data, error } = await supabase
      .from("applications")
      .select(`
        reference_no,
        applicant_name,
        visa_type,
        status,
        countries(country_name)
      `)
      .eq("reference_no", reference)
      .single();

    if (error) {
      return res.status(404).json({
        status: "error",
        message: "Application not found"
      });
    }

    res.json({
      status: "success",
      application: data
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

export default router;