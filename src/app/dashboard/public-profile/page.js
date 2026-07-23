'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import FeaturePageGate from '@/components/billing/FeaturePageGate';
import { FEATURES } from '@/constants/features';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useUploadProfileMedia } from '@/hooks/useProfileApi';
import {
  deletePublicProfile,
  generateStorefrontDraft,
  getOwnPublicProfile,
  getStorefrontDraft,
  publishStorefront,
  saveStorefrontDraft,
  updatePublicProfile,
} from '@/lib/publicProfileClient';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Eye,
  Globe2,
  GripVertical,
  Loader2,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import DeleteLeadConfirmModal from '@/components/leads/DeleteLeadConfirmModal';
import { STOREFRONT_BLOCK_TYPES, STOREFRONT_TEMPLATE_PRESETS } from '@/components/storefront/storefrontPresets';
import StorefrontBuilderWorkspace from '@/components/storefront/builder/StorefrontBuilderWorkspace';
import { normalizeBlocks } from '@/components/storefront/builder/storefrontBuilderState';
import {
  getStorefrontTemplate,
  materializeTemplate,
  seedBlockContentFromProfile,
} from '@/components/storefront/builder/storefrontTemplates';

function buildStorefrontDraft(editorData) {
  const templateMeta = getStorefrontTemplate(editorData.template_key);
  return {
    template: {
      id: editorData.template_key,
      name: templateMeta?.label || editorData.template_key,
      version: '2',
    },
    brandKit: {
      logo_url: editorData.brand_kit.logo_url || null,
      primary_color: editorData.brand_kit.primary_color || null,
      secondary_color: editorData.brand_kit.accent_color || null,
      accent_color: editorData.brand_kit.accent_color || null,
      font_family: editorData.brand_kit.font || null,
      button_shape: editorData.brand_kit.button_shape || null,
      business_name: editorData.brand_kit.business_name || null,
    },
    blocks: normalizeBlocks(editorData.blocks).map((block) => ({
      id: block.id,
      type: block.type,
      data: block.data,
    })),
  };
}

function draftSignature(draft) {
  try {
    return JSON.stringify(draft);
  } catch {
    return `${Date.now()}`;
  }
}

export default function PublicProfilePage() {
  const { token } = useAuthGuard();
  const { hasFeature } = useFeatureAccess();
  const uploadMedia = useUploadProfileMedia();
  const canEditPublicProfile = hasFeature(FEATURES.PUBLIC_PROFILE);
  const queryClient = useQueryClient();
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['own-public-profile'],
    queryFn: () => getOwnPublicProfile(token),
    enabled: !!token && canEditPublicProfile,
  });
  const { data: storefrontDraftData, error: storefrontDraftError } = useQuery({
    queryKey: ['own-storefront-draft'],
    queryFn: () => getStorefrontDraft(token),
    enabled: !!token && canEditPublicProfile,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updatePublicProfile(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['own-public-profile']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
  const saveStorefrontMutation = useMutation({
    mutationFn: (draft) => saveStorefrontDraft(token, draft),
    onSuccess: (data) => {
      queryClient.setQueryData(['own-storefront-draft'], (current) => ({
        ...(current || {}),
        success: true,
        draft: data?.draft || current?.draft || null,
      }));
    },
    onError: (error) => toast.error(error.message || 'Failed to save storefront draft'),
  });
  const publishStorefrontMutation = useMutation({
    mutationFn: () => publishStorefront(token),
    onSuccess: () => queryClient.invalidateQueries(['own-storefront-draft']),
    onError: (error) => toast.error(error.message || 'Failed to publish storefront'),
  });

  const generateCopyMutation = useMutation({
    mutationFn: () => {
      const role = normalizeRole(
        profileData?.professional_profile?.professional_type || profileData?.professional_type,
      );
      return generateStorefrontDraft(token, {
        template_key: editorData?.template_key || `${role}-classic`,
        brand_kit: editorData?.brand_kit || {
          business_name: profileData?.professional_profile?.company_name || '',
          primary_color: '#0f766e',
          accent_color: '#f59e0b',
          font: 'Manrope',
          button_shape: 'rounded',
          image_style: 'editorial',
          essentials: {},
        },
        onboarding: editorData?.brand_kit?.essentials || {},
      });
    },
    onSuccess: (data) => {
      const generated = data?.generated || {};
      setFormData((prev) => ({ ...prev, ...generated }));
      if (data?.draft) {
        setEditorData((current) => ({
          ...(current || {}),
          template_key: data.draft.template?.id || current?.template_key || 'agent-classic',
          brand_kit: {
            ...(current?.brand_kit || {}),
            business_name: profileData?.professional_profile?.company_name || current?.brand_kit?.business_name || '',
            logo_url: data.draft.brandKit?.logo_url || current?.brand_kit?.logo_url || '',
            primary_color: data.draft.brandKit?.primary_color || current?.brand_kit?.primary_color || '#0f766e',
            accent_color: data.draft.brandKit?.accent_color || current?.brand_kit?.accent_color || '#f59e0b',
            font: data.draft.brandKit?.font_family || current?.brand_kit?.font || 'Manrope',
            button_shape: current?.brand_kit?.button_shape || 'rounded',
            image_style: current?.brand_kit?.image_style || 'editorial',
            essentials: current?.brand_kit?.essentials || {},
          },
          blocks: seedBlockContentFromProfile(
            data.draft.blocks || [],
            {
              ...profileData?.profile,
              professional_name:
                profileData?.professional_profile?.full_name
                || [profileData?.user?.first_name, profileData?.user?.last_name].filter(Boolean).join(' '),
              professional_profile: profileData?.professional_profile,
            },
            data.draft.template?.id || current?.template_key || 'agent-classic',
          ),
        }));
        setEditorDirty(true);
        editorHydrated.current = true;
        queryClient.invalidateQueries(['own-public-profile']);
        queryClient.invalidateQueries(['own-storefront-draft']);
      }
      toast.success(data?.message || 'AI landing page copy generated. Click Save to apply.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate AI copy');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePublicProfile(token),
    onSuccess: (data) => {
      queryClient.setQueryData(['own-public-profile'], (current) => (
        current ? { ...current, profile: null } : current
      ));
      queryClient.setQueryData(['own-storefront-draft'], (current) => (
        current ? { ...current, profile: null, draft: null, published_at: null } : current
      ));
      queryClient.invalidateQueries(['own-public-profile']);
      queryClient.invalidateQueries(['own-storefront-draft']);
      setFormData({});
      setEditorData(null);
      setEditorDirty(false);
      editorHydrated.current = false;
      setShowDeleteConfirm(false);
      toast.success(data?.message || 'Public webpage deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete public webpage');
    },
  });

  const startFreshPage = () => {
    if (!editorData) return;
    const confirmed = window.confirm(
      'Start a new page from your current template? This replaces the current draft blocks and copy. Logo and brand colors are kept.',
    );
    if (!confirmed) return;
    const profileSeed = {
      ...profileData?.profile,
      professional_name:
        profileData?.professional_profile?.full_name
        || [profileData?.user?.first_name, profileData?.user?.last_name].filter(Boolean).join(' '),
      professional_profile: profileData?.professional_profile,
    };
    const next = materializeTemplate(editorData.template_key, profileSeed, editorData.brand_kit);
    if (!next) {
      toast.error('Could not create a new page from this template');
      return;
    }
    setEditorData({
      template_key: next.template_key,
      brand_kit: next.brand_kit,
      blocks: next.blocks,
    });
    setEditorDirty(true);
    toast.success('New page draft ready — save when you want to keep it');
  };

  const [formData, setFormData] = useState({});
  const [editorData, setEditorData] = useState(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const editorHydrated = useRef(false);
  const lastSavedDraftSignatureRef = useRef('');

  useEffect(() => {
    if (!profileData || editorHydrated.current) return;
    // Wait until draft query settles (success or error) so we don't flash the legacy shell.
    if (storefrontDraftData === undefined && !storefrontDraftError) return;

    try {
      const savedProfile = profileData.profile || {};
      const professional = profileData.professional_profile || {};
      const savedDraft = storefrontDraftData?.draft || {};
      const hasPersistedStorefront = Boolean(savedProfile?._id) || Boolean(savedDraft?.blocks?.length);
      if (!hasPersistedStorefront) {
        setEditorData(null);
        editorHydrated.current = true;
        return;
      }
      const role = normalizeRole(
        professional.professional_type || profileData.professional_type || savedProfile.professional_type,
      );
      const savedBrandKit = savedDraft.brandKit || {};
      const templateKey = savedDraft.template?.id || `${role}-classic`;
      const profileSeed = {
        ...savedProfile,
        professional_name:
          professional.full_name
          || [profileData.user?.first_name, profileData.user?.last_name].filter(Boolean).join(' '),
        professional_profile: professional,
        headline: savedProfile.headline,
        tagline: savedProfile.tagline,
        about: savedProfile.about,
      };

      let blocks;
      let brandKit;
      if (Array.isArray(savedDraft.blocks) && savedDraft.blocks.length) {
        blocks = seedBlockContentFromProfile(savedDraft.blocks, profileSeed, templateKey);
        brandKit = {
          business_name: savedBrandKit.business_name || professional.company_name || '',
          logo_url: savedBrandKit.logo_url || '',
          logo_dark_url: savedBrandKit.logo_dark_url || '',
          primary_color: savedBrandKit.primary_color || '#0f766e',
          accent_color: savedBrandKit.accent_color || '#f59e0b',
          font: savedBrandKit.font_family || savedBrandKit.font || 'Manrope',
          button_shape: savedBrandKit.button_shape || 'rounded',
          image_style: savedBrandKit.image_style || 'editorial',
          essentials: savedBrandKit.essentials || {},
        };
      } else {
        const materialized = materializeTemplate(templateKey, profileSeed, {
          business_name: professional.company_name || '',
        });
        blocks = materialized?.blocks || normalizeBlocks(STOREFRONT_TEMPLATE_PRESETS[role] || []);
        brandKit = {
          business_name: professional.company_name || '',
          logo_url: '',
          logo_dark_url: '',
          primary_color: '#0f766e',
          accent_color: '#f59e0b',
          font: 'Manrope',
          button_shape: 'rounded',
          image_style: 'editorial',
          essentials: {},
          ...(materialized?.brand_kit || {}),
        };
      }

      setEditorData({
        template_key: templateKey,
        brand_kit: brandKit,
        blocks,
      });
      editorHydrated.current = true;
    } catch (error) {
      console.error('Failed to hydrate storefront editor', error);
      const role = normalizeRole(profileData.professional_profile?.professional_type || profileData.professional_type);
      setEditorData({
        template_key: `${role}-classic`,
        brand_kit: {
          business_name: profileData.professional_profile?.company_name || '',
          logo_url: '',
          primary_color: '#0f766e',
          accent_color: '#f59e0b',
          font: 'Manrope',
          button_shape: 'rounded',
          image_style: 'editorial',
          essentials: {},
        },
        blocks: normalizeBlocks(STOREFRONT_TEMPLATE_PRESETS[role] || []),
      });
      editorHydrated.current = true;
    }
  }, [profileData, storefrontDraftData, storefrontDraftError]);

  useEffect(() => {
    if (!editorData || !editorDirty || saveStorefrontMutation.isPending) return undefined;
    const draft = buildStorefrontDraft(editorData);
    const signature = draftSignature(draft);
    if (signature === lastSavedDraftSignatureRef.current) {
      setEditorDirty(false);
      return undefined;
    }
    const backupKey = `nesti-storefront-backup:${profileData?.profile?.slug || profileData?.suggested_slug || 'new'}`;
    window.localStorage.setItem(backupKey, JSON.stringify({ savedAt: Date.now(), editorData }));
    const timer = window.setTimeout(() => {
      saveStorefrontMutation.mutate(draft, {
        onSuccess: () => {
          lastSavedDraftSignatureRef.current = signature;
          window.localStorage.removeItem(backupKey);
          setEditorDirty(false);
        },
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [editorData, editorDirty, profileData, saveStorefrontMutation]);

  const handleUpdate = (updates) => {
    setFormData({ ...formData, ...updates });
  };

  const updateEditor = (updates) => {
    setEditorData((current) => ({ ...current, ...updates }));
    setEditorDirty(true);
  };

  const selectTemplate = (templateKey) => {
    if (editorData?.template_key === templateKey) return;
    const template = getStorefrontTemplate(templateKey);
    if (!template) return;
    const confirmed = window.confirm(
      `Apply “${template.label}”? This replaces your page structure and section copy with this specialty template. Brand media (logo) is kept.`,
    );
    if (!confirmed) return;

    const profileSeed = {
      ...profileData?.profile,
      professional_name:
        profileData?.professional_profile?.full_name
        || [profileData?.user?.first_name, profileData?.user?.last_name].filter(Boolean).join(' '),
      professional_profile: profileData?.professional_profile,
    };
    const next = materializeTemplate(templateKey, profileSeed, editorData.brand_kit);
    if (!next) return;
    setEditorData({
      template_key: next.template_key,
      brand_kit: next.brand_kit,
      blocks: next.blocks,
    });
    setEditorDirty(true);
    toast.success(`${template.label} applied`);
  };

  const updateBrandKit = (updates) => {
    setEditorData((current) => ({
      ...current,
      brand_kit: { ...current.brand_kit, ...updates },
    }));
    setEditorDirty(true);
  };

  const updateEssential = (key, value) => {
    setEditorData((current) => ({
      ...current,
      brand_kit: {
        ...current.brand_kit,
        essentials: { ...current.brand_kit.essentials, [key]: value },
      },
    }));
    setEditorDirty(true);
  };

  const uploadStorefrontMedia = async (kind, file) => {
    if (!file) return;
    try {
      const response = await uploadMedia.mutateAsync({ kind, file });
      const url = response?.url || (kind === 'cover' ? response?.cover_image : response?.profile_image);
      if (!url) throw new Error('Upload did not return an image URL');
      if (kind === 'logo') updateBrandKit({ logo_url: url });
      queryClient.invalidateQueries(['own-public-profile']);
      toast.success(`${kind === 'profile' ? 'Profile photo' : kind === 'cover' ? 'Cover photo' : 'Logo'} uploaded`);
    } catch (error) {
      toast.error(error?.message || 'Image upload failed');
    }
  };

  const updateBlock = (id, updates) => {
    updateEditor({
      blocks: editorData.blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)),
    });
  };

  const moveBlock = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= editorData.blocks.length) return;
    const blocks = [...editorData.blocks];
    [blocks[index], blocks[nextIndex]] = [blocks[nextIndex], blocks[index]];
    updateEditor({ blocks });
  };

  const moveBlockTo = (sourceId, targetId) => {
    if (!sourceId || sourceId === targetId) return;
    updateEditor({
      blocks: (() => {
        const blocks = [...editorData.blocks];
        const from = blocks.findIndex((block) => block.id === sourceId);
        const to = blocks.findIndex((block) => block.id === targetId);
        if (from < 0 || to < 0) return blocks;
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);
        return blocks;
      })(),
    });
  };

  const addBlock = (type) => {
    if (!type) return;
    updateEditor({
      blocks: [
        ...editorData.blocks,
        { id: `${type}-${Date.now()}`, type, enabled: true, content: {} },
      ],
    });
  };

  const removeBlock = (id) => {
    updateEditor({ blocks: editorData.blocks.filter((block) => block.id !== id) });
  };

  const handleSave = () => {
    if (Object.keys(formData).length > 0) {
      updateMutation.mutate(formData, {
        onSuccess: () => {
          toast.success('Profile changes saved');
        },
      });
      setFormData({});
    }
    if (editorDirty && editorData) {
      saveStorefrontMutation.mutate(buildStorefrontDraft(editorData), {
        onSuccess: () => {
          toast.success('Storefront draft saved');
          setEditorDirty(false);
        },
      });
    }
  };

  const handlePublish = () => {
    const enablePublicPage = () => updateMutation.mutate({ enabled: true }, {
      onSuccess: () => toast.success('Public page published'),
    });
    const publish = () => publishStorefrontMutation.mutate(undefined, { onSuccess: enablePublicPage });
    if (editorDirty) {
      handleSave();
      toast.info('Save the storefront draft, then publish it.');
      return;
    }
    publish();
  };

  const handleDeleteWebPage = () => {
    if (!profile) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteWebPage = () => {
    deleteMutation.mutate();
  };

  const handleCopyPublicUrl = async () => {
    if (!slug || !origin) return;
    const publicUrl = `${origin}/professional/${slug}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Public link copied');
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Could not copy link');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  const profile = profileData?.profile;
  const slug = profile?.slug || profileData?.suggested_slug;
  const hasSavedDraft = Boolean(profile);
  const user = profileData?.user || {};
  const professionalProfile = profileData?.professional_profile || {};
  const displayName =
    professionalProfile.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ') ||
    'Your profile';
  const roleLabel = {
    agent: 'Real Estate Agent',
    mortgage_broker: 'Mortgage Broker',
    lawyer: 'Real Estate Lawyer',
  }[professionalProfile.professional_type || profileData?.professional_type || profile?.professional_type] || 'Professional';
  const publicUrl = slug ? `${origin || ''}/professional/${slug}` : '';
  const hasUnsavedChanges = Object.keys(formData).length > 0 || editorDirty;
  const isLive = formData.enabled ?? Boolean(profile?.enabled);
  const canPublish = Boolean(profile) && !hasUnsavedChanges;

  if (editorData) {
    return (
      <FeaturePageGate feature={FEATURES.PUBLIC_PROFILE}>
        <div className="min-h-full w-full bg-slate-100">
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
              <button
                type="button"
                onClick={startFreshPage}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-slate-300"
                title="Replace the current draft with a fresh template page"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">New page</span>
              </button>
              <button
                type="button"
                onClick={() => generateCopyMutation.mutate()}
                disabled={generateCopyMutation.isPending}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-primary/30 hover:text-primary disabled:opacity-40"
                title="Regenerate AI copy for this storefront"
              >
                {generateCopyMutation.isPending ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />}
                <span className="hidden sm:inline">AI rewrite</span>
              </button>
              {profile ? (
                <button
                  type="button"
                  onClick={handleDeleteWebPage}
                  disabled={deleteMutation.isPending}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                  title="Delete this public webpage"
                >
                  {deleteMutation.isPending ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
                  <span className="hidden sm:inline">Delete</span>
                </button>
              ) : null}
              <button type="button" onClick={handleSave} disabled={!hasUnsavedChanges || saveStorefrontMutation.isPending} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 disabled:opacity-40">
                {saveStorefrontMutation.isPending ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Save
              </button>
              <button type="button" onClick={handlePublish} disabled={!canPublish || publishStorefrontMutation.isPending} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-white disabled:opacity-40">
                {publishStorefrontMutation.isPending ? <Loader2 className="animate-spin" size={15} /> : <Globe2 size={15} />}{isLive ? 'Update live' : 'Publish'}
              </button>
            </div>
          </header>
          <StorefrontBuilderWorkspace
            accessToken={token}
            role={professionalProfile.professional_type || profileData?.professional_type || profile?.professional_type}
            profile={{ ...profile, professional_name: displayName, professional_profile: professionalProfile, profile_photo_url: user.profile_image || profile?.profile_photo_url, cover_photo_url: user.cover_image || profile?.cover_photo_url }}
            brandKit={editorData.brand_kit}
            templateKey={editorData.template_key}
            onTemplateChange={selectTemplate}
            blocks={editorData.blocks}
            onChange={(blocks) => updateEditor({ blocks })}
            onBrandKitChange={updateBrandKit}
            onMediaUpload={uploadStorefrontMedia}
            media={{ cover: user.cover_image || profile?.cover_photo_url, profile: user.profile_image || profile?.profile_photo_url }}
            saving={saveStorefrontMutation.isPending}
            saveState={hasUnsavedChanges ? 'unsaved' : 'saved'}
          />
          <DeleteLeadConfirmModal
            open={showDeleteConfirm}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDeleteWebPage}
            isPending={deleteMutation.isPending}
            title="Delete web page?"
            confirmLabel="Delete web page"
            pendingLabel="Deleting web page..."
            description="This will delete your public webpage and remove related profile analytics history. This action cannot be undone. You can create a new webpage later."
          />
        </div>
      </FeaturePageGate>
    );
  }

  return (
    <FeaturePageGate feature={FEATURES.PUBLIC_PROFILE}>
    <div className="min-h-full w-full">
      <div className="min-h-full overflow-hidden border-y border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-gradient-to-r from-white via-emerald-50/35 to-white px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
                <Globe2 size={13} />
                Professional Web Page
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Website Builder
              </h1>
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
                onClick={() => generateCopyMutation.mutate()}
                disabled={generateCopyMutation.isPending}
                className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-xs font-semibold shadow-sm transition disabled:opacity-60 ${
                  isLive
                    ? "border border-slate-200 bg-white text-slate-700 hover:border-primary/30 hover:text-primary"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                {generateCopyMutation.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                {isLive ? "Regenerate draft" : "Generate draft"}
              </button>
              {hasUnsavedChanges ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-800 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {updateMutation.isPending ? 'Saving...' : 'Save changes'}
                </button>
              ) : null}
              {hasSavedDraft && isLive && slug ? (
                <a
                  href={`/professional/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
                  title={hasUnsavedChanges ? 'Preview shows last saved version. Save changes to include latest edits.' : 'Preview current page'}
                >
                  <Eye size={15} />
                  {hasUnsavedChanges ? 'Preview saved' : 'Preview'}
                </a>
              ) : null}
              {profile ? (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!canPublish || updateMutation.isPending || publishStorefrontMutation.isPending}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                  title={hasUnsavedChanges ? 'Save your changes before publishing' : 'Publish your saved public page'}
                >
                  {updateMutation.isPending || publishStorefrontMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Globe2 size={15} />}
                  {hasUnsavedChanges ? 'Save to publish' : isLive ? 'Update live page' : 'Publish'}
                </button>
              ) : null}
              {profile ? (
                <button
                  type="button"
                  onClick={handleDeleteWebPage}
                  disabled={deleteMutation.isPending}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete page'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {editorData ? (
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
              <button type="button" onClick={handleCopyPublicUrl} disabled={!publicUrl} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm disabled:opacity-40">
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
                      busy={uploadMedia.isPending}
                      onUpload={(file) => uploadStorefrontMedia('logo', file)}
                    />
                    <MediaUploadControl
                      label="Cover photo"
                      imageUrl={user.cover_image || profile?.cover_photo_url}
                      busy={uploadMedia.isPending}
                      onUpload={(file) => uploadStorefrontMedia('cover', file)}
                    />
                    <MediaUploadControl
                      label="Profile photo"
                      imageUrl={user.profile_image || profile?.profile_photo_url}
                      busy={uploadMedia.isPending}
                      onUpload={(file) => uploadStorefrontMedia('profile', file)}
                      circle
                    />
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
                  onPreviewModeChange={setPreviewMode}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <DeleteLeadConfirmModal
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteWebPage}
        isPending={deleteMutation.isPending}
        title="Delete web page?"
        confirmLabel="Delete web page"
        pendingLabel="Deleting web page..."
        description="This will delete your public webpage and remove related profile analytics history. This action cannot be undone. You can create a new webpage later."
      />
    </div>
    </FeaturePageGate>
  );
}

function StorefrontLivePreview({ profile, professionalProfile, user, displayName, roleLabel, editorData, previewMode, onPreviewModeChange }) {
  const primary = editorData.brand_kit.primary_color || '#0f766e';
  const accent = editorData.brand_kit.accent_color || '#f59e0b';
  const name = editorData.brand_kit.business_name || professionalProfile?.company_name || displayName;
  const activeBlocks = editorData.blocks.filter((block) => block.enabled);
  const hero = activeBlocks.find((block) => block.type === STOREFRONT_BLOCK_TYPES.HERO);
  const headline = hero?.content?.heading || profile?.headline || `Guidance that moves you forward`;
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

const editorInputClass =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10';

const TEMPLATE_GROUPS = [
  {
    role: 'agent',
    label: 'Real Estate Agent',
    templates: [
      { key: 'agent-classic', name: 'Realtor Classic' },
      { key: 'agent-luxury-advisor', name: 'Luxury Advisor' },
      { key: 'agent-first-home', name: 'First Home Specialist' },
      { key: 'agent-investor', name: 'Investor Specialist' },
      { key: 'agent-seller-expert', name: 'Seller Expert' },
      { key: 'agent-community-expert', name: 'Community Expert' },
    ],
  },
  {
    role: 'mortgage_broker',
    label: 'Mortgage Broker',
    templates: [
      { key: 'mortgage_broker-classic', name: 'Mortgage Advisor' },
      { key: 'mortgage_broker-first-home', name: 'First Home Specialist' },
      { key: 'mortgage_broker-wealth', name: 'Wealth Strategist' },
      { key: 'mortgage_broker-renewal', name: 'Renewal Expert' },
      { key: 'mortgage_broker-commercial', name: 'Commercial Mortgage' },
    ],
  },
  {
    role: 'lawyer',
    label: 'Real Estate Lawyer',
    templates: [
      { key: 'lawyer-classic', name: 'Real Estate Lawyer Classic' },
      { key: 'lawyer-first-home-closing', name: 'First Home Closing Expert' },
      { key: 'lawyer-commercial', name: 'Commercial Real Estate Law' },
      { key: 'lawyer-investor', name: 'Investor Transaction Lawyer' },
      { key: 'lawyer-newcomer', name: 'Newcomer Home Specialist' },
    ],
  },
];

const TEMPLATE_THEMES = {
  'agent-classic': { primary: '#0f766e', accent: '#f59e0b', font: 'Inter', imageStyle: 'editorial' },
  'agent-luxury-advisor': { primary: '#1c1917', accent: '#c9a227', font: 'Playfair Display', imageStyle: 'editorial' },
  'agent-first-home': { primary: '#1d4ed8', accent: '#fb7185', font: 'DM Sans', imageStyle: 'warm' },
  'agent-investor': { primary: '#172554', accent: '#22c55e', font: 'Manrope', imageStyle: 'minimal' },
  'agent-seller-expert': { primary: '#9f1239', accent: '#f59e0b', font: 'DM Sans', imageStyle: 'bold' },
  'agent-community-expert': { primary: '#166534', accent: '#f97316', font: 'Inter', imageStyle: 'warm' },
  'mortgage_broker-classic': { primary: '#0f172a', accent: '#38bdf8', font: 'Manrope', imageStyle: 'minimal' },
  'mortgage_broker-first-home': { primary: '#075985', accent: '#fbbf24', font: 'DM Sans', imageStyle: 'warm' },
  'mortgage_broker-wealth': { primary: '#312e81', accent: '#d4af37', font: 'Playfair Display', imageStyle: 'editorial' },
  'mortgage_broker-renewal': { primary: '#155e75', accent: '#2dd4bf', font: 'Inter', imageStyle: 'minimal' },
  'mortgage_broker-commercial': { primary: '#111827', accent: '#fb923c', font: 'Manrope', imageStyle: 'bold' },
  'lawyer-classic': { primary: '#172554', accent: '#c9a227', font: 'Playfair Display', imageStyle: 'editorial' },
  'lawyer-first-home-closing': { primary: '#1e3a8a', accent: '#60a5fa', font: 'DM Sans', imageStyle: 'warm' },
  'lawyer-commercial': { primary: '#111827', accent: '#b45309', font: 'Manrope', imageStyle: 'bold' },
  'lawyer-investor': { primary: '#312e81', accent: '#a78bfa', font: 'Inter', imageStyle: 'minimal' },
  'lawyer-newcomer': { primary: '#0f766e', accent: '#fb923c', font: 'DM Sans', imageStyle: 'warm' },
};

const ESSENTIAL_QUESTIONS = [
  { key: 'ideal_client', label: 'Who is your ideal client?', placeholder: 'First-time homebuyers' },
  { key: 'service_area', label: 'Primary service area', placeholder: 'Toronto & GTA' },
  { key: 'specialty', label: 'Your specialty', placeholder: 'Condo resales' },
  { key: 'value_proposition', label: 'Why choose you?', placeholder: 'Straightforward, local guidance' },
  { key: 'years_experience', label: 'Years of experience', placeholder: '10+ years' },
  { key: 'credentials', label: 'Key credentials', placeholder: 'RECO licensed' },
  { key: 'languages', label: 'Languages spoken', placeholder: 'English, Urdu' },
  { key: 'consultation_cta', label: 'Preferred call to action', placeholder: 'Book a free consultation' },
  { key: 'availability', label: 'Availability', placeholder: 'Evenings and weekends' },
  { key: 'personal_note', label: 'Personal note', placeholder: 'What matters most to you?' },
];

function normalizeRole(role) {
  return Object.hasOwn(STOREFRONT_TEMPLATE_PRESETS, role) ? role : 'agent';
}

function blockLabel(type) {
  return String(type || 'block')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function EditorCard({ title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-0.5 text-[11px] leading-4 text-text-muted">{description}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EditorField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function ColorInput({ value, onChange }) {
  return (
    <div className="flex h-9 overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
      <input aria-label="Choose color" type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-full w-10 border-0 bg-transparent p-1" />
      <input value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 border-0 px-2 text-xs text-slate-700 outline-none" maxLength={9} />
    </div>
  );
}

function MediaUploadControl({ label, imageUrl, onUpload, busy, circle = false }) {
  return (
    <label className="group flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-2 transition hover:border-primary/60 hover:bg-primary/[0.03]">
      <div className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden bg-slate-100 text-[10px] font-bold text-slate-400 ${circle ? 'rounded-full' : 'rounded-lg'}`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : 'IMG'}
      </div>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-semibold text-slate-700">{label}</span>
        <span className="block text-[10px] text-slate-400">{busy ? 'Uploading…' : 'Upload image'}</span>
      </span>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} className="sr-only" onChange={(event) => onUpload(event.target.files?.[0])} />
    </label>
  );
}

function BlockEditor({ block, isFirst, isLast, onMove, onUpdate, onRemove, isDragging, onDragStart, onDragEnd, onDrop }) {
  const content = block.content || {};

  return (
    <details
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', block.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={`group rounded-lg border bg-white transition ${isDragging ? 'border-primary/50 opacity-60 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2.5">
        <GripVertical size={15} className="cursor-grab text-slate-300 active:cursor-grabbing" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{blockLabel(block.type)}</span>
        <span onClick={(event) => event.stopPropagation()} className="flex items-center gap-1">
          <button type="button" aria-label={`Move ${blockLabel(block.type)} up`} disabled={isFirst} onClick={() => onMove(-1)} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={14} /></button>
          <button type="button" aria-label={`Move ${blockLabel(block.type)} down`} disabled={isLast} onClick={() => onMove(1)} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={14} /></button>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={block.enabled} onChange={(e) => onUpdate(block.id, { enabled: e.target.checked })} className="peer sr-only" />
            <span className="h-5 w-9 rounded-full bg-slate-200 transition peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
          </label>
        </span>
      </summary>
      <div className="border-t border-slate-100 px-3 py-2.5">
        <div className="grid gap-2 sm:grid-cols-2">
          <EditorField label="Section heading">
            <input value={content.heading || ''} onChange={(e) => onUpdate(block.id, { content: { ...content, heading: e.target.value } })} className={editorInputClass} placeholder={blockLabel(block.type)} />
          </EditorField>
          <EditorField label="Button label">
            <input value={content.cta_label || ''} onChange={(e) => onUpdate(block.id, { content: { ...content, cta_label: e.target.value } })} className={editorInputClass} placeholder="Get in touch" />
          </EditorField>
        </div>
        <EditorField label="Supporting copy">
          <textarea value={content.body || ''} onChange={(e) => onUpdate(block.id, { content: { ...content, body: e.target.value } })} className="mt-1 min-h-[54px] w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10" placeholder="Optional short description for this section" maxLength={500} />
        </EditorField>
        <button type="button" onClick={() => onRemove(block.id)} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700">
          <Trash2 size={13} /> Remove block
        </button>
      </div>
    </details>
  );
}
