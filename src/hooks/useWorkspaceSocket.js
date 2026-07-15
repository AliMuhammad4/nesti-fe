"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { activateCallWithRetry } from "@/lib/callActivation";
import { toast } from "react-toastify";
import { getSocketOrigin } from "@/lib/api";
import WorkspaceRichToast from "@/components/ui/WorkspaceRichToast";
import { useAppDispatch, useAppSelector } from "@/store";
import { incrementUnread } from "@/store/proChatSlice";
import {
  isBrowserCallBusy,
  wasIncomingCallHandled,
} from "@/lib/callNotifications";
import { prewarmCallMedia, warmLiveKitHost } from "@/lib/liveKitCallPrep";

/** Short copy for socket toasts — full text stays in the notifications panel. */
function toastBodyPreview(payload) {
  const type = String(payload?.notification_type || "").trim();
  const body = String(payload?.body || "").trim();
  if (!body) return "";

  if (type === "calendly_plan_blocked") {
    return "Booking sync is paused until you upgrade Calendly and reconnect in Nesti.";
  }
  if (type === "calendly_sync_restored") {
    return "Calendly webhooks are active. New bookings will sync to your calendar and leads.";
  }
  if (type.startsWith("billing_")) {
    const sentence = body.split(/(?<=[.!?])\s+/)[0] || body;
    return sentence.length > 140 ? `${sentence.slice(0, 137).trim()}…` : sentence;
  }

  const sentence = body.split(/(?<=[.!?])\s+/)[0] || body;
  return sentence.length > 140 ? `${sentence.slice(0, 137).trim()}…` : sentence;
}

/**
 * Subscribes to workspace Socket.IO when `token` is set (agent / mortgage broker / lawyer dashboard).
 * Not used by the public embed chatbot — that flow is HTTPS POST `/api/chat` only.
 *
 * Server: `node-backend/services/realtime/workspaceSocket.js`
 * Events: `notifications:item`, `workspace:lead`, `workspace:ready`
 *
 * DevTools: Chrome’s “Socket” filter only lists WebSocket frames. Socket.IO may briefly use
 * polling (XHR) first — filter “All” or search `socket.io` if you don’t see a WS row yet.
 */
export function useWorkspaceSocket(
  token,
  queryClient,
  { callBusy = false, socketRef = null } = {},
) {
  const [incomingCall, setIncomingCall] = useState(null);
  const callBusyRef = useRef(callBusy);
  const dispatch = useAppDispatch();
  const myUserId = useAppSelector((s) => s.auth.user?.id || s.auth.user?._id || "");
  const myRole = String(useAppSelector((s) => s.auth.user?.role || "")).toLowerCase();

  useEffect(() => {
    callBusyRef.current = callBusy;
  }, [callBusy]);

  useEffect(() => {
    const clearHandledCall = (event) => {
      const roomName = String(event?.detail?.roomName || "");
      if (!roomName) return;
      setIncomingCall((current) =>
        String(current?.call?.roomName || "") === roomName ? null : current,
      );
    };
    window.addEventListener("nesti:incoming-call-handled", clearHandledCall);
    return () => {
      window.removeEventListener("nesti:incoming-call-handled", clearHandledCall);
    };
  }, []);

  useEffect(() => {
    if (!token || !queryClient) {
      setIncomingCall(null);
      return;
    }
    const pathname =
      typeof window !== "undefined" ? String(window.location?.pathname || "") : "";
    const isProfessionalPublicPage =
      pathname.startsWith("/p/") || pathname.startsWith("/professional/");
    const isClientUser = myRole === "client";
    const origin = getSocketOrigin();
    if (!origin) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[workspace-socket] No API origin for Socket.IO. Set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_SOCKET_ORIGIN (see getSocketOrigin in lib/api.js).",
        );
      }
      return;
    }

    const sessionToken = String(token).trim().replace(/^Bearer\s+/i, "");

    const socket = io(origin, {
      path: "/socket.io",
      auth: { token: sessionToken },
      transports: ["polling", "websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });
    if (socketRef) socketRef.current = socket;

    const refreshNotifications = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    const refreshLeadWorkspaceData = () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-leads"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-bookings"] });
    };

    const actionHref = (action) => {
      const type = String(action?.type || "").trim();
      if (!type) return null;
      if (type === "open_prochat_thread") {
        const tid = String(action?.thread_id || "").trim();
        if (!tid) return null;
        const isLeadThread = action?.is_lead_thread === true || Boolean(String(action?.lead_id || "").trim());
        return isLeadThread
          ? `/client-dashboard/inquiries?thread=${encodeURIComponent(tid)}`
          : `/messages/${encodeURIComponent(tid)}`;
      }
      if (type === "open_lead") {
        const lid = String(action?.lead_match_id || "").trim();
        return lid ? `/leads/${encodeURIComponent(lid)}` : null;
      }
      if (type === "open_property") {
        const pid = String(action?.property_id || "").trim();
        return pid ? `/client-dashboard/properties/${encodeURIComponent(pid)}` : null;
      }
      if (type === "open_referral") {
        const rid = String(action?.referral_id || "").trim();
        const dir = String(action?.direction || "inbound").trim().toLowerCase();
        const d = dir === "outbound" ? "outbound" : "inbound";
        return rid
          ? `/referrals/${encodeURIComponent(rid)}?direction=${encodeURIComponent(d)}`
          : null;
      }
      if (type === "open_bulk_followups") {
        const href = String(action?.href || "").trim();
        return href || "/clients/follow-ups";
      }
      if (type === "open_billing") {
        const href = String(action?.href || "").trim();
        return href || "/checkout";
      }
      if (type === "open_calendly_billing") {
        const href = String(action?.href || "").trim();
        return href || "https://calendly.com/app/admin/billing";
      }
      if (type === "open_calendar") {
        const href = String(action?.href || "").trim();
        return href || "/calendar";
      }
      return null;
    };

    const actionLabel = (action) => {
      const type = String(action?.type || "").trim();
      if (type === "open_prochat_thread") {
        return action?.is_lead_thread === true || String(action?.lead_id || "").trim() ? "Open inquiry" : "Open chat";
      }
      if (type === "open_lead") return "Open lead";
      if (type === "open_property") return "View property";
      if (type === "open_referral") return "Open referral";
      if (type === "open_bulk_followups") return "Review drafts";
      if (type === "open_billing") return "View billing";
      if (type === "open_calendly_billing") return "Calendly billing";
      if (type === "open_calendar") return "Open calendar";
      return "Open";
    };

    const onNotify = (payload) => {
      refreshNotifications();
      const action = payload?.action || {};
      const notificationType = String(payload?.notification_type || "").trim();
      if (notificationType.startsWith("calendly_")) {
        queryClient.invalidateQueries({ queryKey: ["calendar-status"] });
      }
      if (String(action?.type || "").trim() === "open_prochat_thread") {
        const threadId = String(action?.thread_id || "").trim();
        queryClient.invalidateQueries({ queryKey: ["prochat-threads"] });
        queryClient.invalidateQueries({ queryKey: ["prochat-thread"] });
        if (threadId) {
          queryClient.invalidateQueries({ queryKey: ["prochat-messages"] });
        }
      }
      refreshLeadWorkspaceData();
      if (notificationType === "new_property_for_sale") {
        queryClient.invalidateQueries({ queryKey: ["client-inquiries"] });
      }

      // Public professional pages should not show workspace toasts.
      // Keep background cache updates, but avoid UI notification noise here.
      if (isProfessionalPublicPage) {
        return;
      }

      const title = payload?.title;
      const href = actionHref(payload?.action);
      const isExternalHref = Boolean(href && /^https?:\/\//i.test(href));
      if (href && pathname && href === pathname) {
        return;
      }
      if (title && typeof title === "string") {
        const preview = toastBodyPreview(payload);
        const label = actionLabel(payload?.action);
        const toastOptions = {
          autoClose: href ? 9000 : 6000,
          closeOnClick: !href,
          className: href ? "nesti-toast--rich" : "nesti-toast",
          icon: false,
        };

        if (!href) {
          toast.info(
            <WorkspaceRichToast title={title} preview={preview} />,
            toastOptions,
          );
          return;
        }

        toast.info(
          <WorkspaceRichToast
            title={title}
            preview={preview}
            actionLabel={label}
            onAction={() => {
              toast.dismiss();
              if (isExternalHref) {
                window.open(href, "_blank", "noopener,noreferrer");
                return;
              }
              window.location.assign(href);
            }}
          />,
          { ...toastOptions, closeOnClick: false },
        );
      }
    };

    const onLead = () => {
      refreshLeadWorkspaceData();
      refreshNotifications();
    };

    const onProChatInbox = (payload) => {
      if (isProfessionalPublicPage) {
        queryClient.invalidateQueries({ queryKey: ["prochat-threads"] });
        return;
      }
      const threadId = String(payload?.thread_id || "").trim();
      const leadId = String(payload?.lead_id || "").trim();
      const isLeadThread = payload?.is_lead_thread === true || Boolean(leadId);
      const inboxKind = String(payload?.kind || "").trim();
      const threadHref = isLeadThread
        ? isClientUser && threadId
          ? `/client-dashboard/inquiries?thread=${encodeURIComponent(threadId)}`
          : leadId
            ? `/leads/${encodeURIComponent(leadId)}?tab=conversation`
            : threadId
              ? `/messages/${encodeURIComponent(threadId)}`
              : null
        : threadId
          ? `/messages/${encodeURIComponent(threadId)}`
          : null;
      const currentPath =
        typeof window !== "undefined" ? String(window.location?.pathname || "") : "";
      const currentParams =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const isActiveThreadSurface = Boolean(
        threadId &&
          (currentPath === `/messages/${threadId}` ||
            (isClientUser &&
              currentPath.startsWith("/client-dashboard/inquiries") &&
              String(currentParams?.get("thread") || "") === threadId) ||
            (leadId &&
              currentPath === `/leads/${leadId}` &&
              String(currentParams?.get("tab") || "") === "conversation")),
      );

      const inboxCall = payload?.call || {};
      const isMultipartyParticipantUpdate =
        inboxKind === "call_participant" ||
        (inboxKind === "call_decline" && inboxCall?.call_scope === "multiparty");
      if (isMultipartyParticipantUpdate) {
        queryClient.invalidateQueries({ queryKey: ["prochat-call-records"] });
        if (inboxCall?.room_name) {
          window.dispatchEvent(
            new CustomEvent("nesti:prochat-call-participant", {
              detail: inboxCall,
            }),
          );
        }
        return;
      }

      if (inboxKind === "call_decline" || inboxKind === "call_ended") {
        queryClient.invalidateQueries({ queryKey: ["prochat-call-records"] });
        const roomName = String(payload?.call?.room_name || "").trim();
        if (roomName) {
          toast.dismiss(`incoming-call:${roomName}`);
          setIncomingCall((current) =>
            String(current?.call?.roomName || "") === roomName ? null : current,
          );
          window.dispatchEvent(
            new CustomEvent("nesti:active-call-ended", {
              detail: { roomName },
            }),
          );
        }
        return;
      }

      if (inboxKind === "call_invite") {
        queryClient.invalidateQueries({ queryKey: ["prochat-call-records"] });
        // Conversation surfaces own their call socket and modal; rendering the
        // global copy as well would create two answer/decline controls.
        if (isActiveThreadSurface) return;
        const call = payload?.call || {};
        const callerId = String(call?.user_id || "").trim();
        if (myUserId && callerId && String(callerId) === String(myUserId)) return;
        const callerName = String(call?.sender_name || "Someone").trim() || "Someone";
        const callType = String(call?.call_type || "voice").toLowerCase() === "video" ? "video" : "voice";
        const roomName = String(call?.room_name || "").trim();
        if (wasIncomingCallHandled(roomName)) return;
        const decline = () =>
          new Promise((resolve) => {
            socket.timeout(5000).emit(
              "prochat:call_decline",
              {
                thread_id: threadId,
                room_name: roomName,
                call_type: callType,
              },
              (error, ack) => {
                if (error || !ack?.success) {
                  toast.error(ack?.message || "Could not decline the call.");
                  resolve(false);
                  return;
                }
                setIncomingCall(null);
                resolve(true);
              },
            );
          });
        const end = () =>
          new Promise((resolve) => {
            socket.timeout(5000).emit(
              call?.call_scope === "multiparty"
                ? "prochat:call_leave"
                : "prochat:call_ended",
              {
                thread_id: threadId,
                room_name: roomName,
                call_type: callType,
              },
              (error, ack) => resolve(!error && Boolean(ack?.success || ack?.code === "call_not_found")),
            );
          });
        const active = () =>
          activateCallWithRetry({
            emit: (eventName, eventPayload) =>
              new Promise((resolve) => {
                socket.timeout(5000).emit(
                  eventName,
                  eventPayload,
                  (error, ack) =>
                    resolve(
                      error
                        ? { success: false, code: "signal_timeout" }
                        : ack || { success: false },
                    ),
                );
              }),
            payload: {
              thread_id: threadId,
              room_name: roomName,
              call_type: callType,
            },
          }).then((result) => Boolean(result?.success));
        const nextIncomingCall = {
          call: {
            callerName,
            callType,
            roomName,
            threadId,
            client: isClientUser,
            callScope: call?.call_scope === "multiparty" ? "multiparty" : "direct",
            participantStates: Array.isArray(call?.participant_states)
              ? call.participant_states
              : [],
            expiresAt: Date.now() + 85_000,
          },
          dismiss: () => setIncomingCall(null),
          onDecline: decline,
          onEnd: end,
          onActive: active,
        };
        if (callBusyRef.current || isBrowserCallBusy(roomName)) {
          void decline();
          return;
        }
        void warmLiveKitHost();
        void prewarmCallMedia({ video: callType === "video" });
        setIncomingCall((current) => {
          const currentRoom = String(current?.call?.roomName || "");
          if (currentRoom && currentRoom !== roomName) {
            void decline();
            return current;
          }
          return nextIncomingCall;
        });
        queryClient.invalidateQueries({ queryKey: ["prochat-threads"] });
        queryClient.invalidateQueries({ queryKey: ["client-inquiries"] });
        if (leadId) {
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
          queryClient.invalidateQueries({ queryKey: ["lead-messages", leadId] });
        }
        return;
      }

      if (isActiveThreadSurface) {
        queryClient.invalidateQueries({ queryKey: ["prochat-threads"] });
        queryClient.invalidateQueries({ queryKey: ["client-inquiries"] });
        if (threadId) {
          queryClient.invalidateQueries({ queryKey: ["inquiry-thread-messages"] });
        }
        return;
      }
      const msg = payload?.message || {};
      const kind = String(msg?.kind || "").trim();
      const messageId = String(msg?.id || "").trim();
      const sender = msg?.sender || null;
      const senderId = String(msg?.sender_user_id || sender?.id || "").trim();
      if (myUserId && senderId && String(senderId) === String(myUserId)) {
        return; // don't notify for your own actions
      }
      // A brand-new thread may emit a "thread_started" inbox event so the receiver sees a toast
      // even before the first real message. That should NOT count as an unread message.
      const isThreadStarted =
        kind === "thread_started" ||
        kind === "group_created" ||
        messageId.startsWith("thread:") ||
        messageId.startsWith("group:");
      if (isThreadStarted) {
        const senderName =
          (sender?.full_name && String(sender.full_name).trim()) ||
          [sender?.first_name, sender?.last_name].filter(Boolean).join(" ").trim() ||
          "A professional";
        const preview = String(msg?.body || "").trim();
        const title = preview ? `${senderName}: ${preview.slice(0, 90)}` : `New message from ${senderName}`;
        toast.info(
          <WorkspaceRichToast
            title={title}
            actionLabel={threadHref ? (isLeadThread ? "Open inquiry" : "Open chat") : ""}
            onAction={threadHref ? () => {
              toast.dismiss();
              window.location.assign(threadHref);
            } : undefined}
          />,
          {
            autoClose: threadHref ? 9000 : 6000,
            closeOnClick: !threadHref,
            className: threadHref ? "nesti-toast--rich" : "nesti-toast",
            icon: false,
          },
        );
      }
      if (threadId && !isThreadStarted) {
        dispatch(incrementUnread({ threadId }));
        const senderName =
          (sender?.full_name && String(sender.full_name).trim()) ||
          [sender?.first_name, sender?.last_name].filter(Boolean).join(" ").trim() ||
          "A professional";
        const preview = String(msg?.body || "").trim() || "Sent an attachment";
        toast.info(
          <WorkspaceRichToast
            title={`${senderName}: ${preview.slice(0, 90)}`}
            actionLabel={threadHref ? (isLeadThread ? (isClientUser ? "Open inquiry" : "Open lead") : "Open chat") : ""}
            onAction={threadHref ? () => {
              toast.dismiss();
              window.location.assign(threadHref);
            } : undefined}
          />,
          {
            autoClose: threadHref ? 9000 : 6000,
            closeOnClick: !threadHref,
            className: threadHref ? "nesti-toast--rich" : "nesti-toast",
            icon: false,
          },
        );
      }
      queryClient.invalidateQueries({ queryKey: ["prochat-threads"] });
      queryClient.invalidateQueries({ queryKey: ["client-inquiries"] });
      if (threadId) {
        queryClient.invalidateQueries({ queryKey: ["inquiry-thread-messages"] });
      }
    };

    const dispatchCallLifecycle = (eventName) => (payload) => {
      if (typeof window === "undefined" || !payload?.room_name) return;
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: payload,
        }),
      );
    };
    const onCallAccepted = dispatchCallLifecycle("nesti:prochat-call-accepted");
    const onCallParticipant = dispatchCallLifecycle("nesti:prochat-call-participant");
    const onCallEnded = dispatchCallLifecycle("nesti:prochat-call-ended");
    const onCallArtifactsReady = (payload) => {
      const callId = String(payload?.call_id || "").trim();
      queryClient.invalidateQueries({ queryKey: ["prochat-call-records"] });
      queryClient.invalidateQueries({ queryKey: ["prochat-call-detail"] });
      queryClient.invalidateQueries({ queryKey: ["prochat-call-artifacts"] });
      queryClient.invalidateQueries({ queryKey: ["prochat-call-transcript"] });
      queryClient.invalidateQueries({ queryKey: ["prochat-call-minutes"] });
      toast.success("Meeting notes are ready.", {
        toastId: `call-artifacts-ready:${callId || "latest"}`,
      });
    };

    socket.on("connect", () => {
      if (process.env.NODE_ENV === "development") {
        console.info("[workspace-socket] connected", { origin, id: socket.id, transport: socket.io.engine?.transport?.name });
      }
      refreshNotifications();
    });
    socket.on("workspace:ready", refreshNotifications);
    socket.on("notifications:item", onNotify);
    socket.on("workspace:lead", onLead);
    socket.on("prochat:inbox", onProChatInbox);
    socket.on("prochat:call_accepted", onCallAccepted);
    socket.on("prochat:call_participant", onCallParticipant);
    socket.on("prochat:call_ended", onCallEnded);
    socket.on("prochat:call_artifacts_ready", onCallArtifactsReady);

    socket.on("connect_error", (err) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[workspace-socket] connect_error — check JWT / backend on", origin, err?.message || err);
      }
    });
    socket.on("disconnect", (reason) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[workspace-socket] disconnected", { reason });
      }
    });

    return () => {
      if (socketRef?.current === socket) socketRef.current = null;
      socket.off("connect");
      socket.off("workspace:ready", refreshNotifications);
      socket.off("notifications:item", onNotify);
      socket.off("workspace:lead", onLead);
      socket.off("prochat:inbox", onProChatInbox);
      socket.off("prochat:call_accepted", onCallAccepted);
      socket.off("prochat:call_participant", onCallParticipant);
      socket.off("prochat:call_ended", onCallEnded);
      socket.off("prochat:call_artifacts_ready", onCallArtifactsReady);
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [token, queryClient, dispatch, myUserId, myRole, socketRef]);

  return incomingCall;
}
