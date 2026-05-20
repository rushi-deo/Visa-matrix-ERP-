const API_BASE_URL = "http://localhost:5000/api";

export const validateApplication = async (data) => {
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
  const response = await fetch(
    `${API_BASE_URL}/form-config?country_id=${country_id}&visa_type_id=${visa_type_id}`
  );

  return response.json();
};

export async function getCountries() {
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
