import {
  BuilderSelect,
  Field,
  ImageAdjustmentControls,
  MediaPicker,
  inputClass,
} from '../../builderUiPrimitives';
import { STOREFRONT_BLOCK_TYPES as T } from '../../../storefrontPresets';
import { HERO_PROOF_FIELDS } from '../inspectorConstants';
import { InspectorInput, InspectorTextarea, bindContent } from '../inspectorUi';

export function HeroMediaFields({
  model,
  media,
  brandKit,
  profile,
  onMediaUpload,
  onBrandKitChange,
}) {
  const {
    isSellerExpertTemplate,
    isLayeredLawyerTemplate,
    isLawyerInvestor,
    isBrokerClassic,
    isBrokerFirstHome,
    heroUsesProfilePhoto,
    layout,
  } = model;
  const investorMediaPosition = layout?.mediaPosition || 'portrait';
  const brokerMediaPosition = layout?.mediaPosition || 'right';
  const showCoverPicker = isBrokerFirstHome
    ? false
    : isBrokerClassic
      ? brokerMediaPosition !== 'none'
      : !isLawyerInvestor || investorMediaPosition === 'cover';
  const showProfilePicker = heroUsesProfilePhoto
    && !isBrokerFirstHome
    && (
      isBrokerClassic
      || !isLawyerInvestor
      || investorMediaPosition === 'portrait'
    );
  if (isBrokerFirstHome) {
    return (
      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Site media
        </p>
        <MediaPicker
          label="Navbar logo"
          hint="Fits automatically into the top navigation"
          image={brandKit?.logo_url || profile?.storefront_logo_url}
          onUpload={(file) => onMediaUpload?.('logo', file)}
        />
        <p className="text-[10px] leading-4 text-slate-400">
          Hero photos are managed per slide below.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {isBrokerClassic ? 'Site media' : 'Hero media'}
      </p>
      {showCoverPicker ? (
        <>
          <MediaPicker
            label="Page cover"
            hint={isLawyerInvestor
              ? 'Displayed in the Investor hero cover panel'
              : isBrokerClassic
                ? 'Displayed in the hero right column'
                : 'Shown behind the hero band'}
            image={media?.cover || brandKit?.cover_url}
            onUpload={(file) => onMediaUpload?.('cover', file)}
            tall
          />
          {(media?.cover || brandKit?.cover_url) ? (
            <ImageAdjustmentControls
              image={media?.cover || brandKit?.cover_url}
              kind="cover"
              values={brandKit}
              onChange={onBrandKitChange}
            />
          ) : null}
        </>
      ) : null}
      {showProfilePicker ? (
        <>
          <MediaPicker
            label={isBrokerClassic ? 'About advisor photo' : isSellerExpertTemplate ? 'Professional photo' : 'Page profile'}
            hint={isSellerExpertTemplate
              ? 'Used by Seller About, footer, and profile surfaces'
              : isLawyerInvestor
                ? 'Displayed in the Investor hero portrait panel and profile sections'
                : isBrokerClassic
                  ? 'Displayed in the About section advisor portrait'
                  : isLayeredLawyerTemplate
                  ? 'Used by profile sections and as a hero fallback when no cover is set'
                  : 'Displayed inside the hero card'}
            image={media?.profile || brandKit?.profile_photo_url}
            onUpload={(file) => onMediaUpload?.('profile', file)}
            circle
          />
          {(media?.profile || brandKit?.profile_photo_url) ? (
            <ImageAdjustmentControls
              image={media?.profile || brandKit?.profile_photo_url}
              kind="profile"
              editorKind="about-portrait"
              label="about photo"
              values={brandKit}
              onChange={onBrandKitChange}
            />
          ) : null}
        </>
      ) : null}
      <MediaPicker
        label="Navbar logo"
        hint="Fits automatically into the top navigation"
        image={brandKit?.logo_url || profile?.storefront_logo_url}
        onUpload={(file) => onMediaUpload?.('logo', file)}
      />
    </div>
  );
}

export function HeroCopyFields({ block, model, profile, onChange }) {
  const {
    isElementSelection,
    isLayeredLawyerTemplate,
    isLawyerFirstHome,
    isLawyerInvestor,
    isLawyerNewcomer,
    isBrokerClassic,
    isBrokerFirstHome,
    isThemeDrivenAgentHero,
    contentValue,
    placeholders,
  } = model;
  if (block.type !== T.HERO || isElementSelection) return null;
  const setContent = bindContent(onChange, block.id);
  return (
    <>
      {!isBrokerFirstHome ? (
        <InspectorInput label="Hero eyebrow" value={contentValue('eyebrow')} onChange={setContent('eyebrow')} placeholder="Full-service real estate" />
      ) : null}
      {(isLayeredLawyerTemplate || isLawyerNewcomer || isBrokerClassic) && !isBrokerFirstHome ? (
        <>
          <InspectorInput label="Hero heading" value={contentValue('heading')} onChange={setContent('heading')} placeholder={placeholders.heading} />
          <InspectorTextarea
            label="Hero description"
            value={contentValue('body')}
            onChange={setContent('body')}
            placeholder={profile?.headline || 'Clear legal guidance for your matter.'}
            className="min-h-28 resize-y"
          />
          {isLawyerFirstHome ? (
            <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Hero proof strip</p>
              {HERO_PROOF_FIELDS.map(([titleField, bodyField, placeholder], index) => (
                <div key={titleField} className="space-y-2 rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    Proof {index + 1}
                  </p>
                  <input
                    value={contentValue(titleField)}
                    onChange={(event) => onChange(block.id, { content: { [titleField]: event.target.value } })}
                    className={inputClass}
                    placeholder={placeholder}
                  />
                  <textarea
                    value={contentValue(bodyField)}
                    onChange={(event) => onChange(block.id, { content: { [bodyField]: event.target.value } })}
                    className={`${inputClass} min-h-16 resize-y`}
                    placeholder="Add a short supporting line."
                  />
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      {!isThemeDrivenAgentHero && !isLayeredLawyerTemplate && !isLawyerNewcomer && !isBrokerClassic ? (
        <>
          <InspectorInput label="Hero card name" value={contentValue('hero_name')} onChange={setContent('hero_name')} placeholder={profile?.professional_name || 'Professional'} />
          <InspectorInput label="Hero card subtitle" value={contentValue('hero_subtitle')} onChange={setContent('hero_subtitle')} placeholder={profile?.headline || 'Your trusted real estate partner'} />
        </>
      ) : null}
      {!isLayeredLawyerTemplate && !isBrokerFirstHome ? (
        <InspectorInput
          label="Company badge text"
          value={contentValue('hero_company_badge')}
          onChange={setContent('hero_company_badge')}
          placeholder={profile?.professional_profile?.company_name || 'Company name'}
        />
      ) : null}
      <InspectorInput label="Primary button label" value={contentValue('primary_cta_label')} onChange={setContent('primary_cta_label')} placeholder="Submit inquiry" />
      <InspectorInput label="Secondary button label" value={contentValue('cta_label')} onChange={setContent('cta_label')} placeholder="Book a Free Consultation" />
      {isLayeredLawyerTemplate || isBrokerClassic ? (
        <InspectorInput label="Join Nesti button label" value={contentValue('join_label')} onChange={setContent('join_label')} placeholder="Join Nesti" />
      ) : null}
      <Field label="Header navigation links">
        <BuilderSelect
          value={model.content.show_header_links === false ? 'hidden' : 'visible'}
          options={[
            { value: 'visible', label: 'Show links' },
            { value: 'hidden', label: 'Hide links' },
          ]}
          onChange={(value) => onChange(block.id, {
            content: { show_header_links: value !== 'hidden' },
          })}
          ariaLabel="Header navigation links"
        />
      </Field>
      <Field label="Right profile badge in header">
        <BuilderSelect
          value={model.content.show_header_profile ? 'visible' : 'hidden'}
          options={[
            { value: 'hidden', label: 'Hide profile badge' },
            { value: 'visible', label: 'Show profile badge' },
          ]}
          onChange={(value) => onChange(block.id, {
            content: { show_header_profile: value === 'visible' },
          })}
          ariaLabel="Header right profile badge"
        />
      </Field>
    </>
  );
}
