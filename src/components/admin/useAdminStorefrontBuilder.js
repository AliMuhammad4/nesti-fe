import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store';
import {
  generateAdminProfessionalStorefrontDraft,
  getAdminProfessionalChatbotEmbeds,
  getAdminProfessionalStorefront,
  getAdminProfessionalStorefrontDraft,
  getAdminProfessionalStorefrontProperties,
  publishAdminProfessionalStorefront,
  saveAdminProfessionalStorefrontDraft,
  uploadAdminProfessionalStorefrontImage,
} from '@/lib/adminStorefrontClient';
import { seedBlockContentFromProfile } from '@/components/storefront/templates';
import { defaultStorefrontTemplateKey } from '@/components/storefront/storefrontPresets';
import { normalizeRole } from '@/components/dashboard/public-profile/editorConstants';
import {
  buildStorefrontDraft,
  sanitizeAiGenerationBrandKit,
} from '@/components/dashboard/public-profile/storefrontBuilderUtils';
import useStorefrontEditorState from '@/components/dashboard/public-profile/useStorefrontEditorState';

function profileSeedFromData(profileData) {
  const user = profileData?.user || {};
  const professional = profileData?.professional_profile || {};
  return {
    ...profileData?.profile,
    professional_name:
      professional.full_name
      || [user.first_name, user.last_name].filter(Boolean).join(' '),
    professional_profile: professional,
    email: profileData?.profile?.email || user.email || professional.email || '',
    user,
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

function storefrontRevisionToken(payload = {}) {
  const revision = payload?.draft || payload;
  const id = revision?.revision_id || null;
  const version = Number(revision?.revision_version);
  const templateKey = String(revision?.template?.id || '').trim();
  return id
    ? { id, version: Number.isSafeInteger(version) ? version : null, templateKey }
    : null;
}

export default function useAdminStorefrontBuilder(professionalId) {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  const id = String(professionalId || '').trim();

  const uploadMedia = useMutation({
    mutationFn: ({ file, kind }) => uploadAdminProfessionalStorefrontImage(token, id, { file, kind }),
    onError: (error) => {
      toast.error(
        error?.message
        || 'Could not upload storefront image for this professional.',
      );
    },
  });

  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({});
  const publishInFlightRef = useRef(null);
  const savePendingRef = useRef(false);
  const draftRevisionsRef = useRef({});
  const rememberRevision = useCallback((revision) => {
    const next = storefrontRevisionToken(revision);
    if (!next?.templateKey) return;
    draftRevisionsRef.current[next.templateKey] = next;
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const profileQueryKey = ['admin-professional-storefront', id];
  const draftQueryKey = ['admin-professional-storefront-draft', id];

  const {
    data: profileData,
    isLoading,
    isError: profileIsError,
    error: profileError,
    isFetching: profileFetching,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => getAdminProfessionalStorefront(token, id),
    enabled: Boolean(token && id),
  });

  const {
    data: storefrontDraftData,
    error: storefrontDraftError,
    isFetching: storefrontDraftFetching,
    isError: draftIsError,
    refetch: refetchDraft,
  } = useQuery({
    queryKey: draftQueryKey,
    queryFn: () => getAdminProfessionalStorefrontDraft(token, id),
    enabled: Boolean(token && id),
    retry: 1,
  });

  const loadEmbedLinks = useCallback(
    () => getAdminProfessionalChatbotEmbeds(token, id),
    [token, id],
  );

  const loadStorefrontProperties = useCallback(
    () => getAdminProfessionalStorefrontProperties(token, id),
    [token, id],
  );
  useEffect(() => {
    const nextRevisions = {};
    const collectRevision = (revision) => {
      const next = storefrontRevisionToken(revision);
      if (next?.templateKey) nextRevisions[next.templateKey] = next;
    };
    (storefrontDraftData?.drafts || []).forEach(collectRevision);
    collectRevision(storefrontDraftData?.draft);
    draftRevisionsRef.current = nextRevisions;
  }, [storefrontDraftData]);

  const saveStorefrontMutation = useMutation({
    mutationFn: (draft) => saveAdminProfessionalStorefrontDraft(
      token,
      id,
      draft,
      draftRevisionsRef.current[draft?.template?.id] || null,
    ),
    onSuccess: (data) => {
      rememberRevision(data?.draft);
      queryClient.setQueryData(draftQueryKey, (current) => ({
        ...(current || {}),
        success: true,
        draft: data?.draft || current?.draft || null,
        drafts: data?.drafts || current?.drafts || [],
        active_template_id: data?.active_template_id || current?.active_template_id || null,
        published_at: current?.published_at || null,
      }));
    },
    onError: (error) => {
      if (error?.status === 409) {
        rememberRevision(error.currentRevision);
        queryClient.invalidateQueries({ queryKey: draftQueryKey });
        toast.error(
          'This storefront changed in another session. Refresh before saving again.',
          { toastId: 'admin-storefront-revision-conflict' },
        );
        return;
      }
      toast.error(error.message || 'Failed to save storefront draft');
    },
  });

  const publishStorefrontMutation = useMutation({
    mutationFn: (draft) => publishAdminProfessionalStorefront(
      token,
      id,
      draft,
      draftRevisionsRef.current[draft?.template?.id] || null,
    ),
    onSuccess: (data) => {
      rememberRevision(data?.published);
      queryClient.invalidateQueries({ queryKey: draftQueryKey });
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
      queryClient.invalidateQueries({ queryKey: ['admin', 'professional', id] });
    },
    onError: (error) => {
      if (error?.status === 409) {
        rememberRevision(error.currentRevision);
        queryClient.invalidateQueries({ queryKey: draftQueryKey });
        toast.error(
          'This storefront changed in another session. Refresh before publishing.',
          { toastId: 'admin-storefront-publish-conflict' },
        );
        return;
      }
      if (error?.status === 402) {
        toast.error(error.message || 'This template is locked until the professional subscribes.');
        return;
      }
      toast.error(error.message || 'Failed to publish storefront');
    },
  });

  const editor = useStorefrontEditorState({
    profileData,
    storefrontDraftData,
    storefrontDraftError,
    storefrontDraftFetching,
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
      professionalProfile.full_name
      || [user.first_name, user.last_name].filter(Boolean).join(' ')
      || 'Professional';
    const roleLabel = roleLabelFromProfile(profileData);
    const publicUrl = slug ? `${origin || ''}/p/${slug}` : '';
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
      const templateKey = editor.editorData?.template_key || defaultStorefrontTemplateKey(role);
      const expectedRevision = draftRevisionsRef.current[templateKey];
      return generateAdminProfessionalStorefrontDraft(token, id, {
        template_key: templateKey,
        brand_kit: sanitizeAiGenerationBrandKit(editor.editorData?.brand_kit || {
          business_name: profileData?.professional_profile?.company_name || '',
        }),
        onboarding: editor.editorData?.brand_kit?.essentials || {},
        ...(expectedRevision?.id
          ? { expected_revision_id: expectedRevision.id }
          : {}),
        ...(Number.isSafeInteger(expectedRevision?.version)
          ? { expected_revision_version: expectedRevision.version }
          : {}),
      });
    },
    onSuccess: (data) => {
      const generated = data?.generated || {};
      rememberRevision(data?.draft);
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
        queryClient.invalidateQueries({ queryKey: profileQueryKey });
        queryClient.invalidateQueries({ queryKey: draftQueryKey });
      }
      toast.success(data?.message || 'Draft generated. Publish when ready.');
    },
    onError: (error) => {
      if (error?.status === 409) {
        rememberRevision(error.currentRevision);
        queryClient.invalidateQueries({ queryKey: draftQueryKey });
        toast.error(
          'This storefront changed in another session. Refresh before generating new copy.',
          { toastId: 'admin-storefront-generate-conflict' },
        );
        return;
      }
      toast.error(error.message || 'Failed to generate draft');
    },
  });

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

  const handleCopyPublicUrl = async () => {
    if (!derived.slug || !origin) return;
    try {
      await navigator.clipboard.writeText(derived.publicUrl);
      setCopied(true);
      toast.success('Public link copied');
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return {
    token,
    professionalId: id,
    isLoading,
    isError: profileIsError || draftIsError,
    loadError: profileError || storefrontDraftError,
    isFetching: profileFetching || storefrontDraftFetching,
    refetch: () => {
      refetchProfile();
      refetchDraft();
    },
    profileData,
    entitlements: profileData?.entitlements || { templates: [] },
    loadEmbedLinks,
    loadStorefrontProperties,
    ...derived,
    editorData: editor.editorData,
    previewMode: editor.previewMode,
    copied,
    draggedBlockId: editor.draggedBlockId,
    setPreviewMode: editor.setPreviewMode,
    setDraggedBlockId: editor.setDraggedBlockId,
    saveStorefrontMutation,
    publishStorefrontMutation,
    generateCopyMutation,
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
    handlePublish,
    handleCopyPublicUrl,
    uploadMediaPending: editor.uploadMediaPending,
  };
}
