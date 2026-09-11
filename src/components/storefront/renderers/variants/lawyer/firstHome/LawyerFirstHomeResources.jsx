import { ArrowUpRight } from 'lucide-react';
import { isStorefrontHashTargetAvailable } from '@/components/storefront/storefrontContentVisibility';
import { LawyerEditableText as EditableText } from '../shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
  lawyerClassicItemSurface,
  lawyerClassicPaddingClass,
  lawyerClassicSectionStyle,
  resolveLawyerClassicIcon,
  resolveLawyerClassicItems,
} from '../shared/lawyerSectionUtils';

const RESOURCE_FALLBACK = [
  {
    title: 'Offer review checklist',
    description: 'Know the legal clauses, conditions, and dates worth reviewing before the deal moves forward.',
    icon: 'contract',
  },
  {
    title: 'Closing-cost planner',
    description: 'Prepare for legal fees, disbursements, transfer charges, adjustments, and final funds.',
    icon: 'dollar',
  },
  {
    title: 'Signing-day guide',
    description: 'Understand identification, insurance, lender instructions, and the documents you will sign.',
    icon: 'file',
  },
  {
    title: 'Keys-and-registration roadmap',
    description: 'See how funds, registration, possession, and final reporting come together on closing day.',
    icon: 'home',
  },
];

function safeResourceTarget(value) {
  const target = String(value || '').trim();
  if (!target || /[\u0000-\u001f\u007f\\]/.test(target)) return '';
  if (/^#[a-z][\w:.-]*$/i.test(target)) return target;
  if (/^\/(?!\/)/.test(target)) return target;
  try {
    const parsed = new URL(target);
    return ['http:', 'https:'].includes(parsed.protocol) ? target : '';
  } catch {
    return '';
  }
}

export function LawyerFirstHomeResources({ profile, block }) {
  const content = blockContent(block);
  const layout = block?.data?.layout || block?.layout || {};
  const sectionStyle = lawyerClassicSectionStyle(block);
  const items = resolveLawyerClassicItems(content, RESOURCE_FALLBACK, 6);
  const columns = layout.columns || 2;
  const padding = layout.padding || 'small';
  const hasCustomText = Boolean(String(sectionStyle.textColor || '').trim());

  return (
    <div
      id="buyer-toolkit"
      className={`relative w-full max-w-none overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16 ${lawyerClassicPaddingClass(padding)}`}
      style={{
        ...(sectionStyle.background ? { backgroundColor: sectionStyle.background } : {}),
        ...(sectionStyle.textColor ? { color: sectionStyle.textColor } : {}),
      }}
    >
      <div className="w-full min-w-0">
        <div className="min-w-0 max-w-4xl" data-storefront-anim-item="true">
          <EditableText
            as="p"
            field="content.eyebrow"
            label="Toolkit eyebrow"
            source={content.eyebrow ? 'persisted' : 'fallback'}
            className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent"
          >
            {content.eyebrow || 'Your first-home legal toolkit'}
          </EditableText>
          <EditableText
            as="h2"
            field="content.heading"
            label="Toolkit heading"
            source={content.heading ? 'persisted' : 'fallback'}
            className={`mt-4 max-w-none font-serif text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl xl:whitespace-nowrap ${hasCustomText ? 'text-current' : 'text-primary'}`}
          >
            {content.heading || 'Useful guidance before every important milestone'}
          </EditableText>
          <EditableText
            as="p"
            field="content.body"
            label="Toolkit supporting copy"
            source={content.body ? 'persisted' : 'fallback'}
            className="mt-5 max-w-none text-[15px] leading-7 text-current opacity-70 xl:whitespace-nowrap"
          >
            {content.body || 'Practical resources help you prepare better questions and keep the legal file moving.'}
          </EditableText>
          <div className="mt-8">
            <EditableText
              as="span"
              field="content.resource_label"
              label="Toolkit resource label"
              source={content.resource_label ? 'persisted' : 'fallback'}
              className="text-[10px] font-bold uppercase leading-4 tracking-[0.18em] text-current opacity-55"
            >
              {content.resource_label || 'Buyer-ready planning resources'}
            </EditableText>
          </div>
        </div>

        <div className={`mt-10 grid min-w-0 gap-4 ${lawyerClassicGridClass(columns, items.length)}`} data-first-home-grid="resources">
          {items.map((item, index) => {
            const Icon = resolveLawyerClassicIcon(item, index, ['contract', 'dollar', 'file', 'home']);
            const cardUsesCurrentText = hasCustomText || Boolean(String(item.text_color || '').trim());
            const iconBackground = item.icon_background || content.icon_background || '';
            const iconColor = item.icon_color || content.icon_color || '';
            const requestedTarget = safeResourceTarget(
              item.link_disabled === true
                ? ''
                : (item.url || item.href || ['#documents', '#fees', '#documents', '#closing-roadmap'][index]),
            );
            const target = isStorefrontHashTargetAvailable(profile, requestedTarget)
              ? requestedTarget
              : '';
            const Card = target ? 'a' : 'article';
            return (
              <Card
                key={item.id || `${item.title}-${index}`}
                {...(target ? {
                  href: target,
                  'aria-label': `${item.title}: view related section`,
                  ...(target.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
                } : {})}
                className="group relative min-h-[13.5rem] min-w-0 overflow-hidden border border-primary/12 bg-white/75 p-5 shadow-[0_20px_60px_rgba(31,40,57,.06)] transition duration-300 hover:-translate-y-1 hover:border-accent/55 hover:shadow-[0_24px_70px_rgba(31,40,57,.12)] xl:p-6"
                style={lawyerClassicItemSurface(item)}
                data-storefront-anim-item="true"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center border border-accent/35 bg-accent/10 text-accent transition duration-300 group-hover:bg-accent group-hover:text-white"
                    style={{
                      ...(iconBackground ? { backgroundColor: iconBackground } : {}),
                      ...(iconColor ? { color: iconColor } : {}),
                    }}
                  >
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <EditableText
                    as="h3"
                    field={`content.items.${index}.title`}
                    label={`Toolkit card ${index + 1} title`}
                    source="persisted"
                    collection="items"
                    itemId={item.id}
                    itemIndex={index}
                    itemField="title"
                    className={`min-w-0 flex-1 font-serif text-xl font-semibold leading-snug ${cardUsesCurrentText ? 'text-current' : 'text-primary'}`}
                  >
                    {item.title}
                  </EditableText>
                </div>
                <EditableText
                  as="p"
                  field={`content.items.${index}.description`}
                  label={`Toolkit card ${index + 1} description`}
                  source="persisted"
                  collection="items"
                  itemId={item.id}
                  itemIndex={index}
                  itemField="description"
                  className="mt-3 text-sm leading-6 text-current opacity-65"
                >
                  {item.description}
                </EditableText>
                <ArrowUpRight
                  size={18}
                  className="absolute bottom-5 right-5 text-accent opacity-45 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
