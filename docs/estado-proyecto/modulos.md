# Módulos y rutas visibles

> **Estado:** vigente.
> **Verificado contra:** `src/app` y navegación frontend el 6 de noviembre de 2026.
> **Alcance:** rutas y funciones visibles en la interfaz.
> **No cubre:** autorización efectiva del API, despliegue ni aceptación visual.
> **Fuente canónica de:** rutas y funciones visibles en la interfaz.

Las rutas agrupadas bajo `src/app/(erp)` se publican sin el segmento `(erp)`.

Los enlaces de navegación se definen en `src/lib/navigation.ts`; `/calidad` y `/usuarios` tienen páginas reales y la navegación los limita por rol. Esta visibilidad no reemplaza la autorización del backend.

| URL | Función observada |
|---|---|
| `/login` | Inicio de sesión; almacena token y datos básicos del usuario en `localStorage`. |
| `/` | Dashboard con saludo y cuatro contadores estáticos codificados. No consulta métricas de API. |
| `/comercial` | Acceso al área Comercial. |
| `/comercial/clientes` | Consulta, alta/edición e importación Excel de clientes. |
| `/comercial/cotizaciones` | Lista cotizaciones, previsualiza y solicita `POST /cotizaciones/:id/emitir` y `GET /cotizaciones/:id/descargar` al backend. |
| `/comercial/cotizaciones/nueva` | Formulario de cotización. El selector presenta cinco tipos de servicio. |
| `/logistica` | Consulta/creación de órdenes desde cotizaciones aprobadas y avance de estado. |
| `/planta` | Consulta de órdenes en planta e historial de ciclos. |
| `/planta/ciclo/nuevo` | Registro de ciclo de esterilización. |
| `/calidad` | Bandeja de ciclos pendientes y lista de certificados; solicita la descarga con `GET /certificados/:id/descargar`. |
| `/calidad/revisar/[ciclo_id]` | Revisión, aprobación con confirmación de contraseña o rechazo con motivo. |
| `/calidad/certificados/[id]` | Detalle de certificado y solicitud de descarga PDF. |
| `/usuarios` | Administración de usuarios, roles, estado y contraseña; restringida a Admin en backend. |
| `/configuracion/plantillas` | Gestión de formatos y versiones documentales. |
| `/configuracion/sellos` | Gestión de sellos de certificación. |

Las rutas internas `/internal/pdf/cotizacion` y `/internal/pdf/certificado` son páginas de render para Playwright, no páginas normales de navegación. El flujo, el QR y el hash se describen en [módulos backend](../../../backend_sterinova/docs/estado-proyecto/modulos.md#pdf-oficial-y-documentos); aquí solo se identifica la integración de rutas internas.

## Cotizaciones

> **Fuente canónica:** tipos, prefijos y disponibilidad UI/backend se mantienen en [estado funcional del backend](../../../backend_sterinova/docs/estado-proyecto/modulos.md#tipos-de-cotización-prefijos-y-disponibilidad). Este apartado solo señala la correspondencia visible en interfaz.

La interfaz ofrece `INDUSTRIAL_ETO`, `INSTITUCIONAL_ETO`, `INSTITUCIONAL_VAPOR`, `INSUMOS` y `LAVANDERIA`. El backend acepta además `FARMACEUTICO` y `FABRICANTE`, que no aparecen en el selector UI. El mapa de prefijos y formatos de referencia está en [estado funcional del backend](../../../backend_sterinova/docs/estado-proyecto/modulos.md#tipos-de-cotización-prefijos-y-disponibilidad).

La sesión del cliente API adjunta el JWT de `localStorage` y elimina la sesión cuando el API responde `401`; el frontend no comprueba por sí mismo la expiración antes de cada solicitud. El formulario de login aún usa una URL local fija, como se detalla en [integración y stack](../arquitectura/integracion-y-stack.md).

Consulta también la [integración y stack](../arquitectura/integracion-y-stack.md) y el [contexto del producto](contexto-producto.md). Que una página exista no acredita despliegue ni validación operativa.
