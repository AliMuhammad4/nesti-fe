function segments(path = '') {
  return String(path)
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function readContentPath(content = {}, path = '') {
  return segments(path).reduce(
    (value, part) => (value && typeof value === 'object' ? value[part] : undefined),
    content,
  );
}

export function patchContentPath(content = {}, path = '', value) {
  const parts = segments(path);
  if (!parts.length) return {};
  if (parts.length === 1) return { [parts[0]]: value };

  const rootKey = parts[0];
  const root = content?.[rootKey] && typeof content[rootKey] === 'object'
    ? { ...content[rootKey] }
    : {};
  let cursor = root;
  parts.slice(1, -1).forEach((part) => {
    cursor[part] = cursor[part] && typeof cursor[part] === 'object'
      ? { ...cursor[part] }
      : {};
    cursor = cursor[part];
  });
  cursor[parts.at(-1)] = value;
  return { [rootKey]: root };
}
