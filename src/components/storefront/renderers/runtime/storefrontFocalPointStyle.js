export function clampFocalValue(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

export function storefrontFocalPointStyle({
  x = 50,
  y = 50,
  zoom = 1,
  minZoom = 0.6,
  maxZoom = 3,
} = {}) {
  const focalX = clampFocalValue(x, 0, 100, 50);
  const focalY = clampFocalValue(y, 0, 100, 50);
  const scale = clampFocalValue(zoom, minZoom, maxZoom, 1);

  return {
    objectPosition: `${focalX}% ${focalY}%`,
    transform: `scale(${scale})`,
    transformOrigin: `${focalX}% ${focalY}%`,
  };
}
