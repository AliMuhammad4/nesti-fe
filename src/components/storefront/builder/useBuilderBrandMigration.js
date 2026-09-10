import { useEffect } from 'react';
import {
  migrateBrokerClassicBrandKit,
} from '../templates/mortgage-broker/classicMigration';
import {
  migrateBrokerFirstHomeBrandKit,
} from '../templates/mortgage-broker/firstHomeMigration';
import {
  migrateBrokerRenewalBrandKit,
} from '../templates/mortgage-broker/renewalMigration';
import {
  migrateBrokerCommercialBrandKit,
} from '../templates/mortgage-broker/commercialMigration';
import { getTemplateBrandDefaults } from '../templates';

export function useBuilderBrandMigration({
  templateKey,
  brandKit,
  onBrandKitChange,
}) {
  useEffect(() => {
    if (templateKey !== 'mortgage_broker-classic') return;
    const migrated = migrateBrokerClassicBrandKit(templateKey, brandKit || {});
    if (JSON.stringify(brandKit || {}) === JSON.stringify(migrated)) return;
    onBrandKitChange(migrated);
  }, [brandKit, onBrandKitChange, templateKey]);

  useEffect(() => {
    if (templateKey !== 'mortgage_broker-first-home') return;
    const migrated = migrateBrokerFirstHomeBrandKit(templateKey, brandKit || {});
    if (JSON.stringify(brandKit || {}) === JSON.stringify(migrated)) return;
    onBrandKitChange(migrated);
  }, [brandKit, onBrandKitChange, templateKey]);

  useEffect(() => {
    if (templateKey !== 'mortgage_broker-renewal') return;
    const migrated = migrateBrokerRenewalBrandKit(templateKey, brandKit || {});
    if (JSON.stringify(brandKit || {}) === JSON.stringify(migrated)) return;
    onBrandKitChange(migrated);
  }, [brandKit, onBrandKitChange, templateKey]);

  useEffect(() => {
    if (templateKey !== 'mortgage_broker-commercial') return;
    const migrated = migrateBrokerCommercialBrandKit(templateKey, brandKit || {});
    if (JSON.stringify(brandKit || {}) === JSON.stringify(migrated)) return;
    onBrandKitChange(migrated);
  }, [brandKit, onBrandKitChange, templateKey]);

  useEffect(() => {
    if (templateKey !== 'lawyer-classic') return;
    const essentials = brandKit?.essentials || {};
    if (Number(essentials.lawyer_classic_brand_version || 0) >= 1) return;

    const defaults = getTemplateBrandDefaults(templateKey);
    if (!defaults) return;
    const normalizedColor = (value) => String(value || '').trim().toLowerCase();
    const legacyColors = {
      primary_color: new Set(['', '#0f766e']),
      accent_color: new Set(['', '#f59e0b']),
      page_background: new Set(['', '#ffffff']),
    };
    const updates = {
      essentials: {
        ...essentials,
        lawyer_classic_brand_version: 1,
      },
    };
    Object.entries(legacyColors).forEach(([key, values]) => {
      if (values.has(normalizedColor(brandKit?.[key]))) {
        updates[key] = defaults[key];
      }
    });
    if (!brandKit?.button_shape || brandKit.button_shape === 'rounded') {
      updates.button_shape = defaults.button_shape;
    }
    onBrandKitChange(updates);
  }, [brandKit, onBrandKitChange, templateKey]);

  useEffect(() => {
    if (templateKey !== 'lawyer-first-home-closing') return;
    const essentials = brandKit?.essentials || {};
    if (Number(essentials.lawyer_first_home_brand_version || 0) >= 4) return;

    const defaults = getTemplateBrandDefaults(templateKey);
    if (!defaults) return;
    const normalizedValue = (value) => String(value || '').trim().toLowerCase();
    const legacyValues = {
      primary_color: new Set(['', '#1e3a8a', '#101a2b', '#34c759']),
      accent_color: new Set(['', '#60a5fa', '#c8a878', '#f59e0b']),
      page_background: new Set(['', '#ffffff', '#eff6ff', '#f7f4ee']),
    };
    const updates = {
      essentials: {
        ...essentials,
        lawyer_first_home_brand_version: 4,
      },
    };
    Object.entries(legacyValues).forEach(([key, values]) => {
      if (values.has(normalizedValue(brandKit?.[key]))) updates[key] = defaults[key];
    });
    if (!brandKit?.font || ['DM Sans', 'Inter', 'Playfair Display', 'Open Sans'].includes(brandKit.font)) {
      updates.font = defaults.font;
    }
    if (!brandKit?.button_shape || ['pill', 'rounded'].includes(brandKit.button_shape)) {
      updates.button_shape = defaults.button_shape;
    }
    if (!brandKit?.image_style || brandKit.image_style === 'warm') {
      updates.image_style = defaults.image_style;
    }
    onBrandKitChange(updates);
  }, [brandKit, onBrandKitChange, templateKey]);
}
