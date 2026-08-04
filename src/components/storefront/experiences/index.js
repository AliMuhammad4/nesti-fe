import { classicBalancedExperience } from './classicBalanced';
import { conversionFunnelExperience } from './conversionFunnel';
import { industrialMinimalExperience } from './industrialMinimal';
import { luxuryEditorialExperience } from './luxuryEditorial';
import { neighborhoodLocalExperience } from './neighborhoodLocal';
import { storyWarmExperience } from './storyWarm';
import { getTemplateExperienceId } from '../templates/registry';

const EXPERIENCES = {
  'luxury-editorial': luxuryEditorialExperience,
  'industrial-minimal': industrialMinimalExperience,
  'story-warm': storyWarmExperience,
  'conversion-funnel': conversionFunnelExperience,
  'classic-balanced': classicBalancedExperience,
  'neighborhood-local': neighborhoodLocalExperience,
};

export function experienceIdFromTemplateKey(templateKey = '') {
  const explicit = getTemplateExperienceId(templateKey);
  if (explicit) return explicit;

  // Fallback for legacy/custom keys not in the registry.
  const key = String(templateKey || '').toLowerCase();
  if (key.includes('luxury') || key.includes('wealth')) return 'luxury-editorial';
  if (key.includes('commercial') || key.includes('investor')) return 'industrial-minimal';
  if (key.includes('community')) return 'neighborhood-local';
  if (key.includes('first-home') || key.includes('newcomer')) return 'story-warm';
  if (key.includes('seller') || key.includes('renewal')) return 'conversion-funnel';
  return 'classic-balanced';
}

export function getStorefrontExperience(experienceId) {
  return EXPERIENCES[experienceId] || EXPERIENCES['classic-balanced'];
}

export function allExperienceCss() {
  return Object.values(EXPERIENCES).map((item) => item.css || '').join('\n');
}
