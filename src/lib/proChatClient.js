"use client";

import { apiClient, API_ENDPOINTS } from "@/lib/api";

export async function fetchProChatCallRecords({
  token,
  client = false,
  page = 1,
  limit = 12,
  status = "",
  callType = "",
  from = "",
  to = "",
}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (callType) params.set("call_type", callType);
  if (from) params.set("from", /^\d{4}-\d{2}-\d{2}$/.test(from) ? `${from}T00:00:00.000` : from);
  if (to) params.set("to", /^\d{4}-\d{2}-\d{2}$/.test(to) ? `${to}T23:59:59.999` : to);
  const base = client
    ? API_ENDPOINTS?.proChat?.clientCalls || "/api/pro-chat/client/calls"
    : API_ENDPOINTS?.proChat?.calls || "/api/pro-chat/calls";
  return apiClient({
    url: `${base}?${params.toString()}`,
    method: "GET",
    token,
  });
}

export async function fetchProChatCallRecord({ token, callId, client = false }) {
  const url = client
    ? API_ENDPOINTS?.proChat?.clientCallDetail?.(callId) ||
      `/api/pro-chat/client/calls/${callId}`
    : API_ENDPOINTS?.proChat?.callDetail?.(callId) ||
      `/api/pro-chat/calls/${callId}`;
  return apiClient({ url, method: "GET", token });
}

function callArtifactUrl(kind, callId, client = false) {
  const key = client
    ? {
        artifacts: "clientCallArtifacts",
        transcript: "clientCallTranscript",
        minutes: "clientCallMinutes",
      }[kind]
    : {
        artifacts: "callArtifacts",
        transcript: "callTranscript",
        minutes: "callMinutes",
      }[kind];
  const configured = API_ENDPOINTS?.proChat?.[key];
  if (configured) return configured(callId);
  return `/api/pro-chat/${client ? "client/" : ""}calls/${callId}/${kind}`;
}

export function fetchProChatCallArtifacts({ token, callId, client = false }) {
  return apiClient({
    url: callArtifactUrl("artifacts", callId, client),
    method: "GET",
    token,
  });
}

export function fetchProChatCallTranscript({
  token,
  callId,
  client = false,
  page = 1,
  limit = 100,
}) {
  const params = new URLSearchParams({
    page: String(Math.max(1, Number(page) || 1)),
    limit: String(Math.max(1, Number(limit) || 100)),
  });
  return apiClient({
    url: `${callArtifactUrl("transcript", callId, client)}?${params.toString()}`,
    method: "GET",
    token,
  });
}

export function fetchProChatCallMinutes({ token, callId, client = false }) {
  return apiClient({
    url: callArtifactUrl("minutes", callId, client),
    method: "GET",
    token,
  });
}

export async function createOrGetProChatThread({ token, other_user_id, client = false }) {
  return apiClient({
    url: client
      ? API_ENDPOINTS?.proChat?.clientThreads || "/api/pro-chat/client/threads"
      : API_ENDPOINTS?.proChat?.threads || "/api/pro-chat/threads",
    method: "POST",
    token,
    data: { other_user_id },
  });
}

export async function createProChatGroupThread({ token, title, participant_ids, client = false }) {
  return apiClient({
    url: client
      ? API_ENDPOINTS?.proChat?.clientGroups || "/api/pro-chat/client/groups"
      : API_ENDPOINTS?.proChat?.groups || "/api/pro-chat/groups",
    method: "POST",
    token,
    data: { title, participant_ids },
  });
}

export async function updateProChatGroupThread({ token, id, title, client = false }) {
  const url = client
    ? API_ENDPOINTS?.proChat?.clientGroupDetail
      ? API_ENDPOINTS.proChat.clientGroupDetail(id)
      : `/api/pro-chat/client/groups/${id}`
    : API_ENDPOINTS?.proChat?.groupDetail ? API_ENDPOINTS.proChat.groupDetail(id) : `/api/pro-chat/groups/${id}`;
  return apiClient({
    url,
    method: "PATCH",
    token,
    data: { title },
  });
}

export async function deleteProChatGroupThread({ token, id, client = false }) {
  const url = client
    ? API_ENDPOINTS?.proChat?.clientGroupDelete
      ? API_ENDPOINTS.proChat.clientGroupDelete(id)
      : `/api/pro-chat/client/groups/${id}`
    : API_ENDPOINTS?.proChat?.groupDelete
    ? API_ENDPOINTS.proChat.groupDelete(id)
    : `/api/pro-chat/groups/${id}`;
  return apiClient({
    url,
    method: "DELETE",
    token,
  });
}

export async function addProChatGroupMembers({ token, id, participant_ids, client = false }) {
  const url = client
    ? API_ENDPOINTS?.proChat?.clientGroupMembers
      ? API_ENDPOINTS.proChat.clientGroupMembers(id)
      : `/api/pro-chat/client/groups/${id}/members`
    : API_ENDPOINTS?.proChat?.groupMembers ? API_ENDPOINTS.proChat.groupMembers(id) : `/api/pro-chat/groups/${id}/members`;
  return apiClient({
    url,
    method: "POST",
    token,
    data: { participant_ids },
  });
}

export async function removeProChatGroupMember({ token, id, userId, client = false }) {
  const url = client
    ? API_ENDPOINTS?.proChat?.clientGroupMember
      ? API_ENDPOINTS.proChat.clientGroupMember(id, userId)
      : `/api/pro-chat/client/groups/${id}/members/${userId}`
    : API_ENDPOINTS?.proChat?.groupMember
    ? API_ENDPOINTS.proChat.groupMember(id, userId)
    : `/api/pro-chat/groups/${id}/members/${userId}`;
  return apiClient({
    url,
    method: "DELETE",
    token,
  });
}

export async function leaveProChatGroup({ token, id, client = false }) {
  const url = client
    ? API_ENDPOINTS?.proChat?.clientGroupLeave
      ? API_ENDPOINTS.proChat.clientGroupLeave(id)
      : `/api/pro-chat/client/groups/${id}/leave`
    : API_ENDPOINTS?.proChat?.groupLeave ? API_ENDPOINTS.proChat.groupLeave(id) : `/api/pro-chat/groups/${id}/leave`;
  return apiClient({
    url,
    method: "POST",
    token,
  });
}

export async function requestProChatGroupRejoin({ token, id, client = false }) {
  const url = client
    ? API_ENDPOINTS?.proChat?.clientGroupRejoinRequest
      ? API_ENDPOINTS.proChat.clientGroupRejoinRequest(id)
      : `/api/pro-chat/client/groups/${id}/rejoin-request`
    : API_ENDPOINTS?.proChat?.groupRejoinRequest
    ? API_ENDPOINTS.proChat.groupRejoinRequest(id)
    : `/api/pro-chat/groups/${id}/rejoin-request`;
  return apiClient({
    url,
    method: "POST",
    token,
  });
}

export async function fetchProChatGroupRejoinRequests({ token, id, client = false }) {
  const url = client
    ? API_ENDPOINTS?.proChat?.clientGroupRejoinRequests
      ? API_ENDPOINTS.proChat.clientGroupRejoinRequests(id)
      : `/api/pro-chat/client/groups/${id}/rejoin-requests`
    : API_ENDPOINTS?.proChat?.groupRejoinRequests
    ? API_ENDPOINTS.proChat.groupRejoinRequests(id)
    : `/api/pro-chat/groups/${id}/rejoin-requests`;
  return apiClient({
    url,
    method: "GET",
    token,
  });
}

export async function resolveProChatGroupRejoinRequest({ token, id, userId, action, client = false }) {
  const safeAction = action === "approve" ? "approve" : "reject";
  const url = client
    ? API_ENDPOINTS?.proChat?.clientGroupRejoinResolve
      ? API_ENDPOINTS.proChat.clientGroupRejoinResolve(id, userId, safeAction)
      : `/api/pro-chat/client/groups/${id}/rejoin-requests/${userId}/${safeAction}`
    : API_ENDPOINTS?.proChat?.groupRejoinResolve
    ? API_ENDPOINTS.proChat.groupRejoinResolve(id, userId, safeAction)
    : `/api/pro-chat/groups/${id}/rejoin-requests/${userId}/${safeAction}`;
  return apiClient({
    url,
    method: "POST",
    token,
  });
}

function proChatThreadsBase(client = false) {
  return client
    ? API_ENDPOINTS?.proChat?.clientThreads || "/api/pro-chat/client/threads"
    : API_ENDPOINTS?.proChat?.threads || "/api/pro-chat/threads";
}

function proChatThreadDetailUrl(id, client = false) {
  if (client) {
    return API_ENDPOINTS?.proChat?.clientThreadDetail
      ? API_ENDPOINTS.proChat.clientThreadDetail(id)
      : `/api/pro-chat/client/threads/${id}`;
  }
  return API_ENDPOINTS?.proChat?.threadDetail ? API_ENDPOINTS.proChat.threadDetail(id) : `/api/pro-chat/threads/${id}`;
}

function proChatThreadMessagesUrl(id, client = false) {
  if (client) {
    return API_ENDPOINTS?.proChat?.clientThreadMessages
      ? API_ENDPOINTS.proChat.clientThreadMessages(id)
      : `/api/pro-chat/client/threads/${id}/messages`;
  }
  return API_ENDPOINTS?.proChat?.threadMessages
    ? API_ENDPOINTS.proChat.threadMessages(id)
    : `/api/pro-chat/threads/${id}/messages`;
}

function proChatThreadAttachmentsUrl(id, client = false) {
  if (client) {
    return API_ENDPOINTS?.proChat?.clientThreadAttachments
      ? API_ENDPOINTS.proChat.clientThreadAttachments(id)
      : `/api/pro-chat/client/threads/${id}/attachments`;
  }
  return API_ENDPOINTS?.proChat?.threadAttachments
    ? API_ENDPOINTS.proChat.threadAttachments(id)
    : `/api/pro-chat/threads/${id}/attachments`;
}

export async function fetchMyProChatThreads({ token, page = 1, limit = 200, client = false, includeLeadThreads = true }) {
  const sp = new URLSearchParams();
  sp.set("page", String(Math.max(1, Number(page) || 1)));
  sp.set("limit", String(Math.max(1, Number(limit) || 1)));
  if (includeLeadThreads === false) sp.set("include_lead_threads", "0");
  return apiClient({
    url: `${proChatThreadsBase(client)}?${sp.toString()}`,
    method: "GET",
    token,
  });
}

export async function fetchProChatThreadById({ token, id, client = false }) {
  return apiClient({
    url: proChatThreadDetailUrl(id, client),
    method: "GET",
    token,
  });
}

export async function fetchProChatThreadMessages({ token, id, page = 1, limit = 50, client = false }) {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  sp.set("limit", String(limit));
  const base = proChatThreadMessagesUrl(id, client);
  return apiClient({
    url: `${base}?${sp.toString()}`,
    method: "GET",
    token,
  });
}

export async function uploadProChatThreadAttachment({ token, id, file, client = false }) {
  const url = proChatThreadAttachmentsUrl(id, client);
  const fd = new FormData();
  fd.append("file", file);
  return apiClient({
    url,
    method: "POST",
    token,
    data: fd,
  });
}

export async function createProChatCallToken({
  token,
  id,
  callType = "voice",
  roomName = "",
  action,
  client = false,
  transcriptionConsent = false,
}) {
  const url = client
    ? API_ENDPOINTS?.proChat?.clientThreadCallToken
      ? API_ENDPOINTS.proChat.clientThreadCallToken(id)
      : `/api/pro-chat/client/threads/${id}/call-token`
    : API_ENDPOINTS?.proChat?.threadCallToken
      ? API_ENDPOINTS.proChat.threadCallToken(id)
      : `/api/pro-chat/threads/${id}/call-token`;
  return apiClient({
    url,
    method: "POST",
    token,
    data: {
      call_type: String(callType || "").toLowerCase() === "video" ? "video" : "voice",
      room_name: String(roomName || "").trim() || undefined,
      action: String(action || "").trim().toLowerCase(),
      transcription_consent: transcriptionConsent === true,
    },
  });
}

