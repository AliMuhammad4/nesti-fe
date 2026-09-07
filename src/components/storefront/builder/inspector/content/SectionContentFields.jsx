import { STOREFRONT_BLOCK_TYPES as T } from '../../../storefrontPresets';
import { ImageAdjustmentControls, MediaPicker } from '../../builderUiPrimitives';
import { InspectorInput, InspectorTextarea, bindContent } from '../inspectorUi';

function AboutMediaFields({
  block,
  model,
  media,
  brandKit,
  onMediaUpload,
  onBrandKitChange,
}) {
  const { isBrokerClassic, isElementSelection } = model;
  if (block.type !== T.ABOUT || !isBrokerClassic || isElementSelection) return null;

  const profileImage = media?.profile || brandKit?.profile_photo_url || '';

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">About photo</p>
      <MediaPicker
        label="Advisor portrait"
        hint="Displayed in the About section. Also used in the footer where applicable."
        image={profileImage}
        onUpload={(file) => onMediaUpload?.('profile', file)}
        tall
      />
      {profileImage ? (
        <ImageAdjustmentControls
          image={profileImage}
          kind="profile"
          editorKind="about-portrait"
          label="about photo"
          values={brandKit}
          onChange={onBrandKitChange}
        />
      ) : null}
    </div>
  );
}

export function AboutContentFields({
  block,
  model,
  profile,
  templateKey,
  onChange,
  media,
  brandKit,
  onMediaUpload,
  onBrandKitChange,
}) {
  const {
    isSellerExpertTemplate,
    isLawyerInvestor,
    isCommunityTemplate,
    isLayeredLawyerTemplate,
    isLawyerFirstHome,
    isBrokerClassic,
    isBrokerFirstHome,
    isElementSelection,
    contentValue,
  } = model;
  if (block.type !== T.ABOUT || isElementSelection || isSellerExpertTemplate || isCommunityTemplate) return null;
  const setContent = bindContent(onChange, block.id);
  return (
    <>
      <AboutMediaFields
        block={block}
        model={model}
        media={media}
        brandKit={brandKit}
        onMediaUpload={onMediaUpload}
        onBrandKitChange={onBrandKitChange}
      />
      {isBrokerFirstHome ? (
        <InspectorTextarea
          label="Trust statement"
          value={contentValue('trust_statement')}
          onChange={setContent('trust_statement')}
          placeholder="Advice shaped around your budget, timeline, and long-term comfort."
          className="min-h-24 resize-y"
        />
      ) : null}
      {isLayeredLawyerTemplate ? (
        <>
          <InspectorInput label="Image name" value={contentValue('image_name')} onChange={setContent('image_name')} placeholder={profile?.professional_name || 'Your lawyer'} />
          <InspectorInput label="Image role" value={contentValue('image_role')} onChange={setContent('image_role')} placeholder="Real Estate Lawyer" />
          {isLawyerFirstHome ? (
            <>
              <InspectorInput label="About detail title" value={contentValue('about_label')} onChange={setContent('about_label')} placeholder="Clear from offer to keys" />
              <InspectorTextarea
                label="About detail description"
                value={contentValue('about_note')}
                onChange={setContent('about_note')}
                placeholder="Practical answers at every stage of the closing."
              />
              <InspectorInput label="Practice label" value={contentValue('practice_label')} onChange={setContent('practice_label')} placeholder="Practice" />
              <InspectorInput label="Practice value" value={contentValue('practice_value')} onChange={setContent('practice_value')} placeholder="Residential real estate law" />
            </>
          ) : null}
        </>
      ) : !isBrokerClassic ? (
        <InspectorInput
          label={templateKey === 'agent-luxury-advisor' ? 'Advisor credential' : 'Practice badge'}
          value={contentValue('about_badge')}
          onChange={setContent('about_badge')}
          placeholder={templateKey === 'agent-luxury-advisor' ? 'Real Estate Market Advisor' : 'A relationship-first real estate practice'}
        />
      ) : null}
      {templateKey === 'agent-luxury-advisor' ? (
        <>
          <InspectorInput label="Editorial label" value={contentValue('about_label')} onChange={setContent('about_label')} placeholder="The advisory standard" />
          <InspectorInput label="Profile note" value={contentValue('about_note')} onChange={setContent('about_note')} placeholder="Confidential · Considered · Personal" />
        </>
      ) : null}
    </>
  );
}

export function CtaContentFields({ block, model, onChange }) {
  const {
    isElementSelection,
    isCommunityTemplate,
    isSellerExpertTemplate,
    isLawyerInvestor,
    isBrokerClassic,
    contentValue,
  } = model;
  if (block.type !== T.CTA || isElementSelection) return null;
  const setContent = bindContent(onChange, block.id);
  return (
    <>
      <InspectorInput
        label={isCommunityTemplate || isLawyerInvestor ? 'Primary inquiry button' : isBrokerClassic ? 'Primary button' : 'Appointment button'}
        value={contentValue('cta_label')}
        onChange={setContent('cta_label')}
        placeholder={isBrokerClassic ? 'Find My Mortgage Options' : isCommunityTemplate ? 'Send detailed inquiry' : 'Ask about availability'}
      />
      {!isSellerExpertTemplate ? (
        <>
          {!isCommunityTemplate ? (
            <InspectorInput
              label={isLawyerInvestor ? 'Appointment button' : isBrokerClassic ? 'Secondary button' : 'Inquiry button'}
              value={contentValue('secondary_cta_label')}
              onChange={setContent('secondary_cta_label')}
              placeholder={isBrokerClassic ? 'Book a Consultation' : 'Send detailed inquiry'}
            />
          ) : null}
          <InspectorTextarea
            label={isCommunityTemplate ? 'Helper text under button' : 'Helper text under buttons'}
            value={contentValue('helper_text')}
            onChange={setContent('helper_text')}
            placeholder="Submit an inquiry and the professional will confirm an available time with you."
          />
        </>
      ) : null}
    </>
  );
}
