import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function importSource(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

async function readSource(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), 'utf8');
}

const {
  lawyerContentSource,
  lawyerContentValue,
} = await importSource(
  '../src/components/storefront/renderers/variants/lawyer/shared/lawyerContentSemantics.js',
);
const { shouldSeedStorefrontContentField } = await importSource(
  '../src/components/storefront/templates/shared/contentSemantics.js',
);
const {
  FIRST_HOME_IMAGE_FILTERS,
  firstHomeImageFilter,
} = await importSource(
  '../src/components/storefront/renderers/variants/lawyer/shared/firstHomeImageStyle.js',
);
const { createInlineEditingHandlers } = await importSource(
  '../src/components/storefront/renderers/runtime/storefrontInlineEditing.js',
);

test('lawyer templates distinguish missing text from intentionally blank text', () => {
  ['lawyer-classic', 'lawyer-first-home-closing'].forEach((templateKey) => {
    assert.equal(shouldSeedStorefrontContentField({}, 'heading', templateKey), true);
    assert.equal(shouldSeedStorefrontContentField({ heading: null }, 'heading', templateKey), true);
    assert.equal(shouldSeedStorefrontContentField({ heading: '' }, 'heading', templateKey), false);
    assert.equal(shouldSeedStorefrontContentField({ heading: 'Custom' }, 'heading', templateKey), false);
  });

  assert.equal(lawyerContentValue({}, 'heading', 'Fallback'), 'Fallback');
  assert.equal(lawyerContentValue({ heading: null }, 'heading', 'Fallback'), 'Fallback');
  assert.equal(lawyerContentValue({ heading: '' }, 'heading', 'Fallback'), '');
  assert.equal(lawyerContentSource({}, 'heading'), 'fallback');
  assert.equal(lawyerContentSource({ heading: null }, 'heading'), 'fallback');
  assert.equal(lawyerContentSource({ heading: '' }, 'heading'), 'persisted');
});

test('non-lawyer templates retain their existing fallback hydration behavior', () => {
  assert.equal(shouldSeedStorefrontContentField({ heading: '' }, 'heading', 'agent-classic'), true);
  assert.equal(shouldSeedStorefrontContentField({ heading: 'Custom' }, 'heading', 'agent-classic'), false);
});

test('inline editing persists an intentionally blank value', () => {
  const changes = [];
  const transientInputs = [];
  const target = {
    textContent: '',
    contentEditable: 'true',
    spellcheck: true,
    dataset: {
      storefrontField: 'content.heading',
      storefrontOriginalValue: 'Original heading',
      storefrontOriginalHtml: 'Original heading',
    },
    classList: { remove() {} },
    matches: () => true,
  };
  const handlers = createInlineEditingHandlers({
    preview: true,
    block: { id: 'hero-1' },
    onInlineContentInput: (value) => transientInputs.push(value),
    onInlineContentChange: (change) => changes.push(change),
  });

  handlers.onBlur({ target });

  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0], {
    blockId: 'hero-1',
    field: 'content.heading',
    collection: undefined,
    itemId: undefined,
    itemIndex: undefined,
    itemField: undefined,
    instance: undefined,
    value: '',
  });
  assert.equal(transientInputs.at(-1), null);
});

test('First Home exposes a distinct visible filter for every image treatment', () => {
  const filters = Object.entries(FIRST_HOME_IMAGE_FILTERS);
  assert.deepEqual(filters.map(([key]) => key).sort(), ['bold', 'editorial', 'minimal', 'warm']);
  assert.equal(new Set(filters.map(([, value]) => value)).size, filters.length);
  filters.forEach(([imageStyle, filter]) => {
    assert.equal(firstHomeImageFilter({
      storefront_template_key: 'lawyer-first-home-closing',
      storefront_image_style: imageStyle,
    }), filter);
  });
  assert.equal(firstHomeImageFilter({
    storefront_template_key: 'lawyer-classic',
    storefront_image_style: 'bold',
  }), undefined);
  assert.equal(firstHomeImageFilter({
    storefront_template_key: 'lawyer-first-home-closing',
    storefront_image_style: 'unknown',
  }), FIRST_HOME_IMAGE_FILTERS.editorial);
});

test('First Home image treatment is wired through control, preview, and draft serialization', async () => {
  const [settings, workspace, serialization, presets] = await Promise.all([
    readSource('../src/components/storefront/builder/BuilderPageSettings.jsx'),
    readSource('../src/components/storefront/builder/StorefrontBuilderWorkspace.jsx'),
    readSource('../src/components/dashboard/public-profile/storefrontBuilderUtils.js'),
    readSource('../src/components/storefront/storefrontPresets.js'),
  ]);

  ['editorial', 'warm', 'minimal', 'bold'].forEach((value) => {
    assert.match(settings, new RegExp(`value: '${value}'`));
  });
  assert.match(settings, /onChange=\{\(image_style\) => onChange\(\{ image_style \}\)\}/);
  assert.match(workspace, /storefront_image_style: brandKit\.image_style \|\| 'editorial'/);
  assert.match(serialization, /image_style: editorData\.brand_kit\.image_style \|\| null/);
  assert.match(
    presets,
    /&& \['community expert', 'real estate expert'\]\.includes\(normalized\(content\.eyebrow\)\)/,
  );
  assert.doesNotMatch(presets, /\['', 'community expert', 'real estate expert'\]/);
});
