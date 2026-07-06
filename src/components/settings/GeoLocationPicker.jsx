"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadNaLocationData, searchCities, searchRegions } from "@/lib/naLocationData";

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export default function GeoLocationPicker({
  mode = "city",
  selected = [],
  onToggle,
  onAdd,
  placeholder,
  max = 15,
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
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const selectedKeys = useMemo(() => new Set(selected.map(normalizeKey)), [selected]);

  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim() || loading) return [];
    const raw =
      mode === "city"
        ? searchCities(dataset.cities, debouncedQuery, 8, dataset.cityPrefixIndex)
        : searchRegions(dataset.states, dataset.metroRegions, debouncedQuery, 8);
    return raw.filter((label) => !selectedKeys.has(normalizeKey(label)));
  }, [dataset, debouncedQuery, loading, mode, selectedKeys]);

  const selectSuggestion = (value) => {
    onAdd(value, max);
    setQuery("");
    setDebouncedQuery("");
    setFocused(false);
  };

  const showPanel = focused && debouncedQuery.trim().length >= 2;

  return (
    <div className="space-y-1.5">
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
        {selected.map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary transition hover:bg-primary/15"
            onClick={() => onToggle(item, max)}
            title="Remove"
          >
            {item} ×
          </button>
        ))}
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
              selectSuggestion(suggestions[0]);
            }
          }}
          className="min-w-[11rem] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-text-heading outline-none placeholder:text-text-muted"
          placeholder={loading ? "Loading locations..." : placeholder}
          disabled={loading}
        />
      </div>

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
                    key={option}
                    type="button"
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-text-heading transition hover:border-primary/40 hover:text-primary"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(option);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="px-1 text-[11px] text-text-muted">
              {loading ? "Loading city and region data..." : "No matches. Try a different spelling."}
            </p>
          )}
        </div>
      ) : null}

      {!loading && !focused ? (
        <p className="text-[10px] text-text-muted">
          {mode === "region"
            ? "Type at least 2 characters to search states, provinces, and regions worldwide."
            : "Type at least 2 characters to search cities worldwide."}
        </p>
      ) : null}
    </div>
  );
}
