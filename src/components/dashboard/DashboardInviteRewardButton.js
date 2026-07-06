"use client";

import { motion } from "framer-motion";
import { Link2, Sparkles } from "lucide-react";

export default function DashboardInviteRewardButton({ onClick }) {
  return (
    <div className="relative inline-flex">
      <motion.button
        type="button"
        onClick={onClick}
        className="invite-cta-button group relative inline-flex h-10 items-center gap-2.5 overflow-hidden rounded-xl border border-emerald-600/20 px-3.5 text-white shadow-[0_4px_14px_rgba(15,23,42,0.12)]"
        title="Create invite link and earn $5 reward"
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.99 }}
        animate={{ y: [0, -1.5, 0] }}
        transition={{
          y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
          scale: { type: "spring", stiffness: 400, damping: 24 },
        }}
      >
        <span
          aria-hidden
          className="invite-cta-shimmer pointer-events-none absolute inset-0 z-[1]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14)_0%,transparent_42%,rgba(255,255,255,0.08)_100%)]"
        />

        <span className="relative z-[2] inline-flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15">
            <Link2 size={14} strokeWidth={2.5} />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[11px] font-bold tracking-tight">Create invite link</span>
            <span className="mt-0.5 text-[10px] font-medium text-white/80">
              Grow your network faster
            </span>
          </span>
        </span>

        <motion.span
          className="invite-cta-badge relative z-[2] inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={11} strokeWidth={2.5} className="text-amber-500" />
          Earn $5
        </motion.span>
      </motion.button>
    </div>
  );
}
