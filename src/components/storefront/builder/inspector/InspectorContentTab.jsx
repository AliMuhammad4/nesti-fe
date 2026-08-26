import { Field, inputClass } from '../builderUiPrimitives';
import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';
import {
  ExpertiseProcessEditor,
  GuidanceFaqsEditor,
  GuidanceStepsEditor,
  LawyerClassicCardsEditor,
  RoleHighlightsEditor,
  RoleProofEditor,
  ServiceCardsEditor,
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
    isLawyerClassic,
    isCommunityTemplate,
    lawyerCredentialsVerified,
    collection,
    content,
    contentValue,
    contentPlaceholder,
    placeholders,
    roleDefaults,
  } = model;
  const setContent = bindContent(onChange, block.id);

  const showSharedEyebrow = (
    block.type === T.ABOUT
    || block.type === T.TESTIMONIALS
    || block.type === T.SELLER_PERFORMANCE
    || block.type === T.CTA
    || isListings
    || hasEditableCards
    || isRoleDetails
    || (isLayeredLawyerTemplate && isCredentials)
    || isSellerCredentials
    || isLawyerClassicItemCards
    || block.type === T.EXPERTISE
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
      {isLawyerFirstHome && isServices && !isElementSelection ? (
        <InspectorInput
          label="Toolkit resource label"
          value={contentValue('resource_label')}
          onChange={setContent('resource_label')}
          placeholder="Buyer-ready planning resources"
        />
      ) : null}
      {isLawyerFirstHome && block.type === T.PRACTICE_SNAPSHOT && !isElementSelection ? (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Snapshot card labels</p>
          <InspectorInput label="Practice focus title" value={contentValue('practice_focus_label')} onChange={setContent('practice_focus_label')} placeholder="Practice focus" />
          <InspectorInput label="Practice focus subtitle" value={contentValue('practice_focus_subtitle')} onChange={setContent('practice_focus_subtitle')} placeholder="Where counsel is concentrated" />
          <InspectorInput label="Markets title" value={contentValue('markets_label')} onChange={setContent('markets_label')} placeholder="Markets served" />
          <InspectorInput label="Markets subtitle" value={contentValue('markets_subtitle')} onChange={setContent('markets_subtitle')} placeholder="Locations and closing contexts" />
          <InspectorInput label="Languages title" value={contentValue('languages_label')} onChange={setContent('languages_label')} placeholder="Languages spoken" />
          <InspectorInput label="Languages subtitle" value={contentValue('languages_subtitle')} onChange={setContent('languages_subtitle')} placeholder="Languages available for consultation" />
        </div>
      ) : null}
      {isLawyerFirstHome && isCredentials && !isElementSelection ? (
        <InspectorInput
          label="Verified profile label"
          value={contentValue('verification_label')}
          onChange={setContent('verification_label')}
          placeholder="Verified legal profile"
        />
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
      {hasEditableCards ? <ServiceCardsEditor block={block} model={model} /> : null}
      {isListings && !isElementSelection ? (
        <InspectorNote>
          Listing cards pull from your connected property inventory. Edit heading and supporting copy here; style the cards in the Style tab.
        </InspectorNote>
      ) : null}
      {collection && !hasEditableCards && !isLawyerClassicItemCards && !(isLayeredLawyerTemplate && isCredentials) ? (
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
      {isLawyerClassic && isCredentials && !isElementSelection ? (
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
          {!isCommunityTemplate && !isLawyerClassicStatement ? (
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
