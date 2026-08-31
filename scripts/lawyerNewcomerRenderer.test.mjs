import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readSource(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), 'utf8');
}

async function importSource(relativePath) {
  const source = await readSource(relativePath);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

const {
  newcomerCollection,
  newcomerFooterLinkProps,
  realNewcomerTestimonials,
} = await importSource(
  '../src/components/storefront/renderers/variants/lawyer/newcomer/newcomerData.js',
);

test('Newcomer collection data preserves explicit emptiness and normalizes profile fallbacks', () => {
  const fallback = [
    'Purchase closing | Agreement through keys',
    { name: 'Document review', text: 'Plain-language contract guidance' },
  ];
  assert.deepEqual(newcomerCollection({}, 'items', fallback).items.map((item) => item.title), [
    'Purchase closing',
    'Document review',
  ]);
  assert.deepEqual(newcomerCollection({ items: [] }, 'items', fallback), {
    hasPersisted: true,
    items: [],
  });
});

test('Newcomer testimonials publish only complete real feedback records', () => {
  const stories = realNewcomerTestimonials([
    { client_name: 'A. Client', text: 'Clear and patient guidance.', rating: 9 },
    { client_name: 'Inquiry lead', text: '' },
    { name: 'Family B', review: 'We understood every closing step.', rating: 0 },
    null,
  ]);
  assert.deepEqual(stories.map(({ client_name, text, rating }) => ({ client_name, text, rating })), [
    { client_name: 'A. Client', text: 'Clear and patient guidance.', rating: 5 },
    { client_name: 'Family B', text: 'We understood every closing step.', rating: 5 },
  ]);
});

test('Newcomer footer links accept safe destinations only', () => {
  assert.deepEqual(
    newcomerFooterLinkProps({ target: '#guidance' }, { absoluteHashes: true, slug: 'lawyer' }),
    { href: '/professional/lawyer#guidance' },
  );
  assert.equal(newcomerFooterLinkProps({ target: 'https://example.com/help' }).target, '_blank');
  assert.equal(newcomerFooterLinkProps({ target: 'javascript:alert(1)' }).href, '#');
  assert.equal(newcomerFooterLinkProps({ target: '//evil.example' }).href, '#');
});

test('Newcomer has eight dedicated overrides while story-warm owns Hero unchanged', async () => {
  const registry = await readSource(
    '../src/components/storefront/renderers/createStorefrontRendererRegistry.jsx',
  );
  const override = registry.match(/'lawyer-newcomer': \{([\s\S]*?)\n  \},\n  'lawyer-investor'/)?.[1] || '';
  [
    'ABOUT',
    'PRACTICE_AREAS',
    'SERVICES',
    'GUIDANCE',
    'CREDENTIALS',
    'TESTIMONIALS',
    'CTA',
    'FOOTER',
  ].forEach((type) => assert.match(override, new RegExp(`\\[T\\.${type}\\]`)));
  assert.doesNotMatch(override, /\[T\.HERO\]/);
  assert.match(
    registry,
    /'story-warm':[\s\S]*?lawyer:\s*\{[\s\S]*?\[T\.HERO\]: \(\{ profile, actions, block \}\) => <WarmHeroSection/,
  );
});

test('Newcomer capabilities drive inspector content, layout, style, and collections', async () => {
  const [
    capabilities,
    model,
    content,
    layout,
    style,
    collections,
    renderer,
    feedback,
    header,
    contact,
    storyWarm,
    renderedBlock,
  ] = await Promise.all([
    readSource('../src/components/storefront/builder/inspector/newcomerCapabilities.js'),
    readSource('../src/components/storefront/builder/inspector/inspectorModel.js'),
    readSource('../src/components/storefront/builder/inspector/InspectorContentTab.jsx'),
    readSource('../src/components/storefront/builder/inspector/InspectorLayoutTab.jsx'),
    readSource('../src/components/storefront/builder/inspector/InspectorStyleTab.jsx'),
    readSource('../src/components/storefront/builder/inspector/InspectorCollectionEditors.jsx'),
    readSource('../src/components/storefront/renderers/variants/lawyer/newcomer/LawyerNewcomerSections.jsx'),
    readSource('../src/components/storefront/renderers/variants/IndustrialClientFeedbackSection.jsx'),
    readSource('../src/components/public-profile/PublicStorefrontHeader.jsx'),
    readSource('../src/components/storefront/PublicContactPage.jsx'),
    readSource('../src/components/storefront/experiences/storyWarm.js'),
    readSource('../src/components/storefront/renderers/runtime/StorefrontRenderedBlock.jsx'),
  ]);
  [
    'HERO',
    'ABOUT',
    'PRACTICE_AREAS',
    'SERVICES',
    'GUIDANCE',
    'CREDENTIALS',
    'TESTIMONIALS',
    'CTA',
    'FOOTER',
  ].forEach((type) => assert.match(capabilities, new RegExp(`\\[T\\.${type}\\]`)));
  assert.match(model, /lawyerNewcomerCapabilities/);
  assert.match(model, /isLawyerNewcomer && !isHero/);
  assert.match(content, /newcomerCapabilities/);
  assert.match(content, /const seen = new Set\(\)/);
  assert.match(layout, /newcomerLayout/);
  assert.match(style, /newcomerStyle/);
  assert.match(collections, /target: '#about'/);
  assert.match(renderer, /realNewcomerTestimonials/);
  assert.match(renderer, /storefront_section_style: block\?\.data\?\.style/);
  assert.match(renderer, /var\(--storefront-accent, #416f82\)/);
  assert.match(renderer, /var\(--storefront-primary, #4b3a2f\)/);
  assert.doesNotMatch(renderer, /#173f3a|#f28b5b|rgba\(48,77,67/);
  assert.doesNotMatch(renderer, /bg-gradient|backgroundImage/);
  assert.match(renderer, /Add \{kind === 'practice' \? 'practice areas' : 'services'\}/);
  assert.doesNotMatch(capabilities, /imageIdentity|realFeedbackOnly|contrastSafe/);
  assert.match(feedback, /style=\{isLawyerVariant \? \{/);
  assert.doesNotMatch(renderer, /real_clients/);
  assert.match(header, /isLawyerNewcomer/);
  assert.match(contact, /<LawyerNewcomerFooter/);
  assert.match(storyWarm, /\[data-template-key='lawyer-newcomer'\]\.storefront-experience-story \{\s*background: transparent/);
  assert.match(storyWarm, /\[data-template-key='lawyer-newcomer'\][\s\S]*?\[data-storefront-block\] \{\s*background-image: none/);
  assert.match(renderedBlock, /templateKey === 'lawyer-newcomer' && isHero \? \{ isolation: 'auto' \}/);
});
