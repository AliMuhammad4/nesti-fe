import { STOREFRONT_BLOCK_TYPES as T } from '../../../storefrontPresets';
import { InspectorEyebrow, InspectorInput, InspectorTextarea, bindContent } from '../inspectorUi';
import { ExpertiseProcessEditor, GuidanceFaqsEditor, GuidanceStepsEditor } from '../InspectorCollectionEditors';

export function GuidanceContentFields({ block, model, onChange }) {
  const {
    isGuidance,
    isFaq,
    isElementSelection,
    isCommunityTemplate,
    isSellerExpertTemplate,
    isLayeredLawyerTemplate,
    isBrokerClassic,
    contentValue,
    contentPlaceholder,
  } = model;
  if (!isGuidance && !isFaq) return null;
  const setContent = bindContent(onChange, block.id);
  return (
    <>
      {!isElementSelection && isCommunityTemplate ? (
        <InspectorInput label="FAQ section label" value={contentValue('faq_label')} onChange={setContent('faq_label')} placeholder="Ask a local" />
      ) : null}
      {!isElementSelection && !isSellerExpertTemplate && !isCommunityTemplate && !isLayeredLawyerTemplate && !isBrokerClassic ? (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <InspectorEyebrow>Process card</InspectorEyebrow>
          <InspectorInput label="Process label" value={contentValue('process_label')} onChange={setContent('process_label')} placeholder={contentPlaceholder('process_label', 'Guided process')} />
          <InspectorInput label="Process heading" value={contentValue('process_heading')} onChange={setContent('process_heading')} placeholder={contentPlaceholder('process_heading', 'Three clear steps forward')} />
          <InspectorInput label="Proof chip: chat" value={contentValue('proof_chat')} onChange={setContent('proof_chat')} placeholder={contentPlaceholder('proof_chat', 'Guided chat support')} />
          <InspectorInput label="Proof chip: handoff" value={contentValue('proof_handoff')} onChange={setContent('proof_handoff')} placeholder={contentPlaceholder('proof_handoff', 'Organized professional handoff')} />
        </div>
      ) : null}
      {!isElementSelection && !isSellerExpertTemplate && !isCommunityTemplate && !isLayeredLawyerTemplate && !isBrokerClassic ? (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <InspectorEyebrow>FAQ card</InspectorEyebrow>
          <InspectorInput label="FAQ label" value={contentValue('faq_label')} onChange={setContent('faq_label')} placeholder={contentPlaceholder('faq_label', 'Helpful questions')} />
          <InspectorInput label="FAQ heading" value={contentValue('faq_heading')} onChange={setContent('faq_heading')} placeholder={contentPlaceholder('faq_heading', 'What clients often ask')} />
          <InspectorInput label="FAQ footer title" value={contentValue('faq_footer_title')} onChange={setContent('faq_footer_title')} placeholder={contentPlaceholder('faq_footer_title', 'Need a more specific answer?')} />
          <InspectorTextarea
            label="FAQ footer body"
            value={contentValue('faq_footer_body')}
            onChange={setContent('faq_footer_body')}
            placeholder={contentPlaceholder('faq_footer_body', 'Use the chat bubble to share your goals…')}
            className="min-h-16 resize-y"
          />
        </div>
      ) : null}
      {!isFaq ? <GuidanceStepsEditor block={block} model={model} /> : null}
      {!isElementSelection && !isSellerExpertTemplate && !isCommunityTemplate
        && (isFaq || (!isBrokerClassic && !isLayeredLawyerTemplate)) ? (
        <GuidanceFaqsEditor block={block} model={model} />
      ) : null}
    </>
  );
}

export function ExpertiseContentFields({ block, model, onChange }) {
  const { isElementSelection, isLayeredLawyerTemplate, isBrokerCommercial, contentValue } = model;
  if (block.type !== T.EXPERTISE || isElementSelection) return null;
  if (isBrokerCommercial) return null;
  const setContent = bindContent(onChange, block.id);
  return (
    <>
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
        {isLayeredLawyerTemplate
          ? 'Practice focus, markets, and professional experience come from your profile. Matching-style tags are omitted so the snapshot stays client-facing.'
          : 'Service, expertise, and area items come from your professional profile and can’t be edited here.'}
      </p>
      {isLayeredLawyerTemplate ? (
        <>
          <InspectorInput label="Process label" value={contentValue('process_label')} onChange={setContent('process_label')} placeholder="How representation starts" />
          <InspectorInput label="Process heading" value={contentValue('process_heading')} onChange={setContent('process_heading')} placeholder="A clear path before any file is opened" />
          <InspectorTextarea
            label="Process description"
            value={contentValue('process_body')}
            onChange={setContent('process_body')}
            placeholder="This is an inquiry process, not legal advice or a promise of representation."
          />
          <ExpertiseProcessEditor block={block} model={model} />
        </>
      ) : null}
    </>
  );
}
