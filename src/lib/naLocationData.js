const METRO_REGIONS = [
  "Greater Toronto Area (GTA)",
  "National Capital Region",
  "Metro Vancouver",
  "Greater Los Angeles",
  "Bay Area",
  "Dallas-Fort Worth",
  "South Florida",
  "Pacific Northwest",
  "New England",
  "New York Metro",
  "Southern Ontario",
  "Northern Ontario",
];

const MAJOR_CITY_IDS = new Set([
  "toronto|CA",
  "montreal|CA",
  "vancouver|CA",
  "calgary|CA",
  "edmonton|CA",
  "ottawa|CA",
  "mississauga|CA",
  "karachi|PK",
  "lahore|PK",
  "islamabad|PK",
  "new york city|US",
  "los angeles|US",
  "chicago|US",
  "houston|US",
  "london|GB",
  "paris|FR",
  "dubai|AE",
  "singapore|SG",
  "sydney|AU",
  "mumbai|IN",
  "delhi|IN",
  "tokyo|JP",
  "berlin|DE",
  "madrid|ES",
  "rome|IT",
]);

let loadPromise = null;
let citiesCache = null;
let statesCache = null;
let countryByCodeCache = null;
let stateByIdCache = null;
let cityPrefixIndexCache = null;

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function compactKey(value) {
  return normalizeKey(value).replace(/[^a-z0-9]/g, "");
}

function buildCityLabel(city, stateById, countryByCode) {
  const state = stateById[city.state_id];
  const country = countryByCode[city.country_code] || city.country_code;
  const region = state?.name || city.state_code || "";
  return region ? `${city.name}, ${region}, ${country}` : `${city.name}, ${country}`;
}

function buildStateLabel(state, countryByCode) {
  const country = countryByCode[state.country_code] || state.country_code;
  return `${state.name}, ${country}`;
}

export function formatCityLabel(city) {
  if (city.label) return city.label;
  if (!stateByIdCache || !countryByCodeCache) return `${city.name}, ${city.state_code || city.country_code}`;
  return buildCityLabel(city, stateByIdCache, countryByCodeCache);
}

export function formatStateLabel(state) {
  if (!countryByCodeCache) return state.name;
  return buildStateLabel(state, countryByCodeCache);
}

function rankMatch(text, query, compactQuery = "") {
  const normalized = normalizeKey(text);
  if (!normalized || !query) return -1;
  if (normalized === query) return 0;
  if (normalized.startsWith(query)) return 1;
  if (normalized.includes(query)) return 2;

  const compactText = compactKey(text);
  if (!compactQuery || !compactText) return -1;
  if (compactText === compactQuery) return 0;
  if (compactText.startsWith(compactQuery)) return 1;
  if (compactText.includes(compactQuery)) return 2;
  return -1;
}

function enrichCity(city, stateById, countryByCode) {
  const label = buildCityLabel(city, stateById, countryByCode);
  return {
    ...city,
    label,
    compactName: compactKey(city.name),
    compactLabel: compactKey(label),
  };
}

function buildCityPrefixIndex(cities) {
  const index = new Map();
  for (const city of cities) {
    const prefix = city.compactName.slice(0, 2);
    if (!prefix) continue;
    if (!index.has(prefix)) index.set(prefix, []);
    index.get(prefix).push(city);
  }
  return index;
}

function getCityCandidates(cities, cityPrefixIndex, query) {
  const compactQuery = compactKey(query);
  if (!compactQuery) return [];

  const prefix = compactQuery.slice(0, 2);
  const bucket = cityPrefixIndex.get(prefix) || [];
  if (bucket.length) return bucket;

  const firstChar = compactQuery[0];
  if (!firstChar) return [];
  return cities.filter((city) => city.compactName.startsWith(firstChar));
}

function scoreCityEntry(city, query) {
  const compactQuery = compactKey(query);
  const rankCandidates = [
    rankMatch(city.name, query, compactQuery),
    rankMatch(city.label, query, compactQuery),
    rankMatch(city.compactName, query, compactQuery),
    rankMatch(city.compactLabel, query, compactQuery),
  ];
  let rank = rankCandidates.filter((value) => value >= 0).sort((a, b) => a - b)[0] ?? -1;
  if (rank < 0) return null;

  const noisyName =
    /\b(county|parish|township|district|cdp|unorganized)\b/i.test(city.name) &&
    !/\b(county|parish|township|district|cdp|unorganized)\b/i.test(query);
  if (noisyName) rank += 3;

  const majorId = `${normalizeKey(city.name)}|${city.country_code}`;
  const isMajor = MAJOR_CITY_IDS.has(majorId);
  const majorBoost = isMajor ? -0.5 : 0;

  if (
    compactKey(city.name) === compactQuery &&
    city.name.length <= compactQuery.length + 1 &&
    !isMajor
  ) {
    rank += 2;
  }

  return { label: city.label, rank: rank + majorBoost, nameLength: city.name.length, isMajor };
}

export async function loadNaLocationData() {
  if (citiesCache && statesCache && countryByCodeCache && cityPrefixIndexCache) {
    return {
      cities: citiesCache,
      states: statesCache,
      metroRegions: METRO_REGIONS,
      cityPrefixIndex: cityPrefixIndexCache,
    };
  }

  if (!loadPromise) {
    loadPromise = Promise.all([
      import("countries-states-cities-service/cities"),
      import("countries-states-cities-service/states"),
      import("countries-states-cities-service/countries"),
    ]).then(([{ Cities }, { States }, { Countries }]) => {
      const countries = Countries.getCountries();
      countryByCodeCache = Object.fromEntries(countries.map((country) => [country.iso2, country.name]));

      const states = States.getStates({ sort: { mode: "alphabetical", key: "name" } });
      stateByIdCache = Object.fromEntries(states.map((state) => [state.id, state]));
      statesCache = states;

      const rawCities = Cities.getCities({ sort: { mode: "alphabetical", key: "name" } });
      citiesCache = rawCities.map((city) => enrichCity(city, stateByIdCache, countryByCodeCache));
      cityPrefixIndexCache = buildCityPrefixIndex(citiesCache);

      return {
        cities: citiesCache,
        states: statesCache,
        metroRegions: METRO_REGIONS,
        cityPrefixIndex: cityPrefixIndexCache,
      };
    });
  }

  return loadPromise;
}

export function searchCities(cities = [], query = "", limit = 8, cityPrefixIndex = null) {
  const normalizedQuery = normalizeKey(query);
  if (normalizedQuery.length < 2) return [];

  const candidates = cityPrefixIndex
    ? getCityCandidates(cities, cityPrefixIndex, normalizedQuery)
    : cities;

  const ranked = [];
  for (const city of candidates) {
    const scored = scoreCityEntry(city, normalizedQuery);
    if (scored) ranked.push(scored);
  }

  ranked.sort(
    (a, b) =>
      a.rank - b.rank ||
      Number(b.isMajor) - Number(a.isMajor) ||
      a.nameLength - b.nameLength ||
      a.label.localeCompare(b.label),
  );

  const seen = new Set();
  const results = [];
  for (const item of ranked) {
    const key = normalizeKey(item.label);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(item.label);
    if (results.length >= limit) break;
  }
  return results;
}

export function searchRegions(states = [], metroRegions = METRO_REGIONS, query = "", limit = 8) {
  const normalizedQuery = normalizeKey(query);
  const compactQuery = compactKey(query);
  if (normalizedQuery.length < 2) return [];

  const ranked = [];

  for (const state of states) {
    const label = formatStateLabel(state);
    const candidates = [state.name, state.state_code, label];
    let bestRank = -1;
    for (const candidate of candidates) {
      bestRank = Math.max(bestRank, rankMatch(candidate, normalizedQuery, compactQuery));
    }
    if (bestRank >= 0) ranked.push({ label, rank: bestRank });
  }

  for (const metro of metroRegions) {
    const bestRank = rankMatch(metro, normalizedQuery, compactQuery);
    if (bestRank >= 0) ranked.push({ label: metro, rank: bestRank + 1 });
  }

  ranked.sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label));

  const seen = new Set();
  const results = [];
  for (const item of ranked) {
    const key = normalizeKey(item.label);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(item.label);
    if (results.length >= limit) break;
  }
  return results;
}
