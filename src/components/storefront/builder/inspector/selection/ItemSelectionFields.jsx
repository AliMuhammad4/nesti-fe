import { Field, inputClass } from '../../builderUiPrimitives';
import {
  ExpertiseProcessItemFields,
  FooterLinkItemFields,
  GuidanceFaqItemFields,
  GuidanceStepItemFields,
} from './ItemStepFields';
import {
  HeroSlideItemFields,
  HighlightItemFields,
  LawyerCardItemFields,
  ProofChipItemFields,
  ServiceCardItemFields,
  TestimonialItemFields,
} from './ItemCardFields';
import { STOREFRONT_BLOCK_TYPES as T } from '../../../storefrontPresets';

export default function ItemSelectionFields({
  block,
  model,
  selection,
  onItemChange,
  onItemAdd,
  onMediaUpload,
}) {
  const {
    isLayeredLawyerTemplate,
    isFooter,
    isLawyerClassicExpertise,
    isGuidance,
    isLawyerClassicItemCards,
    hasEditableCards,
    isRoleDetails,
    isCommunityTemplate,
    selectedItemField,
  } = model;

  if ((model.isBrokerFirstHome || model.isBrokerCommercial) && block?.type === T.HERO && selection?.collection === 'slides') {
    return (
      <HeroSlideItemFields
        selection={selection}
        onItemChange={onItemChange}
        onMediaUpload={onMediaUpload}
      />
    );
  }
  if ((isLayeredLawyerTemplate || model.isBrokerClassic) && isFooter && selection?.collection === 'items') {
    return <FooterLinkItemFields selection={selection} onItemChange={onItemChange} />;
  }
  if (isLawyerClassicExpertise && selection?.collection === 'process_steps') {
    return <ExpertiseProcessItemFields model={model} selection={selection} onItemChange={onItemChange} />;
  }
  if (isGuidance && selection?.collection === 'steps') {
    return (
      <GuidanceStepItemFields
        block={block}
        model={model}
        selection={selection}
        onItemChange={onItemChange}
        onItemAdd={onItemAdd}
      />
    );
  }
  if (isGuidance && selection?.collection === 'faqs') {
    return (
      <GuidanceFaqItemFields
        block={block}
        model={model}
        selection={selection}
        onItemChange={onItemChange}
        onItemAdd={onItemAdd}
      />
    );
  }
  if (block.type === T.TESTIMONIALS && selection?.collection === 'items') {
    return (
      <TestimonialItemFields
        selection={selection}
        itemCount={model.testimonialItemCount}
        onItemChange={onItemChange}
        onItemAdd={onItemAdd}
      />
    );
  }
  if (isLawyerClassicItemCards && selection?.collection === 'items') {
    return (
      <LawyerCardItemFields
        block={block}
        model={model}
        selection={selection}
        onItemChange={onItemChange}
        onItemAdd={onItemAdd}
      />
    );
  }
  if (hasEditableCards) {
    return (
      <ServiceCardItemFields
        model={model}
        selection={selection}
        onItemChange={onItemChange}
        onItemAdd={onItemAdd}
      />
    );
  }
  if (isRoleDetails && selection?.collection === 'highlights') {
    return (
      <HighlightItemFields
        block={block}
        model={model}
        selection={selection}
        onItemChange={onItemChange}
        onItemAdd={onItemAdd}
      />
    );
  }
  if (isRoleDetails && selection?.collection === 'proof' && !isCommunityTemplate) {
    return (
      <ProofChipItemFields
        model={model}
        selection={selection}
        onItemChange={onItemChange}
        onItemAdd={onItemAdd}
      />
    );
  }

  return (
    <Field label={selectedItemField === 'description' || selectedItemField === 'text' || selectedItemField === 'a' ? 'Description' : selectedItemField === 'q' ? 'Question' : 'Text'}>
      <textarea
        value={selection.item?.[selectedItemField] || ''}
        onChange={(event) => onItemChange?.({ [selectedItemField]: event.target.value })}
        className={`${inputClass} min-h-20 resize-y`}
      />
    </Field>
  );
}
