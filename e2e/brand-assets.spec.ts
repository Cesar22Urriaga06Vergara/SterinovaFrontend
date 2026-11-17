import { expect, test } from '@playwright/test';

for (const path of ['/login', '/reset-password']) {
  test(`brand assets load on ${path}`, async ({ page }, testInfo) => {
    await page.goto(path);
    const logo = page.getByRole('img', { name: 'Sterinova', exact: true });
    await expect(logo).toBeVisible();
    await expect.poll(() => logo.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    await expect(page.locator('link[rel="icon"][href^="/icon.png"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('sizes', '180x180');
    const favicon = await page.request.get('/favicon.ico');
    expect(favicon.ok()).toBe(true);
    expect((await favicon.body()).subarray(0, 4).toString('hex')).toBe('00000100');
    await page.screenshot({ path: testInfo.outputPath('brand.png'), animations: 'disabled' });
  });
}

test('sidebar uses the horizontal logo without changing navigation', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('access_token', 'brand-test'));
  await page.route('http://localhost:3001/auth/me', route => route.fulfill({ json: {
    user: { id: 1, nombre: 'Prueba' }, permissions: [], capabilities: [], current_scope: null, available_scopes: [],
  } }));
  await page.goto('/');
  const logo = page.locator('#erp-sidebar').getByRole('img', { name: 'Sterinova', exact: true });
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  await expect(page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Inicio' })).toBeVisible();
});
