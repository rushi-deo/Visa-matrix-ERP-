import apiClient, { API_ENDPOINTS, extractResponseData } from "./apiClient";

const normalizePayment = (payment = {}) => ({
  ...payment,

  invoiceId: payment.id ?? "",

  invoiceNo:
    payment.invoice_number ??
    payment.quotation_number ??
    payment.invoice_code ??
    "",

  customer:
    payment.customer ??
    payment.customer_name ??
    payment.customer_initials ??
    "",

  application:
    payment.application ??
    payment.application_id ??
    "",

  paymentStatus:
    payment.paymentStatus ??
    payment.payment_status ??
    payment.status ??
    "Pending",

  paymentMethod:
    payment.paymentMethod ??
    payment.payment_method ??
    "",

  invoiceDate:
    payment.invoiceDate ??
    payment.invoice_date ??
    payment.created_at ??
    "",

  issued:
    payment.invoiceDate ??
    payment.invoice_date ??
    payment.created_at ??
    "",

  due:
    payment.dueDate ??
    payment.due_date ??
    "",

  dueDate:
    payment.dueDate ??
    payment.due_date ??
    "",

  paidOn:
    payment.paidOn ??
    payment.paid_on ??
    null,

  amount:
    payment.amount ??
    payment.total_amount ??
    payment.subtotal ??
    0,

  status:
    payment.status ??
    payment.payment_status ??
    "Pending",
});

export async function fetchPayments() {
  try {
    const response = await apiClient.get(API_ENDPOINTS.invoices);

    const result = extractResponseData(response);

    // Backend returns:
    // {
    //   success: true,
    //   data: {
    //     items: [...]
    //   }
    // }

    const invoices = result?.items ?? [];

    return invoices.map(normalizePayment);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    throw error;
  }
}

export async function updatePaymentStatus(
  invoiceId,
  status,
  fallbackPayment,
) {
  try {
    const response = await apiClient.put(
      API_ENDPOINTS.invoiceStatus(invoiceId),
      {
        status,
      },
    );

    const payment = extractResponseData(response);

    return payment
      ? normalizePayment(payment)
      : { ...fallbackPayment, paymentStatus: status };
  } catch (error) {
    console.error(`Failed to update invoice ${invoiceId}:`, error);
    throw error;
  }
}

export async function createInvoice(data) {
  const response = await apiClient.post(
    API_ENDPOINTS.invoices,
    data,
  );

  return extractResponseData(response);
}