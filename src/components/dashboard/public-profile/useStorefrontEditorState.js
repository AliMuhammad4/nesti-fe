import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { STOREFRONT_TEMPLATE_PRESETS } from '@/components/storefront/storefrontPresets';
import { normalizeBlocks } from '@/components/storefront/builder/storefrontBuilderState';
import {
  getStorefrontTemplate,
  getTemplateBrandDefaults,
  materializeTemplate,
  seedBlockContentFromProfile,
} from '@/components/storefront/templates';
import { normalizeRole } from './editorConstants';
import {
  blockLayoutStyleSignature,
  buildStorefrontDraft,
  draftSignature,
  normalizeHexForCompare,
} from './storefrontBuilderUtils';

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

function cloneEditorData(data) {
  if (!data) return null;
  if (typeof structuredClone === 'function') return structuredClone(data);
  return JSON.parse(JSON.stringify(data));
}

function editorDataFromDraft(draft, profileSeed, professional, fallbackTemplateKey) {
  const templateKey = draft?.template?.id || fallbackTemplateKey;
  const savedBrandKit = draft?.brandKit || {};
  if (Array.isArray(draft?.blocks) && draft.blocks.length) {
    return {
      template_key: templateKey,
      brand_kit: {
        business_name: savedBrandKit.business_name || professional.company_name || '',
        logo_url: savedBrandKit.logo_url || '',
        logo_dark_url: savedBrandKit.logo_dark_url || '',
        cover_url: savedBrandKit.cover_url || '',
        profile_photo_url: savedBrandKit.profile_photo_url || '',
        logo_size: Number(savedBrandKit.logo_size) || 40,
        cover_position_x: Number(savedBrandKit.cover_position_x ?? 50),
        cover_position_y: Number(savedBrandKit.cover_position_y ?? 50),
        cover_zoom: Math.max(1, Number(savedBrandKit.cover_zoom ?? 1)),
        profile_position_x: Number(savedBrandKit.profile_position_x ?? 50),
        profile_position_y: Number(savedBrandKit.profile_position_y ?? 25),
        profile_zoom: Number(savedBrandKit.profile_zoom ?? 1),
        primary_color: savedBrandKit.primary_color || '#0f766e',
        accent_color: savedBrandKit.accent_color || '#f59e0b',
        page_background: savedBrandKit.page_background || '#ffffff',
        font: savedBrandKit.font_family || savedBrandKit.font || 'Manrope',
        button_shape: savedBrandKit.button_shape || 'rounded',
        image_style: savedBrandKit.image_style || 'editorial',
        show_chatbot: savedBrandKit.show_chatbot !== false,
        essentials: savedBrandKit.essentials || {},
      },
      blocks: seedBlockContentFromProfile(draft.blocks, profileSeed, templateKey),
    };
  }

  const materialized = materializeTemplate(templateKey, profileSeed, {
    business_name: professional.company_name || '',
  });
  return {
    template_key: templateKey,
    brand_kit: {
      business_name: professional.company_name || '',
      logo_url: '',
      logo_dark_url: '',
      cover_url: '',
      profile_photo_url: '',
      logo_size: 40,
      cover_position_x: 50,
      cover_position_y: 50,
      cover_zoom: 1,
      profile_position_x: 50,
      profile_position_y: 25,
      profile_zoom: 1,
      primary_color: '#0f766e',
      accent_color: '#f59e0b',
      page_background: '#ffffff',
      font: 'Manrope',
      button_shape: 'rounded',
      image_style: 'editorial',
      show_chatbot: true,
      essentials: {},
      ...(materialized?.brand_kit || {}),
    },
    blocks: materialized?.blocks || normalizeBlocks(STOREFRONT_TEMPLATE_PRESETS[professional.professional_type] || []),
  };
}

export default function useStorefrontEditorState({
  profileData,
  storefrontDraftData,
  storefrontDraftError,
  saveStorefrontMutation,
  uploadMedia,
  queryClient,
}) {
  const [editorData, setEditorData] = useState(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const editorHydrated = useRef(false);
  const lastSavedDraftSignatureRef = useRef('');
  const lastFailedDraftSignatureRef = useRef('');
  const templateDraftsRef = useRef({});
  const latestEditorDataRef = useRef(null);
  const queuedDraftRef = useRef(null);

  useEffect(() => {
    if (!profileData || editorHydrated.current) return;
    if (storefrontDraftData === undefined && !storefrontDraftError) return;

    try {
      const savedProfile = profileData.profile || {};
      const professional = profileData.professional_profile || {};
      const legacyDraft = storefrontDraftData?.draft || null;
      const savedDrafts = Array.isArray(storefrontDraftData?.drafts) && storefrontDraftData.drafts.length
        ? storefrontDraftData.drafts
        : (legacyDraft ? [legacyDraft] : []);
      const hasPersistedStorefront = Boolean(savedProfile?._id) || savedDrafts.some((draft) => draft?.blocks?.length);
      if (!hasPersistedStorefront) {
        setEditorData(null);
        editorHydrated.current = true;
        return;
      }
      const role = normalizeRole(
        professional.professional_type || profileData.professional_type || savedProfile.professional_type,
      );
      const profileSeed = {
        ...profileSeedFromData(profileData),
        headline: savedProfile.headline,
        tagline: savedProfile.tagline,
        about: savedProfile.about,
      };

      const fallbackTemplateKey = `${role}-classic`;
      const hydratedDrafts = savedDrafts.map((draft) => editorDataFromDraft(
        draft,
        profileSeed,
        professional,
        fallbackTemplateKey,
      ));
      hydratedDrafts.forEach((draft) => {
        templateDraftsRef.current[draft.template_key] = cloneEditorData(draft);
      });
      const activeTemplateKey = storefrontDraftData?.active_template_id
        || legacyDraft?.template?.id
        || hydratedDrafts[0]?.template_key
        || fallbackTemplateKey;
      const activeDraft = templateDraftsRef.current[activeTemplateKey]
        || editorDataFromDraft(null, profileSeed, professional, activeTemplateKey);
      templateDraftsRef.current[activeTemplateKey] = cloneEditorData(activeDraft);
      setEditorData(activeDraft);
      setHasUnpublishedChanges(false);
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
          page_background: '#ffffff',
          font: 'Manrope',
          button_shape: 'rounded',
          image_style: 'editorial',
          essentials: {},
        },
        blocks: normalizeBlocks(STOREFRONT_TEMPLATE_PRESETS[role] || []),
      });
      setHasUnpublishedChanges(false);
      editorHydrated.current = true;
    }
  }, [profileData, storefrontDraftData, storefrontDraftError]);

  useEffect(() => {
    if (!editorData?.template_key) return;
    latestEditorDataRef.current = editorData;
    templateDraftsRef.current[editorData.template_key] = cloneEditorData(editorData);
  }, [editorData]);

  useEffect(() => {
    if (!editorData || !editorDirty) return undefined;
    const draft = buildStorefrontDraft(editorData);
    const signature = draftSignature(draft);
    if (saveStorefrontMutation.isPending) {
      queuedDraftRef.current = { draft, signature };
      return undefined;
    }
    if (signature === lastFailedDraftSignatureRef.current) return undefined;
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
          lastFailedDraftSignatureRef.current = '';
          window.localStorage.removeItem(backupKey);
          const latestSignature = latestEditorDataRef.current
            ? draftSignature(buildStorefrontDraft(latestEditorDataRef.current))
            : signature;
          if (latestSignature === signature) setEditorDirty(false);
        },
        onError: () => {
          lastFailedDraftSignatureRef.current = signature;
        },
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [editorData, editorDirty, profileData, saveStorefrontMutation]);

  useEffect(() => {
    if (saveStorefrontMutation.isPending || !queuedDraftRef.current) return;
    const queued = queuedDraftRef.current;
    queuedDraftRef.current = null;
    if (queued.signature === lastSavedDraftSignatureRef.current) return;
    saveStorefrontMutation.mutate(queued.draft, {
      onSuccess: () => {
        lastSavedDraftSignatureRef.current = queued.signature;
        lastFailedDraftSignatureRef.current = '';
        const latestSignature = latestEditorDataRef.current
          ? draftSignature(buildStorefrontDraft(latestEditorDataRef.current))
          : queued.signature;
        if (latestSignature === queued.signature) setEditorDirty(false);
      },
      onError: () => {
        lastFailedDraftSignatureRef.current = queued.signature;
        setEditorDirty(true);
      },
    });
  }, [editorData, editorDirty, saveStorefrontMutation.isPending, saveStorefrontMutation]);

  const updateEditor = (updates) => {
    setEditorData((current) => ({ ...current, ...updates }));
    setEditorDirty(true);
    setHasUnpublishedChanges(true);
  };

  const selectTemplate = (templateKey) => {
    if (editorData?.template_key === templateKey) return false;
    const template = getStorefrontTemplate(templateKey);
    if (!template) return false;

    if (editorData?.template_key) {
      templateDraftsRef.current[editorData.template_key] = cloneEditorData(editorData);
      if (editorDirty) {
        saveStorefrontMutation.mutate(buildStorefrontDraft(editorData), {
          onSuccess: () => {
            lastSavedDraftSignatureRef.current = draftSignature(buildStorefrontDraft(editorData));
          },
        });
      }
    }
    const cachedTemplateDraft = templateDraftsRef.current[templateKey];
    if (cachedTemplateDraft) {
      setEditorData(cloneEditorData(cachedTemplateDraft));
      setEditorDirty(true);
      setHasUnpublishedChanges(true);
      toast.success(`${template.label} restored`);
      return true;
    }

    const next = materializeTemplate(templateKey, profileSeedFromData(profileData), editorData.brand_kit);
    if (!next) return false;
    setEditorData({
      template_key: next.template_key,
      brand_kit: next.brand_kit,
      blocks: next.blocks,
    });
    setEditorDirty(true);
    setHasUnpublishedChanges(true);
    toast.success(`${template.label} applied`);
    return true;
  };

  const updateBrandKit = (updates) => {
    setEditorData((current) => ({
      ...current,
      brand_kit: { ...current.brand_kit, ...updates },
    }));
    setEditorDirty(true);
    setHasUnpublishedChanges(true);
  };

  const resetTemplateColors = () => {
    const defaults = getTemplateBrandDefaults(editorData?.template_key);
    if (!defaults) return false;
    const alreadyDefault = (
      normalizeHexForCompare(editorData?.brand_kit?.primary_color) === normalizeHexForCompare(defaults.primary_color)
      && normalizeHexForCompare(editorData?.brand_kit?.accent_color) === normalizeHexForCompare(defaults.accent_color)
      && normalizeHexForCompare(editorData?.brand_kit?.page_background) === normalizeHexForCompare(defaults.page_background)
      && String(editorData?.brand_kit?.button_shape || 'rounded') === String(defaults.button_shape || 'rounded')
      && String(editorData?.brand_kit?.font || '') === String(defaults.font || '')
      && String(editorData?.brand_kit?.image_style || '') === String(defaults.image_style || '')
    );
    if (alreadyDefault) return false;
    updateBrandKit({
      primary_color: defaults.primary_color,
      accent_color: defaults.accent_color,
      page_background: defaults.page_background,
      button_shape: defaults.button_shape,
      font: defaults.font,
      image_style: defaults.image_style,
    });
    toast.success('Template colors restored');
    return true;
  };

  const resetTemplateDefaults = () => {
    const templateKey = editorData?.template_key;
    const template = getStorefrontTemplate(templateKey);
    if (!template) return false;

    const next = materializeTemplate(templateKey, profileSeedFromData(profileData), editorData.brand_kit);
    if (!next) return false;
    const currentBlocks = normalizeBlocks(editorData.blocks || []);
    const templateBlocks = normalizeBlocks(next.blocks || []);

    const currentByTypeAndIndex = new Map();
    const currentTypeCounts = {};
    currentBlocks.forEach((block) => {
      const count = (currentTypeCounts[block.type] || 0) + 1;
      currentTypeCounts[block.type] = count;
      const key = `${block.type}:${count}`;
      currentByTypeAndIndex.set(
        key,
        typeof structuredClone === 'function'
          ? structuredClone(block?.data?.content || {})
          : JSON.parse(JSON.stringify(block?.data?.content || {})),
      );
    });

    const templateTypeCounts = {};
    const blocksWithPreservedContent = templateBlocks.map((block) => {
      const count = (templateTypeCounts[block.type] || 0) + 1;
      templateTypeCounts[block.type] = count;
      const key = `${block.type}:${count}`;
      const preservedContent = currentByTypeAndIndex.get(key);
      if (!preservedContent) return block;
      return {
        ...block,
        data: {
          ...block.data,
          content: preservedContent,
        },
      };
    });
    const nextBrandKit = {
      ...next.brand_kit,
      business_name: editorData.brand_kit.business_name || next.brand_kit.business_name,
      logo_url: editorData.brand_kit.logo_url || '',
      logo_dark_url: editorData.brand_kit.logo_dark_url || '',
      cover_url: editorData.brand_kit.cover_url || '',
      profile_photo_url: editorData.brand_kit.profile_photo_url || '',
      logo_size: editorData.brand_kit.logo_size,
      cover_position_x: editorData.brand_kit.cover_position_x,
      cover_position_y: editorData.brand_kit.cover_position_y,
      cover_zoom: editorData.brand_kit.cover_zoom,
      profile_position_x: editorData.brand_kit.profile_position_x,
      profile_position_y: editorData.brand_kit.profile_position_y,
      profile_zoom: editorData.brand_kit.profile_zoom,
      essentials: editorData.brand_kit.essentials,
      show_chatbot: editorData.brand_kit.show_chatbot !== false,
    };
    const isNoopReset = blockLayoutStyleSignature(currentBlocks) === blockLayoutStyleSignature(templateBlocks)
      && JSON.stringify(editorData.brand_kit || {}) === JSON.stringify(nextBrandKit || {});
    if (isNoopReset) return false;
    setEditorData({
      template_key: next.template_key,
      brand_kit: nextBrandKit,
      blocks: blocksWithPreservedContent,
    });
    setEditorDirty(true);
    setHasUnpublishedChanges(true);
    toast.success(`${template.label} restored to defaults`);
    return true;
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
    setHasUnpublishedChanges(true);
  };

  const uploadStorefrontMedia = async (kind, file) => {
    if (!file) return;
    try {
      const response = await uploadMedia.mutateAsync({ kind, file, scope: 'storefront' });
      const url = response?.url || '';
      if (!url) throw new Error('Upload did not return an image URL');
      if (kind === 'logo') updateBrandKit({ logo_url: url });
      if (kind === 'cover') updateBrandKit({ cover_url: url });
      if (kind === 'profile') updateBrandKit({ profile_photo_url: url });
      toast.success(
        `${kind === 'profile' ? 'Page profile photo' : kind === 'cover' ? 'Page cover photo' : 'Logo'} updated for this storefront only`,
      );
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

  const resetAfterDelete = () => {
    setEditorData(null);
    setEditorDirty(false);
    setHasUnpublishedChanges(false);
    editorHydrated.current = false;
  };

  const markHydrated = () => {
    editorHydrated.current = true;
  };

  const markDraftSaved = (draft) => {
    lastSavedDraftSignatureRef.current = draftSignature(draft);
    setEditorDirty(false);
  };

  const markLiveSynced = () => {
    setHasUnpublishedChanges(false);
  };

  return {
    editorData,
    setEditorData,
    editorDirty,
    setEditorDirty,
    previewMode,
    setPreviewMode,
    draggedBlockId,
    setDraggedBlockId,
    updateEditor,
    selectTemplate,
    updateBrandKit,
    resetTemplateColors,
    resetTemplateDefaults,
    updateEssential,
    uploadStorefrontMedia,
    updateBlock,
    moveBlock,
    moveBlockTo,
    addBlock,
    removeBlock,
    resetAfterDelete,
    markHydrated,
    markDraftSaved,
    markLiveSynced,
    uploadMediaPending: uploadMedia.isPending,
    hasUnpublishedChanges,
  };
}
