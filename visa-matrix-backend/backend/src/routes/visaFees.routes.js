import { Router } from "express";
import supabase from "../config/supabase.js";

const router = Router();

router.get("/:country/:visaType", async (req, res) => {
  try {
    const { country, visaType } = req.params;

    const { data, error } = await supabase
      .from("visa_fees_import")
      .select("*")
      .eq("country_name", country)
      .eq("visa_type", visaType);

    if (error) {
      console.error("Error fetching visa fees:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (error) {
    console.error("Error fetching visa fees:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
