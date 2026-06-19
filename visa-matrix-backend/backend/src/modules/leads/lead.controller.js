import { asyncHandler } from "../../core/errors.js";
import { sendSuccess, sendCreated } from "../../core/response.js";

import {
  getAllLeads,
  getLead,
  createLeadRecord,
  updateLeadRecord,
  deleteLeadRecord,
} from "./lead.service.js";

export const listLeadsController = asyncHandler(
  async (req, res) => {
    const data = await getAllLeads(req.query);
    return sendSuccess(res, data);
  }
);

export const getLeadController = asyncHandler(
  async (req, res) => {
    const data = await getLead(req.params.id);
    return sendSuccess(res, data);
  }
);

export const createLeadController = asyncHandler(
  async (req, res) => {
    const data = await createLeadRecord(req.body);
    return sendCreated(
      res,
      data,
      "Lead created successfully."
    );
  }
);

export const updateLeadController = asyncHandler(
  async (req, res) => {
    const data = await updateLeadRecord(
      req.params.id,
      req.body
    );

    return sendSuccess(res, data);
  }
);

export const deleteLeadController = asyncHandler(
  async (req, res) => {
    const data = await deleteLeadRecord(
      req.params.id
    );

    return sendSuccess(res, data);
  }
);