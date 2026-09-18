"use client";

import { useEffect, useState } from "react";

/** Returns `value` after it has been stable for `delayMs` (default 300). */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export default useDebouncedValue;
