import qrcode from 'qrcode-generator';
import { utf8Encode } from '../domain/encoding';

// The library defaults to Latin-1; bank QR names can contain Vietnamese.
qrcode.stringToBytes = utf8Encode;

export function qrModules(payload: string): boolean[][] {
  const qr = qrcode(0, 'M');
  qr.addData(payload, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

/** Decodes a QR from an image file entirely in the browser. Returns null if none found. */
export async function decodeQrImage(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  // Big photos slow jsQR down a lot and don't help accuracy.
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const { data } = ctx.getImageData(0, 0, w, h);
  // Loaded on demand: the decoder is most of the bundle and only needed for uploads.
  const { default: jsQR } = await import('jsqr');
  return jsQR(data, w, h, { inversionAttempts: 'attemptBoth' })?.data ?? null;
}
