import { useRef, useState } from 'react';
import { marked } from 'marked';
import { Bold, Eye, Heading2, Italic, Link as LinkIcon, List, Pencil, Quote } from 'lucide-react';

interface Props {
  name: string;
  initialValue?: string;
  rows?: number;
}

function safePreview(markdown: string): string {
  const raw = marked.parse(markdown ?? '', { async: false, gfm: true, breaks: true }) as string;
  if (typeof window === 'undefined') return '';
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  doc
    .querySelectorAll('script, iframe, object, embed, style, link, meta, form')
    .forEach((node) => node.remove());
  doc.querySelectorAll('*').forEach((element) => {
    for (const attribute of [...element.attributes]) {
      if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name);
      if (
        (attribute.name === 'href' || attribute.name === 'src') &&
        /^\s*(javascript|data):/i.test(attribute.value)
      ) {
        element.removeAttribute(attribute.name);
      }
    }
  });
  return doc.body.innerHTML;
}

export default function MarkdownEditor({ name, initialValue = '', rows = 16 }: Props) {
  const [value, setValue] = useState(initialValue);
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = before) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    });
  }

  function prefixLine(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = value.lastIndexOf('\n', textarea.selectionStart - 1) + 1;
    const next = `${value.slice(0, start)}${prefix}${value.slice(start)}`;
    setValue(next);
  }

  return (
    <div>
      <div className="row wrap" style={{ gap: '0.25rem', marginBottom: '0.5rem' }}>
        <button type="button" className="icon-btn" aria-label="Tebal" title="Tebal" onClick={() => wrap('**')}>
          <Bold size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="Miring" title="Miring" onClick={() => wrap('_')}>
          <Italic size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="Judul" title="Judul" onClick={() => prefixLine('## ')}>
          <Heading2 size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="Daftar" title="Daftar" onClick={() => prefixLine('- ')}>
          <List size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="Kutipan" title="Kutipan" onClick={() => prefixLine('> ')}>
          <Quote size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="Tautan" title="Tautan" onClick={() => wrap('[', '](https://)')}>
          <LinkIcon size={16} />
        </button>
        <div style={{ marginLeft: 'auto' }} className="segmented">
          <button
            type="button"
            className="segment"
            aria-pressed={mode === 'write'}
            onClick={() => setMode('write')}
          >
            <Pencil size={13} style={{ display: 'inline', marginRight: 4 }} />
            Tulis
          </button>
          <button
            type="button"
            className="segment"
            aria-pressed={mode === 'preview'}
            onClick={() => setMode('preview')}
          >
            <Eye size={13} style={{ display: 'inline', marginRight: 4 }} />
            Pratinjau
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className="textarea"
        name={name}
        rows={rows}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={{ display: mode === 'write' ? 'block' : 'none', fontFamily: 'var(--font-mono)', fontSize: '0.86rem' }}
      />

      {mode === 'preview' && (
        <div
          className="prose-content"
          style={{
            minHeight: '16rem',
            padding: '1rem',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--stroke)',
            background: 'var(--surface-input)',
          }}
          dangerouslySetInnerHTML={{ __html: safePreview(value) }}
        />
      )}
      <p className="hint" style={{ marginTop: '0.35rem' }}>
        Markdown didukung. HTML mentah akan dibuang saat disimpan.
      </p>
    </div>
  );
}
