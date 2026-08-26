'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { STOREFRONT_BLOCK_TYPES } from '../../storefrontPresets';

function markAnimatedChildren(root, blocks) {
  if (!root) return;
  blocks.forEach((block) => {
    const sectionNode = root.querySelector(`[data-storefront-block-id="${block.id}"]`);
    if (!sectionNode) return;
    const animBody = sectionNode.querySelector('.storefront-anim-body');
    if (!animBody) return;
    sectionNode.querySelectorAll('[data-storefront-anim-item="true"]').forEach((node) => {
      node.style.removeProperty('--storefront-child-stagger');
    });
    const childCandidates = animBody.querySelectorAll('[data-storefront-anim-item="true"]');
    childCandidates.forEach((node, idx) => {
      if (idx >= 12) return;
      node.style.setProperty('--storefront-child-stagger', `${Math.min(idx * 55, 440)}ms`);
    });
  });
}

function scheduleAnimationReveal(callback) {
  let raf1 = 0;
  let raf2 = 0;
  let timer = 0;
  raf1 = window.requestAnimationFrame(() => {
    raf2 = window.requestAnimationFrame(() => {
      timer = window.setTimeout(callback, 32);
    });
  });
  return () => {
    window.cancelAnimationFrame(raf1);
    window.cancelAnimationFrame(raf2);
    window.clearTimeout(timer);
  };
}

export function useStorefrontBlockAnimations({
  blocks,
  scrollRootRef,
  preview,
  previewMode,
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [animatedVisibleById, setAnimatedVisibleById] = useState({});
  const canvasRef = useRef(null);
  useEffect(() => setIsHydrated(true), []);
  const animationConfigSignature = useMemo(
    () => JSON.stringify(
      blocks.map((block) => {
        const layout = block?.data?.layout || block?.layout || {};
        return [
          block?.id || '',
          String(layout.animationType || 'none'),
          String(layout.animationTrigger || 'load'),
          String(layout.animationDuration || 'medium'),
          String(layout.animationDelay ?? '0'),
          String(layout.animationIntensity || 'medium'),
        ];
      }),
    ),
    [blocks],
  );

  useLayoutEffect(() => {
    if (!isHydrated || !blocks.length) return;
    markAnimatedChildren(canvasRef.current, blocks);
  }, [isHydrated, blocks, animationConfigSignature, animatedVisibleById]);

  useEffect(() => {
    if (!isHydrated || !blocks.length) return undefined;
    const root = canvasRef.current;
    if (!root) return undefined;

    const alwaysVisible = {};
    const loadIds = [];
    const scrollIds = [];

    blocks.forEach((block, index) => {
      const layout = block?.data?.layout || block?.layout || {};
      const animationType = layout.animationType || 'none';
      if (animationType === 'none') {
        alwaysVisible[block.id] = true;
        return;
      }
      const trigger = layout.animationTrigger || 'load';
      const isHero = block.type === STOREFRONT_BLOCK_TYPES.HERO;
      const revealOnScroll = trigger === 'scroll' || (!isHero && trigger === 'load' && index > 0);
      if (revealOnScroll) {
        scrollIds.push(block.id);
      } else {
        loadIds.push(block.id);
      }
    });
    setAnimatedVisibleById({
      ...alwaysVisible,
      ...Object.fromEntries(loadIds.map((id) => [id, false])),
      ...Object.fromEntries(scrollIds.map((id) => [id, false])),
    });
    const revealIds = (ids) => {
      if (!ids.length) return;
      setAnimatedVisibleById((prev) => {
        let changed = false;
        const next = { ...prev };
        ids.forEach((id) => {
          if (next[id]) return;
          next[id] = true;
          changed = true;
        });
        return changed ? next : prev;
      });
    };

    const cancelReveal = scheduleAnimationReveal(() => revealIds(loadIds));
    let scrollObserverTimer = 0;
    let safetyTimer = 0;
    let observer = null;
    const isNodeInView = (node) => {
      if (!node) return false;
      const rect = node.getBoundingClientRect();
      const rootEl = scrollRootRef?.current;
      if (rootEl) {
        const rootRect = rootEl.getBoundingClientRect();
        return rect.bottom > rootRect.top + 8 && rect.top < rootRect.bottom - 8;
      }
      return rect.bottom > 8 && rect.top < window.innerHeight - 8;
    };

    if (scrollIds.length) {
      const scrollRoot = scrollRootRef?.current || null;
      observer = new IntersectionObserver((entries) => {
        const visibleIds = entries
          .filter((entry) => entry.isIntersecting || entry.intersectionRatio > 0)
          .map((entry) => entry.target.getAttribute('data-storefront-block-id'))
          .filter(Boolean);
        revealIds(visibleIds);
      }, {
        threshold: [0, 0.01, 0.08],
        root: scrollRoot,
        rootMargin: scrollRoot ? '0px 0px 18% 0px' : '0px 0px 20% 0px',
      });

      const revealInViewScrollIds = () => {
        scrollIds.forEach((id) => {
          const node = root.querySelector(`[data-storefront-block-id="${id}"]`);
          if (node && isNodeInView(node)) revealIds([id]);
        });
      };

      scrollObserverTimer = window.setTimeout(() => {
        scrollIds.forEach((id) => {
          const node = root.querySelector(`[data-storefront-block-id="${id}"]`);
          if (!node) return;
          observer.observe(node);
        });
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            revealInViewScrollIds();
          });
        });
      }, 48);

      const scrollTarget = scrollRoot || window;
      scrollTarget.addEventListener('scroll', revealInViewScrollIds, { passive: true });
      window.addEventListener('resize', revealInViewScrollIds);

      safetyTimer = window.setTimeout(() => {
        scrollIds.forEach((id) => {
          const node = root.querySelector(`[data-storefront-block-id="${id}"]`);
          if (!node || isNodeInView(node)) revealIds([id]);
        });
      }, 2200);

      const loadSafetyTimer = window.setTimeout(() => revealIds(loadIds), 1600);

      return () => {
        cancelReveal();
        window.clearTimeout(scrollObserverTimer);
        window.clearTimeout(safetyTimer);
        window.clearTimeout(loadSafetyTimer);
        observer?.disconnect();
        scrollTarget.removeEventListener('scroll', revealInViewScrollIds);
        window.removeEventListener('resize', revealInViewScrollIds);
      };
    }

    const loadSafetyTimer = window.setTimeout(() => revealIds(loadIds), 1600);

    return () => {
      cancelReveal();
      window.clearTimeout(scrollObserverTimer);
      window.clearTimeout(safetyTimer);
      window.clearTimeout(loadSafetyTimer);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid restarting on profile/block array identity churn
  }, [isHydrated, animationConfigSignature, previewMode, preview]);

  return { canvasRef, isHydrated, animatedVisibleById };
}
