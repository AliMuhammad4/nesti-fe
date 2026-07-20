"use client";

import { useEffect, useRef } from "react";
import { useRoomContext } from "@livekit/components-react";
import { ConnectionState, RoomEvent } from "livekit-client";
import {
  prewarmCallMedia,
  takePrewarmedLocalTracks,
} from "@/lib/liveKitCallPrep";

export default function LocalMediaBootstrap({
  enabled = false,
  audio = true,
  video = false,
  onError,
}) {
  const room = useRoomContext();
  const onErrorRef = useRef(onError);
  const publishedRef = useRef(false);
  const publishingRef = useRef(false);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    publishedRef.current = false;
    publishingRef.current = false;
  }, [room]);

  useEffect(() => {
    if (!enabled || !room || publishedRef.current) return undefined;

    let cancelled = false;
    const wantVideo = Boolean(video);
    const wantAudio = Boolean(audio);

    const publishLocalMedia = async () => {
      if (cancelled || publishedRef.current || publishingRef.current) return;
      publishingRef.current = true;
      try {
        if (wantAudio || wantVideo) {
          await prewarmCallMedia({ video: wantVideo });
        }
        if (cancelled || publishedRef.current) return;

        const warmed = takePrewarmedLocalTracks({ video: wantVideo });
        if (warmed.length) {
          publishedRef.current = true;
          await Promise.all(
            warmed.map((track) => room.localParticipant.publishTrack(track)),
          );
          return;
        }

        const tasks = [];
        if (wantAudio) {
          tasks.push(room.localParticipant.setMicrophoneEnabled(true));
        }
        if (wantVideo) {
          tasks.push(room.localParticipant.setCameraEnabled(true));
        }
        if (!tasks.length) return;
        publishedRef.current = true;
        await Promise.all(tasks);
      } catch (error) {
        publishedRef.current = false;
        if (!cancelled) onErrorRef.current?.(error);
      } finally {
        publishingRef.current = false;
      }
    };

    if (wantAudio || wantVideo) {
      void prewarmCallMedia({ video: wantVideo });
    }

    if (
      room.state === ConnectionState.Connected ||
      room.state === ConnectionState.Connecting
    ) {
      void publishLocalMedia();
    }

    const onSignalConnected = () => {
      void publishLocalMedia();
    };
    room.on(RoomEvent.SignalConnected, onSignalConnected);

    return () => {
      cancelled = true;
      room.off(RoomEvent.SignalConnected, onSignalConnected);
    };
  }, [audio, enabled, room, video]);

  return null;
}
