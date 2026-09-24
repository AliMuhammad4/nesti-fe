"use client";

import { usePathname } from "next/navigation";

/**
 * Most admin pages get standard inset padding.
 * Professional detail (/admin/professionals/[id]) is full-bleed so the
 * header, tabs, and tab panels can use the full workspace width.
 */
export default function AdminSectionLayout({ children }) {
  const pathname = usePathname() || "";
  const isProfessionalDetail = /^\/admin\/professionals\/[^/]+\/?$/.test(pathname);

  return (
    <div
      className={
        isProfessionalDetail
          ? "w-full min-w-0"
          : "admin-page-inset w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
      }
    >
      {children}
    </div>
  );
}
