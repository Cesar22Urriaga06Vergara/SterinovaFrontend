import { expect, test } from "@playwright/test";

const API = "http://localhost:3001";

test("el diálogo de orden atrapa el foco, cierra con Escape y lo restaura", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("access_token", "dialogs-a11y-token"),
  );
  await page.route(`${API}/auth/me`, (route) =>
    route.fulfill({
      json: {
        user: { id: 1, nombre: "Prueba", rol: "Admin" },
        permissions: [
          "logistica.ordenes.ver",
          "logistica.ordenes.crear",
          "logistica.cotizaciones_disponibles.ver",
        ],
        capabilities: [],
      },
    }),
  );
  await page.route(`${API}/logistica/ordenes`, (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route(`${API}/logistica/cotizaciones-aprobadas`, (route) =>
    route.fulfill({
      json: [
        {
          id: 1,
          consecutivo: "COT-IND-001",
          tipo_servicio: "INDUSTRIAL_ETO",
          total: 105,
          cliente: { razon_social: "Cliente" },
        },
      ],
    }),
  );

  await page.goto("/logistica");
  const trigger = page.getByRole("button", {
    name: "Generar Orden de Recolección",
  });
  await trigger.click();

  const dialog = page.getByRole("dialog", {
    name: "Generar Orden de Recolección",
  });
  const closeButton = dialog.getByRole("button", { name: "Cerrar diálogo" });
  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  await dialog
    .getByRole("button", { name: "Crear Orden", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
