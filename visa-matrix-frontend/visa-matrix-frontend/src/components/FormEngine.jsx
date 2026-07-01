import { useEffect, useState } from "react";
import { getFormSchema } from "../services/formService";
import FormActions from "./forms/FormActions";
import FormField from "./forms/FormField";
import FormRow from "./forms/FormRow";
import FormSection from "./forms/FormSection";
import { Button } from "./ui/button";

export default function FormEngine({ country, visaType }) {
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function fetchFormSchema() {
      if (!country) {
        setFormSchema(null);
        setFormData({});
        return;
      }

      setLoading(true);

      const schema = await getFormSchema(country, visaType);

      if (isActive) {
        setFormSchema(schema);
        setFormData({});
        setLoading(false);
      }
    }

    fetchFormSchema();

    return () => {
      isActive = false;
    };
  }, [country, visaType]);

  function handleChange(fieldId, value) {
    setFormData((currentData) => ({
      ...currentData,
      [fieldId]: value,
    }));
  }

  if (!country) {
    return <p>Select a country</p>;
  }

  if (loading) {
    return <p>Loading form...</p>;
  }

  if (!formSchema) {
    return <p>No form found</p>;
  }

  return (
    <div className="vm-form-engine">
      {(formSchema.sections ?? []).map((section) => (
        <FormSection key={section.id} description={section.description} title={section.title}>
          <FormRow columns={section.columns ?? 2}>
            {(section.fields ?? []).map((field) => (
              <FormField
                className="vm-form-engine__field"
                description={field.description}
                error={field.error}
                helperText={field.helperText}
                id={field.id}
                key={field.id}
                label={field.label}
                name={field.id}
                onChange={(event) => {
                  const nextValue = field.type === "checkbox" ? event.target.checked : event.target.value;
                  handleChange(field.id, nextValue);
                }}
                options={field.options ?? []}
                placeholder={field.placeholder}
                required={field.required}
                rows={field.rows}
                type={field.type}
                value={formData[field.id] ?? (field.type === "checkbox" ? false : "")}
              />
            ))}
          </FormRow>
        </FormSection>
      ))}

      <FormActions align="end">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="button">Save</Button>
      </FormActions>
    </div>
  );
}
