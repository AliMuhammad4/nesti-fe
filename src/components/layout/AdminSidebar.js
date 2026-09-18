"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  Building2,
  BarChart3,
  Handshake,
  Home,
  CreditCard,
  LogOut,
  X,
  ClipboardList,
  Shield,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { logoutAndClearAll } from "@/store/actions";
import { useAdminOverview } from "@/hooks/useAdminApi";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", href: "/admin", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { id: "verifications", label: "Verifications", href: "/admin/verifications", icon: Shield },
  { id: "professionals", label: "Professionals", href: "/admin/professionals", icon: Building2 },
  { id: "clients", label: "Clients", href: "/admin/clients", icon: UserRound },
  { id: "leads", label: "Leads", href: "/admin/leads", icon: ClipboardList },
  { id: "properties", label: "Properties", href: "/admin/properties", icon: Home },
  { id: "subscriptions", label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { id: "referrals", label: "Referrals", href: "/admin/referrals", icon: Handshake },
];

function isActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({ isMobileOpen = false, onCloseMobile }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Admin";
  const overviewQuery = useAdminOverview();
  const pendingVerifications = Number(overviewQuery.data?.kpis?.verifications?.pending_review || 0);

  const handleLogout = () => {
    dispatch(logoutAndClearAll());
    router.replace("/log-in");
  };

  const sidebar = (
    <aside className="flex h-full w-[15.5rem] flex-col border-r border-slate-800/90 bg-[#0b1220] text-slate-200">
      <div className="flex h-16 items-center justify-between border-b border-slate-800/90 px-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
            <Image src="/logo/logo.png" alt="Nesti" width={20} height={20} className="rounded" />
          </span>
          <div className="text-left">
            <div className="text-[13px] font-semibold tracking-tight text-white">Nesti Admin</div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Control center</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-700 text-slate-300 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={14} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const showPendingBadge = item.id === "verifications" && pendingVerifications > 0;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition duration-200 ${
                active
                  ? "bg-white text-slate-900 shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={15} strokeWidth={active ? 2.25 : 2} />
              <span className="flex-1">{item.label}</span>
              {showPendingBadge ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                    active ? "bg-slate-900 text-white" : "bg-amber-400/90 text-slate-900"
                  }`}
                >
                  {pendingVerifications > 99 ? "99+" : pendingVerifications}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-800/90 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
            <Shield size={14} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold text-white">{displayName}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">Administrator</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-rose-300 transition hover:bg-rose-500/10"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">{sidebar}</div>
      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            aria-label="Close sidebar overlay"
            onClick={onCloseMobile}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl shadow-black/40">{sidebar}</div>
        </div>
      ) : null}
    </>
  );
}
