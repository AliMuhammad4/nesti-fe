import { STOREFRONT_BLOCK_TYPES as T } from '../../../../storefrontPresets';

const BASE = Object.freeze({
  content: Object.freeze({ eyebrow: true, heading: true, body: true }),
  layout: Object.freeze({
    alignment: true,
    contentAlignment: false,
    padding: true,
    columns: false,
    cardStyle: false,
    buttonLayout: false,
  }),
  style: Object.freeze({ sectionColors: true }),
});

export const BROKER_FIRST_HOME_CAPABILITIES = Object.freeze({
  [T.HERO]: {
    ...BASE,
    content: { ...BASE.content, primaryCta: true, secondaryCta: true, slides: true },
    layout: { ...BASE.layout, alignment: false, padding: false, mediaPosition: true },
    style: { ...BASE.style, heroControls: true, buttonColors: true },
  },
  // join_label is editable via hero content fields shared with broker classic
  [T.PRACTICE_SNAPSHOT]: {
    ...BASE,
    content: { ...BASE.content },
    layout: { ...BASE.layout, columns: true, cardStyle: true, contentAlignment: true },
  },
  [T.MORTGAGE_PROGRAMS]: {
    ...BASE,
    content: { ...BASE.content, items: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true, contentAlignment: true },
    style: { ...BASE.style, iconColors: true },
  },
  [T.MORTGAGE_RATES]: {
    ...BASE,
    content: { ...BASE.content, items: true, primaryCta: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true, contentAlignment: true },
  },
  [T.SERVICES]: {
    ...BASE,
    content: { ...BASE.content, items: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true, contentAlignment: true },
    style: { ...BASE.style, iconColors: true },
  },
  [T.ABOUT]: {
    ...BASE,
    content: { ...BASE.content, trustStatement: true, profilePhoto: true },
    layout: { ...BASE.layout, contentAlignment: true },
  },
  [T.GUIDANCE]: {
    ...BASE,
    content: { ...BASE.content, steps: true },
    layout: { ...BASE.layout, columns: true, contentAlignment: true },
    style: { ...BASE.style, processColors: true },
  },
  [T.MORTGAGE_CALCULATOR]: {
    ...BASE,
    content: { ...BASE.content, primaryCta: true },
    layout: { ...BASE.layout, cardStyle: true },
  },
  [T.LENDER_NETWORK]: {
    ...BASE,
    content: { ...BASE.content, items: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true, contentAlignment: true },
  },
  [T.BROKER_COMPENSATION]: {
    ...BASE,
    content: { ...BASE.content, items: true, helperText: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true, contentAlignment: true },
  },
  [T.ALTERNATIVE_LENDING]: {
    ...BASE,
    content: { ...BASE.content, items: true, primaryCta: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true, contentAlignment: true },
    style: { ...BASE.style, iconColors: true },
  },
  [T.CREDENTIALS]: {
    ...BASE,
    content: { ...BASE.content, metricVisibility: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true, contentAlignment: true },
    style: { ...BASE.style, itemColors: true },
  },
  [T.TESTIMONIALS]: {
    ...BASE,
    content: { ...BASE.content, items: true },
    layout: { ...BASE.layout, columns: true, cardStyle: true, contentAlignment: true },
  },
  [T.FAQ]: {
    ...BASE,
    content: { ...BASE.content, faqs: true },
    layout: { ...BASE.layout, cardStyle: true, contentAlignment: true },
    style: { ...BASE.style, itemColors: true },
  },
  [T.CTA]: {
    ...BASE,
    content: { ...BASE.content, primaryCta: true, secondaryCta: true },
    layout: { ...BASE.layout, buttonLayout: true },
    style: { ...BASE.style, buttonColors: true },
  },
  [T.FOOTER]: {
    ...BASE,
    content: { ...BASE.content, eyebrow: false, footerFields: true, links: true },
    layout: { ...BASE.layout, alignment: false },
  },
});

export function brokerFirstHomeCapabilities(blockType) {
  return BROKER_FIRST_HOME_CAPABILITIES[blockType] || BASE;
}
