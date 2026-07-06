function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function parseCityLabel(label) {
  const parts = String(label || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return {
      name: parts[0],
      region: parts[1],
      country: parts.slice(2).join(", "),
    };
  }
  if (parts.length === 2) {
    return { name: parts[0], region: "", country: parts[1] };
  }
  return { name: parts[0] || "", region: "", country: "" };
}

export function parseRegionLabel(label) {
  const parts = String(label || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { name: parts[0], country: parts.slice(1).join(", ") };
  }
  return { name: parts[0] || "", country: "" };
}

export function cityCoveredByRegion(cityLabel, regionLabel) {
  const city = parseCityLabel(cityLabel);
  const region = parseRegionLabel(regionLabel);
  if (!city.region || !region.name) return false;
  return (
    normalizeKey(city.region) === normalizeKey(region.name) &&
    normalizeKey(city.country) === normalizeKey(region.country)
  );
}

export function filterCitiesNotCoveredByRegions(cities = [], regions = []) {
  return cities.filter((city) => !regions.some((region) => cityCoveredByRegion(city, region)));
}

export function filterPriorityCities(priorityCities = [], cities = []) {
  const cityKeys = new Set(cities.map(normalizeKey));
  return priorityCities.filter((city) => cityKeys.has(normalizeKey(city)));
}

export function dedupeServiceAreas(cities = [], regions = [], priorityCities = []) {
  const nextCities = filterCitiesNotCoveredByRegions(cities, regions);
  const nextPriority = filterPriorityCities(priorityCities, nextCities);
  return {
    cities: nextCities,
    regions,
    priorityCities: nextPriority,
  };
}

export function isCitySuggestionBlocked(cityLabel, regions = []) {
  return regions.some((region) => cityCoveredByRegion(cityLabel, region));
}

export function getServiceAreaSummary(cities = [], regions = []) {
  const cityCount = cities.length;
  const regionCount = regions.length;
  if (!cityCount && !regionCount) return "Add provinces/states for broad coverage, or specific cities.";
  if (regionCount && !cityCount) {
    return `${regionCount} region${regionCount === 1 ? "" : "s"} selected. Specific cities in those regions are already covered.`;
  }
  if (cityCount && !regionCount) {
    return `${cityCount} cit${cityCount === 1 ? "y" : "ies"} selected.`;
  }
  return `${regionCount} region${regionCount === 1 ? "" : "s"} and ${cityCount} additional cit${cityCount === 1 ? "y" : "ies"}.`;
}
