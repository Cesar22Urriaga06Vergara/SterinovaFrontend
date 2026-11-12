import { expect, test } from '@playwright/test';

for (const canEmit of [false, true]) {
  for (const isApproved of [false, true]) {
    test(
      `session capabilities control emission (${canEmit}) for approved quote (${isApproved})`,
      async ({ page }) => {
        await page.addInitScript(() => {
          localStorage.setItem('access_token', 'test-token');
          localStorage.setItem(
            'user',
            JSON.stringify({
              id: 7,
              nombre: 'Forged',
              rol: 'Admin',
              permissions: ['cotizaciones.emitir'],
            }),
          );
        });
        await page.route('http://localhost:3001/auth/me', (route) =>
          route.fulfill({
            json: {
              user: { id: 7, nombre: 'JUAN', rol: 'Comercial' },
              permissions: [
                'cotizaciones.ver',
                'cotizaciones.crear',
                'cotizaciones.previsualizar',
                ...(canEmit ? ['cotizaciones.emitir'] : []),
              ],
              current_scope: { id: 2, name: 'Comercial', kind: 'DEPARTMENT' },
              available_scopes: [
                { id: 2, name: 'Comercial', kind: 'DEPARTMENT' },
              ],
              capabilities: [],
            },
          }),
        );
        await page.route('http://localhost:3001/cotizaciones', (route) =>
          route.fulfill({
            json: [
              {
                id: 42,
                consecutivo: 'COT-IND-0042',
                cliente_id: 12,
                fecha: '2026-11-09',
                estado: isApproved ? 'APROBADA' : 'BORRADOR',
                creador_id: 8,
                aprobador_interno_id: isApproved ? 7 : null,
                aprobado_internamente_at: isApproved
                  ? '2026-11-09T12:00:00.000Z'
                  : null,
                tipo_servicio: 'INDUSTRIAL_ETO',
                total: 1190,
              },
            ],
          }),
        );
        await page.goto('/comercial/cotizaciones');
        await expect(
          page.getByRole('link', { name: 'Nueva Cotización' }),
        ).toBeVisible();
        await expect(
          page.getByRole('button', { name: 'Ver Borrador' }),
        ).toBeVisible();
        await expect(
          page.getByRole('button', { name: 'Emitir Cotización' }),
        ).toHaveCount(canEmit && isApproved ? 1 : 0);
        await expect(
          page.getByRole('button', { name: 'Aprobar', exact: true }),
        ).toHaveCount(0);
      },
    );
  }
}
