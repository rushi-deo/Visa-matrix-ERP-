import { SUCCESS_PAYMENT_STATUSES } from "./adminConstants.js";

const pickFirstValue = (record, fields) => {
  if (!record) {
    return null;
  }

  for (const field of fields) {
    const value = record[field];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
};

const buildFullName = (record) => {
  if (!record) {
    return null;
  }

  const explicitName = pickFirstValue(record, [
    "name",
    "full_name",
    "client_name",
    "applicant_name",
  ]);

  if (explicitName) {
    return explicitName;
  }

  const parts = [
    record.first_name,
    record.middle_name,
    record.last_name,
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : null;
};

const getMapValue = (map, key) => {
  if (key === undefined || key === null) {
    return null;
  }

  return map.get(String(key)) || null;
};

const resolveProfile = (application, relations) => {
  return (
    getMapValue(relations.profilesById, application.profile_id) ||
    getMapValue(relations.profilesById, application.user_id) ||
    getMapValue(relations.profilesByUserId, application.user_id) ||
    getMapValue(relations.profilesByUserId, application.profile_id)
  );
};

const resolveCountry = (application, relations) => {
  return getMapValue(relations.countriesById, application.country_id);
};

const resolvePayment = (application, relations) => {
  return getMapValue(relations.paymentsByApplicationId, application.id);
};

const resolveDocuments = (application, relations) => {
  return relations.documentsByApplicationId.get(String(application.id)) || [];
};

const buildCountryName = (application, country) => {
  return (
    pickFirstValue(country, ["name", "country_name", "title"]) ||
    pickFirstValue(application, ["country_name", "country"]) ||
    null
  );
};

const buildPaymentStatus = (application, payment) => {
  return (
    pickFirstValue(payment, ["payment_status", "status"]) ||
    pickFirstValue(application, ["payment_status"]) ||
    "Pending"
  );
};

export const isPendingPaymentStatus = (paymentStatus) => {
  return !SUCCESS_PAYMENT_STATUSES.includes(
    String(paymentStatus || "").toLowerCase()
  );
};

export const formatApplicationCase = (application, relations) => {
  const profile = resolveProfile(application, relations);
  const country = resolveCountry(application, relations);
  const payment = resolvePayment(application, relations);
  const documents = resolveDocuments(application, relations);

  return {
    reference_no: application.reference_no || null,
    client_name:
      buildFullName(profile) ||
      buildFullName(application) ||
      "Unknown Applicant",
    country: buildCountryName(application, country),
    visa_type: application.visa_type || null,
    status: application.status || null,
    payment_status: buildPaymentStatus(application, payment),
    created_at: application.created_at || null,
    documents_uploaded: documents.length > 0,
    documents,
    payment: payment || {},
    profile: profile || {},
  };
};

export const formatApplicationListItem = (application, relations) => {
  const profile = resolveProfile(application, relations);
  const country = resolveCountry(application, relations);
  const payment = resolvePayment(application, relations);

  return {
    reference_no: application.reference_no || null,
    client_name:
      buildFullName(profile) ||
      buildFullName(application) ||
      "Unknown Applicant",
    country: buildCountryName(application, country),
    status: application.status || null,
    payment_status: buildPaymentStatus(application, payment),
    created_at: application.created_at || null,
  };
};

export const countApplicationsMissingDocuments = (applications, relations) => {
  return applications.filter((application) => {
    const documents = resolveDocuments(application, relations);
    return documents.length === 0;
  }).length;
};

export const countApplicationsWithPendingPayments = (applications, relations) => {
  return applications.filter((application) => {
    const payment = resolvePayment(application, relations);
    const paymentStatus = buildPaymentStatus(application, payment);
    return isPendingPaymentStatus(paymentStatus);
  }).length;
};
