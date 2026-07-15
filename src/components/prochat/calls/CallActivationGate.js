"use client";

import { useEffect, useRef } from "react";
import { useConnectionState } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";

/**
 * Marks the call active as soon as this client connects to LiveKit.
 * Backend trusts callee activation during connecting state.
 */
export default function CallActivationGate({ enabled, onActivate }) {
  const connectionState = useConnectionState();
  const firedRef = useRef(false);
  const onActivateRef = useRef(onActivate);

  useEffect(() => {
    onActivateRef.current = onActivate;
  }, [onActivate]);

  useEffect(() => {
    if (!enabled || firedRef.current || typeof onActivateRef.current !== "function") {
      return undefined;
    }
    if (connectionState !== ConnectionState.Connected) return undefined;

    firedRef.current = true;
    onActivateRef.current?.();
    return undefined;
  }, [connectionState, enabled]);

  return null;
}
