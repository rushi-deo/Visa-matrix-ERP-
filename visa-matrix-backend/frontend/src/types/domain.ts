export type DashboardSummary = {
  total_applications: number;
  applications_today: number;
  pending_documents: number;
  payments_pending: number;
  visas_approved: number;
  visas_rejected: number;
};

export type ApplicationListItem = {
  id?: string;
  reference_no: string;
  client_name: string;
  country: string | null;
  visa_type?: string | null;
  status: string | null;
  payment_status?: string | null;
  created_at: string | null;
  agent?: string | null;
};

export type ApplicationDetail = ApplicationListItem & {
  documents_uploaded?: boolean;
  documents?: DocumentRecord[];
  payment?: Record<string, unknown>;
  profile?: Record<string, unknown>;
};

export type ApplicationListResponse = {
  applications: ApplicationListItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export type ApplicationCreatePayload = {
  user_id?: string;
  profile_id?: string;
  country_id: string;
  visa_type: string;
  travel_date?: string;
  status?: string;
};

export type Applicant = {
  id: string;
  name: string;
  country: string;
  visaType: string;
  status: string;
  submissionDate: string | null;
  officerAssigned: string | null;
};

export type ApplicantFilters = {
  country?: string;
  visaType?: string;
  status?: string;
};

export type CountryRecord = {
  id: string | number;
  name?: string;
  country_name?: string;
  title?: string;
  code?: string;
  region?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type VisaTypeRecord = {
  id?: string | number;
  visa_type?: string;
  name?: string;
  title?: string;
  processing_time?: string;
  [key: string]: unknown;
};

export type DocumentRecord = {
  id?: string | number;
  application_id?: string;
  document_name?: string;
  file_url?: string;
  uploaded_at?: string;
  status?: string;
  applicantId?: string;
  type?: string;
  storageUrl?: string;
  storageKey?: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  createdAt?: string;
  [key: string]: unknown;
};

export type DocumentUploadPayload = {
  applicationId: string;
  documentName: string;
  file: File;
};

export type PaymentRecord = {
  id?: string | number;
  application_id?: string;
  amount?: number;
  currency?: string;
  payment_status?: string;
  provider_ref?: string | null;
  created_at?: string;
  [key: string]: unknown;
};

export type PaymentCreatePayload = {
  application_id: string;
  amount: number;
  currency: string;
  payment_status?: string;
  provider_ref?: string;
};

export type ResourceItem = Record<string, unknown>;

export type ResourceCollection<T> = {
  items: T[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
  };
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp?: string | null;
  status?: string | null;
};

export type Notification = {
  id: string;
  applicantId: string;
  previousStatus: string;
  newStatus: string;
  message: string;
  createdAt: string;
};
