import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Search, X } from 'lucide-react';
import { compressImageDetailed, mediaUrlClient } from '../../lib/image';

interface MediaItem {
  id: string;
  key: string;
  filename: string;
  alt: string | null;
  size: number;
}

interface Props {
  name: string;
  label: string;
  initialKey?: string | null;
  folder?: string;
}

export default function MediaPicker({ name, label, initialKey = '', folder = 'library' }: Props) {
  const [value, setValue] = useState(initialKey ?? '');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      void load();
    } else {
      dialogRef.current?.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function load(searchText = query) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/media?q=${encodeURIComponent(searchText)}&limit=60`);
      const data = (await response.json()) as { items?: MediaItem[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Gagal memuat media');
      setItems(data.items ?? []);
    } catch (loadError) {
      setItems([]);
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat media');
    } finally {
      setLoading(false);
    }
  }

  async function upload(file: File) {
    setLoading(true);
    try {
      const compressed = await compressImageDetailed(file, 1600, 0.85);
      const form = new FormData();
      form.set('file', new File([compressed.blob], 'media.webp', { type: 'image/webp' }));
      form.set('folder', folder);
      form.set('width', String(compressed.width));
      form.set('height', String(compressed.height));
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = (await response.json()) as { ok?: boolean; key?: string; error?: string };
      if (data.ok && data.key) {
        setValue(data.key);
        await load('');
        setOpen(false);
      } else {
        setError(data.error ?? 'Upload gagal');
      }
    } finally {
      setLoading(false);
    }
  }

  const preview = mediaUrlClient(value || null);

  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="row wrap" style={{ gap: '0.5rem' }}>
        <div
          style={{
            width: 84,
            height: 62,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid var(--stroke)',
            background: 'var(--surface-input)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          {preview ? (
            <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImagePlus size={18} style={{ color: 'var(--text-tertiary)' }} />
          )}
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
          Pilih media
        </button>
        {value && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setValue('')}>
            Hapus
          </button>
        )}
        <input type="hidden" name={name} value={value} />
      </div>

      <dialog
        ref={dialogRef}
        className="glass-thick"
        style={{ border: 0, padding: 0, width: 'min(880px, 94vw)', maxHeight: '86vh', color: 'var(--text-primary)' }}
        onClose={() => setOpen(false)}
      >
        <div style={{ padding: '1.1rem' }}>
          <div className="spread" style={{ marginBottom: '0.8rem' }}>
            <strong>Pilih media</strong>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Tutup">
              <X size={16} />
            </button>
          </div>

          <div className="row wrap" style={{ gap: '0.5rem', marginBottom: '0.9rem' }}>
            <div className="search-field" style={{ flex: 1 }}>
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void load(query);
                  }
                }}
                placeholder="Cari nama file…"
              />
            </div>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              <ImagePlus size={15} />
              Unggah
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
            </label>
          </div>

          {loading && <p className="muted" style={{ fontSize: '0.85rem' }}>Memuat…</p>}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.6rem',
              maxHeight: '52vh',
              overflowY: 'auto',
            }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setValue(item.key);
                  setOpen(false);
                }}
                style={{
                  border: '1px solid var(--stroke)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'var(--surface-raised)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                }}
              >
                <img
                  src={mediaUrlClient(item.key) ?? ''}
                  alt={item.alt ?? item.filename}
                  style={{ width: '100%', height: 96, objectFit: 'cover' }}
                />
                <span style={{ display: 'block', padding: '0.4rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {item.filename}
                </span>
              </button>
            ))}
          </div>

          {error && <p className="error-text" style={{ fontSize: '0.85rem' }}>{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="muted" style={{ fontSize: '0.85rem' }}>Belum ada media. Unggah gambar pertama.</p>
          )}
        </div>
      </dialog>
    </div>
  );
}
