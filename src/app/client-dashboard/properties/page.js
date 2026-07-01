"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Search } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { useAppSelector } from "@/store";
import { toast } from "react-toastify";

export default function ClientPropertiesPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const [hydrated, setHydrated] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");

  useEffect(() => {
    setHydrated(true);
  }, []);

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

    fetchProperties();
  }, [hydrated, token, user?.role]);

  const fetchProperties = async (locationFilter = "") => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({ limit: "24" });
      if (locationFilter.trim()) {
        queryParams.append("location", locationFilter.trim());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties?${queryParams.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        setProperties(data.data.properties || []);
      } else {
        toast.error(data.message || "Failed to load properties");
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchProperties(location);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary sm:h-12 sm:w-12" />
          <p className="mt-4 text-sm text-gray-600 sm:text-base">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 ring-1 ring-primary/20">
              <Building2 size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Properties</h1>
              <p className="text-sm text-gray-600">
                Browse available seller properties. Closed listings are hidden automatically.
              </p>
            </div>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Search by city, area, or address"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Search
            </button>
          </div>
        </motion.form>

        {properties.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </motion.div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
            <Building2 size={52} className="mx-auto mb-4 text-gray-300" />
            <h2 className="mb-2 text-xl font-bold text-gray-900">No Available Properties</h2>
            <p className="text-sm text-gray-600">
              There are no active seller properties to show right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
