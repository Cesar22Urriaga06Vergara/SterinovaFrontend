import { expect, test } from '@playwright/test';

for (const allowed of [false, true]) {
  test(`protected views wait for session validation (allowed=${allowed})`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'test-token');
    });
    let releaseSession!: () => void;
    const sessionGate = new Promise<void>((resolve) => { releaseSession = resolve; });
    let sessionRequested!: () => void;
    const requested = new Promise<void>((resolve) => { sessionRequested = resolve; });
    const operationalRequests: string[] = [];
    await page.route('http://localhost:3001/**', async (route) => {
      if (new URL(route.request().url()).pathname === '/auth/me') {
        sessionRequested();
        await sessionGate;
        await route.fulfill({ json: {
          user: { id: 7, nombre: 'Ana' },
          permissions: allowed ? ['logistica.ordenes.ver'] : [],
          capabilities: [], current_scope: null, available_scopes: [],
        } });
      } else {
        operationalRequests.push(route.request().url());
        await route.fulfill({ json: [] });
      }
    });
    await page.goto('/logistica');
    await requested;
    await expect(page.getByRole('status')).toContainText('Validando sesión');
    // A browser turn lets any mounted child effects run while /auth/me is pending.
    await page.evaluate(() => new Promise(requestAnimationFrame));
    const requestsBeforeValidation = [...operationalRequests];
    releaseSession();
    expect(requestsBeforeValidation).toEqual([]);
    if (allowed) {
      await expect(page.getByRole('heading', { name: 'Logística', exact: true })).toBeVisible();
      await expect.poll(() => operationalRequests.length).toBeGreaterThan(0);
    } else {
      await expect(page).toHaveURL('/');
      expect(operationalRequests).toEqual([]);
    }
  });
}

test('session validation can retry without mounting protected views on failure', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('access_token', 'test-token'));
  let fail = true;
  let operationalRequests = 0;
  await page.route('http://localhost:3001/**', async (route) => {
    if (new URL(route.request().url()).pathname === '/auth/me') {
      await route.fulfill(fail ? { status: 500, json: { message: 'Fallo simulado' } } : { json: {
        user: { id: 7, nombre: 'Ana' }, permissions: ['logistica.ordenes.ver'],
        capabilities: [], current_scope: null, available_scopes: [],
      } });
    } else {
      operationalRequests++;
      await route.fulfill({ json: [] });
    }
  });
  await page.goto('/logistica');
  await expect(page.getByText('No se pudo validar la sesión.', { exact: false })).toBeVisible();
  expect(operationalRequests).toBe(0);
  fail = false;
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Logística', exact: true })).toBeVisible();
  await expect.poll(() => operationalRequests).toBeGreaterThan(0);
});

test('expired sessions clear local credentials and return to login', async ({ page }) => {
  await page.addInitScript(() => {
    if (location.pathname === '/logistica') {
      localStorage.setItem('access_token', 'expired-token');
      localStorage.setItem('user', JSON.stringify({ nombre: 'Anterior' }));
    }
  });
  await page.route('http://localhost:3001/auth/me', route => route.fulfill({ status: 401, json: {} }));
  await page.goto('/logistica');
  await expect(page).toHaveURL('/login');
  expect(await page.evaluate(() => [localStorage.getItem('access_token'), localStorage.getItem('user')])).toEqual([null, null]);
  await expect(page.getByRole('button', { name: 'Ingresar', exact: true })).toBeVisible();
});
