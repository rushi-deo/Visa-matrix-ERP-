import supabase from "../../config/supabase.js";
import { getInvoices } from "./invoice.service.js";

export const listInvoices = async (req, res) => {
  try {
    const data = await getInvoices(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Invoice List Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Invoice Data:", data);

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
    console.error("Invoice Detail Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { customer_id, amount, status } = req.body;

    console.log("Incoming invoice payload:", req.body);

    if (!customer_id || !amount) {
      return res.status(400).json({
        success: false,
        error: "customer_id and amount are required",
      });
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          customer_id,
          subtotal: amount,
          tax_amount: 0,
          total_amount: amount,
          status: status || "pending",
        },
      ])
      .select("*");

    if (error) {
      console.error("Supabase Insert Error:", error);

      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    console.log("Inserted invoice:", data);

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Server Error:", err);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};