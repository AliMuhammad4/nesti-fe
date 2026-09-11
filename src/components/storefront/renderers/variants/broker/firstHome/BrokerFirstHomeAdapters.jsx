'use client';

import {
  BrokerClassicCalculator,
  BrokerClassicCompensation,
  BrokerClassicCredentials,
  BrokerClassicFaq,
  BrokerClassicFooter,
  BrokerClassicPrograms,
  BrokerClassicRates,
  BrokerClassicLenders,
  BrokerClassicAlternativeLending,
  BrokerClassicSnapshot,
  BrokerClassicTestimonials,
} from '../classic';
import {
  FIRST_HOME_FOOTER_ITEMS,
  FIRST_HOME_PROGRAM_ITEMS,
} from './brokerFirstHomeDefaults';

const FIRST_HOME_PROGRAM_HEADINGS = {
  eyebrow: 'First-home programs',
  heading: 'Programs that fit first-time buyers',
  body: 'Explore common paths used by first-home clients—and choose the structure that fits your timeline.',
};

export function BrokerFirstHomeSnapshot(props) {
  return <BrokerClassicSnapshot {...props} />;
}

export function BrokerFirstHomePrograms(props) {
  return (
    <BrokerClassicPrograms
      {...props}
      fallbackItems={FIRST_HOME_PROGRAM_ITEMS}
      headingDefaults={FIRST_HOME_PROGRAM_HEADINGS}
    />
  );
}

export function BrokerFirstHomeRates(props) {
  return <BrokerClassicRates {...props} />;
}

export function BrokerFirstHomeCalculator(props) {
  return <BrokerClassicCalculator {...props} appearance="first-home" />;
}

export function BrokerFirstHomeLenders(props) {
  return <BrokerClassicLenders {...props} appearance="first-home" />;
}

export function BrokerFirstHomeCompensation(props) {
  return <BrokerClassicCompensation {...props} />;
}

export function BrokerFirstHomeAlternativeLending(props) {
  return <BrokerClassicAlternativeLending {...props} />;
}

export function BrokerFirstHomeCredentials(props) {
  return <BrokerClassicCredentials {...props} appearance="first-home" />;
}

export function BrokerFirstHomeTestimonials(props) {
  return <BrokerClassicTestimonials {...props} />;
}

export function BrokerFirstHomeFaq(props) {
  return <BrokerClassicFaq {...props} />;
}

export function BrokerFirstHomeFooter(props) {
  return (
    <BrokerClassicFooter
      {...props}
      fallbackItems={FIRST_HOME_FOOTER_ITEMS}
      itemLimit={10}
    />
  );
}
