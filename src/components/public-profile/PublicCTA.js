'use client';

import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { buildTrackedCalendlyUrl } from '@/lib/publicProfileLinks';

const ROLE_CONTENT = {
  agent: {
    eyebrow: 'Contact & appointments',
    title: 'Plan your next real estate conversation.',
    description:
      'Choose an available consultation time or send a detailed property inquiry for a direct follow-up.',
  },
  mortgage_broker: {
    eyebrow: 'Contact & appointments',
    title: 'Schedule a mortgage consultation.',
    description:
      'Review available appointment times or send your financing goals and timeline for a direct response.',
  },
  lawyer: {
    eyebrow: 'Contact & appointments',
    title: 'Arrange a legal consultation.',
    description:
      'Select an available consultation time or submit your transaction details for a focused legal follow-up.',
  },
};

const AVAILABILITY_LABELS = {
  business: 'Weekday business hours',
  extended: 'Extended weekday hours',
  weekends: 'Weekday and weekend availability',
  247: 'Flexible availability',
};

const RESPONSE_TIME_LABELS = {
  '1hour': 'Usually within 1 hour',
  sameday: 'Usually the same day',
  '24hours': 'Usually within 24 hours',
  '48hours': 'Usually within 48 hours',
};

export default function PublicCTA({
  profile,
  onDirectLeadClick,
  onCtaClick,
  onAppointmentClick,
  content = {},
}) {
  const base = ROLE_CONTENT[profile.professional_type] || ROLE_CONTENT.agent;
  const professional = profile.professional_profile || {};
  const calendlyUrl = buildTrackedCalendlyUrl(professional.calendly_link, profile);
  const availability = AVAILABILITY_LABELS[professional.availability]
    || professional.availability
    || 'Contact for availability';
  const responseTime = RESPONSE_TIME_LABELS[professional.response_time]
    || professional.response_time
    || 'Response time varies';
  const email = String(profile.email || '').trim();
  const phone = String(professional.phone || '').trim();
  const website = String(profile.social_links?.website || professional.website || '').trim();
  const name = profile.professional_name || 'this professional';

  const handleBooking = () => {
    if (calendlyUrl) {
      onAppointmentClick?.();
      return;
    }
    onCtaClick?.('book_consultation');
  };

  return (
    <section id="contact" className="border-y border-slate-200 bg-white">
      <div className="w-full px-5 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(34rem,1.1fr)] lg:items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              {content.eyebrow || base.eyebrow}
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {content.heading || content.title || base.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
              {content.body || content.description || base.description}
            </p>

            <div className="mt-7 space-y-3 border-t border-slate-200 pt-6">
              {email ? (
                <a href={`mailto:${email}`} className="flex w-fit items-center gap-3 text-sm font-medium text-slate-700 transition hover:text-primary">
                  <Mail size={16} className="text-slate-400" />
                  {email}
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone}`} className="flex w-fit items-center gap-3 text-sm font-medium text-slate-700 transition hover:text-primary">
                  <Phone size={16} className="text-slate-400" />
                  {phone}
                </a>
              ) : null}
              {website ? (
                <a href={website} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-3 text-sm font-medium text-slate-700 transition hover:text-primary">
                  <ArrowUpRight size={16} className="text-slate-400" />
                  Visit professional website
                </a>
              ) : null}
            </div>
          </div>

          <div className="border-y border-slate-200 py-7 lg:border-y-0 lg:border-l lg:py-0 lg:pl-10">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Availability</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{availability}</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <Clock3 size={18} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Response time</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{responseTime}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-7">
              <h3 className="text-lg font-bold text-slate-900">Choose how to connect</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                View live appointment times or send your details so {name} can follow up with the right context.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {calendlyUrl ? (
                  <a
                    href={calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleBooking}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    <CalendarDays size={16} />
                    View available times
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleBooking}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    <CalendarDays size={16} />
                    Ask about availability
                  </button>
                )}
                <button
                  type="button"
                  onClick={onDirectLeadClick}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <MessageSquareText size={16} />
                  Send detailed inquiry
                </button>
              </div>
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-slate-400" />
                {calendlyUrl
                  ? 'Live appointment availability opens securely in Calendly and displays times in your local timezone.'
                  : 'Submit an inquiry and the professional will confirm an available time with you.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

