export function shouldSeedStorefrontContentField(content, key, templateKey = '') {
  return String(templateKey).startsWith('lawyer-')
    ? !Object.prototype.hasOwnProperty.call(content || {}, key) || content[key] == null
    : !content?.[key];
}
