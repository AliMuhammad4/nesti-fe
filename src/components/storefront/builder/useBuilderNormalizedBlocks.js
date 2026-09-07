import { useEffect, useMemo } from 'react';
import { migrateLawyerFirstHomeBlocks } from '../templates/lawyer/firstHomeMigration';
import { migrateLawyerInvestorBlocks } from '../templates/lawyer/investorMigration';
import { migrateLawyerNewcomerBlocks } from '../templates/lawyer/newcomerMigration';
import {
  migrateBrokerClassicBlocks,
} from '../templates/mortgage-broker/classicMigration';
import {
  migrateBrokerFirstHomeBlocks,
} from '../templates/mortgage-broker/firstHomeMigration';
import { materializeTemplate } from '../templates';
import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import {
  insertBlockAtTemplateRank,
  normalizeBlocks,
} from './storefrontBuilderState';
import { blockLayoutStyleSignature } from './builderWorkspaceUtils';

function migrateBlocksForTemplate(templateKey, blocks, profile, brandKit) {
  const defaults = materializeTemplate(templateKey, profile, brandKit)?.blocks || [];
  if (templateKey === 'lawyer-investor') {
    return normalizeBlocks(migrateLawyerInvestorBlocks(blocks, defaults));
  }
  if (templateKey === 'lawyer-first-home-closing') {
    return normalizeBlocks(migrateLawyerFirstHomeBlocks(blocks, defaults));
  }
  if (templateKey === 'lawyer-newcomer') {
    return normalizeBlocks(migrateLawyerNewcomerBlocks(blocks, defaults));
  }
  if (templateKey === 'mortgage_broker-classic') {
    return normalizeBlocks(migrateBrokerClassicBlocks(blocks, defaults));
  }
  if (templateKey === 'mortgage_broker-first-home') {
    return normalizeBlocks(migrateBrokerFirstHomeBlocks(blocks, defaults, profile));
  }
  return normalizeBlocks(blocks);
}

function restoreLawyerClassicFaqBlock(next, templateKey, profile, brandKit) {
  if (templateKey !== 'lawyer-classic') return next;
  if (next.some((block) => block.type === STOREFRONT_BLOCK_TYPES.FAQ)) return next;

  const templateFaq = materializeTemplate(templateKey, profile, brandKit)?.blocks
    ?.find((block) => block.type === STOREFRONT_BLOCK_TYPES.FAQ);
  if (!templateFaq) return next;

  const guidanceContent = next.find(
    (block) => block.type === STOREFRONT_BLOCK_TYPES.GUIDANCE,
  )?.data?.content || {};
  const templateFaqs = templateFaq.data?.content?.faqs || [];
  const guidanceFaqs = Array.isArray(guidanceContent.faqs) ? guidanceContent.faqs : [];
  const usesLegacyDefaultFaqs = guidanceFaqs.length === 4
    && templateFaqs.slice(0, 4).every(
      (item, index) => String(guidanceFaqs[index]?.q || '').trim() === item.q,
    );
  const migratedFaqs = usesLegacyDefaultFaqs
    ? [...guidanceFaqs, ...templateFaqs.slice(4)]
    : guidanceFaqs;
  const faqBlock = normalizeBlocks([{
    ...templateFaq,
    id: 'lawyer-classic-faq-restored',
    data: {
      ...(templateFaq.data || {}),
      content: {
        ...(templateFaq.data?.content || {}),
        ...(guidanceContent.faq_label ? { eyebrow: guidanceContent.faq_label } : {}),
        ...(guidanceContent.faq_heading ? { heading: guidanceContent.faq_heading } : {}),
        ...(migratedFaqs.length ? { faqs: migratedFaqs } : {}),
      },
    },
  }])[0];
  return insertBlockAtTemplateRank(next, faqBlock, templateKey);
}

export function useBuilderNormalizedBlocks({
  blocks,
  templateKey,
  profile,
  brandKit,
  onChange,
}) {
  const normalized = useMemo(() => {
    let next = normalizeBlocks(blocks);
    if ([
      'lawyer-investor',
      'lawyer-first-home-closing',
      'lawyer-newcomer',
      'mortgage_broker-classic',
      'mortgage_broker-first-home',
    ].includes(templateKey)) {
      return migrateBlocksForTemplate(templateKey, blocks, profile, brandKit);
    }
    return restoreLawyerClassicFaqBlock(next, templateKey, profile, brandKit);
  }, [blocks, templateKey, profile, brandKit]);

  useEffect(() => {
    if (![
      'lawyer-investor',
      'lawyer-first-home-closing',
      'lawyer-newcomer',
      'mortgage_broker-classic',
      'mortgage_broker-first-home',
    ].includes(templateKey)) return;

    const source = normalizeBlocks(blocks);
    const migrated = migrateBlocksForTemplate(templateKey, blocks, profile, brandKit);
    const signaturesMatch = templateKey === 'lawyer-newcomer'
      ? JSON.stringify(source) === JSON.stringify(migrated)
      : blockLayoutStyleSignature(source) === blockLayoutStyleSignature(migrated);
    if (signaturesMatch) return;
    onChange(migrated);
  }, [blocks, brandKit, onChange, profile, templateKey]);

  return normalized;
}
