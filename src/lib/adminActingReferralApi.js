import { API_ENDPOINTS, apiClient } from "@/lib/api";

function withActingUser(url, actingUserId) {
  const id = String(actingUserId || "").trim();
  if (!id) return url;
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}acting_user_id=${encodeURIComponent(id)}`;
}

/** Admin-as-professional adapters for ReferralLeadWorkspace. */
export async function adminFetchReferralLeadDetails({ token, id, actingUserId }) {
  return apiClient({
    url: withActingUser(API_ENDPOINTS.admin.referralLeadDetails(id), actingUserId),
    token,
  });
}

export async function adminProcessReferralRequest({ token, id, actingUserId }) {
  return apiClient({
    url: API_ENDPOINTS.admin.referralProcess(id),
    method: "POST",
    data: { acting_user_id: actingUserId },
    token,
  });
}

export async function adminUpdateReferral({ token, id, payload, actingUserId }) {
  return apiClient({
    url: API_ENDPOINTS.admin.referralAsProfessional(id),
    method: "PATCH",
    data: { ...(payload || {}), acting_user_id: actingUserId },
    token,
  });
}

export async function adminFetchLeadById({ token, id }) {
  return apiClient({
    url: API_ENDPOINTS.admin.leadDetail(id),
    token,
  });
}

export async function adminPatchLead({ token, id, ...payload }) {
  return apiClient({
    url: API_ENDPOINTS.admin.leadDetail(id),
    method: "PATCH",
    data: payload,
    token,
  });
}

export async function adminFetchNurtureLogs({ token, leadMatchId, page, limit }) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiClient({
    url: `${API_ENDPOINTS.admin.leadNurtureLogs(leadMatchId)}${qs ? `?${qs}` : ""}`,
    token,
  });
}

export async function adminPostNurtureDraft({ token, leadMatchId, payload }) {
  return apiClient({
    url: API_ENDPOINTS.admin.leadNurtureDraft(leadMatchId),
    method: "POST",
    data: payload,
    token,
  });
}

export async function adminPostNurtureRefine({ token, leadMatchId, payload }) {
  return apiClient({
    url: API_ENDPOINTS.admin.leadNurtureRefine(leadMatchId),
    method: "POST",
    data: payload,
    token,
  });
}

export async function adminPostNurturePreview({ token, leadMatchId, payload }) {
  return apiClient({
    url: API_ENDPOINTS.admin.leadNurturePreview(leadMatchId),
    method: "POST",
    data: payload,
    token,
  });
}

export async function adminSendNurtureEmail({ token, leadMatchId, payload }) {
  return apiClient({
    url: API_ENDPOINTS.admin.leadNurtureSend(leadMatchId),
    method: "POST",
    data: payload,
    token,
  });
}
