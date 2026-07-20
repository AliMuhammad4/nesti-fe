import { Home, FileText, DollarSign, Users } from "lucide-react";

export const roles = [
  { value: "agent", label: "Real Estate Agent", icon: Home },
  { value: "mortgage_broker", label: "Mortgage Broker", icon: DollarSign },
  { value: "lawyer", label: "Real Estate Lawyer", icon: FileText },
  { value: "client", label: "Homebuyer", icon: Users, description: "Looking to buy a home" },
];

export const professionalRoles = [
  { value: "agent", label: "Real Estate Agent", icon: Home },
  { value: "mortgage_broker", label: "Mortgage Broker", icon: DollarSign },
  { value: "lawyer", label: "Real Estate Lawyer", icon: FileText },
];

export const clientRoles = [
  { value: "client", label: "Homebuyer", icon: Users, description: "Looking to buy a home" },
];

/** Workspace roles that must complete personal + business profile before using gated APIs */
export const PROFESSIONAL_ROLE_VALUES = professionalRoles.map((r) => r.value);

export const CLIENT_ROLE = 'client';

export const isClientRole = (role) => role === CLIENT_ROLE;
export const isProfessionalRole = (role) => PROFESSIONAL_ROLE_VALUES.includes(role);
