# Reporte Fase 7 — Documentación viva y cierre UI/UX

> **Estado:** cierre de documentación y validaciones completado el 6 de noviembre de 2026.
> **Repositorio:** `frontend_sterinova`.

## Gobernanza y documentación

- [CONTRIBUTING.md](../../CONTRIBUTING.md): Conventional Commits, regla de componentes y accesibilidad, comandos de pruebas y flujo de PR.
- [Plantilla de pull request](../../.github/PULL_REQUEST_TEMPLATE.md): responsive, Lighthouse A11y, Design System, E2E para flujos críticos, pruebas y documentación.
- [CHANGELOG.md](../../CHANGELOG.md): hitos registrados en `v1.0.0`.
- [Principios y patrones UI](../ui-ux/principios-y-patrones.md): guía para nuevas páginas ERP, layout/rutas compartidos, componentes, tokens, estados y accesibilidad.
- [Flujos críticos](../ui-ux/flujos-criticos.md): nota explícita de cobertura E2E y límites de API simulada.
- [Índice de documentación](../README.md): enlaza los documentos de gobernanza, dependencias, changelog y fases.

## Aviso de Next.js

Next.js 16 valida automáticamente la navegación instantánea en desarrollo para segmentos App Router. El dashboard depende de `useStoredUser`, por lo que su ruta enteramente cliente producía un aviso de validación que no podía resolverse exportando `instant` desde un Client Component. Se separó la entrada de ruta en un Server Component, que declara `export const instant = false`, y se conservó el contenido interactivo en `DashboardClient.tsx`. La exclusión es local al dashboard; no cambia el comportamiento de las demás rutas. La prueba unitaria de contrato cubre esa separación.

Playwright ya no registra el aviso `Could not validate that a segment in your UI has instant navigation` para `/`. Next.js sigue mostrando mensajes informativos de que algunas rutas de prueba se renderizan con cachés de servidor desactivadas en modo desarrollo.

## Auditoría de dependencias

- `npm audit fix` detectó que reducir los avisos moderados exigiría cambiar `eslint-config-next` a `15.5.29`; se restauró la versión 16.4.5 para que coincida con Next.js 16. No se aplicó una degradación incompatible del framework.
- Se reemplazó `xlsx@0.18.5`, que no tiene arreglo en el registro npm y tenía dos advisories altos, por la distribución comunitaria `@e965/xlsx@0.20.3`. Su procedencia y riesgo de suministro quedan descritos en [auditoría de dependencias](../arquitectura/auditoria-dependencias.md).
- Resultado del audit completo tras el cambio: 8 moderadas (dependencias de desarrollo ESLint/TypeScript-ESLint), 0 altas y 0 críticas. `npm audit --omit=dev`: 0 vulnerabilidades de producción.
- El importador Excel compila, pero las suites actuales no incluyen un archivo Excel fixture para comprobar el parseo de extremo a extremo.

**Deuda técnica:** revisar el árbol ESLint con una combinación compatible con Next.js 16 y obtener aprobación operativa de la publicación comunitaria de SheetJS. Hasta que se acepten esos riesgos, este reporte no afirma que exista certificación de seguridad para producción.

## Quality gate

Resultados finales de esta fase:

| Comando | Resultado |
|---|---|
| `npm run build` | Correcto; compilación optimizada y TypeScript. |
| `npm run test` | Correcto; 40 pruebas aprobadas. |
| `npm run test:e2e` | Correcto; 4 pruebas Playwright aprobadas en Chromium headless. |
| `npm run lint` | **No pasa globalmente**: dos errores existentes de `react-hooks/set-state-in-effect` en el layout ERP modificado previamente y la página de Sellos, y una advertencia `no-img-element` en la tabla de Sellos. Los archivos son ajenos al cambio de Fase 7; el lint dirigido a los archivos de código cambiados por esta fase pasa. |
| `npm audit --omit=dev` | 0 vulnerabilidades reportadas en dependencias de producción. |

El estado funcional y UX está listo para promoción al siguiente entorno, sujeto a las decisiones de dependencias indicadas arriba, aceptación de negocio y comprobaciones de despliegue. Esta validación local no certifica por sí sola el entorno de producción.
