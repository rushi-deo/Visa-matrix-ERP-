import { requestWithFallback } from "../api/apiClient";
import { unwrapApiData } from "../api/unwrapApi";
import { EMPLOYEE_ENDPOINTS } from "../config/api";
import type {
  Employee,
  EmployeeFormOptions,
  EmployeePayload,
  HrDashboardSummary,
} from "../types/employee";

type ListParams = {
  page?: number;
  limit?: number;
  role?: string;
  department?: string;
  status?: string;
  search?: string;
};

type ListResponse = {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchEmployees(
  params: ListParams = {}
): Promise<ListResponse> {
  const response = await requestWithFallback({
    method: "GET",
    url: EMPLOYEE_ENDPOINTS.base,
    params,
  });

  const payload = response.data as Record<string, unknown>;
  const items = unwrapApiData<Employee[]>(payload);
  return {
    items,
    total: Number(payload.total ?? items.length),
    page: Number(payload.page ?? 1),
    pageSize: Number(payload.pageSize ?? items.length),
  };
}

export async function fetchEmployee(id: string): Promise<Employee> {
  const response = await requestWithFallback({
    method: "GET",
    url: `${EMPLOYEE_ENDPOINTS.base}/${id}`,
  });

  return unwrapApiData<Employee>(response.data);
}

export async function fetchEmployeeOptions(): Promise<EmployeeFormOptions> {
  const response = await requestWithFallback({
    method: "GET",
    url: EMPLOYEE_ENDPOINTS.options,
  });

  return unwrapApiData<EmployeeFormOptions>(response.data);
}

export async function fetchHrDashboard(): Promise<HrDashboardSummary> {
  const response = await requestWithFallback({
    method: "GET",
    url: EMPLOYEE_ENDPOINTS.dashboard,
  });

  return unwrapApiData<HrDashboardSummary>(response.data);
}

export async function createEmployee(
  payload: EmployeePayload & { email: string; fullName: string }
): Promise<Employee> {
  const response = await requestWithFallback({
    method: "POST",
    url: EMPLOYEE_ENDPOINTS.base,
    data: payload,
  });

  return unwrapApiData<Employee>(response.data);
}

export async function updateEmployee(
  id: string,
  payload: EmployeePayload
): Promise<Employee> {
  const response = await requestWithFallback({
    method: "PATCH",
    url: `${EMPLOYEE_ENDPOINTS.base}/${id}`,
    data: payload,
  });

  return unwrapApiData<Employee>(response.data);
}

export async function toggleEmployeeLock(
  id: string,
  isLocked: boolean
): Promise<Employee> {
  const response = await requestWithFallback({
    method: "PATCH",
    url: `${EMPLOYEE_ENDPOINTS.base}/${id}/lock`,
    data: { isLocked },
  });

  return unwrapApiData<Employee>(response.data);
}

export async function archiveEmployee(id: string): Promise<Employee> {
  const response = await requestWithFallback({
    method: "PATCH",
    url: `${EMPLOYEE_ENDPOINTS.base}/${id}/status`,
    data: { status: "inactive" },
  });

  return unwrapApiData<Employee>(response.data);
}
