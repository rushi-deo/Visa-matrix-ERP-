import { useEffect, useState } from "react";
import { getFormConfig, validateApplication } from "../services/api";

const COUNTRY_ID = "3d778394-2f16-491c-81a5-944fa92819e6";
const VISA_TYPE_ID = "9f1228b6-8a74-42af-a1cb-6eddbbe0fe28";

const fieldStyle = {
  display: "grid",
  gap: "6px",
};

const inputStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  padding: "10px 12px",
  fontSize: "14px",
};

const sectionStyle = {
  marginTop: "18px",
};

const getSchemaFields = (formSchema) => {
  return formSchema?.sections?.flatMap((section) => section.fields ?? []) ?? [];
};

const buildValidationPayload = (formSchema, formData) => {
  const payload = {
    country_id: COUNTRY_ID,
    visa_type_id: VISA_TYPE_ID,
  };

  getSchemaFields(formSchema).forEach((field) => {
    const value = formData[field.id];

    payload[field.id] =
      field.type === "number" && value !== "" ? Number(value) : value;
  });

  return payload;
};

function VisaForm() {
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadForm() {
      setFormLoading(true);
      setFormError("");

      try {
        const data = await getFormConfig(COUNTRY_ID, VISA_TYPE_ID);

        if (!isMounted) {
          return;
        }

        if (!data.success || !data.form) {
          setFormSchema(null);
          setFormError(data.message || "Form configuration is not available.");
          return;
        }

        setFormSchema(data.form);
        setFormData({});
      } catch (error) {
        if (isMounted) {
          setFormSchema(null);
          setFormError("Unable to load form configuration.");
        }
      } finally {
        if (isMounted) {
          setFormLoading(false);
        }
      }
    }

    loadForm();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const validationResult = await validateApplication(
        buildValidationPayload(formSchema, formData)
      );

      setResult(validationResult);
    } catch (error) {
      setResult({
        success: false,
        message: "Unable to validate application. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return <p style={{ padding: "24px" }}>Loading form...</p>;
  }

  if (formError) {
    return (
      <div style={{ maxWidth: "640px", padding: "24px" }}>
        <p style={{ color: "red" }}>{formError}</p>
      </div>
    );
  }

  if (!formSchema?.sections?.length) {
    return (
      <div style={{ maxWidth: "640px", padding: "24px" }}>
        <p>No form configuration found.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "640px", padding: "24px" }}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
        {formSchema.sections.map((section) => (
          <section key={section.title} style={{ display: "grid", gap: "14px" }}>
            <h3 style={{ margin: 0 }}>{section.title}</h3>

            {(section.fields ?? []).map((field) => (
              <label key={field.id} style={fieldStyle}>
                {field.label}

                {field.type === "select" ? (
                  <select
                    name={field.id}
                    value={formData[field.id] ?? ""}
                    onChange={handleChange}
                    required={Boolean(field.required)}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.id}
                    value={formData[field.id] ?? ""}
                    required={Boolean(field.required)}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                )}
              </label>
            ))}
          </section>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{
            border: 0,
            borderRadius: "6px",
            background: loading ? "#94a3b8" : "#2563eb",
            color: "#ffffff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            padding: "11px 16px",
          }}
        >
          {loading ? "Validating..." : "Validate Application"}
        </button>
      </form>

      {result && (
        <div style={sectionStyle}>
          {result.message && <p>{result.message}</p>}

          <div style={sectionStyle}>
            <h3>Errors</h3>
            {result.errors?.map((error, index) => (
              <p key={`${error}-${index}`} style={{ color: "red" }}>
                {error}
              </p>
            ))}
          </div>

          <div style={sectionStyle}>
            <h3>Warnings</h3>
            {result.warnings?.map((warning, index) => (
              <p key={`${warning}-${index}`} style={{ color: "orange" }}>
                {warning}
              </p>
            ))}
          </div>

          <div style={sectionStyle}>
            <p>Score: {result.risk_score}</p>
            <p>Status: {result.decision}</p>
            <p>Approval Probability: {result.approval_probability}%</p>
          </div>

          <div style={sectionStyle}>
            <h3>Suggestions</h3>
            {result.suggestions?.map((suggestion, index) => (
              <p key={`${suggestion}-${index}`}>{suggestion}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VisaForm;
