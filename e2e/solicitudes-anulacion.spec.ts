import { expect, test, type Page } from "@playwright/test";

const API = "http://localhost:3001";
const scope = { id: 2, name: "Comercial", kind: "DEPARTMENT" };
async function session(page: Page, permissions: string[]) {
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "ui-test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 7, nombre: "Ana", rol: "Comercial" }),
    );
  });
  await page.route(`${API}/auth/me`, (route) =>
    route.fulfill({
      json: {
        user: { id: 7, nombre: "Ana", rol: "Comercial" },
        permissions,
        current_scope: scope,
        available_scopes: [scope],
        capabilities: [],
      },
    }),
  );
}

test("asesor solicita anulación de emitida; borrador no ofrece la acción", async ({
  page,
}) => {
  await session(page, ["cotizaciones.ver", "solicitudes_anulacion.crear"]);
  await page.route(`${API}/cotizaciones`, (route) =>
    route.fulfill({
      json: ["EMITIDA", "BORRADOR"].map((estado, index) => ({
        id: index + 1,
        consecutivo: `COT-${index + 1}`,
        cliente_id: 4,
        cliente: { razon_social: "Clínica Central" },
        fecha: "2026-11-10T15:00:00Z",
        estado,
        tipo_servicio: "INDUSTRIAL_ETO",
        total: 100,
      })),
    }),
  );
  let sent = false;
  await page.route(
    `${API}/cotizaciones/1/solicitud-anulacion`,
    async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        motivo: "Error en la cotización",
      });
      expect(route.request().headers()["x-scope-id"]).toBe("2");
      sent = true;
      await route.fulfill({
        status: 201,
        json: { id: 10, estado: "PENDIENTE" },
      });
    },
  );
  await page.goto("/comercial/cotizaciones");
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "COT-2" })
      .getByRole("button", { name: "Solicitar Anulación" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Solicitar Anulación", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Solicitar Anulación",
    exact: true,
  });
  await dialog.getByLabel("Motivo").fill("Error en la cotización");
  await dialog.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("enviada correctamente");
  expect(sent).toBe(true);
});

test("un asesor sin permiso es redirigido y no consulta pendientes", async ({
  page,
}) => {
  await session(page, ["cotizaciones.ver"]);
  await page.route(`${API}/cotizaciones`, (route) =>
    route.fulfill({ json: [] }),
  );
  let fetched = false;
  await page.route(`${API}/solicitudes-anulacion/pendientes`, (route) => {
    fetched = true;
    return route.fulfill({ json: [] });
  });
  await page.goto("/solicitudes");
  await expect(page).toHaveURL(/\/comercial$/);
  await expect(
    page.getByRole("link", { name: "Solicitudes Pendientes" }),
  ).toHaveCount(0);
  expect(fetched).toBe(false);
});

for (const decision of ["APROBADA", "RECHAZADA"] as const) {
  test(`jefe resuelve ${decision} y actualiza pendientes`, async ({ page }) => {
    await session(page, [
      "solicitudes_anulacion.ver",
      "solicitudes_anulacion.aprobar",
    ]);
    let pending = true;
    let resolved = false;
    await page.route(`${API}/solicitudes-anulacion/pendientes`, (route) =>
      route.fulfill({
        json: pending
          ? [
              {
                id: 10,
                cotizacion_id: 42,
                creador_id: 8,
                estado: "PENDIENTE",
                motivo: "Error comercial",
                created_at: "2026-11-10T15:00:00Z",
                creador: { nombre: "Luis", apellido: "Pérez" },
                cotizacion: {
                  id: 42,
                  consecutivo: "COT-42",
                  cliente_id: 4,
                  cliente: { razon_social: "Clínica Central" },
                },
              },
            ]
          : [],
      }),
    );
    await page.route(
      `${API}/solicitudes-anulacion/10/resolver`,
      async (route) => {
        expect(route.request().method()).toBe("PATCH");
        expect(route.request().headers()["x-scope-id"]).toBe("2");
        expect(route.request().postDataJSON()).toEqual({
          estado: decision,
          observacion: decision === "RECHAZADA" ? "No procede" : "",
        });
        pending = false;
        resolved = true;
        await route.fulfill({ json: { id: 10, estado: decision } });
      },
    );
    await page.goto("/solicitudes");
    await expect(
      page.getByRole("link", { name: "Solicitudes Pendientes" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Luis Pérez" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Clínica Central" }),
    ).toBeVisible();
    if (decision === "APROBADA")
      await page.screenshot({
        path: test.info().outputPath("solicitudes-pendientes.png"),
        fullPage: true,
      });
    await page
      .getByRole("button", {
        name: decision === "APROBADA" ? "Aprobar COT-42" : "Rechazar COT-42",
      })
      .click();
    const dialog = page.getByRole("dialog");
    if (decision === "RECHAZADA") {
      await dialog.getByLabel("Observación").fill("   ");
      await dialog
        .getByRole("button", { name: "Rechazar solicitud", exact: true })
        .click();
      await expect(dialog.getByRole("alert")).toContainText(
        "Escribe una observación",
      );
      expect(resolved).toBe(false);
      await dialog.getByLabel("Observación").fill("No procede");
    }
    await dialog
      .getByRole("button", {
        name:
          decision === "APROBADA" ? "Aprobar anulación" : "Rechazar solicitud",
        exact: true,
      })
      .click();
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "No hay solicitudes pendientes" }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText(
      decision === "APROBADA" ? "aprobada" : "rechazada",
    );
    expect(resolved).toBe(true);
  });
}

test("error de resolución mantiene el motivo y permite reintentar", async ({
  page,
}) => {
  await session(page, [
    "solicitudes_anulacion.ver",
    "solicitudes_anulacion.aprobar",
  ]);
  await page.route(`${API}/solicitudes-anulacion/pendientes`, (route) =>
    route.fulfill({
      json: [
        {
          id: 10,
          cotizacion_id: 42,
          creador_id: 8,
          estado: "PENDIENTE",
          motivo: "Error comercial",
          created_at: "2026-11-10T15:00:00Z",
          cotizacion: { id: 42, consecutivo: "COT-42", cliente_id: 4 },
        },
      ],
    }),
  );
  await page.route(`${API}/solicitudes-anulacion/10/resolver`, (route) =>
    route.fulfill({
      status: 403,
      json: { message: "La cotización pertenece a otro ámbito" },
    }),
  );
  await page.goto("/solicitudes");
  await page.getByRole("button", { name: "Rechazar COT-42" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Observación").fill("No procede");
  await dialog
    .getByRole("button", { name: "Rechazar solicitud", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("otro ámbito");
  await expect(dialog.getByLabel("Observación")).toHaveValue("No procede");
  await expect(
    dialog.getByRole("button", { name: "Rechazar solicitud", exact: true }),
  ).toBeEnabled();
});
