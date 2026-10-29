export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function emailLayout(options: {
  siteName: string;
  title: string;
  body: string;
  siteUrl: string;
  footer?: string;
}): string {
  return `<!doctype html>
<html lang="id">
  <body style="margin:0;padding:32px 16px;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1d1d1f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.08);">
      <tr>
        <td style="padding:28px 32px 12px;">
          <div style="font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#86868b;">${escapeHtml(options.siteName)}</div>
          <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">${escapeHtml(options.title)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 32px 32px;font-size:15px;line-height:1.6;color:#424245;">
          ${options.body}
        </td>
      </tr>
      <tr>
        <td style="padding:18px 32px;background:#fbfbfd;border-top:1px solid #ececf0;font-size:12px;color:#86868b;">
          ${options.footer ?? `Email ini dikirim otomatis oleh ${escapeHtml(options.siteName)}.`}
          <br /><a href="${escapeHtml(options.siteUrl)}" style="color:#0071e3;text-decoration:none;">${escapeHtml(options.siteUrl)}</a>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function button(href: string, text: string): string {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">${escapeHtml(text)}</a></p>`;
}

export function magicLinkEmail(options: { siteName: string; siteUrl: string; link: string }): string {
  return emailLayout({
    siteName: options.siteName,
    siteUrl: options.siteUrl,
    title: 'Tautan masuk Anda',
    body: `<p>Klik tombol di bawah untuk masuk ke akun alumni Anda. Tautan berlaku selama 20 menit dan hanya bisa dipakai sekali.</p>
      ${button(options.link, 'Masuk ke akun')}
      <p style="font-size:13px;color:#86868b;">Jika Anda tidak meminta tautan ini, abaikan saja email ini.</p>`,
  });
}

export function registrationReceivedEmail(options: { siteName: string; siteUrl: string; name: string }): string {
  return emailLayout({
    siteName: options.siteName,
    siteUrl: options.siteUrl,
    title: 'Pendaftaran diterima',
    body: `<p>Halo ${escapeHtml(options.name)},</p>
      <p>Pendaftaran Anda sudah kami terima. Admin akan memverifikasi data keanggotaan Anda. Anda akan menerima email begitu akun diaktifkan.</p>`,
  });
}

export function accountApprovedEmail(options: { siteName: string; siteUrl: string; name: string }): string {
  return emailLayout({
    siteName: options.siteName,
    siteUrl: options.siteUrl,
    title: 'Akun alumni aktif',
    body: `<p>Halo ${escapeHtml(options.name)},</p>
      <p>Akun Anda sudah aktif. Silakan masuk untuk melengkapi profil dan mengakses kartu alumni digital Anda.</p>
      ${button(`${options.siteUrl}/masuk`, 'Masuk sekarang')}`,
  });
}

export function accountExistsEmail(options: { siteName: string; siteUrl: string }): string {
  return emailLayout({
    siteName: options.siteName,
    siteUrl: options.siteUrl,
    title: 'Email sudah terdaftar',
    body: `<p>Seseorang mencoba mendaftar dengan alamat email ini, tetapi akun tersebut sudah ada.</p>
      <p>Jika itu Anda, gunakan menu masuk untuk menerima tautan masuk. Tidak perlu kata sandi.</p>
      ${button(`${options.siteUrl}/masuk`, 'Masuk ke akun')}
      <p style="font-size:13px;color:#86868b;">Jika Anda tidak melakukan pendaftaran, abaikan email ini.</p>`,
  });
}

export function accountRejectedEmail(options: {
  siteName: string;
  siteUrl: string;
  name: string;
  note?: string | null;
}): string {
  return emailLayout({
    siteName: options.siteName,
    siteUrl: options.siteUrl,
    title: 'Pendaftaran belum dapat disetujui',
    body: `<p>Halo ${escapeHtml(options.name)},</p>
      <p>Pendaftaran Anda belum dapat kami setujui saat ini.</p>
      ${options.note ? `<p style="padding:12px 16px;background:#fff4e5;border-radius:12px;">${escapeHtml(options.note)}</p>` : ''}
      <p>Silakan hubungi sekretariat alumni jika Anda merasa ini keliru.</p>`,
  });
}

export function adminNotificationEmail(options: {
  siteName: string;
  siteUrl: string;
  title: string;
  lines: string[];
  link?: string;
}): string {
  return emailLayout({
    siteName: options.siteName,
    siteUrl: options.siteUrl,
    title: options.title,
    body: `<ul style="padding-left:18px;">${options.lines
      .map((line) => `<li style="margin:6px 0;">${escapeHtml(line)}</li>`)
      .join('')}</ul>
      ${options.link ? button(options.link, 'Buka CMS') : ''}`,
  });
}

export function jobModeratedEmail(options: {
  siteName: string;
  siteUrl: string;
  title: string;
  approved: boolean;
  note?: string | null;
  jobUrl?: string;
}): string {
  return emailLayout({
    siteName: options.siteName,
    siteUrl: options.siteUrl,
    title: options.approved ? 'Loker Anda sudah tayang' : 'Loker belum dapat diterbitkan',
    body: `<p>Loker <strong>${escapeHtml(options.title)}</strong> ${
      options.approved ? 'sudah disetujui dan tayang di situs alumni.' : 'belum dapat kami terbitkan saat ini.'
    }</p>
      ${options.note ? `<p style="padding:12px 16px;background:#fff4e5;border-radius:12px;">Catatan moderator: ${escapeHtml(options.note)}</p>` : ''}
      ${options.jobUrl ? button(options.jobUrl, 'Lihat loker') : ''}`,
  });
}

export function donationVerifiedEmail(options: {
  siteName: string;
  siteUrl: string;
  donorName: string;
  campaignTitle: string;
  campaignUrl: string;
  amount: number;
  verified: boolean;
}): string {
  const amount = 'Rp' + new Intl.NumberFormat('id-ID').format(options.amount);
  return emailLayout({
    siteName: options.siteName,
    siteUrl: options.siteUrl,
    title: options.verified ? 'Donasi Anda sudah diverifikasi' : 'Konfirmasi donasi belum dapat diverifikasi',
    body: `<p>Halo ${escapeHtml(options.donorName)},</p>
      <p>${
        options.verified
          ? `Terima kasih. Donasi Anda sebesar <strong>${escapeHtml(amount)}</strong> untuk kampanye <strong>${escapeHtml(options.campaignTitle)}</strong> sudah kami verifikasi.`
          : `Konfirmasi donasi Anda sebesar <strong>${escapeHtml(amount)}</strong> untuk kampanye <strong>${escapeHtml(options.campaignTitle)}</strong> belum dapat kami verifikasi. Hubungi sekretariat bila perlu bantuan.`
      }</p>
      ${button(options.campaignUrl, 'Lihat kampanye')}`,
  });
}

export function contactRelayEmail(options: {
  siteName: string;
  siteUrl: string;
  fromName: string;
  fromEmail: string;
  message: string;
  profileUrl?: string;
}): string {
  return emailLayout({
    siteName: options.siteName,
    siteUrl: options.siteUrl,
    title: 'Pesan baru dari alumni',
    body: `<p><strong>${escapeHtml(options.fromName)}</strong> (${escapeHtml(options.fromEmail)}) mengirim pesan:</p>
      <p style="padding:16px;background:#f5f5f7;border-radius:12px;white-space:pre-wrap;">${escapeHtml(options.message)}</p>
      ${options.profileUrl ? button(options.profileUrl, 'Lihat profil') : ''}`,
    footer: 'Balas langsung ke alamat email pengirim.',
  });
}
