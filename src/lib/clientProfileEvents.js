export const CLIENT_PROFILE_UPDATED_EVENT = "nesti:client-profile-updated";

export function notifyClientProfileUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CLIENT_PROFILE_UPDATED_EVENT));
}
