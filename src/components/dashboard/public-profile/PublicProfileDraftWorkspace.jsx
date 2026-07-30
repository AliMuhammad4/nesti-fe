import { Check, Copy, Globe2, Plus, Sparkles } from 'lucide-react';
import { STOREFRONT_BLOCK_TYPES } from '@/components/storefront/storefrontPresets';
import { BlockEditor, ColorInput, EditorCard, EditorField, MediaUploadControl } from './EditorPrimitives';
import { blockLabel, editorInputClass, ESSENTIAL_QUESTIONS, TEMPLATE_GROUPS } from './editorConstants';
import PublicProfileEmptyState from './PublicProfileEmptyState';
import StorefrontLivePreview from './StorefrontLivePreview';

export default function PublicProfileDraftWorkspace({
  editorData,
  publicUrl,
  copied,
  onCopyPublicUrl,
  selectTemplate,
  updateBrandKit,
  updateEssential,
  uploadMediaPending,
  uploadStorefrontMedia,
  moveBlock,
  updateBlock,
  removeBlock,
  draggedBlockId,
  setDraggedBlockId,
  moveBlockTo,
  addBlock,
  profile,
  professionalProfile,
  user,
  displayName,
  roleLabel,
  previewMode,
  onPreviewModeChange,
}) {
  if (!editorData) return <PublicProfileEmptyState />;

  return (
    <div className="border-t border-slate-100 p-3 sm:p-4">
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
          <Sparkles size={13} />
          Storefront editor
        </div>
        <h2 className="mt-1 text-lg font-semibold text-slate-800">Build your public page</h2>
        <p className="mt-1 text-xs leading-5 text-text-muted">
          Changes on the left appear in the live website preview immediately. Save when you are ready to keep the draft.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Globe2 size={15} className="shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">{publicUrl || 'Your public URL will be ready when this draft is saved'}</span>
        <button type="button" onClick={onCopyPublicUrl} disabled={!publicUrl} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm disabled:opacity-40">
          {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.62fr)_minmax(0,1.38fr)]">
        <aside className="space-y-4 xl:sticky xl:top-3 xl:h-[calc(100vh-1.5rem)] xl:overflow-y-auto xl:pr-2">
          <div className="space-y-4">
            <EditorCard title="Template" description="Templates are grouped by the professional role they were designed for.">
              <select
                value={editorData.template_key}
                onChange={(event) => selectTemplate(event.target.value)}
                className={editorInputClass}
              >
                {TEMPLATE_GROUPS.map((group) => (
                  <optgroup key={group.role} label={group.label}>
                    {group.templates.map((template) => (
                      <option key={template.key} value={template.key}>{template.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </EditorCard>

            <EditorCard title="Brand Kit" description="These settings travel with your page and can be refined later.">
              <div className="grid gap-3 sm:grid-cols-2">
                <EditorField label="Business name">
                  <input value={editorData.brand_kit.business_name} onChange={(e) => updateBrandKit({ business_name: e.target.value })} className={editorInputClass} placeholder="Acme Realty" />
                </EditorField>
                <EditorField label="Font">
                  <select value={editorData.brand_kit.font} onChange={(e) => updateBrandKit({ font: e.target.value })} className={editorInputClass}>
                    {['Inter', 'Manrope', 'Playfair Display', 'DM Sans'].map((font) => <option key={font}>{font}</option>)}
                  </select>
                </EditorField>
                <EditorField label="Light logo URL">
                  <input type="url" value={editorData.brand_kit.logo_url} onChange={(e) => updateBrandKit({ logo_url: e.target.value })} className={editorInputClass} placeholder="https://…" />
                </EditorField>
                <EditorField label="Dark logo URL">
                  <input type="url" value={editorData.brand_kit.logo_dark_url} onChange={(e) => updateBrandKit({ logo_dark_url: e.target.value })} className={editorInputClass} placeholder="https://…" />
                </EditorField>
                <EditorField label="Primary color">
                  <ColorInput value={editorData.brand_kit.primary_color} onChange={(value) => updateBrandKit({ primary_color: value })} />
                </EditorField>
                <EditorField label="Accent color">
                  <ColorInput value={editorData.brand_kit.accent_color} onChange={(value) => updateBrandKit({ accent_color: value })} />
                </EditorField>
                <EditorField label="Page background">
                  <ColorInput value={editorData.brand_kit.page_background || '#ffffff'} onChange={(value) => updateBrandKit({ page_background: value })} />
                </EditorField>
                <EditorField label="Button shape">
                  <select value={editorData.brand_kit.button_shape} onChange={(e) => updateBrandKit({ button_shape: e.target.value })} className={editorInputClass}>
                    <option value="square">Square</option><option value="rounded">Rounded</option><option value="pill">Pill</option>
                  </select>
                </EditorField>
                <EditorField label="Image style">
                  <select value={editorData.brand_kit.image_style} onChange={(e) => updateBrandKit({ image_style: e.target.value })} className={editorInputClass}>
                    <option value="editorial">Editorial</option><option value="warm">Warm & inviting</option><option value="minimal">Minimal</option><option value="bold">Bold</option>
                  </select>
                </EditorField>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <MediaUploadControl
                  label="Brand logo"
                  imageUrl={editorData.brand_kit.logo_url}
                  busy={uploadMediaPending}
                  onUpload={(file) => uploadStorefrontMedia('logo', file)}
                />
                <MediaUploadControl
                  label="Page cover photo"
                  imageUrl={editorData.brand_kit.cover_url}
                  busy={uploadMediaPending}
                  onUpload={(file) => uploadStorefrontMedia('cover', file)}
                />
                <MediaUploadControl
                  label="Page profile photo"
                  imageUrl={editorData.brand_kit.profile_photo_url}
                  busy={uploadMediaPending}
                  onUpload={(file) => uploadStorefrontMedia('profile', file)}
                  circle
                />
                <p className="sm:col-span-3 text-[11px] leading-4 text-slate-500">
                  Cover and profile photos here apply only to this professional page, not your account-wide profile.
                </p>
              </div>
            </EditorCard>
          </div>

          <div className="space-y-4">
            <EditorCard title="Onboarding essentials" description="Answer these ten prompts to give your page a clear point of view.">
              <div className="grid gap-3 sm:grid-cols-2">
                {ESSENTIAL_QUESTIONS.map((question) => (
                  <EditorField key={question.key} label={question.label}>
                    <input
                      value={editorData.brand_kit.essentials?.[question.key] || ''}
                      onChange={(e) => updateEssential(question.key, e.target.value)}
                      className={editorInputClass}
                      placeholder={question.placeholder}
                    />
                  </EditorField>
                ))}
              </div>
            </EditorCard>

            <EditorCard title="Business Blocks" description="Switch sections on or off, reorder them, or add a new section.">
              <div className="space-y-2">
                {editorData.blocks.map((block, index) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    isFirst={index === 0}
                    isLast={index === editorData.blocks.length - 1}
                    onMove={(direction) => moveBlock(index, direction)}
                    onUpdate={updateBlock}
                    onRemove={removeBlock}
                    isDragging={draggedBlockId === block.id}
                    onDragStart={() => setDraggedBlockId(block.id)}
                    onDragEnd={() => setDraggedBlockId(null)}
                    onDrop={() => {
                      moveBlockTo(draggedBlockId, block.id);
                      setDraggedBlockId(null);
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <select defaultValue="" onChange={(e) => { addBlock(e.target.value); e.target.value = ''; }} className={editorInputClass}>
                  <option value="" disabled>Add a block…</option>
                  {Object.values(STOREFRONT_BLOCK_TYPES).map((type) => <option key={type} value={type}>{blockLabel(type)}</option>)}
                </select>
                <span className="inline-flex items-center rounded-lg border border-slate-200 px-2 text-slate-400"><Plus size={16} /></span>
              </div>
            </EditorCard>
          </div>
        </aside>

        <div className="min-w-0 xl:sticky xl:top-3 xl:h-[calc(100vh-1.5rem)] xl:self-start">
          <StorefrontLivePreview
            profile={profile}
            professionalProfile={professionalProfile}
            user={user}
            displayName={displayName}
            roleLabel={roleLabel}
            editorData={editorData}
            previewMode={previewMode}
            onPreviewModeChange={onPreviewModeChange}
          />
        </div>
      </div>
    </div>
  );
}
