# Arquitectura e integración del frontend

> **Estado:** vigente.
> **Verificado contra:** configuración, rutas y componentes frontend el 6 de noviembre de 2026.
> **Alcance:** stack, sesión/API y render PDF desde frontend.
> **No cubre:** comportamiento de servicios desplegados ni aceptación visual.

La aplicación usa Next.js 16.4.5, React 19.3 y TypeScript. Las rutas protegidas viven bajo `src/app/(erp)`; el segmento `(erp)` agrupa rutas y no aparece en la URL. Las páginas visibles se listan en [módulos y rutas](../estado-proyecto/modulos.md).

## API y sesión

> **Fuente canónica:** autenticación, roles y controles backend se documentan en [arquitectura y seguridad del backend](../../../backend_sterinova/docs/arquitectura/arquitectura-y-stack.md). Esta página describe cómo la interfaz consume la sesión.

`src/lib/api.ts` crea el cliente Axios con `NEXT_PUBLIC_API_URL` y valor local predeterminado `http://localhost:3001`. El interceptor envía `Authorization: Bearer <token>` desde `localStorage`, redirige al login si falta sesión y limpia la sesión ante respuesta 401. El formulario de login usa directamente `http://localhost:3001/auth/login`, por lo que no sigue `NEXT_PUBLIC_API_URL` actualmente.

El layout ERP comprueba token en el navegador. La autorización efectiva debe aplicarla el backend con JWT y roles; esconder páginas/enlaces no protege endpoints. La UI de Usuarios y los controles de Calidad dependen de los permisos del API.

El frontend no valida proactivamente el vencimiento del JWT; elimina la sesión y redirige a `/login` cuando el API responde `401`.

## PDF

> **Fuente canónica:** comportamiento del generador, hash, almacenamiento y QR se documenta en [módulos backend](../../../backend_sterinova/docs/estado-proyecto/modulos.md). Aquí solo se describe la integración frontend.

Los PDFs oficiales de cotización y certificado los genera Playwright en el backend abriendo las rutas internas de render (`/internal/pdf/cotizacion` y `/internal/pdf/certificado`). El frontend contiene los componentes React y el QR del certificado. Las páginas internas validan un token de render privado usando `PDF_RENDER_SECRET`; esa variable no debe llevar prefijo público. La UI emite cotizaciones con `POST /cotizaciones/:id/emitir` y descarga cotizaciones/certificados con `GET /cotizaciones/:id/descargar` y `GET /certificados/:id/descargar`; no genera el PDF oficial con `html2pdf.js` o jsPDF.

Los componentes PDF usan `/Logo1.png` y `/certificaciones-icontec-iqnet.jpeg` en cotizaciones y certificados, además de `/sello-calidad.png` en el certificado. Los archivos correspondientes están en `public/`. La dependencia `html2pdf.js` está declarada en el proyecto, pero no se usa en el flujo PDF oficial; no se encontró dependencia o uso de jsPDF. Las referencias y el flujo completo están en la [documentación del backend](../../../backend_sterinova/docs/estado-proyecto/modulos.md#pdf-oficial-y-documentos).

Consulta el [manual de desarrollo local](../manuales/desarrollo-local.md).
