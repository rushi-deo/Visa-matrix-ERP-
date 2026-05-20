import applicationsService from './applications.service.js';

const getApplications = async (_req, res) => {
  try {
    const data = await applicationsService.getApplications();

    const formattedData = (data || []).map((app) => ({
      ...app,
      customer_name: app.customers?.name || null,
      email: app.customers?.email || null,
      country: app.countries?.name || null,
      visa_type: app.visa_types?.name || null,
      assigned_agent: app.assigned_agent || null
    }));

    return res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      details: error
    });
  }
};

export default {
  getApplications
};
