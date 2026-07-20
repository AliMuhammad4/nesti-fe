"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronDown, ImagePlus, Loader2, Trash2, X } from "lucide-react";

const INTENT_OPTIONS = [
  {
    value: "buy",
    title: "Buy",
    description: "Find a home",
    icon: "\u{1F3E0}",
  },
  {
    value: "sell",
    title: "Sell",
    description: "List your property",
    icon: "\u{1F4B0}",
  },
];

const TIMELINE_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "asap", label: "ASAP / within 1 month" },
  { value: "1-3 months", label: "1 – 3 months" },
  { value: "3-6 months", label: "3 – 6 months" },
  { value: "6-12 months", label: "6 – 12 months" },
  { value: "browsing", label: "Just browsing" },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "Single Family", label: "Single Family" },
  { value: "Condo", label: "Condo" },
  { value: "Townhouse", label: "Townhouse" },
  { value: "Multi-Family", label: "Multi-Family" },
  { value: "Land", label: "Land" },
];

const BED_BATH_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5+", label: "5+" },
];

const BUDGET_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "under_400k", label: "Under $400k" },
  { value: "400k_700k", label: "$400k–$700k" },
  { value: "700k_1m", label: "$700k–$1M" },
  { value: "1m_plus", label: "$1M+" },
];

const YES_NO_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-text-heading shadow-sm shadow-slate-900/[0.02] placeholder:text-text-muted/60 transition focus:border-primary/35 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10";

function SelectField({ label, value, onChange, options, required = false }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return undefined;

    const updatePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 0;
      const spaceBelow = viewportHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const preferredMax = Math.min(220, Math.max(spaceBelow, spaceAbove, 120));
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;

      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        zIndex: 12050,
        maxHeight: preferredMax,
        ...(openUp ? { bottom: viewportHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      const target = event.target;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${inputClass} flex items-center justify-between gap-3 pr-3 text-left`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selected?.label || "Select"}</span>
        <ChevronDown
          size={16}
          strokeWidth={2.25}
          className={`shrink-0 text-slate-400 transition ${open ? "rotate-180 text-primary" : ""}`}
        />
      </button>

      {open && menuStyle && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              className="overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/[0.03]"
              role="listbox"
            >
              {options.map((option) => {
                const active = option.value === value && option.label === selected?.label;
                return (
                  <button
                    key={`${label}-${option.label}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-semibold transition ${
                      active ? "bg-primary/10 text-primary" : "text-text-heading hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function FieldLabel({ children, required = false }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate-500">
      {children}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
  );
}

function isSellerGoal(goal) {
  return goal === "selling_help" || goal === "home_valuation";
}

export default function AgentInquiryModal({
  open,
  submitting = false,
  professionalName = "Agent",
  token = "",
  uploadPropertyImages,
  onClose,
  onSubmit,
}) {
  const [message, setMessage] = useState("");
  const [selectedIntent, setSelectedIntent] = useState("");
  const [inquiryGoal, setInquiryGoal] = useState("");
  const [timeline, setTimeline] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [propertyFeatures, setPropertyFeatures] = useState("");
  const [parkingRequired, setParkingRequired] = useState("");
  const [backyardNeeded, setBackyardNeeded] = useState("");
  const [schoolDistrictImportant, setSchoolDistrictImportant] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);
  const sellerInquiry = selectedIntent === "sell" || isSellerGoal(inquiryGoal);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setSelectedIntent("");
    setInquiryGoal("");
    setTimeline("");
    setPreferredLocation("");
    setBudget("");
    setPropertyAddress("");
    setPropertyType("");
    setBedrooms("");
    setBathrooms("");
    setExpectedPrice("");
    setPropertyFeatures("");
    setParkingRequired("");
    setBackyardNeeded("");
    setSchoolDistrictImportant("");
    setImageFiles([]);
    setImagePreviews([]);
    setUploadingImages(false);
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open || !mounted) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, mounted]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const busy = submitting || uploadingImages;
  const canSubmit = useMemo(
    () => Boolean(selectedIntent && message.trim() && inquiryGoal && !busy),
    [message, inquiryGoal, selectedIntent, busy],
  );

  const handleChooseIntent = (intent) => {
    const nextIntent = intent === "sell" ? "sell" : "buy";
    setSelectedIntent(nextIntent);
    setInquiryGoal(nextIntent === "sell" ? "selling_help" : "buying_help");
    setError("");

    if (nextIntent === "buy") {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setImageFiles([]);
      setImagePreviews([]);
      setExpectedPrice("");
    } else {
      setPreferredLocation("");
      setBudget("");
      setParkingRequired("");
      setBackyardNeeded("");
      setSchoolDistrictImportant("");
    }
  };

  const handleBackToIntent = () => {
    setSelectedIntent("");
    setInquiryGoal("");
    setError("");
  };

  const handleImageSelect = (event) => {
    const selectedFiles = Array.from(event.target.files || []).filter((file) => file?.type?.startsWith("image/"));
    if (!selectedFiles.length) return;

    const combined = [...imageFiles, ...selectedFiles].slice(0, 8);
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setImageFiles(combined);
    setImagePreviews(
      combined.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    );
    event.target.value = "";
  };

  const removeImage = (index) => {
    const nextFiles = imageFiles.filter((_, currentIndex) => currentIndex !== index);
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setImageFiles(nextFiles);
    setImagePreviews(
      nextFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    );
  };

  const handleSubmit = async () => {
    setError("");
    if (!selectedIntent) {
      setError("Please choose if you want to buy or sell.");
      return;
    }
    if (!message.trim()) {
      setError("Please add your question.");
      return;
    }
    if (!inquiryGoal) {
      setError("Please choose what you need help with.");
      return;
    }
    if (sellerInquiry) {
      if (!propertyAddress.trim()) {
        setError("Please add the property address.");
        return;
      }
      if (!propertyType) {
        setError("Please choose the property type.");
        return;
      }
      if (!expectedPrice.trim()) {
        setError("Please add the expected price.");
        return;
      }
      if (!bedrooms || !bathrooms) {
        setError("Please choose bedrooms and bathrooms.");
        return;
      }
      if (!propertyFeatures.trim()) {
        setError("Please add key features.");
        return;
      }
      if (!imageFiles.length) {
        setError("Please upload at least one property image.");
        return;
      }
    } else if (!preferredLocation.trim()) {
      setError("Please add your preferred location.");
      return;
    } else if (!budget || !propertyType || !bedrooms || !bathrooms) {
      setError("Please complete budget, property type, bedrooms, and bathrooms.");
      return;
    } else if (!propertyFeatures.trim()) {
      setError("Please add must-have features.");
      return;
    } else if (!parkingRequired || !backyardNeeded || !schoolDistrictImportant) {
      setError("Please complete parking, backyard, and school district preferences.");
      return;
    }

    let uploadedImages = [];
    if (sellerInquiry && imageFiles.length) {
      try {
        setUploadingImages(true);
        const uploadResult = await uploadPropertyImages?.({ token, files: imageFiles });
        uploadedImages = Array.isArray(uploadResult?.images) ? uploadResult.images : [];
        if (!uploadedImages.length) {
          setError("Property images could not be uploaded. Please try again.");
          return;
        }
      } catch (uploadError) {
        setError(uploadError?.message || "Property images could not be uploaded. Please try again.");
        return;
      } finally {
        setUploadingImages(false);
      }
    }

    await onSubmit?.({
      message: message.trim(),
      intent: selectedIntent,
      timeline,
      preferred_location: sellerInquiry ? propertyAddress.trim() : preferredLocation.trim(),
      budget: sellerInquiry ? expectedPrice.trim() : budget.trim(),
      property_address: propertyAddress.trim(),
      property_type: propertyType,
      bedrooms,
      bathrooms,
      expected_price: expectedPrice.trim(),
      must_have_features: propertyFeatures.trim(),
      parking_required: parkingRequired,
      backyard_needed: backyardNeeded,
      school_district_important: schoolDistrictImportant,
      property_images: uploadedImages,
    });
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex h-[100dvh] w-screen items-center justify-center bg-slate-950/40 p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close inquiry modal"
        onClick={onClose}
        disabled={busy}
      />

      <div className="relative flex max-h-[min(90dvh,43rem)] w-full max-w-[35rem] flex-col overflow-hidden rounded-[1.65rem] border border-white/75 bg-white shadow-2xl shadow-slate-950/20 ring-1 ring-slate-900/[0.04]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-white via-white to-slate-50/80 px-4 py-3.5">
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-text-heading">
              {!selectedIntent ? "Ask" : sellerInquiry ? "Share property details with" : "Ask"} {professionalName}
            </h3>
            <p className="mt-0.5 text-[11px] leading-4 text-text-muted">
              {!selectedIntent
                ? "Choose your intent first, then we will collect the right details."
                : sellerInquiry
                  ? "Add the core selling details and photos so the agent can qualify the lead properly."
                  : "Submit a real estate inquiry. The agent will review it from their leads."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full border border-slate-200 bg-white p-1.5 text-text-muted shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-text-heading disabled:opacity-60"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3.5">
          {!selectedIntent ? (
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-indigo-50/70 to-slate-50/60 p-3.5">
              <p className="text-sm font-bold text-text-heading text-center leading-snug">
                What brings you here today?
              </p>
              <div className="mt-3 flex gap-2.5">
                {INTENT_OPTIONS.map((intent) => (
                    <button
                      key={intent.value}
                      type="button"
                      onClick={() => handleChooseIntent(intent.value)}
                      disabled={busy}
                      className="flex-1 rounded-2xl border border-border bg-white p-3 text-center shadow-sm shadow-slate-900/[0.03] transition hover:border-primary/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="mb-1 text-xl" aria-hidden>
                        {intent.icon}
                      </div>
                      <div className="text-sm font-bold text-text-heading">{intent.title}</div>
                      <div className="mt-0.5 text-[10px] leading-4 text-text-muted">{intent.description}</div>
                    </button>
                  ))}
              </div>
            </div>
          ) : null}

          {selectedIntent && sellerInquiry ? (
            <div className="rounded-2xl border border-primary/10 bg-primary/[0.025] p-3.5 shadow-sm shadow-primary/[0.03]">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-primary">Property details</p>
              <div className="mt-2.5 space-y-2.5">
                <label className="block space-y-1.5">
                    <FieldLabel required>Property address</FieldLabel>
                  <input
                    className={inputClass}
                    value={propertyAddress}
                    onChange={(event) => setPropertyAddress(event.target.value)}
                    placeholder="123 Main St, City, State"
                    maxLength={220}
                  />
                </label>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <SelectField
                    label="Property type"
                    value={propertyType}
                    onChange={setPropertyType}
                    options={PROPERTY_TYPE_OPTIONS}
                    required
                  />
                  <label className="block space-y-1.5">
                    <FieldLabel required>Expected price</FieldLabel>
                    <input
                      className={inputClass}
                      value={expectedPrice}
                      onChange={(event) => setExpectedPrice(event.target.value)}
                      placeholder="e.g. 550000"
                      maxLength={80}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <SelectField label="Bedrooms" value={bedrooms} onChange={setBedrooms} options={BED_BATH_OPTIONS} />
                  <SelectField label="Bathrooms" value={bathrooms} onChange={setBathrooms} options={BED_BATH_OPTIONS} />
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <SelectField
                    label="Timeline"
                    value={timeline}
                    onChange={setTimeline}
                    options={TIMELINE_OPTIONS}
                  />
                </div>

                <label className="block space-y-1.5">
                  <FieldLabel>Key features</FieldLabel>
                  <textarea
                    className={`${inputClass} min-h-16 resize-y leading-5`}
                    value={propertyFeatures}
                    onChange={(event) => setPropertyFeatures(event.target.value)}
                    placeholder="e.g. garage, pool"
                    maxLength={800}
                  />
                </label>

                <div className="space-y-2">
                  <FieldLabel required>Property photos</FieldLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy || imageFiles.length >= 8}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-white px-3 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ImagePlus size={16} />
                    {imageFiles.length ? "Add more images" : "Upload property images"}
                  </button>
                  <p className="text-[10px] text-text-muted">Upload up to 8 images. At least one is required for seller leads.</p>

                  {imagePreviews.length ? (
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={`${preview.name}-${index}`} className="group relative overflow-hidden rounded-xl border border-white bg-slate-100 shadow-sm">
                          <Image
                            src={preview.url}
                            alt={preview.name}
                            width={128}
                            height={64}
                            unoptimized
                            className="h-16 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={busy}
                            className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-500 shadow-sm opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
                            aria-label="Remove image"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : selectedIntent ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/35 p-3.5 shadow-sm shadow-blue-900/[0.02]">
              <div className="space-y-2.5">
                <label className="block space-y-1.5">
                  <FieldLabel required>Where are you looking?</FieldLabel>
                  <input
                    className={inputClass}
                    value={preferredLocation}
                    onChange={(event) => setPreferredLocation(event.target.value)}
                    placeholder="City, neighbourhood, zip…"
                    maxLength={180}
                  />
                </label>
                <label className="block space-y-1.5">
                  <FieldLabel>Where you are looking to find your dream house?</FieldLabel>
                  <input
                    className={inputClass}
                    value={propertyAddress}
                    onChange={(event) => setPropertyAddress(event.target.value)}
                    placeholder="City, neighbourhood, zip…"
                    maxLength={220}
                  />
                </label>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <SelectField
                    label="Budget"
                    value={budget}
                    onChange={setBudget}
                    options={BUDGET_OPTIONS}
                    required
                  />
                  <SelectField
                    label="Property type"
                    value={propertyType}
                    onChange={setPropertyType}
                    options={PROPERTY_TYPE_OPTIONS}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <SelectField label="Bedrooms" value={bedrooms} onChange={setBedrooms} options={BED_BATH_OPTIONS} required />
                  <SelectField label="Bathrooms" value={bathrooms} onChange={setBathrooms} options={BED_BATH_OPTIONS} required />
                </div>

                <label className="block space-y-1.5">
                  <FieldLabel required>Must-have features</FieldLabel>
                  <input
                    className={inputClass}
                    value={propertyFeatures}
                    onChange={(event) => setPropertyFeatures(event.target.value)}
                    placeholder="e.g. pool, garage"
                    maxLength={800}
                  />
                </label>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <SelectField
                    label="Parking required?"
                    value={parkingRequired}
                    onChange={setParkingRequired}
                    options={YES_NO_OPTIONS}
                    required
                  />
                  <SelectField
                    label="Backyard needed?"
                    value={backyardNeeded}
                    onChange={setBackyardNeeded}
                    options={YES_NO_OPTIONS}
                    required
                  />
                  <SelectField
                    label="School district important?"
                    value={schoolDistrictImportant}
                    onChange={setSchoolDistrictImportant}
                    options={YES_NO_OPTIONS}
                    required
                  />
                  <SelectField
                    label="Timeline"
                    value={timeline}
                    onChange={setTimeline}
                    options={TIMELINE_OPTIONS}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {selectedIntent ? (
            <label className="block space-y-1.5">
              <FieldLabel required>{sellerInquiry ? "Message to the agent" : "Your question"}</FieldLabel>
              <textarea
                className={`${inputClass} min-h-20 resize-y leading-5`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  sellerInquiry
                    ? "Describe your selling goal, valuation needs, urgency, or anything the agent should know..."
                    : "Describe what you need help with: buying, market advice, showings..."
                }
                maxLength={1200}
              />
            </label>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/75 px-4 py-2.5">
          {selectedIntent ? (
            <button
              type="button"
              onClick={handleBackToIntent}
              disabled={busy}
              className="mr-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-text-heading shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-text-heading shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : null}
            {uploadingImages ? "Uploading images..." : submitting ? "Submitting..." : "Send inquiry"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
