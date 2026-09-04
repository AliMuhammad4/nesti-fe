import { BuilderSelect, Field, inputClass } from '../builderUiPrimitives';
import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';
import { BROKER_CLASSIC_FOOTER_ITEMS } from '../../renderers/variants/broker/classic/brokerClassicDefaults';
import {
  ExpertiseProcessEditor,
  GuidanceFaqsEditor,
  GuidanceStepsEditor,
  LawyerClassicCardsEditor,
  LenderCardsEditor,
  AlternativeCardsEditor,
  RateCardsEditor,
  RoleHighlightsEditor,
  RoleProofEditor,
  ServiceCardsEditor,
  InvestorFooterLinksEditor,
} from './InspectorCollectionEditors';
import { HeroCopyFields, HeroMediaFields } from './content/HeroContentFields';
import { AboutContentFields, CtaContentFields } from './content/SectionContentFields';
import { ExpertiseContentFields, GuidanceContentFields } from './content/GuidanceContentFields';
import {
  InspectorInput,
  InspectorNote,
  InspectorTextarea,
  bindContent,
} from './inspectorUi';

export default function InspectorContentTab({
  block,
  model,
  profile,
  templateKey,
  media,
  brandKit,
  collectionDraft,
  setCollectionDraft,
  onChange,
  onMediaUpload,
  onBrandKitChange,
}) {
  const {
    isHero,
    isElementSelection,
    isGuidance,
    isListings,
    isServices,
    hasEditableCards,
    isRoleDetails,
    isLayeredLawyerTemplate,
    isCredentials,
    isSellerCredentials,
    isLawyerClassicItemCards,
    isSellerCaseStudy,
    isLawyerClassicStatement,
    isLawyerFirstHome,
    isLawyerInvestor,
    isLawyerNewcomer,
    isBrokerClassic,
    isLawyerClassic,
    isFooter,
    investorCapabilities,
    newcomerCapabilities,
    brokerCapabilities,
    isCommunityTemplate,
    lawyerCredentialsVerified,
    collection,
    content,
    contentValue,
    contentPlaceholder,
    placeholders,
    roleDefaults,
  } = model;
  const templateCapabilities = investorCapabilities || newcomerCapabilities || brokerCapabilities;
  const setContent = bindContent(onChange, block.id);

  const showSharedEyebrow = (
    block.type === T.ABOUT
    || block.type === T.TESTIMONIALS
    || block.type === T.SELLER_PERFORMANCE
    || block.type === T.CTA
    || isListings
    || (hasEditableCards && block.type !== T.BROKER_COMPENSATION)
    || isRoleDetails
    || (isLayeredLawyerTemplate && isCredentials)
    || isSellerCredentials
    || isLawyerClassicItemCards
    || block.type === T.EXPERTISE
    || block.type === T.PRACTICE_SNAPSHOT
  ) && !isElementSelection;

  return (
    <>
      {isHero ? (
        <HeroMediaFields
          model={model}
          media={media}
          brandKit={brandKit}
          profile={profile}
          onMediaUpload={onMediaUpload}
          onBrandKitChange={onBrandKitChange}
        />
      ) : null}
      {!isHero && !isElementSelection ? (
        <InspectorInput label="Heading" value={contentValue('heading')} onChange={setContent('heading')} placeholder={placeholders.heading} />
      ) : null}
      {isGuidance && !isElementSelection ? (
        <InspectorInput label="Eyebrow" value={contentValue('eyebrow')} onChange={setContent('eyebrow')} placeholder={contentPlaceholder('eyebrow', 'Client Guide')} />
      ) : null}
      {showSharedEyebrow ? (
        <InspectorInput
          label="Eyebrow"
          value={contentValue('eyebrow')}
          onChange={setContent('eyebrow')}
          placeholder={
            hasEditableCards
              ? (isSellerCaseStudy ? 'Success story' : 'Capabilities')
              : isSellerCredentials
                ? 'Credentials and recognition'
              : isRoleDetails
                ? (roleDefaults?.eyebrow || 'Role-Based Support')
                : block.type === T.EXPERTISE
                  ? 'Professional Snapshot'
                  : isListings
                    ? (placeholders.eyebrow || 'Available properties')
                    : 'About'
          }
        />
      ) : null}
      {!isHero && !isElementSelection ? (
        <InspectorTextarea
          label="Supporting copy"
          value={contentValue('body')}
          onChange={setContent('body')}
          placeholder={placeholders.body || 'Add supporting copy…'}
          className="min-h-28 resize-y"
        />
      ) : null}
      {(isLawyerFirstHome || isLawyerInvestor) && isServices && !isElementSelection ? (
        <InspectorInput
          label={isLawyerInvestor ? 'Workstream label' : 'Toolkit resource label'}
          value={contentValue('resource_label')}
          onChange={setContent('resource_label')}
          placeholder={isLawyerInvestor ? 'Transaction workstreams' : 'Buyer-ready planning resources'}
        />
      ) : null}
      {(isLawyerFirstHome || isLawyerInvestor || isBrokerClassic) && block.type === T.PRACTICE_SNAPSHOT && !isElementSelection ? (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Snapshot card labels</p>
          {isBrokerClassic ? (
            <InspectorNote>
              Specialty, market, and language values come from your professional profile. Edit the card titles and subtitles here.
            </InspectorNote>
          ) : null}
          <InspectorInput label="Practice focus title" value={contentValue('practice_focus_label')} onChange={setContent('practice_focus_label')} placeholder="Practice focus" />
          <InspectorInput label="Practice focus subtitle" value={contentValue('practice_focus_subtitle')} onChange={setContent('practice_focus_subtitle')} placeholder="Where counsel is concentrated" />
          <InspectorInput label="Markets title" value={contentValue('markets_label')} onChange={setContent('markets_label')} placeholder="Markets served" />
          <InspectorInput label="Markets subtitle" value={contentValue('markets_subtitle')} onChange={setContent('markets_subtitle')} placeholder="Locations and closing contexts" />
          <InspectorInput label="Languages title" value={contentValue('languages_label')} onChange={setContent('languages_label')} placeholder="Languages spoken" />
          <InspectorInput label="Languages subtitle" value={contentValue('languages_subtitle')} onChange={setContent('languages_subtitle')} placeholder="Languages available for consultation" />
        </div>
      ) : null}
      {isLayeredLawyerTemplate && isCredentials && lawyerCredentialsVerified && !isElementSelection ? (
        <InspectorInput
          label="Verified profile label"
          value={contentValue('verification_label')}
          onChange={setContent('verification_label')}
          placeholder="Verified legal profile"
        />
      ) : null}
      {templateCapabilities?.content?.metricVisibility && isCredentials && !isElementSelection ? (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Profile-synced metrics</p>
          {[
            ['pipeline', 'Pipeline value'],
            ['experience', 'Experience'],
            ['clients', 'Total clients'],
            ['cases', 'Closed cases'],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2 rounded-lg border border-slate-200 bg-white p-2">
              <InspectorInput
                label={`${label} label`}
                value={content.metric_labels?.[key] || ''}
                onChange={(value) => onChange(block.id, {
                  content: { metric_labels: { ...(content.metric_labels || {}), [key]: value } },
                })}
                placeholder={label}
              />
              <Field label={`${label} icon`}>
                <BuilderSelect
                  value={content.metric_icons?.[key] || ({
                    pipeline: 'dollar',
                    experience: 'calendar',
                    clients: 'users',
                    cases: 'file',
                  }[key])}
                  options={[
                    { value: 'dollar', label: 'Currency' },
                    { value: 'calendar', label: 'Calendar' },
                    { value: 'users', label: 'People' },
                    { value: 'file', label: 'File check' },
                    { value: 'briefcase', label: 'Briefcase' },
                    { value: 'shield', label: 'Shield' },
                  ]}
                  onChange={(value) => onChange(block.id, {
                    content: { metric_icons: { ...(content.metric_icons || {}), [key]: value } },
                  })}
                  ariaLabel={`${label} icon`}
                />
              </Field>
              <Field label={`${label} visibility`}>
                <BuilderSelect
                  value={(content.hidden_metrics || []).includes(key) ? 'hidden' : 'visible'}
                  options={[
                    { value: 'visible', label: 'Visible' },
                    { value: 'hidden', label: 'Hidden' },
                  ]}
                  onChange={(value) => {
                    const hidden = new Set(Array.isArray(content.hidden_metrics) ? content.hidden_metrics : []);
                    if (value === 'hidden') hidden.add(key);
                    else hidden.delete(key);
                    onChange(block.id, { content: { hidden_metrics: [...hidden] } });
                  }}
                  ariaLabel={`${label} visibility`}
                />
              </Field>
            </div>
          ))}
          <InspectorInput
            label="Metric order"
            value={(content.metric_order || []).join(', ')}
            onChange={(value) => {
              const seen = new Set();
              const metricOrder = value
                .split(',')
                .map((item) => item.trim())
                .filter((item) => {
                  if (!['pipeline', 'experience', 'clients', 'cases'].includes(item) || seen.has(item)) {
                    return false;
                  }
                  seen.add(item);
                  return true;
                });
              onChange(block.id, { content: { metric_order: metricOrder } });
            }}
            placeholder="pipeline, experience, clients, cases"
          />
          <InspectorNote>Values stay synchronized with the professional profile. Control only visibility and order here.</InspectorNote>
        </div>
      ) : null}
      {templateCapabilities?.content?.footerFields && isFooter && !isElementSelection ? (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Footer content</p>
          <InspectorInput label="Role label" value={contentValue('role_label')} onChange={setContent('role_label')} placeholder={isLawyerNewcomer ? 'Newcomer home closing counsel' : isBrokerClassic ? 'Mortgage advisor' : 'Investor transaction counsel'} />
          <InspectorInput label="Navigation heading" value={contentValue(isBrokerClassic ? 'links_heading' : 'resource_heading')} onChange={setContent(isBrokerClassic ? 'links_heading' : 'resource_heading')} placeholder="Explore" />
          <InspectorInput label="Contact heading" value={contentValue('contact_heading')} onChange={setContent('contact_heading')} placeholder="Contact details" />
          <InspectorTextarea label="Disclaimer" value={contentValue('disclaimer')} onChange={setContent('disclaimer')} placeholder="Do not send confidential information until representation is confirmed." />
          {[
            ['show_email', 'Email'],
            ['show_phone', 'Phone'],
            ['show_booking', 'Calendly booking'],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <BuilderSelect
                value={content[key] === false ? 'hidden' : 'visible'}
                options={[
                  { value: 'visible', label: 'Visible' },
                  { value: 'hidden', label: 'Hidden' },
                ]}
                onChange={(value) => onChange(block.id, { content: { [key]: value !== 'hidden' } })}
                ariaLabel={`${label} visibility`}
              />
            </Field>
          ))}
          <InvestorFooterLinksEditor
            block={block}
            onChange={onChange}
            resolvedItems={isBrokerClassic ? BROKER_CLASSIC_FOOTER_ITEMS : []}
          />
        </div>
      ) : null}
      <AboutContentFields
        block={block}
        model={model}
        profile={profile}
        templateKey={templateKey}
        onChange={onChange}
      />
      <CtaContentFields block={block} model={model} onChange={onChange} />
      {isLawyerClassicStatement && !isElementSelection ? (
        <InspectorInput
          label={isLawyerFirstHome ? 'Protection button' : 'Statement button'}
          value={contentValue('cta_label')}
          onChange={setContent('cta_label')}
          placeholder={isLawyerFirstHome ? 'Discuss my purchase' : 'Discuss your matter'}
        />
      ) : null}
      <HeroCopyFields block={block} model={model} profile={profile} onChange={onChange} />
      {!isHero && !content.heading && placeholders.heading ? (
        <InspectorNote tone="plain-amber">
          Preview is using fallback copy until you save a heading here.
        </InspectorNote>
      ) : null}
      {hasEditableCards && (block.type === T.MORTGAGE_RATES || block.type === T.ALTERNATIVE_LENDING) && !isElementSelection ? (
        <InspectorInput
          label="CTA button label"
          value={contentValue('cta_label')}
          onChange={setContent('cta_label')}
          placeholder={block.type === T.ALTERNATIVE_LENDING ? 'Explore My Mortgage Options' : 'Get My Personalized Rate'}
        />
      ) : null}
      {hasEditableCards && block.type === T.MORTGAGE_RATES ? (
        <RateCardsEditor block={block} model={model} />
      ) : null}
      {hasEditableCards && block.type === T.ALTERNATIVE_LENDING ? (
        <AlternativeCardsEditor block={block} model={model} />
      ) : null}
      {hasEditableCards && block.type === T.MORTGAGE_PROGRAMS ? (
        <AlternativeCardsEditor
          block={block}
          model={model}
          fieldLabel="Programs"
          addLabel="Add program"
          titlePlaceholder="First-time home buyer"
          descriptionPlaceholder="Plan your down payment, affordability, and pre-approval with clear guidance."
        />
      ) : null}
      {hasEditableCards && block.type === T.BROKER_COMPENSATION ? (
        <>
          {!isElementSelection ? (
            <InspectorTextarea
              label="Disclaimer"
              value={contentValue('disclaimer')}
              onChange={setContent('disclaimer')}
              placeholder="Compensation structures vary by lender, product, and transaction type."
              className="min-h-20 resize-y"
            />
          ) : null}
          <AlternativeCardsEditor
            block={block}
            model={model}
            fieldLabel="Compensation items"
            addLabel="Add compensation item"
            titlePlaceholder="Lender compensation"
            descriptionPlaceholder="Explain how compensation works for this item."
          />
        </>
      ) : null}
      {hasEditableCards && block.type === T.LENDER_NETWORK ? (
        <LenderCardsEditor block={block} model={model} />
      ) : null}
      {hasEditableCards
        && block.type !== T.LENDER_NETWORK
        && block.type !== T.MORTGAGE_RATES
        && block.type !== T.ALTERNATIVE_LENDING
        && block.type !== T.BROKER_COMPENSATION
        && block.type !== T.MORTGAGE_PROGRAMS ? (
        <ServiceCardsEditor block={block} model={model} />
      ) : null}
      {isListings && !isElementSelection ? (
        <InspectorNote>
          Listing cards pull from your connected property inventory. Edit heading and supporting copy here; style the cards in the Style tab.
        </InspectorNote>
      ) : null}
      {collection
        && !hasEditableCards
        && !isLawyerClassicItemCards
        && !(isLayeredLawyerTemplate && isCredentials)
            && !(isFooter && templateCapabilities?.content?.links) ? (
        <Field label={collection.label}>
          <textarea
            value={collectionDraft ?? collection.format(content.items)}
            onChange={(event) => setCollectionDraft(event.target.value)}
            onBlur={() => {
              const raw = collectionDraft ?? collection.format(content.items);
              const parsed = collection.parse(raw, content.items);
              onChange(block.id, { content: { items: parsed } });
              setCollectionDraft(null);
            }}
            className={`${inputClass} min-h-32 resize-y font-mono text-xs`}
            placeholder={collection.hint}
          />
          <p className="mt-1.5 text-[10px] text-slate-400">{collection.hint}</p>
        </Field>
      ) : null}
      {isLayeredLawyerTemplate && !isLawyerInvestor && isCredentials && !isElementSelection ? (
        <InspectorNote>
          The standing metrics come from the legal profile. Edit heading and copy here; change the section colors in Style.
        </InspectorNote>
      ) : null}
      {isLawyerClassic && isCredentials && !lawyerCredentialsVerified && !isElementSelection ? (
        <InspectorNote tone="amber">
          Credential claims remain visible in this preview but stay private on the published page until the legal profile is verified. Profile details such as languages and practice affiliation can still appear.
        </InspectorNote>
      ) : null}
      <ExpertiseContentFields block={block} model={model} onChange={onChange} />
      {block.type === T.ROLE_DETAILS ? (
        <>
          <RoleHighlightsEditor block={block} model={model} />
          {isBrokerClassic && !isElementSelection ? (
            <>
              <InspectorInput
                label="Snapshot eyebrow"
                value={contentValue('snapshot_eyebrow')}
                onChange={setContent('snapshot_eyebrow')}
                placeholder="Business finance snapshot"
              />
              <InspectorInput
                label="Snapshot heading"
                value={contentValue('snapshot_heading')}
                onChange={setContent('snapshot_heading')}
                placeholder="Financing structured around your next stage of growth."
              />
              <InspectorInput
                label="Financing button"
                value={contentValue('cta_label')}
                onChange={setContent('cta_label')}
                placeholder="See What I May Qualify For"
              />
            </>
          ) : null}
          {!isCommunityTemplate && !isLawyerClassicStatement && !isBrokerClassic ? (
            <RoleProofEditor block={block} model={model} />
          ) : null}
        </>
      ) : null}
      {isLawyerClassicItemCards && !isElementSelection ? (
        <>
          {block.type === T.DOCUMENT_CHECKLIST ? (
            <InspectorTextarea
              label="Helper note"
              value={contentValue('helper_text')}
              onChange={setContent('helper_text')}
              placeholder="Send copies, not originals, until representation is confirmed."
            />
          ) : null}
          <LawyerClassicCardsEditor block={block} model={model} />
        </>
      ) : null}
      <GuidanceContentFields block={block} model={model} onChange={onChange} />
    </>
  );
}
