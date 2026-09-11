import { BuilderSelect, Field } from '../builderUiPrimitives';
import { InspectorInput } from './inspectorUi';
import {
  LENDER_BANK_CUSTOM_KEY,
  applyLenderPreset,
  lenderBankSelectOptions,
  resolveLenderPresetKey,
} from '../../renderers/variants/broker/classic/lenderBankPresets';
import { normalizeLenderDomain } from '../../renderers/variants/broker/classic/lenderLogoUtils';

export default function LenderBankFields({ item = {}, onChange }) {
  const presetKey = resolveLenderPresetKey(item);
  const isCustom = presetKey === LENDER_BANK_CUSTOM_KEY;

  const updatePreset = (nextKey) => {
    onChange?.(applyLenderPreset(nextKey));
  };

  const updateWebsite = (value) => {
    const trimmed = String(value || '').trim();
    const domain = normalizeLenderDomain(trimmed);
    onChange?.({
      preset_key: LENDER_BANK_CUSTOM_KEY,
      domain,
      website: trimmed,
    });
  };

  const updateTitle = (title) => {
    onChange?.({
      preset_key: isCustom ? LENDER_BANK_CUSTOM_KEY : presetKey,
      title,
    });
  };

  return (
    <>
      <Field label="Bank">
        <BuilderSelect
          value={presetKey}
          options={lenderBankSelectOptions()}
          onChange={updatePreset}
          ariaLabel="Select bank"
        />
      </Field>
      <InspectorInput
        label="Bank name"
        value={item?.title || ''}
        onChange={updateTitle}
        placeholder={isCustom ? 'Your lender name' : 'Bank name'}
      />
      <InspectorInput
        label="Website URL"
        value={item?.domain || item?.website || ''}
        onChange={updateWebsite}
        placeholder="td.com or https://www.td.com"
      />
    </>
  );
}
