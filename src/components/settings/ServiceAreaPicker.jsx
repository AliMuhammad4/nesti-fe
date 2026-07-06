"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadNaLocationData, searchCities, searchRegions } from "@/lib/naLocationData";
import {
  dedupeServiceAreas,
  isCitySuggestionBlocked,
} from "@/lib/serviceAreaUtils";

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function LocationChip({ label, onRemove }) {
  return (
    <button
      type="button"
      className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold leading-tight text-primary transition hover:bg-primary/15"
      onClick={onRemove}
      title="Remove"
    >
      <span className="truncate" title={label}>
        {label}
      </span>
      <span aria-hidden>×</span>
    </button>
  );
}

export default function ServiceAreaPicker({
  cities = [],
  regions = [],
  onChange,
  maxCities = 15,
  maxRegions = 15,
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState({ cities: [], states: [], metroRegions: [], cityPrefixIndex: null });
  const debounceRef = useRef(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    let active = true;
    loadNaLocationData()
      .then((data) => {
        if (active) {
          setDataset(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const selectedKeys = useMemo(() => {
    const keys = new Set();
    cities.forEach((item) => keys.add(normalizeKey(item)));
    regions.forEach((item) => keys.add(normalizeKey(item)));
    return keys;
  }, [cities, regions]);

  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim() || loading) return [];

    const cityResults = searchCities(dataset.cities, debouncedQuery, 6, dataset.cityPrefixIndex)
      .filter((label) => !selectedKeys.has(normalizeKey(label)))
      .filter((label) => !isCitySuggestionBlocked(label, regions))
      .map((label) => ({ type: "city", label }));

    const regionResults = searchRegions(dataset.states, dataset.metroRegions, debouncedQuery, 6)
      .filter((label) => !selectedKeys.has(normalizeKey(label)))
      .map((label) => ({ type: "region", label }));

    return [...regionResults, ...cityResults].slice(0, 8);
  }, [dataset, debouncedQuery, loading, regions, selectedKeys]);

  const emitChange = (next) => {
    onChange?.(dedupeServiceAreas(next.cities, next.regions, []));
  };

  const addLocation = (type, label) => {
    if (type === "region") {
      if (regions.length >= maxRegions) return;
      emitChange({ cities, regions: [...regions, label] });
    } else {
      if (cities.length >= maxCities) return;
      emitChange({ cities: [...cities, label], regions });
    }
    setQuery("");
    setDebouncedQuery("");
    setFocused(false);
  };

  const removeLocation = (item) => {
    if (regions.includes(item)) {
      emitChange({ cities, regions: regions.filter((entry) => entry !== item) });
    } else {
      emitChange({ cities: cities.filter((entry) => entry !== item), regions });
    }
  };

  const showPanel = focused && debouncedQuery.trim().length >= 2;
  const selectedLocations = [...regions, ...cities];

  return (
    <div className="space-y-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setFocused(false), 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setFocused(false);
          if (e.key === "Enter" && suggestions[0]) {
            e.preventDefault();
            addLocation(suggestions[0].type, suggestions[0].label);
          }
        }}
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-heading outline-none transition placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
        placeholder={loading ? "Loading locations..." : "Search city, province, state, or region"}
        disabled={loading}
      />

      {showPanel ? (
        <div className="rounded-lg border border-border bg-white p-2 shadow-sm">
          {suggestions.length ? (
            <>
              <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((option) => (
                  <button
                    key={`${option.type}-${option.label}`}
                    type="button"
                    className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold leading-tight text-text-heading transition hover:border-primary/40 hover:text-primary"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addLocation(option.type, option.label);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="px-1 text-[11px] text-text-muted">
              {loading ? "Loading location data..." : "No matches. Try a different spelling."}
            </p>
          )}
        </div>
      ) : null}

      {selectedLocations.length ? (
        <div className="flex flex-wrap gap-2 rounded-md border border-border/80 bg-white px-2.5 py-2">
          {selectedLocations.map((item) => (
            <LocationChip key={item} label={item} onRemove={() => removeLocation(item)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
