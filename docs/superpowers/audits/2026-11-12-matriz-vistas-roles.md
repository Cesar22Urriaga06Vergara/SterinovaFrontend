# Matriz de vistas y responsabilidades

> Auditoría de interfaz: 12 de noviembre de 2026. La visibilidad en frontend
> no sustituye la autorización del backend.

## Criterios

- El dashboard se adapta a los permisos entregados por `/auth/me`; no solicita
  al usuario elegir un área.
- El backend filtra los datos por `current_scope`; la UI presenta lo recibido y
  comunica cuando no existen tareas en ese ámbito.
- Una ruta aparece en navegación cuando existe una página real y tiene un
  permiso declarado.
- Las acciones deben comprobar el permiso específico de acción, no solo el
  permiso de consulta.

## Matriz

| Ruta | Responsabilidad | Contenido permitido | Acciones y permisos | Estados requeridos |
|---|---|---|---|---|
| `/` | Orientar al usuario | Tareas y accesos de módulos autorizados | Enlaces a módulos autorizados | Carga de sesión, sin módulos, error de sesión |
| `/comercial` | Entrada de Comercial | Clientes, catálogo y cotizaciones | Enlaces condicionados por `clientes.ver`, `productos.gestionar`, `cotizaciones.ver` | Sin funciones autorizadas |
| `/comercial/clientes` | Maestro comercial | Clientes del ámbito | `clientes.crear`, `clientes.editar`, `clientes.importar`, `clientes.eliminar` | Carga, error recuperable, sin clientes |
| `/comercial/productos` | Catálogo comercial | Productos y servicios del ámbito | `productos.gestionar` | Carga, error, catálogo vacío, acceso restringido |
| `/comercial/cotizaciones` | Ciclo comercial | Cotizaciones del ámbito | `cotizaciones.crear`, `cotizaciones.editar`, `cotizaciones.previsualizar`, `cotizaciones.emitir`, `cotizaciones.descargar`, `solicitudes_anulacion.crear` | Carga, error, sin cotizaciones |
| `/comercial/cotizaciones/nueva` | Crear cotización | Formulario y referencias vigentes | `cotizaciones.crear` | Validación, error API, clientes/referencias vacíos |
| `/logistica` | Operación logística | Órdenes y expedientes aprobados | `logistica.ordenes.crear`, `logistica.ordenes.cambiar_estado`, `logistica.cotizaciones_disponibles.ver` | Carga, error, sin órdenes, sin expedientes |
| `/planta` | Ejecución de planta | Órdenes listas e historial de ciclos | `planta.ciclos.ver`, `planta.ciclos.crear` | Carga, error, sin órdenes, sin ciclos |
| `/planta/ciclo/nuevo` | Registrar ciclo | Formulario del ciclo de una orden | `planta.ciclos.crear` | Validación, protocolo no disponible, error API |
| `/calidad` | Control de calidad | Ciclos pendientes y certificados | `calidad.aprobar`, `calidad.rechazar`, `certificados.ver`, `certificados.descargar` | Carga, error, sin pendientes, sin certificados |
| `/calidad/revisar/[ciclo_id]` | Revisar ciclo | Evidencia y datos del ciclo | `calidad.aprobar`, `calidad.rechazar` | Carga, ciclo inexistente, confirmación, error |
| `/calidad/certificados/[id]` | Consultar certificado | Detalle del certificado | `certificados.descargar` | Carga, inexistente, descarga fallida |
| `/solicitudes` | Resolver anulaciones | Solicitudes del ámbito actual | `solicitudes_anulacion.ver`, `solicitudes_anulacion.aprobar` | Carga, error, sin solicitudes |
| `/usuarios` | Administración de acceso | Usuarios del ámbito | `usuarios.ver`, `usuarios.identidad.gestionar`, `roles.gestionar`, `asignaciones.gestionar` | Carga, error, sin usuarios, acceso restringido |
| `/configuracion/plantillas` | Documentos | Formatos y versiones | `formatos.ver`, `formatos.crear`, `formatos.editar`, `formatos.versiones.crear`, `formatos.versiones.editar`, `formatos.versiones.publicar` | Carga, error, sin plantillas |
| `/configuracion/sellos` | Certificación documental | Sellos, licencia, orden y estado | `sellos.ver`, `sellos.crear`, `sellos.editar`, `sellos.desactivar` | Carga, error, sin sellos, acceso restringido |

## Contenido fuera de lugar detectado

- El Inicio no debe mostrar cuatro contadores estáticos con “Métricas en
  construcción”; debe mostrar accesos/tareas basados en permisos y datos que
  ya existan.
- `/comercial` no debe mostrar una tarjeta accionable o con apariencia de
  funcionalidad para “Reportes”, porque no existe una ruta de reportes.
- Ninguna vista de área debe incluir un selector para cambiar de área. El
  acceso a otras áreas se resuelve mediante el dashboard y el sidebar.
- Las tablas no deben usar mensajes inconsistentes para diferenciar carga,
  error y ausencia de datos.

## Prioridad de implementación

1. Inicio contextual y navegación coherente.
2. Estados visuales compartidos en Comercial, Logística, Planta y Calidad.
3. Limpieza de landings y placeholders.
4. Revisión final de vistas administrativas y pruebas de permisos.
