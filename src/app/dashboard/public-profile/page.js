'use client';

import FeaturePageGate from '@/components/billing/FeaturePageGate';
import DeleteLeadConfirmModal from '@/components/leads/DeleteLeadConfirmModal';
import PublicProfileDraftWorkspace from '@/components/dashboard/public-profile/PublicProfileDraftWorkspace';
import usePublicProfileBuilder from '@/components/dashboard/public-profile/usePublicProfileBuilder';
import StorefrontBuilderWorkspace from '@/components/storefront/builder/StorefrontBuilderWorkspace';
import { FEATURES } from '@/constants/features';
import { Check, Eye, Globe2, Loader2, Sparkles, Trash2 } from 'lucide-react';

function DeletePageModal({ open, onCancel, onConfirm, isPending, contained = false }) {
  return (
    <DeleteLeadConfirmModal
      open={open}
      onCancel={onCancel}
      onConfirm={onConfirm}
      isPending={isPending}
      contained={contained}
      title="Delete web page?"
      confirmLabel="Delete web page"
      pendingLabel="Deleting web page..."
      description="This will delete your public webpage and remove related profile analytics history. This action cannot be undone. You can create a new webpage later."
    />
  );
}

function BuilderTopBar({
  isLive,
  publicUrl,
  hasPageRecord,
  canPublish,
  onDelete,
  onPublish,
  deletePending,
  savePending,
  publishPending,
}) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Globe2 size={17} className="text-primary" />
          <h1 className="truncate text-base font-bold text-slate-900">Website Builder</h1>
          {isLive ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Live</span> : null}
        </div>
        <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{publicUrl || 'Create and save a draft to reserve your public URL.'}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {hasPageRecord ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={deletePending}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
            title="Delete this public webpage"
          >
            {deletePending ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
            <span className="hidden sm:inline">{deletePending ? 'Deleting...' : 'Delete page'}</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={onPublish}
          disabled={!canPublish || savePending || publishPending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-white disabled:opacity-40"
          title={isLive ? 'Save changes and update the live page' : 'Save and publish your page'}
        >
          {savePending || publishPending ? <Loader2 className="animate-spin" size={15} /> : <Globe2 size={15} />}
          {isLive ? 'Update live' : 'Publish'}
        </button>
      </div>
    </header>
  );
}

function WorkspaceTopBar({
  profile,
  isLive,
  slug,
  hasPageRecord,
  hasSavedDraft,
  canPublish,
  generatePending,
  updatePending,
  savePending,
  publishPending,
  deletePending,
  onGenerate,
  onPublish,
  onDelete,
}) {
  return (
    <div className="border-b border-slate-200 bg-gradient-to-r from-white via-emerald-50/35 to-white px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
            <Globe2 size={13} />
            Professional Web Page
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Website Builder</h1>
          <p className="mt-0.5 max-w-2xl text-xs leading-5 text-text-muted">
            Design, preview, and publish your branded professional storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:shrink-0">
          {profile && isLive ? (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700">
              <Check size={14} />
              Live
            </span>
          ) : null}
          <button
            type="button"
            onClick={onGenerate}
            disabled={generatePending}
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-xs font-semibold shadow-sm transition disabled:opacity-60 ${
              isLive
                ? 'border border-slate-200 bg-white text-slate-700 hover:border-primary/30 hover:text-primary'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {generatePending ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {isLive ? 'Regenerate draft' : 'Generate draft'}
          </button>
          {hasSavedDraft && isLive && slug ? (
            <a
              href={`/professional/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
              title="Preview current live page"
            >
              <Eye size={15} />
              Preview
            </a>
          ) : null}
          {hasPageRecord ? (
            <button
              type="button"
              onClick={onPublish}
              disabled={!canPublish || updatePending || savePending || publishPending}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              title={isLive ? 'Save changes and update the live page' : 'Save and publish your page'}
            >
              {updatePending || savePending || publishPending ? <Loader2 className="animate-spin" size={16} /> : <Globe2 size={15} />}
              {isLive ? 'Update live page' : 'Publish'}
            </button>
          ) : null}
          {hasPageRecord ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deletePending}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
            >
              {deletePending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              {deletePending ? 'Deleting...' : 'Delete page'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const builder = usePublicProfileBuilder();

  if (builder.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (builder.editorData) {
    return (
      <FeaturePageGate feature={FEATURES.PUBLIC_PROFILE}>
        <div className="min-h-full w-full bg-slate-100">
          <BuilderTopBar
            isLive={builder.isLive}
            publicUrl={builder.publicUrl}
            hasPageRecord={builder.hasPageRecord}
            canPublish={builder.canPublish}
            onDelete={builder.handleDeleteWebPage}
            onPublish={builder.handlePublish}
            deletePending={builder.deleteMutation.isPending}
            savePending={builder.saveStorefrontMutation.isPending}
            publishPending={builder.publishStorefrontMutation.isPending}
          />

          <StorefrontBuilderWorkspace
            accessToken={builder.token}
            role={builder.professionalProfile.professional_type || builder.profileData?.professional_type || builder.profile?.professional_type}
            profile={{
              ...builder.profile,
              professional_name: builder.displayName,
              professional_profile: builder.professionalProfile,
              profile_photo_url:
                builder.editorData.brand_kit.profile_photo_url
                || builder.user.profile_image
                || builder.profile?.profile_photo_url,
              cover_photo_url:
                builder.editorData.brand_kit.cover_url
                || builder.user.cover_image
                || builder.profile?.cover_photo_url,
            }}
            brandKit={builder.editorData.brand_kit}
            templateKey={builder.editorData.template_key}
            onTemplateChange={builder.selectTemplate}
            blocks={builder.editorData.blocks}
            onChange={(blocks) => builder.updateEditor({ blocks })}
            onBrandKitChange={builder.updateBrandKit}
            onResetTemplateColors={builder.resetTemplateColors}
            onResetTemplateDefaults={builder.resetTemplateDefaults}
            onMediaUpload={builder.uploadStorefrontMedia}
            media={{
              cover: builder.editorData.brand_kit.cover_url || '',
              profile: builder.editorData.brand_kit.profile_photo_url || '',
            }}
            saving={builder.saveStorefrontMutation.isPending}
            saveState={builder.hasUnsavedChanges ? 'unsaved' : 'saved'}
            deleteConfirm={{
              open: builder.showDeleteConfirm,
              onCancel: () => builder.setShowDeleteConfirm(false),
              onConfirm: builder.confirmDeleteWebPage,
              isPending: builder.deleteMutation.isPending,
            }}
          />
        </div>
      </FeaturePageGate>
    );
  }

  return (
    <FeaturePageGate feature={FEATURES.PUBLIC_PROFILE}>
      <div className="relative min-h-full w-full">
        <div className="min-h-full overflow-hidden border-y border-slate-200 bg-white">
          <WorkspaceTopBar
            profile={builder.profile}
            isLive={builder.isLive}
            slug={builder.slug}
            hasPageRecord={builder.hasPageRecord}
            hasSavedDraft={builder.hasSavedDraft}
            canPublish={builder.canPublish}
            generatePending={builder.generateCopyMutation.isPending}
            updatePending={builder.updateMutation.isPending}
            savePending={builder.saveStorefrontMutation.isPending}
            publishPending={builder.publishStorefrontMutation.isPending}
            deletePending={builder.deleteMutation.isPending}
            onGenerate={() => builder.generateCopyMutation.mutate()}
            onPublish={builder.handlePublish}
            onDelete={builder.handleDeleteWebPage}
          />

          <PublicProfileDraftWorkspace
            editorData={builder.editorData}
            publicUrl={builder.publicUrl}
            copied={builder.copied}
            onCopyPublicUrl={builder.handleCopyPublicUrl}
            selectTemplate={builder.selectTemplate}
            updateBrandKit={builder.updateBrandKit}
            updateEssential={builder.updateEssential}
            uploadMediaPending={builder.uploadMediaPending}
            uploadStorefrontMedia={builder.uploadStorefrontMedia}
            moveBlock={builder.moveBlock}
            updateBlock={builder.updateBlock}
            removeBlock={builder.removeBlock}
            draggedBlockId={builder.draggedBlockId}
            setDraggedBlockId={builder.setDraggedBlockId}
            moveBlockTo={builder.moveBlockTo}
            addBlock={builder.addBlock}
            profile={builder.profile}
            professionalProfile={builder.professionalProfile}
            user={builder.user}
            displayName={builder.displayName}
            roleLabel={builder.roleLabel}
            previewMode={builder.previewMode}
            onPreviewModeChange={builder.setPreviewMode}
          />
        </div>

        <DeletePageModal
          open={builder.showDeleteConfirm}
          onCancel={() => builder.setShowDeleteConfirm(false)}
          onConfirm={builder.confirmDeleteWebPage}
          isPending={builder.deleteMutation.isPending}
          contained
        />
      </div>
    </FeaturePageGate>
  );
}
