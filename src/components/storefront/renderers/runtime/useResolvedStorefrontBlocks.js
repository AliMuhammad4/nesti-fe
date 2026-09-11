'use client';

import { useMemo } from 'react';
import { resolveStorefrontBlocks } from '../../storefrontPresets';
import { normalizeBlock } from '../../builder/storefrontBuilderState';

export function useResolvedStorefrontBlocks({ profile, blocks, templateKey }) {
  const templateRef = templateKey || profile?.storefront_template_key || '';
  const resolvedBlocks = useMemo(
    () => (profile
      ? resolveStorefrontBlocks(
        { ...profile, storefront_template_key: templateRef },
        blocks,
        templateRef,
      ).map((block, index) => normalizeBlock(block, index))
      : []),
    [blocks, profile, templateRef],
  );
  return { templateRef, resolvedBlocks };
}
