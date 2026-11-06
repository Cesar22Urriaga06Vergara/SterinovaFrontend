# Reporte Baseline — Fase 0 Frontend

## 1. Entorno y Pruebas
- Node: v24.13.0
- npm: 11.10.0
- Estado de compilación (`npm run build`): Exitoso. Next.js compiló, completó TypeScript y generó las páginas estáticas.
- Comando de pruebas encontrado: No definido en `package.json`. Los cuatro archivos `.mjs` se ejecutan directamente con `node tests/<archivo>.mjs`.
- Resultados de pruebas: Se ejecutaron en orden `node tests/cotizacion-currency.test.mjs` (2 passed, 0 failed), `node tests/cotizacion-pdf-content.test.mjs` (13 passed, 0 failed) y `node tests/sidebar-navigation.test.mjs` (1 passed, 1 failed). El fallo fue `AssertionError [ERR_ASSERTION]` en `tests/sidebar-navigation.test.mjs:35`: `assert.ok(links.every((link) => link.href !== "/usuarios"))`. No se ejecutó `node tests/stored-user.test.mjs`, porque la instrucción requiere detener las pruebas al encontrar un fallo. Durante `npm ci` se reportaron 9 vulnerabilidades (8 moderate, 1 high), una advertencia de `eslint@9.39.5` deprecated y la advertencia `npm warn using --force Recommended protections disabled.`

## 2. Navegación y Rutas
- Tabla de rutas:
  | Ruta | Área | Roles Permitidos |
  |---|---|---|
  | `/` | Principal | Admin, Comercial, Logistica, Planta, Calidad |
  | `/comercial/clientes` | Maestros | Admin, Comercial |
  | `/comercial` | Operación | Admin, Comercial |
  | `/comercial/cotizaciones` | Operación | Admin, Comercial |
  | `/logistica` | Operación | Admin, Logistica |
  | `/planta` | Operación | Admin, Planta |
  | `/calidad` | Operación | Admin, Calidad |
  | `/usuarios` | Administración | Admin |
  | `/configuracion/plantillas` | Administración | Admin |
  | `/configuracion/sellos` | Administración | Admin |
- Existencia de páginas:
  - `/calidad`: Existe (`src/app/(erp)/calidad/page.tsx`)
  - `/usuarios`: Existe (`src/app/(erp)/usuarios/page.tsx`)
  - `/configuracion`: No existe página índice; sí existen las páginas `/configuracion/plantillas` y `/configuracion/sellos`.

## 3. Integración y API
- URL de Login (`src/app/login/page.tsx`): Fija (`http://localhost:3001/auth/login`). Línea: 20
- Interceptor Axios (`src/lib/api.ts`):
  - Envía Bearer: Sí, asigna el header `Authorization` con el token almacenado. Línea: 41
  - Maneja 401: Sí, limpia el token y el usuario y redirige a `/login`. Líneas: 47-55

## 4. UI y Estados
- Contadores del Dashboard: Estáticos. Lista: Cotizaciones Pendientes (12), Órdenes en Planta (8), Despachos Hoy (5), Certificados por Aprobar (3).
- Patrón de estados (Loading/Empty/Error): Manejo heterogéneo por página. El layout del ERP proporciona un fallback `LayoutLoading`; no se evidencia un componente global reutilizable para estados Empty/Error/Skeleton/Spinner.

## 5. Estado de Git
- Rama actual: `main`
- Cambios sin confirmar: Sí. Ya había cambios en documentación al revisar Git; este reporte también queda como archivo nuevo sin confirmar.
- Último commit: `17d786a feat: add Sterinova ERP frontend`

## 6. Conclusión de la Fase 0
- ¿El entorno es estable para iniciar la Fase 1 (Arquitectura UI y Navegación)? Sí con salvedades.
- Bloqueantes identificados: Fallo de `tests/sidebar-navigation.test.mjs` por la expectativa de que `/usuarios` no aparezca en la navegación; 9 vulnerabilidades reportadas por `npm ci`, incluida 1 de severidad alta. El build fue exitoso.
