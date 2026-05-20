import {
  fetchApplicationsForReport,
  fetchPaymentsForReport,
  fetchTasksForReport,
  fetchUsersForReport,
} from "./report.repository.js";

const getApplicationStatus = (application) => {
  return application.status || application.application_status || "unknown";
};

const getPaymentStatus = (payment) => {
  return payment.payment_status || payment.status || "unknown";
};

export const getApplicationsReport = async () => {
  const applications = await fetchApplicationsForReport();

  const byStatus = applications.reduce((result, application) => {
    const key = getApplicationStatus(application);
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});

  const byCountry = applications.reduce((result, application) => {
    const key = application.country_id || "unknown";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});

  return {
    total: applications.length,
    byStatus,
    byCountry,
  };
};

export const getRevenueReport = async () => {
  const payments = await fetchPaymentsForReport();

  const totals = payments.reduce((result, payment) => {
    const currency = payment.currency || "UNKNOWN";
    const amount = Number(payment.amount || 0);

    if (!result[currency]) {
      result[currency] = {
        currency,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        failedAmount: 0,
      };
    }

    result[currency].totalAmount += amount;

    switch (getPaymentStatus(payment)) {
      case "paid":
        result[currency].paidAmount += amount;
        break;
      case "failed":
        result[currency].failedAmount += amount;
        break;
      default:
        result[currency].pendingAmount += amount;
        break;
    }

    return result;
  }, {});

  return {
    currencies: Object.values(totals),
    totalPayments: payments.length,
  };
};

export const getAgentsReport = async () => {
  const [users, tasks] = await Promise.all([
    fetchUsersForReport(),
    fetchTasksForReport(),
  ]);

  return {
    agents: users.map((user) => {
      const assignedTasks = tasks.filter((task) => {
        return String(task.assigned_to || "") === String(user.id);
      });

      const completedTasks = assignedTasks.filter((task) => {
        return ["completed", "done", "closed"].includes(
          String(task.status || "").toLowerCase()
        );
      });

      return {
        userId: user.id,
        fullName: user.full_name || user.name || user.email,
        role: user.role,
        assignedTasks: assignedTasks.length,
        completedTasks: completedTasks.length,
      };
    }),
  };
};
