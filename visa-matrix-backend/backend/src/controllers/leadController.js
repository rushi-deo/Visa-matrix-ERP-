const leadService = require("../services/leadService");

class LeadController {
  async getAllLeads(req, res) {
    try {
      const leads = await leadService.getAllLeads();

      res.status(200).json({
        success: true,
        data: leads,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getLeadById(req, res) {
    try {
      const lead = await leadService.getLeadById(req.params.id);

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new LeadController();