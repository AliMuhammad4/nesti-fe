"use client";

import { motion } from "framer-motion";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-3 md:p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] md:min-h-[42rem] md:flex-row"
      >
        {children}
      </motion.div>
    </div>
  );
}
