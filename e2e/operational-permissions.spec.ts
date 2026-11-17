import { expect, test } from '@playwright/test';

for (const scenario of [
  { path: '/planta', permission: 'planta.ordenes.ver', endpoint: '/planta/ordenes', heading: 'Órdenes en Planta' },
  { path: '/planta', permission: 'planta.ciclos.ver', endpoint: '/planta/ciclos', heading: 'Historial de Ciclos' },
  { path: '/calidad', permission: 'calidad.ciclos.ver', endpoint: '/calidad/pendientes', heading: 'Ciclos pendientes' },
  { path: '/calidad', permission: 'certificados.ver', endpoint: '/certificados', heading: 'Certificados emitidos' },
]) {
  test(`partial capabilities keep ${scenario.permission} usable`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('access_token', 'test-token'));
    const deniedRequests: string[] = [];
    await page.route('http://localhost:3001/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === '/auth/me') {
        await route.fulfill({ json: { user: { id: 7, nombre: 'Ana' }, permissions: [scenario.permission],
          capabilities: [], current_scope: null, available_scopes: [] } });
      } else if (path === scenario.endpoint) {
        await route.fulfill({ json: [] });
      } else {
        deniedRequests.push(path);
        await route.fulfill({ status: 403, json: { message: 'Permiso requerido' } });
      }
    });
    await page.goto(scenario.path);
    await expect(page.getByRole('heading', { name: scenario.heading, exact: true })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: /Cargando/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Reintentar/ })).toHaveCount(0);
    expect(deniedRequests).toEqual([]);
  });
}

for (const permission of ['', 'calidad.aprobar', 'calidad.rechazar']) {
  test(`quality review actions require their own permission: ${permission || 'read only'}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('access_token', 'test-token'));
    await page.route('http://localhost:3001/auth/me', (route) => route.fulfill({ json: {
      user: { id: 7, nombre: 'Ana' }, permissions: ['calidad.ciclos.ver', ...(permission ? [permission] : [])],
      capabilities: [], current_scope: null, available_scopes: [],
    } }));
    await page.route('http://localhost:3001/calidad/ciclos/21', (route) => route.fulfill({ json: {
      id: 21, orden_id: 7, equipo: 'ETO-1', metodo: 'ETO', estado: 'PENDIENTE_CALIDAD',
      protocolo_version: { id: 1, version: 1, metodo: 'ETO', especificaciones_json: { filas: [] } },
    } }));
    await page.goto('/calidad/revisar/21');
    await expect(page.getByRole('group', { name: 'Evaluación técnica' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aprobar y Emitir Certificado' })).toHaveCount(permission === 'calidad.aprobar' ? 1 : 0);
    await expect(page.getByRole('button', { name: 'Rechazar', exact: true })).toHaveCount(permission === 'calidad.rechazar' ? 1 : 0);
  });
}
