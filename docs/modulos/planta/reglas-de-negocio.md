# Módulo 5 — Planta: reglas de negocio

Actualización: 9 de noviembre de 2026.

Estado: respuestas oficiales 58 a 69 incorporadas desde el mensaje del usuario. Son requisitos del negocio; no certifican implementación ni validación técnica de protocolos.

Referencias: [cuestionario original](../interrogatorio/modulo-5-planta.md), [Logística](../logistica/reglas-de-negocio.md) y [Cotizaciones](../comercial/cotizaciones/reglas-de-negocio.md).

## 1. Procesos — respuesta 58

- Planta gestiona esterilización EtO, Vapor y Lavandería Farmacéutica.
- Lavandería tiene un flujo propio: Recepción → Lavado → Secado → Doblado/Empaque → Liberación.
- Lavandería no debe forzarse a pasar por un ciclo tradicional de esterilización ni a registrar sus parámetros de presión.
- Los criterios, responsable y documento de liberación de Lavandería deben precisarse con Calidad; no se presume que correspondan a un certificado de esterilización.

## 2. Catálogo de equipos — respuesta 59

- El catálogo es obligatorio.
- Cada equipo tiene código único, método EtO/Vapor, capacidad, ubicación y estado: Operativo, Mantenimiento o Fuera de Servicio.
- Solo el Jefe de Planta o Calidad pueden administrarlo.
- Los equipos utilizados deben seleccionarse del catálogo; no se sustituyen por nombres libres sin trazabilidad.

La respuesta describe el catálogo de esterilización. La clasificación de equipos de Lavandería y las unidades de capacidad no están definidas; no se les asigna EtO o Vapor por defecto.

## 3. Disponibilidad y calibración — respuesta 60

- Un equipo con calibración vencida o en mantenimiento no puede programarse ni utilizarse para registrar un ciclo.
- Solo Calidad o el Jefe de Planta pueden reactivarlo tras cargar el certificado de calibración.
- La carga del archivo y la reactivación autorizada son hechos distintos: subir un documento no implica automáticamente cambiar el estado del equipo.
- Como consecuencia de su estado, un equipo Fuera de Servicio tampoco debe habilitarse para operar.

No se definieron reglas de calificación, periodicidad de calibración ni validación del certificado. Tampoco se resolvió cómo documentar un ciclo que ocurrió antes de detectar una indisponibilidad: no se descarta evidencia real ni se inventa una excepción al bloqueo.

## 4. Identificación de ciclos — respuesta 61

- El sistema genera un consecutivo interno para trazabilidad; `CIC-2026-001` es el ejemplo recibido.
- Existe además un campo para el número físico de ciclo de la máquina.
- El número físico puede repetirse en el tiempo, pero debe ser único por equipo y año.
- Los dos identificadores se conservan; uno no reemplaza al otro.

El formato exacto del consecutivo interno, sus reinicios y el año aplicable a registros retroactivos deben definirse antes de implementar. El ejemplo no constituye por sí solo una política completa de numeración.

## 5. Órdenes, materiales y cantidades — respuestas 62 y 63

- Un ciclo puede contener varias órdenes y clientes, siempre que la carga quepa en la cámara.
- Una orden puede distribuirse entre varios ciclos, por ejemplo 100 cajas en dos cargas de 50.
- El operario selecciona las órdenes que entran al ciclo; los materiales proceden de sus registros y no se digitan como filas independientes sin origen.
- El sistema descuenta automáticamente los materiales asignados.
- El reproceso crea un ciclo nuevo vinculado al original y conserva el historial del material.

### Propuesta para concretar la asignación parcial

Seleccionar órdenes y luego las cantidades de cada fila de material que participarán en la carga. Mantener vínculos entre ciclo, orden y material, con cantidades asignadas, procesadas y pendientes, para evitar asignaciones duplicadas.

Interpretar el descuento como consumo o reserva del saldo disponible para asignar, sin borrar la cantidad recibida ni el historial. El momento exacto —reserva, inicio o finalización— y la devolución del saldo ante un aborto aún no están definidos. Un reproceso no debe contarse automáticamente como una segunda entrega del cliente ni como nuevas unidades cumplidas.

Estas son propuestas de trazabilidad, no reglas adicionales ya aprobadas. La compatibilidad entre cargas de distintos clientes, empaques o protocolos debe concretarse con Calidad; disponer de capacidad física no demuestra por sí solo compatibilidad técnica.

## 6. Método contratado — respuesta 64

- Comercial define el método en la cotización según el requerimiento del cliente y compatibilidad del producto.
- Planta no puede cambiar el método contratado.
- Si el material no es compatible, se rechaza o devuelve a Logística.
- Una cotización con varios servicios requiere conservar el método de cada concepto operativo; no se deriva un método único para todos sus materiales por suposición.

La evidencia de compatibilidad y el procedimiento comercial para corregir el servicio contratado aún no se han especificado.

## 7. Parámetros y evidencia — respuesta 65

| Método | Parámetros solicitados |
| --- | --- |
| EtO | Temperatura (°C), humedad (%), presión negativa (inHg), exposición (min) y aireación (min). |
| Vapor | Temperatura (°C), exposición (min), secado (min), humedad/presión. |

- Registrar valores exactos y validarlos contra el rango del protocolo aplicable.
- Permitir archivos PDF y CSV exportados directamente de la máquina como evidencia del ciclo.
- La respuesta no solicita ni autoriza que importar un archivo sustituya automáticamente la captura o aprobación de datos.
- No se fijan aquí rangos técnicos numéricos, tolerancias o precisiones que el usuario no haya proporcionado.

Para Vapor no se especificaron unidades de presión ni si humedad y presión son ambas obligatorias. No se hereda automáticamente la presión negativa en inHg de EtO.

Debe distinguirse detectar una medición fuera de rango de impedir conservarla: se propone registrar el dato real y señalar el incumplimiento para Calidad. No se debe alterar una medición para hacerla coincidir con un protocolo. El tratamiento final del incumplimiento pertenece al Módulo 6.

## 8. Protocolos — respuesta 66

- El protocolo depende del método, equipo y tipo de empaque.
- Calidad selecciona y aprueba la versión aplicable; Planta no ejerce esa aprobación.
- Como propuesta de trazabilidad, fijar la referencia a esa versión en el ciclo y conservarla aunque se publique una nueva posteriormente.
- No se debe sustituir silenciosamente el protocolo por la versión más reciente durante una evaluación histórica.

La selección de protocolos para cargas con varios empaques requiere definir compatibilidades o dividir la carga; no se elige arbitrariamente el protocolo del primer material.

## 9. Registros retroactivos — respuesta 67

- No se permiten por defecto.
- Ante una interrupción de red o falta de conexión de la máquina, solo SuperAdmin o Calidad pueden autorizarlos.
- La autorización requiere justificación obligatoria y auditoría.
- Se propone conservar por separado fecha real de ejecución, fecha de captura, responsable del registro y autorizador.

No se ha definido una antigüedad máxima. La autorización retroactiva no se considera automáticamente permiso para operar un equipo no habilitado o eludir el protocolo.

## 10. Fallos, abortos y reprocesos — respuesta 68

- Registrar estados `FALLIDO` o `ABORTADO` y exigir motivo.
- El reproceso genera un ciclo nuevo vinculado al anterior.
- `CIC-2026-001-R1` es el ejemplo de identificación recibido; la política para sucesivos reprocesos queda por concretar junto con los consecutivos.
- Nunca borrar ni sobrescribir el ciclo original fallido.
- Conservar materiales, cantidades, datos y evidencias del intento original, además de los del nuevo intento.

El resultado de un ciclo fallido o abortado no debe confundirse con una liberación conforme. La recuperación de saldos, aprobación de reproceso y destino de material rechazado deben acordarse con Calidad y Logística.

## 11. Procesamiento y liberación — respuesta 69

- La orden se declara `PROCESADA` cuando termina el ciclo y se registran sus parámetros.
- No puede despacharse hasta que Calidad apruebe las evaluaciones y emita el certificado.
- Procesamiento terminado y liberación de Calidad son hitos diferentes.

Para órdenes divididas en varios ciclos, la respuesta no define si el primer ciclo terminado puede cerrar toda la orden. Se propone declarar procesamiento parcial mientras queden cantidades pendientes y `PROCESADA` solo cuando todas las cantidades aplicables hayan completado su procesamiento; esto requiere validación y no se presenta como una respuesta ya recibida.

## 12. Puntos de coordinación con Calidad y Logística

| Punto | Definiciones que deben conciliarse |
| --- | --- |
| Estado de orden | Planta usa `PROCESADA`; Logística usa `PROCESADO`. Representan aquí el hito de procesamiento; el nombre técnico común se definirá al diseñar el flujo. |
| Liberación excepcional | Logística contempla urgencia médica con autorización documentada del Gerente de Calidad. Planta exige aprobación y certificado antes del despacho. Se mantiene la regla ordinaria y se señala que Calidad debe precisar si subsiste aquella excepción y su alcance; no se elimina ni amplía silenciosamente. |
| Lavandería | Tiene liberación propia; falta definir el documento de salida y cómo se relaciona con el control de despacho. |
| Bloqueo de materiales | Logística relaciona el bloqueo con registro del ciclo y entrada a máquina. Debe fijarse el evento exacto junto con las reservas y asignaciones de Planta. |
| Carga multicliente | Debe conservar trazabilidad y límites de visibilidad; un ciclo compartido no autoriza mostrar a un cliente datos de otros. El alcance del certificado se definirá con Calidad. |
| Calibración y retroactividad | Debe distinguirse la habilitación del equipo en la fecha real del proceso de su estado en la fecha de captura, sin inventar un bypass de controles. |

## 13. Alcance documental y continuidad

Solo se registran requisitos y propuestas identificadas. No se modifica código de producción, datos, equipos, protocolos, permisos ni ciclos. Los cuestionarios originales se conservan.

Continúa el [Módulo 6 — Calidad](../interrogatorio/modulo-6-calidad.md), especialmente liberación parcial, evaluación de parámetros, evidencias, reprocesos y posibles excepciones.
