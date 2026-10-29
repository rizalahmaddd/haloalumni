import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../src/server/markdown';

describe('renderMarkdown', () => {
  it('merender heading dan daftar', () => {
    const html = renderMarkdown('## Kabar\n\n- satu\n- dua');
    expect(html).toContain('<h2>Kabar</h2>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>satu</li>');
  });

  it('membuang script dan iframe', () => {
    const html = renderMarkdown('<script>alert(1)</script>\n\n<iframe src="https://evil"></iframe>\n\nAman');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<iframe');
    expect(html).toContain('Aman');
  });

  it('menolak tautan javascript dan menambahkan rel', () => {
    const html = renderMarkdown('[klik](javascript:alert(1)) dan [situs](https://example.com)');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('rel="nofollow noopener"');
    expect(html).toContain('target="_blank"');
  });

  it('membuang atribut event handler pada HTML mentah', () => {
    const html = renderMarkdown('<div onclick="alert(1)">tes</div>');
    expect(html).not.toContain('onclick');
  });
});
