import { expect, test } from "@playwright/test";

// Identity is now loaded from the backend instead of the stored user fixture.
test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:3001/auth/me", route => route.fulfill({ json: {
    user: { id: 1, nombre: "Coordinador", rol: "Admin" },
    permissions: ["cotizaciones.ver", "cotizaciones.crear", "cotizaciones.previsualizar", "cotizaciones.descargar", "cotizaciones.editar", "cotizaciones.emitir"],
    current_scope: { id: 2, name: "Comercial", kind: "DEPARTMENT" },
    available_scopes: [{ id: 2, name: "Comercial", kind: "DEPARTMENT" }], capabilities: [],
  } }));
});

const pendingCycle = {
  protocolo_version:{id:1,version:1,metodo:'ETO',especificaciones_json:{filas:
    ['temperatura','humedad','presion','tiempo_exposicion','tiempo_aireacion'].map(parametro=>({parametro,unidad:null,opciones:['Especificacion registrada'],aplicable:true}))}},
  fecha_esterilizacion:'2026-11-06',
  id: 21,
  orden_id: 7,
  orden: {
    id: 7,
    consecutivo: "OS-0007",
    cotizacion: {
      cliente: { razon_social: "Cliente E2E", nit: "900123456" },
      items: [],
    },
  },
  equipo: "Autoclave E2E",
  metodo: "ETO",
  operador_id: 3,
  operador: { id: 3, nombre: "Operador E2E" },
  temperatura: 54,
  humedad: 50,
  presion: 1,
  tiempo_exposicion: 30,
  tiempo_aireacion: 120,
  control_biologico: "Negativo",
  control_quimico: "Conforme",
  fecha_proceso: "2026-11-06T12:00:00.000Z",
  estado: "PENDIENTE_CALIDAD",
};

test('No cumple impide emitir y queda incluido al rechazar',async({page})=>{
  await seedSession(page);
  await page.route('http://localhost:3001/calidad/ciclos/21',route=>route.fulfill({json:pendingCycle}));
  await page.route('http://localhost:3001/calidad/pendientes',route=>route.fulfill({json:[]}));
  await page.route('http://localhost:3001/certificados',route=>route.fulfill({json:[]}));
  await page.route('http://localhost:3001/calidad/rechazar',route=>route.fulfill({json:{id:21}}));
  await page.goto('/calidad/revisar/21');
  await page.getByLabel('Especificación de Temperatura',{exact:true}).selectOption('0');
  await page.getByLabel('Evaluación de Temperatura',{exact:true}).selectOption('NO_CUMPLE');
  await expect(page.getByRole('button',{name:'Aprobar y Emitir Certificado'})).toBeDisabled();
  await page.getByRole('button',{name:'Rechazar',exact:true}).click();
  await page.getByLabel('Motivo del rechazo').fill('No cumple con la especificación revisada');
  const sent=page.waitForRequest(r=>r.url().endsWith('/calidad/rechazar')&&r.method()==='POST');
  await page.getByRole('button',{name:'Confirmar rechazo'}).click();
  expect((await sent).postDataJSON()).toMatchObject({evaluaciones:[{parametro:'temperatura',criterio:'NO_CUMPLE',opcion:0}]});
});

async function seedSession(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "e2e-test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 3,
        nombre: "Coordinador",
        email: "calidad@example.com",
        rol: "Admin",
      }),
    );
  });
}

test("presenta error recuperable cuando falla la API de Calidad", async ({
  page,
}) => {
  await seedSession(page);
  let failPendingRequests = true;
  await page.route("http://localhost:3001/calidad/pendientes", (route) => {
    return failPendingRequests
      ? route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Fallo simulado de Calidad" }),
        })
      : route.fulfill({ json: [pendingCycle] });
  });
  await page.route("http://localhost:3001/certificados", (route) =>
    route.fulfill({ json: [] }),
  );

  await page.goto("/calidad");

  const errorState = page
    .getByRole("alert")
    .filter({ hasText: "No se pudo completar la solicitud" });
  await expect(
    errorState.getByRole("heading", {
      name: "No se pudo completar la solicitud",
    }),
  ).toBeVisible();
  await expect(errorState).toContainText(
    "No se pudieron cargar los ciclos y certificados de Calidad.",
  );
  await expect(
    errorState.getByRole("button", { name: "Reintentar" }),
  ).toBeVisible();
  failPendingRequests = false;
  await errorState.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.getByText("OS-0007")).toBeVisible();
  await expect(errorState).toHaveCount(0);
});

test("aprueba un ciclo de Calidad con contraseña y confirma con toast", async ({
  page,
}) => {
  await seedSession(page);
  await page.route("http://localhost:3001/calidad/pendientes", (route) =>
    route.fulfill({ json: [pendingCycle] }),
  );
  await page.route("http://localhost:3001/certificados", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route("http://localhost:3001/calidad/ciclos/21", (route) =>
    route.fulfill({ json: pendingCycle }),
  );
  await page.route("http://localhost:3001/calidad/aprobar", (route) =>
    route.fulfill({
      status: 201,
      json: {
        id: 31,
        consecutivo: "CERT-00031",
        pdf_url: "/certificados/31/descargar",
      },
    }),
  );

  await page.goto("/calidad");
  await page.getByRole("link", { name: /Revisar/ }).click();
  await expect(page).toHaveURL(/\/calidad\/revisar\/21$/);
  await expect(page.getByRole("heading", { name: "Orden OS-0007" })).toBeVisible();
  await expect(page.getByRole('button',{name:'Aprobar y Emitir Certificado'})).toBeDisabled();
  for(const select of await page.locator('select[aria-label^="Especificaci"]').all())await select.selectOption('0');
  for(const select of await page.locator('select[aria-label^="Evaluaci"]').all())await select.selectOption('CUMPLE');
  await page
    .getByRole("button", { name: "Aprobar y Emitir Certificado" })
    .click();
  await page.getByLabel("Contraseña de Calidad").fill("e2e-password");
  await page.getByRole("button", { name: "Confirmar y emitir" }).click();

  await expect(
    page.getByRole("status").filter({ hasText: "Aprobación completada" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({
      hasText: "Certificado CERT-00031 emitido correctamente.",
    }),
  ).toBeVisible();
});
