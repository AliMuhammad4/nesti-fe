'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { firstHomeImageFilter } from './firstHomeImageStyle';

function profileImageStyle(profile, kind = 'profile') {
  const position = kind === 'cover'
    ? profile?.storefront_cover_position || {}
    : profile?.storefront_profile_position || {};
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };
  const x = clamp(position.x, 0, 100, 50);
  const y = clamp(position.y, 0, 100, kind === 'cover' ? 50 : 25);
  const zoom = clamp(
    kind === 'cover' ? profile?.storefront_cover_zoom : profile?.storefront_profile_zoom,
    1,
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
  fallback = null,
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

  useEffect(() => {
    setCandidateIndex(0);
  }, [signature]);

  const candidate = normalized[candidateIndex];
  if (!candidate) return fallback;

  return (
    <Image
      key={`${signature}-${candidateIndex}`}
      src={candidate.src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      style={{
        ...profileImageStyle(profile, candidate.kind),
        ...style,
      }}
      onError={() => setCandidateIndex((current) => current + 1)}
    />
  );
}
