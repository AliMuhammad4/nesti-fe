export function lawyerContentValue(content, key, fallback = '') {
  return Object.prototype.hasOwnProperty.call(content || {}, key) && content[key] != null
    ? String(content[key])
    : fallback;
}

export function lawyerContentSource(content, key) {
  return Object.prototype.hasOwnProperty.call(content || {}, key) && content[key] != null
    ? 'persisted'
    : 'fallback';
}
