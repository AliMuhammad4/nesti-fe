import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';

const BASE = Object.freeze({
  content: Object.freeze({ eyebrow: true, heading: true, body: true }),
  layout: Object.freeze({ alignment: true, padding: true, columns: false, cardStyle: false }),
  style: Object.freeze({ sectionColors: true }),
});

export const LAWYER_INVESTOR_CAPABILITIES = Object.freeze({
  [T.HERO]: {
    ...BASE,
    content: { ...BASE.content, primaryCta: true, secondaryCta: true, joinCta: false },
    layout: { alignment: false, padding: false, columns: false, cardStyle: false, mediaPosition: true },
    style: { ...BASE.style, heroControls: true },
  },
  [T.ABOUT]: {
    ...BASE,
    content: { ...BASE.content, imageIdentity: true },
    layout: { ...BASE.layout, mediaPosition: false },
  },
  [T.PRACTICE_SNAPSHOT]: {
    ...BASE,
    content: { ...BASE.content, profileSyncedGroups: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style },
  },
  [T.SERVICES]: {
    ...BASE,
    content: { ...BASE.content, resourceLabel: true, items: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style, iconColors: true, itemColors: true },
  },
  [T.ROLE_DETAILS]: {
    ...BASE,
    content: { ...BASE.content, cta: true, highlights: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style, panelColors: true, itemColors: true },
  },
  [T.PRACTICE_AREAS]: {
    ...BASE,
    content: { ...BASE.content, items: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style, iconColors: true, itemColors: true },
  },
  [T.GUIDANCE]: {
    ...BASE,
    content: { ...BASE.content, steps: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style, processColors: true, itemColors: true },
  },
  [T.CREDENTIALS]: {
    ...BASE,
    content: { ...BASE.content, metricVisibility: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style, itemColors: true },
  },
  [T.CTA]: {
    ...BASE,
    content: { ...BASE.content, primaryCta: true, secondaryCta: true, helperText: true },
    layout: { ...BASE.layout, buttonLayout: true },
    style: { ...BASE.style, buttonColors: true },
  },
  [T.FOOTER]: {
    ...BASE,
    content: { ...BASE.content, eyebrow: false, footerFields: true, links: true },
    layout: { ...BASE.layout, columns: false },
    style: { ...BASE.style, contrastSafe: true },
  },
});

export function lawyerInvestorCapabilities(blockType) {
  return LAWYER_INVESTOR_CAPABILITIES[blockType] || BASE;
}
