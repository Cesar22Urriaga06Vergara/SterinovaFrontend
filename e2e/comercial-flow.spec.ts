import { expect, test } from "@playwright/test";

// Identity is now loaded from the backend instead of the stored user fixture.
test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:3001/auth/me", route => route.fulfill({ json: {
    user: { id: 1, nombre: "Ana", rol: "Admin" },
    permissions: ["cotizaciones.ver", "cotizaciones.crear", "cotizaciones.previsualizar", "cotizaciones.descargar", "cotizaciones.editar", "cotizaciones.emitir"],
    current_scope: { id: 2, name: "Comercial", kind: "DEPARTMENT" },
    available_scopes: [{ id: 2, name: "Comercial", kind: "DEPARTMENT" }], capabilities: [],
  } }));
});

test("inicia sesión y guarda una cotización con los siete tipos disponibles", async ({
  page,
}) => {
  await page.route("http://localhost:3001/auth/login", (route) =>
    route.fulfill({
      json: {
        access_token: "e2e-test-token",
        user: {
          id: 1,
          nombre: "Ana",
          apellido: "Prueba",
          email: "ana@example.com",
          rol: "Admin",
        },
      },
    }),
  );
  let releaseCustomers!: () => void;
  const customersGate = new Promise<void>((resolve) => {
    releaseCustomers = resolve;
  });
  let markCustomersRequested!: () => void;
  const customersRequested = new Promise<void>((resolve) => {
    markCustomersRequested = resolve;
  });
  await page.route("http://localhost:3001/clientes", async (route) => {
    markCustomersRequested();
    await customersGate;
    await route.fulfill({
      json: [
        {
          id: 12,
          razon_social: "Cliente E2E",
          nit: "900123456",
          contacto: "Ana Prueba",
          telefono: "3001234567",
          email: "ana@example.com",
          direccion: "Calle 1",
        },
      ],
    });
  });
  await page.route("http://localhost:3001/cotizaciones*", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (request.method() === "POST" && pathname === "/cotizaciones") {
      await route.fulfill({
        status: 201,
        json: { id: 42, consecutivo: "COT-CEMFA-0001" },
      });
      return;
    }

    if (request.method() === "GET" && pathname === "/cotizaciones") {
      await route.fulfill({ json: [] });
      return;
    }

    await route.continue();
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("ana@example.com");
  await page.getByLabel("Contraseña").fill("e2e-password");
  await page.getByRole("button", { name: /Ingresar/ }).click();

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: /Bienvenido, Ana/ }),
  ).toBeVisible();

  await page.goto("/comercial/cotizaciones/nueva");
  await customersRequested;
  await expect(page.getByRole("status")).toContainText(
    "Cargando formulario de cotización...",
  );
  releaseCustomers();
  await expect(
    page.getByRole("heading", { name: "Nueva Cotización" }),
  ).toBeVisible();

  const serviceType = page.getByLabel("Tipo de cotización");
  await expect(serviceType.locator("option")).toHaveCount(7);
  await expect(serviceType.locator("option")).toHaveText([
    "Industrial EtO · COT-IND-",
    "Institucional EtO · COT-CME-",
    "Institucional Vapor · COT-CME-",
    "Insumos · COT-CMI-",
    "Lavandería · COT-LAV-",
    "Farmacéutico · COT-CEMFA-",
    "Fabricante · COT-CMED-",
  ]);
  await serviceType.selectOption("FARMACEUTICO");
  await page.getByLabel("Seleccionar cliente").selectOption("12");
  await page
    .getByPlaceholder("Servicio de esterilización EtO")
    .fill("Prueba de esterilización");
  await page.getByRole("button", { name: "Guardar Cotización" }).click();

  await expect(page).toHaveURL("/comercial/cotizaciones");
  await expect(
    page.getByRole("status").filter({
      hasText: "Cotización guardada correctamente.",
    }),
  ).toBeVisible();
});

test("muestra la carga y descarga el PDF oficial de una cotización", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "e2e-test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        nombre: "Ana",
        email: "ana@example.com",
        rol: "Admin",
      }),
    );
  });
  await page.route("http://localhost:3001/cotizaciones", (route) =>
    route.fulfill({
      json: [
        {
          id: 42,
          consecutivo: "COT-IND-0001",
          fecha: "2026-11-06T12:00:00.000Z",
          tipo_servicio: "INDUSTRIAL_ETO",
          estado: "EMITIDA",
          fecha_emision: "2026-11-06T12:00:00.000Z",
          pdf_url: "/cotizaciones/42/descargar",
          subtotal: 1000,
          iva: 190,
          total: 1190,
          cliente_id: 12,
          cliente: {
            id: 12,
            razon_social: "Cliente E2E",
            nit: "900123456",
            contacto: "Ana Prueba",
            telefono: "3001234567",
            email: "ana@example.com",
            direccion: "Calle 1",
          },
        },
      ],
    }),
  );

  let releaseResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });
  let markRequestStarted!: () => void;
  const requestStarted = new Promise<void>((resolve) => {
    markRequestStarted = resolve;
  });
  await page.route(
    "http://localhost:3001/cotizaciones/42/descargar",
    async (route) => {
    markRequestStarted();
    await responseGate;
    await route.fulfill({
      contentType: "application/pdf",
      body: "%PDF-1.4 E2E",
    });
    },
  );

  await page.goto("/comercial/cotizaciones");
  const downloadButton = page.getByRole("button", {
    name: "Descargar PDF Oficial",
  });
  await expect(downloadButton).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await downloadButton.click();
  await requestStarted;
  const downloadingButton = page.getByRole("button", {
    name: "Descargando...",
  });
  await expect(downloadingButton).toBeDisabled();
  await expect(downloadingButton).toContainText("Descargando...");

  releaseResponse();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("COT-IND-0001.pdf");
});
