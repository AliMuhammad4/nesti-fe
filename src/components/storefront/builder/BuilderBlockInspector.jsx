'use client';

import { useEffect, useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import { labelForBlock, SECTION_SETTINGS } from './storefrontBuilderState';
import { CONTENT_COLLECTIONS } from './builderContentCollections';
import {
  ColorField,
  Field,
  ImageAdjustmentControls,
  MediaPicker,
  iconButton,
  inputClass,
} from './builderUiPrimitives';

export default function Inspector({
  block,
  profile,
  onChange,
  onDelete,
  onDuplicate,
  media,
  onMediaUpload,
  brandKit,
  onBrandKitChange,
}) {
  const [tab, setTab] = useState('content');
  const [collectionDraft, setCollectionDraft] = useState('');
  useEffect(() => {
    setCollectionDraft('');
  }, [block?.id]);
  if (!block) {
    return (
      <div className="grid h-48 place-items-center px-4 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-700">No block selected</p>
          <p className="mt-1 text-xs text-slate-400">Click a layer or a section in the preview to edit it.</p>
        </div>
      </div>
    );
  }

  const { content, layout, style } = block.data;
  const isHero = block.type === STOREFRONT_BLOCK_TYPES.HERO;
  const collection = isHero ? null : CONTENT_COLLECTIONS[block.type];
  const listToText = (value) => (Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean).join('\n') : '');
  const textToList = (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean);
  const tupleArrayToText = (items = [], keys = []) => (items || [])
    .map((item) => keys.map((key) => (item?.[key] ? String(item[key]).trim() : '')).filter(Boolean).join(' | '))
    .filter(Boolean)
    .join('\n');
  const textToTupleArray = (raw, keys = []) => raw.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const values = line.split('|').map((part) => part.trim());
      return keys.reduce((acc, key, index) => ({ ...acc, [key]: values[index] || '' }), {});
    })
    .filter((item) => Object.values(item).some(Boolean));
  const name = profile?.professional_name || 'your name';
  const isServices = block.type === STOREFRONT_BLOCK_TYPES.SERVICES;
  const supplementalService = {
    agent: {
      title: 'Portfolio Growth Strategy',
      description: 'Build a practical acquisition and diversification plan around your long-term property goals.',
    },
    mortgage_broker: {
      title: 'Financing Strategy Review',
      description: 'Review borrowing options and structure a financing path aligned with your next property goal.',
    },
    lawyer: {
      title: 'Property Advisory',
      description: 'Get clear legal guidance for complex property decisions before moving forward.',
    },
  };
  const profileServiceCards = (profile?.services || [])
    .map((item) => ({
      title: item?.title || item?.name || '',
      description: item?.description || item?.text || '',
    }))
    .filter((item) => item.title)
    .slice(0, 6);
  if (isServices && profileServiceCards.length === 5) {
    profileServiceCards.push(
      supplementalService[profile?.professional_type] || supplementalService.agent,
    );
  }
  const serviceCards = Array.isArray(content.items) && content.items.length
    ? content.items
    : profileServiceCards;
  const commitServiceCards = (next) => {
    onChange(block.id, { content: { items: next.slice(0, 6) } });
  };
  const placeholders = {
    heading: isHero ? (profile?.headline || `Move smarter with ${name}`) : labelForBlock(block.type),
    body: block.type === 'about' ? (profile?.about || '') : '',
  };

  const toggleHidden = (breakpoint) => {
    const hiddenOn = layout.hiddenOn || [];
    onChange(block.id, {
      layout: {
        hiddenOn: hiddenOn.includes(breakpoint)
          ? hiddenOn.filter((item) => item !== breakpoint)
          : [...hiddenOn, breakpoint],
      },
    });
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Selected</p>
          <h2 className="mt-1 text-sm font-bold text-slate-900">{labelForBlock(block.type)}</h2>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => onDuplicate(block.id)} className={iconButton} title="Duplicate"><Copy size={14} /></button>
          <button type="button" onClick={() => onDelete(block.id)} className={`${iconButton} hover:border-red-200 hover:text-red-600`} title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="mt-4 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        {['content', 'layout', 'style'].map((nameTab) => (
          <button
            key={nameTab}
            type="button"
            onClick={() => setTab(nameTab)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold capitalize transition ${tab === nameTab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            {nameTab}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3.5">
        {tab === 'content' ? (
          <>
            {isHero ? (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Hero media</p>
                <MediaPicker
                  label="Cover image"
                  hint="This page only · not your account cover"
                  image={media?.cover || brandKit?.cover_url}
                  onUpload={(file) => onMediaUpload?.('cover', file)}
                  tall
                />
                {(media?.cover || brandKit?.cover_url) ? (
                  <ImageAdjustmentControls
                    image={media?.cover || brandKit?.cover_url}
                    kind="cover"
                    values={brandKit}
                    onChange={onBrandKitChange}
                  />
                ) : null}
                {(media?.cover || brandKit?.cover_url) && (layout.mediaPosition || 'none') === 'none' ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
                    <p className="text-[11px] leading-4 text-amber-900">
                      This template uses a compact hero (no cover band). To show the photo as a cover strip, set Layout → Media treatment to <span className="font-semibold">Show cover</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => onChange(block.id, { layout: { mediaPosition: 'background' } })}
                      className="mt-1.5 text-[11px] font-semibold text-amber-950 underline underline-offset-2"
                    >
                      Switch to cover-band layout
                    </button>
                  </div>
                ) : null}
                <MediaPicker
                  label="Profile photo"
                  hint="This page only · not your account photo"
                  image={media?.profile || brandKit?.profile_photo_url}
                  onUpload={(file) => onMediaUpload?.('profile', file)}
                  circle
                />
                {(media?.profile || brandKit?.profile_photo_url) ? (
                  <ImageAdjustmentControls
                    image={media?.profile || brandKit?.profile_photo_url}
                    kind="profile"
                    values={brandKit}
                    onChange={onBrandKitChange}
                  />
                ) : null}
                <MediaPicker
                  label="Logo"
                  hint="Automatically fitted in the top navigation"
                  image={brandKit?.logo_url || profile?.storefront_logo_url}
                  onUpload={(file) => onMediaUpload?.('logo', file)}
                />
                <p className="px-0.5 text-[10px] leading-4 text-slate-400">
                  Name and company badge come from your profile / business settings. Photos here stay on this storefront only.
                </p>
              </div>
            ) : null}
            <Field label="Heading">
              <input
                value={content.heading || ''}
                onChange={(event) => onChange(block.id, { content: { heading: event.target.value } })}
                className={inputClass}
                placeholder={placeholders.heading}
              />
            </Field>
            {!isHero ? (
              <Field label="Supporting copy">
                <textarea
                  value={content.body || ''}
                  onChange={(event) => onChange(block.id, { content: { body: event.target.value } })}
                  className={`${inputClass} min-h-28 resize-y`}
                  placeholder={placeholders.body || 'Add supporting copy…'}
                />
              </Field>
            ) : null}
            <Field label={isHero ? 'Consultation button label' : 'Button label'}>
              <input
                value={content.cta_label || ''}
                onChange={(event) => onChange(block.id, { content: { cta_label: event.target.value } })}
                className={inputClass}
                placeholder={isHero ? 'Book a Free Consultation' : 'Book a consultation'}
              />
            </Field>
            {!isHero ? (
              <Field label="Button link">
                <input
                  value={content.cta_url || ''}
                  onChange={(event) => onChange(block.id, { content: { cta_url: event.target.value } })}
                  className={inputClass}
                  placeholder="https://…"
                />
              </Field>
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
                The primary inquiry button is fixed. Consultation opens Calendly when linked in business settings.
              </p>
            )}
            {!content.heading && placeholders.heading ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800">
                Preview is using fallback copy until you save a heading here.
              </p>
            ) : null}
            {isServices ? (
              <Field label="Service cards">
                <div className="space-y-2.5">
                  {serviceCards.map((item, index) => (
                    <div key={`${block.id}-service-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Card {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => commitServiceCards(serviceCards.filter((_, itemIndex) => itemIndex !== index))}
                          className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete service card ${index + 1}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <input
                        value={item?.title || ''}
                        onChange={(event) => commitServiceCards(serviceCards.map((card, itemIndex) => (
                          itemIndex === index ? { ...card, title: event.target.value } : card
                        )))}
                        className={`${inputClass} mt-2`}
                        placeholder="Service title"
                      />
                      <textarea
                        value={item?.description || ''}
                        onChange={(event) => commitServiceCards(serviceCards.map((card, itemIndex) => (
                          itemIndex === index ? { ...card, description: event.target.value } : card
                        )))}
                        className={`${inputClass} mt-2 min-h-20 resize-y`}
                        placeholder="Service description"
                      />
                    </div>
                  ))}
                  {serviceCards.length < 6 ? (
                    <button
                      type="button"
                      onClick={() => commitServiceCards([...serviceCards, { title: 'New service', description: '' }])}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Plus size={13} />
                      Add service card
                    </button>
                  ) : null}
                </div>
              </Field>
            ) : null}
            {collection && !isServices ? (
              <Field label={collection.label}>
                <textarea
                  value={collectionDraft || collection.format(content.items)}
                  onChange={(event) => setCollectionDraft(event.target.value)}
                  onBlur={() => {
                    const parsed = collection.parse(collectionDraft || collection.format(content.items));
                    onChange(block.id, { content: { items: parsed } });
                    setCollectionDraft('');
                  }}
                  className={`${inputClass} min-h-32 resize-y font-mono text-xs`}
                  placeholder={collection.hint}
                />
                <p className="mt-1.5 text-[10px] text-slate-400">{collection.hint}</p>
              </Field>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.EXPERTISE ? (
              <>
                <Field label="Services chips">
                  <textarea
                    key={`${block.id}-expertise-services`}
                    defaultValue={listToText(content.services)}
                    onBlur={(event) => onChange(block.id, { content: { services: textToList(event.target.value) } })}
                    className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
                    placeholder="One per line"
                  />
                </Field>
                <Field label="Expertise chips">
                  <textarea
                    key={`${block.id}-expertise-expertise`}
                    defaultValue={listToText(content.expertise)}
                    onBlur={(event) => onChange(block.id, { content: { expertise: textToList(event.target.value) } })}
                    className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
                    placeholder="One per line"
                  />
                </Field>
                <Field label="Areas chips">
                  <textarea
                    key={`${block.id}-expertise-areas`}
                    defaultValue={listToText(content.areas)}
                    onBlur={(event) => onChange(block.id, { content: { areas: textToList(event.target.value) } })}
                    className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
                    placeholder="One per line"
                  />
                </Field>
              </>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.ROLE_DETAILS ? (
              <>
                <Field label="Highlights">
                  <textarea
                    key={`${block.id}-role-highlights`}
                    defaultValue={tupleArrayToText(content.highlights, ['title', 'text'])}
                    onBlur={(event) => onChange(block.id, { content: { highlights: textToTupleArray(event.target.value, ['title', 'text']) } })}
                    className={`${inputClass} min-h-24 resize-y font-mono text-xs`}
                    placeholder="One per line: Title | Description"
                  />
                </Field>
                <Field label="Proof chips">
                  <textarea
                    key={`${block.id}-role-proof`}
                    defaultValue={listToText(content.proof)}
                    onBlur={(event) => onChange(block.id, { content: { proof: textToList(event.target.value) } })}
                    className={`${inputClass} min-h-20 resize-y font-mono text-xs`}
                    placeholder="One per line"
                  />
                </Field>
              </>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.GUIDANCE ? (
              <>
                <Field label="Guide steps">
                  <textarea
                    key={`${block.id}-guide-steps`}
                    defaultValue={tupleArrayToText(content.steps, ['title', 'text'])}
                    onBlur={(event) => onChange(block.id, { content: { steps: textToTupleArray(event.target.value, ['title', 'text']) } })}
                    className={`${inputClass} min-h-24 resize-y font-mono text-xs`}
                    placeholder="One per line: Title | Description"
                  />
                </Field>
                <Field label="FAQs">
                  <textarea
                    key={`${block.id}-guide-faq`}
                    defaultValue={tupleArrayToText(content.faqs, ['q', 'a'])}
                    onBlur={(event) => onChange(block.id, { content: { faqs: textToTupleArray(event.target.value, ['q', 'a']) } })}
                    className={`${inputClass} min-h-24 resize-y font-mono text-xs`}
                    placeholder="One per line: Question | Answer"
                  />
                </Field>
              </>
            ) : null}
            {block.type === STOREFRONT_BLOCK_TYPES.CTA ? (
              <Field label="CTA steps">
                <textarea
                  key={`${block.id}-cta-steps`}
                  defaultValue={tupleArrayToText(content.steps, ['label', 'title', 'description'])}
                  onBlur={(event) => onChange(block.id, { content: { steps: textToTupleArray(event.target.value, ['label', 'title', 'description']) } })}
                  className={`${inputClass} min-h-24 resize-y font-mono text-xs`}
                  placeholder="One per line: Label | Title | Description"
                />
              </Field>
            ) : null}
          </>
        ) : null}

        {tab === 'layout' ? (
          <>
            <Field label="Section variant">
              <select value={layout.variant || 'standard'} onChange={(event) => onChange(block.id, { layout: { variant: event.target.value } })} className={inputClass}>
                {SECTION_SETTINGS.variants.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Alignment">
              <select value={layout.alignment} onChange={(event) => onChange(block.id, { layout: { alignment: event.target.value } })} className={inputClass}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </Field>
            <Field label="Section padding">
              <select value={layout.padding} onChange={(event) => onChange(block.id, { layout: { padding: event.target.value } })} className={inputClass}>
                <option value="small">Compact</option>
                <option value="medium">Comfortable</option>
                <option value="large">Spacious</option>
              </select>
            </Field>
            <Field label="Container width">
              <select value={layout.width || 'full'} onChange={(event) => onChange(block.id, { layout: { width: event.target.value } })} className={inputClass}>
                {SECTION_SETTINGS.widths.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            {isHero ? (
              <Field label="Card style">
                <select value={layout.cardStyle || 'flat'} onChange={(event) => onChange(block.id, { layout: { cardStyle: event.target.value } })} className={inputClass}>
                  {SECTION_SETTINGS.cardStyles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Columns">
                  <select value={layout.columns || '3'} onChange={(event) => onChange(block.id, { layout: { columns: event.target.value } })} className={inputClass}>
                    {SECTION_SETTINGS.columns.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </Field>
                <Field label="Card style">
                  <select value={layout.cardStyle || 'bordered'} onChange={(event) => onChange(block.id, { layout: { cardStyle: event.target.value } })} className={inputClass}>
                    {SECTION_SETTINGS.cardStyles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </Field>
              </div>
            )}
            <Field label="Media treatment">
              <select value={layout.mediaPosition || (isHero ? 'background' : 'none')} onChange={(event) => onChange(block.id, { layout: { mediaPosition: event.target.value } })} className={inputClass}>
                {SECTION_SETTINGS.mediaPositions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {isHero && option.value === 'none' ? 'Hide cover' : isHero && option.value === 'background' ? 'Show cover' : option.label}
                  </option>
                ))}
              </select>
            </Field>
            {isHero && (layout.mediaPosition || 'none') === 'none' ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
                Cover image is hidden. Choose <span className="font-semibold text-slate-700">Show cover</span> to display the uploaded cover in the hero band.
              </p>
            ) : null}
            <Field label="Hide on">
              <div className="flex gap-1.5">
                {['desktop', 'tablet', 'mobile'].map((breakpoint) => (
                  <button
                    key={breakpoint}
                    type="button"
                    onClick={() => toggleHidden(breakpoint)}
                    className={`rounded-md border px-2.5 py-1.5 text-[11px] capitalize ${layout.hiddenOn?.includes(breakpoint) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'}`}
                  >
                    {breakpoint}
                  </button>
                ))}
              </div>
            </Field>
          </>
        ) : null}

        {tab === 'style' ? (
          <>
            {isHero ? (
              <>
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-500">
                  Hero buttons and accents use your brand colors. Section background tint applies behind the hero band.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <ColorField
                    label="Primary"
                    value={brandKit?.primary_color || '#0f766e'}
                    onChange={(primary_color) => onBrandKitChange?.({ primary_color })}
                  />
                  <ColorField
                    label="Accent"
                    value={brandKit?.accent_color || '#f59e0b'}
                    onChange={(accent_color) => onBrandKitChange?.({ accent_color })}
                  />
                </div>
                <ColorField
                  label="Hero band background"
                  value={style.background || '#ffffff'}
                  onChange={(background) => onChange(block.id, { style: { background } })}
                />
              </>
            ) : (
              <>
                <ColorField label="Background" value={style.background || '#ffffff'} onChange={(background) => onChange(block.id, { style: { background } })} />
                <ColorField label="Text color" value={style.textColor || '#0f172a'} onChange={(textColor) => onChange(block.id, { style: { textColor } })} />
                <Field label="Corner radius">
                  <select value={style.radius} onChange={(event) => onChange(block.id, { style: { radius: event.target.value } })} className={inputClass}>
                    <option value="none">Sharp</option>
                    <option value="default">Soft</option>
                    <option value="large">Rounded</option>
                  </select>
                </Field>
                <Field label="Shadow depth">
                  <select value={style.shadow || 'none'} onChange={(event) => onChange(block.id, { style: { shadow: event.target.value } })} className={inputClass}>
                    {SECTION_SETTINGS.shadows.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </Field>
              </>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}
