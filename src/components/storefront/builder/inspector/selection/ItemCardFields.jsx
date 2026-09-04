import { STOREFRONT_BLOCK_TYPES as T } from '../../../storefrontPresets';
import { labelForBlock } from '../../storefrontBuilderState';
import { lawyerClassicIconDefault } from '../../../renderers/variants/lawyer/shared/lawyerSectionUtils';
import { resolveServiceBenefits, withServiceBenefitPatch } from '../../../renderers/variants/broker/classic/brokerClassicServiceBenefits';
import { resolveServiceIconKey, SERVICE_ICON_DEFAULTS, ServiceIconDropdown } from '../../storefrontServiceIcons';
import { BuilderSelect, ColorField, Field } from '../../builderUiPrimitives';
import {
  DashedAddButton,
  InspectorEyebrow,
  InspectorInput,
  InspectorTextarea,
  ResetSurfaceButton,
} from '../inspectorUi';

export function LawyerCardItemFields({ block, model, selection, onItemChange, onItemAdd }) {
  const {
    lawyerClassicUsesCardIcons,
    lawyerClassicCards,
    lawyerClassicCardLimit,
  } = model;
  const updateItem = (patch) => onItemChange?.({
    ...patch,
    ...(block.type === T.CREDENTIALS ? { source: '', source_overridden: true } : {}),
  });
  return (
    <>
      <InspectorEyebrow>{labelForBlock(block.type)} card</InspectorEyebrow>
      <InspectorInput label="Title" value={selection.item?.title || ''} onChange={(title) => updateItem({ title })} />
      <InspectorTextarea
        label="Description"
        value={selection.item?.description || selection.item?.text || ''}
        onChange={(description) => updateItem({ description })}
        className="min-h-24 resize-y"
      />
      {lawyerClassicUsesCardIcons ? (
        <Field label="Card icon">
          <ServiceIconDropdown
            value={resolveServiceIconKey(
              selection.item?.icon || lawyerClassicIconDefault(block.type, Number(selection.itemIndex) || 0),
              Number(selection.itemIndex) || 0,
            )}
            onChange={(icon) => updateItem({ icon })}
          />
        </Field>
      ) : null}
      {block.type === T.CONSULTATION_OPTIONS ? (
        <>
          <InspectorInput
            label="Button label"
            value={selection.item?.cta_label || ''}
            onChange={(cta_label) => updateItem({ cta_label })}
            placeholder="Submit inquiry"
          />
          <Field label="Button action">
            <BuilderSelect
              value={selection.item?.action === 'appointment' ? 'appointment' : 'inquiry'}
              options={[
                { value: 'inquiry', label: 'Open inquiry' },
                { value: 'appointment', label: 'Book consultation' },
              ]}
              onChange={(action) => updateItem({ action })}
              ariaLabel="Button action"
            />
          </Field>
        </>
      ) : null}
      <ColorField
        label="Card background"
        value={selection.item?.background || ''}
        onChange={(background) => updateItem({ background })}
      />
      <ColorField
        label="Card text"
        value={selection.item?.text_color || ''}
        onChange={(text_color) => updateItem({ text_color })}
      />
      <DashedAddButton
        variant="selection"
        disabled={lawyerClassicCards.length >= lawyerClassicCardLimit}
        onClick={() => onItemAdd?.({
          title: 'New item',
          description: 'Add a clear description visitors can scan quickly.',
          icon: lawyerClassicUsesCardIcons
            ? lawyerClassicIconDefault(block.type, lawyerClassicCards.length)
            : '',
          cta_label: block.type === T.CONSULTATION_OPTIONS ? 'Get started' : '',
          action: 'inquiry',
        })}
      >
        {lawyerClassicCards.length >= lawyerClassicCardLimit
          ? `Max ${lawyerClassicCardLimit} cards reached`
          : 'Add card'}
      </DashedAddButton>
    </>
  );
}

export function ServiceCardItemFields({ model, selection, onItemChange, onItemAdd }) {
  const { isSellerCaseStudy, serviceCards, block, serviceCardLimit = 6, isBrokerClassic } = model;
  const isBrokerRates = block?.type === T.MORTGAGE_RATES;
  const isBrokerLenders = block?.type === T.LENDER_NETWORK;
  const isBrokerCompensation = block?.type === T.BROKER_COMPENSATION;
  const isBrokerClassicServices = isBrokerClassic && block?.type === T.SERVICES;
  const showIcon = !isBrokerRates && !isBrokerLenders;
  const cardLimit = serviceCardLimit;
  const serviceBenefitValues = isBrokerClassicServices
    ? resolveServiceBenefits(selection.item || {})
    : [];
  const updateItem = (patch) => {
    const benefitKey = Object.keys(patch).find((key) => /^benefit_[0-2]$/.test(key));
    if (benefitKey && isBrokerClassicServices) {
      onItemChange?.(withServiceBenefitPatch(selection.item || {}, benefitKey, patch[benefitKey]));
      return;
    }
    onItemChange?.(patch);
  };
  return (
    <>
      <InspectorEyebrow>
        {isBrokerRates
          ? 'Rate row'
          : isBrokerLenders
            ? 'Lender'
            : isBrokerCompensation
              ? 'Compensation item'
              : block?.type === T.ALTERNATIVE_LENDING
                ? 'Alternative option'
                : isSellerCaseStudy
                  ? 'Success story card'
                  : 'Service card'}
      </InspectorEyebrow>
      <InspectorInput
        label={isBrokerRates ? 'Product name' : isBrokerLenders ? 'Bank name' : 'Title'}
        value={selection.item?.title || ''}
        onChange={(title) => updateItem({ title })}
      />
      {isBrokerRates ? (
        <InspectorInput
          label="Rate"
          value={selection.item?.rate || ''}
          onChange={(rate) => updateItem({ rate })}
          placeholder="Starting from 4.29%"
        />
      ) : null}
      {isBrokerLenders ? (
        <InspectorInput
          label="Website / logo URL"
          value={selection.item?.domain || selection.item?.website || ''}
          onChange={(value) => {
            const trimmed = String(value || '').trim();
            const domain = trimmed
              .toLowerCase()
              .replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .split('/')[0]
              .split('?')[0]
              .split('#')[0];
            updateItem({ domain, website: trimmed });
          }}
          placeholder="td.com or https://www.td.com"
        />
      ) : null}
      {!isBrokerLenders ? (
        <InspectorTextarea
          label="Description"
          value={selection.item?.description || selection.item?.text || ''}
          onChange={(description) => updateItem({ description })}
          className="min-h-24 resize-y"
        />
      ) : null}
      {isBrokerClassicServices ? (
        <>
          <InspectorEyebrow>Benefit strips</InspectorEyebrow>
          {serviceBenefitValues.map((benefit, index) => (
            <InspectorInput
              key={`benefit-${index}`}
              label={`Benefit ${index + 1}`}
              value={Object.prototype.hasOwnProperty.call(selection.item || {}, `benefit_${index}`)
                ? (selection.item[`benefit_${index}`] ?? '')
                : benefit}
              onChange={(value) => updateItem({ [`benefit_${index}`]: value })}
            />
          ))}
        </>
      ) : null}
      {showIcon ? (
      <Field label="Card icon">
        <ServiceIconDropdown
          value={selection.item?.icon || (isBrokerCompensation
            ? ['building', 'percent', 'briefcase', 'home'][Number(selection.itemIndex) % 4] || 'building'
            : 'target')}
          onChange={(icon) => updateItem({ icon })}
        />
      </Field>
      ) : null}
      {model.isLawyerFirstHome && !isSellerCaseStudy ? (
        <InspectorInput
          label="Card link target"
          value={selection.item?.url || selection.item?.href || ''}
          onChange={(url) => updateItem({ url, link_disabled: !url })}
          placeholder="#documents or https://example.com"
        />
      ) : null}
      {!isBrokerLenders && !model.isBrokerClassic ? (
        <>
          <ColorField
            label="Icon background"
            value={selection.item?.icon_background || ''}
            onChange={(icon_background) => onItemChange?.({ icon_background })}
          />
          <ColorField
            label="Icon color"
            value={selection.item?.icon_color || ''}
            onChange={(icon_color) => onItemChange?.({ icon_color })}
          />
          <ColorField
            label="Card background"
            value={selection.item?.background || ''}
            onChange={(background) => onItemChange?.({ background })}
          />
          <ColorField
            label="Card text"
            value={selection.item?.text_color || ''}
            onChange={(text_color) => onItemChange?.({ text_color })}
          />
          {(selection.item?.background || selection.item?.text_color || selection.item?.icon_background || selection.item?.icon_color) ? (
            <ResetSurfaceButton
              onClick={() => onItemChange?.({
                background: '',
                text_color: '',
                icon_background: '',
                icon_color: '',
              })}
            >
              Clear this card styles
            </ResetSurfaceButton>
          ) : null}
        </>
      ) : null}
      <DashedAddButton
        variant="selection"
        disabled={serviceCards.length >= cardLimit}
        onClick={() => onItemAdd?.({
          title: isBrokerRates
            ? 'New rate'
            : isBrokerLenders
              ? 'New bank'
              : block?.type === T.BROKER_COMPENSATION
                ? 'New compensation item'
                : block?.type === T.ALTERNATIVE_LENDING
                  ? 'New option'
                  : isSellerCaseStudy
                    ? 'New story stage'
                    : 'New service',
          description: isBrokerLenders
            ? ''
            : isSellerCaseStudy
              ? 'Add the challenge, strategy, or result for this success story.'
              : 'Add a clear one-line summary visitors can scan quickly.',
          rate: isBrokerRates ? 'Starting from X.XX%' : '',
          domain: '',
          website: '',
          icon: showIcon ? SERVICE_ICON_DEFAULTS[serviceCards.length % SERVICE_ICON_DEFAULTS.length] : '',
          background: '',
          text_color: '',
          icon_background: '',
          icon_color: '',
          url: '',
          link_disabled: model.isLawyerFirstHome ? true : undefined,
        })}
      >
        {serviceCards.length >= cardLimit
          ? 'Max cards reached'
          : isBrokerRates
            ? 'Add rate'
            : isBrokerLenders
              ? 'Add bank'
              : isSellerCaseStudy
                ? 'Add story card'
                : 'Add card'}
      </DashedAddButton>
    </>
  );
}

export function TestimonialItemFields({
  selection,
  itemCount = 0,
  onItemChange,
  onItemAdd,
}) {
  const rating = Math.min(5, Math.max(1, Number(selection.item?.rating) || 5));
  return (
    <>
      <InspectorEyebrow>Client testimonial</InspectorEyebrow>
      <InspectorInput
        label="Client name"
        value={selection.item?.client_name || ''}
        onChange={(client_name) => onItemChange?.({ client_name })}
      />
      <InspectorInput
        label="Client detail"
        value={selection.item?.role || ''}
        onChange={(role) => onItemChange?.({ role })}
        placeholder="Verified client"
      />
      <InspectorTextarea
        label="Testimonial"
        value={selection.item?.text || ''}
        onChange={(text) => onItemChange?.({ text })}
        className="min-h-28 resize-y"
      />
      <Field label="Rating">
        <BuilderSelect
          value={String(rating)}
          options={[5, 4, 3, 2, 1].map((value) => ({
            value: String(value),
            label: `${value} star${value === 1 ? '' : 's'}`,
          }))}
          onChange={(value) => onItemChange?.({ rating: Number(value) })}
          ariaLabel="Testimonial rating"
        />
      </Field>
      <DashedAddButton
        variant="selection"
        disabled={itemCount >= 8}
        onClick={() => onItemAdd?.({
          client_name: 'New client',
          role: 'Verified client',
          text: 'Add a concise client experience.',
          rating: 5,
        })}
      >
        {itemCount >= 8 ? 'Max 8 testimonials reached' : 'Add testimonial'}
      </DashedAddButton>
    </>
  );
}

export function HighlightItemFields({ block, model, selection, onItemChange, onItemAdd }) {
  const { isCommunityTemplate, isLawyerClassicStatement, roleHighlights } = model;
  return (
    <>
      <InspectorEyebrow>Highlight card</InspectorEyebrow>
      <InspectorInput label="Title" value={selection.item?.title || ''} onChange={(title) => onItemChange?.({ title })} />
      <InspectorTextarea
        label="Description"
        value={selection.item?.text || ''}
        onChange={(text) => onItemChange?.({ text })}
        className="min-h-24 resize-y"
      />
      {isCommunityTemplate || isLawyerClassicStatement ? (
        <Field label="Card icon">
          <ServiceIconDropdown
            value={resolveServiceIconKey(
              selection.item?.icon || (isLawyerClassicStatement
                ? lawyerClassicIconDefault(block.type, Number(selection.itemIndex) || 0)
                : 'target'),
              Number(selection.itemIndex) || 0,
            )}
            onChange={(icon) => onItemChange?.({ icon })}
          />
        </Field>
      ) : null}
      <ColorField
        label="Card background"
        value={selection.item?.background || ''}
        onChange={(background) => onItemChange?.({ background })}
      />
      <ColorField
        label="Card text"
        value={selection.item?.text_color || ''}
        onChange={(text_color) => onItemChange?.({ text_color })}
      />
      {(selection.item?.background || selection.item?.text_color) ? (
        <ResetSurfaceButton onClick={() => onItemChange?.({ background: '', text_color: '' })}>
          Clear this card’s colors
        </ResetSurfaceButton>
      ) : null}
      <DashedAddButton
        variant="selection"
        disabled={roleHighlights.length >= 6}
        onClick={() => onItemAdd?.({
          title: 'New highlight',
          text: 'Describe this highlight for visitors.',
          icon: isCommunityTemplate
            ? 'target'
            : isLawyerClassicStatement
              ? lawyerClassicIconDefault(block.type, roleHighlights.length)
              : '',
          background: '',
          text_color: '',
        })}
      >
        {roleHighlights.length >= 6 ? 'Max 6 highlights reached' : 'Add highlight'}
      </DashedAddButton>
    </>
  );
}

export function ProofChipItemFields({ model, selection, onItemChange, onItemAdd }) {
  const { roleProof } = model;
  return (
    <>
      <InspectorEyebrow>Proof chip</InspectorEyebrow>
      <InspectorInput label="Label" value={selection.item?.text || ''} onChange={(text) => onItemChange?.({ text })} />
      <ColorField
        label="Chip background"
        value={selection.item?.background || ''}
        onChange={(background) => onItemChange?.({ background })}
      />
      <ColorField
        label="Chip text"
        value={selection.item?.text_color || ''}
        onChange={(text_color) => onItemChange?.({ text_color })}
      />
      {(selection.item?.background || selection.item?.text_color) ? (
        <ResetSurfaceButton onClick={() => onItemChange?.({ background: '', text_color: '' })}>
          Clear this chip’s colors
        </ResetSurfaceButton>
      ) : null}
      <DashedAddButton
        variant="selection"
        disabled={roleProof.length >= 8}
        onClick={() => onItemAdd?.({
          text: 'New proof point',
          background: '',
          text_color: '',
        })}
      >
        {roleProof.length >= 8 ? 'Max 8 proof chips reached' : 'Add proof chip'}
      </DashedAddButton>
    </>
  );
}
