# Módulo 3 — Cotizaciones: reglas de negocio

Fecha de actualización: 9 de noviembre de 2026.

Estado: incorporadas las respuestas recibidas a las preguntas 21 a 45. La pregunta 29 no contiene respuesta. Las propuestas solicitadas al analista y los detalles pendientes se identifican expresamente; no constituyen funcionalidad implementada ni decisiones ya aprobadas.

Fuente principal: `Módulo 3 - Cotizaciones.md`, entregado por el usuario desde `C:\Users\urria\Downloads`.

Referencias: [cuestionario original](../../interrogatorio/modulo-3-cotizaciones.md), [Autenticación y usuarios](../../autenticacion-usuarios/reglas-de-negocio.md) y [Clientes](../clientes/reglas-de-negocio.md). Las respuestas recientes precisan el flujo comercial y prevalecen sobre propuestas anteriores cuando difieran.

## 1. Alcance y servicios — respuestas 21 a 24

### Decisiones recibidas

- El análisis comprende todos los productos y servicios. Se levanta la exclusión temporal de Insumos para esta fase de análisis.
- Se incorpora al alcance funcional un módulo de Productos, con carga del catálogo mediante Excel.
- Cada servicio corresponde a un proceso diferente. Industrial EtO, Farmacéutico y Fabricante no deben tratarse como simples etiquetas intercambiables del cliente.
- Una cotización puede combinar varios servicios diferentes.
- Debe admitir productos o servicios del catálogo y otros conceptos añadidos manualmente como ítems, aunque no estén en el Excel.

### Propuesta de organización

- Mantener una cabecera comercial por cotización y un detalle de ítems con su producto o servicio, proceso, descripción, unidad, cantidad, precio y descuento.
- Ofrecer búsqueda de productos y servicios del catálogo y una acción explícita para agregar un ítem manual.
- Un ítem manual pertenece inicialmente a la cotización; su creación no debe publicar automáticamente una nueva referencia en el catálogo general.
- Conservar la referencia al catálogo y una copia de los datos cotizados. Los cambios posteriores de catálogo no deben alterar una cotización emitida.
- Identificar el proceso correspondiente a cada ítem para permitir posteriormente su distribución a las áreas operativas.

La respuesta 24 confirma la combinación de conceptos del catálogo y adicionales, pero no resuelve si existen cotizaciones como listas de tarifas sin cantidades comprometidas. No se equipara «servicio fijo» con una modalidad de tarifa determinada.

### Dependencia del nuevo módulo de Productos

El catálogo requiere definir estructura, unidades, identificación de referencias, precios, estados y conciliación de importaciones. El Excel de productos no se adjuntó en esta entrega: no se presumen sus columnas ni sus datos. Esta ampliación de alcance no autoriza implementación ni añade preguntas a los ocho cuestionarios originales.

## 2. Unidades y cantidades — respuesta 25

El usuario solicita una propuesta dependiente del proceso y servicio. Se propone:

| Tipo de unidad | Regla inicial propuesta |
| --- | --- |
| Prenda, unidad, caja y ciclo completo | Cantidad entera positiva, cuando el concepto se facture por unidades indivisibles. |
| Kilogramo, litro y otras magnitudes medibles | Cantidad decimal positiva con precisión configurada por concepto. |
| Servicio global o paquete | Unidad explícita de servicio; cantidad 1 cuando se contrate el paquete completo. |
| Capacidad de equipo | Dato separado de la cantidad facturable, salvo que la tarifa se defina expresamente por capacidad. |

- El catálogo debe indicar qué unidad y precisión corresponden a cada producto o servicio.
- Los ítems manuales deben elegir una unidad válida y respetar su precisión.
- La ausencia de centavos en importes monetarios no obliga a eliminar decimales de peso, volumen u otras cantidades.
- Conversiones como prendas por caja o precio por litro deben estar identificadas; no se deducen únicamente de la descripción.

Esta tabla es una propuesta para validar con los procesos reales. No establece parámetros técnicos de esterilización ni tarifas operativas.

## 3. Precios, descuentos e IVA — respuestas 26 a 29

### Decisiones recibidas

- Los precios pueden variar según el cliente; no existe un único precio obligatorio para todos.
- El asesor debe poder seleccionar productos o servicios mediante búsqueda y preparar precios específicos para la cotización.
- El descuento se aplica por ítem, porque algunos servicios pueden tenerlo y otros no.
- Los descuentos aplicados deben detallarse en la cotización.
- El IVA no debe alterarse como parte de la negociación comercial.
- Los importes mostrados deben expresarse sin centavos, por ejemplo `1.540.550`, no `1.540.550,03`.

No se han definido precios mínimos, márgenes ni umbrales de descuento. La revisión del jefe es obligatoria según el flujo general, pero no se inventan límites adicionales.

### Propuesta de cálculo y presentación

1. Seleccionar el precio correspondiente al cliente o capturar el precio propuesto para el ítem.
2. Calcular el importe bruto del ítem a partir de cantidad y precio unitario.
3. Aplicar un único descuento por ítem: porcentaje o importe, identificando su modalidad. Evitar aplicar simultáneamente ambos por error.
4. Mostrar importe bruto, descuento e importe neto de cada ítem.
5. Incluir transporte cobrado como un concepto separado, cuando corresponda, para evitar cargos invisibles o dobles.
6. Aplicar el tratamiento fiscal autorizado a la base que corresponda y calcular el total. La secuencia fiscal definitiva depende de resolver la pregunta 29; este documento no determina tratamientos tributarios.

Como validaciones de diseño se proponen porcentajes de descuento entre 0 y 100 y un importe de descuento que no supere el bruto del ítem. No son topes de política comercial aprobados.

### Redondeo propuesto

- Conservar precisión decimal durante el cálculo y evitar truncar cantidades o porcentajes.
- Como criterio inicial, redondear los importes netos visibles de cada ítem a la unidad monetaria más cercana y sumar esos importes para obtener un subtotal conciliable con las filas impresas.
- Presentar impuestos y total sin centavos, con una política fiscal y de redondeo única que haga coincidir formulario, servidor y PDF.
- Identificar el importe de descuento visible de forma que bruto, descuento y neto cuadren; no limitarse a ocultar decimales de importes que luego no suman.
- Definir los casos de empate de redondeo y las reglas por moneda antes de implementar. La respuesta confirma la presentación sin centavos, no este algoritmo propuesto.

### IVA: punto sin respuesta

La pregunta 29 sobre tratamientos distintos de IVA y excepciones tributarias quedó sin respuesta. No se concluye que todos los ítems tengan la misma tasa ni se presupone exención por cliente extranjero o moneda.

«El IVA no se puede tocar» se registra como una restricción de la negociación comercial, no como prohibición de administrar una configuración fiscal autorizada. Las facultades de administración fiscal y las excepciones requieren definición expresa; no se concede al asesor modificar tasas o importes fiscales libremente.

## 4. Moneda e idioma — respuesta 30

### Decisión recibida

La moneda con la que paga el cliente se define en su catálogo o ficha y depende del cliente.

### Propuesta de análisis

- Usar la moneda configurada del cliente como valor inicial de una nueva cotización.
- Identificar expresamente la moneda del documento; no mezclar importes de monedas distintas en un total.
- Si hay conversión, conservar moneda de origen, moneda de destino, tasa, fecha y responsable de la tasa aplicada.
- Congelar moneda y conversión en la versión comercial aprobada y emitida; no recalcular históricos al modificar la ficha del cliente.

No se ha definido la fuente de la tasa de cambio, quién la autoriza ni cuándo se fija inicialmente. La respuesta tampoco confirma un selector de idioma: el ejemplo en inglés constituye una necesidad por analizar, no una decisión de traducción automática o soporte bilingüe.

## 5. Alternativas excluyentes — respuesta 31

El usuario confirma que una cotización puede ofrecer alternativas y solicita detallarlas.

Se propone organizar alternativas identificadas —por ejemplo A y B— con sus propios ítems, descuentos, totales y condiciones cuando difieran. La aceptación debe indicar cuál se seleccionó y sobre qué versión se tomó la decisión.

Las alternativas excluyentes no se suman como si el cliente hubiera contratado todas. Las operaciones posteriores deben recibir únicamente la alternativa aceptada. Los conceptos opcionales o combinables deben diferenciarse de alternativas excluyentes; sus combinaciones permitidas aún no están definidas.

## 6. Aprobación, envío, aceptación y emisión — respuestas 32 a 35

### Decisiones recibidas

- El gerente comercial o administrador del área correspondiente aprueba la cotización para enviarla al cliente.
- Quien crea la cotización no la aprueba. Tener varios roles no elimina esta separación de personas.
- La cotización se envía al cliente después de la aprobación interna.
- Si el cliente acepta, se emite y pasa al siguiente ciclo operativo.
- Si el cliente no acepta, la respuesta indica anularla.
- Según el Módulo 1, el asesor realiza la emisión al área correspondiente y solicita las anulaciones con observación para aprobación del administrador del área.

Se conserva la precisión del usuario «si no estoy mal es así» de la respuesta 32. La respuesta 35 reitera aceptación antes de emisión; por tanto esa secuencia es la base de este análisis, sin dar por definidos todos los estados de excepción.

### Flujo propuesto a partir de las respuestas

| Etapa propuesta | Responsable o condición | Resultado |
| --- | --- | --- |
| BORRADOR | Asesor comercial | Captura y ajuste de datos, ítems y condiciones. |
| EN_REVISION | Asesor solicita revisión al jefe | Versión identificable lista para revisión. |
| APROBADA_INTERNA | Gerente comercial o administrador autorizado, distinto del creador | Autorización de la propuesta para enviarla al cliente. |
| ENVIADA | Registro del envío de la versión aprobada | Cliente recibe una propuesta identificable. |
| ACEPTADA_CLIENTE | Registro de aceptación y alternativa elegida, si aplica | Se habilita la emisión operativa. |
| EMITIDA | Asesor autorizado, después de la aceptación | Documento inmutable y paso al proceso siguiente. |
| ANULACION_SOLICITADA | Asesor registra observación | Pendiente de decisión del administrador del área. |
| ANULADA | Administrador autorizado aprueba la solicitud | Original conservado con trazabilidad. |

Los nombres de estados son una propuesta documental, no una migración del sistema actual. La respuesta 33 delega su organización al analista.

- El rechazo expreso del cliente puede iniciar la solicitud de anulación; no debe saltarse la aprobación exigida en el Módulo 1.
- La falta de respuesta no se equipara automáticamente a rechazo ni a anulación.
- Devoluciones internas a corrección, vencimientos, denegación de anulación y tratamiento de operaciones ya iniciadas requieren completar las transiciones con los módulos afectados.
- La cotización con varios servicios no implica por sí sola varias aprobaciones de área. La regla para ese caso aún no fue especificada.

### Documento enviado frente a emisión operativa

El cliente necesita recibir una propuesta antes de aceptarla. Por tanto, el envío o generación de esa propuesta y la emisión posterior que activa el proceso son eventos distintos en el flujo solicitado.

Se propone conservar una versión aprobada identificable para envío y registrar después su aceptación y emisión operativa. No debe marcarse automáticamente como emitida al descargar o enviar el PDF. La relación exacta entre ese PDF de propuesta, el documento emitido y sus fechas queda por concretar, especialmente por la vigencia descrita en la sección 10.

### Evidencia de aceptación

La respuesta 35 confirma el orden del flujo, pero no indica si la evidencia será correo, orden de compra, firma o registro manual. Se propone registrar como mínimo fecha, responsable, medio, referencia a la versión y alternativa aceptada. No se declara obligatorio un adjunto, una firma o un canal que el usuario no haya definido.

## 7. Correcciones posteriores a emisión — respuesta 36

### Decisiones recibidas

- Una cotización emitida no admite cambios de datos ni valores.
- Si necesita corrección, se anula y se reemplaza.

### Propuesta de trazabilidad

- Conservar documento original, datos congelados, motivo, solicitante y aprobación de anulación.
- Vincular la nueva cotización con la que reemplaza, sin sobrescribirla ni reutilizar su archivo.
- Aplicar a la sustituta el flujo de revisión y aceptación correspondiente.
- Reconciliar órdenes ya creadas antes de continuar con la sustituta. No cancelar, transferir ni recrear automáticamente operaciones de otros módulos.

Cambiar precios del catálogo, moneda o datos del cliente tampoco debe modificar una emisión anterior. Para cambios de la propuesta aprobada pero no emitida se propone nueva revisión interna; su mecanismo definitivo aún no está establecido.

## 8. Consecutivos, prefijos y revisiones — respuesta 37

La numeración depende del proceso. El usuario aporta `COT-MED-001-1` como ejemplo, sin definir el significado de cada segmento.

Se propone una política configurable por proceso que documente prefijo, secuencia y, si aplica, revisión. No se interpreta el último `-1` automáticamente como versión, sede o alternativa.

Permanecen sin definir el momento de asignación, reinicios, relación entre reemplazo y revisión, y el prefijo de una cotización con varios servicios. No se debe adoptar silenciosamente el prefijo del primer ítem ni renumerar históricos.

## 9. Condiciones comerciales obligatorias — respuestas 38 y 44

### Decisiones recibidas

- Los seis campos deben diligenciarse; el formulario debe permitir capturarlos por separado.
- Los asesores redactan las condiciones y el jefe del área Comercial las valida.
- El PDF debe imprimir cada valor junto a su rótulo exacto, en este orden:

1. TIEMPO DE DESPACHO
2. TRANSPORTE
3. FORMA DE PAGO
4. VALIDEZ DE LA OFERTA
5. EL PRECIO INCLUYE
6. EL PRECIO NO INCLUYE

Se propone impedir el envío a revisión y las etapas posteriores con condiciones vacías. Para conciliar esta obligación con la recuperación del trabajo solicitada en el Módulo 1, un avance incompleto podría guardarse como borrador señalado como incompleto; esto es una propuesta, no una autorización expresa del usuario para omitir campos al guardar.

El uso de `N/A` fue indicado para Observaciones en la respuesta 45. No se extiende automáticamente a los seis campos obligatorios.

Para textos extensos se propone respetar saltos de línea, permitir varias páginas y conservar rótulo y contenido legibles, sin recortar ni reducir el texto hasta hacerlo ilegible. Las sugerencias de texto por servicio pueden ayudar al asesor, pero no sustituyen su revisión ni la validación del jefe.

## 10. Propuesta de captura de cada condición — respuestas 39 a 43

### TIEMPO DE DESPACHO

Decisión: se redacta como texto por Comercial.

Propuesta: editor multilínea con una guía para indicar servicio, plazo, días hábiles o calendario, evento inicial y dependencias. Admitir apartados distintos para producto, laboratorio e informe cuando tengan plazos diferentes. La guía no debe imponer un plazo único a todos los servicios.

### TRANSPORTE

El usuario considera pertinente registrar y controlar las condiciones del transporte.

Propuesta: registrar quién presta y paga, origen y destino, cobertura, recogida o entrega, condiciones de monto y posibles exclusiones. El texto acordado se imprime en la tabla comercial.

Si se cobra transporte, debe existir un ítem explícito asociado; el importe no se calcula interpretando texto libre. Si está incluido en otros precios, indicarlo y evitar un segundo cargo. El control operativo se desarrollará en Logística.

### FORMA DE PAGO

Decisión: admitir acuerdos variables, por ejemplo 50 % y 50 %, o 30 % y 70 %.

Propuesta: definir etapas con porcentaje y evento de exigibilidad —anticipo, entrega u otro acordado— y generar un resumen revisable por el asesor. Si las etapas distribuyen todo el precio, comprobar que sumen 100 %. La captura de plazos debe indicar desde qué evento se cuentan.

No se ha autorizado bloquear operaciones por falta de pago ni se ha definido un módulo de recaudo. El acuerdo contractual y la comprobación real del pago deben mantenerse como conceptos distintos.

### VALIDEZ DE LA OFERTA

Decisión expresada: inicio relacionado con la emisión y plazo de hasta 30 días. El ejemplo es del 25 de noviembre al 25 de diciembre; no debe limitarse al mes de creación.

Propuesta: almacenar fecha inicial, duración y fecha final explícitas y mostrar el intervalo en el PDF. Usar 30 días calendario como valor inicial es una propuesta; no sustituirlo por «el mismo día del mes siguiente», porque no siempre equivale a 30 días.

Punto de coherencia pendiente: la propuesta se envía antes de que el cliente acepte, y la emisión operativa ocurre después de aceptar. Si la vigencia empieza únicamente al emitir, no define hasta cuándo puede aceptarse la propuesta enviada. Debe precisarse si «emisión» en esta respuesta alude a la expedición de la propuesta aprobada o a la emisión operativa posterior. No se cambia silenciosamente la fecha inicial a creación o envío.

Tampoco se ha definido la hora límite, inclusión del último día ni autorización de prórrogas. El ejemplo por sí solo no resuelve esos detalles.

### EL PRECIO INCLUYE / EL PRECIO NO INCLUYE

Decisión: dos textos libres separados, redactados por Comercial y revisados por su jefe.

Propuesta: permitir párrafos o listas legibles, con ejemplos de servicios, materiales, empaques, análisis y entregables. Señalar al revisor la necesidad de comprobar correspondencia con los ítems y condiciones de transporte. No modificar precios, impuestos o alcance automáticamente a partir del texto ni prometer detección automática de contradicciones.

## 11. Observaciones e históricos — respuesta 45

### Decisión recibida

Cuando corresponda, diligenciar Observaciones; cuando no aplique, colocar `N/A`.

### Propuesta

- Mantener Observaciones como apartado adicional a las seis condiciones, sin usarlo para sustituirlas.
- Representar «no aplica» explícitamente con `N/A`; no confundirlo con un campo olvidado.
- No repartir automáticamente el antiguo texto general entre los seis campos. Los borradores existentes podrían requerir clasificación manual al retomarlos.
- Conservar intactos los textos, datos y PDF históricos emitidos.

La respuesta define el uso futuro de Observaciones, pero no aprueba una migración de los textos generales ya almacenados. Esa clasificación sigue siendo una propuesta para borradores.

## 12. Resumen de decisiones pendientes y alcance

| Tema | Estado de definición |
| --- | --- |
| Productos e importación de catálogo | Incluidos en el análisis; falta contrastar el Excel y definir su estructura. |
| Unidades, precisión y descuentos | Propuestas en este documento; falta validación de reglas por proceso. |
| IVA por ítem y excepciones | Pregunta 29 sin respuesta; no se presume un tratamiento. |
| Moneda, cambio e idioma | Moneda vinculada al cliente; fuente de cambio, autorizaciones e idioma no definidos. |
| Alternativas | Admitidas; propuesta de selección y totales separados. |
| Evidencia de aceptación | Secuencia confirmada; medio y soporte no definidos. |
| Estados excepcionales y efectos operativos | Propuestos para completar con las áreas afectadas. |
| Numeración de cotizaciones mixtas y reemplazos | Sin regla definitiva. |
| Vigencia | Hasta 30 días; debe conciliarse el evento inicial con envío, aceptación y emisión. |
| Recuperación de borradores incompletos | Propuesta para conciliar continuidad de trabajo y obligatoriedad de condiciones. |

Solo se actualiza documentación. No se modifica código de producción, permisos efectivos, precios, impuestos, bases de datos ni documentos emitidos. Los cuestionarios mantienen sus 100 preguntas originales.

La siguiente etapa de respuestas corresponde al [Módulo 4 — Logística](../../interrogatorio/modulo-4-logistica.md). Debe considerar las cotizaciones con múltiples servicios, la alternativa aceptada, la emisión posterior a aceptación y la coordinación del transporte.
