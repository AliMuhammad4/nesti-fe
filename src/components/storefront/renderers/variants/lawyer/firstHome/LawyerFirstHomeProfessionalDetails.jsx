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

const ENGAGEMENT_FALLBACK = [
  { title: 'Standard purchase closing', description: 'Agreement intake, title review, lender coordination, signing, registration, and closing reporting.', icon: 'contract' },
  { title: 'Quoted separately when needed', description: 'Complex title issues, private financing, assignments, corporate ownership, or unusual negotiations may require added scope.', icon: 'clipboard' },
  { title: 'Confirmed before work starts', description: 'Your retainer identifies included services, exclusions, expected disbursements, and the next decision required from you.', icon: 'shield' },
];

const LOGISTICS_FALLBACK = [
  { title: 'Jurisdiction and service area', description: 'Confirm that the property and legal matter fall within the lawyer’s licensed service area.', icon: 'landmark' },
  { title: 'Signing and appointments', description: 'Ask whether signing is available virtually, in person, or through a hybrid process for your transaction.', icon: 'calendar' },
  { title: 'Languages and accessibility', description: 'Review available languages, accommodation options, and the best way to receive explanations and documents.', icon: 'message' },
  { title: 'Response expectations', description: 'Use the inquiry form for routine matters and call the office when a deadline or closing issue is time-sensitive.', icon: 'calendar' },
];

function DetailCard({ blockType, index, item }) {
  const Icon = resolveLawyerClassicIcon(item, index);
  return (
    <article
      className="group relative min-h-[12rem] overflow-hidden border border-primary/10 bg-white/75 p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/45 hover:bg-white hover:shadow-[0_16px_38px_rgba(31,40,57,.08)]"
      data-storefront-anim-item="true"
      style={lawyerClassicItemSurface(item)}
    >
      <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center border border-accent/35 bg-accent/10 text-accent">
          <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <EditableText
          as="h3"
          field={`content.items.${index}.title`}
          label={`${blockType} card ${index + 1} title`}
          source="persisted"
          collection="items"
          itemId={item.id}
          itemIndex={index}
          itemField="title"
          className="min-w-0 flex-1 font-serif text-lg font-semibold leading-snug text-current"
        >
          {item.title}
        </EditableText>
      </div>
      <EditableText
        as="p"
        field={`content.items.${index}.description`}
        label={`${blockType} card ${index + 1} description`}
        source="persisted"
        collection="items"
        itemId={item.id}
        itemIndex={index}
        itemField="description"
        className="mt-5 text-sm leading-6 text-current opacity-65 [text-wrap:pretty]"
      >
        {item.description}
      </EditableText>
    </article>
  );
}

export function LawyerFirstHomeEngagementScope({ block }) {
  const content = blockContent(block);
  const layout = block?.data?.layout || block?.layout || {};
  const sectionStyle = lawyerClassicSectionStyle(block);
  const hasCustomText = Boolean(String(sectionStyle.textColor || '').trim());
  const items = resolveLawyerClassicItems(content, ENGAGEMENT_FALLBACK, 6);

  return (
    <div
      id="engagement-scope"
      className={`w-full max-w-none px-5 sm:px-8 lg:px-12 xl:px-20 ${lawyerClassicPaddingClass(layout.padding || 'small')}`}
      style={{
        ...(sectionStyle.background ? { backgroundColor: sectionStyle.background } : {}),
        ...(sectionStyle.textColor ? { color: sectionStyle.textColor } : {}),
      }}
    >
      <div data-first-home-grid="engagement-shell">
        <div className="border-b border-primary/10 pb-9" data-storefront-anim-item="true">
          <div className="max-w-5xl">
            <EditableText as="p" field="content.eyebrow" label="Engagement scope eyebrow" source={content.eyebrow ? 'persisted' : 'fallback'} className="text-[11px] font-bold uppercase tracking-[0.26em] text-accent">
              {content.eyebrow || 'Retainer clarity'}
            </EditableText>
            <EditableText as="h2" field="content.heading" label="Engagement scope heading" source={content.heading ? 'persisted' : 'fallback'} className={`mt-4 max-w-none font-serif text-3xl font-semibold leading-tight sm:text-4xl xl:whitespace-nowrap ${hasCustomText ? 'text-current' : 'text-primary'}`}>
              {content.heading || 'Know what the legal engagement covers'}
            </EditableText>
            <EditableText as="p" field="content.body" label="Engagement scope description" source={content.body ? 'persisted' : 'fallback'} className="mt-5 max-w-3xl text-sm leading-7 text-current opacity-65">
              {content.body || 'The final scope is confirmed in writing for your transaction before legal work begins.'}
            </EditableText>
          </div>
        </div>
        <div className={`mt-9 grid gap-4 ${lawyerClassicGridClass(layout.columns || 3, items.length)}`} data-first-home-grid="engagement-cards">
          {items.map((item, index) => (
            <DetailCard key={item.id} blockType="Engagement scope" index={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LawyerFirstHomePracticeLogistics({ block }) {
  const content = blockContent(block);
  const layout = block?.data?.layout || block?.layout || {};
  const sectionStyle = lawyerClassicSectionStyle(block);
  const hasCustomText = Boolean(String(sectionStyle.textColor || '').trim());
  const items = resolveLawyerClassicItems(content, LOGISTICS_FALLBACK, 6);

  return (
    <div
      id="service-access"
      className={`relative w-full max-w-none overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-20 ${lawyerClassicPaddingClass(layout.padding || 'small')}`}
      style={{
        ...(sectionStyle.background ? { backgroundColor: sectionStyle.background } : {}),
        ...(sectionStyle.textColor ? { color: sectionStyle.textColor } : {}),
      }}
    >
      <div className="border-b border-primary/10 pb-8" data-first-home-stack="compact">
        <div className="max-w-5xl" data-storefront-anim-item="true">
          <EditableText as="p" field="content.eyebrow" label="Service logistics eyebrow" source={content.eyebrow ? 'persisted' : 'fallback'} className="text-[11px] font-bold uppercase tracking-[0.26em] text-accent">
            {content.eyebrow || 'Service and access'}
          </EditableText>
          <EditableText as="h2" field="content.heading" label="Service logistics heading" source={content.heading ? 'persisted' : 'fallback'} className={`mt-4 max-w-none font-serif text-3xl font-semibold leading-tight sm:text-4xl xl:whitespace-nowrap ${hasCustomText ? 'text-current' : 'text-primary'}`}>
            {content.heading || 'Practical details before you open a file'}
          </EditableText>
          <EditableText as="p" field="content.body" label="Service logistics description" source={content.body ? 'persisted' : 'fallback'} className="mt-5 max-w-3xl text-sm leading-7 text-current opacity-65">
            {content.body || 'Confirm jurisdiction, appointment format, communication options, and response expectations before sharing confidential information.'}
          </EditableText>
        </div>
      </div>
      <div className={`mt-8 grid gap-3 ${lawyerClassicGridClass(layout.columns || 4, items.length)}`} data-first-home-grid="logistics-cards">
        {items.map((item, index) => (
          <DetailCard key={item.id} blockType="Service logistics" index={index} item={item} />
        ))}
      </div>
    </div>
  );
}
