"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Building2,
  Settings,
  LogOut,
  X,
  User,
  CreditCard,
  TrendingUp,
  UserRound,
  Briefcase,
  Scale,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store";
import { logoutAndClearAll } from "@/store/actions";
import { PUBLIC_HOME_PATH, navigateToPublicHome } from "@/lib/workspaceNavigation";

const CLIENT_SETTINGS_ITEMS = [
  { id: "personal", label: "Personal Information", tab: "personal", icon: User },
];

function NavIconTile({ Icon, variant = "idle" }) {
  const wrap =
    variant === "active"
      ? "bg-gradient-to-br from-primary via-primary to-primary-dark text-white shadow-[0_4px_14px_rgba(52,199,89,0.38)] ring-1 ring-white/35"
      : variant === "soft"
        ? "bg-gradient-to-br from-primary/35 to-primary/12 text-primary-dark shadow-[inset_0_-1px_0_rgba(42,168,74,0.14)] ring-1 ring-primary/28"
        : "bg-gradient-to-br from-background-lighter to-white text-text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-border/55 group-hover:from-primary/[0.16] group-hover:to-white group-hover:text-primary-dark group-hover:ring-primary/28 group-hover:shadow-[0_2px_8px_rgba(52,199,89,0.12)]";

  return (
    <span
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ease-out ${wrap}`}
      aria-hidden
    >
      <Icon
        size={variant === "active" ? 16 : 15}
        strokeWidth={2}
        className={
          variant === "idle"
            ? "transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-translate-y-px"
            : "drop-shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
        }
      />
    </span>
  );
}

function SettingsSubIcon({ Icon, active }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all duration-200 ${
        active
          ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-[0_2px_8px_rgba(52,199,89,0.3)] ring-1 ring-white/30"
          : "bg-gradient-to-br from-background-lighter to-white text-text-muted ring-1 ring-border/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:from-primary/[0.12] group-hover:text-primary-dark group-hover:ring-primary/22"
      }`}
      aria-hidden
    >
      <Icon size={12} strokeWidth={2} className="transition-transform duration-200 group-hover:scale-105" />
    </span>
  );
}

function isPrimaryNavActive(pathname, searchParams, href) {
  const [rawPath, rawQuery = ""] = href.split("?");
  const hashIdx = rawPath.indexOf("#");
  const path = hashIdx === -1 ? rawPath : rawPath.slice(0, hashIdx);
  
  if (path === "/") return pathname === "/";
  const pathMatches = pathname === path || pathname.startsWith(`${path}/`);
  if (!pathMatches) return false;

  if (!rawQuery) return true;

  const hrefParams = new URLSearchParams(rawQuery);
  for (const [key, value] of hrefParams.entries()) {
    if (searchParams.get(key) !== value) return false;
  }

  return true;
}

export default function ClientSidebar({ isMobileOpen, onCloseMobile }) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const shouldPrefetch = process.env.NODE_ENV === "production";
  const personalInfo = useAppSelector((state) => state.profile.personalInfo);
  const menuRef = useRef(null);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const isSettingsRoute = pathname === "/settings";
  
  useEffect(() => {
    if (isSettingsRoute) setSettingsOpen(true);
    else setSettingsOpen(false);
  }, [isSettingsRoute]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onCloseMobile?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen, onCloseMobile]);

  useEffect(() => {
    if (!isMobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const displayName =
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "User";
  const sidebarAvatarUrl = String(
    user?.profile_image || personalInfo?.profileImage || ""
  ).trim();
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    dispatch(logoutAndClearAll());
    onCloseMobile?.();
    router.replace("/");
  };

  const goToPublicHome = () =>
    navigateToPublicHome(router, pathname, () => {
      setSettingsOpen(false);
      onCloseMobile?.();
    });

  const primaryItemActive = (item) => {
    return isPrimaryNavActive(pathname, searchParams, item.href);
  };

  const sidebarInner = (
    <aside
      ref={menuRef}
      className="flex h-screen w-60 min-h-0 flex-col border-r border-primary/25 shadow-[2px_0_24px_rgba(45,55,72,0.05)]"
      style={{
        background: "linear-gradient(135deg, #F4FCF6 0%, #E8FAEE 48%, #D8F5E2 100%)",
      }}
    >
      <div className="relative shrink-0 border-b border-border/50 px-3 py-2.5">
        <div
          className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          aria-hidden
        />
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={goToPublicHome}
            onMouseEnter={() => {
              if (!shouldPrefetch) return;
              try {
                router.prefetch(PUBLIC_HOME_PATH);
              } catch {}
            }}
            className="relative z-20 group flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent py-0.5 text-left transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Go to Nesti AI home"
          >
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg grid place-items-center transition duration-300 group-hover:scale-[1.03]">
              <Image
                src="/logo/logo.png"
                alt="Nesti AI logo"
                width={32}
                height={32}
                className="relative h-8 w-8 object-cover"
              />
            </span>
            <div className="min-w-0 leading-tight">
              <div className="font-heading text-sm font-bold tracking-tight text-text-heading">
                Nesti AI
              </div>
              <div className="text-[10px] font-medium text-text-muted">Client Portal</div>
            </div>
          </button>
          {isMobileOpen ? (
            <button
              type="button"
              onClick={() => onCloseMobile?.()}
              className="lg:hidden h-8 w-8 shrink-0 rounded-lg border border-border/70 bg-gradient-to-br from-background-lighter to-white text-text-body shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] grid place-items-center transition hover:border-primary/30 hover:text-primary-dark hover:shadow-sm"
              aria-label="Close menu"
            >
              <X size={15} strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Main Navigation */}
        <div className="space-y-0.5">
          <Link
            href="/client-dashboard"
            onClick={() => {
              setSettingsOpen(false);
              onCloseMobile?.();
            }}
            className={`group relative flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-semibold transition-all duration-200 ${
              primaryItemActive({ id: "dashboard", href: "/client-dashboard" })
                ? "bg-gradient-to-r from-primary/14 to-primary/5 text-primary-dark shadow-sm ring-1 ring-primary/10"
                : "text-text-body hover:bg-white/90 hover:text-text-heading hover:ring-1 hover:ring-border/70"
            }`}
            aria-current={primaryItemActive({ id: "dashboard", href: "/client-dashboard" }) ? "page" : undefined}
            onMouseEnter={() => {
              if (!shouldPrefetch) return;
              router.prefetch("/client-dashboard");
            }}
          >
            {primaryItemActive({ id: "dashboard", href: "/client-dashboard" }) && (
              <span
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                aria-hidden
              />
            )}
            <NavIconTile Icon={Home} variant={primaryItemActive({ id: "dashboard", href: "/client-dashboard" }) ? "active" : "idle"} />
            <span className="min-w-0 truncate">Dashboard</span>
          </Link>

          <Link
            href="/client-dashboard/properties"
            onClick={() => {
              setSettingsOpen(false);
              onCloseMobile?.();
            }}
            className={`group relative flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-semibold transition-all duration-200 ${
              pathname === "/client-dashboard/properties"
                ? "bg-gradient-to-r from-primary/14 to-primary/5 text-primary-dark shadow-sm ring-1 ring-primary/10"
                : "text-text-body hover:bg-white/90 hover:text-text-heading hover:ring-1 hover:ring-border/70"
            }`}
            aria-current={pathname === "/client-dashboard/properties" ? "page" : undefined}
            onMouseEnter={() => {
              if (!shouldPrefetch) return;
              router.prefetch("/client-dashboard/properties");
            }}
          >
            {pathname === "/client-dashboard/properties" && (
              <span
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                aria-hidden
              />
            )}
            <NavIconTile Icon={Building2} variant={pathname === "/client-dashboard/properties" ? "active" : "idle"} />
            <span className="min-w-0 truncate">Properties</span>
          </Link>
        </div>

        {/* Find Professionals Section */}
        <div>
          <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted">
            Find Professionals
          </p>
          <div className="space-y-0.5">
            <Link
              href="/professionals?role=agent"
              onClick={() => {
                setSettingsOpen(false);
                onCloseMobile?.();
              }}
              className={`group relative flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-semibold transition-all duration-200 ${
                primaryItemActive({ href: "/professionals?role=agent" })
                  ? "bg-gradient-to-r from-primary/14 to-primary/5 text-primary-dark shadow-sm ring-1 ring-primary/10"
                  : "text-text-body hover:bg-white/90 hover:text-text-heading hover:ring-1 hover:ring-border/70"
              }`}
              aria-current={primaryItemActive({ href: "/professionals?role=agent" }) ? "page" : undefined}
              onMouseEnter={() => {
                if (!shouldPrefetch) return;
                router.prefetch("/professionals?role=agent");
              }}
            >
              {primaryItemActive({ href: "/professionals?role=agent" }) && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                  aria-hidden
                />
              )}
              <NavIconTile Icon={UserRound} variant={primaryItemActive({ href: "/professionals?role=agent" }) ? "active" : "idle"} />
              <span className="min-w-0 truncate">Agents</span>
            </Link>

            <Link
              href="/professionals?role=lawyer"
              onClick={() => {
                setSettingsOpen(false);
                onCloseMobile?.();
              }}
              className={`group relative flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-semibold transition-all duration-200 ${
                primaryItemActive({ href: "/professionals?role=lawyer" })
                  ? "bg-gradient-to-r from-primary/14 to-primary/5 text-primary-dark shadow-sm ring-1 ring-primary/10"
                  : "text-text-body hover:bg-white/90 hover:text-text-heading hover:ring-1 hover:ring-border/70"
              }`}
              aria-current={primaryItemActive({ href: "/professionals?role=lawyer" }) ? "page" : undefined}
              onMouseEnter={() => {
                if (!shouldPrefetch) return;
                router.prefetch("/professionals?role=lawyer");
              }}
            >
              {primaryItemActive({ href: "/professionals?role=lawyer" }) && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                  aria-hidden
                />
              )}
              <NavIconTile Icon={Scale} variant={primaryItemActive({ href: "/professionals?role=lawyer" }) ? "active" : "idle"} />
              <span className="min-w-0 truncate">Lawyers</span>
            </Link>

            <Link
              href="/professionals?role=mortgage_broker"
              onClick={() => {
                setSettingsOpen(false);
                onCloseMobile?.();
              }}
              className={`group relative flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-semibold transition-all duration-200 ${
                primaryItemActive({ href: "/professionals?role=mortgage_broker" })
                  ? "bg-gradient-to-r from-primary/14 to-primary/5 text-primary-dark shadow-sm ring-1 ring-primary/10"
                  : "text-text-body hover:bg-white/90 hover:text-text-heading hover:ring-1 hover:ring-border/70"
              }`}
              aria-current={primaryItemActive({ href: "/professionals?role=mortgage_broker" }) ? "page" : undefined}
              onMouseEnter={() => {
                if (!shouldPrefetch) return;
                router.prefetch("/professionals?role=mortgage_broker");
              }}
            >
              {primaryItemActive({ href: "/professionals?role=mortgage_broker" }) && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                  aria-hidden
                />
              )}
              <NavIconTile Icon={Briefcase} variant={primaryItemActive({ href: "/professionals?role=mortgage_broker" }) ? "active" : "idle"} />
              <span className="min-w-0 truncate">Mortgage Brokers</span>
            </Link>
          </div>
        </div>

        {/* My Journey Section */}
        <div>
          <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted">
            My Journey
          </p>
          <div className="space-y-0.5">
            <Link
              href="/client-dashboard/progress"
              onClick={() => {
                setSettingsOpen(false);
                onCloseMobile?.();
              }}
              className={`group relative flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-semibold transition-all duration-200 ${
                pathname === '/client-dashboard/progress'
                  ? "bg-gradient-to-r from-primary/14 to-primary/5 text-primary-dark shadow-sm ring-1 ring-primary/10"
                  : "text-text-body hover:bg-white/90 hover:text-text-heading hover:ring-1 hover:ring-border/70"
              }`}
              aria-current={pathname === '/client-dashboard/progress' ? "page" : undefined}
            >
              {pathname === '/client-dashboard/progress' && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                  aria-hidden
                />
              )}
              <NavIconTile Icon={TrendingUp} variant={pathname === '/client-dashboard/progress' ? "active" : "idle"} />
              <span className="min-w-0 truncate">My Progress</span>
            </Link>

            <Link
              href="/client-dashboard/subscription"
              onClick={() => {
                setSettingsOpen(false);
                onCloseMobile?.();
              }}
              className={`group relative flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-semibold transition-all duration-200 ${
                pathname === '/client-dashboard/subscription'
                  ? "bg-gradient-to-r from-primary/14 to-primary/5 text-primary-dark shadow-sm ring-1 ring-primary/10"
                  : "text-text-body hover:bg-white/90 hover:text-text-heading hover:ring-1 hover:ring-border/70"
              }`}
              aria-current={pathname === '/client-dashboard/subscription' ? "page" : undefined}
            >
              {pathname === '/client-dashboard/subscription' && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                  aria-hidden
                />
              )}
              <NavIconTile Icon={CreditCard} variant={pathname === '/client-dashboard/subscription' ? "active" : "idle"} />
              <span className="min-w-0 truncate">Subscription</span>
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted">
            Account
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={`group flex w-full items-center justify-between rounded-lg px-2 py-2 text-[13px] font-semibold transition-all duration-200 ${
                settingsOpen
                  ? "bg-gradient-to-r from-primary/14 to-primary/5 text-primary-dark shadow-sm ring-1 ring-primary/10"
                  : "text-text-body hover:bg-white/90 hover:text-text-heading hover:ring-1 hover:ring-border/70"
              }`}
              aria-expanded={settingsOpen}
            >
              <span className="flex items-center gap-2">
                <NavIconTile Icon={Settings} variant={settingsOpen ? "active" : "idle"} />
                Settings
              </span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                className={`shrink-0 text-text-muted transition-transform duration-200 ${
                  settingsOpen ? "rotate-180 text-primary-dark" : ""
                }`}
              >
                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
              </svg>
            </button>

            <AnimatePresence initial={false}>
              {settingsOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="overflow-hidden"
                >
                  <div className="ml-2 mt-0.5 space-y-0.5 rounded-lg border border-border/60 bg-white/80 py-1.5 pl-2 pr-1">
                    {CLIENT_SETTINGS_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const href = item.href || `/settings?tab=${item.tab}`;
                      const tabActive = item.href
                        ? pathname === item.href || pathname.startsWith(item.href)
                        : pathname === "/settings" && searchParams.get("tab") === item.tab;
                      return (
                        <Link
                          key={item.id}
                          href={href}
                          onClick={() => {
                            onCloseMobile?.();
                          }}
                          onMouseEnter={() => {
                            if (!shouldPrefetch) return;
                            router.prefetch(href);
                          }}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-semibold leading-snug transition ${
                            tabActive
                              ? "bg-primary/12 text-primary-dark ring-1 ring-primary/12"
                              : "text-text-body hover:bg-primary/5"
                          }`}
                          aria-current={tabActive ? "page" : undefined}
                        >
                          <SettingsSubIcon Icon={Icon} active={tabActive} />
                          <span className="min-w-0 truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div
        className="shrink-0 border-t border-primary/25 p-2.5"
        style={{
          background: "linear-gradient(135deg, #F4FCF6 0%, #E8FAEE 48%, #D8F5E2 100%)",
        }}
      >
        <div className="flex items-stretch gap-2 rounded-xl border border-border/70 bg-white px-2 py-1.5 shadow-sm">
          <Link
            href="/settings?tab=personal"
            onClick={() => {
              onCloseMobile?.();
            }}
            className="group relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-primary-dark text-[11px] font-bold text-white shadow-[0_3px_12px_rgba(52,199,89,0.35)] ring-2 ring-white transition duration-200 hover:scale-[1.02]"
            title="Personal settings"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-70" aria-hidden />
            {sidebarAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sidebarAvatarUrl}
                alt=""
                className="relative h-full w-full object-cover"
              />
            ) : (
              <span className="relative">{initials || "U"}</span>
            )}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="group ml-auto inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200/90 bg-white px-3 text-[11px] font-bold leading-none text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 transition group-hover:bg-red-100 group-hover:ring-red-200/80">
              <LogOut size={12} strokeWidth={2} />
            </span>
            <span className="truncate">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div
        className="hidden lg:block fixed inset-y-0 left-0 z-[100]"
        style={{
          background: "linear-gradient(135deg, #F4FCF6 0%, #E8FAEE 48%, #D8F5E2 100%)",
        }}
      >
        {sidebarInner}
      </div>
      <AnimatePresence>
        {isMobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[70] lg:hidden"
              onClick={() => onCloseMobile?.()}
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-[80] lg:hidden"
            >
              {sidebarInner}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
