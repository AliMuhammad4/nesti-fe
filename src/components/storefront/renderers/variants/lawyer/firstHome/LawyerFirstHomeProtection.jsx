import { ArrowRight } from 'lucide-react';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicBandColors,
  lawyerClassicGridClass,
  lawyerClassicItemSurface,
  lawyerClassicPaddingClass,
  lawyerClassicSectionStyle,
  resolveLawyerClassicIcon,
} from '../shared/lawyerSectionUtils';

const PROTECTION_FALLBACK = [
  {
    id: 'protection-agreement',
    title: 'Agreement safeguards',
    text: 'Review conditions, deadlines, representations, and obligations before they create avoidable risk.',
    icon: 'contract',
  },
  {
    id: 'protection-title',
    title: 'Title and ownership',
    text: 'Confirm title, ownership structure, registrations, and issues that may affect your legal interest.',
    icon: 'shield',
  },
  {
    id: 'protection-financing',
    title: 'Financing coordination',
    text: 'Align lender instructions, insurance, identification, and final funds before signing.',
    icon: 'landmark',
  },
  {
    id: 'protection-closing',
    title: 'Closing readiness',
    text: 'Track documents, adjustments, registration, possession, and the final path to receiving your keys.',
    icon: 'home',
  },
];

function resolveHighlights(content) {
  const source = Array.isArray(content.highlights)
    ? content.highlights
    : PROTECTION_FALLBACK;
  return source
    .map((item, index) => ({
      id: item?.id || `protection-${index}`,
      title: String(item?.title || '').trim(),
      text: item?.text || item?.description || '',
      icon: item?.icon || PROTECTION_FALLBACK[index % PROTECTION_FALLBACK.length].icon,
      background: item?.background || '',
      text_color: item?.text_color || '',
    }))
    .filter((item) => item.title)
    .slice(0, 6);
}

export function LawyerFirstHomeProtection({ actions = {}, block }) {
  const content = blockContent(block);
  const layout = block?.data?.layout || block?.layout || {};
  const sectionStyle = lawyerClassicSectionStyle(block);
  const padding = layout.padding || 'small';
  const highlights = resolveHighlights(content);
  const panelBackground = String(content.panel_background || '').trim();
  const panelTextColor = String(content.panel_text_color || '').trim();
  const band = lawyerClassicBandColors(sectionStyle, {
    emptyBackgrounds: ['', '#1f2839', '#101a2b'],
    themeBackground: 'var(--storefront-primary, #1f2839)',
    themeText: 'var(--storefront-primary-contrast, #ffffff)',
    fallbackDark: '#1f2839',
  });

  return (
    <div
      id="buyer-protection"
      className={`relative isolate w-full max-w-none overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-20 ${lawyerClassicPaddingClass(padding)}`}
      style={{ backgroundColor: band.background, color: band.color }}
    >
      <div className="pointer-events-none absolute -right-32 -top-44 h-[30rem] w-[30rem] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-14 -top-24 h-[20rem] w-[20rem] rounded-full border border-accent/20" />
      <div className="relative" data-first-home-grid="protection-shell">
        <div className="border-b border-white/10 pb-10" data-storefront-anim-item="true">
          <div className="max-w-3xl">
            <EditableText
              as="p"
              field="content.eyebrow"
              label="Protection eyebrow"
              source={content.eyebrow ? 'persisted' : 'fallback'}
              className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
            >
              {content.eyebrow || 'Built-in buyer protection'}
            </EditableText>
            <EditableText
              as="h2"
              field="content.heading"
              label="Protection heading"
              source={content.heading ? 'persisted' : 'fallback'}
              className="mt-4 max-w-none font-serif text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl lg:whitespace-nowrap lg:text-[2.5rem] xl:text-[2.75rem]"
            >
              {content.heading || 'Legal diligence at the moments that matter most'}
            </EditableText>
          </div>
          <div className="mt-6 max-w-3xl">
            <EditableText
              as="p"
              field="content.body"
              label="Protection supporting copy"
              source={content.body ? 'persisted' : 'fallback'}
              className="text-[15px] leading-7 text-current opacity-70"
            >
              {content.body || 'Your legal plan connects the agreement, title, financing, funds, and final registration into one coordinated closing.'}
            </EditableText>
            <button
              type="button"
              onClick={() => actions.onCtaClick?.('first_home_protection')}
              className="mt-6 inline-flex items-center gap-3 border border-accent bg-accent px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-accent-contrast transition hover:bg-transparent hover:text-current"
            >
              <EditableText
                as="span"
                field="content.cta_label"
                label="Protection button"
                source={content.cta_label ? 'persisted' : 'fallback'}
              >
                {content.cta_label || 'Discuss my purchase'}
              </EditableText>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className={`mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 ${lawyerClassicGridClass(layout.columns || 2, highlights.length)}`}
          data-first-home-grid="protection-cards"
          style={{
            ...(panelBackground ? { backgroundColor: panelBackground } : {}),
            ...(panelTextColor ? { color: panelTextColor } : {}),
          }}
        >
          {highlights.map((item, index) => {
            const Icon = resolveLawyerClassicIcon(item, index, ['contract', 'shield', 'landmark', 'home']);
            return (
              <article
                key={item.id}
                className="group relative min-h-[15rem] bg-[color-mix(in_srgb,var(--storefront-primary,#1f2839)_94%,#ffffff)] p-6 transition duration-300 hover:bg-[color-mix(in_srgb,var(--storefront-primary,#1f2839)_86%,#ffffff)] sm:p-7"
                style={{
                  ...(panelBackground ? { backgroundColor: panelBackground } : {}),
                  ...(panelTextColor ? { color: panelTextColor } : {}),
                  ...lawyerClassicItemSurface(item),
                }}
                data-storefront-anim-item="true"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center border border-accent/35 text-accent">
                    <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <EditableText
                    as="h3"
                    field={`content.highlights.${index}.title`}
                    label={`Protection card ${index + 1} title`}
                    source="persisted"
                    collection="highlights"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="title"
                    className="min-w-0 flex-1 font-serif text-xl font-semibold leading-snug text-current"
                  >
                    {item.title}
                  </EditableText>
                </div>
                <EditableText
                  as="p"
                  field={`content.highlights.${index}.text`}
                  label={`Protection card ${index + 1} description`}
                  source="persisted"
                  collection="highlights"
                  itemId={item.id}
                  itemIndex={index}
                  itemField="text"
                  className="mt-5 text-sm leading-6 text-current opacity-60"
                >
                  {item.text}
                </EditableText>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
