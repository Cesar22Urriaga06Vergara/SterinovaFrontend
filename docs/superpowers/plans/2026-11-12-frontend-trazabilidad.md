# Plan frontend — trazabilidad operativa Sterinova

Fecha: 12 de noviembre de 2026. Entrega documental; no implementación. Las rutas y componentes nuevos son propuestas de diseño. Las reglas finales de esta conversación prevalecen sobre los documentos anteriores.

## Objetivo y límites

Permitir que cada área ejecute su tarea y consulte el recorrido de materiales por cantidades, conservando documentos históricos y separando el acuerdo comercial inmutable de los hechos operativos. Se implementará por entregas verticales con el backend, no como rediseño aislado de pantallas.

Se mantienen Next.js 16.4.5, React 19.3, TypeScript, Tailwind y Axios existentes. No introducir una biblioteca de componentes o estado global sin necesidad demostrada. Leer la documentación Next local indicada por AGENTS.md al implementar. Siigo es el origen comercial previsto por el usuario: no se afirma que exista integración ni se implementan credenciales o sincronización en este plan.

## Evidencia inspeccionada y brechas

| Fuente actual | Evidencia | Cambio necesario |
| --- | --- | --- |
| src/lib/navigation.ts | Rutas por áreas; permisos con coincidencia por prefijo | Añadir permisos específicos para recetas, microbodega, novedades, rutas y expedientes; conservar entradas existentes. |
| src/app/(erp)/comercial/cotizaciones/CotizacionesClient.tsx | Acciones emitir/aprobar, estados APROBADA y borrador | Expresar revisión, devolución a corrección y emisión; asesor nunca ve Aprobar. |
| src/app/(erp)/logistica/page.tsx | Formulario/modal genera orden desde cotizaciones-aprobadas; materiales editables y avance lineal | Bandeja de trabajos emitidos, rutas multicliente, recepción real y movimientos parciales. |
| src/app/(erp)/planta/page.tsx y src/lib/planta-types.ts | Ciclo enlazado a orden_id único; nuevo ciclo desde orden | Programación multicliente con asignación de cantidades, tandas y versiones de recetas. |
| src/app/(erp)/calidad/page.tsx | Cliente inferido desde ciclo.orden.cotizacion | Agrupar expediente por ciclo y clientes; certificados separados, investigaciones y liberaciones parciales. |
| src/lib/operational-types.ts | MaterialRecibido contiene cantidad única | Contratos para cantidades por movimiento, ubicación, retención y saldo disponible. |
| src/lib/api.ts | Axios de navegador, token e interceptor de errores | Reutilizar; evitar llamadas autenticadas desde servidor mediante este cliente; errores de formulario no dependerán solo del toast. |
| src/components/ui/Modal.tsx y ui/states | Diálogo con foco/escape y estados compartidos | Reutilizar para acciones breves; operaciones extensas en páginas dedicadas. |
| tailwind.config.ts y src/app/globals.css | Tokens de marca y semánticos; base Arial | Conservar identidad, ampliar estados semánticos sin mezclar estilos nuevos. |

Inspección estática: no acredita comportamiento en navegador ni tests ejecutados. Existen pruebas unitarias y E2E relacionadas; el plan amplía esas bases.

## Arquitectura de información y rutas

Todas las URLs siguientes viven bajo el layout autenticado (erp). Los detalles se abren con enlace permanente, filtros en URL y retorno a la bandeja conservando búsqueda/página.

| Área | Reutilizar | Rutas nuevas propuestas |
| --- | --- | --- |
| Comercial | /comercial, /comercial/clientes, /comercial/cotizaciones, nueva y [id]/editar | /comercial/servicios; /comercial/cotizaciones/[id]; /comercial/trabajos/[id]; /comercial/diferencias |
| Logística | /logistica | /logistica/rutas; /logistica/rutas/[id]; /logistica/recepciones/[id]; /logistica/trabajos/[id]; /logistica/despachos/[id]; /logistica/novedades |
| Planta | /planta; conservar acceso a ciclos históricos | /planta/recetas; /planta/recetas/[id]; /planta/tandas/[id]; /planta/microbodega; /planta/solicitudes/[id]; /planta/ciclos/[id]; /planta/novedades |
| Calidad | /calidad, /calidad/revisar/[ciclo_id], /calidad/certificados/[id] | /calidad/investigaciones; /calidad/investigaciones/[id]; /calidad/retenciones; /calidad/recetas |

Novedades es un dominio compartido presentado en cada área, no tres copias del incidente. Un expediente transversal reutilizable se presenta dentro de las rutas autorizadas de cada área. Las rutas son propuesta; sus contratos deben congelarse junto al backend en F0.

## Lenguaje visual y componentes

Mantener base blanca/gris y navegación verde oscuro #0c4a4e; usar tokens existentes primary #b83b14, secondary #0f6b70, success #166534, warning #854d0e y error #b91c1c. El naranja identifica acción principal, no adorno. Usar Arial existente, cifras tabulares en cantidades e importes, alineación textual izquierda y numérica derecha. No modificar tipografía de PDF al cambiar UI.

Diseñar para escritorio operativo y tablet; la consulta y captura simple funcionan a 360 px. Formularios extensos se agrupan en secciones. Tablas con desplazamiento horizontal solo donde la comparación lo necesita, encabezados legibles y primera columna identificable. En móvil mostrar resumen por material y detalle expandible sin ocultar acciones esenciales. No depender de arrastrar para asignar cargas: selección y campo de cantidad sirven con teclado.

Componentes propuestos compartidos: ExpedienteHeader (identidad y estados separados), QuantityLedger (movimientos y saldos), CustodyTimeline (hechos con origen), MaterialAllocationTable, HoldBanner (alcance/motivo), EvidenceList, DocumentHistory, FieldErrorSummary y MutationConflictPanel. Reutilizar Button/Input/Select/Modal/Badge y estados existentes. Extraer componentes por dominio, no un formulario universal lleno de condiciones.

Operación, Calidad y situación comercial son estados separados. Una barra de pasos orienta, pero no falsea un trabajo parcialmente en varias ubicaciones. Mostrar «600 en Planta · 400 pendientes», no «en Planta» para todo. Cantidades procesadas/certificadas son hitos, no saldos sumables con existencias actuales. Cajas y unidades aparecen en columnas diferentes.

## Contratos y reglas comunes

- El servidor es fuente de saldos, permisos, bloqueos, precios y transiciones. El frontend presenta validaciones tempranas sin sustituir la autorización backend.
- Tipos nuevos por dominio para trabajo, recepción, movimiento de custodia, tanda, asignación de ciclo, transferencia de insumos, investigación y certificado por cliente. Mantener adaptadores explícitos para históricos con datos incompletos; mostrar «No registrado», no cero inventado.
- Listados paginados con filtros cliente/trabajo/fecha/estado/área y búsqueda; detalle devuelve saldos con unidad, versión y acciones permitidas. Decimales preservados según contrato, sin redondeo monetario de cantidades.
- Operaciones mutables envían versión y clave de idempotencia acordada con backend. Deshabilitar doble envío; ante timeout consultar resultado antes de repetir. Conflicto 409 conserva entrada local y permite comparar/recargar, nunca sobrescribe automáticamente.
- Validación devuelve errores por campo/línea. 401 recupera sesión; 403 muestra falta de autorización; 404 registro no disponible; fallo de red conserva datos no enviados durante la sesión. No prometer ejecución offline ni sincronización automática.
- Evidencias con progreso, error y reintento; límites/tipos vienen del contrato. PDF se obtiene autenticado mediante blob, reutilizando patrón actual; historial inmutable diferenciado de vista previa.
- Ninguna cantidad real recalcula cotización emitida. Mostrar valores aprobados en solo lectura para Logística y Planta. Ajuste por diferencia es gestión separada de Comercial, no botón de recalcular acta.

## Hitos F0–F8 y aceptación

Correspondencia directa: F0/B0/H0 hasta F8/B8/H8 del plan backend y hoja de ruta común. F8 incluye despacho y aceptación integral.

### F0 — Contratos, permisos y caso completo

- [ ] Comparar los contratos existentes con el plan backend; congelar rutas, payloads de movimientos, unidades, errores, acciones permitidas y esquema de saldos.
- [ ] Preparar datos ficticios: clientes A/B, cotización con 15 servicios reducida a 8, recepción 1.000, novedad 10, procesamiento 990, partes 600/390 y ciclo compartido.
- [ ] Establecer permisos nuevos sin basarse en nombre de usuario; verificar asesor sin aprobar, jefe Planta recetas y Calidad liberaciones.
- [ ] Acordar mapa de rutas y validar bocetos con los responsables de cada área. Gate: cada acción UI tiene un contrato y propietario; no crear pantallas operativas con mocks como entrega final.

### F1 — Comercial y emisión

- [ ] Catálogo de servicios y selección por concepto; cantidad/valor unitario editables en borrador, inclusiones, exclusiones, método y transporte estructurados junto a texto imprimible.
- [ ] Datos cliente/contacto y condiciones del formato: despacho, transporte, pago, validez. Reutilización de servicios habituales sin alterar emisiones anteriores.
- [ ] Flujo borrador → revisión → aprobación admin → emisión asesor. Editar después de aprobación exige nueva revisión; tras emisión solo lectura.
- [ ] Vista de selección final: quitar 7 de 15 antes de enviar a revisión conserva la versión revisable y sus totales.
- [ ] Gate: emisión crea visibilidad operativa en Logística; asesor no tiene acción aprobar y API rechaza intento no autorizado.

### F2 — Logística, rutas y documentos

- [ ] Bandeja de trabajos emitidos; recogida predeterminada según acuerdo o llegada directa explícita. Ruta con paradas de varios clientes, responsable, vehículo y seguimiento por parada.
- [ ] Recepción precargada desde Comercial; Logística captura materiales reales, lote/unidad/cajas y fecha/hora/responsable. No cargar Excel ni convertir un servicio cotizado en material físico automáticamente.
- [ ] Orden, acta o ambos según modalidad del cliente; ambos comparten materiales y movimientos sin doble captura.
- [ ] Entrega a Planta por cantidades; emisión y confirmación separadas con diferencias/novedad. Mostrar las fechas reales, no sustituir por programación.
- [ ] Gate: llegada directa no exige conductor de recogida; una ruta con dos clientes no genera un acta conjunta; importes cotizados permanecen idénticos.

### F3 — Novedades y retenciones antes de operar Planta

- [ ] Incorporar captura común desde Logística y Planta: material, cantidad, ubicación, motivo y evidencias; mostrar alcance retenido y restricciones de avance.
- [ ] Incorporar bandeja inicial de Calidad para delimitar alcance y autorizar tratamiento/liberación; investigaciones independientes para ambos sentidos de devolución.
- [ ] Gate: la retención bloquea API y acciones UI antes de habilitar tandas o ciclos. Comercial puede consultar su efecto. F7 amplía la investigación y evaluación, no introduce por primera vez la protección.

### F4 — Microbodega e insumos

- [ ] Solicitud de Planta, salida de Logística, recepción total/parcial y conciliación. Insumo con referencia, presentación, unidad, lote/vencimiento aplicable y características.
- [ ] Existencias disponibles, retenidas y en tránsito separadas. No confundir materiales en custodia del cliente con insumos propios.
- [ ] Gate: 100 enviados y 98 recibidos muestran 2 pendientes de conciliación; la solicitud no incrementa stock y confirmar dos veces no duplica recepción.

### F5 — Recetas, tandas y ejecución

- [ ] Cliente de Planta gestionado independientemente, vinculado de forma explícita al cliente comercial del trabajo; sin enlace mostrar pendiente, nunca seleccionar por coincidencia de nombre automáticamente.
- [ ] Recetas por cliente/producto/proceso, versiones e instrucciones; insumos por unidad y fijos por tanda, con unidades/conversiones explícitas.
- [ ] Jefe Planta prepara versión, Calidad habilita conforme al flujo técnico acordado. Tandas fijan versión y materiales/cantidades; reabrir un día no crea una tanda nueva.
- [ ] Captura de etapas/evidencias y consumo real frente al previsto; sobrantes utilizables, merma motivada y retención de dudosos.
- [ ] Gate: preparar 60/40 en tandas separadas aplica fijo dos veces; continuar una tanda al día siguiente no duplica fijo ni consumo. Iniciar parcial es posible solo con condiciones cumplidas.

### F6 — Ciclos compartidos

- [ ] Sustituir la selección de una orden por selección de materiales/cantidades de varias órdenes/clientes; historial antiguo sigue accesible.
- [ ] Mostrar equipo, capacidad en magnitud pertinente, restricciones de cliente, protocolo compatible y cantidades disponibles. La evaluación proviene del servidor.
- [ ] Motivos concretos de exclusión: retenido, capacidad excedida, incompatibilidad, criterio aún no definido. No habilitar «forzar» como alternativa general.
- [ ] Gate: dos clientes comparten ciclo compatible sin perder origen; conflicto de reserva obliga a recargar; una orden parcialmente procesada conserva saldo.

### F7 — Calidad y certificados

- [ ] Novedad accesible desde cada material/movimiento con cantidad y motivo; Logística/Planta retienen y reportan, solo Calidad libera y define tratamiento.
- [ ] Investigaciones distintas para devolución al cliente y retorno posterior; evidencias de cadena de custodia y alcance de la retención.
- [ ] Revisión del ciclo común con panel por cliente; mostrar pendientes de evidencia, cantidades aprobadas/retenidas y certificados independientes.
- [ ] Documentos originales permanecen visibles; corrección/reemplazo no oculta el anterior. Retorno no cambia automáticamente certificado ni precio.
- [ ] Gate: 990 aprobados/10 devueltos quedan diferenciados; ciclo A/B emite certificados separados sin información del otro cliente; ejecutor no aprueba su propio proceso.

### F8 — Entrega, retornos y seguimiento comercial

- [ ] Despachar únicamente cantidades liberadas y documentadas; permitir parcial según acuerdo. Registrar cajas reales, responsables, entrega y novedades.
- [ ] Diferenciar pendiente de devolución de devolución realizada. Retorno enlaza entrega de origen sin editar sus cantidades históricas.
- [ ] Comercial consulta cantidades por ubicación, últimos eventos y efecto de novedades; gestiona referencia de factura por diferencia por separado. Integración fiscal externa queda fuera hasta contar con contrato propio.
- [ ] Gate: entrega 100, retorno 10 mantiene entrega original 100 y muestra 10 retornados; investigación puede seguir abierta después del cierre físico.

### F8 — Aceptación integral y transición (cierre del mismo hito)

- [ ] Ejecutar recorrido completo con cliente orden, acta y ambos; llegada directa/recogida, parciales, mezcla de clientes y servicios sin esterilización con cierre aplicable.
- [ ] Activar nuevas rutas por capacidad backend disponible; mantener consulta histórica y enlaces previos. No permitir una pantalla nueva escribir con contrato antiguo incompatible.
- [ ] Pilotar con usuarios autorizados y datos de prueba; comparar evidencia de pantalla/API/PDF. Despliegue real y migraciones requieren autorización específica.
- [ ] Gate final: trazabilidad material → recepción → tanda → ciclo → certificado por cliente → entrega/retorno, sin recalcular cotización ni duplicar movimientos.

## Verificación y accesibilidad

Ampliar las pruebas existentes: tests/sidebar-navigation.test.mjs, operational-forms.test.mjs, accessibility-contracts.test.mjs; E2E comercial-flow, quote-edit, rbac-quotes, hito4-operational, certificate-materials y calidad-flow. Crear escenarios de inventario/tandas/cargas/retornos con backend aislado o fixtures explícitas; mocks verifican UI pero no prueban la transacción real.

Comandos en ejecución: npm test; npm run lint; npm run build; npx playwright test e2e/<escenario>.spec.ts. Ejecutar primero archivos afectados, ampliar a recorrido integral al conectar hitos. No ejecutar scripts que migren BD incidentalmente. Confirmar configuración del servidor E2E antes de arrancarlo.

Objetivo de diseño WCAG 2.2 AA, no certificación anticipada. Verificar teclado, orden de foco y restauración de diálogos; etiquetas/unidades; resumen de errores enfocable con enlaces a filas y errores inline asociados; estados anunciados; información nunca solo por color; zoom 200% y reflujo a 320 CSS px; contraste; foco no oculto bajo acciones fijas; controles táctiles adecuados; alternativas a arrastre. Escaneo axe se incorporará como dependencia de desarrollo aprobada al implementar, complementado por NVDA y pruebas manuales. La búsqueda local UI/UX confirmó el patrón «Focusable Error Summary»; un toast por sí solo es insuficiente.

## Riesgos y condiciones de inicio

Las matrices técnicas de capacidad/compatibilidad y criterios de Calidad deben ser suministradas y aprobadas, no inferidas por el frontend. La modalidad documental, versión comercial y saldos nuevos requieren contrato backend antes de implementar. La migración de históricos incompletos debe distinguir desconocido de cero; conservar acceso de consulta. No elegir automáticamente cliente de Planta desde nombres Siigo. La verificación visual real queda para implementación: los bocetos adjuntos son estructura de interacción, no capturas de software existente.

Skills aplicadas: writing-plans/create-plan para entregas y criterios; frontend-design y design-system para dirección visual compatible; ui-ux-pro-max para formularios y errores; accessibility-testing para verificación. Se omiten skills no pertinentes (deploy, marketing, móviles nativos, Figma sin archivos) para evitar acciones ajenas al alcance.
