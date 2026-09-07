'use client';

import FeaturePageGate from '@/components/billing/FeaturePageGate';
import DeleteLeadConfirmModal from '@/components/leads/DeleteLeadConfirmModal';
import PublicProfileDraftWorkspace from '@/components/dashboard/public-profile/PublicProfileDraftWorkspace';
import usePublicProfileBuilder from '@/components/dashboard/public-profile/usePublicProfileBuilder';
import StorefrontBuilderWorkspace from '@/components/storefront/builder/StorefrontBuilderWorkspace';
import { FEATURES } from '@/constants/features';
import {
  useConfirmStorefrontTemplateCheckoutSession,
  useCreateStorefrontTemplateCheckoutSession,
  useStorefrontTemplateEntitlements,
} from '@/hooks/useBillingApi';
import { Check, Eye, Globe2, Loader2, Lock, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';

function clearTemplateCheckoutParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete('template_checkout');
  url.searchParams.delete('template');
  url.searchParams.delete('session_id');
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
}

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

function TemplatePaymentModal({ open, template, isPending, onCancel, onPay }) {
  if (!open || !template || typeof document === 'undefined') return null;
  const tierLabel = template.tier
    ? `${template.tier[0].toUpperCase()}${template.tier.slice(1)}`
    : 'Paid';
  const previewShell = document.querySelector('[data-storefront-preview-shell]');
  const portalTarget = previewShell || document.body;

  return createPortal(
    <div
      className={`${previewShell ? 'absolute' : 'fixed'} inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-transparent p-4 sm:p-6`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-payment-title"
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
      >
        <div className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-start gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100">
              <Lock size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 id="template-payment-title" className="text-[17px] font-bold tracking-tight text-slate-950">
                Unlock to publish
              </h2>
              <p className="mt-1 text-xs leading-[1.55] text-slate-500">
                Preview and customize for free. Subscribe monthly when you are ready to go live.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                {tierLabel} template
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-950">{template.name}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Monthly subscription</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-bold tracking-tight text-slate-950">{template.display_amount}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Per month</p>
            </div>
          </div>

          <div className="mt-3.5 flex items-start gap-2 text-[11px] leading-4 text-slate-500">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <Check size={10} strokeWidth={3} />
            </span>
            Your page publishes automatically after successful payment. Cancel anytime from billing.
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={onPay}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-[0_8px_20px_rgba(5,150,105,0.2)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {isPending ? 'Preparing checkout…' : 'Subscribe and publish'}
            </button>
        </div>
      </div>
    </div>,
    portalTarget,
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
            disabled={deletePending || savePending || publishPending}
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
          disabled={!canPublish || publishPending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-white disabled:opacity-40"
          title={isLive ? 'Save changes and update the live page' : 'Save and publish your page'}
        >
          {publishPending ? <Loader2 className="animate-spin" size={15} /> : <Globe2 size={15} />}
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
              href={`/p/${slug}`}
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
              disabled={!canPublish || publishPending}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              title={isLive ? 'Save changes and update the live page' : 'Save and publish your page'}
            >
              {publishPending ? <Loader2 className="animate-spin" size={16} /> : <Globe2 size={15} />}
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
  const [inlineEditing, setInlineEditing] = useState(false);
  const [templatePaymentModalOpen, setTemplatePaymentModalOpen] = useState(false);
  const [checkoutPublishTemplateId, setCheckoutPublishTemplateId] = useState('');
  const checkoutHandledRef = useRef(false);
  const checkoutTemplateSelectionRef = useRef('');
  const checkoutPublishStartedRef = useRef(false);
  const builderRef = useRef(builder);
  builderRef.current = builder;
  const templateEntitlementsQuery = useStorefrontTemplateEntitlements();
  const templateCheckoutMutation = useCreateStorefrontTemplateCheckoutSession();
  const templateCheckoutConfirmMutation = useConfirmStorefrontTemplateCheckoutSession();
  const currentTemplateAccess = templateEntitlementsQuery.data?.templates?.find(
    (template) => template.template_id === builder.editorData?.template_key,
  );
  const currentTemplateLocked = Boolean(currentTemplateAccess && !currentTemplateAccess.unlocked);
  const templateCheckoutPending = (
    templateCheckoutMutation.isPending
    || templateCheckoutConfirmMutation.isPending
  );
  const templatePaymentPending = (
    builder.saveStorefrontMutation.isPending
    || templateCheckoutPending
  );

  const startTemplateCheckoutAndPublish = async () => {
    if (!currentTemplateAccess || !builder.editorData?.template_key) return;
    try {
      const saved = await builder.saveCurrentStorefrontDraft();
      if (!saved) return;
      const checkout = await templateCheckoutMutation.mutateAsync(builder.editorData.template_key);
      if (checkout?.free || checkout?.alreadyUnlocked) {
        setTemplatePaymentModalOpen(false);
        await templateEntitlementsQuery.refetch?.();
        await builder.handlePublish();
        return;
      }
      if (!checkout?.url) {
        toast.error('Stripe checkout is unavailable. Please try again.');
        return;
      }
      window.location.assign(checkout.url);
    } catch {
      // Save and checkout mutations already show an actionable error.
    }
  };

  const handlePublishWithTemplateAccess = () => {
    if (templateEntitlementsQuery.isLoading) {
      toast.info('Checking template access...');
      return;
    }
    if (templateEntitlementsQuery.isError || !currentTemplateAccess) {
      toast.error('Template access could not be verified. Please refresh and try again.');
      return;
    }
    if (!currentTemplateLocked) {
      builder.handlePublish();
      return;
    }

    setTemplatePaymentModalOpen(true);
  };

  useEffect(() => {
    if (currentTemplateAccess?.unlocked) setTemplatePaymentModalOpen(false);
  }, [currentTemplateAccess?.unlocked]);

  useEffect(() => {
    if (checkoutHandledRef.current) return;
    const searchParams = new URLSearchParams(window.location.search);
    const checkoutStatus = searchParams.get('template_checkout');
    const templateId = searchParams.get('template');
    const sessionId = searchParams.get('session_id');

    if (checkoutStatus === 'cancelled') {
      checkoutHandledRef.current = true;
      clearTemplateCheckoutParams();
      setTemplatePaymentModalOpen(false);
      toast.info('Template checkout was cancelled. Your draft is still saved.');
      return;
    }
    if (checkoutStatus !== 'success') return;
    if (!builder.editorData) return;

    checkoutHandledRef.current = true;
    if (!templateId || !sessionId) {
      clearTemplateCheckoutParams();
      toast.error('Template checkout returned without valid payment details.');
      return;
    }

    setTemplatePaymentModalOpen(false);
    const confirmAndPublish = async () => {
      let confirmed = false;
      let lastError = null;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          await templateCheckoutConfirmMutation.mutateAsync({ sessionId, templateId });
          confirmed = true;
          break;
        } catch (error) {
          lastError = error;
          if (error?.status !== 409 || attempt === 4) break;
          await new Promise((resolve) => window.setTimeout(resolve, 1000));
        }
      }

      if (!confirmed) {
        toast.error(lastError?.message || 'Could not confirm the template payment.');
        return;
      }

      clearTemplateCheckoutParams();
      setCheckoutPublishTemplateId(templateId);
    };
    confirmAndPublish();
  }, [builder.editorData, templateCheckoutConfirmMutation]);

  useEffect(() => {
    if (!checkoutPublishTemplateId || !builder.editorData) return;

    if (builder.editorData.template_key !== checkoutPublishTemplateId) {
      if (checkoutTemplateSelectionRef.current === checkoutPublishTemplateId) return;
      checkoutTemplateSelectionRef.current = checkoutPublishTemplateId;
      builderRef.current.selectTemplate(checkoutPublishTemplateId).then((applied) => {
        if (applied) return;
        checkoutTemplateSelectionRef.current = '';
        setCheckoutPublishTemplateId('');
        toast.success('Template subscribed. Select it when you are ready to publish.');
      });
      return;
    }

    if (checkoutPublishStartedRef.current) return;
    checkoutPublishStartedRef.current = true;
    setCheckoutPublishTemplateId('');
    builderRef.current.handlePublish().then((published) => {
      checkoutPublishStartedRef.current = false;
      if (!published) {
        toast.info('Template subscribed. Review your draft and publish when ready.');
      }
    });
  }, [builder.editorData, checkoutPublishTemplateId]);

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
        <div className="relative min-h-full w-full bg-slate-100">
          <BuilderTopBar
            isLive={builder.isLive}
            publicUrl={builder.publicUrl}
            hasPageRecord={builder.hasPageRecord}
            canPublish={builder.canPublish || inlineEditing}
            onDelete={builder.handleDeleteWebPage}
            onPublish={handlePublishWithTemplateAccess}
            deletePending={builder.deleteMutation.isPending}
            savePending={builder.saveStorefrontMutation.isPending}
            publishPending={
              builder.publishStorefrontMutation.isPending
              || templateCheckoutPending
            }
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
            onInlineEditingChange={setInlineEditing}
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
          <TemplatePaymentModal
            open={templatePaymentModalOpen}
            template={currentTemplateAccess}
            isPending={templatePaymentPending}
            onCancel={() => setTemplatePaymentModalOpen(false)}
            onPay={startTemplateCheckoutAndPublish}
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
            publishPending={builder.publishStorefrontMutation.isPending || templateCheckoutPending}
            deletePending={builder.deleteMutation.isPending}
            onGenerate={() => builder.generateCopyMutation.mutate()}
            onPublish={handlePublishWithTemplateAccess}
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
        <TemplatePaymentModal
          open={templatePaymentModalOpen}
          template={currentTemplateAccess}
          isPending={templatePaymentPending}
          onCancel={() => setTemplatePaymentModalOpen(false)}
          onPay={startTemplateCheckoutAndPublish}
        />
      </div>
    </FeaturePageGate>
  );
}
