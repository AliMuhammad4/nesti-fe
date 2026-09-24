import { apiClient, API_ENDPOINTS } from '@/lib/api';

function revisionPayload(draft, expectedRevision = null) {
  return {
    ...(draft ? { draft } : {}),
    ...(expectedRevision?.id ? { expected_revision_id: expectedRevision.id } : {}),
    ...(Number.isSafeInteger(expectedRevision?.version)
      ? { expected_revision_version: expectedRevision.version }
      : {}),
  };
}

function attachRevisionError(error, fallbackMessage) {
  const next = error instanceof Error ? error : new Error(fallbackMessage);
  if (error?.status) next.status = error.status;
  if (error?.code) next.code = error.code;
  if (error?.current_revision || error?.currentRevision) {
    next.currentRevision = error.current_revision || error.currentRevision;
  }
  if (!next.message) next.message = fallbackMessage;
  return next;
}

export async function getAdminProfessionalStorefront(token, professionalId) {
  return apiClient({
    url: API_ENDPOINTS.admin.professionalStorefront(professionalId),
    token,
  });
}

export async function getAdminProfessionalStorefrontDraft(token, professionalId) {
  return apiClient({
    url: API_ENDPOINTS.admin.professionalStorefrontDraft(professionalId),
    token,
  });
}

export async function getAdminProfessionalStorefrontProperties(token, professionalId) {
  return apiClient({
    url: API_ENDPOINTS.admin.professionalStorefrontProperties(professionalId),
    token,
  });
}

export async function getAdminProfessionalChatbotEmbeds(token, professionalId) {
  return apiClient({
    url: API_ENDPOINTS.admin.professionalChatbotEmbeds(professionalId),
    token,
  });
}

/**
 * Multipart upload for admin-edited storefront media.
 * Assets are stored under the professional's user id (scope=storefront).
 */
export async function uploadAdminProfessionalStorefrontImage(token, professionalId, { file, kind }) {
  if (!token) throw new Error('missing or invalid Authorization header');
  if (!file) throw new Error('Missing image file');
  const data = new FormData();
  data.append('file', file);
  data.append('kind', kind);
  data.append('scope', 'storefront');
  return apiClient({
    url: API_ENDPOINTS.admin.professionalStorefrontUploadImage(professionalId),
    method: 'POST',
    token,
    data,
  });
}

export async function saveAdminProfessionalStorefrontDraft(
  token,
  professionalId,
  draft,
  expectedRevision = null,
) {
  try {
    return await apiClient({
      url: API_ENDPOINTS.admin.professionalStorefrontDraft(professionalId),
      method: 'PUT',
      token,
      data: revisionPayload(draft, expectedRevision),
    });
  } catch (error) {
    throw attachRevisionError(error, 'Failed to save storefront draft');
  }
}

export async function publishAdminProfessionalStorefront(
  token,
  professionalId,
  draft = null,
  expectedRevision = null,
) {
  try {
    return await apiClient({
      url: API_ENDPOINTS.admin.professionalStorefrontPublish(professionalId),
      method: 'POST',
      token,
      data: revisionPayload(draft, expectedRevision),
    });
  } catch (error) {
    throw attachRevisionError(error, 'Failed to publish storefront');
  }
}

export async function generateAdminProfessionalStorefrontDraft(
  token,
  professionalId,
  payload = {},
) {
  try {
    return await apiClient({
      url: API_ENDPOINTS.admin.professionalStorefrontGenerate(professionalId),
      method: 'POST',
      token,
      data: payload,
    });
  } catch (error) {
    throw attachRevisionError(error, 'Failed to generate storefront draft');
  }
}
