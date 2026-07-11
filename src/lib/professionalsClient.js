"use client";

import { apiClient, API_ENDPOINTS } from "@/lib/api";

function withQuery(url, params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && String(v).trim() !== "") sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `${url}?${q}` : url;
}

export async function fetchProfessionals({ token, ...query }) {
  return apiClient({
    url: withQuery(API_ENDPOINTS.professionals.list, query),
    method: "GET",
    token,
  });
}

export async function fetchClientRecommendations({ token, ...query }) {
  return apiClient({
    url: withQuery(API_ENDPOINTS.client.recommendations, query),
    method: "GET",
    token,
  });
}

export async function fetchProfessionalById({ token, id }) {
  return apiClient({
    url: API_ENDPOINTS.professionals.detail(id),
    method: "GET",
    token,
  });
}

export async function submitAgentInquiryFromClient({ token, professionalId, payload }) {
  return apiClient({
    url: API_ENDPOINTS.client.agentInquiry(professionalId),
    method: "POST",
    token,
    data: payload,
  });
}

export async function uploadAgentInquiryPropertyImages({ token, files }) {
  const list = Array.from(files || []).filter(Boolean).slice(0, 8);
  if (!list.length) return { success: true, images: [] };

  const data = new FormData();
  list.forEach((file) => data.append("images", file));

  return apiClient({
    url: API_ENDPOINTS.client.agentInquiryPropertyImages,
    method: "POST",
    token,
    data,
  });
}

export async function submitLawyerInquiryFromClient({ token, professionalId, payload }) {
  return apiClient({
    url: API_ENDPOINTS.client.lawyerInquiry(professionalId),
    method: "POST",
    token,
    data: payload,
  });
}

export async function submitMortgageBrokerInquiryFromClient({ token, professionalId, payload }) {
  return apiClient({
    url: API_ENDPOINTS.client.mortgageBrokerInquiry(professionalId),
    method: "POST",
    token,
    data: payload,
  });
}
