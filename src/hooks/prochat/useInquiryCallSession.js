"use client";

import { useThreadCallSession } from "./useThreadCallSession";

/** Inquiry drawer calls — thin wrapper around the shared thread call session. */
export function useInquiryCallSession({
  token,
  threadId,
  myUserId,
  socketRef,
  connected,
  title = "Inquiry",
}) {
  return useThreadCallSession({
    token,
    threadId,
    myUserId,
    socketRef,
    connected,
    client: true,
    enableMultiparty: false,
    requireConnectedFlag: true,
    title,
  });
}
