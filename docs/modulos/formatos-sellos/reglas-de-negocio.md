# Módulo 8 — Formatos y Sellos: reglas de negocio

Actualización: 9 de noviembre de 2026.

Estado: respuestas oficiales 92 a 100 incorporadas desde el mensaje del usuario. Cierra la recopilación por módulos. No acredita implementación, conformidad normativa ni resolución de todas las dependencias entre módulos.

Referencias: [cuestionario original](../interrogatorio/modulo-8-formatos-sellos.md), [Certificados](../certificados/reglas-de-negocio.md), [Calidad](../calidad/reglas-de-negocio.md) y [Cotizaciones](../comercial/cotizaciones/reglas-de-negocio.md).

## 1. Responsabilidades documentales — respuesta 92

| Actuación | Responsable |
| --- | --- |
| Propiedad del formato | Jefe de Calidad. |
| Redacción y revisión | Analista de Calidad; ambas pueden recaer en esa función. |
| Aprobación final documental | Director Técnico o Gerente General. |
| Publicación y retiro en el sistema | Calidad. |
| Aceptación final de pruebas | Jefe de Calidad, según respuesta 100. |

La aprobación documental y la aceptación de pruebas son hitos distintos, no autorizaciones contradictorias. No se presume que cualquier usuario de Calidad pueda ejercer todos los permisos. La acumulación de funciones en una misma persona y los permisos concretos deben reflejar la separación acordada al diseñar la matriz.

## 2. Fuente oficial — respuesta 93

- El sistema, mediante sus versiones y hashes congelados en base de datos, es la fuente oficial.
- El Word/PDF controlado tiene función de respaldo físico documental.
- Ante discrepancias, prevalece la versión controlada del sistema.
- Esto no convierte cualquier configuración mutable o archivo recién importado en una versión aprobada: se mantiene el circuito de aprobación y publicación.

Los archivos de referencia siguen siendo evidencia de entrada y de comparación. Las diferencias deben registrarse y resolverse mediante control de cambios; no se borran ni alteran respaldos para ocultarlas. La política no sustituye la necesidad de respaldar y recuperar la base de datos y los recursos documentales.

## 3. Versionado estricto — respuesta 94

- Cualquier cambio exige una nueva versión: textos, campos, cálculos, diseño, logotipos y correcciones tipográficas.
- Se admite una identificación como V4.1 para un ajuste menor; el ejemplo no define todavía toda la gramática de versiones.
- No editar una versión utilizada para cambiar documentos emitidos.
- Conservar la historia y el vínculo entre versiones, con sus aprobaciones y recursos.

Si el cambio afecta al renderizador o al cálculo, versionar solo el texto de la plantilla no basta para reproducir la emisión: la implementación deberá conservar las dependencias efectivamente utilizadas. Es una consecuencia de diseño, no una implementación realizada en esta fase.

## 4. Aprobación y entrada en vigor — respuesta 95

- Registrar por separado fecha de aprobación y fecha de entrada en vigor.
- Permitir publicación programada a futuro.
- Una versión aprobada para el futuro no afecta a las emisiones actuales antes de su vigencia.
- Conservar la versión válida para el instante de emisión y fijarla en el documento.

La zona horaria de activación, tratamiento de emisiones concurrentes y manejo de borradores preparados con una versión anterior deben precisarse al diseñar el flujo. No se presume que aprobar una versión equivalga a activarla inmediatamente.

## 5. Resolución y excepciones — respuesta 96

Prioridad de selección: **Cliente específico > Servicio específico > General**.

- Calidad puede autorizar una Excepción de Versión para un cliente cuyo contrato exige usar una versión anterior.
- Conservar el vínculo con el cliente, versión y autorización; se propone registrar también contrato, motivo, responsable y período aplicable.
- La excepción no modifica la versión histórica ni autoriza reutilizar una licencia de sello suspendida.

Debe concretarse cómo se representa una versión anterior autorizada frente a la exigencia de vigencia de la respuesta 97. No se equipara «anterior» a «retirada utilizable» ni se permite una excepción sin registro.

No se definieron prioridades adicionales por idioma o sede. Para cotizaciones con varios servicios debe resolverse el formato aplicable sin seleccionar arbitrariamente el primer servicio ni aplicar una plantilla incompatible.

## 6. Bloqueo de emisión — respuesta 97

- Bloquear la emisión si falta un formato o sello vigente requerido.
- Mostrar un error crítico comprensible y no permitir continuar con una emisión incompleta.
- No usar una versión alternativa, un sello estático o una imagen predeterminada como sustitución silenciosa.
- Un fallo no debe producir un documento oficial parcialmente generado ni una liberación operativa sin el certificado requerido.

El usuario justifica el bloqueo como exigencia legal y señala que el sistema ya lo realiza. Aquí se registra la política de negocio; no se ha verificado su fundamento normativo ni la cobertura efectiva del bloqueo en el código. No se presenta esa afirmación como dictamen jurídico o resultado de pruebas.

La Excepción de Versión de la sección 5 requiere una resolución explícita compatible con este bloqueo; no se interpreta como autorización general para omitirlo.

## 7. Normas, licencias y sellos — respuesta 98

- Calidad administra normas y licencias de sellos, por ejemplo ICONTEC.
- Generar alertas 30 días antes del vencimiento de la licencia.
- Si una licencia se suspende, bloquear automáticamente su uso en nuevas emisiones.
- Una licencia vencida no satisface la vigencia exigida para emitir.
- El cambio de estado de una licencia no reescribe imágenes ni bytes de documentos ya emitidos.

La alerta forma parte del requisito futuro del producto; no se crea una automatización externa durante esta fase. Destinatarios, canal, repetición y conducta para licencias cargadas cuando faltan menos de 30 días deben concretarse. Los cambios de alcance de licencia tampoco quedaron desarrollados en la respuesta.

La política sobre notificación o eventual anulación de documentos afectados por una suspensión posterior debe definirse por separado; inmutabilidad del archivo no equivale a afirmar que su estado público de validez nunca cambia.

## 8. Inmutabilidad y condiciones comerciales — respuesta 99

- Cambiar un formato o sello nunca altera documentos emitidos.
- El snapshot debe conservar las referencias y los datos documentales de la emisión.
- Los seis campos de condiciones comerciales se incorporan mediante una nueva versión del formato.
- Mantener los rótulos exactos acordados en Cotizaciones y sus valores independientes.
- No distribuir automáticamente textos históricos entre campos nuevos ni regenerar PDFs anteriores con la nueva presentación.

La protección debe incluir recursos utilizados, versión del formato, sellos e identidades congeladas. No se supone que guardar únicamente un ID a un recurso mutable garantice la inmutabilidad.

## 9. Aceptación y pruebas — respuesta 100

La aceptación final corresponde al Jefe de Calidad. Las pruebas solicitadas incluyen:

- Textos largos sin cortes ni pérdida de contenido.
- Saltos de página automáticos.
- Cotizaciones en COP y USD.
- Verificación de históricos intactos después de cambiar formatos o sellos.

Se propone conservar el resultado y la versión evaluada, casos utilizados, responsable, fecha y hallazgos. Comparar datos y hashes de históricos antes y después permite comprobar conservación; no basta una inspección visual superficial.

La respuesta no confirma pruebas de impresión física o de otros idiomas. Permanecen como posibles ampliaciones, no como aceptación ya realizada. Ninguna de las pruebas funcionales aquí descritas se ejecutó durante esta actualización documental.

## 10. Cierre documental y dependencias

Las respuestas de los ocho módulos están incorporadas. La recopilación queda cerrada; continúan identificadas las decisiones no respondidas, propuestas del analista y conflictos entre módulos.

Antes de implementar el control documental deben conciliarse especialmente:

- Excepción de versión anterior frente a bloqueo por falta de vigencia.
- Plantilla para cotizaciones con varios servicios.
- Aprobación documental por Director Técnico/Gerente General frente a aceptación de pruebas por Jefe de Calidad.
- Formato oficial controlado frente a las nuevas tablas multiciclo, marcas de desviación/restauración y QR en cabecera exigidos en Certificados.
- Mecanismo de firma solicitado y permisos específicos de cada responsable.

No se modifica código de producción, datos, plantillas operativas, licencias, permisos ni PDFs. No se publican versiones ni se activa la refactorización con esta entrega.
