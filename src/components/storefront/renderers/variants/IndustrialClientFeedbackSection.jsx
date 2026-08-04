'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Quote,
  Send,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { getPublicFeedback, submitPublicFeedback } from '@/lib/publicProfileClient';

const emptyForm = {
  client_name: '',
  email: '',
  rating: 0,
  text: '',
  website: '',
};

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'CL';
}

function RatingStars({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          className={index < value ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}
        />
      ))}
    </div>
  );
}

export default function IndustrialClientFeedbackSection({ profile, testimonials = [], copy = {} }) {
  const content = profile?.storefront_section_content || {};
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = isPreview && previewMode === 'mobile';
  const forceTabletPreview = isPreview && previewMode === 'tablet';
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
  const carouselRef = useRef(null);
  const initialFeedbackRef = useRef(testimonials);
  const [databaseFeedback, setDatabaseFeedback] = useState(testimonials);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const reviews = useMemo(() => {
    const published = (databaseFeedback || [])
      .filter((item) => item?.client_name && item?.text)
      .map((item, index) => ({
        ...item,
        rating: Number(item.rating) || 5,
        role: item.role || 'Verified client',
        avatarTone: ['bg-emerald-100 text-emerald-700', 'bg-rose-100 text-rose-700'][index % 2],
      }));
    return published;
  }, [databaseFeedback]);

  useEffect(() => {
    let active = true;

    getPublicFeedback(profile.slug)
      .then((response) => {
        if (active) setDatabaseFeedback(response?.feedback || []);
      })
      .catch(() => {
        if (active) setDatabaseFeedback(initialFeedbackRef.current || []);
      })
      .finally(() => {
        if (active) setFeedbackLoading(false);
      });

    return () => {
      active = false;
    };
  }, [profile.slug]);

  const averageRating = reviews.length
    ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
    : 0;

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.9,
      behavior: 'smooth',
    });
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status.type === 'error') setStatus({ type: 'idle', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.rating) {
      setStatus({ type: 'error', message: 'Please select a rating.' });
      return;
    }

    setStatus({ type: 'loading', message: '' });
    try {
      await submitPublicFeedback(profile.slug, form);
      const response = await getPublicFeedback(profile.slug);
      setDatabaseFeedback(response?.feedback || []);
      setForm(emptyForm);
      setStatus({
        type: 'success',
        message: 'Thank you. Your feedback is now visible.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Feedback could not be submitted. Please try again.',
      });
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setHoveredRating(0);
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <section id="reviews" className={`w-full px-5 py-6 ${forceCompactPreview ? '' : 'sm:px-8 sm:py-8 lg:px-12 xl:px-16'}`}>
      <div className="w-full">
        <div className={`flex flex-col gap-5 ${forceMobilePreview ? '' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
          <div className="max-w-2xl">
            <p data-storefront-field="content.eyebrow" data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'} data-storefront-label="Testimonials eyebrow" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {copy.eyebrow || 'Client feedback'}
            </p>
            <h2 data-storefront-field="content.heading" data-storefront-source={content.heading ? 'persisted' : 'fallback'} data-storefront-label="Testimonials heading" className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {copy.heading || 'Trusted by clients'}
            </h2>
            <p data-storefront-field="content.body" data-storefront-source={content.body ? 'persisted' : 'fallback'} data-storefront-label="Testimonials description" className="mt-2 text-[13px] leading-5 text-slate-500">
              {copy.body || 'Real experiences from clients who received practical, responsive guidance.'}
            </p>
          </div>

          <div className={`flex items-center gap-2 self-start ${forceMobilePreview ? '' : 'sm:self-auto'}`}>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {reviews.length ? averageRating.toFixed(1) : '—'}
              </span>
              <div>
                <RatingStars value={Math.round(averageRating)} size={13} />
                <p className="mt-1 text-[10px] font-medium text-slate-500">
                  {reviews.length ? `Based on ${reviews.length} client reviews` : 'No ratings yet'}
                </p>
              </div>
            </div>
            {reviews.length > 1 ? (
              <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollCarousel(-1)}
                aria-label="Previous reviews"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-primary/30 hover:text-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(1)}
                aria-label="Next reviews"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-primary/30 hover:text-primary"
              >
                <ChevronRight size={16} />
              </button>
              </div>
            ) : null}
          </div>
        </div>

        {feedbackLoading ? (
          <div className={`mt-6 grid gap-3 ${forceMobilePreview ? 'grid-cols-1' : forceTabletPreview ? 'sm:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70" />
            ))}
          </div>
        ) : reviews.length ? (
          <div
            ref={carouselRef}
            className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((item, index) => (
            <article
              key={`${item.client_name}-${index}`}
              data-storefront-anim-item="true"
              className={`flex min-w-full snap-start flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ${forceMobilePreview ? '' : forceTabletPreview ? 'sm:min-w-[calc(50%-0.375rem)]' : 'sm:min-w-[calc(50%-0.375rem)] lg:min-w-[calc(33.333%-0.5rem)]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <RatingStars value={item.rating} size={12} />
                <Quote size={15} className="text-primary/40" />
              </div>
              <p className="mt-3 flex-1 text-[12px] leading-5 text-slate-600">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2.5 border-t border-slate-100 pt-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cover bg-center text-[11px] font-bold ${item.avatarTone}`}
                  style={item.client_photo_url ? { backgroundImage: `url("${item.client_photo_url}")` } : undefined}
                  aria-label={`${item.client_name} avatar`}
                >
                  {item.client_photo_url ? null : initials(item.client_name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-slate-900">{item.client_name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                    <ShieldCheck size={10} className="text-primary" />
                    {item.role}
                  </p>
                </div>
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center">
            <MessageSquareText size={20} className="mx-auto text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800">No verified feedback yet</p>
            <p className="mt-1 text-[12px] text-slate-500">Be the first client to share an experience.</p>
          </div>
        )}

        <div className={`mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 ${forceMobilePreview ? '' : 'sm:flex-row sm:items-center sm:justify-between'}`}>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-primary shadow-sm ring-1 ring-slate-200">
              <MessageSquareText size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Worked with this professional?</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Share your experience to help future clients decide.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
          >
            Leave feedback
          </button>
        </div>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-transparent p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="feedback-title" className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Client review</p>
                <h3 id="feedback-title" className="mt-0.5 text-base font-semibold text-slate-900">Share your experience</h3>
                <p className="mt-0.5 text-[10px] text-slate-500">Your feedback will appear after submission.</p>
              </div>
              <button type="button" onClick={closeForm} aria-label="Close feedback form" className="grid h-7 w-7 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X size={15} />
              </button>
            </div>

            {status.type === 'success' ? (
              <div className="px-4 py-7 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={20} />
                </span>
                <h4 className="mt-3 text-sm font-semibold text-slate-900">Feedback received</h4>
                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-500">{status.message}</p>
                <button type="button" onClick={closeForm} className="mt-4 h-8 rounded-lg bg-slate-900 px-4 text-[11px] font-semibold text-white">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-700">Your rating</p>
                  <div className="mt-1.5 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const rating = index + 1;
                      const active = rating <= (hoveredRating || form.rating);
                      return (
                        <button
                          key={rating}
                          type="button"
                          aria-label={`${rating} star rating`}
                          onMouseEnter={() => setHoveredRating(rating)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => updateField('rating', rating)}
                          className="p-0.5 transition hover:scale-110"
                        >
                          <Star size={20} className={active ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`grid gap-2.5 ${forceMobilePreview ? '' : 'sm:grid-cols-2'}`}>
                  <label className="text-[11px] font-semibold text-slate-700">
                    Your name
                    <input
                      required
                      maxLength={120}
                      value={form.client_name}
                      onChange={(event) => updateField('client_name', event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Full name"
                    />
                  </label>
                  <label className="text-[11px] font-semibold text-slate-700">
                    Email
                    <input
                      required
                      type="email"
                      maxLength={180}
                      value={form.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="you@example.com"
                    />
                  </label>
                </div>

                <label className="block text-[11px] font-semibold text-slate-700">
                  Your feedback
                  <textarea
                    required
                    minLength={20}
                    maxLength={1000}
                    rows={3}
                    value={form.text}
                    onChange={(event) => updateField('text', event.target.value)}
                    className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal leading-5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Tell others about your experience..."
                  />
                </label>

                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={form.website}
                  onChange={(event) => updateField('website', event.target.value)}
                  className="hidden"
                />

                {status.type === 'error' ? (
                  <p className="text-xs font-medium text-rose-600">{status.message}</p>
                ) : null}

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={closeForm} className="h-8 rounded-lg border border-slate-200 px-3.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={13} />
                    {status.type === 'loading' ? 'Submitting...' : 'Submit feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
