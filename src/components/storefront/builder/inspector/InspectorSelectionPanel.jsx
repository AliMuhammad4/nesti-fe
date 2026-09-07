import { labelForBlock } from '../storefrontBuilderState';
import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';
import { normalizeFirstHomeHeroSlides } from '../../renderers/variants/broker/firstHome/brokerFirstHomeDefaults';
import ProfileSelectionFields from './selection/ProfileSelectionFields';
import ElementFieldEditor from './selection/ElementFieldEditor';
import ItemSelectionFields from './selection/ItemSelectionFields';

export default function InspectorSelectionPanel({
  block,
  model,
  selection,
  profile,
  media,
  brandKit,
  onChange,
  onItemChange,
  onItemAdd,
  onItemDelete,
  onMediaUpload,
  onBrandKitChange,
}) {
  const {
    isProcessCardContext,
    isFaqCardContext,
    selectedField,
    isProfileSelection,
    isItemSelection,
    hasEditableCards,
    isSellerCaseStudy,
    isLawyerClassicItemCards,
    isRoleDetails,
    isBrokerFirstHome,
    content,
  } = model;

  const heroSlideCount = isBrokerFirstHome && block?.type === T.HERO
    ? normalizeFirstHomeHeroSlides(content?.slides).length
    : 0;
  const showDeleteButton = !(selection?.collection === 'slides' && heroSlideCount <= 1);

  if (!selection?.kind || selection.kind === 'block') return null;

  const deleteLabel = hasEditableCards
    ? (isSellerCaseStudy
      ? 'Delete this story card'
      : block?.type === 'lender-network'
        ? 'Delete this bank'
        : block?.type === 'mortgage-rates'
          ? 'Delete this rate'
          : block?.type === 'alternative-lending'
            ? 'Delete this option'
            : block?.type === 'broker-compensation'
              ? 'Delete this item'
              : block?.type === 'mortgage-programs'
                ? 'Delete this program'
                : 'Delete this service card')
    : isLawyerClassicItemCards && selection?.collection === 'items'
      ? `Delete this ${labelForBlock(block.type).toLowerCase()} card`
      : isRoleDetails && selection?.collection === 'highlights'
        ? 'Delete this highlight'
        : isRoleDetails && selection?.collection === 'proof'
          ? 'Delete this proof chip'
          : 'Delete this item';

  return (
    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Selected element</p>
      <p className="mt-1 text-xs font-semibold text-slate-900">
        {isProcessCardContext || isFaqCardContext
          ? `${isProcessCardContext ? 'Process card' : 'FAQ card'} · ${selection.label || selectedField}`
          : (selection.label || selectedField)}
      </p>
      {isProfileSelection ? (
        <div className="mt-2 space-y-2 text-[11px] leading-4 text-slate-600">
          <p>This comes from your professional profile and is protected from deletion.</p>
          <ProfileSelectionFields
            selectedField={selectedField}
            block={block}
            media={media}
            brandKit={brandKit}
            profile={profile}
            onMediaUpload={onMediaUpload}
            onBrandKitChange={onBrandKitChange}
          />
        </div>
      ) : isItemSelection ? (
        <div className="mt-2 space-y-2">
          <ItemSelectionFields
            block={block}
            model={model}
            selection={selection}
            onItemChange={onItemChange}
            onItemAdd={onItemAdd}
            onMediaUpload={onMediaUpload}
          />
          {showDeleteButton ? (
          <button
            type="button"
            onClick={onItemDelete}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
          >
            {deleteLabel}
          </button>
          ) : null}
        </div>
      ) : (
        <ElementFieldEditor block={block} model={model} onChange={onChange} />
      )}
    </div>
  );
}
