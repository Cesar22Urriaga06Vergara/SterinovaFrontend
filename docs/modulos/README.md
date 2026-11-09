# Reglas de negocio por módulo

Actualización: 9 de noviembre de 2026. Recopilación de respuestas cerrada: ocho módulos documentados. Las decisiones confirmadas se distinguen de propuestas y cuestiones no resueltas. Documentado no significa implementado ni validado en producción.

| Módulo | Reglas actualizadas |
| --- | --- |
| 1. Autenticación y usuarios | [Reglas](autenticacion-usuarios/reglas-de-negocio.md) |
| 2. Clientes | [Reglas](comercial/clientes/reglas-de-negocio.md) |
| 3. Cotizaciones | [Reglas](comercial/cotizaciones/reglas-de-negocio.md) |
| 4. Logística | [Reglas](logistica/reglas-de-negocio.md) |
| 5. Planta | [Reglas](planta/reglas-de-negocio.md) |
| 6. Calidad | [Reglas](calidad/reglas-de-negocio.md) |
| 7. Certificados | [Reglas](certificados/reglas-de-negocio.md) |
| 8. Formatos y Sellos | [Reglas](formatos-sellos/reglas-de-negocio.md) |

Los ocho archivos de `interrogatorio/` conservan las 100 preguntas originales. Las respuestas y propuestas se mantienen en las reglas correspondientes.

## Pendientes principales para la refactorización

- Cotizaciones: pregunta 29 sobre IVA sin respuesta, inicio de vigencia frente a envío/aceptación/emisión, alternativas y numeración de servicios combinados.
- Logística: creación desde ACEPTADA frente a emisión previa; recepciones parciales y documentos de liberación para servicios sin esterilización.
- Planta/Calidad: cierre de órdenes multiciclo, asignación de cantidades, autoridades de excepción y protocolos aplicables.
- Calidad/Certificados: aprobación por ciclo con rollback de PDF frente a certificado consolidado por orden; firmas y exclusiones de materiales rechazados.
- Certificados: fechas y firmantes en órdenes multiciclo, colisiones de nuevos consecutivos con históricos y alcance del mecanismo de firma.
- Formatos: excepciones de versión frente a vigencia, plantillas multiservicio y publicación programada.

Cada documento contiene el detalle y la procedencia de estas precisiones. No se consideran respondidas por el mero cierre del interrogatorio.

## ADRs y siguiente fase

No se crearon ADRs nuevos durante este interrogatorio. Se produjeron documentos de reglas de negocio. Los ADRs existentes se mantienen en el [índice canónico del backend](../../../backend_sterinova/docs/arquitectura/adr/README.md): 001 Evidencias y firmas, 002 PDF con Playwright/Next.js, 003 Consecutivos transaccionales y 004 RBAC con ámbitos. Sus estados históricos no equivalen a una revalidación contra todas las respuestas recientes.

Se recomienda comenzar la refactorización por Autenticación y Usuarios: permisos por área, roles múltiples, separación creador/aprobador y autorizaciones de Calidad/documentales condicionan las mutaciones de todos los demás módulos. Primero debe reconciliarse la matriz existente con estas reglas, sin ampliar silenciosamente accesos ni suponer equivalencia entre cargos.

Las decisiones técnicas nuevas deberán registrarse en ADRs en esa ubicación, continuando la numeración existente y diferenciando propuesta de aceptación. No se ejecuta código ni migraciones de negocio en este cierre documental.
