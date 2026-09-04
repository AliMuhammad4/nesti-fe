import { ColorField } from '../builderUiPrimitives';
import { InspectorEyebrow, ResetSurfaceButton } from './inspectorUi';

function AppearancePanel({ title, description, children, showReset, onReset, resetLabel }) {
  return (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
      <div>
        <InspectorEyebrow>{title}</InspectorEyebrow>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">{description}</p>
      </div>
      {children}
      {showReset ? <ResetSurfaceButton onClick={onReset}>{resetLabel}</ResetSurfaceButton> : null}
    </div>
  );
}

export function RolePanelControls({ content, onChange, blockId, onReset }) {
  return (
    <AppearancePanel
      title="Panel appearance"
      description="Optional override for the Role Details card surface. Leave empty to use template surface colors."
      showReset={Boolean(content.panel_background || content.panel_text_color)}
      onReset={onReset}
      resetLabel="Reset panel to template"
    >
      <ColorField
        label="Panel background"
        value={content.panel_background || ''}
        onChange={(panel_background) => onChange(blockId, { content: { panel_background } })}
      />
      <ColorField
        label="Panel text"
        value={content.panel_text_color || ''}
        onChange={(panel_text_color) => onChange(blockId, { content: { panel_text_color } })}
      />
    </AppearancePanel>
  );
}

export function ProcessCardControls({ content, onChange, blockId, onReset }) {
  return (
    <AppearancePanel
      title="Card appearance"
      description="Optional override. Leave empty to inherit brand + section colors. Step numbers use your brand primary."
      showReset={Boolean(content.process_card_background || content.process_card_text_color || content.process_badge_background || content.process_badge_color)}
      onReset={onReset}
      resetLabel="Reset to brand defaults"
    >
      <ColorField
        label="Card background"
        value={content.process_card_background || ''}
        onChange={(process_card_background) => onChange(blockId, { content: { process_card_background } })}
      />
      <ColorField
        label="Card text"
        value={content.process_card_text_color || ''}
        onChange={(process_card_text_color) => onChange(blockId, { content: { process_card_text_color } })}
      />
    </AppearancePanel>
  );
}

export function FaqCardControls({ content, onChange, blockId, onReset }) {
  return (
    <AppearancePanel
      title="Card appearance"
      description="Optional override. Leave empty to inherit brand + section colors."
      showReset={Boolean(content.faq_card_background || content.faq_card_text_color)}
      onReset={onReset}
      resetLabel="Reset to brand defaults"
    >
      <ColorField
        label="Card background"
        value={content.faq_card_background || ''}
        onChange={(faq_card_background) => onChange(blockId, { content: { faq_card_background } })}
      />
      <ColorField
        label="Card text"
        value={content.faq_card_text_color || ''}
        onChange={(faq_card_text_color) => onChange(blockId, { content: { faq_card_text_color } })}
      />
    </AppearancePanel>
  );
}

export function ServicesIconControls({ content, onChange, blockId, onReset, isSellerCaseStudy, isBrokerClassic = false }) {
  return (
    <AppearancePanel
      title="Icon appearance"
      description={isBrokerClassic
        ? 'Shared icon colors for all cards in this section.'
        : `Shared default icon colors for ${isSellerCaseStudy ? 'success story cards' : 'service cards'}. Card-level icon colors can override these.`}
      showReset={Boolean(content.icon_background || content.icon_color)}
      onReset={onReset}
      resetLabel="Reset icon colors"
    >
      <ColorField
        label="Icon background"
        value={content.icon_background || ''}
        onChange={(icon_background) => onChange(blockId, { content: { icon_background } })}
      />
      <ColorField
        label="Icon color"
        value={content.icon_color || ''}
        onChange={(icon_color) => onChange(blockId, { content: { icon_color } })}
      />
    </AppearancePanel>
  );
}
