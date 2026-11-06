# Accesibilidad

> **Estado:** revisión automatizada de las tres vistas piloto completada; no es
> una certificación de conformidad WCAG.
> **Verificado:** 6 de noviembre de 2026.
> **Alcance:** componentes base, Login, Dashboard, Calidad, layout ERP y
> navegación lateral.

## Resultados de la auditoría

Lighthouse en Chrome, escritorio, obtuvo **100/100 en Accesibilidad** en:

| Vista | Ruta | Accesibilidad |
|---|---|---:|
| Login | `/login` | 100 |
| Dashboard | `/` | 100 |
| Calidad | `/calidad` | 100 |

El Dashboard y Calidad se cargaron con una sesión local sintética de rol Admin;
no se usaron credenciales reales. El backend no estaba conectado durante la
auditoría. El Dashboard mostró sus estados vacíos y Calidad mostró el error de
carga de API junto a sus tablas vacías. La nota Lighthouse comprueba reglas
automatizadas sobre la página renderizada: no confirma por sí sola conformidad
WCAG 2.1 AA ni cubre todos los roles, estados, rutas, tamaños de pantalla o
tecnologías de asistencia.

## Criterios y medidas implementadas

| Criterio WCAG 2.1 | Medida |
|---|---|
| 1.3.1 Información y relaciones | Campos base con etiquetas visibles asociadas; navegación y contenido principal con landmarks; enlaces de sección actualizados con `aria-current="page"`. |
| 1.4.3 Contraste mínimo | En las vistas piloto se reemplazaron textos de marca con contraste insuficiente. Texto blanco sobre `primary`: 5.72:1; sobre `secondary`: 6.25:1. `surface-subtle` sobre el fondo gris: 6.89:1. |
| 2.1.1 Teclado | Acciones implementadas con controles HTML nativos; los diálogos existentes manejan `Tab`, `Shift+Tab` y `Escape`; Escape cierra la navegación móvil. El botón Menú precede a los enlaces en el orden del documento para que `Tab` avance hacia ellos al abrir. |
| 2.4.1 Evitar bloques | El layout ERP ofrece el enlace “Saltar al contenido principal”, visible al recibir foco y dirigido a un `<main>` enfocable. |
| 2.4.7 Foco visible | Enlaces, botones, campos y el destino del enlace de salto disponen de estilos `focus-visible`. |
| 4.1.2 Nombre, función y valor | Navegación con nombre accesible; enlaces actuales exponen su estado; controles de icono de cierre tienen nombre. Los atributos ARIA nativos de `Button` permiten pasar `aria-label`. |
| 4.1.3 Mensajes de estado | Login anuncia errores con `role="alert"`; errores de `Input`/`Select` están vinculados mediante `aria-describedby`, marcados como inválidos y anunciados de forma educada; carga y notificaciones usan regiones de estado. |

Las parejas de color citadas cumplen 4.5:1 para texto normal. La medición
automática aprobó contraste en las tres vistas auditadas; no se midieron todos
los estados dinámicos de la aplicación.

## Limitaciones conocidas

- Los PDFs descargados o generados no se han validado para etiquetado,
  estructura de encabezados, orden de lectura, texto alternativo ni formularios.
  No se consideran 100% accesibles.
- Lighthouse no reemplaza pruebas manuales con NVDA, VoiceOver, ampliación,
  alto contraste, dictado ni navegación exclusivamente por teclado.
- La auditoría cubrió únicamente Login, Dashboard y Calidad en escritorio. El
  resto de rutas, estados de carga/error, vistas móviles y todos los diálogos
  requieren revisión adicional.
- La navegación y los diálogos tienen comportamiento de teclado implementado,
  pero el recorrido manual completo debe confirmarse antes de declarar
  conformidad WCAG.

## Prueba manual con teclado

1. Inicia el frontend con `npm run dev` e inicia sesión con una cuenta de prueba.
2. Usa `Tab` y `Shift+Tab` para recorrer controles. Confirma que el foco siempre
   se ve, que el enlace de salto aparece al enfocarlo y que conduce al contenido.
3. En una ventana móvil o viewport estrecho, abre el menú con el teclado y usa
   `Tab` para recorrer sus enlaces y `Escape` para cerrar. Debe devolver el foco
   al botón “Menú”. Cuando está cerrado, los enlaces del panel no deben entrar
   en el orden de tabulación.
4. Abre un diálogo desde una acción disponible. Recorre sus controles con
   `Tab`/`Shift+Tab`, confirma que el foco no sale del diálogo, ciérralo con
   `Escape` y comprueba la devolución del foco al control que lo abrió.
5. Comprueba los campos con error y las acciones que solo muestran iconos.

## Prueba con lectores de pantalla

- **NVDA + Firefox (Windows):** inicia NVDA, abre la aplicación y navega con
  `Tab`/`Shift+Tab`. Usa la navegación por landmarks y la lista de elementos de
  NVDA para verificar encabezados, regiones, enlaces y formularios. Confirma
  que se anuncian los errores del Login y que cada campo conserva su etiqueta.
- **VoiceOver + Safari (macOS):** activa VoiceOver con `Command+F5`; navega por
  controles y landmarks con el cursor de VoiceOver y comprueba etiquetas,
  estados, mensajes y diálogo. Usa el comando de VoiceOver correspondiente a la
  configuración del teclado del equipo.

Registra las combinaciones de navegador, lector de pantalla y sistema operativo
usadas al reportar hallazgos. No marques la aplicación como conforme hasta
completar estas pruebas y revisar el resto de rutas.
