"use client";

import { createPortal } from "react-dom";
import { Loader2, MessageSquare, Phone, Video, X } from "lucide-react";
import { toast } from "react-toastify";
import ThreadCallModals from "@/components/prochat/calls/ThreadCallModals";
import ThreadComposer from "@/components/prochat/thread/ThreadComposer";
import ThreadMessagesList from "@/components/prochat/thread/ThreadMessagesList";
import { useInquiryConversation } from "@/hooks/prochat/useInquiryConversation";
import { inquirySubject, inquiryTitle } from "./inquiryUtils";

export default function InquiryChatDrawer({ item, token, myUserId, onClose }) {
  const professional = item?.professional || {};
  const title = item
    ? inquiryTitle(item, item.property || null, professional)
    : "Inquiry";
  const subject = item
    ? inquirySubject(item, item.property || null, professional)
    : "";
  const conversation = useInquiryConversation({ item, token, myUserId });
  const callTitle = professional.full_name || title;

  if (!item || !conversation.mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483000] flex w-screen justify-end overflow-hidden bg-black/25"
      role="dialog"
      aria-modal="true"
      style={{ height: "100dvh" }}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close inquiry chat"
        onClick={onClose}
      />
      <aside
        className="relative flex w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl"
        style={{ height: "100dvh" }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
              Inquiry conversation
            </p>
            <h2 className="truncate text-base font-bold text-gray-900">{title}</h2>
            {subject ? (
              <p className="mt-0.5 truncate text-xs text-gray-500">{subject}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void conversation.startCall("voice")}
              disabled={
                conversation.startingCall ||
                conversation.callSession.open ||
                Boolean(conversation.incomingCall)
              }
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Start voice call"
              title="Start voice call"
            >
              <Phone size={14} />
            </button>
            <button
              type="button"
              onClick={() => void conversation.startCall("video")}
              disabled={
                conversation.startingCall ||
                conversation.callSession.open ||
                Boolean(conversation.incomingCall)
              }
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Start video call"
              title="Start video call"
            >
              <Video size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <ThreadCallModals call={conversation} title={callTitle} myUserId={myUserId} />

        <div
          ref={conversation.scrollRef}
          className="min-h-0 flex-1 overflow-y-auto bg-gray-50/40 p-4"
        >
          {conversation.messagesQuery.isLoading ? (
            <div className="flex h-full min-h-[220px] items-center justify-center text-gray-400">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : conversation.messages.length ? (
            <ThreadMessagesList
              messages={conversation.messages}
              myUserId={myUserId}
              isGroup={false}
              membersById={new Map()}
              otherUser={professional}
            />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center text-center">
              <div>
                <MessageSquare size={24} className="mx-auto text-gray-300" />
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  No messages yet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Start the conversation about this inquiry.
                </p>
              </div>
            </div>
          )}
        </div>

        {conversation.otherTyping ? (
          <p className="border-t border-gray-100 px-4 py-1 text-[11px] text-gray-400">
            Professional is typing...
          </p>
        ) : null}

        <div className="border-t border-gray-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] text-gray-400">
            <span>Reply on this inquiry</span>
            <span className={conversation.connected ? "text-primary" : "text-amber-600"}>
              {conversation.connected ? "Connected" : "Connecting..."}
            </span>
          </div>
          <ThreadComposer
            token={token}
            threadId={conversation.threadId}
            draft={conversation.draft}
            setDraft={conversation.setDraft}
            composerRef={conversation.composerRef}
            fileInputRef={conversation.fileInputRef}
            draftAttachments={conversation.draftAttachments}
            setDraftAttachments={conversation.setDraftAttachments}
            uploadingAttachments={conversation.uploadingAttachments}
            setUploadingAttachments={conversation.setUploadingAttachments}
            onUploadAttachment={conversation.onUploadAttachment}
            onSendMessage={conversation.sendMessage}
            onEmitTyping={conversation.emitTyping}
            typingTimeoutRef={conversation.typingTimeoutRef}
            lastTypingSentAt={conversation.lastTypingSentAt}
            autosizeComposer={conversation.autosizeComposer}
            toast={toast}
            disabled={!conversation.threadId}
          />
        </div>
      </aside>
    </div>,
    document.body,
  );
}
