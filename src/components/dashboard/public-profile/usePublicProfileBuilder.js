import { useEffect, useMemo, useState } from 'react';
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
      }));
    },
    onError: (error) => toast.error(error.message || 'Failed to save storefront draft'),
  });

  const publishStorefrontMutation = useMutation({
    mutationFn: () => publishStorefront(token),
    onSuccess: () => queryClient.invalidateQueries(['own-storefront-draft']),
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

  const derived = useMemo(() => {
    const profile = profileData?.profile;
    const slug = profile?.slug || profileData?.suggested_slug;
    const hasDraftContent = Boolean(storefrontDraftData?.draft?.blocks?.length);
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
    // Allow:
    // - first publish when page is not live yet
    // - update live when there are unsaved edits OR saved-but-unpublished draft changes
    // Disallow:
    // - update live when already live and there is no draft delta
    const canPublish = hasDraftContent && (!isLive || hasUnsavedChanges || editor.hasUnpublishedChanges);
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
  }, [profileData, storefrontDraftData, origin, formData, editor.editorDirty, editor.hasUnpublishedChanges]);

  const generateCopyMutation = useMutation({
    mutationFn: () => {
      const role = normalizeRole(
        profileData?.professional_profile?.professional_type || profileData?.professional_type,
      );
      return generateStorefrontDraft(token, {
        template_key: editor.editorData?.template_key || `${role}-classic`,
        brand_kit: sanitizeAiGenerationBrandKit(editor.editorData?.brand_kit || {
          business_name: profileData?.professional_profile?.company_name || '',
        }),
        onboarding: editor.editorData?.brand_kit?.essentials || {},
      });
    },
    onSuccess: (data) => {
      const generated = data?.generated || {};
      setFormData((prev) => ({ ...prev, ...generated }));
      if (data?.draft) {
        editor.setEditorData((current) => ({
          ...(current || {}),
          template_key: data.draft.template?.id || current?.template_key || 'agent-classic',
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
            data.draft.template?.id || current?.template_key || 'agent-classic',
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
        current ? { ...current, profile: null, draft: null, published_at: null } : current
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

  const handlePublish = () => {
    const enablePublicPage = () => updateMutation.mutate({ enabled: true }, {
      onSuccess: () => {
        editor.markLiveSynced();
        toast.success('Public page published');
      },
    });
    const publish = () => publishStorefrontMutation.mutate(undefined, { onSuccess: enablePublicPage });
    if (editor.editorDirty && editor.editorData) {
      const draft = buildStorefrontDraft(editor.editorData);
      saveStorefrontMutation.mutate(draft, {
        onSuccess: () => {
          editor.markDraftSaved(draft);
          publish();
        },
      });
      return;
    }
    publish();
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
    handlePublish,
    handleDeleteWebPage,
    confirmDeleteWebPage,
    handleCopyPublicUrl,
    uploadMediaPending: editor.uploadMediaPending,
  };
}
