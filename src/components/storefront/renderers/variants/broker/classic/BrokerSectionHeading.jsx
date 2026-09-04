'use client';

import { LawyerEditableText as EditableText } from '../../lawyer/shared/LawyerEditableText';
import { lawyerContentSource } from '../../lawyer/shared/lawyerSectionUtils';
import {
  brokerAlignmentClass,
  brokerAlignmentMarginClass,
  brokerContentValue,
} from './brokerSectionUtils';

export function BrokerSectionHeading({
  content,
  eyebrow,
  heading,
  body,
  align = 'left',
  dark = false,
  bodyClassName = '',
}) {
  const textAlign = brokerAlignmentClass(align);
  const margin = brokerAlignmentMarginClass(align);
  const isCenter = align === 'center';
  const isRight = align === 'right';
  const accentBarClass = isCenter ? 'mx-auto' : isRight ? 'ml-auto' : '';
  const bodyWidthClass = bodyClassName || (
    isCenter ? 'mx-auto max-w-3xl' : isRight ? 'ml-auto max-w-2xl' : 'max-w-2xl'
  );

  return (
    <div
      className={`${textAlign} ${margin} w-full max-w-5xl`}
      data-storefront-anim-item="true"
    >
      {eyebrow ? (
        <EditableText
          field="content.eyebrow"
          label="Section eyebrow"
          source={lawyerContentSource(content, 'eyebrow')}
          className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
            dark ? 'text-white/70' : 'text-[color:var(--storefront-accent,#008fd5)]'
          }`}
        >
          {brokerContentValue(content, 'eyebrow', eyebrow)}
        </EditableText>
      ) : null}
      <EditableText
        as="h2"
        field="content.heading"
        label="Section heading"
        source={lawyerContentSource(content, 'heading')}
        className={`mt-3 text-[1.75rem] font-bold leading-tight tracking-tight text-balance sm:text-[2.1rem] ${
          dark ? 'text-white' : 'text-[color:var(--storefront-primary,#0c2139)]'
        }`}
      >
        {brokerContentValue(content, 'heading', heading)}
      </EditableText>
      <div className={`mt-4 h-[3px] w-10 rounded-full bg-[color:var(--storefront-accent,#008fd5)] ${accentBarClass}`} />
      <EditableText
        as="p"
        field="content.body"
        label="Section supporting copy"
        source={lawyerContentSource(content, 'body')}
        className={`mt-4 text-sm leading-7 sm:text-[15px] sm:leading-8 ${
          dark ? 'text-white/75' : 'text-slate-600'
        } ${bodyWidthClass}`}
      >
        {brokerContentValue(content, 'body', body)}
      </EditableText>
    </div>
  );
}
