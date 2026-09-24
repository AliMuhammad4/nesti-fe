'use client';

import { useState } from 'react';
import { Check, Eye, Globe2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import PublicProfileDraftWorkspace from '@/components/dashboard/public-profile/PublicProfileDraftWorkspace';
import StorefrontBuilderWorkspace from '@/components/storefront/builder/StorefrontBuilderWorkspace';
import useAdminStorefrontBuilder from '@/components/admin/useAdminStorefrontBuilder';
import WorkspaceLoader from '@/components/ui/WorkspaceLoader';
import { AdminErrorState } from '@/components/admin/AdminUi';
import { useAdminCanWrite } from '@/hooks/useAdminPermissions';
import { ADMIN_PERMISSION } from '@/lib/adminPermissions';
import { buildStorefrontDraft } from '@/components/dashboard/public-profile/storefrontBuilderUtils';

function AdminBuilderTopBar({
  isLive,
  publicUrl,
  canPublish,
  onPublish,
  publishPending,
  generatePending,
  onGenerate,
  slug,
  canWrite,
}) {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Admin storefront</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
          {isLive ? 'Editing live page' : 'Draft builder'}
        </p>
        <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">
          {publicUrl || 'Generate or save a draft to reserve the public URL.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isLive ? (
          <span className="inline-flex h-8 items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700">
            <Check size={14} />
            Live
          </span>
        ) : null}
        {canWrite ? (
          <button
            type="button"
            onClick={onGenerate}
            disabled={generatePending}
            className="inline-flex h-9 items-center gap-2 border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-60"
          >
            {generatePending ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />}
            {isLive ? 'Regenerate draft' : 'Generate draft'}
          </button>
        ) : null}
        {isLive && slug ? (
          <a
            href={`/p/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-300"
          >
            <Eye size={15} />
            Preview live
          </a>
        ) : null}
        {canWrite ? (
          <button
            type="button"
            onClick={onPublish}
            disabled={!canPublish || publishPending}
            className="inline-flex h-9 items-center gap-2 bg-emerald-600 px-3.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {publishPending ? <Loader2 className="animate-spin" size={15} /> : <Globe2 size={15} />}
            {isLive ? 'Update live page' : 'Publish'}
          </button>
        ) : null}
      </div>
    </header>
  );
}

export default function AdminProfessionalStorefront({ professionalId }) {
  const builder = useAdminStorefrontBuilder(professionalId);
  const canWrite = useAdminCanWrite(ADMIN_PERMISSION.PROFESSIONALS_WRITE);
  const [inlineEditing, setInlineEditing] = useState(false);

  const handlePublish = () => {
    if (!canWrite) return;
    const access = builder.entitlements?.templates?.find(
      (template) => template.template_id === builder.editorData?.template_key,
    );
    if (access && !access.unlocked) {
      toast.error(
        'This paid template is locked for the professional. They need an active template subscription before publish.',
      );
      return;
    }
    builder.handlePublish();
  };

  const mutationError =
    builder.publishStorefrontMutation.error
    || builder.saveStorefrontMutation.error
    || builder.generateCopyMutation.error;
  const mutationPending =
    builder.publishStorefrontMutation.isPending
    || builder.saveStorefrontMutation.isPending
    || builder.generateCopyMutation.isPending;

  const retryMutation = () => {
    if (builder.publishStorefrontMutation.error) {
      handlePublish();
      return;
    }
    if (builder.generateCopyMutation.error) {
      builder.generateCopyMutation.mutate();
      return;
    }
    if (builder.saveStorefrontMutation.error && builder.editorData) {
      builder.saveStorefrontMutation.mutate(buildStorefrontDraft(builder.editorData));
    }
  };

  const wrappedMediaUpload = canWrite
    ? async (kind, file) => {
        try {
          return await builder.uploadStorefrontMedia(kind, file);
        } catch (error) {
          toast.error(
            error?.message || 'Could not upload storefront image.',
          );
          return null;
        }
      }
    : undefined;

  if (builder.isLoading) {
    return (
      <div className="flex min-h-[28rem] items-center justify-center border border-slate-200 bg-white">
        <WorkspaceLoader fullHeight={false} />
      </div>
    );
  }

  if (builder.isError) {
    return (
      <AdminErrorState
        message={builder.loadError?.message || 'Failed to load storefront'}
        onRetry={() => builder.refetch()}
        retrying={builder.isFetching}
      />
    );
  }

  if (builder.editorData) {
    return (
      <div className="relative flex min-h-[70vh] w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
        <AdminBuilderTopBar
          isLive={builder.isLive}
          publicUrl={builder.publicUrl}
          canPublish={(builder.canPublish || inlineEditing) && canWrite}
          onPublish={handlePublish}
          publishPending={builder.publishStorefrontMutation.isPending}
          generatePending={builder.generateCopyMutation.isPending}
          onGenerate={() => builder.generateCopyMutation.mutate()}
          slug={builder.slug}
          canWrite={canWrite}
        />
        {mutationError ? (
          <div className="px-4 pt-3">
            <AdminErrorState
              message={mutationError.message || 'Storefront action failed'}
              onRetry={retryMutation}
              retrying={mutationPending}
            />
          </div>
        ) : null}
        {!canWrite ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
            Read-only: your admin permissions do not include professionals.write.
          </div>
        ) : (
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
            Images upload under this professional&apos;s account (not the admin account).
          </div>
        )}
        <StorefrontBuilderWorkspace
          accessToken={builder.token}
          professionalId={builder.professionalId}
          loadEmbedLinks={builder.loadEmbedLinks}
          loadStorefrontProperties={builder.loadStorefrontProperties}
          role={
            builder.professionalProfile.professional_type
            || builder.profileData?.professional_type
            || builder.profile?.professional_type
          }
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
          onTemplateChange={canWrite ? builder.selectTemplate : undefined}
          blocks={builder.editorData.blocks}
          onChange={canWrite ? ((blocks) => builder.updateEditor({ blocks })) : undefined}
          onBrandKitChange={canWrite ? builder.updateBrandKit : undefined}
          onResetTemplateColors={canWrite ? builder.resetTemplateColors : undefined}
          onResetTemplateDefaults={canWrite ? builder.resetTemplateDefaults : undefined}
          onMediaUpload={wrappedMediaUpload}
          onInlineEditingChange={setInlineEditing}
          media={{
            cover: builder.editorData.brand_kit.cover_url || '',
            profile: builder.editorData.brand_kit.profile_photo_url || '',
          }}
          saving={builder.saveStorefrontMutation.isPending}
          saveState={builder.hasUnsavedChanges ? 'unsaved' : 'saved'}
          templateEntitlements={builder.entitlements}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-[28rem] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <AdminBuilderTopBar
        isLive={false}
        publicUrl={builder.publicUrl}
        canPublish={false}
        onPublish={handlePublish}
        publishPending={false}
        generatePending={builder.generateCopyMutation.isPending}
        onGenerate={() => builder.generateCopyMutation.mutate()}
        slug={builder.slug}
        canWrite={canWrite}
      />
      {mutationError ? (
        <div className="px-4 pt-3">
          <AdminErrorState
            message={mutationError.message || 'Storefront action failed'}
            onRetry={retryMutation}
            retrying={mutationPending}
          />
        </div>
      ) : null}
      <PublicProfileDraftWorkspace
        editorData={builder.editorData}
        publicUrl={builder.publicUrl}
        copied={builder.copied}
        onCopyPublicUrl={builder.handleCopyPublicUrl}
        selectTemplate={builder.selectTemplate}
        updateBrandKit={builder.updateBrandKit}
        updateEssential={builder.updateEssential}
        uploadMediaPending={builder.uploadMediaPending}
        uploadStorefrontMedia={wrappedMediaUpload}
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
  );
}
