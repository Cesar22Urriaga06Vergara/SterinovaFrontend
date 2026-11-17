import { expect, test } from '@playwright/test';

for (const mobile of [false, true]) {
  test(`corporate login keeps access usable (${mobile ? 'mobile' : 'desktop'})`, async ({ page }, testInfo) => {
    await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 });
    let submissions = 0;
    await page.route('http://localhost:3001/auth/login', route => {
      submissions++;
      return route.fulfill({ status: 401, json: { message: 'Credenciales inválidas' } });
    });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Inicia sesión', exact: true })).toBeVisible();
    const photo = page.getByRole('img', { name: 'Equipo de Sterinova y su flota de vehículos' });
    if (mobile) {
      await expect(photo).toBeHidden();
    } else {
      await expect(photo).toBeVisible();
      await expect.poll(() => photo.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      expect(await photo.evaluate(element => getComputedStyle(element).objectFit)).toBe('contain');
    }
    await page.screenshot({ path: testInfo.outputPath('login.png'), animations: 'disabled', fullPage: true });
    const email = page.getByLabel('Correo electrónico', { exact: true });
    await expect(email).toHaveValue('');
    await expect(email).not.toHaveAttribute('placeholder', /.+/);
    await email.fill('persona@example.com');
    const password = page.getByLabel('Contraseña', { exact: true });
    await expect(password).toHaveValue('');
    await expect(password).not.toHaveAttribute('placeholder', /.+/);
    await password.fill('clave-de-prueba');
    await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).focus();
    await page.keyboard.press('Space');
    await expect(password).toHaveAttribute('type', 'text');
    await expect(password).toHaveValue('clave-de-prueba');
    expect(submissions).toBe(0);
    await page.getByRole('button', { name: 'Ocultar contraseña', exact: true }).click();
    await expect(password).toHaveAttribute('type', 'password');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Credenciales inválidas' })).toBeVisible();
    await expect(password).toHaveValue('clave-de-prueba');
    expect(submissions).toBe(1);
  });
}
