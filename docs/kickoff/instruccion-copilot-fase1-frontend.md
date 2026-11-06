# Instrucción de Ejecución — Fase 1: Arquitectura UI y Navegación

**Para:** Agente de IA (GitHub Copilot en VS Code)
**Rol Asignado:** Senior Frontend Engineer & UI/UX Expert (Next.js/React/TypeScript)
**Repositorio:** `frontend_sterinova`
**Objetivo:** Ejecutar la Fase 1 del Plan de Acción Frontend. Corregir la integración con el backend, implementar validación proactiva de sesión, establecer una arquitectura de rutas segura (RBAC) y crear una experiencia de usuario robusta para errores (Boundaries). Todo esto resolviendo los bloqueantes del baseline.

---

## 1. Directrices del Rol Senior (CRÍTICO)

Como Senior experto en UI/UX, tu código debe cumplir con los siguientes estándares:

1. **UX Consistente:** Los mensajes de error deben ser claros, accionables y accesibles.
2. **Security in Depth:** Aunque el backend valide, el frontend debe proteger las rutas y la sesión (defensa en profundidad).
3. **No Regressions:** Debes reparar el test de navegación fallido del baseline.
4. **Uso de Entorno:** Prohibido dejar URLs hardcodeadas a `localhost`. Usa `process.env.NEXT_PUBLIC_*`.
5. **Contexto:** Utiliza `@workspace` para buscar patrones en todo el proyecto antes de crear nuevos componentes.

---

## 2. Tareas a Ejecutar (Secuenciales)

### Tarea 1: Corrección de Integración (Hallazgo Baseline)

1. Abre `src/app/login/page.tsx`.
2. Localiza la URL fija `http://localhost:3001/auth/login` (línea ~20).
3. Refactoriza la petición para que utilice la variable de entorno `process.env.NEXT_PUBLIC_API_URL`. Asegúrate de que el path `/auth/login` se concatene correctamente.

### Tarea 2: Validación Proactiva de Sesión (JWT)

1. Abre `src/lib/api.ts` (o crea un archivo de utilidades `src/lib/auth.ts` si lo consideras mejor).
2. Implementa una función que decodifique el JWT almacenado en `localStorage`. (Puedes usar `jwt-decode` o decodificar la parte del payload en Base64).
3. Antes de que el usuario interactúe, verifica si el token ha expirado (comparando el `exp` con `Date.now()`). Si está expirado, limpia el `localStorage` y redirige a `/login` proactivamente sin esperar un error 401 del servidor.

### Tarea 3: UX de Errores (Error Boundaries y Páginas Dedicadas)

1. En la carpeta `src/app/`, crea los archivos `error.tsx` y `not-found.tsx` (404).
2. En `src/app/(erp)/`, crea una página para el error 403 (Acceso Denegado) o un componente que se renderice cuando un rol no tiene permisos.
3. Asegúrate de que estas páginas sigan el diseño de tu sistema (Tailwind) y ofrezcan al usuario un botón claro para "Volver al inicio" o "Iniciar sesión". Deben ser accesibles (contraste, etiquetas ARIA).

### Tarea 4: Protección de Rutas por Rol (RBAC en el Cliente)

1. Abre el archivo de layout principal del ERP: `src/app/(erp)/layout.tsx`.
2. Implementa un `useEffect` que verifique el rol del usuario (obtenido del `localStorage`).
3. Si el usuario intenta acceder a una ruta no permitida para su rol (ej. un usuario de Logística entrando a `/usuarios`), redirígelo a la página 403 creada en la tarea anterior o al Dashboard.

### Tarea 5: Reparación del Test Fallido (Baseline)

1. Abre `tests/sidebar-navigation.test.mjs`.
2. El test falló porque esperaba que el enlace `/usuarios` **no** estuviera en el sidebar. Como el backend y la página ya existen, el test es un falso positivo desactualizado.
3. Modifica la prueba: elimina la aserción de que `/usuarios` no debe existir, o modifícala para que verifique que el enlace existe pero que está condicionado al rol correcto en el código de `navigation.ts`.

---

## 3. Pruebas y Validación (Quality Gate)

1. Ejecuta `npm run build`. Next.js debe compilar sin errores de TypeScript ni advertencias de hidratación.
2. Ejecuta las 4 pruebas en la carpeta `tests/`:

```bash
node tests/cotizacion-currency.test.mjs
node tests/cotizacion-pdf-content.test.mjs
node tests/sidebar-navigation.test.mjs
node tests/stored-user.test.mjs
```

3. **Todos los tests deben pasar en verde.**

---

## 4. Entregables y Cierre

Al finalizar, genera un nuevo archivo `docs/estado-proyecto/reporte-fase1.md` detallando:

- Corrección de la URL de login.
- Estrategia de validación proactiva del JWT.
- Creación de las páginas de error (404, 500, 403) y su ubicación.
- Implementación del guard de rutas por rol en el Layout.
- Corrección del test `sidebar-navigation.test.mjs` (explicar por qué fallaba).
- Resultado final de `npm run build` y de las 4 pruebas.

Notifica al humano que la Fase 1 está completada. Detente y espera instrucciones para la Fase 2 (Cliente API y Estados).
