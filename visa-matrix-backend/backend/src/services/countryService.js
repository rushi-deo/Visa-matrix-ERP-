import {
  createRecord,
  deleteRecord,
  fetchRecordById,
  listRecords,
  updateRecord,
} from "./baseService.js";

export const listCountries = async (queryParams) => {
  return listRecords("countries", queryParams, {
    select: "*",
    entityLabel: "Countries",
  });
};

export const getCountryById = async (id) => {
  return fetchRecordById("countries", id, {
    select: "*",
    entityLabel: "Country",
  });
};

export const createCountry = async (payload) => {
  return createRecord("countries", payload, {
    select: "*",
    entityLabel: "Country",
  });
};

export const updateCountry = async (id, payload) => {
  return updateRecord("countries", id, payload, {
    select: "*",
    entityLabel: "Country",
  });
};

export const deleteCountry = async (id) => {
  const deletedCountry = await deleteRecord("countries", id, {
    select: "id",
    entityLabel: "Country",
  });

  return {
    id: deletedCountry.id,
  };
};
