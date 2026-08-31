import { materializeTemplate } from '@/components/storefront/templates';
import { migrateLawyerFirstHomeBlocks } from '@/components/storefront/templates/lawyer/firstHomeMigration';
import { migrateLawyerInvestorBlocks } from '@/components/storefront/templates/lawyer/investorMigration';
import {
  migrateLawyerNewcomerBlocks,
  migrateLawyerNewcomerBrandKit,
} from '@/components/storefront/templates/lawyer/newcomerMigration';

export function resolvePublishedStorefrontBrandKit(templateKey, brandKit = {}) {
  if (templateKey === 'lawyer-newcomer') {
    return migrateLawyerNewcomerBrandKit(templateKey, brandKit);
  }
  if (templateKey !== 'agent-community-expert') return brandKit;

  const next = { ...brandKit };
  const primary = String(next.primary_color || '').trim().toLowerCase();
  const accent = String(next.accent_color || '').trim().toLowerCase();
  const canvas = String(next.page_background || '').trim().toLowerCase();
  const usesLegacyPalette = [
    '#166534|#f97316',
    '#172b42|#42b7f5',
    '#0f172a|#06b6d4',
    '#1e3a8a|#f59e0b',
  ].includes(`${primary}|${accent}`);
  const usesIndigoAccent = ['#8b5cf6', '#7c3aed', '#6366f1', '#a78bfa'].includes(accent);
  if (!usesLegacyPalette && !usesIndigoAccent) return next;
  if (usesLegacyPalette) next.primary_color = '#17152b';
  next.accent_color = '#1f6fbf';
  if (['#ffffff', '#eaf8ef', '#f7fbf6', '#f6f7f9', '#f8fafc', '#f5f7ff', '#f8f7fc'].includes(canvas)) {
    next.page_background = '#f5f7fa';
  }
  if (next.image_style === 'warm') next.image_style = 'editorial';
  return next;
}

export function normalizePublishedStorefrontBlocks(blocks = []) {
  return (Array.isArray(blocks) ? blocks : []).map((block, index) => {
    const data = block?.data || {};
    const type = block?.type || data.type || `block-${index + 1}`;
    const content = data.content || block?.content || {};
    const layout = data.layout || block?.layout || {};
    const style = data.style || block?.style || {};
    return {
      ...block,
      id: block?.id || `${type}-${index + 1}`,
      type,
      enabled: data.enabled ?? block?.enabled ?? true,
      content,
      layout,
      style,
      data: {
        ...data,
        enabled: data.enabled ?? block?.enabled ?? true,
        content,
        layout,
        style,
      },
    };
  });
}

export function canonicalPublishedStorefrontBlocks({
  templateKey,
  blocks,
  profile,
  brandKit,
}) {
  const normalized = normalizePublishedStorefrontBlocks(blocks);
  if (![
    'lawyer-investor',
    'lawyer-first-home-closing',
    'lawyer-newcomer',
  ].includes(templateKey)) return normalized;

  const defaults = materializeTemplate(templateKey, profile, brandKit)?.blocks || [];
  if (templateKey === 'lawyer-investor') {
    return migrateLawyerInvestorBlocks(normalized, defaults);
  }
  if (templateKey === 'lawyer-newcomer') {
    return migrateLawyerNewcomerBlocks(normalized, defaults);
  }
  return migrateLawyerFirstHomeBlocks(normalized, defaults);
}
