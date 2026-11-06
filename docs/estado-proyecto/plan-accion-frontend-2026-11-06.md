# Plan de acción — Frontend UI/UX Sterinova ERP



> **Estado:** vigente

> **Rol del autor:** Experto en frontend (Next.js 16.4.5, React 19.3, TypeScript) y experto en UI/UX

> **Repositorio:** `frontend_sterinova`

> **Fecha:** 6 de noviembre de 2026

> **Base:** auditoría del 6-nov, checklist operativo, resumen de cierre, revisión de calidad documental

> **Alcance:** plan ejecutable por fases; no reabre la auditoría; no certifica despliegue

> **No cubre:** aceptación visual de PDFs (responsable de negocio), validación regulatoria (Calidad), operación en producción (DevOps)



---



## 1. Contexto y estado de partida



El frontend cubre las rutas de Comercial, Logística, Planta, Calidad, Usuarios y Configuración, con navegación por rol, cliente Axios con Bearer y manejo de 401. Persisten gaps conocidos que este plan cierra de forma ordenada:



- Integración: URL fija de login (`http://localhost:3001/auth/login`), no sigue `NEXT_PUBLIC_API_URL`.

- Sesión: no hay validación proactiva de expiración de JWT en cliente.

- Estados: no hay patrón uniforme de vacío/carga/error/sin permisos.

- Dashboard: contadores estáticos.

- Tipos de cotización: 5 en UI vs. 7 en backend (`FARMACEUTICO`, `FABRICANTE` ausentes).

- Pruebas: 4 `.mjs` sin script `test` en `package.json`.

- Accesibilidad: no hay criterios documentados ni verificación.

- Design system: no hay inventario de componentes ni tokens.

- PDFs: componentes React compartidos; `html2pdf.js` declarado pero no usado.



**Este plan no reabre la auditoría. Ejecuta lo que la auditoría dejó como pendiente operativo.**



---



## 2. Objetivo del plan



Llevar el frontend a un estado **consistente, accesible, verificable y operable** en un ambiente controlado (staging), con:



1. Integración robusta con la API, sin URLs fijas ni fugas de sesión.

2. Arquitectura de información coherente con roles y permisos.

3. Estados uniformes (vacío/carga/error/sin permisos/sesión expirada).

4. Módulos críticos completos y alineados con el backend.

5. Design system mínimo y consistencia visual.

6. Accesibilidad WCAG 2.1 AA en flujos críticos.

7. Flujos críticos end-to-end automatizados.

8. Pruebas, build y despliegue reproducibles.

9. Documentación UI/UX viva.



---



## 3. Roles y responsabilidades



| Rol | Responsabilidad principal | Participa en fases |

|---|---|---|

| **Tech Lead Frontend** | Prioriza, aprueba DoD, coordina con backend y producto | Todas |

| **Frontend Senior — Arquitectura e integración** | Cliente API, sesión, error boundary, env vars, routing | F1, F2, F8 |

| **Frontend Senior — UI/UX** | Componentes, patrones, design system, accesibilidad | F4, F5 |

| **Frontend Mid** | Implementación de páginas y módulos | F3, F4 |

| **Diseñador UX / Product Designer** | Flujos, wireframes, consistencia, tokens, revisión visual | F4, F5, F6 |

| **Especialista en Accesibilidad (a11y)** | Auditoría WCAG, patrones accesibles, testing con lector | F5 |

| **QA Frontend / QA Automation** | Pruebas unitarias, componentes, e2e, build | F0, F6, F7 |

| **Tech Writer / Content Designer** | Copy, mensajes de error, docs UI/UX | F2, F9 |

| **Responsable de producto / negocio** | Priorización, copy final, aceptación de flujos | F3, F6 |

| **DevOps** | Build, env vars, observabilidad, despliegue | F0, F8 |

| **Responsable de Calidad** | Aceptación de flujos que tocan certificados y PDFs | F3, F6 |



**Regla de asignación:** ningún rol puede ser ejercido por la misma persona en revisión y ejecución de la misma actividad crítica (accesibilidad, integración, flujos de calidad).



---



## 4. Principios de ejecución



1. **Nada se declara hecho sin evidencia archivada** (comando, captura, Lighthouse, commit).

2. **Ninguna página se mergea sin estados vacío/carga/error/sin permisos.**

3. **Ningún componente nuevo sin uso en design system o justificación.**

4. **Ningún flujo crítico sin prueba automatizada al cierre de su fase.**

5. **Ningún copy de error sin mensaje claro y accionable.**

6. **Ninguna variable pública (`NEXT_PUBLIC_*`) con secretos.**

7. **Ningún PR sin checklist de PR (tests, a11y, docs, env).**



---



## 5. Fases



### Fase 0 — Baseline



**Objetivo:** tener una fotografía verificable del estado real antes de tocar nada.



**Roles:** Tech Lead, QA Frontend, DevOps.



**Actividades:**

- Clonar repos, `npm ci`, `npm run build`.

- Ejecutar las 4 pruebas `.mjs` con el runner actual (documentar comando exacto).

- Lighthouse baseline por ruta crítica (login, dashboard, comercial, calidad).

- Inventario de rutas y roles visibles (`navigation.ts`).

- Registrar versión de Node, npm, Next.js.

- Documentar variables de entorno requeridas (sin valores).

- Confirmar ausencia de script `test` en `package.json` y registrar como pendiente.

- `git log`, `git status`, rama base.



**Entregables:**

- `baseline.md` con comandos, salidas, Lighthouse y versiones.

- Inventario de rutas con rol y API asociada.

- Lista de divergencias con la auditoría.



**DoD:**

- Baseline archivado y firmado por Tech Lead.

- Cero divergencias no explicadas con la auditoría.

- Staging accesible y reproducible.



**Dependencias:** ninguna. Bloquea todas las fases.



---



### Fase 1 — Arquitectura UI y navegación



**Objetivo:** coherencia entre rutas, roles, permisos y API.



**Roles:** Frontend Senior Arquitectura, Diseñador UX, QA Frontend.



**Actividades:**

- Tabla canónica: ruta → rol visible → endpoints API → página existente → estado.

- Corregir URL fija de login: usar `NEXT_PUBLIC_API_URL` (o helper común).

- Validación proactiva de expiración de JWT en cliente (refresh o re-login anticipado).

- Error boundary global con UI clara y reporte.

- Páginas 403, 404, 500 dedicadas.

- Layout por rol con navegación coherente.

- Sidebar activo según ruta; breadcrumbs donde aporten.

- Redirección post-login según rol.

- Guard de rutas por rol en cliente (defensa en profundidad, no sustituto del backend).



**Entregables:**

- `docs/arquitectura/navegacion-y-permisos.md` actualizado con tabla canónica.

- Tests de guard de rutas por rol.



**DoD:**

- 100 % rutas protegidas en cliente y servidor.

- Login usa `NEXT_PUBLIC_API_URL`.

- Error boundary y páginas 403/404/500 existen.

- Redirección por rol funciona.



**Dependencias:** F0.



---



### Fase 2 — Cliente API, sesión y estados



**Objetivo:** integración robusta y estados uniformes.



**Roles:** Frontend Senior Arquitectura, Frontend Mid, QA Frontend, Tech Writer.



**Actividades:**

- Interceptor: manejo de 401 con refresh o re-login, retry idempotente, cancelación de requests.

- Manejo de errores por código y por tipo (validación, red, servidor, permisos).

- Patrón uniforme por página: loading (skeleton), empty (con CTA), error (con reintento), success (feedback).

- Prevención de doble submit en formularios.

- Caché de catálogos (tipos de cotización, clientes) con invalidación clara.

- Validación client-side alineada con DTOs backend (mensajes coherentes).

- Toasts/notificaciones con patrón único.

- Confirmaciones para acciones destructivas.



**Entregables:**

- Componentes compartidos de estado (`Loading`, `Empty`, `ErrorState`, `Toast`).

- `docs/ui-ux/principios-y-patrones.md` con el patrón de estados.

- Tests de hooks y componentes de estado.



**DoD:**

- 0 llamadas sin manejo de error.

- Todas las páginas usan los componentes de estado.

- Formularios previenen doble submit.



**Dependencias:** F1.



---



### Fase 3 — Módulos críticos



**Objetivo:** completar y alinear módulos críticos con el backend.



**Roles:** Frontend Mid, Frontend Senior UI/UX, QA Frontend, Responsable de producto.



**Actividades por módulo:**



- **Comercial**

- Cotizaciones: alinear selector con los 7 tipos del backend (o justificar 5 con ADR).

- Emisión y descarga de PDF con feedback claro.

- Importación Excel: validación, dedupe, mensajes de resultado.



- **Logística**

- Órdenes: transiciones válidas visibles, validaciones, estados.

- Prevención de transiciones inválidas en UI.



- **Planta**

- Ciclos: validación de rangos por método (alineado con backend).

- Confirmación antes de registrar.



- **Calidad**

- Aprobar con revalidación de contraseña; feedback de éxito.

- Rechazar con motivo obligatorio; validación de longitud.

- Detalle de certificado con descarga y validación pública.



- **Usuarios**

- Alta, edición, desactivación, cambio de contraseña, roles.

- Confirmaciones y validaciones.



- **Configuración**

- Plantillas: versiones, activación, asignación por cliente.

- Sellos: alta, activación, orden.



- **Dashboard**

- Reemplazar contadores estáticos por datos de API o marcar explícitamente como “en construcción”.



**Entregables:**

- Documento `docs/ui-ux/flujos-criticos.md` con cada flujo y sus estados.

- Tests de componente por módulo.



**DoD:**

- Cada módulo con estados completos.

- Dashboard no engaña al usuario.

- Tipos de cotización alineados o con decisión documentada.



**Dependencias:** F1, F2.



---



### Fase 4 — Design system y consistencia visual



**Objetivo:** consistencia y velocidad de desarrollo.



**Roles:** Diseñador UX, Frontend Senior UI/UX, Frontend Mid.



**Actividades:**

- Inventario de componentes existentes.

- Tokens: colores, spacing, tipografía, radios, sombras, breakpoints.

- Componentes base: `Button`, `Input`, `Select`, `Table`, `Modal`, `Badge`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`.

- Patrones: tabla (sort, filter, paginación, empty, error), formulario (validación, errores, disabled, loading), modal (confirmación, destructivo, focus trap).

- Storybook (opcional pero recomendado) o catálogo interno.

- Migración progresiva de páginas al design system.



**Entregables:**

- `docs/ui-ux/principios-y-patrones.md` completo.

- Catálogo de componentes o Storybook.

- Migración de al menos 3 páginas al design system como piloto.



**DoD:**

- Tokens definidos y usados.

- Componentes base disponibles.

- Al menos 3 páginas migradas.



**Dependencias:** F1, F2.



---



### Fase 5 — Accesibilidad (WCAG 2.1 AA)



**Objetivo:** accesibilidad verificable en flujos críticos.



**Roles:** Especialista a11y, Frontend Senior UI/UX, QA Frontend.



**Actividades:**

- Auditoría con axe o Lighthouse a11y por ruta crítica.

- Labels asociados a campos; `aria-*` donde aplique.

- Focus visible y orden de tabulación lógico.

- Contraste ≥ 4.5:1 en texto y ≥ 3:1 en UI.

- Mensajes de error asociados a campos y anunciados.

- Skip links.

- Reducción de movimiento (`prefers-reduced-motion`).

- Testing con lector de pantalla (NVDA o VoiceOver) en al menos 3 flujos.

- Documento de criterios y hallazgos.



**Entregables:**

- `docs/ui-ux/accesibilidad.md` actualizado con auditoría.

- Tests a11y automatizados en CI.



**DoD:**

- axe sin errores críticos en flujos críticos.

- WCAG 2.1 AA en flujos críticos.

- Testing con lector documentado.



**Dependencias:** F4.



---



### Fase 6 — Flujos críticos end-to-end



**Objetivo:** flujos completos probados y documentados.



**Roles:** QA Automation, Frontend Senior Arquitectura, Diseñador UX, Responsable de Calidad.



**Actividades:**

- Automatizar con Playwright/Cypress: login → cotización → emisión PDF → orden → ciclo → calidad → certificado → validación pública.

- Manejo de errores en cada paso (validaciones, red, permisos).

- Estados intermedios claros.

- Notificaciones al usuario en cada acción.

- Documentación de flujos con capturas y estados.

- Validación de copy con producto.



**Entregables:**

- Suite e2e de flujos críticos.

- `docs/ui-ux/flujos-criticos.md` con diagramas y capturas.



**DoD:**

- E2E verde en staging.

- Flujos documentados y aceptados por producto y Calidad.



**Dependencias:** F3.



---



### Fase 7 — Pruebas y build



**Objetivo:** pipeline de pruebas y build reproducible.



**Roles:** QA Frontend, DevOps, Tech Lead.



**Actividades:**

- Añadir script `test` en `package.json`.

- Formalizar las 4 pruebas `.mjs` (convertir a runner formal o integrar).

- Unit tests para utils y hooks.

- Component tests con React Testing Library.

- Build de producción reproducible.

- Análisis de bundle; definir umbral.

- Smoke test post-build.

- CI: lint + typecheck + test + build + e2e.



**Entregables:**

- `npm test` funcional.

- Pipeline CI verde.

- Reporte de bundle.



**DoD:**

- `npm test` funciona.

- Build limpio y reproducible.

- Bundle ≤ umbral acordado.

- CI verde.



**Dependencias:** F6.



---



### Fase 8 — Despliegue y observabilidad



**Objetivo:** staging funcional con observabilidad.



**Roles:** DevOps, Frontend Senior Arquitectura.



**Actividades:**

- `NEXT_PUBLIC_API_URL` por ambiente.

- Error tracking (Sentry o equivalente).

- Web vitals (LCP, CLS, INP) capturadas.

- Feature flags (si aplica).

- Health check de frontend.

- Runbook de despliegue y rollback.



**Entregables:**

- `docs/manuales/desarrollo-local.md` actualizado con variables por ambiente.

- Runbook de despliegue y rollback.

- Dashboards de web vitals y errores.



**DoD:**

- Staging operativo.

- Observabilidad activa.

- Rollback probado.



**Dependencias:** F7.



---



### Fase 9 — Documentación UI/UX viva



**Objetivo:** documentación alineada a la implementación.



**Roles:** Tech Writer, Diseñador UX, Frontend Senior UI/UX.



**Actividades:**

- Documentar componentes y patrones.

- Documentar flujos críticos con capturas.

- Guía de accesibilidad.

- Guía de contribución (PR template con checklist de a11y, tests, docs).

- Actualización de `docs/estado-proyecto/modulos.md` cuando cambien rutas o roles.



**Entregables:**

- `docs/ui-ux/principios-y-patrones.md`, `accesibilidad.md`, `flujos-criticos.md`, `correspondencia-ui-api.md` actualizados.

- PR template activo.



**DoD:**

- Docs vivas y enlazadas.

- PR template activo.

- Cambios de rutas/roles se reflejan en docs.



**Dependencias:** transversal; cierra al final.



---



## 6. Orden de ejecución y dependencias



```

F0 ──► F1 ──► F2 ──┬──► F3 ──► F6 ──► F7 ──► F8 ──► F9 (cierre)

│

└──► F4 ──► F5

```



- F0 bloquea todo.

- F1 y F2 en secuencia.

- F3 y F4 en paralelo tras F2.

- F5 requiere F4.

- F6 requiere F3.

- F7 requiere F6.

- F8 requiere F7.

- F9 es transversal y cierra al final.



---



## 7. Riesgos y mitigaciones



| Riesgo | Mitigación |

|---|---|

| URL fija de login rompe despliegue | Corregir en F1, test de build por ambiente |

| Sesión expirada sin aviso | Validación proactiva, re-login, mensaje claro |

| Estados inconsistentes entre páginas | Componentes compartidos, lint de uso |

| Módulos desalineados con backend | Tabla canónica ruta→rol→API, contrato OpenAPI como referencia |

| A11y como deuda perpetua | Fase dedicada, tests en CI, criterios documentados |

| Flujos críticos no probados | E2E obligatorio al cierre de F6 |

| Bundle crece sin control | Umbral en CI, análisis por PR |

| Docs UI/UX desactualizadas | PR template, revisión por release |



---



## 8. Métricas de éxito



- 0 URLs fijas a localhost en código de producción.

- 0 páginas sin estados vacío/carga/error/sin permisos.

- Dashboard sin datos estáticos o marcado explícitamente.

- axe sin errores críticos en flujos críticos.

- E2E de flujos críticos verde.

- `npm test` funcional y en CI.

- Build reproducible; bundle ≤ umbral.

- Staging con observabilidad y rollback probados.

- Docs UI/UX vivas y enlazadas.



---



## 9. Anexos



- Auditoría del 6-nov: `../backend_sterinova/docs/estado-proyecto/auditoria-docs-2026-11-06.md`

- Revisión de calidad documental: `../backend_sterinova/docs/estado-proyecto/revision-calidad-documental.md`

- Resumen de cierre: `../backend_sterinova/docs/estado-proyecto/resumen-cierre-auditoria-2026-11-06.md`

- Checklist operativo: `../backend_sterinova/docs/calidad-y-pruebas/checklist-verificacion-operativa.md`

- Estado funcional backend: `../backend_sterinova/docs/estado-proyecto/modulos.md`

- Integración y stack: `../docs/arquitectura/integracion-y-stack.md`

- Módulos y rutas: `../docs/estado-proyecto/modulos.md`
