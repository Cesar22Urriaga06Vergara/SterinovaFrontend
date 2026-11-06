# Auditoría de dependencias frontend

> **Estado:** revisión ejecutada el 6 de noviembre de 2026.
> **Comandos:** `npm audit`, `npm audit --omit=dev` y `npm audit fix`.
> **Alcance:** árbol npm registrado en `package-lock.json`; no es un análisis dinámico.

## Resultado

Después de sustituir la dependencia vulnerable de hojas de cálculo:

- `npm audit`: **8 moderadas, 0 altas, 0 críticas**.
- `npm audit --omit=dev`: **0 vulnerabilidades de producción**.
- Las 8 moderadas corresponden a dependencias del conjunto de lint de desarrollo: `eslint-config-next@16.4.5`, `typescript-eslint` y paquetes `@typescript-eslint/*`; la ruta incluye `minimatch` con el aviso [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). No forman parte del bundle de ejecución de la aplicación.

`npm audit fix` intentó cambiar `eslint-config-next` de la línea 16 a `15.5.29` para salir de ese árbol vulnerable. Se revirtió la degradación: esta aplicación usa Next.js 16 y una configuración ESLint de Next 15 no es una combinación compatible que debamos aceptar para silenciar el audit. No se aplicaron actualizaciones forzadas de framework.

## Hojas de cálculo (SheetJS)

El paquete `xlsx@0.18.5` del registro npm no ofrece una versión corregida (`npm audit` reporta `fixAvailable: false`) y estaba afectado por:

- [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6), prototype pollution.
- [GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9), ReDoS.

Se reemplazó por `@e965/xlsx@0.20.3`, que declara automatizar la publicación de versiones recientes del repositorio SheetJS y mantiene la API usada para leer `.xlsx`/`.xls`. El importador compila con la API existente y el audit no reporta los avisos de `xlsx` en este árbol. Las suites actuales no incluyen un archivo Excel fixture para comprobar el parseo integral.

**Riesgo residual de suministro:** `@e965/xlsx` es una publicación comunitaria mantenida por un tercero, no el paquete publicado por la organización oficial `sheetjs`. Antes de confiar archivos no confiables en producción, el equipo debe revisar y aprobar su procedencia y mantener la dependencia actualizada. Si no se acepta este proveedor, sustituir el importador por una biblioteca aprobada o adquirir/consumir el paquete corregido desde un canal oficial de SheetJS.

**Aprobación requerida:** el uso de `@e965/xlsx` queda condicionado a una firma de aprobación explícita del equipo de Arquitectura. Registrar nombre del aprobador, fecha, versión aprobada (`0.20.3`) y decisión en el registro corporativo de dependencias antes de operar el importador Excel con archivos no confiables. Hasta entonces, el proveedor comunitario permanece como riesgo pendiente, no como dependencia aprobada por Arquitectura.

## Acciones operativas

1. Obtener y registrar la firma de aprobación del equipo de Arquitectura para `@e965/xlsx@0.20.3`, o sustituirlo por una biblioteca con procedencia aprobada.
2. Acordar la actualización de `eslint-config-next`/Next.js que elimine los hallazgos del árbol de desarrollo sin mezclar versiones mayores incompatibles.
3. Revisar periódicamente `npm audit`, las versiones de lockfile y los avisos de Next.js/ESLint.

El reporte de Fase 7 registra el resultado junto con la validación del build y las pruebas. Un audit limpio de producción no equivale por sí mismo a una certificación de seguridad de la aplicación.
