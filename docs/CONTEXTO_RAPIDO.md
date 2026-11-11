# Contexto rápido — Sterinova Frontend

## Stack comprobado

Next.js 16.4.5, React 19.3 y TypeScript. Las versiones y comandos vigentes están en `package.json`.

## Entradas, rutas y módulos

- Layout raíz: `src/app/layout.tsx`. Rutas de acceso: `src/app/login/` y `src/app/reset-password/`.
- ERP: `src/app/(erp)/`, con rutas por área comercial, logística, planta, calidad, usuarios y configuración.
- Render interno de PDF: `src/app/internal/`.
- Componentes reutilizables: `src/components/`; cliente API, navegación y tipos del dominio: `src/lib/`.

## API, contratos y pruebas

- Cliente HTTP: `src/lib/api.ts`; tipos por dominio: archivos `src/lib/*-types.ts` y tipos locales de cada módulo.
- Contrato OpenAPI y reglas de backend: `../../Sterinova-Backend/docs/arquitectura/openapi.json` y `../../Sterinova-Backend/docs/`.
- Pruebas unitarias: `tests/*.test.mjs`; E2E: `e2e/*.spec.ts`.
- Comandos: `npm test`, `node --test tests/<archivo>.test.mjs`, `npx playwright test e2e/<archivo>.spec.ts`, `npm run lint`, `npm run build`.

## Documentación activa

- Índice: `docs/README.md`; stack e integración: `docs/arquitectura/integracion-y-stack.md`.
- UI y calidad: `docs/ui-ux/` y `docs/calidad-y-pruebas/`.
- `docs/estado-proyecto/modulos.md` describe rutas y módulos, pero fue verificado el 6 de noviembre de 2026: confirma los detalles contra el código antes de usarlo como estado actual.
- Planes, reportes de fase, kickoff y diseño inicial de datos son antecedentes; consúltalos solo si la tarea lo requiere. Las reglas funcionales canónicas viven en el Backend.

## Cómo localizar un cambio

Consulta el [mapa completo](ESTRUCTURA_FRONTEND.md), elige el área de `src/app/(erp)/`, sigue sus componentes y tipos locales y limita búsquedas a `src/app/`, `src/components/`, `src/lib/`, `tests/` o `e2e/`. Abre el Backend solo para una dependencia contractual o funcional concreta; no cargues ambos repositorios ni toda la documentación por defecto.
