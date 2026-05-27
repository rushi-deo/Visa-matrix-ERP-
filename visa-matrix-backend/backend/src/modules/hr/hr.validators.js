import { z } from "zod";

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(200).optional(),
  search: z.string().optional(),
  department: z.string().uuid().optional(),
  status: z.string().optional(),
});

export const employeeIdParamsSchema = z.object({ id: z.string().uuid() });

export const employeeBodySchema = z
  .object({
    employee_code: z.string().optional(),
    full_name: z.string().min(2).max(200),
    email: z.string().email().optional(),
    phone: z.string().min(6).max(30).optional(),
    department_id: z.string().uuid().optional(),
    designation_id: z.string().uuid().optional(),
    status: z.string().optional(),
    date_of_joining: z.string().optional(),
    manager_id: z.string().uuid().nullable().optional(),
    emergency_contact: z.any().optional(),
    profile_image: z.string().optional(),
  })
  .passthrough();

export const departmentBodySchema = z.object({
  name: z.string().min(1).max(140),
  code: z.string().optional(),
  head_id: z.string().uuid().nullable().optional(),
});

export const departmentIdParamsSchema = z.object({ id: z.string().uuid() });

export const designationBodySchema = z.object({
  name: z.string().min(1).max(140),
  department_id: z.string().uuid().optional(),
  level: z.coerce.number().int().min(0).optional(),
});
