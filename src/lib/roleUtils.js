import { CLIENT_ROLE, PROFESSIONAL_ROLE_VALUES } from '@/constants/auth';
import { isTrialExpiredOrLocked, getUpgradeBillingRoute } from '@/lib/trialSubscriptionGate';

/**
 * Determines the appropriate dashboard route based on user role
 * @param {string} role - User role (agent, mortgage_broker, lawyer, client, admin)
 * @returns {string} - Dashboard route path
 */
export function getDashboardRoute(role) {
  const normalized = String(role || "").toLowerCase();
  if (normalized === CLIENT_ROLE) {
    return '/client-dashboard';
  }

  if (normalized === 'admin') {
    return '/admin';
  }
  
  if (PROFESSIONAL_ROLE_VALUES.includes(normalized)) {
    return '/dashboard';
  }
  
  // Default fallback
  return '/dashboard';
}

/**
 * Determines the appropriate post-login route based on role and trial status.
 * If the user's trial has expired, sends them directly to billing/checkout,
 * avoiding any intermediate dashboard paint or screen bounce.
 * @param {Object} user - User object with role and accountStatus
 * @returns {string} - Safe destination route
 */
export function getPostLoginRoute(user) {
  if (!user) return '/dashboard';
  const role = String(user?.role || "").toLowerCase();
  // Admins never belong in professional checkout / trial paywalls.
  if (role === 'admin') return '/admin';
  if (isTrialExpiredOrLocked(user)) {
    return getUpgradeBillingRoute(user);
  }
  return getDashboardRoute(role);
}

/**
 * Checks if a user is a client
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export function isClient(user) {
  return user?.role === CLIENT_ROLE;
}

/**
 * Checks if a user is a professional
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export function isProfessional(user) {
  return PROFESSIONAL_ROLE_VALUES.includes(user?.role);
}

/**
 * Gets a user-friendly role label
 * @param {string} role - User role
 * @returns {string} - Friendly label
 */
export function getRoleLabel(role) {
  const roleMap = {
    agent: 'Real Estate Agent',
    mortgage_broker: 'Mortgage Broker',
    lawyer: 'Real Estate Lawyer',
    client: 'Homebuyer',
    admin: 'Administrator',
  };
  
  return roleMap[role] || role;
}
