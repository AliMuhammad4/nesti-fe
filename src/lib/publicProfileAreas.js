function normalizeAreaList(value) {
  const values = Array.isArray(value) ? value : String(value || '').split(/[,|]/);
  return values.map((item) => String(item || '').trim()).filter(Boolean);
}

export function resolvePublicProfileAreas(profile = {}, customAreas = []) {
  const professional = profile.professional_profile || {};
  const values = [
    ...normalizeAreaList(customAreas),
    ...normalizeAreaList(professional.target_neighborhoods),
    ...normalizeAreaList(professional.location),
  ];
  const seen = new Set();

  return values
    .filter((item) => {
      const key = item.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}
