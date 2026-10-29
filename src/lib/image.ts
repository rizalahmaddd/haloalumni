export async function compressImageDetailed(
  file: File,
  maxSize: number,
  quality = 0.82,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas tidak tersedia');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Gagal memproses gambar'))),
      'image/webp',
      quality,
    );
  });
  return { blob, width, height };
}

export async function compressImage(file: File, maxSize: number, quality = 0.82): Promise<Blob> {
  return (await compressImageDetailed(file, maxSize, quality)).blob;
}

export function mediaUrlClient(key: string | null | undefined): string | null {
  if (!key) return null;
  if (/^https?:\/\//i.test(key)) return key;
  if (key.startsWith('/')) return key;
  return `/media/${key}`;
}
