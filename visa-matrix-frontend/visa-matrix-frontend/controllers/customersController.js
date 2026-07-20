import {
  createCustomer,
  getCustomerById,
  getCustomers,
} from "../services/customersService.js";

const REQUIRED_FIELDS = [
  "full_name",
  "email",
  "phone",
  "passport_number",
];

export const getCustomersHandler = async (req, res) => {
  try {
    const customers = await getCustomers(req.user);

    return res.status(200).json({
      success: true,
      data: customers,
      count: customers.length,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch customers",
      message: error.message,
    });
  }
};

export const getCustomerHandler = async (req, res) => {
  try {
    const customer = await getCustomerById(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return res.status(404).json({
      success: false,
      error: "Customer not found",
      message: error.message,
    });
  }
};

export const createCustomerHandler = async (req, res) => {
  try {
    console.log("createCustomerHandler req.body:", req.body);
    const customerData = req.body;
    const missingFields = REQUIRED_FIELDS.filter((field) => !customerData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        missingFields,
      });
    }

    const customer = await createCustomer(customerData, req.user);

    return res.status(201).json({
      success: true,
      data: customer,
      message: "Customer created successfully",
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create customer",
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }
};
