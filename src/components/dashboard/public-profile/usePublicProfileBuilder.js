import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FEATURES } from '@/constants/features';
import { useAuthGuard } from '@/hooks/useAuthGuard';
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
import { seedBlockContentFromProfile } from '@/components/storefront/templates';
import { defaultStorefrontTemplateKey } from '@/components/storefront/storefrontPresets';
import { normalizeRole } from './editorConstants';
import { buildStorefrontDraft, sanitizeAiGenerationBrandKit } from './storefrontBuilderUtils';
import useStorefrontEditorState from './useStorefrontEditorState';

function profileSeedFromData(profileData) {
  const user = profileData?.user || {};
  const professional = profileData?.professional_profile || {};
  return {
    ...profileData?.profile,
    professional_name:
      professional.full_name
      || [user.first_name, user.last_name].filter(Boolean).join(' '),
    professional_profile: professional,
  };
}

function roleLabelFromProfile(profileData) {
  const profile = profileData?.profile;
  const professionalProfile = profileData?.professional_profile || {};
  return {
    agent: 'Real Estate Agent',
    mortgage_broker: 'Mortgage Broker',
    lawyer: 'Real Estate Lawyer',
  }[professionalProfile.professional_type || profileData?.professional_type || profile?.professional_type] || 'Professional';
}

export default function usePublicProfileBuilder() {
  const { token } = useAuthGuard();
  const { hasFeature } = useFeatureAccess();
  const uploadMedia = useUploadProfileMedia();
  const canEditPublicProfile = hasFeature(FEATURES.PUBLIC_PROFILE);
  const queryClient = useQueryClient();

  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({});
  const publishInFlightRef = useRef(null);
  const savePendingRef = useRef(false);

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
    onSuccess: () => queryClient.invalidateQueries(['own-public-profile']),
    onError: (error) => toast.error(error.message || 'Failed to update profile'),
  });

  const saveStorefrontMutation = useMutation({
    mutationFn: (draft) => saveStorefrontDraft(token, draft),
    onSuccess: (data) => {
      queryClient.setQueryData(['own-storefront-draft'], (current) => ({
        ...(current || {}),
        success: true,
        draft: data?.draft || current?.draft || null,
        drafts: data?.drafts || current?.drafts || [],
        active_template_id: data?.active_template_id || current?.active_template_id || null,
        // Keep published_at so "draft ahead of live" stays detectable after autosave.
        published_at: current?.published_at || null,
      }));
    },
    onError: (error) => toast.error(error.message || 'Failed to save storefront draft'),
  });

  const publishStorefrontMutation = useMutation({
    mutationFn: (draft) => publishStorefront(token, draft),
    onSuccess: () => {
      queryClient.invalidateQueries(['own-storefront-draft']);
      queryClient.invalidateQueries(['own-public-profile']);
    },
    onError: (error) => toast.error(error.message || 'Failed to publish storefront'),
  });

  const editor = useStorefrontEditorState({
    profileData,
    storefrontDraftData,
    storefrontDraftError,
    saveStorefrontMutation,
    uploadMedia,
    queryClient,
  });
  savePendingRef.current = saveStorefrontMutation.isPending;

  const derived = useMemo(() => {
    const profile = profileData?.profile;
    const slug = profile?.slug || profileData?.suggested_slug;
    const hasEditorBlocks = Boolean(editor.editorData?.blocks?.length);
    const hasDraftContent = Boolean(
      storefrontDraftData?.draft?.blocks?.length
      || (Array.isArray(storefrontDraftData?.drafts)
        && storefrontDraftData.drafts.some((draft) => draft?.blocks?.length))
      || hasEditorBlocks
    );
    const hasPublishedStorefront = Boolean(storefrontDraftData?.published_at);
    const hasPageRecord = Boolean(profile?.enabled) || hasDraftContent || hasPublishedStorefront;
    const hasSavedDraft = hasDraftContent || hasPublishedStorefront;
    const user = profileData?.user || {};
    const professionalProfile = profileData?.professional_profile || {};
    const displayName =
      professionalProfile.full_name ||
      [user.first_name, user.last_name].filter(Boolean).join(' ') ||
      'Your profile';
    const roleLabel = roleLabelFromProfile(profileData);
    const publicUrl = slug ? `${origin || ''}/professional/${slug}` : '';
    const hasUnsavedChanges = Object.keys(formData).length > 0 || editor.editorDirty;
    const isLive = formData.enabled ?? Boolean(profile?.enabled);
    const draftUpdatedAt = storefrontDraftData?.draft?.updated_at
      ? new Date(storefrontDraftData.draft.updated_at).getTime()
      : 0;
    const publishedAt = storefrontDraftData?.published_at
      ? new Date(storefrontDraftData.published_at).getTime()
      : 0;
    const draftAheadOfLive = Boolean(
      publishedAt
      && draftUpdatedAt
      && draftUpdatedAt > publishedAt
    );
    // Allow:
    // - first publish when page is not live yet
    // - update live when there are unsaved edits, unpublished local edits,
    //   or a saved draft that is newer than the live revision (e.g. layer reorder)
    // Disallow:
    // - update live when already live and there is no draft delta
    const canPublish = hasDraftContent && (
      !isLive
      || hasUnsavedChanges
      || editor.hasUnpublishedChanges
      || draftAheadOfLive
    );
    return {
      profile,
      slug,
      hasDraftContent,
      hasPublishedStorefront,
      hasPageRecord,
      hasSavedDraft,
      user,
      professionalProfile,
      displayName,
      roleLabel,
      publicUrl,
      hasUnsavedChanges,
      isLive,
      canPublish,
    };
  }, [
    profileData,
    storefrontDraftData,
    origin,
    formData,
    editor.editorData,
    editor.editorDirty,
    editor.hasUnpublishedChanges,
  ]);

  const generateCopyMutation = useMutation({
    mutationFn: () => {
      const role = normalizeRole(
        profileData?.professional_profile?.professional_type || profileData?.professional_type,
      );
      return generateStorefrontDraft(token, {
        template_key: editor.editorData?.template_key || defaultStorefrontTemplateKey(role),
        brand_kit: sanitizeAiGenerationBrandKit(editor.editorData?.brand_kit || {
          business_name: profileData?.professional_profile?.company_name || '',
        }),
        onboarding: editor.editorData?.brand_kit?.essentials || {},
      });
    },
    onSuccess: (data) => {
      const generated = data?.generated || {};
      const role = normalizeRole(
        profileData?.professional_profile?.professional_type || profileData?.professional_type,
      );
      setFormData((prev) => ({ ...prev, ...generated }));
      if (data?.draft) {
        editor.setEditorData((current) => ({
          ...(current || {}),
          template_key: data.draft.template?.id || current?.template_key || defaultStorefrontTemplateKey(role),
          brand_kit: {
            ...(current?.brand_kit || {}),
            business_name: profileData?.professional_profile?.company_name || current?.brand_kit?.business_name || '',
            logo_url: data.draft.brandKit?.logo_url || current?.brand_kit?.logo_url || '',
            primary_color: data.draft.brandKit?.primary_color || current?.brand_kit?.primary_color || '#0f766e',
            accent_color: data.draft.brandKit?.accent_color || current?.brand_kit?.accent_color || '#f59e0b',
            page_background: data.draft.brandKit?.page_background || current?.brand_kit?.page_background || '#ffffff',
            font: data.draft.brandKit?.font_family || current?.brand_kit?.font || 'Manrope',
            button_shape: current?.brand_kit?.button_shape || 'rounded',
            image_style: current?.brand_kit?.image_style || 'editorial',
            essentials: current?.brand_kit?.essentials || {},
          },
          blocks: seedBlockContentFromProfile(
            data.draft.blocks || [],
            profileSeedFromData(profileData),
            data.draft.template?.id || current?.template_key || defaultStorefrontTemplateKey(role),
          ),
        }));
        editor.setEditorDirty(true);
        editor.markHydrated();
        queryClient.invalidateQueries(['own-public-profile']);
        queryClient.invalidateQueries(['own-storefront-draft']);
      }
      toast.success(data?.message || 'AI landing page copy generated. Click Save to apply.');
    },
    onError: (error) => toast.error(error.message || 'Failed to generate AI copy'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePublicProfile(token),
    onSuccess: (data) => {
      queryClient.setQueryData(['own-public-profile'], (current) => (
        current ? { ...current, profile: null } : current
      ));
      queryClient.setQueryData(['own-storefront-draft'], (current) => (
        current
          ? {
              ...current,
              profile: null,
              draft: null,
              drafts: [],
              active_template_id: null,
              published_at: null,
            }
          : current
      ));
      queryClient.invalidateQueries(['own-public-profile']);
      queryClient.invalidateQueries(['own-storefront-draft']);
      setFormData({});
      editor.resetAfterDelete();
      setShowDeleteConfirm(false);
      toast.success(data?.message || 'Public webpage deleted');
    },
    onError: (error) => toast.error(error.message || 'Failed to delete public webpage'),
  });

  const handleSave = () => {
    if (Object.keys(formData).length > 0) {
      updateMutation.mutate(formData, {
        onSuccess: () => toast.success('Profile changes saved'),
      });
      setFormData({});
    }
    if (editor.editorDirty && editor.editorData) {
      saveStorefrontMutation.mutate(buildStorefrontDraft(editor.editorData), {
        onSuccess: () => {
          toast.success('Storefront draft saved');
          editor.setEditorDirty(false);
        },
      });
    }
  };

  const saveCurrentStorefrontDraft = async () => {
    if (!editor.editorData) return false;
    const currentDraft = buildStorefrontDraft(editor.editorData);
    try {
      await saveStorefrontMutation.mutateAsync(currentDraft);
      editor.markDraftSaved(currentDraft);
      return true;
    } catch {
      return false;
    }
  };

  const handlePublish = () => {
    if (publishInFlightRef.current) return publishInFlightRef.current;
    const currentDraft = editor.editorData ? buildStorefrontDraft(editor.editorData) : null;
    const finishPublish = () => {
      editor.markLiveSynced(currentDraft);
      toast.success(derived.isLive ? 'Live page updated' : 'Public page published');
    };
    const publishTask = (async () => {
      try {
        while (savePendingRef.current) {
          await new Promise((resolve) => window.setTimeout(resolve, 50));
        }
        if (currentDraft) {
          await saveStorefrontMutation.mutateAsync(currentDraft);
          editor.markDraftSaved(currentDraft);
        }
        await publishStorefrontMutation.mutateAsync(currentDraft);
        finishPublish();
        return true;
      } catch {
        return false;
      }
    })();
    publishInFlightRef.current = publishTask;
    return publishTask.finally(() => {
      if (publishInFlightRef.current === publishTask) {
        publishInFlightRef.current = null;
      }
    });
  };

  const handleDeleteWebPage = () => {
    if (!derived.profile) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteWebPage = () => deleteMutation.mutate();

  const handleCopyPublicUrl = async () => {
    if (!derived.slug || !origin) return;
    const nextPublicUrl = `${origin}/professional/${derived.slug}`;
    try {
      await navigator.clipboard.writeText(nextPublicUrl);
      setCopied(true);
      toast.success('Public link copied');
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return {
    token,
    canEditPublicProfile,
    isLoading,
    profileData,
    ...derived,
    editorData: editor.editorData,
    previewMode: editor.previewMode,
    copied,
    showDeleteConfirm,
    draggedBlockId: editor.draggedBlockId,
    setPreviewMode: editor.setPreviewMode,
    setDraggedBlockId: editor.setDraggedBlockId,
    setShowDeleteConfirm,
    updateMutation,
    saveStorefrontMutation,
    publishStorefrontMutation,
    generateCopyMutation,
    deleteMutation,
    updateEditor: editor.updateEditor,
    selectTemplate: editor.selectTemplate,
    updateBrandKit: editor.updateBrandKit,
    resetTemplateColors: editor.resetTemplateColors,
    resetTemplateDefaults: editor.resetTemplateDefaults,
    updateEssential: editor.updateEssential,
    uploadStorefrontMedia: editor.uploadStorefrontMedia,
    updateBlock: editor.updateBlock,
    moveBlock: editor.moveBlock,
    moveBlockTo: editor.moveBlockTo,
    addBlock: editor.addBlock,
    removeBlock: editor.removeBlock,
    handleSave,
    saveCurrentStorefrontDraft,
    handlePublish,
    handleDeleteWebPage,
    confirmDeleteWebPage,
    handleCopyPublicUrl,
    uploadMediaPending: editor.uploadMediaPending,
  };
}
