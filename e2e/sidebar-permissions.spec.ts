import { expect, test } from '@playwright/test';

const scenarios = [
  { name: 'comercial', permissions: ['clientes.ver', 'productos.gestionar', 'cotizaciones.ver'], groups: ['Comercial'], links: ['Inicio', 'Clientes', 'Catálogo', 'Cotizaciones'] },
  { name: 'planta', permissions: ['planta.ordenes.ver'], groups: ['Operación'], links: ['Inicio', 'Planta'] },
  { name: 'varias áreas', permissions: ['clientes.ver', 'planta.ordenes.ver'], groups: ['Comercial', 'Operación'], links: ['Inicio', 'Clientes', 'Planta'] },
  { name: 'administración amplia', permissions: ['clientes.ver', 'productos.gestionar', 'cotizaciones.ver', 'logistica.ordenes.ver', 'planta.ordenes.ver', 'calidad.ciclos.ver', 'solicitudes_anulacion.ver', 'usuarios.ver', 'formatos.ver', 'sellos.ver'], groups: ['Comercial', 'Operación', 'Gestión', 'Documentos'], links: ['Inicio', 'Clientes', 'Catálogo', 'Cotizaciones', 'Logística', 'Planta', 'Calidad', 'Solicitudes de anulación', 'Usuarios', 'Plantillas', 'Sellos'] },
];

for (const scenario of scenarios) {
  test(`sidebar follows effective permissions: ${scenario.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => localStorage.setItem('access_token', 'sidebar-test'));
    await page.route('http://localhost:3001/**', route => route.fulfill({ json:
      new URL(route.request().url()).pathname === '/auth/me'
        ? { user: { id: 1, nombre: 'Prueba', profiles: [{ id: 1, code: 'admin', name: 'Administrador' }] }, permissions: scenario.permissions, capabilities: [], current_scope: null, available_scopes: [] }
        : [],
    }));
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav.getByRole('heading')).toHaveText(scenario.groups);
    await expect(nav.getByRole('link')).toHaveText(scenario.links);
    await expect(nav.getByRole('link', { name: 'Inicio', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Panel Comercial' })).toHaveCount(0);
    if (scenario.name === 'administración amplia') {
      await page.screenshot({ path: testInfo.outputPath('sidebar.png'), animations: 'disabled' });
    }
    if (scenario.name === 'varias áreas') {
      await page.setViewportSize({ width: 390, height: 844 });
      const toggle = page.getByRole('button', { name: 'Menú', exact: true });
      await toggle.click();
      await expect(nav).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await nav.getByRole('link', { name: 'Planta', exact: true }).click();
      await expect(page).toHaveURL('/planta');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#erp-sidebar a[aria-current="page"]')).toHaveText('Planta');
    }
  });
}
