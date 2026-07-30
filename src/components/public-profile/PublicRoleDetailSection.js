'use client';

import { Sparkles } from 'lucide-react';

export const ROLE_DETAILS_DEFAULTS = {
  agent: {
    eyebrow: 'Role-Based Support',
    title: 'A clearer path for buyers, sellers, and property questions.',
    description:
      'Visitors can share their intent, budget, property needs, and timeline before the agent follows up, so every conversation starts with useful context.',
    highlights: [
      { title: 'Buyer-ready intake', text: 'Capture location, budget, home style, must-haves, mortgage status, and viewing readiness.' },
      { title: 'Seller context', text: 'Collect property address, expected price, condition, timing, and motivation for a more useful response.' },
      { title: 'Property-specific flow', text: 'Visitors can inquire from a seller property card and carry that property context into the chat.' },
    ],
    proof: ['Organized lead profile', 'Property match support', 'Consultation-ready follow-up'],
  },
  mortgage_broker: {
    eyebrow: 'Financing Support',
    title: 'Turn mortgage questions into structured pre-approval conversations.',
    description:
      'The profile guides visitors through financing goals, affordability, credit range, employment context, and timeline so the broker receives a clearer request.',
    highlights: [
      { title: 'Pre-approval path', text: 'Guide visitors through timeline, credit score range, income range, down payment, and readiness.' },
      { title: 'Affordability framing', text: 'Help buyers describe target price range, monthly comfort, and financing questions before follow-up.' },
      { title: 'Refinance and strategy', text: 'Support refinance, rate, renewal, or loan-program questions with a consistent intake flow.' },
    ],
    proof: ['Pre-approval context', 'Document readiness prompts', 'Broker-ready consultation request'],
  },
  lawyer: {
    eyebrow: 'Legal Transaction Support',
    title: 'Help visitors explain legal needs before the first follow-up.',
    description:
      'Real estate legal inquiries are organized around transaction stage, closing timeline, property value, document needs, and preferred contact method.',
    highlights: [
      { title: 'Contract questions', text: 'Capture document review, agreement, condition, amendment, or clause concerns with context.' },
      { title: 'Closing preparation', text: 'Help visitors explain where they are in the transaction and what timeline they are working toward.' },
      { title: 'Title and transfer support', text: 'Route title, refinance, transfer, and closing service needs into a clearer legal intake.' },
    ],
    proof: ['Structured legal intake', 'Transaction-stage context', 'Clear handoff for review'],
  },
};

export function getRoleDetailsDefaults(professionalType) {
  return ROLE_DETAILS_DEFAULTS[professionalType] || ROLE_DETAILS_DEFAULTS.agent;
}

export function getRoleDetailsCollectionFallback(professionalType, collection) {
  const base = getRoleDetailsDefaults(professionalType);
  if (collection === 'highlights') {
    return (base.highlights || []).map((item, index) => ({
      id: `fallback-highlight-${index}`,
      title: item.title || '',
      text: item.text || '',
      background: '',
      text_color: '',
    }));
  }
  if (collection === 'proof') {
    return (base.proof || []).map((item, index) => ({
      id: `fallback-proof-${index}`,
      text: typeof item === 'string' ? item : (item?.text || item?.title || ''),
      background: '',
      text_color: '',
    }));
  }
  return [];
}

function cardSurfaceClass(cardStyle = 'bordered') {
  return {
    flat: 'border border-transparent bg-[var(--storefront-surface,#ffffff)] shadow-none',
    bordered: 'border border-[color:var(--storefront-border,#e2e8f0)] bg-[var(--storefront-surface,#ffffff)] shadow-sm',
    elevated: 'border border-transparent bg-[var(--storefront-surface,#ffffff)] shadow-[0_14px_36px_rgba(15,23,42,0.08)]',
    glass: 'border border-white/50 bg-white/70 shadow-sm backdrop-blur-sm',
  }[cardStyle] || 'border border-[color:var(--storefront-border,#e2e8f0)] bg-[var(--storefront-surface,#ffffff)] shadow-sm';
}

function radiusClass(radius = 'default') {
  return {
    none: 'rounded-none',
    small: 'rounded-xl',
    default: 'rounded-2xl',
    large: 'rounded-[2rem]',
  }[radius] || 'rounded-2xl';
}

function shadowClass(shadow = 'none') {
  return {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-[0_20px_70px_rgba(15,23,42,0.08)]',
  }[shadow] || '';
}

export default function PublicRoleDetailSection({
  profile,
  content = {},
  sectionStyle = {},
  layout = {},
  preview = false,
  previewMode = 'desktop',
}) {
  const forceMobilePreview = Boolean(preview && previewMode === 'mobile');
  const forceTabletPreview = Boolean(preview && previewMode === 'tablet');
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
  const base = getRoleDetailsDefaults(profile?.professional_type);
  const hasCustomHighlights = Object.prototype.hasOwnProperty.call(content, 'highlights')
    && Array.isArray(content.highlights);
  const hasCustomProof = Object.prototype.hasOwnProperty.call(content, 'proof')
    && Array.isArray(content.proof);

  const highlights = (hasCustomHighlights
    ? content.highlights
    : base.highlights
  )
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const [title = '', text = ''] = item.split('|').map((part) => part.trim());
        return title
          ? {
              id: `fallback-highlight-${index}`,
              title,
              text,
              background: '',
              text_color: '',
            }
          : null;
      }
      const title = item.title || '';
      if (!title) return null;
      return {
        id: item.id || `fallback-highlight-${index}`,
        title,
        text: item.text || '',
        background: item.background || '',
        text_color: item.text_color || '',
      };
    })
    .filter(Boolean);

  const proof = (hasCustomProof ? content.proof : base.proof)
    .map((item, index) => {
      if (item == null) return null;
      if (typeof item === 'string') {
        const text = item.trim();
        return text
          ? {
              id: `fallback-proof-${index}`,
              text,
              background: '',
              text_color: '',
            }
          : null;
      }
      const text = String(item.text || item.title || '').trim();
      if (!text) return null;
      return {
        id: item.id || `fallback-proof-${index}`,
        text,
        background: item.background || '',
        text_color: item.text_color || '',
      };
    })
    .filter(Boolean);

  const eyebrow = (content.eyebrow || '').trim() || base.eyebrow;
  const title = content.heading || content.title || base.title;
  const description = content.body || content.description || base.description;
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const columns = String(layout.columns || '3');
  const gridClass = forceMobilePreview
    ? 'grid-cols-1'
    : forceTabletPreview
      ? 'sm:grid-cols-2'
      : ({
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
      }[columns] || 'lg:grid-cols-3');
  const cardStyle = layout.cardStyle || 'bordered';
  const panelRadius = radiusClass(sectionStyle.radius || 'large');
  const panelShadow = shadowClass(sectionStyle.shadow || 'large') || 'shadow-[0_20px_70px_rgba(15,23,42,0.06)]';
  const panelBackground = content.panel_background || 'var(--storefront-surface, #ffffff)';
  const panelTextColor = content.panel_text_color || '';
  const headingColor = hasCustomTextColor
    ? 'text-current'
    : 'text-[var(--storefront-heading,#0f172a)]';
  const mutedColor = hasCustomTextColor
    ? 'text-current'
    : 'text-[var(--storefront-muted,#64748b)]';

  return (
    <section
      className="py-12"
      style={{ color: sectionStyle.textColor || undefined }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`relative overflow-hidden border border-[color:var(--storefront-border,#e2e8f0)] p-5 sm:p-7 lg:p-8 ${panelRadius} ${panelShadow}`}
          style={{
            background: panelBackground,
            color: panelTextColor || undefined,
          }}
          data-storefront-field="content.panel_background"
          data-storefront-source={content.panel_background ? 'persisted' : 'fallback'}
          data-storefront-label="Role details panel"
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
            style={{ background: 'color-mix(in srgb, var(--storefront-primary, #0f766e) 18%, transparent)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full blur-3xl"
            style={{ background: 'color-mix(in srgb, var(--storefront-accent, #f59e0b) 12%, transparent)' }}
          />

          <div className="relative">
            <div className={`grid gap-8 ${forceCompactPreview ? '' : 'lg:grid-cols-[minmax(0,0.95fr)_minmax(18rem,0.75fr)] lg:items-center lg:justify-between'}`}>
              <div className="max-w-2xl">
                <div
                  data-storefront-field="content.eyebrow"
                  data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
                  data-storefront-label="Role details eyebrow"
                  className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--storefront-primary, #0f766e) 22%, transparent)',
                    background: 'color-mix(in srgb, var(--storefront-primary, #0f766e) 8%, transparent)',
                    color: panelTextColor || (hasCustomTextColor ? 'currentColor' : 'var(--storefront-primary, #0f766e)'),
                  }}
                >
                  <Sparkles size={12} />
                  {eyebrow}
                </div>
                <h2
                  data-storefront-field="content.heading"
                  data-storefront-source={content.heading || content.title ? 'persisted' : 'fallback'}
                  data-storefront-label="Role details heading"
                  className={`text-xl font-bold tracking-tight sm:text-2xl ${headingColor}`}
                  style={panelTextColor ? { color: panelTextColor } : undefined}
                >
                  {title}
                </h2>
                <p
                  data-storefront-field="content.body"
                  data-storefront-source={content.body || content.description ? 'persisted' : 'fallback'}
                  data-storefront-label="Role details description"
                  className={`mt-3 text-sm leading-6 ${mutedColor}`}
                  style={
                    panelTextColor
                      ? { color: panelTextColor, opacity: 0.86 }
                      : (hasCustomTextColor ? { opacity: 0.86 } : undefined)
                  }
                >
                  {description}
                </p>
              </div>

              <div
                className={`grid gap-2 rounded-2xl border p-3 ${forceCompactPreview ? 'w-full min-w-0' : 'ml-auto w-fit min-w-[17rem]'}`}
                style={{
                  borderColor: 'color-mix(in srgb, var(--storefront-primary, #0f766e) 18%, transparent)',
                  background: 'color-mix(in srgb, var(--storefront-primary, #0f766e) 4%, transparent)',
                }}
                data-storefront-field="content.proof_panel"
                data-storefront-source="fallback"
                data-storefront-label="Proof list"
              >
                {proof.map((item, index) => (
                    <div
                      key={item.id}
                      data-storefront-anim-item="true"
                      data-storefront-field="content.proof"
                      data-storefront-source={hasCustomProof ? 'persisted' : 'fallback'}
                      data-storefront-collection="proof"
                      data-storefront-item-id={item.id}
                      data-storefront-item-index={index}
                      data-storefront-item-field="text"
                      data-storefront-label={`Proof ${index + 1}`}
                      className={`w-fit min-w-full px-3 py-2 text-[12px] font-semibold ${cardSurfaceClass(cardStyle)} ${radiusClass('small')}`}
                      style={{
                        background: item.background || undefined,
                        color: item.text_color || panelTextColor || (hasCustomTextColor ? 'currentColor' : 'var(--storefront-heading, #0f172a)'),
                        boxShadow: item.background
                          ? undefined
                          : 'inset 0 0 0 1px color-mix(in srgb, var(--storefront-primary, #0f766e) 14%, transparent)',
                      }}
                    >
                      {item.text}
                    </div>
                  ))}
              </div>
            </div>

            <div className={`mt-6 grid auto-rows-fr grid-cols-1 gap-3 ${gridClass}`}>
              {highlights.map((item, index) => {
                const hasCardText = Boolean(item.text_color);
                return (
                  <div
                    key={item.id}
                    data-storefront-anim-item="true"
                    data-storefront-field="content.highlights"
                    data-storefront-source={hasCustomHighlights ? 'persisted' : 'fallback'}
                    data-storefront-collection="highlights"
                    data-storefront-item-id={item.id}
                    data-storefront-item-index={index}
                    data-storefront-item-field="title"
                    data-storefront-label={`Highlight ${index + 1}`}
                    className={`flex h-full flex-col p-4 ${cardSurfaceClass(cardStyle)} ${radiusClass(sectionStyle.radius || 'default')}`}
                    style={{
                      background: item.background
                        || (cardStyle === 'flat'
                          ? 'color-mix(in srgb, var(--storefront-primary, #0f766e) 3.5%, var(--storefront-surface, #ffffff))'
                          : undefined),
                      color: item.text_color || undefined,
                    }}
                  >
                    <h3
                      className={`text-sm font-bold ${hasCardText ? 'text-current' : headingColor}`}
                      style={item.text_color ? { color: item.text_color } : (panelTextColor ? { color: panelTextColor } : undefined)}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`mt-2 flex-1 text-xs leading-5 ${hasCardText ? 'text-current' : mutedColor}`}
                      style={
                        item.text_color
                          ? { color: item.text_color, opacity: 0.88 }
                          : (panelTextColor ? { color: panelTextColor, opacity: 0.86 } : (hasCustomTextColor ? { opacity: 0.86 } : undefined))
                      }
                    >
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
