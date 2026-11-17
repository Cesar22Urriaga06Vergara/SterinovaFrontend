import { expect, test } from '@playwright/test';

for (const permission of ['', 'logistica.ordenes.crear', 'logistica.recepciones.registrar', 'logistica.ordenes.cambiar_estado']) {
  test(`logistics actions follow effective permissions: ${permission || 'read only'}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('access_token', 'test-token'));
    let approvedRequests = 0;
    await page.route('http://localhost:3001/**', async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname === '/auth/me') {
        await route.fulfill({ json: {
          user: { id: 7, nombre: 'Ana' },
          permissions: ['logistica.ordenes.ver', ...(permission ? [permission] : [])],
          capabilities: [], current_scope: null, available_scopes: [],
        } });
      } else if (pathname === '/logistica/ordenes') {
        await route.fulfill({ json: [{ id: 1, version: 1, consecutivo: 'OS-001',
          cotizacion_id: 1, fecha_programada: '2026-11-13', estado: 'PENDIENTE', eventos: [] }] });
      } else {
        if (pathname === '/logistica/cotizaciones-aprobadas') approvedRequests++;
        await route.fulfill({ status: 403, json: { message: 'Permiso requerido' } });
      }
    });
    await page.goto('/logistica');
    await expect(page.getByText('OS-001', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Generar Orden de Recolección' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Editar material recibido' })).toHaveCount(permission === 'logistica.recepciones.registrar' ? 1 : 0);
    await expect(page.getByRole('button', { name: 'Marcar En Ruta' })).toHaveCount(permission === 'logistica.ordenes.cambiar_estado' ? 1 : 0);
    expect(approvedRequests).toBe(0);
  });
}
