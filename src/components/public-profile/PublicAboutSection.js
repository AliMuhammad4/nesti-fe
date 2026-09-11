'use client';

import Image from 'next/image';
import { CalendarCheck, Clock3, ShieldCheck, Target, Zap } from 'lucide-react';

import {
  formatProfileBusinessField,
  toTitleCase,
} from "@/lib/profileFieldDisplay";

const getInitials = (name) =>
  String(name || 'Professional')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function PublicAboutSection({ about, profile, role = 'agent' }) {
  const content = profile?.storefront_section_content || {};
  const sectionStyle = profile?.storefront_section_style || {};
  const hasCustomTextColor = Boolean(sectionStyle.textColor);
  const professionalProfile = profile?.professional_profile || {};
  const professionalName = content.name || profile?.professional_name || 'Trusted Professional';
  const professionalRole = content.role || professionalProfile.company_name || toTitleCase(profile?.professional_type);
  const profilePhoto = profile?.profile_photo_url;
  const eyebrow = content.eyebrow || 'About';
  const heading = content.heading || `About ${professionalName}`;
  const detailItems = [
    { label: 'Availability', value: professionalProfile.availability, icon: CalendarCheck },
    { label: 'Response Time', value: professionalProfile.response_time, icon: Clock3 },
    { label: 'Support Level', value: professionalProfile.support_level, icon: ShieldCheck },
    { label: 'Approach', value: professionalProfile.sales_approach || professionalProfile.negotiation_style, icon: Target },
    { label: 'Energy', value: professionalProfile.energy_style || professionalProfile.personality_tag, icon: Zap },
  ]
    .filter((item) => item.value)
    .map((item) => ({
      ...item,
      value: formatProfileBusinessField(item.label, item.value),
    }));

  const paragraphs = String(about || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((paragraph, index, items) => items.indexOf(paragraph) === index);

  if (!paragraphs.length) return null;

  return (
    <section id="about" className="bg-transparent py-10 sm:py-14 lg:py-16" style={{ color: sectionStyle.textColor || undefined }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-14">
          <div className="flex flex-col items-center lg:w-48 lg:shrink-0 lg:items-start" data-storefront-anim-item="true">
            <div
              data-storefront-field="brandKit.profile_photo_url"
              data-storefront-source="profile"
              data-storefront-label="Profile photo"
              className="relative h-32 w-32 overflow-hidden rounded-2xl bg-slate-100 shadow-md ring-1 ring-slate-200/80 sm:h-40 sm:w-40 md:h-44 md:w-44"
            >
              {profilePhoto ? (
                <Image
                  src={profilePhoto}
                  alt={professionalName}
                  fill
                  sizes="176px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/20 to-primary/5 text-3xl font-bold text-primary">
                  {getInitials(professionalName)}
                </div>
              )}
            </div>
            <h3 data-storefront-field="content.name" data-storefront-source={content.name ? 'persisted' : 'fallback'} data-storefront-label="Professional name" className={`mt-2.5 text-center text-sm font-semibold lg:text-left ${hasCustomTextColor ? 'text-current' : 'text-text-heading'}`}>
              {professionalName}
            </h3>
            <p data-storefront-field="content.role" data-storefront-source={content.role ? 'persisted' : 'fallback'} data-storefront-label="Company or role" className={`mt-0.5 text-center text-[10px] font-medium uppercase tracking-widest lg:text-left ${hasCustomTextColor ? 'text-current' : 'text-primary'}`} style={hasCustomTextColor ? { opacity: 0.78 } : undefined}>
              {professionalRole}
            </p>
          </div>

          <div className="flex flex-1 flex-col justify-center lg:pt-2" data-storefront-anim-item="true">
            <p
              data-storefront-field="content.eyebrow"
              data-storefront-source={content.eyebrow ? 'persisted' : 'fallback'}
              data-storefront-label="About eyebrow"
              className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${hasCustomTextColor ? 'text-current' : 'text-primary'}`}
              style={hasCustomTextColor ? { opacity: 0.78 } : undefined}
            >
              {eyebrow}
            </p>
            <h2
              data-storefront-field="content.heading"
              data-storefront-source={content.heading ? 'persisted' : 'fallback'}
              data-storefront-label="About heading"
              className={`mb-4 text-2xl font-bold tracking-tight sm:text-3xl ${hasCustomTextColor ? 'text-current' : 'text-text-heading'}`}
            >
              {heading}
            </h2>
            <div className="space-y-3.5 sm:space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  data-storefront-field="content.body"
                  data-storefront-source={content.body ? 'persisted' : 'fallback'}
                  data-storefront-instance={index}
                  data-storefront-label="About description"
                  className={`text-[14px] leading-7 sm:text-[15px] sm:leading-8 ${hasCustomTextColor ? 'text-current' : 'text-text-body'}`}
                  style={hasCustomTextColor ? { opacity: 0.9 } : undefined}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {detailItems.length > 0 ? (
          <div className="mt-8 border-t border-slate-100 pt-6 sm:mt-10 sm:pt-8">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {detailItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-sm"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                      <Icon size={15} />
                    </span>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        {item.label}
                      </div>
                      <div className="text-sm font-medium text-text-heading">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
