import { Router } from "express";
import {
  createCustomerHandler,
  deleteCustomerHandler,
  getCustomerByIdHandler,
  getCustomers,
  updateCustomerHandler,
} from "../controllers/customerController.js";

const router = Router();

router.get("/", getCustomers);
router.get("/:id", getCustomerByIdHandler);
router.post("/", createCustomerHandler);
router.put("/:id", updateCustomerHandler);
router.delete("/:id", deleteCustomerHandler);

export default router;
