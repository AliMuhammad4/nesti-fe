import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import { STOREFRONT_BLOCK_TYPES as T } from '../../storefrontPresets';
import { createContentItemId, labelForBlock } from '../storefrontBuilderState';
import { lawyerClassicIconDefault } from '../../renderers/variants/lawyer/shared/lawyerSectionUtils';
import { normalizeLenderDomain } from '../../renderers/variants/broker/classic/lenderLogoUtils';
import {
  getServiceIconEntry,
  resolveServiceIconKey,
  SERVICE_ICON_DEFAULTS,
  ServiceIconDropdown,
} from '../storefrontServiceIcons';
import { Field } from '../builderUiPrimitives';
import {
  ROLE_HIGHLIGHT_LIMIT,
  ROLE_PROOF_LIMIT,
  SERVICE_CARD_LIMIT,
} from './inspectorConstants';
import {
  CompactCollectionRow,
  DashedAddButton,
  InspectorHint,
  InspectorInput,
  NestedCollectionRow,
  StackedCollectionRow,
} from './inspectorUi';

function moveCollectionItem(items, index, offset) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function duplicateCollectionItem(items, index, limit) {
  if (items.length >= limit) return items;
  const source = items[index] || {};
  const next = [...items];
  next.splice(index + 1, 0, {
    ...source,
    id: createContentItemId(),
    title: source.title ? `${source.title} copy` : source.title,
    label: source.label ? `${source.label} copy` : source.label,
  });
  return next;
}

export function AlternativeCardsEditor({
  block,
  model,
  fieldLabel = 'Options',
  addLabel = 'Add option',
  titlePlaceholder = 'Self-employed borrowers',
  descriptionPlaceholder = 'Present business income through suitable lender programs.',
}) {
  const { serviceCards, commitServiceCards, serviceCardLimit = 12 } = model;
  const updateCard = (index, patch) => {
    commitServiceCards(serviceCards.map((card, cardIndex) => (
      cardIndex === index
        ? { ...card, id: card?.id || createContentItemId(), ...patch }
        : card
    )));
  };

  return (
    <Field label={`${fieldLabel} (${serviceCards.length}/${serviceCardLimit})`}>
      <div className="space-y-2">
        {serviceCards.map((item, index) => {
          const iconKey = resolveServiceIconKey(item?.icon, index);
          return (
            <div
              key={item?.id || `${block.id}-alt-${index}`}
              className="space-y-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                  {item?.title || `Item ${index + 1}`}
                </span>
                {[
                  [ArrowUp, index > 0, () => commitServiceCards(moveCollectionItem(serviceCards, index, -1)), 'Move item up'],
                  [ArrowDown, index < serviceCards.length - 1, () => commitServiceCards(moveCollectionItem(serviceCards, index, 1)), 'Move item down'],
                  [Copy, serviceCards.length < serviceCardLimit, () => commitServiceCards(duplicateCollectionItem(serviceCards, index, serviceCardLimit)), 'Duplicate item'],
                ].map(([Icon, enabled, handler, label]) => (
                  <button
                    key={label}
                    type="button"
                    disabled={!enabled}
                    onClick={handler}
                    className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-primary disabled:opacity-25"
                    aria-label={label}
                  >
                    <Icon size={12} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => commitServiceCards(serviceCards.filter((_, itemIndex) => itemIndex !== index))}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete item ${index + 1}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <InspectorInput
                label="Title"
                value={item?.title || ''}
                onChange={(title) => updateCard(index, { title })}
                placeholder={titlePlaceholder}
              />
              <InspectorInput
                label="Description"
                value={item?.description || ''}
                onChange={(description) => updateCard(index, { description })}
                placeholder={descriptionPlaceholder}
              />
              <Field label="Icon">
                <ServiceIconDropdown
                  value={iconKey}
                  onChange={(icon) => updateCard(index, { icon })}
                />
              </Field>
            </div>
          );
        })}
        <DashedAddButton
          disabled={serviceCards.length >= serviceCardLimit}
          onClick={() => commitServiceCards([...serviceCards, {
            id: createContentItemId(),
            title: 'New item',
            description: 'Add a clear description visitors can scan quickly.',
            icon: SERVICE_ICON_DEFAULTS[serviceCards.length % SERVICE_ICON_DEFAULTS.length],
          }])}
        >
          {serviceCards.length >= serviceCardLimit
            ? `Max ${serviceCardLimit} items reached`
            : addLabel}
        </DashedAddButton>
      </div>
      <InspectorHint>
        Edit title, description, and icon here, or click a card in the preview.
      </InspectorHint>
    </Field>
  );
}

export function RateCardsEditor({ block, model }) {
  const { serviceCards, commitServiceCards, serviceCardLimit = 12 } = model;
  const updateRate = (index, patch) => {
    commitServiceCards(serviceCards.map((card, cardIndex) => (
      cardIndex === index
        ? { ...card, id: card?.id || createContentItemId(), ...patch }
        : card
    )));
  };

  return (
    <Field label={`Rate rows (${serviceCards.length}/${serviceCardLimit})`}>
      <div className="space-y-2">
        {serviceCards.map((item, index) => (
          <div
            key={item?.id || `${block.id}-rate-${index}`}
            className="space-y-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                {item?.title || `Rate ${index + 1}`}
              </span>
              {[
                [ArrowUp, index > 0, () => commitServiceCards(moveCollectionItem(serviceCards, index, -1)), 'Move rate up'],
                [ArrowDown, index < serviceCards.length - 1, () => commitServiceCards(moveCollectionItem(serviceCards, index, 1)), 'Move rate down'],
                [Copy, serviceCards.length < serviceCardLimit, () => commitServiceCards(duplicateCollectionItem(serviceCards, index, serviceCardLimit)), 'Duplicate rate'],
              ].map(([Icon, enabled, handler, label]) => (
                <button
                  key={label}
                  type="button"
                  disabled={!enabled}
                  onClick={handler}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-primary disabled:opacity-25"
                  aria-label={label}
                >
                  <Icon size={12} />
                </button>
              ))}
              <button
                type="button"
                onClick={() => commitServiceCards(serviceCards.filter((_, itemIndex) => itemIndex !== index))}
                className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete rate ${index + 1}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
            <InspectorInput
              label="Product name"
              value={item?.title || ''}
              onChange={(title) => updateRate(index, { title })}
              placeholder="5-Year Fixed"
            />
            <InspectorInput
              label="Rate"
              value={item?.rate || ''}
              onChange={(rate) => updateRate(index, { rate })}
              placeholder="Starting from 4.29%"
            />
            <InspectorInput
              label="Description"
              value={item?.description || ''}
              onChange={(description) => updateRate(index, { description })}
              placeholder="Popular fixed term for purchase and refinance planning."
            />
          </div>
        ))}
        <DashedAddButton
          disabled={serviceCards.length >= serviceCardLimit}
          onClick={() => commitServiceCards([...serviceCards, {
            id: createContentItemId(),
            title: 'New rate',
            rate: 'Starting from —%',
            description: 'Add a short note about who this rate is for.',
          }])}
        >
          {serviceCards.length >= serviceCardLimit
            ? `Max ${serviceCardLimit} rates reached`
            : 'Add rate'}
        </DashedAddButton>
      </div>
      <InspectorHint>
        Edit product name, rate, and description here, or click a row in the preview.
      </InspectorHint>
    </Field>
  );
}

export function LenderCardsEditor({ block, model }) {
  const { serviceCards, commitServiceCards, serviceCardLimit = 24 } = model;
  const updateLender = (index, patch) => {
    commitServiceCards(serviceCards.map((card, cardIndex) => (
      cardIndex === index
        ? { ...card, id: card?.id || createContentItemId(), ...patch }
        : card
    )));
  };

  return (
    <Field label={`Banks & lenders (${serviceCards.length}/${serviceCardLimit})`}>
      <div className="space-y-2">
        {serviceCards.map((item, index) => (
          <div
            key={item?.id || `${block.id}-lender-${index}`}
            className="space-y-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                {item?.title || `Lender ${index + 1}`}
              </span>
              {[
                [ArrowUp, index > 0, () => commitServiceCards(moveCollectionItem(serviceCards, index, -1)), 'Move lender up'],
                [ArrowDown, index < serviceCards.length - 1, () => commitServiceCards(moveCollectionItem(serviceCards, index, 1)), 'Move lender down'],
                [Copy, serviceCards.length < serviceCardLimit, () => commitServiceCards(duplicateCollectionItem(serviceCards, index, serviceCardLimit)), 'Duplicate lender'],
              ].map(([Icon, enabled, handler, label]) => (
                <button
                  key={label}
                  type="button"
                  disabled={!enabled}
                  onClick={handler}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-primary disabled:opacity-25"
                  aria-label={label}
                >
                  <Icon size={12} />
                </button>
              ))}
              <button
                type="button"
                onClick={() => commitServiceCards(serviceCards.filter((_, itemIndex) => itemIndex !== index))}
                className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete lender ${index + 1}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
            <InspectorInput
              label="Bank name"
              value={item?.title || ''}
              onChange={(title) => updateLender(index, { title })}
              placeholder="TD"
            />
            <InspectorInput
              label="Website / logo URL"
              value={item?.domain || item?.website || ''}
              onChange={(value) => {
                const domain = normalizeLenderDomain(value);
                updateLender(index, { domain, website: value.trim() });
              }}
              placeholder="td.com or https://www.td.com"
            />
          </div>
        ))}
        <DashedAddButton
          disabled={serviceCards.length >= serviceCardLimit}
          onClick={() => commitServiceCards([...serviceCards, {
            id: createContentItemId(),
            title: 'New bank',
            domain: '',
            website: '',
            description: '',
          }])}
        >
          {serviceCards.length >= serviceCardLimit
            ? `Max ${serviceCardLimit} lenders reached`
            : 'Add bank'}
        </DashedAddButton>
      </div>
      <InspectorHint>
        Logos load automatically from the website domain. Click a bank in the preview to edit it there too.
      </InspectorHint>
    </Field>
  );
}

export function ServiceCardsEditor({ block, model }) {
  const { serviceCards, commitServiceCards, isSellerCaseStudy, serviceCardLimit = SERVICE_CARD_LIMIT } = model;
  const cardLimit = Number(serviceCardLimit) > 0 ? serviceCardLimit : SERVICE_CARD_LIMIT;
  const isBrokerRates = block?.type === T.MORTGAGE_RATES;
  const showIconPicker = !isBrokerRates && block?.type !== T.BROKER_COMPENSATION;
  return (
    <Field label={`${isSellerCaseStudy ? 'Success story cards' : isBrokerRates ? 'Rate cards' : 'Service cards'} (${serviceCards.length}/${cardLimit})`}>
      <div className="space-y-2">
        {serviceCards.map((item, index) => {
          const iconKey = resolveServiceIconKey(item?.icon, index);
          const CardIcon = getServiceIconEntry(iconKey).Icon;
          return (
            <div
              key={item?.id || `${block.id}-service-${index}`}
              className="space-y-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2"
            >
              <div className="flex items-center gap-2">
                {showIconPicker ? (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <CardIcon size={14} />
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                  {item?.title || (isBrokerRates ? 'Untitled rate' : 'Untitled service')}
                </span>
                {[
                  [ArrowUp, index > 0, () => commitServiceCards(moveCollectionItem(serviceCards, index, -1)), 'Move card up'],
                  [ArrowDown, index < serviceCards.length - 1, () => commitServiceCards(moveCollectionItem(serviceCards, index, 1)), 'Move card down'],
                  [Copy, serviceCards.length < cardLimit, () => commitServiceCards(duplicateCollectionItem(serviceCards, index, cardLimit)), 'Duplicate card'],
                ].map(([Icon, enabled, handler, label]) => (
                  <button
                    key={label}
                    type="button"
                    disabled={!enabled}
                    onClick={handler}
                    className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-primary disabled:opacity-25"
                    aria-label={label}
                  >
                    <Icon size={12} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => commitServiceCards(serviceCards.filter((_, itemIndex) => itemIndex !== index))}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${isSellerCaseStudy ? 'story' : isBrokerRates ? 'rate' : 'service'} card ${index + 1}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {showIconPicker ? (
                <ServiceIconDropdown
                  value={iconKey}
                  onChange={(icon) => {
                    const next = serviceCards.map((card, cardIndex) => (
                      cardIndex === index
                        ? { ...card, id: card?.id || createContentItemId(), icon }
                        : {
                            ...card,
                            id: card?.id || createContentItemId(),
                            icon: resolveServiceIconKey(card?.icon, cardIndex),
                          }
                    ));
                    commitServiceCards(next);
                  }}
                />
              ) : null}
            </div>
          );
        })}
        <DashedAddButton
          disabled={serviceCards.length >= cardLimit}
          onClick={() => commitServiceCards([...serviceCards, {
            id: createContentItemId(),
            title: isSellerCaseStudy ? 'New story stage' : isBrokerRates ? 'New rate' : 'New service',
            description: isSellerCaseStudy
              ? 'Add the challenge, strategy, or result for this success story.'
              : 'Add a clear one-line summary of this service for better client understanding.',
            rate: isBrokerRates ? 'Starting from X.XX%' : '',
            icon: showIconPicker ? SERVICE_ICON_DEFAULTS[serviceCards.length % SERVICE_ICON_DEFAULTS.length] : '',
            url: '',
          }])}
        >
          {serviceCards.length >= cardLimit
            ? `Max ${cardLimit} cards reached`
            : isSellerCaseStudy
              ? 'Add story card'
              : isBrokerRates
                ? 'Add rate'
                : 'Add service card'}
        </DashedAddButton>
      </div>
      <InspectorHint>
        {showIconPicker
          ? 'Choose an icon here, or click a card in the preview to edit title, description, and card-level colors.'
          : 'Click a card in the preview to edit title, rate, and description.'}
      </InspectorHint>
    </Field>
  );
}

export function ExpertiseProcessEditor({ block, model }) {
  const { expertiseProcessSteps, commitExpertiseProcessSteps, expertiseProcessLimit } = model;
  return (
    <Field label={`Process steps (${expertiseProcessSteps.length}/${expertiseProcessLimit})`}>
      <div className="space-y-1.5">
        {expertiseProcessSteps.map((item, index) => (
          <CompactCollectionRow
            key={item?.id || `${block.id}-process-${index}`}
            index={index}
            title={item?.title}
            fallback="Untitled step"
            onDelete={() => commitExpertiseProcessSteps(expertiseProcessSteps.filter((_, itemIndex) => itemIndex !== index))}
            deleteLabel={`Delete process step ${index + 1}`}
            onMoveUp={index > 0 ? () => commitExpertiseProcessSteps(moveCollectionItem(expertiseProcessSteps, index, -1)) : null}
            onMoveDown={index < expertiseProcessSteps.length - 1 ? () => commitExpertiseProcessSteps(moveCollectionItem(expertiseProcessSteps, index, 1)) : null}
            onDuplicate={expertiseProcessSteps.length < expertiseProcessLimit ? () => commitExpertiseProcessSteps(duplicateCollectionItem(expertiseProcessSteps, index, expertiseProcessLimit)) : null}
          />
        ))}
        <DashedAddButton
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
      </div>
      <InspectorHint>Click any step in the preview to edit its title and description.</InspectorHint>
    </Field>
  );
}

export function RoleHighlightsEditor({ block, model }) {
  const {
    roleHighlights,
    commitRoleHighlights,
    isCommunityTemplate,
    isLawyerClassicStatement,
  } = model;
  return (
    <Field label={`Highlight cards (${roleHighlights.length}/${ROLE_HIGHLIGHT_LIMIT})`}>
      <div className="space-y-2">
        {roleHighlights.map((item, index) => {
          const showIconPicker = isCommunityTemplate || isLawyerClassicStatement;
          const iconKey = resolveServiceIconKey(
            item?.icon || (isLawyerClassicStatement
              ? lawyerClassicIconDefault(block.type, index)
              : 'target'),
            index,
          );
          return (
            <StackedCollectionRow
              key={item?.id || `${block.id}-highlight-${index}`}
              index={index}
              title={item?.title}
              fallback="Untitled highlight"
              onDelete={() => commitRoleHighlights(roleHighlights.filter((_, itemIndex) => itemIndex !== index))}
              deleteLabel={`Delete highlight ${index + 1}`}
              onMoveUp={index > 0 ? () => commitRoleHighlights(moveCollectionItem(roleHighlights, index, -1)) : null}
              onMoveDown={index < roleHighlights.length - 1 ? () => commitRoleHighlights(moveCollectionItem(roleHighlights, index, 1)) : null}
              onDuplicate={roleHighlights.length < ROLE_HIGHLIGHT_LIMIT ? () => commitRoleHighlights(duplicateCollectionItem(roleHighlights, index, ROLE_HIGHLIGHT_LIMIT)) : null}
            >
              {showIconPicker ? (
                <ServiceIconDropdown
                  value={iconKey}
                  onChange={(icon) => {
                    commitRoleHighlights(roleHighlights.map((card, cardIndex) => (
                      cardIndex === index
                        ? { ...card, id: card?.id || createContentItemId(), icon }
                        : card
                    )));
                  }}
                />
              ) : null}
            </StackedCollectionRow>
          );
        })}
        <DashedAddButton
          disabled={roleHighlights.length >= ROLE_HIGHLIGHT_LIMIT}
          onClick={() => commitRoleHighlights([...roleHighlights, {
            id: createContentItemId(),
            title: 'New highlight',
            text: 'Describe this highlight for visitors.',
            icon: isCommunityTemplate
              ? 'target'
              : isLawyerClassicStatement
                ? lawyerClassicIconDefault(block.type, roleHighlights.length)
                : '',
            background: '',
            text_color: '',
          }])}
        >
          {roleHighlights.length >= ROLE_HIGHLIGHT_LIMIT ? 'Max 6 highlights reached' : 'Add highlight'}
        </DashedAddButton>
      </div>
      <InspectorHint>
        {isCommunityTemplate || isLawyerClassicStatement
          ? 'Choose an icon here, or click a card in the preview to edit title, description, and colors.'
          : 'Click any highlight card in the preview to edit title, description, and card colors.'}
      </InspectorHint>
    </Field>
  );
}

export function RoleProofEditor({ block, model }) {
  const { roleProof, commitRoleProof } = model;
  return (
    <Field label={`Proof chips (${roleProof.length}/${ROLE_PROOF_LIMIT})`}>
      <div className="space-y-1.5">
        {roleProof.map((item, index) => (
          <CompactCollectionRow
            key={item?.id || `${block.id}-proof-${index}`}
            index={index}
            title={item?.text}
            fallback="Untitled proof"
            padIndex={false}
            onDelete={() => commitRoleProof(roleProof.filter((_, itemIndex) => itemIndex !== index))}
            deleteLabel={`Delete proof chip ${index + 1}`}
          />
        ))}
        <DashedAddButton
          disabled={roleProof.length >= ROLE_PROOF_LIMIT}
          onClick={() => commitRoleProof([...roleProof, {
            id: createContentItemId(),
            text: 'New proof point',
            background: '',
            text_color: '',
          }])}
        >
          {roleProof.length >= ROLE_PROOF_LIMIT ? 'Max 8 proof chips reached' : 'Add proof chip'}
        </DashedAddButton>
      </div>
      <InspectorHint>Click any proof chip in the preview to edit its label and colors.</InspectorHint>
    </Field>
  );
}

export function LawyerClassicCardsEditor({ block, model }) {
  const {
    lawyerClassicCards,
    commitLawyerClassicCards,
    lawyerClassicCardLimit,
    lawyerClassicUsesCardIcons,
  } = model;
  return (
    <Field label={`${labelForBlock(block.type)} cards (${lawyerClassicCards.length}/${lawyerClassicCardLimit})`}>
      <div className={lawyerClassicUsesCardIcons ? 'space-y-2' : 'space-y-1.5'}>
        {lawyerClassicCards.map((item, index) => {
          const iconKey = resolveServiceIconKey(
            item?.icon || lawyerClassicIconDefault(block.type, index),
            index,
          );
          return (
            <NestedCollectionRow
              key={item?.id || `${block.id}-layer-${index}`}
              stacked={lawyerClassicUsesCardIcons}
              index={index}
              title={item?.title}
              fallback="Untitled card"
              onDelete={() => commitLawyerClassicCards(lawyerClassicCards.filter((_, itemIndex) => itemIndex !== index))}
              deleteLabel={`Delete card ${index + 1}`}
              onMoveUp={index > 0 ? () => commitLawyerClassicCards(moveCollectionItem(lawyerClassicCards, index, -1)) : null}
              onMoveDown={index < lawyerClassicCards.length - 1 ? () => commitLawyerClassicCards(moveCollectionItem(lawyerClassicCards, index, 1)) : null}
              onDuplicate={lawyerClassicCards.length < lawyerClassicCardLimit ? () => commitLawyerClassicCards(duplicateCollectionItem(lawyerClassicCards, index, lawyerClassicCardLimit)) : null}
            >
              {lawyerClassicUsesCardIcons ? (
                <ServiceIconDropdown
                  value={iconKey}
                  onChange={(icon) => {
                    commitLawyerClassicCards(lawyerClassicCards.map((card, cardIndex) => (
                      cardIndex === index
                        ? { ...card, id: card?.id || createContentItemId(), icon }
                        : card
                    )));
                  }}
                />
              ) : null}
            </NestedCollectionRow>
          );
        })}
        <DashedAddButton
          disabled={lawyerClassicCards.length >= lawyerClassicCardLimit}
          onClick={() => commitLawyerClassicCards([...lawyerClassicCards, {
            id: createContentItemId(),
            title: 'New item',
            description: 'Add a clear description visitors can scan quickly.',
            icon: lawyerClassicUsesCardIcons
              ? lawyerClassicIconDefault(block.type, lawyerClassicCards.length)
              : '',
            cta_label: block.type === T.CONSULTATION_OPTIONS ? 'Get started' : '',
            action: 'inquiry',
          }])}
        >
          {lawyerClassicCards.length >= lawyerClassicCardLimit
            ? `Max ${lawyerClassicCardLimit} cards reached`
            : 'Add card'}
        </DashedAddButton>
      </div>
      <InspectorHint>
        {lawyerClassicUsesCardIcons
          ? 'Choose an icon here, or click a card in the preview to edit title, description, and colors.'
          : 'Click any card in the preview to edit title, description, and colors.'}
      </InspectorHint>
    </Field>
  );
}

export function GuidanceStepsEditor({ block, model }) {
  const {
    guidanceSteps,
    commitGuidanceSteps,
    guidanceStepLimit,
    isLawyerClassicGuidance,
  } = model;
  return (
    <Field label={`Guide steps (${guidanceSteps.length}/${guidanceStepLimit})`}>
      <div className={isLawyerClassicGuidance ? 'space-y-2' : 'space-y-1.5'}>
        {guidanceSteps.map((item, index) => {
          const iconKey = resolveServiceIconKey(
            item?.icon || lawyerClassicIconDefault(block.type, index),
            index,
          );
          return (
            <NestedCollectionRow
              key={item?.id || `${block.id}-step-${index}`}
              stacked={isLawyerClassicGuidance}
              index={index}
              title={item?.title}
              fallback="Untitled step"
              onDelete={() => commitGuidanceSteps(guidanceSteps.filter((_, itemIndex) => itemIndex !== index))}
              deleteLabel={`Delete step ${index + 1}`}
              onMoveUp={index > 0 ? () => commitGuidanceSteps(moveCollectionItem(guidanceSteps, index, -1)) : null}
              onMoveDown={index < guidanceSteps.length - 1 ? () => commitGuidanceSteps(moveCollectionItem(guidanceSteps, index, 1)) : null}
              onDuplicate={guidanceSteps.length < guidanceStepLimit ? () => commitGuidanceSteps(duplicateCollectionItem(guidanceSteps, index, guidanceStepLimit)) : null}
            >
              {isLawyerClassicGuidance ? (
                <ServiceIconDropdown
                  value={iconKey}
                  onChange={(icon) => {
                    commitGuidanceSteps(guidanceSteps.map((step, stepIndex) => (
                      stepIndex === index
                        ? { ...step, id: step?.id || createContentItemId(), icon }
                        : step
                    )));
                  }}
                />
              ) : null}
            </NestedCollectionRow>
          );
        })}
        <DashedAddButton
          disabled={guidanceSteps.length >= guidanceStepLimit}
          onClick={() => commitGuidanceSteps([...guidanceSteps, {
            id: createContentItemId(),
            title: 'New step',
            text: 'Describe this step for your clients.',
            icon: isLawyerClassicGuidance
              ? lawyerClassicIconDefault(block.type, guidanceSteps.length)
              : '',
          }])}
        >
          {guidanceSteps.length >= guidanceStepLimit
            ? `Max ${guidanceStepLimit} steps reached`
            : 'Add step'}
        </DashedAddButton>
      </div>
      <InspectorHint>
        {isLawyerClassicGuidance
          ? 'Choose an icon here, or click any step in the preview to edit its title and description.'
          : 'Click any step in the preview to edit its title and description.'}
      </InspectorHint>
    </Field>
  );
}

export function InvestorFooterLinksEditor({ block, onChange, resolvedItems = [] }) {
  const persisted = Array.isArray(block?.data?.content?.items) ? block.data.content.items : [];
  const items = persisted.length ? persisted : resolvedItems;
  const commit = (next) => onChange(block.id, { content: { items: next } });
  return (
    <Field label={`Footer links (${items.length}/8)`}>
      <div className="space-y-2">
        {items.map((item, index) => (
          <StackedCollectionRow
            key={item?.id || `${block.id}-footer-link-${index}`}
            index={index}
            title={item?.label || item?.title}
            fallback="Untitled link"
            onDelete={() => commit(items.filter((_, itemIndex) => itemIndex !== index))}
            deleteLabel={`Delete footer link ${index + 1}`}
            onMoveUp={index > 0 ? () => commit(moveCollectionItem(items, index, -1)) : null}
            onMoveDown={index < items.length - 1 ? () => commit(moveCollectionItem(items, index, 1)) : null}
            onDuplicate={items.length < 8 ? () => commit(duplicateCollectionItem(items, index, 8)) : null}
          >
            <InspectorInput
              label="Link label"
              value={item?.label || item?.title || ''}
              onChange={(label) => commit(items.map((entry, itemIndex) => (
                itemIndex === index ? { ...entry, id: entry.id || createContentItemId(), label } : entry
              )))}
              placeholder="Explore"
            />
            <InspectorInput
              label="Link target"
              value={item?.target || item?.url || ''}
              onChange={(target) => commit(items.map((entry, itemIndex) => (
                itemIndex === index ? { ...entry, id: entry.id || createContentItemId(), target } : entry
              )))}
              placeholder="#services, /contact, or https://example.com"
            />
          </StackedCollectionRow>
        ))}
        <DashedAddButton
          disabled={items.length >= 8}
          onClick={() => commit([...items, {
            id: createContentItemId(),
            label: 'New link',
            target: '#about',
          }])}
        >
          {items.length >= 8 ? 'Max 8 links reached' : 'Add footer link'}
        </DashedAddButton>
      </div>
      <InspectorHint>Hash, relative, mail, phone, and secure external links are supported.</InspectorHint>
    </Field>
  );
}

export function GuidanceFaqsEditor({ block, model }) {
  const { guidanceFaqs, commitGuidanceFaqs, guidanceFaqLimit } = model;
  return (
    <Field label={`FAQs (${guidanceFaqs.length}/${guidanceFaqLimit})`}>
      <div className="space-y-1.5">
        {guidanceFaqs.map((item, index) => (
          <CompactCollectionRow
            key={item?.id || `${block.id}-faq-${index}`}
            index={index}
            title={item?.q}
            fallback="Untitled question"
            padIndex={false}
            onDelete={() => commitGuidanceFaqs(guidanceFaqs.filter((_, itemIndex) => itemIndex !== index))}
            deleteLabel={`Delete FAQ ${index + 1}`}
          />
        ))}
        <DashedAddButton
          disabled={guidanceFaqs.length >= guidanceFaqLimit}
          onClick={() => commitGuidanceFaqs([...guidanceFaqs, {
            id: createContentItemId(),
            q: 'New question',
            a: 'Add a clear answer clients can skim quickly.',
          }])}
        >
          {guidanceFaqs.length >= guidanceFaqLimit ? `Max ${guidanceFaqLimit} FAQs reached` : 'Add FAQ'}
        </DashedAddButton>
      </div>
      <InspectorHint>Click any question in the preview to edit the question and answer.</InspectorHint>
    </Field>
  );
}


