# Contribuir al frontend Sterinova

Esta guía cubre cambios en `frontend_sterinova`. Consulta también [principios y patrones UI](docs/ui-ux/principios-y-patrones.md), [Design System](docs/ui-ux/design-system.md) y [accesibilidad](docs/ui-ux/accesibilidad.md).

## Flujo de trabajo

1. Crea una rama desde la rama de trabajo acordada y limita cada cambio a un propósito.
2. Sigue [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `<tipo>(<ámbito>): <descripción>`. Tipos habituales: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci` y `chore`. Usa `!` y un pie `BREAKING CHANGE:` para cambios incompatibles.
3. Implementa y prueba el cambio; no incluyas credenciales, archivos `.env`, artefactos generados ni datos reales.
4. Antes de abrir un pull request, ejecuta las validaciones pertinentes y completa [la plantilla de pull request](.github/PULL_REQUEST_TEMPLATE.md).

## Regla de componentes y accesibilidad

**Ningún componente nuevo se mergea si no está en `src/components/ui` o no pasa la auditoría de accesibilidad.**

Antes de crear uno, comprueba los componentes existentes en [Design System](docs/ui-ux/design-system.md). Los componentes compartidos se implementan en `src/components/ui/`, usan los tokens semánticos y documentan props, variantes, estados y ejemplo de uso. Una excepción local requiere una justificación clara y la revisión de accesibilidad del flujo completo.

La auditoría debe verificar etiquetas/nombres accesibles, teclado y foco visible, contraste, encabezados y landmarks, anuncios de error/carga, viewport móvil y, cuando corresponda, diálogo y lector de pantalla. Lighthouse ayuda a detectar problemas automatizables, pero una puntuación no certifica WCAG ni sustituye pruebas manuales. Registra el alcance y las limitaciones en el PR. Consulta [Accesibilidad](docs/ui-ux/accesibilidad.md).

## Pruebas y compilación

Desde la raíz del frontend:

```powershell
npm run test
npx playwright install chromium
npm run test:e2e
npm run build
```

`npm run test` ejecuta las pruebas unitarias `.mjs`. `npm run test:e2e` inicia el frontend en `http://localhost:3000` y ejecuta Chromium headless; las APIs de los flujos E2E se interceptan. No se requiere un backend para esa suite. Para cambios de lógica o componentes, añade pruebas de comportamiento y ejecuta las suites afectadas; antes de integrar, ambas suites y el build deben pasar.

Si actualizas dependencias, revisa `npm audit` y evita degradar versiones mayores de Next.js, React o sus integraciones para silenciar avisos. Registra riesgos sin parche compatible en [auditoría de dependencias](docs/arquitectura/auditoria-dependencias.md).

## Pull requests

La lista completa está en [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md). Incluye propósito y evidencia, accesibilidad, responsividad, tokens del sistema de diseño, pruebas, documentación y migraciones/configuración necesarias.
