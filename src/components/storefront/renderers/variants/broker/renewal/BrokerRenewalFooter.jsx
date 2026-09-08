'use client';

import { BrokerClassicFooter } from '../classic/BrokerClassicFooter';
import { RENEWAL_FOOTER_ITEMS } from './brokerRenewalDefaults';
import { RENEWAL_PALETTE as P } from './brokerRenewalPalette';

/** Lightweight renewal footer — safe for contact page (no hero/adapters graph). */
export function BrokerRenewalFooter(props) {
  const block = props.block || {};
  const data = block.data || {};
  const style = {
    ...(data.style || block.style || {}),
    background: P.footer,
    textColor: P.white,
  };
  return (
    <BrokerClassicFooter
      {...props}
      block={{
        ...block,
        data: {
          ...data,
          style,
        },
        style,
      }}
      fallbackItems={RENEWAL_FOOTER_ITEMS}
      itemLimit={8}
    />
  );
}
