import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationSource = await readFile(
  new URL('../src/components/storefront/templates/lawyer/firstHomeMigration.js', import.meta.url),
  'utf8',
);
const {
  FIRST_HOME_DESIGN_VERSION,
  migrateLawyerFirstHomeBlocks,
} = await import(`data:text/javascript;base64,${Buffer.from(migrationSource).toString('base64')}`);

const block = (type, content = {}, layout = {}, style = {}) => ({
  id: `${type}-default`,
  type,
  data: {
    enabled: true,
    content,
    layout,
    style,
  },
});

const defaults = [
  block('hero', { first_home_design_version: FIRST_HOME_DESIGN_VERSION }, {
    padding: 'large',
    columns: '1',
  }, {
    background: '#111111',
    textColor: '#ffffff',
    radius: 'none',
    shadow: 'none',
  }),
  block('about', { heading: 'Default about' }),
  block('credentials', {
    eyebrow: 'Professional standing',
    heading: 'Your lawyer',
    body: 'Current practice activity and experience at a glance.',
  }),
  block('footer'),
];

test('pre-v3 migration preserves legacy flat layout and style fields', () => {
  const current = [{
    id: 'hero-existing',
    type: 'hero',
    content: { heading: 'Custom heading', first_home_design_version: 2 },
    layout: {
      padding: 'small',
      columns: '4',
      mediaPosition: 'right',
      animationType: 'zoom',
      animationDuration: 'slow',
      animationIntensity: 'strong',
    },
    style: {
      background: '#123456',
      textColor: '#abcdef',
      radius: 'large',
      shadow: 'medium',
    },
  }, {
    id: 'footer-existing',
    type: 'footer',
    data: { content: {}, layout: { padding: 'none' }, style: {} },
  }];

  const migrated = migrateLawyerFirstHomeBlocks(current, defaults);
  assert.deepEqual(migrated.map((entry) => entry.type), ['hero', 'footer']);
  const hero = migrated[0];
  assert.equal(hero.data.content.heading, 'Custom heading');
  assert.equal(hero.data.content.first_home_design_version, FIRST_HOME_DESIGN_VERSION);
  assert.deepEqual(hero.data.layout, {
    padding: 'small',
    columns: '4',
    mediaPosition: 'right',
    animationType: 'zoom',
    animationDuration: 'slow',
    animationIntensity: 'strong',
  });
  assert.deepEqual(hero.data.style, {
    background: '#123456',
    textColor: '#abcdef',
    radius: 'large',
    shadow: 'medium',
  });
});

test('version upgrades preserve deleted blocks and explicitly empty credentials', () => {
  const current = [
    block('hero', { first_home_design_version: 6 }),
    block('credentials', { items: [] }),
    block('footer'),
  ];
  const migrated = migrateLawyerFirstHomeBlocks(current, defaults);

  assert.deepEqual(migrated.map((entry) => entry.type), ['hero', 'credentials', 'footer']);
  assert.deepEqual(migrated[1].data.content.items, []);
  assert.equal(migrated[0].data.content.first_home_design_version, FIRST_HOME_DESIGN_VERSION);
});

test('legacy professional details normalize to the Classic KPI copy at the current version', () => {
  const legacyItems = [
    { title: 'Law society and licence', source: 'license' },
    { title: 'Jurisdiction served', source: 'jurisdiction' },
  ];
  [
    'Review licensing, jurisdiction, and practice information before deciding who should handle your closing.',
    'Review licensing, jurisdiction, language, and practice information before deciding who should handle your closing.',
  ].forEach((body) => {
    const current = [
      block('hero', { first_home_design_version: FIRST_HOME_DESIGN_VERSION }),
      block('credentials', {
        eyebrow: 'Professional standing',
        heading: 'Professional details you can verify',
        body,
        items: legacyItems,
      }),
      block('footer'),
    ];

    const migrated = migrateLawyerFirstHomeBlocks(current, defaults);
    assert.equal(migrated[1].data.content.heading, 'Your lawyer');
    assert.equal(
      migrated[1].data.content.body,
      'Current practice activity and experience at a glance.',
    );
    assert.deepEqual(migrated[1].data.content.items, legacyItems);
    assert.equal(migrated[0].data.content.first_home_design_version, FIRST_HOME_DESIGN_VERSION);
  });
});

