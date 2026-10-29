import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { compressImageDetailed } from '../../lib/image';

export default function MediaUploader() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    setBusy(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const compressed = await compressImageDetailed(file, 1600, 0.85);
        const form = new FormData();
        form.set('file', new File([compressed.blob], 'media.webp', { type: 'image/webp' }));
        form.set('folder', 'library');
        form.set('width', String(compressed.width));
        form.set('height', String(compressed.height));
        const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
        const data = (await response.json()) as { ok?: boolean; error?: string };
        if (!data.ok) throw new Error(data.error ?? 'Upload gagal');
      }
      window.location.reload();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />}
        {busy ? 'Mengunggah…' : 'Unggah media'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={(event) => {
          if (event.target.files?.length) void upload(event.target.files);
        }}
      />
      {error && <p className="error-text" style={{ marginTop: '0.35rem' }}>{error}</p>}
    </div>
  );
}
