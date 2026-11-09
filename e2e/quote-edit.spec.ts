import { expect, test, type Page } from '@playwright/test';
async function setup(page: Page, overrides = {}, permissions = ['cotizaciones.ver', 'cotizaciones.editar']) {
  await page.addInitScript(() => localStorage.setItem('access_token', 'test-token'));
  await page.route('http://localhost:3001/auth/me', route => route.fulfill({json: {
    user: {id: 27, nombre: 'Comercial', rol: 'Comercial'}, permissions, capabilities: [],
    current_scope: {id: 2, name: 'Ventas', kind: 'DEPARTMENT'}, available_scopes: [{id: 2, name: 'Ventas', kind: 'DEPARTMENT'}],
  }}));
  const quote = {id: 42, consecutivo: 'COT-LAV-042', fecha: '2026-11-09', estado: 'BORRADOR', fecha_emision: null,
    version: 3, cliente_id: 12, tipo_servicio: 'LAVANDERIA', condiciones_comerciales: 'Contado',
    iva_tasa: '0.050000', iva_version_id: 2, subtotal: 100, iva: 5, total: 105,
    items: [{id: 90, descripcion: 'Servicio existente', cantidad: 1, valor_unitario: 100, valor_total: 100}], ...overrides};
  await page.route('http://localhost:3001/clientes', route => route.fulfill({json: [{id: 12, razon_social: 'Cliente existente'}, {id: 13, razon_social: 'Cliente nuevo'}]}));
  await page.route('http://localhost:3001/cotizaciones', route => route.fulfill({json: [quote]}));
  await page.route('http://localhost:3001/cotizaciones/42', route => route.fulfill({json: quote}));
}
test('loads and edits the full draft using its stored tax and version', async ({page}) => {
  await setup(page);
  let saved = false;
  await page.route('http://localhost:3001/cotizaciones/42', route => {
    if (route.request().method() !== 'PUT') return route.fallback();
    expect(route.request().postDataJSON()).toEqual({version: 3, cliente_id: 13, tipo_servicio: 'INSUMOS', condiciones_comerciales: 'Crédito',
      items: [{descripcion: 'Servicio modificado', cantidad: 2, valor_unitario: 100}]});
    saved = true;
    return route.fulfill({json: {id: 42, version: 4}});
  });
  await page.goto('/comercial/cotizaciones');
  await page.getByRole('link', {name: 'Editar', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Editar Cotización'})).toBeVisible();
  await expect(page.getByText('IVA (5%)', {exact: true})).toBeVisible();
  await page.getByLabel('Seleccionar cliente').selectOption('13');
  await page.getByLabel('Tipo de cotización').selectOption('INSUMOS');
  await page.getByLabel('Condiciones comerciales (opcional)').fill('Crédito');
  await page.getByPlaceholder('Servicio de esterilización EtO').fill('Servicio modificado');
  await page.locator('tbody input[type=number]').first().fill('2');
  await page.getByRole('button', {name: 'Añadir Ítem'}).click();
  await expect(page.locator('form tbody tr')).toHaveCount(2);
  await page.getByRole('button', {name: 'Eliminar ítem'}).nth(1).click();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByLabel('Condiciones comerciales (opcional)')).toHaveValue('Crédito');
  await page.getByRole('button', {name: 'Guardar Cotización'}).click();
  await expect(page).toHaveURL('/comercial/cotizaciones');
  expect(saved).toBe(true);
});
test('blocks forced editing of issued quotes and users without edit permission', async ({page}) => {
  await setup(page, {fecha_emision: '2026-11-09T10:00:00Z'});
  await page.goto('/comercial/cotizaciones/42/editar');
  await expect(page).toHaveURL('/comercial/cotizaciones');
  await expect(page.getByRole('link', {name: 'Editar', exact: true})).toHaveCount(0);
  await setup(page, {}, ['cotizaciones.ver']);
  await page.goto('/comercial/cotizaciones/42/editar');
  await expect(page).toHaveURL('/comercial/cotizaciones');
});
test('keeps unsaved values on conflict and requires reloading before another save', async ({page}) => {
  await setup(page);
  let writes = 0;
  await page.route('http://localhost:3001/cotizaciones/42', route => {
    if (route.request().method() !== 'PUT') return route.fallback();
    writes++;
    return route.fulfill({status: 409, json: {message: 'La cotización cambió. Recargue el borrador antes de guardar.'}});
  });
  await page.goto('/comercial/cotizaciones/42/editar');
  await page.getByLabel('Condiciones comerciales (opcional)').fill('Mis cambios');
  await page.getByRole('button', {name: 'Guardar Cotización'}).click();
  await expect(page.locator('form').getByRole('alert')).toContainText('La cotización cambió');
  await expect(page.getByLabel('Condiciones comerciales (opcional)')).toHaveValue('Mis cambios');
  await expect(page.getByRole('button', {name: 'Guardar Cotización'})).toBeDisabled();
  expect(writes).toBe(1);
});
