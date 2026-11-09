# Módulo 1 — Autenticación y usuarios: reglas de negocio

Fecha de actualización: 9 de noviembre de 2026.

Estado: respuestas del Módulo 1 incorporadas; no requiere repetir el interrogatorio. Este documento describe requisitos del negocio, no certifica su implementación.

Fuente principal: respuestas entregadas por el usuario en `Módulo 1 — Autenticación y usuarios.md`, adjunto desde `C:\Users\urria\Downloads`, y su instrucción de organizar el interrogatorio. Las respuestas más recientes prevalecen sobre propuestas y matrices anteriores cuando difieran.

Las preguntas originales se conservan, sin respuestas ni modificaciones, en [el cuestionario del Módulo 1](../interrogatorio/modulo-1-autenticacion-usuarios.md). Este documento contiene su resolución y las implicaciones para los demás módulos.

## 1. Organización y jerarquías

- La empresa se organiza por áreas.
- El gerente general puede consultar todo el sistema.
- El gerente comercial tiene alcance sobre el área Comercial; cada área tiene su responsable, por ejemplo el jefe de Calidad.
- En Comercial existen varios trabajadores o asesores que gestionan cotizaciones.
- El SuperAdmin tiene facultades superiores a las del gerente general. Son responsabilidades diferenciadas: visibilidad global del negocio no equivale automáticamente a administración técnica de la plataforma.
- La respuesta no enumera todas las áreas ni detalla cada facultad adicional del SuperAdmin. No se inventan sedes, plantas, niveles jerárquicos ni excepciones.

## 2. Roles y asignaciones

- Los cinco roles legados no constituyen un catálogo definitivo.
- Debe ser posible crear roles y configurar sus funciones conforme evolucione la organización.
- Una persona puede desempeñar varios roles en distintos equipos o plantas.
- Las funciones y permisos son dinámicos; no se deben fijar por nombre de persona ni por un listado cerrado de cargos.
- La respuesta confirma la multiplicidad de roles; no fija duración, vencimiento automático ni mecanismo de suplencias temporales.

## 3. Facultades comerciales y aprobación

- Los asesores comerciales pueden crear, editar y descargar cotizaciones conforme a sus permisos configurados.
- El jefe aprueba la cotización y el asesor la emite al área correspondiente.
- La aprobación del jefe y la emisión por el asesor son actuaciones diferentes y deben conservar sus responsables.
- No se considera que el permiso de editar otorgue por sí solo la aprobación del jefe.
- Actualización con las respuestas del Módulo 3: quien crea no aprueba; el gerente comercial o administrador autorizado aprueba para enviar al cliente. Después de la aceptación del cliente, el asesor emite y pasa al siguiente ciclo. La propuesta de estados y sus límites se desarrolla en [Cotizaciones](../comercial/cotizaciones/reglas-de-negocio.md).

### Anulación con aprobación

1. El asesor solicita la anulación.
2. La solicitud debe incluir una observación antes de la aprobación.
3. El administrador de su área aprueba la solicitud.
4. La solicitud del asesor no equivale por sí sola a una anulación aprobada.

La anulación debe distinguirse de la eliminación física. Los estados afectados, las consecuencias sobre órdenes o certificados y el tratamiento de solicitudes rechazadas se desarrollarán en sus módulos; no quedan decididos por esta respuesta.

## 4. Visibilidad de clientes, cotizaciones y responsabilidad

- Ante la pregunta sobre ver registros propios, del equipo o todos, el usuario respondió: «Todos, esto le permite seleccionar el cliente para esa cotización».
- Se registra la decisión de visibilidad compartida en Comercial y, expresamente, la posibilidad de seleccionar clientes existentes aunque no los haya creado el asesor.
- No se debe mantener la restricción anterior de acceso exclusivamente propio como si fuera la decisión definitiva del negocio.
- La respuesta no distingue explícitamente si «todos» comprende todas las cotizaciones de la empresa o las del área, ni concede acceso a otras áreas. Esa delimitación no se presume.
- El asesor que toma un cliente lleva todo el proceso; la reasignación es excepcional.
- No se ha definido un procedimiento de reasignación ni un autorizador específico para ese caso excepcional.

## 5. Administración de usuarios

- El gerente comercial y cada administrador de área pueden crear usuarios, asignar permisos y desactivarlos dentro de la responsabilidad de su área.
- Los casos sensibles requieren análisis específico; no se consideran autorizados de manera general por esta regla.
- La administración de área no se documenta como permiso para conceder SuperAdmin o facultades globales.
- La respuesta no define el tratamiento de una desactivación cuando la persona conserva funciones en otras áreas; no se asume una desactivación global automática.

## 6. Recuperación de contraseña

El usuario delega la elección de la solución y admite recuperación desde el login o renovación por el jefe de área.

Propuesta documental para concretar esa delegación, todavía no implementada:

- Ofrecer recuperación desde el login mediante un enlace de restablecimiento de un solo uso al correo registrado.
- Permitir al administrador autorizado del área iniciar un restablecimiento para el usuario.
- El restablecimiento permite establecer una contraseña nueva; no revela ni comparte la contraseña actual.
- Si se utiliza una credencial temporal, exigir su sustitución en el siguiente ingreso.

Estos mecanismos son una propuesta de diseño derivada de la delegación, no respuestas textuales del usuario. La vigencia del enlace, el canal disponible y los controles de sesión se definirán al diseñar la implementación.

## 7. Sesión y continuidad del trabajo

- Duración de sesión solicitada: 10 horas, conforme a la respuesta «Diría que 10 horas» y su reiteración posterior.
- El trabajo en curso debe conservarse hasta terminarlo o cerrarlo.
- Si se interrumpe la red, al restablecerse la conexión debe recuperarse el avance que llevaba el usuario.
- La duración de la sesión y la conservación del trabajo son requisitos distintos. Recuperar un avance no debe confundirse con haber confirmado una operación en el servidor.
- No se ha fijado si las 10 horas son absolutas o renovables, ni un plazo de inactividad, número de sesiones simultáneas o segundo factor.
- La respuesta tampoco precisa el significado de cerrar un proceso respecto de conservar o descartar su borrador, ni la política de invalidación inmediata por cambio de permisos. Estos detalles no se presentan como decisiones ya tomadas.

## 8. Auditor y exportación

- Debe existir un acceso o rol de auditor.
- Entre sus funcionalidades se contempla exportar a Excel información de cotizaciones y certificados.
- El usuario anticipa más funcionalidades de auditoría; esta lista no es exhaustiva.
- La respuesta no otorga facultades de edición, aprobación, emisión o anulación al auditor.
- La visibilidad exacta, columnas exportables, plazo de conservación de auditoría y tratamiento de los registros de usuarios retirados no se especifican en las respuestas recibidas.
- El nuevo acceso de auditor no se equipara automáticamente al rol previo `auditor_calidad`: su alcance solicitado incluye también información comercial.

## 9. Regla transversal: múltiples servicios por cotización

El usuario indica que un mismo cliente puede solicitar más de un servicio dentro de una misma cotización.

- Esta necesidad queda registrada como requisito de negocio para el Módulo 3.
- No debe descartarse por la existencia actual de un único tipo de servicio por cotización.
- Debe considerarse al definir aprobaciones por área, emisión al área correspondiente, desglose de servicios y generación de órdenes.
- La observación no determina todavía cómo se agrupan los servicios, sus impuestos, sus formatos o sus órdenes.

Referencia de continuidad: pregunta 23 del [cuestionario de Cotizaciones](../interrogatorio/modulo-3-cotizaciones.md). La necesidad de múltiples servicios ya fue expresada; la pregunta original se conserva por trazabilidad, no para desconocer esta respuesta.

## 10. Alcance de esta actualización

- Las diez respuestas del Módulo 1 quedan incorporadas sin solicitar una nueva ronda de preguntas.
- Los puntos no especificados se distinguen de los requisitos confirmados para evitar convertir supuestos en reglas aprobadas.
- El contrato RBAC existente es un antecedente técnico; deberá reconciliarse con estas respuestas antes de una futura implementación, especialmente respecto de visibilidad comercial, aprobación del jefe, emisión y rol de auditor.
- No se modifican permisos efectivos, sesiones, datos, contratos API ni código de producción en esta fase.
- El siguiente bloque de respuestas corresponde al [Módulo 2 — Clientes](../interrogatorio/modulo-2-clientes.md).
