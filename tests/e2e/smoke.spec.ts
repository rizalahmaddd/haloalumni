import { expect, test } from '@playwright/test';

test('beranda menampilkan statistik dan navigasi', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toBeVisible();
  await expect(page.locator('footer')).toContainText('©');
});

test('direktori dapat difilter lewat query', async ({ page }) => {
  await page.goto('/direktori?q=Rina');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Temukan alumni');
  await expect(page.locator('main')).toContainText('Rina Pratiwi');
});

test('halaman masuk dapat diakses dan meminta email', async ({ page }) => {
  await page.goto('/masuk');
  await expect(page.getByRole('heading', { name: 'Masuk ke akun alumni' })).toBeVisible();
  await expect(page.getByLabel('Alamat email')).toBeVisible();
});

test('halaman admin mengarahkan ke login tanpa sesi', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/masuk/);
});

test('sitemap memuat konten dinamis', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('/direktori/rina-pratiwi');
});
