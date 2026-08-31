import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';
import { SECTION_SETTINGS } from '../storefrontBuilderState';
import { BuilderSelect, ColorField, Field } from '../builderUiPrimitives';
import {
  RolePanelControls,
  ServicesIconControls,
  ProcessCardControls,
} from './InspectorAppearanceControls';

export default function InspectorStyleTab({ block, model, onChange }) {
  const {
    isHero,
    style,
    content,
    layout,
    isThemeDrivenAgentHero,
    isLayeredLawyerTemplate,
    isGuidance,
    isSellerExpertTemplate,
    isCommunityTemplate,
    hasEditableCards,
    isSellerCaseStudy,
    isRoleDetails,
    isLawyerClassic,
    isListings,
    listingThemeCards,
    templateSectionBackground,
    templateSectionTextColor,
    sellerSupportsRadiusShadow,
    isLawyerInvestor,
    isLawyerNewcomer,
    isCredentials,
    isCta,
    investorCapabilities,
    newcomerCapabilities,
  } = model;
  const investorStyle = investorCapabilities?.style || {};
  const newcomerStyle = newcomerCapabilities?.style || {};
  const templateStyle = isLawyerInvestor ? investorStyle : newcomerStyle;

  if (isHero) {
    return (
      <>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
          Design colors are used by default. Set colors here only when this Hero needs its own background, text, or button overrides.
        </p>
        <ColorField
          label="Hero background"
          value={style.background || ''}
          onChange={(background) => onChange(block.id, { style: { background } })}
        />
        {style.background ? (
          <button
            type="button"
            onClick={() => onChange(block.id, { style: { background: '' } })}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Reset hero background
          </button>
        ) : (
          <p className="text-[10px] leading-4 text-slate-400">
            Currently using the template hero background.
          </p>
        )}
        {!isThemeDrivenAgentHero && !isLayeredLawyerTemplate ? (
          <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Legacy strip</p>
            <p className="text-[10px] leading-4 text-slate-500">
              Used by older hero layouts.
            </p>
            <ColorField
              label="Strip background"
              value={content.hero_strip_background || ''}
              onChange={(hero_strip_background) => onChange(block.id, { content: { hero_strip_background } })}
            />
            {content.hero_strip_background ? (
              <button
                type="button"
                onClick={() => onChange(block.id, { content: { hero_strip_background: '' } })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Reset strip color
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Hero text + buttons</p>
          {!isThemeDrivenAgentHero && !isLayeredLawyerTemplate ? (
            <ColorField
              label="Hero surface"
              value={content.hero_card_background || ''}
              onChange={(hero_card_background) => onChange(block.id, { content: { hero_card_background } })}
            />
          ) : null}
          <ColorField
            label="Hero text color"
            value={content.hero_card_text_color || ''}
            onChange={(hero_card_text_color) => onChange(block.id, { content: { hero_card_text_color } })}
          />
          <ColorField
            label="Primary button background"
            value={content.primary_button_background || ''}
            onChange={(primary_button_background) => onChange(block.id, { content: { primary_button_background } })}
          />
          <ColorField
            label="Primary button text"
            value={content.primary_button_text_color || ''}
            onChange={(primary_button_text_color) => onChange(block.id, { content: { primary_button_text_color } })}
          />
          <ColorField
            label="Secondary button background"
            value={content.secondary_button_background || ''}
            onChange={(secondary_button_background) => onChange(block.id, { content: { secondary_button_background } })}
          />
          <ColorField
            label="Secondary button text"
            value={content.secondary_button_text_color || ''}
            onChange={(secondary_button_text_color) => onChange(block.id, { content: { secondary_button_text_color } })}
          />
          {((!isThemeDrivenAgentHero && !isLayeredLawyerTemplate && content.hero_card_background)
            || content.hero_card_text_color
            || content.primary_button_background
            || content.primary_button_text_color
            || content.secondary_button_background
            || content.secondary_button_text_color) ? (
              <button
                type="button"
                onClick={() => onChange(block.id, {
                  content: {
                    hero_card_background: '',
                    hero_card_text_color: '',
                    primary_button_background: '',
                    primary_button_text_color: '',
                    secondary_button_background: '',
                    secondary_button_text_color: '',
                  },
                })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Reset text/button colors
              </button>
            ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
        Brand colors live in <span className="font-semibold text-slate-700">Design</span>.
        Here you only override this section’s background and text when needed.
      </p>
      {isLawyerNewcomer ? (
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-500">
          Primary controls the legal ink and footer, Accent controls highlights and the CTA,
          and Page background controls the overall canvas. Section colors below override them.
        </p>
      ) : null}
      <ColorField
        label="Section background"
        value={style.background || ''}
        onChange={(background) => onChange(block.id, { style: { background } })}
        onReset={() => onChange(block.id, {
          style: { background: templateSectionBackground },
        })}
        showReset={(style.background || '') !== templateSectionBackground}
      />
      <ColorField
        label="Section text color"
        value={style.textColor || ''}
        onChange={(textColor) => onChange(block.id, { style: { textColor } })}
        onReset={() => onChange(block.id, {
          style: { textColor: templateSectionTextColor },
        })}
        showReset={(style.textColor || '') !== templateSectionTextColor}
      />
      {isGuidance && !isSellerExpertTemplate && !isCommunityTemplate && !isLayeredLawyerTemplate ? (
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-500">
          Click the Process or FAQ card for optional card-level colors. Steps and FAQs inherit those styles—no per-item colors.
        </p>
      ) : null}
      {hasEditableCards ? (
        <div className="space-y-3">
          <ServicesIconControls
            content={content}
            onChange={onChange}
            blockId={block.id}
            onReset={model.clearServicesIconStyles}
            isSellerCaseStudy={isSellerCaseStudy}
          />
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-500">
            One section background (Style above). Click each {isSellerCaseStudy ? 'story' : 'service'} card to set its own background, text, title, description, and icon.
          </p>
        </div>
      ) : null}
      {(isLawyerInvestor || isLawyerNewcomer) && templateStyle.iconColors && !hasEditableCards ? (
        <ServicesIconControls
          content={content}
          onChange={onChange}
          blockId={block.id}
          onReset={model.clearServicesIconStyles}
          isSellerCaseStudy={false}
        />
      ) : null}
      {isRoleDetails && !isLawyerClassic ? (
        <div className="space-y-3">
          <RolePanelControls
            content={content}
            onChange={onChange}
            blockId={block.id}
            onReset={model.clearRolePanelStyles}
          />
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-500">
            {isCommunityTemplate
              ? 'Brand colors come from Design. Click highlight cards to set per-item colors.'
              : 'Brand colors come from Design. Click highlight cards or proof chips to set per-item colors.'}
          </p>
          {isLawyerInvestor ? (
            <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Section CTA</p>
              <ColorField label="Button background" value={content.cta_background || ''} onChange={(cta_background) => onChange(block.id, { content: { cta_background } })} />
              <ColorField label="Button text" value={content.cta_text_color || ''} onChange={(cta_text_color) => onChange(block.id, { content: { cta_text_color } })} />
            </div>
          ) : null}
        </div>
      ) : null}
      {(isLawyerInvestor || isLawyerNewcomer) && templateStyle.processColors && isGuidance ? (
        <ProcessCardControls
          content={content}
          onChange={onChange}
          blockId={block.id}
          onReset={() => onChange(block.id, {
            content: { process_card_background: '', process_card_text_color: '' },
          })}
        />
      ) : null}
      {(isLawyerInvestor || isLawyerNewcomer) && templateStyle.itemColors && isCredentials ? (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Metric cards</p>
          <ColorField label="Card background" value={content.card_background || ''} onChange={(card_background) => onChange(block.id, { content: { card_background } })} />
          <ColorField label="Card text" value={content.card_text_color || ''} onChange={(card_text_color) => onChange(block.id, { content: { card_text_color } })} />
        </div>
      ) : null}
      {(isLawyerInvestor || isLawyerNewcomer) && templateStyle.buttonColors && isCta ? (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">CTA buttons</p>
          <ColorField label={isLawyerNewcomer ? 'Appointment background' : 'Primary inquiry background'} value={content.primary_button_background || ''} onChange={(primary_button_background) => onChange(block.id, { content: { primary_button_background } })} />
          <ColorField label={isLawyerNewcomer ? 'Appointment text' : 'Primary inquiry text'} value={content.primary_button_text_color || ''} onChange={(primary_button_text_color) => onChange(block.id, { content: { primary_button_text_color } })} />
          <ColorField label={isLawyerNewcomer ? 'Inquiry background' : 'Appointment background'} value={content.secondary_button_background || ''} onChange={(secondary_button_background) => onChange(block.id, { content: { secondary_button_background } })} />
          <ColorField label={isLawyerNewcomer ? 'Inquiry text' : 'Appointment text'} value={content.secondary_button_text_color || ''} onChange={(secondary_button_text_color) => onChange(block.id, { content: { secondary_button_text_color } })} />
        </div>
      ) : null}
      {block.type === T.ABOUT ? (
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-4 text-slate-500">
          About uses brand colors plus this section override. Photo and name come from your profile / Design media.
        </p>
      ) : null}
      {isListings ? (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Property cards</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              Themes set card style automatically. Override colors here.
              Prices use Accent; status badges use Primary.
            </p>
          </div>
          <ColorField
            label="Card background"
            value={content.card_background || ''}
            onChange={(card_background) => onChange(block.id, { content: { card_background } })}
            onReset={() => onChange(block.id, {
              content: { card_background: listingThemeCards.card_background || '' },
            })}
            showReset={(content.card_background || '') !== (listingThemeCards.card_background || '')}
          />
          <ColorField
            label="Card text"
            value={content.card_text_color || ''}
            onChange={(card_text_color) => onChange(block.id, { content: { card_text_color } })}
            onReset={() => onChange(block.id, {
              content: { card_text_color: listingThemeCards.card_text_color || '' },
            })}
            showReset={(content.card_text_color || '') !== (listingThemeCards.card_text_color || '')}
          />
          <Field label="Card style">
            <BuilderSelect
              value={layout.cardStyle || 'bordered'}
              options={SECTION_SETTINGS.cardStyles}
              onChange={(cardStyle) => onChange(block.id, { layout: { cardStyle } })}
              ariaLabel="Property card style"
            />
          </Field>
          <button
            type="button"
            onClick={() => {
              onChange(block.id, {
                content: {
                  card_background: listingThemeCards.card_background || '',
                  card_text_color: listingThemeCards.card_text_color || '',
                },
                layout: { cardStyle: listingThemeCards.cardStyle || 'bordered' },
              });
            }}
            className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            Reset property cards to theme defaults
          </button>
          {(content.card_background || content.card_text_color) ? (
            <button
              type="button"
              onClick={() => onChange(block.id, {
                content: { card_background: '', card_text_color: '' },
              })}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear card color overrides
            </button>
          ) : null}
        </div>
      ) : null}
      {sellerSupportsRadiusShadow && !isLayeredLawyerTemplate ? (
        <>
          <Field label="Corner radius">
            <BuilderSelect value={style.radius || 'default'} options={[{ value: 'none', label: 'Sharp' }, { value: 'default', label: 'Soft' }, { value: 'large', label: 'Rounded' }]} onChange={(radius) => onChange(block.id, { style: { radius } })} ariaLabel="Corner radius" />
          </Field>
          <Field label="Shadow depth">
            <BuilderSelect value={style.shadow || 'none'} options={SECTION_SETTINGS.shadows} onChange={(shadow) => onChange(block.id, { style: { shadow } })} ariaLabel="Shadow depth" />
          </Field>
        </>
      ) : null}
    </>
  );
}
