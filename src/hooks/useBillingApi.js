"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { mapApiPlansToUi } from "@/lib/billingPlans";
import { useAppSelector } from "@/store";

const toastError = (error) =>
  toast.error(error?.message || "Something went wrong. Please try again.");

const invalidateBillingQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["subscriptionMe"] });
  queryClient.invalidateQueries({ queryKey: ["billingInvoices"] });
};

export function useBillingPlans() {
  return useQuery({
    queryKey: ["billingPlans"],
    queryFn: async () => {
      const res = await apiClient({ url: API_ENDPOINTS.billing.plans });
      return mapApiPlansToUi(res?.plans || []);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscriptionMe({ refreshFromStripe = false } = {}) {
  const { token } = useAppSelector((state) => state.auth);
  const refresh = Boolean(refreshFromStripe);

  return useQuery({
    queryKey: ["subscriptionMe", refresh ? "refresh" : "cached"],
    queryFn: () => {
      if (!token) throw new Error("missing or invalid Authorization header");
      const url = refresh
        ? `${API_ENDPOINTS.billing.subscriptionMe}?refresh=1`
        : API_ENDPOINTS.billing.subscriptionMe;
      return apiClient({
        url,
        method: "GET",
        token,
      });
    },
    enabled: !!token,
    // Keep subscription status fresh so expiry/cancel UI doesn't lag behind backend
    staleTime: refresh ? 5_000 : 10_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useCreateSetupIntent() {
  const { token } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.setupIntent,
        method: "POST",
        token,
      });
    },
    onError: toastError,
  });
}

export function useCreateCheckoutSession() {
  const { token } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: (planKey) => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.checkoutSession,
        method: "POST",
        data: { plan_key: planKey },
        token,
      });
    },
    onError: toastError,
  });
}

export function useStorefrontTemplateEntitlements() {
  const { token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: ["storefrontTemplateEntitlements"],
    queryFn: () => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.storefrontTemplates,
        method: "GET",
        token,
      });
    },
    enabled: !!token,
    staleTime: 10_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useCreateStorefrontTemplateCheckoutSession() {
  const { token } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId) => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.storefrontTemplateCheckoutSession,
        method: "POST",
        data: { template_id: templateId },
        token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storefrontTemplateEntitlements"] });
      invalidateBillingQueries(queryClient);
    },
    onError: toastError,
  });
}

export function useConfirmStorefrontTemplateCheckoutSession() {
  const { token } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, templateId }) => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.storefrontTemplateCheckoutConfirm,
        method: "POST",
        data: {
          session_id: sessionId,
          template_id: templateId,
        },
        token,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["storefrontTemplateEntitlements"], data);
      invalidateBillingQueries(queryClient);
    },
  });
}

export function useCancelStorefrontTemplateSubscription() {
  const { token } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, reason = "" }) => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.storefrontTemplateCancel,
        method: "POST",
        data: {
          template_id: templateId,
          ...(reason ? { reason } : {}),
        },
        token,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["storefrontTemplateEntitlements"], data);
      invalidateBillingQueries(queryClient);
      toast.success("Template subscription will cancel at the end of the billing period.", {
        toastId: "storefront-template-cancel-scheduled",
      });
    },
    onError: toastError,
  });
}

export function useResumeStorefrontTemplateSubscription() {
  const { token } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId) => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.storefrontTemplateResume,
        method: "POST",
        data: { template_id: templateId },
        token,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["storefrontTemplateEntitlements"], data);
      invalidateBillingQueries(queryClient);
      toast.success("Template subscription will continue renewing.", {
        toastId: "storefront-template-subscription-resumed",
      });
    },
    onError: toastError,
  });
}

export function openCheckoutPlaceholderWindow() {
  const payWindow = window.open("about:blank", "_blank");
  if (!payWindow) return null;

  try {
    payWindow.document.title = "Stripe Checkout";
    payWindow.document.body.innerHTML =
      '<div style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;color:#334155;"><p>Opening secure checkout...</p></div>';
  } catch {
    // Some browsers restrict document access until navigation.
  }

  return payWindow;
}

export function openStripeCheckoutInNewTab(data, targetWindow = null) {
  const url = data?.url;
  if (!url) {
    try {
      targetWindow?.close();
    } catch {
      // ignore
    }
    toast.error("Missing Stripe checkout URL.");
    return false;
  }

  if (targetWindow && !targetWindow.closed) {
    try {
      targetWindow.location.href = url;
      targetWindow.opener = null;
      targetWindow.focus?.();
      return true;
    } catch {
      try {
        targetWindow.close();
      } catch {
        // ignore
      }
    }
  }

  let opened = null;
  try {
    opened = window.open(url, "_blank");
  } catch {
    opened = null;
  }
  if (!opened) {
    window.location.href = url;
    return true;
  }

  try {
    opened.opener = null;
  } catch {
    // ignore
  }
  return true;
}

export function redirectToStripeCheckout(data) {
  return openStripeCheckoutInNewTab(data);
}

export function useBillingInvoices(enabled = true, { refetchInterval } = {}) {
  const { token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: ["billingInvoices"],
    queryFn: () => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.invoices,
        method: "GET",
        token,
      });
    },
    enabled: !!token && enabled,
    staleTime: 5_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: refetchInterval || false,
  });
}

export function useChangeSubscriptionPlan() {
  const { token } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planKey) => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.subscriptionChangePlan,
        method: "POST",
        data: { plan_key: planKey },
        token,
      });
    },
    onSuccess: (data) => {
      if (data?.changeType === "upgrade" && data?.invoice?.hostedInvoiceUrl && data.invoice.status !== "paid") {
        window.location.href = data.invoice.hostedInvoiceUrl;
      }
      invalidateBillingQueries(queryClient);
    },
    onError: toastError,
    onSettled: () => invalidateBillingQueries(queryClient),
  });
}

export function useResumeSubscription() {
  const { token } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.subscriptionResume,
        method: "POST",
        data: {},
        token,
      });
    },
    onSuccess: () => invalidateBillingQueries(queryClient),
    onError: toastError,
    onSettled: () => invalidateBillingQueries(queryClient),
  });
}

export function useCancelSubscription() {
  const { token } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reason } = {}) => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.subscriptionCancel,
        method: "POST",
        data: { reason: String(reason || "").trim() },
        token,
      });
    },
    onSuccess: () => invalidateBillingQueries(queryClient),
    onError: toastError,
    onSettled: () => invalidateBillingQueries(queryClient),
  });
}

export function usePaymentMethods() {
  const { token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: ["paymentMethods"],
    queryFn: () => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.paymentMethods,
        method: "GET",
        token,
      });
    },
    enabled: !!token,
  });
}

export function useEnterpriseStatus() {
  const { token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: ["enterpriseStatus"],
    queryFn: () => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.enterpriseStatus,
        method: "GET",
        token,
      });
    },
    enabled: !!token,
  });
}

export function useEnterpriseInquiry() {
  const { token } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => {
      if (!token) throw new Error("missing or invalid Authorization header");
      return apiClient({
        url: API_ENDPOINTS.billing.enterpriseInquiry,
        method: "POST",
        data: payload,
        token,
      });
    },
    onSuccess: () => {
      toast.success("Successfully joined the Enterprise waitlist!");
      queryClient.invalidateQueries({ queryKey: ["enterpriseStatus"] });
    },
    onError: toastError,
  });
}
