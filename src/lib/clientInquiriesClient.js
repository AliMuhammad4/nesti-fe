"use client";

import { apiClient, API_ENDPOINTS } from "@/lib/api";

function withQuery(url, params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && String(value).trim() !== "") sp.set(key, String(value));
  });
  const query = sp.toString();
  return query ? `${url}?${query}` : url;
}

export async function fetchClientInquiries({ token, ...query }) {
  return apiClient({
    url: withQuery(API_ENDPOINTS.client.inquiries, query),
    method: "GET",
    token,
  });
}
