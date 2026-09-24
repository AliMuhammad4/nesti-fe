"use client";

import { motion } from "framer-motion";

const cardVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function toAbsoluteUrl(value) {
  const str = String(value || "").trim();
  if (!str) return "";
  if (/^https?:\/\//i.test(str)) return str;
  return `https://${str.replace(/^\/+/, "")}`;
}

function formatUrlLabel(value, maxLength = 48) {
  const str = String(value || "").trim();
  if (!str) return "";
  try {
    const parsed = new URL(toAbsoluteUrl(str));
    const host = parsed.hostname.replace(/^www\./i, "");
    const pathQuery = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    const path = pathQuery === "/" ? "" : pathQuery;
    const display = path ? `${host}${path}` : host;
    if (display.length <= maxLength) return display;
    return `${display.slice(0, maxLength - 1)}…`;
  } catch {
    const fallback = str.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    if (fallback.length <= maxLength) return fallback;
    return `${fallback.slice(0, maxLength - 1)}…`;
  }
}

function FieldValue({ label, value }) {
  const empty = value === undefined || value === null || value === "";
  if (empty && value !== 0) {
    return <span className="text-sm italic text-slate-400">Not provided</span>;
  }
  const str = String(value);

  if (label === "Full Name") {
    return (
      <p className="text-[15px] font-semibold leading-snug text-slate-900 [overflow-wrap:anywhere]">
        {str}
      </p>
    );
  }

  if (label === "Email" && str.includes("@")) {
    return (
      <a
        href={`mailto:${str}`}
        className="text-[15px] font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 transition hover:text-emerald-700 hover:decoration-emerald-400 [overflow-wrap:anywhere]"
      >
        {str}
      </a>
    );
  }

  const looksLikeUrl =
    /^https?:\/\//i.test(str) ||
    (label === "Website" && (str.includes(".") || str.includes("/"))) ||
    (label === "Calendly" && (str.includes(".") || str.includes("/")));

  if (looksLikeUrl) {
    return (
      <a
        href={toAbsoluteUrl(str)}
        target="_blank"
        rel="noopener noreferrer"
        title={str}
        className="block max-w-full truncate text-[15px] font-medium text-emerald-700 underline decoration-emerald-200 underline-offset-2 transition hover:text-emerald-800 hover:decoration-emerald-400"
      >
        {formatUrlLabel(str)}
      </a>
    );
  }

  return (
    <p className="text-[15px] font-medium leading-snug text-slate-900 [overflow-wrap:anywhere]">
      {str}
    </p>
  );
}

export const InfoCard = ({ children, delay = 0 }) => (
  <motion.div
    variants={cardVariants}
    initial="initial"
    animate="animate"
    transition={{ duration: 0.3, delay }}
    className="bg-transparent"
  >
    {children}
  </motion.div>
);

function gridColsClass(columns) {
  if (columns === 1) return "grid-cols-1";
  if (columns === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  if (columns === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2";
}

export const InfoGrid = ({
  items = [],
  className = "",
  compact = false,
  columns = 2,
  fillRow = false,
}) => {
  const count = items.length;
  const cols = Math.max(1, columns);
  const remainder = count % cols;

  return (
    <div
      className={`grid auto-rows-fr ${gridColsClass(cols)} ${
        compact ? "gap-2.5" : "gap-3"
      } ${className}`.trim()}
    >
      {items.map(({ label, value, icon: Icon }, index) => {
        const inPartialLastRow = fillRow && remainder > 0 && index >= count - remainder;
        const spanClass =
          inPartialLastRow && remainder === 1
            ? cols === 3
              ? "sm:col-span-2 lg:col-span-3"
              : "sm:col-span-2"
            : inPartialLastRow && remainder === 2 && cols === 3
              ? index === count - 2
                ? "lg:col-span-2"
                : ""
              : "";

        return (
          <div
            key={label}
            className={`flex h-full items-start gap-3.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-slate-300 ${spanClass}`}
          >
            {Icon ? (
              <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200/80">
                <Icon size={16} strokeWidth={2} />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
              </p>
              <div className="mt-1">
                <FieldValue label={label} value={value} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Multi-column checklist — no empty trailing slots. */
export const DetailList = ({
  label,
  items = [],
  emptyLabel = "None listed",
  columns = 3,
}) => {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-2 text-sm italic text-slate-400">{emptyLabel}</p>
      </div>
    );
  }

  const cols =
    columns === 1
      ? 1
      : columns === 2
        ? 2
        : items.length % 3 === 0
          ? 3
          : items.length % 2 === 0
            ? 2
            : items.length % 3 === 2
              ? 3
              : 2;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
      <div className="mb-3 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{items.length} listed</p>
      </div>
      <ul
        className={`grid gap-2.5 ${
          cols === 1
            ? "grid-cols-1"
            : cols === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {items.map((item) => (
          <li
            key={`${label}-${item}`}
            className="flex min-h-[3.25rem] items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 px-3.5 py-3"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
            <p className="text-[14px] font-medium leading-snug text-slate-800 [overflow-wrap:anywhere]">
              {item}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ChipList = ({ label, items, columns = 3 }) => (
  <DetailList label={label} items={items} columns={columns} />
);
