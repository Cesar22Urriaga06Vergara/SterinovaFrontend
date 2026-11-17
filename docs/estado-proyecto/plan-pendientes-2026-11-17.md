# Plan de pendientes — Frontend Sterinova (17 nov 2026)

## Estado de partida
- Working tree con cambios sin commitear que simplifican el dashboard (`src/app/(erp)/page.tsx`) y rompen el test de contrato `tests/phase3-critical-flows.test.mjs` (espera `export const instant = false`).
- Lint global: 1 warning (`suppressGlobalToast` sin uso en `ErrorState.tsx`).
- `npm run test`: falla por el cambio de dashboard.
- `npm run build`: por validar tras cambios.
- Deuda técnica vigente (reporte fase 7): ESLint incompatible con Next.js 16 (2 errores preexistentes en layout ERP y página Sellos), warning `no-img-element` en tabla Sellos, falta fixture Excel para parseo E2E, aprobación de `@e965/xlsx`.

## Objetivo
Restaurar la línea base verde (test + lint + build) y cerrar la deuda técnica identificada, sin perder funcionalidad.

## Estado de ejecución (17 nov 2026)

- **T1** ✅ Completado — dashboard y página de logística restaurados; test de contrato verde.
- **T2** ✅ Completado — prop `suppressGlobalToast` eliminada; lint sin warnings.
- **T3** ✅ Completado — lint global limpio (0 errores, 0 warnings).
- **T4** ✅ Completado — fixture `tests/fixtures/clientes.xlsx` + prueba `tests/cliente-import.test.mjs` (87 tests pasan).
- **T5** ⏳ Pendiente de equipo — firma de Arquitectura para `@e965/xlsx@0.20.3` y combinación ESLint compatible con Next.js 16.
- **T6** ⏳ Pendiente — validación final (`build`, `test`, `test:e2e`, `lint`) y actualización de reporte/CHANGELOG.

### T1 — Restaurar dashboard y test de contrato
- Revertir `src/app/(erp)/page.tsx` a la versión con `DashboardClient` y `export const instant = false`.
- Verificar `tests/phase3-critical-flows.test.mjs` verde.
- DoD: `npm run test` sin fallos por este test.

### T2 — Limpiar warning en ErrorState
- Eliminar o usar `suppressGlobalToast` en `src/components/ui/states/ErrorState.tsx`.
- DoD: lint sin warnings en ese archivo.

### T3 — Resolver errores de lint preexistentes
- Corregir `react-hooks/set-state-in-effect` en layout ERP y página Sellos.
- Resolver `no-img-element` en tabla Sellos (usar `next/image` o justificar).
- DoD: `npm run lint` pasa globalmente (0 errores).

### T4 — Fixture Excel y prueba de parseo
- Añadir archivo Excel de prueba en `tests/fixtures/`.
- Extender suite para parseo end-to-end del importador.
- DoD: prueba automatizada valida parseo.

### T5 — Seguridad de dependencias
- Documentar y obtener aprobación de `@e965/xlsx`.
- Evaluar combinación ESLint compatible con Next.js 16.
- DoD: `npm audit --omit=dev` 0; documentación actualizada.

### T6 — Validación final
- Ejecutar `npm run build`, `npm run test`, `npm run test:e2e`, `npm run lint`.
- Actualizar reporte de fase y CHANGELOG.
- DoD: quality gate completo y documentado.

## Orden
T1 → T2 → T3 → T4 → T5 → T6.

## Riesgos
- Revertir dashboard puede reintroducir aviso de instant navigation; mantener separación Server/Client Component.
- Cambios de ESLint pueden requerir migración de reglas; validar antes de merge.