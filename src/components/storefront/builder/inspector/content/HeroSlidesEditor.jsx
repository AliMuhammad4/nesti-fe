'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Redo2, Trash2, Undo2 } from 'lucide-react';
import { BuilderSelect, ImageAdjustmentControls, MediaPicker, Field, inputClass } from '../../builderUiPrimitives';
import { createContentItemId } from '../../storefrontBuilderState';
import {
  FIRST_HOME_HERO_SLIDE_MAX,
  FIRST_HOME_HERO_SLIDE_MIN,
  FIRST_HOME_HERO_SLIDES,
  commitFirstHomeHeroSlides,
  normalizeFirstHomeHeroSlides,
} from '../../../renderers/variants/broker/firstHome/brokerFirstHomeDefaults';
import {
  COMMERCIAL_HERO_SLIDE_MAX,
  COMMERCIAL_HERO_SLIDE_MIN,
  COMMERCIAL_HERO_SLIDES,
  commitCommercialHeroSlides,
  normalizeCommercialHeroSlides,
} from '../../../renderers/variants/broker/commercial/brokerCommercialDefaults';
import { DashedAddButton, InspectorInput, InspectorTextarea } from '../inspectorUi';

function moveSlide(slides, index, offset) {
  const target = index + offset;
  if (target < 0 || target >= slides.length) return slides;
  const next = [...slides];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function resolveSlideConfig(model) {
  if (model.isBrokerCommercial) {
    return {
      min: COMMERCIAL_HERO_SLIDE_MIN,
      max: COMMERCIAL_HERO_SLIDE_MAX,
      defaults: COMMERCIAL_HERO_SLIDES,
      normalize: normalizeCommercialHeroSlides,
      commit: commitCommercialHeroSlides,
      editorKind: 'hero-commercial',
      eyebrowPlaceholder: 'Commercial desk',
      headingPlaceholder: 'Financing built for operators and sponsors',
      bodyPlaceholder: 'Add a short supporting line for this commercial slide.',
    };
  }
  return {
    min: FIRST_HOME_HERO_SLIDE_MIN,
    max: FIRST_HOME_HERO_SLIDE_MAX,
    defaults: FIRST_HOME_HERO_SLIDES,
    normalize: normalizeFirstHomeHeroSlides,
    commit: commitFirstHomeHeroSlides,
    editorKind: 'hero-first-home',
    eyebrowPlaceholder: 'First-home financing',
    headingPlaceholder: 'Your first home starts here',
    bodyPlaceholder: 'Add a short supporting line.',
  };
}

export function HeroSlidesEditor({
  block,
  model,
  onChange,
  onMediaUpload,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) {
  const { isBrokerFirstHome, isBrokerCommercial, content } = model;
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const isHeroSlidesEditor = (isBrokerFirstHome || isBrokerCommercial) && block?.type === 'hero';
  if (!isHeroSlidesEditor) return null;

  const slideConfig = resolveSlideConfig(model);
  const slides = slideConfig.normalize(content?.slides);
  const canDeleteSlide = slides.length > slideConfig.min;
  const commitSlides = (next) => {
    const normalized = slideConfig.commit(next).map((slide) => ({
      ...slide,
      id: slide.id || createContentItemId(),
    }));
    onChange(block.id, {
      content: { slides: normalized },
    });
  };

  const updateSlide = (index, patch) => {
    commitSlides(slides.map((slide, slideIndex) => (
      slideIndex === index ? { ...slide, ...patch } : slide
    )));
  };

  const addSlide = () => {
    if (slides.length >= slideConfig.max) return;
    const fallback = slideConfig.defaults[slides.length] || slideConfig.defaults[0];
    commitSlides([
      ...slides,
      {
        ...fallback,
        id: createContentItemId(),
        image_url: '',
      },
    ]);
  };

  const removeSlide = (index) => {
    if (!canDeleteSlide) return;
    commitSlides(slides.filter((_, slideIndex) => slideIndex !== index));
  };

  const uploadSlideImage = async (index, file) => {
    if (!file || !onMediaUpload) return;
    setUploadingIndex(index);
    try {
      const url = await onMediaUpload('gallery', file);
      if (url) updateSlide(index, { image_url: url });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <Field label={`Hero slides (${slides.length}/${slideConfig.max})`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex-1 text-[10px] leading-4 text-slate-400">
          Add up to three slides. Delete extras anytime. Undo/redo restores recent slide edits.
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || !onUndo}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
            title="Undo slide change"
            aria-label="Undo"
          >
            <Undo2 size={12} />
            Undo
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo || !onRedo}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
            title="Redo slide change"
            aria-label="Redo"
          >
            <Redo2 size={12} />
            Redo
          </button>
        </div>
      </div>
      <div className="space-y-2.5">
        {slides.map((slide, index) => (
          <div
            key={slide.id || `slide-${index}`}
            className="space-y-2 rounded-xl border border-slate-200 bg-white p-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-slate-700">
                Slide {index + 1}
                {slide.heading ? ` · ${slide.heading}` : ''}
              </span>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => commitSlides(moveSlide(slides, index, -1))}
                className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-primary disabled:opacity-25"
                aria-label={`Move slide ${index + 1} up`}
                title="Move up"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                disabled={index >= slides.length - 1}
                onClick={() => commitSlides(moveSlide(slides, index, 1))}
                className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-primary disabled:opacity-25"
                aria-label={`Move slide ${index + 1} down`}
                title="Move down"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                disabled={!canDeleteSlide}
                onClick={() => removeSlide(index)}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={`Delete slide ${index + 1}`}
                title={canDeleteSlide ? 'Delete this slide' : 'At least one slide is required'}
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>

            <MediaPicker
              label={`Slide ${index + 1} image`}
              hint={uploadingIndex === index ? 'Uploading image…' : 'Upload a photo for this slide'}
              image={slide.image_url}
              uploading={uploadingIndex === index}
              onUpload={(file) => uploadSlideImage(index, file)}
              tall
            />
            <input
              value={slide.image_url}
              onChange={(event) => updateSlide(index, { image_url: event.target.value })}
              className={inputClass}
              placeholder="Or paste an image URL"
              aria-label={`Slide ${index + 1} image URL`}
            />
            {slide.image_url ? (
              <ImageAdjustmentControls
                image={slide.image_url}
                kind="cover"
                editorKind={slideConfig.editorKind}
                fieldPrefix="image"
                label="slide image"
                values={{
                  image_position_x: slide.image_position_x,
                  image_position_y: slide.image_position_y,
                  image_zoom: slide.image_zoom,
                }}
                onChange={(patch) => updateSlide(index, patch)}
              />
            ) : null}

            <InspectorInput
              label="Eyebrow"
              value={slide.eyebrow}
              onChange={(value) => updateSlide(index, { eyebrow: value })}
              placeholder={slideConfig.eyebrowPlaceholder}
            />
            <InspectorInput
              label="Heading"
              value={slide.heading}
              onChange={(value) => updateSlide(index, { heading: value })}
              placeholder={slideConfig.headingPlaceholder}
            />
            <InspectorTextarea
              label="Description"
              value={slide.body}
              onChange={(value) => updateSlide(index, { body: value })}
              placeholder={slideConfig.bodyPlaceholder}
              className="min-h-20 resize-y"
            />
          </div>
        ))}
      </div>
      <DashedAddButton
        disabled={slides.length >= slideConfig.max}
        onClick={addSlide}
      >
        {slides.length >= slideConfig.max
          ? `Max ${slideConfig.max} slides reached`
          : 'Add slide'}
      </DashedAddButton>
    </Field>
  );
}
