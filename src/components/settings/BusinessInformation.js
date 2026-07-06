"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { useAppDispatch, useAppSelector } from "@/store";
import { useSaveBusinessInfo } from "@/hooks/useProfileApi";
import { setBusinessInfo } from "@/store/profileSlice";
import { PROFESSIONAL_WORKING_STYLE_OPTIONS, STANDARD_LANGUAGE_OPTIONS } from "@/lib/matchingTaxonomy";
import { toast } from "react-toastify";
import ServiceAreaPicker from "@/components/settings/ServiceAreaPicker";
import { dedupeServiceAreas } from "@/lib/serviceAreaUtils";

const CORE_SPECIALIZATION_OPTIONS = [
  "First-time home buyers",
  "First-time investors",
  "Move-up buyers",
  "Luxury clients",
  "Commercial clients",
  "Rental / leasing",
  "Credit-challenged buyers",
  "Newcomer / immigrant support",
  "High-net-worth clients",
  "Family home buyers",
  "Investor-focused deals",
  "Downsizers",
];

const WORKING_STYLE_OPTIONS = PROFESSIONAL_WORKING_STYLE_OPTIONS.map((option) => option.label);
const LANGUAGE_OPTIONS = STANDARD_LANGUAGE_OPTIONS.map((option) => option.label);
const MAX_LANGUAGES = 8;

const EXPERIENCE_OPTIONS = [
  { key: "junior", label: "Junior (0-2 years)" },
  { key: "mid", label: "Mid (3-7 years)" },
  { key: "senior", label: "Senior (7-15 years)" },
  { key: "elite", label: "Elite (15+ years)" },
];

const SPECIALTY_STRENGTH_OPTIONS = [
  "First-time buyer expert",
  "Investor strategy expert",
  "Luxury market expert",
  "Renovation / flip specialist",
  "Newcomer relocation expert",
  "Market analytics expert",
  "Negotiation specialist",
  "Financing-savvy advisor",
  "Family housing expert",
  "Commercial deal expert",
];

const PERSONALITY_TAG_OPTIONS = [
  "Friendly & warm",
  "Fast responder",
  "Analytical",
  "Calm & patient",
  "Direct & transactional",
  "Highly communicative",
  "Relationship builder",
  "High-energy closer",
];

const WORKING_STYLE_STRUCTURED_MAP = {
  "Educational advisor": "educational_advisor",
  "Fast deal closer": "fast_deal_closer",
  "Data-driven strategist": "data_driven",
  "Relationship-focused": "relationship_focused",
  "Investor-oriented": "investor_oriented",
};

function toSlugValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function chipClass(active, disabled = false) {
  return `min-h-8 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-tight transition ${
    active
      ? "border-primary bg-primary text-white shadow-sm"
      : "border-border bg-white text-text-heading hover:border-primary/40 hover:text-primary"
  } ${disabled && !active ? "cursor-not-allowed opacity-45" : ""}`;
}

function compactChipClass(active) {
  return `min-h-7 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight transition ${
    active
      ? "border-primary bg-primary text-white shadow-sm"
      : "border-border bg-white text-text-heading hover:border-primary/40 hover:text-primary"
  }`;
}

const compactInputClass =
  "w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] placeholder:text-text-muted/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/15";

function SectionCard({ title, helper, right, required, children }) {
  return (
    <section className="rounded-xl border border-border/80 bg-white p-3 shadow-sm shadow-black/[0.015]">
      <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-bold text-text-heading sm:text-sm">
            {title}
            {required ? <span className="text-red-500"> *</span> : null}
          </h3>
          {helper ? <p className="mt-0.5 text-[11px] leading-4 text-text-muted sm:text-xs">{helper}</p> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children, required = false, htmlFor, className = "" }) {
  return (
    <span className={`text-xs font-semibold text-text-heading ${className}`.trim()}>
      {htmlFor ? <label htmlFor={htmlFor}>{children}</label> : children}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
  );
}

function SingleSelectChips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={chipClass(value === option.key)}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const RESPONSE_TIME_OPTIONS = [
  { key: "1hour", label: "Under 1 hour" },
  { key: "sameday", label: "Same day" },
  { key: "24hours", label: "Within 24 hours" },
  { key: "48hours", label: "Within 48 hours" },
];

const AVAILABILITY_OPTIONS = [
  { key: "business", label: "Business hours" },
  { key: "extended", label: "Extended hours" },
  { key: "weekends", label: "Weekends" },
  { key: "247", label: "24/7" },
];

function validateBusinessForm({
  serviceAreaCities,
  serviceAreaRegions,
  experienceLevel,
  coreSpecializationTags,
  workingStyleTags,
  languagesSpoken,
}) {
  const errors = [];
  const hasServiceArea = serviceAreaRegions.length > 0 || serviceAreaCities.length > 0;
  if (!hasServiceArea) errors.push("Add at least one service area under Where do you work.");
  if (!experienceLevel) errors.push("Experience level is required.");
  if (!coreSpecializationTags.length) errors.push("Select at least one core specialization.");
  if (!workingStyleTags.length) errors.push("Select at least one working style.");
  if (!languagesSpoken.length) errors.push("Select at least one language.");
  return errors;
}

function ChipPicker({ options, selected, onToggle, max }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        const disabled = max ? selected.length >= max : false;
        return (
          <button
            key={option}
            type="button"
            className={chipClass(active, disabled)}
            disabled={disabled && !active}
            onClick={() => onToggle(option, max)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function removeLegacyLocationFallback(cities = [], location = "") {
  const normalizedLocation = String(location || "").trim().toLowerCase();
  if (!normalizedLocation || cities.length !== 1) return cities;
  return String(cities[0] || "").trim().toLowerCase() === normalizedLocation ? [] : cities;
}

function normalizeLanguageLabel(value) {
  const normalized = toSlugValue(value);
  return LANGUAGE_OPTIONS.find((option) => toSlugValue(option) === normalized) || value;
}

function normalizeLanguageForSave(value) {
  const normalized = toSlugValue(value);
  const match = STANDARD_LANGUAGE_OPTIONS.find(
    (option) => option.value === normalized || toSlugValue(option.label) === normalized,
  );
  return match?.value || normalized;
}

function normalizeLanguagesForSave(languages = []) {
  const seen = new Set();
  const result = [];
  for (const language of languages) {
    const value = normalizeLanguageForSave(language);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
    if (result.length >= MAX_LANGUAGES) break;
  }
  return result;
}

export default function BusinessInformation({ onSaveSuccess } = {}) {
  const dispatch = useAppDispatch();
  const storedBusiness = useAppSelector((state) => state.profile.businessInfo);
  const saveBusinessInfo = useSaveBusinessInfo();

  const [loading, setLoading] = useState(false);
  const [calendlyLink, setCalendlyLink] = useState("");
  const [otherLanguageText, setOtherLanguageText] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [availability, setAvailability] = useState("");
  const [awards, setAwards] = useState("");

  const [coreSpecializationTags, setCoreSpecializationTags] = useState([]);
  const [serviceAreaCities, setServiceAreaCities] = useState([]);
  const [serviceAreaRegions, setServiceAreaRegions] = useState([]);
  const [serviceAreaPrimaryZones, setServiceAreaPrimaryZones] = useState([]);
  const [workingStyleTags, setWorkingStyleTags] = useState([]);
  const [languagesSpoken, setLanguagesSpoken] = useState([]);
  const [specialtyStrengthTags, setSpecialtyStrengthTags] = useState([]);
  const [personalityStyleTags, setPersonalityStyleTags] = useState([]);

  const hasUserEditedRef = useRef(false);

  const hydrateFromStore = useCallback(() => {
    if (!storedBusiness) return;
    setCalendlyLink(storedBusiness.calendlyLink || "");
    setOtherLanguageText(storedBusiness.otherLanguageText || "");
    setExperienceLevel(storedBusiness.experienceLevel || "");
    setLicenseNumber(storedBusiness.licenseNumber || "");
    setResponseTime(storedBusiness.responseTime || "");
    setAvailability(storedBusiness.availability || "");
    setAwards(storedBusiness.awards || "");
    setCoreSpecializationTags(Array.isArray(storedBusiness.coreSpecializationTags) ? storedBusiness.coreSpecializationTags : []);
    const hydratedCities = Array.isArray(storedBusiness.serviceAreaCities)
      ? removeLegacyLocationFallback(storedBusiness.serviceAreaCities, storedBusiness.location)
      : [];
    const hydratedRegions = Array.isArray(storedBusiness.serviceAreaRegions) ? storedBusiness.serviceAreaRegions : [];
    const hydratedPriority = Array.isArray(storedBusiness.serviceAreaPrimaryZones)
      ? storedBusiness.serviceAreaPrimaryZones
      : [];
    const deduped = dedupeServiceAreas(hydratedCities, hydratedRegions, hydratedPriority);
    setServiceAreaCities(deduped.cities);
    setServiceAreaRegions(deduped.regions);
    setServiceAreaPrimaryZones(deduped.priorityCities);
    setWorkingStyleTags(Array.isArray(storedBusiness.workingStyleTags) ? storedBusiness.workingStyleTags : []);
    setLanguagesSpoken(
      Array.isArray(storedBusiness.languagesSpoken)
        ? storedBusiness.languagesSpoken.map(normalizeLanguageLabel).filter(Boolean).slice(0, MAX_LANGUAGES)
        : [],
    );
    setSpecialtyStrengthTags(Array.isArray(storedBusiness.specialtyStrengthTags) ? storedBusiness.specialtyStrengthTags : []);
    setPersonalityStyleTags(Array.isArray(storedBusiness.personalityStyleTags) ? storedBusiness.personalityStyleTags : []);
  }, [storedBusiness]);

  useEffect(() => {
    if (hasUserEditedRef.current) return;
    hydrateFromStore();
  }, [hydrateFromStore]);

  const toggleArrayValue = useCallback((setter) => (value, max = 0) => {
    hasUserEditedRef.current = true;
    setter((prev) => {
      if (prev.includes(value)) return prev.filter((item) => item !== value);
      if (max && prev.length >= max) return prev;
      return [...prev, value];
    });
  }, []);


  const primaryWorkingStyleStructured = useMemo(() => {
    const firstMapped = workingStyleTags.find((tag) => WORKING_STYLE_STRUCTURED_MAP[tag]);
    return firstMapped ? WORKING_STYLE_STRUCTURED_MAP[firstMapped] : "";
  }, [workingStyleTags]);

  const buildPayload = useCallback(() => {
    const normalizedLanguages = normalizeLanguagesForSave(languagesSpoken);
    const legacySpecializations = [...coreSpecializationTags, ...specialtyStrengthTags]
      .filter(Boolean)
      .slice(0, 10);
    const deduped = dedupeServiceAreas(serviceAreaCities, serviceAreaRegions, serviceAreaPrimaryZones);
    const effectivePrimaryZones = deduped.priorityCities.length ? deduped.priorityCities : deduped.cities;
    const effectiveSecondaryZones = deduped.cities.filter((city) => !effectivePrimaryZones.includes(city));

    return {
      calendly_link: calendlyLink || "",
      experience_level: experienceLevel || "",
      experience: experienceLevel || "",
      license_number: licenseNumber || "",
      response_time: responseTime || "",
      availability: availability || "",
      awards: awards || "",
      core_specialization_tags: coreSpecializationTags,
      specialty_strength_tags: specialtyStrengthTags,
      working_style_tags: workingStyleTags,
      working_style_structured: primaryWorkingStyleStructured || undefined,
      personality_style_tags: personalityStyleTags,
      personality_tag: personalityStyleTags[0] || "",
      languages_spoken: normalizedLanguages,
      other_language_text: otherLanguageText || "",
      service_area_cities: deduped.cities,
      service_area_regions: deduped.regions,
      service_area_primary_zones: effectivePrimaryZones,
      service_area_secondary_zones: effectiveSecondaryZones,
      target_neighborhoods: effectivePrimaryZones.join(", "),
      specializations: legacySpecializations,
    };
  }, [
    calendlyLink,
    coreSpecializationTags,
    experienceLevel,
    licenseNumber,
    responseTime,
    availability,
    awards,
    languagesSpoken,
    otherLanguageText,
    personalityStyleTags,
    primaryWorkingStyleStructured,
    serviceAreaCities,
    serviceAreaRegions,
    serviceAreaPrimaryZones,
    specialtyStrengthTags,
    workingStyleTags,
  ]);

  const handleServiceAreaChange = useCallback(({ cities, regions }) => {
    hasUserEditedRef.current = true;
    setServiceAreaCities(cities);
    setServiceAreaRegions(regions);
    setServiceAreaPrimaryZones([]);
  }, []);

  const persistToStore = useCallback(() => {
    const deduped = dedupeServiceAreas(serviceAreaCities, serviceAreaRegions, serviceAreaPrimaryZones);
    const effectivePrimaryZones = deduped.priorityCities.length ? deduped.priorityCities : deduped.cities;
    dispatch(
      setBusinessInfo({
        ...(storedBusiness || {}),
        calendlyLink,
        otherLanguageText,
        experienceLevel,
        licenseNumber,
        responseTime,
        availability,
        awards,
        coreSpecializationTags,
        serviceAreaCities: deduped.cities,
        serviceAreaRegions: deduped.regions,
        serviceAreaPrimaryZones: effectivePrimaryZones,
        serviceAreaSecondaryZones: deduped.cities.filter((city) => !effectivePrimaryZones.includes(city)),
        workingStyleTags,
        languagesSpoken,
        specialtyStrengthTags,
        personalityStyleTags,
      }),
    );
  }, [
    dispatch,
    storedBusiness,
    calendlyLink,
    otherLanguageText,
    experienceLevel,
    licenseNumber,
    responseTime,
    availability,
    awards,
    coreSpecializationTags,
    serviceAreaCities,
    serviceAreaRegions,
    serviceAreaPrimaryZones,
    workingStyleTags,
    languagesSpoken,
    specialtyStrengthTags,
    personalityStyleTags,
  ]);

  const handleSubmit = async () => {
    const errors = validateBusinessForm({
      serviceAreaCities,
      serviceAreaRegions,
      experienceLevel,
      coreSpecializationTags,
      workingStyleTags,
      languagesSpoken,
    });
    if (errors.length) {
      toast.error(errors[0]);
      return;
    }

    setLoading(true);
    hasUserEditedRef.current = true;
    try {
      await saveBusinessInfo.mutateAsync(buildPayload());
      persistToStore();
      hasUserEditedRef.current = false;
      await onSaveSuccess?.();
    } catch {
      /* surfaced by hook */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <h2 className="text-base font-bold text-text-heading">Business Information</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Complete each section below. Fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </div>

      <SectionCard
        title="Where do you work?"
        helper="Add provinces, states, or cities you serve clients in."
        required
        right={
          <span className="text-[10px] font-semibold text-text-muted">
            {serviceAreaRegions.length + serviceAreaCities.length}/30
          </span>
        }
      >
        <ServiceAreaPicker
          cities={serviceAreaCities}
          regions={serviceAreaRegions}
          onChange={handleServiceAreaChange}
          maxCities={15}
          maxRegions={15}
        />
      </SectionCard>

      <SectionCard
        title="Experience & credentials"
        required
      >
        <div className="space-y-2">
          <div>
            <FieldLabel required className="text-[11px]">
              Experience level
            </FieldLabel>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {EXPERIENCE_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={compactChipClass(experienceLevel === option.key)}
                  onClick={() => {
                    hasUserEditedRef.current = true;
                    setExperienceLevel(option.key);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-2 gap-y-1.5 sm:grid-cols-2">
            <label className="block space-y-0.5">
              <FieldLabel className="text-[11px] font-medium text-text-muted">License number</FieldLabel>
              <input
                value={licenseNumber}
                onChange={(e) => {
                  hasUserEditedRef.current = true;
                  setLicenseNumber(e.target.value);
                }}
                className={compactInputClass}
                placeholder="License #"
              />
            </label>
            <label className="block space-y-0.5">
              <FieldLabel className="text-[11px] font-medium text-text-muted">Awards & recognitions</FieldLabel>
              <input
                value={awards}
                onChange={(e) => {
                  hasUserEditedRef.current = true;
                  setAwards(e.target.value);
                }}
                className={compactInputClass}
                placeholder="Awards & certs"
              />
            </label>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Who do you help best?"
        helper="Core client types and specialty strengths."
        required
        right={
          <span className="text-[10px] font-semibold text-text-muted">
            {coreSpecializationTags.length}/5
          </span>
        }
      >
        <div className="space-y-4">
          <div>
            <FieldLabel required>Core specializations</FieldLabel>
            <div className="mt-2">
              <ChipPicker
                options={CORE_SPECIALIZATION_OPTIONS}
                selected={coreSpecializationTags}
                onToggle={toggleArrayValue(setCoreSpecializationTags)}
                max={5}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Specialty strengths</FieldLabel>
            <div className="mt-2">
              <ChipPicker
                options={SPECIALTY_STRENGTH_OPTIONS}
                selected={specialtyStrengthTags}
                onToggle={toggleArrayValue(setSpecialtyStrengthTags)}
                max={5}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-text-muted">
              Optional differentiators ({specialtyStrengthTags.length}/5)
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="How do you work?"
        helper="Working style and personality signals used for client matching."
        required
        right={
          <span className="text-[10px] font-semibold text-text-muted">{workingStyleTags.length}/5</span>
        }
      >
        <div className="space-y-4">
          <div>
            <FieldLabel required>Working style</FieldLabel>
            <div className="mt-2">
              <ChipPicker
                options={WORKING_STYLE_OPTIONS}
                selected={workingStyleTags}
                onToggle={toggleArrayValue(setWorkingStyleTags)}
                max={5}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Personality tags</FieldLabel>
            <div className="mt-2">
              <ChipPicker
                options={PERSONALITY_TAG_OPTIONS}
                selected={personalityStyleTags}
                onToggle={toggleArrayValue(setPersonalityStyleTags)}
                max={5}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-text-muted">
              Optional ({personalityStyleTags.length}/5)
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Client experience" helper="How quickly and when clients can reach you.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Typical response time</FieldLabel>
            <div className="mt-2">
              <SingleSelectChips
                options={RESPONSE_TIME_OPTIONS}
                value={responseTime}
                onChange={(value) => {
                  hasUserEditedRef.current = true;
                  setResponseTime(value);
                }}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Availability</FieldLabel>
            <div className="mt-2">
              <SingleSelectChips
                options={AVAILABILITY_OPTIONS}
                value={availability}
                onChange={(value) => {
                  hasUserEditedRef.current = true;
                  setAvailability(value);
                }}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Languages"
        helper="Languages you can use with clients."
        required
        right={
          <span className="text-[10px] font-semibold text-text-muted">
            {languagesSpoken.length}/{MAX_LANGUAGES}
          </span>
        }
      >
        <ChipPicker
          options={LANGUAGE_OPTIONS}
          selected={languagesSpoken}
          onToggle={toggleArrayValue(setLanguagesSpoken)}
          max={MAX_LANGUAGES}
        />
        {languagesSpoken.includes("Other") ? (
          <label className="mt-3 block space-y-1">
            <FieldLabel>Other language</FieldLabel>
            <input
              value={otherLanguageText}
              onChange={(e) => {
                hasUserEditedRef.current = true;
                setOtherLanguageText(e.target.value);
              }}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              placeholder="Type language name"
            />
          </label>
        ) : null}
      </SectionCard>

      <div className="mt-2 flex justify-end border-t border-border/80 pt-3">
        <SubmitButton
          loading={loading}
          onClick={handleSubmit}
          type="button"
          className="!h-auto w-full rounded-md bg-primary px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:brightness-95 sm:w-auto"
        >
          Save changes
        </SubmitButton>
      </div>
    </div>
  );
}
