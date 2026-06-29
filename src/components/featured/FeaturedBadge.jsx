import { Star } from "lucide-react";

export default function FeaturedBadge({ planKey, size = "md", className = "" }) {
  const getPlanStyles = (plan) => {
    switch (plan) {
      case 'enterprise':
        return {
          bgClass: 'bg-gradient-to-r from-amber-500 to-yellow-500',
          label: 'Premium Featured',
        };
      case 'standard':
        return {
          bgClass: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          label: 'Featured',
        };
      case 'basic':
        return {
          bgClass: 'bg-gradient-to-r from-gray-500 to-gray-600',
          label: 'Featured',
        };
      default:
        return {
          bgClass: 'bg-gray-200',
          label: 'Featured',
        };
    }
  };

  const getSizeClasses = (s) => {
    switch (s) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      case 'md':
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const getIconSize = (s) => {
    switch (s) {
      case 'sm':
        return 10;
      case 'lg':
        return 16;
      case 'md':
      default:
        return 12;
    }
  };

  const { bgClass, label } = getPlanStyles(planKey);
  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold text-white ${bgClass} ${sizeClasses} ${className}`}
    >
      <Star size={iconSize} fill="currentColor" />
      {label}
    </span>
  );
}

export function PlanBadge({ planKey, showLabel = true, size = "md", className = "" }) {
  if (!planKey || !['basic', 'standard', 'enterprise'].includes(planKey)) {
    return null;
  }

  return <FeaturedBadge planKey={planKey} size={size} className={className} />;
}
