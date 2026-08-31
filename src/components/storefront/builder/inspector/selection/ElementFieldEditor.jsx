import { Field, inputClass } from '../../builderUiPrimitives';
import {
  FaqCardControls,
  ProcessCardControls,
  RolePanelControls,
  ServicesIconControls,
} from '../InspectorAppearanceControls';
import { InspectorEyebrow } from '../inspectorUi';
import { patchContentPath } from '../../contentPath';

const MULTILINE_FIELDS = new Set([
  'body',
  'description',
  'text',
  'about_note',
  'helper_text',
  'process_body',
  'faq_footer_body',
]);

export default function ElementFieldEditor({ block, model, onChange }) {
  const {
    selectedField,
    isLawyerClassic,
    isProcessCardContext,
    isFaqCardContext,
    isCommunityTemplate,
    hasEditableCards,
    servicesCardStyleFields,
    contentValue,
    contentPlaceholder,
  } = model;
  const selectedContentKey = selectedField.replace('content.', '');
  const usesTextarea = MULTILINE_FIELDS.has(selectedContentKey)
    || selectedContentKey.endsWith('_body')
    || selectedContentKey.endsWith('_description')
    || selectedContentKey.endsWith('_note');
  const inputType = /(?:url|href|link|target)$/.test(selectedContentKey) ? 'url' : 'text';

  return (
    <div className="mt-2 space-y-2">
      {isProcessCardContext || isFaqCardContext ? (
        <InspectorEyebrow>
          {isProcessCardContext ? 'Process card' : 'FAQ card'}
        </InspectorEyebrow>
      ) : null}
      {selectedField === 'content.panel_background'
        || selectedField === 'content.panel_text_color'
        || selectedField === 'content.proof_panel'
        ? (isLawyerClassic ? null : (
          <RolePanelControls
            content={model.content}
            onChange={onChange}
            blockId={block.id}
            onReset={model.clearRolePanelStyles}
          />
        ))
        : null}
      {selectedField === 'content.process_card_background'
        || selectedField === 'content.faq_card_background'
        || selectedField === 'content.process_card_text_color'
        || selectedField === 'content.faq_card_text_color'
        || selectedField === 'content.icon_background'
        || selectedField === 'content.icon_color'
        || selectedField === 'content.panel_background'
        || selectedField === 'content.panel_text_color'
        || selectedField === 'content.proof_panel'
        ? null
        : (
          <Field label={usesTextarea ? 'Description' : 'Text'}>
            {usesTextarea ? (
              <textarea
                value={contentValue(selectedContentKey)}
                onChange={(event) => onChange(block.id, {
                  content: patchContentPath(
                    model.content,
                    selectedContentKey,
                    event.target.value,
                  ),
                })}
                className={`${inputClass} min-h-40 resize-y leading-6`}
                placeholder={contentPlaceholder(selectedContentKey, 'Add supporting copy…')}
              />
            ) : (
              <input
                type={inputType}
                value={contentValue(selectedContentKey)}
                onChange={(event) => onChange(block.id, {
                  content: patchContentPath(
                    model.content,
                    selectedContentKey,
                    event.target.value,
                  ),
                })}
                className={inputClass}
                placeholder={contentPlaceholder(selectedContentKey, 'Add text…')}
              />
            )}
          </Field>
        )}
      {isProcessCardContext && !isCommunityTemplate ? (
        <ProcessCardControls
          content={model.content}
          onChange={onChange}
          blockId={block.id}
          onReset={() => model.clearGuidanceCardStyles('process')}
        />
      ) : null}
      {isFaqCardContext && !isCommunityTemplate ? (
        <FaqCardControls
          content={model.content}
          onChange={onChange}
          blockId={block.id}
          onReset={() => model.clearGuidanceCardStyles('faq')}
        />
      ) : null}
      {hasEditableCards && servicesCardStyleFields.has(selectedField) ? (
        <ServicesIconControls
          content={model.content}
          onChange={onChange}
          blockId={block.id}
          onReset={model.clearServicesIconStyles}
          isSellerCaseStudy={model.isSellerCaseStudy}
        />
      ) : null}
    </div>
  );
}
