'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronDown, Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import PublicChatBubble from '@/components/public-profile/PublicChatBubble';
import PublicStorefrontFooter from '@/components/public-profile/PublicStorefrontFooter';
import PublicStorefrontHeader from '@/components/public-profile/PublicStorefrontHeader';
import { LawyerClassicFooter } from './renderers/variants/LawyerClassicSections';
import { LawyerInvestorFooter } from './renderers/variants/lawyer/investor';
import { LawyerNewcomerFooter } from './renderers/variants/lawyer/newcomer';
import { submitPublicLead } from '@/lib/publicProfileClient';
import { generateSessionId, generateVisitorId } from '@/utils/sessionHelpers';
import StorefrontInlineStyle from './StorefrontInlineStyle';
import { StorefrontTheme } from './storefrontTheme';
import { STOREFRONT_BLOCK_TYPES, isInvestorSpecialistTemplate } from './storefrontPresets';
import {
  experienceCanvasClass,
  getStorefrontExperienceCss,
  resolveTemplateExperience,
} from './storefrontExperience';

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  intent: 'buy',
  legal_services_needed: '',
  message: '',
  preferred_contact_method: 'email',
  best_time_to_contact: '',
};

function resolveSectionVariant(templateKey = '') {
  const key = String(templateKey || '').toLowerCase();
  if (key.includes('luxury')) return 'luxury';
  if (key.includes('first-home')) return 'firstHome';
  if (key.includes('seller')) return 'seller';
  if (key.includes('community')) return 'community';
  if (key.includes('investor')) return 'investor';
  return undefined;
}

function TemplateSelect({
  value,
  onChange,
  options,
  buttonClass,
  panelClass,
  optionClass,
  activeOptionClass,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((item) => item.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsidePointer = (event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsidePointer, true);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer, true);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={`${buttonClass} flex items-center justify-between gap-3 text-left`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <span>{selected?.label || ''}</span>
        <ChevronDown size={16} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className={panelClass}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${optionClass} ${value === option.value ? activeOptionClass : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PublicContactPage({ profile }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [visitorId, setVisitorId] = useState('');

  useEffect(() => {
    setSessionId(generateSessionId());
    setVisitorId(generateVisitorId());
  }, []);

  const storefrontBlocks = Array.isArray(profile?.storefront_blocks) ? profile.storefront_blocks : [];
  const heroBlock = storefrontBlocks.find((block) => block?.type === STOREFRONT_BLOCK_TYPES.HERO) || {};
  const footerBlock = storefrontBlocks.find((block) => block?.type === STOREFRONT_BLOCK_TYPES.FOOTER) || {};
  const heroContent = heroBlock?.data?.content || {};
  const heroStyle = heroBlock?.data?.style || {};
  const footerBlockContent = footerBlock?.data?.content || {};
  const footerBlockStyle = footerBlock?.data?.style || {};
  const templateKey = profile?.storefront_template_key || '';
  const isLuxury = templateKey === 'agent-luxury-advisor';
  const isFirstHome = templateKey === 'agent-first-home';
  const isLawyerClassic = templateKey === 'lawyer-classic';
  const isLawyerInvestor = templateKey === 'lawyer-investor';
  const isLawyerNewcomer = templateKey === 'lawyer-newcomer';
  const isLayeredLawyer = isLawyerClassic
    || templateKey === 'lawyer-first-home-closing'
    || isLawyerNewcomer;
  const isLawyer = profile?.professional_type === 'lawyer';
  const isInvestor = isInvestorSpecialistTemplate(templateKey);
  const experience = resolveTemplateExperience(templateKey);
  const experienceClass = experienceCanvasClass(experience);
  const headerVariant = resolveSectionVariant(templateKey);
  const profileHref = `/professional/${profile.slug}`;
  const professionalProfile = profile?.professional_profile || {};
  const phone = professionalProfile.phone || '';
  const email = profile?.email || '';
  const location = professionalProfile.location || '';
  const headerProfile = {
    ...profile,
    storefront_section_content: heroContent,
    storefront_section_style: heroStyle,
  };
  const footerContent = {
    ...footerBlockContent,
    items: Array.isArray(footerBlockContent?.items) && footerBlockContent.items.length
      ? footerBlockContent.items
      : [
          { label: 'Profile', url: profileHref },
          { label: 'Services', url: `${profileHref}#services` },
          { label: 'Properties', url: `${profileHref}/properties` },
          ...(isInvestor ? [] : [
            { label: 'Reviews', url: `${profileHref}#reviews` },
            { label: 'Contact', url: `${profileHref}/contact` },
          ]),
        ],
  };

  const updateField = (field, value) => {
    if (errorMessage) setErrorMessage('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setErrorMessage('Please provide an email address or phone number.');
      return;
    }
    if (isLawyer && !form.legal_services_needed) {
      setErrorMessage('Please select the legal service you need.');
      return;
    }
    if (!form.message.trim()) {
      setErrorMessage('Please tell the professional how they can help.');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);
    try {
      const response = await submitPublicLead(profile.slug, {
        ...form,
        ...(isLawyer ? { intent: 'unspecified' } : {}),
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        session_id: sessionId || generateSessionId(),
        visitor_id: visitorId || generateVisitorId(),
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
      toast.success(response?.message || 'Your request was sent successfully.');
    } catch (error) {
      const message = error?.message || 'Your request could not be sent. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = isLuxury
    ? 'w-full rounded-none bg-white/[0.045] px-3.5 py-2.5 text-[13px] text-[#f5f1e8] outline-none ring-1 ring-white/[0.09] transition-all duration-300 [color-scheme:dark] placeholder:text-white/30 hover:bg-white/[0.06] hover:ring-white/15 focus:bg-white/[0.07] focus:ring-[var(--storefront-accent)]'
    : isLawyerClassic
      ? 'w-full border border-primary/15 bg-white/80 px-3.5 py-3 text-[13px] text-primary outline-none transition-colors placeholder:text-slate-400 focus:border-accent focus:bg-white'
      : isLawyerNewcomer
        ? 'w-full rounded-2xl border border-primary/15 bg-white/90 px-3.5 py-3 text-[13px] text-text-heading outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/15'
      : 'w-full rounded-xl bg-white px-3.5 py-2.5 text-[13px] text-text-heading outline-none ring-1 ring-slate-200 transition-all duration-300 placeholder:text-slate-400 focus:ring-primary';
  const labelClass = isLuxury
    ? 'mb-1.5 block text-[8px] font-semibold uppercase tracking-[0.19em] text-[var(--storefront-accent)]'
    : isLawyerClassic
      ? 'mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-primary'
      : isLawyerNewcomer
        ? 'mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-primary'
      : 'mb-1.5 block text-[11px] font-semibold text-text-heading';
  const firstHomeSelectButtonClass = 'w-full rounded-xl bg-white px-3.5 py-2.5 text-[13px] text-text-heading outline-none ring-1 ring-[#5bd36d]/35 transition-all duration-300 hover:ring-[#5bd36d]/55';
  const firstHomeSelectPanelClass = 'absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-xl border border-[#5bd36d]/35 bg-white shadow-[0_14px_36px_rgba(11,61,32,.16)]';
  const firstHomeSelectOptionClass = 'block w-full px-3.5 py-2.5 text-left text-[13px] text-[#102f1b] transition hover:bg-[#eff9f1]';
  const firstHomeSelectActiveClass = 'bg-[#e8f7ea] font-semibold';
  const contactTheme = isLawyerClassic
    ? {
        ...profile.storefront_theme,
        primary: ['', '#0f766e'].includes(
          String(profile.storefront_theme?.primary || '').trim().toLowerCase(),
        )
          ? '#202020'
          : profile.storefront_theme?.primary,
        accent: ['', '#f59e0b'].includes(
          String(profile.storefront_theme?.accent || '').trim().toLowerCase(),
        )
          ? '#d39a52'
          : profile.storefront_theme?.accent,
        canvas: profile.storefront_theme?.canvas || '#ffffff',
        radius: profile.storefront_theme?.radius === '0.75rem'
          ? '2px'
          : profile.storefront_theme?.radius || '2px',
      }
    : profile.storefront_theme;

  return (
    <StorefrontTheme theme={contactTheme}>
      <StorefrontInlineStyle css={getStorefrontExperienceCss()} />
      <div
        className={`${experienceClass} storefront-canvas min-h-screen`}
        data-template-key={templateKey}
        data-preview="false"
        data-preview-mode="desktop"
      >
        <div data-storefront-block={STOREFRONT_BLOCK_TYPES.HERO}>
          <PublicStorefrontHeader profile={headerProfile} absoluteHashes variant={headerVariant} />
        </div>

        <main className="w-full flex-1 pt-16">
          <section
            id="contact"
            data-storefront-block={STOREFRONT_BLOCK_TYPES.CTA}
            className={`relative overflow-hidden px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14 ${
              isLuxury
                ? 'bg-[radial-gradient(circle_at_85%_10%,color-mix(in_srgb,var(--storefront-accent)_10%,transparent),transparent_32%),#0d0c0b]'
                : isLawyerNewcomer
                  ? 'bg-[radial-gradient(circle_at_12%_8%,color-mix(in_srgb,var(--storefront-accent)_14%,transparent),transparent_34%),var(--storefront-canvas)]'
                : 'bg-[var(--storefront-canvas)]'
            }`}
          >
            <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
              <div className="self-start lg:sticky lg:top-28">
                <p className={`mt-8 text-[9px] font-semibold uppercase tracking-[0.26em] ${
                  isLuxury || isLawyerClassic ? 'text-[var(--storefront-accent)]' : 'text-primary'
                }`}>
                  {isLawyerClassic ? 'Legal consultation inquiry' : isLawyerNewcomer ? 'A welcoming place to start' : 'Private inquiry'}
                </p>
                <h1 className={`mt-3 max-w-xl text-4xl leading-[1.04] sm:text-[2.75rem] lg:text-5xl ${
                  isLuxury
                    ? 'font-serif font-normal text-[#f5f1e8]'
                    : isLawyerClassic
                      ? 'font-semibold uppercase tracking-[-0.025em] text-primary'
                      : 'font-bold text-text-heading'
                }`}>
                  {isLawyerClassic ? 'Discuss your legal matter.' : isLawyerNewcomer ? 'Tell us about your move.' : 'Begin a direct conversation.'}
                </h1>
                <p className={`mt-5 max-w-lg text-[13px] leading-6 ${
                  isLuxury ? 'text-white/58' : 'text-text-muted'
                }`}>
                  Share your objectives, timing, and preferred way to connect. Your request is delivered directly to {profile.professional_name}.
                </p>

                <div className="mt-7 space-y-2.5">
                  {email ? (
                    <a href={`mailto:${email}`} className={`flex items-center gap-3 text-sm ${isLuxury ? 'text-white/75 hover:text-white' : 'text-text-muted hover:text-text-heading'}`}>
                      <Mail size={16} className={isLuxury ? 'text-[var(--storefront-accent)]' : 'text-primary'} />
                      {email}
                    </a>
                  ) : null}
                  {phone ? (
                    <a href={`tel:${phone}`} className={`flex items-center gap-3 text-sm ${isLuxury ? 'text-white/75 hover:text-white' : 'text-text-muted hover:text-text-heading'}`}>
                      <Phone size={16} className={isLuxury ? 'text-[var(--storefront-accent)]' : 'text-primary'} />
                      {phone}
                    </a>
                  ) : null}
                  {location ? (
                    <p className={`flex items-center gap-3 text-sm ${isLuxury ? 'text-white/75' : 'text-text-muted'}`}>
                      <MapPin size={16} className={isLuxury ? 'text-[var(--storefront-accent)]' : 'text-primary'} />
                      {location}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className={`p-5 sm:p-6 lg:p-7 ${
                isLuxury
                  ? 'bg-[#161310] shadow-[0_24px_70px_rgba(0,0,0,.34)] ring-1 ring-white/[0.07] transition-shadow duration-500 hover:shadow-[0_28px_80px_rgba(0,0,0,.42)]'
                  : isLawyerClassic
                    ? 'border border-primary/12 bg-white/75 shadow-[0_18px_45px_rgba(15,23,42,.06)]'
                    : isLawyerNewcomer
                      ? 'rounded-[2rem] border border-primary/10 bg-white/85 shadow-[0_22px_60px_rgba(48,77,67,.1)]'
                    : 'rounded-3xl bg-white shadow-xl ring-1 ring-slate-200'
              }`}>
                {submitted ? (
                  <div className="grid min-h-[24rem] place-items-center text-center">
                    <div>
                      <CheckCircle2 size={42} className={`mx-auto ${isLuxury ? 'text-[var(--storefront-accent)]' : 'text-emerald-600'}`} />
                      <h2 className={`mt-5 text-3xl ${isLuxury ? 'font-serif font-normal text-[#f5f1e8]' : 'font-bold text-text-heading'}`}>
                        Request received
                      </h2>
                      <p className={`mx-auto mt-3 max-w-md text-sm leading-6 ${isLuxury ? 'text-white/58' : 'text-text-muted'}`}>
                        Your inquiry has been sent to {profile.professional_name}. They can now review it and follow up using your preferred contact method.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className={`mt-7 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em] ${
                          isLuxury
                            ? 'bg-[var(--storefront-accent)] text-[#15110d] hover:brightness-105'
                            : 'rounded-full bg-primary text-white hover:brightness-95'
                        }`}
                      >
                        Send another request
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submit}>
                    <h2 className={`mt-2.5 text-3xl sm:text-[2rem] ${isLuxury ? 'font-serif font-normal text-[#f5f1e8]' : 'font-bold text-text-heading'}`}>
                      {isLawyerClassic ? 'Tell us about your matter' : 'How may I assist?'}
                    </h2>
                    <p className={`mt-2 text-xs leading-5 ${isLuxury ? 'text-white/50' : 'text-text-muted'}`}>
                      Fields marked with an asterisk are required.
                    </p>

                    <div className="mt-6 grid gap-x-3.5 gap-y-4 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <span className={labelClass}>Full name *</span>
                        <input value={form.full_name} onChange={(event) => updateField('full_name', event.target.value)} className={fieldClass} maxLength={120} autoComplete="name" />
                      </label>
                      <label>
                        <span className={labelClass}>Email</span>
                        <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className={fieldClass} autoComplete="email" />
                      </label>
                      <label>
                        <span className={labelClass}>Phone</span>
                        <input type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className={fieldClass} maxLength={40} autoComplete="tel" />
                      </label>
                      <label>
                        <span className={labelClass}>
                          {isLawyer ? 'Legal service needed *' : 'I am interested in'}
                        </span>
                        {isLawyer ? (
                          <select
                            value={form.legal_services_needed}
                            onChange={(event) => updateField('legal_services_needed', event.target.value)}
                            className={fieldClass}
                          >
                            <option value="" className="bg-white text-stone-900">Select a legal service</option>
                            <option value="purchase_closing" className="bg-white text-stone-900">Purchase closing</option>
                            <option value="sale_closing" className="bg-white text-stone-900">Sale closing</option>
                            <option value="refinance_or_title_transfer" className="bg-white text-stone-900">Refinancing or title transfer</option>
                            <option value="contract_or_document_review" className="bg-white text-stone-900">Contract or document review</option>
                            <option value="commercial_real_estate" className="bg-white text-stone-900">Commercial real estate</option>
                            <option value="property_dispute_or_other" className="bg-white text-stone-900">Property dispute or another matter</option>
                          </select>
                        ) : isFirstHome ? (
                          <TemplateSelect
                            value={form.intent}
                            onChange={(nextValue) => updateField('intent', nextValue)}
                            options={[
                              { value: 'buy', label: 'Buying a property' },
                              { value: 'sell', label: 'Selling a property' },
                            ]}
                            buttonClass={firstHomeSelectButtonClass}
                            panelClass={firstHomeSelectPanelClass}
                            optionClass={firstHomeSelectOptionClass}
                            activeOptionClass={firstHomeSelectActiveClass}
                          />
                        ) : (
                          <select value={form.intent} onChange={(event) => updateField('intent', event.target.value)} className={fieldClass}>
                            <option value="buy" className="bg-white text-stone-900">Buying a property</option>
                            <option value="sell" className="bg-white text-stone-900">Selling a property</option>
                          </select>
                        )}
                      </label>
                      <label>
                        <span className={labelClass}>Preferred contact</span>
                        {isLawyer ? (
                          <select
                            value={form.preferred_contact_method}
                            onChange={(event) => updateField('preferred_contact_method', event.target.value)}
                            className={fieldClass}
                          >
                            <option value="email" className="bg-white text-stone-900">Email</option>
                            <option value="phone" className="bg-white text-stone-900">Phone call</option>
                            <option value="video_call" className="bg-white text-stone-900">Video meeting</option>
                          </select>
                        ) : isFirstHome ? (
                          <TemplateSelect
                            value={form.preferred_contact_method}
                            onChange={(nextValue) => updateField('preferred_contact_method', nextValue)}
                            options={[
                              { value: 'email', label: 'Email' },
                              { value: 'phone', label: 'Phone' },
                              { value: 'text', label: 'Text message' },
                            ]}
                            buttonClass={firstHomeSelectButtonClass}
                            panelClass={firstHomeSelectPanelClass}
                            optionClass={firstHomeSelectOptionClass}
                            activeOptionClass={firstHomeSelectActiveClass}
                          />
                        ) : (
                          <select value={form.preferred_contact_method} onChange={(event) => updateField('preferred_contact_method', event.target.value)} className={fieldClass}>
                            <option value="email" className="bg-white text-stone-900">Email</option>
                            <option value="phone" className="bg-white text-stone-900">Phone</option>
                            <option value="text" className="bg-white text-stone-900">Text message</option>
                          </select>
                        )}
                      </label>
                      <label className="sm:col-span-2">
                        <span className={labelClass}>Best time to contact</span>
                        <input value={form.best_time_to_contact} onChange={(event) => updateField('best_time_to_contact', event.target.value)} className={fieldClass} maxLength={80} placeholder="For example: weekday afternoons" />
                      </label>
                      <label className="sm:col-span-2">
                        <span className={labelClass}>How can I help? *</span>
                        <textarea value={form.message} onChange={(event) => updateField('message', event.target.value)} className={`${fieldClass} min-h-24 resize-y`} maxLength={2000} />
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`mt-5 inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-[9px] font-bold uppercase tracking-[0.17em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isLuxury
                          ? 'bg-[var(--storefront-accent)] text-[#15110d] shadow-[0_10px_24px_color-mix(in_srgb,var(--storefront-accent)_12%,transparent)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_14px_30px_color-mix(in_srgb,var(--storefront-accent)_18%,transparent)]'
                          : isLayeredLawyer
                            ? `${isLawyerNewcomer ? 'rounded-full' : ''} bg-accent text-accent-contrast hover:-translate-y-0.5 hover:brightness-105`
                            : 'rounded-full bg-primary text-white hover:brightness-95'
                      }`}
                    >
                      <Send size={14} />
                      {submitting ? 'Sending request…' : 'Send private request'}
                    </button>
                    <p className={`mt-3 text-[10px] leading-5 ${isLayeredLawyer || isLuxury ? 'text-current opacity-55' : 'text-slate-500'}`}>
                      By submitting, you agree to Nesti&apos;s{' '}
                      <Link href="/privacy" className="underline underline-offset-2 hover:text-accent">Privacy Policy</Link>
                      {' '}and{' '}
                      <Link href="/terms" className="underline underline-offset-2 hover:text-accent">Terms</Link>.
                      {isLawyer ? (
                        <> An inquiry does not create a lawyer-client relationship.</>
                      ) : null}
                    </p>
                    {errorMessage ? (
                      <p
                        role="alert"
                        className={`mt-3 px-3 py-2 text-xs ${
                          isLuxury ? 'bg-red-950/35 text-red-200 ring-1 ring-red-400/20' : 'rounded-lg bg-red-50 text-red-700'
                        }`}
                      >
                        {errorMessage}
                      </p>
                    ) : null}
                  </form>
                )}
              </div>
            </div>
          </section>
        </main>

        <div data-storefront-block={STOREFRONT_BLOCK_TYPES.FOOTER}>
          {isLawyerInvestor ? (
            <LawyerInvestorFooter profile={profile} block={footerBlock} absoluteHashes />
          ) : isLawyerNewcomer ? (
            <LawyerNewcomerFooter profile={profile} block={footerBlock} absoluteHashes />
          ) : isLayeredLawyer ? (
            <LawyerClassicFooter profile={profile} block={footerBlock} absoluteHashes />
          ) : (
            <PublicStorefrontFooter profile={profile} content={footerContent} sectionStyle={footerBlockStyle} />
          )}
        </div>
        {profile?.storefront_show_chatbot === false ? null : <PublicChatBubble profile={profile} />}
      </div>
    </StorefrontTheme>
  );
}
