import { expect, test } from '@playwright/test';

test.use({ colorScheme: 'dark' });

for (const path of ['/', '/comercial/clientes', '/comercial/productos', '/comercial/cotizaciones']) {
  test(`clear workspace without technical selectors: ${path}`, async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('access_token', 'appearance-test'));
    await page.route('http://localhost:3001/**', route => {
      if (new URL(route.request().url()).pathname === '/auth/me') return route.fulfill({ json: {
        user: { id: 1, nombre: 'Administrador Sterinova' },
        permissions: ['clientes.ver', 'productos.gestionar', 'cotizaciones.ver', 'logistica.ordenes.ver', 'planta.ordenes.ver', 'calidad.ciclos.ver', 'usuarios.ver', 'formatos.ver'], capabilities: [],
        current_scope: null, available_scopes: [{ id: 2, name: 'Comercial', kind: 'DEPARTMENT' }, { id: 3, name: 'Planta', kind: 'DEPARTMENT' }],
      } });
      return route.fulfill({ json: [] });
    });
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.getByRole('combobox', { name: /ámbito/i })).toHaveCount(0);
    await expect(page.getByText(/Selecciona un ámbito operativo/)).toHaveCount(0);
    expect(await page.locator('main').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(244, 246, 248)');
    await page.screenshot({ path: testInfo.outputPath('desktop.png'), fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#erp-sidebar')).toHaveAttribute('aria-hidden', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true, animations: 'disabled' });
  });
}
