# Módulo 2 — Clientes: reglas de negocio

Fecha de actualización: 9 de noviembre de 2026.

Estado: respuestas 11 a 20 incorporadas. Documento de análisis de negocio; no certifica implementación ni modifica datos de clientes.

Fuente principal: archivo entregado por el usuario `Módulo 2 -Clientes.md`, ubicado en `C:\Users\urria\Downloads`. Se distinguen las decisiones expresas de las propuestas solicitadas al analista y de los detalles aún no especificados.

Las preguntas originales se conservan en el [cuestionario del Módulo 2](../../interrogatorio/modulo-2-clientes.md). La organización y los permisos generales se complementan con las [reglas del Módulo 1](../../autenticacion-usuarios/reglas-de-negocio.md).

## 1. Identificación y tipos de cliente — respuestas 11 y 12

### Decisiones recibidas

- Admitir distintos tipos de identificación: CC, NIT, CE, PET y otros que correspondan.
- Se conserva literalmente la denominación «PET» del usuario; no se sustituye por otra sigla por suposición.
- La identificación puede llegar con distintas presentaciones desde Excel. Los ejemplos dados son `100300654` para cédula y `789.987.675-1` para NIT.
- Los ejemplos describen presentación, no acreditan que un número sea válido.

### Propuesta de análisis

- Separar el tipo de documento de su número; no presentar todas las identificaciones como NIT.
- Tratar los identificadores como texto para conservar ceros iniciales y evitar conversiones numéricas de Excel.
- Normalizar la identificación según su tipo para comparar duplicados, conservando el valor original importado como evidencia de origen.
- Para NIT, distinguir número y dígito de verificación; las diferencias de puntos, espacios o guiones no deberían crear clientes distintos.
- No inferir automáticamente el tipo de documento solo por su longitud o apariencia. Una identificación ambigua debe quedar para revisión.

No se ha confirmado una regla obligatoria de validación del dígito de verificación, el catálogo completo de identificaciones ni la correspondencia de cada tipo con personas naturales, entidades públicas o clientes extranjeros. No se declaran requisitos legales a partir de estos ejemplos.

## 2. Unicidad del cliente — respuesta 13

### Decisiones recibidas

- El NIT identifica de forma única al cliente en este sistema.
- Un cambio de razón social no implica crear un segundo cliente con el mismo NIT.
- No se deben registrar clientes duplicados bajo un mismo NIT.

### Propuesta de análisis

- Ante un NIT ya registrado, reutilizar el registro existente o presentar su actualización para revisión; no crear otra ficha.
- Para identificaciones distintas de NIT, utilizar tipo y número normalizado como criterio de comparación, sujeto a la definición del catálogo.
- No usar únicamente la razón social como identificador: puede cambiar y también puede coincidir entre registros distintos.
- Si una identificación viene incompleta o contradictoria, no fusionar registros automáticamente.

La afirmación del usuario se documenta como regla de unicidad del sistema, no como una conclusión jurídica sobre estructuras empresariales.

## 3. Direcciones, sedes y verificación — respuesta 14

### Decisiones recibidas

- La información utilizada dependerá de los datos efectivamente registrados para cada cliente.
- La importación debe agilizar la captura, pero exige validar cliente por cliente que la información sea verídica.
- Importar una fila no equivale a validar automáticamente su contenido.

### Propuesta de análisis

- Distinguir el origen importado del estado de revisión del cliente; conservar quién revisó los datos y cuándo.
- Presentar la información consolidada al asesor para su revisión antes de considerarla validada.
- Mantener una dirección principal y permitir direcciones adicionales identificadas por uso cuando los datos reales lo requieran.
- Seleccionar de manera explícita la dirección pertinente para cada documento u operación; no inventar direcciones de recogida, entrega o facturación.

La respuesta no confirma múltiples sedes ni determina qué dirección debe imprimirse en cada documento. Esa capacidad queda como propuesta condicionada a los datos y flujos reales.

## 4. Contactos — respuesta 15

El usuario solicita una definición basada en el análisis. La siguiente es una propuesta, no una decisión previamente expresada:

- Usar un contacto principal por cliente como opción predeterminada para cotizaciones.
- Permitir contactos adicionales opcionales cuando una empresa tenga interlocutores distintos para compras, pagos, recepción o Calidad. No exigir crear uno por cada función.
- Cada contacto tendría nombre, cargo o función, teléfono y correo según la información disponible.
- Permitir seleccionar el destinatario de una cotización; inicialmente se propone el contacto principal.
- Conservar los datos del destinatario dentro del documento al congelarlo, de modo que cambiar un contacto no reescriba documentos históricos.

Ejemplo: la cotización puede dirigirse a Compras y la recogida coordinarse con Recepción. Si una misma persona realiza ambas funciones, basta con un solo contacto.

## 5. Datos mínimos y uso de Excel — respuesta 16

### Decisiones recibidas

- La base Excel es la referencia de partida para capturar clientes.
- El usuario solicita analizar esos datos para definir el conjunto de campos y su obligatoriedad.

### Propuesta inicial, pendiente de contrastar con el Excel real

| Momento | Criterio propuesto |
| --- | --- |
| Previsualizar una importación | Mostrar también las filas incompletas, sus valores originales y observaciones, sin inventar datos. |
| Crear una ficha utilizable | Contar con nombre o razón social, tipo y número de identificación revisados, y resolver duplicados. |
| Preparar una cotización | Seleccionar el cliente y destinatario; señalar datos incompletos necesarios para el formato concreto. |
| Aprobar o emitir | Validar los campos exigidos por el formato y el proceso acordado; conservar los datos utilizados en el documento. |
| Programar recogida o entrega | Disponer de dirección y contacto operativos adecuados, definidos junto con Logística. |

No se adjuntó el Excel en esta entrega y no se encontraron archivos Excel o CSV en las carpetas documentales revisadas. Por ello, esta actualización no presenta como verificados sus encabezados, tipos, calidad ni campos obligatorios definitivos.

El importador y el modelo actuales usan razón social, identificación, contacto, teléfono, correo y dirección, además de cargo y ciudad. Ese esquema técnico es un antecedente, no una sustitución del análisis solicitado del Excel.

## 6. Edición, activación y conservación — respuesta 17

### Decisiones recibidas

- Los asesores comerciales crean clientes, consultan sus datos y deben disponer de acciones para editarlos, activarlos e inactivarlos conforme a los permisos del área.
- Los clientes no se eliminan, para conservar la trazabilidad necesaria en auditorías.
- La inactivación no debe borrar el registro ni romper sus relaciones históricas.

### Propuesta de análisis

- Registrar autor, fecha y valores anteriores y nuevos de las modificaciones.
- Solicitar motivo para inactivación, reactivación y correcciones de identificación.
- Ante una corrección de identificación, comprobar duplicados y revisar el impacto; no fusionar clientes ni reasignar documentos silenciosamente.

La respuesta no exige una aprobación adicional para toda edición ni detalla soportes obligatorios. No se incorpora ese requisito como decisión confirmada.

## 7. Cambios en datos y documentos — respuesta 18

### Decisiones recibidas

- Los documentos aprobados y emitidos conservan sus datos: no deben cambiar por modificaciones posteriores del cliente.
- En borrador se pueden corregir datos del cliente mal redactados.
- La actualización de la ficha del cliente no autoriza a reescribir documentos históricos.

### Propuesta de análisis

- Conservar una copia de los datos utilizados en el documento cuando alcance el estado que impide modificaciones.
- Si la ficha cambia mientras hay borradores, mostrar la diferencia y permitir al asesor incorporar la corrección de forma explícita.
- Diferenciar una corrección de la ficha maestra de un cambio específico del destinatario o dirección de un borrador.

La respuesta no determina si el congelamiento empieza con la aprobación o únicamente después de emitir, ni cómo se corrige un documento aprobado que todavía no se ha emitido. El límite exacto se alineará con los estados del Módulo 3, sin debilitar la conservación de los documentos históricos.

## 8. Importación, duplicados y complementación — respuesta 19

### Decisiones recibidas

- Los duplicados se omiten como nuevas altas.
- Se permite cruzar información complementaria: por ejemplo, una fila sin teléfono y otra con el teléfono del mismo cliente.
- La información resultante sigue requiriendo la validación cliente por cliente indicada en la respuesta 14.

### Propuesta de conciliación

1. Leer y conservar los datos de origen y la referencia a la fila.
2. Comparar identificaciones normalizadas para detectar que las filas pertenecen al mismo cliente.
3. Consolidar valores complementarios cuando un campo está vacío y existe un valor no contradictorio en otra fila del mismo cliente.
4. Mostrar los campos completados y sus fuentes para revisión del asesor.
5. Si hay valores diferentes no vacíos, presentar el conflicto y conservar la información existente hasta resolverlo; no sobrescribirla automáticamente.
6. Si solo coincide la razón social y falta una identificación consistente, señalar una posible coincidencia para revisión, sin fusionar automáticamente.
7. Informar por separado altas, duplicados omitidos, complementaciones propuestas y filas con errores o conflictos.

Ejemplo de complementación: dos filas con el mismo NIT normalizado, una sin teléfono y otra con teléfono. Ejemplo de conflicto: el mismo NIT con dos teléfonos diferentes; la selección del valor no se decide por el orden de las filas.

El usuario no definió si la importación debe confirmarse de forma parcial o atómica ni si este cruce puede actualizar automáticamente clientes ya persistidos. La propuesta mantiene revisión explícita antes de aplicar cambios sobre fichas existentes.

## 9. Inactividad y bloqueos — respuesta 20

### Decisiones recibidas

- Deben contemplarse clientes inactivos y bloqueos cuando el proceso correspondiente aplique.
- La respuesta admite estas capacidades, pero no define todavía sus efectos por motivo.

### Propuesta de análisis

- Distinguir la inactividad general de un bloqueo operativo específico, por ejemplo de cartera, documentación o Calidad.
- Conservar motivo, responsable, fecha y levantamiento del bloqueo.
- Mantener accesibles los registros históricos según los permisos, aunque el cliente esté inactivo o bloqueado.
- Definir para cada motivo qué acciones se impiden y quién puede levantarlo o autorizar una excepción, junto con el módulo responsable.

No se asume que cualquier bloqueo impida automáticamente todas las operaciones ni se inventan umbrales de cartera o autoridades de excepción.

## 10. Brechas visibles y continuidad

La revisión estática del modelo actual muestra un campo único `nit`, un contacto y una dirección por cliente; la entidad revisada no contiene estado de activación, tipos de identificación ni bloqueos. El DTO exige varios campos de contacto, pero no valida el dígito de verificación del NIT. Estos son aspectos a reconciliar en una futura implementación, no cambios realizados en esta fase.

Se preservan las 100 preguntas originales y las reglas del Módulo 1. No se modifican código de producción, base de datos, importaciones ni documentos emitidos.

El siguiente bloque corresponde al [Módulo 3 — Cotizaciones](../../interrogatorio/modulo-3-cotizaciones.md). Al analizarlo deben respetarse las decisiones ya recibidas: múltiples servicios en una cotización, aprobación del jefe, emisión por el asesor, solicitud de anulación con observación y conservación de los datos históricos del cliente.
