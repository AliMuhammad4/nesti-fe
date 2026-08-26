import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { FIRST_HOME_ROADMAP_LIMIT } from '@/components/storefront/storefrontLimits';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerClassicPaddingClass,
  lawyerClassicSectionStyle,
} from '../shared/lawyerSectionUtils';

const ROADMAP_FALLBACK = [
  { title: 'Agreement checkpoint', text: 'Review conditions, deadlines, names, ownership instructions, and deal-specific risks.' },
  { title: 'Title checkpoint', text: 'Examine searches, ownership, registrations, liens, restrictions, and issues requiring action.' },
  { title: 'Funding checkpoint', text: 'Coordinate lender instructions, insurance, adjustments, final funds, and signing readiness.' },
  { title: 'Registration checkpoint', text: 'Complete signing, registration, funds movement, legal completion, and closing confirmation.' },
];

function resolveSteps(content) {
  const source = Object.prototype.hasOwnProperty.call(content, 'process_steps')
    && Array.isArray(content.process_steps)
    ? content.process_steps
    : ROADMAP_FALLBACK;
  return source
    .map((item, index) => ({
      id: item?.id || `roadmap-step-${index}`,
      title: String(item?.title || '').trim(),
      text: item?.text || item?.description || '',
    }))
    .filter((item) => item.title)
    .slice(0, FIRST_HOME_ROADMAP_LIMIT);
}

export function LawyerFirstHomeRoadmap({ block }) {
  const content = blockContent(block);
  const layout = block?.data?.layout || block?.layout || {};
  const sectionStyle = lawyerClassicSectionStyle(block);
  const steps = resolveSteps(content);
  const padding = layout.padding || 'small';
  const hasCustomText = Boolean(String(sectionStyle.textColor || '').trim());

  return (
    <div
      id="closing-roadmap"
      className={`relative w-full max-w-none overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-20 ${lawyerClassicPaddingClass(padding)}`}
      style={{
        ...(sectionStyle.background ? { backgroundColor: sectionStyle.background } : {}),
        ...(sectionStyle.textColor ? { color: sectionStyle.textColor } : {}),
      }}
    >
      <div className="border-b border-primary/10 pb-9" data-first-home-grid="roadmap-shell">
        <div className="max-w-5xl" data-storefront-anim-item="true">
          <EditableText
            as="p"
            field="content.eyebrow"
            label="Roadmap eyebrow"
            source={content.eyebrow ? 'persisted' : 'fallback'}
            className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            {content.eyebrow || 'Legal checkpoints'}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="Roadmap heading"
            source={content.heading ? 'persisted' : 'fallback'}
            className={`mt-4 max-w-none font-serif text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl xl:whitespace-nowrap ${hasCustomText ? 'text-current' : 'text-primary'}`}
          >
            {content.heading || 'Where your lawyer protects the deal'}
          </EditableText>
          <EditableText
            as="p"
            field="content.body"
            label="Roadmap supporting copy"
            source={content.body ? 'persisted' : 'fallback'}
            className="mt-5 max-w-3xl text-[15px] leading-7 text-current opacity-65"
            animated
          >
            {content.body || 'Follow the legal reviews and risk controls that keep your purchase ready to close.'}
          </EditableText>
        </div>
      </div>

      <div className="mt-9">
        <div className="mb-7 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,.72fr)] md:items-end md:gap-10" data-first-home-stack="mobile" data-storefront-anim-item="true">
          <div>
            <EditableText
              as="p"
              field="content.process_label"
              label="Roadmap process label"
              source={content.process_label ? 'persisted' : 'fallback'}
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent"
            >
              {content.process_label || 'Lawyer responsibilities'}
            </EditableText>
            <EditableText
              as="h3"
              field="content.process_heading"
              label="Roadmap process heading"
              source={content.process_heading ? 'persisted' : 'fallback'}
              className={`mt-2 font-serif text-2xl font-semibold ${hasCustomText ? 'text-current' : 'text-primary'}`}
            >
              {content.process_heading || 'Four checkpoints, one protected transaction'}
            </EditableText>
          </div>
          <EditableText
            as="p"
            field="content.process_body"
            label="Roadmap process description"
            source={content.process_body ? 'persisted' : 'fallback'}
            className="max-w-lg text-xs leading-5 text-current opacity-60 md:justify-self-end"
          >
            {content.process_body || 'Each checkpoint resolves a different category of legal, title, funding, or registration risk.'}
          </EditableText>
        </div>

        <div className={`grid gap-px overflow-hidden border border-primary/10 bg-primary/10 shadow-[0_18px_50px_rgba(31,40,57,.06)] ${lawyerClassicGridClass(layout.columns || 4, steps.length)}`} data-first-home-grid="roadmap-steps">
          {steps.map((step, index) => (
            <article
              key={step.id}
              className="group relative min-h-[12.5rem] bg-white/90 p-6 transition duration-300 hover:z-10 hover:bg-white hover:shadow-[0_14px_35px_rgba(31,40,57,.09)]"
              data-storefront-anim-item="true"
            >
              <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center border border-accent/35 bg-accent/10 font-serif text-xs font-semibold text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <EditableText
                  as="h4"
                  field={`content.process_steps.${index}.title`}
                  label={`Roadmap step ${index + 1} title`}
                  source="persisted"
                  collection="process_steps"
                  itemId={step.id}
                  itemIndex={index}
                  itemField="title"
                  className={`min-w-0 flex-1 font-serif text-lg font-semibold leading-snug ${hasCustomText ? 'text-current' : 'text-primary'}`}
                >
                  {step.title}
                </EditableText>
                {index < steps.length - 1 ? (
                  <ArrowRight size={16} className="hidden shrink-0 text-accent/60 transition-transform duration-300 group-hover:translate-x-1 xl:block" aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={18} className="shrink-0 text-accent" aria-hidden="true" />
                )}
              </div>
              <EditableText
                as="p"
                field={`content.process_steps.${index}.text`}
                label={`Roadmap step ${index + 1} description`}
                source="persisted"
                collection="process_steps"
                itemId={step.id}
                itemIndex={index}
                itemField="text"
                className="mt-5 text-sm leading-6 text-current opacity-65"
              >
                {step.text}
              </EditableText>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
