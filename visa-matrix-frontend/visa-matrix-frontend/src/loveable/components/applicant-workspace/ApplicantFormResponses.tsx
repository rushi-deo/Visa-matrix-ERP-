import { DynamicVisaApplicationForm } from "@/components/forms/DynamicVisaApplicationForm";

interface ApplicantFormResponsesProps {
  applicant: any;
  loading: boolean;
}

const firstValue = (source: any, keys: string[]) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key];
  }
  return null;
};

export function ApplicantFormResponses({ applicant, loading }: ApplicantFormResponsesProps) {
  if (loading) return <p className="text-sm text-muted-foreground">Loading form responses...</p>;

  const config = firstValue(applicant, ["formConfig", "form_config", "form"]);
  const response = firstValue(applicant, ["formResponse", "form_response", "formSubmission", "form_submission", "formData", "form_data", "responses", "formValues", "form_values"]);
  const schema = config?.form_schema ? config : applicant?.form_schema ? { form_schema: applicant.form_schema } : null;
  const hasResponse = response !== null && (!Array.isArray(response) || response.length > 0) && (typeof response !== "object" || Object.keys(response).length > 0);

  if (!schema || !hasResponse) return <p className="text-sm text-muted-foreground">No form responses found.</p>;

  const values = response?.values ?? response?.data ?? response?.responses ?? response;
  return <DynamicVisaApplicationForm key={applicant.id} config={schema} countryName={applicant.destinationCountry} visaTypeName={applicant.visaType} readOnly initialValues={values} />;
}
