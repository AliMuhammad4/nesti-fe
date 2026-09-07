'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Trash2 } from 'lucide-react';
import { BuilderSelect, ImageAdjustmentControls, MediaPicker, Field, inputClass } from '../../builderUiPrimitives';
import { createContentItemId } from '../../storefrontBuilderState';
import {
  FIRST_HOME_HERO_SLIDE_MAX,
  FIRST_HOME_HERO_SLIDE_MIN,
  FIRST_HOME_HERO_SLIDES,
  commitFirstHomeHeroSlides,
  normalizeFirstHomeHeroSlides,
} from '../../../renderers/variants/broker/firstHome/brokerFirstHomeDefaults';
import { DashedAddButton, InspectorHint, InspectorInput, InspectorTextarea } from '../inspectorUi';

function moveSlide(slides, index, offset) {
  const target = index + offset;
  if (target < 0 || target >= slides.length) return slides;
  const next = [...slides];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function HeroSlidesEditor({
  block,
  model,
  onChange,
  onMediaUpload,
}) {
  const { isBrokerFirstHome, content } = model;
  if (!isBrokerFirstHome || block?.type !== 'hero') return null;

  const [uploadingIndex, setUploadingIndex] = useState(null);
  const slides = normalizeFirstHomeHeroSlides(content?.slides);
  const commitSlides = (next) => {
    const normalized = commitFirstHomeHeroSlides(next).map((slide) => ({
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
    if (slides.length >= FIRST_HOME_HERO_SLIDE_MAX) return;
    const fallback = FIRST_HOME_HERO_SLIDES[slides.length] || FIRST_HOME_HERO_SLIDES[0];
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
    if (slides.length <= FIRST_HOME_HERO_SLIDE_MIN) return;
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
    <Field label={`Hero slides (${slides.length}/${FIRST_HOME_HERO_SLIDE_MAX})`}>
      <InspectorHint>
        Start with one slide. Add up to three for a carousel — slider controls only appear when you have more than one. Use the visual editor to reposition and zoom each slide image.
      </InspectorHint>
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
                className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-primary disabled:opacity-25"
                aria-label={`Move slide ${index + 1} up`}
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                disabled={index >= slides.length - 1}
                onClick={() => commitSlides(moveSlide(slides, index, 1))}
                className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-primary disabled:opacity-25"
                aria-label={`Move slide ${index + 1} down`}
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                disabled={slides.length <= FIRST_HOME_HERO_SLIDE_MIN}
                onClick={() => removeSlide(index)}
                className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-25"
                aria-label={`Delete slide ${index + 1}`}
                title={slides.length <= FIRST_HOME_HERO_SLIDE_MIN ? 'At least one slide is required' : 'Delete slide'}
              >
                <Trash2 size={12} />
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
                editorKind="hero-first-home"
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
            <Field label="Image fit">
              <BuilderSelect
                value={slide.image_fit === 'contain' ? 'contain' : 'cover'}
                options={[
                  { value: 'cover', label: 'Fill frame (crop edges)' },
                  { value: 'contain', label: 'Fit full image (no crop)' },
                ]}
                onChange={(value) => updateSlide(index, { image_fit: value })}
                ariaLabel={`Slide ${index + 1} image fit`}
              />
            </Field>

            <InspectorInput
              label="Eyebrow"
              value={slide.eyebrow}
              onChange={(value) => updateSlide(index, { eyebrow: value })}
              placeholder="First-home financing"
            />
            <InspectorInput
              label="Heading"
              value={slide.heading}
              onChange={(value) => updateSlide(index, { heading: value })}
              placeholder="Your first home starts here"
            />
            <InspectorTextarea
              label="Description"
              value={slide.body}
              onChange={(value) => updateSlide(index, { body: value })}
              placeholder="Add a short supporting line."
              className="min-h-20 resize-y"
            />
          </div>
        ))}
      </div>
      <DashedAddButton
        disabled={slides.length >= FIRST_HOME_HERO_SLIDE_MAX}
        onClick={addSlide}
      >
        {slides.length >= FIRST_HOME_HERO_SLIDE_MAX
          ? `Max ${FIRST_HOME_HERO_SLIDE_MAX} slides reached`
          : 'Add slide'}
      </DashedAddButton>
    </Field>
  );
}
