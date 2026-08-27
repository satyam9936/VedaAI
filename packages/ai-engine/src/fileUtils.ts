/**
 * Turns uploaded Files (images or PDFs) into page rasters we can BOTH
 * send to Gemini and render in the <img> viewer.
 *
 * Rasterizing PDFs ourselves is deliberate: the bounding boxes Gemini returns are
 * normalized to the exact image we send it. If we sent the PDF natively but displayed
 * our own render, the boxes would drift. Same pixels in, same pixels on screen.
 */

export interface PageImage {
  /** data: URL — used as the <img src> in the viewer */
  dataUrl: string;
  /** RAW base64 (no "data:...;base64," prefix) — what the Gemini API requires */
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  sourceName: string;
  /** 1-based page number across the whole upload set */
  pageNumber: number;
}

/** Gemini inline-request payloads must stay under 20MB total. Keep well clear. */
const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.85;
const PDF_RASTER_SCALE = 2;

export async function filesToPages(files: File[]): Promise<PageImage[]> {
  const pages: PageImage[] = [];

  for (const file of files) {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      const pdfPages = await rasterizePdf(file);
      pages.push(...pdfPages);
    } else if (file.type.startsWith('image/')) {
      pages.push(await normalizeImage(file));
    } else {
      throw new Error(
        `Unsupported file type "${file.type || file.name}". Upload a PDF, PNG, or JPG.`
      );
    }
  }

  // Renumber sequentially across all files so box.page is unambiguous.
  return pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
}

/** Decode, downscale if oversized, re-encode as JPEG so payloads stay small. */
async function normalizeImage(file: File): Promise<PageImage> {
  const bitmap = await loadBitmap(file);
  const { canvas, width, height } = drawScaled(bitmap, bitmap.width, bitmap.height);
  bitmap.close?.();

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  return {
    dataUrl,
    base64: stripDataUrlPrefix(dataUrl),
    mimeType: 'image/jpeg',
    width,
    height,
    sourceName: file.name,
    pageNumber: 1,
  };
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error(`Could not read image "${file.name}". It may be corrupt.`);
  }
}

async function rasterizePdf(file: File): Promise<PageImage[]> {
  const pdfjs = await loadPdfJs();
  const buffer = await file.arrayBuffer();

  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  } catch {
    throw new Error(
      `Could not open PDF "${file.name}". If it is password-protected, remove the password first.`
    );
  }

  const out: PageImage[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: PDF_RASTER_SCALE });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable — cannot render PDF.');

    // White background: scans are often transparent-backed, which OCRs badly.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const scaled = drawScaled(canvas, canvas.width, canvas.height);
    const dataUrl = scaled.canvas.toDataURL('image/jpeg', JPEG_QUALITY);

    out.push({
      dataUrl,
      base64: stripDataUrlPrefix(dataUrl),
      mimeType: 'image/jpeg',
      width: scaled.width,
      height: scaled.height,
      sourceName: file.name,
      pageNumber: i,
    });

    page.cleanup();
  }

  return out;
}

/** Draw a source onto a canvas, downscaling so the longest edge <= MAX_EDGE_PX. */
function drawScaled(
  source: CanvasImageSource,
  srcW: number,
  srcH: number
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const ratio = Math.min(1, MAX_EDGE_PX / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * ratio));
  const height = Math.max(1, Math.round(srcH * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);

  return { canvas, width, height };
}

function stripDataUrlPrefix(dataUrl: string): string {
  // The Gemini API rejects the "data:image/jpeg;base64," prefix and any whitespace.
  const comma = dataUrl.indexOf(',');
  return (comma === -1 ? dataUrl : dataUrl.slice(comma + 1)).replace(/\s/g, '');
}

/** Lazy-load pdf.js and point it at its worker. Kept out of the main bundle. */
async function loadPdfJs(): Promise<any> {
  const pdfjs: any = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

/** Rough guard against blowing the 20MB inline-request ceiling. */
export function estimatePayloadBytes(pages: PageImage[]): number {
  return pages.reduce((sum, p) => sum + Math.ceil(p.base64.length * 0.75), 0);
}
