# Módulo 7 — Certificados: reglas de negocio

Actualización: 9 de noviembre de 2026.

Estado: respuestas oficiales 82 a 91 incorporadas desde el mensaje del usuario. Documento de requisitos; no acredita implementación ni constituye validación jurídica o normativa.

Referencias: [cuestionario original](../interrogatorio/modulo-7-certificados.md), [Calidad](../calidad/reglas-de-negocio.md), [Planta](../planta/reglas-de-negocio.md) y [Logística](../logistica/reglas-de-negocio.md).

## 1. Unidad de emisión — respuesta 82

- Se emite un certificado por Orden de Servicio.
- Puede reunir materiales de varios ciclos cuando la orden se haya distribuido entre ellos, siempre que todos los ciclos incluidos hayan sido aprobados por Calidad.
- El certificado detalla los materiales e identifica el ciclo al que pertenece cada uno.
- Un ciclo compartido entre clientes no implica un certificado compartido: cada orden conserva su documento.
- Las sustituciones por corrección se vinculan al original conforme a la respuesta 90; no son una autorización para sobrescribirlo.

Calidad permite rechazar materiales específicos dentro de un ciclo aprobado. Estos materiales no deben certificarse como liberados. Debe precisarse si la orden espera su resolución, si el documento los identifica como excluidos o si existe otra salida formal; no se presume autorización para emitir varios certificados parciales de una misma orden.

## 2. Formato oficial — respuesta 83

- Utilizar R-AQ-09 para EtO y Vapor, con las tablas técnicas correspondientes a cada método.
- Respetar campos, textos legales y estructura de los archivos de referencia aprobados.
- Conservar código y versión del formato utilizado en cada emisión.
- La referencia aprobada y el procedimiento para aceptar cambios se definirán en el Módulo 8.

Una orden puede incluir varios servicios según Comercial. La respuesta no establece cómo presentar en un mismo certificado ciclos de métodos distintos ni si se permiten esas combinaciones. Tampoco asigna R-AQ-09 a Lavandería o Insumos por defecto.

## 3. Vigencia y conservación de esterilidad — respuestas 84 y 85

- Tres años como vigencia global predeterminada.
- El sistema debe permitir parametrizar vigencias por familia de producto si en el futuro se requieren excepciones por degradación del empaque.
- El Jefe de Calidad autoriza esas excepciones.
- La fecha de vencimiento representa conservación de esterilidad bajo condiciones específicas de almacenamiento; no se presenta simplemente como fecha de caducidad del archivo PDF.
- Incluir literalmente en el pie de página: «Mantener en lugar seco, a temperatura ambiente y protegido de la luz solar directa».

Se propone conservar en el snapshot la regla de vigencia, su autorización y las fechas aplicadas, evitando que un cambio posterior modifique certificados emitidos.

No se ha definido cómo resumir una sola fecha de esterilización y vencimiento cuando el certificado reúne ciclos de distintas fechas o familias con plazos diferentes. No se toma automáticamente la fecha mayor ni se extiende la vigencia de materiales anteriores. Esta decisión afecta también la consulta pública por QR.

## 4. Consecutivos — respuesta 86

- Numeración global y secuencial, compartida por EtO y Vapor.
- La nueva secuencia inicia en `001` y puede crecer hasta `99999999`.
- Los históricos conservan su número original, incluido el ejemplo `55388`.
- Los nuevos certificados siguen el nuevo formato; no se renumeran históricos.

La interpretación de presentación propuesta es un mínimo de tres cifras, ampliándose al crecer la secuencia; no se impone un relleno de ocho cifras que el usuario no solicitó.

Debe definirse cómo evitar o distinguir colisiones cuando la nueva secuencia alcance números históricos. Tampoco se ha fijado qué ocurre al agotar el máximo ni si se permiten saltos por emisiones fallidas. Esta fase no reinicia contadores ni consulta o modifica la base de datos.

## 5. Responsables y firmas — respuesta 87

El certificado requiere tres actuaciones identificadas:

| Bloque | Responsable solicitado | Datos de firma |
| --- | --- | --- |
| Elaborado | Operador de Planta | Nombre, cargo, fecha y hora. |
| Verificado | Analista/Coordinador de Calidad | Nombre, cargo, fecha y hora. |
| Aprobado | Director Técnico | Nombre, cargo, fecha y hora. |

- Incluir código y versión de formato, por ejemplo R-AQ-09 V05; el ejemplo no sustituye la selección de una versión oficialmente vigente.
- Conservar identidad y datos de cada firmante como eran en la actuación, sin reemplazarlos por nombres fijos ni por su perfil actualizado.
- Mantener la independencia entre el operario y quien aprueba, definida en Calidad.

El usuario denomina estas actuaciones «firma digital». Calidad había aceptado reingreso de contraseña y registro de identidad, cargo, fecha/hora e IP para esta fase. Se conservan ambos requisitos sin afirmar que texto impreso, firma electrónica auditable y firma digital criptográfica sean equivalentes. El mecanismo que satisface los tres bloques debe precisarse antes de implementarlo; este documento no certifica validez legal.

También debe definirse quién figura como Elaborado cuando varios operarios procesaron distintos ciclos de una misma orden. No se elige arbitrariamente al último operario.

## 6. Cuadro de estampado y QR — respuesta 88

- El cuadro inferior derecho queda completamente en blanco para el sello físico: sin imagen, QR, texto ni marcador en su interior.
- Ubicar el QR de validación en la cabecera, esquina superior derecha, junto al consecutivo.
- Mantener el cuadro y su posición según la referencia oficial. No se han proporcionado dimensiones numéricas.
- Las firmas y la marca de desviación no deben ocupar el interior reservado para estampado.

## 7. Consulta pública — respuesta 89

El QR abre una página web segura con únicamente la información pública autorizada:

- Estado: Vigente, Vencido o Anulado.
- Cliente.
- Consecutivo.
- Fecha de esterilización.
- Fecha de vencimiento.

No mostrar precios, detalle de materiales ni datos internos de Planta. La restricción debe aplicarse también a los datos entregados a la página, no solo a los campos visibles.

Como propuesta técnica, conservar una referencia pública no predecible para validar el documento. No se define aquí un nuevo mecanismo de autenticación del cliente ni se permite descargar expedientes internos mediante el QR.

El estado Anulado debe mostrarse aunque además haya vencido. El significado de Cliente —por ejemplo razón social visible— y la presentación de fechas de certificados multiciclo deben concretarse sin ampliar silenciosamente los datos públicos.

## 8. Anulación y reemplazo — respuesta 90

- Nunca borrar el certificado.
- Cambiar su estado a `ANULADO`, registrando motivo.
- Para corregirlo, emitir uno nuevo y vincularlo con el original.
- El QR del anulado debe mostrar una alerta roja: «DOCUMENTO ANULADO - Ver nuevo certificado».
- Mantener el QR del original operativo para que comunique la anulación; no redirigirlo silenciosamente como si siempre hubiera identificado al sustituto.

La anulación modifica el estado de validación y su auditoría, no los bytes ni datos firmados del documento histórico. Si aún no existe sustituto, se propone mostrar la anulación sin un enlace inexistente; al emitirse, habilitar el vínculo correspondiente. El acceso al sustituto debe respetar los límites de información pública.

Calidad exige además registrar una desviación para corregir una aprobación. Se mantiene ese requisito. El autorizador de anulación y la política de notificación a clientes no quedaron definidos en esta respuesta.

## 9. Conservación y reconstrucción — respuesta 91

- Conservar PDF, datos, evidencias y versiones durante un mínimo de cinco años.
- El usuario atribuye este plazo a normativa de dispositivos médicos. Se registra como requisito de conservación solicitado; su fundamento normativo específico no fue aportado ni verificado en esta entrega.
- No se interpreta el mínimo como una orden de eliminación automática al cumplirse cinco años. Debe fijarse desde qué evento se cuenta y cómo se manejan obligaciones adicionales de conservación.
- Si se pierde el PDF y se reconstruye desde el snapshot, el nuevo archivo debe llevar una marca visible: **COPIA RESTAURADA**.
- Registrar la restauración en auditoría.

Se propone conservar la referencia y hash del original, asignar una identidad de archivo y hash propios a la copia restaurada y registrar autor, fecha, motivo y fuente de reconstrucción. La marca cambia los bytes: no se debe afirmar que la copia conserva el hash del PDF perdido.

La reconstrucción no debe usar datos actuales de cliente, protocolo, firmas o sellos para reemplazar los del snapshot. Si faltan recursos históricos o evidencia suficiente, no se inventa una reproducción exacta. Restaurar una copia tampoco debe reactivar un certificado anulado.

## 10. Coherencia con Calidad y Planta

| Tema | Definiciones y precisión pendiente |
| --- | --- |
| Aprobación por ciclo frente a certificado por orden | Calidad libera ciclos y exige rollback de aprobación si falla el PDF; aquí el certificado reúne ciclos de una orden. Debe separarse o coordinarse evaluación de ciclos y aprobación final de emisión para evitar exigir un certificado completo cuando aún faltan ciclos de la orden. No se elimina silenciosamente la regla de rollback. |
| Tres actuaciones | El certificado exige Elaborado, Verificado y Aprobado; Calidad contemplaba doble aprobación para desviaciones críticas/reprocesos. Estas actuaciones documentales no sustituyen por defecto las autorizaciones especiales. |
| Liberación por desviación | Se conserva la marca visible «Liberado por Desviación» requerida por Calidad, ubicada fuera del cuadro blanco. Su encaje en R-AQ-09 debe aprobarse dentro del control de formatos. |
| PDF fallido | No publicar un certificado incompleto ni liberar material por una emisión fallida. El alcance transaccional para órdenes con varios ciclos necesita definición conjunta. |
| Métodos y familias mezclados | Tablas técnicas, fechas, vigencias y firmantes deben representar todas las contribuciones sin atribuciones inventadas. |
| Referencia exacta y cambios de presentación | QR en cabecera, marcas de restauración/desviación y filas por ciclo pueden requerir una versión documental controlada; el Módulo 8 resolverá su aprobación. |

## 11. Alcance y siguiente módulo

Solo se documentan requisitos y propuestas identificadas. No se modifica código, datos, consecutivos, PDF, estados, firmas ni permisos. Se conservan los cuestionarios originales.

Continúa el [Módulo 8 — Formatos y Sellos](../interrogatorio/modulo-8-formatos-sellos.md), último bloque del interrogatorio.
