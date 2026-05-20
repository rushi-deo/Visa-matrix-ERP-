import {
  createRecord,
  deleteRecord,
  fetchRecordById,
  listRecords,
  updateRecord,
} from "./baseService.js";

export const listVisaTypes = async (queryParams) => {
  return listRecords("visa_types", queryParams, {
    select: "*",
    entityLabel: "Visa types",
  });
};

export const getVisaTypeById = async (id) => {
  return fetchRecordById("visa_types", id, {
    select: "*",
    entityLabel: "Visa type",
  });
};

export const createVisaType = async (payload) => {
  return createRecord("visa_types", payload, {
    select: "*",
    entityLabel: "Visa type",
  });
};

export const updateVisaType = async (id, payload) => {
  return updateRecord("visa_types", id, payload, {
    select: "*",
    entityLabel: "Visa type",
  });
};

export const deleteVisaType = async (id) => {
  const deletedVisaType = await deleteRecord("visa_types", id, {
    select: "id",
    entityLabel: "Visa type",
  });

  return {
    id: deletedVisaType.id,
  };
};
