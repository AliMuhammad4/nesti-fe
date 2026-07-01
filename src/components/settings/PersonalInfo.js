"use client";

import { useEffect, useRef, useState } from "react";
import { User, Mail, Calendar, Pencil, ImageIcon, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import FormField from "@/components/auth/FormField";
import PhoneNumberField from "@/components/ui/PhoneNumberField";
import SubmitButton from "@/components/auth/SubmitButton";
import { validateEmailRequired } from "@/lib/emailUtils";
import { normalizePhoneForStorage, validatePhoneRequired } from "@/lib/phoneUtils";
import { useAppDispatch, useAppSelector } from "@/store";
import { useProfileQuery } from "@/hooks/useAuthApi";
import { useSavePersonalInfo, useUploadProfileMedia } from "@/hooks/useProfileApi";
import { setPersonalInfo } from "@/store/profileSlice";
import ChangePassword from "@/components/settings/ChangePassword";
import { apiClient, API_ENDPOINTS } from "@/lib/api";

function isValidCalendlyUrl(value) {
  const s = String(value || "").trim();
  if (!s) return true;
  try {
    const url = new URL(s);
    const host = String(url.hostname || "").toLowerCase();
    return host === "calendly.com" || host.endsWith(".calendly.com");
  } catch {
    return false;
  }
}

const MAX_PROFILE_IMAGE_BYTES = 16 * 1024 * 1024;
const MAX_PROFILE_IMAGE_MB = 16;

const validatePersonalInfo = (form) => {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";
  const emailError = validateEmailRequired(form.email);
  if (emailError) errors.email = emailError;
  const phoneError = validatePhoneRequired(form.phone);
  if (phoneError) errors.phone = phoneError;
  if (!isValidCalendlyUrl(form.calendlyUrl)) {
    errors.calendlyUrl = "Please enter a valid Calendly URL (https://calendly.com/...)";
  }
  return errors;
};

const TIMELINE_OPTIONS = [
  { value: "asap", label: "ASAP / within 1 month" },
  { value: "1-3 months", label: "1 - 3 months" },
  { value: "3-6 months", label: "3 - 6 months" },
  { value: "6-12 months", label: "6 - 12 months" },
  { value: "browsing", label: "Just browsing" },
];

const HOME_GOAL_OPTIONS = [
  { value: "first_time_buyer", label: "First-time Home Buyer" },
  { value: "first_time_investor", label: "First-time Investor" },
  { value: "move_up_buyer", label: "Move-up Buyer" },
  { value: "luxury_buyer", label: "Luxury Buyer" },
  { value: "commercial_investor", label: "Commercial Investor" },
  { value: "renting_leasing", label: "Renting / Leasing" },
];

const WORKING_STYLE_OPTIONS = [
  { value: "explains_clearly", label: "Explains everything clearly" },
  { value: "patient_supportive", label: "Patient & supportive" },
  { value: "fast_efficient", label: "Fast & efficient" },
  { value: "strong_negotiator", label: "Strong negotiator" },
  { value: "investment_focused", label: "Investment focused" },
  { value: "analytical", label: "Analytical" },
  { value: "friendly_approachable", label: "Friendly & approachable" },
  { value: "quick_responder", label: "Quick responder" },
  { value: "straight_to_point", label: "Straight to the point" },
];

const PRIORITY_TAG_OPTIONS = [
  { value: "best_deal", label: "Finding the best deal" },
  { value: "closing_quickly", label: "Closing quickly" },
  { value: "family_neighbourhoods", label: "Family-friendly neighbourhoods" },
  { value: "great_schools", label: "Great schools" },
  { value: "walkable_communities", label: "Walkable communities" },
  { value: "parks_nature", label: "Parks & nature" },
  { value: "transit_access", label: "Transit access" },
  { value: "rental_income", label: "Rental income potential" },
  { value: "long_term_investment", label: "Long-term investment" },
  { value: "new_construction", label: "New construction" },
  { value: "renovation_opportunities", label: "Renovation opportunities" },
  { value: "luxury_lifestyle", label: "Luxury lifestyle" },
  { value: "waterfront", label: "Waterfront properties" },
  { value: "downtown_living", label: "Downtown living" },
  { value: "pet_friendly", label: "Pet-friendly homes" },
  { value: "eco_friendly", label: "Eco-friendly homes" },
];

const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "punjabi", label: "Punjabi" },
  { value: "mandarin", label: "Mandarin" },
  { value: "arabic", label: "Arabic" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_PREFERENCE_OPTIONS = [
  { value: "beginner_friendly", label: "Beginner-friendly" },
  { value: "experienced", label: "Experienced" },
  { value: "top_producer", label: "Top Producer" },
  { value: "investor_specialist", label: "Investor Specialist" },
  { value: "luxury_expert", label: "Luxury Expert" },
];

const COMFORT_PREFERENCE_OPTIONS = [
  { value: "female_led", label: "Female-led advisory style" },
  { value: "multilingual", label: "Multilingual professionals" },
  { value: "community_focused", label: "Community-focused" },
  { value: "culturally_familiar", label: "Culturally familiar communication" },
  { value: "no_preference", label: "No preference" },
];

const BUDGET_MIN = 200000;
const BUDGET_MAX = 2500000;
const BUDGET_STEP = 25000;

const clientNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const clientString = (value) => String(value || "").trim();

function normalizeClientTimelineForLeadCapture(value) {
  const current = String(value || "").trim();
  const legacyMap = {
    "1_year": "6-12 months",
    "2_years": "browsing",
    "3_years": "browsing",
    "5_years": "browsing",
    exploring: "browsing",
  };
  return legacyMap[current] || current;
}

function formatBudget(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return "Select budget";
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  return `$${Math.round(n / 1000)}K`;
}

function SelectionCard({ selected, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-h-[2.55rem] overflow-hidden rounded-xl border px-3 py-2 text-left text-[11px] font-black transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-primary/45 bg-gradient-to-br from-primary/[0.14] to-emerald-50 text-primary-dark shadow-sm ring-1 ring-primary/15"
          : "border-slate-200 bg-white/90 text-text-heading shadow-[0_8px_22px_rgba(15,23,42,0.035)] hover:border-primary/25 hover:bg-white"
      }`}
    >
      <span className="relative z-[1] flex items-center justify-between gap-2">
        <span>{label}</span>
        {selected ? <CheckCircle2 size={15} className="shrink-0 text-primary" /> : null}
      </span>
      {selected ? <span className="absolute -right-7 -top-8 h-20 w-20 rounded-full bg-primary/10 blur-xl" /> : null}
    </button>
  );
}

function ChipButton({ selected, label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      className={`rounded-full border px-3 py-1.5 text-[10px] font-black transition duration-200 ${
        selected
          ? "border-primary bg-gradient-to-r from-primary to-emerald-500 text-white shadow-[0_8px_18px_rgba(22,163,74,0.18)]"
          : "border-slate-200 bg-white/90 text-text-body shadow-[0_6px_14px_rgba(15,23,42,0.035)] hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-sm"
      } ${disabled && !selected ? "cursor-not-allowed opacity-45" : ""}`}
    >
      {label}
    </button>
  );
}

function OnboardingSection({ title, helper, right, children, className = "" }) {
  return (
    <section className={`border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 ${className}`}>
      <div className="mb-2.5 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-[13px] font-black text-text-heading">{title}</h4>
          {helper ? <p className="mt-0.5 text-[11px] leading-4 text-text-muted">{helper}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function PersonalInfo({ onSaveSuccess } = {}) {
  const storedPersonal = useAppSelector((state) => state.profile.personalInfo);
  const authUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const profileQuery = useProfileQuery();
  const dispatch = useAppDispatch();
  const [focusedField, setFocusedField] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    calendlyUrl: "",
  });
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [clientForm, setClientForm] = useState({
    annual_income: "",
    employment_status: "",
    current_savings: "",
    monthly_savings: "",
    dream_home_price: "",
    home_goal: "",
    home_goals: [],
    preferred_location: "",
    preferred_locations: [],
    purchase_timeline: "",
    mortgage_status: "",
    realtor_status: "",
    viewing_readiness: "",
    offer_readiness: "",
    motivation_reason: "",
    living_situation: "",
    purchase_purpose: "",
    preferred_contact_method: "",
    best_time_to_contact: "",
    working_styles: [],
    priority_tags: [],
    languages: [],
    preferred_experience: "",
    comfort_preferences: [],
  });
  const [clientLoading, setClientLoading] = useState(false);
  const [clientSaving, setClientSaving] = useState(false);
  const clientAutosaveReadyRef = useRef(false);
  const savePersonalInfo = useSavePersonalInfo();
  const uploadMedia = useUploadProfileMedia();
  const authProvider = String(
    profileQuery.data?.user?.auth_provider ||
      profileQuery.data?.user?.authProvider ||
      authUser?.auth_provider ||
      authUser?.authProvider ||
      ""
  ).toLowerCase();
  const canChangePassword = authProvider !== "google";
  const isClient = String(profileQuery.data?.user?.role || authUser?.role || "").toLowerCase() === "client";

  useEffect(() => {
    if (storedPersonal) {
      setForm((prev) => ({
        ...prev,
        ...storedPersonal,
        calendlyUrl: storedPersonal.calendlyUrl || storedPersonal.calendalyUrl || "",
      }));
      if (storedPersonal.profileImage) {
        setProfileImage(storedPersonal.profileImage);
      }
      if (storedPersonal.coverImage) {
        setCoverImage(storedPersonal.coverImage);
      }
    }
  }, [storedPersonal]);

  useEffect(() => {
    if (!isClient || !token) return;

    let cancelled = false;
    async function loadClientProfile() {
      setClientLoading(true);
      try {
        const data = await apiClient({
          url: API_ENDPOINTS.client.profileMe,
          method: "GET",
          token,
        });
        const profile = data?.data || {};
        if (cancelled) return;
        setClientForm({
          annual_income: profile?.annual_income ?? "",
          employment_status: profile?.employment_status || "",
          current_savings: profile?.current_savings ?? "",
          monthly_savings: profile?.monthly_savings ?? "",
          dream_home_price: profile?.dream_home_price ?? "",
          home_goal: profile?.home_goal || "",
          home_goals: Array.isArray(profile?.home_goals)
            ? profile.home_goals
            : profile?.home_goal
              ? [profile.home_goal]
              : [],
          preferred_location: profile?.preferred_location || "",
          preferred_locations: Array.isArray(profile?.preferred_locations) ? profile.preferred_locations : [],
          purchase_timeline: normalizeClientTimelineForLeadCapture(profile?.purchase_timeline),
          mortgage_status: profile?.mortgage_status || "",
          realtor_status: profile?.realtor_status || "",
          viewing_readiness: profile?.viewing_readiness || "",
          offer_readiness: profile?.offer_readiness || "",
          motivation_reason: profile?.motivation_reason || "",
          living_situation: profile?.living_situation || "",
          purchase_purpose: profile?.purchase_purpose || "",
          preferred_contact_method: profile?.preferred_contact_method || "",
          best_time_to_contact: profile?.best_time_to_contact || "",
          working_styles: Array.isArray(profile?.working_styles) ? profile.working_styles : [],
          priority_tags: Array.isArray(profile?.priority_tags) ? profile.priority_tags : [],
          languages: Array.isArray(profile?.languages) ? profile.languages : [],
          preferred_experience: profile?.preferred_experience || "",
          comfort_preferences: Array.isArray(profile?.comfort_preferences) ? profile.comfort_preferences : [],
        });
        window.setTimeout(() => {
          clientAutosaveReadyRef.current = true;
        }, 0);
      } catch (error) {
        if (!cancelled) toast.error(error?.message || "Failed to load client details");
      } finally {
        if (!cancelled) setClientLoading(false);
      }
    }

    loadClientProfile();
    return () => {
      cancelled = true;
    };
  }, [isClient, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientForm((prev) => ({ ...prev, [name]: value }));
  };

  const setClientField = (name, value) => {
    setClientForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleClientArrayValue = (name, value, max = 12) => {
    setClientForm((prev) => {
      const current = Array.isArray(prev[name]) ? prev[name] : [];
      const exists = current.includes(value);
      const next = exists
        ? current.filter((item) => item !== value)
        : current.length >= max
          ? current
          : [...current, value];
      return { ...prev, [name]: next };
    });
  };

  const toggleHomeGoal = (value) => {
    setClientForm((prev) => {
      const current = Array.isArray(prev.home_goals)
        ? prev.home_goals
        : prev.home_goal
          ? [prev.home_goal]
          : [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        home_goals: next,
        home_goal: next[0] || "",
      };
    });
  };

  useEffect(() => {
    if (!isClient || !token || !clientAutosaveReadyRef.current) return;
    const timer = window.setTimeout(() => {
      const payload = {
        annual_income: clientNumberOrNull(clientForm.annual_income),
        employment_status: clientString(clientForm.employment_status),
        current_savings: clientNumberOrNull(clientForm.current_savings),
        monthly_savings: clientNumberOrNull(clientForm.monthly_savings),
        dream_home_price: clientNumberOrNull(clientForm.dream_home_price),
        home_goal: clientString(clientForm.home_goal),
        home_goals: Array.isArray(clientForm.home_goals) ? clientForm.home_goals : [],
        preferred_location: clientString(clientForm.preferred_location),
        preferred_locations: Array.isArray(clientForm.preferred_locations) ? clientForm.preferred_locations : [],
        purchase_timeline: clientString(clientForm.purchase_timeline),
        mortgage_status: clientString(clientForm.mortgage_status),
        realtor_status: clientString(clientForm.realtor_status),
        viewing_readiness: clientString(clientForm.viewing_readiness),
        offer_readiness: clientString(clientForm.offer_readiness),
        motivation_reason: clientString(clientForm.motivation_reason),
        living_situation: clientString(clientForm.living_situation),
        purchase_purpose: clientString(clientForm.purchase_purpose),
        preferred_contact_method: clientString(clientForm.preferred_contact_method),
        best_time_to_contact: clientString(clientForm.best_time_to_contact),
        working_styles: Array.isArray(clientForm.working_styles) ? clientForm.working_styles : [],
        priority_tags: Array.isArray(clientForm.priority_tags) ? clientForm.priority_tags : [],
        languages: Array.isArray(clientForm.languages) ? clientForm.languages : [],
        preferred_experience: clientString(clientForm.preferred_experience),
        comfort_preferences: Array.isArray(clientForm.comfort_preferences) ? clientForm.comfort_preferences : [],
      };
      apiClient({
        url: API_ENDPOINTS.client.profile,
        method: "PUT",
        data: payload,
        token,
      }).catch(() => {
        /* explicit Save still surfaces errors */
      });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [clientForm, isClient, token]);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const errors = validatePersonalInfo(form);
    if (Object.keys(errors).length) {
      Object.values(errors).forEach((msg) => toast.error(msg));
      return;
    }
    const payload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      full_name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      phone: normalizePhoneForStorage(form.phone),
      calendly_link: form.calendlyUrl.trim(),
    };
    if (profileImage && /^https?:\/\//i.test(String(profileImage))) {
      payload.profile_image = String(profileImage).trim();
    }
    if (coverImage && /^https?:\/\//i.test(String(coverImage))) {
      payload.cover_image = String(coverImage).trim();
    }

    setLoading(true);
    try {
      await savePersonalInfo.mutateAsync(payload);
      await onSaveSuccess?.();
    } catch {
      /* error surfaced via toast in useSavePersonalInfo hook */
    } finally {
      setLoading(false);
    }
  };

  const handleClientSettingsSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const errors = validatePersonalInfo(form);
    if (Object.keys(errors).length) {
      Object.values(errors).forEach((msg) => toast.error(msg));
      return;
    }

    const payload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      phone: normalizePhoneForStorage(form.phone),
      annual_income: clientNumberOrNull(clientForm.annual_income),
      employment_status: clientForm.employment_status,
      current_savings: clientNumberOrNull(clientForm.current_savings),
      monthly_savings: clientNumberOrNull(clientForm.monthly_savings),
      dream_home_price: clientNumberOrNull(clientForm.dream_home_price),
      home_goal: clientString(clientForm.home_goal),
      home_goals: Array.isArray(clientForm.home_goals) ? clientForm.home_goals : [],
      preferred_location: clientString(clientForm.preferred_location),
      preferred_locations: Array.isArray(clientForm.preferred_locations) ? clientForm.preferred_locations : [],
      purchase_timeline: clientForm.purchase_timeline,
      mortgage_status: clientString(clientForm.mortgage_status),
      realtor_status: clientString(clientForm.realtor_status),
      viewing_readiness: clientString(clientForm.viewing_readiness),
      offer_readiness: clientString(clientForm.offer_readiness),
      motivation_reason: clientString(clientForm.motivation_reason),
      living_situation: clientString(clientForm.living_situation),
      purchase_purpose: clientString(clientForm.purchase_purpose),
      preferred_contact_method: clientString(clientForm.preferred_contact_method),
      best_time_to_contact: clientString(clientForm.best_time_to_contact),
      working_styles: Array.isArray(clientForm.working_styles) ? clientForm.working_styles : [],
      priority_tags: Array.isArray(clientForm.priority_tags) ? clientForm.priority_tags : [],
      languages: Array.isArray(clientForm.languages) ? clientForm.languages : [],
      preferred_experience: clientString(clientForm.preferred_experience),
      comfort_preferences: Array.isArray(clientForm.comfort_preferences) ? clientForm.comfort_preferences : [],
    };

    const hasNegativeNumber = ["annual_income", "current_savings", "monthly_savings", "dream_home_price"].some(
      (key) => payload[key] !== null && payload[key] < 0
    );
    if (hasNegativeNumber) {
      toast.error("Financial values cannot be negative");
      return;
    }

    setLoading(true);
    setClientSaving(true);
    try {
      const data = await apiClient({
        url: API_ENDPOINTS.client.settings,
        method: "PUT",
        data: payload,
        token,
      });

      const savedUser = data?.user || {};
      const savedProfile = data?.data || {};

      dispatch(
        setPersonalInfo({
          firstName: savedUser?.first_name || payload.first_name,
          lastName: savedUser?.last_name || payload.last_name,
          email: savedUser?.email || form.email,
          phone: savedUser?.phone || payload.phone,
          profileImage,
          coverImage,
        })
      );
      setClientForm({
        annual_income: savedProfile?.annual_income ?? "",
        employment_status: savedProfile?.employment_status || "",
        current_savings: savedProfile?.current_savings ?? "",
        monthly_savings: savedProfile?.monthly_savings ?? "",
        dream_home_price: savedProfile?.dream_home_price ?? "",
        home_goal: savedProfile?.home_goal || "",
        home_goals: Array.isArray(savedProfile?.home_goals)
          ? savedProfile.home_goals
          : savedProfile?.home_goal
            ? [savedProfile.home_goal]
            : [],
        preferred_location: savedProfile?.preferred_location || "",
        preferred_locations: Array.isArray(savedProfile?.preferred_locations) ? savedProfile.preferred_locations : [],
        purchase_timeline: normalizeClientTimelineForLeadCapture(savedProfile?.purchase_timeline),
        mortgage_status: savedProfile?.mortgage_status || "",
        realtor_status: savedProfile?.realtor_status || "",
        viewing_readiness: savedProfile?.viewing_readiness || "",
        offer_readiness: savedProfile?.offer_readiness || "",
        motivation_reason: savedProfile?.motivation_reason || "",
        living_situation: savedProfile?.living_situation || "",
        purchase_purpose: savedProfile?.purchase_purpose || "",
        preferred_contact_method: savedProfile?.preferred_contact_method || "",
        best_time_to_contact: savedProfile?.best_time_to_contact || "",
        working_styles: Array.isArray(savedProfile?.working_styles) ? savedProfile.working_styles : [],
        priority_tags: Array.isArray(savedProfile?.priority_tags) ? savedProfile.priority_tags : [],
        languages: Array.isArray(savedProfile?.languages) ? savedProfile.languages : [],
        preferred_experience: savedProfile?.preferred_experience || "",
        comfort_preferences: Array.isArray(savedProfile?.comfort_preferences) ? savedProfile.comfort_preferences : [],
      });
      await onSaveSuccess?.();
      toast.success(data?.message || "Personal information updated successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to save personal information");
    } finally {
      setLoading(false);
      setClientSaving(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      toast.error(`Image must be under ${MAX_PROFILE_IMAGE_MB}MB.`);
      return;
    }
    try {
      const data = await uploadMedia.mutateAsync({ file, kind: "profile" });
      const url = data?.profile_image || data?.url || "";
      if (url) {
        setProfileImage(url);
        dispatch(setPersonalInfo({ profileImage: url }));
      }
    } catch {
      /* toast from hook */
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      toast.error(`Image must be under ${MAX_PROFILE_IMAGE_MB}MB.`);
      return;
    }
    try {
      const data = await uploadMedia.mutateAsync({ file, kind: "cover" });
      const url = data?.cover_image || data?.url || "";
      if (url) {
        setCoverImage(url);
        dispatch(setPersonalInfo({ coverImage: url }));
      }
    } catch {
      /* toast from hook */
    }
  };

  const displayName =
    [form.firstName, form.lastName].filter(Boolean).join(" ").trim() || "Your profile";
  const fieldSizeClass = isClient ? "!h-10 text-xs" : "!h-12 text-[13px]";
  const disabledFieldSizeClass = isClient
    ? "!h-10 bg-gray-100 text-xs cursor-not-allowed"
    : "!h-12 bg-gray-100 text-[13px] cursor-not-allowed";
  const detailsCardClass = isClient
    ? "overflow-hidden rounded-[1.6rem] border border-white/75 bg-gradient-to-br from-white via-white to-primary/[0.025] p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)] ring-1 ring-slate-100/80 sm:p-5"
    : "rounded-xl border border-border/60 bg-white p-4 shadow-sm sm:p-5";
  const detailsGridClass = isClient
    ? "mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-x-3 md:gap-y-2.5"
    : "mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-4 md:gap-y-3";

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold tracking-tight text-text-heading sm:text-xl">
        Personal information
      </h2>

      {/* Cover + profile card */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
        {/* Cover — fixed 16:5 aspect */}
        <div className="relative aspect-[16/5] w-full min-h-[8rem] sm:min-h-0">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-primary/10"
              aria-hidden
            />
          )}
          <div className="absolute inset-x-0 top-0 flex justify-end p-3 sm:p-3.5">
            <button
              type="button"
              disabled={uploadMedia.isPending}
              onClick={() => coverInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-3 py-1 text-[10px] font-semibold text-text-heading shadow-sm backdrop-blur-md transition hover:bg-white disabled:opacity-50"
            >
              <ImageIcon size={13} className="text-primary" aria-hidden />
              {uploadMedia.isPending ? "Uploading…" : "Change cover"}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>
        </div>

        {/* Avatar + name */}
        <div className="relative flex items-end gap-3 px-4 pb-3.5 sm:gap-4 sm:px-6 sm:pb-4">
          <div className="relative z-[1] -mt-8 shrink-0 sm:-mt-9">
            <div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-xl border-[3px] border-white bg-slate-50 shadow-md sm:h-[5.25rem] sm:w-[5.25rem] sm:rounded-2xl">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImage} alt="" className="h-full w-full object-cover object-center" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-muted/70">
                  <User size={24} strokeWidth={1.5} />
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={uploadMedia.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 rounded-full border border-border/70 bg-white px-2 py-0.5 text-[9px] font-semibold text-text-heading shadow transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
              aria-label="Edit profile photo"
            >
              <Pencil size={10} className="shrink-0 text-primary" aria-hidden />
              Edit
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="min-w-0 flex-1 pb-0.5">
            <p className="text-sm font-semibold tracking-tight text-text-heading sm:text-base">{displayName}</p>
          </div>
        </div>
      </div>

      {/* Personal details */}
      <div className={detailsCardClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {isClient ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                <Sparkles size={13} />
                60-second AI profile
              </div>
            ) : null}
            <h3 className={`font-black tracking-tight text-text-heading ${isClient ? "mt-3 text-lg sm:text-xl" : "text-xs"}`}>
              {isClient ? "Tell us what kind of help feels right" : "Contact & scheduling"}
            </h3>
            {isClient ? (
              <p className="mt-1 max-w-2xl text-xs leading-5 text-text-muted sm:text-sm">
                Choose what matters to you. We autosave your answers and use them to rank agents, lawyers, and mortgage brokers.
              </p>
            ) : null}
          </div>
          {isClient && clientLoading ? (
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-text-muted">Loading...</span>
          ) : null}
        </div>

        {isClient ? (
          <div className="mt-4 space-y-3">
            <OnboardingSection
              eyebrow="Step 1"
              title="Your contact details"
              helper="A quick identity check so matched professionals can reach you correctly."
            >
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <FormField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                onFocus={() => setFocusedField("firstName")}
                onBlur={() => setFocusedField("")}
                placeholder="Enter first name"
                icon={User}
                focusedField={focusedField}
                className={fieldSizeClass}
                required
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                onFocus={() => setFocusedField("lastName")}
                onBlur={() => setFocusedField("")}
                placeholder="Enter last name"
                icon={User}
                focusedField={focusedField}
                className={fieldSizeClass}
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                placeholder="you@example.com"
                icon={Mail}
                focusedField={focusedField}
                disabled
                className={disabledFieldSizeClass}
                required
              />
              <PhoneNumberField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField("")}
                error={null}
                required
                className={fieldSizeClass}
              />
            </div>
            </OnboardingSection>

            <OnboardingSection
              eyebrow="Step 2"
              title="Home goal"
              helper="Pick the journey that best describes you right now."
            >
              <div className="flex flex-wrap gap-1.5">
                {HOME_GOAL_OPTIONS.map((option) => (
                  <ChipButton
                    key={option.value}
                    label={option.label}
                    selected={(Array.isArray(clientForm.home_goals) ? clientForm.home_goals : []).includes(option.value)}
                    onClick={() => toggleHomeGoal(option.value)}
                  />
                ))}
              </div>
            </OnboardingSection>

            <OnboardingSection
              eyebrow="Step 3"
              title="Budget"
              helper="Set your ideal purchase range so financial fit can be scored accurately."
              right={
                <div className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary shadow-sm ring-1 ring-primary/10">
                  {formatBudget(clientForm.dream_home_price)}
                </div>
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-text-muted">Drag to adjust</span>
              </div>
              <input
                type="range"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={Number(clientForm.dream_home_price || 500000)}
                onChange={(event) => setClientField("dream_home_price", event.target.value)}
                className="mt-2.5 h-1.5 w-full cursor-pointer accent-primary"
              />
              <div className="mt-0.5 flex justify-between text-[10px] font-semibold text-text-muted">
                <span>{formatBudget(BUDGET_MIN)}</span>
                <span>{formatBudget(BUDGET_MAX)}</span>
              </div>
            </OnboardingSection>

            <OnboardingSection
              eyebrow="Step 4"
              title="Location and timeline"
              helper="Tell us where you want to move and how soon you want to act."
            >
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,420px)_auto] lg:items-end">
              <div className="max-w-[420px]">
                <FormField
                  label="Preferred Location"
                  name="preferred_location"
                  value={clientForm.preferred_location}
                  onChange={(event) => {
                    handleClientChange(event);
                    setClientField("preferred_locations", event.target.value ? [event.target.value] : []);
                  }}
                  onFocus={() => setFocusedField("preferred_location")}
                  onBlur={() => setFocusedField("")}
                  placeholder="Search city, neighbourhood, or region"
                  icon={MapPin}
                  focusedField={focusedField}
                  className={fieldSizeClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-black text-text-heading">Buying Timeline</label>
                <div className="flex flex-wrap gap-1.5">
                  {TIMELINE_OPTIONS.slice(0, 4).map((option) => (
                    <ChipButton
                      key={option.value}
                      label={option.label.replace(" / within 1 month", "")}
                      selected={clientForm.purchase_timeline === option.value}
                      onClick={() => setClientField("purchase_timeline", option.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
            </OnboardingSection>

            <OnboardingSection
              eyebrow="Step 5"
              title="Working style"
              helper="Select the personality and communication style you prefer."
            >
              <div className="flex flex-wrap gap-1.5">
                {WORKING_STYLE_OPTIONS.map((option) => (
                  <ChipButton
                    key={option.value}
                    label={option.label}
                    selected={clientForm.working_styles.includes(option.value)}
                    onClick={() => toggleClientArrayValue("working_styles", option.value)}
                  />
                ))}
              </div>
            </OnboardingSection>

            <OnboardingSection
              eyebrow="Step 6"
              title="What matters most?"
              helper="Choose up to five priorities so recommendations feel personal."
              right={<span className="rounded-full bg-primary/[0.08] px-3 py-1 text-[10px] font-black text-primary">{clientForm.priority_tags.length}/5 selected</span>}
            >
              <div className="flex flex-wrap gap-1.5">
                {PRIORITY_TAG_OPTIONS.map((option) => (
                  <ChipButton
                    key={option.value}
                    label={option.label}
                    selected={clientForm.priority_tags.includes(option.value)}
                    disabled={clientForm.priority_tags.length >= 5}
                    onClick={() => toggleClientArrayValue("priority_tags", option.value, 5)}
                  />
                ))}
              </div>
            </OnboardingSection>

            <div className="grid gap-3">
              <OnboardingSection eyebrow="Step 7" title="Experience" helper="Choose the experience level you trust most." className="h-full">
                <div className="flex flex-wrap gap-1.5">
                  {EXPERIENCE_PREFERENCE_OPTIONS.map((option) => (
                    <ChipButton
                      key={option.value}
                      label={option.label}
                      selected={clientForm.preferred_experience === option.value}
                      onClick={() => setClientField("preferred_experience", option.value)}
                    />
                  ))}
                </div>
              </OnboardingSection>
              <OnboardingSection eyebrow="Optional" title="Comfort preferences" helper="Add any extra comfort preferences if they matter to you." className="h-full">
                <div className="flex flex-wrap gap-1.5">
                  {COMFORT_PREFERENCE_OPTIONS.map((option) => (
                    <ChipButton
                      key={option.value}
                      label={option.label}
                      selected={clientForm.comfort_preferences.includes(option.value)}
                      onClick={() => toggleClientArrayValue("comfort_preferences", option.value)}
                    />
                  ))}
                </div>
              </OnboardingSection>
              <OnboardingSection eyebrow="Step 8" title="Language" helper="Pick languages that make communication comfortable." className="h-full">
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <ChipButton
                      key={option.value}
                      label={option.label}
                      selected={clientForm.languages.includes(option.value)}
                      onClick={() => toggleClientArrayValue("languages", option.value)}
                    />
                  ))}
                </div>
              </OnboardingSection>
            </div>
          </div>
        ) : (
          <div className={detailsGridClass}>
            <FormField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              onFocus={() => setFocusedField("firstName")}
              onBlur={() => setFocusedField("")}
              placeholder="Enter first name"
              icon={User}
              focusedField={focusedField}
              className={fieldSizeClass}
              required
            />
            <FormField
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              onFocus={() => setFocusedField("lastName")}
              onBlur={() => setFocusedField("")}
              placeholder="Enter last name"
              icon={User}
              focusedField={focusedField}
              className={fieldSizeClass}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              placeholder="you@example.com"
              icon={Mail}
              focusedField={focusedField}
              disabled
              className={disabledFieldSizeClass}
              required
            />
            <PhoneNumberField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField("")}
              error={null}
              required
              className={fieldSizeClass}
            />
            <div className="md:col-span-2">
              <FormField
                label="Calendly URL"
                name="calendlyUrl"
                value={form.calendlyUrl}
                onChange={handleChange}
                onFocus={() => setFocusedField("calendlyUrl")}
                onBlur={() => setFocusedField("")}
                placeholder="https://calendly.com/your-handle/..."
                icon={Calendar}
                focusedField={focusedField}
                className={fieldSizeClass}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-end">
          {canChangePassword ? (
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-bold text-text-heading transition hover:border-primary/40 hover:text-primary sm:w-auto"
            >
              Change password
            </button>
          ) : null}
          <SubmitButton
            loading={loading || clientSaving}
            type="button"
            onClick={isClient ? handleClientSettingsSubmit : handleSubmit}
            className="w-full text-[13px] sm:w-auto sm:min-w-[10rem]"
          >
            Save changes
          </SubmitButton>
        </div>
      </div>

      {showPasswordModal ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-transparent p-4 lg:pl-60"
          style={{ backdropFilter: "none", WebkitBackdropFilter: "none" }}
        >
          <div className="w-full max-w-lg rounded-lg border border-border/90 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <h3 className="text-sm font-semibold text-text-heading">Change password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-text-muted hover:text-text-heading hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="p-3">
              <ChangePassword />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
