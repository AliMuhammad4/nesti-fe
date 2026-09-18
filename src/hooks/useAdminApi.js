"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { useAppSelector } from "@/store";

function toastError(error) {
  toast.error(error?.message || "Request failed");
}

function useAdminToken() {
  return useAppSelector((state) => state.auth.token);
}

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminOverview() {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "overview"],
    enabled: Boolean(token),
    queryFn: () => apiClient({ url: API_ENDPOINTS.admin.overview, token }),
  });
}

export function useAdminAnalytics(range = "30d") {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "analytics", range],
    enabled: Boolean(token),
    queryFn: () =>
      apiClient({
        url: `${API_ENDPOINTS.admin.analytics}${toQuery({ range })}`,
        token,
      }),
  });
}

export function useAdminSuspendUser() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      apiClient({
        url: API_ENDPOINTS.admin.suspendUser(id),
        method: "POST",
        data: { reason: reason || "" },
        token,
      }),
    onSuccess: () => {
      toast.success("User suspended");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: toastError,
  });
}

export function useAdminUnsuspendUser() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) =>
      apiClient({
        url: API_ENDPOINTS.admin.unsuspendUser(id),
        method: "POST",
        token,
      }),
    onSuccess: () => {
      toast.success("User unsuspended");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: toastError,
  });
}

export function useAdminProfessionals(params = {}) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "professionals", params],
    enabled: Boolean(token),
    queryFn: () =>
      apiClient({
        url: `${API_ENDPOINTS.admin.professionals}${toQuery(params)}`,
        token,
      }),
  });
}

export function useAdminProfessional(id) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "professional", id],
    enabled: Boolean(token && id),
    queryFn: () => apiClient({ url: API_ENDPOINTS.admin.professionalDetail(id), token }),
  });
}

export function useAdminPatchProfessional() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiClient({
        url: API_ENDPOINTS.admin.professionalDetail(id),
        method: "PATCH",
        data,
        token,
      }),
    onSuccess: () => {
      toast.success("Professional updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "professionals"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "professional"] });
    },
    onError: toastError,
  });
}

export function useAdminClients(params = {}) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "clients", params],
    enabled: Boolean(token),
    queryFn: () =>
      apiClient({
        url: `${API_ENDPOINTS.admin.clients}${toQuery(params)}`,
        token,
      }),
  });
}

export function useAdminClient(id) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "client", id],
    enabled: Boolean(token && id),
    queryFn: () => apiClient({ url: API_ENDPOINTS.admin.clientDetail(id), token }),
  });
}

export function useAdminPatchClient() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiClient({
        url: API_ENDPOINTS.admin.clientDetail(id),
        method: "PATCH",
        data,
        token,
      }),
    onSuccess: () => {
      toast.success("Client updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "client"] });
    },
    onError: toastError,
  });
}

export function useAdminLeads(params = {}) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "leads", params],
    enabled: Boolean(token),
    queryFn: () =>
      apiClient({
        url: `${API_ENDPOINTS.admin.leads}${toQuery(params)}`,
        token,
      }),
  });
}

export function useAdminLead(id) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "lead", id],
    enabled: Boolean(token && id),
    queryFn: () => apiClient({ url: API_ENDPOINTS.admin.leadDetail(id), token }),
  });
}

export function useAdminPatchLead() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiClient({
        url: API_ENDPOINTS.admin.leadDetail(id),
        method: "PATCH",
        data,
        token,
      }),
    onSuccess: () => {
      toast.success("Lead updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "lead"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: toastError,
  });
}

export function useAdminDeleteLead() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) =>
      apiClient({
        url: API_ENDPOINTS.admin.leadDetail(id),
        method: "DELETE",
        token,
      }),
    onSuccess: () => {
      toast.success("Lead deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: toastError,
  });
}

export function useAdminProperties(params = {}) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "properties", params],
    enabled: Boolean(token),
    queryFn: () =>
      apiClient({
        url: `${API_ENDPOINTS.admin.properties}${toQuery(params)}`,
        token,
      }),
  });
}

export function useAdminProperty(id) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "property", id],
    enabled: Boolean(token && id),
    queryFn: () => apiClient({ url: API_ENDPOINTS.admin.propertyDetail(id), token }),
  });
}

export function useAdminPatchProperty() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiClient({
        url: API_ENDPOINTS.admin.propertyDetail(id),
        method: "PATCH",
        data,
        token,
      }),
    onSuccess: () => {
      toast.success("Property updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "property"] });
    },
    onError: toastError,
  });
}

export function useAdminSubscriptions(params = {}) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "subscriptions", params],
    enabled: Boolean(token),
    queryFn: () =>
      apiClient({
        url: `${API_ENDPOINTS.admin.subscriptions}${toQuery(params)}`,
        token,
      }),
  });
}

export function useAdminSubscription(userId) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "subscription", userId],
    enabled: Boolean(token && userId),
    queryFn: () => apiClient({ url: API_ENDPOINTS.admin.subscriptionDetail(userId), token }),
  });
}

export function useAdminPatchSubscription() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }) =>
      apiClient({
        url: API_ENDPOINTS.admin.subscriptionDetail(userId),
        method: "PATCH",
        data,
        token,
      }),
    onSuccess: () => {
      toast.success("Subscription updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "subscription"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: toastError,
  });
}

export function useAdminReferrals(params = {}) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "referrals", params],
    enabled: Boolean(token),
    queryFn: () =>
      apiClient({
        url: `${API_ENDPOINTS.admin.referrals}${toQuery(params)}`,
        token,
      }),
  });
}

export function useAdminReferral(id) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "referral", id],
    enabled: Boolean(token && id),
    queryFn: () => apiClient({ url: API_ENDPOINTS.admin.referralDetail(id), token }),
  });
}

export function useAdminPatchReferral() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiClient({
        url: API_ENDPOINTS.admin.referralDetail(id),
        method: "PATCH",
        data,
        token,
      }),
    onSuccess: () => {
      toast.success("Referral updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "referrals"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "referral"] });
    },
    onError: toastError,
  });
}

export function useAdminVerifications(params = {}) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "verifications", params],
    enabled: Boolean(token),
    // Keep the previous page on screen while filters change so the table (and the
    // focused search input) is not torn down and remounted on every keystroke.
    placeholderData: keepPreviousData,
    queryFn: () =>
      apiClient({
        url: `${API_ENDPOINTS.admin.verifications}${toQuery(params)}`,
        token,
      }),
  });
}

export function useAdminVerification(userId) {
  const token = useAdminToken();
  return useQuery({
    queryKey: ["admin", "verification", userId],
    enabled: Boolean(token && userId),
    queryFn: () => apiClient({ url: API_ENDPOINTS.admin.verificationDetail(userId), token }),
  });
}

export function useAdminApproveVerification() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }) =>
      apiClient({
        url: API_ENDPOINTS.admin.verificationApprove(userId),
        method: "POST",
        token,
      }),
    onSuccess: () => {
      toast.success("Credentials approved — free trial started");
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "verification"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: toastError,
  });
}

export function useAdminRejectVerification() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }) =>
      apiClient({
        url: API_ENDPOINTS.admin.verificationReject(userId),
        method: "POST",
        data: { reason },
        token,
      }),
    onSuccess: () => {
      toast.success("Credentials rejected");
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "verification"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onError: toastError,
  });
}
