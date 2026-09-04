'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquareText, Send, Star, X } from 'lucide-react';
import { getPublicFeedback, submitPublicFeedback } from '@/lib/publicProfileClient';
import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import {
  blockContent,
  lawyerClassicGridClass,
} from '../../lawyer/shared/lawyerSectionUtils';
import { BrokerSectionHeading } from './BrokerSectionHeading';
import {
  BROKER_INK,
  brokerContentRegionClass,
  brokerSectionPaddingClass,
  cardSurfaceStyle,
  transparentSectionPresentation,
} from './brokerSectionUtils';

const emptyForm = {
  client_name: '',
  email: '',
  rating: 0,
  text: '',
  website: '',
};

const STALE_PLACEHOLDER_IDS = new Set(['testimonial-1', 'testimonial-2', 'testimonial-3']);

function isStalePlaceholder(item = {}) {
  const id = String(item.id || item._id || '').trim();
  if (STALE_PLACEHOLDER_IDS.has(id)) return true;
  const name = String(item.client_name || item.name || item.title || '').trim().toLowerCase();
  const text = String(item.text || item.description || item.review || '').trim().toLowerCase();
  return (
    (name === 'verified client' && text.includes('quick loan approval'))
    || (name === 'repeat client' && text.includes('flexible repayment'))
    || (name === 'business owner' && text.includes('secured a business loan'))
  );
}

function feedbackKey(item = {}) {
  const id = String(item.id || item._id || '').trim();
  if (id) return `id:${id}`;
  return [
    String(item.client_name || item.name || item.title || '').trim().toLowerCase(),
    String(item.text || item.description || '').trim().toLowerCase(),
  ].join('|');
}

function normalizeReview(item = {}, index = 0) {
  const clientName = String(item.client_name || item.name || item.title || '').trim();
  const text = String(item.text || item.description || item.review || '').trim();
  if (!clientName || !text) return null;
  return {
    ...item,
    id: item.id || item._id || `testimonial-${index}`,
    client_name: clientName,
    text,
    rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
    role: item.role || 'Verified client',
  };
}

function mergeReviews(curated = [], submitted = []) {
  const seen = new Set();
  return [...curated, ...submitted]
    .map((item, index) => normalizeReview(item, index))
    .filter(Boolean)
    .filter((item) => {
      const key = feedbackKey(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function BrokerClassicTestimonials({ profile, block }) {
  const content = blockContent(block);
  const presentation = transparentSectionPresentation(block, BROKER_INK, '3');
  const isPreview = Boolean(profile?.storefront_builder_preview);
  const hasPersistedItems = Object.prototype.hasOwnProperty.call(content, 'items')
    && Array.isArray(content.items);
  const curated = (
    hasPersistedItems
      ? content.items
      : (profile?.testimonials || [])
  )
    .filter((item) => !isStalePlaceholder(item))
    .map((item, index) => normalizeReview(item, index))
    .filter(Boolean);

  const [databaseFeedback, setDatabaseFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const reviews = useMemo(() => {
    const merged = mergeReviews(curated, databaseFeedback)
      .filter((item) => !isStalePlaceholder(item));
    return merged.slice(0, 12);
  }, [curated, databaseFeedback]);

  useEffect(() => {
    if (!profile?.slug) {
      setDatabaseFeedback([]);
      setFeedbackLoading(false);
      return undefined;
    }
    let active = true;
    setFeedbackLoading(true);
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
  }, [profile?.slug]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status.type === 'error') setStatus({ type: 'idle', message: '' });
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setHoveredRating(0);
    setStatus({ type: 'idle', message: '' });
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

  return (
    <section
      id="reviews"
      className={`px-4 sm:px-8 lg:px-12 ${brokerSectionPaddingClass(presentation.padding)}`}
      style={{ backgroundColor: presentation.background, color: presentation.color }}
    >
      <div className="w-full max-w-none">
        <BrokerSectionHeading
          align={presentation.headingAlignment}
          content={content}
          eyebrow="Customers testimonials"
          heading="Customers testimonials"
          body="Real clients sharing how clear guidance and fast service made financing easier."
        />

        {feedbackLoading && !reviews.length ? (
          <div className="mt-10 rounded-[1.25rem] border border-slate-200/90 bg-white/70 px-6 py-12 text-center">
            <p className="text-sm text-slate-500">Loading client feedback…</p>
          </div>
        ) : reviews.length ? (
          <div className={`mt-10 grid items-stretch gap-5 ${lawyerClassicGridClass(presentation.columns, reviews.length, true)} ${brokerContentRegionClass(presentation.contentAlignment)}`}>
            {reviews.map((item, index) => (
              <article
                key={item.id || `${item.client_name}-${index}`}
                data-storefront-anim-item="true"
                data-storefront-field="content.items"
                data-storefront-source={hasPersistedItems ? 'persisted' : 'fallback'}
                data-storefront-collection="items"
                data-storefront-item-id={item.id}
                data-storefront-item-index={index}
                data-storefront-item-field="text"
                data-storefront-label={`Testimonial ${index + 1}`}
                className={`flex h-full flex-col p-6 transition hover:border-[color:var(--storefront-accent,#008fd5)]/30 ${presentation.cardVisualClass}`}
                style={cardSurfaceStyle(presentation)}
              >
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      size={14}
                      fill={starIndex < item.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <EditableText
                  as="p"
                  field="content.items"
                  label={`Testimonial ${index + 1} quote`}
                  source={hasPersistedItems ? 'persisted' : 'fallback'}
                  collection="items"
                  itemId={item.id}
                  itemIndex={index}
                  itemField="description"
                  className="mt-4 flex-1 text-sm leading-7 text-slate-600"
                >
                  {item.text}
                </EditableText>
                <EditableText
                  as="h3"
                  field="content.items"
                  label={`Testimonial ${index + 1} name`}
                  source={hasPersistedItems ? 'persisted' : 'fallback'}
                  collection="items"
                  itemId={item.id}
                  itemIndex={index}
                  itemField="title"
                  className="mt-5 text-base font-bold text-[color:var(--storefront-primary,#0c2139)]"
                >
                  {item.client_name}
                </EditableText>
                <p className="mt-1 text-[11px] text-slate-500">{item.role}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[1.25rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
            <MessageSquareText size={22} className="mx-auto text-[color:var(--storefront-accent,#008fd5)]" />
            <p className="mt-3 text-sm font-semibold text-[color:var(--storefront-primary,#0c2139)]">
              No verified feedback yet
            </p>
            <p className="mt-1 text-sm text-slate-500">Be the first client to share an experience.</p>
          </div>
        )}

        <div
          className={`mt-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${presentation.cardVisualClass}`}
          style={cardSurfaceStyle(presentation)}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[color:var(--storefront-accent,#008fd5)] shadow-sm ring-1 ring-slate-200">
              <MessageSquareText size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[color:var(--storefront-primary,#0c2139)]">
                Worked with this mortgage advisor?
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Share your experience to help future clients decide.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isPreview) setFormOpen(true);
            }}
            disabled={isPreview}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--storefront-accent,#008fd5)] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(0,143,213,.22)] transition hover:brightness-105 disabled:cursor-default disabled:opacity-65"
          >
            {isPreview ? 'Feedback disabled in preview' : 'Leave feedback'}
          </button>
        </div>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="broker-feedback-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--storefront-accent,#008fd5)]">
                  Client review
                </p>
                <h3
                  id="broker-feedback-title"
                  className="mt-0.5 text-base font-semibold text-[color:var(--storefront-primary,#0c2139)]"
                >
                  Share your experience
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close feedback form"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 p-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Your name *</span>
                <input
                  required
                  value={form.client_name}
                  onChange={(event) => updateField('client_name', event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[color:var(--storefront-accent,#008fd5)] focus:ring-2 focus:ring-[color:var(--storefront-accent,#008fd5)]/15"
                  maxLength={80}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Email *</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[color:var(--storefront-accent,#008fd5)] focus:ring-2 focus:ring-[color:var(--storefront-accent,#008fd5)]/15"
                />
              </label>
              <div>
                <span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Rating *</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    const active = (hoveredRating || form.rating) >= value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onMouseEnter={() => setHoveredRating(value)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => updateField('rating', value)}
                        className="p-0.5"
                        aria-label={`${value} star${value === 1 ? '' : 's'}`}
                      >
                        <Star
                          size={22}
                          className={active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-slate-700">Your feedback *</span>
                <textarea
                  required
                  minLength={20}
                  value={form.text}
                  onChange={(event) => updateField('text', event.target.value)}
                  className="min-h-28 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--storefront-accent,#008fd5)] focus:ring-2 focus:ring-[color:var(--storefront-accent,#008fd5)]/15"
                  maxLength={1000}
                  placeholder="Share at least a short note about your experience."
                />
              </label>
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => updateField('website', event.target.value)}
                className="hidden"
                aria-hidden
              />

              {status.type === 'error' ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{status.message}</p>
              ) : null}
              {status.type === 'success' ? (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{status.message}</p>
              ) : null}

              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--storefront-accent,#008fd5)] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-105 disabled:opacity-70"
              >
                <Send size={14} />
                {status.type === 'loading' ? 'Submitting…' : 'Submit feedback'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
