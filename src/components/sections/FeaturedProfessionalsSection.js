"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, Award, ArrowRight } from "lucide-react";

export default function FeaturedProfessionalsSection() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProfessionals();
  }, []);

  const fetchFeaturedProfessionals = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/featured/professionals?limit=6`);
      const data = await response.json();
      if (data.success) {
        setProfessionals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative bg-transparent py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center">
            <p className="text-gray-500">Loading featured professionals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (professionals.length === 0) {
    return null;
  }

  const getPlanBadgeStyles = (planKey) => {
    switch (planKey) {
      case 'enterprise':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white';
      case 'standard':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'basic':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getPlanLabel = (planKey) => {
    switch (planKey) {
      case 'enterprise':
        return 'Premium Featured';
      case 'standard':
        return 'Featured';
      case 'basic':
        return 'Featured';
      default:
        return 'Featured';
    }
  };

  return (
    <section id="featured-professionals" className="relative bg-gradient-to-b from-primary/5 to-transparent py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.3 }}
          >
            <span className="mb-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Award size={14} />
              Featured Professionals
            </span>
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
              Top Real Estate Professionals
            </h2>
            <p className="mx-auto max-w-lg text-base text-gray-600 sm:text-lg">
              Connect with experienced agents, mortgage brokers, and lawyers ready to help you achieve your real estate goals
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((professional, index) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/30"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent" />
              
              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/20">
                      {professional.publicProfile?.slug ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/api/public/${professional.publicProfile.slug}/avatar`}
                          alt={professional.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
                          {professional.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{professional.role?.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getPlanBadgeStyles(professional.plan_key)}`}>
                    <Star size={12} fill="currentColor" />
                    {getPlanLabel(professional.plan_key)}
                  </span>
                </div>

                {professional.profile?.bio && (
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                    {professional.profile.bio}
                  </p>
                )}

                {professional.profile?.location?.city && (
                  <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span>
                      {professional.profile.location.city}
                      {professional.profile.location.province && `, ${professional.profile.location.province}`}
                    </span>
                  </div>
                )}

                {professional.profile?.specializations && professional.profile.specializations.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {professional.profile.specializations.slice(0, 2).map((spec, idx) => (
                      <span key={idx} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {professional.publicProfile?.slug ? (
                  <Link
                    href={`/${professional.publicProfile.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all group-hover:gap-3"
                  >
                    View Profile
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400"
                  >
                    Profile Coming Soon
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/professionals"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            View All Professionals
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
