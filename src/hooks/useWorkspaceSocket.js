"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { getSocketOrigin } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store";
import { incrementUnread } from "@/store/proChatSlice";

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
export function useWorkspaceSocket(token, queryClient) {
  const pathname = usePathname() || "";
  const isProfessionalPublicPage = pathname.startsWith("/p/") || pathname.startsWith("/professional/");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const myUserId = useAppSelector((s) => s.auth.user?.id || s.auth.user?._id || "");
  useEffect(() => {
    if (!token || !queryClient) return;
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
        return tid ? `/messages/${encodeURIComponent(tid)}` : null;
      }
      if (type === "open_lead") {
        const lid = String(action?.lead_match_id || "").trim();
        return lid ? `/leads/${encodeURIComponent(lid)}` : null;
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
      if (type === "open_prochat_thread") return "Open chat";
      if (type === "open_lead") return "Open lead";
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
        if (!href) {
          toast.info(
            preview ? (
              <div className="text-left">
                <p className="font-semibold leading-snug text-slate-900">{title}</p>
                <p className="mt-1 text-[12px] font-normal leading-relaxed text-slate-600">{preview}</p>
              </div>
            ) : (
              title
            ),
            { autoClose: 6000 },
          );
          return;
        }
        toast.info(
          <div className="flex w-full flex-col gap-2.5 text-left">
            <div>
              <p className="text-[13px] font-semibold leading-snug text-slate-900">{title}</p>
              {preview ? (
                <p className="mt-1 text-[12px] font-normal leading-relaxed text-slate-600">{preview}</p>
              ) : null}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-primary-dark"
                onClick={() => {
                  toast.dismiss();
                  if (isExternalHref) {
                    window.open(href, "_blank", "noopener,noreferrer");
                    return;
                  }
                  router.push(href);
                }}
              >
                {actionLabel(payload?.action)}
              </button>
            </div>
          </div>,
          { autoClose: 9000, closeOnClick: false, className: "nesti-toast--rich" },
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
      if (threadId && pathname === `/messages/${threadId}`) {
        return; // already on this chat
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
        toast.info(title, { autoClose: 6000 });
      }
      if (threadId && !isThreadStarted) {
        dispatch(incrementUnread({ threadId }));
        const senderName =
          (sender?.full_name && String(sender.full_name).trim()) ||
          [sender?.first_name, sender?.last_name].filter(Boolean).join(" ").trim() ||
          "A professional";
        const preview = String(msg?.body || "").trim() || "Sent an attachment";
        toast.info(`${senderName}: ${preview.slice(0, 90)}`, { autoClose: 6000 });
      }
      queryClient.invalidateQueries({ queryKey: ["prochat-threads"] });
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
      socket.off("connect");
      socket.off("workspace:ready", refreshNotifications);
      socket.off("notifications:item", onNotify);
      socket.off("workspace:lead", onLead);
      socket.off("prochat:inbox", onProChatInbox);
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [token, queryClient, pathname, isProfessionalPublicPage, dispatch, myUserId, router]);
}
