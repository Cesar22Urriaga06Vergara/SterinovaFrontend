# Reporte de ejecución — Fase 4: Design System y consistencia visual

> **Estado:** completada.
> **Repositorio:** `frontend_sterinova`.

## Tokens Tailwind

Se añadieron colores semánticos `primary`, `secondary`, `success`, `warning`,
`error`, `surface` y `background`, junto a colores de texto, hover y fondos
claros complementarios. Se conservó la paleta `sterinova.*` existente para no
alterar vistas todavía no migradas. También se definieron escalas tipográficas
`h1`–`h6`, `body` y `caption`, y radios `control`, `card` y `dialog`.

Las combinaciones sólido/blanco de acción primaria (5.72:1), secundaria
(6.25:1) y error (6.47:1) superan 4.5:1. Los colores de texto de badges sobre
fondos claros alcanzan al menos 7.60:1. La medición de tokens no equivale a una
auditoría de accesibilidad de todos los estados de la interfaz.

## Componentes base

- `Button`: variantes primaria, secundaria, peligro y ghost; tamaños, disabled,
  loading y foco visible.
- `Input`: etiqueta visible, ayuda, error, asociación ARIA y foco visible.
- `Select`: etiqueta visible, opciones, ayuda, error y foco visible.
- `Badge`: variantes success, warning, error, info y neutral.
- `Modal`: bloqueo de scroll de fondo, Escape, foco inicial, focus trap,
  devolución del foco y cierre con clic en el fondo.

Los contratos de props y ejemplos están en
[`design-system.md`](../ui-ux/design-system.md).

## Pilotos migrados

- Login: campos y acción de envío usan `Input` y `Button`.
- Clientes: creación/edición usa `Modal`, `Input` y `Button`; las acciones de
  importar, editar y guardar también comparten el botón.
- Calidad: se unificaron las acciones y se incorporaron badges para ciclos
  pendientes, método y certificados emitidos.

## Quality Gate

- `npm run build`: **correcto**.
- `node --test tests/*.test.mjs`: **34 aprobadas, 0 fallidas** (31 pruebas
  existentes y 3 contratos del sistema de diseño).
- ESLint dirigido a configuración, componentes, pilotos y prueba nueva:
  **correcto**.
- Verificación visual manual: **pendiente**; no se realizó una sesión de
  navegador autenticada contra los servicios de la aplicación.

## Validación visual humana

1. Desde `frontend_sterinova`, ejecutar `npm run dev`.
2. Abrir `http://localhost:3000/login`; revisar los campos y el botón.
3. Iniciar sesión y visitar `/comercial/clientes` y `/calidad` con los datos/API
   disponibles.
4. Comparar botones e inputs entre las vistas: deben conservar altura, bordes,
   tipografía, colores y estados.
5. Recorrer con `Tab` y `Shift+Tab` todas las acciones y campos; confirmar el
   contorno de foco visible. Abrir el diálogo de cliente, comprobar que el foco
   no escape, que `Escape` lo cierre y que el foco vuelva al botón que lo abrió.
6. Confirmar que los badges muestran texto legible además del color.

La Fase 4 queda completada. La conformidad con WCAG y las pruebas con tecnologías
de asistencia pertenecen a la Fase 5.
