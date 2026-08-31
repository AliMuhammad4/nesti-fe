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
  INVESTOR_BLOCK_ORDER,
  INVESTOR_DESIGN_VERSION,
  migrateLawyerInvestorBlocks,
} = await importSource(
  '../src/components/storefront/templates/lawyer/investorMigration.js',
);

const block = (type, content = {}, layout = {}, style = {}, id = `${type}-default`) => ({
  id,
  type,
  data: {
    enabled: true,
    content,
    layout,
    style,
  },
});

const defaults = INVESTOR_BLOCK_ORDER.map((type, index) => block(
  type,
  type === 'hero'
    ? {
        investor_design_version: INVESTOR_DESIGN_VERSION,
        heading: 'Transaction counsel for active investors',
        body: 'Structured legal support for investor transactions.',
      }
    : { heading: `Default ${type}`, body: `Default ${type} body` },
  {
    padding: 'large',
    columns: type === 'credentials' ? '4' : '2',
    ...(type === 'hero' ? { mediaPosition: 'portrait' } : {}),
  },
  {
    background: type === 'cta'
      ? '#007f95'
      : (type === 'footer'
        ? '#12171c'
        : (type === 'hero' ? '#20252b' : '')),
    textColor: ['cta', 'role-details', 'credentials'].includes(type)
      ? (type === 'cta' ? '#ffffff' : '#20252b')
      : undefined,
  },
  `${type}-${index + 1}`,
));

test('legacy Investor pages upgrade to ten layers without testimonials', () => {
  const current = [
    block(
      'hero',
      {
        heading: 'My custom investor counsel',
        body: 'Purchases, refinances, assignments, and portfolio title work.',
        cta_label: 'Start investor intake',
        eyebrow: 'Investor legal desk',
      },
      { padding: 'large', columns: '2' },
      { background: '#0f172a' },
      'hero-existing',
    ),
    block('practice-areas', {
      heading: 'Investor workstreams',
      body: 'Acquisitions, refinancing, and entity transfers.',
    }, {}, {}, 'practice-existing'),
    block('credentials', {
      heading: 'Trusted on volume files',
      body: 'Process discipline for repeat investors.',
    }, {}, {}, 'credentials-existing'),
    block('testimonials', { heading: 'Remove me' }, {}, {}, 'testimonials-existing'),
    block('cta', {
      heading: 'Send the next deal',
      body: 'Share APS, entity, and target closing.',
      cta_label: 'Open file',
    }, {}, {}, 'cta-existing'),
  ];

  const migrated = migrateLawyerInvestorBlocks(current, defaults);
  assert.deepEqual(migrated.map((entry) => entry.type), INVESTOR_BLOCK_ORDER);
  assert.equal(migrated.some((entry) => entry.type === 'testimonials'), false);
  assert.equal(migrated[0].id, 'hero-existing');
  assert.equal(migrated[0].data.content.heading, 'My custom investor counsel');
  assert.equal(migrated[0].data.content.body, 'Structured legal support for investor transactions.');
  assert.equal(migrated[0].data.style.background, '#0f172a');
  assert.equal(
    migrated[0].data.content.investor_design_version,
    INVESTOR_DESIGN_VERSION,
  );
});

test('current investor pages preserve intentional deletions while filtering testimonials', () => {
  const current = [
    block('hero', { investor_design_version: INVESTOR_DESIGN_VERSION }),
    block('about', { heading: 'Custom about' }),
    block('testimonials', { heading: 'Remove me' }),
    block('footer'),
  ];

  const migrated = migrateLawyerInvestorBlocks(current, defaults);
  assert.deepEqual(migrated.map((entry) => entry.type), ['hero', 'about', 'footer']);
});

test('version 10 pages preserve custom structure, repair duplicate ids, and update legacy footer anchors', () => {
  const current = [
    block('hero', { investor_design_version: 10, heading: 'Keep this' }, {}, {}, 'duplicate-id'),
    block('services', { heading: 'One' }, {}, {}, 'duplicate-id'),
    block('services', { heading: 'Two' }, {}, {}, 'duplicate-id'),
    block('footer', {
      items: [
        { id: 'services-link', label: 'Services', target: '#buyer-toolkit' },
        { id: 'practice-link', label: 'Practice areas', target: '#services' },
        { id: 'custom-link', label: 'Custom services', target: '#services' },
      ],
    }, {}, {}, 'footer-v10'),
  ];

  const migrated = migrateLawyerInvestorBlocks(current, defaults);
  assert.deepEqual(migrated.map((entry) => entry.type), ['hero', 'services', 'services', 'footer']);
  assert.equal(new Set(migrated.map((entry) => entry.id)).size, migrated.length);
  assert.equal(migrated[0].data.content.heading, 'Keep this');
  assert.equal(migrated[0].data.content.investor_design_version, INVESTOR_DESIGN_VERSION);
  assert.deepEqual(
    migrated.at(-1).data.content.items.map((item) => item.target),
    ['#services', '#practice-areas', '#services'],
  );
});

test('missing Investor hero no longer reports design version zero', () => {
  const current = [block('about', { heading: 'Preserved without a hero' })];
  const migrated = migrateLawyerInvestorBlocks(current, defaults);
  assert.equal(migrated.some((entry) => entry.type === 'hero'), false);
  assert.equal(migrated.find((entry) => entry.type === 'about').data.content.heading, 'Preserved without a hero');
});

test('version 6 pages preserve order and duplicate content sections while adopting renderer defaults', () => {
  const current = [
    block('hero', { investor_design_version: 6 }, { mediaPosition: 'none' }, {}, 'hero-v6'),
    block('services', { heading: 'First services' }, {}, {}, 'services-a'),
    block('about', { heading: 'Moved about' }, {}, {}, 'about-a'),
    block('services', { heading: 'Second services' }, {}, {}, 'services-b'),
    block('testimonials', { heading: 'Forbidden' }),
    block('custom-html', { heading: 'Forbidden' }),
    block('footer', {}, {}, {}, 'footer-v6'),
  ];

  const migrated = migrateLawyerInvestorBlocks(current, defaults);
  assert.deepEqual(migrated.map((entry) => entry.id), [
    'hero-v6',
    'services-a',
    'about-a',
    'practice-snapshot-3',
    'services-b',
    'footer-v6',
  ]);
  assert.equal(migrated[0].data.content.investor_design_version, INVESTOR_DESIGN_VERSION);
  assert.equal(migrated[0].data.layout.mediaPosition, 'portrait');
});

test('version 7 credentials migrate the former three-column default to four columns', () => {
  const current = [
    block('hero', { investor_design_version: 7 }),
    block('credentials', {}, { columns: '3' }, {}, 'credentials-v7'),
    block('footer'),
  ];

  const migrated = migrateLawyerInvestorBlocks(current, defaults);
  assert.equal(
    migrated.find((entry) => entry.type === 'credentials').data.layout.columns,
    '4',
  );
});

test('version 2 investor defaults migrate from green and copper to graphite and cyan', () => {
  const current = [
    block(
      'hero',
      { investor_design_version: 2, heading: 'Custom heading' },
      { padding: 'large', columns: '2' },
      { background: '#183c34', textColor: '#ffffff' },
    ),
    block(
      'cta',
      { heading: 'Bring the next deal into focus' },
      { padding: 'large', columns: '2' },
      { background: '#d07a45', textColor: '#102a25' },
    ),
    block(
      'footer',
      { heading: 'Investor legal desk' },
      { padding: 'large' },
      { background: '#102a25', textColor: '#ffffff' },
    ),
  ];

  const migrated = migrateLawyerInvestorBlocks(current, defaults);
  assert.equal(migrated[0].data.style.background, '#20252b');
  assert.equal(migrated.find((entry) => entry.type === 'role-details').data.style.background, '');
  assert.equal(migrated.find((entry) => entry.type === 'role-details').data.style.textColor, '#20252b');
  assert.equal(migrated.find((entry) => entry.type === 'cta').data.style.background, '#007f95');
  assert.equal(migrated.find((entry) => entry.type === 'cta').data.style.textColor, '#ffffff');
  assert.equal(migrated.find((entry) => entry.type === 'footer').data.style.background, '#12171c');
  assert.equal(migrated[0].data.content.heading, 'Custom heading');
  assert.equal(migrated[0].data.content.investor_design_version, INVESTOR_DESIGN_VERSION);
});

test('investor template, builder, registry, and published page share the ten-layer policy', async () => {
  const [template, registry, builderState, workspace, published] = await Promise.all([
    readSource('../src/components/storefront/templates/lawyer/investor.js'),
    readSource('../src/components/storefront/renderers/createStorefrontRendererRegistry.jsx'),
    readSource('../src/components/storefront/builder/storefrontBuilderState.js'),
    readSource('../src/components/storefront/builder/StorefrontBuilderWorkspace.jsx'),
    readSource('../src/components/storefront/PublicStorefrontPage.jsx'),
  ]);

  const templateOrder = [...template.matchAll(/block\(T\.([A-Z_]+)/g)]
    .map((match) => match[1]);
  assert.deepEqual(templateOrder, [
    'HERO',
    'ABOUT',
    'PRACTICE_SNAPSHOT',
    'SERVICES',
    'ROLE_DETAILS',
    'PRACTICE_AREAS',
    'GUIDANCE',
    'CREDENTIALS',
    'CTA',
    'FOOTER',
  ]);
  assert.doesNotMatch(template, /T\.TESTIMONIALS/);
  assert.doesNotMatch(template, /#312e81|#a78bfa|#1d2740|#b9915e|#183c34|#d07a45/);
  assert.match(registry, /'lawyer-investor': \{/);
  [
    'LawyerInvestorHero',
    'LawyerInvestorAbout',
    'LawyerInvestorPracticeSnapshot',
    'LawyerInvestorServices',
    'LawyerInvestorRoleDetails',
    'LawyerInvestorPracticeAreas',
    'LawyerInvestorGuidance',
    'LawyerInvestorCredentials',
    'LawyerInvestorCta',
    'LawyerInvestorFooter',
  ].forEach((renderer) => assert.match(registry, new RegExp(renderer)));
  assert.match(builderState, /LAWYER_INVESTOR_CANONICAL_BLOCK_ORDER/);
  assert.match(builderState, /normalizedTemplateKey.*lawyer-investor|lawyer-investor.*return false/s);
  assert.match(workspace, /migrateLawyerInvestorBlocks/);
  assert.match(published, /migrateLawyerInvestorBlocks/);
});

test('Investor inspector capabilities and renderer consume every exposed control family', async () => {
  const [
    capabilities,
    renderer,
    contentTab,
    heroFields,
    layoutTab,
    styleTab,
    collections,
    metadata,
  ] = await Promise.all([
    readSource('../src/components/storefront/builder/inspector/investorCapabilities.js'),
    readSource('../src/components/storefront/renderers/variants/lawyer/investor/LawyerInvestorSections.jsx'),
    readSource('../src/components/storefront/builder/inspector/InspectorContentTab.jsx'),
    readSource('../src/components/storefront/builder/inspector/content/HeroContentFields.jsx'),
    readSource('../src/components/storefront/builder/inspector/InspectorLayoutTab.jsx'),
    readSource('../src/components/storefront/builder/inspector/InspectorStyleTab.jsx'),
    readSource('../src/components/storefront/builder/inspector/InspectorCollectionEditors.jsx'),
    readSource('../src/app/p/[slug]/page.js'),
  ]);

  INVESTOR_BLOCK_ORDER.forEach((type) => {
    const constant = type.replaceAll('-', '_').toUpperCase();
    assert.match(capabilities, new RegExp(`\\[T\\.${constant}\\]`));
  });
  [
    'mediaPosition',
    'hero_card_text_color',
    'primary_button_background',
    'secondary_button_background',
    'icon_background',
    'panel_background',
    'process_card_background',
    'metric_order',
    'hidden_metrics',
    'helper_text',
    'show_email',
    'show_phone',
    'show_booking',
    'investorFooterLinkProps',
  ].forEach((field) => assert.match(renderer, new RegExp(field)));

  assert.match(contentTab, /investorCapabilities/);
  assert.match(heroFields, /showCoverPicker = !isLawyerInvestor \|\| investorMediaPosition === 'cover'/);
  assert.match(heroFields, /showProfilePicker[\s\S]*?investorMediaPosition === 'portrait'/);
  assert.match(layoutTab, /investorLayout/);
  assert.match(styleTab, /investorStyle/);
  assert.match(collections, /moveCollectionItem/);
  assert.match(collections, /duplicateCollectionItem/);
  assert.match(collections, /InvestorFooterLinksEditor/);
  assert.match(metadata, /heroContent\.heading/);
  assert.match(metadata, /heroMediaMode/);
});

test('public Calendly links accept only Calendly HTTPS destinations', async () => {
  const { buildTrackedCalendlyUrl, resolvePublicCalendlySource } = await importSource(
    '../src/lib/publicProfileLinks.js',
  );
  const profile = {
    id: 'lawyer-1',
    professional_profile: { calendly_link: 'calendly.com/lawyer/consultation' },
  };
  const safeUrl = buildTrackedCalendlyUrl(resolvePublicCalendlySource(profile), profile);
  assert.match(safeUrl, /^https:\/\/calendly\.com\/lawyer\/consultation/);
  assert.match(safeUrl, /utm_source=nesti_public_profile/);
  assert.equal(buildTrackedCalendlyUrl('javascript:alert(1)', profile), '');
  assert.equal(buildTrackedCalendlyUrl('https://example.com/consultation', profile), '');
  assert.equal(buildTrackedCalendlyUrl('http://calendly.com/lawyer', profile), '');
});

test('published lawyer KPIs keep approved aggregates and reject seller fallbacks', async () => {
  const { resolveLawyerStandingItems } = await importSource(
    '../src/components/storefront/renderers/variants/lawyer/classic/lawyerCredentialMetrics.js',
  );
  const items = resolveLawyerStandingItems({
    professional_profile: { experience: '12 years' },
    professional_credential_metrics: {
      active_pipeline_value: 2750000,
      total_clients: 18,
      closed_cases: 7,
      currency: 'CAD',
    },
    seller_credential_metrics: {
      active_pipeline_value: 999999999,
      total_clients: 999,
      closed_cases: 999,
    },
  });
  assert.deepEqual(items.map((item) => item.kind), ['pipeline', 'experience', 'clients', 'cases']);
  assert.match(items[0].value, /2\.8M/);
  assert.equal(items[1].value, '12 years');
  assert.equal(items[2].value, '18');
  assert.equal(items[3].value, '7');

  const unavailable = resolveLawyerStandingItems({
    seller_credential_metrics: {
      active_pipeline_value: 500000,
      total_clients: 5,
      closed_cases: 3,
    },
  });
  assert.deepEqual(unavailable.map((item) => item.value), ['—', '—', '—', '—']);
});

test('deleted public pages cannot render a generated storefront fallback', async () => {
  const [page, client] = await Promise.all([
    readSource('../src/app/p/[slug]/page.js'),
    readSource('../src/lib/publicProfileClient.js'),
  ]);
  assert.match(page, /if \(!published\) \{\s*notFound\(\)/);
  assert.match(client, /getPublicProfile[\s\S]*cache: 'no-store'/);
});

test('autosave revisions are tracked per template and conflicts stop retry loops', async () => {
  const [builder, editor, client] = await Promise.all([
    readSource('../src/components/dashboard/public-profile/usePublicProfileBuilder.js'),
    readSource('../src/components/dashboard/public-profile/useStorefrontEditorState.js'),
    readSource('../src/lib/publicProfileClient.js'),
  ]);
  assert.match(builder, /draftRevisionsRef/);
  assert.match(builder, /draftRevisionsRef\.current\[draft\?\.template\?\.id\]/);
  assert.match(builder, /const nextRevisions = \{\}/);
  assert.match(builder, /draftRevisionsRef\.current = \{\}/);
  assert.match(editor, /revisionConflictRef\.current = true/);
  assert.match(editor, /if \(revisionConflictRef\.current\) return undefined/);
  assert.match(editor, /if \(storefrontDraftFetching\) return undefined/);
  assert.match(client, /getStorefrontDraft[\s\S]*?cache: 'no-store'/);
});
