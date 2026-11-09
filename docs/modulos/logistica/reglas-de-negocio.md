# Módulo 4 — Logística: reglas de negocio

Actualización: 9 de noviembre de 2026.

Estado: respuestas 46 a 57 incorporadas como definiciones del negocio. No implica implementación ni validación operativa.

Fuente: `Módulo 4.md`, entregado por el usuario desde `C:\Users\urria\Downloads`. Se conservan las [preguntas originales](../interrogatorio/modulo-4-logistica.md). Las precisiones pendientes al final distinguen conflictos entre módulos de reglas expresamente respondidas.

## 1. Órdenes y cotizaciones — respuesta 46

- Una cotización aceptada puede generar múltiples órdenes por sedes o entregas parciales.
- Cada orden pertenece a una sola cotización.
- Una orden puede agrupar varios ítems de esa misma cotización; no mezcla ítems de cotizaciones distintas.

## 2. Condiciones de creación — respuesta 47

- La cotización debe estar en estado `ACEPTADA` para crear la orden.
- Se requiere registrar la Orden de Compra (OC) del cliente o una autorización explícita del Jefe de Área.
- Si el acuerdo exige anticipo, el sistema debe alertar. No se establece un bloqueo obligatorio antes de la confirmación de Finanzas.
- No se infiere de esta respuesta cómo confirma Finanzas el pago ni qué bloqueo se aplicaría después: ese procedimiento no está definido.

## 3. Recepción física — respuesta 48

Registrar ID de orden, número de remisión/factura, fecha y hora, usuario autenticado que recibe, sede de origen y evidencias: fotos o firma digital de quien entrega.

La expresión «firma digital» se conserva como requisito recibido; su mecanismo técnico, identidad y requisitos de conservación todavía no se especifican. Una fotografía no se declara equivalente a una firma digital.

## 4. Diferencias y rechazos — respuesta 49

- Si se recibe menos de lo cotizado, registrar `RECIBIDO_PARCIAL` y notificar a Comercial.
- Logística puede rechazar material dañado y debe registrar el motivo.
- No se altera la cantidad cotizada sin autorización de una Desviación por Calidad.
- Deben distinguirse cantidad cotizada y recibida; una diferencia física no autoriza una reescritura silenciosa del documento comercial.

## 5. Materiales, lotes y unidades — respuestas 50 y 51

- Cada combinación de Producto + Lote + Empaque ocupa una fila independiente para conservar trazabilidad hasta el certificado.
- Admitir cantidades enteras y decimales según el servicio y su unidad.
- Esterilización por cajas o unidades suele usar enteros; Lavandería e insumos por peso o volumen requieren decimales, por ejemplo 15.5 kg.
- La precisión exacta por unidad no fue fijada; no debe aplicarse un redondeo monetario a cantidades físicas.

## 6. Muestras — respuesta 52

- Retención, cliente y laboratorio representan unidades físicas apartadas para pruebas.
- No se descuentan de la cantidad total procesada; son un dato adicional.
- Cero se conserva como `0`.
- Cuando no aplica, almacenar `NULL` y mostrar `N/A`.
- Esta definición no identifica `NULL` con un dato desconocido: una captura pendiente no debe presentarse como «no aplica» por defecto.

## 7. Empaque y reempaque — respuesta 53

- Inspeccionar integridad, tipo de empaque —por ejemplo Tyvek o PGM— y sellado.
- Logística puede rechazar material con empaque inadecuado.
- El reempaque requiere autorización del Jefe de Logística o Calidad.
- Puede generar un costo adicional al cliente. La respuesta no define su tarifa ni cómo se acepta el cargo; no se incorpora automáticamente a una cotización emitida.

## 8. Transporte — respuesta 54

Es obligatorio registrar transportista propio o externo, nombre del conductor, placa, ruta y prueba de entrega (POD) firmada o fotografiada.

La evidencia de recepción y la prueba de entrega final corresponden a eventos diferentes. El momento preciso en que se exige cada dato debe acompañar a su evento operativo; no se exige una POD final para crear una orden todavía no entregada.

## 9. Estados operativos — respuesta 55

Secuencia principal definida por el negocio:

```text
PENDIENTE_RECOGIDA → EN_TRANSITO → RECIBIDO_PLANTA → EN_PROCESO
→ PROCESADO → EN_DESPACHO → ENTREGADO
```

- Planta maneja `EN_PROCESO`.
- La cuarentena corresponde a Planta/Calidad mientras el material espera su liberación y certificado.
- `PROCESADO` no equivale a autorización de despacho.
- `RECIBIDO_PARCIAL`, establecido en la respuesta 49, requiere una transición complementaria a esta secuencia. No se inventa si regresa a recepción, permite proceso parcial o espera completar la entrega.
- Rechazo, devolución, cancelación y acumulación de recepciones parciales tampoco tienen todavía una secuencia completa definida.

## 10. Control de despacho — respuesta 56

- Bloquear el paso a `EN_DESPACHO` si Calidad no ha emitido y liberado el certificado.
- Única excepción expresamente descrita: urgencia médica con Liberación por Excepción documentada y autorizada directamente por el Gerente de Calidad.
- La excepción debe quedar en auditoría; no equivale a una facultad general para omitir controles.
- La existencia de un PDF por sí sola no acredita liberación.
- El alcance de la liberación para despachos parciales y la regularización posterior de la excepción deben completarse con Calidad.

## 11. Bloqueo y corrección de materiales — respuesta 57

- Una vez que Planta registra un ciclo y el material entra a la máquina, lotes y cantidades quedan bloqueados.
- Un error de digitación posterior requiere Corrección de Desviación.
- Conservar la evidencia original y exigir aprobación del Jefe de Calidad.
- La corrección no autoriza sobrescribir silenciosamente ciclos, materiales o certificados históricos.

La respuesta relaciona registro de ciclo y entrada física a máquina. Si son eventos separados, debe fijarse cuál activa el bloqueo; no se asume que exista una ventana de edición entre ambos.

## 12. Coherencia con otros módulos

Referencias: [Cotizaciones](../comercial/cotizaciones/reglas-de-negocio.md), [Clientes](../comercial/clientes/reglas-de-negocio.md) y [Autenticación y usuarios](../autenticacion-usuarios/reglas-de-negocio.md).

| Punto | Definiciones recibidas y precisión pendiente |
| --- | --- |
| Creación de órdenes | Este módulo exige `ACEPTADA`; Cotizaciones sitúa la emisión después de aceptar y antes del siguiente ciclo. Falta definir si la orden nace antes o después de emitir y si ACEPTADA es un estado actual o una condición histórica. No se elimina ninguna de las dos definiciones. |
| Cantidad cotizada | Logística exige Desviación de Calidad para alterarla; Cotizaciones prohíbe cambiar datos o valores emitidos y exige anular/reemplazar. La autorización de desviación no debe interpretarse como permiso para sobrescribir una emisión. Debe concretarse su enlace con el reemplazo comercial. |
| Recepciones parciales | Comparar recibido con lo esperado para cada orden y entrega evitaría marcar como faltante una división planificada. Es una propuesta: la respuesta original compara con lo cotizado y debe precisarse el denominador operativo. |
| Servicios sin esterilización | Cotizaciones incluye Insumos y Lavandería. La regla de certificado para despacho no establece su tratamiento cuando no corresponde un certificado de esterilización. No se inventa una exención ni se exige un ciclo de esterilización a esos servicios. |
| Autorizadores | Se conservan Jefe de Área, Jefe de Logística, Jefe de Calidad y Gerente de Calidad según cada respuesta. No se consideran cargos equivalentes automáticamente. |
| Notificaciones y evidencias | Se requieren funcionalmente; canal, conservación, acceso y formatos admitidos no se han definido. No se envían notificaciones reales durante esta fase. |

## 13. Alcance de la entrega

Solo se documentan las respuestas y sus dependencias. No se modifica código, base de datos, estados efectivos, órdenes, archivos emitidos ni permisos. Los ocho cuestionarios y sus 100 preguntas se conservan.

Continúa el [Módulo 5 — Planta](../interrogatorio/modulo-5-planta.md), donde deben precisarse asignación de materiales a ciclos, ingreso físico, cantidades parciales y separación entre procesamiento y liberación.
