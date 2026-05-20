import { Router } from "express";
import supabase from "../config/supabase.js";

const router = Router();

router.get("/", async (_req, res) => {
  let databaseIdentity = null;

  try {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("debug_database_identity");

      if (rpcError) {
        console.warn("Database identity RPC unavailable:", rpcError.message);
      } else {
        databaseIdentity = rpcData;
      }
    } catch (rpcError) {
      console.warn("Database identity RPC skipped:", rpcError.message);
    }

    const { data, error } = await supabase
      .from("visa_fees_import")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Debug DB query error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
        databaseIdentity,
      });
    }

    return res.json({
      success: true,
      data,
      databaseIdentity,
    });
  } catch (error) {
    console.error("Debug DB route error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      databaseIdentity,
    });
  }
});

export default router;
