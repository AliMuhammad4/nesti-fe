import { BuilderSelect, Field } from '../builderUiPrimitives';
import { SECTION_SETTINGS } from '../storefrontBuilderState';

export default function InspectorLayoutTab({ block, model, onChange }) {
  const {
    isHero,
    layout,
    sellerCustomBlock,
    isLayeredLawyerTemplate,
    sellerSupportsAlignment,
    isLawyerClassicLayout,
    sellerSupportsPadding,
    sellerSupportsWidth,
    supportsColumns,
    isListings,
    sellerSupportsCardStyle,
    isLawyerInvestor,
    isLawyerNewcomer,
    isBrokerClassic,
    isBrokerRenewal,
    investorCapabilities,
    newcomerCapabilities,
    brokerCapabilities,
    isCta,
  } = model;
  const investorLayout = investorCapabilities?.layout || {};
  const newcomerLayout = newcomerCapabilities?.layout || {};
  const brokerLayout = brokerCapabilities?.layout || {};
  const templateLayout = isLawyerInvestor
    ? investorLayout
    : isLawyerNewcomer
      ? newcomerLayout
      : brokerLayout;
  const supportedCardStyles = isLawyerInvestor
    ? SECTION_SETTINGS.cardStyles.filter(({ value }) => value !== 'glass')
    : SECTION_SETTINGS.cardStyles;

  return (
    <>
      {!isHero ? (
        <>
          {!sellerCustomBlock && !isLayeredLawyerTemplate && !isBrokerClassic ? (
            <Field label="Section variant">
              <BuilderSelect value={layout.variant || 'standard'} options={SECTION_SETTINGS.variants} onChange={(variant) => onChange(block.id, { layout: { variant } })} ariaLabel="Section variant" />
            </Field>
          ) : null}
          {sellerSupportsAlignment && (
            isLawyerInvestor || isLawyerNewcomer || isBrokerClassic
              ? templateLayout.alignment
              : (!isLayeredLawyerTemplate || isLawyerClassicLayout)
          ) ? (
            <Field label={isBrokerClassic ? 'Heading alignment' : 'Alignment'}>
              <BuilderSelect value={layout.alignment} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} onChange={(alignment) => onChange(block.id, { layout: { alignment } })} ariaLabel="Heading alignment" />
            </Field>
          ) : null}
          {isBrokerClassic && templateLayout.contentAlignment ? (
            <Field label="Content alignment">
              <BuilderSelect value={layout.contentAlignment || 'left'} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} onChange={(contentAlignment) => onChange(block.id, { layout: { contentAlignment } })} ariaLabel="Content alignment" />
            </Field>
          ) : null}
          {sellerSupportsPadding && (
            isLawyerInvestor || isLawyerNewcomer || isBrokerClassic
              ? templateLayout.padding
              : (!isLayeredLawyerTemplate || isLawyerClassicLayout)
          ) ? (
            <Field label="Section padding">
              <BuilderSelect value={layout.padding} options={[{ value: 'small', label: 'Compact' }, { value: 'medium', label: 'Comfortable' }, { value: 'large', label: 'Spacious' }]} onChange={(padding) => onChange(block.id, { layout: { padding } })} ariaLabel="Section padding" />
            </Field>
          ) : null}
          {sellerSupportsWidth && !isLayeredLawyerTemplate && !isBrokerClassic ? (
            <Field label="Container width">
              <BuilderSelect value={layout.width || 'full'} options={SECTION_SETTINGS.widths} onChange={(width) => onChange(block.id, { layout: { width } })} ariaLabel="Container width" />
            </Field>
          ) : null}
        </>
      ) : null}
      {isHero ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
          Hero uses a fixed structure. Only media treatment applies here.
        </p>
      ) : (
        <>
          {supportsColumns && (!(isLawyerInvestor || isLawyerNewcomer || isBrokerClassic) || templateLayout.columns) ? (
            <Field label="Columns">
              <BuilderSelect
                value={layout.columns || (isListings ? '4' : '3')}
                options={SECTION_SETTINGS.columns}
                onChange={(columns) => onChange(block.id, { layout: { columns } })}
                ariaLabel="Columns"
              />
            </Field>
          ) : null}
          {sellerSupportsCardStyle && !isListings && (
            isLawyerInvestor || isLawyerNewcomer || isBrokerClassic
              ? templateLayout.cardStyle
              : !isLayeredLawyerTemplate
          ) ? (
            <Field label="Card style">
              <BuilderSelect value={layout.cardStyle || 'bordered'} options={supportedCardStyles} onChange={(cardStyle) => onChange(block.id, { layout: { cardStyle } })} ariaLabel="Card style" />
            </Field>
          ) : null}
          {(isLawyerInvestor || isLawyerNewcomer || isBrokerClassic) && isCta && templateLayout.buttonLayout ? (
            <Field label="Button layout">
              <BuilderSelect
                value={layout.buttonLayout || 'stacked'}
                options={[
                  { value: 'stacked', label: 'Stacked' },
                  { value: 'inline', label: 'Inline' },
                ]}
                onChange={(buttonLayout) => onChange(block.id, { layout: { buttonLayout } })}
                ariaLabel="CTA button layout"
              />
            </Field>
          ) : null}
        </>
      )}
      {isHero ? (
        <Field label="Media treatment">
          <BuilderSelect
            value={(() => {
              const raw = layout.mediaPosition
                || (isLawyerInvestor ? 'portrait' : isBrokerRenewal ? 'background' : isBrokerClassic ? 'right' : 'background');
              if (isBrokerClassic && !isBrokerRenewal && raw === 'cover') return 'right';
              return raw;
            })()}
            options={isLawyerInvestor
              ? [
                { value: 'portrait', label: 'Profile portrait panel' },
                { value: 'cover', label: 'Cover image panel' },
                { value: 'none', label: 'No image' },
              ]
              : isBrokerRenewal
                ? [
                  { value: 'background', label: 'Show cover' },
                  { value: 'none', label: 'Hide cover' },
                ]
              : isBrokerClassic
                ? [
                  { value: 'right', label: 'Cover image column' },
                  { value: 'none', label: 'No image' },
                ]
              : [
                { value: 'background', label: 'Show cover' },
                { value: 'none', label: 'Hide cover' },
              ]}
            onChange={(mediaPosition) => onChange(block.id, { layout: { mediaPosition } })}
            ariaLabel="Media treatment"
          />
        </Field>
      ) : null}
      {isHero && (layout.mediaPosition || (isLawyerInvestor ? 'portrait' : isBrokerRenewal ? 'background' : isBrokerClassic ? 'right' : 'background')) === 'none' ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
          Hero media is hidden. Choose a media treatment to display the cover image.
        </p>
      ) : null}
      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Section animation</p>
        <Field label="Animation">
          <BuilderSelect
            value={layout.animationType || 'none'}
            options={SECTION_SETTINGS.animations}
            onChange={(animationType) => onChange(block.id, { layout: { animationType } })}
            ariaLabel="Animation type"
          />
        </Field>
        {(layout.animationType || 'none') !== 'none' ? (
          <>
            <Field label="Trigger">
              <BuilderSelect
                value={layout.animationTrigger || 'load'}
                options={SECTION_SETTINGS.animationTriggers}
                onChange={(animationTrigger) => onChange(block.id, { layout: { animationTrigger } })}
                ariaLabel="Animation trigger"
              />
            </Field>
            <Field label="Duration">
              <BuilderSelect
                value={layout.animationDuration || 'medium'}
                options={SECTION_SETTINGS.animationDurations}
                onChange={(animationDuration) => onChange(block.id, { layout: { animationDuration } })}
                ariaLabel="Animation duration"
              />
            </Field>
            <Field label="Delay">
              <BuilderSelect
                value={String(layout.animationDelay ?? '0')}
                options={SECTION_SETTINGS.animationDelays}
                onChange={(animationDelay) => onChange(block.id, { layout: { animationDelay } })}
                ariaLabel="Animation delay"
              />
            </Field>
            <Field label="Intensity">
              <BuilderSelect
                value={layout.animationIntensity || 'medium'}
                options={SECTION_SETTINGS.animationIntensities}
                onChange={(animationIntensity) => onChange(block.id, { layout: { animationIntensity } })}
                ariaLabel="Animation intensity"
              />
            </Field>
          </>
        ) : null}
      </div>
    </>
  );
}
