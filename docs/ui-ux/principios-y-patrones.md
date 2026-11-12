# Principios y patrones UI

> **Estado:** guía de contribución UI/UX vigente.
> **Verificado contra:** App Router, componentes UI, tokens, documentación y pruebas frontend el 6 de noviembre de 2026.
> **Alcance:** creación de páginas, uso del sistema visual, estados y accesibilidad.
> **No cubre:** aceptación visual de negocio ni certificación WCAG.
> **Fuente canónica de:** patrones UI/UX del frontend.

## Crear una página del ERP

Las rutas de negocio viven bajo `src/app/(erp)/`; el grupo `(erp)` comparte el layout autenticado y no forma parte de la URL. Añade la página dentro del módulo correspondiente para heredar automáticamente:

1. **`src/app/(erp)/layout.tsx`** — protección de sesión y rol, estructura responsive, región principal y enlace para saltar al contenido.
2. **`src/components/Sidebar.tsx`** — navegación por módulo, visibilidad según rol y ruta activa desde `src/lib/navigation.ts`.
3. **`src/components/Header.tsx`** — identidad de usuario y cierre de sesión.
4. **`src/components/ui/`** — controles reutilizables con variantes y estados accesibles.

Usa una página servidor como entrada y extrae a un Client Component solo la interacción que necesite hooks, eventos del navegador o estado local. Para una ruta nueva, confirma que el rol requerido y el destino estén representados en `src/lib/navigation.ts`; no dupliques navegación o controles de sesión dentro de la página.

Las páginas de entrada de cada área deben mostrar únicamente funciones
implementadas de esa área. No deben incluir selectores para cambiar de área ni
tarjetas de funcionalidades futuras con apariencia de acción disponible; el
dashboard contextual y la navegación resuelven el cambio entre áreas.

### Estructura recomendada

```tsx
import { EmptyState } from "@/components/ui/states/EmptyState";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { LoadingState } from "@/components/ui/states/LoadingState";

export default function ModulePage() {
  const loading = false;
  const error = "";
  const items: string[] = [];

  if (loading) return <LoadingState label="Cargando registros..." />;
  if (error) return <ErrorState message={error} />;
  if (items.length === 0) {
    return <EmptyState title="Sin registros" message="Aún no hay registros." />;
  }

  return <section className="mx-auto w-full max-w-6xl space-y-6">{/* contenido */}</section>;
}
```

El fragmento ilustra la jerarquía de estados; reemplaza los valores de ejemplo por datos reales y conserva una acción de reintento en errores recuperables.

## Componentes y tokens

- Antes de crear un control nuevo, comprueba si existe en `src/components/ui/` y reutiliza sus props y estados.
- Si el patrón será compartido, implementa el componente en `src/components/ui/`, añade ejemplos y props a [Design System](design-system.md), y úsalo desde una vista piloto.
- Usa los tokens semánticos del Design System para color, tipografía, radios, foco y superficies; no introduzcas valores de marca repetidos en componentes.
- Reutiliza `LoadingState`, `ErrorState`, `EmptyState` y `ToastProvider` para comunicar espera, fallos recuperables, ausencia de datos y confirmaciones.
- Conserva las etiquetas y términos de negocio del módulo; las alertas deben explicar el problema y la acción disponible.

## Accesibilidad y calidad

- Asocia etiquetas visibles a los campos; usa elementos HTML nativos para acciones, enlaces, formularios y tablas.
- Asegura un nombre accesible para controles de icono, foco visible, jerarquía de encabezados y estados anunciados con `role="status"`/`role="alert"` según corresponda.
- Los diálogos deben usar `Modal` y soportar foco inicial, ciclo de Tab, Escape y restauración del foco. No agregues roles ARIA redundantes a elementos nativos.
- Comprueba teclado y viewport móvil en cada flujo afectado. Usa Lighthouse como verificación automatizada, no como certificación WCAG; registra alcance y limitaciones.
- Ejecuta `npm run test`, `npm run test:e2e` para recorridos críticos y `npm run build`. Consulta [Accesibilidad](accesibilidad.md), [Flujos críticos](flujos-criticos.md) y [Pruebas frontend](../calidad-y-pruebas/pruebas-frontend.md).

La gobernanza general, los commits y el checklist de pull request están en [CONTRIBUTING.md](../../CONTRIBUTING.md) y [la plantilla de pull request](../../.github/PULL_REQUEST_TEMPLATE.md).
