import { expect, test } from '@playwright/test';

test('uses database IVA in preview, sends only the expected version and refreshes a changed rate', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('access_token', 'test-token'));
  await page.route('http://localhost:3001/auth/me', route => route.fulfill({ json: {
    user: { id: 27, nombre: 'Otro Comercial', rol: 'Comercial' },
    permissions: ['cotizaciones.crear', 'cotizaciones.ver'], capabilities: [],
    current_scope: { id: 2, name: 'Comercial', kind: 'DEPARTMENT' },
    available_scopes: [{ id: 2, name: 'Comercial', kind: 'DEPARTMENT' }],
  } }));
  await page.route('http://localhost:3001/clientes', route => route.fulfill({ json: [{ id: 12, razon_social: 'Cliente IVA' }] }));
  let version = 2;
  await page.route('http://localhost:3001/cotizaciones/iva-vigente', route => route.fulfill({ json: {
    id: version, version, tasa: version === 2 ? '0.050000' : '0.080000', vigente_desde: '2026-11-09T00:00:00Z',
  } }));
  await page.route('http://localhost:3001/cotizaciones', async route => {
    if (route.request().method() !== 'POST') return route.fulfill({ json: [] });
    const payload = route.request().postDataJSON();
    expect(payload).not.toHaveProperty('iva');
    expect(payload).not.toHaveProperty('iva_tasa');
    expect(payload).not.toHaveProperty('iva_version_id');
    expect(payload).not.toHaveProperty('total');
    if (version === 2) {
      expect(payload.iva_version_esperada_id).toBe(2);
      version = 3;
      return route.fulfill({ status: 409, json: { message: 'La tasa de IVA cambió. Revise la previsualización antes de guardar.' } });
    }
    expect(payload.iva_version_esperada_id).toBe(3);
    return route.fulfill({ status: 201, json: { id: 42 } });
  });
  await page.goto('/comercial/cotizaciones/nueva');
  await page.getByLabel('Seleccionar cliente').selectOption('12');
  await page.getByPlaceholder('Servicio de esterilización EtO').fill('Servicio fiscal');
  const row = page.locator('tbody tr').first();
  await row.locator('input[type=number]').nth(1).fill('100');
  await expect(page.getByText('IVA (5%)', { exact: true })).toBeVisible();
  await expect(page.locator('dl').getByText('$ 105', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar Cotización' }).click();
  await expect(page.getByText('IVA (8%)', { exact: true })).toBeVisible();
  await expect(page.locator('dl').getByText('$ 108', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar Cotización' }).click();
  await expect(page).toHaveURL('/comercial/cotizaciones');
});
