import { normalizeStorefrontRole } from '../storefrontPresets';

import agentTemplates from './agent';
import mortgageBrokerTemplates from './mortgage-broker';
import lawyerTemplates from './lawyer';

const ALL_TEMPLATES = [
  ...agentTemplates,
  ...mortgageBrokerTemplates,
  ...lawyerTemplates,
];

export const STOREFRONT_TEMPLATES = Object.fromEntries(
  ALL_TEMPLATES.map((template) => [template.id, template]),
);

export function listTemplatesForRole(role) {
  const normalized = normalizeStorefrontRole(role);
  return ALL_TEMPLATES.filter((template) => template.role === normalized);
}

export function getStorefrontTemplate(templateKey) {
  return STOREFRONT_TEMPLATES[templateKey] || null;
}

export function getTemplateBrandDefaults(templateKey) {
  const template = getStorefrontTemplate(templateKey);
  if (!template?.brand) return null;
  return {
    primary_color: template.brand.primary_color,
    accent_color: template.brand.accent_color,
    page_background: template.brand.page_background || '#ffffff',
    button_shape: template.brand.button_shape || 'rounded',
    font: template.brand.font,
    image_style: template.brand.image_style,
  };
}

export function getTemplateExperienceId(templateKey) {
  return getStorefrontTemplate(templateKey)?.experience || null;
}

export function listAllTemplateIds() {
  return Object.keys(STOREFRONT_TEMPLATES);
}

export function listTemplateGroups() {
  const roleLabels = {
    agent: 'Real Estate Agent',
    mortgage_broker: 'Mortgage Broker',
    lawyer: 'Real Estate Lawyer',
  };
  return ['agent', 'mortgage_broker', 'lawyer'].map((role) => ({
    role,
    label: roleLabels[role],
    templates: listTemplatesForRole(role).map((template) => ({
      key: template.id,
      name: template.label,
    })),
  }));
}
