const API_BASE_URL = "http://localhost:5000/api";
const DEV_MODE = typeof import.meta !== "undefined" ? import.meta.env?.DEV : false;

const devCountries = [
  { id: "us", name: "United States", country_name: "United States", code: "US", region: "Americas" },
];

export const validateApplication = async (data) => {
  if (DEV_MODE) {
    // TODO_REMOVE_DEV_BYPASS: return a development-only safe validation result.
    return { valid: true, errors: [] };
  }

  const response = await fetch(`${API_BASE_URL}/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

export const getFormConfig = async (country_id, visa_type_id) => {
  if (DEV_MODE) {
    return {
      fields: [
        { name: "full_name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
      ],
    };
  }

  const response = await fetch(
    `${API_BASE_URL}/form-config?country_id=${country_id}&visa_type_id=${visa_type_id}`
  );

  return response.json();
};

export async function getCountries() {
  if (DEV_MODE) {
    return devCountries;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/countries`);
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && typeof payload.message === "string"
          ? payload.message
          : "Unable to fetch countries.";

      throw new Error(message);
    }

    return payload;
  } catch (error) {
    console.error("Failed to fetch countries:", error);
    throw error instanceof Error ? error : new Error("Unable to fetch countries.");
  }
}
