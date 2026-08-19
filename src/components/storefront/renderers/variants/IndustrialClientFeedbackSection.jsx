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

function feedbackKey(item = {}) {
  const id = String(item.id || item._id || '').trim();
  if (id) return `id:${id}`;
  return [
    String(item.client_name || item.name || '').trim().toLowerCase(),
    String(item.text || '').trim().toLowerCase(),
  ].join('|');
}

function mergeFeedback(curated = [], submitted = []) {
  const seen = new Set();
  return [...curated, ...submitted].filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const key = feedbackKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

export default function IndustrialClientFeedbackSection({
  profile,
  testimonials = [],
  copy = {},
  showReviews = true,
  sectionId = 'reviews',
  className = '',
  variant = 'default',
}) {
  const content = profile?.storefront_section_content || {};
  const layout = profile?.storefront_section_layout || {};
  const sectionStyle = profile?.storefront_section_style || {};
  const templateKey = String(profile?.storefront_template_key || profile?.template_key || '').trim().toLowerCase();
  const isCommunityTemplate = templateKey === 'agent-community-expert';
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const previewMode = profile?.storefront_preview_mode || 'desktop';
  const forceMobilePreview = isPreview && previewMode === 'mobile';
  const forceTabletPreview = isPreview && previewMode === 'tablet';
  const forceCompactPreview = forceMobilePreview || forceTabletPreview;
  const carouselRef = useRef(null);
  const [databaseFeedback, setDatabaseFeedback] = useState([]);
  // Seed from props so SSR and the first client paint share the same tree.
  // Only show skeletons when we have nothing to render yet.
  const [feedbackLoading, setFeedbackLoading] = useState(() => !(Array.isArray(testimonials) && testimonials.length));
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const isLuxuryVariant = variant === 'luxury';

  // Builder layout/style controls. Defaults reproduce the previous hard-coded
  // values so Classic and Industrial storefronts render unchanged; they only
  // take effect once a user actually picks a value in the inspector.
  const sectionPaddingClass = {
    none: 'py-0',
    small: forceCompactPreview ? 'py-4' : 'py-4 sm:py-5',
    medium: forceCompactPreview ? 'py-6' : 'py-6 sm:py-8',
    large: forceCompactPreview ? 'py-9' : 'py-9 sm:py-12',
  }[layout.padding || 'medium'] || (forceCompactPreview ? 'py-6' : 'py-6 sm:py-8');
  const widthClass = {
    narrow: 'mx-auto w-full max-w-5xl',
    contained: 'mx-auto w-full max-w-6xl',
    full: 'w-full',
  }[layout.width || 'full'] || 'w-full';
  const carouselColumnsClass = forceMobilePreview
    ? ''
    : forceTabletPreview
      ? 'sm:min-w-[calc(50%-0.375rem)]'
      : ({
          1: '',
          2: 'sm:min-w-[calc(50%-0.375rem)]',
          3: 'sm:min-w-[calc(50%-0.375rem)] lg:min-w-[calc(33.333%-0.5rem)]',
          4: 'sm:min-w-[calc(50%-0.375rem)] lg:min-w-[calc(25%-0.5625rem)]',
        }[String(layout.columns || '3')] ?? 'sm:min-w-[calc(50%-0.375rem)] lg:min-w-[calc(33.333%-0.5rem)]');
  const shellRadius = {
    none: '0px',
    small: '12px',
    default: '16px',
    medium: '20px',
    large: '24px',
    full: '32px',
  }[sectionStyle.radius || 'none'] || '0px';
  const shellShadow = {
    none: 'none',
    small: '0 8px 24px rgba(15,23,42,.08)',
    medium: '0 18px 48px rgba(15,23,42,.12)',
    large: '0 28px 70px rgba(15,23,42,.16)',
  }[sectionStyle.shadow || 'none'] || 'none';
  const normalizedSectionBackground = String(sectionStyle.background || '').trim().toLowerCase();
  const legacyCommunityGreens = new Set([
    '#eaf8ef', '#f5fbf8', '#f7fbf6', '#e6f2f0', '#d9f4df',
  ]);
  const effectiveSectionBackground = (
    isCommunityTemplate && legacyCommunityGreens.has(normalizedSectionBackground)
  )
    ? ''
    : sectionStyle.background;
  const hasShell = Boolean(effectiveSectionBackground)
    || (sectionStyle.radius && sectionStyle.radius !== 'none')
    || (sectionStyle.shadow && sectionStyle.shadow !== 'none');
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const headerAlignment = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  }[layout.alignment || 'left'] || 'text-left';

  const reviews = useMemo(() => {
    const published = mergeFeedback(
      Array.isArray(testimonials) ? testimonials : [],
      databaseFeedback || [],
    )
      .filter((item) => item?.client_name && item?.text)
      .map((item, index) => ({
        ...item,
        rating: Number(item.rating) || 5,
        role: item.role || 'Verified client',
        avatarTone: isCommunityTemplate
          ? ['bg-primary/10 text-primary', 'bg-accent/15 text-primary'][index % 2]
          : ['bg-emerald-100 text-emerald-700', 'bg-rose-100 text-rose-700'][index % 2],
      }));
    return published;
  }, [databaseFeedback, isCommunityTemplate, testimonials]);

  useEffect(() => {
    if (isPreview || !profile?.slug) {
      setDatabaseFeedback([]);
      setFeedbackLoading(false);
      return undefined;
    }

    let active = true;

    getPublicFeedback(profile.slug)
      .then((response) => {
        if (active) setDatabaseFeedback(response?.feedback || []);
      })
      .catch(() => {
        if (active) setDatabaseFeedback([]);
      })
      .finally(() => {
        if (active) setFeedbackLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isPreview, profile?.slug]);

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
    if (isPreview) return;
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
    <section
      id={sectionId}
      className={`w-full px-5 ${forceCompactPreview ? '' : 'sm:px-8 lg:px-12 xl:px-16'} ${sectionPaddingClass} ${className}`.trim()}
    >
      <div
        className={widthClass}
        style={hasShell ? {
          background: effectiveSectionBackground || undefined,
          color: sectionStyle.textColor || undefined,
          borderRadius: shellRadius,
          boxShadow: shellShadow,
          padding: '1.25rem',
        } : undefined}
      >
        {showReviews ? (
          <>
        <div className={`flex flex-col gap-5 ${forceMobilePreview ? '' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
          <div className={`max-w-2xl ${headerAlignment}`}>
            <p data-storefront-field="content.eyebrow" data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'} data-storefront-label="Testimonials eyebrow" className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isLuxuryVariant ? 'text-accent' : isCommunityTemplate ? 'inline-flex rounded-md bg-primary px-2.5 py-1 text-primary-contrast' : 'text-primary'}`}>
              {copy.eyebrow || 'Client feedback'}
            </p>
            <h2 data-storefront-field="content.heading" data-storefront-source={content.heading ? 'persisted' : 'fallback'} data-storefront-label="Testimonials heading" className={`mt-1.5 text-xl tracking-tight sm:text-2xl ${isLuxuryVariant ? 'font-serif font-normal text-white' : hasCustomTextColor ? 'font-semibold text-current' : isCommunityTemplate ? 'font-semibold text-text-heading' : 'font-semibold text-slate-900'}`}>
              {copy.heading || 'Trusted by clients'}
            </h2>
            <p data-storefront-field="content.body" data-storefront-source={content.body ? 'persisted' : 'fallback'} data-storefront-label="Testimonials description" className={`mt-2 text-[13px] leading-5 ${isLuxuryVariant ? 'text-white/65' : hasCustomTextColor ? 'text-current opacity-75' : isCommunityTemplate ? 'text-text-muted' : 'text-slate-500'}`}>
              {copy.body || 'Real experiences from clients who received practical, responsive guidance.'}
            </p>
          </div>

          <div className={`flex items-center gap-2 self-start ${forceMobilePreview ? '' : 'sm:self-auto'}`}>
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${isLuxuryVariant ? 'border-white/15 bg-white/[0.04]' : 'border-slate-200 bg-white shadow-sm'}`}>
              <span className={`text-2xl font-bold tracking-tight ${isLuxuryVariant ? 'text-[#f5f1e8]' : 'text-slate-900'}`}>
                {reviews.length ? averageRating.toFixed(1) : '—'}
              </span>
              <div>
                <RatingStars value={Math.round(averageRating)} size={13} />
                <p className={`mt-1 text-[10px] font-medium ${isLuxuryVariant ? 'text-white/60' : 'text-slate-500'}`}>
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
                className={`grid h-9 w-9 place-items-center rounded-full border transition ${
                  isLuxuryVariant
                    ? 'border-white/20 bg-white/[0.04] text-white/65 hover:border-accent/60 hover:text-accent'
                    : 'border-slate-200 bg-white text-slate-500 shadow-sm hover:border-primary/30 hover:text-primary'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(1)}
                aria-label="Next reviews"
                className={`grid h-9 w-9 place-items-center rounded-full border transition ${
                  isLuxuryVariant
                    ? 'border-white/20 bg-white/[0.04] text-white/65 hover:border-accent/60 hover:text-accent'
                    : 'border-slate-200 bg-white text-slate-500 shadow-sm hover:border-primary/30 hover:text-primary'
                }`}
              >
                <ChevronRight size={16} />
              </button>
              </div>
            ) : null}
          </div>
        </div>

        {feedbackLoading && !reviews.length ? (
          <div className={`mt-6 grid gap-3 ${forceMobilePreview ? 'grid-cols-1' : forceTabletPreview ? 'sm:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={`h-44 animate-pulse rounded-xl border ${isLuxuryVariant ? 'border-white/15 bg-white/[0.04]' : 'border-slate-200 bg-slate-100/70'}`} />
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
              data-storefront-field="content.items"
              data-storefront-source={Array.isArray(testimonials) && testimonials.some((testimonial) => feedbackKey(testimonial) === feedbackKey(item)) ? 'persisted' : 'profile'}
              data-storefront-collection="items"
              data-storefront-item-id={item.id || item._id || `testimonial-${index}`}
              data-storefront-item-index={index}
              data-storefront-item-field="text"
              data-storefront-label={`Testimonial ${index + 1}`}
              className={`flex min-w-full snap-start flex-col rounded-xl border p-4 ${isLuxuryVariant ? 'border-white/15 bg-white/[0.03]' : 'border-slate-200/90 bg-white shadow-sm'} ${carouselColumnsClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <RatingStars value={item.rating} size={12} />
                <Quote size={15} className={isLuxuryVariant ? 'text-accent/45' : 'text-primary/40'} />
              </div>
              <p
                data-storefront-field="content.items"
                data-storefront-source={Array.isArray(testimonials) && testimonials.some((testimonial) => feedbackKey(testimonial) === feedbackKey(item)) ? 'persisted' : 'profile'}
                data-storefront-collection="items"
                data-storefront-item-id={item.id || item._id || `testimonial-${index}`}
                data-storefront-item-index={index}
                data-storefront-item-field="text"
                data-storefront-label={`Testimonial ${index + 1} text`}
                className={`mt-3 flex-1 text-[12px] leading-5 ${isLuxuryVariant ? 'text-white/80' : 'text-slate-600'}`}
              >
                &ldquo;{item.text}&rdquo;
              </p>
              <div className={`mt-4 flex items-center gap-2.5 border-t pt-3 ${isLuxuryVariant ? 'border-white/10' : 'border-slate-100'}`}>
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cover bg-center text-[11px] font-bold ${item.avatarTone}`}
                  style={item.client_photo_url ? { backgroundImage: `url("${item.client_photo_url}")` } : undefined}
                  aria-label={`${item.client_name} avatar`}
                >
                  {item.client_photo_url ? null : initials(item.client_name)}
                </span>
                <div className="min-w-0">
                  <p
                    data-storefront-field="content.items"
                    data-storefront-source={Array.isArray(testimonials) && testimonials.some((testimonial) => feedbackKey(testimonial) === feedbackKey(item)) ? 'persisted' : 'profile'}
                    data-storefront-collection="items"
                    data-storefront-item-id={item.id || item._id || `testimonial-${index}`}
                    data-storefront-item-index={index}
                    data-storefront-item-field="client_name"
                    data-storefront-label={`Testimonial ${index + 1} client`}
                    className={`truncate text-[12px] font-semibold ${isLuxuryVariant ? 'text-white' : 'text-slate-900'}`}
                  >
                    {item.client_name}
                  </p>
                  <p className={`mt-0.5 flex items-center gap-1 text-[10px] ${isLuxuryVariant ? 'text-white/55' : 'text-slate-500'}`}>
                    <ShieldCheck size={10} className={isLuxuryVariant ? 'text-accent' : 'text-primary'} />
                    {item.role}
                  </p>
                </div>
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className={`mt-6 rounded-xl border border-dashed px-5 py-8 text-center ${isLuxuryVariant ? 'border-white/20 bg-white/[0.03]' : 'border-slate-300 bg-slate-50/70'}`}>
            <MessageSquareText size={20} className={`mx-auto ${isLuxuryVariant ? 'text-white/45' : 'text-slate-400'}`} />
            <p className={`mt-3 text-sm font-semibold ${isLuxuryVariant ? 'text-white' : 'text-slate-800'}`}>No verified feedback yet</p>
            <p className={`mt-1 text-[12px] ${isLuxuryVariant ? 'text-white/60' : 'text-slate-500'}`}>Be the first client to share an experience.</p>
          </div>
        )}
          </>
        ) : null}

        <div className={`${showReviews ? 'mt-5' : ''} flex flex-col gap-3 rounded-xl border p-4 ${isLuxuryVariant ? 'border-white/15 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80'} ${forceMobilePreview ? '' : 'sm:flex-row sm:items-center sm:justify-between'}`}>
          <div className="flex items-center gap-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${isLuxuryVariant ? 'bg-white/[0.06] text-accent ring-1 ring-white/20' : 'bg-white text-primary shadow-sm ring-1 ring-slate-200'}`}>
              <MessageSquareText size={16} />
            </span>
            <div>
              <p className={`text-sm font-semibold ${isLuxuryVariant ? 'text-white' : 'text-slate-900'}`}>Worked with this professional?</p>
              <p className={`mt-0.5 text-[11px] ${isLuxuryVariant ? 'text-white/60' : 'text-slate-500'}`}>Share your experience to help future clients decide.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isPreview) setFormOpen(true);
            }}
            disabled={isPreview}
            aria-disabled={isPreview}
            className={`inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-4 text-xs font-semibold shadow-sm transition ${
              isLuxuryVariant
                ? 'bg-accent text-[#1a1510] hover:brightness-105'
                : 'bg-primary text-white hover:bg-primary-dark'
            } disabled:cursor-default disabled:opacity-65`}
          >
            {isPreview ? 'Feedback disabled in preview' : 'Leave feedback'}
          </button>
        </div>
      </div>

      {formOpen ? (
        <div className={`fixed inset-0 z-[90] flex items-center justify-center p-4 ${isLuxuryVariant || isCommunityTemplate ? 'bg-black/45' : 'bg-transparent'}`}>
          <div role="dialog" aria-modal="true" aria-labelledby="feedback-title" className={`max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border shadow-[0_24px_70px_rgba(15,23,42,0.28)] ${isLuxuryVariant ? 'border-white/20 bg-[#151210]' : 'border-white/70 bg-white'}`}>
            <div className={`flex items-start justify-between border-b px-4 py-3.5 ${isLuxuryVariant ? 'border-white/10' : 'border-slate-100'}`}>
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isLuxuryVariant ? 'text-accent' : 'text-primary'}`}>Client review</p>
                <h3 id="feedback-title" className={`mt-0.5 text-base font-semibold ${isLuxuryVariant ? 'text-white' : 'text-slate-900'}`}>Share your experience</h3>
                <p className={`mt-0.5 text-[10px] ${isLuxuryVariant ? 'text-white/60' : 'text-slate-500'}`}>Your feedback will appear after submission.</p>
              </div>
              <button type="button" onClick={closeForm} aria-label="Close feedback form" className={`grid h-7 w-7 place-items-center rounded-full transition ${isLuxuryVariant ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}>
                <X size={15} />
              </button>
            </div>

            {status.type === 'success' ? (
              <div className="px-4 py-7 text-center">
                <span className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${isCommunityTemplate ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-600'}`}>
                  <CheckCircle2 size={20} />
                </span>
                <h4 className={`mt-3 text-sm font-semibold ${isLuxuryVariant ? 'text-white' : 'text-slate-900'}`}>Feedback received</h4>
                <p className={`mx-auto mt-1.5 max-w-sm text-xs leading-5 ${isLuxuryVariant ? 'text-white/65' : 'text-slate-500'}`}>{status.message}</p>
                <button type="button" onClick={closeForm} className={`mt-4 h-8 rounded-lg px-4 text-[11px] font-semibold ${isLuxuryVariant ? 'bg-accent text-[#1a1510]' : 'bg-slate-900 text-white'}`}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4">
                <div>
                  <p className={`text-[11px] font-semibold ${isLuxuryVariant ? 'text-white/85' : 'text-slate-700'}`}>Your rating</p>
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
                  <label className={`text-[11px] font-semibold ${isLuxuryVariant ? 'text-white/85' : 'text-slate-700'}`}>
                    Your name
                    <input
                      required
                      maxLength={120}
                      value={form.client_name}
                      onChange={(event) => updateField('client_name', event.target.value)}
                      className={`mt-1 h-9 w-full rounded-lg border px-3 text-xs font-normal outline-none transition ${
                        isLuxuryVariant
                          ? 'border-white/20 bg-white/[0.05] text-white placeholder:text-white/45 focus:border-accent focus:ring-2 focus:ring-accent/20'
                          : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                      }`}
                      placeholder="Full name"
                    />
                  </label>
                  <label className={`text-[11px] font-semibold ${isLuxuryVariant ? 'text-white/85' : 'text-slate-700'}`}>
                    Email
                    <input
                      required
                      type="email"
                      maxLength={180}
                      value={form.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      className={`mt-1 h-9 w-full rounded-lg border px-3 text-xs font-normal outline-none transition ${
                        isLuxuryVariant
                          ? 'border-white/20 bg-white/[0.05] text-white placeholder:text-white/45 focus:border-accent focus:ring-2 focus:ring-accent/20'
                          : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                      }`}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>

                <label className={`block text-[11px] font-semibold ${isLuxuryVariant ? 'text-white/85' : 'text-slate-700'}`}>
                  Your feedback
                  <textarea
                    required
                    minLength={20}
                    maxLength={1000}
                    rows={3}
                    value={form.text}
                    onChange={(event) => updateField('text', event.target.value)}
                    className={`mt-1 w-full resize-none rounded-lg border px-3 py-2 text-xs font-normal leading-5 outline-none transition ${
                      isLuxuryVariant
                        ? 'border-white/20 bg-white/[0.05] text-white placeholder:text-white/45 focus:border-accent focus:ring-2 focus:ring-accent/20'
                        : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
                    }`}
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
                  <p className={`text-xs font-medium ${isLuxuryVariant ? 'text-rose-300' : 'text-rose-600'}`}>{status.message}</p>
                ) : null}

                <div className={`flex items-center justify-end gap-2 border-t pt-3 ${isLuxuryVariant ? 'border-white/10' : 'border-slate-100'}`}>
                  <button type="button" onClick={closeForm} className={`h-8 rounded-lg border px-3.5 text-[11px] font-semibold transition ${
                    isLuxuryVariant
                      ? 'border-white/20 text-white/75 hover:bg-white/10 hover:text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status.type === 'loading'}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[11px] font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isLuxuryVariant
                        ? 'bg-accent text-[#1a1510] hover:brightness-105'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
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
