export const applicantStatuses = [
  "Draft",
  "Submitted",
  "Under Review",
  "Correction Needed",
  "Approved",
  "Rejected",
] as const;

export type ApplicantStatus = (typeof applicantStatuses)[number];

export const statusFlow: Record<ApplicantStatus, ApplicantStatus[]> = {
  Draft: ["Submitted"],
  Submitted: ["Under Review"],
  "Under Review": ["Correction Needed"],
  "Correction Needed": ["Approved", "Rejected"],
  Approved: [],
  Rejected: [],
};

export const documentTypes = [
  "Passport",
  "Photo",
  "Bank Statement",
  "Invite Letter",
] as const;

export type DocumentType = (typeof documentTypes)[number];

export const visaTypes = [
  "Tourist",
  "Student",
  "Work",
  "Business",
  "Family",
] as const;

export const countries = [
  "India",
  "Mexico",
  "France",
  "Japan",
  "Kenya",
  "UAE",
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
] as const;
