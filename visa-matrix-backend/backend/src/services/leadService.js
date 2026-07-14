const supabase = require("../config/supabase");

class LeadService {
  async getAllLeads() {
    const { data, error } = await supabase
      .from("new_applications")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    return data;
  }

  async getLeadById(id) {
    const { data, error } = await supabase
      .from("new_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }
}

module.exports = new LeadService();