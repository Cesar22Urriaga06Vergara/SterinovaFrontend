# Estructura de SterinovaFrontend

- Proyecto: SterinovaFrontend
- Ruta raíz del repositorio: `C:\Users\urria\SterinovaFrontend`
- Fecha de generación: 2026-11-11
- Carpetas incluidas (incluye la raíz): 53
- Archivos incluidos: 149
- Total de carpetas y archivos: 202

```text
SterinovaFrontend/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── docs/
│   ├── arquitectura/
│   │   ├── auditoria-dependencias.md
│   │   ├── integracion-y-stack.md
│   │   └── navegacion-y-permisos.md
│   ├── calidad-y-pruebas/
│   │   └── pruebas-frontend.md
│   ├── estado-proyecto/
│   │   ├── historico/
│   │   │   └── diseno-base-de-datos-inicial.md
│   │   ├── baseline-fase0.md
│   │   ├── contexto-producto.md
│   │   ├── modulos.md
│   │   ├── plan-accion-frontend-2026-11-06.md
│   │   ├── reporte-fase2.md
│   │   ├── reporte-fase3.md
│   │   ├── reporte-fase4.md
│   │   ├── reporte-fase5.md
│   │   ├── reporte-fase6.md
│   │   └── reporte-fase7.md
│   ├── kickoff/
│   │   └── instruccion-copilot-fase1-frontend.md
│   ├── manuales/
│   │   └── desarrollo-local.md
│   ├── ui-ux/
│   │   ├── accesibilidad.md
│   │   ├── design-system.md
│   │   ├── flujos-criticos.md
│   │   └── principios-y-patrones.md
│   ├── CONTEXTO_RAPIDO.md
│   ├── ESTRUCTURA_FRONTEND.md
│   └── README.md
├── e2e/
│   ├── calidad-flow.spec.ts
│   ├── certificate-materials.spec.ts
│   ├── comercial-flow.spec.ts
│   ├── hito4-operational.spec.ts
│   ├── iva-flow.spec.ts
│   ├── quote-edit.spec.ts
│   ├── rbac-quotes.spec.ts
│   └── solicitudes-anulacion.spec.ts
├── public/
│   ├── certificaciones-icontec-iqnet.jpeg
│   ├── file.svg
│   ├── globe.svg
│   ├── Logo1.png
│   ├── next.svg
│   ├── sello-calidad.png
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── (erp)/
│   │   │   ├── calidad/
│   │   │   │   ├── certificados/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── revisar/
│   │   │   │   │   └── [ciclo_id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── comercial/
│   │   │   │   ├── clientes/
│   │   │   │   │   ├── ClientesPageClient.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── cotizaciones/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── editar/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── nueva/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── CotizacionesClient.tsx
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── configuracion/
│   │   │   │   ├── plantillas/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── PlantillasDocumentalesClient.tsx
│   │   │   │   └── sellos/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── SealsTable.tsx
│   │   │   │       └── UploadSealDialog.tsx
│   │   │   ├── logistica/
│   │   │   │   └── page.tsx
│   │   │   ├── planta/
│   │   │   │   ├── ciclo/
│   │   │   │   │   └── nuevo/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── solicitudes/
│   │   │   │   └── page.tsx
│   │   │   ├── usuarios/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── types.ts
│   │   │   │   ├── UserDialogs.tsx
│   │   │   │   ├── UserRolesDialog.tsx
│   │   │   │   └── UsersTable.tsx
│   │   │   ├── DashboardClient.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── internal/
│   │   │   └── pdf/
│   │   │       ├── certificado/
│   │   │       │   └── page.tsx
│   │   │       └── cotizacion/
│   │   │           └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── assets/
│   │   └── brand/
│   │       └── Logo2.png
│   ├── components/
│   │   ├── calidad/
│   │   │   └── EvaluacionTecnica.tsx
│   │   ├── cotizaciones/
│   │   │   └── CotizacionForm.tsx
│   │   ├── logistica/
│   │   │   └── MaterialesEditor.tsx
│   │   ├── pdf/
│   │   │   ├── CertificadoPDF.tsx
│   │   │   ├── CotizacionPDF.tsx
│   │   │   ├── LegacyCertificadoPDF.tsx
│   │   │   └── LegacyCotizacionPDF.tsx
│   │   ├── ui/
│   │   │   ├── states/
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorState.tsx
│   │   │   │   ├── LoadingState.tsx
│   │   │   │   ├── toast-events.ts
│   │   │   │   └── ToastProvider.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Select.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── SolicitudAnulacionButton.tsx
│   └── lib/
│       ├── api.ts
│       ├── api-errors.ts
│       ├── calidad-types.ts
│       ├── calidad-validation.ts
│       ├── cliente-import.ts
│       ├── cliente-types.ts
│       ├── cotizacion-pdf-content.ts
│       ├── cotizacion-types.ts
│       ├── iva.ts
│       ├── logistica-types.ts
│       ├── navigation.ts
│       ├── operational-forms.ts
│       ├── operational-types.ts
│       ├── pdf-render-data.ts
│       ├── pdf-render-token.ts
│       ├── planta-types.ts
│       ├── session.tsx
│       ├── solicitud-anulacion-api.ts
│       ├── solicitud-anulacion-types.ts
│       ├── stored-user.ts
│       ├── stored-user-hook.ts
│       └── user-validation.ts
├── tests/
│   ├── accessibility-contracts.test.mjs
│   ├── api-errors.test.mjs
│   ├── cotizacion-currency.test.mjs
│   ├── cotizacion-pdf-content.test.mjs
│   ├── design-system.test.mjs
│   ├── iva.test.mjs
│   ├── operational-forms.test.mjs
│   ├── pdf-schema-v2.test.mjs
│   ├── phase3-critical-flows.test.mjs
│   ├── sidebar-navigation.test.mjs
│   ├── solicitud-anulacion.test.mjs
│   └── stored-user.test.mjs
├── .codexignore
├── .editorconfig
├── .env.example
├── .gitignore
├── .nvmrc
├── AGENTS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── playwright.config.ts
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```
