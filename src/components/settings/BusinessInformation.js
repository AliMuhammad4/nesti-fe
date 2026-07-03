"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import { useAppDispatch, useAppSelector } from "@/store";
import { useSaveBusinessInfo } from "@/hooks/useProfileApi";
import { setBusinessInfo } from "@/store/profileSlice";
import { PROFESSIONAL_WORKING_STYLE_OPTIONS, STANDARD_LANGUAGE_OPTIONS } from "@/lib/matchingTaxonomy";

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

const SERVICE_CITY_OPTIONS = [
  "Toronto",
  "Mississauga",
  "Brampton",
  "Oakville",
  "Vaughan",
  "Markham",
  "Richmond Hill",
  "Milton",
  "Burlington",
  "Hamilton",
];

const SERVICE_REGION_OPTIONS = [
  "GTA",
  "Durham",
  "York",
  "Peel",
  "Halton",
  "Waterloo",
  "Niagara",
  "Simcoe",
];

const WORKING_STYLE_OPTIONS = PROFESSIONAL_WORKING_STYLE_OPTIONS.map((option) => option.label);
const LANGUAGE_OPTIONS = STANDARD_LANGUAGE_OPTIONS.map((option) => option.label);

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
  return `min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold leading-tight transition sm:min-h-8 sm:text-[11px] ${
    active
      ? "border-primary bg-primary text-white shadow-sm"
      : "border-border bg-white text-text-heading hover:border-primary/40 hover:text-primary"
  } ${disabled && !active ? "cursor-not-allowed opacity-45" : ""}`;
}

function SectionCard({ title, helper, right, children }) {
  return (
    <section className="rounded-xl border border-border/80 bg-white p-3.5 sm:p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2 sm:mb-3.5">
        <div>
          <h3 className="text-[13px] font-bold text-text-heading sm:text-sm">{title}</h3>
          {helper ? <p className="mt-0.5 text-[11px] leading-4 text-text-muted sm:text-xs">{helper}</p> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </section>
  );
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

function MultiSelectDropdown({ options, selected, onAdd, onRemove, placeholder }) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-heading sm:w-auto"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="min-h-10 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
          onClick={() => {
            if (!value) return;
            onAdd(value);
            setValue("");
          }}
        >
          Add
        </button>
      </div>
      {selected.length ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <button
              key={item}
              type="button"
              className="min-h-9 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary"
              onClick={() => onRemove(item)}
              title="Remove"
            >
              {item} ×
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function BusinessInformation({ onSaveSuccess } = {}) {
  const dispatch = useAppDispatch();
  const storedBusiness = useAppSelector((state) => state.profile.businessInfo);
  const saveBusinessInfo = useSaveBusinessInfo();

  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [calendlyLink, setCalendlyLink] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [otherLanguageText, setOtherLanguageText] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const [coreSpecializationTags, setCoreSpecializationTags] = useState([]);
  const [serviceAreaCities, setServiceAreaCities] = useState([]);
  const [serviceAreaRegions, setServiceAreaRegions] = useState([]);
  const [serviceAreaPrimaryZones, setServiceAreaPrimaryZones] = useState([]);
  const [serviceAreaSecondaryZones, setServiceAreaSecondaryZones] = useState([]);
  const [workingStyleTags, setWorkingStyleTags] = useState([]);
  const [languagesSpoken, setLanguagesSpoken] = useState([]);
  const [specialtyStrengthTags, setSpecialtyStrengthTags] = useState([]);
  const [personalityStyleTags, setPersonalityStyleTags] = useState([]);

  const hasUserEditedRef = useRef(false);
  const autosaveTimerRef = useRef(null);
  const essentialRef = useRef({ companyName: "", website: "", location: "" });

  essentialRef.current = { companyName, website, location };

  const hydrateFromStore = useCallback(() => {
    if (!storedBusiness) return;
    setCompanyName(storedBusiness.companyName || "");
    setWebsite(storedBusiness.website || "");
    setLocation(storedBusiness.location || "");
    setCalendlyLink(storedBusiness.calendlyLink || "");
    setTestimonial(storedBusiness.testimonial || "");
    setOtherLanguageText(storedBusiness.otherLanguageText || "");
    setExperienceLevel(storedBusiness.experienceLevel || "");
    setCoreSpecializationTags(Array.isArray(storedBusiness.coreSpecializationTags) ? storedBusiness.coreSpecializationTags : []);
    setServiceAreaCities(Array.isArray(storedBusiness.serviceAreaCities) ? storedBusiness.serviceAreaCities : []);
    setServiceAreaRegions(Array.isArray(storedBusiness.serviceAreaRegions) ? storedBusiness.serviceAreaRegions : []);
    setServiceAreaPrimaryZones(Array.isArray(storedBusiness.serviceAreaPrimaryZones) ? storedBusiness.serviceAreaPrimaryZones : []);
    setServiceAreaSecondaryZones(Array.isArray(storedBusiness.serviceAreaSecondaryZones) ? storedBusiness.serviceAreaSecondaryZones : []);
    setWorkingStyleTags(Array.isArray(storedBusiness.workingStyleTags) ? storedBusiness.workingStyleTags : []);
    setLanguagesSpoken(Array.isArray(storedBusiness.languagesSpoken) ? storedBusiness.languagesSpoken : []);
    setSpecialtyStrengthTags(Array.isArray(storedBusiness.specialtyStrengthTags) ? storedBusiness.specialtyStrengthTags : []);
    setPersonalityStyleTags(Array.isArray(storedBusiness.personalityStyleTags) ? storedBusiness.personalityStyleTags : []);
  }, [storedBusiness]);

  useEffect(() => {
    if (hasUserEditedRef.current) return;
    hydrateFromStore();
  }, [hydrateFromStore]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  const toggleArrayValue = useCallback((setter) => (value, max = 0) => {
    hasUserEditedRef.current = true;
    setter((prev) => {
      if (prev.includes(value)) return prev.filter((item) => item !== value);
      if (max && prev.length >= max) return prev;
      return [...prev, value];
    });
  }, []);

  const scheduleEssentialAutosave = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(async () => {
      autosaveTimerRef.current = null;
      const current = essentialRef.current;
      try {
        await saveBusinessInfo.mutateAsync({
          company_name: String(current.companyName || "").trim(),
          website: current.website || "",
          location: current.location || "",
          silent: true,
        });
      } catch {
        /* surfaced by hook */
      }
    }, 650);
  }, [saveBusinessInfo]);

  const primaryWorkingStyleStructured = useMemo(() => {
    const firstMapped = workingStyleTags.find((tag) => WORKING_STYLE_STRUCTURED_MAP[tag]);
    return firstMapped ? WORKING_STYLE_STRUCTURED_MAP[firstMapped] : "";
  }, [workingStyleTags]);

  const buildPayload = useCallback(() => {
    const normalizedLanguages = languagesSpoken.map((lang) => toSlugValue(lang));
    const legacySpecializations = [...coreSpecializationTags, ...specialtyStrengthTags]
      .filter(Boolean)
      .slice(0, 10);

    return {
      company_name: String(companyName || "").trim(),
      website: website || "",
      location: location || "",
      calendly_link: calendlyLink || "",
      bio: testimonial || "",
      experience_level: experienceLevel || "",
      experience: experienceLevel || "",
      core_specialization_tags: coreSpecializationTags,
      specialty_strength_tags: specialtyStrengthTags,
      working_style_tags: workingStyleTags,
      working_style_structured: primaryWorkingStyleStructured || undefined,
      personality_style_tags: personalityStyleTags,
      personality_tag: personalityStyleTags[0] || "",
      languages_spoken: normalizedLanguages,
      other_language_text: otherLanguageText || "",
      service_area_cities: serviceAreaCities,
      service_area_regions: serviceAreaRegions,
      service_area_primary_zones: serviceAreaPrimaryZones,
      service_area_secondary_zones: serviceAreaSecondaryZones,
      target_neighborhoods: serviceAreaPrimaryZones.join(", "),
      specializations: legacySpecializations,
    };
  }, [
    calendlyLink,
    companyName,
    coreSpecializationTags,
    experienceLevel,
    languagesSpoken,
    location,
    otherLanguageText,
    personalityStyleTags,
    primaryWorkingStyleStructured,
    serviceAreaCities,
    serviceAreaPrimaryZones,
    serviceAreaRegions,
    serviceAreaSecondaryZones,
    specialtyStrengthTags,
    testimonial,
    website,
    workingStyleTags,
  ]);

  const persistToStore = useCallback(() => {
    dispatch(
      setBusinessInfo({
        ...(storedBusiness || {}),
        companyName,
        website,
        location,
        calendlyLink,
        testimonial,
        otherLanguageText,
        experienceLevel,
        coreSpecializationTags,
        serviceAreaCities,
        serviceAreaRegions,
        serviceAreaPrimaryZones,
        serviceAreaSecondaryZones,
        workingStyleTags,
        languagesSpoken,
        specialtyStrengthTags,
        personalityStyleTags,
      }),
    );
  }, [
    dispatch,
    storedBusiness,
    companyName,
    website,
    location,
    calendlyLink,
    testimonial,
    otherLanguageText,
    experienceLevel,
    coreSpecializationTags,
    serviceAreaCities,
    serviceAreaRegions,
    serviceAreaPrimaryZones,
    serviceAreaSecondaryZones,
    workingStyleTags,
    languagesSpoken,
    specialtyStrengthTags,
    personalityStyleTags,
  ]);

  const handleSubmit = async () => {
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
    <div className="w-full space-y-4 pb-20 sm:pb-16">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-text-heading">Business Information</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Complete your professional match profile in one fast guided flow.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
          7 profile groups
        </span>
      </div>

      <SectionCard title="Business essentials" helper="Public-facing essentials that stay in your profile.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-text-heading">Company / brokerage</span>
            <input
              value={companyName}
              onChange={(e) => {
                hasUserEditedRef.current = true;
                setCompanyName(e.target.value);
                scheduleEssentialAutosave();
              }}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              placeholder="Your company name"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-text-heading">Website</span>
            <input
              value={website}
              onChange={(e) => {
                hasUserEditedRef.current = true;
                setWebsite(e.target.value);
                scheduleEssentialAutosave();
              }}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              placeholder="https://example.com"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-text-heading">Primary location</span>
            <input
              value={location}
              onChange={(e) => {
                hasUserEditedRef.current = true;
                setLocation(e.target.value);
                scheduleEssentialAutosave();
              }}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              placeholder="City"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-text-heading">Calendly link</span>
            <input
              value={calendlyLink}
              onChange={(e) => {
                hasUserEditedRef.current = true;
                setCalendlyLink(e.target.value);
              }}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              placeholder="https://calendly.com/..."
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard
        title="1) Who do you help best?"
        helper="Core specialization tags (pick up to 5)."
        right={<span className="text-[10px] font-semibold text-text-muted">{coreSpecializationTags.length}/5</span>}
      >
        <ChipPicker
          options={CORE_SPECIALIZATION_OPTIONS}
          selected={coreSpecializationTags}
          onToggle={toggleArrayValue(setCoreSpecializationTags)}
          max={5}
        />
      </SectionCard>

      <SectionCard title="2) Where do you work?" helper="Set city/region coverage plus primary and secondary zones.">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-text-heading">Cities</p>
            <ChipPicker
              options={SERVICE_CITY_OPTIONS}
              selected={serviceAreaCities}
              onToggle={toggleArrayValue(setServiceAreaCities)}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-text-heading">Regions</p>
            <ChipPicker
              options={SERVICE_REGION_OPTIONS}
              selected={serviceAreaRegions}
              onToggle={toggleArrayValue(setServiceAreaRegions)}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-text-heading">Primary zones (strong match)</p>
            <ChipPicker
              options={SERVICE_CITY_OPTIONS}
              selected={serviceAreaPrimaryZones}
              onToggle={toggleArrayValue(setServiceAreaPrimaryZones)}
              max={8}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-text-heading">Secondary zones (soft match)</p>
            <ChipPicker
              options={SERVICE_CITY_OPTIONS}
              selected={serviceAreaSecondaryZones}
              onToggle={toggleArrayValue(setServiceAreaSecondaryZones)}
              max={12}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="3) How do you work?"
        helper="Working style tags (pick 3-5)."
        right={<span className="text-[10px] font-semibold text-text-muted">{workingStyleTags.length}/5</span>}
      >
        <ChipPicker
          options={WORKING_STYLE_OPTIONS}
          selected={workingStyleTags}
          onToggle={toggleArrayValue(setWorkingStyleTags)}
          max={5}
        />
      </SectionCard>

      <SectionCard title="4) Language system" helper="Use the standardized language list shared with clients.">
        <MultiSelectDropdown
          options={LANGUAGE_OPTIONS}
          selected={languagesSpoken}
          placeholder="Select language"
          onAdd={(value) => {
            hasUserEditedRef.current = true;
            setLanguagesSpoken((prev) => (prev.includes(value) ? prev : [...prev, value]));
          }}
          onRemove={(value) => {
            hasUserEditedRef.current = true;
            setLanguagesSpoken((prev) => prev.filter((item) => item !== value));
          }}
        />
        {languagesSpoken.includes("Other") ? (
          <label className="mt-2 block space-y-1">
            <span className="text-xs font-semibold text-text-heading">Other language</span>
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

      <SectionCard title="5) Experience level" helper="Used internally for ranking, not shown as public status.">
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={chipClass(experienceLevel === option.key)}
              onClick={() => {
                hasUserEditedRef.current = true;
                setExperienceLevel(option.key);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="6) Specialty strengths"
        helper="Differentiator tags (pick up to 5)."
        right={<span className="text-[10px] font-semibold text-text-muted">{specialtyStrengthTags.length}/5</span>}
      >
        <ChipPicker
          options={SPECIALTY_STRENGTH_OPTIONS}
          selected={specialtyStrengthTags}
          onToggle={toggleArrayValue(setSpecialtyStrengthTags)}
          max={5}
        />
      </SectionCard>

      <SectionCard
        title="7) Personality tags"
        helper="Soft ranking signals (pick up to 5)."
        right={<span className="text-[10px] font-semibold text-text-muted">{personalityStyleTags.length}/5</span>}
      >
        <ChipPicker
          options={PERSONALITY_TAG_OPTIONS}
          selected={personalityStyleTags}
          onToggle={toggleArrayValue(setPersonalityStyleTags)}
          max={5}
        />
      </SectionCard>

      <SectionCard title="Short profile story" helper="Optional short note for public profile context.">
        <textarea
          value={testimonial}
          onChange={(e) => {
            hasUserEditedRef.current = true;
            setTestimonial(e.target.value);
          }}
          rows={5}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
          placeholder="Share a short summary of how you help clients."
        />
      </SectionCard>

      <div className="sticky bottom-0 z-10 -mx-1 mt-2 border-t border-border/80 bg-white/95 px-1 pt-3 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <SubmitButton
          loading={loading}
          onClick={handleSubmit}
          type="button"
          className="!h-auto !w-full rounded-md bg-primary px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:brightness-95 sm:!w-auto"
        >
          Save changes
        </SubmitButton>
      </div>
    </div>
  );
}
