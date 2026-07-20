import { supabase } from "../config/supabaseClient.js";
import { applications as mockApplications } from "../src/data/applications.js";

const fallbackApplications = mockApplications.map((application, index) => ({
  ...application,
  organization_id: index % 2 === 0 ? "ORG-INTERNAL" : "ORG-AGENCY-1",
}));

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getApplications = async (user) => {
  try {
    let query = supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false, nullsFirst: false })
      .order("submission_date", { ascending: false, nullsFirst: false });

    if (user?.role !== "admin" && user?.organization_id) {
      query = query.eq("organization_id", user.organization_id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch (error) {
    console.error("Error in getApplications service:", error);
    console.warn("Using mock data as fallback");
    return fallbackApplications.filter(
      (application) =>
        !user || user.role === "admin" || application.organization_id === user.organization_id,
    );
  }
};

export const createApplication = async (applicationData, user) => {
  try {
    const newApplication = {
      ...applicationData,
      submission_date:
        applicationData.submission_date ||
        applicationData.submissionDate ||
        new Date().toISOString().split("T")[0],
      status: applicationData.status || "Submitted",
      stage: applicationData.stage || "Document Collection",
      organization_id: applicationData.organization_id || user?.organization_id,
    };

    if (user?.id && UUID_PATTERN.test(String(user.id))) {
      newApplication.created_by = user.id;
    }

    console.log("applicationsService insert payload:", newApplication);

    const { data, error } = await supabase
      .from("applications")
      .insert([newApplication])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createApplication service:", error.message, error.details, error.hint);
    throw error;
  }
};

export const getApplicationById = async (applicationId, user) => {
  try {
    let query = supabase.from("applications").select("*").eq("id", applicationId);

    if (user?.role !== "admin" && user?.organization_id) {
      query = query.eq("organization_id", user.organization_id);
    }

    const { data, error } = await query.single();

    if (error) {
      const application = fallbackApplications.find((app) => app.id === applicationId);
      if (!application) {
        throw new Error(`Application "${applicationId}" not found`);
      }
      return application;
    }

    return data;
  } catch (error) {
    console.error("Error in getApplicationById service:", error);
    throw error;
  }
};

export const updateApplication = async (applicationId, applicationData, user) => {
  try {
    const existingApplication = await getApplicationById(applicationId, user);

    const updatedPayload = {
      ...existingApplication,
      ...applicationData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("applications")
      .update(updatedPayload)
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateApplication service:", error);
    return {
      ...(await getApplicationById(applicationId, user)),
      ...applicationData,
      updated_at: new Date().toISOString(),
    };
  }
};
