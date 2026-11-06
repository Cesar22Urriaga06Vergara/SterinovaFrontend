# Reporte Fase 6 — Flujos críticos y pruebas E2E

> **Estado:** completada; validación ejecutada el 6 de noviembre de 2026.
> **Repositorio:** `frontend_sterinova`.
> **Alcance:** automatización de flujos críticos con frontend real y API interceptada.

## Framework y configuración

- Playwright Test instalado como dependencia de desarrollo (`@playwright/test`).
- Chromium configurado para ejecución headless.
- `playwright.config.ts` inicia la aplicación en `http://localhost:3000` y configura la API simulada en `http://localhost:3001`.
- Los tests interceptan las solicitudes de red y no dependen de backend ni base de datos.
- Comandos disponibles: `npm run test:e2e` para E2E y `npm run test` para la suite `.mjs`.

## Flujos cubiertos

- **Login y Comercial:** credenciales simuladas, token de prueba, redirección al dashboard, estado de carga del formulario, comprobación de los siete tipos de servicio, creación de cotización y toast de éxito.
- **Calidad — fallo y reintento:** respuesta HTTP 500 simulada en la carga de pendientes, presentación de `ErrorState` con botón **Reintentar** y recuperación después de una respuesta exitosa.
- **Calidad — aprobación:** lista de ciclos pendientes, apertura de revisión, contraseña en el modal, envío de aprobación y toast de certificado emitido.
- **Descarga PDF:** respuesta PDF simulada; se verifica que el botón quede deshabilitado y muestre **Descargando...** mientras la petición está pendiente, y que el navegador emita el evento de descarga con el nombre esperado.

## Validación

| Comando | Resultado |
|---|---|
| `npm run build` | Correcto; compilación optimizada y verificación TypeScript completadas. |
| `npm run test` | Correcto; 40 pruebas aprobadas, 0 fallidas. |
| `npm run test:e2e` | Correcto; 4 pruebas aprobadas en Chromium headless, 0 fallidas. |
| ESLint en páginas modificadas, configuración y specs E2E | Correcto; sin errores. |

Durante el servidor de desarrollo de E2E, Next.js también registró un aviso no bloqueante de validación de instant navigation para `/` (`src/app/(erp)/page.tsx`). No impidió la compilación ni la ejecución de las pruebas.

La instalación de Playwright informó 9 vulnerabilidades en el árbol npm (8 moderadas y 1 alta); no se investigaron ni remediaron como parte de esta fase.

## Documentación y límites

La documentación de recorridos y escenarios está actualizada en [Flujos críticos](../ui-ux/flujos-criticos.md); los comandos e inventario de pruebas están en [Pruebas frontend](../calidad-y-pruebas/pruebas-frontend.md).

La API se simuló en todos los escenarios; los resultados no sustituyen una aceptación de negocio ni una validación contra staging. Tampoco se automatizó la cadena completa cotización → orden → ciclo → certificado contra un backend.
