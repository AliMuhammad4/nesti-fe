import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';
import { PRACTICE_AREA_LIMIT } from '../storefrontLimits';

function createCollectionItemId() {
  const randomId = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `item-${randomId}`;
}

function withStableItemIds(items, existingItems = [], identityKeys = []) {
  const existing = Array.isArray(existingItems) ? existingItems : [];
  const usedIds = new Set();

  return items.map((item, index) => {
    const identityMatch = existing.find((candidate) => (
      candidate
      && typeof candidate === 'object'
      && candidate.id
      && !usedIds.has(candidate.id)
      && identityKeys.some((key) => (
        item[key]
        && String(candidate[key] || '').trim().toLowerCase()
          === String(item[key]).trim().toLowerCase()
      ))
    ));
    const indexedMatch = existing[index]
      && typeof existing[index] === 'object'
      && existing[index].id
      && !usedIds.has(existing[index].id)
      ? existing[index]
      : null;
    const id = identityMatch?.id || indexedMatch?.id || createCollectionItemId();
    usedIds.add(id);
    return {
      ...(identityMatch || indexedMatch || {}),
      ...item,
      id,
    };
  });
}

function joinTuple(values) {
  const parts = values.map((value) => String(value ?? '').trim());
  while (parts.length && !parts[parts.length - 1]) parts.pop();
  return parts.join(' | ');
}

const CONTENT_COLLECTIONS = {
  [STOREFRONT_BLOCK_TYPES.SERVICES]: {
    label: 'Service cards',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title = '', description = ''] = line.split('|').map((part) => part.trim());
        return { title, description };
      })
      .filter((item) => item.title),
    format: (items) => (items || [])
      .map((item) => `${item.title || ''}${item.description ? ` | ${item.description}` : ''}`)
      .join('\n'),
    hint: 'One per line: Title | Description',
  },
  [STOREFRONT_BLOCK_TYPES.TESTIMONIALS]: {
    label: 'Client stories',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [client_name = '', text = ''] = line.split('|').map((part) => part.trim());
          return { client_name, text, rating: 5 };
        })
        .filter((item) => item.client_name && item.text)
        .slice(0, 8),
      existingItems,
      ['client_name'],
    ),
    format: (items) => (items || [])
      .map((item) => `${item.client_name || ''}${item.text ? ` | ${item.text}` : ''}`)
      .join('\n'),
    hint: 'One per line: Client Name | Testimonial. Publish only genuine feedback you have permission to share.',
  },
  [STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS]: {
    label: 'Mortgage programs',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = '', icon = ''] = line.split('|').map((part) => part.trim());
          return { title: title || '', name: title || '', description, icon };
        })
        .filter((item) => item.title)
        .slice(0, 12),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title || item?.name, item?.description, item?.icon]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Title | Description | Icon',
    maxItems: 12,
  },
  [STOREFRONT_BLOCK_TYPES.MORTGAGE_RATES]: {
    label: 'Mortgage rates',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', rate = '', description = ''] = line.split('|').map((part) => part.trim());
          return { title, rate, description };
        })
        .filter((item) => item.title)
        .slice(0, 8),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.rate, item?.description]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Title | Rate | Description',
    maxItems: 8,
  },
  [STOREFRONT_BLOCK_TYPES.LENDER_NETWORK]: {
    label: 'Banks & lenders',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', domainOrUrl = ''] = line.split('|').map((part) => part.trim());
          const domain = String(domainOrUrl || '')
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0]
            .split('?')[0]
            .split('#')[0];
          return {
            title,
            domain,
            website: domainOrUrl || domain,
            description: '',
          };
        })
        .filter((item) => item.title)
        .slice(0, 24),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.domain || item?.website]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Bank or lender name | Website',
    maxItems: 24,
  },
  [STOREFRONT_BLOCK_TYPES.BROKER_COMPENSATION]: {
    label: 'Compensation items',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = '', icon = ''] = line.split('|').map((part) => part.trim());
          return { title, description, icon };
        })
        .filter((item) => item.title)
        .slice(0, 8),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.description, item?.icon]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Title | Description | Icon',
    maxItems: 8,
  },
  [STOREFRONT_BLOCK_TYPES.ALTERNATIVE_LENDING]: {
    label: 'Alternative lending options',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = ''] = line.split('|').map((part) => part.trim());
          return { title, description };
        })
        .filter((item) => item.title)
        .slice(0, 12),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.description]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Title | Description',
    maxItems: 12,
  },
  [STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS]: {
    label: 'Practice areas',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = ''] = line.split('|').map((part) => part.trim());
          return { title, description };
        })
        .filter((item) => item.title)
        .slice(0, PRACTICE_AREA_LIMIT),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => (
        typeof item === 'string'
          ? item
          : joinTuple([item?.title, item?.description || item?.text])
      ))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Title | Description (maximum 6)',
    maxItems: PRACTICE_AREA_LIMIT,
  },
  [STOREFRONT_BLOCK_TYPES.WHO_WE_HELP]: {
    label: 'Who we help cards',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = ''] = line.split('|').map((part) => part.trim());
          return { title, description };
        })
        .filter((item) => item.title)
        .slice(0, 6),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.description || item?.text]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Title | Description (maximum 6)',
    maxItems: 6,
  },
  [STOREFRONT_BLOCK_TYPES.DOCUMENT_CHECKLIST]: {
    label: 'Document items',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = ''] = line.split('|').map((part) => part.trim());
          return { title, description };
        })
        .filter((item) => item.title)
        .slice(0, 8),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.description || item?.text]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Document | Why it helps (maximum 8)',
    maxItems: 8,
  },
  [STOREFRONT_BLOCK_TYPES.FEE_GUIDANCE]: {
    label: 'Fee explanation cards',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = ''] = line.split('|').map((part) => part.trim());
          return { title, description };
        })
        .filter((item) => item.title)
        .slice(0, 6),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.description || item?.text]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Title | Description (maximum 6)',
    maxItems: 6,
  },
  [STOREFRONT_BLOCK_TYPES.ENGAGEMENT_SCOPE]: {
    label: 'Engagement scope cards',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = ''] = line.split('|').map((part) => part.trim());
          return { title, description };
        })
        .filter((item) => item.title)
        .slice(0, 6),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.description || item?.text]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Scope | Explanation (maximum 6)',
    maxItems: 6,
  },
  [STOREFRONT_BLOCK_TYPES.PRACTICE_LOGISTICS]: {
    label: 'Service detail cards',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = ''] = line.split('|').map((part) => part.trim());
          return { title, description };
        })
        .filter((item) => item.title)
        .slice(0, 6),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.description || item?.text]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Service detail | Explanation (maximum 6)',
    maxItems: 6,
  },
  [STOREFRONT_BLOCK_TYPES.CONSULTATION_OPTIONS]: {
    label: 'Consultation options',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', description = '', cta_label = ''] = line.split('|').map((part) => part.trim());
          return { title, description, cta_label };
        })
        .filter((item) => item.title)
        .slice(0, 6),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.title, item?.description || item?.text, item?.cta_label]))
      .filter(Boolean)
      .join('\n'),
    hint: 'One per line: Title | Description | Button label (maximum 3)',
    maxItems: 3,
  },
  [STOREFRONT_BLOCK_TYPES.CREDENTIALS]: {
    label: 'Credentials',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [title = '', issuer = '', year = '', description = ''] = line.split('|').map((part) => part.trim());
          return {
            title,
            issuer,
            year: Number(year) || year,
            description,
          };
        })
        .filter((item) => item.title)
        .slice(0, 6),
      existingItems,
      ['title'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([
        item?.title,
        item?.issuer,
        item?.year,
        item?.description || item?.details,
      ]))
      .join('\n'),
    hint: 'One per line: Title | Issuer | Year | Description (maximum 6)',
    maxItems: 6,
  },
  [STOREFRONT_BLOCK_TYPES.SELLER_CREDENTIALS]: {
    label: 'Credentials and recognition',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title = '', issuer = ''] = line.split('|').map((part) => part.trim());
        const inferredSources = {
          'professional credentials': 'credentials',
          credentials: 'credentials',
          'market specialty': 'specialty',
          specialty: 'specialty',
          'local specialty': 'specialty',
          languages: 'languages',
          brokerage: 'company',
          recognition: 'awards',
          experience: 'years_experience',
          clients: 'total_clients',
          'total seller clients': 'total_clients',
          'active pipeline value': 'active_pipeline_value',
          'sold property value': 'total_sold_home_value',
        };
        return {
          title,
          issuer,
          ...(!issuer && inferredSources[title.toLowerCase()]
            ? { source: inferredSources[title.toLowerCase()] }
            : {}),
        };
      })
      .filter((item) => item.title),
    format: (items) => (items || [])
      .map((item) => [item.title, item.issuer].filter(Boolean).join(' | '))
      .join('\n'),
    hint: 'One per line: Credential title | Issuer or detail',
  },
  [STOREFRONT_BLOCK_TYPES.FOOTER]: {
    label: 'Footer navigation',
    parse: (raw, existingItems) => withStableItemIds(
      raw.split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label = '', target = ''] = line.split('|').map((part) => part.trim());
          return { label, target };
        })
        .filter((item) => item.label)
        .slice(0, 8),
      existingItems,
      ['label'],
    ),
    format: (items) => (items || [])
      .map((item) => joinTuple([item?.label, item?.target || item?.url]))
      .join('\n'),
    hint: 'One per line: Label | Target URL or #section (maximum 8)',
    maxItems: 8,
  },
};

export { CONTENT_COLLECTIONS };
