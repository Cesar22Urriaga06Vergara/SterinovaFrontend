<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Contexto y lectura progresiva

- Determina si la tarea corresponde al frontend, backend o ambos; abre solo el mapa correspondiente: `docs/ESTRUCTURA_FRONTEND.md` y, si aplica, `../Sterinova-Backend/docs/ESTRUCTURA_BACKEND.md`.
- Usa `docs/CONTEXTO_RAPIDO.md` para ubicar rutas y módulos; después localiza el área afectada y lee solo sus componentes, tipos, utilidades y pruebas directamente relacionados.
- Amplía la lectura a dependencias directas cuando el cambio lo requiera; busca por símbolo y limita los patrones a `src/app`, `src/components`, `src/lib`, `tests` o `e2e`.
- Ejecuta pruebas específicas con `node --test tests/<archivo>.test.mjs` o `npx playwright test e2e/<archivo>.spec.ts`; usa `npm test` para la suite unitaria y `npm run lint` para ESLint.
- No cargues automáticamente planes, reportes de fase, kickoff, todas las pruebas ni el repositorio backend completo. Consulta documentos históricos solo cuando la tarea requiera antecedentes.
- Para tareas de cotizaciones, logística, órdenes de servicio, actas, importación histórica, plantillas o certificados, consulta únicamente los formatos institucionales pertinentes en `../Sterinova-Backend/docs/ejemplos-formatos/`; no los incluyas en contexto general.
- Estas pautas no limitan revisiones de seguridad ni pruebas de regresión necesarias. No ejecutes migraciones ni macros como parte de una tarea frontend.
