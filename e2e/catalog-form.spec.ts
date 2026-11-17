import { expect, test } from '@playwright/test';

for (const rejected of [false, true]) {
  test(`catalog form submits without choosing an area (rejected=${rejected})`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('access_token', 'catalog-test'));
    await page.route('http://localhost:3001/auth/me', route => route.fulfill({ json: {
      user: { id: 1, nombre: 'Administrador' }, permissions: ['productos.gestionar'], capabilities: [],
      current_scope: rejected ? null : { id: 1, name: 'Global', kind: 'GLOBAL' },
      available_scopes: [{ id: 2, name: 'Comercial', kind: 'DEPARTMENT' }],
    } }));
    let payload: Record<string, unknown> | undefined;
    await page.route('http://localhost:3001/productos', async route => {
      expect(route.request().headers()['x-scope-id']).toBeUndefined();
      if (route.request().method() === 'GET') return route.fulfill({ json: [] });
      payload = route.request().postDataJSON();
      return route.fulfill(rejected
        ? { status: 403, json: { message: 'Sin autorización para crear referencias.' } }
        : { status: 201, json: { ...payload, id: 15, activo: true } });
    });
    await page.goto('/comercial/productos');
    const trigger = page.getByRole('button', { name: 'Nueva referencia', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Nueva referencia' });
    await dialog.getByLabel('Descripción', { exact: true }).fill('Empaque de prueba');
    await dialog.getByLabel('Unidad', { exact: true }).fill('unidad');
    await dialog.getByRole('button', { name: 'Agregar al catálogo' }).click();
    if (rejected) {
      await expect(dialog.getByRole('alert')).toContainText('Sin autorización');
      await expect(dialog.getByLabel('Descripción', { exact: true })).toHaveValue('Empaque de prueba');
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    } else {
      await expect(dialog).toHaveCount(0);
      await expect(page.getByRole('cell', { name: 'Empaque de prueba', exact: true })).toBeVisible();
    }
    expect(payload).toMatchObject({ descripcion: 'Empaque de prueba', unidad: 'unidad' });
    expect(payload).not.toHaveProperty('scope_id');
  });
}
