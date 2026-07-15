"use client";

import { useEffect, useRef } from "react";
import { useConnectionState, useParticipants } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { humanParticipants } from "./livekitParticipants";

export default function RemoteDepartureGuard({ enabled = true, onDeparted }) {
  const participants = useParticipants();
  const connectionState = useConnectionState();
  const remoteHumans = humanParticipants(participants).filter((participant) => !participant.isLocal);
  const hadRemoteParticipantRef = useRef(false);
  const onDepartedRef = useRef(onDeparted);

  useEffect(() => {
    onDepartedRef.current = onDeparted;
  }, [onDeparted]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (remoteHumans.length > 0) {
      hadRemoteParticipantRef.current = true;
      return undefined;
    }
    if (
      !hadRemoteParticipantRef.current ||
      connectionState !== ConnectionState.Connected
    ) {
      return undefined;
    }
    const timer = window.setTimeout(() => onDepartedRef.current?.(), 20_000);
    return () => window.clearTimeout(timer);
  }, [connectionState, enabled, remoteHumans.length]);

  return null;
}
