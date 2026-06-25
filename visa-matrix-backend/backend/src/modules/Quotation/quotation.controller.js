import supabase from "../../config/supabase.js";
import { getQuotations } from "./quotation.service.js";

export const listQuotations = async (req, res) => {
  try {
    const data = await getQuotations(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Quotation List Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Quotation Data:", data);

    if (error) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Quotation Detail Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createQuotation = async (req, res) => {
  try {
    const payload = req.body;

    const { data, error } = await supabase
      .from("quotations")
      .insert([payload])
      .select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error("Quotation Create Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};