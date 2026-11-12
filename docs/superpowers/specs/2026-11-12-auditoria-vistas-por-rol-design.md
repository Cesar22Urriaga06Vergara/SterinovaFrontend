# Auditoría visual y organización de vistas por rol

## Intención

Ordenar la experiencia del ERP para que cada pantalla tenga un propósito
operativo claro, muestre solo las acciones correspondientes a sus permisos y
comunique correctamente carga, error, ausencia de datos y falta de acceso.
La prioridad es una experiencia híbrida: el inicio se adapta a las tareas del
usuario y cada área conserva una vista amplia de su operación.

Esta fase es de auditoría y diseño. No cambia todavía el comportamiento de la
aplicación ni los contratos del backend.

## Objetivos

- Crear un inventario vista por vista de propósito, datos, acciones y permisos.
- Detectar contenido vacío, provisional o ubicado fuera de su responsabilidad.
- Definir una jerarquía de navegación que distinga maestros, operación y
  administración sin duplicar accesos.
- Unificar los estados visuales de carga, error, vacío, éxito y acceso
  restringido.
- Mantener la autorización efectiva en el backend; la UI solo refleja permisos
  ya entregados por la sesión.

## No objetivos

- No crear métricas nuevas ni inventar datos para el dashboard.
- No cambiar roles, permisos, endpoints, reglas de negocio ni migraciones.
- No implementar todavía reportes, catálogo u otros módulos que no tengan un
  flujo funcional definido.
- No eliminar registros ni modificar bases de datos.

## Restricciones y hallazgos actuales

- La navegación se filtra por permisos en `src/lib/navigation.ts`, pero las
  rutas y páginas no están descritas en una matriz única de responsabilidad.
- El inicio contiene cuatro tarjetas estáticas con el mensaje “Métricas en
  construcción”; debe convertirse en una superficie útil aunque no existan
  métricas agregadas.
- `/comercial` incluye una tarjeta de “Reportes” marcada “Próximamente”; no
  debe presentarse como una función disponible.
- Comercial, logística, planta y calidad tienen datos operativos reales, pero
  varias tablas implementan sus estados vacíos directamente y con mensajes
  visualmente distintos.
- La visibilidad debe basarse en permisos (`*.ver`, `*.gestionar`,
  `*.aprobar`, etc.), no en el nombre visible del perfil.

## Matriz propuesta de vistas

| Vista | Propósito principal | Debe mostrar | Acciones propias | Permisos guía |
|---|---|---|---|---|
| Inicio | Orientar al usuario a su trabajo inmediato | Resumen de tareas accesibles y enlaces de continuación | Abrir la tarea o módulo | Sesión; contenido condicionado por permisos |
| Panel Comercial | Entrada al trabajo comercial | Clientes, cotizaciones y pendientes comerciales | Ir a clientes o cotizaciones | `cotizaciones.ver`, `clientes.ver` |
| Clientes | Mantener el maestro de clientes | Buscar, listar, crear, editar e importar | Alta, edición, importación | `clientes.ver` y permisos de gestión cuando existan |
| Cotizaciones | Gestionar el ciclo comercial | Lista, filtros, estado y acciones autorizadas | Crear, editar, emitir, descargar, solicitar anulación | `cotizaciones.ver`, `cotizaciones.crear`, permisos específicos |
| Logística | Preparar y mover órdenes aprobadas | Órdenes, cotizaciones aprobadas y estado logístico | Crear orden, registrar evento, avanzar estado, descargar | `logistica.ordenes.ver` y acciones logísticas |
| Planta | Ejecutar ciclos de esterilización | Órdenes listas e historial de ciclos | Registrar ciclo | `planta.ordenes.ver`, permisos de ciclo |
| Calidad | Revisar ciclos y certificados | Pendientes de revisión y certificados emitidos | Aprobar, rechazar, descargar | `calidad.ciclos.ver` y permisos de aprobación |
| Solicitudes | Resolver anulaciones pendientes | Solicitudes del ámbito autorizado | Aprobar o rechazar con observación | `solicitudes_anulacion.ver`, `solicitudes_anulacion.aprobar` |
| Usuarios | Administrar identidad y acceso | Usuarios, estado, perfiles y credenciales | Crear, editar, activar, roles, contraseña | `usuarios.ver` y permisos de gestión |
| Plantillas | Administrar formatos documentales | Formatos, versiones y vigencia | Crear y versionar | `formatos.ver` y gestión asociada |
| Sellos | Administrar sellos de certificación | Imagen, licencia, orden y estado | Subir, ordenar, activar/desactivar | `sellos.ver` y gestión asociada |

## Organización visual propuesta

### Inicio por tareas

Reemplazar las métricas estáticas por bloques derivados de las capacidades
disponibles: “Continuar trabajo”, “Pendientes que requieren acción” y
“Accesos frecuentes”. Si no hay datos, cada bloque debe explicar qué evento lo
alimenta y enlazar al módulo; no debe simular un contador.

### Vistas de área

Cada página debe comenzar con título, propósito, acción primaria permitida y
resumen breve. Las tablas deben reservar la acción en una columna estable y
usar estados compartidos. Los accesos de otra responsabilidad deben vivir en
la navegación o en enlaces contextuales, no como tarjetas decorativas dentro
de la vista.

### Navegación

Conservar la separación `Principal`, `Maestros`, `Operación` y
`Administración`, pero revisar cada enlace contra la existencia de su página,
su permiso y su responsabilidad. Un módulo sin implementación funcional no se
debe mostrar como operativo.

### Estados

Adoptar `LoadingState`, `ErrorState`, `EmptyState` y un estado de acceso
restringido con lenguaje específico por vista. El vacío debe distinguir
“todavía no hay registros” de “no hay tareas para este ámbito” y de “la
consulta falló”.

## Enfoques considerados

1. **Auditoría por vista y matriz rol/permisos (elegido).** Permite decidir
   primero qué pertenece a cada pantalla y evita rediseñar sobre supuestos.
2. **Inicio y sidebar primero.** Resolvería la primera impresión rápido, pero
   dejaría inconsistencias dentro de los módulos.
3. **Flujo completo Contrato → Calidad primero.** Fortalece continuidad
   operativa, pero pospone maestros y administración, que también presentan
   vistas vacías o mezcladas.

Se eligió el primer enfoque porque corresponde a la necesidad de organizar
vista por vista y por responsabilidad antes de implementar cambios visuales.

## Decisiones confirmadas

- El inicio será un dashboard contextual por permisos y área, no un selector de
  áreas. Un usuario comercial entra a su trabajo comercial; un usuario de
  logística ve logística; un administrador no debe escoger qué área ver para
  acceder a Comercial, sino ver directamente las funciones comerciales que
  tenga autorizadas; y un gerente general puede recorrer todo el sistema desde
  su dashboard y navegación.
- El dashboard podrá representar visualmente los datos y procesos que ya están
  desarrollados. No se crearán métricas ficticias ni endpoints nuevos como
  parte de esta reorganización; lo que no tenga fuente de datos se marcará
  como pendiente funcional.
- Los códigos exactos de permiso se tomarán del catálogo canónico del backend.
  La matriz no inventará nombres para acciones todavía no confirmadas.
- La sesión (`/auth/me`) gobernará la navegación y el backend seguirá siendo
  responsable de filtrar los datos entregados por ámbito. La UI no sustituye
  esa autorización.
- Un módulo aparecerá si tiene una ruta real y un permiso declarado. Si la
  función está parcialmente desarrollada, la vista debe comunicar su estado
  explícitamente y no presentar una acción que todavía no existe.

## Entregable de esta fase

Una matriz revisada con:

- vista y objetivo;
- audiencia/permisos;
- contenido permitido y contenido fuera de lugar;
- acciones y rutas de salida;
- estados de carga, error, vacío, éxito y sin permiso;
- prioridad de implementación y pruebas asociadas.

La implementación posterior deberá limitarse a esa matriz y reutilizar el
sistema visual existente, sin crear datos ficticios ni ampliar el alcance
funcional.
