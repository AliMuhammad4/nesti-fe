import { createElement } from 'react';

/**
 * Renders a real DOM <style> tag without triggering Next/Turbopack's
 * styled-jsx transform (which only rewrites literal JSX <style> elements).
 */
export default function StorefrontInlineStyle({ css }) {
  if (!css) return null;
  return createElement('style', {
    dangerouslySetInnerHTML: { __html: css },
    suppressHydrationWarning: true,
  });
}
