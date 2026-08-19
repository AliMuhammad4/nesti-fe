'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import PublicInquiryChatWidget from './PublicInquiryChatWidget';

const ROLE_LABEL = {
  agent: 'Need help ?',
  mortgage_broker: 'Need help ?',
  lawyer: 'Need help ?',
};

function resolveProfilePlacement(profile) {
  const position = profile?.storefront_profile_position || {};
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };
  const x = clamp(position.x ?? profile?.profile_position_x ?? profile?.storefront_essentials?.profile_position_x, 0, 100, 50);
  const y = clamp(position.y ?? profile?.profile_position_y ?? profile?.storefront_essentials?.profile_position_y, 0, 100, 25);
  const zoom = clamp(profile?.storefront_profile_zoom ?? profile?.profile_zoom ?? profile?.storefront_essentials?.profile_zoom, 1, 3, 1);
  return {
    x,
    y,
    zoom,
    style: {
      objectPosition: `${x}% ${y}%`,
      transform: `scale(${zoom})`,
      transformOrigin: `${x}% ${y}%`,
    },
  };
}

export default function PublicChatBubble({
  profile,
  hideWhenOpen = false,
  controlledOpen,
  onControlledToggle,
  inline = false,
  interactive = true,
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const autoOpenedThisLoadRef = useRef(false);
  const profilePhoto = profile?.profile_photo_url
    || profile?.storefront_profile_fallback_url
    || profile?.storefront_essentials?.profile_photo_url
    || profile?.storefront_essentials?.profile
    || '';
  const profilePlacement = resolveProfilePlacement(profile);

  const label = ROLE_LABEL[profile?.professional_type] || 'Need help ?';
  const isControlled = typeof controlledOpen === 'boolean';
  const isOpen = isControlled ? controlledOpen : open;
  const toggleOpen = () => {
    if (!interactive) return;
    if (isControlled) {
      onControlledToggle?.(!isOpen);
      return;
    }
    setOpen((o) => !o);
  };
  const openChat = () => {
    if (!interactive) return;
    if (isControlled) {
      onControlledToggle?.(true);
      return;
    }
    setOpen(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !interactive) return;
    if (!profile?.embed_token) return;
    if (profile?.storefront_show_chatbot === false) return;
    if (autoOpenedThisLoadRef.current) return;
    if (isOpen) return;

    if (isControlled) {
      onControlledToggle?.(true);
    } else {
      setOpen(true);
    }
    autoOpenedThisLoadRef.current = true;
  }, [
    interactive,
    isOpen,
    isControlled,
    mounted,
    onControlledToggle,
    profile?.embed_token,
    profile?.storefront_show_chatbot,
  ]);

  // If the professional has no embed token configured, hide everything
  if (!profile?.embed_token) return null;

  // Page builder can hide the bubble even when a chatbot embed exists.
  if (profile?.storefront_show_chatbot === false) return null;

  // Hide bubble entirely when another chat widget is already open on the page
  if (hideWhenOpen) return null;

  // Hide the floating bubble once any public chat panel is open.
  // The chat widget's own X button handles closing, matching embed chatbot behaviour.
  const hideBubble = isOpen;

  const positionClass = inline
    ? 'absolute bottom-6 right-6 z-20'
    : 'fixed bottom-6 right-6 z-[10060]';

  const bubbleLayer = (
    <>
      {/* Floating bubble */}
      {!hideBubble && (
        <div
          className={`${positionClass} flex flex-col items-end gap-2 ${interactive ? '' : 'pointer-events-none'}`}
          aria-hidden={interactive ? undefined : true}
        >
          {/* Tooltip label — only when this bubble's own chat is closed */}
          {!isOpen && (
            <button
              type="button"
              onClick={openChat}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-text-heading shadow-lg ring-1 ring-slate-200 transition hover:shadow-xl"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              {label}
            </button>
          )}

          {/* Bubble button */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleOpen}
              aria-label={label}
              className="relative h-16 w-16 overflow-hidden rounded-full bg-white shadow-[0_8px_28px_rgba(0,0,0,0.25)] ring-1 ring-black/10 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="relative h-full w-full overflow-hidden rounded-full">
                {profilePhoto ? (
                  <Image
                    key={`${profilePhoto}-${profilePlacement.x}-${profilePlacement.y}-${profilePlacement.zoom}`}
                    src={profilePhoto}
                    alt={profile.professional_name || 'Professional'}
                    fill
                    sizes="64px"
                    className="object-cover"
                    style={profilePlacement.style}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 text-lg font-bold text-slate-700">
                    {String(profile?.professional_name || 'P').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Chat widget modal */}
      {!isControlled && interactive && (
        <PublicInquiryChatWidget
          profile={profile}
          isOpen={open}
          onClose={() => setOpen(false)}
          inquiryType="contact"
        />
      )}
    </>
  );

  if (inline) return bubbleLayer;

  if (mounted) {
    return createPortal(bubbleLayer, document.body);
  }

  return bubbleLayer;
}
