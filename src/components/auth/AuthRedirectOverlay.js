"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function AuthRedirectOverlay({
  isVisible = false,
  title = "Setting up your workspace...",
  subtitle = "Preparing your personalized dashboard. This will only take a moment.",
  badge = "Authenticating",
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/95 p-7 text-center shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)]"
          >
            {/* Top decorative gradient bar */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-primary-dark to-primary" />

            {/* Glowing Logo / Pulse Container */}
            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20 duration-1000" />
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary-dark/30 blur-sm" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-white shadow-md">
                <Image
                  src="/logo/logo.png"
                  alt="Nesti AI Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
              </div>
            </div>

            {/* Badge */}
            {badge && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{badge}</span>
              </div>
            )}

            {/* Title & Subtitle */}
            <h3 className="text-xl font-black tracking-tight text-text-heading sm:text-2xl">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-body">
              {subtitle}
            </p>

            {/* Progress Bar Animation */}
            <div className="mt-6 overflow-hidden rounded-full bg-gray-100 p-0.5 border border-border/60">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: "easeInOut",
                }}
                className="h-1.5 w-1/2 rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary-dark"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
