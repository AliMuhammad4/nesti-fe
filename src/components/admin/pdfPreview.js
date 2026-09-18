"use client";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const bufferCache = new Map();
const BUFFER_CACHE_MAX = 24;
const MAX_CONCURRENT_PDF = 2;

let activePdfRenders = 0;
const pdfWaitQueue = [];

function cacheKey({ url, proxyUrl }) {
  return String(proxyUrl || url || "");
}

function trimBufferCache() {
  while (bufferCache.size > BUFFER_CACHE_MAX) {
    const oldest = bufferCache.keys().next().value;
    bufferCache.delete(oldest);
  }
}

function runPdfSlot(task) {
  return new Promise((resolve, reject) => {
    const start = () => {
      activePdfRenders += 1;
      Promise.resolve()
        .then(task)
        .then(resolve, reject)
        .finally(() => {
          activePdfRenders -= 1;
          const next = pdfWaitQueue.shift();
          if (next) next();
        });
    };
    if (activePdfRenders < MAX_CONCURRENT_PDF) start();
    else pdfWaitQueue.push(start);
  });
}

export async function fetchDocBuffer({ url, proxyUrl, authToken }) {
  const key = cacheKey({ url, proxyUrl });
  if (key && bufferCache.has(key)) {
    return bufferCache.get(key);
  }

  let buffer;
  if (proxyUrl && authToken) {
    const res = await fetch(proxyUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error("Failed to load document");
    buffer = await res.arrayBuffer();
  } else {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load document");
    buffer = await res.arrayBuffer();
  }

  if (key) {
    bufferCache.set(key, buffer);
    trimBufferCache();
  }
  return buffer;
}

export async function renderPdfFirstPage(
  canvas,
  { url, proxyUrl, authToken, maxWidth = 420, maxHeight = 300 } = {}
) {
  return runPdfSlot(async () => {
    const data = await fetchDocBuffer({ url, proxyUrl, authToken });
    const pdf = await getDocument({ data: data.slice(0) }).promise;
    try {
      const page = await pdf.getPage(1);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(maxWidth / base.width, maxHeight / base.height, 2);
      const viewport = page.getViewport({ scale: Math.max(scale, 0.5) });
      const ctx = canvas.getContext("2d", { alpha: false });
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
    } finally {
      try {
        await pdf.destroy();
      } catch {
        /* ignore */
      }
    }
  });
}
