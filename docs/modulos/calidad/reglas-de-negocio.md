# Módulo 6 — Calidad: reglas de negocio

Actualización: 9 de noviembre de 2026.

Estado: respuestas oficiales 70 a 81 incorporadas desde el mensaje del usuario. Documento de requisitos; no acredita implementación, validación técnica ni cumplimiento legal.

Referencias: [cuestionario original](../interrogatorio/modulo-6-calidad.md), [Planta](../planta/reglas-de-negocio.md) y [Logística](../logistica/reglas-de-negocio.md).

## 1. Unidad de liberación y excepciones materiales — respuestas 70 y 78

- Calidad evalúa y libera el ciclo completo, que puede contener varias órdenes y lotes.
- Puede aprobar el ciclo general y rechazar materiales o lotes específicos, por ejemplo por empaque roto.
- Deben identificarse los ítems rechazados y conservar trazabilidad de la excepción.
- Una aprobación general no implica liberar los materiales rechazados: su estado y destino deben permanecer distinguibles.

Se propone relacionar cada decisión con las filas de material y cantidades del ciclo. El tratamiento de un rechazo parcial dentro de una misma fila aún no está definido. La agrupación de materiales en certificados se resolverá en el Módulo 7; aprobar un ciclo multicliente no supone emitir un único documento compartido entre clientes.

## 2. Independencia y doble aprobación — respuesta 71

- El operario de Planta que registró el ciclo no puede aprobarlo, aunque tenga también un rol de Calidad.
- La aprobación corresponde a un usuario autorizado con rol de Calidad.
- Las desviaciones críticas y los reprocesos requieren doble aprobación: Analista de Calidad y Jefe/Director de Calidad.
- Ambas aprobaciones deben conservar sus responsables; una persona con varios roles no representa dos aprobadores independientes.

La definición de desviación crítica y el momento de la doble aprobación respecto de la ejecución del reproceso requieren precisión. Las firmas adicionales del Director Técnico descritas más adelante no se consideran satisfechas automáticamente por otro cargo de nombre similar.

## 3. Protocolos y criterios — respuesta 72

- El Jefe de Calidad o Director Técnico define protocolos y criterios de aceptación.
- Dependen del método EtO/Vapor y del tipo de producto/empaque.
- Se almacenan en versiones inmutables.
- La evaluación debe conservar la versión aplicada; publicar otra versión no debe recalificar silenciosamente ciclos históricos.

Planta también define dependencia del equipo en su respuesta 66. Ambos requisitos se conservan: método, equipo y producto/empaque deben considerarse al resolver el protocolo. No se elimina la dimensión equipo por no estar repetida en esta respuesta. No se inventan rangos o criterios numéricos.

## 4. Evaluación híbrida — respuesta 73

- El sistema compara los valores registrados por Planta contra los rangos del protocolo y sugiere el resultado.
- Calidad revisa, valida y firma explícitamente la evaluación.
- Una sugerencia automática de cumplimiento no libera material ni sustituye la aprobación humana.
- El ejemplo de 55 °C dentro de 50–60 °C es ilustrativo; no se adopta como rango universal.

Como propuesta de trazabilidad, conservar por separado medición original, resultado calculado, decisión de Calidad, protocolo y responsables. No modificar la medición real para obtener un resultado favorable.

## 5. No aplica y cambios de resultado — respuesta 74

- Se permite `NO_APLICA` cuando el parámetro no corresponde al método o producto.
- Exige justificación obligatoria; no debe utilizarse para ocultar un resultado pendiente o fallido.
- Modificar un resultado que el sistema marcó como `NO_CUMPLE` exige registrar una Desviación y aprobación del Jefe de Calidad.
- Deben conservarse el resultado calculado y la decisión posterior, sin sobrescribir la evidencia original.

Esta aprobación no sustituye los controles adicionales de liberación cuando el parámetro sea crítico, descritos en la sección 8.

## 6. Evidencias — respuesta 75

Permitir adjuntar resultados de Indicadores Biológicos (BI), Indicadores Químicos (CI), gráficos y CSV exportados de la máquina, y fotografías del material cargado. Planta también contempla PDF exportado de máquina; se mantiene ese requisito.

Se propone vincular cada evidencia al ciclo y, cuando corresponda, al material evaluado, conservando autor y fecha de incorporación. La respuesta exige admitir estas evidencias, pero no establece que todos sus tipos sean obligatorios en todos los métodos. Tamaños, formatos adicionales, conservación y requisitos por protocolo quedan por definir.

## 7. Cuarentena y resultados pendientes — respuesta 76

- El material permanece en `CUARENTENA` mientras espera los resultados aplicables, especialmente el BI.
- Para el BI, Calidad debe registrar resultado negativo antes de la liberación ordinaria.
- El usuario indica 24–48 horas de incubación como contexto operativo; no se convierte ese intervalo en un temporizador universal ni en aprobación automática.
- La liberación condicionada exige autorización formal y documentada del Director Técnico.
- Un resultado no registrado no equivale a negativo. El transcurso del tiempo por sí solo no libera material.

El protocolo debe determinar qué indicadores aplican a cada proceso. La documentación no impone BI a Lavandería por analogía con esterilización. El seguimiento posterior de una liberación condicionada y su documentación de salida aún deben precisarse.

## 8. Fallo crítico y liberación por desviación — respuesta 77

- Si falla un parámetro crítico, bloquear automáticamente la emisión del certificado ordinario.
- La Liberación por Desviación requiere análisis de riesgo y firma del Director Técnico.
- El certificado resultante debe mostrar visiblemente: **Liberado por Desviación**.
- La excepción no transforma la medición fallida en una medición conforme ni elimina el historial de la desviación.
- Si la desviación es crítica, se mantiene además la doble aprobación exigida en la respuesta 71. No se asume que la firma del Director Técnico sustituya cualquiera de esas aprobaciones sin una equivalencia explícitamente definida.

Esta regla no concede a todos los usuarios de Calidad una facultad general de excepción. El catálogo de parámetros críticos pertenece a los protocolos controlados.

## 9. Rechazo, investigación y destino — respuesta 79

Todo rechazo debe generar:

- Motivo.
- Evidencia.
- Apertura de investigación CAPA (Acciones Correctivas y Preventivas).
- Destino del material: devolución al cliente, reproceso o destrucción.

Se propone enlazar la investigación, los materiales afectados y las actuaciones posteriores. Reproceso debe conservar el vínculo con el ciclo original conforme al Módulo 5. Seleccionar destrucción como destino no equivale a ejecutar ni acreditar su realización; responsables, autorizaciones y evidencia de cierre deben definirse. Tampoco se ha fijado si cerrar CAPA es condición previa para liberar otros materiales del ciclo.

## 10. Firma de aprobación — respuesta 80

- Para esta fase se acepta reingresar la contraseña como mecanismo de confirmación.
- Registrar usuario, cargo, fecha y hora exactas e IP de la actuación.
- Aplicar el mecanismo a cada aprobador requerido, preservando su identidad y decisión.
- No almacenar la contraseña dentro del registro de auditoría.

La finalidad expresada es contar con una firma electrónica auditable. Se documenta el mecanismo solicitado sin afirmar que estos datos, por sí solos, acrediten validez jurídica. La validación de requisitos legales y referencias aplicables queda en la pregunta 87 del Módulo 7; esta entrega no realiza un dictamen legal.

## 11. Inmutabilidad y correcciones — respuesta 81

- Una aprobación completada es inmutable.
- Ante un error, anular el certificado, registrar una desviación y emitir uno nuevo con revisión.
- Conservar el original, su aprobación y el vínculo con el sustituto; la anulación no implica borrarlos.
- No sobrescribir valores, evaluaciones o PDF de una aprobación anterior.

Los responsables de anular, numeración de revisiones, notificación al cliente y tratamiento del material ya entregado se precisarán en Certificados. La regla de aprobación de anulaciones comerciales no se traslada automáticamente a certificados.

## 12. Fallo de generación de PDF — respuesta 81

- Si falla la generación del PDF, hacer rollback: la aprobación final no se guarda.
- El usuario debe reintentar.
- No puede quedar material aprobado/liberado sin certificado como consecuencia de una generación fallida.
- El fallo no autoriza a eliminar los datos originales de Planta, evidencias o evaluaciones previamente guardadas.

Para el diseño posterior se propone que el reintento evite duplicar certificados y que cualquier archivo parcial no sea publicado como oficial. El alcance de la reversión sobre firmas preliminares de una doble aprobación y sobre varios certificados de un ciclo debe concretarse; no se da por implementada atomicidad entre almacenamiento de archivos y base de datos.

## 13. Coordinación de excepciones y pendientes

| Tema | Regla recibida y límite pendiente |
| --- | --- |
| Urgencia médica | Logística contempla liberación excepcional por el Gerente de Calidad; este módulo exige Director Técnico para liberación condicionada o por desviación. No se equiparan cargos ni se usa una autorización para eludir la otra. Debe definirse si son vías distintas o si una reemplaza a la anterior. |
| Pendientes frente a fallos críticos | Resultado pendiente admite solo la liberación condicionada formal descrita; fallo crítico exige análisis de riesgo, firma y marca documental. No son la misma excepción. |
| Certificado en liberación condicionada | Debe precisarse qué documento permite la salida y cómo se conserva la obligación de no liberar sin certificado. No se presume un despacho automático sin documento. |
| Material rechazado dentro de ciclo aprobado | Debe excluirse de la autorización de despacho. El Módulo 7 definirá cómo se representa en los documentos sin certificarlo como liberado. |
| Lavandería | Su flujo propio requiere criterios, autoridad y documento de liberación específicos, aún no definidos por estas respuestas centradas en EtO/Vapor. |
| Cargos de aprobación | Jefe, Director, Gerente de Calidad y Director Técnico no se tratan como sinónimos por defecto. |
| Evaluación histórica | Se conserva la versión de protocolo y la decisión original; una corrección formal no recalcula retrospectivamente todos los certificados. |

## 14. Alcance documental y continuidad

Solo se actualiza documentación. No se modifica código, datos, permisos efectivos, protocolos, firmas, evaluaciones ni certificados. Se conservan los ocho cuestionarios y sus 100 preguntas.

Continúa el [Módulo 7 — Certificados](../interrogatorio/modulo-7-certificados.md), con especial atención a certificados por cliente/ciclo, exclusiones de materiales, marcas de desviación, revisiones e inmutabilidad.
