# Pruebas frontend

> **Estado:** vigente; pruebas unitarias y E2E ejecutadas el 6 de noviembre de 2026.
> **Verificado contra:** `tests/`, `e2e/` y `package.json` del frontend.
> **Alcance:** pruebas unitarias `.mjs` y flujos E2E de Playwright con API simulada.
> **Fuente canónica de:** alcance y comandos de pruebas frontend.

> **Fuente canónica:** el inventario y estado de verificación de ambos repositorios está en [pruebas backend](../../../backend_sterinova/docs/calidad-y-pruebas/pruebas.md). Esta página solo detalla los archivos y límites propios de frontend.

`npm run test` ejecuta la suite `.mjs` de `tests/` mediante `node --test tests/*.test.mjs`.

`npm run test:e2e` ejecuta Playwright Test en Chromium headless y levanta el frontend en `http://localhost:3000`. Las pruebas mockean la API en `http://localhost:3001`; no requieren conexión a backend ni base de datos. Cubren login → creación de cotización (incluye los siete tipos y estado de carga), recuperación de error 500 y aprobación de Calidad, y descarga de PDF con verificación del estado de carga y el evento de descarga. El detalle de escenarios está en [flujos críticos](../ui-ux/flujos-criticos.md).

Estas pruebas no cubren la cadena completa de negocio cotización → orden → ciclo → certificado contra un entorno staging. Tampoco documentan pruebas de accesibilidad con teclado/lector, responsive por breakpoints o aceptación visual de PDF.
