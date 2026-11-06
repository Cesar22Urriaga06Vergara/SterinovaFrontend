# Flujos críticos de interfaz

> **Estado:** vigente como mapa de interfaz y resumen de cobertura E2E.
> **Verificado contra:** rutas, componentes, cliente API y pruebas Playwright el 6 de noviembre de 2026.
> **Alcance:** páginas, transiciones observables y recorridos críticos automatizados con API simulada.
> **No cubre:** aceptación por usuarios ni funcionamiento contra un entorno real.
> **Fuente canónica de:** rutas de los flujos críticos frontend.

Los flujos críticos de login, cotización, estados de Calidad y descarga PDF están cubiertos por pruebas automatizadas E2E de Playwright. Las respuestas API se simulan: esta cobertura no equivale a una prueba de aceptación contra staging ni cubre toda la cadena logística/producción.

| Flujo | Secuencia de páginas/acciones observada | Riesgos y límites |
|---|---|---|
| Login | `/login` envía credenciales a `/auth/login` en la URL configurada por `NEXT_PUBLIC_API_URL`, guarda token/usuario en `localStorage` y entra al ERP. | El vencimiento JWT no se comprueba proactivamente. Backend responde 401 y el interceptor limpia sesión. |
| Cotización a PDF | `/comercial/clientes` → `/comercial/cotizaciones/nueva` → lista/previsualización → emisión → descarga. El formulario ofrece siete tipos de servicio. | La emisión PDF oficial depende de Playwright backend y rutas internas. |
| Logística y Planta | Cotización aprobada → `/logistica` crea orden → `/planta` registra ciclo en `/planta/ciclo/nuevo`. | El detalle de consistencia depende de la API; no se ejecutó el flujo. |
| Calidad y certificado | `/calidad` → `/calidad/revisar/[ciclo_id]` → aprobar con contraseña o rechazar con motivo → lista/detalle y descarga en `/calidad/certificados/[id]`. | Aprobar emite certificado; el UI no sustituye autorización de backend. Los estados de error, reintento y aprobación se verifican con API simulada en las pruebas E2E. |
| Usuarios | `/usuarios` lista; diálogos crean/editar/actualizan contraseña/estado. | Backend restringe a Admin. Gestión de foco de diálogos debe probarse con teclado. |
| Formatos y sellos | `/configuracion/plantillas` mantiene formatos/versiones; `/configuracion/sellos` mantiene recursos gráficos. | Backend restringe a Admin; sello no representa firma digital. |

> **Fuentes canónicas:** rutas frontend en [módulos y rutas](../estado-proyecto/modulos.md), API/permisos en [API backend](../../../backend_sterinova/docs/arquitectura/api-y-contratos.md), reglas funcionales de flujos y PDF en [módulos backend](../../../backend_sterinova/docs/estado-proyecto/modulos.md). Esta página sintetiza los recorridos de interfaz.

Fuentes: páginas bajo `src/app/(erp)/`, componentes PDF en `src/components/pdf/` y cliente `src/lib/api.ts`. La lógica de negocio y endpoints se documenta en el [mapa API backend](../../../backend_sterinova/docs/arquitectura/api-y-contratos.md).

## Pruebas E2E

Ejecuta `npm run test:e2e` desde la raíz de `frontend_sterinova`. Playwright inicia el servidor local en `http://localhost:3000` y ejecuta Chromium en modo headless. Las pruebas interceptan las solicitudes a la API (`http://localhost:3001`); no requieren backend ni base de datos.

Flujos cubiertos actualmente:

- **Login y cotización:** login exitoso y redirección al dashboard; carga del formulario, comprobación de los siete tipos, guardado de una cotización y toast de éxito.
- **Carga y descarga PDF:** estado de carga del botón mientras la API responde y evento de descarga con nombre de archivo esperado.
- **Calidad:** respuesta 500, presentación de `ErrorState`, reintento exitoso y aprobación de ciclo con contraseña y toast de confirmación.

Las respuestas de API son fixtures controladas: estas pruebas verifican el comportamiento integrado de la interfaz y no sustituyen una validación contra staging.
