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
  NEWCOMER_BLOCK_ORDER,
  NEWCOMER_BRAND_DEFAULTS,
  NEWCOMER_BRAND_VERSION,
  NEWCOMER_DESIGN_VERSION,
  migrateLawyerNewcomerBlocks,
  migrateLawyerNewcomerBrandKit,
} = await importSource(
  '../src/components/storefront/templates/lawyer/newcomerMigration.js',
);
const {
  patchContentPath,
  readContentPath,
} = await importSource(
  '../src/components/storefront/builder/contentPath.js',
);

const block = ({
  type,
  id = `${type}-saved`,
  content = {},
  layout = {},
  style = {},
  enabled = true,
}) => ({
  id,
  type,
  data: {
    enabled,
    content,
    layout,
    style,
  },
});

const defaults = NEWCOMER_BLOCK_ORDER.map((type, index) => block({
  type,
  id: `${type}-${index + 1}`,
  content: {
    newcomer_design_version: NEWCOMER_DESIGN_VERSION,
    heading: `Default ${type}`,
  },
  layout: { columns: String((index % 3) + 1) },
  style: { background: index % 2 ? '#fff7ed' : '#f0fdf4' },
}));

test('nested builder content paths update credential labels without dotted dead keys', () => {
  const content = {
    metric_labels: {
      experience: 'Experience',
      clients: 'Clients',
    },
  };
  const patch = patchContentPath(content, 'metric_labels.experience', 'Years in practice');
  assert.deepEqual(patch, {
    metric_labels: {
      experience: 'Years in practice',
      clients: 'Clients',
    },
  });
  assert.equal(readContentPath({ ...content, ...patch }, 'metric_labels.experience'), 'Years in practice');
  assert.equal(Object.hasOwn(patch, 'metric_labels.experience'), false);
});

test('Newcomer palette migration replaces earlier defaults without changing custom colors', () => {
  const migrated = migrateLawyerNewcomerBrandKit('lawyer-newcomer', {
    primary_color: '#0f766e',
    accent_color: '#fb923c',
    page_background: '#ffffff',
    essentials: { retained: true },
  });
  assert.equal(migrated.primary_color, NEWCOMER_BRAND_DEFAULTS.primary_color);
  assert.equal(migrated.accent_color, NEWCOMER_BRAND_DEFAULTS.accent_color);
  assert.equal(migrated.page_background, NEWCOMER_BRAND_DEFAULTS.page_background);
  assert.equal(migrated.essentials.retained, true);
  assert.equal(
    migrated.essentials.lawyer_newcomer_brand_version,
    NEWCOMER_BRAND_VERSION,
  );

  const temporaryPalette = migrateLawyerNewcomerBrandKit('lawyer-newcomer', {
    primary_color: '#22324d',
    accent_color: '#c79a52',
    page_background: '#f7f4ed',
    essentials: { lawyer_newcomer_brand_version: 1 },
  });
  assert.equal(temporaryPalette.primary_color, NEWCOMER_BRAND_DEFAULTS.primary_color);
  assert.equal(temporaryPalette.accent_color, NEWCOMER_BRAND_DEFAULTS.accent_color);
  assert.equal(temporaryPalette.page_background, NEWCOMER_BRAND_DEFAULTS.page_background);

  const rejectedRedPalette = migrateLawyerNewcomerBrandKit('lawyer-newcomer', {
    primary_color: '#5a2747',
    accent_color: '#e07a5f',
    page_background: '#fff6f2',
    essentials: { lawyer_newcomer_brand_version: 2 },
  });
  assert.equal(rejectedRedPalette.primary_color, NEWCOMER_BRAND_DEFAULTS.primary_color);
  assert.equal(rejectedRedPalette.accent_color, NEWCOMER_BRAND_DEFAULTS.accent_color);
  assert.equal(rejectedRedPalette.page_background, NEWCOMER_BRAND_DEFAULTS.page_background);

  const rejectedIndigoPalette = migrateLawyerNewcomerBrandKit('lawyer-newcomer', {
    primary_color: '#493f73',
    accent_color: '#8ea4ff',
    page_background: '#f7f7ff',
    essentials: { lawyer_newcomer_brand_version: 3 },
  });
  assert.equal(rejectedIndigoPalette.primary_color, NEWCOMER_BRAND_DEFAULTS.primary_color);
  assert.equal(rejectedIndigoPalette.accent_color, NEWCOMER_BRAND_DEFAULTS.accent_color);
  assert.equal(rejectedIndigoPalette.page_background, NEWCOMER_BRAND_DEFAULTS.page_background);

  const lowContrastBluePalette = migrateLawyerNewcomerBrandKit('lawyer-newcomer', {
    primary_color: '#4b3a2f',
    accent_color: '#7ea7b8',
    page_background: '#faf6f0',
    essentials: { lawyer_newcomer_brand_version: 4 },
  });
  assert.equal(lowContrastBluePalette.accent_color, NEWCOMER_BRAND_DEFAULTS.accent_color);

  const custom = migrateLawyerNewcomerBrandKit('lawyer-newcomer', {
    primary_color: '#702963',
    accent_color: '#76a5af',
    page_background: '#f4f1f8',
  });
  assert.equal(custom.primary_color, '#702963');
  assert.equal(custom.accent_color, '#76a5af');
  assert.equal(custom.page_background, '#f4f1f8');
});

test('legacy five-layer Newcomer drafts gain only missing canonical layers', () => {
  const legacy = [
    block({
      type: 'hero',
      id: 'authored-hero',
      content: { heading: 'My family closes with confidence' },
      layout: { alignment: 'right', mediaPosition: 'background' },
      style: { background: '#123456', textColor: '#ffffff' },
      enabled: false,
    }),
    block({ type: 'guidance', id: 'shared-id', content: { heading: 'My guide' } }),
    block({ type: 'practice-areas', id: 'shared-id', content: { heading: 'My practice' } }),
    block({ type: 'testimonials', content: { heading: 'My stories' } }),
    block({ type: 'cta', content: { heading: 'My invitation' } }),
    block({ type: 'custom-html', content: { heading: 'Unsupported' } }),
  ];

  const migrated = migrateLawyerNewcomerBlocks(legacy, defaults);
  assert.deepEqual([...new Set(migrated.map((entry) => entry.type))], [
    'hero',
    'about',
    'services',
    'guidance',
    'practice-areas',
    'credentials',
    'testimonials',
    'cta',
    'footer',
  ]);
  assert.deepEqual(
    migrated
      .filter((entry) => ['hero', 'guidance', 'practice-areas', 'testimonials', 'cta'].includes(entry.type))
      .map((entry) => entry.type),
    ['hero', 'guidance', 'practice-areas', 'testimonials', 'cta'],
  );
  const hero = migrated.find((entry) => entry.type === 'hero');
  assert.equal(hero.id, 'authored-hero');
  assert.equal(hero.data.enabled, false);
  assert.equal(hero.data.content.heading, 'My family closes with confidence');
  assert.equal(hero.data.layout.alignment, 'right');
  assert.equal(hero.data.style.background, '#123456');
  assert.equal(hero.data.content.newcomer_design_version, NEWCOMER_DESIGN_VERSION);
  assert.equal(new Set(migrated.map((entry) => entry.id)).size, migrated.length);
  assert.equal(migrated.some((entry) => entry.type === 'custom-html'), false);
});

test('legacy default Newcomer scaffold returns to canonical layer order', () => {
  const legacyDefault = [
    block({ type: 'hero', id: 'hero-1', content: { heading: 'Hero' } }),
    block({ type: 'guidance', id: 'guidance-2', content: { heading: 'Guide' } }),
    block({ type: 'practice-areas', id: 'practice-areas-3', content: { heading: 'Practice' } }),
    block({ type: 'testimonials', id: 'testimonials-4', content: { heading: 'Stories' } }),
    block({ type: 'cta', id: 'cta-5', content: { heading: 'Contact' } }),
  ];

  assert.deepEqual(
    migrateLawyerNewcomerBlocks(legacyDefault, defaults).map((entry) => entry.type),
    NEWCOMER_BLOCK_ORDER,
  );
});

test('legacy Newcomer credentials migrate to four desktop columns', () => {
  const legacy = [
    block({
      type: 'credentials',
      id: 'credentials-saved',
      content: { newcomer_design_version: NEWCOMER_DESIGN_VERSION - 1 },
      layout: { columns: '3' },
    }),
  ];
  const migrated = migrateLawyerNewcomerBlocks(legacy, defaults);
  assert.equal(
    migrated.find((entry) => entry.type === 'credentials').data.layout.columns,
    '4',
  );

  const currentCustom = [
    block({
      type: 'credentials',
      id: 'credentials-custom',
      content: { newcomer_design_version: NEWCOMER_DESIGN_VERSION },
      layout: { columns: '3' },
    }),
  ];
  assert.equal(
    migrateLawyerNewcomerBlocks(currentCustom, defaults)
      .find((entry) => entry.type === 'credentials').data.layout.columns,
    '3',
  );
});

test('version-two Newcomer scaffolds receive missing collections and known empty copy', () => {
  const repairDefaults = defaults.map((entry) => {
    const content = { ...entry.data.content };
    if (entry.type === 'about') {
      Object.assign(content, {
        eyebrow: 'Your legal guide',
        heading: 'Closing guidance that feels clear',
        body: 'Understand each legal step before closing day.',
      });
    }
    if (entry.type === 'guidance') content.steps = [{ id: 'guide-default', title: 'Get ready' }];
    if (entry.type === 'practice-areas') content.items = [{ id: 'practice-default', title: 'Purchase closing' }];
    if (entry.type === 'footer') content.items = [{ id: 'footer-default', label: 'About', target: '#about' }];
    return { ...entry, data: { ...entry.data, content } };
  });
  const versionTwo = [
    block({
      type: 'hero',
      content: { heading: 'Keep this hero', newcomer_design_version: 2 },
    }),
    block({
      type: 'about',
      content: { heading: 'About', body: '', seller_about_layout_version: 2 },
    }),
    block({
      type: 'guidance',
      content: { heading: 'My guide' },
      style: { background: '#f0fdf4' },
    }),
    block({
      type: 'practice-areas',
      content: { heading: 'My practice' },
      style: { background: '#abcdef' },
    }),
    block({ type: 'footer', content: {} }),
  ];

  const migrated = migrateLawyerNewcomerBlocks(versionTwo, repairDefaults);
  assert.equal(migrated.find((entry) => entry.type === 'hero').data.content.heading, 'Keep this hero');
  assert.equal(
    migrated.find((entry) => entry.type === 'about').data.content.body,
    'Understand each legal step before closing day.',
  );
  assert.equal(migrated.find((entry) => entry.type === 'guidance').data.content.steps.length, 1);
  assert.equal(migrated.find((entry) => entry.type === 'practice-areas').data.content.items.length, 1);
  assert.equal(migrated.find((entry) => entry.type === 'footer').data.content.items.length, 1);
  assert.equal(migrated.find((entry) => entry.type === 'guidance').data.style.background, '');
  assert.equal(
    migrated.find((entry) => entry.type === 'practice-areas').data.style.background,
    '#abcdef',
  );
  assert.ok(migrated.every(
    (entry) => entry.data.content.newcomer_design_version === NEWCOMER_DESIGN_VERSION,
  ));
});

test('current Newcomer drafts preserve deletions, duplicates, and authored order', () => {
  const current = [
    block({
      type: 'services',
      id: 'duplicate-id',
      content: {
        newcomer_design_version: NEWCOMER_DESIGN_VERSION,
        heading: 'Services first',
      },
    }),
    block({ type: 'about', id: 'duplicate-id', content: { heading: 'About second' } }),
    block({ type: 'services', id: 'services-again', content: { heading: 'Another service layer' } }),
    block({ type: 'footer', content: { heading: 'Only what I kept' } }),
    block({ type: 'faq', content: { heading: 'Unsupported here' } }),
  ];

  const migrated = migrateLawyerNewcomerBlocks(current, defaults);
  assert.deepEqual(
    migrated.map((entry) => entry.type),
    ['services', 'about', 'services', 'footer'],
  );
  assert.equal(migrated[0].data.content.heading, 'Services first');
  assert.equal(migrated[1].data.content.heading, 'About second');
  assert.equal(new Set(migrated.map((entry) => entry.id)).size, migrated.length);
});

test('Newcomer migration is idempotent', () => {
  const once = migrateLawyerNewcomerBlocks([
    block({ type: 'hero', content: { heading: 'Keep me' } }),
    block({ type: 'guidance', content: { heading: 'Keep this too' } }),
  ], defaults);
  const twice = migrateLawyerNewcomerBlocks(once, defaults);
  assert.deepEqual(twice, once);
});

test('Newcomer template and integrations share the nine-layer contract', async () => {
  const [
    template,
    builderState,
    workspace,
    editor,
    clientPage,
    pageClient,
    serverPage,
    publishedStorefront,
    visualTreatments,
    presets,
  ] = await Promise.all([
    readSource('../src/components/storefront/templates/lawyer/newcomer.js'),
    readSource('../src/components/storefront/builder/storefrontBuilderState.js'),
    readSource('../src/components/storefront/builder/StorefrontBuilderWorkspace.jsx'),
    readSource('../src/components/dashboard/public-profile/useStorefrontEditorState.js'),
    readSource('../src/components/storefront/PublicStorefrontPage.jsx'),
    readSource('../src/components/storefront/PublicStorefrontPageClient.jsx'),
    readSource('../src/app/p/[slug]/page.js'),
    readSource('../src/lib/publishedStorefront.js'),
    readSource('../src/components/storefront/templates/visualTreatments.js'),
    readSource('../src/components/storefront/storefrontPresets.js'),
  ]);

  const templateOrder = [...template.matchAll(/block\(T\.([A-Z_]+)/g)]
    .map((match) => match[1]);
  assert.deepEqual(templateOrder, [
    'HERO',
    'ABOUT',
    'PRACTICE_AREAS',
    'SERVICES',
    'GUIDANCE',
    'CREDENTIALS',
    'TESTIMONIALS',
    'CTA',
    'FOOTER',
  ]);
  assert.match(template, /experience: 'story-warm'/);
  assert.match(template, /Closing support for newcomers/);
  assert.match(template, /Plain-language guidance on Canadian purchase closings, costs, and documents\./);
  assert.match(template, /NEWCOMER_BRAND_DEFAULTS\.primary_color/);
  assert.match(template, /NEWCOMER_BRAND_DEFAULTS\.accent_color/);
  assert.match(template, /NEWCOMER_BRAND_DEFAULTS\.page_background/);
  assert.match(template, /newcomer_design_version/);
  assert.match(builderState, /LAWYER_NEWCOMER_CANONICAL_BLOCK_ORDER/);
  assert.match(builderState, /key === 'lawyer-newcomer'/);
  assert.match(workspace, /migrateLawyerNewcomerBlocks/);
  assert.match(workspace, /'lawyer-newcomer',\s*\]\.includes\(templateKey\)/);
  assert.match(editor, /migrateLawyerNewcomerBlocks/);
  assert.match(editor, /migrateLawyerNewcomerBrandKit/);
  assert.match(editor, /brandMigrationApplied/);
  assert.match(editor, /needsLawyerNewcomerMigration/);
  assert.match(clientPage, /migrateLawyerNewcomerBlocks/);
  assert.match(pageClient, /alignHashTarget/);
  assert.match(pageClient, /headerHeight[\s\S]*-\s*16/);
  assert.match(serverPage, /canonicalPublishedStorefrontBlocks/);
  assert.match(publishedStorefront, /migrateLawyerNewcomerBlocks/);
  assert.match(publishedStorefront, /migrateLawyerNewcomerBrandKit/);
  assert.match(visualTreatments, /'lawyer-newcomer': \{\s*bg: ''/);
  assert.match(presets, /lawyer: 'lawyer-newcomer'/);
});
