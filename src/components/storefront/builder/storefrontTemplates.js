/**
 * Compatibility barrel — template definitions live in ../templates.
 * Prefer importing from `@/components/storefront/templates`.
 */
export {
  STOREFRONT_TEMPLATES,
  listTemplatesForRole,
  listAllTemplateIds,
  getStorefrontTemplate,
  getTemplateBrandDefaults,
  getTemplateExperienceId,
  listTemplateGroups,
  materializeTemplate,
  seedBlockContentFromProfile,
  buildTemplateContext,
  visualTreatmentForTemplate,
  listingCardThemeFromTemplate,
} from '../templates';
