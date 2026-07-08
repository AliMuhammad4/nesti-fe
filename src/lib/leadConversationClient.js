import { API_ENDPOINTS, apiClient } from "@/lib/api";

/** Fetch the full lead chat transcript (no pagination cap on the server). */
export async function fetchAllLeadConversationMessages({ token, leadId }) {
  return apiClient({
    url: API_ENDPOINTS.leads.conversation(leadId),
    method: "GET",
    token,
  });
}

export async function postLeadConversationMessage({ token, leadId, body }) {
  return apiClient({
    url: `${API_ENDPOINTS.leads.conversation(leadId)}/message`,
    method: "POST",
    token,
    data: { body },
  });
}
