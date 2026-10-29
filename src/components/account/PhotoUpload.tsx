import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { compressImage, compressImageDetailed, mediaUrlClient } from '../../lib/image';

interface Props {
  photoKey?: string | null;
  thumbKey?: string | null;
}

export default function PhotoUpload({ photoKey = '', thumbKey = '' }: Props) {
  const [mainKey, setMainKey] = useState(photoKey ?? '');
  const [thumb, setThumb] = useState(thumbKey ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError('');
    try {
      const [main, small] = await Promise.all([
        compressImageDetailed(file, 960, 0.85),
        compressImage(file, 320, 0.8),
      ]);
      const form = new FormData();
      form.set('file', new File([main.blob], 'photo.webp', { type: 'image/webp' }));
      form.set('thumb', new File([small], 'thumb.webp', { type: 'image/webp' }));
      form.set('width', String(main.width));
      form.set('height', String(main.height));
      const response = await fetch('/api/akun/upload', { method: 'POST', body: form });
      const data = (await response.json()) as {
        ok?: boolean;
        key?: string;
        thumbKey?: string;
        error?: string;
      };
      if (!data.ok || !data.key) throw new Error(data.error ?? 'Upload gagal');
      setMainKey(data.key);
      setThumb(data.thumbKey ?? '');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload gagal');
    } finally {
      setBusy(false);
    }
  }

  const preview = mediaUrlClient(thumb || mainKey || null);

  return (
    <div className="row" style={{ gap: '0.9rem', alignItems: 'center' }}>
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1px solid var(--stroke)',
          background: 'var(--accent-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        {preview ? (
          <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ImagePlus size={22} style={{ color: 'var(--accent)' }} />
        )}
      </div>

      <div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />}
          {busy ? 'Mengunggah…' : 'Ganti foto'}
        </button>
        <p className="hint" style={{ marginTop: '0.35rem' }}>
          JPG/PNG/WebP, otomatis dikompres. Maks 3MB.
        </p>
        {error && <p className="error-text">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <input type="hidden" name="photoKey" value={mainKey} />
      <input type="hidden" name="thumbKey" value={thumb} />
    </div>
  );
}
