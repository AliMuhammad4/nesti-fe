'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BadgeCheck,
  Banknote,
  Bath,
  BedDouble,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck,
  Camera,
  ChartColumn,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Compass,
  DoorOpen,
  FileCheck2,
  FileText,
  Gavel,
  Globe2,
  Handshake,
  HardHat,
  HeartHandshake,
  Home,
  KeyRound,
  Landmark,
  Layers,
  LineChart,
  MapPinned,
  Megaphone,
  MessageCircle,
  NotebookPen,
  Paintbrush,
  Percent,
  PhoneCall,
  PiggyBank,
  Ruler,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { inputClass } from './builderUiPrimitives';

/** Shared catalog for service-card icons (builder + public renderers). */
export const SERVICE_ICON_CATALOG = [
  { value: 'target', label: 'Target', Icon: Target },
  { value: 'building', label: 'Building', Icon: Building2 },
  { value: 'home', label: 'Home', Icon: Home },
  { value: 'percent', label: 'Percent', Icon: Percent },
  { value: 'handshake', label: 'Handshake', Icon: Handshake },
  { value: 'shield', label: 'Shield', Icon: ShieldCheck },
  { value: 'key', label: 'Key', Icon: KeyRound },
  { value: 'search', label: 'Search', Icon: Search },
  { value: 'map', label: 'Map pin', Icon: MapPinned },
  { value: 'compass', label: 'Compass', Icon: Compass },
  { value: 'users', label: 'Users', Icon: Users },
  { value: 'briefcase', label: 'Briefcase', Icon: Briefcase },
  { value: 'calculator', label: 'Calculator', Icon: Calculator },
  { value: 'wallet', label: 'Wallet', Icon: Wallet },
  { value: 'banknote', label: 'Banknote', Icon: Banknote },
  { value: 'dollar', label: 'Dollar', Icon: CircleDollarSign },
  { value: 'piggy', label: 'Savings', Icon: PiggyBank },
  { value: 'chart', label: 'Chart', Icon: ChartColumn },
  { value: 'line-chart', label: 'Line chart', Icon: LineChart },
  { value: 'trending', label: 'Trending', Icon: TrendingUp },
  { value: 'landmark', label: 'Landmark', Icon: Landmark },
  { value: 'scale', label: 'Scale', Icon: Scale },
  { value: 'gavel', label: 'Gavel', Icon: Gavel },
  { value: 'file', label: 'Document', Icon: FileText },
  { value: 'contract', label: 'Contract', Icon: FileCheck2 },
  { value: 'clipboard', label: 'Clipboard', Icon: ClipboardList },
  { value: 'notebook', label: 'Notebook', Icon: NotebookPen },
  { value: 'calendar', label: 'Calendar', Icon: CalendarCheck },
  { value: 'phone', label: 'Phone', Icon: PhoneCall },
  { value: 'message', label: 'Message', Icon: MessageCircle },
  { value: 'megaphone', label: 'Megaphone', Icon: Megaphone },
  { value: 'camera', label: 'Camera', Icon: Camera },
  { value: 'sparkles', label: 'Sparkles', Icon: Sparkles },
  { value: 'star', label: 'Star', Icon: Star },
  { value: 'award', label: 'Award', Icon: Award },
  { value: 'badge', label: 'Badge', Icon: BadgeCheck },
  { value: 'check', label: 'Check', Icon: CheckCircle2 },
  { value: 'heart', label: 'Care', Icon: HeartHandshake },
  { value: 'globe', label: 'Globe', Icon: Globe2 },
  { value: 'layers', label: 'Layers', Icon: Layers },
  { value: 'door', label: 'Door', Icon: DoorOpen },
  { value: 'bed', label: 'Bedroom', Icon: BedDouble },
  { value: 'bath', label: 'Bathroom', Icon: Bath },
  { value: 'ruler', label: 'Ruler', Icon: Ruler },
  { value: 'paint', label: 'Paint', Icon: Paintbrush },
  { value: 'wrench', label: 'Wrench', Icon: Wrench },
  { value: 'hardhat', label: 'Hard hat', Icon: HardHat },
];

export const SERVICE_ICON_DEFAULTS = [
  'target',
  'building',
  'home',
  'percent',
  'handshake',
  'shield',
];

const iconLookup = Object.fromEntries(
  SERVICE_ICON_CATALOG.map((entry) => [entry.value, entry]),
);

export function getServiceIconEntry(value) {
  return iconLookup[value] || iconLookup.target;
}

export function getServiceIconComponent(value) {
  return getServiceIconEntry(value).Icon;
}

export function resolveServiceIconKey(value, index = 0) {
  if (value && iconLookup[value]) return value;
  return SERVICE_ICON_DEFAULTS[index % SERVICE_ICON_DEFAULTS.length];
}

/** Dropdown with search + large icon grid for service cards. */
export function ServiceIconDropdown({ value, onChange, ariaLabel = 'Card icon' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const selectedKey = resolveServiceIconKey(value);
  const selected = getServiceIconEntry(selectedKey);
  const SelectedIcon = selected.Icon;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return SERVICE_ICON_CATALOG;
    return SERVICE_ICON_CATALOG.filter((entry) => (
      entry.label.toLowerCase().includes(needle)
      || entry.value.toLowerCase().includes(needle)
    ));
  }, [query]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => searchRef.current?.focus(), 20);
      const frame = window.requestAnimationFrame(() => {
        menuRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
      return () => {
        window.clearTimeout(timer);
        window.cancelAnimationFrame(frame);
      };
    }
    return undefined;
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`${inputClass} flex items-center justify-between gap-3 text-left`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <SelectedIcon size={15} />
          </span>
          <span className="truncate text-sm font-medium text-slate-800">{selected.label}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-primary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          ref={menuRef}
          className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-primary/20 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
        >
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search icons…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-[12px] text-slate-800 outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-2">
            {filtered.length ? (
              <div className="grid grid-cols-6 gap-1.5">
                {filtered.map(({ value: iconValue, label, Icon }) => {
                  const active = selectedKey === iconValue;
                  return (
                    <button
                      key={iconValue}
                      type="button"
                      title={label}
                      aria-label={label}
                      aria-pressed={active}
                      onClick={() => {
                        onChange(iconValue);
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`grid aspect-square place-items-center rounded-lg border transition ${
                        active
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/25'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="px-2 py-6 text-center text-[11px] text-slate-500">
                No icons match “{query.trim()}”.
              </p>
            )}
          </div>
          <div className="border-t border-slate-100 px-2.5 py-1.5 text-[10px] text-slate-400">
            {filtered.length} of {SERVICE_ICON_CATALOG.length} icons
          </div>
        </div>
      ) : null}
    </div>
  );
}
