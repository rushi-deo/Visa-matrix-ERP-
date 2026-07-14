import {
  getQuotations,
  getQuotation,
  createQuotationRecord,
  updateQuotationRecord,
  deleteQuotationRecord,
  generateInvoiceFromQuotation,
} from "./quotation.service.js";
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
    const quotation = await getQuotation(req.params.id);

    return res.status(200).json({
      success: true,
      data: quotation,
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
    const quotation = await createQuotationRecord(req.body);

    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: quotation,
    });
  } catch (error) {
    console.error("Quotation Create Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
export const updateQuotation = async (req, res) => {
  try {
    const quotation = await updateQuotationRecord(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      data: quotation,
    });
  } catch (error) {
    console.error("Update Quotation Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteQuotation = async (req, res) => {
  try {
    await deleteQuotationRecord(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Quotation Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
export const generateInvoice = async (req, res) => {
  try {
    const invoice = await generateInvoiceFromQuotation(req.params.id);

    return res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Generate Invoice Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};