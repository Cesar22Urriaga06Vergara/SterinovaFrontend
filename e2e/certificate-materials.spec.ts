import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { test, expect } from '@playwright/test';

const secret = process.env.PDF_RENDER_SECRET!;

function renderToken(snapshot: Record<string, unknown>) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', createHash('sha256').update(secret).digest(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify({ audience: 'sterinova-pdf-render', documentType: 'certificado', expiresAt: Date.now() + 120_000, snapshot })),
    cipher.final(),
  ]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}

for (const method of ['ETO', 'VAPOR'] as const) {
  test(`prints all five ${method} materials through the internal PDF route`, async ({ page }, testInfo) => {
    const materiales = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1, descripcion: `Producto ${i + 1}`, referencia: `REF-${i + 1}`, lote: `LOTE-${i + 1}`,
      cantidad: i + 10, empaque: `EMPAQUE-${i + 1}`, muestras_retencion: i, muestras_cliente: i + 2, muestras_laboratorio: null,
    }));
    await page.setExtraHTTPHeaders({ 'x-pdf-render-token': renderToken({
      schema_version: 2, documento: { tipo: 'CERTIFICADO', consecutivo: 'MULTI-001', fecha_emision: '2026-11-09' },
      cliente: { razon_social: 'Cliente de prueba' }, ciclo_esterilizacion: { metodo: method, equipo: 'PRUEBA' }, materiales,
    }) });
    const response = await page.goto('/internal/pdf/certificado');
    expect(response?.status()).toBe(200);
    const table = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'DESCRIPCIÓN', exact: true }) });
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(5);
    for (const [i, material] of materiales.entries()) {
      await expect(rows.nth(i).getByRole('cell')).toHaveText([
        material.descripcion, material.referencia, material.lote, String(material.cantidad), material.empaque,
        String(material.muestras_retencion), String(material.muestras_cliente), 'N/A',
      ]);
    }
    await expect(page.locator('[data-stamp-box]')).toBeEmpty();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, image => image.decode()));
    });
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ path: testInfo.outputPath(`certificado-${method.toLowerCase()}-5-materiales.pdf`), format: 'Letter', preferCSSPageSize: true, printBackground: true });
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    await testInfo.attach('certificate-pdf', { body: pdf, contentType: 'application/pdf' });
  });
}
