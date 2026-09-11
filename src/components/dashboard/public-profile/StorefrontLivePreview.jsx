import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { STOREFRONT_BLOCK_TYPES } from '@/components/storefront/storefrontPresets';
import { blockLabel } from './editorConstants';

export default function StorefrontLivePreview({ profile, professionalProfile, user, displayName, roleLabel, editorData, previewMode, onPreviewModeChange }) {
  const primary = editorData.brand_kit.primary_color || '#0f766e';
  const accent = editorData.brand_kit.accent_color || '#f59e0b';
  const name = editorData.brand_kit.business_name || professionalProfile?.company_name || displayName;
  const activeBlocks = editorData.blocks.filter((block) => block.enabled);
  const hero = activeBlocks.find((block) => block.type === STOREFRONT_BLOCK_TYPES.HERO);
  const headline = hero?.content?.heading || profile?.headline || 'Guidance that moves you forward';
  const tagline = hero?.content?.body || profile?.tagline || `Personalized ${roleLabel.toLowerCase()} support for every step.`;
  const canvasWidth = previewMode === 'mobile' ? 'max-w-[390px]' : previewMode === 'tablet' ? 'max-w-[720px]' : 'max-w-none';

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
        <div>
          <p className="text-xs font-semibold text-slate-800">Live website preview</p>
          <p className="text-[10px] text-slate-500">Updates as you edit</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {[
            { id: 'desktop', label: 'Desktop', Icon: Monitor },
            { id: 'tablet', label: 'Tablet', Icon: Tablet },
            { id: 'mobile', label: 'Mobile', Icon: Smartphone },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={`${label} preview`}
              onClick={() => onPreviewModeChange(id)}
              className={`grid h-7 w-7 place-items-center rounded-md transition ${previewMode === id ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-slate-200/70 p-3 sm:p-5">
        <div className={`mx-auto overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5 transition-all duration-200 ${canvasWidth}`} style={{ fontFamily: editorData.brand_kit.font || 'Inter, sans-serif' }}>
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="flex min-w-0 items-center gap-2 text-sm font-bold" style={{ color: primary }}>
              {editorData.brand_kit.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editorData.brand_kit.logo_url} alt="" className="h-6 w-6 rounded object-contain" />
              ) : null}
              <span className="max-w-[50%] truncate">{name}</span>
            </span>
            <div className="flex gap-3 text-[10px] font-medium text-slate-500"><span>About</span><span>Services</span><span>Contact</span></div>
          </header>
          <section className="relative overflow-hidden px-5 py-12 sm:px-8" style={{ background: user?.cover_image || profile?.cover_photo_url ? `linear-gradient(90deg, ${primary}e8, #0f172ae8), url(${user?.cover_image || profile?.cover_photo_url}) center/cover` : `linear-gradient(135deg, ${primary}, #0f172a)` }}>
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20" style={{ backgroundColor: accent }} />
            <div className="relative max-w-xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">{roleLabel}</p>
              {(user?.profile_image || profile?.profile_photo_url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user?.profile_image || profile?.profile_photo_url} alt="" className="mb-3 h-10 w-10 rounded-full border-2 border-white/70 object-cover" />
              ) : null}
              <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{headline}</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">{tagline}</p>
              <button type="button" className="mt-5 px-4 py-2 text-xs font-bold text-slate-900 shadow-sm" style={{ backgroundColor: accent, borderRadius: editorData.brand_kit.button_shape === 'pill' ? 999 : editorData.brand_kit.button_shape === 'square' ? 2 : 8 }}>
                {hero?.content?.cta_label || editorData.brand_kit.essentials?.consultation_cta || 'Book a consultation'}
              </button>
            </div>
          </section>
          <div className="space-y-3 p-4">
            {activeBlocks.filter((block) => block.type !== STOREFRONT_BLOCK_TYPES.HERO).slice(0, 6).map((block) => (
              <section key={block.id} className="rounded-lg border border-slate-100 p-3">
                <p className="text-sm font-bold text-slate-800">{block.content?.heading || blockLabel(block.type)}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{block.content?.body || `A personalized ${blockLabel(block.type).toLowerCase()} section for this storefront.`}</p>
              </section>
            ))}
            {!activeBlocks.length && <p className="py-10 text-center text-sm text-slate-500">Turn on a Business Block to see it here.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
