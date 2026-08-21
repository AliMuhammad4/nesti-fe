"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const workflowPositions = [
  { x: 24, y: 22 },
  { x: 220, y: 136 },
  { x: 416, y: 22 },
  { x: 612, y: 136 },
  { x: 808, y: 22 },
  { x: 1004, y: 136 },
];

export default function HorizontalJourneyTimeline({ steps = [], advanced = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduceMotion) {
      setActive(steps.length - 1);
      return undefined;
    }

    setActive(0);
    let index = 0;
    const id = window.setInterval(() => {
      index = advanced ? (index + 1) % steps.length : index + 1;
      if (!advanced && index >= steps.length) {
        window.clearInterval(id);
        return;
      }
      setActive(index);
    }, advanced ? 2200 : 520);

    return () => window.clearInterval(id);
  }, [advanced, inView, reduceMotion, steps.length]);

  if (advanced) {
    const nodeWidth = 184;
    const nodeHeight = 78;
    const connections = workflowPositions.slice(0, -1).map((position, index) => {
      const next = workflowPositions[index + 1];
      const startX = position.x + nodeWidth;
      const startY = position.y + nodeHeight / 2;
      const endX = next.x;
      const endY = next.y + nodeHeight / 2;
      const bend = (startX + endX) / 2;

      return {
        d: `M ${startX} ${startY} C ${bend} ${startY}, ${bend} ${endY}, ${endX} ${endY}`,
        active: index < active,
        current: index === active,
      };
    });

    return (
      <div
        ref={ref}
        className="-mx-2 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="relative mx-auto h-[250px]"
          style={{ width: 1196, minWidth: 1196 }}
        >
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 1196 250"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="workflow-signal-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {connections.map((connection, index) => (
              <g key={`connection-${index}`}>
                <path
                  d={connection.d}
                  fill="none"
                  stroke="rgba(100,116,139,0.2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <motion.path
                  d={connection.d}
                  fill="none"
                  stroke="rgba(16,185,129,0.75)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: connection.active || connection.current ? 1 : 0,
                    opacity: connection.active || connection.current ? 1 : 0,
                  }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
                />
                {connection.current && !reduceMotion ? (
                  <circle
                    r="4"
                    fill="#10b981"
                    filter="url(#workflow-signal-glow)"
                  >
                    <animateMotion
                      dur="1.8s"
                      repeatCount="indefinite"
                      path={connection.d}
                    />
                  </circle>
                ) : null}
              </g>
            ))}
          </svg>

          <ol className="absolute inset-0">
            {steps.map((item, index) => {
              const position = workflowPositions[index];
              const reached = index <= active;
              const current = index === active;
              const StepIcon = item.Icon;
              const last = index === steps.length - 1;

              return (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  animate={
                    inView
                      ? {
                          opacity: 1,
                          scale: current && !reduceMotion ? 1.025 : 1,
                          y: current && !reduceMotion ? -3 : 0,
                        }
                      : { opacity: 0, scale: 0.9, y: 12 }
                  }
                  transition={{
                    opacity: { delay: index * 0.09, duration: 0.4 },
                    scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    y: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className={`absolute w-[184px] rounded-2xl border bg-white/90 p-3 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.38)] backdrop-blur-xl transition-colors duration-300 ${
                    current
                      ? "border-primary/50 ring-4 ring-primary/[0.07]"
                      : reached
                        ? "border-primary/20"
                        : "border-slate-200/80"
                  }`}
                  style={{ left: position.x, top: position.y }}
                >
                  <span
                    aria-hidden
                    className={`absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${
                      reached ? "bg-primary" : "bg-slate-300"
                    }`}
                  />
                  {!last ? (
                    <span
                      aria-hidden
                      className={`absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${
                        current || index < active ? "bg-primary" : "bg-slate-300"
                      }`}
                    />
                  ) : null}

                  <div className="flex items-center gap-3">
                    <motion.span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                        current
                          ? "border-primary bg-primary text-white shadow-[0_8px_22px_-10px_rgba(16,185,129,0.9)]"
                          : "border-primary/15 bg-primary/[0.07] text-primary"
                      }`}
                      animate={
                        current && !reduceMotion
                          ? { rotate: [0, -2, 2, 0], scale: [1, 1.06, 1] }
                          : { rotate: 0, scale: 1 }
                      }
                      transition={{ duration: 1.1, ease: "easeOut" }}
                    >
                      {StepIcon ? <StepIcon size={18} strokeWidth={2} /> : null}
                    </motion.span>

                    <span className="min-w-0 text-left">
                      <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-primary/70">
                        {item.type}
                      </span>
                      <span
                        className={`mt-0.5 block text-sm font-bold leading-tight ${
                          current ? "text-primary-dark" : "text-text-heading"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="mt-1 block whitespace-nowrap text-[10px] text-text-muted">
                        {item.note}
                      </span>
                    </span>
                  </div>

                  {current ? (
                    <motion.span
                      aria-hidden
                      className="absolute inset-x-3 bottom-0 h-px origin-left bg-gradient-to-r from-transparent via-primary to-transparent"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  ) : null}
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="-mx-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ol
        className="mx-auto flex w-full max-w-5xl items-start"
        style={{ minWidth: 760 }}
      >
        {steps.map((item, index) => {
          const reached = index <= active;
          const current = index === active;
          const last = index === steps.length - 1;
          const connectorLive = index < active;
          const StepIcon = item.Icon;

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
                  className={`relative flex items-center justify-center border font-bold transition-all duration-300 ${
                    advanced
                      ? "h-11 w-11 rounded-[0.75rem]"
                      : "h-11 w-11 rounded-full text-[11px] tracking-[0.12em]"
                  } ${
                    current
                      ? "border-primary bg-[linear-gradient(145deg,#10b981,#22c55e)] text-white shadow-[0_0_0_7px_rgba(16,185,129,0.09),0_12px_30px_-8px_rgba(16,185,129,0.8)]"
                      : reached
                        ? "border-primary/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(220,252,231,0.9))] text-primary-dark"
                        : "border-text-heading/10 bg-white/65 text-text-muted"
                  }`}
                  animate={
                    current && !reduceMotion
                      ? {
                          scale: [1, 1.08, 1],
                          rotate: advanced ? [45, 48, 45] : 0,
                        }
                      : { scale: 1, rotate: advanced ? 45 : 0 }
                  }
                  transition={
                    current && !reduceMotion
                      ? { duration: 1.7, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.25 }
                  }
                >
                  {advanced && current ? (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute -inset-2 rounded-[0.95rem] border border-primary/30"
                      animate={
                        reduceMotion
                          ? { opacity: 0.6 }
                          : {
                              scale: [0.85, 1.2],
                              opacity: [0.75, 0],
                              rotate: [0, 90],
                            }
                      }
                      transition={{
                        duration: 1.45,
                        repeat: reduceMotion ? 0 : Infinity,
                        ease: "easeOut",
                      }}
                    />
                  ) : null}
                  {advanced && StepIcon ? (
                    <>
                      <span className="-rotate-45">
                        <StepIcon size={18} strokeWidth={2} />
                      </span>
                      {current ? (
                        <motion.span
                          aria-hidden
                          className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-white"
                          animate={
                            reduceMotion
                              ? { opacity: 1 }
                              : { opacity: [0.35, 1, 0.35], scale: [0.8, 1.2, 0.8] }
                          }
                          transition={{
                            duration: 1.1,
                            repeat: reduceMotion ? 0 : Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      ) : null}
                    </>
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </motion.span>

                <span
                  className={`mt-4 text-sm font-bold tracking-tight transition-colors duration-300 ${
                    current
                      ? "text-primary"
                      : reached
                        ? "text-text-heading"
                        : "text-text-heading/50"
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`mt-1 max-w-[126px] text-xs leading-5 transition-colors duration-300 ${
                    reached ? "text-text-muted" : "text-text-muted/70"
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
                  className={`relative mt-3 flex min-w-8 flex-1 items-center justify-center ${
                    connectorLive || current ? "text-primary" : "text-primary/20"
                  }`}
                >
                  {advanced ? (
                    <>
                      <span className="pointer-events-none absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-primary/5 via-primary/25 to-primary/5" />
                      {current ? (
                        <motion.span
                          className="pointer-events-none absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_rgba(16,185,129,0.95)]"
                          animate={
                            reduceMotion
                              ? { left: "50%", opacity: 0.8 }
                              : { left: ["10%", "88%"], opacity: [0, 1, 1, 0] }
                          }
                          transition={{
                            duration: 0.9,
                            repeat: reduceMotion ? 0 : Infinity,
                            ease: "linear",
                          }}
                        />
                      ) : null}
                    </>
                  ) : null}
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
                    className="relative z-10 inline-flex bg-white/70 px-1 backdrop-blur-sm"
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
