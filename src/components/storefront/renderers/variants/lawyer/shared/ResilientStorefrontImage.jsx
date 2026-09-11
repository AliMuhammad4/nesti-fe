'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { firstHomeImageFilter } from './firstHomeImageStyle';
import { storefrontFocalPointStyle } from '../../../runtime/storefrontFocalPointStyle';

function profileImageStyle(profile, kind = 'profile') {
  const position = kind === 'cover'
    ? profile?.storefront_cover_position || {}
    : profile?.storefront_profile_position || {};
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };
  const x = clamp(position.x, 0, 100, 50);
  const y = clamp(position.y, 0, 100, kind === 'cover' ? 50 : 50);
  const zoom = clamp(
    kind === 'cover' ? profile?.storefront_cover_zoom : profile?.storefront_profile_zoom,
    0.6,
    3,
    1,
  );
  const imageFilter = firstHomeImageFilter(profile);
  return {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
    ...(imageFilter ? { filter: imageFilter } : {}),
  };
}

export function ResilientStorefrontImage({
  profile,
  candidates = [],
  alt,
  sizes,
  className = 'object-cover',
  priority = false,
  style,
  placement = null,
  fallback = null,
  showLoading = false,
}) {
  const normalized = useMemo(
    () => candidates
      .filter((candidate) => candidate?.src)
      .filter((candidate, index, items) => (
        items.findIndex((item) => item.src === candidate.src) === index
      )),
    [candidates],
  );
  const signature = normalized.map((candidate) => `${candidate.kind}:${candidate.src}`).join('|');
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setLoaded(false);
  }, [signature]);

  const candidate = normalized[candidateIndex];
  if (!candidate) return fallback;

  const placementStyle = placement
    ? storefrontFocalPointStyle({
      x: placement.x,
      y: placement.y,
      zoom: placement.zoom,
    })
    : profileImageStyle(profile, candidate.kind);

  const markLoaded = () => setLoaded(true);

  return (
    <>
      {showLoading && !loaded ? (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[#0a1420]/90">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white"
            role="status"
            aria-label="Loading image"
          />
        </div>
      ) : null}
      <Image
        key={`${signature}-${candidateIndex}`}
        src={candidate.src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        style={{
          ...placementStyle,
          ...style,
        }}
        onLoad={markLoaded}
        onError={() => {
          setLoaded(false);
          setCandidateIndex((current) => current + 1);
        }}
      />
    </>
  );
}
