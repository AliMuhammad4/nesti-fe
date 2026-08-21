"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";

export default function JourneyTimeline({
  steps = [],
  tone = "light",
  orientation = "vertical",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(-1);
  const isDark = tone === "dark";

  useEffect(() => {
    if (!inView) return undefined;
    if (reduceMotion) {
      setActive(steps.length - 1);
      return undefined;
    }
    setActive(0);
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      if (index >= steps.length) {
        window.clearInterval(id);
        return;
      }
      setActive(index);
    }, 420);
    return () => window.clearInterval(id);
  }, [inView, reduceMotion, steps.length]);

  const titleIdle = isDark ? "text-white/55" : "text-text-heading/50";
  const titleReached = isDark ? "text-white" : "text-text-heading";
  const titleLive = isDark ? "text-[#20f5c4]" : "text-primary";
  const noteIdle = isDark ? "text-slate-600" : "text-text-muted/70";
  const noteLive = isDark ? "text-slate-400" : "text-text-muted";
  const arrowIdle = isDark ? "text-white/15" : "text-primary/20";
  const arrowLive = isDark ? "text-[#20f5c4]" : "text-primary";

  if (orientation === "horizontal") {
    return (
      <div
        ref={ref}
        className="-mx-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ol className="mx-auto flex min-w-[760px] max-w-5xl items-start">
          {steps.map((item, index) => {
            const reached = index <= active;
            const current = index === active;
            const last = index === steps.length - 1;
            const connectorLive = index < active;

            return (
              <li
                key={item.label}
                className={`flex min-w-0 items-start ${last ? "flex-[0.75]" : "flex-1"}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                  transition={{
                    delay: 0.08 + index * 0.08,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className="flex min-w-[108px] flex-col items-center text-center"
                >
                  <motion.span
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full border text-[11px] font-bold tracking-[0.12em] transition-all duration-300 ${
                      current
                        ? "border-primary bg-primary text-white shadow-[0_0_0_7px_rgba(16,185,129,0.09),0_10px_28px_-8px_rgba(16,185,129,0.7)]"
                        : reached
                          ? "border-primary/45 bg-primary/[0.09] text-primary-dark"
                          : "border-text-heading/10 bg-white/60 text-text-muted"
                    }`}
                    animate={
                      current && !reduceMotion
                        ? { scale: [1, 1.08, 1] }
                        : { scale: 1 }
                    }
                    transition={
                      current && !reduceMotion
                        ? { duration: 1.7, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.25 }
                    }
                  >
                    {String(index + 1).padStart(2, "0")}
                  </motion.span>
                  <span
                    className={`mt-4 text-sm font-bold tracking-tight transition-colors duration-300 ${
                      current ? titleLive : reached ? titleReached : titleIdle
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`mt-1 max-w-[126px] text-xs leading-5 transition-colors duration-300 ${
                      reached ? noteLive : noteIdle
                    }`}
                  >
                    {item.note}
                  </span>
                </motion.div>

                {last ? null : (
                  <motion.div
                    aria-hidden
                    initial={{ opacity: 0, scaleX: 0.7 }}
                    animate={
                      inView
                        ? { opacity: 1, scaleX: 1 }
                        : { opacity: 0, scaleX: 0.7 }
                    }
                    transition={{ delay: 0.15 + index * 0.08, duration: 0.35 }}
                    className={`mt-3 flex min-w-8 flex-1 items-center justify-center ${
                      connectorLive || current ? arrowLive : arrowIdle
                    }`}
                  >
                    <motion.span
                      animate={
                        current && !reduceMotion
                          ? { x: [0, 7, 0], opacity: [0.4, 1, 0.4] }
                          : { x: 0, opacity: connectorLive ? 0.85 : 0.35 }
                      }
                      transition={
                        current && !reduceMotion
                          ? { duration: 1.05, repeat: Infinity, ease: "easeInOut" }
                          : { duration: 0.25 }
                      }
                      className="inline-flex"
                    >
                      <ArrowRight size={20} strokeWidth={2.2} />
                    </motion.span>
                  </motion.div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <ol ref={ref} className="mx-auto flex w-full max-w-[16rem] flex-col items-center">
      {steps.map((item, index) => {
        const reached = index <= active;
        const current = index === active;
        const last = index === steps.length - 1;
        const connectorLive = index < active;

        return (
          <li key={item.label} className="flex w-full flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ delay: 0.08 + index * 0.07, duration: 0.35, ease: "easeOut" }}
              className="flex w-full flex-col items-center text-center"
            >
              <span
                className={`text-sm font-semibold tracking-tight transition-colors duration-300 ${
                  current ? titleLive : reached ? titleReached : titleIdle
                }`}
              >
                {item.label}
              </span>
              <span
                className={`mt-0.5 text-xs leading-5 transition-colors duration-300 ${
                  reached ? noteLive : noteIdle
                }`}
              >
                {item.note}
              </span>
            </motion.div>

            {last ? null : (
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.14 + index * 0.07, duration: 0.3 }}
                className={`flex h-8 items-center justify-center ${
                  connectorLive || current ? arrowLive : arrowIdle
                }`}
              >
                <motion.span
                  animate={
                    current && !reduceMotion
                      ? { y: [0, 6, 0], opacity: [0.45, 1, 0.45] }
                      : { y: 0, opacity: connectorLive ? 1 : 0.4 }
                  }
                  transition={
                    current && !reduceMotion
                      ? { duration: 1.05, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.25 }
                  }
                  className="inline-flex"
                >
                  <ArrowDown size={18} strokeWidth={2.4} />
                </motion.span>
              </motion.div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
