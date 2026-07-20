"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  Calendar,
  Car,
  CircleDollarSign,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Maximize2,
  MessageSquare,
  ShieldCheck,
  Send,
  Tag,
  Trees,
} from "lucide-react";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "@/lib/api";
import { useAppSelector } from "@/store";

function formatPrice(value) {
  const raw = String(value || "").trim();
  if (!raw || /^price\s+(upon\s+)?request$/i.test(raw)) return "";
  const num = Number(raw.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(num) && num > 0) return `$${Math.round(num).toLocaleString()}`;
  return raw;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function readableValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.toLowerCase() === "asap") return "ASAP";
  return raw.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function meaningfulValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(address not provided|price upon request|property)$/i.test(raw)) return "";
  return raw;
}

function yesNoLabel(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "yes") return "Yes";
  if (raw === "no") return "No";
  return readableValue(value);
}

export default function ClientPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "").trim();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.push("/log-in");
      return;
    }
    if (user?.role && user.role !== "client") {
      router.push("/dashboard");
      return;
    }
    if (!id) return;

    let cancelled = false;
    async function loadProperty() {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.properties.detail(id), { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (data.success) {
          setProperty(data.data);
          setSelectedImageIndex(0);
          const propertyName = meaningfulValue(data.data?.address) || meaningfulValue(data.data?.location) || "this property";
          setMessage(
            `Hi, I am interested in ${propertyName}. Can you share more details?`
          );
        } else {
          toast.error(data.message || "Property not found");
          router.push("/client-dashboard/properties");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading property:", error);
          toast.error("Failed to load property");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProperty();
    return () => {
      cancelled = true;
    };
  }, [hydrated, id, router, token, user?.role]);

  const title = useMemo(() => {
    if (!property) return "Property";
    return meaningfulValue(property.address) || meaningfulValue(property.location) || "Available Property";
  }, [property]);

  const propertyImages = useMemo(
    () =>
      (Array.isArray(property?.images) ? property.images : [])
        .map((image) => image?.secure_url || image?.url)
        .filter(Boolean),
    [property?.images]
  );
  const mainImage = propertyImages[selectedImageIndex] || propertyImages[0] || "";
  const priceDisplay = formatPrice(property?.price);
  const propertyTypeDisplay = readableValue(meaningfulValue(property?.propertyType));
  const publicOverviewItems = useMemo(
    () =>
      [
        { label: "Price", value: priceDisplay, Icon: CircleDollarSign, emphasize: true },
        { label: "Type", value: propertyTypeDisplay, Icon: Tag },
        { label: "Address", value: meaningfulValue(property?.address), Icon: MapPin },
        { label: "Location", value: meaningfulValue(property?.location), Icon: MapPin },
      ].filter((item) => item.value),
    [priceDisplay, property?.address, property?.location, propertyTypeDisplay]
  );
  const detailChips = useMemo(
    () =>
      [
        meaningfulValue(property?.bedrooms) ? { label: `${property.bedrooms} Beds`, Icon: Bed } : null,
        meaningfulValue(property?.bathrooms) ? { label: `${property.bathrooms} Baths`, Icon: Bath } : null,
        meaningfulValue(property?.squareFootage) ? { label: `${property.squareFootage} sqft`, Icon: Maximize2 } : null,
        meaningfulValue(property?.timeline) ? { label: readableValue(property.timeline), Icon: Calendar } : null,
        meaningfulValue(property?.parking) ? { label: `Parking: ${yesNoLabel(property.parking)}`, Icon: Car } : null,
        meaningfulValue(property?.backyard) ? { label: `Outdoor: ${yesNoLabel(property.backyard)}`, Icon: Trees } : null,
      ].filter(Boolean),
    [property?.backyard, property?.bathrooms, property?.bedrooms, property?.parking, property?.squareFootage, property?.timeline]
  );

  const openThread = (thread) => {
    const threadId = String(thread?.id || "").trim();
    if (threadId) router.push(`/messages/${encodeURIComponent(threadId)}`);
  };

  const submitInquiry = async () => {
    const text = message.trim();
    if (!text) {
      toast.error("Please enter your question or message");
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch(API_ENDPOINTS.properties.inquiry(id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send inquiry");
      }
      toast.success("Inquiry sent to the listing professional");
      openThread(data.data?.thread);
    } catch (error) {
      toast.error(error?.message || "Failed to send inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const startConversation = async () => {
    try {
      setStartingChat(true);
      const response = await fetch(API_ENDPOINTS.properties.thread(id), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to start conversation");
      }
      openThread(data.thread);
    } catch (error) {
      toast.error(error?.message || "Failed to start conversation");
    } finally {
      setStartingChat(false);
    }
  };

  const OverviewItem = ({ item }) => {
    const Icon = item.Icon;
    return (
      <div className="rounded-2xl border border-primary/10 bg-white/76 p-3 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
          <Icon size={13} className="text-primary" />
          {item.label}
        </div>
        <div
          className={`mt-1 truncate ${item.emphasize ? "text-lg font-black text-gray-950" : "text-sm font-bold text-gray-800"}`}
          title={String(item.value || "")}
        >
          {item.value}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(52,199,89,0.14),transparent_30%),linear-gradient(135deg,#F3FBF6_0%,#ECF8F0_45%,#F9FFFB_100%)] px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <button
          type="button"
          onClick={() => router.push("/client-dashboard/properties")}
          className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm backdrop-blur transition hover:text-primary"
        >
          <ArrowLeft size={14} />
          Back to properties
        </button>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/82 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl"
        >
          <div className="grid items-stretch gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
            <div className="flex h-full min-h-0 flex-col bg-slate-950/5 p-3 sm:p-4">
              <div className="relative min-h-[22rem] flex-1 overflow-hidden rounded-2xl bg-slate-100 shadow-inner sm:min-h-[27rem] lg:min-h-0">
                {mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainImage} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                    <Building2 size={48} />
                    <span className="text-xs font-bold">No property photos uploaded</span>
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
                {priceDisplay ? (
                  <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1.5 text-xs font-black text-white shadow">
                    {priceDisplay}
                  </div>
                ) : null}
                {propertyTypeDisplay ? (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-primary shadow backdrop-blur">
                    <Tag size={12} />
                    {propertyTypeDisplay}
                  </div>
                ) : null}
                {propertyImages.length > 1 ? (
                  <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
                    <ImageIcon size={12} />
                    {selectedImageIndex + 1} / {propertyImages.length}
                  </div>
                ) : null}
              </div>

              {propertyImages.length > 1 ? (
                <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-7">
                  {propertyImages.slice(0, 7).map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}_${index}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-16 overflow-hidden rounded-xl border bg-white transition ${
                        selectedImageIndex === index
                          ? "border-primary shadow-[0_0_0_2px_rgba(52,199,89,0.16)]"
                          : "border-white/80 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="p-4 sm:p-5 lg:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Property details</p>
                  <h1 className="mt-1 text-xl font-black tracking-tight text-gray-950 sm:text-2xl">{title}</h1>
                </div>
              </div>
              {meaningfulValue(property.location) ? (
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <MapPin size={15} className="text-primary" />
                  {property.location}
                </p>
              ) : null}

              {publicOverviewItems.length ? (
                <div className="mt-4 rounded-3xl border border-white/70 bg-white/62 p-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">At a glance</p>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.08] px-2.5 py-1 text-[10px] font-black text-primary">
                      <ShieldCheck size={12} />
                      Public details
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {publicOverviewItems.map((item) => (
                      <OverviewItem key={item.label} item={item} />
                    ))}
                  </div>
                </div>
              ) : null}

              {detailChips.length ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {detailChips.map(({ label, Icon }) => (
                    <div key={label} className="flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/[0.035] px-3 py-2 text-xs font-bold text-gray-700">
                      <Icon size={14} className="text-primary" />
                      {label}
                    </div>
                  ))}
                </div>
              ) : null}

              {meaningfulValue(property.features) ? (
                <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Highlights</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{property.features}</p>
                </div>
              ) : null}

              {property.listingProfessional ? (
                <div className="mt-4 rounded-2xl border border-primary/12 bg-primary/[0.035] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {property.listingProfessional.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={property.listingProfessional.profileImage}
                          alt=""
                          className="h-10 w-10 rounded-xl object-cover ring-1 ring-primary/10"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                          {String(property.listingProfessional.name || "LP").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-gray-950">{property.listingProfessional.name}</p>
                        <p className="text-xs capitalize text-gray-500">
                          {String(property.listingProfessional.role || "").replace(/_/g, " ")}
                        </p>
                        {meaningfulValue(property.listingProfessional.companyName) ? (
                          <p className="mt-0.5 truncate text-[11px] font-semibold text-gray-500">
                            {property.listingProfessional.companyName}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-primary">
                      Listing pro
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <div className="mb-3">
                  <h2 className="text-base font-black text-gray-950">Ask about this property</h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Send a question and open a direct conversation with the listing professional.
                  </p>
                </div>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  placeholder="Ask a question about this property..."
                />
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={startConversation}
                    disabled={startingChat || submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-3 py-2.5 text-xs font-black text-primary transition hover:bg-primary/5 disabled:opacity-60"
                  >
                    {startingChat ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
                    Message Professional
                  </button>
                  <button
                    type="button"
                    onClick={submitInquiry}
                    disabled={submitting || startingChat}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-black text-white transition hover:bg-primary-dark disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    Send Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
