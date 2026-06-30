import supabase from "../../config/supabase.js";
import {
  getInvoices,
  getInvoice,
  createInvoiceRecord,
  updateInvoiceRecord,
  deleteInvoiceRecord,
} from "./invoice.service.js";

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
    const invoice = await getInvoice(req.params.id);

    return res.status(200).json({
      success: true,
      data: invoice,
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

    const invoice = await createInvoiceRecord({
      customer_id,
      subtotal: amount,
      tax_amount: 0,
      total_amount: amount,
      status: status || "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await updateInvoiceRecord(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    await deleteInvoiceRecord(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Invoice Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};