import { createContentItemId } from '../../storefrontBuilderState';
import { lawyerClassicIconDefault } from '../../../renderers/variants/lawyer/shared/lawyerSectionUtils';
import { resolveServiceIconKey, ServiceIconDropdown } from '../../storefrontServiceIcons';
import { ColorField, Field } from '../../builderUiPrimitives';
import { FaqCardControls, ProcessCardControls } from '../InspectorAppearanceControls';
import {
  DashedAddButton,
  InspectorEyebrow,
  InspectorInput,
  InspectorTextarea,
} from '../inspectorUi';

export function FooterLinkItemFields({ selection, onItemChange }) {
  return (
    <>
      <InspectorEyebrow>Footer link</InspectorEyebrow>
      <InspectorInput label="Label" value={selection.item?.label || ''} onChange={(label) => onItemChange?.({ label })} />
      <InspectorInput
        label="Target"
        value={selection.item?.target || selection.item?.url || ''}
        onChange={(target) => onItemChange?.({ target })}
        placeholder="#about or https://example.com"
      />
    </>
  );
}

export function ExpertiseProcessItemFields({ model, selection, onItemChange }) {
  const { expertiseProcessSteps, expertiseProcessLimit, commitExpertiseProcessSteps } = model;
  return (
    <>
      <InspectorEyebrow>Process step</InspectorEyebrow>
      <InspectorInput label="Step title" value={selection.item?.title || ''} onChange={(title) => onItemChange?.({ title })} />
      <InspectorTextarea
        label="Step description"
        value={selection.item?.text || selection.item?.description || ''}
        onChange={(text) => onItemChange?.({ text })}
      />
      <DashedAddButton
        variant="selection"
        disabled={expertiseProcessSteps.length >= expertiseProcessLimit}
        onClick={() => commitExpertiseProcessSteps([...expertiseProcessSteps, {
          id: createContentItemId(),
          title: 'New step',
          text: 'Describe this intake step for visitors.',
        }])}
      >
        {expertiseProcessSteps.length >= expertiseProcessLimit
          ? `Max ${expertiseProcessLimit} steps reached`
          : 'Add step'}
      </DashedAddButton>
    </>
  );
}

export function GuidanceStepItemFields({ block, model, selection, onItemChange, onItemAdd }) {
  const {
    isLawyerClassicGuidance,
    isCommunityTemplate,
    guidanceSteps,
    guidanceStepLimit,
  } = model;
  return (
    <>
      <InspectorEyebrow>Process card · Step</InspectorEyebrow>
      <InspectorInput label="Step title" value={selection.item?.title || ''} onChange={(title) => onItemChange?.({ title })} />
      <InspectorTextarea
        label="Step description"
        value={selection.item?.text || selection.item?.description || ''}
        onChange={(text) => onItemChange?.({ text })}
      />
      {isLawyerClassicGuidance ? (
        <Field label="Card icon">
          <ServiceIconDropdown
            value={resolveServiceIconKey(
              selection.item?.icon || lawyerClassicIconDefault(block.type, Number(selection.itemIndex) || 0),
              Number(selection.itemIndex) || 0,
            )}
            onChange={(icon) => onItemChange?.({ icon })}
          />
        </Field>
      ) : null}
      {isCommunityTemplate ? null : (
        <ProcessCardControls
          content={model.content}
          onChange={model.onChange}
          blockId={block.id}
          onReset={() => model.clearGuidanceCardStyles('process')}
        />
      )}
      <ColorField
        label="This card background"
        value={selection.item?.background || ''}
        onChange={(background) => onItemChange?.({ background })}
      />
      <ColorField
        label="This card text"
        value={selection.item?.text_color || ''}
        onChange={(text_color) => onItemChange?.({ text_color })}
      />
      <DashedAddButton
        variant="selection"
        disabled={guidanceSteps.length >= guidanceStepLimit}
        onClick={() => onItemAdd?.({
          title: 'New step',
          text: 'Describe this step for your clients.',
          icon: isLawyerClassicGuidance
            ? lawyerClassicIconDefault(block.type, guidanceSteps.length)
            : '',
        })}
      >
        {guidanceSteps.length >= guidanceStepLimit
          ? `Max ${guidanceStepLimit} steps reached`
          : 'Add step'}
      </DashedAddButton>
    </>
  );
}

export function GuidanceFaqItemFields({ block, model, selection, onItemChange, onItemAdd }) {
  const { isCommunityTemplate, guidanceFaqs, guidanceFaqLimit } = model;
  return (
    <>
      <InspectorEyebrow>FAQ card · Question</InspectorEyebrow>
      <InspectorInput label="Question" value={selection.item?.q || ''} onChange={(q) => onItemChange?.({ q })} />
      <InspectorTextarea
        label="Answer"
        value={selection.item?.a || ''}
        onChange={(a) => onItemChange?.({ a })}
        className="min-h-24 resize-y"
      />
      {isCommunityTemplate ? null : (
        <FaqCardControls
          content={model.content}
          onChange={model.onChange}
          blockId={block.id}
          onReset={() => model.clearGuidanceCardStyles('faq')}
        />
      )}
      <ColorField
        label="This card background"
        value={selection.item?.background || ''}
        onChange={(background) => onItemChange?.({ background })}
      />
      <ColorField
        label="This card text"
        value={selection.item?.text_color || ''}
        onChange={(text_color) => onItemChange?.({ text_color })}
      />
      <DashedAddButton
        variant="selection"
        disabled={guidanceFaqs.length >= guidanceFaqLimit}
        onClick={() => onItemAdd?.({
          q: 'New question',
          a: 'Add a clear answer clients can skim quickly.',
        })}
      >
        {guidanceFaqs.length >= guidanceFaqLimit ? `Max ${guidanceFaqLimit} FAQs reached` : 'Add FAQ'}
      </DashedAddButton>
    </>
  );
}
