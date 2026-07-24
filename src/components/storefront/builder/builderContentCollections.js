import { STOREFRONT_BLOCK_TYPES } from '../storefrontPresets';

const parseListingLine = (line) => {
  const [title = '', price = '', address = '', bedrooms = '', bathrooms = '', square_footage = '', status = ''] = line.split('|').map((part) => part.trim());
  return {
    title,
    price,
    expected_price: price,
    address,
    location: address,
    bedrooms,
    bathrooms,
    square_footage,
    status,
    image_url: '',
    photos: [],
    images: [],
    property_type: '',
  };
};

const formatListingLine = (item = {}) => [
  item.title || '',
  item.price || item.expected_price || '',
  item.address || item.location || '',
  item.bedrooms || '',
  item.bathrooms || '',
  item.square_footage || '',
  item.status || '',
].filter(Boolean).join(' | ');

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
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [client_name = '', text = ''] = line.split('|').map((part) => part.trim());
        return { client_name, text, rating: 5 };
      })
      .filter((item) => item.client_name && item.text),
    format: (items) => (items || [])
      .map((item) => `${item.client_name || ''}${item.text ? ` | ${item.text}` : ''}`)
      .join('\n'),
    hint: 'One per line: Client Name | Testimonial',
  },
  [STOREFRONT_BLOCK_TYPES.MORTGAGE_PROGRAMS]: {
    label: 'Mortgage programs',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name = '', description = '', min_credit_score = '', down_payment_min = ''] = line.split('|').map((part) => part.trim());
        return { name, description, min_credit_score, down_payment_min };
      })
      .filter((item) => item.name),
    format: (items) => (items || [])
      .map((item) => [item.name, item.description, item.min_credit_score, item.down_payment_min].filter(Boolean).join(' | '))
      .join('\n'),
    hint: 'One per line: Name | Description | Min Credit | Down Payment',
  },
  [STOREFRONT_BLOCK_TYPES.PROPERTIES]: {
    label: 'Property cards',
    parse: (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean).map(parseListingLine).filter((item) => item.title || item.address || item.price),
    format: (items) => (items || []).map(formatListingLine).join('\n'),
    hint: 'One per line: Title | Price | Address | Beds | Baths | Sqft | Status',
  },
  [STOREFRONT_BLOCK_TYPES.FEATURED_LISTINGS]: {
    label: 'Featured listing cards',
    parse: (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean).map(parseListingLine).filter((item) => item.title || item.address || item.price),
    format: (items) => (items || []).map(formatListingLine).join('\n'),
    hint: 'One per line: Title | Price | Address | Beds | Baths | Sqft | Status',
  },
  [STOREFRONT_BLOCK_TYPES.TOP_LISTINGS]: {
    label: 'Top listing cards',
    parse: (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean).map(parseListingLine).filter((item) => item.title || item.address || item.price),
    format: (items) => (items || []).map(formatListingLine).join('\n'),
    hint: 'One per line: Title | Price | Address | Beds | Baths | Sqft | Status',
  },
  [STOREFRONT_BLOCK_TYPES.SOLD_LISTINGS]: {
    label: 'Sold listing cards',
    parse: (raw) => raw.split('\n').map((line) => line.trim()).filter(Boolean).map(parseListingLine).filter((item) => item.title || item.address || item.price),
    format: (items) => (items || []).map(formatListingLine).join('\n'),
    hint: 'One per line: Title | Price | Address | Beds | Baths | Sqft | Status',
  },
  [STOREFRONT_BLOCK_TYPES.PRACTICE_AREAS]: {
    label: 'Practice areas',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    format: (items) => (items || [])
      .map((item) => (typeof item === 'string' ? item : item?.title || ''))
      .filter(Boolean)
      .join('\n'),
    hint: 'One area per line',
  },
  [STOREFRONT_BLOCK_TYPES.CREDENTIALS]: {
    label: 'Credentials',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title = '', issuer = '', year = ''] = line.split('|').map((part) => part.trim());
        return { title, issuer, year: Number(year) || year };
      })
      .filter((item) => item.title),
    format: (items) => (items || [])
      .map((item) => [item.title, item.issuer, item.year].filter(Boolean).join(' | '))
      .join('\n'),
    hint: 'One per line: Title | Issuer | Year',
  },
  [STOREFRONT_BLOCK_TYPES.FOOTER]: {
    label: 'Footer navigation',
    parse: (raw) => raw.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label = '', target = ''] = line.split('|').map((part) => part.trim());
        return { label, target };
      })
      .filter((item) => item.label),
    format: (items) => (items || [])
      .map((item) => [item.label, item.target].filter(Boolean).join(' | '))
      .join('\n'),
    hint: 'One per line: Label | URL or #section',
  },
};

export { CONTENT_COLLECTIONS };
