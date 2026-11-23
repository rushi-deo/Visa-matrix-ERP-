import { DynamicVisaApplicationForm, isDynamicVisaFormConfig } from "@/components/forms/DynamicVisaApplicationForm";
import { asApiRecord, readApiString, readApiValue, type ApiRecord } from "@/lib/api-record";

interface ApplicantFormResponsesProps {
  applicant: ApiRecord;
  loading: boolean;
}

export function ApplicantFormResponses({ applicant, loading }: ApplicantFormResponsesProps) {
  if (loading) return <p className="text-sm text-muted-foreground">Loading form responses...</p>;

  const configValue = readApiValue(applicant, ["formConfig", "form_config", "form"]);
  const configRecord = asApiRecord(configValue);
  const directSchema = readApiValue(applicant, ["form_schema"]);
  const schema = isDynamicVisaFormConfig(configRecord)
    ? configRecord
    : isDynamicVisaFormConfig({ form_schema: directSchema })
      ? { form_schema: asApiRecord(directSchema) as ApiRecord }
      : null;
  const response = asApiRecord(readApiValue(applicant, ["formResponse", "form_response", "formSubmission", "form_submission", "formData", "form_data", "responses", "formValues", "form_values"]));
  const hasResponse = response !== null && Object.keys(response).length > 0;

  if (!schema || !hasResponse) return <p className="text-sm text-muted-foreground">No form responses found.</p>;

  const values = asApiRecord(readApiValue(response, ["values", "data", "responses"])) ?? response;
  return <DynamicVisaApplicationForm key={readApiString(applicant, ["id"]) ?? "application"} config={schema} countryName={readApiString(applicant, ["destinationCountry", "destination_country"]) ?? undefined} visaTypeName={readApiString(applicant, ["visaType", "visa_type"]) ?? undefined} readOnly initialValues={values} />;
}
