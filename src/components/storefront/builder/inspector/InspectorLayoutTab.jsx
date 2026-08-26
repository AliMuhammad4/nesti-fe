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
  } = model;

  return (
    <>
      {!isHero ? (
        <>
          {!sellerCustomBlock && !isLayeredLawyerTemplate ? (
            <Field label="Section variant">
              <BuilderSelect value={layout.variant || 'standard'} options={SECTION_SETTINGS.variants} onChange={(variant) => onChange(block.id, { layout: { variant } })} ariaLabel="Section variant" />
            </Field>
          ) : null}
          {sellerSupportsAlignment && (!isLayeredLawyerTemplate || isLawyerClassicLayout) ? (
            <Field label="Alignment">
              <BuilderSelect value={layout.alignment} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} onChange={(alignment) => onChange(block.id, { layout: { alignment } })} ariaLabel="Alignment" />
            </Field>
          ) : null}
          {sellerSupportsPadding && (!isLayeredLawyerTemplate || isLawyerClassicLayout) ? (
            <Field label="Section padding">
              <BuilderSelect value={layout.padding} options={[{ value: 'small', label: 'Compact' }, { value: 'medium', label: 'Comfortable' }, { value: 'large', label: 'Spacious' }]} onChange={(padding) => onChange(block.id, { layout: { padding } })} ariaLabel="Section padding" />
            </Field>
          ) : null}
          {sellerSupportsWidth && !isLayeredLawyerTemplate ? (
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
          {supportsColumns ? (
            <Field label="Columns">
              <BuilderSelect
                value={layout.columns || (isListings ? '4' : '3')}
                options={SECTION_SETTINGS.columns}
                onChange={(columns) => onChange(block.id, { layout: { columns } })}
                ariaLabel="Columns"
              />
            </Field>
          ) : null}
          {sellerSupportsCardStyle && !isListings && !isLayeredLawyerTemplate ? (
            <Field label="Card style">
              <BuilderSelect value={layout.cardStyle || 'bordered'} options={SECTION_SETTINGS.cardStyles} onChange={(cardStyle) => onChange(block.id, { layout: { cardStyle } })} ariaLabel="Card style" />
            </Field>
          ) : null}
        </>
      )}
      {isHero ? (
        <Field label="Media treatment">
          <BuilderSelect
            value={layout.mediaPosition || 'background'}
            options={[
              { value: 'background', label: 'Show cover' },
              { value: 'none', label: 'Hide cover' },
            ]}
            onChange={(mediaPosition) => onChange(block.id, { layout: { mediaPosition } })}
            ariaLabel="Media treatment"
          />
        </Field>
      ) : null}
      {isHero && (layout.mediaPosition || 'background') === 'none' ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
          Cover image is hidden. Choose <span className="font-semibold text-slate-700">Show cover</span> to display the uploaded cover in the hero band.
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
