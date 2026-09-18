"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { useAppSelector } from "@/store";

function useToken() {
  return useAppSelector((state) => state.auth.token);
}

export async function openMyCredentialDocument({ token, docId, fileName, download = false }) {
  const res = await fetch(API_ENDPOINTS.professionals.credentialDocument(docId), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to open document");
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  if (download) {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName || "document";
    link.click();
  } else {
    window.open(objectUrl, "_blank", "noopener,noreferrer");
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export function useOpenMyCredentialDocument() {
  const token = useToken();
  const [openingId, setOpeningId] = useState("");

  const openDocument = async (doc) => {
    if (!doc?.id || !token) return;
    setOpeningId(doc.id);
    try {
      await openMyCredentialDocument({
        token,
        docId: doc.id,
        fileName: doc.file_name,
      });
    } catch (error) {
      toast.error(error?.message || "Failed to open document");
    } finally {
      setOpeningId("");
    }
  };

  return { openDocument, openingId };
}

export function useMyCredentials(enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: ["credentials", "me"],
    enabled: Boolean(token) && enabled,
    queryFn: () => apiClient({ url: API_ENDPOINTS.professionals.credentials, token }),
  });
}

export function usePatchCredentials() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      apiClient({
        url: API_ENDPOINTS.professionals.credentials,
        method: "PATCH",
        data,
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error?.message || "Failed to save verification details"),
  });
}

export function useUploadCredentialDocument() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, file }) => {
      const form = new FormData();
      form.append("type", type);
      form.append("file", file);
      return apiClient({
        url: API_ENDPOINTS.professionals.credentialDocuments,
        method: "POST",
        data: form,
        token,
      });
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error?.message || "Upload failed"),
  });
}

export function useDeleteCredentialDocument() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId) =>
      apiClient({
        url: API_ENDPOINTS.professionals.credentialDocument(docId),
        method: "DELETE",
        token,
      }),
    onSuccess: () => {
      toast.success("Document removed");
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error?.message || "Failed to remove document"),
  });
}

export function useSubmitCredentials() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient({
        url: API_ENDPOINTS.professionals.credentialSubmit,
        method: "POST",
        token,
      }),
    onSuccess: () => {
      toast.success("Submitted for admin review");
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error?.message || "Submit failed"),
  });
}
