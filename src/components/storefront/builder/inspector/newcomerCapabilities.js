import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';

const BASE = Object.freeze({
  content: Object.freeze({ eyebrow: true, heading: true, body: true }),
  layout: Object.freeze({
    alignment: true,
    padding: true,
    columns: false,
    cardStyle: false,
    buttonLayout: false,
  }),
  style: Object.freeze({ sectionColors: true }),
});

export const LAWYER_NEWCOMER_CAPABILITIES = Object.freeze({
  [T.HERO]: {
    ...BASE,
    content: { ...BASE.content, primaryCta: true, secondaryCta: true },
    layout: { ...BASE.layout, alignment: false, padding: false, mediaPosition: true },
    style: { ...BASE.style, heroControls: true },
  },
  [T.ABOUT]: BASE,
  [T.PRACTICE_AREAS]: {
    ...BASE,
    content: { ...BASE.content, items: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style, iconColors: true },
  },
  [T.SERVICES]: {
    ...BASE,
    content: { ...BASE.content, items: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style, iconColors: true },
  },
  [T.GUIDANCE]: {
    ...BASE,
    content: { ...BASE.content, steps: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style, processColors: true },
  },
  [T.CREDENTIALS]: {
    ...BASE,
    content: { ...BASE.content, metricVisibility: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true },
    style: { ...BASE.style, itemColors: true },
  },
  [T.TESTIMONIALS]: {
    ...BASE,
    content: { ...BASE.content, items: true },
    layout: { ...BASE.layout, columns: true },
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
  },
});

export function lawyerNewcomerCapabilities(blockType) {
  return LAWYER_NEWCOMER_CAPABILITIES[blockType] || BASE;
}
