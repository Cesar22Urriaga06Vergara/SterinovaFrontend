# Vistas contextuales por rol Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the ERP into a role-aware visual workspace where Inicio, navigation, and each operational view show only the work supported by the current permissions.

**Architecture:** Keep the existing App Router and `SessionProvider` as the source of session permissions. Add a typed view-configuration layer for dashboard cards and navigation metadata, reuse the existing state components, and keep backend authorization unchanged. Refactor affected pages incrementally so each page remains independently testable.

**Tech Stack:** Next.js 16.4.5, React 19.3, TypeScript, Tailwind CSS, Lucide, Node test runner, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-12-auditoria-vistas-por-rol-design.md`

## Global Constraints

- The Inicio dashboard must be contextual by permissions and area; it must not ask the user to select an area.
- Use the backend permission catalog as the canonical source for exact action permissions.
- Use the session (`/auth/me`) for navigation visibility; the backend remains responsible for filtering data by scope.
- Show a module when it has a real route and declared permission; do not expose actions whose flow does not exist.
- Do not create backend endpoints, migrations, fake metrics, or database changes.
- Reuse `LoadingState`, `ErrorState`, `EmptyState`, `Button`, `Badge`, and existing design tokens.
- Preserve responsive behavior, visible focus, keyboard operation, and accessible status announcements.

## Review Focus

- A user with overlapping permissions must get one coherent dashboard, not duplicate area selectors or duplicate cards. Test in Task 2 with combined permission sets.
- A user without a module permission must not see its navigation link or dashboard card, while a direct route remains rejected by the existing layout. Test in Task 3.
- An authorized module with zero records must distinguish empty data from loading and request failure. Test in Task 4.
- A partially implemented route must not expose a false action or a “Próximamente” card as if it were usable. Test in Tasks 3 and 5.
- A manager with all current permissions must retain access to every existing operational route without changing backend authorization. Test in Tasks 2, 3, and 5.

---

### Task 1: Create the view and permission audit matrix

**Files:**
- Create: `docs/superpowers/audits/2026-11-12-matriz-vistas-roles.md`
- Modify: `docs/arquitectura/navegacion-y-permisos.md`
- Modify: `docs/estado-proyecto/modulos.md`
- Test: none (documentation audit)

**Interfaces:**
- Consumes: `src/lib/navigation.ts`, `src/lib/session.tsx`, backend permission catalog, and the current pages under `src/app/(erp)/`.
- Produces: A maintained table with route, purpose, visible content, action permissions, data source, empty/loading/error/no-access states, and implementation status.

- [ ] **Step 1: Record every current ERP route and its exact navigation permission**

  Include `/`, Comercial, Clientes, Cotizaciones, Logística, Planta, Calidad, Solicitudes, Usuarios, Plantillas, Sellos, and nested detail/create routes. Mark routes that are real but not navigation entries.

- [ ] **Step 2: Record the current page responsibilities and remove ambiguous “permission guide” wording**

  Use the exact permission strings already defined by the backend/frontend contract. Where an action permission is not implemented, mark it as pending instead of inventing a code.

- [ ] **Step 3: Add the current-state matrix to `docs/superpowers/audits/2026-11-12-matriz-vistas-roles.md`**

  For each route, document allowed content, out-of-scope content, primary action, destination links, and all user-visible states.

- [ ] **Step 4: Update active navigation/module documentation to point to the audit matrix**

  Preserve the existing documentation as route references; avoid duplicating a second conflicting permission table.

- [ ] **Step 5: Review the matrix against source files**

  Run: `git diff --check`

  Expected: no whitespace errors; every listed route and permission can be traced to current source.

### Task 2: Build the contextual dashboard model and UI

**Files:**
- Create: `src/lib/dashboard.ts`
- Modify: `src/app/(erp)/DashboardClient.tsx`
- Modify: `src/app/(erp)/page.tsx` only if a server boundary is needed
- Test: `tests/dashboard.test.mjs`

**Interfaces:**
- Consumes: `readonly string[]` permissions from `useSession` and current user identity from `useStoredUser`.
- Produces: `getDashboardSections(permissions: readonly string[]): DashboardSection[]`, where each section has a stable `id`, title, description, optional count source, target `href`, and required permission.

- [ ] **Step 1: Write tests for dashboard selection**

  Assert that commercial permissions produce commercial work cards, logistics permissions produce logistics cards, quality permissions produce quality cards, and combined permissions produce a single combined dashboard without an area selector. Assert that no permission produces no protected work card.

- [ ] **Step 2: Run the focused test and verify it fails**

  Run: `node --test tests/dashboard.test.mjs`

  Expected: FAIL because `src/lib/dashboard.ts` and `getDashboardSections` do not yet exist.

- [ ] **Step 3: Implement typed dashboard configuration in `src/lib/dashboard.ts`**

  Use only existing routes and currently implemented functions. Do not add a counter unless an existing API response already supplies it; otherwise render a link/card without a fabricated number.

- [ ] **Step 4: Replace static “Métricas en construcción” cards in `DashboardClient.tsx`**

  Render a welcome header, contextual work sections, and accessible empty guidance. Do not render an area chooser. Preserve the manager/general-access case by showing all sections supported by the permission set.

- [ ] **Step 5: Run the focused test and lint the changed files**

  Run: `node --test tests/dashboard.test.mjs`

  Expected: PASS.

  Run: `npm run lint -- --file src/lib/dashboard.ts --file src/app/(erp)/DashboardClient.tsx`

  Expected: PASS with no new lint errors.

### Task 3: Align navigation and route access with the audit matrix

**Files:**
- Modify: `src/lib/navigation.ts`
- Modify: `src/components/Sidebar.tsx` only for visual grouping or labels required by the matrix
- Test: `tests/sidebar-navigation.test.mjs`

**Interfaces:**
- Consumes: exact route/permission rows from Task 1 and `getVisibleNavigationSections`.
- Produces: navigation sections that expose only real routes with declared permissions, with stable active-route behavior for nested pages.

- [ ] **Step 1: Extend navigation tests for real-route filtering**

  Assert that every permission-gated navigation item maps to an existing page, that a user without the permission sees no item, and that nested quote/create/detail routes still activate the parent item.

- [ ] **Step 2: Run the focused navigation test and verify the new assertions fail where applicable**

  Run: `node --test tests/sidebar-navigation.test.mjs`

  Expected: Existing assertions pass; new route consistency assertions fail until navigation metadata is corrected.

- [ ] **Step 3: Update `navigationSections` and `canAccessPath`**

  Keep the existing section names unless the audit matrix proves a link is in the wrong responsibility. Remove or hide entries for missing routes; do not add a route solely to satisfy the menu.

- [ ] **Step 4: Adjust Sidebar presentation without duplicating permission logic**

  Preserve `getVisibleNavigationSections`, active-link behavior, mobile focus restoration, and keyboard support. Use concise labels that match each page’s responsibility.

- [ ] **Step 5: Run navigation and accessibility contract tests**

  Run: `node --test tests/sidebar-navigation.test.mjs tests/accessibility-contracts.test.mjs`

  Expected: PASS.

### Task 4: Unify visual states across operational views

**Files:**
- Modify: `src/components/ui/states/EmptyState.tsx`
- Modify: `src/app/(erp)/planta/page.tsx`
- Modify: `src/app/(erp)/calidad/page.tsx`
- Modify: `src/app/(erp)/logistica/page.tsx`
- Modify: `src/app/(erp)/comercial/cotizaciones/CotizacionesClient.tsx`
- Modify: `src/app/(erp)/usuarios/UsersTable.tsx`
- Modify: `src/app/(erp)/configuracion/plantillas/PlantillasDocumentalesClient.tsx`
- Test: `tests/accessibility-contracts.test.mjs`

**Interfaces:**
- Consumes: existing data-loading/error state variables in each page.
- Produces: consistent loading, recoverable error, empty-data, and no-action messaging using shared state components or a shared table-state pattern.

- [ ] **Step 1: Add contract assertions for state semantics**

  Assert that empty-state copy does not use “Métricas en construcción” or “Próximamente” for an available route, that error states expose retry where the page can retry, and that empty states do not present disabled-looking actions without explanation.

- [ ] **Step 2: Run the focused contracts and verify the new assertions fail**

  Run: `node --test tests/accessibility-contracts.test.mjs`

  Expected: FAIL for the pages still using inconsistent inline empty/error markup.

- [ ] **Step 3: Update the shared `EmptyState` contract only where needed**

  Preserve current props and behavior; add an explicit semantic variant or supporting text only if it is required to distinguish no records from no pending work. Do not make callers pass fake actions.

- [ ] **Step 4: Replace inline table messages in the affected views**

  Keep domain-specific wording, but use the shared visual hierarchy and `role="status"`/`role="alert"` semantics. Ensure loading and error branches occur before empty branches.

- [ ] **Step 5: Run focused unit and lint checks**

  Run: `node --test tests/accessibility-contracts.test.mjs`

  Expected: PASS.

  Run: `npm run lint`

  Expected: PASS with no new errors.

### Task 5: Remove misleading placeholders and align area landing views

**Files:**
- Modify: `src/app/(erp)/comercial/page.tsx`
- Modify: `src/app/(erp)/logistica/page.tsx` only if the audit identifies cross-area cards
- Modify: `src/app/(erp)/planta/page.tsx` only if the audit identifies cross-area cards
- Modify: `src/app/(erp)/calidad/page.tsx` only if the audit identifies cross-area cards
- Modify: `docs/ui-ux/principios-y-patrones.md`
- Test: `tests/dashboard.test.mjs`, `tests/accessibility-contracts.test.mjs`

**Interfaces:**
- Consumes: dashboard/navigation model from Tasks 2–3 and state pattern from Task 4.
- Produces: area landing pages containing only implemented functions belonging to that area, with no false “Reportes” or unrelated selectors.

- [ ] **Step 1: Add a regression assertion for the commercial landing view**

  Assert that the page exposes Clientes and Cotizaciones and does not render a clickable or actionable “Reportes” placeholder.

- [ ] **Step 2: Run the focused regression tests and verify the placeholder assertion fails**

  Run: `node --test tests/dashboard.test.mjs tests/accessibility-contracts.test.mjs`

  Expected: FAIL until the placeholder is removed or replaced by a real implemented function.

- [ ] **Step 3: Update area landing views**

  Keep only implemented links/cards whose permission is already represented in navigation. Do not add new product/report flows in this task.

- [ ] **Step 4: Document the landing-page rule**

  Update the UI principles to state that an area landing view must not contain selectors for unrelated areas or cards for unavailable functionality.

- [ ] **Step 5: Run the complete frontend verification**

  Run: `npm test`

  Expected: PASS.

  Run: `npm run lint`

  Expected: PASS.

  Run: `npm run build`

  Expected: PASS.

  Run: `npx playwright test e2e/comercial-flow.spec.ts e2e/rbac-quotes.spec.ts e2e/calidad-flow.spec.ts`

  Expected: PASS, or document an environment/API prerequisite if execution is not possible.

