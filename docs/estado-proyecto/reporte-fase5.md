# Reporte de ejecución — Fase 5: Accesibilidad

> **Estado:** cambios y auditoría automatizada completados; recorrido manual de
> teclado y lector de pantalla pendiente.
> **Repositorio:** `frontend_sterinova`.
> **Verificación:** 6 de noviembre de 2026.

## Correcciones aplicadas

- `Input` y `Select` asocian errores con `aria-describedby`, informan
  `aria-invalid` y anuncian el texto del error con `aria-live="polite"`.
- `Button` conserva los atributos ARIA nativos (incluido `aria-label`) y
  anuncia el estado de carga. El modal base ya exponía `role="dialog"`,
  `aria-modal`, etiqueta, foco inicial, confinamiento de `Tab`/`Shift+Tab`,
  cierre con `Escape` y devolución del foco.
- El Login usa un landmark `<main>` y anuncia errores con `role="alert"`.
- El layout ERP incorpora el enlace enfocable “Saltar al contenido principal”,
  un destino `<main id="main-content">` enfocable y un indicador de foco visible.
- La navegación lateral tiene nombre accesible, conserva
  `aria-current="page"`, excluye los enlaces del orden de tabulación mientras
  está cerrada en móvil, permite llegar a sus enlaces con `Tab` al abrirse,
  cierra con `Escape` y devuelve el foco al botón Menú.
- Se corrigieron combinaciones de bajo contraste en los textos del Login,
  Dashboard, Calidad, encabezado y navegación; el botón de acción de `EmptyState`
  ahora usa el color primario con contraste AA.

## Auditoría Lighthouse

Chrome, escritorio:

| Vista | Ruta | Accesibilidad |
|---|---|---:|
| Login | `/login` | 100/100 |
| Dashboard | `/` | 100/100 |
| Calidad | `/calidad` | 100/100 |

Las vistas ERP se probaron con una sesión local sintética de Admin; el backend
no estaba conectado. Se revisó el contraste y se corrigieron los hallazgos que
redujeron el score inicial. El resultado automatizado no equivale a certificar
conformidad WCAG 2.1 AA.

## Documentación

Los criterios cubiertos, limitaciones, instrucciones para NVDA/VoiceOver y
pruebas manuales están en [Accesibilidad](../ui-ux/accesibilidad.md).

## Quality Gate

- `npm run build`: correcto.
- `node --test tests/*.test.mjs`: 40 pruebas aprobadas, 0 fallidas.
- ESLint dirigido: reporta la regla preexistente `react-hooks/set-state-in-effect`
  en el efecto de hidratación de `src/app/(erp)/layout.tsx`; no forma parte de
  los cambios de accesibilidad. Build y pruebas requeridas pasan.
- Verificación manual con teclado y tecnologías de asistencia: pendiente.

## Validación humana solicitada

Recorre Login y una sesión ERP usando solo `Tab`, `Shift+Tab`, `Enter`, `Space` y
`Escape`. Confirma que el foco siempre se ve; que “Saltar al contenido
principal” funciona; que los enlaces de navegación móvil cerrada no reciben
foco; y que el foco queda dentro de cada modal y regresa al control que lo abrió
al cerrarlo. Repite el recorrido con NVDA o VoiceOver y reporta cualquier
barrera antes de declarar conformidad WCAG.

La Fase 5 queda completada para el alcance automatizado definido. La Fase 6
queda a la espera de instrucciones.
