# Navegación y permisos visibles

> **Estado:** vigente.
> **Verificado contra:** `src/app`, `src/lib/navigation.ts` y `src/components/Sidebar.tsx` el 6 de noviembre de 2026.
> **Alcance:** rutas de página y visibilidad de enlaces en frontend.
> **No cubre:** autorización efectiva del API, despliegue ni acceso observado en navegador.
> **Fuente canónica de:** reglas de visibilidad de navegación por perfil.

`src/lib/navigation.ts` declara grupos de navegación y roles permitidos; `Sidebar.tsx` filtra los enlaces por el rol guardado localmente. `src/app/(erp)/layout.tsx` comprueba presencia del token en cliente. Esto reduce navegación visible, pero no constituye una barrera de seguridad.

> **Fuente canónica:** las rutas frontend se detallan en [módulos y rutas](../estado-proyecto/modulos.md); las reglas de autenticación/autorización API en [arquitectura backend](../../../Sterinova-Backend/docs/arquitectura/arquitectura-y-stack.md). Esta página solo describe visibilidad y navegación.

Las rutas funcionales y la distinción de páginas internas PDF están listadas en [módulos y rutas](../estado-proyecto/modulos.md); esta página no mantiene una segunda lista de rutas.

La visibilidad observada: Administración para Admin; Comercial para Admin/Comercial; Logística para Admin/Logística; Planta para Admin/Planta; Calidad para Admin/Calidad; Usuarios y Configuración para Admin. La API aplica controles propios; la UI puede quedar desactualizada respecto de ellos.
